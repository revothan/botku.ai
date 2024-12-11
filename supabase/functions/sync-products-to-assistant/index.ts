import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, assistant_id } = await req.json();

    if (!file) {
      throw new Error("'file' is a required property");
    }

    if (!assistant_id) {
      throw new Error("No assistant ID provided");
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Create a file with the products data
    const fileUpload = await openai.files.create({
      file: new Blob([JSON.stringify(file)], { type: 'application/json' }),
      purpose: 'assistants'
    });

    console.log("File uploaded successfully:", fileUpload.id);

    // Get existing files for this assistant
    const assistant = await openai.beta.assistants.retrieve(assistant_id);
    
    // Remove old files if they exist
    if (assistant.file_ids?.length) {
      console.log("Removing old files:", assistant.file_ids);
      for (const fileId of assistant.file_ids) {
        try {
          await openai.files.del(fileId);
          console.log("Successfully deleted file:", fileId);
        } catch (error) {
          console.error(`Error deleting file ${fileId}:`, error);
        }
      }
    }

    // Update the assistant with the new file
    await openai.beta.assistants.update(assistant_id, {
      file_ids: [fileUpload.id],
      tools: [{ type: "retrieval" }]
    });

    console.log("Assistant updated successfully with new file");

    return new Response(
      JSON.stringify({ message: 'Products synced successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-products-to-assistant function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});