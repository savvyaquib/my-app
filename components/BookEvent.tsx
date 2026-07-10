"use client";
import { createBooking } from "@/lib/actions/booking.actions";
import { useState } from "react";
import React from "react";

export const BookEvent = ({eventId, slug}: {eventId: string, slug: string}) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    const {success, error} = await createBooking({ eventId, slug, email });

    if(success) {
        setSubmitted(true)
    }else {
      console.error("Failed to book event", error);
    }

    e.preventDefault();

    setTimeout(() => {
      setSubmitted(true);
    }, 1000);
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
              placeholder="Enter your email addresss"
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
