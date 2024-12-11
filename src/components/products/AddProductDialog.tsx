import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import ProductForm, { ProductFormValues } from "./ProductForm";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded: () => void;
}

const AddProductDialog = ({ open, onOpenChange, onProductAdded }: AddProductDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const session = useSession();

  const formatProductForAssistant = (values: ProductFormValues) => {
    return `This business has this product:
Nama Produk: ${values.name}
Details: ${values.details || 'Tidak ada detail'}
Harga: ${values.price}
Stok: ${values.has_stock ? values.stock : 'Tidak tersedia'}
Call To Action untuk membeli: ${values.cta || 'Beli Sekarang'}`;
  };

  const handleSubmit = async (values: ProductFormValues) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add products",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      let imageUrl = null;
      
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

      // Get current chatbot settings
      const { data: settings, error: settingsError } = await supabase
        .from('chatbot_settings')
        .select('training_data, assistant_id')
        .eq('profile_id', session.user.id)
        .single();

      if (settingsError) throw settingsError;

      // Format the product information
      const productInfo = formatProductForAssistant(values);

      // Append new product information to existing training data
      const trainingData = settings?.training_data 
        ? `${settings.training_data}\n\n${productInfo}`
        : productInfo;

      // Update chatbot settings with new training data
      const { error: updateSettingsError } = await supabase
        .from('chatbot_settings')
        .update({ training_data: trainingData })
        .eq('profile_id', session.user.id);

      if (updateSettingsError) throw updateSettingsError;

      // Add the new product
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: values.name,
          details: values.details,
          price: parseFloat(values.price),
          stock: values.has_stock ? parseInt(values.stock || "0") : null,
          sku: values.sku,
          delivery_fee: values.delivery_fee ? parseFloat(values.delivery_fee) : 0,
          image_url: imageUrl,
          profile_id: session.user.id,
          cta: values.cta,
          purchase_link: values.purchase_link,
        });

      if (insertError) throw insertError;

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

      onProductAdded();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Product added and chatbot updated successfully",
      });
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product. Please try again.",
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
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Add Product"
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;