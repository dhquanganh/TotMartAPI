const boxModel = require('../models/Box')
const cloudinary = require('cloudinary').v2
const productModel = require('../models/Product')
require('dotenv').config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

class BoxController {
    async createBox(req, res, next) {
        try {
            const validated = req.validatedBody;
            const newBox = new boxModel(validated);
            newBox.products = validated.products.map(product => {
                return {
                    product: product._id,
                    quantity: product.quantity,
                    name: product.name
                }
            });
            newBox.validFrom = new Date(validated.validFrom);
            newBox.validTo = new Date(validated.validTo);
            newBox.totalItem = validated.products.length;
            newBox.value = validated.products.reduce((acc, product) => acc + product.price * product.quantity, 0);
            let result = [];
            const folderName = req.body.name.trim().toLowerCase().replace(/\s+/g, '-');
            if (req.files && req.files.length > 0) {
                const uploadResults = await Promise.all(
                    req.files.map(file => {
                        return new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { folder: "Box Products/" + folderName, resource_type: "image" },
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
            newBox.images = result;
            await newBox.save();
            res.status(201).json({
                success: true,
                message: 'Box created successfully',
                data: newBox
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllBoxes(req, res, next) {
        try {
            const boxes = await boxModel.find();
            const products = []
            boxes.forEach(async (box) => {
                box.products.forEach(async (product) => {
                    let prd = await productModel.findById(product.productId);
                    products.push({
                        product: prd,
                        quantity: product.quantity,
                    });
                })
            })
            res.status(200).json({
                success: true,
                message: 'Boxes retrieved successfully',
                data: boxes,
                products: products
            });
        } catch (error) {
            next(error);
        }
    }

    async getBoxById(req, res, next) {
        try {
            const box = await boxModel.findById(req.params._id);
            const products = [];
            box.products.forEach(async (product) => {
                let prd = await productModel.findById(product.productId);
                products.push({
                    product: prd,
                    quantity: product.quantity
                });
            })
            box.products = products;
            res.status(200).json({
                success: true,
                message: 'Box retrieved successfully',
                data: box,
                products: products
            });
        } catch (error) {
            next(error);
        }
    }

    async updateBox(req, res, next) {
        try {
            const { _id } = req.params;
            const validated = req.validatedBody;
            validated.validFrom = new Date(validated.validFrom);
            validated.validTo = new Date(validated.validTo);
            validated.totalItem = validated.products.length;
            validated.value = validated.products.reduce((acc, product) => acc + product.price * product.quantity, 0);
            const box = await boxModel.findById(_id);
            if (req.files) {
                const uploadResults = await Promise.all(
                    req.files.map(file => {
                        return new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { folder: "Box Products/" + req.body.name, resource_type: "image" },
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
                for (let i = 0; i < req.files.length; i++) {
                    const match = req.files[i].fieldname.match(/\d+/);
                    if (box.images[match[0]]) {
                        await cloudinary.uploader.destroy(box.images[match[0]].public_id);
                        box.images[match[0]].url = uploadResults[i].url;
                        box.images[match[0]].public_id = uploadResults[i].public_id;
                    }
                }
            }
            box.name = validated.name || box.name;
            box.descriptions = validated.descriptions || box.descriptions;
            box.products = validated.products || box.products;
            box.stock = validated.stock || box.stock;
            box.isGift = validated.isGift || box.isGift;
            box.totalItem = validated.products.length;
            if (validated.productId) {
                validated.productId.forEach(product => {
                    box.products.push({
                        productId: product._id,
                        quantity: product.quantity
                    });
                });
            }
            box.value = validated.products.reduce((acc, product) => acc + product.price * product.quantity, 0);
            await box.save();
            res.status(200).json({
                success: true,
                message: 'Box updated successfully',
                data: box
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteBox(req, res, next) {
        try {
            const foundBox = await boxModel.findById(req.params._id);
            if (foundBox && foundBox.images && foundBox.images.length > 0) {
                const folderName = "Box Products/" + foundBox.name.trim().toLowerCase().replace(/\s+/g, '-');
                await cloudinary.api.delete_resources_by_prefix(folderName);
                await cloudinary.api.delete_folder(folderName);
                await boxModel.findByIdAndDelete(req.params._id);
                return res.status(200).json({
                    success: true,
                    message: 'Box deleted successfully'
                });
            }
            return res.status(404).json({
                success: false,
                message: 'Box not found'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BoxController();