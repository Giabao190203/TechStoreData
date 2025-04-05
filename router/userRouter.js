const express = require('express');
const route = express.Router();
const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const { JsonWebTokenError } = require('jsonwebtoken');

route.get("/list", async (req, res) => {
    const users = await User.find();
    res.json(users);
    console.log(users);
    
});

route.post('/login', async (req, res) => { // Change router to route
    const { email, password } = req.body;

    // Kiểm tra xem email và password có được cung cấp không
    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    try {
        // Tìm người dùng theo email
        const user = await User.findOne({ email });

        // Nếu không tìm thấy người dùng
        if (!user) {
            return res.status(401).json({ message: 'Không tìm thấy địa chỉ email' });
        }

        // So sánh mật khẩu
        const isMatch = await user.comparePassword(password);

        // Nếu mật khẩu không khớp
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác' });
        }

        // Đăng nhập thành công
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
        res.status(200).json({ message: 'Đăng nhập thành công', user, token });

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});


// API đăng ký
route.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Kiểm tra xem name, email và password có được cung cấp không
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin: tên, email và mật khẩu' });
    }

    try {
        // Kiểm tra xem email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email đã được đăng ký' }); // 409 Conflict
        }

        // Tạo người dùng mới
        const newUser = new User({ username, email, password });
        await newUser.save();

        // Đăng ký thành công
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: 'Đăng ký thành công', user: newUser, token }); // 201 Created

    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = route;
