import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

interface AvatarFieldProps {
  form: UseFormReturn<ChatbotFormData>;
  defaultAvatarUrl?: string | null;
}

const AvatarField = ({ form, defaultAvatarUrl }: AvatarFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const avatarUrl = form.watch("avatar_url") || defaultAvatarUrl;

  // Get the public URL for display
  const publicAvatarUrl = avatarUrl 
    ? supabase.storage.from('chatbot-avatars').getPublicUrl(avatarUrl.split('/').pop() || '').data.publicUrl
    : '';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // Generate a unique file name
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`; // Store only the filename

      // Convert File object to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('chatbot-avatars')
        .upload(filePath, fileData, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Update form with the file path
      form.setValue("avatar_url", filePath);

      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input value to allow uploading the same file again
      e.target.value = '';
    }
  };

  return (
    <FormField
      control={form.control}
      name="avatar_url"
      render={() => (
        <FormItem>
          <FormLabel>Chatbot Avatar</FormLabel>
          <FormControl>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={publicAvatarUrl} alt="Chatbot avatar" />
                <AvatarFallback>BOT</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
                {isUploading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AvatarField;