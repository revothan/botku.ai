import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { ChatbotFormData } from "@/types/chatbot";

type ChatbotSettingsFormProps = {
  defaultValues: ChatbotFormData;
  onSubmit: (values: ChatbotFormData) => void;
  isSubmitting: boolean;
  hasExistingBot: boolean;
};

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

const ChatbotSettingsForm = ({ 
  defaultValues, 
  onSubmit, 
  isSubmitting,
  hasExistingBot 
}: ChatbotSettingsFormProps) => {
  const form = useForm<ChatbotFormData>({
    defaultValues,
  });

  const generateTrainingData = (type: string, answers: string) => {
    const questions = type === 'business' 
      ? businessQuestions 
      : type === 'creator' 
        ? creatorQuestions 
        : otherQuestions;
    
    const formattedAnswers = answers.split('\n\n').filter(answer => answer.trim());
    let trainingData = '';

    questions.forEach((question, index) => {
      if (formattedAnswers[index]) {
        trainingData += `${question}\n${formattedAnswers[index]}\n\n`;
      }
    });

    return trainingData;
  };

  const handleFormSubmit = (values: ChatbotFormData) => {
    const userType = form.watch('user_type');
    if (userType && values.training_data) {
      values.training_data = generateTrainingData(userType, values.training_data);
    }
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bot_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Chatbot</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama chatbot Anda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="greeting_message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pesan Sambutan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Masukkan pesan sambutan untuk pengunjung Anda"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="user_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Pilih Jenis Pengguna</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="business" id="business" />
                    <Label htmlFor="business">Untuk Bisnis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creator" id="creator" />
                    <Label htmlFor="creator">Untuk Kreator</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Lainnya</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="training_data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ceritakan Tentang Anda</FormLabel>
              <div className="space-y-4">
                {['business', 'creator', 'other'].map((type) => (
                  <Collapsible
                    key={type}
                    className={form.watch('user_type') === type ? 'block' : 'hidden'}
                  >
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ChevronDown className="h-4 w-4" />
                      Lihat Panduan Pertanyaan
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {(type === 'business' ? businessQuestions : 
                          type === 'creator' ? creatorQuestions : 
                          otherQuestions).map((question, index) => (
                          <p key={index} className="pl-6">
                            {index + 1}. {question}
                          </p>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
                <FormControl>
                  <Textarea
                    placeholder="Jawab pertanyaan-pertanyaan di atas sesuai dengan jenis pengguna yang Anda pilih. Pisahkan setiap jawaban dengan baris kosong (enter 2x)."
                    className="min-h-[300px]"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Menyimpan..." : hasExistingBot ? "Perbarui Pengaturan" : "Buat Chatbot"}
        </Button>
      </form>
    </Form>
  );
};

export default ChatbotSettingsForm;