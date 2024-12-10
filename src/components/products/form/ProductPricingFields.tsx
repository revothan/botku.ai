import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn, useWatch } from "react-hook-form";
import type { ProductFormValues } from "../ProductForm";

interface ProductPricingFieldsProps {
  form: UseFormReturn<ProductFormValues>;
}

const ProductPricingFields = ({ form }: ProductPricingFieldsProps) => {
  const hasStock = useWatch({
    control: form.control,
    name: "has_stock",
    defaultValue: !!form.getValues("stock"),
  });

  return (
    <div className="space-y-4">
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
        name="has_stock"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between space-y-0">
            <FormLabel>Track Stock</FormLabel>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    form.setValue("stock", undefined);
                  } else {
                    form.setValue("stock", "1");
                  }
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {hasStock && (
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
      )}
    </div>
  );
};

export default ProductPricingFields;