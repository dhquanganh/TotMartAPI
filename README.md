# Node.js Backend MVC Project

Base backend project template built with Node.js, Express, and MongoDB using MVC architecture pattern.

## Project Structure

```
src/
├── config/
│   ├── database.js       # MongoDB connection configuration
│   └── environment.js    # Environment variables and config
├── controllers/          # Business logic (create your controllers here)
├── models/              # Mongoose schemas (create your models here)
├── routes/
│   └── index.js         # Main router - add your routes here
├── middleware/
│   ├── authMiddleware.js     # JWT authentication middleware
│   ├── errorHandler.js       # Global error handling
│   └── validationHandler.js  # Request validation middleware
├── utils/
│   └── jwt.js           # JWT token utilities
├── app.js               # Express app setup
└── server.js            # Server entry point
```

## Prerequisites

- **Node.js** v14+
- **npm** or **yarn**
- **MongoDB** (local or cloud instance)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file from template**
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with your configuration**
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/your-database-name
   JWT_SECRET=your-super-secret-key
   JWT_EXPIRES_IN=7d
   ```

## Running the Server

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start at `http://localhost:3000`

## Core Features

✅ **MVC Architecture** - Organized structure ready for your models, controllers, and routes
✅ **MongoDB Support** - Mongoose configuration ready to use
✅ **JWT Authentication** - Token utilities for protected routes
✅ **Middleware Stack** - Error handling, validation, and auth middleware included
✅ **Environment Configuration** - dotenv for environment management
✅ **Error Handling** - Centralized error handling middleware

## Getting Started

### 1. Create a Model

Create a new file `src/models/Product.js`:

```javascript
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
```

### 2. Create a Controller

Create a new file `src/controllers/productController.js`:

```javascript
const Product = require('../models/Product');

const productController = {
  getAll: async (req, res, next) => {
    try {
      const products = await Product.find();
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const product = new Product(req.body);
      await product.save();
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productController;
```

### 3. Create Routes

Create a new file `src/routes/productRoutes.js`:

```javascript
const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.getAll);
router.post('/', productController.create);

module.exports = router;
```

### 4. Register Routes

Update `src/routes/index.js`:

```javascript
const express = require('express');
const productRoutes = require('./productRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

router.use('/api/products', productRoutes);

module.exports = router;
```

## Middleware Usage

### Using Auth Middleware

```javascript
const authMiddleware = require('../middleware/authMiddleware');

router.get('/protected', authMiddleware, (req, res) => {
  // req.userId is available here
  res.json({ userId: req.userId });
});
```

### Using Validation Middleware

```javascript
const { validateRequest } = require('../middleware/validationHandler');
const joi = require('joi');

const createSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required()
});

router.post('/create', validateRequest(createSchema), (req, res) => {
  // req.validatedBody contains validated data
  res.json({ data: req.validatedBody });
});
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/nodejs-mvc-db |
| `JWT_SECRET` | Secret key for JWT tokens | your-secret-key-change-in-production |
| `JWT_EXPIRES_IN` | JWT token expiration time | 7d |

## JWT Utilities

### Generate Token

```javascript
const { generateToken } = require('../utils/jwt');

const token = generateToken(userId);
```

### Verify Token

```javascript
const { verifyToken } = require('../utils/jwt');

try {
  const decoded = verifyToken(token);
  console.log(decoded.userId);
} catch (error) {
  console.log('Token is invalid');
}
```

## Error Handling

The error handler middleware automatically handles:
- Mongoose validation errors
- Duplicate key errors (unique fields)
- JWT token errors
- Custom application errors

All errors are returned with a consistent format:
```json
{
  "success": false,
  "status": 400,
  "message": "Error message"
}
```


## Development Tips

- Use `npm run dev` for auto-reload during development with nodemon
- Check console logs for database connection status
- Use a REST client (Postman, Insomnia, VS Code REST Client) to test APIs
- Keep controllers lean - move complex business logic to separate service files

## Project Layout Best Practices

As your project grows, consider this structure:

```
src/
├── models/
├── controllers/
├── routes/
├── middleware/
├── services/        # Business logic layer
├── validators/      # Joi validation schemas
├── constants/       # Constants and enums
├── config/
├── utils/
└── tests/
```

## Next Steps

1. Create your first model in `src/models/`
2. Create a controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Test your API with a REST client

## License

MIT

## Support

For issues or questions, please create an issue in the repository.

