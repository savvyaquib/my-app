"use server";

import dbConnect from "../mongodb";
import Booking from "@/database/booking.model";

export const createBooking = async ({
  eventId,
  email,
}: {
  eventId: string;
  email: string;
}) => {
  try {
    await dbConnect();
    await Booking.create({ eventId, email });

    return { success: true };
  } catch (error) {
    console.error("Failed to book event", error);
    return { success: false };
  }
};
