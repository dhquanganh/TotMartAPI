const sepayClient = require('sepay-nodejs-node');

const client = new sepayClient({
    env: 'sandbox',
    merchant_id: 'YOUR_MERCHANT_ID',
    secret_key: 'YOUR_MERCHANT_SECRET_KEY'
})

const checkOutSePay = async (req, res, next) => {

}

module.exports = {
    checkOutSePay
}