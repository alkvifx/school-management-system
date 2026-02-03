import * as aiService from "../services/ai.service.js";
import AiPoster from "../models/aiPoster.model.js";
import cloudinary from "../config/cloudinary.js";

export const createPoster = async (req, res, next) => {
  try {
    const { text, occasion, format } = req.body;
    const file = req.file; // optional uploaded image

    if (!text || !format) return res.status(400).json({ success: false, message: "Missing required fields" });

    const uploadedImageUrl = file?.path || null; // multer-storage-cloudinary sets file.path

    // Create design prompt using existing ai service
    const { prompt, size } = await aiService.createDesignPrompt({ text, occasion: occasion || "", format, imageUrl: uploadedImageUrl, schoolName: req.school.name });

    // Generate image from the prompt
    const imgResult = await aiService.generatePosterImage({ prompt, size });

    let imageUrl = null;

    if (imgResult.b64_json) {
      // Upload base64 to Cloudinary
      const dataUri = `data:image/png;base64,${imgResult.b64_json}`;
      const uploadResp = await cloudinary.uploader.upload(dataUri, { folder: `schools/ai-posters/${req.school._id}` });
      imageUrl = uploadResp.secure_url;
    } else if (imgResult.url) {
      // If provider returned hosted URL, use it directly
      imageUrl = imgResult.url;
    }

    if (!imageUrl) throw new Error("Failed to generate image");

    // Save metadata
    const rec = await AiPoster.create({
      schoolId: req.school._id,
      createdBy: req.user._id,
      imageUrl,
      format,
      promptUsed: prompt,
      metadata: { size },
    });

    res.json({ success: true, data: { imageUrl: rec.imageUrl, promptUsed: rec.promptUsed, id: rec._id } });
  } catch (error) {
    next(error);
  }
};

export const listPosters = async (req, res, next) => {
  try {
    const posters = await AiPoster.find({ schoolId: req.school._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: posters });
  } catch (error) {
    next(error);
  }
};

export default { createPoster, listPosters };