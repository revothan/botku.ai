import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

const creatorQuestions = [
  "Jenis konten utama yang dibuat",
  "Audiens utama atau target pengikut",
  "Pertanyaan yang sering diajukan pengikut",
  "Cara AI membantu audiens",
  "Kebutuhan untuk merekomendasikan konten atau produk"
];

type CreatorQuestionsProps = {
  form: UseFormReturn<ChatbotFormData>;
  visible: boolean;
};

const CreatorQuestions = ({ form, visible }: CreatorQuestionsProps) => {
  if (!visible) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="resize-none h-24"
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