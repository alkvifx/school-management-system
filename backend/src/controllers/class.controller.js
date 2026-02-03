import Class from "../models/class.model.js";
import School from "../models/school.model.js";

export const createClass = async (req, res) => {
  try {
    const { name, section } = req.body;

    if (!name || !section) {
      return res.status(400).json({ msg: "Name and section required" });
    }

    const school = await School.findOne({
      principal: req.user._id,
    });

    if (!school) {
      return res.status(404).json({ msg: "School not found" });
    }

    const newClass = await Class.create({
      name,
      section,
      schoolId: school._id,
    });

    res.status(201).json({
      msg: "Class created",
      class: newClass,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Class already exists" });
    }
    res.status(500).json({ msg: "Server error" });
  }
};

export const getClasses = async (req, res) => {
  try {
    const school = await School.findOne({
      principal: req.user._id,
    });

    const classes = await Class.find({
      schoolId: school._id,
      isActive: true,
    }).sort({ name: 1 });

    res.status(200).json(classes);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
