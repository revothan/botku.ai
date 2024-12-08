export const Footer = () => {
  return (
    <footer className="bg-[#075e54] text-white mt-32 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">BOTKU.AI</h3>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-[#25d366]">Beranda</a></li>
              <li><a href="#" className="hover:text-[#25d366]">Fitur</a></li>
              <li><a href="/pricing" className="hover:text-[#25d366]">Harga</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p>© 2024 BOTKU.AI. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};