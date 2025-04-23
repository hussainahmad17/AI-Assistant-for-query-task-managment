
import React, { useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageSquare, History, Settings, User, HelpCircle, BarChart } from "lucide-react";

const Help = () => {
  useEffect(() => {
    document.title = "Help & Support - Personal Assistant";
  }, []);

  const faqs = [
    {
      question: "How do I start a conversation with the assistant?",
      answer: "Navigate to the Chat page using the sidebar and type your question or request in the input box at the bottom of the screen. Press Enter or click the Send button to send your message."
    },
    {
      question: "How can I view my chat history?",
      answer: "Your chat history is accessible via the Chat History page in the sidebar. Here you can search through past conversations, filter by date, and export your history as needed."
    },
    {
      question: "Can I customize the assistant's behavior?",
      answer: "Yes, visit the Settings page to customize various aspects including the system prompt, API settings, and voice settings."
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to the Profile page via the Account section in the sidebar. Here you can update your username, full name, and avatar URL."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take security seriously. Your conversations are stored securely, and we don't share your data with third parties without your consent."
    },
    {
      question: "How do I log out?",
      answer: "Click the Log Out button at the bottom of the sidebar to securely sign out of your account."
    }
  ];

  const features = [
    {
      name: "Chat Assistant",
      description: "Interact with an AI assistant that can answer questions and provide assistance.",
      icon: <MessageSquare className="h-8 w-8" />
    },
    {
      name: "Chat History",
      description: "Access, search, and export your conversation history.",
      icon: <History className="h-8 w-8" />
    },
    {
      name: "Analytics Dashboard",
      description: "View usage statistics and insights about your conversations.",
      icon: <BarChart className="h-8 w-8" />
    },
    {
      name: "Settings",
      description: "Customize the assistant's behavior and API settings.",
      icon: <Settings className="h-8 w-8" />
    },
    {
      name: "Profile Management",
      description: "Update your personal information and preferences.",
      icon: <User className="h-8 w-8" />
    }
  ];

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        id="main-content"
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground mt-1">Find answers to common questions and learn how to use the application</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
              <CardDescription>Common questions and answers about using the Personal Assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Feature Overview</CardTitle>
              <CardDescription>Learn about the key features of the Personal Assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.name}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Need additional help? Reach out to our support team</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-medium">We're Here to Help</h3>
              <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                If you need additional assistance or have any questions not answered above,
                please email our support team or check our documentation.
              </p>
              <div className="mt-4">
                <p className="font-medium">Email: support@personalassistant.com</p>
                <p className="text-muted-foreground">We typically respond within 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
};

export default Help;
