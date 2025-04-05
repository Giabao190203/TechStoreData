const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: "dbgbqryac", // Thay bằng Cloud name của bạn
  api_key: "542353172915111", // Thay bằng API Key của bạn
  api_secret: "nGGp2QjnAN2Iabls1D5UvocNHFg", // Thay bằng API Secret của bạn
});

// Cấu hình Multer để lưu file trên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tech-image", // Thư mục lưu trữ trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Các định dạng được phép
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };