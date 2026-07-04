# 🔐 Fruit Shop — Auth Service

JWT authentication microservice สำหรับระบบร้านผลไม้ออนไลน์

## ✨ Features

- User registration และ login
- JWT access token (หมดอายุ 15 นาที)
- Refresh token (หมดอายุ 1 ชั่วโมง)
- Role-based tokens (`user` / `admin`)
- Deploy บน Render

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | NestJS |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Deploy | Render |

## 🏗️ Architecture

```
Frontend (:5173)
  └── API Gateway (:3004)
        └── Auth Service (:3100)  ← this repo
              └── MongoDB
```

## 🔗 Related Repositories

| Service | Repository |
|---------|------------|
| Frontend | [fruit-shop-frontend](https://github.com/panapolll/fruit-shop-frontend) |
| API Gateway | [Api-Gateway](https://github.com/panapolll/Api-Gateway) |
| Commerce API | [commerce-api](https://github.com/panapolll/commerce-api) |

## 🌐 Live API

https://auth-service-7xty.onrender.com

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | สมัครสมาชิก |
| POST | `/auth/login` | Login → ได้ access + refresh token |
| POST | `/auth/refresh` | ต่ออายุ access token |

## 🚀 Getting Started

```bash
git clone https://github.com/panapolll/Auth-Service.git
cd Auth-Service
yarn install
cp .env.example .env
yarn start:dev
```

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key (ต้องตรงกับ Commerce API) |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `PORT` | Server port (default `3100`) |

## 👤 Demo Account

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gmail.com` | `1234567890` |

## 👨‍💻 Author

Portfolio project — microservices e-commerce.