const userModel = require('../models/User');
const bcrypt = require('bcrypt');

class UserController {
    async createUser(req, res) {
        try {
            const validated = req.validatedBody;
            const hashedPassword = await bcrypt.hash(validated.password, 9);
            const user = await userModel.create({ ...validated, password: hashedPassword });
            user.addreses.city = validated.city;
            user.addreses.district = validated.district;
            user.addreses.address = validated.address;
            user.addreses.phone = validated.phone;
            await user.save();

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    async getAllUsers(req, res) {
        try {
            const users = await userModel.find({ isActive: true });
            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: users
            });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    async getUserById(req, res) {
        try {
            const user = await userModel.findById(req.params._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user
            });
        } catch (error) {
            res.status(500).json({ message: error });
        }
    }

    async updateUser(req, res, next) {
        try {
            const validated = req.validatedBody;
            const newData = {
                ...validated
            };
            const user = await userModel.findByIdAndUpdate(req.params._id, newData, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const user = await userModel.findByIdAndDelete(req.params._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async lockUser(req, res, next){
        try {
            const user = await userModel.findByIdAndUpdate(req.params._id, { isActive: false }, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                success: true,
                message: 'User locked successfully',
                data: user
            })
        } catch (error) {
            next(error);
        }
    }

    async unlockUser(req, res, next){
        try {
            const user = await userModel.findByIdAndUpdate(req.params._id, { isActive: true }, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                success: true,
                message: 'User unlocked successfully',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async updateAddress(req, res, next){
        try {
            const newAddress = {
                country: req.body.country || user.addreses.country,
                city: req.body.city || user.addreses.city,
                district: req.body.district || user.addreses.district,
                address: req.body.address || user.addreses.address,
                phone: req.body.phone || user.addreses.phone
            };
            const user = await userModel.findByIdAndUpdate(req.params._id, { $push: { addreses: newAddress } }, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                success: true,
                message: 'Address updated successfully',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async editAddress(req, res, next){
        try {
            const user = await userModel.findById(req.params._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const addressIndex = user.addreses.findIndex(addr => addr._id.toString() === req.params.address_id);
            if (addressIndex === -1) {
                return res.status(404).json({ message: 'Address not found' });
            }
            user.addreses[addressIndex].country = req.body.country || user.addreses[addressIndex].country;
            user.addreses[addressIndex].city = req.body.city || user.addreses[addressIndex].city;
            user.addreses[addressIndex].district = req.body.district || user.addreses[addressIndex].district;
            user.addreses[addressIndex].address = req.body.address || user.addreses[addressIndex].address;
            user.addreses[addressIndex].phone = req.body.phone || user.addreses[addressIndex].phone;
            await user.save();
            res.status(200).json({
                success: true,
                message: 'Address edited successfully',
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteAddress(req, res, next){
        try {
            const user = await userModel.findByIdAndUpdate(req.params._id, { $pull: { addreses: { _id: req.params.address_id } } }, { new: true });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({
                success: true,
                message: 'Address deleted successfully',
                data: user
            });
        } catch (error) {
            next(error);    
        }
    }
}

module.exports = new UserController();
