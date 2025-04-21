
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHistory } from "@/contexts/HistoryContext";

export const QueryChart = () => {
  const { getMonthlyQueryCount } = useHistory();
  const data = getMonthlyQueryCount();
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Monthly Queries</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))' 
              }}
              labelStyle={{ color: 'hsl(var(--card-foreground))' }}
            />
            <Legend />
            <Bar dataKey="count" name="Queries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
