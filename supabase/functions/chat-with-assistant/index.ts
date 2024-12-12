import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_POLLING_TIME = 25; // Reduced from 30 to ensure we stay within Edge Function limits

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, assistantId } = await req.json();
    console.log('Received request:', { message, assistantId });

    if (!assistantId) {
      console.error('Assistant ID is required');
      return new Response(
        JSON.stringify({ error: 'Assistant ID is required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!message) {
      console.error('Message is required');
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
      defaultHeaders: {
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    console.log('Creating thread...');
    const thread = await openai.beta.threads.create();
    
    console.log('Creating message in thread...');
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message
    });

    console.log('Running assistant...');
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // Poll for completion with a shorter timeout
    let response;
    let attempts = 0;
    
    while (attempts < MAX_POLLING_TIME) {
      const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      console.log('Run status:', runStatus.status);
      
      if (runStatus.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(thread.id);
        if (messages.data.length > 0 && messages.data[0].content.length > 0) {
          response = messages.data[0].content[0];
          break;
        } else {
          throw new Error('No response content found');
        }
      } else if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
        console.error('Run failed or cancelled:', runStatus);
        throw new Error(`Assistant run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
      } else if (runStatus.status === 'expired') {
        console.error('Run expired:', runStatus);
        throw new Error('Assistant response timed out');
      }
      
      // Shorter polling interval
      await new Promise(resolve => setTimeout(resolve, 800));
      attempts++;
    }

    if (!response) {
      throw new Error('Response timeout - please try again');
    }

    console.log('Sending response:', response);
    return new Response(
      JSON.stringify({ response }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in chat-with-assistant function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});