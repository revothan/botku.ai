import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

const otherQuestions = [
  "Tujuan utama pembuatan AI",
  "Topik atau fokus utama AI",
  "Gaya komunikasi yang diinginkan",
  "Masalah yang ingin diselesaikan oleh AI"
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
            <FormItem className="grid grid-cols-2 gap-4 items-start">
              <FormLabel className="mt-2.5">{question}</FormLabel>
              <div>
                <FormControl>
                  <Textarea
                    placeholder="Ketik jawaban Anda di sini..."
                    className="resize-none h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export default OtherQuestions;