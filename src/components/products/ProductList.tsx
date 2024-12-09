import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import EditProductDialog from "./EditProductDialog";
import type { Product } from "@/types/product";

interface ProductListProps {
  products: Product[];
  onProductUpdated: () => void;
}

const ProductList = ({ products, onProductUpdated }: ProductListProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h3 className="font-semibold text-lg">{product.name}</h3>
            {product.details && (
              <p className="text-gray-600 text-sm mt-1">{product.details}</p>
            )}
            <p className="text-primary font-medium mt-2">
              {formatCurrency(product.price)}
            </p>
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
    </>
  );
};

export default ProductList;