import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

const creatorQuestions = [
  "Apa jenis konten utama yang Anda buat? (contoh: video, artikel, podcast)",
  "Apa gaya atau suara khas Anda dalam berbicara dengan audiens?",
  "Siapa audiens utama Anda?",
  "Apa pertanyaan umum yang sering ditanyakan pengikut Anda?",
  "Apa topik atau tema yang paling sering Anda bicarakan dalam konten Anda?",
  "Bagaimana AI Anda dapat membantu pengikut Anda?",
  "Apakah Anda ingin AI Anda merekomendasikan konten atau produk Anda?",
  "Apakah ada layanan atau produk yang Anda tawarkan, dan ingin AI bantu promosikan?",
  "Apakah AI perlu terintegrasi dengan platform tertentu?",
  "Apa kata-kata atau ekspresi yang tidak boleh digunakan AI untuk menjaga reputasi Anda?"
];

type CreatorQuestionsProps = {
  form: UseFormReturn<ChatbotFormData>;
  visible: boolean;
};

const CreatorQuestions = ({ form, visible }: CreatorQuestionsProps) => {
  if (!visible) return null;

  return (
    <div className="space-y-4">
      {creatorQuestions.map((question, index) => (
        <FormField
          key={index}
          control={form.control}
          name={`answers.creator.${index}`}
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

export default CreatorQuestions;