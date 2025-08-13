# SkillLink

SkillLink is a full-stack web platform where people can **share their skills** and **browse for others' skills**.  
It connects learners with skill providers (Skill Sharers) and supports features like skill posting, search, booking, and reviews.

---

## 🚀 Features

- **User Roles**:  
  - Skill Sharer: Post, edit, and manage skills.  
  - Learner: Browse, search, and contact skill sharers.
- **Skill Management**: Add title, description, category, price, and photo.
- **Search & Filter**: Keyword search, category filter, sort by price/rating.
- **Ratings**: Auto-generated sample ratings (or can be replaced with real user reviews).
- **Responsive Design**: Clean UI, works on desktop and mobile.
- **Backend with MongoDB**: REST API for all CRUD operations.
- **API Endpoints**: For skills, categories, and seeding sample data.

---

## 🛠 Tech Stack

**Frontend**
- HTML, CSS, JavaScript
- Fetch API for backend communication

**Backend**
- Node.js + Express.js
- php 
- CORS, Morgan for logging

---

## ▶️ Run This Project Locally (from GitHub)

### 1) Prerequisites
- **MySql**
  
Verify:
```bash
node -v
npm -v
```

---

### 2) Clone the Repository
```bash
git clone https://github.com/<your-username>/skilledlink.git
cd skilledlink
```

> Replace `<your-username>` with the actual GitHub username or org.

---

### 3) Backend Setup (API)
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` (choose ONE of the URIs):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/skilllink
# or (Atlas):
# MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/skilllink?retryWrites=true&w=majority
```

Start MongoDB:
- **Local**: ensure `mongod` is running (service/app).  
  Or run it manually in another terminal:
  ```bash
  mongod
  ```

Run the API:
```bash
npm run dev
# API available at: http://localhost:3000
```

Quick health check:
```bash
curl http://localhost:3000/api/health
# -> {"ok":true}
```

**(Optional) Seed sample data**
```bash
curl -X POST http://localhost:3000/api/seed
```

---

### 4) Frontend Setup
Open a **new terminal**:
```bash
cd frontend
```

Serve the static files (pick one):
```bash
# VS Code extension: Live Server (recommended)
#  - Right-click index.html -> "Open with Live Server"

# OR Python simple server:
python -m http.server 5500
# Visit: http://localhost:5500
```

Make sure the frontend points to your API in `frontend/script.js`:
```js
const API_BASE = "http://localhost:3000/api";
```

---

