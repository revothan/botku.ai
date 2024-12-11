import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddProductDialog from "@/components/products/AddProductDialog";
import ProductList from "@/components/products/ProductList";
import { useSession } from "@supabase/auth-helpers-react";
import type { Product } from "@/types/product";

const ProductManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const session = useSession();
  const userId = session?.user?.id;

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["products", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No user ID available for fetching products");
        return [];
      }

      console.log("Fetching products for user:", userId);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      return data as Product[];
    },
    enabled: !!userId,
  });

  const handleProductChange = () => {
    refetch();
    toast({
      title: "Success",
      description: "Products updated successfully.",
    });
  };

  const handleSyncProducts = async () => {
    if (!products?.length) {
      toast({
        title: "No Products",
        description: "Add some products first before syncing.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSyncing(true);

      // Format products data
      const productsData = products.map(product => ({
        name: product.name,
        details: product.details,
        price: product.price,
        stock: product.stock,
        cta: product.cta
      }));

      // Create a JSON file with products data
      const jsonContent = JSON.stringify({
        products: productsData,
        formatted_text: productsData.map(p => 
          `This business has these products:\nNama Produk: ${p.name}\nDetails: ${p.details || 'N/A'}\nHarga: ${p.price}\nStok: ${p.stock || 'N/A'}\nCall To Action untuk membeli: ${p.cta || 'Beli Sekarang'}`
        ).join('\n\n')
      }, null, 2);

      const file = new File([jsonContent], "products.json", {
        type: "application/json"
      });

      // Get the current settings to retrieve assistant_id
      const { data: settings, error: settingsError } = await supabase
        .from("chatbot_settings")
        .select("assistant_id")
        .eq("profile_id", userId)
        .single();

      if (settingsError) throw settingsError;

      // Upload file to OpenAI Assistant
      const response = await supabase.functions.invoke('sync-products-to-assistant', {
        body: {
          file: jsonContent,
          assistant_id: settings?.assistant_id
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Products synced with ChatGPT Assistant successfully.",
      });
    } catch (error: any) {
      console.error('Error syncing products:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sync products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manajemen Produk</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleSyncProducts}
            variant="outline"
            disabled={isSyncing || !products?.length}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync with Assistant
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <p>Loading products...</p>
        ) : !products?.length ? (
          <p>No products found. Add your first product!</p>
        ) : (
          <ProductList 
            products={products} 
            onProductUpdated={handleProductChange}
          />
        )}
      </Card>

      <AddProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onProductAdded={handleProductChange}
      />
    </div>
  );
};

export default ProductManagement;