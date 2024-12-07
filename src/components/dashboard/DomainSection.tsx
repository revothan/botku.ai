import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type DomainSectionProps = {
  userId: string;
};

const DomainSection = ({ userId }: DomainSectionProps) => {
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("custom_domain")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const copyToClipboard = () => {
    if (profile?.custom_domain) {
      navigator.clipboard.writeText(`${window.location.origin}/bot/${profile.custom_domain}`);
      toast({
        title: "Link copied!",
        description: "The chatbot link has been copied to your clipboard.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Chatbot Domain</CardTitle>
        <CardDescription>
          Share this link with your visitors to let them interact with your chatbot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile?.custom_domain ? (
          <>
            <div className="p-3 bg-muted rounded-md break-all">
              {window.location.origin}/bot/{profile.custom_domain}
            </div>
            <Button onClick={copyToClipboard} className="w-full">
              Copy Link
            </Button>
          </>
        ) : (
          <div className="text-muted-foreground">Loading domain information...</div>
        )}
      </CardContent>
    </Card>
  );
};

export default DomainSection;