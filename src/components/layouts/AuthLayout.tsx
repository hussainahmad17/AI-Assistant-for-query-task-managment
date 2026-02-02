
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card shadow-lg rounded-lg p-6 border">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2 text-gradient">Personal Assistant</h1>
            <p className="text-muted-foreground">Your AI companion for every query</p>
          </div>
          
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
