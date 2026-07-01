import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
  try {
    await dbConnect(); // Ensure the database connection is established
    const formData = await req.formData();

    let event;

    try {
      const eventData = Object.fromEntries(formData.entries());
      event = JSON.parse(eventData.event as string);
    } catch (e) {
      console.error("Error parsing event data:", e);
      return NextResponse.json(
        {
          message: "Event creation failed",
          error: e instanceof Error ? e.message : "Unknown error",
        },
        { status: 400 },
      );
    }

    const createdEvent = await Event.create(event);

    return NextResponse.json(
      {
        message: "Event created successfully",
        event: createdEvent,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("Error parsing request body:", e);
    return NextResponse.json(
      {
        message: "Event creation failed",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
