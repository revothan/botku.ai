import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddProductDialog from "@/components/products/AddProductDialog";
import ProductList from "@/components/products/ProductList";
import type { Product } from "@/types/product";

const ProductManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
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
  });

  const handleProductChange = () => {
    refetch();
    toast({
      title: "Success",
      description: "Products updated successfully.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manajemen Produk</h1>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
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