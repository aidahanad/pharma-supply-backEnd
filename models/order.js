const mongoose = require("mongoose");

const commandeSchema = mongoose.Schema({
  articlesCommandés: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  adresseLivraison1: {
    type: String,
    required: true,
  },
  adresseLivraison2: {
    type: String,
  },
  ville: {
    type: String,
    required: true,
  },
  codePostal: {
    type: String,
    required: true,
  },
  pays: {
    type: String,
    required: true,
  },
  téléphone: {
    type: String,
    required: true,
  },
  statut: {
    type: String,
    required: true,
    default: "En attente",
  },
  prixTotal: {
    type: Number,
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Utilisateur",
  },
  dateCommande: {
    type: Date,
    default: Date.now,
  },
  fournisseurId: {
    type: String,
  },
});

exports.Commande = mongoose.model("Commande", commandeSchema);
exports.commandechema = commandeSchema;
