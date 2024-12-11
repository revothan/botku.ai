import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

type AvatarFieldProps = {
  form: UseFormReturn<ChatbotFormData>;
};

const AvatarField = ({ form }: AvatarFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const avatarUrl = form.watch("avatar_url");
  const botName = form.watch("bot_name");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Debug logs
    console.log('File:', file);
    console.log('File type:', file.type);
    console.log('File size:', file.size);

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

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      // Upload file using Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('chatbot-avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload file');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chatbot-avatars')
        .getPublicUrl(fileName);

      form.setValue("avatar_url", publicUrl);
      
      toast({
        title: "Avatar uploaded",
        description: "Your chatbot avatar has been updated",
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
      // Reset the input value to allow uploading the same file again
      event.target.value = '';
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
                <AvatarImage src={avatarUrl || undefined} alt={botName} />
                <AvatarFallback className="bg-primary/10 text-lg">
                  {botName?.charAt(0) || 'B'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="relative"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Avatar
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </Button>
                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, max 5MB
                </p>
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