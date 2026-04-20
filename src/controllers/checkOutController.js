
class CheckOutController {
    async checkOut(req, res, next) {
        try {
            res.status(200).json({
                success: true,
                message: 'Checkout successful',
                user: req.user
            });
        } catch (error) {
            next(error);
        }
    }
}
module.exports = new CheckOutController();