const express = require('express');
const route = express.Router();
const category = require('../models/categoryModel')


route.get('/list', async (req, res) =>{
    const data = await category.find()
    res.json(data)
})


module.exports = route;