const {Order} = require('../models/order.model');
const {OrderItem} = require('../models/order-item.model');

//returns list of all orders
const getOrders = async (req, res) => {
    try {
        // -1 to sort from newest to oldest
        const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});
        if(!orderList) return res.status(400).json({success: false});

        return res.send(orderList);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: error.message,
            success: false,
        })
    }
}

const getUserOrders = async (req, res) => {
    const {userId} = req.params;
    if(!userId) return res.status(404).json({ message: 'the user does not exit!' })
    try {
        // -1 to sort from newest to oldest
        const userOrderList = await Order.find({user: userId})
            .populate({
                path: 'orderItems', populate: { 
                    path: 'product' , populate: 'category'
                }
            })
            .sort({ dateOrdered: -1 })
        if (!userOrderList) return res.status(400).json({ success: false })

        return res.send(userOrderList)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message,
            success: false,
        })
    }
}
//returns a particular order
const getOrder = async (req, res) => {
    const {id} = req.params;
    if(!id) return res.status(404).json({ message: 'the order does not exit!' })
    try {
        // -1 to sort from newest to oldest
        const order = await Order.findById(id)
            .populate('user', 'name')
            .populate({
                path: 'orderItems', populate: { 
                    path: 'product' , populate: 'category'
                }
            });
            
            
        if (!order) return res.status(400).json({ message: 'order not found.' })

        return res.send(order)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message,
            success: false,
        })
    }
}

//create Order
const createOrder = async (req, res) => {
    const {
        orderItems,
        shippingAddress1,
        shippingAddress2,
        city,
        zip,
        country,
        phone,
        status,
        user,
    } = req.body
    //if not request body
    if(!req.body) return res.status(400).json({ message: 'check data sent', success: false })

    const orderItemIds = Promise.all(orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            order: orderItem.product
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem.id;
    }));

    const orderItemIdsResolved = await orderItemIds;

    const totalPrices = await Promise.all(
        orderItemIdsResolved.map(async (orderItemId) => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
            const totalPrice = orderItem.product.price * orderItem.quantity;
            return totalPrice;
        })
    );
    
    const totalPrice = totalPrices.reduce((a, b) =>  a + b, 0);
    
    try {
        let order = new Order({
            orderItems:orderItemIdsResolved,
            shippingAddress1,
            shippingAddress2,
            city,
            zip,
            country,
            phone,
            status,
            totalPrice,
            user,
        })

        order = await order.save();

        if(!order) return res.status(404).json({ message: 'the order cannot be created!' })

        return res.status(201).json(order)
    } catch (error) {
         res.status(500).json({
             error: error.message,
             success: false,
         })
    }
}

//updating order status 
const updateOrder =  async (req, res) => {
    const { id } = req.params
    if (!id)
        return res.status(404).json({ message: 'the order does not exit!' })

    const { status } = req.body;
    if (!status)
        return res
            .status(400)
            .json({ message: 'check data sent', success: false })

    try {
        const order = await Order.findByIdAndUpdate(
            id,
            {
                status
            },
            { new: true }
        )
        if (!order)
            return res.status(404).json({
                message: 'Category with given ID was not found',
            })
        return res.status(200).json({
            order,
        })
    } catch (error) {
        res.status(500).json({
            error: error.message,
            success: false,
        })
    }
}

//deleting order by ID: string
const deleteOrder =  async (req, res) => {
    const {id} = req.params;
    
    if (!id)
        return res
            .status(404)
            .json({ message: 'the order does not exit!' });
    try {
        const foundItem = await Order.findById(id)
        
        if (!foundItem)
            return res.status(404).json({ message: 'the order does not exit!' })
        
        if((foundItem.orderItems).length === 0) return res
            .status(404)
            .json({ message: 'cannot delete order with no order item!' });
        
        //delete Order
        
        const deletedOrder = await Order.findByIdAndRemove(id);
        
        if(!deletedOrder) return res
            .status(404)
            .json({ success: false, message: 'the order cannot be deleted!' });
        
        const deletedOrderItem = deletedOrder.orderItems.map(
            async (orderItem) => {
                await OrderItem.findByIdAndRemove(orderItem)
            }
        ) 
        
        if(!deletedOrderItem)  return res
            .status(404)
            .json({ success: false, message: 'the order item cannot be deleted!' });
        
        return res
            .status(200)
            .json({
                success: true,
                message: 'the order has been deleted.',
            })
    } catch (error) {
         res.status(500).json({
             error: error.message,
             success: false,
         })
    }
    
}

//statistical data 
const getTotalSales = async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null , totalsales: { $sum : '$totalPrice'}}}
    ]);

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated');
    }

    return res.send({totalSales: totalSales.pop().totalsales});
}

const getCount = async (req, res) => {
    try {
        const orderCount = await Order.countDocuments()

        if (!orderCount) res.status(500).json({ success: false })

        res.status(200).json({ count: orderCount })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            success: false,
        })
    }
}

module.exports = {
    getOrders,
    getUserOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getTotalSales,
    getCount
}