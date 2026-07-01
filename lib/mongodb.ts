import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Interface to define the shape of the mongoose connection cache object.
 * This is used to persist the mongoose connection and active promise across
 * hot reloads in a development environment.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Declare global mongoose variable to satisfy TypeScript compiler.
 * We use `var` because `let` or `const` block-scoped declarations are not added
 * to the global scope.
 */
declare global {
  var mongoose: MongooseCache | undefined;
}

/**
 * Retrieve the cached connection from the global object (in development)
 * or create it if it doesn't exist yet. In production, this persists 
 * within the active container runtime instance.
 */
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose;

/**
 * Established connection handler for MongoDB using Mongoose.
 * Caches the connection to prevent open connection growth on hot reloads.
 */
async function dbConnect(): Promise<typeof mongoose> {
  // If a connection is already established and cached, return it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no connection promise in progress, initiate a new connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable command buffering to fail fast if connection drops
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    // Wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (error) {
    // If connection fails, clear the cached promise so next attempt retries
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
