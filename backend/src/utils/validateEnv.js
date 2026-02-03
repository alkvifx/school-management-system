// Simple env validation utility to warn about missing configuration
// - Critical missing vars will cause the process to exit (DB, JWT)
// - Recommended ones will be logged as warnings but will not crash the process

const REQUIRED_CRITICAL = ["MONGO_URI", "JWT_SECRET"];
const RECOMMENDED = [
  "CLIENT_URL",
  "EMAIL_USER or SMTP_USER",
  "EMAIL_APP_PASSWORD or SMTP_PASS",
  "OPENAI_API_KEY",
];

export const validateEnv = () => {
  const missingCritical = REQUIRED_CRITICAL.filter((key) => !process.env[key]);

  if (missingCritical.length) {
    console.error("❌ Critical environment variables missing:", missingCritical.join(", "));
    console.error("Please set those variables in your environment (Render dashboard or .env).");
    // It's unsafe to continue without DB or JWT secret
    process.exit(1);
  }

  // Ensure a default dev client URL exists to allow localhost testing
  if (!process.env.CLIENT_URL && !process.env.CLIENT_URL_DEV) {
    process.env.CLIENT_URL_DEV = "http://localhost:3000"; // safe default for local dev
    console.warn("⚠️ CLIENT_URL not set. Defaulting CLIENT_URL_DEV to http://localhost:3000 for development.");
  }

  // Build CLIENT_URLS from comma-separated list or combine production and dev URLs
  if (!process.env.CLIENT_URLS) {
    const urls = [process.env.CLIENT_URL, process.env.CLIENT_URL_DEV]
      .filter(Boolean)
      .join(",");
    process.env.CLIENT_URLS = urls;
  }

  // Check recommended vars
  const missingRecommended = RECOMMENDED.filter((key) => {
    if (key.includes(" or ")) {
      const parts = key.split(" or ").map((s) => s.trim());
      return !parts.some((p) => !!process.env[p]);
    }
    return !process.env[key];
  });

  if (missingRecommended.length) {
    console.warn("⚠️ Recommended environment variables missing (email or client config):", missingRecommended.join(", "));
    console.warn("The app will continue but some features (email, OAuth, cross-origin configs) may not work correctly in production.");
  }

  // For safety, log NODE_ENV and PORT (non-sensitive)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Server port: ${process.env.PORT || 5000}`);
};
