-- Since we're using Firebase auth and the edge function uses service role key,
-- we'll disable RLS and rely on application-level security in the edge function
ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;

-- Drop the policies as they won't work with Firebase auth
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;