/**
 * @fileoverview OrderConfirmationPage component
 * Success page after completing checkout (server-backed when token present)
 */

import React, { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { fetchGuestOrderConfirmation } from "@/lib/storefront";
import { formatPrice } from "@/lib/utils";

/**
 * OrderConfirmationPage component
 * @returns {JSX.Element} Order confirmation page
 */
export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { isAuthenticated } = useUser();
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!orderId || !token) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchGuestOrderConfirmation(orderId, token);
        if (!cancelled) {
          setSummary(data);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : "Could not load order details.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, token]);

  const displayOrderNumber = summary?.orderNumber ?? orderId ?? "—";
  const showServerDetails = Boolean(summary && !loadError);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-muted/30 py-12">
      <Card className="max-w-lg w-full mx-4 p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>

        <h1 className="font-heading text-2xl font-bold mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-6">
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>

        {loadError && (
          <p className="text-sm text-destructive mb-4">{loadError}</p>
        )}

        <div className="bg-muted rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">Order Number</p>
          <p className="text-xl font-mono font-bold">{displayOrderNumber}</p>
        </div>

        {showServerDetails && (
          <div className="text-left text-sm space-y-2 mb-6 border rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">
                {formatPrice(Number(summary.total))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize">{summary.status}</span>
            </div>
          </div>
        )}

        <div className="space-y-3 text-left mb-8">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Confirmation Email Sent</p>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent an order confirmation to your email address.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Estimated Delivery</p>
              <p className="text-sm text-muted-foreground">
                Your order will arrive in 5-7 business days.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button size="lg" className="w-full" asChild>
            <Link to="/">
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          {isAuthenticated ? (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/account/orders">View Order History</Link>
            </Button>
          ) : (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/">Back to home</Link>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export default OrderConfirmationPage;
