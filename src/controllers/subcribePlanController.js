const SubscribePlan = require("../models/SubcribePlan");
const { processDeliveries } = require("../jobs/deliveryScheduler");
const boxModel = require("../models/Box");

function getPlanConfig(planType) {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const configs = {
        '1_month': {
            intervalMs: THIRTY_DAYS,
            periodMs: THIRTY_DAYS,
            deliveriesPerPeriod: 1
        },
        '3_month': {
            intervalMs: THIRTY_DAYS,
            periodMs: 3 * THIRTY_DAYS,
            deliveriesPerPeriod: 3
        },
        '6_month': {
            intervalMs: THIRTY_DAYS,
            periodMs: 6 * THIRTY_DAYS,
            deliveriesPerPeriod: 6
        },
        '12_month': {
            intervalMs: THIRTY_DAYS,
            periodMs: 12 * THIRTY_DAYS,
            deliveriesPerPeriod: 12
        },
    };
    return configs[planType] || configs['1_month'];
}

class SubcribePlanController {
    async createSubcribePlan(req, res, next) {
        try {
            const validated = req.validatedBody;

            // Validate box exists
            const box = await boxModel.findById(validated.boxId);
            if (!box) {
                return res.status(404).json({
                    success: false,
                    message: 'Box not found'
                });
            }

            // Validate user exists
            const User = require('../models/User');
            const user = await User.findById(validated.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Validate totalDeliveries matches planType
            const { deliveriesPerPeriod } = getPlanConfig(validated.planType);
            if (validated.totalDeliveries < deliveriesPerPeriod) {
                return res.status(400).json({
                    success: false,
                    message: `${validated.planType} plan requires at least ${deliveriesPerPeriod} deliveries`
                });
            }

            // Validate gift boxes exist
            if (validated.gift && validated.gift.length > 0) {
                for (const gift of validated.gift) {
                    const giftBox = await boxModel.findById(gift.boxId);
                    if (!giftBox) {
                        return res.status(404).json({
                            success: false,
                            message: `Gift box with ID ${gift.boxId} not found`
                        });
                    }
                }
            }

            const subcribePlan = new SubscribePlan({
                userId: validated.userId,
                boxId: validated.boxId,
                name: validated.name,
                planType: validated.planType,
                totalDeliveries: validated.totalDeliveries,
                shippingAddress: validated.shippingAddress
            });

            const now = new Date();
            const { intervalMs, periodMs } = getPlanConfig(validated.planType);

            subcribePlan.currentPeriodStart = now;
            subcribePlan.currentPeriodEnd = new Date(now.getTime() + periodMs);
            subcribePlan.nextDeliveries = new Date(now.getTime() + intervalMs);
            subcribePlan.remainDeliveries = validated.totalDeliveries;
            subcribePlan.oldPrice = box.value;
            subcribePlan.discountPercent = validated.discountPercent || 0;
            subcribePlan.price = box.value * (1 - subcribePlan.discountPercent / 100);
            subcribePlan.discount = subcribePlan.oldPrice - subcribePlan.price;
            subcribePlan.gift = validated.gift && validated.gift.length > 0 ? validated.gift : [];

            await subcribePlan.save();

            // Populate references for response
            await subcribePlan.populate('userId', 'name email');
            await subcribePlan.populate('gift.boxId', 'name');
            await subcribePlan.populate('boxId', 'name value');

            res.status(201).json({
                success: true,
                message: 'Subscribe plan created successfully',
                data: subcribePlan
            });
        } catch (error) {
            next(error);
        }
    }

    // Lấy tất cả gói đăng ký
    async getAllSubcribePlans(req, res, next) {
        try {
            const plans = await SubscribePlan.find()
                .populate('userId', 'name email')
                .populate('gift.boxId', 'name')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: plans.length,
                data: plans
            });
        } catch (error) {
            next(error);
        }
    }

    // Lấy gói đăng ký theo ID
    async getSubcribePlanById(req, res, next) {
        try {
            const plan = await SubscribePlan.findById(req.params.id)
                .populate('userId', 'name email')
                .populate('gift.boxId', 'name');

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscribe plan not found'
                });
            }

            res.status(200).json({
                success: true,
                data: plan
            });
        } catch (error) {
            next(error);
        }
    }

    // Lấy gói đăng ký theo userId
    async getSubcribePlansByUser(req, res, next) {
        try {
            const plans = await SubscribePlan.find({ userId: req.params.userId })
                .populate('gift.boxId', 'name')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: plans.length,
                data: plans
            });
        } catch (error) {
            next(error);
        }
    }

    // Hủy gói đăng ký (hủy cuối kỳ)
    async cancelSubcribePlan(req, res, next) {
        try {
            const plan = await SubscribePlan.findById(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscribe plan not found'
                });
            }

            if (plan.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: `Cannot cancel plan with status: ${plan.status}`
                });
            }

            plan.cancelAtPeriodEnd = true;
            await plan.save();

            res.status(200).json({
                success: true,
                message: 'Subscribe plan will be cancelled at end of current period',
                data: plan
            });
        } catch (error) {
            next(error);
        }
    }

    // Hủy ngay lập tức
    async cancelImmediately(req, res, next) {
        try {
            const plan = await SubscribePlan.findById(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Subscribe plan not found'
                });
            }

            if (plan.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: `Cannot cancel plan with status: ${plan.status}`
                });
            }

            plan.status = 'cancelled';
            plan.nextDeliveries = null;
            await plan.save();

            res.status(200).json({
                success: true,
                message: 'Subscribe plan cancelled immediately',
                data: plan
            });
        } catch (error) {
            next(error);
        }
    }

    // Trigger xử lý giao hàng thủ công (dùng cho admin/testing)
    async triggerDeliveryProcessing(req, res, next) {
        try {
            await processDeliveries();
            res.status(200).json({
                success: true,
                message: 'Delivery processing triggered successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SubcribePlanController();