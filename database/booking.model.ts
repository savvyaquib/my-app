import { Schema, model, models, HydratedDocument, Types } from 'mongoose';
import Event from './event.model';

/**
 * Interface representing the structure of a Booking document.
 */
export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true // Index added to ensure faster queries when querying bookings by event
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        // Validates standard email address formats using a regex pattern
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: (props: { value: string }) => `"${props.value}" is not a valid email address!`
      }
    }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt fields
  }
);

/**
 * Pre-save middleware to verify if the referenced Event actually exists.
 */
BookingSchema.pre('save', async function (this: HydratedDocument<IBooking>) {
  // Only verify the Event ID exists if it has been modified (or is new)
  if (this.isModified('eventId')) {
    const eventExists = await Event.exists({ _id: this.eventId });
    if (!eventExists) {
      throw new Error(`Referenced Event with ID "${this.eventId}" does not exist.`);
    }
  }
});

const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);
export default Booking;
