const Cart = require("../models/Cart");

class CartController {
    async addToCart(req, res, next) {
        try {
            const { userId, productId, quantity } = req.body;
            const cart = await Cart.findOne({ userId });
            if (cart) {
                const item = cart.items.find(item => item.productId.toString() === productId);
                if (item) {
                    item.quantity += quantity;
                } else {
                    cart.items.push({ productId, quantity });
                }
                await cart.save();
                res.status(200).json({
                    success: true,
                    message: 'Item added to cart successfully',
                    data: cart
                });
            } else {
                const newCart = new Cart({ userId, items: [{ productId, quantity }], totalPrice: 0 });
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
            const cart = await Cart.findOne({ userId });
            if (cart) {
                const item = cart.items.find(item => item.productId.toString() === productId);
                if (item) {
                    cart.items.pull(item);
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
            const cart = await Cart.findOne({ userId });
            if (cart) {
                const item = cart.items.find(item => item.productId.toString() === productId);
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
                const newCart = new Cart({ userId, items: [{ productId, quantity }], totalPrice: 0 });
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
}

module.exports = new CartController();