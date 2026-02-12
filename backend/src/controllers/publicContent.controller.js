import School from "../models/school.model.js";
import PublicContent from "../models/publicContent.model.js";
import ContactMessage from "../models/contactMessage.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { sendContactFormEmail } from "../utils/emailService.js";

// Helper: resolve school for public (unauthenticated) requests
async function resolvePublicSchoolId(explicitId) {
  if (explicitId) return explicitId;

  // Prefer configured env
  if (process.env.PUBLIC_SCHOOL_ID) {
    return process.env.PUBLIC_SCHOOL_ID;
  }

  // Fallback to first active school
  const school = await School.findOne({ isActive: true }).sort({ createdAt: 1 });
  return school?._id || null;
}

// Helper: ensure there is a PublicContent document for given school
async function getOrCreatePublicContentForSchool(schoolId) {
  if (!schoolId) return null;

  let doc = await PublicContent.findOne({ schoolId });
  if (doc) return doc;

  // Seed with sensible defaults so UI never breaks
  doc = await PublicContent.create({
    schoolId,
    navbar: {
      callNumber: "+91 123 456 7890",
      medium: "English",
      affiliationNumber: "1234567",
    },
    banner: {
      educatingSince: 1985,
      headingPrimary: "Nurturing Future Leaders",
      headingSecondary: "Where learning meets excellence",
      description:
        "A premier institution focused on strong academics, values, and all-round development.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1650225554926-b70324a698ae?w=1920&q=80",
          alt: "School campus",
        },
        {
          url: "https://images.unsplash.com/photo-1495576775051-8af0d10f19b1?w=1920&q=80",
          alt: "Students learning",
        },
      ],
    },
    stats: {
      yearsOfExcellence: "40+",
      studentsCount: "2500+",
      teachersCount: "150+",
    },
    legacy: {
      title: "About Our Legacy",
      lines: [
        "For decades we have been committed to academic excellence and character building.",
        "Our alumni are serving in diverse fields across the globe.",
      ],
      mainGateImageUrl:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
    },
    principalSection: {
      name: "Principal Name",
      designation: "Principal",
      photoUrl: "/images/principal.jpg",
      messageLines: [
        "Education is about nurturing curiosity, empathy, and resilience.",
        "We strive to create an environment where every child feels seen and supported.",
        "Together with parents, we build a strong foundation for lifelong learning.",
      ],
    },
    announcements: [
      {
        title: "Admissions Open",
        description: "Admissions open for the academic year 2025–26 for all classes.",
        date: new Date(),
        type: "ADMISSION",
        important: true,
      },
      {
        title: "Summer Camp",
        description: "Join our fun-filled summer camp with sports and activities.",
        date: new Date(),
        type: "SUMMER_CAMP",
        important: false,
      },
      {
        title: "PTM",
        description: "Parent-Teacher Meeting for all classes as per shared schedule.",
        date: new Date(),
        type: "PTM",
        important: false,
      },
      {
        title: "Annual Function",
        description: "Annual cultural function with performances by our students.",
        date: new Date(),
        type: "ANNUAL_FUNCTION",
        important: false,
      },
      {
        title: "Sports Meet",
        description: "Annual sports meet – dates announced soon.",
        date: new Date(),
        type: "SPORTS",
        important: false,
      },
    ],
    footer: {
      descriptionLines: [
        "A modern school focused on academics, values, and holistic development.",
        "We work closely with parents to support every child’s learning journey.",
      ],
      locationLabel: "View on Google Maps",
      locationUrl:
        "https://www.google.com/maps/search/?api=1&query=Delhi+Public+School+Noida",
      email: "school@mail.edu",
      workingHours: {
        weekdays: "Mon – Fri: 8:00 AM – 2:00 PM",
        saturday: "Sat: 8:00 AM – 12:00 PM",
        sunday: "Sun: Closed",
      },
      social: {
        facebook: "https://facebook.com",
        twitter: "https://twitter.com",
        instagram: "https://instagram.com",
        youtube: "https://youtube.com",
      },
    },
    academics: {
      board: "CBSE",
      primary: {
        label: "Primary (I–V)",
        ageLimit: "5–10 years",
        subjects: ["English", "Hindi", "Mathematics", "EVS", "Art & Craft", "Physical Education"],
        dailyHours: "4–5 hours",
        studentLimitPerClass: "30–35 students",
      },
      middle: {
        label: "Middle (VI–VIII)",
        ageLimit: "11–13 years",
        subjects: [
          "English",
          "Hindi",
          "Mathematics",
          "Science",
          "Social Studies",
          "Computer Science",
        ],
        dailyHours: "5–6 hours",
        studentLimitPerClass: "35–40 students",
      },
      secondary: {
        label: "Secondary (IX–X)",
        ageLimit: "14–15 years",
        subjects: [
          "English",
          "Hindi",
          "Mathematics",
          "Science",
          "Social Science",
          "Computer Applications",
        ],
        dailyHours: "6 hours",
        studentLimitPerClass: "35–40 students",
      },
      seniorSecondary: {
        label: "Senior Secondary (XI–XII)",
        ageLimit: "16–18 years",
        subjects: ["Science / Commerce / Humanities streams with electives"],
        dailyHours: "6–7 hours",
        studentLimitPerClass: "35–40 students",
      },
    },
    gallery: {
      categories: [
        { key: "FUNCTIONS", label: "Functions" },
        { key: "SPORTS", label: "Sports" },
        { key: "EVENTS", label: "Events" },
      ],
      images: [
        {
          url: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80",
          title: "Annual Day Celebration",
          category: "FUNCTIONS",
        },
        {
          url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
          title: "Inter-School Cricket Match",
          category: "SPORTS",
        },
        {
          url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
          title: "Science Exhibition",
          category: "EVENTS",
        },
      ],
    },
    merit: {
      class10: [],
      class12: [],
    },
  });

  return doc;
}

