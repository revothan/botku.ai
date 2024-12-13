import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { formatCurrency } from "@/lib/utils";
import CustomerForm from "./CustomerForm";
import { useState } from "react";
import type { Product } from "@/types/product";

interface OrderSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

const OrderSummary = ({ open, onOpenChange, product }: OrderSummaryProps) => {
  const { items, removeFromCart } = useCart();
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const products = product ? [{ ...product, quantity: 1 }] : items;
  
  const total = products.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);

  const handleProceed = (product: Product) => {
    setSelectedProduct(product);
    setShowCustomerForm(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Order Summary</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {products.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity || 1}
                  </p>
                  <p className="text-sm font-medium">
                    {formatCurrency(item.price * (item.quantity || 1))}
                  </p>
                </div>
                {!product && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => handleProceed(products[0])}
            >
              Proceed to Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CustomerForm
        product={selectedProduct}
        open={showCustomerForm}
        onOpenChange={setShowCustomerForm}
      />
    </>
  );
};

export default OrderSummary;