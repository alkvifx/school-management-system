import cloudinary from "../config/cloudinary.js";

/**
 * Delete a file from Cloudinary using public_id
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return;
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error.message);
    // Don't throw - we don't want to crash if Cloudinary deletion fails
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {string[]} publicIds - Array of Cloudinary public_ids
 * @returns {Promise<void>}
 */
export const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      return;
    }
    await cloudinary.api.delete_resources(publicIds);
  } catch (error) {
    console.error("Error deleting multiple files from Cloudinary:", error.message);
  }
};
