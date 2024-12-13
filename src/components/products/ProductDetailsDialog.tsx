import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { AuthForm } from "@/components/auth/AuthForm";
import CustomerForm from "./CustomerForm";
import OrderSummary from "./OrderSummary";
import type { Product } from "@/types/product";

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetailsDialog = ({ product, open, onOpenChange }: ProductDetailsDialogProps) => {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const session = useSession();

  if (!product) return null;

  const handleCartAction = (action: 'cart' | 'buy') => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with your purchase",
        variant: "default",
      });
      setShowAuthForm(true);
      return;
    }

    if (action === 'cart') {
      addToCart(product);
      onOpenChange(false);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      });
    } else {
      setShowOrderSummary(true);
    }
  };

  if (showAuthForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <AuthForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          <h2 className="text-lg font-semibold mb-2">{product.name}</h2>
          <p className="text-xl font-bold text-primary mb-4">
            {formatCurrency(product.price)}
          </p>
          {product.details && (
            <p className="text-muted-foreground mb-4">{product.details}</p>
          )}
          {product.stock !== null && product.stock > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Stock: {product.stock}
            </p>
          )}
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={() => handleCartAction('cart')}
            >
              Add to Cart
            </Button>
            <Button 
              className="flex-1"
              onClick={() => handleCartAction('buy')}
            >
              Buy Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <OrderSummary
        open={showOrderSummary}
        onOpenChange={setShowOrderSummary}
        product={product}
      />
    </>
  );
};

export default ProductDetailsDialog;