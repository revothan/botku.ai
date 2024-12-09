import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import BusinessQuestions from "./questions/BusinessQuestions";
import CreatorQuestions from "./questions/CreatorQuestions";
import OtherQuestions from "./questions/OtherQuestions";
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
    defaultValues: {
      ...defaultValues,
      answers: {
        business: Array(10).fill(""),
        creator: Array(10).fill(""),
        other: Array(10).fill("")
      }
    },
  });

  const userType = form.watch('user_type');

  const generateTrainingData = (type: string, answers: Record<string, string[]>) => {
    let trainingData = '';
    const typeAnswers = answers[type as keyof typeof answers] || [];
    
    const questions = type === 'business' 
      ? BusinessQuestions
      : type === 'creator'
        ? CreatorQuestions
        : OtherQuestions;

    typeAnswers.forEach((answer, index) => {
      if (answer.trim()) {
        trainingData += `${questions[index]}\n${answer}\n\n`;
      }
    });

    return trainingData;
  };

  const handleFormSubmit = (values: ChatbotFormData) => {
    if (userType && values.answers) {
      values.training_data = generateTrainingData(userType, values.answers);
    }
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bot_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Chatbot</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama chatbot Anda" {...field} />
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
              <FormLabel>Pesan Sambutan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Masukkan pesan sambutan untuk pengunjung Anda"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="user_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Pilih Salah Satu</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business">Untuk Bisnis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creator" id="creator" />
                    <Label htmlFor="creator">Untuk Kreator</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Lainnya</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <BusinessQuestions form={form} visible={userType === 'business'} />
        <CreatorQuestions form={form} visible={userType === 'creator'} />
        <OtherQuestions form={form} visible={userType === 'other'} />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Menyimpan..." : hasExistingBot ? "Perbarui Pengaturan" : "Buat Chatbot"}
        </Button>
      </form>
    </Form>
  );
};

export default ChatbotSettingsForm;