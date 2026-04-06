const productModel = require('../models/Product');
const brandModel = require('../models/Brand');
const categoryModel = require('../models/Category');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

class ProductController {
    async createProduct(req, res, next){
        try {
            const validated = req.validatedBody;
            const newProduct = new productModel(validated);
            let result = [];
            const folderName = req.body.name.trim().toLowerCase().replace(/\s+/g, '-');
            if (req.files && req.files.length > 0) {
                const uploadResults = await Promise.all(
                    req.files.map(file => {
                        return new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { folder: "products/" + folderName, resource_type: "image" },
                                (error, result) => {
                                    if (error) return reject(error);
                                    resolve({
                                        url: result.secure_url,
                                        public_id: result.public_id,
                                    });
                                }
                            );
                            stream.end(file.buffer);
                        });
                    })
                );

                result = uploadResults;
            }
            newProduct.images = result;q 
            await newProduct.save();
            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: newProduct
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();