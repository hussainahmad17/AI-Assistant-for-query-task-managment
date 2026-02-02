
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart, Settings } from "lucide-react";

const Landing = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };
  
  const features = [
    {
      title: "Intelligent Conversations",
      description: "Get accurate answers to any question through natural conversations.",
      icon: <MessageSquare className="h-6 w-6" />,
    },
    {
      title: "Voice Integration",
      description: "Speak your questions and hear responses with advanced voice capabilities.",
      icon: <span className="text-xl">🎤</span>,
    },
    {
      title: "Analytics Dashboard",
      description: "Track usage patterns and the most common queries.",
      icon: <BarChart className="h-6 w-6" />,
    },
    {
      title: "Customizable",
      description: "Tailor the assistant to your specific needs through the admin panel.",
      icon: <Settings className="h-6 w-6" />,
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gradient">
            Personal Assistant
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth/login" className="text-sm hover:text-primary transition-colors">
              Login
            </Link>
            <Link to="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
          <div className="md:hidden">
            <Link to="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Personal AI Assistant for <span className="text-gradient">Every Query</span>
              </h1>
              <p className="text-lg mb-8 text-muted-foreground">
                Get instant answers to any question, with voice support and multi-turn conversations. Connect with Gemini AI for accurate, human-like responses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Try Demo
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="bg-card rounded-lg shadow-lg border p-4">
                <div className="flex items-center gap-3 border-b pb-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                    AI
                  </div>
                  <div className="font-medium">Personal Assistant</div>
                </div>
                <div className="py-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center text-white text-sm font-medium">
                      You
                    </div>
                    <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                      How can you help me with research?
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white text-sm font-medium">
                      AI
                    </div>
                    <div className="bg-card border p-3 rounded-lg">
                      <motion.p
                        animate={isHovered ? { opacity: 1 } : { opacity: 0.9 }}
                        transition={{ duration: 0.5 }}
                      >
                        I can help with research by finding information, summarizing content, answering questions, and keeping track of your sources. I can search for specific facts, explain complex topics, and even help you brainstorm ideas for your projects.
                      </motion.p>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div
                className="absolute -top-4 -right-4 bg-accent text-accent-foreground p-2 rounded-lg shadow-lg text-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                Voice enabled! 🎤
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for a smart and effective AI assistant experience
            </p>
          </motion.div>
          
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={item}
                className="bg-card border rounded-lg p-6 hover-lift"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-white text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join now and experience the power of your personal AI assistant.
              Get answers to your questions, track usage analytics, and customize your experience.
            </p>
            <Link to="/auth/register">
              <Button size="lg" variant="secondary">
                Create Your Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-lg font-bold text-gradient">Personal Assistant</p>
              <p className="text-sm text-muted-foreground">Your AI companion for every query</p>
            </div>
            <div className="flex gap-6">
              <Link to="/auth/login" className="text-sm hover:text-primary transition-colors">
                Login
              </Link>
              <Link to="/auth/register" className="text-sm hover:text-primary transition-colors">
                Register
              </Link>
              <Link to="/chat" className="text-sm hover:text-primary transition-colors">
                Try Demo
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Personal Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
