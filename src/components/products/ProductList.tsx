import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EditProductDialog from "./EditProductDialog";
import type { Product } from "@/types/product";

interface ProductListProps {
  products: Product[];
  onProductUpdated: () => void;
}

const ProductList = ({ products, onProductUpdated }: ProductListProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { toast } = useToast();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      onProductUpdated();
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative"
            onClick={() => handleProductClick(product)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive hover:text-destructive/90"
              onClick={(e) => handleDeleteClick(e, product)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            {product.image_url && (
              <div className="relative w-full h-48 mb-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => {
                    console.error('Image load error:', e);
                    const img = e.target as HTMLImageElement;
                    img.src = '/placeholder.svg';
                  }}
                />
              </div>
            )}
            <h3 className="font-semibold text-lg">{product.name}</h3>
            {product.details && (
              <p className="text-gray-600 text-sm mt-1">{product.details}</p>
            )}
            <div className="mt-2 space-y-1">
              <p className="text-primary font-medium">
                {formatCurrency(product.price)}
              </p>
              {product.stock !== null && product.stock > 0 && (
                <p className="text-sm text-gray-600">
                  Stock: {product.stock}
                </p>
              )}
              {product.sku && (
                <p className="text-sm text-gray-600">
                  SKU: {product.sku}
                </p>
              )}
              {product.delivery_fee !== undefined && product.delivery_fee > 0 && (
                <p className="text-sm text-gray-600">
                  Delivery Fee: {formatCurrency(product.delivery_fee)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <EditProductDialog
          product={selectedProduct}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onProductUpdated={() => {
            onProductUpdated();
            setSelectedProduct(null);
          }}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductList;