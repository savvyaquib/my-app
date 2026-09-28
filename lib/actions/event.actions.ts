"use server";

import Event from "@/database/event.model";
import dbConnect from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await dbConnect();

    // Single aggregation pipeline instead of two sequential queries
    const similarEvents = await Event.aggregate([
      // Stage 1: Find the source event by slug
      { $match: { slug } },
      // Stage 2: Lookup similar events that share tags, excluding the source
      {
        $lookup: {
          from: "events",
          let: { sourceTags: "$tags", sourceId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ["$_id", "$$sourceId"] },
                    { $gt: [{ $size: { $setIntersection: ["$tags", "$$sourceTags"] } }, 0] },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 3 },
          ],
          as: "similar",
        },
      },
      // Stage 3: Unwind to get individual similar events
      { $unwind: "$similar" },
      { $replaceRoot: { newRoot: "$similar" } },
    ]);

    // Convert ObjectIds to strings to avoid serialization issues
    return JSON.parse(JSON.stringify(similarEvents));
  } catch {
    return [];
  }
};

export const getAllEvents = async () => {
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
  try {
    await dbConnect();
    const event = await Event.findOne({ slug }).lean();
    return event ? JSON.parse(JSON.stringify(event)) : null;
  } catch (error) {
    console.error(`Error fetching event by slug (${slug}):`, error);
    return null;
  }
};
