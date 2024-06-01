const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "wildme",
  api_key: "697235533458487",
  api_secret: "W7C06RxFgL53KFbarGgRKFX4_RU",
});

module.exports = cloudinary;
