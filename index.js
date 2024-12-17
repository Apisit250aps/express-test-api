import express from "express"
import fs from "fs"
import path from "path"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import { thai_province } from "./thai_province.js"
import cors from "cors"

dotenv.config()
const app = express()
const port = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET
const MONGO_URI = process.env.MONGO_URI
const DB_NAME = process.env.DB_NAME || "thaiAddressDB"
let jsonData = thai_province
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
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

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

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.get("/provinces/all", (req, res) => {
  res.json(thai_province)
})

// Protected Routes (ต้องมี token ถึงจะเข้าถึงได้)
app.get("/provinces", (req, res) => {
  const provinces = Object.keys(jsonData)
  res.json(provinces)
})

app.get("/provinces/:province", (req, res) => {
  const { province } = req.params
  const districts = Object.keys(jsonData[province]) || []
  res.json(districts)
})

app.get("/provinces/:province/:district", (req, res) => {
  const { district, province } = req.params
  const subDistricts = jsonData[province][district] || []
  res.json(subDistricts)
})

// User Profile Route
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await db
      .collection("users")
      .findOne({ username: req.user.username }, { projection: { password: 0 } })
    console.log(user)
    res.json(user)
  } catch (err) {
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้", error: err })
  }
})

app.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { email, province, district, sub_district, fname, lname } = req.body

    const result = await db
      .collection("users")
      .updateOne(
        { username: req.user.username },
        {
          $set: {
            email,
            province,
            district,
            sub_district,
            district,
            fname,
            lname
          }
        }
      )

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" })
    }

    res.json({ message: "อัพเดทข้อมูลสำเร็จ" })
  } catch (err) {
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล", error: err })
  }
})

// Authentication Routes
app.post("/register", async (req, res) => {
  try {
    const { username, password, email, province, district, sub_district } =
      req.body

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
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการลงทะเบียน", error: err.message })
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
      { expiresIn: "24h" }
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
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ", error: err })
  }
})

async function main() {
  await connectDB()
  loadJsonData()
}

main()
app.listen(port, async () => {
  console.log(`listening on http://localhost:${port}`)
})
