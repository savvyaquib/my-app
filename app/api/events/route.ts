import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
  try {
    await dbConnect(); // Ensure the database connection is established

    const contentType = req.headers.get("content-type") || "";
    let event: any = null;

    if (contentType.includes("application/json")) {
      event = await req.json();
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await req.formData();
      const eventData = Object.fromEntries(formData.entries());

      const file = formData.get('image') as File;

      if (!file) return NextResponse.json({ message: "Image is required" }, { status: 400 });

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary using upload_stream wrapped in a Promise
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'DevEvent',
            resource_type: 'auto',    // Automatically detect file type (image, video, etc.)
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer); // Send the buffer payload
      });

      event.image = (uploadResult as { secure_url: string }).secure_url;

      if (eventData.event) {
        try {
          event = JSON.parse(eventData.event as string);
        } catch (e) {
          event = eventData;
        }
      } else {
        event = eventData;
      }
    } else {
      return NextResponse.json(
        {
          message: "Unsupported Content-Type",
          error: `Content-Type must be application/json, multipart/form-data, or application/x-www-form-urlencoded. Got: ${contentType}`,
        },
        { status: 400 },
      );
    }

    if (!event || Object.keys(event).length === 0) {
      return NextResponse.json(
        {
          message: "Event creation failed",
          error: "Request body or event data is empty",
        },
        { status: 400 },
      );
    }

    // Normalize tags and agenda if they are sent as strings instead of arrays
    if (event.tags && typeof event.tags === "string") {
      try {
        event.tags = JSON.parse(event.tags);
      } catch {
        event.tags = event.tags.split(",").map((t: string) => t.trim());
      }
    }

    if (event.agenda && typeof event.agenda === "string") {
      try {
        event.agenda = JSON.parse(event.agenda);
      } catch {
        event.agenda = event.agenda.split(",").map((a: string) => a.trim());
      }
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
    console.error("Error creating event:", e);
    return NextResponse.json(
      {
        message: "Event creation failed",
        error: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
