# 🚖 Campus Ride Management Platform

A real-time ride management platform designed for campus transportation systems. The platform enables passengers and drivers to seamlessly connect through a centralized digital system, providing ride requests, ride assignment, real-time updates, ride lifecycle management, analytics, and feedback collection.

---

## 📖 Project Overview

Campus transportation is often coordinated through informal communication methods, resulting in delays, inefficient ride allocation, and poor visibility of driver availability.

The Campus Ride Management Platform solves these challenges by offering:

- Secure authentication for passengers and drivers
- Real-time ride request and assignment workflows
- Driver availability management
- Live ride status updates
- Ride lifecycle tracking
- Driver analytics dashboard
- Ratings and feedback system

The system prioritizes reliability, scalability, usability, and real-time synchronization.

---

## ✨ Features

### 🔐 Authentication & Profile Management

- Passenger Registration
- Passenger Login
- Driver Registration
- Driver Login
- JWT Authentication
- Protected Routes
- User Profile Management

### 🚗 Driver Availability Management

- Go Online / Offline
- Real-Time Availability Updates
- Driver Status Tracking

### 📍 Ride Request Workflow

- Create Ride Request
- Specify Pickup Location
- Specify Destination
- View Ride Status
- Accept / Reject Ride Requests

### ⚡ Real-Time Communication

- Socket.IO Integration
- Instant Ride Assignment Notifications
- Driver Availability Updates
- Live Ride Status Synchronization

### 🔄 Ride Lifecycle Management

Supported Ride States:

- Requested
- Accepted
- In Progress
- Completed
- Cancelled

### 📊 Driver Dashboard

- Total Rides Completed
- Active Rides
- Ride History
- Ride Statistics
- Ratings Overview

### ⭐ Ratings & Feedback

- Rate Completed Rides
- Submit Written Feedback
- Driver Performance Summary

---

## 🏗️ System Architecture

```text
┌───────────────────────┐
│      React Frontend   │
└──────────┬────────────┘
           │ REST APIs
           ▼
┌───────────────────────┐
│  Node.js + Express.js │
└──────────┬────────────┘
           │
     Socket.IO Layer
           │
           ▼
┌───────────────────────┐
│       MongoDB         │
└───────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- React.js
- Tailwind CSS
- React Router DOM
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express.js
- Socket.IO
- JWT Authentication

### Database

- MongoDB Atlas
- Mongoose

### Deployment

- Frontend: Vercel
- Backend: Render

---

## 📂 Project Structure

```text
Campus_Ride_Platform
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── context
│   │   └── assets
│   │
│   └── public
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── config
│   └── server.js
│
└── README.md
```

---




## 📡 API Overview

### Authentication

| Method | Endpoint |
|----------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |

### Drivers

| Method | Endpoint |
|----------|----------|
| GET | /api/drivers |
| PATCH | /api/drivers/status |

### Rides

| Method | Endpoint |
|----------|----------|
| POST | /api/rides |
| GET | /api/rides |
| PATCH | /api/rides/:id |

### Ratings

| Method | Endpoint |
|----------|----------|
| POST | /api/ratings |
| GET | /api/ratings |

---

## ⚡ Real-Time Events

### Passenger Events

- createRide
- rideStatusUpdate

### Driver Events

- driverOnline
- driverOffline
- acceptRide
- rejectRide

### Server Events

- rideAssigned
- rideCompleted
- driverAvailabilityUpdated

---

## ✅ Functional Requirements Covered

- User Authentication & Profile Management
- Driver Availability Management
- Ride Request Workflow
- Real-Time Ride Updates
- Ride Lifecycle Management
- Driver Dashboard
- Ratings & Feedback System

All mandatory requirements specified in the challenge statement have been successfully implemented.

---

## 🌐 Deployment

### Frontend



```text
https://campus-ride-one.vercel.app
```

### Backend



```text
https://campus-ride-ov94.onrender.com
```

---



## 🔮 Future Enhancements

- Live Map Integration
- Ride Scheduling
- Digital Payments
- Demand Analytics
- Demand Forecasting
- AI-Based Ride Recommendations

---


## 📄 License

This project was developed as part of the **Real-Time Campus Ride Management Platform Challenge** and is intended for educational and competition purposes.
