import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import ProductForm, { ProductFormValues } from "./ProductForm";

interface EditProductDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated: () => void;
}

const EditProductDialog = ({ product, open, onOpenChange, onProductUpdated }: EditProductDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      
      let imageUrl = product.image_url;
      
      if (values.image) {
        const fileExt = values.image.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, values.image);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: values.name,
          details: values.details,
          price: parseFloat(values.price),
          stock: values.has_stock ? parseInt(values.stock || "0") : null,
          sku: values.sku,
          delivery_fee: values.delivery_fee ? parseFloat(values.delivery_fee) : 0,
          image_url: imageUrl,
          cta: values.cta,
          purchase_link: values.purchase_link,
        })
        .eq('id', product.id);

      if (updateError) throw updateError;

      onProductUpdated();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        
        <ProductForm
          defaultValues={product}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Update Product"
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;