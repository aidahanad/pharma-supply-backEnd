const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  feedbackText: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
});

const supplierSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  téléphone: {
    type: String,
    required: true,
  },
  registreDeCommerce: {
    type: String,
    default: "",
  },
  approved: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  feedbacks: [feedbackSchema],
});

exports.Supplier = mongoose.model("Supplier", supplierSchema);
exports.supplierSchema = supplierSchema;
exports.feedbackSchema = feedbackSchema;
