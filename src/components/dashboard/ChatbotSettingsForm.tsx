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
      user_type: defaultValues.user_type || undefined,
      answers: defaultValues.answers || {
        business: Array(5).fill(""),
        creator: Array(5).fill(""),
        other: Array(4).fill("")
      }
    },
  });

  const userType = form.watch('user_type');

  // Watch for changes in user_type and clear other type answers
  React.useEffect(() => {
    if (userType) {
      const emptyAnswers = {
        business: Array(5).fill(""),
        creator: Array(5).fill(""),
        other: Array(4).fill("")
      };
      
      // Only keep the current user type answers, clear others
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
      // Only include the current user type answers in the submission
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
                    <Label htmlFor="business">Pengguna Bisnis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creator" id="creator" />
                    <Label htmlFor="creator">Pengguna Kreator</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Pengguna Lainnya</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
