# API Data Contract / API Documentation

## Base URL
http://localhost:8081

## 1. User Registration

**Method:** POST  
**Endpoint:** /api/register  
**Purpose:** Registers a new user account.

**Headers:**
Content-Type: application/json

**Request Body:**
- username: String
- email: String
- password: String

**Sample Request:**
{
  "username": "ian",
  "email": "ian@gmail.com",
  "password": "123456"
}

**Success:**
200 OK

**Sample Success Response:**
{
  "message": "Registration successful",
  "id": 1,
  "username": "ian",
  "email": "ian@gmail.com"
}

**Errors:**
400 Bad Request

{
  "message": "Username, email and password are required"
}

400 Bad Request

{
  "message": "Email already exists"
}

---

## 2. User Login

**Method:** POST  
**Endpoint:** /api/login  
**Purpose:** Authenticates an existing user.

**Headers:**
Content-Type: application/json

**Request Body:**
- email: String
- password: String

**Sample Request:**
{
  "email": "ian@gmail.com",
  "password": "123456"
}

**Success:**
200 OK

**Sample Success Response:**
{
  "message": "Login successful",
  "id": 1,
  "username": "ian",
  "email": "ian@gmail.com"
}

**Errors:**
400 Bad Request

{
  "message": "Email and password are required"
}

401 Unauthorized

{
  "message": "Invalid email or password"
}

---

## 3. Get User

**Method:** GET  
**Endpoint:** /api/user/{id}  
**Purpose:** Retrieves user information by ID.

**Headers:**
Accept: application/json

**Request Body:**
None

**Path Parameter:**
- id: Long

**Success:**
200 OK

**Sample Success Response:**
{
  "id": 1,
  "username": "ian",
  "email": "ian@gmail.com"
}

**Error:**
404 Not Found

{
  "message": "User not found"
}

## Security Notes

Passwords are entered using password input fields.
Passwords are hashed by the Spring Boot backend before storage.
Passwords are not returned by the API responses.
