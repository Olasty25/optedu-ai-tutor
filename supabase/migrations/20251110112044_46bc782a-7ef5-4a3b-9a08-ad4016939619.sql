-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

-- Drop the foreign key constraint
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_user_id_fkey;

-- Change user_id column to TEXT to store Firebase UIDs
ALTER TABLE public.chat_messages ALTER COLUMN user_id TYPE TEXT;

-- Recreate policies with TEXT user_id
CREATE POLICY "Users can view their own messages"
  ON public.chat_messages FOR SELECT
  USING (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can insert their own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages FOR DELETE
  USING (user_id = auth.jwt()->>'sub');