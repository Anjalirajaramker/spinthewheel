# Quest 2026 Hunt Deployment

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

- Copy `.env.example` to `.env`
- Set `ADMIN_KEY`
- Optional: set `DATABASE_URL` for Postgres/Supabase/Neon

3. Start server:

```bash
npm start
```

4. Open URLs:

- Participant app: `/quest2026-treasure-hunt.html`
- Admin dashboard: `/admin.html`

## Storage modes

- If `DATABASE_URL` is set: uses Postgres (recommended for production)
- If not set: uses local file `data/store.json`

## Admin exports

- JSON: `/api/admin/results?key=<ADMIN_KEY>`
- CSV: `/api/admin/export?key=<ADMIN_KEY>`

## Question bank management (no redeploy)

- Manage via admin page: `/admin.html`
- Admin APIs:
  - `GET /api/admin/questions?includeInactive=true&key=<ADMIN_KEY>`
  - `POST /api/admin/questions?key=<ADMIN_KEY>`
  - `PUT /api/admin/questions/:id?key=<ADMIN_KEY>`
  - `DELETE /api/admin/questions/:id?key=<ADMIN_KEY>` (soft deactivate)

When `DATABASE_URL` is configured, questions are stored in Postgres table `questions`.
If `DATABASE_URL` is not set, questions are stored in `data/store.json`.

## Deploy recommendation

- Use Render/Railway/Fly with Node runtime
- Set environment variables in the platform:
  - `ADMIN_KEY`
  - `DATABASE_URL` (Supabase/Neon connection string)

