const express = require('express');
const route = express.Router();
const brand = require('../models/brandModel')


route.get('/list', async (req, res) =>{
    const data = await brand.find()
    res.json(data)
})


module.exports = route;