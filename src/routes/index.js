
const homeRouter = require('./homeRouter');
const userRouter = require('./userRouter');
const productRouter = require('./productRouter');
const brandRouter = require('./brandRouter');
const categoryRouter = require('./categoryRouter');
const subcribePlanRouter = require('./subcribePlanRouter');
const cartRouter = require('./cartRouter');
const checkOutRouter = require('./checkOutRouter');
const boxRouter = require('./boxRouter');
// Health check endpoint
function router(app) {
    app.use('/api/users', userRouter);
    app.use('/api/products', productRouter);
    app.use('/api/brands', brandRouter);
    app.use('/api/categories', categoryRouter);
    app.use('/api/subcribe-plans', subcribePlanRouter);
    app.use('/api/carts', cartRouter);
    app.use('/api/checkout', checkOutRouter);
    app.use('/api/boxes', boxRouter);
    app.use('/api/home', homeRouter);
}

module.exports = router;
