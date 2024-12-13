import { useQuery } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: string;
  product: {
    name: string;
  };
}

const CustomerDashboard = () => {
  const session = useSession();
  const userId = session?.user?.id;

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ["customers", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("customers")
        .select(`
          id,
          name,
          email,
          created_at,
          product:products (
            name
          )
        `)
        .eq("profile_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading customers: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Customer List</h1>
      
      {!customers?.length ? (
        <p className="text-muted-foreground">No customers yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id} className="p-4 space-y-2">
              <h3 className="font-medium">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
              <p className="text-sm text-muted-foreground">
                Product: {customer.product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Signed up: {new Date(customer.created_at).toLocaleDateString()}
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;