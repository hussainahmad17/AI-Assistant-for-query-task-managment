
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: number;
  trendLabel?: string;
}

export const AnalyticsCard = ({ 
  title, 
  value, 
  icon,
  description,
  trend,
  trendLabel
}: AnalyticsCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {typeof trend === 'number' && (
            <div className={`text-xs flex items-center mt-2 ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} 
              <span className="ml-1">{Math.abs(trend)}% {trendLabel || ''}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
