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
      console.log("Updating buttons:", buttons);
      const { data, error } = await supabase
        .from("chatbot_settings")
        .update({ buttons })
        .eq("profile_id", profileId)
        .select()
        .single();

      if (error) {
        console.error("Error updating buttons:", error);
        throw error;
      }
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
      console.error("Error in updateButtons mutation:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleButtonsChange = (buttons: ButtonConfig[]) => {
    console.log("Handling button change:", buttons);
    updateButtons.mutate(buttons);
  };

  return (
    <div className="space-y-4">
      <ButtonManager
        buttons={initialButtons}
        onChange={handleButtonsChange}
      />
    </div>
  );
};

export default ButtonsSection;