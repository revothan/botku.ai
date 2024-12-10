import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import BusinessQuestions from "./questions/BusinessQuestions";
import CreatorQuestions from "./questions/CreatorQuestions";
import OtherQuestions from "./questions/OtherQuestions";
import FormHeaderFields from "./form/FormHeaderFields";
import UserTypeSelection from "./form/UserTypeSelection";
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
      user_type: defaultValues.user_type || undefined,
      answers: defaultValues.answers || {
        business: Array(5).fill(""),
        creator: Array(5).fill(""),
        other: Array(4).fill("")
      }
    },
  });

  const userType = form.watch('user_type');

  useEffect(() => {
    if (userType) {
      const emptyAnswers = {
        business: Array(5).fill(""),
        creator: Array(5).fill(""),
        other: Array(4).fill("")
      };
      
      form.setValue('answers', {
        ...emptyAnswers,
        [userType]: form.getValues(`answers.${userType}`)
      });
    }
  }, [userType, form]);

  const generateTrainingData = (type: string, answers: Record<string, string[]>) => {
    let trainingData = '';
    const typeAnswers = answers[type as keyof typeof answers] || [];
    
    const questions = type === 'business' 
      ? [
          "Nama bisnis dan deskripsi produk/jasa",
          "Target pelanggan utama",
          "Pertanyaan umum yang sering ditanyakan pelanggan",
          "Tujuan utama penggunaan AI atau chatbot",
          "Bahasa yang akan digunakan oleh chatbot"
        ]
      : type === 'creator'
        ? [
            "Jenis konten utama yang dibuat",
            "Audiens utama atau target pengikut",
            "Pertanyaan yang sering diajukan pengikut",
            "Cara AI membantu audiens",
            "Kebutuhan untuk merekomendasikan konten atau produk"
          ]
        : [
            "Tujuan utama pembuatan AI",
            "Topik atau fokus utama AI",
            "Gaya komunikasi yang diinginkan",
            "Masalah yang ingin diselesaikan oleh AI"
          ];

    typeAnswers.forEach((answer, index) => {
      if (answer && typeof answer === 'string' && answer.trim() && questions[index]) {
        trainingData += `${questions[index]}\n${answer.trim()}\n\n`;
      }
    });

    return trainingData;
  };

  const handleFormSubmit = (values: ChatbotFormData) => {
    if (userType && values.answers) {
      const currentTypeAnswers = {
        business: Array(5).fill(""),
        creator: Array(5).fill(""),
        other: Array(4).fill("")
      };
      
      currentTypeAnswers[userType] = values.answers[userType];
      values.answers = currentTypeAnswers;
      values.training_data = generateTrainingData(userType, currentTypeAnswers);
    }
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8 p-4">
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
          {isSubmitting ? "Menyimpan..." : hasExistingBot ? "Perbarui Pengaturan" : "Buat Chatbot"}
        </Button>
      </form>
    </Form>
  );
};

export default ChatbotSettingsForm;
