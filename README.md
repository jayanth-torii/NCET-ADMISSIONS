<div align="center">

<img src="web/public/ngi-logo.png" alt="NGI Logo" width="96" />

# NGI Admissions

### Admission landing page for the Nagarjuna Group of Institutions

**Next.js 16** · **TypeScript** · **Tailwind CSS v4** · **shadcn/ui** · **Express** · **MongoDB**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)

---

<p align="center">
  <img src="https://img.shields.io/badge/Admissions-2026%E2%80%9327-F6872A?style=for-the-badge" />
  <img src="https://img.shields.io/badge/NAAC-A%2B-0A1F44?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Autonomous-VTU-0A1F44?style=for-the-badge" />
</p>

<br>

## ✨ Highlights

<table>
<tr>
<td width="50%" valign="top">

**🎨 Brand-faithful theme**

Colours sampled directly from the live `ncet.co.in` stylesheet —
navy `#0A1F44` (118 uses) and ember `#F6872A` (101 uses).
Typography is **Product Sans**, the same family the site declares, self-hosted
as `woff2` for zero layout shift.

</td>
<td width="50%" valign="top">

**⚡ Hand-built animation**

Aurora backdrop, scroll-triggered number ticker, infinite accreditation
marquee, word-by-word blur reveal, cursor spotlight cards and blur-fade
reveals — in the Animata / Lightswind idiom. Every one collapses to a static
state under `prefers-reduced-motion`.

</td>
</tr>
<tr>
<td valign="top">

**🛡️ Validated twice**

The nine-field admission form is checked in the browser for instant feedback
and again on the server, which is the authority. The client can never bypass it.
Only whitelisted fields are persisted.

</td>
<td valign="top">

**📊 Weekly Excel report**

Every Saturday the job emails the counsellor a short note plus a styled
two-sheet `.xlsx` of the week's applications. Delivered over SMTP with
click-to-call phone numbers in the body.

</td>
</tr>
</table>

---

## 📸 Sections

| | |
|---|---|
| **Hero** — animated aurora, word-by-word reveal, dual CTA | **Stats** — scroll-triggered counters (NCET at a Glance, 2025–26) |
| **Accreditation marquee** — 10 verified accreditations | **Counsellor + application form** — side by side |
| **Programmes** — infinite 3D card carousel, UG / PG | **Learning ecosystem** — library, labs, innovation spaces |
| **Admission process** — five clear stages | |

---

## 🏛️ About the group

The **Nagarjuna Group of Institutions** unites six units under the Nagarjuna
Education Society, Yelahanka, Bengaluru:

| Unit | Notes |
|---|---|
| Nagarjuna College of Engineering & Technology | Autonomous under VTU · NAAC A+ · Devanahalli |
| Novus Early Learning Center | |
| Nagarjuna Degree College | UGC recognised · Yelahanka |
| Nagarjuna College of Management Studies | |
| Nagarjuna Pre University College | |

