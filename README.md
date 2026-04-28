# 🚀 CRMPro — Full Stack CRM System

A complete, production-ready CRM (Customer Relationship Management) system built with:
- **Frontend**: React.js + React Router + Recharts
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (JSON Web Tokens)

---

## 📁 Project Structure

```
crm-project/
├── backend/
│   ├── models/
│   │   ├── User.js         # User schema + bcrypt
│   │   ├── Customer.js     # Customer schema
│   │   ├── Lead.js         # Lead schema
│   │   ├── Deal.js         # Deal schema
│   │   └── Task.js         # Task schema
│   ├── routes/
│   │   ├── auth.js         # Login / Register / Me
│   │   ├── customers.js    # CRUD for customers
│   │   ├── leads.js        # CRUD for leads
│   │   ├── deals.js        # CRUD for deals
│   │   ├── tasks.js        # CRUD for tasks
│   │   └── dashboard.js    # Analytics/stats
│   ├── middleware/
│   │   └── auth.js         # JWT middleware
│   ├── .env                # Environment variables
│   └── server.js           # Express app entry
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── context/
        │   └── AuthContext.js  # Auth state
        ├── components/
        │   └── Layout.js       # Sidebar + topbar
        ├── pages/
        │   ├── Login.js        # Login/Register
        │   ├── Dashboard.js    # Charts + stats
        │   ├── Customers.js    # Customer CRUD
        │   ├── Leads.js        # Lead CRUD
        │   ├── Deals.js        # Kanban pipeline
        │   └── Tasks.js        # Task manager
        ├── App.js              # Routes
        ├── App.css             # All styles
        └── index.js            # Entry point
```

---

## ⚙️ Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) (local) OR [MongoDB Atlas](https://cloud.mongodb.com) (cloud)
- npm or yarn

---

## 🛠️ Setup Instructions

### Step 1 — Clone / Download the project

```bash
# If using git
git clone <your-repo-url>
cd crm-project
```

### Step 2 — Setup Backend

```bash
cd backend
npm install
```

Edit `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
```

> 💡 For MongoDB Atlas, replace MONGO_URI with:
> `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/crm_db`

Start backend:
```bash
npm run dev   # Development (with nodemon)
# OR
npm start     # Production
```

✅ You should see: `MongoDB Connected Successfully` and `Server running on port 5000`

### Step 3 — Setup Frontend

```bash
cd ../frontend
npm install
npm start
```

✅ App opens at `http://localhost:3000`

---

## 🔑 Features

### ✅ Authentication
- Register with name, email, password, role
- JWT-based login (token stored in localStorage)
- Protected routes (redirect to login if not authenticated)

### ✅ Dashboard
- Total customers, leads, revenue, pending tasks
- Monthly deal pipeline bar chart (Recharts)
- Lead status pie chart

### ✅ Customers
- Full CRUD (Create, Read, Update, Delete)
- Filter by status (active/inactive/prospect)
- Search by name/email/company
- Pagination

### ✅ Leads
- Full CRUD
- Status pipeline: new → contacted → qualified → proposal → negotiation → closed
- Priority levels (low/medium/high)
- Estimated value tracking

### ✅ Deal Pipeline (Kanban)
- Visual Kanban board with 6 stages
- Value per stage + total pipeline value
- Probability progress bars

### ✅ Tasks
- Create tasks with type (call/email/meeting/follow_up)
- One-click complete/uncomplete toggle
- Overdue task highlighting
- Filter by status/priority

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get logged-in user |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/customers | List all (paginated) |
| GET | /api/customers/:id | Get single |
| POST | /api/customers | Create new |
| PUT | /api/customers/:id | Update |
| DELETE | /api/customers/:id | Delete |

### Leads, Deals, Tasks
Same pattern: GET / GET:id / POST / PUT:id / DELETE:id

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | All analytics data |

---

## 🔐 Security Notes

1. Change `JWT_SECRET` in `.env` before production
2. Never commit `.env` to git (add to `.gitignore`)
3. Use MongoDB Atlas with IP whitelist for production
4. Enable HTTPS in production

---

## 🚀 Deployment

### Backend (Railway / Render / Heroku)
1. Set environment variables on the platform
2. Use MongoDB Atlas for cloud database
3. `npm start` as start command

### Frontend (Vercel / Netlify)
1. `npm run build` to create production build
2. Set `REACT_APP_API_URL` if backend is on different domain
3. Update axios baseURL in frontend

---

## 👨‍💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6 |
| Charts | Recharts |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Fonts | Syne, DM Sans (Google Fonts) |

---

## 📞 Support

Built with ❤️ using React + Node.js + MongoDB
