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
    const booking = (await Booking.create({ eventId, slug, email })).lean();

    return { success: true, booking };
  } catch (error) {
    console.error("Failed to book event", error);
    return { success: false, error: error };
  }
};
