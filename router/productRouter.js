const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const { upload, cloudinary } = require('../clouldinary/cloudinaryConfig');
const Category = require('../models/categoryModel');
const brandModel = require('../models/brandModel');
const { default: mongoose } = require('mongoose');
const productModel = require('../models/productModel');

function formatPrice(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

//danh sách sản phẩm (JSON)
router.get('/api/list', async (req, res, next) => {
    try {
        const products = await Product.find({}) ;
        res.json(products);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách", error);
        res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm" });
    }
});

//render trang thêm mới 
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

//lấy danh sách(render)
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



//thêm mới sản phẩm
router.post('/addProduct',upload.array('images', 10), async (req,res) => {
    console.log("Thêm sản phẩm mới");

    try {
        // Log the request body for debugging
        // Validate request body
        const { name, brand, category, description, price, screen, cpu, cpu_speed, gpu, ram, storage, camera, pin, max_charging, screen_resolution, operating_system, cores, threads, ram_max, ram_type, bus_ram, max_speed, color_coverage } = req.body;
        if (!name || !brand || !category || !description || !price) {
            return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin sản phẩm: name, brand, category, description, price, screen, cpu, ram, storage" });
        }
        console.log("Request body:", req.body); // Log request body for debugging
        
        // Handle multiple image uploads
        const imagePromises = req.files.map(file => cloudinary.uploader.upload(file.path));
        const images = await Promise.all(imagePromises);
        const imageUrls = images.map(image => image.secure_url);
        console.log("Uploaded images:", imageUrls); // Log uploaded images for debugging
        

        // Create new product
        const newProduct = new Product({
            name,
            brand,
            category,
            description,
            images: imageUrls, // Set the first image as the main image
            price: parseFloat(price), // Parse price to number
            screen,
            cpu,
            cpu_speed,
            gpu,
            ram,
            storage,
            camera,
            pin,
            max_charging,
            screen_resolution,
            operating_system,
            cores,
            threads,
            ram_max,
            ram_type,
            bus_ram,
            max_speed,
            color_coverage
        });

        // Save product to database
        const savedProduct = await newProduct.save();
        console.log("Sản phẩm đã được thêm:", savedProduct);
        
        res.redirect('/products/list')

        // res.status(201).json({ message: "Thêm sản phẩm thành công!", product: savedProduct });
        // res.status(200).json(savedProduct); // Redirect to the product list page after adding a product
    } catch (error) {
        console.error("Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ error: "Lỗi khi thêm sản phẩm" });
    }
    
})

//lấy chi tiết theo id(api)
router.get('/api/details/:id', async (req,res) => {
    try {
        const productId = req.params.id;
        if(!mongoose.Types.ObjectId.isValid(productId)){
            return res.status(400).json({ error: "ID sản phẩm không hợp lệ" });
        }

        const product = await productModel.findById(productId).populate('category').populate('brand');

        if(!product){
            return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
        }

        res.json(product);


    } catch (error) {
        console.log("Lỗi khi lấy chi tiết sản phẩm:", error);
    }
});

//lấy danh sách theo id(render)
router.get('/details/:id', async (req, res) => { // Đường dẫn khớp với href trong list
    try {
        const productId = req.params.id;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.warn(`Yêu cầu chi tiết sản phẩm với ID không hợp lệ: ${productId}`);
            return res.status(400).render('error_page', { message: 'ID sản phẩm không hợp lệ.' });
        }

        // Tìm sản phẩm bằng ID và populate thông tin brand, category
        // Sử dụng Product thay vì productModel
        const product = await Product.findById(productId)
            .populate('brand')
            .populate('category');

        // Kiểm tra nếu không tìm thấy sản phẩm
        if (!product) {
            console.warn(`Không tìm thấy sản phẩm với ID: ${productId}`);
            return res.status(404).render('error_page', { message: 'Không tìm thấy sản phẩm bạn yêu cầu.' });
        }

        // Render trang chi tiết và truyền dữ liệu sản phẩm, hàm formatPrice
        // Đảm bảo tên view là 'product_detail.ejs' hoặc tên bạn đã tạo
        res.render('products_details', {
            product: product,
            formatPrice: formatPrice // Truyền hàm formatPrice vào view
        });

    } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm để hiển thị:", error);
        // Render trang lỗi 500
        res.status(500).render('error_page', { message: 'Lỗi máy chủ khi tải chi tiết sản phẩm.' });
    }
});



 

module.exports = router;
