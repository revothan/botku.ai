import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { file, assistant_id } = await req.json()

    if (!assistant_id) {
      throw new Error('No assistant ID provided')
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    })

    // Create a file with the products data
    const fileUpload = await openai.files.create({
      file: new Blob([file], { type: 'application/json' }),
      purpose: 'assistants'
    })

    // Get existing files for this assistant
    const assistant = await openai.beta.assistants.retrieve(assistant_id)
    
    // Remove old files if they exist
    if (assistant.file_ids?.length) {
      for (const fileId of assistant.file_ids) {
        try {
          await openai.files.del(fileId)
        } catch (error) {
          console.error(`Error deleting file ${fileId}:`, error)
        }
      }
    }

    // Update the assistant with the new file
    await openai.beta.assistants.update(assistant_id, {
      file_ids: [fileUpload.id],
      tools: [{ type: "retrieval" }]
    })

    return new Response(
      JSON.stringify({ message: 'Products synced successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in sync-products-to-assistant function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})