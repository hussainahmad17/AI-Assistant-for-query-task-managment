
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { QueryChart } from "@/components/analytics/QueryChart";
import { TopQueriesList } from "@/components/analytics/TopQueriesList";
import { MessageSquare, Clock, Zap, Users } from "lucide-react";
import { useHistory } from "@/contexts/HistoryContext";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { history } = useHistory();
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Listen for analytics update events
  useEffect(() => {
    const handleAnalyticsUpdate = () => {
      // Force a refresh of analytics data
      setRefreshTrigger(prev => prev + 1);
    };
    
    // Add event listeners for real-time updates
    window.addEventListener('analyticsUpdate', handleAnalyticsUpdate);
    window.addEventListener('analyticsClear', handleAnalyticsUpdate);
    
    return () => {
      window.removeEventListener('analyticsUpdate', handleAnalyticsUpdate);
      window.removeEventListener('analyticsClear', handleAnalyticsUpdate);
    };
  }, []);
  
  useEffect(() => {
    document.title = "Analytics Dashboard - Personal Assistant";
  }, []);
  
  // Calculate total queries
  const totalQueries = history.length;
  
  // Calculate queries in the last 24 hours
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  const queriesLast24Hours = history.filter(item => 
    new Date(item.timestamp) > last24Hours
  ).length;
  
  // Calculate average response time (simulated)
  // This would ideally come from actual response time tracking
  const avgResponseTime = history.length > 0 ? "1.2s" : "0s";
  
  // Calculate user satisfaction (simulated)
  // In a real app, this would be from user feedback
  const userSatisfaction = history.length > 0 ? "95%" : "0%";

  // Calculate month-over-month growth (trend)
  const calculateTrend = () => {
    if (history.length === 0) return 0;
    
    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    
    const thisMonthQueries = history.filter(item => 
      new Date(item.timestamp).getMonth() === thisMonth
    ).length;
    
    const lastMonthQueries = history.filter(item => 
      new Date(item.timestamp).getMonth() === lastMonth
    ).length;
    
    if (lastMonthQueries === 0) return thisMonthQueries > 0 ? 100 : 0;
    return Math.round(((thisMonthQueries - lastMonthQueries) / lastMonthQueries) * 100);
  };
  
  const trend = calculateTrend();
  
  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={refreshTrigger} // Force re-render when refreshTrigger changes
      >
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Total Queries"
            value={totalQueries}
            icon={<MessageSquare className="h-4 w-4" />}
            description="All-time queries processed"
            trend={trend}
            trendLabel="vs last month"
          />
          
          <AnalyticsCard
            title="Recent Activity"
            value={queriesLast24Hours}
            icon={<Clock className="h-4 w-4" />}
            description="Queries in the last 24 hours"
          />
          
          <AnalyticsCard
            title="Avg. Response Time"
            value={avgResponseTime}
            icon={<Zap className="h-4 w-4" />}
            description="Time to generate responses"
            trend={-8}
            trendLabel="faster than last week"
          />
          
          <AnalyticsCard
            title="User Satisfaction"
            value={userSatisfaction}
            icon={<Users className="h-4 w-4" />}
            description="Based on user feedback"
            trend={2}
            trendLabel="improvement"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <QueryChart key={`chart-${refreshTrigger}`} />
          </div>
          <div className="lg:col-span-1">
            <TopQueriesList key={`list-${refreshTrigger}`} />
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
