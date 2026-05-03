/**
 * @fileoverview HomePage component
 * Main landing page with hero, categories, bestsellers, and social proof
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
 * Hero section with main value proposition
 */
function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(145deg,oklch(16%_0.04_265)_0%,oklch(20%_0.07_285)_42%,oklch(14%_0.03_40)_100%)] text-[oklch(96%_0.01_85)]">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-[120%] w-[55%] -skew-x-6 bg-[linear-gradient(180deg,oklch(62%_0.19_38_/_0.22),transparent)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-2/3 w-1/2 rounded-full bg-[radial-gradient(circle,oklch(55%_0.12_265_/_0.35),transparent_65%)]"
        aria-hidden
      />

      <div className="container-custom relative z-10">
        <div className="grid items-end gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="animate-hero-in space-y-8">
            <div className="inline-flex max-w-full flex-col gap-3 sm:flex-row sm:items-center">
              <span className="inline-block h-1 w-16 shrink-0 bg-primary shadow-[0_0_24px_oklch(62%_0.19_38_/_0.5)]" />
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.35em] text-primary">
                Winter drop · curated edits
              </p>
            </div>

            <h1 className="font-heading text-4xl font-extrabold leading-[0.95] tracking-tight md:text-5xl lg:text-[3.35rem]">
              The edit
              <br />
              <span className="text-[oklch(88%_0.02_85)]">you actually</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-[oklch(72%_0.16_55)] bg-clip-text text-transparent">
                wear every week.
              </span>
            </h1>

            <p className="max-w-md font-sans text-lg leading-relaxed text-[oklch(82%_0.02_85_/_0.88)]">
              A tighter catalog, honest pricing, and checkout that respects your
              time. Built for people who read labels—not just headlines.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button size="xl" className="font-heading shadow-lg shadow-primary/25" asChild>
                <Link to="/category/clothing">
                  Open the edit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-[oklch(88%_0.02_85_/_0.35)] bg-transparent font-heading text-[oklch(96%_0.01_85)] hover:bg-[oklch(96%_0.01_85_/_0.08)]"
                asChild
              >
                <Link to="/category/electronics">Browse hardware</Link>
              </Button>
            </div>

            <dl className="grid max-w-lg grid-cols-3 gap-4 border-t border-[oklch(88%_0.02_85_/_0.12)] pt-8 text-xs font-heading uppercase tracking-widest text-[oklch(78%_0.02_85_/_0.85)]">
              <div className="flex flex-col gap-2">
                <dt className="flex items-center gap-2 text-primary">
                  <Truck className="h-4 w-4" aria-hidden />
                  Ship
                </dt>
                <dd className="font-sans text-[10px] font-medium normal-case tracking-normal text-[oklch(82%_0.02_85_/_0.75)]">
                  $75+ free in the US
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="flex items-center gap-2 text-primary">
                  <Shield className="h-4 w-4" aria-hidden />
                  Pay
                </dt>
                <dd className="font-sans text-[10px] font-medium normal-case tracking-normal text-[oklch(82%_0.02_85_/_0.75)]">
                  Encrypted checkout
                </dd>
              </div>
              <div className="flex flex-col gap-2">
                <dt className="flex items-center gap-2 text-primary">
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Return
                </dt>
                <dd className="font-sans text-[10px] font-medium normal-case tracking-normal text-[oklch(82%_0.02_85_/_0.75)]">
                  30-day window
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative ml-auto aspect-[4/5] w-full max-w-md">
              <div className="absolute -inset-3 rounded-2xl border border-[oklch(88%_0.02_85_/_0.15)] bg-[oklch(22%_0.04_265_/_0.4)] backdrop-blur-sm" />
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800"
                alt="Curated fashion still life"
                className="relative z-10 h-full w-full rounded-2xl object-cover shadow-2xl ring-1 ring-[oklch(88%_0.02_85_/_0.12)]"
              />
              <div className="absolute -bottom-5 -right-2 z-20 max-w-[11rem] border border-[oklch(88%_0.02_85_/_0.2)] bg-[oklch(16%_0.04_265_/_0.92)] p-4 text-left shadow-xl backdrop-blur-md">
                <p className="font-heading text-2xl font-extrabold tracking-tight text-primary">
                  50k+
                </p>
                <p className="font-sans text-xs font-medium leading-snug text-[oklch(82%_0.02_85_/_0.85)]">
                  Members who shop the edit on repeat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * USP/Benefits bar
 */
