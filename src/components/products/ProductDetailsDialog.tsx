import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductDetailsDialog = ({ product, open, onOpenChange }: ProductDetailsDialogProps) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {product.image_url && (
            <div className="relative w-full aspect-video">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          
          {product.details && (
            <p className="text-sm text-muted-foreground">{product.details}</p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(product.price)}
              </p>
              {product.delivery_fee > 0 && (
                <p className="text-sm text-muted-foreground">
                  + {formatCurrency(product.delivery_fee)} delivery
                </p>
              )}
            </div>
            
            {product.stock !== null && product.stock > 0 && (
              <p className="text-sm text-muted-foreground">
                Stock: {product.stock}
              </p>
            )}
          </div>

          {product.purchase_link && (
            <Button 
              className="w-full"
              onClick={() => window.open(product.purchase_link, '_blank')}
            >
              {product.cta || "Buy Now"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;