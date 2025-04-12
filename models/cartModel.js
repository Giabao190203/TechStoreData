// models/cartModel.js
const mongoose = require("mongoose");

// Schema cho một sản phẩm trong giỏ hàng
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product", // Tham chiếu đến model Product của bạn (productModel.js)
    required: [true, 'ID sản phẩm là bắt buộc'],
  },
  quantity: {
    type: Number,
    required: [true, 'Số lượng là bắt buộc'],
    min: [1, 'Số lượng phải ít nhất là 1'], // Số lượng tối thiểu là 1
    default: 1,
  },
  // Bạn có thể thêm các trường khác cho mỗi item nếu cần, ví dụ:
  priceAtAddition: { // Lưu giá tại thời điểm thêm vào giỏ
    type: Number,
    required: true
  },
  // color: String,
  // size: String,
}, { _id: false }); // Không cần _id riêng cho từng item trong mảng items

// Schema chính cho giỏ hàng
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // Tham chiếu đến model User của bạn (userModel.js)
      required: [true, 'ID người dùng là bắt buộc'],
      unique: true, // Đảm bảo mỗi người dùng chỉ có một giỏ hàng duy nhất
      index: true, // Tạo index để tăng tốc độ truy vấn theo userId
    },
    items: [cartItemSchema], // Mảng chứa các sản phẩm trong giỏ hàng
    // Bạn có thể thêm các trường khác cho giỏ hàng nếu cần, ví dụ:
    // couponCode: String,
    // discountAmount: Number,
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    // Cấu hình để bao gồm các trường ảo khi chuyển đổi sang JSON/Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// --- (Tùy chọn) Trường ảo để tính tổng giá trị giỏ hàng ---
// Lưu ý: Việc tính toán này yêu cầu bạn phải .populate() thông tin sản phẩm (đặc biệt là giá) khi truy vấn giỏ hàng.
cartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => {
    // Đảm bảo item.productId đã được populate và có trường price
    if (typeof item.priceAtAddition === 'number') {
      return total + (item.quantity * item.productId.price);
    }
    console.warn("Giá sản phẩm không hợp lệ hoặc chưa được populate:", item.productId);
    return total; // Trả về tổng giá trị hiện tại nếu không có giá hợp lệ
    
  }, 0); // Giá trị khởi tạo là 0
});

// --- (Tùy chọn) Trường ảo để tính tổng số lượng sản phẩm ---
cartSchema.virtual('totalQuantity').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});


// Tạo model từ schema
const Cart = mongoose.model("cart", cartSchema);

module.exports = Cart;
