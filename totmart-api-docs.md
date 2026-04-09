# TotMart API Documentation

## Tổng quan
**Base URL**: `http://localhost:PORT/api`  
**Auth**: `Authorization: Bearer TOKEN`  
**Roles**: user · admin

---

## Table of Contents
1. [Health & Auth](#health--auth)
2. [Người dùng (Users)](#người-dùng-users)
3. [Sản phẩm (Products)](#sản-phẩm-products)
4. [Thương hiệu (Brands)](#thương-hiệu-brands)
5. [Danh mục (Categories)](#danh-mục-categories)
6. [Mã lỗi](#mã-lỗi)

---

## Health & Auth

### `GET /home/health` - Kiểm tra API đang chạy
- **Quyền truy cập**: Public
- **Status Codes**: `200`
- **Ví dụ cURL**:
```bash
curl -X GET http://localhost:3000/api/home/health
```

---

### `POST /home/login` - Đăng nhập, nhận JWT token
- **Quyền truy cập**: Public
- **Request Body**:
  | Field | Type | Bắt buộc | Mô tả |
  | --- | --- | --- | --- |
  | email | `string` | Có | Địa chỉ email đăng ký |
  | password | `string` | Có | Mật khẩu tài khoản |
- **Response Mẫu**:
```json
{ "success": true, "token": "eyJhbGc...", "user": { "_id": "...", "email": "user@example.com", "role": "user" } }
```
- **Status Codes**: `200`, `401`, `400`
- **Ví dụ cURL**:
```bash
curl -X POST http://localhost:3000/api/home/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

---

### `POST /home/logout` - Đăng xuất phiên hiện tại
- **Quyền truy cập**: Auth
- **Status Codes**: `200`, `401`
- **Ví dụ cURL**:
```bash
curl -X POST http://localhost:3000/api/home/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Người dùng (Users)

### `POST /users/register` - Đăng ký tài khoản mới
- **Quyền truy cập**: Public
- **Request Body**:
  | Field | Type | Bắt buộc | Mô tả |
  | --- | --- | --- | --- |
  | fullName | `string` | Có | Họ và tên đầy đủ |
  | email | `string` | Có | Địa chỉ email (duy nhất) |
  | password | `string` | Có | Mật khẩu (được mã hóa bcrypt) |
- **Response Mẫu**:
```json
{ "success": true, "user": { "_id": "...", "fullName": "John Doe", "email": "john@example.com" } }
```
- **Status Codes**: `201`, `400`
- **Ví dụ cURL**:
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyen Van A",
    "email": "nguyenvana@example.com",
    "password": "password123",
  }'
```

---

### `GET /users/get-all-users` - Lấy danh sách tất cả người dùng
- **Quyền truy cập**: Admin
- **Path / Query Params**:
  - `page`: Số trang (tuỳ chọn)
  - `limit`: Số bản ghi mỗi trang (tuỳ chọn)
- **Status Codes**: `200`, `401`, `403`
- **Ví dụ cURL**:
```bash
curl -X GET "http://localhost:3000/api/users/get-all-users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### `GET /users/get-user-by-id/:_id` - Lấy người dùng theo ID
- **Quyền truy cập**: Admin
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của người dùng
- **Status Codes**: `200`, `404`, `401`
- **Ví dụ cURL**:
```bash
curl -X GET http://localhost:3000/api/users/get-user-by-id/64a1b2c3d4e5f6789abc1234 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### `PUT /users/update-user/:_id` - Cập nhật thông tin người dùng
- **Quyền truy cập**: Auth
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của người dùng
- **Request Body**:
  | Field | Type | Bắt buộc | Mô tả |
  | --- | --- | --- | --- |
  | fullName | `string` | Không | Họ và tên mới |
  | phone | `string` | Không | Số điện thoại mới |
  | avatar | `string` | Không | URL ảnh đại diện |
- **Status Codes**: `200`, `400`, `404`, `401`
- **Ví dụ cURL**:
```bash
curl -X PUT http://localhost:3000/api/users/update-user/64a1b2c3d4e5f6789abc1234 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyen Van B",
    "phone": "0987654321",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

---

### `DELETE /users/lock-user/:_id` - Khóa tài khoản người dùng
- **Quyền truy cập**: Admin
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của người dùng
- **Status Codes**: `200`, `404`, `401`
- **Ví dụ cURL**:
```bash
curl -X DELETE http://localhost:3000/api/users/lock-user/64a1b2c3d4e5f6789abc1234 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### `PATCH /users/unlock-user/:_id` - Mở khóa tài khoản người dùng
- **Quyền truy cập**: Admin
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của người dùng
- **Status Codes**: `200`, `404`, `401`
- **Ví dụ cURL**:
```bash
curl -X PATCH http://localhost:3000/api/users/unlock-user/64a1b2c3d4e5f6789abc1234 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### `DELETE /users/delete-user/:_id` - Xóa vĩnh viễn người dùng
- **Quyền truy cập**: Admin
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của người dùng
- **Status Codes**: `200`, `404`, `401`
- **Ví dụ cURL**:
```bash
curl -X DELETE http://localhost:3000/api/users/delete-user/64a1b2c3d4e5f6789abc1234 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### `POST /users/update-address/:_id` - Thêm địa chỉ mới
- **Quyền truy cập**: Auth
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của người dùng
- **Request Body**:
  | Field | Type | Bắt buộc | Mô tả |
  | --- | --- | --- | --- |
  | street | `string` | Có | Tên đường / số nhà |
  | city | `string` | Có | Thành phố |
  | state | `string` | Không | Tỉnh / bang |
  | zipCode | `string` | Không | Mã bưu chính |
  | country | `string` | Có | Quốc gia |
  | isDefault | `boolean` | Không | Đặt làm địa chỉ mặc định |
- **Status Codes**: `200`, `400`, `404`
- **Ví dụ cURL**:
```bash
curl -X POST http://localhost:3000/api/users/update-address/64a1b2c3d4e5f6789abc1234 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "12 Nguyen Hue",
    "city": "Ho Chi Minh",
    "state": "HCM",
    "zipCode": "700000",
    "country": "Vietnam",
    "isDefault": true
  }'
```

---

### `PUT /users/edit-address/:_id/:address_id` - Sửa địa chỉ hiện có
- **Quyền truy cập**: Auth
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của người dùng
  - `:address_id`: ID địa chỉ cần sửa
- **Request Body**:
  | Field | Type | Bắt buộc | Mô tả |
  | --- | --- | --- | --- |
  | street | `string` | Không | Tên đường / số nhà |
  | city | `string` | Không | Thành phố |
  | state | `string` | Không | Tỉnh / bang |
  | zipCode | `string` | Không | Mã bưu chính |
  | country | `string` | Không | Quốc gia |
  | isDefault | `boolean` | Không | Đặt làm địa chỉ mặc định |
- **Status Codes**: `200`, `400`, `404`
- **Ví dụ cURL**:
```bash
curl -X PUT http://localhost:3000/api/users/edit-address/64a1b2c3d4e5f6789abc1234/64b9c3d4e5f6789abc5678ef \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "56 Tran Hung Dao",
    "city": "Ha Noi",
    "isDefault": false
  }'
```

---

### `DELETE /users/delete-address/:_id/:address_id` - Xóa địa chỉ
- **Quyền truy cập**: Auth
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của người dùng
  - `:address_id`: ID địa chỉ cần xóa
- **Status Codes**: `200`, `404`
- **Ví dụ cURL**:
```bash
curl -X DELETE http://localhost:3000/api/users/delete-address/64a1b2c3d4e5f6789abc1234/64b9c3d4e5f6789abc5678ef \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Sản phẩm (Products)

### `POST /products/create-product` - Tạo sản phẩm mới
- **Quyền truy cập**: Admin
- **Request Body**:
  | Field | Type | Bắt buộc | Mô tả |
  | --- | --- | --- | --- |
  | name | `string` | Có | Tên sản phẩm |
  | description | `string` | Không | Mô tả sản phẩm |
  | price | `number` | Có | Giá bán |
  | quantity | `number` | Có | Số lượng tồn kho |
  | brand | `ObjectId` | Có | ID thương hiệu |
  | category | `ObjectId` | Có | ID danh mục |
  | images | `string[]` | Không | Danh sách URL ảnh |
- **Response Mẫu**:
```json
{ "success": true, "product": { "_id": "...", "name": "Product Name", "price": 99.99, "quantity": 100 } }
```
- **Status Codes**: `201`, `400`, `401`
- **Ví dụ cURL**:
```bash
curl -X POST http://localhost:3000/api/products/create-product \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ao Thun Nam",
    "description": "Ao thun cotton cao cap",
    "price": 199000,
    "quantity": 50,
    "brand": "64a1b2c3d4e5f6789abc1111",
    "category": "64a1b2c3d4e5f6789abc2222",
    "images": ["https://example.com/img1.jpg"],
    "productId": "random-string"
  }'
```

---

### `GET /products/get-all-products` - Lấy tất cả sản phẩm
- **Quyền truy cập**: Admin
- **Status Codes**: `200`, `401`, `403`
- **Ví dụ cURL**:
```bash
curl -X GET http://localhost:3000/api/products/get-all-products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### `PUT /products/update-product/:_id` - Cập nhật sản phẩm
- **Quyền truy cập**: Admin
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của sản phẩm
- **Request Body**:
  | Field | Type | Bắt buộc | Mô tả |
  | --- | --- | --- | --- |
  | name | `string` | Không | Tên sản phẩm mới |
  | description | `string` | Không | Mô tả mới |
  | price | `number` | Không | Giá bán mới |
  | quantity | `number` | Không | Số lượng tồn kho mới |
  | brand | `ObjectId` | Không | ID thương hiệu mới |
  | category | `ObjectId` | Không | ID danh mục mới |
  | images | `string[]` | Không | Danh sách URL ảnh mới |
- **Status Codes**: `200`, `400`, `404`, `401`, `403`
- **Ví dụ cURL**:
```bash
curl -X PUT http://localhost:3000/api/products/update-product/64a1b2c3d4e5f6789abc3333 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 250000,
    "quantity": 30
  }'
```

---

### `DELETE /products/delete-product/:_id` - Xóa sản phẩm
- **Quyền truy cập**: Admin
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của sản phẩm
- **Status Codes**: `200`, `404`, `401`, `403`
- **Ví dụ cURL**:
```bash
curl -X DELETE http://localhost:3000/api/products/delete-product/64a1b2c3d4e5f6789abc3333 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Thương hiệu (Brands)

### `POST /brands/create-brand` - Tạo thương hiệu mới
- **Quyền truy cập**: Admin
- **Request Body**:
  | Field | Type | Bắt buộc | Mô tả |
  | --- | --- | --- | --- |
  | name | `string` | Có | Tên thương hiệu (duy nhất) |
  | description | `string` | Không | Mô tả thương hiệu |
  | logo | `string` | Không | URL logo thương hiệu |
  | website | `string` | Không | Website chính thức |
- **Response Mẫu**:
```json
{ "success": true, "brand": { "_id": "...", "name": "Brand Name", "slug": "brand-name" } }
```
- **Status Codes**: `201`, `400`, `401`, `403`
- **Ví dụ cURL**:
```bash
curl -X POST http://localhost:3000/api/brands/create-brand \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nike",
    "description": "Thuong hieu the thao hang dau",
    "logo": "https://example.com/nike-logo.png",
    "website": "https://nike.com"
  }'
```

---

### `GET /brands/get-all-brands` - Lấy tất cả thương hiệu
- **Quyền truy cập**: Admin
- **Status Codes**: `200`, `401`, `403`
- **Ví dụ cURL**:
```bash
curl -X GET http://localhost:3000/api/brands/get-all-brands \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### `PUT /brands/update-brand/:_id` - Cập nhật thương hiệu
- **Quyền truy cập**: Admin
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của thương hiệu
- **Request Body**:
  | Field | Type | Bắt buộc | Mô tả |
  | --- | --- | --- | --- |
  | name | `string` | Không | Tên thương hiệu mới |
  | description | `string` | Không | Mô tả mới |
  | logo | `string` | Không | URL logo mới |
- **Status Codes**: `200`, `400`, `404`, `401`
- **Ví dụ cURL**:
```bash
curl -X PUT http://localhost:3000/api/brands/update-brand/64a1b2c3d4e5f6789abc1111 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nike Vietnam",
    "description": "Cap nhat mo ta moi",
    "logo": "https://example.com/nike-new.png"
  }'
```

---

### `DELETE /brands/delete-brand/:_id` - Xóa thương hiệu
- **Quyền truy cập**: Admin
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của thương hiệu
- **Status Codes**: `200`, `404`, `401`
- **Ví dụ cURL**:
```bash
curl -X DELETE http://localhost:3000/api/brands/delete-brand/64a1b2c3d4e5f6789abc1111 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Danh mục (Categories)

### `POST /categories/create-category` - Tạo danh mục mới
- **Quyền truy cập**: Admin
- **Request Body**:
  | Field | Type | Bắt buộc | Mô tả |
  | --- | --- | --- | --- |
  | name | `string` | Có | Tên danh mục (duy nhất) |
  | description | `string` | Không | Mô tả danh mục |
  | icon | `string` | Không | URL icon danh mục |
- **Response Mẫu**:
```json
{ "success": true, "category": { "_id": "...", "name": "Category Name", "slug": "category-name" } }
```
- **Status Codes**: `201`, `400`, `401`, `403`
- **Ví dụ cURL**:
```bash
curl -X POST http://localhost:3000/api/categories/create-category \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quan Ao Nam",
    "description": "Danh muc quan ao danh cho nam",
    "icon": "https://example.com/icon-men.png"
  }'
```

---

### `GET /categories/get-all-categories` - Lấy tất cả danh mục
- **Quyền truy cập**: Admin
- **Status Codes**: `200`, `401`, `403`
- **Ví dụ cURL**:
```bash
curl -X GET http://localhost:3000/api/categories/get-all-categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### `PUT /categories/update-category/:_id` - Cập nhật danh mục
- **Quyền truy cập**: Admin
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của danh mục
- **Request Body**:
  | Field | Type | Bắt buộc | Mô tả |
  | --- | --- | --- | --- |
  | name | `string` | Không | Tên danh mục mới |
  | description | `string` | Không | Mô tả mới |
  | icon | `string` | Không | URL icon mới |
- **Status Codes**: `200`, `400`, `404`, `401`
- **Ví dụ cURL**:
```bash
curl -X PUT http://localhost:3000/api/categories/update-category/64a1b2c3d4e5f6789abc2222 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Quan Ao Nam & Nu",
    "description": "Cap nhat mo ta danh muc",
    "icon": "https://example.com/icon-new.png"
  }'
```

---

### `DELETE /categories/delete-category/:_id` - Xóa danh mục
- **Quyền truy cập**: Admin
- **Path / Query Params**:
  - `:_id`: MongoDB ObjectId của danh mục
- **Status Codes**: `200`, `404`, `401`
- **Ví dụ cURL**:
```bash
curl -X DELETE http://localhost:3000/api/categories/delete-category/64a1b2c3d4e5f6789abc2222 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Mã lỗi

| Status | Mô tả |
| --- | --- |
| `200 / 201` | Thành công |
| `400` | Bad Request – Lỗi xác thực đầu vào |
| `401` | Unauthorized – Không có hoặc token không hợp lệ |
| `403` | Forbidden – Không đủ quyền (cần Admin) |
| `404` | Not Found – Không tìm thấy tài nguyên |
| `500` | Internal Server Error |

**Định dạng lỗi chuẩn:**
```json
{ 
  "success": false, 
  "message": "Mô tả lỗi", 
  "errors": [{ "field": "fieldName", "message": "Chi tiết" }] 
} 
```
