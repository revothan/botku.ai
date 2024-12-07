import { Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PhonePreviewProps = {
  botName: string;
  greetingMessage: string;
};

const PhonePreview = ({ botName, greetingMessage }: PhonePreviewProps) => {
  return (
    <div className="relative mx-auto w-[300px] h-[600px] rounded-[3rem] border-8 border-gray-900 overflow-hidden">
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-2xl"></div>
      <div className="h-full bg-gray-100 p-4">
        <div className="bg-white h-full rounded-2xl shadow-sm p-4 flex flex-col">
          <div className="text-center border-b pb-4">
            <h3 className="font-bold">{botName || "My ChatBot"}</h3>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <div className="bg-primary/10 rounded-lg p-3 max-w-[80%] mb-4">
              <p className="text-sm">
                {greetingMessage || "Hello! How can I help you today?"}
              </p>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                className="flex-1"
                disabled
              />
              <Button size="icon" disabled>
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhonePreview;