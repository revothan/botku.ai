import { useState } from "react";
import { Smartphone, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { formatCurrency } from "@/lib/utils";
import type { ButtonConfig } from "@/types/chatbot";
import type { Product } from "@/types/product";

type PhonePreviewProps = {
  botName: string;
  greetingMessage: string;
  buttons?: ButtonConfig[];
  userId: string;
};

const PhonePreview = ({ botName, greetingMessage, buttons = [], userId }: PhonePreviewProps) => {
  const [isProductsOpen, setIsProductsOpen] = useState(true);

  const { data: products } = useQuery({
    queryKey: ["preview-products", userId],
    queryFn: async () => {
      console.log("Fetching products for preview:", userId);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products for preview:", error);
        throw error;
      }
      return data as Product[];
    },
    enabled: !!userId,
  });

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
            {buttons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {buttons.map((button) => (
                  <button
                    key={button.id}
                    className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/30 transition-colors"
                  >
                    {button.label || "Button"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            {/* Products Section */}
            {products && products.length > 0 && (
              <Collapsible
                open={isProductsOpen}
                onOpenChange={setIsProductsOpen}
                className="mb-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Available Products</p>
                  <CollapsibleTrigger className="hover:bg-gray-100 p-1 rounded-full transition-colors">
                    {isProductsOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="overflow-x-auto flex space-x-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex-none w-32 border rounded-lg p-2 bg-white shadow-sm"
                      >
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-24 object-cover rounded-md mb-2"
                          />
                        )}
                        <h4 className="font-medium text-xs">{product.name}</h4>
                        <p className="text-primary font-medium text-xs mt-1">
                          {formatCurrency(product.price)}
                        </p>
                        {product.stock !== undefined && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Stock: {product.stock}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Chat Input */}
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