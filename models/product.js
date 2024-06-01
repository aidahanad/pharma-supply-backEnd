const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: {
    type: String,
    required: true,
  },
  richDescription: {
    type: String,
    default: "",
  },
  images: [
    {
      type: String,
    },
  ],
  brand: {
    type: Number,
    default: 0,
  },
  categorie: {
    type: String,
    enum: ["medicament", "materiel"],
    required: true,
  },
  quantiteEnStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  notation: {
    type: Number,
    default: 0,
  },
  nombreDavis: {
    type: Number,
    default: 0,
  },
  estMisEnAvant: {
    type: Boolean,
    default: false,
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
  fournisseurId: {
    type: String,
  },
  prix: {
    type: Number,
  },
});

exports.Product = mongoose.model("Product", productSchema);
exports.productSchema = productSchema;
