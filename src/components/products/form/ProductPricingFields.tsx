import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { ProductFormValues } from "../ProductForm";

interface ProductPricingFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

const ProductPricingFields = ({ form }: ProductPricingFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Harga</FormLabel>
            <FormControl>
              <Input 
                placeholder="Masukkan harga"
                type="number"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="stock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stock</FormLabel>
            <FormControl>
              <Input 
                placeholder="Masukkan stock"
                type="number"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ProductPricingFields;