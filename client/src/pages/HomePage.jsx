/**
 * @fileoverview HomePage component
 * Main landing page with hero, categories, bestsellers, and social proof
 */

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { categories } from "@/data/categories";
import { getBestsellers, getNewArrivals, getSaleProducts } from "@/data/products";

/**
 * Hero section with main value proposition
 */
function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <span className="animate-pulse-slow">🔥</span>
              New Collection Available
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Discover Your{" "}
              <span className="text-primary">Perfect Style</span>
            </h1>
            
            <p className="text-lg text-gray-300 max-w-lg">
              Shop the latest trends with free shipping on orders over $75. 
              Quality products, competitive prices, and exceptional service.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="xl" asChild>
                <Link to="/category/clothing">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                <Link to="/category/electronics">
                  Explore Categories
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Free Shipping
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Secure Payment
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" />
                Easy Returns
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-3xl transform rotate-6" />
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800"
                alt="Fashion collection"
                className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl"
              />
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-white text-slate-900 p-4 rounded-xl shadow-xl z-20">
                <p className="text-2xl font-bold text-primary">50K+</p>
                <p className="text-sm text-gray-600">Happy Customers</p>
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
    <section className="py-8 border-b">
      <div className="container-custom">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{benefit.title}</h4>
                <p className="text-xs text-muted-foreground">{benefit.desc}</p>
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
function CategoriesSection() {
  const featuredCategories = categories.slice(0, 6);

  return (
    <section className="py-12 lg:py-16">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl font-bold mb-3">Shop by Category</h2>
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
                <p className="text-sm text-gray-300">{category.productCount} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Product grid section (reusable for bestsellers, new arrivals, etc.)
 */
function ProductSection({ title, subtitle, products, viewAllLink, viewAllText = "View All" }) {
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
          <h2 className="font-heading text-3xl font-bold mb-3">What Our Customers Say</h2>
          <p className="text-muted-foreground">Join thousands of satisfied shoppers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-background p-6 rounded-xl shadow-sm">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
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
        <h2 className="font-heading text-3xl font-bold mb-3">Get 10% Off Your First Order</h2>
        <p className="mb-6 max-w-xl mx-auto opacity-90">
          Subscribe to our newsletter for exclusive deals, new arrivals, and insider-only discounts.
        </p>
        
        {subscribed ? (
          <p className="text-lg font-medium">🎉 Thanks for subscribing! Check your email for your discount code.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
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
  const bestsellers = getBestsellers(4);
  const newArrivals = getNewArrivals(4);
  const saleProducts = getSaleProducts(4);

  return (
    <>
      <HeroSection />
      <BenefitsBar />
      <CategoriesSection />
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
