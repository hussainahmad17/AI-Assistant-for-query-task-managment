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
  
  // Load history from both localStorage and Supabase on mount or when user changes
  useEffect(() => {
    const loadHistory = async () => {
      // First load from localStorage for immediate display
      const savedHistory = localStorage.getItem('assistant_history');
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          // Convert string timestamps back to Date objects
          const formattedHistory = parsedHistory.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
            response: item.response || "No response stored" // Handle potential missing response
          }));
          
          // Remove duplicates from localStorage
          const uniqueItems = removeDuplicates(formattedHistory);
          setHistory(uniqueItems);
        } catch (error) {
          console.error('Failed to parse history from localStorage', error);
          setHistory([]);
        }
      }
      
      // Then load from Supabase if user is logged in
      if (user) {
        try {
          const { data, error } = await supabase
            .from('query_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            // Process the entries and remove duplicates
            const processedData = data.map((item: any) => ({
              id: item.id,
              query: item.query,
              response: item.response || "No response stored",
              timestamp: new Date(item.created_at)
            }));
            
            // Remove duplicates based on query content
            const uniqueEntries = removeDuplicates(processedData);
            
            // Use Supabase data as source of truth
            setHistory(uniqueEntries);
            
            // Update localStorage with this cleaned history
            localStorage.setItem('assistant_history', JSON.stringify(uniqueEntries));
          }
        } catch (error) {
          console.error('Failed to fetch history from Supabase', error);
        }
      }
    };
    
    loadHistory();
  }, [user]);

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

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('assistant_history', JSON.stringify(history));
  }, [history]);

  // Add a new query and response to history
  const addToHistory = async (query: string, response: string) => {
    if (!query.trim()) return;
    
    // Process the response to remove Markdown asterisks
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
            .eq('id', existingItem.id);
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
    }
  };

  // Clear all history
  const clearHistory = async () => {
    setHistory([]);
    localStorage.removeItem('assistant_history');
    
    if (user) {
      try {
        await supabase
          .from('query_history')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to clear history from Supabase', error);
      }
    }
  };

  // Get the top most frequent queries
  const topQueries = React.useMemo(() => {
    const queryCounts: Record<string, number> = {};
    
    history.forEach((item) => {
      const queryLower = item.query.toLowerCase();
      queryCounts[queryLower] = (queryCounts[queryLower] || 0) + 1;
    });
    
    // Explicitly typing the return value to fix the excessive depth error
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
