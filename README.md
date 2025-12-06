🚧 WorkSite Manager – Backend

A complete backend system for managing construction sites, workers, attendance, payments, and multi-role authentication. Built with Node.js, Express.js, Prisma/Mongoose, JWT, and deployed on Render/Railway.

This backend powers the full WorkSite Manager platform, enabling Admin, Chief Engineer, and Site Engineer roles to operate efficiently.

🔗 Live API URL

Backend Live URL: Add your deployed link here
Example: https://worksite-backend.onrender.com

👤 Admin Credentials (Required for Evaluation)

⚠️ Mandatory — Without these, evaluation will give ZERO marks.

Email: admin@example.com
Password: Admin@123


(These credentials are created automatically through the seed script.)

📌 Features
🔐 Authentication & Authorization

JWT-based login system

Role-based access (Admin / Chief Engineer / Site Engineer)

Secure password hashing (bcrypt)

👷 Worker Management

Add, update, delete workers

Assign workers to sites

Bulk upload support (CSV import)

📍 Site Management

Create and manage sites

Track site status and worker distribution

📝 Attendance System

Site Engineer can mark worker presence on site visit

Daily attendance record stored with date & status

Chief Engineer/Admin can view all attendance

💰 Payment Module

Stripe / SSLCommerz payment session creation

Webhook integration

Payment history logging

🛠 Error Handling (Mandatory Requirement)

Full centralized error middleware

Validation error mapping

Frontend-friendly responses

No crashes or silent failures

📊 Filtering & Search

Query filters for workers, attendance, sites

Search by name, email, site name, etc.

🧱 Tech Stack
Category	Technology
Backend	Node.js, Express.js
Database	PostgreSQL / MongoDB
ORM / ODM	Prisma / Mongoose
Auth	JWT
Payment	Stripe / SSLCommerz
Deployment	Render / Railway
Other	bcrypt, express-validator, cors
📂 Project Structure
worksite-backend/
│
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── error.middleware.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── worker/
│   │   ├── site/
│   │   ├── attendance/
│   │   ├── payment/
│   ├── utils/
│
├── prisma/ (if using Prisma)
│   ├── schema.prisma
│   ├── seed.js
│
├── package.json
├── README.md
└── .env.example

🚀 Getting Started
1️⃣ Clone the repository
git clone https://github.com/YOUR_USERNAME/worksite-backend.git
cd worksite-backend

2️⃣ Install dependencies
npm install
