/**
 * @fileoverview Footer component
 * Site footer — editorial / catalog strip (matches global theme)
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CreditCard,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const currentYear = new Date().getFullYear();

  const linkClass =
    "text-secondary-foreground/80 transition-colors hover:text-primary";

  return (
    <footer className="border-t border-border/80 bg-secondary text-secondary-foreground">
      <div className="border-b border-[oklch(88%_0.02_85_/_0.12)]">
        <div className="container-custom py-10">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4 md:gap-6">
            {[
              { icon: Truck, title: "Free shipping", desc: "Orders $75+" },
              { icon: RotateCcw, title: "Returns", desc: "30-day window" },
              { icon: ShieldCheck, title: "Secure", desc: "Encrypted checkout" },
              { icon: CreditCard, title: "Payments", desc: "Major cards" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[oklch(88%_0.02_85_/_0.15)] bg-[oklch(22%_0.04_265_/_0.35)]">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <h4 className="font-heading text-[11px] font-bold uppercase tracking-[0.2em]">
                  {title}
                </h4>
                <p className="font-sans text-xs text-secondary-foreground/65">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div>
            <Link
              to="/"
              className="group mb-5 inline-flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight text-secondary-foreground"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm transition-transform group-hover:-rotate-6">
                <Package className="h-5 w-5" aria-hidden />
              </span>
              Shop<span className="text-primary">Smart</span>
            </Link>
            <p className="mb-5 max-w-xs font-sans text-sm leading-relaxed text-secondary-foreground/75">
              Curated products, straight pricing, and a checkout that does not waste
              your afternoon.
            </p>
            <div className="space-y-2.5 font-sans text-sm text-secondary-foreground/80">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                123 Commerce St, New York, NY 10001
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                (555) 123-4567
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                hello@shopsmart.com
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              Explore
            </h4>
            <ul className="space-y-2.5 font-sans text-sm">
              {[
                ["/category/electronics", "New arrivals"],
                ["/category/clothing", "Best sellers"],
                ["/category/accessories", "Sale"],
                ["/about", "About"],
                ["/contact", "Contact"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              Service
            </h4>
            <ul className="space-y-2.5 font-sans text-sm">
              {[
                ["/faq", "FAQ"],
                ["/shipping", "Shipping"],
                ["/returns", "Returns"],
                ["/privacy", "Privacy"],
                ["/terms", "Terms"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-[11px] font-bold uppercase tracking-[0.25em] text-primary">
              Letter
            </h4>
            <p className="mb-4 font-sans text-sm text-secondary-foreground/75">
              One note a month — launches, codes, no spam folder novels.
            </p>
            {subscribed ? (
              <p className="font-heading text-sm font-semibold text-primary">
                You are on the list. Thank you.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-[oklch(88%_0.02_85_/_0.2)] bg-[oklch(16%_0.04_265_/_0.45)] text-secondary-foreground placeholder:text-secondary-foreground/45"
                  required
                />
                <Button type="submit" size="sm" className="shrink-0">
                  Join
                </Button>
              </form>
            )}

            <div className="mt-8 flex gap-4">
              {[
                [Facebook, "Facebook"],
                [Twitter, "Twitter"],
                [Instagram, "Instagram"],
                [Youtube, "YouTube"],
              ].map(([Icon, label]) => (
                <a
                  key={label}
                  href="#"
                  className="text-secondary-foreground/55 transition-colors hover:text-primary"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[oklch(88%_0.02_85_/_0.1)]">
        <div className="container-custom flex flex-col items-center justify-between gap-4 py-5 md:flex-row">
          <p className="font-sans text-xs text-secondary-foreground/50">
            © {currentYear} ShopSmart. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-heading font-semibold uppercase tracking-wider text-secondary-foreground/55">
            {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((label) => (
              <span
                key={label}
                className="rounded border border-[oklch(88%_0.02_85_/_0.12)] px-2 py-1"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
