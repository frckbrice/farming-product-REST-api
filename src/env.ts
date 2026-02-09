/**
 * Load env and normalize Cloudinary URL before any controller (and thus cloudinary) is imported.
 * The Cloudinary SDK validates CLOUDINARY_URL on load and throws if it is set but does not
 * start with "cloudinary://". When using separate CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET,
 * we build CLOUDINARY_URL here so the SDK does not throw.
 */
import dotenv from "dotenv";

dotenv.config();

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_URL,
} = process.env;

if (
  CLOUDINARY_CLOUD_NAME &&
  CLOUDINARY_API_KEY &&
  CLOUDINARY_API_SECRET &&
  (!CLOUDINARY_URL || !String(CLOUDINARY_URL).toLowerCase().startsWith("cloudinary://"))
) {
  process.env.CLOUDINARY_URL = `cloudinary://${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}@${CLOUDINARY_CLOUD_NAME}`;
}
