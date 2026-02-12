import mongoose from "mongoose";

const publicContentSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      unique: true,
    },

    // ==================== NAVBAR ====================
    navbar: {
      callNumber: { type: String, default: "" },
      medium: { type: String, default: "" },
      affiliationNumber: { type: String, default: "" },
    },

    // ==================== HOME / BANNER ====================
    banner: {
      educatingSince: { type: Number, default: 1985 },
      headingPrimary: { type: String, default: "" },
      headingSecondary: { type: String, default: "" },
      description: { type: String, default: "" },
      images: [
        {
          url: { type: String, required: true },
          alt: { type: String, default: "" },
        },
      ],
    },

    stats: {
      yearsOfExcellence: { type: String, default: "40+" },
      studentsCount: { type: String, default: "2500+" },
      teachersCount: { type: String, default: "150+" },
    },

    legacy: {
      title: { type: String, default: "About Our Legacy" },
      lines: [{ type: String }],
      mainGateImageUrl: { type: String, default: "" },
    },

    principalSection: {
      name: { type: String, default: "" },
      designation: { type: String, default: "Principal" },
      photoUrl: { type: String, default: "" },
      messageLines: [{ type: String }],
    },

    // ==================== ANNOUNCEMENTS / NOTICES ====================
    announcements: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        date: { type: Date, required: true },
        type: {
          type: String,
          enum: [
            "ADMISSION",
            "SUMMER_CAMP",
            "PTM",
            "ANNUAL_FUNCTION",
            "SPORTS",
            "GENERAL",
          ],
          default: "GENERAL",
        },
        important: { type: Boolean, default: false },
      },
    ],

    // ==================== FOOTER ====================
    footer: {
      descriptionLines: [{ type: String }],
      locationLabel: { type: String, default: "" },
      locationUrl: { type: String, default: "" },
      email: { type: String, default: "" },
      workingHours: {
        weekdays: { type: String, default: "Mon – Fri: 8:00 AM – 2:00 PM" },
        saturday: { type: String, default: "Sat: 8:00 AM – 12:00 PM" },
        sunday: { type: String, default: "Sun: Closed" },
      },
      social: {
        facebook: { type: String, default: "" },
        twitter: { type: String, default: "" },
        instagram: { type: String, default: "" },
        youtube: { type: String, default: "" },
      },
    },

    // ==================== ABOUT US PAGE ====================
    about: {
      chairman: {
        name: { type: String, default: "" },
        photoUrl: { type: String, default: "" },
      },
      principal: {
        name: { type: String, default: "" },
        photoUrl: { type: String, default: "" },
      },
      vicePrincipal: {
        name: { type: String, default: "" },
        photoUrl: { type: String, default: "" },
      },
      history: {
        firstYearStudentsCount: { type: Number, default: 0 },
        middleSchoolYear: { type: Number, default: 0 },
        computerEducationYear: { type: Number, default: 0 },
        smartClassroomsYear: { type: Number, default: 0 },
        digitalLearningYear: { type: Number, default: 0 },
        totalYearsCompleted: { type: Number, default: 0 },
      },
    },

    // ==================== ACADEMICS PAGE ====================
    academics: {
      board: {
        type: String,
        enum: ["MP_BOARD", "CBSE"],
        default: "CBSE",
      },
      primary: {
        label: { type: String, default: "Primary (I–V)" },
        ageLimit: { type: String, default: "" },
        subjects: [{ type: String }],
        dailyHours: { type: String, default: "" },
        studentLimitPerClass: { type: String, default: "" },
      },
      middle: {
        label: { type: String, default: "Middle (VI–VIII)" },
        ageLimit: { type: String, default: "" },
        subjects: [{ type: String }],
        dailyHours: { type: String, default: "" },
        studentLimitPerClass: { type: String, default: "" },
      },
      secondary: {
        label: { type: String, default: "Secondary (IX–X)" },
        ageLimit: { type: String, default: "" },
        subjects: [{ type: String }],
        dailyHours: { type: String, default: "" },
        studentLimitPerClass: { type: String, default: "" },
      },
      seniorSecondary: {
        label: { type: String, default: "Senior Secondary (XI–XII)" },
        ageLimit: { type: String, default: "" },
        subjects: [{ type: String }],
        dailyHours: { type: String, default: "" },
        studentLimitPerClass: { type: String, default: "" },
      },
    },

    // ==================== GALLERY ====================
    gallery: {
      categories: [
        {
          key: { type: String, required: true }, // e.g. "FUNCTIONS", "SPORTS", "EVENTS"
          label: { type: String, required: true },
        },
      ],
      images: [
        {
          url: { type: String, required: true },
          title: { type: String, default: "" },
          category: { type: String, default: "EVENTS" },
        },
      ],
    },

    // ==================== MERIT STUDENTS ====================
    merit: {
      class10: [
        {
          yearOfPassing: { type: Number, required: true },
          studentName: { type: String, required: true },
          percentage: { type: Number, required: true },
        },
      ],
      class12: [
        {
          yearOfPassing: { type: Number, required: true },
          studentName: { type: String, required: true },
          percentage: { type: Number, required: true },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

publicContentSchema.index({ schoolId: 1 });

export default mongoose.model("PublicContent", publicContentSchema);

