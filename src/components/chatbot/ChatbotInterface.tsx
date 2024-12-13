import { Card, CardContent } from "@/components/ui/card";
import { ChatInput } from "@/components/chatbot/ChatInput";
import { ChatMessages } from "@/components/chatbot/ChatMessages";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { useState } from "react";
import ProductDetailsDialog from "@/components/products/ProductDetailsDialog";
import OrderSummary from "@/components/products/OrderSummary";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
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
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [buyNowProduct, setBuyNowProduct] = useState<Product | null>(null);
  const { getItemCount } = useCart();
  const buttons = (settings.buttons || []) as ButtonConfig[];

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["chatbot-products", settings.profile_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("profile_id", settings.profile_id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data as Product[];
    },
    enabled: !!settings.profile_id,
  });

  const avatarUrl = settings.avatar_url || undefined;
  const cartItemCount = getItemCount();

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-[#fcf5eb] to-white p-4 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-lg h-full">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm h-full">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="text-center border-b pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {avatarUrl ? (
                    <AvatarImage 
                      src={avatarUrl} 
                      alt={settings.bot_name} 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <AvatarFallback>{settings.bot_name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-secondary">{settings.bot_name}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowOrderSummary(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>
            
            <ChatMessages 
              messages={messages}
              buttons={buttons}
              isLoading={isLoading}
              greetingMessage={settings.greeting_message}
              messagesEndRef={messagesEndRef}
            />

            <div className="border-t pt-4">
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

      <OrderSummary
        open={showOrderSummary}
        onOpenChange={setShowOrderSummary}
        product={buyNowProduct}
      />
    </div>
  );
};