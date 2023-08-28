const express = require('express');
const { getProducts, createProducts, getProductById, updateProducts, deleteProduct, getCount, getFeatured, updateProductGallery } = require('../controllers/product.controller');
const uploadOptions = require('../util/imageUpload.util');
const router = express.Router();

router
    .get(`/`, getProducts)
    .get(`/get/count`, getCount)
    .get(`/get/featured/:count`, getFeatured)
    .get(`/:id`, getProductById)
    .post(`/`, uploadOptions.single('image'), createProducts)
    .put(`/:id`, updateProducts)
    .patch('/gallery-images/:id',uploadOptions.array('images', 5), updateProductGallery)
    .delete(`/:id`, deleteProduct)
module.exports = router
