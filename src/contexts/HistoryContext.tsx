
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './AuthContext';

interface HistoryItem {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
}

interface QueryStats {
  query: string;
  count: number;
}

interface HistoryContextType {
  history: HistoryItem[];
  addToHistory: (query: string, response: string) => void;
  clearHistory: () => void;
  topQueries: QueryStats[];
  getMonthlyQueryCount: () => { month: string; count: number }[];
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { user } = useAuth();
  
  // Load history from Supabase or localStorage when user changes
  useEffect(() => {
    const loadHistory = async () => {
      console.log("Loading history for user:", user?.id || "none");
      
      if (user) {
        // Clear existing history first to avoid mixing with another user's data
        setHistory([]);
        
        // Load from Supabase for authenticated users
        try {
          const { data, error } = await supabase
            .from('query_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (error) {
            console.error('Failed to fetch history from Supabase:', error);
            return;
          }
          
          if (data && data.length > 0) {
            console.log(`Loaded ${data.length} history items for user ${user.id}`);
            
            // Process the entries
            const processedData = data.map((item: any) => ({
              id: item.id,
              query: item.query,
              response: item.response || "No response stored",
              timestamp: new Date(item.created_at)
            }));
            
            // Remove duplicates based on query content
            const uniqueEntries = removeDuplicates(processedData);
            setHistory(uniqueEntries);
          } else {
            console.log("No history found for user", user.id);
            setHistory([]);
          }
        } catch (error) {
          console.error('Failed to fetch history from Supabase', error);
          setHistory([]);
        }
      } else {
        // For anonymous users, use localStorage but make sure we don't load another user's data
        setHistory([]);
        
        // Only use localStorage for anonymous users
        const savedHistory = localStorage.getItem('assistant_history_anonymous');
        if (savedHistory) {
          try {
            const parsedHistory = JSON.parse(savedHistory);
            // Convert string timestamps back to Date objects
            const formattedHistory = parsedHistory.map((item: any) => ({
              ...item,
              timestamp: new Date(item.timestamp),
              response: item.response || "No response stored"
            }));
            
            const uniqueItems = removeDuplicates(formattedHistory);
            setHistory(uniqueItems);
          } catch (error) {
            console.error('Failed to parse history from localStorage', error);
            setHistory([]);
          }
        }
      }
    };
    
    loadHistory();
    
    // Clear history when user logs out
    return () => {
      if (!user) {
        console.log("User logged out, clearing history state");
      }
    };
  }, [user?.id]); // Dependency on user.id ensures reload when user changes
  
  // Helper function to remove duplicates based on query content and timestamp proximity
  const removeDuplicates = (items: HistoryItem[]): HistoryItem[] => {
    const seen = new Map<string, HistoryItem>();
    
    // Sort by timestamp (newest first) so we keep the most recent entries
    const sorted = [...items].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Keep only unique entries based on query content
    sorted.forEach(item => {
      const key = item.query.trim().toLowerCase();
      
      // If we haven't seen this query yet, or if this one has a better response
      if (!seen.has(key) || 
         (item.response && item.response !== "No response stored" && 
          seen.get(key)?.response === "No response stored")) {
        seen.set(key, item);
      }
    });
    
    return Array.from(seen.values());
  };

  // Save history to localStorage for anonymous users
  useEffect(() => {
    if (!user) {
      // Only save to localStorage for anonymous users
      localStorage.setItem('assistant_history_anonymous', JSON.stringify(history));
    }
  }, [history, user]);

  // Add a new query and response to history
  const addToHistory = async (query: string, response: string) => {
    if (!query.trim()) return;
    
    // Clean response by removing Markdown formatting
    const cleanedResponse = response.replace(/\*\*/g, ''); // Remove double asterisks
    
    // Generate a consistent ID based on query content and timestamp
    const now = new Date();
    const newItemId = `${now.getTime()}-${query.substring(0, 10).replace(/\s/g, '')}`;
    
    const newItem: HistoryItem = {
      id: newItemId,
      query,
      response: cleanedResponse || "No response stored",
      timestamp: now,
    };
    
    // Check if we already have this query in history
    const existingItemIndex = history.findIndex(item => 
      item.query.toLowerCase() === query.toLowerCase()
    );
    
    let updatedHistory: HistoryItem[];
    
    if (existingItemIndex !== -1) {
      // Update existing item instead of adding a new one
      updatedHistory = [...history];
      updatedHistory[existingItemIndex] = {
        ...updatedHistory[existingItemIndex],
        response: cleanedResponse,
        timestamp: now
      };
    } else {
      // Add as a new item
      updatedHistory = [newItem, ...history];
    }
    
    // Update local state
    setHistory(updatedHistory);
    
    // Update database if user is logged in
    if (user) {
      console.log(`Saving query for user ${user.id}: ${query}`);
      try {
        if (existingItemIndex !== -1) {
          // Update existing entry in database
          const existingItem = history[existingItemIndex];
          await supabase
            .from('query_history')
            .update({
              response: cleanedResponse,
              created_at: now.toISOString()
            })
            .eq('id', existingItem.id)
            .eq('user_id', user.id);
        } else {
          // Insert new entry
          await supabase
            .from('query_history')
            .insert([{
              id: newItemId,
              user_id: user.id,
              query: query,
              response: cleanedResponse,
              created_at: newItem.timestamp.toISOString()
            }]);
        }
      } catch (error) {
        console.error('Failed to save query to Supabase', error);
      }
    } else {
      // For anonymous users, save to localStorage
      localStorage.setItem('assistant_history_anonymous', JSON.stringify(updatedHistory));
    }
  };

  // Clear all history
  const clearHistory = async () => {
    console.log("Clearing history for user:", user?.id || "anonymous");
    
    setHistory([]);
    
    if (user) {
      try {
        await supabase
          .from('query_history')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to clear history from Supabase', error);
      }
    } else {
      localStorage.removeItem('assistant_history_anonymous');
    }
  };

  // Get the top most frequent queries
  const topQueries = React.useMemo(() => {
    const queryCounts: Record<string, number> = {};
    
    history.forEach((item) => {
      const queryLower = item.query.toLowerCase();
      queryCounts[queryLower] = (queryCounts[queryLower] || 0) + 1;
    });
    
    return Object.entries(queryCounts)
      .map((entry): QueryStats => ({ 
        query: entry[0], 
        count: entry[1] 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [history]);

  // Get monthly query counts for charts
  const getMonthlyQueryCount = () => {
    const now = new Date();
    const monthsData: Record<string, number> = {};
    
    // Initialize last 6 months with 0 counts
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = month.toLocaleString('default', { month: 'short' });
      monthsData[monthLabel] = 0;
    }
    
    // Count queries by month
    history.forEach((item) => {
      const itemDate = item.timestamp;
      const itemMonth = itemDate.toLocaleString('default', { month: 'short' });
      if (monthsData[itemMonth] !== undefined) {
        monthsData[itemMonth]++;
      }
    });
    
    return Object.entries(monthsData).map(([month, count]) => ({ month, count }));
  };

  const value = {
    history,
    addToHistory,
    clearHistory,
    topQueries,
    getMonthlyQueryCount,
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
