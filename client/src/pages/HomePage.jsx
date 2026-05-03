/**
 * @fileoverview HomePage component
 * Main landing page with hero, categories, rails, and social proof
 */

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import {
  useStorefrontCategories,
  useStorefrontProducts,
} from "@/hooks/useStorefront";

/**
 * Hero — one promise, one image, warm surface (no competing gradients)
 */
function HeroSection() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="container-custom">
        <div className="grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 lg:py-24">
          <div className="animate-hero-in space-y-6 lg:space-y-8">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
              The edit
            </p>

            <h1 className="max-w-xl font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-[3.25rem] lg:font-black">
              A quiet catalog for things you&apos;ll actually use.
            </h1>

            <p className="max-w-md font-sans text-base font-normal leading-relaxed text-muted-foreground md:text-lg">
              Honest pricing, tight assortment, checkout that respects your time.
              Built for people who read the details—not just the headline.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button size="xl" className="font-heading" asChild>
                <Link to="/category/clothing">
                  Open the edit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="font-heading" asChild>
                <Link to="/category/electronics">Browse the catalog</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="relative ml-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800"
                alt="Curated fashion still life"
                loading="eager"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * USP / benefits — four columns, 48px icon squares with border
 */
function BenefitsBar() {
  const benefits = [
    {
      icon: Truck,
      title: "Free shipping",
      desc: "On orders over $75 in the US.",
    },
    {
      icon: Shield,
      title: "Secure checkout",
      desc: "Encrypted payments end to end.",
    },
    {
      icon: RotateCcw,
      title: "Easy returns",
      desc: "30-day window, no runaround.",
    },
    {
      icon: Headphones,
      title: "Human support",
      desc: "Real answers, typically same day.",
    },
  ];

  return (
    <section className="border-b border-border/60 bg-muted/40 py-16 lg:py-24">
      <div className="container-custom">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background">
                <benefit.icon className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div className="min-w-0">
                <h4 className="font-heading text-sm font-bold tracking-tight text-foreground">
                  {benefit.title}
                </h4>
                <p className="mt-1 font-sans text-sm leading-snug text-muted-foreground">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Categories — bottom-third scrim only; image scale 1.03 / 400ms ease-out
 */
function CategoriesSection({ categories }) {
  const featuredCategories = categories.slice(0, 6);

  return (
    <section className="py-16 lg:py-24">
      <div className="container-custom">
        <div className="mb-8 max-w-2xl md:mb-10">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Shop by category
          </h2>
          <p className="mt-2 font-sans text-muted-foreground">
            Pick a lane—home, style, or gear—and go deep.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-card transition-[border-color,box-shadow] duration-200 ease-out hover:border-primary/25 hover:shadow-md"
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.03] group-active:scale-[1.03]"
                loading="lazy"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.72)_0%,transparent_33%)]"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                <h3 className="font-heading text-lg font-bold tracking-tight text-white md:text-xl">
                  {category.name}
                </h3>
                <p className="mt-0.5 font-sans text-sm text-white/85">
                  {category.productCount} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Connection strip — one factual line, no nested pills */
function ConnectionStrip({ source, error }) {
  const isLive = source === "api";
  const main = isLive
    ? "Live catalog — Connected to the API."
    : "Demo catalog — Fallback data while offline.";
  return (
    <div
      className={`border-b border-border/60 py-3 text-center text-sm transition-opacity duration-150 ease-out ${
        isLive ? "bg-background text-muted-foreground" : "bg-muted/50 text-muted-foreground"
      }`}
    >
      <p className="container-custom font-sans">
        <span className={isLive ? "text-success" : "text-foreground"}>
          {isLive ? "● " : "○ "}
        </span>
        <span className="text-foreground">{main}</span>
        {error ? (
          <span className="mt-1 block truncate text-xs text-muted-foreground md:mt-0 md:ml-2 md:inline">
            ({error})
          </span>
        ) : null}
      </p>
    </div>
  );
}

/**
 * Product rail — optional eyebrow (use sparingly: one “The edit” rail per page)
 */