function BenefitsBar() {
  const benefits = [
    { icon: Truck, title: "Free Shipping", desc: "On orders over $75" },
    { icon: Shield, title: "Secure Checkout", desc: "SSL encrypted" },
    { icon: RotateCcw, title: "Easy Returns", desc: "30-day policy" },
    { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
  ];

  return (
    <section className="border-b border-border/80 bg-muted/50 py-10">
      <div className="container-custom">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card shadow-sm">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-heading text-xs font-bold uppercase tracking-widest">
                  {benefit.title}
                </h4>
                <p className="mt-1 font-sans text-xs text-muted-foreground">
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
 * Categories grid section
 */
function CategoriesSection({ categories }) {
  const featuredCategories = categories.slice(0, 6);

  return (
    <section className="py-12 lg:py-16">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our wide range of products across various categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden"
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                <h3 className="font-heading text-lg lg:text-xl font-semibold text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-300">
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

function ConnectionPill({ source, error }) {
  const isLive = source === "api";

  return (
    <div className="container-custom pt-6">
      <div
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
          isLive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${isLive ? "bg-emerald-500" : "bg-amber-500"}`}
        />
        {isLive ? "Live catalog connected" : "Using demo catalog fallback"}
        {error ? <span className="hidden md:inline">({error})</span> : null}
      </div>
    </div>
  );
}

/**
 * Product grid section (reusable for bestsellers, new arrivals, etc.)
 */
function ProductSection({
  title,
  subtitle,
  products,
  viewAllLink,
  viewAllText = "View All",
}) {
  return (
    <section className="py-12 lg:py-16">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-2">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Button variant="outline" asChild>
              <Link to={viewAllLink}>
                {viewAllText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Social proof / testimonials section
 */
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah M.",
      text: "Amazing quality and fast shipping! I've been shopping here for months and never disappointed.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      rating: 5,
    },
    {
      name: "James K.",
      text: "The customer service is exceptional. They helped me find exactly what I needed.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
      rating: 5,
    },
    {
      name: "Emily R.",
      text: "Best prices I've found online, plus the 30-day return policy gives me peace of mind.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
      rating: 5,
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-muted">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold mb-3">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground">
            Join thousands of satisfied shoppers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-background p-6 rounded-xl shadow-sm">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-10 w-10 rounded-full"
                />
                <span className="font-medium">{testimonial.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 text-center">
          <div>
            <p className="text-3xl lg:text-4xl font-bold text-primary">50K+</p>
            <p className="text-muted-foreground">Happy Customers</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-bold text-primary">10K+</p>
            <p className="text-muted-foreground">Products</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-bold text-primary">99%</p>
            <p className="text-muted-foreground">Satisfaction Rate</p>
          </div>
          <div>
            <p className="text-3xl lg:text-4xl font-bold text-primary">24/7</p>
            <p className="text-muted-foreground">Customer Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Newsletter signup section
 */
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
    <section className="py-12 lg:py-16 bg-primary text-primary-foreground">
      <div className="container-custom text-center">
        <h2 className="font-heading text-3xl font-bold mb-3">
          Get 10% Off Your First Order
        </h2>
        <p className="mb-6 max-w-xl mx-auto opacity-90">
          Subscribe to our newsletter for exclusive deals, new arrivals, and
          insider-only discounts.
        </p>

        {subscribed ? (
          <p className="text-lg font-medium">
            🎉 Thanks for subscribing! Check your email for your discount code.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-foreground bg-white"
              required
            />
            <Button type="submit" variant="secondary" size="lg">
              Subscribe
            </Button>
          </form>
        )}
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
  const newArrivals = catalogProducts
    .filter((product) => product.isNew)
    .slice(0, 4);
  const saleProducts = catalogProducts
    .filter((product) => product.discount > 0)
    .slice(0, 4);

  return (
    <>
      <ConnectionPill source={source} error={error} />
      <HeroSection />
      <BenefitsBar />
      <CategoriesSection categories={categories} />
      <ProductSection
        title="Best Sellers"
        subtitle="Our most popular products based on sales"
        products={bestsellers}
        viewAllLink="/category/electronics"
      />
      <ProductSection
        title="New Arrivals"
        subtitle="Check out the latest additions to our collection"
        products={newArrivals}
        viewAllLink="/category/clothing"
      />
      <TestimonialsSection />
      <ProductSection
        title="On Sale"
        subtitle="Limited time offers you don't want to miss"
        products={saleProducts}
        viewAllLink="/category/accessories"
        viewAllText="Shop Sale"
      />
      <NewsletterSection />
    </>
  );
}

export default HomePage;
