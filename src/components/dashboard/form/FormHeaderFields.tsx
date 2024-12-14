import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

type FormHeaderFieldsProps = {
  form: UseFormReturn<ChatbotFormData>;
};

const FormHeaderFields = ({ form }: FormHeaderFieldsProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="bot_name"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Nama Chatbot</FormLabel>
            <FormControl>
              <Input 
                placeholder="Masukkan nama chatbot Anda" 
                {...field} 
                className="w-full min-h-[48px] px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="greeting_message"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Pesan Sambutan</FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan pesan sambutan untuk pengunjung Anda"
                {...field}
                className="w-full min-h-[48px] px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default FormHeaderFields;