const Cart = require("../models/Cart");
const SubcribePlan = require("../models/SubcribePlan");

class CartController {
    async addToCart(req, res, next) {
        try {
            if (req.user) {
                const { userId, productId, quantity } = req.body;
                const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price');
                if (cart) {
                    const item = cart.items.find(item => item.productId.toString() === productId);
                    if (item) {
                        item.quantity += quantity;
                    } else {
                        cart.items.push({ productId, quantity });
                    }
                    cart.totalPrice += quantity * item.productId.price;
                    await cart.save();
                    res.status(200).json({
                        success: true,
                        message: 'Item added to cart successfully',
                        data: cart
                    });
                } else {
                    const newCart = new Cart({ userId, items: [{ productId, quantity }], totalPrice: quantity * item.productId.price });
                    await newCart.save();
                    res.status(201).json({
                        success: true,
                        message: 'Cart created successfully',
                        data: newCart
                    });
                }
            }
        } catch (error) {
            next(error);
        }
    }

    async getAllCart(req, res, next) {
        try {
            const carts = await Cart.find().populate('userId', 'name email').populate('items.productId', 'name price');
            res.status(200).json({
                success: true,
                message: 'Carts retrieved successfully',
                data: carts
            });
        } catch (error) {
            next(error);
        }
    }

