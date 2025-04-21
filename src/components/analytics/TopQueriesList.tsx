
import { useHistory } from "@/contexts/HistoryContext";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TopQueriesList = () => {
  const { topQueries } = useHistory();
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Top Queries</CardTitle>
      </CardHeader>
      <CardContent>
        {topQueries.length > 0 ? (
          <ul className="space-y-2">
            {topQueries.map((item, index) => (
              <motion.li 
                key={item.query}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <span className="truncate max-w-[70%]">{item.query}</span>
                <span className="bg-secondary/20 text-secondary-foreground rounded-full px-2 py-1 text-xs">
                  {item.count} {item.count === 1 ? 'query' : 'queries'}
                </span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-6">No queries yet</p>
        )}
      </CardContent>
    </Card>
  );
};
