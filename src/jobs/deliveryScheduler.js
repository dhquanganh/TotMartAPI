const cron = require('node-cron');
const UserSubscription = require('../models/UserSubscription');

function getDeliveryIntervalMs(planType) {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const intervals = {
        '1_month': THIRTY_DAYS,
        '3_month': THIRTY_DAYS,
        '6_month': THIRTY_DAYS,
        '12_month': THIRTY_DAYS,
    };
    return intervals[planType] || THIRTY_DAYS;
}

/**
 * Xử lý các gói đăng ký đến hạn giao hàng.
 * - Tìm tất cả các subscription active có nextDeliveries <= now
 * - Cập nhật lastDeliveries = nextDeliveries cũ
 * - Tăng completeDeliveries, giảm remainDeliveries
 * - Nếu hết lượt giao → đánh dấu expired
 * - Nếu cancelAtPeriodEnd = true và đến cuối kỳ → đánh dấu cancelled
 * - Nếu còn lượt giao → tính nextDeliveries mới
 */
async function processDeliveries() {
    try {
        const now = new Date();

        const duePlans = await UserSubscription.find({
            status: 'active',
            nextDeliveries: { $lte: now }
        });

        if (duePlans.length === 0) {
            return;
        }

        console.log(`[DeliveryScheduler] Tìm thấy ${duePlans.length} gói đến hạn giao hàng`);

        for (const subscription of duePlans) {
            try {
                subscription.lastDeliveries = subscription.nextDeliveries;

                subscription.completeDeliveries += 1;
                subscription.remainDeliveries -= 1;

                if (subscription.remainDeliveries <= 0) {
                    subscription.remainDeliveries = 0;
                    subscription.status = 'expired';
                    subscription.nextDeliveries = null;
                    console.log(`[DeliveryScheduler] Subscription ${subscription._id} đã hết lượt giao → expired`);
                }
                else if (subscription.cancelAtPeriodEnd && now >= subscription.currentPeriodEnd) {
                    subscription.status = 'cancelled';
                    subscription.nextDeliveries = null;
                    console.log(`[DeliveryScheduler] Subscription ${subscription._id} đã hủy cuối kỳ → cancelled`);
                }
                else {
                    const intervalMs = getDeliveryIntervalMs(subscription.planType);
                    subscription.nextDeliveries = new Date(subscription.lastDeliveries.getTime() + intervalMs);
                    console.log(`[DeliveryScheduler] Subscription ${subscription._id} → nextDeliveries: ${subscription.nextDeliveries.toISOString()}`);
                }

                await subscription.save();
            } catch (err) {
                console.error(`[DeliveryScheduler] Lỗi xử lý subscription ${subscription._id}:`, err.message);
            }
        }

        console.log(`[DeliveryScheduler] Hoàn tất xử lý ${duePlans.length} gói`);
    } catch (error) {
        console.error('[DeliveryScheduler] Lỗi khi xử lý deliveries:', error.message);
    }
}


/**
 * Kiểm tra các gói đăng ký cần giao hôm nay
 * Được chạy hàng ngày để thông báo cho admin/user và API endpoint
 */
async function checkTodayDeliveries(shouldLog = true) {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayDeliveries = await UserSubscription.find({
            status: 'active',
            nextDeliveries: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        })
            .populate('userId', 'name email phone')
            .populate('templateId', 'name planType')
            .populate('boxId', 'name value')
            .populate('gift.boxId', 'name');

        const result = {
            success: true,
            date: startOfDay.toISOString().split('T')[0],
            count: todayDeliveries.length,
            deliveries: todayDeliveries
        };

        // Log thông báo nếu cần (khi chạy từ scheduler)
        if (shouldLog) {
            if (todayDeliveries.length > 0) {
                console.log(`\n╔════════════════════════════════════════════════════════════╗`);
                console.log(`║ [THÔNG BÁO GẬP] Hôm nay (${result.date}) có ${todayDeliveries.length} đơn cần giao`);
                console.log(`╠════════════════════════════════════════════════════════════╣`);

                todayDeliveries.forEach((sub, index) => {
                    console.log(`║ ${index + 1}. Khách: ${sub.userId.name} | Box: ${sub.boxId.name}`);
                    console.log(`║    SĐT: ${sub.userId.phone || 'N/A'} | Email: ${sub.userId.email}`);
                    console.log(`║    Địa chỉ: ${sub.shippingAddress.address}, ${sub.shippingAddress.district}, ${sub.shippingAddress.city}`);
                });

                console.log(`╚════════════════════════════════════════════════════════════╝\n`);
            } else {
                console.log(`[CheckDeliveries] Hôm nay (${result.date}) không có đơn nào cần giao`);
            }
        }

        return result;
    } catch (error) {
        console.error('[CheckTodayDeliveries] Lỗi:', error.message);
        return {
            success: false,
            message: error.message
        };
    }
}


function startDeliveryScheduler() {
    console.log('[DeliveryScheduler] Đã khởi động - chạy mỗi 15 phút');

    processDeliveries();
    checkTodayDeliveries(true);

    // Chạy mỗi 15 phút
    cron.schedule('*/15 * * * *', () => {
        console.log(`[DeliveryScheduler] Đang chạy kiểm tra... ${new Date().toISOString()}`);
        processDeliveries();
    });

    // Chạy mỗi ngày lúc 6:00 AM để kiểm tra hàng cần giao hôm nay
    cron.schedule('0 6 * * *', () => {
        console.log(`[CheckDeliveries] Đang kiểm tra đơn cần giao hôm nay... ${new Date().toISOString()}`);
        checkTodayDeliveries(true);
    });
}

module.exports = { startDeliveryScheduler, processDeliveries, checkTodayDeliveries };
