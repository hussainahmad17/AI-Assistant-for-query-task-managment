
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
            // Convert the Supabase data to our HistoryItem format
            const supabaseHistory = data.map((item: any) => ({
              id: item.id,
              query: item.query,
              response: item.response || "No response stored", // Handle potential missing response
              timestamp: new Date(item.created_at)
            }));
            
            // Merge with local history and remove duplicates
            const mergedHistory = [...supabaseHistory];
            setHistory(mergedHistory);
            
            // Update localStorage with this merged history
            localStorage.setItem('assistant_history', JSON.stringify(mergedHistory));
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
    
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      query,
      response: response || "No response stored", // Ensure response is never undefined
      timestamp: new Date(),
    };
    
    setHistory((prev) => [newItem, ...prev]);
    
    if (user) {
      try {
        await supabase
          .from('query_history')
          .insert([{
            id: newItem.id,
            user_id: user.id,
            query: newItem.query,
            response: newItem.response,
            created_at: newItem.timestamp.toISOString()
          }]);
      } catch (error) {
        console.error('Failed to save query to Supabase', error);
      }
    }
  };

  // Clear all history
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('assistant_history');
  };

  // Get the top most frequent queries
  const topQueries = React.useMemo(() => {
    const queryCounts: Record<string, number> = {};
    
    history.forEach((item) => {
      // Only count user queries, not assistant responses
      const queryLower = item.query.toLowerCase();
      queryCounts[queryLower] = (queryCounts[queryLower] || 0) + 1;
    });
    
    return Object.entries(queryCounts)
      .map(([query, count]) => ({ query, count }))
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
