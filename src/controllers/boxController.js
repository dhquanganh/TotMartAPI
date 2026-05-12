const { get } = require('mongoose')
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

            const productIds = validated.products.map(p => p.productId);
            const productDocs = await productModel.find({ _id: { $in: productIds } });
            const productMap = new Map(productDocs.map(doc => [doc._id.toString(), doc]));

            const builtProducts = validated.products
                .map(item => {
                    const product = productMap.get(item.productId.toString());
                    if (!product) return null;
                    return {
                        productId: product._id,
                        quantity: item.quantity,
                        price: product.price,
                        name: product.name
                    };
                })
                .filter(Boolean);

            // Upload ảnh nếu có
            let images = [];
            if (req.files && req.files.length > 0) {
                const folderName = validated.name.trim().toLowerCase().replace(/\s+/g, '-');
                images = await Promise.all(
                    req.files.map(file => {
                        return new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { folder: "Box Products/" + folderName, resource_type: "image" },
                                (error, result) => {
                                    if (error) return reject(error);
                                    resolve({ url: result.secure_url, public_id: result.public_id });
                                }
                            );
                            stream.end(file.buffer);
                        });
                    })
                );
            }

            const subtotal = builtProducts.reduce(
                (acc, item) => acc + item.price * item.quantity, 0
            );
            const value = validated.discountPercent > 0
                ? subtotal * (1 - validated.discountPercent / 100)
                : subtotal;

            const { products, ...rest } = validated;
            const newBox = new boxModel({
                ...rest,
                products: builtProducts,
                images,
                validFrom: new Date(),
                validTo: new Date(validated.validTo),
                totalItem: builtProducts.length,
                value
            });

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

            const box = await boxModel.findById(_id);
            if (!box) {
                return res.status(404).json({ success: false, message: 'Box not found' });
            }

            if (req.files && req.files.length > 0) {
                const uploadResults = await Promise.all(
                    req.files.map(file => {
                        return new Promise((resolve, reject) => {
                            const stream = cloudinary.uploader.upload_stream(
                                { folder: "Box Products/" + (validated.name || box.name), resource_type: "image" },
                                (error, result) => {
                                    if (error) return reject(error);
                                    resolve({ url: result.secure_url, public_id: result.public_id });
                                }
                            );
                            stream.end(file.buffer);
                        });
                    })
                );

                for (let i = 0; i < req.files.length; i++) {
                    const match = req.files[i].fieldname.match(/\d+/);
                    if (match && box.images[match[0]]) {
                        await cloudinary.uploader.destroy(box.images[match[0]].public_id);
                        box.images[match[0]].url = uploadResults[i].url;
                        box.images[match[0]].public_id = uploadResults[i].public_id;
                    }
                }
            }

            box.name = validated.name ?? box.name;
            box.descriptions = validated.descriptions ?? box.descriptions;
            box.stock = validated.stock ?? box.stock;
            box.isGift = validated.isGift ?? box.isGift;
            box.discountPercent = validated.discountPercent ?? box.discountPercent;
            if (validated.validTo) {
                box.validTo = new Date(validated.validTo);
            }

            if (validated.products !== undefined) {
                if (validated.products.length === 0) {
                    box.products = [];
                } else {
                    const productIds = validated.products.map(p => p.productId);
                    const productDocs = await productModel.find({ _id: { $in: productIds } });
                    const productMap = new Map(productDocs.map(doc => [doc._id.toString(), doc]));

                    box.products = validated.products
                        .map(item => {
                            const product = productMap.get(item.productId.toString());
                            if (!product) return null;
                            return {
                                productId: product._id,
                                quantity: item.quantity,
                                price: product.price,
                                name: product.name
                            };
                        })
                        .filter(Boolean);
                }
            }

            box.totalItem = box.products.length;
            const subtotal = box.products.reduce(
                (acc, item) => acc + item.price * item.quantity, 0
            );
            box.value = box.discountPercent > 0
                ? subtotal * (1 - box.discountPercent / 100)
                : subtotal;

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

    async getProductsInBox(req, res, next) {
        try {
            const box = await boxModel.findById(req.params._id);
            if (!box) {
                return res.status(404).json({
                    success: false,
                    message: 'Box not found'
                });
            }
            const products = [];
            for (const item of box.products) {
                const product = await productModel.findById(item.productId);
                if (product) {
                    products.push({
                        product: product,
                        quantity: item.quantity
                    });
                }
            }
            res.status(200).json({
                success: true,
                message: 'Products in box retrieved successfully',
                data: products
            });
        } catch (error) {
            next(error);
        }
    }

    async getBoxOfferDicountCoupons(req, res, next) {
        try {
            const discountBox = await boxModel.find({ discountPercent: { $gt: 0 } });
            const newBox = await boxModel.find({ isGift: true, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
            const giftBox = await boxModel.find({ isGift: true });
            res.status(200).json({
                success: true,
                message: 'Discount boxes retrieved successfully',
                data: {
                    discountBoxes: discountBox,
                    newBoxes: newBox,
                    giftBoxes: giftBox
                }
            });
        } catch (error) {
            next(error);
        }
    }
}


module.exports = new BoxController();