"use client";
import { createBooking } from "@/lib/actions/booking.actions";
import { type FormEvent, useState } from "react";
import posthog from "posthog-js";

export const BookEvent = ({
  eventId,
  slug,
}: {
  eventId: string;
  slug: string;
}) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const { success } = await createBooking({ eventId, email });

    if (success) {
      setSubmitted(true);

      posthog.capture("event_booked", { eventId, slug, email });
    } else {
      console.error("Failed to book event");

      posthog.captureException("Failed to book event");
    }
  };
  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          <button type="submit" className="button-submit">
            Book
          </button>
        </form>
      )}
    </div>
  );
};
