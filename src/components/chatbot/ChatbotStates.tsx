import { Card, CardContent } from "@/components/ui/card";

export const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fcf5eb] to-white">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
  </div>
);

export const ErrorState = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fcf5eb] to-white">
    <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-6">
        <p className="text-center text-muted-foreground">
          {message}
        </p>
      </CardContent>
    </Card>
  </div>
);

export const NotFoundState = () => (
  <ErrorState message="No chatbot found at this address. Please check the URL and try again." />
);