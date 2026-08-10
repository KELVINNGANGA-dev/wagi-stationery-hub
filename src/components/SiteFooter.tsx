import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "@/components/Logo";
import { STORE } from "@/lib/store-config";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-surface">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Logo size="lg" />
          <p className="text-sm text-muted-foreground">{STORE.tagline}</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Shop</h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-primary">
                All products
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-primary">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-primary">
                Wishlist
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-primary">
                Track my order
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Company</h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact us
              </Link>
            </li>
            <li>
              <Link to="/account" className="hover:text-primary">
                My account
              </Link>
            </li>
            <li>Delivery countrywide</li>
            <li>Pay with M-Pesa or cash</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Visit or call us</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{STORE.fullAddress}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <a href={`tel:${STORE.phoneIntl}`} className="hover:text-primary">
                {STORE.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <a href={`mailto:${STORE.email}`} className="break-all hover:text-primary">
                {STORE.email}
              </a>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{STORE.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} {STORE.name}. All rights reserved.
      </div>
    </footer>
  );
}
