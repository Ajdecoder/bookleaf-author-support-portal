# BookLeaf Author Support Portal

## About the Project

The BookLeaf Author Support Portal is a web application designed to help authors manage their books and communicate with the support team. It also provides an admin interface to manage author queries and track their progress.

The main goal was to bring book information and support requests into one place instead of handling everything separately.

## Features

### Author
- View a dashboard with book and royalty information.
- View books, copies sold, royalty earned, paid royalty and pending royalty.
- Submit support tickets and track their status.
- View ticket conversations and replies.

### Admin
- View and manage support tickets.
- Filter tickets by status, category and priority.
- Update ticket status and other supported fields.
- Review author queries and manage their progress.

### Backend
- REST APIs built with Node.js and Express.
- MongoDB for storing application data.
- JWT-based authentication.
- Role-based access for authors and admins.
- Input validation and error handling for API requests.

## Tech Stack

**Frontend:** React, Vite, JavaScript, Tailwind CSS

**Backend:** Node.js, Express.js

**Database:** MongoDB, Mongoose

**Authentication:** JSON Web Tokens (JWT)

**Tools:** Git, GitHub, Postman

## Getting Started

### Prerequisites

Make sure you have Node.js, npm and MongoDB access installed or configured.

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the server directory using the environment variables required by the project.

For example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_URL=http://localhost:5173
```

Use the actual variable names expected by your existing configuration. Do not commit real credentials to GitHub.

Start the backend using the script defined in `server/package.json`. For example:

```bash
npm run dev
```

### 3. Set up the frontend

Open another terminal:

```bash
cd client
npm install
```

Configure the frontend API base URL according to your local backend configuration, then start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## API Overview

The backend exposes REST endpoints for authentication and application features. The main route groups include:

| Route | Purpose |
|---|---|
| `/auth/login` | User login |
| `/authors` | Author-related operations |
| `/books` | Book information |
| `/tickets` | Support ticket operations |
| `/withdrawals` | Withdrawal requests, where implemented |

All protected endpoints should be accessed with a valid authentication token and the required user role.

## Project Structure

The project is divided into two main parts:

- `client/` — React frontend, pages, components and API helpers.
- `server/` — Express application, routes, controllers, middleware, models and database configuration.

The backend separates routing, business logic and database models to make the application easier to maintain.

## Notes

The book records contain royalty summary fields such as total royalty earned, royalty paid and royalty pending. These values are read from the database and displayed in the author dashboard and books page.

For development, run the frontend and backend in separate terminals. Make sure the database connection and environment variables are configured before testing protected routes.