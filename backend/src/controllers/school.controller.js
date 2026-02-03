import School from "../models/school.model.js";
import User from "../models/user.model.js";

export const createSchool = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // ek principal = ek school (rule)
    const existingSchool = await School.findOne({
      principal: req.user._id,
    });

    if (existingSchool) {
      return res.status(400).json({ msg: "School already exists" });
    }

    const logo = req.file ? req.file.path : null;

    const school = await School.create({
      name,
      email,
      phone,
      address,
      logo,
      principal: req.user._id,
    });

    // principal ke user me schoolId save
    await User.findByIdAndUpdate(req.user._id, {
      schoolId: school._id,
    });

    res.status(201).json({
      msg: "School created successfully",
      school,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const getMySchool = async (req, res) => {
  try {
    const school = await School.findOne({
      principalId: req.user._id,
    });

    if (!school) {
      return res.status(404).json({ msg: "School not found" });
    }

    res.status(200).json(school);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
