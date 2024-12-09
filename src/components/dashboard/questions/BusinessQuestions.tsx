import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

const businessQuestions = [
  {
    label: "Nama bisnis",
    placeholder: "Contoh: Warung Suka Rasa, Kedai Kopi Bahagia"
  },
  {
    label: "Deskripsi produk/jasa",
    placeholder: "Contoh: Kopi premium dan makanan ringan."
  },
  {
    label: "Target pelanggan",
    placeholder: "Contoh: Mahasiswa, pekerja kantoran."
  },
  {
    label: "Pertanyaan umum",
    placeholder: "Contoh: Buka jam berapa? 08.00-22.00."
  },
  {
    label: "Tambahan",
    placeholder: "Isi jika ada informasi tambahan"
  }
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

export default BusinessQuestions;