function ProductSection({
  title,
  subtitle,
  products,
  viewAllLink,
  viewAllText = "View all",
  showEyebrow = false,
  eyebrowText = "The edit",
}) {
  return (
    <section className="py-16 lg:py-24">
      <div className="container-custom">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div>
            {showEyebrow ? (
              <p className="mb-2 font-heading text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                {eyebrowText}
              </p>
            ) : null}
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 max-w-lg font-sans text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {viewAllLink ? (
            <Button variant="outline" asChild>
              <Link to={viewAllLink}>
                {viewAllText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah M.",
      text: "Consistent quality and fast shipping. I keep coming back because the edit feels intentional, not endless.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      rating: 5,
    },
    {
      name: "James K.",
      text: "Support helped me pick the right size the first time. Clear answers, no script.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
      rating: 5,
    },
    {
      name: "Emily R.",
      text: "Fair prices and a return policy that actually reads like it was written for humans.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      rating: 5,
    },
  ];

  return (
    <section className="border-y border-border/60 bg-muted/30 py-16 lg:py-24">
      <div className="container-custom">
        <div className="mb-8 max-w-2xl md:mb-10">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What customers say
          </h2>
          <p className="mt-2 font-sans text-muted-foreground">
            Short notes from people who shop here regularly.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex h-full flex-col rounded-xl border border-border/70 bg-card p-6 transition-[border-color,box-shadow] duration-200 ease-out hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-4 flex text-primary">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 fill-current opacity-90"
                    viewBox="0 0 20 20"
                    aria-hidden
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="line-clamp-3 flex-1 font-sans text-sm leading-relaxed text-muted-foreground">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-border/50 pt-4">
                <img
                  src={testimonial.avatar}
                  alt=""
                  className="h-10 w-10 rounded-full border border-border/60"
                />
                <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
                  {testimonial.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="border-t border-border/60 bg-muted/40 py-16 lg:py-24">
      <div className="container-custom">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Occasional notes from the shop
          </h2>
          <p className="mt-2 font-sans text-muted-foreground">
            Restocks and new arrivals—at most twice a month. Unsubscribe anytime.
          </p>

          {subscribed ? (
            <p className="mt-8 font-heading text-base font-semibold tracking-tight text-foreground">
              You&apos;re subscribed. Thanks for opting in.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:items-stretch"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-11 flex-1 rounded-lg border border-input bg-background px-4 py-3 font-sans text-sm text-foreground shadow-sm transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                required
              />
              <Button type="submit" size="lg" className="sm:shrink-0">
                Subscribe
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * HomePage component
 * @returns {JSX.Element} Home page
 */
export function HomePage() {
  const { data: categories } = useStorefrontCategories();
  const { data: catalogProducts, source, error } = useStorefrontProducts();
  const bestsellers = catalogProducts
    .filter((product) => product.isBestseller)
    .slice(0, 4);
  const newArrivals = catalogProducts.filter((product) => product.isNew).slice(0, 4);
  const saleProducts = catalogProducts
    .filter((product) => product.discount > 0)
    .slice(0, 4);

  return (
    <>
      <ConnectionStrip source={source} error={error} />
      <HeroSection />
      <BenefitsBar />
      <CategoriesSection categories={categories} />
      <ProductSection
        showEyebrow
        eyebrowText="The edit"
        title="Best sellers"
        subtitle="Proof of assortment—popular picks that earn their shelf space."
        products={bestsellers}
        viewAllLink="/category/electronics"
      />
      <ProductSection
        title="New arrivals"
        subtitle="Fresh drops across the catalog."
        products={newArrivals}
        viewAllLink="/category/clothing"
      />
      <TestimonialsSection />
      <ProductSection
        title="On sale"
        subtitle="Limited offers—same quality, clearer price."
        products={saleProducts}
        viewAllLink="/category/accessories"
        viewAllText="Shop sale"
      />
      <NewsletterSection />
    </>
  );
}

export default HomePage;
