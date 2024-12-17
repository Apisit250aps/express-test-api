# Thai Address API Documentation

## Overview
Thai Address API เป็น RESTful API สำหรับจัดการข้อมูลที่อยู่ในประเทศไทย พร้อมระบบการจัดการผู้ใช้งาน (User Management) โดยมีการรักษาความปลอดภัยด้วย JWT (JSON Web Token)

## การติดตั้ง

### ความต้องการของระบบ
- Node.js
- MongoDB
- npm หรือ yarn

### ขั้นตอนการติดตั้ง
1. Clone repository
2. ติดตั้ง dependencies:
```bash
npm install
```

3. สร้างไฟล์ .env ในโฟลเดอร์หลักของโปรเจค:
```env
PORT=3000
JWT_SECRET=your_jwt_secret
MONGO_URI=your_mongodb_connection_string
DB_NAME=thaiAddressDB
```

4. รันเซิร์ฟเวอร์:
```bash
npm start
```

## API Endpoints

### ข้อมูลที่อยู่ (Address Data)

#### 1. ดึงข้อมูลที่อยู่ทั้งหมด
```http
GET /provinces/all
```
**Response**: ข้อมูลจังหวัด อำเภอ และตำบลทั้งหมด

#### 2. ดึงรายชื่อจังหวัด
```http
GET /provinces
```
**Response**: รายชื่อจังหวัดทั้งหมด

#### 3. ดึงรายชื่ออำเภอในจังหวัด
```http
GET /provinces/:province
```
**Parameters**:
- `province`: ชื่อจังหวัด

**Response**: รายชื่ออำเภอในจังหวัดที่ระบุ

#### 4. ดึงรายชื่อตำบลในอำเภอ
```http
GET /provinces/:province/:district
```
**Parameters**:
- `province`: ชื่อจังหวัด
- `district`: ชื่ออำเภอ

**Response**: รายชื่อตำบลในอำเภอที่ระบุ

### การจัดการผู้ใช้งาน (User Management)

#### 1. ลงทะเบียนผู้ใช้งานใหม่
```http
POST /register
```
**Request Body**:
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
**Response**: ข้อความยืนยันการลงทะเบียนสำเร็จ

#### 2. เข้าสู่ระบบ
```http
POST /login
```
**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response**:
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

### ข้อมูลผู้ใช้งาน (User Profile)

#### 1. ดูข้อมูลผู้ใช้งาน
```http
GET /profile
```
**Headers**:
- `Authorization`: Bearer {JWT_TOKEN}

**Response**: ข้อมูลผู้ใช้งานทั้งหมด (ยกเว้นรหัสผ่าน)

#### 2. แก้ไขข้อมูลผู้ใช้งาน
```http
PUT /profile
```
**Headers**:
- `Authorization`: Bearer {JWT_TOKEN}

**Request Body:**
```json
{
  "fname":"string",
  "lname":"string",
  "email": "string",
  "province": "string",
  "district": "string",
  "sub_district": "string"
}
```
**Response**: ข้อความยืนยันการอัพเดทข้อมูลสำเร็จ

## การรับรองความปลอดภัย (Authentication)

API นี้ใช้ JWT (JSON Web Token) ในการรับรองความปลอดภัย สำหรับ endpoints ที่ต้องการการยืนยันตัวตน จำเป็นต้องส่ง token ในรูปแบบ Bearer token ผ่าน header

**Format**:
```http
Authorization: Bearer <your_jwt_token>
```

## ข้อจำกัดและหมายเหตุ
- Token มีอายุ 24 ชั่วโมง
- ข้อมูลที่อยู่จะถูกโหลดจากไฟล์ thai_province.json
- การเชื่อมต่อกับ MongoDB จำเป็นต้องกำหนดค่า MONGO_URI ใน environment variables

## Error Responses

API จะส่งค่า HTTP status codes ดังนี้:
- 200: สำเร็จ
- 201: สร้างข้อมูลสำเร็จ
- 400: ข้อมูลไม่ถูกต้อง
- 401: ไม่ได้เข้าสู่ระบบ
- 403: Token ไม่ถูกต้องหรือหมดอายุ
- 404: ไม่พบข้อมูล
- 500: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
