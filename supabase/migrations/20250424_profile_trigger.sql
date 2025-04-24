
-- Create function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, bio)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile for new users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- Enable Row Level Security for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can view their own profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update their own profiles"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Ensure required RLS is set on storage objects for avatar uploads
CREATE POLICY IF NOT EXISTS "Allow public avatar access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Allow users to update their own avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid() = owner
);

CREATE POLICY IF NOT EXISTS "Allow users to delete their own avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid() = owner
);
