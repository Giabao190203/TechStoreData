const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const { upload, cloudinary } = require('../clouldinary/cloudinaryConfig');
const Category = require('../models/categoryModel');
const brand = require('../models/brandModel');
const brandModel = require('../models/brandModel');
const { default: mongoose } = require('mongoose');

function formatPrice(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

router.get('/api/list', async (req, res, next) => {
    try {
        const products = await Product.find({}) ;
        res.json(products);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách", error);
        res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm" });
    }
});

router.get('/add', async (req, res) => {
    try {
        const data = await Category.find();
        const brands = await brandModel.find();
        res.render('product_add', { categories: data, brands: brands });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách thương hiệu/phân loại", error);
        res.status(500).json({ error: "Lỗi khi lấy danh sách thương hiệu/phân loại" });
    }
});

router.post('/add-product', upload.array('images', 10), async (req, res) => {
    try {
        // Validate request body
        const { name, brand, category, description, price, specs } = req.body;
        if (!name || !brand || !category || !description || !price) {
            return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin sản phẩm: name, brand, category, description, price" });
        }

        // Handle multiple image uploads
        const imagePromises = req.files.map(file => cloudinary.uploader.upload(file.path));
        const images = await Promise.all(imagePromises);
        const imageUrls = images.map(image => image.secure_url);

        // Handle specs array (updated)
        let productSpecs = [];
        if (specs && Array.isArray(specs)) {
            productSpecs = specs.map(spec => ({
                name: spec // Now, spec itself is the name
            }));
        }

        // Create new product
        const newProduct = new Product({
            name,
            brand,
            category,
            description,
            image: imageUrls, // Set the first image as the main image
            price: parseFloat(price), // Parse price to number
            specs: specs || {}
        });

        // Save product to database
        const savedProduct = await newProduct.save();

        // res.status(201).json({ message: "Thêm sản phẩm thành công!", product: savedProduct });
        res.redirect('/products/list');
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ error: "Lỗi khi thêm sản phẩm" });
    }
});

router.get('/list', async (req, res, next) => {
    try {
        console.log("Query params:", req.query.category); // Log query parameters for debugging
        
        let filter = {};
        // Nếu có query category và không phải là 'all', lọc theo category
        if (req.query.category && req.query.category !== 'all') {
          // Giả sử trong Product, trường category được lưu dưới dạng ObjectId
          // Và query của bạn sẽ chứa giá trị là category id
          filter.category = req.query.category;
        }
    
        const products = await Product.find(filter)
          .populate('brand')
          .populate('category');
    
        // Lấy danh sách tất cả các danh mục để hiển thị trong dropdown
        const categories = await Category.find();
    
        res.render('product_list', { 
          products: products, 
          formatPrice, 
          categories, 
          selectedCategory: req.query.category || 'all' 
        });
      } catch (error) {
        console.error("Lỗi khi lấy danh sách", error);
        res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm" });
      }
});

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("Chưa tải lên ảnh");
        }

        const image = await cloudinary.uploader.upload(req.file.path);

        const uploads = {
            url: image.secure_url,
            filename: image.public_id,
        };

        res.status(200).json({ message: "upload thành công", image: uploads });

    } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
        res.status(500).json({ error: "Lỗi khi upload ảnh" });
    }
});

router.get('/list-phone', async (req, res) => {
    res.render('list_phone', { formatPrice });
})


router.get('/category/:id/products', async (req, res, next) => {
    const categoryId = req.params._id;

  try {
    const category = await Category.findById(categoryId);
    const products = await Product.find({ categoryId });

    console.log('Category:', category);
    console.log('Products:', products);
    

    res.render('list_phone', {
      category,
      products
    });
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo danh mục:', error);
    res.status(500).send('Lỗi server');
  }
});



 

module.exports = router;
