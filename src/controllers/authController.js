const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

class AuthController {
    async login(req, res, next){
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }   
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid password'
                });
            }
            const token = jwt.sign({ 
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role 
            }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

            const refreshToken = jwt.sign({
                userId: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
            res.cookie('token', token,{
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 7
            })
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 30
            });
            user.refreshToken.push(refreshToken);
            await user.save();
            res.status(200).json({
                success: true,
                message: 'Login successful',
                token,
                refreshToken
            });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res,next){
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token not found'
                });
            }
            const user = await User.findOne({ refreshToken: refreshToken });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }
            user.refreshToken = user.refreshToken.filter(token => token !== refreshToken);
            await user.save();
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            next(error);
        }
    }
}


module.exports = new AuthController();