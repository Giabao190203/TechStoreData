// d:\Mobile\Technology\dataapp\models\productModel.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model("category", categorySchema);
