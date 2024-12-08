import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ChatbotFormData } from "@/types/chatbot";

type ChatbotSettingsFormProps = {
  defaultValues: ChatbotFormData;
  onSubmit: (values: ChatbotFormData) => void;
  isSubmitting: boolean;
  hasExistingBot: boolean;
};

const ChatbotSettingsForm = ({ 
  defaultValues, 
  onSubmit, 
  isSubmitting,
  hasExistingBot 
}: ChatbotSettingsFormProps) => {
  const form = useForm<ChatbotFormData>({
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bot_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chatbot Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your chatbot's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="greeting_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Greeting Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the greeting message for your visitors"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="training_data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tell AI More About You</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jelaskan kebutuhan Anda secara detail, seperti jadwal operasional, lokasi, kontak WhatsApp, media sosial, atau informasi lain yang relevan untuk chatbot AI Anda."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Saving..." : hasExistingBot ? "Update Settings" : "Create Chatbot"}
        </Button>
      </form>
    </Form>
  );
};

export default ChatbotSettingsForm;
