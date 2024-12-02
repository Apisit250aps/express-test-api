import express from "express"
import fs from "fs"
import path from "path"
import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const app = express()
const port = 3000
const JWT_SECRET = "cGD+C14dsDfwlmon2jS3Gva332SifUhCz31Swtb9mjg50BV2H6jLneS4QIiTtTT3Px2clBuOCOl0qxifChOWYw==" // ควรเก็บไว้ใน environment variable
const MONGO_URI = "mongodb+srv://apisit250aps:mNuTAQ2kDVmP3OhI@cluster0.jwfno.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const DB_NAME = "thaiAddressDB"

let jsonData = {}
let db

// MongoDB Connection
const connectDB = async () => {
  try {
    const client = await MongoClient.connect(MONGO_URI)
    db = client.db(DB_NAME)
    console.log("Connected to MongoDB successfully")
  } catch (err) {
    console.error("MongoDB connection error:", err)
  }
}

const loadJsonData = () => {
  const filePath = path.resolve("thai_province.json")
  try {
    const data = fs.readFileSync(filePath, "utf8")
    jsonData = JSON.parse(data)
    console.log("JSON data loaded successfully.")
  } catch (err) {
    console.error("Error loading JSON file:", err)
  }
}

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" })
    }
    req.user = user
    next()
  })
}

// Authentication Routes
app.post("/register", async (req, res) => {
  try {
    const { username, password, email, province, district, sub_district } = req.body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password || !email) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" })
    }

    // ตรวจสอบว่ามี user อยู่แล้วหรือไม่
    const existingUser = await db.collection("users").findOne({ username })
    if (existingUser) {
      return res.status(400).json({ message: "มีผู้ใช้งานนี้ในระบบแล้ว" })
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10)
    // สร้าง user ใหม่
    const user = {
      username,
      password: hashedPassword,
      email,
      province,
      district,
      sub_district,
      createdAt: new Date()
    }

    await db.collection("users").insertOne(user)
    res.status(201).json({ message: "ลงทะเบียนสำเร็จ" })
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลงทะเบียน" })
  }
})

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!username || !password) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" })
    }

    // ค้นหา user
    const user = await db.collection("users").findOne({ username })
    if (!user) {
      return res.status(401).json({ message: "ไม่พบผู้ใช้งานในระบบ" })
    }

    // ตรวจสอบรหัสผ่าน
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" })
    }

    // สร้าง token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        username: user.username,
        email: user.email
      }
    })
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" })
  }
})

// Protected Routes (ต้องมี token ถึงจะเข้าถึงได้)
app.get("/provinces", authenticateToken, (req, res) => {
  const provinces = Object.keys(jsonData)
  res.json(provinces)
})

app.get("/provinces/:province", authenticateToken, (req, res) => {
  const { province } = req.params
  const districts = Object.keys(jsonData[province]) || []
  res.json(districts)
})

app.get("/provinces/:province/:district", authenticateToken, (req, res) => {
  const { district, province } = req.params
  const subDistricts = jsonData[province][district] || []
  res.json(subDistricts)
})

// User Profile Route
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await db.collection("users").findOne(
      { _id: req.user.id },
      { projection: { password: 0 } }
    )
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" })
  }
})

app.listen(port, async () => {
  await connectDB()
  loadJsonData()
  console.log(`listening on http://localhost:${port}`)
})