import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ButtonManager from "./ButtonManager";
import type { ButtonConfig } from "@/types/chatbot";

type ButtonsSectionProps = {
  profileId: string;
  initialButtons: ButtonConfig[];
};

const ButtonsSection = ({ profileId, initialButtons }: ButtonsSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateButtons = useMutation({
    mutationFn: async (buttons: ButtonConfig[]) => {
      const { data, error } = await supabase
        .from("chatbot_settings")
        .update({ buttons })
        .eq("profile_id", profileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-settings"] });
      toast({
        title: "Success",
        description: "Quick action buttons updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleButtonsChange = (buttons: ButtonConfig[]) => {
    updateButtons.mutate(buttons);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Quick Action Buttons</h3>
      <ButtonManager
        buttons={initialButtons}
        onChange={handleButtonsChange}
      />
    </div>
  );
};

export default ButtonsSection;