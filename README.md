**Kids Chore Tracker API**

A Node.js + Express RESTful API for managing a chore and reward system between parents and children. Built using MongoDB and Mongoose, this app allows parents to assign chores and rewards to kids, track completion, and manage point-based redemptions.
Features

**Parent Features**
Create and manage parent profile
Add and manage chores (assign points)
Add and manage rewards (with soft delete support)
View parent dashboard with chores and rewards
Create and link child profiles
Approve or reject completed chores submitted by children
Approve or reject reward redemption requests

**Child Features**
Create a child profile linked to a parent
View personal profile, available chores, and rewards
Complete chores and earn points (pending parent approval)
Redeem rewards using accumulated points (pending approval)
View approved/rejected chores and redeemed rewards
Check available tasks and track current point balance

**__API Routes Table__**

**Parent Routes**

| **Method** | **Endpoint**                               | **Description**                                 |
| ---------- | ------------------------------------------ | ----------------------------------------------- |
| `POST`     | `/api/parents/`                            | Create a new parent account                     |
| `GET`      | `/api/parents/:parentId`                   | Retrieve parent profile (excluding password)    |
| `POST`     | `/api/parents/:parentId/chores`            | Add one or more chores                          |
| `POST`     | `/api/parents/:parentId/rewards`           | Add one or more rewards                         |
| `GET`      | `/api/parents/:parentId/tasks`             | Get all chores and rewards                      |
| `POST`     | `/api/parents/:parentId/approveChore`      | Approve a completed chore from a child          |
| `POST`     | `/api/parents/:parentId/rejectChore`       | Reject a completed chore with optional comments |
| `POST`     | `/api/parents/:parentId/approveReward`     | Approve a reward request from a child           |
| `DELETE`   | `/api/parents/:parentId/rewards/:rewardId` | Soft delete a reward                            |



**Child Routes**

| **Method** | **Endpoint**                           | **Description**                                     |
| ---------- | -------------------------------------- | --------------------------------------------------- |
| `POST`     | `/api/children/`                       | Create a child profile and assign to a parent       |
| `GET`      | `/api/children/:childId`               | Retrieve child's profile, completed chores & points |
| `PUT`      | `/api/children/:childId/choreComplete` | Mark a chore as completed                           |
| `PATCH`    | `/api/children/:childId/redeem`        | Redeem a reward using earned points                 |
| `GET`      | `/api/children/:childId/available`     | Get available chores and rewards from parent        |



**Tech Stack**
Backend: Node.js, Express.js
Database: MongoDB + Mongoose
Language: JavaScript
HTTP Tool for Testing: Thunder Client

