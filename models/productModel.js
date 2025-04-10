// d:\Mobile\Technology\dataapp\models\productModel.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "brand",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    screen: { type: String },
    cpu: { type: String },
    cpu_speed: { type: String },
    gpu: { type: String },
    cores: { type: String },
    threads: { type: String },
    ram: { type: String },
    storage: { type: String },
    camera: { type: String },
    pin: { type: String },
    max_charging: { type: String },
    screen_resolution: { type: String },
    operating_system: { type: String },
    color_coverage: { type: String },
    bus_ram: { type: String },
    ram_max: { type: String },
    ram_type: { type: String },
    max_speed: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);

// const mongoose = require("mongoose");

// Schema chung cho sản phẩm
// const productSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     price: { type: Number, required: true },
//     images: [{ type: String }],
//     description: { type: String },
//     quantity: { type: Number, required: true },
//     category_id: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true }
//   },
//   { timestamps: true }
// );

// // Model chính
// const Product = mongoose.model("product", productSchema);

// // Schema riêng cho điện thoại
// const phoneSchema = new mongoose.Schema({
//   screenSize: String,
//   resolution: String,
//   cpu: String,
//   ram: String,
//   storage: String,
//   battery: String,
//   cameras: [String],
//   os: String,
// });

// // Schema riêng cho máy tính
// const laptopSchema = new mongoose.Schema({
//   screenSize: String,
//   resolution: String,
//   cpu: String,
//   gpu: String,
//   ram: String,
//   storage: String,
//   battery: String,
//   os: String,
//   ports: [String],
// });

// // Model phân loại
// const Phone = Product.discriminator("phone", phoneSchema);
// const Laptop = Product.discriminator("laptop", laptopSchema);

// module.exports = { Product, Phone, Laptop };
