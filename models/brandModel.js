// d:\Mobile\Technology\dataapp\models\productModel.js
const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model("brand", brandSchema);
