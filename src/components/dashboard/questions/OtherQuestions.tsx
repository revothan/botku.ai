import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

const otherQuestions = [
  "Apa tujuan utama Anda membuat AI ini?",
  "Apa topik yang ingin Anda fokuskan dalam AI ini?",
  "Bagaimana gaya komunikasi yang Anda inginkan dari AI ini?",
  "Apa masalah utama yang Anda harapkan AI ini dapat bantu selesaikan?",
  "Siapa audiens atau pengguna lain yang mungkin akan menggunakan AI Anda?",
  "Apa pertanyaan umum yang sering Anda butuhkan jawabannya di topik ini?",
  "Apakah AI Anda perlu memberi rekomendasi? Jika ya, rekomendasi tentang apa?",
  "Apakah Anda memiliki preferensi bahasa atau istilah tertentu untuk digunakan oleh AI ini?",
  "Apakah Anda ingin AI ini dapat berbicara dengan suara, atau cukup dalam bentuk teks saja?",
  "Bagaimana AI ini dapat membuat pengalaman Anda lebih menyenangkan atau produktif?"
];

type OtherQuestionsProps = {
  form: UseFormReturn<ChatbotFormData>;
  visible: boolean;
};

const OtherQuestions = ({ form, visible }: OtherQuestionsProps) => {
  if (!visible) return null;

  return (
    <div className="space-y-4">
      {otherQuestions.map((question, index) => (
        <FormField
          key={index}
          control={form.control}
          name={`answers.other.${index}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{question}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ketik jawaban Anda di sini..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export default OtherQuestions;