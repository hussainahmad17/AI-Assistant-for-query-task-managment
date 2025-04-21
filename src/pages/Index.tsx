
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Change to navigate to the landing page instead of "/"
    // to avoid circular redirection
    navigate("/landing");
  }, [navigate]);
  
  return null;
};

export default Index;
