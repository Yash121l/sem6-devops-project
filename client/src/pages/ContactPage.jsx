/**
 * @fileoverview Contact page — editorial layout, lightweight enquiry form
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Clock, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.message.trim()) return;
    setSent(true);
  };

  return (
    <div className="border-b border-border/80 bg-muted/30">
      <div className="border-b border-border/60 bg-background py-3">
        <div className="container-custom">
          <nav className="flex items-center gap-2 font-sans text-sm text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-foreground">Contact</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 font-heading text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
            Contact
          </p>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Let&apos;s talk
          </h1>
          <p className="mt-4 font-sans text-lg leading-relaxed text-muted-foreground">
            Orders, sizing, or partnerships — send a note and we&apos;ll reply
            within one business day.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-3">
          <Card className="border-border/70 p-6 text-center shadow-none transition-[border-color,box-shadow] duration-200 ease-out hover:border-primary/20 hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border/70 bg-background">
              <Mail className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <h2 className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Email
            </h2>
            <a
              href="mailto:hello@shopsmart.com"
              className="mt-2 inline-block font-sans text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              hello@shopsmart.com
            </a>
          </Card>
          <Card className="border-border/70 p-6 text-center shadow-none transition-[border-color,box-shadow] duration-200 ease-out hover:border-primary/20 hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border/70 bg-background">
              <Clock className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <h2 className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Response
            </h2>
            <p className="mt-2 font-sans text-sm text-muted-foreground">
              Typically under 24 hours, weekdays.
            </p>
          </Card>
          <Card className="border-border/70 p-6 text-center shadow-none transition-[border-color,box-shadow] duration-200 ease-out hover:border-primary/20 hover:shadow-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border/70 bg-background">
              <MessageSquare className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <h2 className="font-heading text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Studio
            </h2>
            <p className="mt-2 font-sans text-sm text-muted-foreground">
              Remote-first · US shipping
            </p>
          </Card>
        </div>

        <Card className="mx-auto mt-12 max-w-xl border-border/70 p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
                Thanks — we&apos;ve received your message.
              </p>
              <p className="mt-2 font-sans text-sm text-muted-foreground">
                We&apos;ll get back to you at {form.email}.
              </p>
              <Button className="mt-6" variant="outline" asChild>
                <Link to="/">Back to shop</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  className="mt-1.5"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  required
                  className="mt-1.5"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="contact-message">Message *</Label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  className="mt-1.5 flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 font-sans text-sm ring-offset-background transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="How can we help?"
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                Send message
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center font-sans text-xs text-muted-foreground">
                This demo stores nothing on a server — use email for real
                enquiries.
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ContactPage;
