# Node API

## Environment Config

API is configured to use PostgreSQL. Copy `.env.example` to `.env` and adjust values for your environment.

| Variable | Description | Default |
| --- | --- | --- |
| `APP_NAME` | Display name for docs and emails | `Auth API` |
| `APP_URL` | Base URL used in emails and Swagger docs | Required |
| `APP_KEY` | Application signing key for verification tokens | Required |
| `NODE_ENV` | Runtime environment (`local`, `development`, `test`, `production`) | `local` |
| `PORT` | Port the API listens on | `3000` |
| `LOG_LEVEL` | Pino log level | `info` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Required |
| `JWT_ACCESS_SECRET` | JWT access token secret | Required |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Required |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (e.g. `120m`) | `120m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g. `7d`) | `7d` |
| `SWAGGER_ENABLED` | Enable Swagger docs | `false` |
| `MAIL_HOST` | SMTP host | `localhost` |
| `MAIL_PORT` | SMTP port | `1025` |
| `MAIL_USERNAME` | SMTP username | empty |
| `MAIL_PASSWORD` | SMTP password | empty |
| `MAIL_FROM` | Default sender email | `noreply@example.com` |

### Example `.env`

```env
APP_NAME="Auth API"
APP_URL="http://localhost:3000"
APP_KEY="change-me"
NODE_ENV="local"
PORT=3000
LOG_LEVEL="info"

DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
REDIS_URL="redis://localhost:6379"

GOOGLE_CLIENT_ID="your-google-client-id"
JWT_ACCESS_SECRET="change-me"
JWT_REFRESH_SECRET="change-me"
JWT_ACCESS_EXPIRES_IN="120m"
JWT_REFRESH_EXPIRES_IN="7d"

SWAGGER_ENABLED=false

MAIL_HOST="localhost"
MAIL_PORT=1025
MAIL_USERNAME=""
MAIL_PASSWORD=""
MAIL_FROM="noreply@example.com"
```

## Setup

```bash
cp .env.example .env

# Install JavaScript dependencies
npm install

# Generate Token Secret for APP_KEY, JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Run API
npm run dev

```

## Testing API

API architecture is set up to use two schemas, one for testing and one for production/development.

```bash

# Generate migrations
npm run db:migrate

# Sync both schemas
npm run db:sync

# Run tests
npm run test

```

## Two-Factor QR Code

The QR code can be shown by pasting ```data:image/png;base64,....```
in the response from 2FA init route [here](https://base64.guru/converter/decode/image)

## Google Auth Flow

To test Google Auth Flow, use the following:

1. Go to [Google OAuth](https://developers.google.com/oauthplayground/)
2. Pick Google OAuth2
3. Select all options
4. Top right, click Settings -> Use your own OAuth credentials
5. Enter Client ID and Client Secret
6. Click Authorize APIs and then Exchange authorization code for tokens
7. Copy the id_token and paste it in the request body
