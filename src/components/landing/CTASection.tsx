import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <div className="mt-32 p-12 rounded-3xl bg-gradient-to-r from-[#25d366] to-[#128c7e]">
      <h2 className="text-3xl font-bold text-white mb-4">Mulai Sekarang</h2>
      <p className="text-white/90 mb-8 max-w-2xl mx-auto">
        Gabung dengan kreator dan pengusaha lainnya yang telah meningkatkan produktivitas mereka dengan BOTKU.AI.
      </p>
      <Button 
        size="lg" 
        className="bg-white text-[#075e54] hover:bg-white/90"
        asChild
      >
        <Link to="/login">Coba Gratis Sekarang</Link>
      </Button>
    </div>
  );
};