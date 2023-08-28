const express = require('express');
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getTotalSales,
    getCount,
    getUserOrders,
} = require('../controllers/order.controller')
const router = express.Router();

router
    .get(`/`, getOrders)
    .get(`/:id`, getOrder)
    .get('/get/totalsales', getTotalSales)
    .get('/get/count', getCount)
    .get('/get/userorders/:userId', getUserOrders)
    .post(`/`, createOrder)
    .patch(`/:id`, updateOrder)
    .delete(`/:id`, deleteOrder)

module.exports = router
