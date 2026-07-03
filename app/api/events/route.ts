import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

cloudinary.config({ secure: true });

export const runtime = "nodejs";

type EventPayload = Record<string, unknown>;

type ResponseError = {
  message?: string;
  http_code?: number;
  code?: number;
  name?: string;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ResponseError).message === "string"
  ) {
    return (error as ResponseError).message;
  }

  return "Unknown error";
}

function getErrorStatus(error: unknown) {
  if (error instanceof Error && error.name === "ValidationError") {
    return 400;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as ResponseError).code === 11000
  ) {
    return 409;
  }

  return 500;
}

function normalizeListField(event: EventPayload, key: "tags" | "agenda") {
  const value = event[key];

  if (typeof value !== "string") {
    return;
  }

  try {
    event[key] = JSON.parse(value);
  } catch {
    event[key] = value.split(",").map((item) => item.trim());
  }
}

function getImageExtension(file: File) {
  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };

  return extensionByType[file.type] ?? "png";
}

async function saveImageLocally(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  const fileName = `${randomUUID()}.${getImageExtension(file)}`;

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, fileName), buffer);

  return `/uploads/${fileName}`;
}

async function uploadImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResult = await new Promise<{ secure_url?: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "DevEvent",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(result ?? {});
          },
        )
        .end(buffer);
    },
  );

  if (!uploadResult.secure_url) {
    throw new Error("Cloudinary upload did not return an image URL");
  }

  return uploadResult.secure_url;
}

async function getImageUrl(file: File) {
  try {
    return await uploadImage(file);
  } catch (error) {
    console.error("Error uploading event image to Cloudinary:", error);
    return saveImageLocally(file);
  }
}

export async function POST(req: NextRequest) {
  let event: EventPayload;
  let imageFile: File | null = null;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      event = await req.json();
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await req.formData();
      const eventData = Object.fromEntries(formData.entries());
      const imageEntry = eventData.image;

      imageFile =
        imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;

      if (eventData.event) {
        try {
          event = JSON.parse(eventData.event.toString());
        } catch (e) {
          console.error("Error parsing event data:", e);
          return NextResponse.json(
            {
              message: "Event creation failed",
              error: getErrorMessage(e),
            },
            { status: 400 },
          );
        }
      } else {
        event = { ...eventData };
        delete event.image;
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

    if (!imageFile && typeof event.image !== "string") {
      return NextResponse.json(
        {
          message: "Event creation failed",
          error: "Image file or image URL is required",
        },
        { status: 400 },
      );
    }

    normalizeListField(event, "tags");
    normalizeListField(event, "agenda");

    await dbConnect();

    if (imageFile) {
      try {
        event.image = await getImageUrl(imageFile);
      } catch (e) {
        console.error("Error uploading event image:", e);
        return NextResponse.json(
          {
            message: "Image upload failed",
            error: getErrorMessage(e),
          },
          { status: 502 },
        );
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
    const status = getErrorStatus(e);

    return NextResponse.json(
      {
        message: "Event creation failed",
        error: getErrorMessage(e),
      },
      { status },
    );
  }
}
