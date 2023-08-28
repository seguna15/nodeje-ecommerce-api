const  mongoose = require('mongoose');
const { Category } = require('../models/category.model');
const { Product } = require('../models/product.model');


//get all products
const getProducts = async (req, res) => {
    try {
        //if you want to select some values from the db
        //const products = await Product.find().select('name image -_id')

        let filter = {};
        if(req.query.categories){
             filter = {category: req.query.categories.split(',')}
        }

        const products = await Product.find(filter).populate('category');

        if (!products)
            return res
                .status(404)
                .json({ message: 'no product', success: false })

        return res.status(200).json(products)
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            success: false,
        })
    }
}

//get product
const getProductById = async (req, res) => {
    const { id } = req.params;

    if (!id)
        return res.status(400).json({ message: 'the product does not exit!' })

    if(!mongoose.isValidObjectId(id)){
         return res.status(400).json({ message: 'invalid id!' })
    }

    try {
        const product = await Product.findById(id).populate('category');

        if (!product)
            return res
                .status(404)
                .json({ message: 'no product', success: false })

        return res.status(200).json(product)
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            success: false,
        })
    }
}

//get count of products
const getCount = async (req, res) => {
    try {
        const productCount = await Product.countDocuments()

        if (!productCount) res.status(500).json({success: false})   

        res.status(200).json({count: productCount});
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            success: false,
        })
    }
   
}


//get featured products
const getFeatured = async (req, res) => {
    const count  = parseInt(req.params.count) ? req.params.count : 0;
    try {
        const featuredProduct = await Product.find({isFeatured: true}).limit(count);

        if (!featuredProduct) res.status(404).json({ success: false, message: "featured products not found" });   

        res.status(200).json({ count: featuredProduct })
    } catch (error) {
        return res.status(500).json({
            error: error.message,
            success: false,
        })
    }
   
}

//create products[]
const createProducts = async (req, res) => {
    const {
        name,
        description,
        richDescription,
        brand,
        price,
        category,
        countInStock,
        rating,
        numReviews,
        isFeatured,
    } = req.body

    if (!req.body)
        return res.status(400).json({ message: 'check data sent' })

    const file = req.file;
    if (!file)
        return res
            .status(400)
            .json({ message: 'product image must be uploaded' })
    const fileName = file.filename;
   
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
   

    try {
        const checkCategory = await Category.findById(category)
        if (!checkCategory)
            return res.status(400).json({ message: 'Invalid category' })

        const product = new Product({
            name,
            description,
            richDescription,
            image: `${basePath}${fileName}`,
            brand,
            price,
            category,
            countInStock,
            rating,
            numReviews,
            isFeatured,
        })

        const newProduct = await product.save()
        if (!newProduct)
            return res
                .status(404)
                .json({ message: 'the product cannot be created!' })

        return res.status(201).json(newProduct)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            success: false,
        })
    } 
}

//update products 
const updateProducts = async (req, res) => {
    const { id } = req.params
    if (!id)
        return res.status(404).json({ message: 'kindly check product Id!' })

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'invalid id!' })
    }

    const { 
        name, description, richDescription, image, brand, price, category, countInStock,    rating, numReviews, isFeatured,
    } = req.body;

    if (!req.body)
        return res
            .status(400)
            .json({ message: 'check data sent'});

    try {

        const checkCategory = await Category.findById(category);
        if (!checkCategory)
            return res.status(400).json({ message: 'Invalid category' })

        const product = await Product.findByIdAndUpdate(
            id,
            {
                name, description, richDescription, image, brand, price, category, countInStock,rating, numReviews, isFeatured
            },
            {new: true}
        );

        
        if (!product)
            return res
                .status(404)
                .json({ message: 'the product cannot be created!' })

        return res.status(201).json(product);
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message,
            success: false,
        });
    }
}

//delete product by ID
const deleteProduct =  async (req, res) => {
    const {id} = req.params;
   
    if (!id)
        return res
            .status(400)
            .json({ message: 'check the id!'});

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'invalid id!' })
    }

    try {
        const deletedProduct = await Product.findByIdAndRemove(id);
        if(!deletedProduct) return res
            .status(404)
            .json({ success: false, message: 'the product cannot be deleted!' });

        return res.status(200).json({success: true, message: 'the product has been deleted.'});
    } catch (error) {
         res.status(500).json({
             error: error.message,
             success: false,
         })
    }
}

const updateProductGallery = async (req, res) => {
    const { id } = req.params
    if (!id)
        return res.status(404).json({ message: 'kindly check product Id!' })

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'invalid id!' })
    }

    const files = req.files

    if(!files)  return res.status(400).json({ message: 'product gallery images must be uploaded' })
    try {
         let imagesPaths = []
         const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`

        await files.map((file) => {
             imagesPaths.push(`${basePath}${file.filename}`)
         })
         
         const product = await Product.findByIdAndUpdate(
             id,
             {
                 images: imagesPaths,
             },
             { new: true }
         )
         return res.status(201).json(product);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            success: false,
        })
    }
   


}


module.exports = {
    getProducts,
    getProductById,
    getCount,
    getFeatured,
    createProducts,
    updateProducts,
    deleteProduct,
    updateProductGallery,
}
