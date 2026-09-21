# Airbnb Clone — Zaio Capstone (MERN)

A full-stack Airbnb clone built for the Zaio Institute fullstack capstone, matching the
provided Figma designs (homepage, listing detail, login, and host/admin dashboard).

## Stack

- **Frontend:** React 19 + Vite, React Router, Axios
- **Backend:** Node.js + Express 5, MongoDB + Mongoose, JWT auth, bcrypt password hashing
- **Roles:** `guest` (browse, book, manage own reservations) and `host` (CRUD own listings,
  view reservations made on their listings only)

## Project structure

```
airbnb-clone/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # layout/, listing/, host/, common/
│       ├── pages/           # one file per route
│       ├── context/         # AuthContext
│       ├── hooks/           # useAuth, useListings
│       ├── services/        # api.js, authService, listingService, reservationService
│       └── utils/           # formatters
├── server/                  # Express backend
│   ├── config/db.js
│   ├── models/              # User, Listing, Reservation
│   ├── controllers/         # thin HTTP layer
│   ├── services/            # business logic
│   ├── routes/
│   ├── middleware/          # requireAuth, requireRole, errorHandler
│   └── utils/seed.js        # demo data matching the Figma content
├── Procfile                 # Heroku web process
└── package.json             # root build/deploy scripts
```


## Local setup

```bash
# 1. Install everything
npm run install:client
npm run install:server
# 2. Configure the server
cp server/.env.example server/.env
# then edit server/.env with your MongoDB Atlas URI and a JWT secret

# 3. (optional) seed demo data — a host (ghazal / password123)
#    with 3 listings, and a guest (johndoe / password123)
npm run seed

# 4. Run both apps in separate terminals
npm run server   # http://localhost:5000
npm run client   # http://localhost:5173 (proxies /api to the server)
```

**Windows + Node 22+ note:** if `npm run seed` or `npm run server` fails with
`querySrv ECONNREFUSED _mongodb._tcp...`, that's a known Node.js DNS resolution bug on
Windows, not a problem with your connection string. `server/config/db.js` already works
around it by pointing Node at public DNS resolvers (1.1.1.1 / 8.8.8.8) before connecting.

## API overview

| Method | Route                          | Auth        | Description                         |
|--------|---------------------------------|-------------|--------------------------------------|
| POST   | /api/auth/signup                | –           | Create account (guest or host)       |
| POST   | /api/auth/login                 | –           | Log in, returns JWT + user           |
| GET    | /api/listings                   | –           | Search/browse listings (paginated, filterable by location/guests/price/dates) |
| GET    | /api/listings/:id                | –           | Listing detail                       |
| GET    | /api/listings/host/mine          | host        | Host's own listings                  |
| POST   | /api/listings                    | host        | Create listing                       |
| PUT    | /api/listings/:id                 | host (owner)| Update own listing                   |
| DELETE | /api/listings/:id                 | host (owner)| Delete own listing                   |
| POST   | /api/uploads                      | host        | Upload up to 10 listing images (multipart/form-data, field name `images`) |
| GET    | /api/wishlist                     | any         | List the current user's saved listings |
| POST   | /api/wishlist/:listingId           | any         | Save a listing to the wishlist       |
| DELETE | /api/wishlist/:listingId           | any         | Remove a listing from the wishlist   |
| POST   | /api/reservations                 | guest       | Book a listing                       |
| GET    | /api/reservations/mine            | any         | Guest's own bookings                 |
| GET    | /api/reservations/host            | host        | Bookings on the host's listings      |
| DELETE | /api/reservations/:id              | owner       | Cancel a reservation                 |

`GET /api/listings` accepts `location`, `guests`, `minPrice`, `maxPrice`, `checkIn`,
`checkOut` (excludes listings with an overlapping confirmed reservation), `sort`
(`price_asc` | `price_desc` | `rating` | `newest`), `page`, and `limit`, and returns
`{ results, pagination: { page, limit, total, totalPages } }`.

## Tests

```bash
cd server
npm test
```

25 Jest unit tests cover `authService`, `listingService` (ownership checks + search query
building), `reservationService` (date validation, capacity, overlap detection, price
calculation), and the `requireAuth`/`requireRole` middleware — all with mocked Mongoose
models, so no live database is needed to run them.

## Image uploads

Images upload via `multer` to `server/uploads/` and are served at `/uploads/<filename>`
by default. **Heroku's filesystem is ephemeral** — uploaded files disappear on every
dyno restart/deploy — so for any deployed environment, set a `CLOUDINARY_URL` config var
(see `server/.env.example`) and uploads automatically switch to Cloudinary storage instead,
no code changes needed. Locally, leave it unset and files just go to disk.

## Deploying to Heroku

1. `heroku create` and set config vars: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`.
2. Push the repo — `heroku-postbuild` installs both `client` and `server` deps and runs
   `vite build`; `server/index.js` serves the built `client/dist` in production and falls
   back to `index.html` for client-side routes.
3. `heroku run npm run seed` if you want the demo data live.

## What's implemented vs. still to do

- ✅ Guest frontend: homepage, search + pagination + filters, listing detail, booking, trips, wishlist
- ✅ Host frontend: dashboard, create/update/delete listing with real image upload, view reservations
- ✅ Backend: JWT auth, role-based route guards, listing + reservation CRUD, image upload
  (local disk or Cloudinary), wishlist save/unsave, seed script
- ✅ 31 Jest unit tests across services and middleware

