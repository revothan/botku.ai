import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { ProductFormValues } from "../ProductForm";

interface ProductPurchaseFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

const ProductPurchaseFields = ({ form }: ProductPurchaseFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="cta"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Call To Action</FormLabel>
            <FormControl>
              <Input 
                placeholder="Contoh: Beli Sekarang"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="purchase_link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link Pembelian</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://..."
                type="url"
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

export default ProductPurchaseFields;