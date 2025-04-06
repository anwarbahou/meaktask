# Meaktask Backend API

This is the backend API for the Meaktask application, built with Node.js, Express, and MongoDB.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/meaktask
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRE=30d
     ```

3. Run the server:
   - Development mode: `npm run dev`
   - Production mode: `npm start`

## API Endpoints

### Authentication

- **Register User**
  - URL: `POST /api/auth/register`
  - Body: 
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "token": "JWT_TOKEN"
    }
    ```

- **Login User**
  - URL: `POST /api/auth/login`
  - Body:
    ```json
    {
      "email": "john@example.com",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "token": "JWT_TOKEN"
    }
    ```

### Users

- **Get Current User**
  - URL: `GET /api/users/me`
  - Headers: `Authorization: Bearer JWT_TOKEN`
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2023-04-05T10:25:00.000Z"
      }
    }
    ```

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. To access protected routes, include the JWT token in the Authorization header of your requests:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Error Handling

Errors are returned in a consistent format:

```json
{
  "success": false,
  "error": "Error message here"
}
``` 