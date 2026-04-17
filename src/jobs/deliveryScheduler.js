const cron = require('node-cron');
const SubscribePlan = require('../models/SubcribePlan');

function getDeliveryIntervalMs(planType) {
    const intervals = {
        '1_month': 30 * 24 * 60 * 60 * 1000,
        '3_month': 30 * 24 * 60 * 60 * 1000,
        '6_month': 30 * 24 * 60 * 60 * 1000,
        '12_month': 30 * 24 * 60 * 60 * 1000,
    };
    return intervals[planType] || 30 * 24 * 60 * 60 * 1000;
}

/**
 * Xử lý các gói đăng ký đến hạn giao hàng.
 * - Tìm tất cả các plan active có nextDeliveries <= now
 * - Cập nhật lastDeliveries = nextDeliveries cũ
 * - Tăng completeDeliveries, giảm remainDeliveries
 * - Nếu hết lượt giao → đánh dấu expired
 * - Nếu cancelAtPeriodEnd = true và đến cuối kỳ → đánh dấu cancelled
 * - Nếu còn lượt giao → tính nextDeliveries mới
 */
async function processDeliveries() {
    try {
        const now = new Date();

        const duePlans = await SubscribePlan.find({
            status: 'active',
            nextDeliveries: { $lte: now }
        });

        if (duePlans.length === 0) {
            return;
        }

        console.log(`[DeliveryScheduler] Tìm thấy ${duePlans.length} gói đến hạn giao hàng`);

        for (const plan of duePlans) {
            try {
                plan.lastDeliveries = plan.nextDeliveries;

                plan.completeDeliveries += 1;
                plan.remainDeliveries -= 1;

                if (plan.remainDeliveries <= 0) {
                    plan.remainDeliveries = 0;
                    plan.status = 'expired';
                    plan.nextDeliveries = null;
                    console.log(`[DeliveryScheduler] Plan ${plan._id} đã hết lượt giao → expired`);
                }
                else if (plan.cancelAtPeriodEnd && now >= plan.currentPeriodEnd) {
                    plan.status = 'cancelled';
                    plan.nextDeliveries = null;
                    console.log(`[DeliveryScheduler] Plan ${plan._id} đã hủy cuối kỳ → cancelled`);
                }
                else {
                    const intervalMs = getDeliveryIntervalMs(plan.planType);
                    plan.nextDeliveries = new Date(plan.lastDeliveries.getTime() + intervalMs);
                    console.log(`[DeliveryScheduler] Plan ${plan._id} → nextDeliveries: ${plan.nextDeliveries.toISOString()}`);
                }

                await plan.save();
            } catch (err) {
                console.error(`[DeliveryScheduler] Lỗi xử lý plan ${plan._id}:`, err.message);
            }
        }

        console.log(`[DeliveryScheduler] Hoàn tất xử lý ${duePlans.length} gói`);
    } catch (error) {
        console.error('[DeliveryScheduler] Lỗi khi xử lý deliveries:', error.message);
    }
}


function startDeliveryScheduler() {
    console.log('[DeliveryScheduler] Đã khởi động - chạy mỗi 15 phút');

    processDeliveries();

    cron.schedule('*/15 * * * *', () => {
        console.log(`[DeliveryScheduler] Đang chạy kiểm tra... ${new Date().toISOString()}`);
        processDeliveries();
    });
}

module.exports = { startDeliveryScheduler, processDeliveries };
