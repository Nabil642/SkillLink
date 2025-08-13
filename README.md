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
- MongoDB + Mongoose (Atlas or local)
- CORS, Morgan for logging

---

## ▶️ Run This Project Locally (from GitHub)

### 1) Prerequisites
- **Node.js** v18+ (includes npm): https://nodejs.org/
- **MongoDB** (local or Atlas connection string)
  - Local Community Server: https://www.mongodb.com/try/download/community
  - Or use MongoDB Atlas (cloud)

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

### 5) Use the App
- Add skills (title, description, category, price, photo URL)
- Search by keyword, filter by category, sort by price/rating
- Edit/Delete from the **Manage Skills** section

> Note: API returns Mongo IDs as `_id`. Any edit/delete buttons should use `skill._id`.

---

### 6) Common API Calls (for testing)
```bash
# List skills
curl "http://localhost:3000/api/skills?search=js&sort=ratingHigh"

# Create a new skill
curl -X POST "http://localhost:3000/api/skills" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Photoshop Basics",
    "description":"Layers, masks, retouching.",
    "category":"Design",
    "price":20,
    "photo":"https://picsum.photos/seed/ps/600/400"
  }'
```

---

### 7) Troubleshooting
- **CORS error**: Confirm `API_BASE` in `script.js` is `http://localhost:3000/api` and the backend is running.
- **Mongo connection failed**: Check `MONGODB_URI` in `.env`, make sure `mongod` is running, or update your Atlas IP allowlist.
- **Port in use**: Change `PORT` in `.env` (e.g., 3001) and update `API_BASE` accordingly.
- **Empty categories / list**: Add a few skills or run the seed endpoint.

---

### 8) (Optional) Docker Quick Start
If you prefer Docker instead of installing MongoDB locally, add this `docker-compose.yml` to the project root and run:

```yaml
version: "3.9"
services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:27017/skilllink
    ports:
      - "3000:3000"
    depends_on:
      - mongo

volumes:
  mongo_data:
```

`backend/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY . .
EXPOSE 3000
CMD ["npm","start"]
```

Run:
```bash
docker compose up --build
# API: http://localhost:3000
# Serve frontend with Live Server or: python -m http.server 5500
```

---
