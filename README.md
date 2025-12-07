# Node API

## Environment Config

API is configured to use PsotggreSQL or SQLite databases.

## Running API

```bash

# Install JavaScript dependencies
npm install

# Copy environment config and generate app key
cp .env.example .env

# Configure DATABASE_URL in .env file to point to your database

# If using SQLite,
DATABASE_URL="file:./dev.db"

# If using SQLite, Change provider in prisma/schema.prisma to sqlite
provider = "sqlite"

# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
[README.md](../../Laravel/peer-banking/README.md)
# Run migrations and generate Prisma client
npm run db:all

# Run API
npm run dev

```

## Testing API

```bash

# Update DATABASE_URL in .env file to point to test database or SQLite
DATABASE_URL="file:./dev.db"
# PROVIDER in .env to match the database provider used in prisma/schema.prisma
PROVIDER=

# If using SQLite, Change provider in prisma/schema.prisma to sqlite and delete migration folder
provider = "sqlite"

# Deleting migration and generated folders if any, 
rm -r prisma/migrations
rm -r src/generated

# Run migrations and generate Prisma client
npm run db:all

# Run tests
npm run test

```

## NOTE

When switching from SQLite to PostgreSQL or vice versa, make sure to delete migration folder and generated folders.

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