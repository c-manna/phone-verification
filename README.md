# Phone Number Verification Platform

Production-style phone number verification project built with:

- Backend: Node.js, Express.js, TypeScript, MongoDB, Mongoose, Twilio, JWT, Helmet, CORS, Zod, rate limiting, serverless-http
- Frontend: React, TypeScript, Vite, Axios
- Infrastructure: Terraform, AWS Lambda, AWS API Gateway HTTP API, S3 static website hosting

The backend can run locally with `ts-node` style dev tooling and can also be packaged as a Lambda zip for API Gateway. The frontend is a minimal demo app that walks through registration, OTP send, and OTP verification.

## Architecture

```text
React TypeScript Frontend on S3
        |
        v
AWS API Gateway HTTP API
        |
        v
AWS Lambda running Express.js TypeScript API
        |
        v
MongoDB Atlas

Lambda also calls Twilio SMS API
```

## Folder Structure

```text
backend/
  src/
    config/
      db.ts
      env.ts
    controllers/
      auth.controller.ts
      verification.controller.ts
    middleware/
      auth.middleware.ts
      error.middleware.ts
      validate.middleware.ts
    models/
      user.model.ts
      verification.model.ts
    routes/
      auth.routes.ts
      verification.routes.ts
    services/
      sms.service.ts
      token.service.ts
      verification.service.ts
    types/
      express.d.ts
      jwt-payload.type.ts
    utils/
      app-error.ts
      asyncHandler.ts
      otp.ts
      response.ts
    validators/
      auth.validator.ts
      verification.validator.ts
    app.ts
    lambda.ts
    server.ts

frontend/
  src/
    api/
      axios.ts
    components/
      PhoneVerification.tsx
    types/
      user.ts
    App.tsx
    main.tsx
    index.css

infra/
  modules/
    lambda-api/
    s3-frontend/
```

## Backend Local Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file from the example:

```bash
cp .env.example .env
```

3. Fill in your MongoDB Atlas URI, JWT secret, Twilio credentials, and frontend origin.

4. Start the API locally:

```bash
npm run dev
```

5. Health check:

```bash
curl http://localhost:4000/health
```

## Frontend Local Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Create a `.env` file from the example:

```bash
cp .env.example .env
```

3. Set `VITE_API_BASE_URL` to your local backend URL or deployed API Gateway URL.

4. Start the frontend:

```bash
npm run dev
```

## MongoDB Setup

- Create a MongoDB Atlas cluster.
- Add a database user and network access rule.
- Copy the connection string into `backend/.env` as `MONGODB_URI`.
- The app creates `users` and `verificationcodes` collections automatically through Mongoose.

## Twilio Setup

- Create a Twilio account.
- Buy or verify an SMS-capable phone number.
- Copy `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` into `backend/.env`.
- In development, the server logs the OTP to the console as a fallback for testing.

## Terraform Deployment

1. Build the backend zip:

```bash
cd backend
npm install
npm run package
```

This creates `backend/dist/lambda.zip`.

2. Prepare Terraform variables:

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
```

3. Update `terraform.tfvars` with your real values.

4. Initialize Terraform:

```bash
terraform init
```

5. Plan and apply:

```bash
terraform plan
terraform apply
```

6. Terraform outputs:

- `api_gateway_url`
- `frontend_bucket_name`
- `frontend_website_url`

## Backend Update Flow

Use this when you change anything under `backend/src` or backend dependencies.

1. Install or refresh backend dependencies if needed:

```bash
cd backend
npm install
```

2. Build and package the Lambda zip:

```bash
npm run package
```

3. Update Terraform if any Lambda env vars or infrastructure changed:

```bash
cd ../infra
terraform apply
```

4. If only backend code changed, `terraform apply` still picks up the new `backend/dist/lambda.zip` because the Lambda resource uses the zip hash.

5. Check CloudWatch logs for the Lambda after the deploy if the API still returns a 5xx.

## Lambda Packaging Steps

- Build TypeScript to `backend/dist`:

```bash
cd backend
npm run build
```

- Create the Lambda zip:

```bash
npm run package
```

The zip includes:

- `dist/`
- `package.json`
- `package-lock.json`
- production `node_modules/`

Terraform uses `backend/dist/lambda.zip` by default.

## Frontend S3 Deployment Steps

Use this when you change anything under `frontend/src` or frontend dependencies.

1. Install or refresh frontend dependencies if needed:

```bash
cd frontend
npm install
```

2. Build the frontend:

```bash
npm run build
```

3. Upload the contents of `frontend/dist` to the S3 bucket Terraform created:

```bash
aws s3 sync dist s3://<frontend_bucket_name> --delete
```

4. Open the `frontend_website_url` output to test the app.

5. If the API Gateway URL changes, update `frontend/.env` with the new `VITE_API_BASE_URL`, rebuild, and sync the `dist` folder again.

6. If you prefer the AWS Console, upload every file from `frontend/dist` to the S3 bucket root and keep `index.html` at the top level.

## Quick Update Checklist

- Backend code change: `cd backend && npm run package`, then `cd ../infra && terraform apply`
- Backend env or infra change: update `infra/terraform.tfvars`, then `terraform apply`
- Frontend code change: `cd frontend && npm run build && aws s3 sync dist s3://<frontend_bucket_name> --delete`
- API URL changed: update `frontend/.env`, rebuild frontend, then upload again

## API Documentation

### GET /health

Response:

```json
{
  "status": "ok",
  "message": "Phone verification API is running"
}
```

### POST /api/auth/register

Request:

```json
{
  "name": "John Doe",
  "phone": "+919999999999"
}
```

Response:

```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "...",
    "name": "John Doe",
    "phone": "+919999999999",
    "isPhoneVerified": false
  }
}
```

### GET /api/auth/me

Authorization:

```text
Bearer JWT_TOKEN
```

Response:

```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "John Doe",
    "phone": "+919999999999",
    "isPhoneVerified": true
  }
}
```

### POST /api/verification/send-code

Authorization:

```text
Bearer JWT_TOKEN
```

Request:

```json
{
  "phone": "+919999999999"
}
```

Response:

```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

### POST /api/verification/verify-code

Authorization:

```text
Bearer JWT_TOKEN
```

Request:

```json
{
  "phone": "+919999999999",
  "code": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "Phone number verified successfully",
  "user": {
    "id": "...",
    "phone": "+919999999999",
    "isPhoneVerified": true
  }
}
```

## Security Notes

- OTP values are never stored in plain text.
- OTP expiry is set to 2 minutes.
- Verification attempts are capped at 5.
- Protected APIs require a JWT Bearer token.
- Helmet and CORS are enabled on the backend.
- OTP routes have basic rate limiting.
- Twilio secrets and JWT secrets are passed through environment variables only.
- The frontend stores JWT in `localStorage` only for demo purposes.

## Testing Flow

1. Register a user from the frontend.
2. Send an OTP.
3. Check your SMS or backend console log in development.
4. Enter the code and verify.
5. Confirm that the current user state flips to verified and that `/api/auth/me` reflects the update.

## Notes

- The Lambda handler is `dist/lambda.handler`.
- The local server entrypoint is `src/server.ts`.
- For production, upload only the compiled frontend assets from `frontend/dist` to S3.
