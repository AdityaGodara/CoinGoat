"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DURATION } from "@/lib/motion/easings";

interface NewsletterFormProps {
  variant?: "compact" | "large";
}

export function NewsletterForm({ variant = "compact" }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.p
          key="success"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.medium }}
          className={`font-medium text-accent ${variant === "large" ? "text-base" : "text-sm"}`}
        >
          You&apos;re subscribed. Watch your inbox.
        </motion.p>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DURATION.medium }}
          onSubmit={handleSubmit}
          className={variant === "large" ? "flex flex-col gap-3 sm:flex-row" : "flex items-center gap-2"}
        >
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            placeholder="you@example.com"
            aria-label="Email address"
            className="min-w-0 flex-1"
          />
          <Button type="submit" size={variant === "large" ? "md" : "sm"} variant="primary">
            Subscribe
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
