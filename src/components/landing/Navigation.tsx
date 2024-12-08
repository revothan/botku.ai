import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type NavigationProps = {
  scrollToFeatures: () => void;
};

export const Navigation = ({ scrollToFeatures }: NavigationProps) => {
  return (
    <nav className="flex justify-between items-center mb-16">
      <h1 className="text-2xl font-bold tracking-tight text-[#075e54]">MENYAPA</h1>
      <div className="hidden md:flex space-x-8 text-[#075e54]">
        <Button variant="ghost" asChild className="hover:text-[#128c7e]">
          <Link to="/">Beranda</Link>
        </Button>
        <Button variant="ghost" onClick={scrollToFeatures} className="hover:text-[#128c7e]">
          Fitur
        </Button>
        <Button variant="ghost" asChild className="hover:text-[#128c7e]">
          <Link to="/pricing">Harga</Link>
        </Button>
      </div>
      <div className="flex space-x-4">
        <Button variant="ghost" asChild className="hidden md:inline-flex">
          <Link to="/login">Masuk</Link>
        </Button>
        <Button 
          className="bg-[#25d366] hover:bg-[#128c7e] text-white"
          asChild
        >
          <Link to="/login">Coba Gratis Sekarang</Link>
        </Button>
      </div>
    </nav>
  );
};