import { Link } from "wouter";
import { Car } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-carstore-orange rounded-lg flex items-center justify-center">
                <Car className="text-white h-5 w-5" />
              </div>
              <h3 className="ml-3 text-xl font-bold">CarStore</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner in finding the perfect car. Connecting buyers with verified dealers nationwide.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-carstore-orange transition-colors">
                <i className="fab fa-facebook-f" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-carstore-orange transition-colors">
                <i className="fab fa-twitter" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-carstore-orange transition-colors">
                <i className="fab fa-instagram" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-carstore-orange transition-colors">
                <i className="fab fa-linkedin-in" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">For Buyers</h4>
            <ul className="space-y-2">
              <li><Link href="/search" className="text-gray-400 hover:text-carstore-orange transition-colors">Search Cars</Link></li>
              <li><Link href="/compare" className="text-gray-400 hover:text-carstore-orange transition-colors">Compare Cars</Link></li>
              <li><Link href="/finance" className="text-gray-400 hover:text-carstore-orange transition-colors">Car Loans</Link></li>
              <li><Link href="/calculator" className="text-gray-400 hover:text-carstore-orange transition-colors">Price Calculator</Link></li>
              <li><Link href="/reviews" className="text-gray-400 hover:text-carstore-orange transition-colors">Car Reviews</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">For Dealers</h4>
            <ul className="space-y-2">
              <li><Link href="/sell" className="text-gray-400 hover:text-carstore-orange transition-colors">List Your Cars</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-carstore-orange transition-colors">Dealer Dashboard</Link></li>
              <li><Link href="/inventory" className="text-gray-400 hover:text-carstore-orange transition-colors">Inventory Management</Link></li>
              <li><Link href="/analytics" className="text-gray-400 hover:text-carstore-orange transition-colors">Analytics</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-carstore-orange transition-colors">Pricing Tools</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-400 hover:text-carstore-orange transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-carstore-orange transition-colors">Contact Us</Link></li>
              <li><Link href="/chat" className="text-gray-400 hover:text-carstore-orange transition-colors">Live Chat</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-carstore-orange transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-carstore-orange transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2023 CarStore. All rights reserved. | Connecting car buyers and dealers nationwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
