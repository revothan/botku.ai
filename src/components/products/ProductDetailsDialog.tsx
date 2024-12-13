import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
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
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    onOpenChange(false);
  };

  const handleBuyNow = () => {
    setShowOrderSummary(true);
  };

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
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <Button 
              className="flex-1"
              onClick={handleBuyNow}
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