const { Product } = require("../models/product");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinaryConfig");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const productsController = {
  //works
  getAllProducts: async (req, res) => {
    try {
      const productList = await Product.find();
      res.send(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  //works
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
      }
      res.send(product);
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  //works
  createProduct: async (req, res) => {
    const pictures = req.files;
    console.log(req.body);
    let uploadedAlbum = [];
    if (pictures && pictures.length > 0) {
      const tempFolderPath = path.join(__dirname, "..", "temp");
      if (!fs.existsSync(tempFolderPath)) {
        fs.mkdirSync(tempFolderPath);
      }

      try {
        // Upload pictures to Cloudinary and get their URLs
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

            uploadedAlbum.push(result.secure_url);
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
      const product = new Product({ ...req.body, images: uploadedAlbum });
      const result = await product.save();
      res.send(result);
    } catch (error) {
      console.log(error);
      console.error("Error creating product:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  //works
  updateProduct: async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid product ID");
      }
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedProduct) {
        return res.status(404).send("Product not found!");
      }
      res.send(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndRemove(req.params.id);
      if (!deletedProduct) {
        return res.status(404).send("Product not found!");
      }
      res
        .status(200)
        .json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getProductCount: async (req, res) => {
    try {
      const productCount = await Product.countDocuments();
      res.send({ productCount });
    } catch (error) {
      console.error("Error fetching product count:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getFeaturedProducts: async (req, res) => {
    try {
      const count = req.params.count ? req.params.count : 0;
      const featuredProducts = await Product.find({
        estMisEnAvant: true,
      }).limit(+count);
      res.send(featuredProducts);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  updateProductGallery: async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Invalid product ID");
      }
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).send("Product not found!");
      }
      const images = req.body.images;
      product.images = images;
      const updatedProduct = await product.save();
      res.send(updatedProduct);
    } catch (error) {
      console.error("Error updating product gallery:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = productsController;
