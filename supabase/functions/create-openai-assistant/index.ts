import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bot_name, training_data, assistant_id } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not found',
          status: 500
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing request for bot: ${bot_name}, assistant_id: ${assistant_id || 'new'}`);
    
    let response;
    
    if (assistant_id) {
      // Update existing assistant
      console.log('Updating existing assistant:', assistant_id);
      response = await fetch(`https://api.openai.com/v1/assistants/${assistant_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          name: bot_name,
          instructions: training_data,
          tools: [{"type": "code_interpreter"}],
          model: "gpt-4-1106-preview"
        }),
      });
    } else {
      // Create new assistant
      console.log('Creating new assistant');
      response = await fetch('https://api.openai.com/v1/assistants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          name: bot_name,
          instructions: training_data,
          tools: [{"type": "code_interpreter"}],
          model: "gpt-4-1106-preview"
        }),
      });
    }

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error:', error);
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${error.error?.message || 'Unknown error'}`,
          status: response.status
        }), 
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    console.log('OpenAI Assistant operation successful:', data);

    return new Response(
      JSON.stringify({ 
        status: 'success',
        assistant: data
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-openai-assistant function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        status: 500
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});