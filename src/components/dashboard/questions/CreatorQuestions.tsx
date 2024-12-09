import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

const creatorQuestions = [
  {
    label: "Jenis konten utama",
    placeholder: "Contoh: Video edukasi, tips kecantikan, vlog harian."
  },
  {
    label: "Audiens utama",
    placeholder: "Contoh: Remaja, ibu rumah tangga, profesional muda."
  },
  {
    label: "Pertanyaan umum pengikut",
    placeholder: "Contoh: Bagaimana cara mulai investasi?"
  },
  {
    label: "Tambahan",
    placeholder: "Isi jika ada informasi tambahan"
  }
];

type CreatorQuestionsProps = {
  form: UseFormReturn<ChatbotFormData>;
  visible: boolean;
};

const CreatorQuestions = ({ form, visible }: CreatorQuestionsProps) => {
  if (!visible) return null;

  return (
    <div className="space-y-6">
      {creatorQuestions.map((question, index) => (
        <FormField
          key={index}
          control={form.control}
          name={`answers.creator.${index}`}
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

export default CreatorQuestions;