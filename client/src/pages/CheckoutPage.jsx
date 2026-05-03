/**
 * @fileoverview CheckoutPage component
 * Multi-step checkout with shipping, payment, and confirmation
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  CreditCard,
  Truck,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { guestCheckoutApi } from "@/lib/storefront";
import { cn, formatPrice } from "@/lib/utils";

/**
 * Progress stepper component
 */
function CheckoutStepper({ currentStep }) {
  const steps = [
    { id: 1, name: "Shipping" },
    { id: 2, name: "Payment" },
    { id: 3, name: "Review" },
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors",
                currentStep > step.id
                  ? "bg-success text-white"
                  : currentStep === step.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
            </div>
            <span
              className={cn(
                "ml-2 text-sm font-medium hidden sm:inline",
                currentStep >= step.id
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-12 sm:w-24 h-1 mx-2 sm:mx-4",
                currentStep > step.id ? "bg-success" : "bg-muted",
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/**
 * Order summary sidebar
 */
function OrderSummarySidebar({ items, subtotal, hasFreeShipping, serverTotals }) {
  const shipping = serverTotals
    ? serverTotals.shippingAmount
    : hasFreeShipping
      ? 0
      : 9.99;
  const tax = serverTotals ? serverTotals.taxAmount : subtotal * 0.08;
  const total = serverTotals ? serverTotals.total : subtotal + shipping + tax;

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Order Summary</h3>

      {/* Items preview */}
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                Qty: {item.quantity}
              </p>
            </div>
            <p className="text-sm font-medium">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span
            className={
              serverTotals
                ? shipping <= 0
                  ? "text-success"
                  : ""
                : hasFreeShipping
                  ? "text-success"
                  : ""
            }
          >
            {serverTotals
              ? shipping <= 0
                ? "FREE"
                : formatPrice(shipping)
              : hasFreeShipping
                ? "FREE"
                : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatPrice(tax)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      {/* Trust badges */}
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span>Your payment is secured with SSL encryption</span>
        </div>
      </div>
    </Card>
  );
}

/**
 * Shipping form step
 */
function ShippingStep({ formData, setFormData, onNext }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Shipping Information
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="address">Street Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          required
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="zip">ZIP Code *</Label>
          <Input
            id="zip"
            value={formData.zip}
            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Shipping method */}
      <div className="border rounded-lg p-4 mt-6">
        <h3 className="font-medium mb-3">Shipping Method</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="shipping"
              value="standard"
              checked={formData.shippingMethod === "standard"}
              onChange={(e) =>
                setFormData({ ...formData, shippingMethod: e.target.value })
              }
              className="text-primary"
            />
            <div className="flex-1">
              <p className="font-medium">Standard Shipping</p>
              <p className="text-sm text-muted-foreground">5-7 business days</p>
            </div>
            <span className="font-medium">FREE</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="shipping"
              value="express"
              checked={formData.shippingMethod === "express"}
              onChange={(e) =>
                setFormData({ ...formData, shippingMethod: e.target.value })
              }
              className="text-primary"
            />
            <div className="flex-1">
              <p className="font-medium">Express Shipping</p>
              <p className="text-sm text-muted-foreground">2-3 business days</p>
            </div>
            <span className="font-medium">$14.99</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" type="button" asChild>
          <Link to="/cart">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
        </Button>
        <Button type="submit">
          Continue to Payment
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}

/**
 * Payment form step
 */
function PaymentStep({ formData, setFormData, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment Information
        </h2>
      </div>

      <div className="border rounded-lg p-4 bg-muted/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number *</Label>
            <Input
              id="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={(e) =>
                setFormData({ ...formData, cardNumber: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="cardName">Name on Card *</Label>
            <Input
              id="cardName"
              value={formData.cardName}
              onChange={(e) =>
                setFormData({ ...formData, cardName: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date *</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={(e) =>
                  setFormData({ ...formData, expiry: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={(e) =>
                  setFormData({ ...formData, cvv: e.target.value })
                }
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Billing address */}
      <div className="border rounded-lg p-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.sameAsShipping}
            onChange={(e) =>
              setFormData({ ...formData, sameAsShipping: e.target.checked })
            }
            className="rounded text-primary"
          />
          <span className="text-sm">Billing address same as shipping</span>
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" type="button" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button type="submit">
          Review Order
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}

/**
 * Review step
 */
function ReviewStep({
  formData,
  items,
  subtotal,
  hasFreeShipping,
  serverTotals,
  isSubmitting,
  onBack,
  onComplete,
}) {
  const shipping = serverTotals
    ? serverTotals.shippingAmount
    : formData.shippingMethod === "express"
      ? 14.99
      : hasFreeShipping
        ? 0
        : 9.99;
  const tax = serverTotals ? serverTotals.taxAmount : subtotal * 0.08;
  const total = serverTotals ? serverTotals.total : subtotal + shipping + tax;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold mb-4">
          Review Your Order
        </h2>
      </div>

      {/* Shipping info */}
      <Card className="p-4">
        <h3 className="font-medium mb-2">Shipping Address</h3>
        <p className="text-muted-foreground text-sm">
          {formData.firstName} {formData.lastName}
          <br />
          {formData.address}
          <br />
          {formData.city}, {formData.state} {formData.zip}
        </p>
      </Card>

      {/* Payment info */}
      <Card className="p-4">
        <h3 className="font-medium mb-2">Payment Method</h3>
        <p className="text-muted-foreground text-sm">
          Card ending in {formData.cardNumber.slice(-4) || "****"}
        </p>
      </Card>

      {/* Items */}
      <Card className="p-4">
        <h3 className="font-medium mb-4">Order Items</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {shipping <= 0 ? "FREE" : formatPrice(shipping)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          size="lg"
          disabled={isSubmitting}
          onClick={() => void onComplete()}
        >
          <Lock className="h-4 w-4 mr-2" />
          {isSubmitting ? "Placing order…" : "Place Order"}
        </Button>
      </div>
    </div>
  );
}

/**
 * CheckoutPage component
 * @returns {JSX.Element} Checkout page
 */
function buildGuestCheckoutPayload(formData) {
  const shippingAddress = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    address1: formData.address,
    city: formData.city,
    state: formData.state,
    postalCode: formData.zip,
    country: "US",
    phone: formData.phone || undefined,
    email: formData.email,
  };
  const billingAddress =
    formData.sameAsShipping !== false
      ? { ...shippingAddress }
      : { ...shippingAddress };

  return {
    customerEmail: formData.email,
    shippingAddress,
    billingAddress,
  };
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { session } = useUser();
  const {
    items,
    subtotal,
    hasFreeShipping,
    clearCart,
    serverMode,
    serverTotals,
  } = useCart();
  const [step, setStep] = useState(1);
  const [isCompletingOrder, setIsCompletingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    shippingMethod: "standard",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    sameAsShipping: true,
  });

  const handleComplete = async () => {
    setCheckoutError("");
    setIsCompletingOrder(true);
    try {
      if (serverMode) {
        const idempotencyKey = crypto.randomUUID();
        const payload = buildGuestCheckoutPayload(formData);
        const res = await guestCheckoutApi(
          session?.accessToken ?? null,
          payload,
          idempotencyKey,
        );
        await clearCart();
        navigate(
          `/order-confirmation/${encodeURIComponent(res.orderNumber)}?token=${encodeURIComponent(res.confirmationToken)}`,
        );
        return;
      }
      const orderNumber = `SS-${Date.now().toString(36).toUpperCase()}`;
      navigate(`/order-confirmation/${orderNumber}`);
      await clearCart();
    } catch (e) {
      setCheckoutError(
        e instanceof Error ? e.message : "Checkout failed. Try again.",
      );
    } finally {
      setIsCompletingOrder(false);
    }
  };

  if (items.length === 0 && !isCompletingOrder) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Breadcrumb */}
      <div className="bg-white border-b py-4">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link
              to="/cart"
              className="text-muted-foreground hover:text-primary"
            >
              Cart
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <CheckoutStepper currentStep={step} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {step === 1 && (
                <ShippingStep
                  formData={formData}
                  setFormData={setFormData}
                  onNext={() => setStep(2)}
                />
              )}
              {step === 2 && (
                <PaymentStep
                  formData={formData}
                  setFormData={setFormData}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <ReviewStep
                  formData={formData}
                  items={items}
                  subtotal={subtotal}
                  hasFreeShipping={hasFreeShipping}
                  serverTotals={serverMode ? serverTotals : null}
                  isSubmitting={isCompletingOrder}
                  onBack={() => setStep(2)}
                  onComplete={handleComplete}
                />
              )}
              {checkoutError && (
                <p className="text-sm text-destructive mt-4 px-1">{checkoutError}</p>
              )}
            </Card>
          </div>

          {/* Order summary */}
          <div className="hidden lg:block">
            <OrderSummarySidebar
              items={items}
              subtotal={subtotal}
              hasFreeShipping={hasFreeShipping}
              serverTotals={serverMode ? serverTotals : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
