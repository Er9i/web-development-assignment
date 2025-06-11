# Online Bookstore

A full-stack online bookstore application built with React, Node.js, Express, and SQLite.

## Features

- User authentication (register, login)
- Browse and search books
- Filter books by genre
- Shopping cart functionality
- Order placement and history
- Admin panel for managing books
- Responsive design

## Tech Stack

### Frontend
- React
- Material-UI
- React Router
- Axios
- Context API for state management

### Backend
- Node.js
- Express
- SQLite
- JWT for authentication
- bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd online-bookstore
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```
The server will run on http://localhost:5000

2. Start the frontend development server:
```bash
cd client
npm start
```
The frontend will run on http://localhost:3000

## Database

The application uses SQLite as its database. The database file (`db.sqlite`) will be created automatically when you first run the server.

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Books
- GET /api/books - Get all books
- GET /api/books/:id - Get a specific book
- POST /api/books - Add a new book (admin only)
- PUT /api/books/:id - Update a book (admin only)
- DELETE /api/books/:id - Delete a book (admin only)

### Orders
- POST /api/orders - Create a new order
- GET /api/orders/my-orders - Get user's orders
- GET /api/orders/:id - Get a specific order

## Deployment

### Frontend (Vercel)
1. Create a Vercel account
2. Connect your GitHub repository
3. Configure the build settings:
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/build`
   - Install Command: `cd client && npm install`

### Backend (Render)
1. Create a Render account
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment Variables:
     - PORT: 5000
     - JWT_SECRET: your-secret-key

## License

MIT 