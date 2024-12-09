import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

const businessQuestions = [
  "Apa nama bisnis Anda, dan apa produk/jasa utama yang Anda tawarkan?",
  "Apa keunikan dari bisnis Anda yang ingin disampaikan kepada pelanggan?",
  "Siapa target pelanggan utama Anda? (contoh: anak muda, profesional, keluarga, dll.)",
  "Apa pertanyaan umum yang sering ditanyakan oleh pelanggan tentang bisnis Anda?",
  "Bagaimana cara pelanggan biasanya menghubungi Anda? (contoh: WhatsApp, email, media sosial)",
  "Apa tujuan utama Anda menggunakan chatbot ini?",
  "Jika pelanggan mengeluh atau memiliki masalah, bagaimana cara Anda ingin chatbot merespons?",
  "Apakah ada promosi, diskon, atau penawaran khusus yang ingin Anda informasikan melalui chatbot?",
  "Bahasa apa yang ingin digunakan AI Anda untuk berbicara dengan pelanggan?",
  "Apakah Anda ingin AI dapat menjadwalkan pertemuan atau mengarahkan pelanggan ke tim Anda?"
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

export default BusinessQuestions;