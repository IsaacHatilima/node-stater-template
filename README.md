# Node API

## Environment Config

API is configured to use PostgreSQL.

## Setup

To prepare the API, make changes to .env.development and env.test files as needed:

### Then

```bash

cp .env.example .env.development
cp .env.example .env.test

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