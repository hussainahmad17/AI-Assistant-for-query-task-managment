
-- Create query_history table to store user queries
CREATE TABLE IF NOT EXISTS public.query_history (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read only their own data
CREATE POLICY "Users can read their own query history" 
  ON public.query_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own data
CREATE POLICY "Users can insert their own query history" 
  ON public.query_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own data
CREATE POLICY "Users can delete their own query history" 
  ON public.query_history 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create conversation_history table to store conversations
CREATE TABLE IF NOT EXISTS public.conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read only their own conversations
CREATE POLICY "Users can read their own conversations" 
  ON public.conversation_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own conversations
CREATE POLICY "Users can insert their own conversations" 
  ON public.conversation_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own conversations
CREATE POLICY "Users can delete their own conversations" 
  ON public.conversation_history 
  FOR DELETE 
  USING (auth.uid() = user_id);
