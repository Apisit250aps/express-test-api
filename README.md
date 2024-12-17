# Thai Address API Documentation

API สำหรับจัดการข้อมูลที่อยู่ในประเทศไทย พร้อมระบบ Authentication

## การติดตั้ง

1. Clone repository
2. ติดตั้ง dependencies:
```bash
npm install
```
3. สร้างไฟล์ `.env` และกำหนดค่าต่างๆ:
```
PORT=3000
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
DB_NAME=thaiAddressDB
```
4. รันเซิร์ฟเวอร์:
```bash
npm start
```

## Endpoints

### Authentication

#### ลงทะเบียนผู้ใช้ใหม่
- **POST** `/register`
- **Body:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "province": "string",
  "district": "string",
  "sub_district": "string"
}
```
- **Response Success (201):**
```json
{
  "message": "ลงทะเบียนสำเร็จ"
}
```

#### เข้าสู่ระบบ
- **POST** `/login`
- **Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response Success:**
```json
{
  "message": "เข้าสู่ระบบสำเร็จ",
  "token": "JWT_TOKEN",
  "user": {
    "username": "string",
    "email": "string"
  }
}
```

### ข้อมูลผู้ใช้

#### ดึงข้อมูลผู้ใช้
- **GET** `/profile`
- **Headers:** `Authorization: Bearer JWT_TOKEN`
- **Response Success:**
```json
{
  "username": "string",
  "email": "string",
  "province": "string",
  "district": "string",
  "sub_district": "string",
  "fname": "string",
  "lname": "string"
}
```

#### อัพเดทข้อมูลผู้ใช้
- **PUT** `/profile`
- **Headers:** `Authorization: Bearer JWT_TOKEN`
- **Body:**
```json
{
  "email": "string",
  "province": "string",
  "district": "string",
  "sub_district": "string",
  "fname": "string",
  "lname": "string"
}
```
- **Response Success:**
```json
{
  "message": "อัพเดทข้อมูลสำเร็จ"
}
```

### ข้อมูลที่อยู่

#### ดึงข้อมูลจังหวัดทั้งหมด
- **GET** `/provinces/all`
- **Response:** ข้อมูล JSON ของจังหวัดทั้งหมด

#### ดึงรายชื่อจังหวัด
- **GET** `/provinces`
- **Response:** รายชื่อจังหวัดทั้งหมด

#### ดึงรายชื่ออำเภอในจังหวัด
- **GET** `/provinces/:province`
- **Response:** รายชื่ออำเภอในจังหวัดที่ระบุ

#### ดึงรายชื่อตำบลในอำเภอ
- **GET** `/provinces/:province/:district`
- **Response:** รายชื่อตำบลในอำเภอที่ระบุ

## Error Responses

- **401 Unauthorized:**
```json
{
  "message": "กรุณาเข้าสู่ระบบ"
}
```

- **403 Forbidden:**
```json
{
  "message": "Token ไม่ถูกต้องหรือหมดอายุ"
}
```

- **404 Not Found:**
```json
{
  "message": "ไม่พบผู้ใช้งาน"
}
```

- **500 Internal Server Error:**
```json
{
  "message": "เกิดข้อผิดพลาดในการดำเนินการ",
  "error": "error_details"
}
```

## การรักษาความปลอดภัย

- ใช้ JWT (JSON Web Token) สำหรับการ Authentication
- รหัสผ่านถูกเข้ารหัสด้วย bcrypt ก่อนจัดเก็บในฐานข้อมูล
- Protected routes ต้องการ JWT Token ในการเข้าถึง
- CORS เปิดใช้งานสำหรับการเข้าถึง API จาก client

## เทคโนโลยีที่ใช้

- Node.js
- Express.js
- MongoDB
- JWT
- bcrypt
- dotenv