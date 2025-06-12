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

| Method   | Endpoint                                 | Description                           |
|----------|------------------------------------------|---------------------------------------|
| POST     | `/api/parents/`                          | Create a new parent account           |
| POST     | `/api/parents/signin`                    | Parent login                          |
| GET      | `/api/parents/:parentId`                 | Retrieve parent dashboard data        |
| POST     | `/api/parents/:parentId/chores`          | Add chore(s) to parent account        |
| PUT      | `/api/parents/:parentId/chores/:choreId` | Edit a specific chore                 |
| DELETE   | `/api/parents/:parentId/chores/:choreId` | Delete a specific chore               |
| POST     | `/api/parents/:parentId/rewards`         | Add new reward(s)                     |
| DELETE   | `/api/parents/:parentId/rewards/:rewardId` | Soft-delete reward                  |
| POST     | `/api/parents/:parentId/approveChore`    | Approve child chore completion        |
| POST     | `/api/parents/:parentId/rejectChore`     | Reject child chore with comment       |
| POST     | `/api/parents/:parentId/approveReward`   | Approve a reward request              |
| POST     | `/api/parents/:parentId/rejectReward`    | Reject a reward request               |
| GET      | `/api/parents/:parentId/tasks`           | Retrieve all chores and rewards       |

### 🔹 Child Routes

| Method   | Endpoint                                   | Description                           |
|----------|--------------------------------------------|---------------------------------------|
| POST     | `/api/children/`                           | Create a child profile and link parent |
| GET      | `/api/children/:childId`                   | Get child profile                     |
| PUT      | `/api/children/:childId/choreComplete`     | Submit chore for approval             |
| PATCH    | `/api/children/:childId/redeem`            | Request reward redemption             |
| GET      | `/api/children/:childId/available`         | Get available chores and rewards      |

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/poorniv-89/KidsChoresTracker_Backend.git
cd KidsChoresTracker_Backend

### 2. Install Dependencies

```bash
npm install

### 3. Create a `.env` File

Create a `.env` file in the root of your project and add the following:

```env
PORT=3000
MONGODB_URI=your_mongo_connection_string

### 4. Start the Server

Run the development server with:

```bash
npm run dev
## 🧪 Test Tools

- [**Thunder Client** (VSCode Extension)](https://www.thunderclient.com/)

## 🚀 Stretch Goals

These are future enhancements to make ChoreBlasterz even more powerful and user-friendly:

- ✅ **User Authentication & Authorization**
  - Use JWT to secure parent and child access

  - 🔔 **Push Notifications**
  - Notify parents of completed chores or reward requests

- 🧾 **Detailed Activity Log**
  - Track history of approvals, rejections, and point updates

   💬 **Commenting/Feedback System**
  - Allow parents to leave feedback on completed chores

- 🧠 **Gamification**
  - Introduce badges, levels, and progress bars to motivate kids