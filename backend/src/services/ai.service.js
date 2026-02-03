import { callGemini, generateImageWithGemini } from "../utils/gemini.js";

export async function generateSchoolTemplate({
  schoolName,
  schoolType,
  classes,
  tone,
  language,
  purpose,
}) {
  const system = `
You are an AI assistant for school administration.
You generate clean, structured, professional content.
Always return VALID JSON only. No extra text.
`;

  const user = `
Generate a ${purpose} for a ${schoolType} school.

School Name: ${schoolName}
Classes: ${classes}
Tone: ${tone}
Language: ${language}

Return JSON fields suitable for "${purpose}".
`;

  const output = await callGemini(system, user);

  try {
    return JSON.parse(output);
  } catch {
    return { text: output };
  }
}

export async function generateNoticeVariants({
  event,
  date,
  classes,
  language,
  delivery,
  schoolName,
}) {
  const system = `
You write professional school notices.
Return JSON with keys:
notice, whatsapp, sms
`;

  const user = `
Event: ${event}
Date: ${date}
Classes: ${classes.join(", ")}
Language: ${language}
Delivery: ${delivery.join(", ")}
School: ${schoolName}
`;

  const output = await callGemini(system, user);

  try {
    return JSON.parse(output);
  } catch {
    return { notice: output, whatsapp: "", sms: "" };
  }
}


export async function analyzeResults({
  examTypeOrId,
  schoolId,
  classId,
}) {
  const system = `
You are an academic analytics assistant.
Return JSON ONLY with:
summary,
weakSubjects (array),
atRiskStudents (array of {studentId, reason}),
teacherInsights (array)
`;

  const user = `
Analyze exam results.

Exam: ${examTypeOrId}
School ID: ${schoolId}
${classId ? `Class ID: ${classId}` : ""}

Use trends, performance drops, and subject weakness.
`;

  const output = await callGemini(system, user);

  try {
    return JSON.parse(output);
  } catch {
    return {
      summary: output,
      weakSubjects: [],
      atRiskStudents: [],
      teacherInsights: [],
    };
  }
}


export async function generateBranding({
  schoolName,
  tone,
  language,
}) {
  const system = `
You generate school branding assets.
Return JSON ONLY with:
logoPrompt,
certificateText,
letterhead,
idCardLayout
`;

  const user = `
Create a branding kit.

School: ${schoolName}
Tone: ${tone}
Language: ${language}
`;

  const output = await callGemini(system, user);

  try {
    return JSON.parse(output);
  } catch {
    return { logoPrompt: output };
  }
}

/**
 * Generate a social-media-ready poster/status/story image.
 * Reuses Gemini for prompt engineering and the Google Generative Images API
 * to produce an image. If the image returns as base64 it will be uploaded by
 * controller to Cloudinary. This function returns the prompt and recommended size.
 */
export async function createDesignPrompt({ text, occasion, format, imageUrl, schoolName }) {
  // tune prompt for visual design
  const aspectHints = {
    story: { label: "Instagram Story (9:16)", size: "1080x1920" },
    poster: { label: "Poster (1:1)", size: "1024x1024" },
    banner: { label: "Banner (16:9)", size: "1920x1080" },
  };

  const chosen = aspectHints[format] || aspectHints.poster;

  const system = `You are a creative designer assistant that writes precise image design prompts for an image generation model. Keep the prompt focused and include instructions for composition, typography, color palette, celebration vibe, and aspect ratio. Emphasize elegant typography, festival colors, and a professional school-branded style. If an image URL is provided, include it as an element to be incorporated.`;

  const user = `Create a single design prompt for: ${text} (occasion: ${occasion}).
School: ${schoolName}.
Format: ${chosen.label}, aspect ratio: ${chosen.size}.
Include: school celebration vibe, elegant typography, festival colors, high-contrast legible title, clean layout suitable for social media, poster-quality output. ${imageUrl ? `Incorporate the uploaded image available at ${imageUrl} as a background/element or inset.` : ""}
Return ONLY the prompt text.`;

  const promptText = await callGemini(system, user);
  return { prompt: (promptText || user).trim(), size: chosen.size };
}

export async function generatePosterImage({ prompt, size }) {
  // Use Gemini image endpoint wrapper
  const result = await generateImageWithGemini({ prompt, size });
  return result; // { b64_json } or { url }
}

export default {
  generateSchoolTemplate,
  generateNoticeVariants,
  analyzeResults,
  generateBranding,
  createDesignPrompt,
  generatePosterImage,
};


