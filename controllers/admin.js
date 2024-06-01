const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { Admin } = require("../models/admin");
const { User } = require("../models/user");
const { Supplier } = require("../models/supplier");


// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: "your_smtp_username",
    pass: "your_smtp_password"
  }
});

// Function to send confirmation email
const sendConfirmationEmail = async (recipientEmail, recipientName) => {
  // Define email template
  const emailTemplate = `
    <p>Hello ${recipientName},</p>
    <p>Your account has been accepted.</p>
    <p>Thank you!</p>
  `;

  try {
    // Send email
    await transporter.sendMail({
      from: "your_email@example.com",
      to: recipientEmail,
      subject: "Account Accepted",
      html: emailTemplate
    });

    console.log("Confirmation email sent successfully.");
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
};

// Fonction de connexion pour les administrateurs(works)
exports.loginAdmin = async (req, res) => {
  try{
    const { email, password } = req.body;

    // Find the admin by email
    const admin = await Admin.findOne({ email });

    // If admin is not found, send an error response
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if the password matches the one stored in the database
    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

    // If the password doesn't match, send an error response
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Send a success response if the email and password are valid
    res.status(200).json({ success: true, message: 'Login successful', admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
  

// Fonction pour accepter un fournisseur
exports.acceptSupplier = async (req, res) => {
  try {
    // Recherche du fournisseur par son ID
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      // Si aucun fournisseur n'est trouvé, renvoyer une erreur
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }
    // Mise à jour du statut du fournisseur en fonction d'une condition
    if (supplier.registreDeCommerce === "valide") {
      supplier.status = "accepté";
    } else {
      supplier.status = "refusé";
    }
    // Sauvegarde des modifications apportées au fournisseur
    await supplier.save();
    // Envoi d'une réponse indiquant que le statut du fournisseur a été mis à jour avec succès
    res.status(200).json({ message: "Statut du fournisseur mis à jour avec succès" });

    // Send confirmation email to the accepted supplier
    await sendConfirmationEmail(supplier.email, "Supplier");
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ message: "Une erreur est survenue", error: error });
  }
};

// Fonction pour accepter un utilisateur
exports.acceptUser = async (req, res) => {
  try {
    // Recherche de l'utilisateur par son ID
    const user = await User.findById(req.params.id);
    if (!user) {
      // Si aucun utilisateur n'est trouvé, renvoyer une erreur
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    // Mise à jour du statut de l'utilisateur en fonction d'une condition
    if (user.codeMédical === "valide") {
      user.status = "accepté";
    } else {
      user.status = "refusé";
    }
    // Sauvegarde des modifications apportées à l'utilisateur
    await user.save();
    // Envoi d'une réponse indiquant que le statut de l'utilisateur a été mis à jour avec succès
    res.status(200).json({ message: "Statut de l'utilisateur mis à jour avec succès" });

    // Send confirmation email to the accepted user
    await sendConfirmationEmail(user.email, "User");
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ message: "Une erreur est survenue", error: error });
  }
};

// Fonction pour interdire un utilisateur
exports.banUser = async (req, res) => {
  try {
    // Recherche de l'utilisateur par son ID
    const user = await User.findById(req.params.id);
    if (!user) {
      // Si aucun utilisateur n'est trouvé, renvoyer une erreur
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    // Mise à jour du statut de l'utilisateur pour l'interdire
    user.status = "interdit";
    // Sauvegarde des modifications apportées à l'utilisateur
    await user.save();
    // Envoi d'une réponse indiquant que l'utilisateur a été interdit avec succès
    res.status(200).json({ message: "Utilisateur interdit avec succès" });
  } catch (error) {
    // Gestion des erreurs
    res.status(500).json({ message: "Une erreur est survenue", error: error });
  }
};
//Fonction pour cree un nouveau admin (works)
exports.createAdmin = async (req, res) => {
  try {
    const adminData =req.body;
   
    // Create a new admin object
    const newAdmin = new Admin({
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      nom: req.body.nom,
      téléphone: req.body.téléphone,
    });

    // Save the new admin to the database
    const savedAdmin = await newAdmin.save();

    // Return a success message with the saved admin object
    res.status(201).json(savedAdmin);
  } catch (error) {
    // Handle errors
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "An error occurred while creating admin", error: error });
  }
};
