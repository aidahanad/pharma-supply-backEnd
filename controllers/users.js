const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Obtenir la liste de tous les utilisateurs (works)
exports.getUsers = async (req, res) => {
  try {
    const userList = await User.find();
    if (!userList) {
      return res.status(500).json({ success: false });
    }
    res.send(userList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error });
  }
};

// Obtenir un utilisateur par son ID (works)
exports.getUserById = async (req, res) => {
  console.log(req.params.id);
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        message: "L'utilisateur avec l'ID fourni n'a pas été trouvé.",
      });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
};

// Mettre à jour un utilisateur(still doesn't)
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUserData = req.body; // Données mises à jour fournies dans le corps de la requête

    // Trouver l'utilisateur par son ID et mettre à jour ses détails
    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
    });

    // Vérifier si l'utilisateur a été mis à jour avec succès
    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Envoi des données de l'utilisateur mis à jour
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Authentification d'un utilisateur (works)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });

    // Si l'utilisateur n'est pas trouvé, envoyer une réponse d'erreur
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Email ou mot de passe invalide" });
    }

    // Vérifier si le mot de passe correspond à celui stocké dans la base de données
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    // Si le mot de passe ne correspond pas, envoyer une réponse d'erreur
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Email ou mot de passe invalide" });
    }

    // Envoyer une réponse de succès si l'email et le mot de passe sont valides
    res.status(200).json({ success: true, message: "Connexion réussie", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Supprimer un utilisateur (works)
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Trouver l'utilisateur par son ID et le supprimer
    const deletedUser = await User.findByIdAndDelete(userId);

    // Si l'utilisateur n'est pas trouvé, envoyer une réponse d'erreur
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Envoyer un message de succès
    res
      .status(200)
      .json({ success: true, message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.registerNewUser = async (req, res) => {
  try {
    let uploadedProfilePicture = "";

    // Créer une nouvelle instance d'utilisateur
    const newUser = new User({
      nom: req.body.nom,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      téléphone: req.body.phone,
      rue: req.body.rue,
      appartement: req.body.appartement,
      codePostal: req.body.codePostal,
      ville: req.body.ville,
      codeMédical: req.body.codeMédical,
      profilePicture: uploadedProfilePicture,
    });

    // Sauvegarder le nouvel utilisateur dans la base de données
    const savedUser = await newUser.save();

    // Envoyer les données de l'utilisateur nouvellement créé
    res.status(201).json({ success: true, user: savedUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtenir le nombre d'utilisateurs (works)
exports.getCountOfUsers = async (req, res) => {
  try {
    // Obtenir le nombre d'utilisateurs
    const userCount = await User.countDocuments();

    // Envoyer le nombre d'utilisateurs
    res.status(200).json({ success: true, count: userCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
