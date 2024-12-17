# Thai Province API Documentation

## Authentication
All endpoints except `/register` and `/login` require JWT authentication. Add the JWT token to Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Public Endpoints

#### GET /provinces/all
Get complete data of all provinces, districts and sub-districts.

**Response:**
```json
{
  "กรุงเทพมหานคร": {
    "เขตพระนคร": ["พระบรมมหาราชวัง", "วังบูรพาภิรมย์"]
  }
}
```

#### POST /register
Register new user.

**Request Body:**
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

**Response:**
```json
{
  "message": "ลงทะเบียนสำเร็จ"
}
```

#### POST /login
User authentication.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
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

### Protected Endpoints

#### GET /provinces
Get list of all provinces.

**Response:**
```json
["กรุงเทพมหานคร", "กระบี่"]
```

#### GET /provinces/:province
Get districts in specified province.

**Parameters:**
- province: Province name in Thai

**Response:**
```json
["เขตพระนคร", "เขตดุสิต"] 
```

#### GET /provinces/:province/:district  
Get sub-districts in specified district.

**Parameters:**
- province: Province name in Thai
- district: District name in Thai

**Response:**
```json
["พระบรมมหาราชวัง", "วังบูรพาภิรมย์"]
```

#### GET /profile
Get current user profile.

**Response:** 
```json
{
  "username": "string",
  "email": "string",
  "province": "string",
  "district": "string",
  "sub_district": "string",
  "createdAt": "date"
}
```

#### PUT /profile
Update user profile information.

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

**Response:**
```json
{
  "message": "อัพเดทข้อมูลสำเร็จ"
}
```