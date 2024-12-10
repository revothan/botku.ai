import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import type { ProductFormValues } from "../ProductForm";

interface ProductImageFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

const ProductImageField = ({ form }: ProductImageFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormLabel>Upload Foto Produk</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onChange(file);
                }
              }}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ProductImageField;