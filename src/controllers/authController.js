const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

class AuthController {
    async login(req, res, next) {
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
            res.cookie('token', token, {
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

    async logout(req, res, next) {
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

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User with that email does not exist'
                });
            }

            const resetToken = crypto.randomBytes(20).toString('hex');

            user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            await user.save();

            const resetUrl = `https://totmartapi.onrender.com/reset-password?token=${resetToken}`;

            const message = `You are receiving this email because you (or someone else) has requested the reset of a password. \n\n Please click the link to reset your password: \n\n ${resetUrl}`;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'TotMart - Password Reset Link',
                    message,
                    html: `<p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
                           <p>Please click the link below to reset your password:</p>
                           <a href="${resetUrl}" target="_blank">Reset Password</a>
                           <p>This link is valid for 1 hour.</p>`
                });

                res.status(200).json({
                    success: true,
                    message: 'Reset password email sent successfully'
                });
            } catch (error) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                await user.save();
                return res.status(500).json({
                    success: false,
                    message: 'Email could not be sent'
                });
            }
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;

            const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

            const user = await User.findOne({
                resetPasswordToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset password token'
                });
            }

            user.password = await bcrypt.hash(password, 9);

            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}


module.exports = new AuthController();