    async getCartByUser(req, res, next) {
        try {
            const cart = await Cart.findOne({ userId: req.params.userId }).populate('userId', 'name email').populate('items.productId', 'name price');
            res.status(200).json({
                success: true,
                message: 'Cart retrieved successfully',
                data: cart
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteFromCart(req, res, next) {
        try {
            const { userId, productId } = req.body;
            const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price');
            if (cart) {
                const item = cart.items.find(item => item.productId.toString() === productId);
                if (item) {
                    cart.items.pull(item);
                    cart.totalPrice -= item.quantity * item.productId.price;
                    await cart.save();
                    res.status(200).json({
                        success: true,
                        message: 'Item deleted from cart successfully',
                        data: cart
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        message: 'Item not found in cart'
                    });
                }
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Cart not found'
                });
            }
        } catch (error) {
            next(error);
        }
    }

    async updateCart(req, res, next) {
        try {
            const { userId, productId, quantity } = req.body;
            const cart = await Cart.findOne({ userId }).populate('items.productId', 'name price');
            if (cart) {
                const item = cart.items.find(item => item.productId.toString() === productId);
                cart.totalPrice += quantity * item.productId.price;
                if (item) {
                    item.quantity = quantity;
                } else {
                    cart.items.push({ productId, quantity });
                }

                await cart.save();
                res.status(200).json({
                    success: true,
                    message: 'Item updated in cart successfully',
                    data: cart
                });
            } else {
                const newCart = new Cart({ userId, items: [{ productId, quantity }], totalPrice: quantity * item.productId.price });
                await newCart.save();
                res.status(201).json({
                    success: true,
                    message: 'Cart created successfully',
                    data: newCart
                });
            }
        } catch (error) {
            next(error);
        }
    }

    async addSubcribeCart(req, res, next) {
        try {
            const { subcricePlanId, quantity } = req.body;
            const cart = await Cart.findOne({ userId: req.user._id, isSubcribeCart: true }).populate('items.productId', 'name price');
            if (cart) {
                const subcribePlan = await SubcribePlan.findOne({ _id: subcricePlanId });
                if (!subcribePlan) {
                    return res.status(404).json({
                        success: false,
                        message: 'Subcribe plan not found for this product'
                    });
                }
                const subcribeItem = cart.items.find(item => item.subcricePlanId.toString() === subcricePlanId);
                cart.totalPrice += quantity * subcribePlan.price;
                if (subcribeItem) {
                    subcribeItem.quantity += quantity;
                } else {
                    cart.items.push({ subcricePlanId, quantity });
                }
            } else {
                const subcribePlan = await SubcribePlan.findOne({ _id: subcricePlanId });
                if (!subcribePlan) {
                    return res.status(404).json({
                        success: false,
                        message: 'Subcribe plan not found for this product'
                    });
                }
                const newCart = new Cart({ userId: req.user._id, items: [{ subcricePlanId, quantity }], totalPrice: quantity * subcribePlan.price, isSubcribeCart: true });
                await newCart.save();
                return res.status(201).json({
                    success: true,
                    message: 'Subscribe cart created successfully',
                    data: newCart
                });
            }
        } catch (error) {
            next(error);
        }
    }

    async getSubcribeCartByUser(req, res, next) {
        try {
            const cart = await Cart.findOne({ userId: req.params.userId, isSubcribeCart: true }).populate('userId', 'name email').populate('items.productId', 'name price');
            res.status(200).json({
                success: true,
                message: 'Subscribe cart retrieved successfully',
                data: cart
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteFromSubcribeCart(req, res, next) {
        try {
            const { subcricePlanId } = req.body;
            const cart = await Cart.findOne({ userId: req.user._id, isSubcribeCart: true }).populate('items.productId', 'name price');
            if (cart) {
                const subcribeItem = cart.items.find(item => item.subcricePlanId.toString() === subcricePlanId);
                if (subcribeItem) {
                    cart.items.pull(subcribeItem);
                    cart.totalPrice -= subcribeItem.quantity * subcribeItem.productId.price;
                    await cart.save();
                    res.status(200).json({
                        success: true,
                        message: 'Item deleted from subscribe cart successfully',
                        data: cart
                    });
                }
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Subscribe cart not found'
                });
            }
        } catch (error) {
            next(error);
        }
    }

    async updateSubcribeCart(req, res, next) {
        try {
            const { subcricePlanId, quantity } = req.body;
            const cart = await Cart.findOne({ userId: req.user._id, isSubcribeCart: true }).populate('items.productId', 'name price');
            if (cart) {
                const subcribeItem = cart.items.find(item => item.subcricePlanId.toString() === subcricePlanId);
                cart.totalPrice += quantity * subcribeItem.productId.price;
                if (subcribeItem) {
                    subcribeItem.quantity = quantity;
                } else {
                    cart.items.push({ subcricePlanId, quantity });
                }
                await cart.save();
                res.status(200).json({
                    success: true,
                    message: 'Item updated in subscribe cart successfully',
                    data: cart
                });
            }
            else {
                const subcribePlan = await SubcribePlan.findOne({ _id: subcricePlanId });
                if (!subcribePlan) {
                    return res.status(404).json({
                        success: false,
                        message: 'Subcribe plan not found for this product'
                    });
                }
                const newCart = new Cart({ userId: req.user._id, items: [{ subcricePlanId, quantity }], totalPrice: quantity * subcribePlan.price, isSubcribeCart: true });
                await newCart.save();
                return res.status(201).json({
                    success: true,
                    message: 'Subscribe cart created successfully',
                    data: newCart
                });
            }
        } catch (error) {
            next(error);
        }
    }

    async addSubcribePlanToCart(req, res, next) {
        try {
            const { subcricePlanId, quantity } = req.body;
            const subcribePlan = await SubcribePlan.findOne({ _id: subcricePlanId });
            if (!subcribePlan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subcribe plan not found for this product'
                });
            }
            const cart = await Cart.findOne({ userId: req.user._id, isSubcribeCart: true }).populate('items.productId', 'name price');
            if (cart) {
                const subcribeItem = cart.items.find(item => item.subcricePlanId.toString() === subcricePlanId);
                cart.totalPrice += quantity * subcribePlan.price;
                if (subcribeItem) {
                    subcribeItem.quantity += quantity;
                }
                else {
                    cart.items.push({ subcricePlanId, quantity });
                }
                await cart.save();
                res.status(200).json({
                    success: true,
                    message: 'Item added to subscribe cart successfully',
                    data: cart
                });
            } else {
                const newCart = new Cart({ userId: req.user._id, items: [{ subcricePlanId, quantity }], totalPrice: quantity * subcribePlan.price, isSubcribeCart: true });
                await newCart.save();
                res.status(201).json({
                    success: true,
                    message: 'Subscribe cart created successfully',
                    data: newCart
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CartController();