> Institution names come from the official *HR Conclave 2026* deck ("Wings of
> Nagarjuna"). Programme detail is attached only where it could be corroborated
> from public sources — the rest are marked *"Programme details to be confirmed"*
> rather than invented. Add them in `web/src/data/site.ts` as they are verified.

---

## 🚀 Quick start

```bash
git clone https://github.com/jayanth-torii/NCET-ADMISSIONS.git
cd NCET-ADMISSIONS

npm run install:all          # root + api + web dependencies
```

> A plain `npm install` at the root also installs both workspaces — a `postinstall`
> hook runs the per-workspace installs, so CI platforms that only call
> `npm install && npm run build` work without extra configuration.

### 1 · API

```bash
cd api
cp .env.example .env         # fill in your Atlas URI
npm run seed                 # seeds the regional counsellor
```

### 2 · Run both apps

```bash
npm run dev                  # api :4005 · web :3000
```

Open **http://localhost:3000**

<details>
<summary><b>💡 No Atlas handy?</b></summary>

Run a throwaway MongoDB and seed it in one step:

```bash
npm run mongo:local          # prints LOCAL_MONGO_URI, seeds the counsellor
MONGODB_URI=mongodb://127.0.0.1:27017/ngi_admissions npm run dev:api
```

</details>

---

## 🧾 The admission form

Field set exactly as agreed for the 2026 intake:

| Form field | Stored as | Validation |
|---|---|---|
| Student name | `studentName` | 2–120 chars |
| Student mobile | `studentMobile` | 10 digits, starts 6–9 |
| Gender | `gender` | `male` / `female` / `other` |
| Father / guardian name | `fatherName` | 2–120 chars |
| Father / guardian mobile | `fatherMobile` | 10 digits, starts 6–9 |
| Inter college name | `interCollegeName` | 2–180 chars |
| Inter college place | `interCollegePlace` | 2–120 chars |
| Application number | `appNumber` | required · upper-cased on save |
| Home town address | `homeTownAddress` | 5–400 chars |

```bash
curl -X POST http://localhost:4005/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Anitha Sharma",
    "studentMobile": "9876543210",
    "gender": "female",
    "fatherName": "Ramesh Sharma",
    "fatherMobile": "9123456780",
    "interCollegeName": "Sri Chaitanya Junior College",
    "interCollegePlace": "Kurnool",
    "appNumber": "KCET2026999",
    "homeTownAddress": "4-12-8, Gandhi Nagar, Kurnool, AP 518004"
  }'
```

---

## 📮 Weekly Admissions Report

Collects the last 7 days of applications and emails the counsellor a short note
**with an Excel workbook attached**.

```bash
npm --prefix api run digest              # send once, now
npm --prefix api run digest:schedule     # resident — every Saturday 09:00 IST
curl -X POST http://localhost:4005/api/jobs/weekly-digest
```

### The mail

> **Dear Sir/Madam,**
>
> Please find attached the **Weekly Admissions Report for the Andhra Pradesh
> Admissions Desk**, covering the week ending **05 October 2026**.
>
> | Weekly Admissions Summary | |
> |---|---|
> | New Applications Received | 12 |
> | Colleges Represented | 3 |
> | Female Applicants | 10 |
> | Reporting Period | 29 September – 05 October 2026 |
>
> The attached Excel file contains the complete applicant-wise details,
> including the **Application Number** and relevant admission information, for
> your review and further reference.
>
> Kindly review the report and let us know if any additional information or
> clarification is required.
>
> Regards,
> **NGI Admissions Team**
> **Nagarjuna Group of Institutions**

### The workbook

| Sheet | Contents |
|---|---|
| **Applications** | One row per submission · frozen header · autofilter · zebra striping. Columns: Student Name, Student Mobile, Gender, Father/Guardian, Father Mobile, Inter College, Inter College Place, Application No., Home Town Address, Submitted On, Status. Phone and application-number columns are stored as **text** so leading zeros survive. |
| **Summary** | Totals, distinct colleges, gender split, week ending, region |

### Transport

EmailJS **cannot send file attachments** — its API accepts text parameters only.
The workbook therefore goes out over **SMTP via Nodemailer**, which the rest of
the NCET estate already uses. EmailJS stays supported as a fallback.

| Configuration | Result |
|---|---|
| `SMTP_HOST` + `SMTP_USER` set | Note-style mail **+ `.xlsx` attached** ✅ |
| only `EMAILJS_*` set | Mail without the attachment |
| neither | **Dry run** — renders and logs, sends nothing, exits 0 |

```env
# api/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=NGI Admissions <you@gmail.com>

DIGEST_TRANSPORT=auto     # auto | smtp | emailjs
DASHBOARD_URL=https://your-site/
```

**Testing against a real inbox** — `DIGEST_TO` redirects the mail without
touching stored counsellor data:

```bash
node api/scripts/seed-test-applications.js          # sample applications
DIGEST_TO=you@example.com npm --prefix api run digest
node api/scripts/preview-digest.js                  # render only, send nothing
```

GitHub Actions is wired at `api/.github/workflows/weekly-digest.yml`
(`cron: "30 3 * * 6"` = Saturday 09:00 IST).

---

## 🔌 API

Base URL `http://localhost:4005`

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness check |
| `POST` | `/api/applications` | Submit an application |
| `GET` | `/api/applications?status=&limit=&skip=` | List applications |
| `GET` | `/api/applications/:id` | Fetch one application |
| `PATCH` | `/api/applications/:id/status` | Move through the pipeline |
| `GET` | `/api/counselors` | Active counsellors |
| `GET` | `/api/counselors/:slug` | One counsellor by slug |
| `POST` | `/api/jobs/weekly-digest` | Trigger the weekly report |

`status` moves through `new → contacted → shortlisted → enrolled → closed`.

Everything except `/api/health`, `POST /api/applications`, the `/counselors`
reads and the digest trigger requires a developer token.

> ⚠️ `POST /api/jobs/weekly-digest` is intentionally unauthenticated so a cron
> can reach it. Put it behind a scheduler secret or shared token before
> exposing the API publicly.

---

## 🔐 Developer admin panel

A private `/admin` page for reviewing applications. **Not linked from the public
site** — reach it by typing the path.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/admin/login` | Step 1 — email + password → OTP challenge |
| `POST` | `/api/admin/verify` | Step 2 — OTP → session token |
| `GET` | `/api/admin/me` | Validate a stored token |
| `GET` | `/api/admin/stats` | Pipeline counts for the cards |
| `GET` | `/api/admin/applications?status=&limit=` | Applicant table |
| `PATCH` | `/api/admin/applications/:id/status` | Move an applicant |

Sign-in is two steps so a leaked password alone is not enough: the password
returns a short-lived **challenge**, and only the OTP exchanges it for an
8-hour token (kept in `localStorage`, sent as `Authorization: Bearer`).

Every admin endpoint is gated by that token, and five failed attempts from one
IP locks it out for ten minutes.

Configure in `api/.env`:

| Variable | Purpose |
|---|---|
| `ADMIN_EMAIL` | The single allowed account |
| `ADMIN_PASSWORD_HASH` | bcrypt hash — never the plaintext |
| `ADMIN_OTP` | Second factor |
| `ADMIN_JWT_SECRET` | Signs both the challenge and the session |

```bash
# generate a hash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

> ⚠️ The committed defaults are development placeholders. Because this repo is
> public, set all four values in the Render dashboard before pointing the panel
> at real applicant data.

---

## 📁 Structure

```
ngi-admissions-ap/
├── api/                      Express + Mongoose  (:4005)
│   ├── src/
│   │   ├── config/db.js      Mongo connection
│   │   ├── models/           Application · Counselor
│   │   ├── services/         allow-listing · email transport
│   │   ├── controllers/
│   │   ├── validators/       express-validator rules
│   │   ├── emails/           report template · xlsx builder
│   │   ├── jobs/             Saturday digest + scheduler
│   │   └── server.js
│   ├── scripts/              local-mongo · preview · seed-test
│   ├── test/                 integration + email + workbook tests
│   └── .github/workflows/    weekly-digest.yml
│
├── web/                      Next.js App Router  (:3000)
│   └── src/
│       ├── app/              layout · page · globals.css (brand tokens)
│       │   └── fonts/        self-hosted Product Sans woff2
│       ├── components/
│       │   ├── animated/     aurora · counter · marquee · reveal · spotlight
│       │   └── ui/           shadcn primitives + ButtonLink
│       ├── data/site.ts      ← every word and number lives here
│       └── lib/
│
└── scripts/                  e2e.js · admin-e2e.js · style-audit.js
```

---

## 🧪 Testing

```bash
npm run test:api     # 36 integration tests (MongoDB, email, workbook)
npm run test:e2e     # 55 browser checks — fills the form, asserts it persists
npm run test:style   # 10 computed-style / theme / a11y checks
```

| Suite | Covers |
|---|---|
| `test:api` | Schema validation, field allow-listing, duplicate hints, status pipeline, counsellor endpoints, email template & escaping, XLSX structure, scheduler |
| `test:e2e` | Real browser: field discovery, client validation, successful submit, **row present in MongoDB**, counsellor card from the API, logo load, Product Sans actually loaded, mobile nav, no page errors |
| `test:style` | Brand colours applied, keyframes compiled, no horizontal overflow at 1280/768/390 px, heading order, tap-target size |

---

## ♿ Accessibility

- Scroll-triggered animations collapse to their final state under
  `prefers-reduced-motion` — and are forced visible in CSS, so content is never
  trapped in a hidden start state.
- Reveals animate `opacity` / `filter` / `transform` only — no layout thrash.
- Every field carries `<label for>`, `required`, `aria-invalid` and
  `aria-describedby`; errors announce via `role="alert"`, and submitting an
  empty form focuses the first invalid field.
- Programme filtering announces its result through an `aria-live` region.
- Genuine `<a>` elements for every link — middle-click, right-click and
  open-in-new-tab all behave correctly.
- The landing page prerenders as static content; only the counsellor card and
  the form hydrate on the client.

---

## ✏️ Editing content

Nearly every word and number lives in **`web/src/data/site.ts`** — stats,
programmes, process steps, campus highlights, FAQs and institutions. The
counsellor record lives in the database via `api/src/seed.js`, with a mirrored
fallback in `fallbackCounselor` used only if the API is unreachable.

Brand tokens live at the top of `web/src/app/globals.css`.

---

## ☁️ Deploying to Render

The repo ships a [`render.yaml`](./render.yaml) blueprint that deploys both
services:

| Service | Root dir | Build | Start |
|---|---|---|---|
| `ngi-admissions-web` | `web` | `npm ci && npm run build` | `node .next/standalone/server.js` |
| `ngi-admissions-api` | `api` | `npm ci` | `npm start` |

**In the Render dashboard:** *New → Blueprint* → select this repo → *Apply*, then
fill in every `sync: false` variable it lists.

| Variable | Service | Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | web | `https://<api>.onrender.com` |
| `MONGODB_URI` | api | your Atlas URI |
| `CORS_ORIGIN` | api | `https://<web>.onrender.com` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | api | mail provider credentials |
| `DIGEST_TRANSPORT` | api | `auto` |
| `DASHBOARD_URL` | api | `https://<web>.onrender.com/` |
| `ADMIN_EMAIL` | api | the one allowed developer account |
| `ADMIN_PASSWORD_HASH` | api | bcrypt hash of the admin password |
| `ADMIN_OTP` | api | the OTP second factor |
| `ADMIN_JWT_SECRET` | api | long random string — `openssl rand -hex 32` |

> ⚠️ **After the first deploy, redeploy the web service.** `NEXT_PUBLIC_API_URL` is
> inlined at build time, so the API URL must be baked into the bundle.

<details>
<summary><b>Deploying the web app only</b></summary>

If you host the API elsewhere, set **Root Directory** to `web`, and either set a
build command of `npm ci && npm run build` or leave Render's default — the
`web/` folder is self-contained. Running the build from the repo root also works,
because the root `build` script installs each workspace before building.

</details>

---

## 📄 Sources

- Brand colours, font and type scale — sampled from the live `ncet.co.in`
- Institution names, accreditations and "at a glance" figures — official
  *HR Conclave 2026* deck, slides 2, 4, 6, 7, 8 and 13
- Counsellor details — official NGI visiting card
- NGI logo and the "Wings of Nagarjuna" graphic — from the same deck

---

<p align="center">
  <b>Nagarjuna Group of Institutions</b><br>
  <sub>Admissions 2026–27 · NAAC A+ Accredited · Autonomous under VTU</sub>
</p>
