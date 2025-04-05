require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./router/userRouter.js");
const port = 5000
const {engine} = require("express-handlebars")

const productRouter = require('./router/productRouter.js')
const categoryRouter = require('./router/categoryRouter.js')
const brandRouter = require('./router/brandRouter.js')


const app = express();
app.use(express.json()); // Middleware để xử lý JSON


app.set("view engine", "ejs");
app.set("views", "./views");

// Middleware để sử dụng file tĩnh (CSS, JS, Ảnh)
app.use(express.static("public"));


app.use('/users', userRouter)
app.use('/products', productRouter)
app.use('/category', categoryRouter)
app.use('/brand', brandRouter)

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("Error:", err));

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
