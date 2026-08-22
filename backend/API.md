# GlobeTrotter API Documentation (Hour 1 & Hour 2)

Base URL: `http://localhost:5000/api`

## Standard Response Format

All API endpoints return JSON using a consistent structure:

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

## 1. System & Authentication APIs

### `GET /api/health`
Checks server status.
- **Auth:** None
- **Response:** `200 OK`

### `POST /api/auth/signup`
Registers a new user.
- **Auth:** None
- **Body:** `{ "name": "...", "email": "...", "password": "..." }`
- **Response:** `201 Created` with `user` and `token`.

### `POST /api/auth/login`
Logs in existing user.
- **Auth:** None
- **Body:** `{ "email": "...", "password": "..." }`
- **Response:** `200 OK` with `user` and `token`.

### `GET /api/auth/me`
Fetches current logged-in user profile.
- **Auth:** `Bearer <token>`
- **Response:** `200 OK` with `user`.

---

## 2. Trip APIs

All Trip endpoints require `Authorization: Bearer <token>` and enforce strict user ownership.

### `POST /api/trips`
Creates a new trip itinerary.
- **Auth:** `Bearer <token>`
- **Body:**
```json
{
  "name": "European Summer Discovery",
  "description": "2-week trip across Paris and Rome",
  "start_date": "2026-07-01",
  "end_date": "2026-07-15",
  "cover_image": "https://example.com/paris.jpg"
}
```
- **Response:** `201 Created`

### `GET /api/trips`
Retrieves all trips belonging to the authenticated user.
- **Auth:** `Bearer <token>`
- **Response:** `200 OK` with array of user trips.

### `GET /api/trips/:id`
Retrieves single trip details including associated `stops` and `activities`.
- **Auth:** `Bearer <token>`
- **Response:** `200 OK` or `403 Forbidden` if unauthorized / `404 Not Found`.

### `PUT /api/trips/:id`
Updates an existing trip.
- **Auth:** `Bearer <token>`
- **Body:** `{ "name": "Updated Name", "description": "...", "start_date": "...", "end_date": "...", "cover_image": "..." }`
- **Response:** `200 OK` with updated trip object.

### `DELETE /api/trips/:id`
Deletes a trip and cascades to stops and activities.
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`

---

## 3. Stop APIs

### `POST /api/trips/:id/stops`
Adds a stop (city destination) to a trip.
- **Auth:** `Bearer <token>`
- **Body:**
```json
{
  "city_id": 1,
  "city": "Paris",
  "start_date": "2026-07-01",
  "end_date": "2026-07-07",
  "position": 0
}
```
- **Response:** `201 Created`

### `GET /api/trips/:id/stops`
Retrieves all stops for a specific trip sorted by position.
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`

### `PUT /api/stops/:id`
Updates an existing stop directly by stop ID.
- **Auth:** `Bearer <token>`
- **Body:** `{ "city": "Paris Central", "start_date": "...", "end_date": "...", "position": 1 }`
- **Response:** `200 OK`

### `DELETE /api/stops/:id`
Deletes a stop by stop ID.
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`

---

## 4. Activity APIs

### `GET /api/activities`
Lists all available destination activities with optional filtering.
- **Auth:** None
- **Query Params:** `?city_id=1` or `?category=Sightseeing`
- **Response:** `200 OK`

### `GET /api/activities/:id`
Gets single activity details.
- **Auth:** None
- **Response:** `200 OK` or `404 Not Found`

### `POST /api/trips/:id/activities`
Attaches an activity to a user's trip itinerary.
- **Auth:** `Bearer <token>`
- **Body:**
```json
{
  "activity_id": 1,
  "stop_id": 1,
  "custom_name": "Eiffel Tower Sunset Tour",
  "scheduled_date": "2026-07-02",
  "scheduled_time": "18:00",
  "cost": 30
}
```
- **Response:** `201 Created`

### `DELETE /api/trips/:id/activities/:activityId`
Removes an activity from a trip.
- **Auth:** `Bearer <token>`
- **Response:** `200 OK`

---

## 5. City APIs

### `GET /api/cities`
Retrieves all available cities.
- **Auth:** None
- **Response:** `200 OK`

### `GET /api/cities/search?q=paris`
Searches cities by name, country, or region.
- **Auth:** None
- **Query Param:** `q` (e.g. `paris`, `france`, `asia`)
- **Response:** `200 OK`
