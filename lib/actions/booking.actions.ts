"use server";

import dbConnect from "../mongodb";
import Booking from "@/database/booking.model";

export const createBooking = async ({
  eventId,
  slug,
  email,
}: {
  eventId: string;
  slug: string;
  email: string;
}) => {
  try {
    await dbConnect();
    await Booking.create({ eventId, slug, email });

    return { success: true };
  } catch (error) {
    console.error("Failed to book event", error);
    return { success: false };
  }
};
