import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

/**
 * Creates Super Admin user if it doesn't exist
 * Uses credentials from environment variables
 * Called automatically on server startup after DB connection
 *
 * @returns {Promise<void>}
 */
export const createSuperAdminIfNotExists = async () => {
  try {
    // Get Super Admin credentials from environment variables
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME || "Super Admin";

    // Validate required environment variables
    if (!superAdminEmail || !superAdminPassword) {
      console.warn(
        "⚠️  SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set in .env"
      );
      console.warn("⚠️  Super Admin will not be created. Set these variables to enable Super Admin.");
      return;
    }

    // Check if Super Admin already exists
    const existingSuperAdmin = await User.findOne({
      email: superAdminEmail.toLowerCase(),
      role: "SUPER_ADMIN",
    });

    if (existingSuperAdmin) {
      console.log("✅ Super Admin already exists in database");
      return;
    }

    // Check if any Super Admin exists (safety check - only one Super Admin allowed)
    const anySuperAdmin = await User.findOne({ role: "SUPER_ADMIN" });
    if (anySuperAdmin) {
      console.log("✅ Super Admin already exists in database (different email)");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    // Create Super Admin
    const superAdmin = await User.create({
      name: superAdminName.trim(),
      email: superAdminEmail.toLowerCase().trim(),
      password: hashedPassword,
      role: "SUPER_ADMIN",
      schoolId: null, // Super Admin has no school
      isActive: true,
    });

    console.log(`✅ Super Admin created successfully: ${superAdmin.email}`);
  } catch (error) {
    // Log error but don't crash the server
    console.error("❌ Error creating Super Admin:", error.message);
    // In production, you might want to exit here, but for safety we continue
    // Uncomment the line below if you want server to exit on Super Admin creation failure
    // process.exit(1);
  }
};
