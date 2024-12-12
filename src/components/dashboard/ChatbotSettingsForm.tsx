import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import BusinessQuestions from "./questions/BusinessQuestions";
import CreatorQuestions from "./questions/CreatorQuestions";
import OtherQuestions from "./questions/OtherQuestions";
import FormHeaderFields from "./form/FormHeaderFields";
import UserTypeSelection from "./form/UserTypeSelection";
import AvatarField from "./form/AvatarField";
import type { ChatbotFormData } from "@/types/chatbot";

const formSchema = z.object({
  bot_name: z.string().min(1, "Bot name is required"),
  greeting_message: z.string().min(1, "Greeting message is required"),
  training_data: z.string().nullable(),
  user_type: z.enum(["business", "creator", "other"]).optional(),
  answers: z.object({
    business: z.array(z.string()),
    creator: z.array(z.string()),
    other: z.array(z.string())
  }).optional(),
  avatar_url: z.string().nullable().optional()
});

interface ChatbotSettingsFormProps {
  defaultValues: ChatbotFormData;
  onSubmit: (values: ChatbotFormData) => void;
  isSubmitting: boolean;
  hasExistingBot: boolean;
  profileId: string;
}

const ChatbotSettingsForm = ({ defaultValues, onSubmit, isSubmitting, hasExistingBot, profileId }: ChatbotSettingsFormProps) => {
  const form = useForm<ChatbotFormData>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const userType = form.watch('user_type');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <AvatarField 
          form={form} 
          defaultAvatarUrl={defaultValues.avatar_url} 
          profileId={profileId}
        />
        <FormHeaderFields form={form} />
        <UserTypeSelection form={form} />

        {userType && (
          <div className="rounded-lg border p-6 bg-card">
            <h3 className="text-lg font-medium mb-4">
              {userType === 'business' ? 'Detail Bisnis' : 
               userType === 'creator' ? 'Detail Kreator' : 
               'Detail Lainnya'}
            </h3>
            <BusinessQuestions form={form} visible={userType === 'business'} />
            <CreatorQuestions form={form} visible={userType === 'creator'} />
            <OtherQuestions form={form} visible={userType === 'other'} />
          </div>
        )}

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