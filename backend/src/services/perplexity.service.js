/**
 * Perplexity AI Chat Completions API
 * Model: sonar-pro (configurable via PERPLEXITY_MODEL)
 * https://docs.perplexity.ai/api-reference/chat-completions-post
 */

const PERPLEXITY_BASE = "https://api.perplexity.ai";
const DEFAULT_MODEL = process.env.PERPLEXITY_MODEL || "sonar-pro";
const TIMEOUT_MS = Number(process.env.PERPLEXITY_TIMEOUT) || 60000;

const SYSTEM_PROMPTS = {
  STUDENT:
    "You are a helpful school tutor AI. Explain concepts simply with examples. Use clear language and step-by-step explanations. Format your response in markdown when helpful (headings, lists, code blocks). Be encouraging and educational.",
  TEACHER:
    "You are an expert teaching assistant AI. Help teachers with lesson planning, explanations, content creation, and classroom strategies. Provide structured, professional responses. Use markdown for clarity (headings, bullet points, examples).",
};

/**
 * Sanitize user message: limit length, strip dangerous patterns (basic prompt injection mitigation).
 * @param {string} message - Raw user input
 * @param {number} maxLength - Max characters (default 500)
 * @returns {string}
 */
function sanitizeMessage(message, maxLength = 500) {
  if (typeof message !== "string") return "";
  let text = message.trim().slice(0, maxLength);
  // Remove common prompt override attempts
  const overridePatterns = [
    /ignore\s+(all\s+)?(previous|above|prior)\s+instructions?/gi,
    /you\s+are\s+now\s+/gi,
    /system\s*:\s*/gi,
    /\[INST\]|\[\/INST\]/gi,
  ];
  overridePatterns.forEach((p) => {
    text = text.replace(p, "[removed]");
  });
  return text.trim() || "";
}

/**
 * Call Perplexity Chat Completions API.
 * @param {object} options
 * @param {string} options.message - User message (will be sanitized)
 * @param {string} options.role - "STUDENT" | "TEACHER"
 * @returns {Promise<{ content: string, error?: string }>}
 */
export async function chatWithPerplexity({ message, role }) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return { content: "", error: "Perplexity API key not configured" };
  }

  const sanitized = sanitizeMessage(message, 500);
  if (!sanitized) {
    return { content: "", error: "Message is empty after sanitization" };
  }

  const model = DEFAULT_MODEL;
  const systemContent = SYSTEM_PROMPTS[role] || SYSTEM_PROMPTS.STUDENT;

  const body = {
    model,
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: sanitized },
    ],
    max_tokens: 1024,
    temperature: 0.2,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(`${PERPLEXITY_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      return {
        content: "",
        error: `Perplexity API error: ${res.status} ${errText.slice(0, 200)}`,
      };
    }

    const data = await res.json();
    const content =
      data?.choices?.[0]?.message?.content?.trim() ||
      data?.choices?.[0]?.message?.content ||
      "";

    if (!content) {
      return {
        content: "",
        error: "Empty response from Perplexity",
      };
    }

    return { content };
  } catch (e) {
    if (e.name === "AbortError") {
      return { content: "", error: "Request timeout" };
    }
    return {
      content: "",
      error: e.message || "Perplexity request failed",
    };
  }
}

export { sanitizeMessage };
export default { chatWithPerplexity, sanitizeMessage };
