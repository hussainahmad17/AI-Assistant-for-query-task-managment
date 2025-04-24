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
          setHistory(formattedHistory);
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
            // Filter out duplicate entries that might cause the double history issue
            const uniqueEntries = new Map();
            
            // Process the entries and keep only the most complete ones
            data.forEach((item: any) => {
              const key = `${item.query}-${item.id}`;
              
              // If we haven't seen this entry before, or if this one has a response and the previous one didn't
              if (!uniqueEntries.has(key) || 
                 (item.response && uniqueEntries.get(key).response === "No response stored")) {
                uniqueEntries.set(key, {
                  id: item.id,
                  query: item.query,
                  response: item.response || "No response stored",
                  timestamp: new Date(item.created_at)
                });
              }
            });
            
            // Convert to array
            const supabaseHistory = Array.from(uniqueEntries.values());
            
            // Use Supabase data as source of truth
            setHistory(supabaseHistory);
            
            // Update localStorage with this merged history
            localStorage.setItem('assistant_history', JSON.stringify(supabaseHistory));
          }
        } catch (error) {
          console.error('Failed to fetch history from Supabase', error);
        }
      }
    };
    
    loadHistory();
  }, [user]);

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
    
    // Skip if this is a duplicate of an existing item in history
    const duplicateExists = history.some(item => 
      item.query === query && 
      Math.abs(now.getTime() - item.timestamp.getTime()) < 10000 // Within 10 seconds
    );
    
    if (duplicateExists) {
      console.log('Preventing duplicate history entry');
      return;
    }
    
    // Update local state
    setHistory((prev) => [newItem, ...prev]);
    
    // Update database if user is logged in
    if (user) {
      try {
        // First check if the exact entry already exists (prevents duplicates)
        const { data: existingData } = await supabase
          .from('query_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('query', query)
          .limit(1);
          
        if (existingData && existingData.length > 0) {
          console.log('Entry already exists in database, skipping insert');
          return;
        }
        
        // If no duplicate, proceed with insert
        await supabase
          .from('query_history')
          .insert([{
            id: newItemId,
            user_id: user.id,
            query: query,
            response: cleanedResponse,
            created_at: newItem.timestamp.toISOString()
          }]);
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
      // Only count user queries, not assistant responses
      const queryLower = item.query.toLowerCase();
      queryCounts[queryLower] = (queryCounts[queryLower] || 0) + 1;
    });
    
    // Fixed the excessively deep instantiation error by explicitly typing the return value
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
      // Only count user queries, not assistant responses
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
