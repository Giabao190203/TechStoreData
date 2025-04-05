// d:\Mobile\Technology\dataapp\models\userModel.js
const mongoose = require("mongoose");
const bcrypt = require('bcrypt'); // For password hashing

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Vui lòng nhập tên của bạn'], // Yêu cầu nhập tên
    },
    email: {
        type: String,
        required: [true, 'Vui lòng nhập email'], // Yêu cầu nhập email
        unique: true, // Email phải là duy nhất
        lowercase: true, // Chuyển email về chữ thường
        trim: true, // Xóa khoảng trắng thừa
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Kiểm tra định dạng email
            },
            message: props => `${props.value} không phải là một email hợp lệ!`
        }
    },
    password: {
        type: String,
        required: [true, 'Vui lòng nhập mật khẩu'], // Yêu cầu nhập mật khẩu
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'] // Mật khẩu tối thiểu 6 ký tự
    },
    phone: {
        type: String,
        default: null // Giá trị mặc định là null
    },
    address: {
        type: String,
        default: null // Giá trị mặc định là null
    },
    cart: {
        type: [String], // Mảng các ID sản phẩm
        default: [] // Giá trị mặc định là mảng rỗng
    },
    order: {
        type: [String], // Mảng các ID đơn hàng
        default: [] // Giá trị mặc định là mảng rỗng
    },
    age: Number,
}, { timestamps: true });

// Middleware để hash mật khẩu trước khi lưu vào database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Nếu mật khẩu không thay đổi, bỏ qua

    const salt = await bcrypt.genSalt(10); // Tạo salt
    this.password = await bcrypt.hash(this.password, salt); // Hash mật khẩu
    next();
});

// Phương thức để so sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("user", userSchema);
