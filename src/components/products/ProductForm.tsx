import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import ProductBasicFields from "./form/ProductBasicFields";
import ProductPricingFields from "./form/ProductPricingFields";
import ProductDetailsFields from "./form/ProductDetailsFields";
import ProductPurchaseFields from "./form/ProductPurchaseFields";
import ProductImageField from "./form/ProductImageField";

const formSchema = z.object({
  name: z.string().min(1, "Nama produk harus diisi"),
  details: z.string().optional(),
  price: z.string().min(1, "Harga harus diisi").regex(/^\d+$/, "Harga harus berupa angka"),
  stock: z.string().regex(/^\d*$/, "Stock harus berupa angka").optional(),
  sku: z.string().optional(),
  delivery_fee: z.string().regex(/^\d*$/, "Biaya pengiriman harus berupa angka").optional(),
  image: z.instanceof(File).optional(),
  cta: z.string().optional(),
  purchase_link: z.string().url("Link pembelian harus berupa URL yang valid").optional(),
});

export type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  defaultValues?: Partial<Product>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}

const ProductForm = ({ defaultValues, onSubmit, onCancel, submitLabel, isSubmitting }: ProductFormProps) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      details: defaultValues?.details || "",
      price: defaultValues?.price?.toString() || "",
      stock: defaultValues?.stock?.toString() || "0",
      sku: defaultValues?.sku || "",
      delivery_fee: defaultValues?.delivery_fee?.toString() || "0",
      cta: defaultValues?.cta || "Beli Sekarang",
      purchase_link: defaultValues?.purchase_link || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ProductBasicFields form={form} />
        <ProductPricingFields form={form} />
        <ProductDetailsFields form={form} />
        <ProductPurchaseFields form={form} />
        <ProductImageField form={form} />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;