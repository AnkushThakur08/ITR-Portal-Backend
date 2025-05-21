# ITR Filing Portal Backend

This is the backend server for the ITR Filing Portal. It provides APIs for user authentication, document management, and ITR filing process.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Twilio Account (for OTP)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory and add the following variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/itr-filing
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

3. Build the TypeScript code:

```bash
npm run build
```

## Running the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- POST `/api/auth/send-otp` - Send OTP to phone number
- POST `/api/auth/verify-otp` - Verify OTP
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### User Management

- GET `/api/users` - Get all users (Admin only)
- GET `/api/users/:id` - Get user details
- PUT `/api/users/:id` - Update user details
- DELETE `/api/users/:id` - Delete user (Admin only)

### Document Management

- POST `/api/documents` - Upload document
- GET `/api/documents` - Get user documents
- DELETE `/api/documents/:id` - Delete document

### Payment Management

- POST `/api/payments` - Create payment
- GET `/api/payments` - Get payment history
- GET `/api/payments/:id` - Get payment details

## Error Handling

The API uses a consistent error response format:

```json
{
  "status": "error",
  "message": "Error message"
}
```

## Authentication

Most endpoints require authentication using JWT. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```
