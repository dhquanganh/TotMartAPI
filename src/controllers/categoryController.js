const category = require('../models/Category')
const productModel = require('../models/Product');

class CategoryController {
    async createCategory(req, res, next){
        try {
            const validated = req.validatedBody;
            const newCategory = await category.create(validated);
            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: newCategory
            });
        } catch (error) {
            next(error);
        }
    }

    async updateCategory(req, res, next){
        try {
            const { _id } = req.params;
            const validated = req.validatedBody;
            const updatedCategory = await category.findByIdAndUpdate(_id, validated, { new: true });
            res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: updatedCategory
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteCategory(req, res, next){
        try {
            const { _id } = req.params;
            const products = await productModel.find({ category: _id });
            if (products.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete category with associated products'
                });
            }
            const deletedCategory = await category.findByIdAndDelete(_id);

            res.status(200).json({
                success: true,
                message: 'Category deleted successfully',
                data: deletedCategory
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllCategories(req, res, next){
        try {
            const categories = await category.find();
            res.status(200).json({
                success: true,
                message: 'Categories retrieved successfully',
                data: categories
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategoryController();