import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { ProductFormValues } from "../ProductForm";

interface ProductDetailsFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

const ProductDetailsFields = ({ form }: ProductDetailsFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="sku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU</FormLabel>
            <FormControl>
              <Input 
                placeholder="Masukkan SKU"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="delivery_fee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Biaya Pengiriman</FormLabel>
            <FormControl>
              <Input 
                placeholder="Masukkan biaya pengiriman"
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

export default ProductDetailsFields;