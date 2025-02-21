const { Commande } = require("../models/order");
const { OrderItem } = require("../models/order-item");
const mongoose = require("mongoose");

// Contrôleur des commandes
const ordersController = {
  // Récupérer toutes les commandes
  getAllOrders: async (req, res) => {
    try {
      // Retrieve all orders with details of associated products
      const orderList = await Commande.find().populate({
        path: "articlesCommandés",
        populate: {
          path: "produit",
          select: "nom", // Select only the product name
        },
      });

      // Check if orders exist
      if (!orderList) {
        return res.status(500).json({ success: false });
      }

      // Map the populated order items to include product name and quantity
      const formattedOrders = orderList.map((order) => {
        const formattedOrderItems = order.articlesCommandés.map(
          (orderItem) => ({
            nom: orderItem.produit.nom,
            quantité: orderItem.quantité,
          })
        );
        return {
          _id: order._id,
          adresseLivraison1: order.adresseLivraison1,
          adresseLivraison2: order.adresseLivraison2,
          ville: order.ville,
          codePostal: order.codePostal,
          pays: order.pays,
          téléphone: order.téléphone,
          statut: order.statut,
          prixTotal: order.prixTotal,
          utilisateur: order.utilisateur,
          dateCommande: order.dateCommande,
          fournisseurId: order.fournisseurId,
          articlesCommandés: formattedOrderItems,
        };
      });

      // Send the formatted orders to the client
      res.send(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Récupérer une commande par son ID
  getOrderById: async (req, res) => {
    try {
      // Récupération d'une commande par son ID avec les détails de l'utilisateur et des éléments de commande associés
      const order = await Order.findById(req.params.id)
        .populate("user", "name")
        .populate({
          path: "orderItems",
          populate: {
            path: "product",
            populate: "category",
          },
        });

      // Vérification de l'existence de la commande
      if (!order) {
        res.status(500).json({ success: false });
      }
      // Envoi de la commande
      res.send(order);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la commande par son ID :",
        error
      );
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Créer une nouvelle commande
  createOrder: async (req, res) => {
    try {
      console.log(req.body.orderItems);
      // Création des éléments de commande
      const orderItemsIds = Promise.all(
        req.body.orderItems.map(async (orderItem) => {
          let newOrderItem = new OrderItem({
            quantité: orderItem.quantity,
            produit: orderItem.productId,
          });

          newOrderItem = await newOrderItem.save();

          return newOrderItem._id;
        })
      );
      const orderItemsIdsResolved = await orderItemsIds;

      // Création de la commande
      let order = new Commande({
        articlesCommandés: orderItemsIdsResolved,
        adresseLivraison1: req.body.adresseLivraison1,
        adresseLivraison2: req.body.adresseLivraison2,
        fournisseurId: req.body.fournisseurId,
        ville: req.body.ville,
        codePostal: req.body.codePostal,
        pays: req.body.pays,
        téléphone: req.body.téléphone,
        statut: req.body.statut,
        prixTotal: req.body.prixTotal,
        user: req.body.user,
      });
      order = await order.save();

      // Vérification de la création de la commande
      if (!order) {
        return res.status(400).send("La commande ne peut pas être créée !");
      }
      // Envoi de la commande créée
      res.send(order);
    } catch (error) {
      console.error(
        "Erreur lors de la création d'une nouvelle commande :",
        error
      );
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Mettre à jour une commande
  updateOrder: async (req, res) => {
    try {
      // Mise à jour de la commande
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
          status: req.body.status,
        },
        { new: true }
      );

      // Vérification de la mise à jour de la commande
      if (!order) {
        return res
          .status(400)
          .send("La commande ne peut pas être mise à jour !");
      }
      // Envoi de la commande mise à jour
      res.send(order);
    } catch (error) {
      console.error("Erreur lors de la mise à jour d'une commande :", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Supprimer une commande
  deleteOrder: async (req, res) => {
    try {
      // Suppression de la commande et de ses éléments associés
      const order = await Order.findByIdAndRemove(req.params.id);
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "La commande est supprimée !" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Commande non trouvée !" });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression d'une commande :", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtenir le total des ventes
  getTotalSales: async (req, res) => {
    try {
      // Calcul du total des ventes
      const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
      ]);

      // Vérification de l'obtention du total des ventes
      if (!totalSales) {
        return res
          .status(400)
          .send("Les ventes totales ne peuvent pas être générées");
      }
      // Envoi du total des ventes
      res.send({ totalsales: totalSales.pop().totalsales });
    } catch (error) {
      console.error("Erreur lors de l'obtention du total des ventes :", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtenir le nombre total de commandes
  getOrderCount: async (req, res) => {
    try {
      // Obtention du nombre total de commandes
      const orderCount = await Order.countDocuments((count) => count);

      // Vérification de l'obtention du nombre total de commandes
      if (!orderCount) {
        res.status(500).json({ success: false });
      }
      // Envoi du nombre total de commandes
      res.send({ orderCount: orderCount });
    } catch (error) {
      console.error(
        "Erreur lors de l'obtention du nombre total de commandes :",
        error
      );
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Récupérer les commandes d'un utilisateur par son ID
  getUserOrders: async (req, res) => {
    try {
      // Récupération des commandes d'un utilisateur par son ID
      const userOrderList = await Order.find({ user: req.params.userid })
        .populate({
          path: "orderItems",
          populate: {
            path: "product",
            populate: "category",
          },
        })
        .sort({ dateOrdered: -1 });

      // Vérification de l'existence de commandes pour cet utilisateur
      if (!userOrderList) {
        res.status(500).json({ success: false });
      }
      // Envoi des commandes de l'utilisateur
      res.send(userOrderList);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des commandes d'un utilisateur :",
        error
      );
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = ordersController;
