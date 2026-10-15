# Pizza Delivery — Full-Stack Application

A full-stack pizza ordering application built with React, Node.js, Express, and MongoDB.

## 🚀 Live Demo

- **Frontend (Live Website):** [Open Pizza Delivery Website](https://oibsip-git-main-kavyasree1623s-projects.vercel.app/)
- **Backend (Render API):** [https://oibsip-azjm.onrender.com](https://oibsip-azjm.onrender.com)

> The backend is an API service. Opening its root URL may not display a webpage.

## Technology Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **Payments:** Razorpay test mode
- **Email:** SMTP-based email configuration

## Project Structure

- `client/` — React frontend
- `server/` — Express API, database models, controllers, and services
- `server/.env.example` — Example environment configuration

## Setup

### 1. Prerequisites

Install Node.js and npm. Configure a MongoDB instance and the required email/payment test credentials.

### 2. Backend

```bash
cd server
npm install
```

Copy `.env.example` to `.env`, then fill in the configuration values for your environment.

Start the backend using the script defined in `server/package.json`.

### 3. Frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite.

## Configuration and Security

Never commit `.env` files, database credentials, JWT secrets, email passwords, or payment secrets. Use Razorpay test credentials during development.

## Project Status

This repository contains the application source code. Run and test the configured features before relying on them in a demonstration.
