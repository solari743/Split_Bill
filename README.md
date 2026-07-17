# Split Bill

Split Bill is an Expo app plus a Dockerized Node/Postgres backend for scanning receipts, confirming parsed line items, splitting bills, and tracking who has paid.

## Run the Backend

Start Postgres and the API:

```bash
docker compose up --build
```

The API listens on `http://localhost:4000`.

For local backend development without Docker, copy `server/.env.example` to `server/.env`, set `JWT_SECRET`, start Postgres, then run `npm run dev` inside `server/`.

## Run the Expo App

1. Copy `.env.example` to `.env`.
2. Keep `EXPO_PUBLIC_API_URL=http://localhost:4000` for local web testing.
3. For physical device testing, use your machine LAN IP instead of `localhost`, for example `EXPO_PUBLIC_API_URL=http://192.168.1.10:4000`.
4. Start Expo:

```bash
npm start
```

Google sign-in requires matching `GOOGLE_CLIENT_ID` on the server and Expo Google client IDs in `.env`. Email/password auth works without Google configuration.

## Demo Flow

Register or sign in, scan or pick a receipt image, confirm the parsed receipt, add participants, choose even or itemized split, then mark participants as paid from the bill detail screen.
