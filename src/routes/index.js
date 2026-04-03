
const homeRouter = require('./homeRouter');
const userRouter = require('./userRouter');
const productRouter = require('./productRouter');
const brandRouter = require('./brandRouter');

// Health check endpoint
function router(app){
    app.use('/api/users', userRouter);
    app.use('/api/products', productRouter);
    app.use('/api/brands', brandRouter);
    app.use('/api/home', homeRouter);
}

module.exports = router;
