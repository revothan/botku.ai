import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import type { ChatbotFormData } from "@/types/chatbot";

type UserTypeSelectionProps = {
  form: UseFormReturn<ChatbotFormData>;
};

const UserTypeSelection = ({ form }: UserTypeSelectionProps) => {
  return (
    <FormField
      control={form.control}
      name="user_type"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Pilih Salah Satu</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business" id="business" />
                <Label htmlFor="business">Pengguna Bisnis</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="creator" id="creator" />
                <Label htmlFor="creator">Pengguna Kreator</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Pengguna Lainnya</Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default UserTypeSelection;