// ==================== PUBLIC: GET CONTENT ====================

export const getPublicContent = asyncHandler(async (req, res) => {
  const explicitSchoolId = req.query.schoolId;
  const schoolId = await resolvePublicSchoolId(explicitSchoolId);

  if (!schoolId) {
    return res.status(404).json({
      success: false,
      message: "No active school found for public content",
    });
  }

  const doc = await getOrCreatePublicContentForSchool(schoolId);

  return res.status(200).json({
    success: true,
    data: doc,
  });
});

// ==================== PRINCIPAL: GET / UPSERT ====================

export const getPublicContentForPrincipal = asyncHandler(async (req, res) => {
  const principal = req.user;

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const doc = await getOrCreatePublicContentForSchool(principal.schoolId);

  return res.status(200).json({
    success: true,
    data: doc,
  });
});

export const updatePublicContent = asyncHandler(async (req, res) => {
  const principal = req.user;
  const { sections } = req.body || {};

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  if (!sections || typeof sections !== "object") {
    return res.status(400).json({
      success: false,
      message: "sections payload is required",
    });
  }

  const doc = await getOrCreatePublicContentForSchool(principal.schoolId);

  // Shallow merge for top-level sections; arrays should be sent fully from client
  Object.entries(sections).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      // Replace arrays completely (e.g. announcements, gallery.images, merit lists)
      doc[key] = value;
    } else if (typeof value === "object" && value !== null) {
      doc[key] = {
        ...(doc[key] || {}),
        ...value,
      };
    } else {
      doc[key] = value;
    }
  });

  await doc.save();

  return res.status(200).json({
    success: true,
    message: "Public content updated successfully",
    data: doc,
  });
});

// ==================== PUBLIC: CONTACT FORM ====================

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, subject and message are required",
    });
  }

  const schoolId = await resolvePublicSchoolId(req.body.schoolId);

  const saved = await ContactMessage.create({
    schoolId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || "",
    subject: subject.trim(),
    message: message.trim(),
    meta: {
      userAgent: req.headers["user-agent"] || "",
      ip: req.ip,
    },
  });

  // Send email to configured recipient (principal/admin)
  try {
    await sendContactFormEmail({
      name: saved.name,
      email: saved.email,
      phone: saved.phone,
      subject: saved.subject,
      message: saved.message,
    });
  } catch (err) {
    // Log but don't fail the request – message is stored in DB
    console.error("Failed to send contact form email:", err?.message || err);
  }

  return res.status(201).json({
    success: true,
    message: "Message submitted successfully",
  });
});

