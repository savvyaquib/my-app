"use server";

import Event from "@/database/event.model";
import dbConnect from "../mongodb";
import { connection } from "next/server";

export const getSimilarEventsBySlug = async (slug: string) => {
  await connection();
  try {
    await dbConnect();

    const event = await Event.findOne({ slug });

    if (!event) return [];

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    
    // Convert ObjectIds to strings to avoid serialization issues
    return JSON.parse(JSON.stringify(similarEvents));
  } catch {
    return [];
  }
};

export const getAllEvents = async () => {
  await connection();
  try {
    await dbConnect();
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(events));
  } catch (error) {
    console.error("Error fetching all events:", error);
    return [];
  }
};

export const getEventBySlug = async (slug: string) => {
  await connection();
  try {
    await dbConnect();
    const event = await Event.findOne({ slug }).lean();
    return event ? JSON.parse(JSON.stringify(event)) : null;
  } catch (error) {
    console.error(`Error fetching event by slug (${slug}):`, error);
    return null;
  }
};
