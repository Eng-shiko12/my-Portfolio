# Shaban Aboelkair | Full Stack Portfolio

A full-stack personal portfolio with a public website and a private admin dashboard. Everything on the public site (bio, projects, skills, experience) is managed from the dashboard, so no code changes are needed to update content.

**Live demo:** `https://your-portfolio.vercel.app`
**API:** `https://your-api.vercel.app`

<!-- Add screenshots here -->
<!-- ![Home page](./docs/home.png) -->
<!-- ![Admin dashboard](./docs/dashboard.png) -->

---

## Features

### Public website
- Animated hero with a typewriter effect driven by your bio headline
- About, work experience, projects, and skills sections
- Skills grouped by category with proficiency bars
- Project cards with technologies, live demo, and GitHub links
- Download CV button (shown when a resume link is set)
- Contact form with server-side validation, saved to the database and sent to your email
- Responsive layout, lazy-loaded and auto-optimized images, respects reduced motion

### Admin dashboard
- Protected routes with JWT authentication
- Manage projects, including image upload to Cloudinary
- Manage skills, experience, and bio
- Inbox for contact messages with read/unread status
- Automatic logout when the session expires

### Security
- Passwords hashed with bcrypt
- JWT tokens expire after 7 days, and only the last 5 sessions are kept
- Registration closes after the first admin account is created
- Helmet security headers
- CORS limited to the configured frontend URL
- Rate limiting on auth routes and on the contact form
- Request body sanitizing against NoSQL operator injection
- Body size limit and input validation

---

## Tech stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Redux Toolkit, React Router 7, Tailwind CSS 4, Axios, Font Awesome |
| Backend | Node.js, Express 5, Mongoose, JWT, bcryptjs, Helmet, express-rate-limit |
| Services | MongoDB Atlas, Cloudinary (images), Nodemailer with Gmail (email) |
| Deployment | Vercel (frontend and backend) |

---

## Project structure

```
my-portfolio/
├── server.js                  # Express app entry point
├── vercel.json                # Backend deployment config
├── server/
│   ├── config/                # Cloudinary / multer setup
│   ├── controllers/           # Route handlers
│   ├── middleware/            # Auth and error handling
│   ├── models/                # Mongoose schemas
│   └── routes/                # API routes
└── client/
    ├── vercel.json            # SPA rewrites
    └── src/
        ├── Redux/             # Store and slices
        ├── components/        # Navbar, Footer, Sidebar, ProtectedRoute
        ├── page/
        │   ├── public/        # Home
        │   └── admin/         # Login, Dashboard, Project, Skill, ...
        └── services/api.jsx   # Axios instance and interceptors
```

---

## Getting started

### Requirements
- Node.js 20.19 or newer
- A MongoDB database (local or MongoDB Atlas)
- A Cloudinary account (for project images)
- A Gmail account with an [app password](https://support.google.com/accounts/answer/185833) (for contact emails)

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/my-portfolio.git
cd my-portfolio

# backend
npm install

# frontend
cd client
npm install
```

### 2. Environment variables

Create `.env` in the project root:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=use-a-long-random-string
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=you@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Run

```bash
# terminal 1: backend (from the project root)
npm run dev

# terminal 2: frontend (from /client)
npm run dev
```

Frontend: `http://localhost:5173`, API: `http://localhost:5000`

### 4. Create your admin account

Registration works only once, while no admin exists. Send a request to the API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"you@example.com","password":"Str0ng@Pass"}'
```

The password needs at least 8 characters with an uppercase letter, a lowercase letter, a number, and one of `@$!%*?&`.

Then sign in at `/login` and open `/admin` to add your bio, skills, experience, and projects.

---

## API reference

Routes marked with a lock need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public (once) | Create the admin account |
| POST | `/api/auth/login` | Public | Sign in and get a token |
| GET | `/api/auth/me` | 🔒 | Current admin profile |
| DELETE | `/api/auth/logout` | 🔒 | Revoke the current token |
| GET | `/api/bio` | Public | Get the bio |
| PUT | `/api/bio/update` | 🔒 | Create or update the bio |
| GET | `/api/projects` | Public | List projects |
| GET | `/api/projects/:id` | Public | Get one project |
| POST | `/api/projects/create` | 🔒 | Add a project (multipart, field `image`) |
| PUT | `/api/projects/:id` | 🔒 | Update a project |
| DELETE | `/api/projects/:id` | 🔒 | Delete a project |
| GET | `/api/skills` | Public | List skills |
| POST | `/api/skills/add` | 🔒 | Add a skill |
| PUT | `/api/skills/:id` | 🔒 | Update a skill |
| DELETE | `/api/skills/delete/:id` | 🔒 | Delete a skill |
| GET | `/api/experience` | Public | List experience |
| POST | `/api/experience/add` | 🔒 | Add experience |
| PUT | `/api/experience/:id` | 🔒 | Update experience |
| DELETE | `/api/experience/delete/:id` | 🔒 | Delete experience |
| POST | `/api/messages/message` | Public (rate limited) | Send a contact message |
| GET | `/api/messages` | 🔒 | List messages |
| PUT | `/api/messages/:id` | 🔒 | Mark a message as read |
| DELETE | `/api/messages/delete/:id` | 🔒 | Delete a message |

---

## Deployment (Vercel)

Deploy the backend and frontend as two separate Vercel projects.

**Backend** (root directory: project root)
1. Import the repository and keep the root as the project directory. `vercel.json` routes all traffic to `server.js`.
2. Add all variables from the `.env` section above. Set `FRONTEND_URL` to your frontend URL, without a trailing slash.
3. Set `NODE_ENV=production`.

**Frontend** (root directory: `client`)
1. Import the same repository and set the root directory to `client`.
2. Add `VITE_API_URL` with your backend URL.
3. `client/vercel.json` rewrites all routes to `index.html` so React Router works on refresh.

In MongoDB Atlas, allow connections from Vercel (Network Access).

---

## Scripts

| Location | Command | Purpose |
|---|---|---|
| Root | `npm run dev` | Start the API with nodemon |
| Root | `npm start` | Start the API with node |
| `client` | `npm run dev` | Start the Vite dev server |
| `client` | `npm run build` | Production build |
| `client` | `npm run lint` | Run ESLint |

---

## Roadmap

- [ ] Drag-and-drop ordering for projects and skills
- [ ] Blog section
- [ ] Dark and light theme toggle
- [ ] Analytics for page visits
- [ ] Unit and API tests

---

## Author

**Shaban Aboelkair**, Full Stack Web Developer

- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [your-profile](https://linkedin.com/in/your-profile)
- Email: you@example.com

---

## License

This project is licensed under the ISC License.
