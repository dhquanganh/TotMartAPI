
const homeRouter = require('./homeRouter');
const userRouter = require('./userRouter');
const productRouter = require('./productRouter');
const brandRouter = require('./brandRouter');
const categoryRouter = require('./categoryRouter');
const subcribePlanRouter = require('./subcribePlanRouter');

// Health check endpoint
function router(app) {
    app.use('/api/users', userRouter);
    app.use('/api/products', productRouter);
    app.use('/api/brands', brandRouter);
    app.use('/api/categories', categoryRouter);
    app.use('/api/subcribe-plans', subcribePlanRouter);
    app.use('/api/home', homeRouter);
}

module.exports = router;
