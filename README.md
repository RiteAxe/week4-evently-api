# Evently API - Week 4 Backend Case

Evently API is a REST API for an event management platform.
This project is built using TypeScript, Express.js, Prisma ORM, Zod validation, JWT authentication, bcrypt password hashing, and Jest testing.

---

## Features

### Authentication
- Register user
- Login user
- Password hashing using bcrypt
- JWT token authentication
- Default registered user role: attendee

### Authorization
Role-based access control:

| Role | Permission |
|---|---|
| attendee | View published events |
| organizer | Create, edit, delete, and publish own events |
| admin | Manage all events and users |

### Event Management
- View published events
- View event detail
- Organizer can create event
- Organizer can edit own event
- Organizer can delete own event
- Organizer can publish own event
- Admin can view all events including unpublished events
- Admin can edit and delete any event

### Admin Features
- View all users
- Assign user role to organizer by email

### Validation
All request body and params are validated using Zod.

### Testing
Automated API testing is implemented using Jest and Supertest.

---

## Tech Stack

- Node.js
- TypeScript
- Express.js
- Prisma ORM
- SQLite
- Zod
- JWT
- bcrypt
- dotenv
- nodemon
- Jest
- Supertest

---

## Project Structure

week4-evently-api
|
├── prisma
|   ├── schema.prisma
|   └── seed.ts
|
├── src
|   ├── controllers
|   |   ├── adminController.ts
|   |   ├── authController.ts
|   |   └── eventController.ts
|   |
|   ├── middleware
|   |   ├── authMiddleware.ts
|   |   └── roleMiddleware.ts
|   |
|   ├── routes
|   |   ├── adminRoutes.ts
|   |   ├── authRoutes.ts
|   |   └── eventRoutes.ts
|   |
|   ├── services
|   |   ├── authService.ts
|   |   └── eventService.ts
|   |
|   ├── tests
|   |   ├── admin.test.ts
|   |   ├── auth.test.ts
|   |   └── events.test.ts
|   |
|   ├── validations
|   |   ├── authValidation.ts
|   |   └── eventValidation.ts
|   |
|   ├── app.ts
|   └── prisma.ts
|
├── server.ts
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md

---

## Environment Variables

Create a .env file:

DATABASE_URL="file:./dev.db"
JWT_SECRET="SECRET_KEY"
PORT=3000

Example file:

DATABASE_URL="file:./dev.db"
JWT_SECRET="your_jwt_secret"
PORT=3000

---

## Installation

Install dependencies:

npm install

Run Prisma migration:

npx prisma migrate dev --name init

Generate Prisma client:

npx prisma generate

Seed admin account:

npx ts-node prisma/seed.ts

Run development server:

npm run dev

Server will run on:

http://localhost:3000

---

## Default Admin Account

Email: admin@evently.com
Password: Admin123
Role: admin

---

## API Endpoints

### Auth Routes

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /auth/register | Register new user | All |
| POST | /auth/login | Login user | All |

### Event Routes

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /events | Get published events | All |
| GET | /events/:id | Get event detail | All |
| POST | /events | Create event | Organizer |
| PUT | /events/:id | Edit own event | Organizer |
| DELETE | /events/:id | Delete own event | Organizer |
| PATCH | /events/:id/publish | Publish own event | Organizer |

### Admin Routes

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | /admin/events | Get all events including unpublished | Admin |
| PUT | /admin/events/:id | Edit any event | Admin |
| DELETE | /admin/events/:id | Delete any event | Admin |
| GET | /admin/users | Get all users | Admin |
| PATCH | /admin/users/role | Assign user role to organizer | Admin |

---

## Request Examples

### Register

POST /auth/register

Body:

{
  "name": "Chris",
  "email": "chris@test.com",
  "password": "Chris123"
}

Success response:

{
  "message": "Register success",
  "data": {
    "id": 2,
    "name": "Chris",
    "email": "chris@test.com",
    "role": "attendee"
  }
}

### Login

POST /auth/login

Body:

{
  "email": "chris@test.com",
  "password": "Chris123"
}

Success response:

{
  "message": "Login success",
  "token": "JWT_TOKEN"
}

### Create Event

POST /events

Header:

Authorization: Bearer YOUR_TOKEN

Body:

{
  "title": "Tech Conference 2026",
  "description": "A technology conference for developers and startups.",
  "location": "Jakarta",
  "date": "2026-08-10",
  "price": 150000,
  "maxAttendees": 100,
  "category": "conference"
}

### Assign Role

PATCH /admin/users/role

Header:

Authorization: Bearer ADMIN_TOKEN

Body:

{
  "email": "chris@test.com",
  "role": "organizer"
}

---

## Validation Rules

### User

| Field | Rule |
|---|---|
| name | Minimum 3 characters, maximum 100 characters |
| email | Must be valid email and unique |
| password | Minimum 8 characters, must contain 1 uppercase letter and 1 number |
| role | Default: attendee |

### Event

| Field | Rule |
|---|---|
| title | Minimum 5 characters, maximum 150 characters |
| description | Minimum 20 characters |
| location | Required |
| date | Must not be in the past |
| price | Cannot be negative |
| maxAttendees | Minimum 1 |
| category | conference, workshop, seminar, concert, sport, charity, curtural |
| isPublished | Default: false |

---

## Testing

Run all tests:

npm test

Test files:

src/tests/auth.test.ts
src/tests/events.test.ts
src/tests/admin.test.ts

Implemented test coverage:

### Auth Tests
- Register success
- Register failed because email already registered
- Register failed because Zod validation failed
- Login success
- Login failed because wrong password
- Login failed because email not found

### Event Tests
- Get published events
- Get event detail
- Event not found
- Organizer creates event
- Create event without JWT fails
- Create event with non-organizer role fails
- Create event with invalid data fails
- Organizer edits own event
- Organizer publishes own event
- Organizer deletes own event

### Admin Tests
- Admin views all events
- Non-admin cannot view all events
- Admin views all users
- Non-admin cannot view all users
- Admin assigns organizer role
- Assign role fails when user email is not found
- Admin edits any event
- Admin deletes any event
- Non-admin cannot delete admin event

---

## Scripts

npm run dev
Run development server with nodemon.

npm run build
Compile TypeScript.

npm start
Run compiled JavaScript from dist.

npm test
Run Jest tests.

---

## Notes

- The project uses SQLite for local development.
- Prisma enum is not used because SQLite with Prisma does not support enum in this setup.
- Role and category values are validated using Zod.
- Passwords are never returned in API responses.
- Only published events appear in the public event list.

---

## Author

RiteAxe
Week 4 Backend Training - Evently API
