# GlobeTrotter API Documentation (Hour 1)

Base URL: `http://localhost:5000/api`

## Standard Response Format

All responses follow a consistent JSON structure:

```json
{
  "success": true,
  "message": "Descriptive message",
  "data": {}
}
```

---

## Endpoints

### 1. Health Check

Checks backend status and availability.

- **URL:** `/health`
- **Method:** `GET`
- **Authentication:** None
- **Response:** `200 OK`

```json
{
  "success": true,
  "message": "GlobeTrotter API is running"
}
```

---

### 2. User Signup

Registers a new user into the database and returns a JWT access token.

- **URL:** `/auth/signup`
- **Method:** `POST`
- **Authentication:** None
- **Headers:** `Content-Type: application/json`
- **Request Body:**

```json
{
  "name": "Alex Traveler",
  "email": "alex@example.com",
  "password": "Password123!"
}
```

- **Success Response:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Alex Traveler",
      "email": "alex@example.com",
      "created_at": "2026-08-22 11:20:00"
    },
    "token": "<jwt_access_token>"
  }
}
```

- **Error Responses:**
  - `400 Bad Request`: Missing required fields or email already registered.

---

### 3. User Login

Authenticates an existing user via email and bcrypt-hashed password, returning a JWT token.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Authentication:** None
- **Headers:** `Content-Type: application/json`
- **Request Body:**

```json
{
  "email": "alex@example.com",
  "password": "Password123!"
}
```

- **Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Alex Traveler",
      "email": "alex@example.com",
      "created_at": "2026-08-22 11:20:00"
    },
    "token": "<jwt_access_token>"
  }
}
```

- **Error Responses:**
  - `400 Bad Request`: Missing email or password.
  - `401 Unauthorized`: Invalid credentials.

---

### 4. Get Current User Profile (`/me`)

Retrieves the currently authenticated user's profile information.

- **URL:** `/auth/me`
- **Method:** `GET`
- **Authentication:** Required (`Bearer <token>`)
- **Headers:**
  - `Authorization: Bearer <jwt_access_token>`
- **Success Response:** `200 OK`

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Alex Traveler",
      "email": "alex@example.com",
      "created_at": "2026-08-22 11:20:00"
    }
  }
}
```

- **Error Responses:**
  - `401 Unauthorized`: Missing, invalid, or expired JWT token.
