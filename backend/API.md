# GlobeTrotter Complete API Documentation

Base URL: `http://localhost:5000/api`

## Standard Response Format

All API endpoints return standard JSON responses:

```json
{
  "success": true,
  "message": "Descriptive message string",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description message",
  "data": null
}
```

---

## 1. System & Authentication

### `GET /api/health`
- **Auth:** None
- **Response:** `200 OK`

### `POST /api/auth/signup`
- **Auth:** None
- **Body:** `{ "name": "...", "email": "...", "password": "..." }`
- **Response:** `201 Created`

### `POST /api/auth/login`
- **Auth:** None
- **Body:** `{ "email": "...", "password": "..." }`
- **Response:** `200 OK`

### `GET /api/auth/me`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`

---

## 2. Profile APIs

### `GET /api/profile`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK` returns user profile `{ id, name, email, avatar, preferredCurrency, created_at }`.

### `PUT /api/profile`
- **Auth:** `Bearer <token>`
- **Body:** `{ "name": "New Name", "avatar": "https://...", "preferredCurrency": "EUR" }`
- **Response:** `200 OK` with updated user profile.

---

## 3. Trip APIs

### `POST /api/trips`
- **Auth:** `Bearer <token>`
- **Body:** `{ "name": "...", "description": "...", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "budget": 3000, "cover_image": "..." }`
- **Response:** `201 Created`

### `GET /api/trips`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK` array of user trips.

### `GET /api/trips/:id`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK` trip with embedded stops & activities.

### `PUT /api/trips/:id`
- **Auth:** `Bearer <token>`
- **Body:** `{ "name": "...", "description": "...", "start_date": "...", "end_date": "...", "budget": 3500 }`
- **Response:** `200 OK`

### `DELETE /api/trips/:id`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`

---

## 4. Budget & Timeline APIs

### `GET /api/trips/:id/budget`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transport": 250,
    "stay": 600,
    "activities": 120,
    "meals": 150,
    "total": 1120,
    "averagePerDay": 160,
    "overBudget": false
  }
}
```

### `GET /api/trips/:id/timeline`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK` returns day-wise itinerary list grouped by date with scheduled activities and expenses.

---

## 5. Expense APIs

### `POST /api/trips/:id/expenses`
- **Auth:** `Bearer <token>`
- **Body:** `{ "category": "transport" | "stay" | "activity" | "meal", "amount": 150.00, "description": "Flight ticket" }`
- **Response:** `201 Created`

### `GET /api/trips/:id/expenses`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK` array of trip expenses.

### `DELETE /api/expenses/:id`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`

---

## 6. Public Sharing APIs

### `POST /api/trips/:id/share`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tripId": 1,
    "shareId": "sh_a1b2c3d4e5f67890",
    "shareUrl": "/api/shared/sh_a1b2c3d4e5f67890"
  }
}
```

### `GET /api/shared/:shareId`
- **Auth:** None (Public Read-Only)
- **Response:** `200 OK` returns read-only itinerary view with owner name, stops, and activities.

---

## 7. Stops & Activities APIs

### `POST /api/trips/:id/stops`
- **Auth:** `Bearer <token>`
- **Body:** `{ "city_id": 1, "city": "Paris", "start_date": "...", "end_date": "...", "position": 0 }`
- **Response:** `201 Created`

### `GET /api/trips/:id/stops`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`

### `PUT /api/stops/:id`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`

### `DELETE /api/stops/:id`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`

### `GET /api/activities`
- **Auth:** None
- **Query Params:** `?city_id=1` or `?category=Sightseeing`

### `GET /api/activities/:id`
- **Auth:** None

### `POST /api/trips/:id/activities`
- **Auth:** `Bearer <token>`
- **Body:** `{ "activity_id": 1, "stop_id": 1, "custom_name": "Eiffel Tower Tour", "scheduled_date": "...", "scheduled_time": "10:00", "cost": 30 }`
- **Response:** `201 Created`

### `DELETE /api/trips/:id/activities/:activityId`
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`

---

## 8. City Directory APIs

### `GET /api/cities`
- **Auth:** None

### `GET /api/cities/search?q=paris`
- **Auth:** None
