import * as aiService from "../services/ai.service.js";
import AiTemplate from "../models/aiTemplate.model.js";
import AiNotice from "../models/aiNotice.model.js";
import Branding from "../models/branding.model.js";
import Marks from "../models/marks.model.js";

export const generateSchoolTemplate = async (req, res, next) => {
  try {
    const { schoolType, classes, tone, language, purpose } = req.body;

    if (!schoolType || !classes || !tone || !language || !purpose) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const content = await aiService.generateSchoolTemplate({
      schoolName: req.school.name,
      schoolType,
      classes,
      tone,
      language,
      purpose,
    });

    // Save to DB
    const record = await AiTemplate.create({
      schoolId: req.school._id,
      createdBy: req.user._id,
      templateType: purpose,
      language,
      tone,
      content,
    });

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const getTemplates = async (req, res, next) => {
  try {
    const templates = await AiTemplate.find({ schoolId: req.school._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

export const createNotice = async (req, res, next) => {
  try {
    const { event, date, classes, language, delivery } = req.body;
    if (!event || !date || !classes || !delivery) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const generated = await aiService.generateNoticeVariants({
      event,
      date,
      classes,
      language,
      delivery,
      schoolName: req.school.name,
    });

    const record = await AiNotice.create({
      schoolId: req.school._id,
      createdBy: req.user._id,
      event,
      date,
      classes,
      language,
      delivery,
      generated,
    });

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const getNotices = async (req, res, next) => {
  try {
    const notices = await AiNotice.find({ schoolId: req.school._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: notices });
  } catch (error) {
    next(error);
  }
};

export const downloadTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { format = "pdf" } = req.query;
    const record = await AiTemplate.findById(id).lean();
    if (!record) return res.status(404).json({ success: false, message: "Template not found" });

    const contentText = typeof record.content === "string" ? record.content : JSON.stringify(record.content, null, 2);

    if (format === "pdf") {
      const PDFDocument = (await import("pdfkit")).default;
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="template-${record.templateType}.pdf"`);
      doc.text(contentText);
      doc.end();
      doc.pipe(res);
      return;
    }

    // Default to doc download with plain text (Word can open plain text .doc files)
    res.setHeader("Content-Type", "application/msword");
    res.setHeader("Content-Disposition", `attachment; filename="template-${record.templateType}.doc"`);
    res.send(contentText);
  } catch (error) {
    next(error);
  }
};

export const analyzeResults = async (req, res, next) => {
  try {
    const { examId } = req.params;
    // Aggregate marks to produce analysis input for AI
    const query = { schoolId: req.school._id };
    if (examId) {
      // try to see if examId maps to examType
      const examTypes = ["unit_test", "mid_term", "final", "assignment", "quiz"];
      if (examTypes.includes(examId)) {
        query.examType = examId;
      }
    }

    const marks = await Marks.find(query).lean();

    // Basic aggregation for AI — pass aggregated stats in prompt
    const examTypeOrId = req.params.examId || "all";
    const analysis = await aiService.analyzeResults({ examTypeOrId, schoolId: req.school._id });

    res.json({ success: true, data: analysis, rawCount: marks.length });
  } catch (error) {
    next(error);
  }
};

export const generateBranding = async (req, res, next) => {
  try {
    const { tone, language } = req.body;
    if (!tone || !language) return res.status(400).json({ success: false, message: "Missing fields" });

    const result = await aiService.generateBranding({ schoolName: req.school.name, tone, language });

    const record = await Branding.create({
      schoolId: req.school._id,
      createdBy: req.user._id,
      logoPrompt: result.logoPrompt || "",
      certificateText: result.certificateText || "",
      letterhead: result.letterhead || "",
      idCardLayout: result.idCardLayout || {},
    });

    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};
