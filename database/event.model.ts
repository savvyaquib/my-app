import { Schema, model, models, HydratedDocument } from 'mongoose';

/**
 * Interface representing the structure of an Event document.
 */
export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Reusable validator to ensure string fields are not empty or solely whitespace.
 */
const nonEmptyStringValidator = {
  validator: (v: string) => v.trim().length > 0,
  message: 'Field cannot be empty or contain only whitespace'
};

/**
 * Reusable validator to ensure array fields are not empty and contain non-empty strings.
 */
const nonEmptyArrayValidator = {
  validator: (v: string[]) => Array.isArray(v) && v.length > 0 && v.every(str => typeof str === 'string' && str.trim().length > 0),
  message: 'Must be a non-empty array containing only non-empty strings'
};

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      validate: nonEmptyStringValidator
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      validate: nonEmptyStringValidator
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      validate: nonEmptyStringValidator
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      validate: nonEmptyStringValidator
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      validate: nonEmptyStringValidator
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      validate: nonEmptyStringValidator
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
      validate: nonEmptyStringValidator
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
      validate: nonEmptyStringValidator
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      trim: true,
      validate: nonEmptyStringValidator
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
      validate: nonEmptyStringValidator
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: nonEmptyArrayValidator
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
      validate: nonEmptyStringValidator
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: nonEmptyArrayValidator
    }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt fields
  }
);

/**
 * Helper utility to normalize time strings (e.g. '2:30 PM' or '14:30') to a consistent 24-hour HH:MM format.
 */
function normalizeTime(timeStr: string): string {
  const clean = timeStr.trim().toUpperCase();

  // Match 12-hour format (e.g., "2:30 PM", "02:30 PM", "2 PM", "12 AM")
  const match12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const ampm = match12[3];

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid hour/minute values in AM/PM format');
    }

    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // Match 24-hour format (e.g., "14:30", "02:30", "14:30:00")
  const match24 = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid hour/minute values in 24-hour format');
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  throw new Error('Unsupported time format. Use standard 24h format (HH:MM) or 12h format (HH:MM AM/PM).');
}

/**
 * Pre-save middleware to handle slug generation, date validation & normalization, and time consistency.
 */
EventSchema.pre('save', async function (this: HydratedDocument<IEvent>) {
  // 1. Generate URL-friendly slug from title only when the title is new or has changed
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .normalize('NFD') // Decompose combined graphemes to separate diacritics
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric, non-space, non-hyphen characters
      .replace(/[\s_]+/g, '-') // Replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // 2. Validate and normalize date to standard ISO format
  if (this.isModified('date')) {
    const parsedDate = new Date(this.date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date string: "${this.date}". Must be a format recognizable by JavaScript's Date constructor.`);
    }
    this.date = parsedDate.toISOString();
  }

  // 3. Validate and normalize time to consistent 24-hour HH:MM format
  if (this.isModified('time')) {
    try {
      this.time = normalizeTime(this.time);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`Time validation failed: ${message}`);
    }
  }
});

const Event = models.Event || model<IEvent>('Event', EventSchema);
export default Event;
