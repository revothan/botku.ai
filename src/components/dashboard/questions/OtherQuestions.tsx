import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

const otherQuestions = [
  {
    label: "Tujuan utama AI",
    placeholder: "Contoh: Tingkatkan interaksi atau solusi otomatis."
  },
  {
    label: "Topik/fokus utama",
    placeholder: "Contoh: Kesehatan mental, tips keuangan."
  },
  {
    label: "Gaya komunikasi",
    placeholder: "Contoh: Santai, profesional, ramah."
  },
  {
    label: "Tambahan",
    placeholder: "Isi jika ada informasi tambahan"
  }
];

type OtherQuestionsProps = {
  form: UseFormReturn<ChatbotFormData>;
  visible: boolean;
};

const OtherQuestions = ({ form, visible }: OtherQuestionsProps) => {
  if (!visible) return null;

  return (
    <div className="space-y-6">
      {otherQuestions.map((question, index) => (
        <FormField
          key={index}
          control={form.control}
          name={`answers.other.${index}`}
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col space-y-3">
                <FormLabel className="text-base">{question.label}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={question.placeholder}
                    className="min-h-[100px] resize-none"
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