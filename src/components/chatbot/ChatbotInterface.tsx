import { Card, CardContent } from "@/components/ui/card";
import { ChatInput } from "@/components/chatbot/ChatInput";
import { ChatHeader } from "@/components/chatbot/ChatHeader";
import { ChatMessages } from "@/components/chatbot/ChatMessages";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import ProductDetailsDialog from "@/components/products/ProductDetailsDialog";
import { formatCurrency } from "@/lib/utils";
import type { Message, ButtonConfig, ChatbotSettings } from "@/types/chatbot";
import type { Product } from "@/types/product";

type ChatbotInterfaceProps = {
  settings: ChatbotSettings;
  messages: Message[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isLoading?: boolean;
};

export const ChatbotInterface = ({
  settings,
  messages,
  inputMessage,
  setInputMessage,
  handleSubmit,
  messagesEndRef,
  isLoading = false,
}: ChatbotInterfaceProps) => {
  console.log("ChatbotInterface settings:", settings); // Debug log
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const buttons = (settings.buttons || []) as ButtonConfig[];

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["chatbot-products", settings.profile_id],
    queryFn: async () => {
      console.log("Fetching products for profile:", settings.profile_id);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("profile_id", settings.profile_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      console.log("Products fetched:", data);
      return data as Product[];
    },
    enabled: !!settings.profile_id,
  });

  // Debug log for avatar URL
  console.log("Avatar URL from settings:", settings.avatar_url);

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-[#fcf5eb] to-white p-4 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-lg h-full">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm h-full">
          <CardContent className="p-4 h-full flex flex-col">
            <ChatHeader 
              botName={settings.bot_name}
              avatarUrl={settings.avatar_url || undefined}
            />
            
            <ChatMessages 
              messages={messages}
              buttons={buttons}
              isLoading={isLoading}
              greetingMessage={settings.greeting_message}
              messagesEndRef={messagesEndRef}
            />

            <div className="border-t pt-4">
              {/* Products Collapsible Section */}
              {productsLoading ? (
                <div className="mb-4">
                  <div className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
                </div>
              ) : products && products.length > 0 ? (
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
                          className="flex-none w-48 border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-md mb-2"
                            />
                          )}
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          <p className="text-primary font-medium text-sm mt-1">
                            {formatCurrency(product.price)}
                          </p>
                          {product.stock !== null && product.stock > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Stock: {product.stock}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : null}

              {/* Chat Input */}
              <ChatInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <ProductDetailsDialog
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </div>
  );
};