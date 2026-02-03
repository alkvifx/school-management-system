/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - Text to convert to slug
 * @param {string} schoolId - School ID to make slug unique
 * @returns {string} - Generated slug
 */
export const generateSlug = (text, schoolId) => {
  if (!text) {
    throw new Error("Text is required for slug generation");
  }

  // Convert to lowercase and replace spaces/special chars with hyphens
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\]]/g, "") // Remove brackets
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  // Add school ID to make it unique
  if (schoolId) {
    slug = `${slug}-${schoolId.toString().slice(-6)}`;
  }

  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString().slice(-6);
  slug = `${slug}-${timestamp}`;

  return slug;
};
