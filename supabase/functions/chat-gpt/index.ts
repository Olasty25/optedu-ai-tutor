import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, subject, userId } = await req.json();

    if (!message || !subject || !userId) {
      return new Response(
        JSON.stringify({ error: 'Message, subject, and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save user message to database
    const { error: saveUserMsgError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        subject: subject,
        role: 'user',
        content: message
      });

    if (saveUserMsgError) {
      console.error('Error saving user message:', saveUserMsgError);
    }

    // Get conversation history for context
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('user_id', userId)
      .eq('subject', subject)
      .order('created_at', { ascending: true })
      .limit(20);

    // Prepare messages for ChatGPT
    const systemPrompt = getSystemPrompt(subject);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(msg => ({ role: msg.role, content: msg.content }))
    ];

    // Call OpenAI API
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiReply = data.choices[0].message.content;

    // Save AI response to database
    const { error: saveAIMsgError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        subject: subject,
        role: 'assistant',
        content: aiReply
      });

    if (saveAIMsgError) {
      console.error('Error saving AI message:', saveAIMsgError);
    }

    return new Response(
      JSON.stringify({ reply: aiReply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-gpt function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getSystemPrompt(subject: string): string {
  const prompts: Record<string, string> = {
    "Język Polski": "Jestem AI tutorem przygotowującym do egzaminu ósmoklasisty z języka polskiego. Pomogę Ci w nauce lektur, gramatyki, pisania wypracowań i analizie tekstów. Zadawaj mi pytania o konkretne tematy, a ja wyjaśnię je w prosty sposób i dam praktyczne wskazówki.",
    "Język Angielski": "Jestem AI tutorem przygotowującym do egzaminu ósmoklasisty z języka angielskiego. Pomogę Ci w nauce gramatyki, słownictwa, rozumienia tekstu i pisania. Mogę ćwiczyć z Tobą konwersacje, wyjaśnić trudne zagadnienia gramatyczne i przygotować Cię do wszystkich części egzaminu.",
    "Matematyka": "Jestem AI tutorem przygotowującym do egzaminu ósmoklasisty z matematyki. Pomogę Ci w nauce algebry, geometrii, statystyki i wszystkich działów matematycznych wymaganych na egzaminie. Mogę rozwiązywać zadania krok po kroku, wyjaśniać wzory i przygotować Cię do każdego typu zadań."
  };

  return prompts[subject] || "Jestem pomocnym AI tutorem. Zadaj mi pytanie, a postaram się pomóc.";
}