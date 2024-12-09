import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

const businessQuestions = [
  "Nama bisnis dan deskripsi produk/jasa",
  "Target pelanggan utama",
  "Pertanyaan umum yang sering ditanyakan pelanggan",
  "Tujuan utama penggunaan AI atau chatbot",
  "Bahasa yang akan digunakan oleh chatbot"
];

type BusinessQuestionsProps = {
  form: UseFormReturn<ChatbotFormData>;
  visible: boolean;
};

const BusinessQuestions = ({ form, visible }: BusinessQuestionsProps) => {
  if (!visible) return null;

  return (
    <div className="space-y-4">
      {businessQuestions.map((question, index) => (
        <FormField
          key={index}
          control={form.control}
          name={`answers.business.${index}`}
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

export default BusinessQuestions;