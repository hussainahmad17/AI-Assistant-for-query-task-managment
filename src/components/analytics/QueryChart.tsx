
import { useEffect, useState } from "react";
import { useHistory } from "@/contexts/HistoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export const QueryChart = () => {
  const { getMonthlyQueryCount } = useHistory();
  const [data, setData] = useState(getMonthlyQueryCount());
  
  useEffect(() => {
    const updateChartData = () => {
      const newData = getMonthlyQueryCount();
      setData(newData);
    };
    
    // Initial data load
    updateChartData();
    
    // Listen for real-time updates
    window.addEventListener('analyticsUpdate', updateChartData);
    window.addEventListener('analyticsClear', updateChartData);
    
    return () => {
      window.removeEventListener('analyticsUpdate', updateChartData);
      window.removeEventListener('analyticsClear', updateChartData);
    };
  }, [getMonthlyQueryCount]);
  
  const chartConfig = {
    queries: {
      label: "Queries",
      theme: {
        light: "hsl(var(--primary))",
        dark: "hsl(var(--primary))"
      }
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Queries</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        {data.some(month => month.count > 0) ? (
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Queries" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No query data to display yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
