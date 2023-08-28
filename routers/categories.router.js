const express = require('express');
const { getCategories, createCategory, deleteCategory, getCategory, updateCategory } = require('../controllers/category.controller');
const router = express.Router();

router
    .get(`/`, getCategories)
    .get('/:id', getCategory)
    .post('/', createCategory)
    .put('/:id', updateCategory)
    .delete('/:id', deleteCategory)

module.exports = router
