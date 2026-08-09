# UPI Relay

A private, invite-only tool for a small trusted group (e.g. family, close friends, or a small
team). A member scans any merchant's UPI QR code; the admin gets the request in real time,
reviews it, and — if they approve — opens their **own** installed UPI app (pre-filled) to
complete the payment **manually**. The app never touches a payment rail itself.

## What this is (and isn't)

This is a **request/approval relay for people who already trust each other and settle up
directly, offline.** It is not a public payment service, not a payment aggregator, and not a way
to accept money from strangers.

Hard rules baked into the design — please keep them:

- No UPI PIN is ever requested or stored, anywhere.
- No payment is ever submitted automatically. The `pay-link` the admin opens only pre-fills
  their own UPI app; the admin still has to review and authorize it by hand, in that app.
- There is no public sign-up. Only an existing admin can create new member accounts
  (`Invite member` in the dashboard, or the `POST /api/auth/invite` endpoint).
- Requests auto-expire (default 10 minutes) if the admin doesn't act on them.

If you plan to use this beyond a small trusted circle — e.g. letting the public submit
requests, or building a business around it — that changes its regulatory footprint
significantly (in India this starts to look like payment aggregation, which requires RBI
authorization). Don't repurpose it that way without getting proper legal/compliance advice
first.

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router, Socket.IO client,
  html5-qrcode, Framer Motion, Axios
- **Backend:** Node.js, Express, Socket.IO, MongoDB (Mongoose), JWT auth, bcrypt, Helmet,
  express-rate-limit, express-mongo-sanitize, xss-clean

## Project structure

```
upi-relay/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── render.yaml       # Render deployment config for the backend
└── README.md
```

## 1. MongoDB Atlas setup

1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. Create a database user (username + password).
3. Under Network Access, allow the IPs you'll deploy from (or `0.0.0.0/0` for simplicity while
   testing — tighten this later).
4. Copy the connection string; it looks like:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/upi-relay?retryWrites=true&w=majority`

## 2. Backend setup

```bash
cd server
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET (long random string), CLIENT_ORIGIN, etc.
npm install
```

Create your first admin account (uses `SEED_ADMIN_*` values from `.env`):

```bash
npm run seed:admin
```

Run the backend:

```bash
npm run dev      # with nodemon, for local development
# or
npm start        # plain node, for production
```

The backend starts on `http://localhost:5000` by default. Check `http://localhost:5000/api/health`.

### Environment variables (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret used to sign session tokens |
| `JWT_EXPIRES_IN` | Session lifetime, e.g. `7d` |
| `CLIENT_ORIGIN` | Comma-separated allowed frontend origin(s), for CORS |
| `COOKIE_SECURE` | `true` in production (HTTPS), `false` for local HTTP |
| `REQUEST_EXPIRY_MINUTES` | Minutes before an unactioned request auto-expires |
| `SEED_ADMIN_NAME/EMAIL/PASSWORD` | Used only by `npm run seed:admin` |

## 3. Frontend setup

```bash
cd client
cp .env.example .env
# edit .env if your backend isn't on localhost:5000
npm install
npm run dev
```

Opens on `http://localhost:5173`. Log in with the admin account you seeded.

### Environment variables (`client/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend REST API base URL, e.g. `https://your-api.onrender.com/api` |
| `VITE_SOCKET_URL` | Backend Socket.IO URL, e.g. `https://your-api.onrender.com` |

## 4. Creating your friend's account

The dashboard is intentionally bare-bones — just requests and buttons — so there's no "Invite
member" UI cluttering it. Create your friend's login once, from the command line, using the
account you seeded for yourself as admin:

```bash
curl -X POST https://your-backend-url/api/auth/invite \
  -H "Content-Type: application/json" \
  -b "token=YOUR_ADMIN_JWT_TOKEN" \
  -d '{"name":"Friend Name","email":"friend@example.com","password":"a temporary password"}'
```

You can grab `YOUR_ADMIN_JWT_TOKEN` from your browser after logging in as admin: DevTools →
Application → Cookies → the `token` value. Send your friend their email + temporary password
directly (text, in person, whatever channel you already trust).

That's a one-time setup step per person — you won't need to touch it again after your friend
logs in.

## 5. Using the app

1. **Your friend:** logs in, lands on **Scan**, points their camera at a merchant's UPI QR
   code. If the QR doesn't already encode an amount, they enter one, then tap **Send request**.
2. **You (admin):** the request shows up instantly on your **Requests** page — on whatever
   device you're logged in on — with a sound + browser notification. **Approve** or **Reject**
   it.
3. **You (admin):** on approval, tap **Open UPI app to pay** — this opens your own installed
   UPI app (Google Pay, PhonePe, BHIM, Paytm, Amazon Pay, etc.) pre-filled with the merchant's
   details. Complete the payment there, exactly like you always do. Then tap **Mark paid** so
   your friend sees it went through.
4. **Your friend:** their screen updates live through each status — waiting → approved → paid
   (or rejected / expired) — no refresh needed, even if they're scanning from a totally
   different phone/network than you.

## 6. Deployment

### Backend → Render

`render.yaml` at the repo root is a Render "Blueprint" — connect your repo in the Render
dashboard and it will pick up the config. Set the `sync: false` env vars (`MONGO_URI`,
`JWT_SECRET`, `CLIENT_ORIGIN`) in the Render dashboard rather than committing them.

Or manually: New → Web Service → root directory `server` → build command `npm install` →
start command `npm start`, then add the environment variables from the table above.

### Frontend → Vercel

```bash
cd client
vercel
```

Or connect the repo in the Vercel dashboard with root directory `client`. `vercel.json` is
already set up for SPA routing. Set `VITE_API_URL` and `VITE_SOCKET_URL` to your deployed
backend's URL in Vercel's project environment variables.

### After deploying

Update the backend's `CLIENT_ORIGIN` to your deployed frontend URL, and set `COOKIE_SECURE=true`
since it'll be served over HTTPS.

## 7. Security notes

- Passwords are hashed with bcrypt (cost factor 12); plaintext passwords are never stored.
- JWTs are set as `httpOnly` cookies (with a bearer-token fallback for stricter mobile
  webviews) so they aren't accessible to page scripts.
- Helmet sets standard security headers; `express-mongo-sanitize` and `xss-clean` strip
  NoSQL-injection and script-injection attempts from input.
- Rate limiting is applied globally, and more tightly on login and request-creation endpoints.
- Only admins can create new accounts — there's no public registration endpoint.

## 8. Extending it

Ideas if you want to keep building:
- Password reset / change-password flow for invited members
- Per-member spending limits or daily caps
- Audit log viewer in the dashboard (the `PaymentLog` collection already records every status
  transition — it's just not surfaced in the UI yet)
- Push notifications (the current notification is a browser Notification + in-tab chime, which
  only fires while the dashboard tab is open)
