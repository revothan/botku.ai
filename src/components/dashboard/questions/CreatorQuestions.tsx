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
    <div className="space-y-4">
      {creatorQuestions.map((question, index) => (
        <FormField
          key={index}
          control={form.control}
          name={`answers.creator.${index}`}
          render={({ field }) => (
            <FormItem className="grid grid-cols-2 gap-4 items-start">
              <FormLabel className="mt-2.5">{question.label}</FormLabel>
              <div>
                <FormControl>
                  <Textarea
                    placeholder={question.placeholder}
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

export default CreatorQuestions;