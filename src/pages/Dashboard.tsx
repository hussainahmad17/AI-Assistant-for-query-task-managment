
import { useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { QueryChart } from "@/components/analytics/QueryChart";
import { TopQueriesList } from "@/components/analytics/TopQueriesList";
import { MessageSquare, Clock, Zap, Users } from "lucide-react";
import { useHistory } from "@/contexts/HistoryContext";

const Dashboard = () => {
  const { history } = useHistory();
  
  useEffect(() => {
    document.title = "Analytics Dashboard - Personal Assistant";
  }, []);
  
  const totalQueries = history.length;
  
  // Calculate queries in the last 24 hours
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  const queriesLast24Hours = history.filter(item => 
    new Date(item.timestamp) > last24Hours
  ).length;
  
  // Calculate average response time (simulated)
  const avgResponseTime = "1.2s";
  
  // Calculate user satisfaction (simulated)
  const userSatisfaction = "95%";
  
  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AnalyticsCard
            title="Total Queries"
            value={totalQueries}
            icon={<MessageSquare className="h-4 w-4" />}
            description="All-time queries processed"
            trend={12}
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QueryChart />
          <TopQueriesList />
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
