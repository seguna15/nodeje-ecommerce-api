const {Category} = require('../models/category.model');

//get all categories 
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();

        if(!categories) return res.status(500).json({ success: false })

        res.status(200).send(categories);
    } catch (error) {
        res.status(500).json({
            error: error.message,
            success: false,
        })
    }
}

//get category by ID
const getCategory = async(req, res) => {
    const {id} = req.params;
    if (!id) return res.status(404).json({ message: 'the category does not exit!' })

    try {
        const category = await Category.findById(id);
        if (!category)
            return res
                .status(404)
                .json({
                    message: 'Category with given ID was not found',
                })
         return res.status(200).json({
             category
         })
    } catch (error) {
        res.status(500).json({
            error: error.message,
            success: false,
        })
    }
}

//create category
const createCategory = async (req, res) => {
    const { name, icon, colour } = req.body;
    //if not request body
    if(!req.body) return res.status(400).json({ message: 'check data sent', success: false })

    try {
        const category = new Category({
            name,
            icon,
            colour,
        });

        const newCategory = await category.save();

        if(!newCategory) return res.status(404).json({ message: 'the category cannot be created!' })

        return res.status(201).json(newCategory)
    } catch (error) {
         res.status(500).json({
             error: error.message,
             success: false,
         })
    }
}

//update category by ID
const updateCategory = async (req, res) => {
    const {id} = req.params;
    if (!id) return res.status(404).json({ message: 'the category does not exit!' })

    const { name, icon, colour } = req.body;
    if (!req.body)
        return res
            .status(400)
            .json({ message: 'check data sent', success: false })

    try {
        const category = await Category.findByIdAndUpdate(
            id, {
                name,
                icon,
                colour,
            }, 
            {new: true}
        );
        if (!category)
            return res
                .status(404)
                .json({
                    message: 'Category with given ID was not found',
                })
         return res.status(200).json({
             category
         })
    } catch (error) {
        res.status(500).json({
            error: error.message,
            success: false,
        })
    }
}

//deleting categories by ID: string
const deleteCategory =  async (req, res) => {
    const {id} = req.params;
   
    if (!id)
        return res
            .status(404)
            .json({ message: 'the category does not exit!' });
    try {
        const deletedCategory = await Category.findByIdAndRemove(id);
        if(!deletedCategory) return res
            .status(404)
            .json({ success: false, message: 'the category cannot be deleted!' });

        return res.status(200).json({success: true, message: 'the category has been deleted.'});
    } catch (error) {
         res.status(500).json({
             error: error.message,
             success: false,
         })
    }
    
}

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
}