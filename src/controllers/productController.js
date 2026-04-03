const productModel = require('../models/Product');

class ProductController {
    async createProduct(req, res, next){
        try {
            
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();