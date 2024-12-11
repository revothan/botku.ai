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

  const formatProductForAssistant = (values: ProductFormValues) => {
    return `This business has this product:
Nama Produk: ${values.name}
Details: ${values.details || 'Tidak ada detail'}
Harga: ${values.price}
Stok: ${values.has_stock ? values.stock : 'Tidak tersedia'}
Call To Action untuk membeli: ${values.cta || 'Beli Sekarang'}`;
  };

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

      // Get current chatbot settings to update training data
      const { data: settings, error: settingsError } = await supabase
        .from('chatbot_settings')
        .select('training_data, assistant_id')
        .eq('profile_id', product.profile_id)
        .single();

      if (settingsError) throw settingsError;

      // Format the product information
      const productInfo = formatProductForAssistant(values);

      // Replace existing product information or append new one
      let trainingData = settings?.training_data || '';
      const productRegex = new RegExp(
        `This business has this product:\\nNama Produk: ${product.name}[\\s\\S]*?(?=This business has this product:|$)`,
        'g'
      );

      if (trainingData.match(productRegex)) {
        trainingData = trainingData.replace(productRegex, productInfo + '\n\n');
      } else {
        trainingData = trainingData + (trainingData ? '\n\n' : '') + productInfo;
      }

      // Update chatbot settings with new training data
      const { error: updateSettingsError } = await supabase
        .from('chatbot_settings')
        .update({ training_data: trainingData })
        .eq('profile_id', product.profile_id);

      if (updateSettingsError) throw updateSettingsError;

      // Update the product
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

      // Update OpenAI Assistant
      const assistantResponse = await supabase.functions.invoke('create-openai-assistant', {
        body: JSON.stringify({
          training_data: trainingData,
          assistant_id: settings?.assistant_id
        })
      });

      if (assistantResponse.error) {
        throw new Error(assistantResponse.error.message);
      }

      onProductUpdated();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Product and chatbot updated successfully",
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