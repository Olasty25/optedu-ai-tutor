-- Re-enable RLS for security compliance
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows service role (edge function) to access all data
-- The edge function will enforce user-level security by filtering on userId
CREATE POLICY "Service role can manage all messages"
  ON public.chat_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);