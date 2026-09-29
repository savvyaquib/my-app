import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/database/event.model";

/**
 * GET Handler for fetching a single event by its unique slug.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const { slug } = await params;

    const event = await Event.findOne({ slug: slug.toLowerCase() }).lean();

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug "${slug}" not found` },
        { status: 404 }
      );
    }

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
