# Store Rating System

A full-stack web application for managing store ratings and reviews. Users can rate stores, view store details, and administrators can manage users and view statistics.

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React.js
- Material-UI
- React Router
- Formik & Yup for form handling
- Axios for API requests

## Features

### User Features
- User registration and authentication
- Password management
- Store browsing and search
- Store rating submission
- View store details and ratings

### Admin Features
- User management
- Dashboard statistics
- Store management
- Rating moderation

### Store Owner Features
- View store ratings
- Store statistics
- Rating notifications

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL (v12 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd store-rating-system
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Set up the database:
   - Create a PostgreSQL database
   - Update the `.env` file with your database credentials
   - Run the database migrations

5. Start the backend server:
   ```bash
   npm start
   ```

6. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=store_rating_db
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - User login
- PUT /api/auth/password - Update password

### Users
- GET /api/users - Get all users (admin only)
- POST /api/users - Create a new user (admin only)
- GET /api/users/:id - Get user details
- PUT /api/users/:id - Update user details
- DELETE /api/users/:id - Delete a user

### Stores
- GET /api/stores - Get all stores
- POST /api/stores - Create a new store
- GET /api/stores/:id - Get store details
- PUT /api/stores/:id - Update store details
- DELETE /api/stores/:id - Delete a store
- GET /api/stores/:id/ratings - Get store ratings

### Ratings
- POST /api/ratings/stores/:id - Submit a rating
- GET /api/ratings/stores/:id - Get user's rating for a store
- GET /api/ratings/dashboard - Get dashboard statistics (admin only)

## Project Structure

```
store-rating-system/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   └── utils/          # Utility functions
├── frontend/           # React frontend application
├── .env               # Environment variables
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 