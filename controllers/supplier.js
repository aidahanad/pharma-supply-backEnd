// Importation du modèle Supplier et des modules bcrypt et jwt
const { Supplier } = require("../models/supplier");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinaryConfig");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// Add a feedback to a supplier
const ajouterFeedback = async (req, res) => {
  try {
    const fournisseurId = req.params.id;
    const { name, email, feedbackText, note } = req.body;
    console.log(note);

    // Find the supplier by ID
    const fournisseur = await Supplier.findById(fournisseurId);

    // Check if the supplier exists
    if (!fournisseur) {
      return res.status(404).send("Fournisseur non trouvé");
    }

    // Add the feedback to the supplier's feedbacks array
    fournisseur.feedbacks.push({ name, email, feedbackText, note });

    // Save the supplier
    await fournisseur.save();

    // Send the updated supplier as a response
    res.status(200).send(fournisseur);
  } catch (error) {
    console.log(error);
    // Handle errors
    res.status(500).json({
      message: "Une erreur est survenue lors de l'ajout du feedback",
      error: error,
    });
  }
};

// Obtention de la liste des fournisseurs sans le mot de passe(works)
const obtenirListeFournisseurs = async (req, res) => {
  try {
    // Recherche de tous les fournisseurs et exclusion du champ passwordHash
    const listeFournisseurs = await Supplier.find().select("-passwordHash");
    // Vérification si la liste des fournisseurs est vide
    if (!listeFournisseurs) {
      return res.status(500).json({ success: false });
    }
    // Envoi de la liste des fournisseurs en réponse
    res.send(listeFournisseurs);
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ success: false, error: error });
  }
};

// Obtention d'un seul fournisseur sans le mot de passe(works)
const obtenirFournisseurParId = async (req, res) => {
  try {
    // Recherche du fournisseur par son ID et exclusion du champ passwordHash
    const fournisseur = await Supplier.findById(req.params.id).select(
      "-passwordHash"
    );
    // Vérification si le fournisseur est introuvable
    if (!fournisseur) {
      return res.status(404).json({
        message: "Le fournisseur avec l'ID fourni n'a pas été trouvé.",
      });
    }
    // Envoi du fournisseur en réponse
    res.status(200).send(fournisseur);
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération du fournisseur",
      error: error,
    });
  }
};
const enregistrerFournisseur = async (req, res) => {
  try {
    const pictures = req.files;
    console.log(req.body);
    let uploadedProfilePicture = "";

    if (pictures && pictures.length > 0) {
      const tempFolderPath = path.join(__dirname, "..", "temp");
      if (!fs.existsSync(tempFolderPath)) {
        fs.mkdirSync(tempFolderPath);
      }

      try {
        // Upload profile picture to Cloudinary and get its URL
        await Promise.all(
          pictures.map(async (picture) => {
            const tempFilePath = path.join(
              tempFolderPath,
              picture.originalname
            );

            // Write the buffer to a temporary file
            await promisify(fs.writeFile)(tempFilePath, picture.buffer);

            // Upload the temporary file to Cloudinary
            const result = await cloudinary.uploader.upload(tempFilePath, {
              folder: "images",
            });

            uploadedProfilePicture = result.secure_url;
          })
        );

        // Remove temporary files
        await fs.promises.rm(tempFolderPath, {
          recursive: true,
          force: true,
        });
      } catch (error) {
        console.log(error);
        // If there was an upload failure, handle the error and respond with it

        return res.status(501).json({
          error,
        });
      }
    }

    try {
      // Create a new supplier with the provided data
      let fournisseur = new Supplier({
        nom: req.body.nom,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        téléphone: req.body.phone,
        registreDeCommerce: req.body.registreDeCommerce,
        profilePicture: uploadedProfilePicture,
      });

      // Save the new supplier to the database
      fournisseur = await fournisseur.save();

      // Check if the supplier was created successfully
      if (!fournisseur) {
        return res.status(400).send("Impossible de créer le fournisseur !");
      }

      // Send the created supplier as a response
      res.send(fournisseur);
    } catch (error) {
      // Handle errors
      console.log(error);
      res.status(500).json({
        message: "Une erreur est survenue lors de la création du fournisseur",
        error: error,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la création du fournisseur",
      error: error,
    });
  }
};
// Mise à jour des détails de fournisseur
const mettreÀJourFournisseur = async (req, res) => {
  try {
    // Recherche de l'existence du fournisseur par son ID
    const fournisseurExist = await Supplier.findById(req.params.id);
    let nouveauMotDePasse;
    // Vérification si un nouveau mot de passe a été fourni
    if (req.body.password) {
      // Cryptage du nouveau mot de passe
      nouveauMotDePasse = bcrypt.hashSync(req.body.password, 10);
    } else {
      // Utilisation de l'ancien mot de passe
      nouveauMotDePasse = fournisseurExist.passwordHash;
    }
    // Mise à jour des détails du fournisseur dans la base de données(still doesn't)
    const fournisseur = await Supplier.findByIdAndUpdate(
      req.params.id,
      {
        nom: req.body.nom,
        email: req.body.email,
        passwordHash: nouveauMotDePasse,
        téléphone: req.body.téléphone,
        registreDeCommerce: req.body.registreDeCommerce,
      },
      { new: true }
    );
    // Vérification si le fournisseur n'a pas été mis à jour avec succès
    if (!fournisseur)
      return res
        .status(400)
        .send("Impossible de mettre à jour l'fournisseur !");
    // Envoi du fournisseur mis à jour en réponse
    res.send(fournisseur);
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour du fournisseur",
      error: error,
    });
  }
};
//connexion du fournisseur (works)
const connexionFournisseur = async (req, res) => {
  try {
    // Recherche du fournisseur par son e-mail
    const fournisseur = await Supplier.findOne({ email: req.body.email });

    // Vérification si le fournisseur n'a pas été trouvé
    if (!fournisseur) {
      return res.status(400).send("L'fournisseur n'a pas été trouvé");
    }

    // Vérification de la correspondance du mot de passe
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      fournisseur.passwordHash
    );

    if (isPasswordCorrect) {
      // Envoi d'une réponse de connexion réussie
      res.status(200).send(fournisseur);
    } else {
      // Envoi d'un message d'erreur si le mot de passe est incorrect
      res.status(400).send("Le mot de passe est incorrect !");
    }
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({
      message: "Une erreur est survenue lors de la connexion du fournisseur",
      error: error,
    });
  }
};

// Suppression d'un fournisseur(works)
const supprimerFournisseur = async (req, res) => {
  try {
    // Extract the supplier ID from the request parameters
    const fournisseurId = req.params.id;

    // Find the supplier by ID and delete it
    const deletedFournisseur = await Supplier.findByIdAndDelete(fournisseurId);

    // Check if the supplier was found and deleted successfully
    if (!deletedFournisseur) {
      return res.status(404).send("Fournisseur non trouvé ou déjà supprimé");
    }

    // Send a success message
    res.status(200).send("Fournisseur supprimé avec succès");
  } catch (error) {
    // Handle errors
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression du fournisseur",
      error: error,
    });
  }
};
// Exportation des fonctions du contrôleur
module.exports = {
  ajouterFeedback,
  obtenirListeFournisseurs,
  obtenirFournisseurParId,
  enregistrerFournisseur,
  mettreÀJourFournisseur,
  connexionFournisseur,
  supprimerFournisseur,
};
