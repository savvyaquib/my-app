import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/database/event.model";


/**
 * GET Handler for fetching a single event by its unique slug.
 * 
 * @param request - NextRequest object
 * @param context - Context containing dynamic route parameters as a Promise
 * @returns NextResponse with the event details or appropriate error message
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Establish database connection
    await dbConnect();

    // 2. Resolve parameters promise to retrieve the slug
    const { slug } = await params;

    // 3. Validate slug parameter
    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { message: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }

    // 4. Query the Event model using the slug
    const event = await Event.findOne({ slug: slug.trim().toLowerCase() });

    // 5. Handle event not found case
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug "${slug}" not found` },
        { status: 404 }
      );
    }

    // 6. Return the matching event details
    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching event by slug:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        message: "An unexpected error occurred while fetching the event",
        error: errorMessage
      },
      { status: 500 }
    );
  }
}
