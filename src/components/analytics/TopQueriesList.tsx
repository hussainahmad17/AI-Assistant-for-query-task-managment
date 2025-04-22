
import { useEffect, useState } from "react";
import { useHistory } from "@/contexts/HistoryContext";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export const TopQueriesList = () => {
  const { topQueries: getTopQueries } = useHistory();
  const [topQueries, setTopQueries] = useState(getTopQueries);
  
  // Update data when analytics events occur
  useEffect(() => {
    const updateListData = () => {
      setTopQueries(getTopQueries);
    };
    
    // Initial data load
    updateListData();
    
    // Listen for analytics update events
    window.addEventListener('analyticsUpdate', updateListData);
    window.addEventListener('analyticsClear', updateListData);
    
    return () => {
      window.removeEventListener('analyticsUpdate', updateListData);
      window.removeEventListener('analyticsClear', updateListData);
    };
  }, [getTopQueries]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Queries</CardTitle>
      </CardHeader>
      <CardContent>
        {topQueries.length > 0 ? (
          <div className="max-h-[300px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topQueries.map((item, index) => (
                  <motion.tr
                    key={item.query}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b hover:bg-muted/50"
                  >
                    <TableCell className="font-medium truncate max-w-[180px]">
                      {item.query}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="bg-secondary/20 text-secondary-foreground rounded-full px-2 py-1 text-xs">
                        {item.count}
                      </span>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No queries yet. Start chatting with your assistant to see data here.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
