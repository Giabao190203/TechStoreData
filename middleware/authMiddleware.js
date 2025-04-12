// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Đường dẫn đến userModel của bạn

const authMiddleware = async (req, res, next) => {
    let token;

    // 1. Lấy token từ header 'Authorization'
    // Token thường có dạng "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Tách lấy phần token
            token = req.headers.authorization.split(' ')[1];

            // 2. Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Sử dụng secret key của bạn

            // 3. Lấy thông tin user từ ID trong token (loại bỏ password)
            // Gắn thông tin user (hoặc chỉ userId) vào request để các route sau có thể sử dụng
            req.user = await User.findById(decoded.userId).select('-password');

            if (!req.user) {
                 // Trường hợp token hợp lệ nhưng user không còn tồn tại trong DB
                 throw new Error('Người dùng không tồn tại.');
            }

            next(); // Cho phép đi tiếp đến route handler

        } catch (error) {
            console.error('Lỗi xác thực token:', error.message);
            // Xử lý các lỗi token khác nhau
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Token không hợp lệ.' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token đã hết hạn.' });
            }
            // Các lỗi khác
            return res.status(401).json({ message: 'Không có quyền truy cập.' });
        }
    }

    // 4. Nếu không có token trong header
    if (!token) {
        return res.status(401).json({ message: 'Không có quyền truy cập, không tìm thấy token.' });
    }
};

module.exports = authMiddleware;
