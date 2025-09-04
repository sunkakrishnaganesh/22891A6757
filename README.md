# 📌 URL Shortener Microservice + React Frontend

This project was developed as part of the **Campus Hiring Evaluation – Full Stack** for **Afford Medical Technologies**.  
It includes:  

- A **Node.js/Express microservice** that implements URL shortening, redirection, and statistics tracking.  
- A **React frontend (Material UI)** that consumes the backend API, allows shortening up to 5 URLs concurrently, and displays analytics.  
- **Centralized Logging** using the provided `RemoteLogger` middleware (no console logs).  

---

## 🚀 Features
- Shorten long URLs with optional validity (default 30 mins) and optional custom shortcode.  
- Automatic generation of globally unique shortcodes if not provided.  
- Redirection to the original URL until expiry.  
- Analytics: total clicks, timestamps, referrer, and IP.  
- Logging integration with the evaluation service (backend & frontend).  
- React UI built with **Material UI**.  

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, nanoid, cors, dotenv  
- **Frontend**: React, Material UI, React Router  
- **Logging**: Custom `RemoteLogger` middleware  

---

## 📂 Project Structure
```
22891A6757/
│
├── Backend-Test-Submission/       # Backend service
│   ├── app.js                     # Express microservice
│   └── .env                       # Backend environment variables
│
├── Logging-Middleware/            # Shared logging middleware
│   └── index.js
│
├── frontend/                      # React frontend (http://localhost:3000)
│   ├── .env.local                 # Frontend environment variables
│   ├── src/
│   │   ├── api.js                 # API helper (calls backend)
│   │   ├── logger.js              # Logging helper
│   │   ├── App.js                 # App shell (routes + navbar)
│   │   ├── pages/
│   │   │   ├── ShortenPage.jsx    # Shorten up to 5 URLs
│   │   │   └── StatsPage.jsx      # Analytics view
│   │   └── ...
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone and Install
```bash
git clone <repo-url>
cd 22891A6757
```

Install backend dependencies:
```bash
cd Backend-Test-Submission
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

---

### 2. Configure Environment Variables

#### Backend (`Backend-Test-Submission/.env`)
```
LOG_TOKEN=<your provided log token>
PORT=5000
```

#### Frontend (`frontend/.env.local`)
```
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_LOG_TOKEN=<your provided log token>
REACT_APP_LOG_ENDPOINT=http://20.244.56.144/evaluation-service/logs
```

---

### 3. Run Backend
```bash
cd Backend-Test-Submission
node app.js
```
Server runs on:
```
http://localhost:5000
```

Quick test:
```
http://localhost:5000/api/ping
```
Response:
```json
{ "ok": true, "timestamp": 169... }
```

---

### 4. Run Frontend
```bash
cd frontend
npm start
```

Frontend runs on:
```
http://localhost:3000
```

---

## 🧪 Usage

### Shorten URLs
1. Open `http://localhost:3000`.  
2. Enter up to **5 URLs** with optional validity (minutes) and shortcode.  
3. Click **Create Shortlinks**.  
4. Results show: original URL, shortened link, expiry, copy-to-clipboard option.

### Redirect
Click a shortened link → redirected to original URL.

### Statistics
1. Go to the **Statistics** page.  
2. Click **Refresh** → shows analytics for all created shortlinks.  
3. Includes: original URL, expiry, total clicks, and click details (timestamp, referrer, IP).

---

## 📝 Logging
- **Backend**: All routes/events logged via `RemoteLogger`.  
- **Frontend**: Events logged via `frontend/src/logger.js`.  
- No `console.log` used.  

---

## 📸 Screenshots
- Shorten up to 5 URLs  
- Analytics dashboard  

---

## ✅ Evaluation Requirements Checklist
- [x] Backend: Microservice with required endpoints  
- [x] Logging integration (backend + frontend)  
- [x] Unique shortcode generation  
- [x] Default validity = 30 minutes  
- [x] Redirection + expiry handling  
- [x] Statistics tracking (clicks, referrer, IP)  
- [x] React frontend with Material UI  
- [x] URL shortener page (5 at once)  
- [x] Statistics page  
- [x] Runs at `http://localhost:3000` (frontend)  

---

## 🚀 Future Improvements
- Add persistent DB (e.g., MongoDB) instead of in-memory Map.  
- Add coarse-grained geolocation (via IP lookup).  
- Deploy with Docker.  
