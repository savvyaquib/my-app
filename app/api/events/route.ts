import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ secure: true });

export const runtime = "nodejs";

async function uploadImageToCloudinary(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "DevEvent", resource_type: "image" },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve(result.secure_url);
        }
      }
    ).end(buffer);
  });
}

const parseList = (val: unknown) => {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val !== "string") return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }
};

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const contentType = req.headers.get("content-type") || "";
    let eventData: Record<string, any> = {};
    let imageFile: File | null = null;

    if (contentType.includes("application/json")) {
      eventData = await req.json();
    } else if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      eventData = Object.fromEntries(formData.entries());
      if (eventData.image instanceof File && eventData.image.size > 0) {
        imageFile = eventData.image;
      }
      delete eventData.image;

      if (eventData.event) {
        Object.assign(eventData, JSON.parse(eventData.event as string));
        delete eventData.event;
      }
    } else {
      return NextResponse.json({ message: "Event creation failed", error: "Unsupported Content-Type" }, { status: 400 });
    }

    if (!Object.keys(eventData).length) {
      return NextResponse.json({ message: "Event creation failed", error: "Request body is empty" }, { status: 400 });
    }

    if (!imageFile && typeof eventData.image !== "string") {
      return NextResponse.json({ message: "Event creation failed", error: "Image is required" }, { status: 400 });
    }

    eventData.tags = parseList(eventData.tags);
    eventData.agenda = parseList(eventData.agenda);

    if (imageFile) {
      eventData.image = await uploadImageToCloudinary(imageFile);
    }

    const event = await Event.create(eventData);
    return NextResponse.json({ message: "Event created successfully", event }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    const status = error.name === "ValidationError" ? 400 : error.code === 11000 ? 409 : 500;
    return NextResponse.json({ message: "Event creation failed", error: error.message || "Unknown error" }, { status });
  }
}
