
# 🧽 ChoreBlasterz — Backend

ChoreBlasterz is a family-focused **chore and reward tracking app** built using the **MERN stack**. The backend is powered by **Node.js**, **Express**, and **MongoDB** to provide secure APIs for managing chores, rewards, and profiles for both parents and children.

👉 **[Frontend Repository](https://github.com/poorniv-89/KidsChoresTracker_Frontend)**

---

## 🚀 Tech Stack

- **Node.js** — JavaScript runtime  
- **Express.js** — backend framework  
- **MongoDB** — NoSQL database  
- **Mongoose** — MongoDB ODM  
- **JavaScript (ES6+)** — language used  
- **dotenv** — manage environment variables  
- **CORS** — enable cross-origin requests  
- **Thunder Client / Postman** — API testing tools  

---

## 📁 Folder Structure

📦 backend  
┣ 📂models  
┃ ┣ 📄 parentsSchema.mjs  
┃ ┗ 📄 ChildSchema.mjs  
┣ 📂routes  
┃ ┣ 📄 parentsRoute.js  
┃ ┗ 📄 childRoute.js  
┣ 📄 .env  
┣ 📄 server.js  
┗ 📄 package.json  

---

## 🔑 Features

### 👪 Parent

- Register & Login  
- Add / Edit / Delete Chores  
- Add / Delete Rewards  
- Approve or reject completed chores  
- Approve or reject reward requests  
- View dashboard data (kids, pending items)

### 🧒 Child

- Create profile linked to parent  
- View available chores and rewards  
- Mark chores as done (pending approval)  
- Request rewards  
- View chore/reward history  

---

## 🔗 API Routes

### 🔹 Parent Routes

| Method   | Endpoint                                   | Description                           |
|----------|--------------------------------------------|---------------------------------------|
| POST     | `/api/parents/`                            | Create a new parent account           |
| POST     | `/api/parents/signin`                      | Parent login                          |
| GET      | `/api/parents/:parentId`                   | Retrieve parent dashboard data        |
| POST     | `/api/parents/:parentId/chores`            | Add chore(s) to parent account        |
| PUT      | `/api/parents/:parentId/chores/:choreId`   | Edit a specific chore                 |
| DELETE   | `/api/parents/:parentId/chores/:choreId`   | Delete a specific chore               |
| POST     | `/api/parents/:parentId/rewards`           | Add new reward(s)                     |
| DELETE   | `/api/parents/:parentId/rewards/:rewardId` | Soft-delete reward                    |
| POST     | `/api/parents/:parentId/approveChore`      | Approve child chore completion        |
| POST     | `/api/parents/:parentId/rejectChore`       | Reject child chore with comment       |
| POST     | `/api/parents/:parentId/approveReward`     | Approve a reward request              |
| POST     | `/api/parents/:parentId/rejectReward`      | Reject a reward request               |

### 🔹 Child Routes

| Method   | Endpoint                                         | Description                                |
|----------|--------------------------------------------------|--------------------------------------------|
| POST     | `/api/children/`                                 | Create a child profile and link parent     |
| GET      | `/api/children/token/:token`                     | Get child profile by token                 |
| GET      | `/api/children/:childId/available`               | Get available chores and rewards           |
| GET      | `/api/children/token/:token/available`           | Get available chores and rewards by token  |
| PUT      | `/api/children/:childId/choreComplete`           | Submit chore for approval                  |
| PUT      | `/api/children/token/:token/choreComplete`       | Submit chore for approval (by token)       |
| PATCH    | `/api/children/:childId/redeem`                  | Request reward redemption                  |
| PATCH    | `/api/children/token/:token/redeem`              | Request reward redemption (by token)       |

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/poorniv-89/KidsChoresTracker_Backend.git
cd KidsChoresTracker_Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a `.env` File

```bash
PORT=3000
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
CLIENT_BASE_URL=http://localhost:5173
```

### 4. Start the Server

```bash
npm run dev
```

---

## 🧪 Testing Tools

- [Thunder Client](https://www.thunderclient.com/) (VSCode Extension)  

---

## 🚀 Stretch Goals

- 🔔 **Push Notifications** – notify parents of activity  
- 🧾 **Activity Log** – track all approvals/rejections  
- 💬 **Feedback System** – allow comments on chores  
- 🧠 **Gamification** – add levels, badges, progress bars  
