// Ví dụ trong router giỏ hàng (cartRouter.js)
const express = require("express");
const router = express.Router();
const Cart = require("../models/cartModel");
const authMiddleware = require("../middleware/authMiddleware"); // Middleware xác thực JWT của bạn
const { default: mongoose } = require("mongoose");
const productModel = require("../models/productModel");

// GET /api/cart - Lấy giỏ hàng của người dùng đang đăng nhập
router.get("/api/list", authMiddleware, async (req, res) => {
  try {
    // authMiddleware đã xác thực và gắn thông tin user vào req (ví dụ: req.user)
    const userId = req.user.id; // Lấy userId từ thông tin user đã xác thực

    // Tìm giỏ hàng của user đó, và populate thông tin sản phẩm nếu cần
    const cart = await Cart.findOne({ userId: userId }).populate({
      path: "items.productId", // Populate thông tin sản phẩm trong giỏ
      select: "name price images", // Chỉ lấy các trường cần thiết của sản phẩm
    });

    if (!cart) {
      // Nếu người dùng chưa có giỏ hàng, bạn có thể trả về giỏ hàng rỗng hoặc tạo mới tùy logic
      return res
        .status(200)
        .json({ items: [], totalPrice: 0, totalQuantity: 0 });
      // Hoặc: return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
    }

    // Tính toán lại totalPrice nếu cần (hoặc sử dụng virtual field nếu đã cấu hình)
    // Lưu ý: Virtual field 'totalPrice' cần populate như trên để hoạt động đúng
    const totalPrice = cart.totalPrice; // Sử dụng virtual field
    const totalQuantity = cart.totalQuantity; // Sử dụng virtual field

    res.status(200).json({
      _id: cart._id,
      userId: cart.userId,
      items: cart.items,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      totalPrice: totalPrice, // Trả về tổng giá
      totalQuantity: totalQuantity, // Trả về tổng số lượng
    });
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy giỏ hàng" });
  }
});

router.post("/api/add-items", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ thông tin user đã xác thực
    const { productId, quantity } = req.body; // Lấy thông tin từ body request

    //validate
    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ error: "ID sản phẩm và số lượng là bắt buộc" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "ID sản phẩm không hợp lệ" });
    }

    const numQuantity = parseInt(quantity, 10); // Chuyển đổi sang số nguyên
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return res
        .status(400)
        .json({ error: "Số lượng phải là số nguyên dương" });
    }

    //lấy thông tin sp (đặc biệt là giá)
    const product = await productModel.findById(productId).select("price"); //lấy giá là đủ
    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }
    if (typeof product.price !== "number") {
      console.error(`Giá sản phẩm ${productId} không hợp lệ`);
      return res.status(400).json({ error: "Giá sản phẩm không hợp lệ" });
    }

    const priceAtAddition = product.price; // Lưu giá tại thời điểm thêm vào giỏ

    // Tìm giỏ hàng của người dùng
    let cart = await Cart.findOne({ userId: userId });

    if (cart) {
      //giỏ hàng đã tồn tại
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        //sp đã có trong giỏ hàng => cập nhật sl
        cart.items[itemIndex].quantity += numQuantity;
      } else {
        cart.items.push({ productId, quantity: numQuantity, priceAtAddition });
      }
      await cart.save();
    } else {
      //tạo mới giỏ hàng nếu chưa có
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity: numQuantity, priceAtAddition }],
      });
    }

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "name price images",
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Dữ liệu không hợp lệ", error: error.errors });
    }
    res
      .status(500)
      .json({ error: "Lỗi máy chủ khi thêm sản phẩm vào giỏ hàng" });
  }
});

//cập nhật số lượng
router.patch("/api/update-items", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // --- Validation ---
    if (!productId || quantity === undefined) {
      // Kiểm tra cả productId và quantity
      return res
        .status(400)
        .json({ message: "ID sản phẩm và số lượng mới là bắt buộc" });
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }
    const numQuantity = parseInt(quantity, 10);
    // Cho phép số lượng bằng 0 (để xóa sản phẩm)
    if (isNaN(numQuantity) || numQuantity < 0) {
      return res
        .status(400)
        .json({ message: "Số lượng phải là một số không âm (0 để xóa)" });
    }
    // --- End Validation ---

    // Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    // Tìm vị trí của sản phẩm trong mảng items
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Sản phẩm này không có trong giỏ hàng của bạn" });
    }

    // Xử lý cập nhật hoặc xóa
    if (numQuantity === 0) {
      // Nếu số lượng là 0, xóa sản phẩm khỏi giỏ hàng
      cart.items.splice(itemIndex, 1);
    } else {
      // Nếu số lượng > 0, cập nhật số lượng
      // Kiểm tra ràng buộc số lượng tối thiểu trong schema (nếu cần)
      if (numQuantity < 1) {
        // Giả sử schema yêu cầu quantity >= 1
        return res
          .status(400)
          .json({ message: "Số lượng phải ít nhất là 1 (hoặc 0 để xóa)" });
      }
      cart.items[itemIndex].quantity = numQuantity;
      // Giữ nguyên priceAtAddition
    }

    // Lưu thay đổi vào database
    await cart.save();

    // Populate lại thông tin sản phẩm để trả về client
    // Ngay cả khi xóa item, chúng ta vẫn trả về giỏ hàng đã cập nhật
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "name price images", // Đảm bảo populate giống các endpoint khác
    });

    // Trả về giỏ hàng đã được cập nhật (bao gồm cả virtuals)
    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng sản phẩm trong giỏ hàng:", error);
    if (error.name === "ValidationError") {
      // Xử lý lỗi validation từ Mongoose (ví dụ: nếu có ràng buộc khác bị vi phạm)
      return res
        .status(400)
        .json({
          message: "Dữ liệu cập nhật không hợp lệ",
          errors: error.errors,
        });
    }
    res.status(500).json({ message: "Lỗi máy chủ khi cập nhật giỏ hàng" });
  }
});

module.exports = router;
