# Mission For Nation Ministry — Admin Dashboard
## Complete Frontend Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Environment Setup](#4-environment-setup)
5. [How to Run](#5-how-to-run)
6. [Authentication Flow](#6-authentication-flow)
7. [Application Routing](#7-application-routing)
8. [Layout Architecture](#8-layout-architecture)
9. [State Management](#9-state-management)
10. [API Communication](#10-api-communication)
11. [Page-by-Page Reference](#11-page-by-page-reference)
12. [Reusable UI Components](#12-reusable-ui-components)
13. [TypeScript Types](#13-typescript-types)
14. [Backend API Contract](#14-backend-api-contract)
15. [Firebase Integration](#15-firebase-integration)
16. [Adding a New Page](#16-adding-a-new-page)
17. [Common Patterns & Conventions](#17-common-patterns--conventions)
18. [Known Limitations & Future Work](#18-known-limitations--future-work)

---

## 1. Project Overview

This is a **React 19 + TypeScript** admin dashboard for the "Mission For Nation Ministry" church platform. It provides a secure, browser-based interface for administrators to manage all content and users on the platform.

**What it controls:**
- Sermon library (categories + individual sermons with audio/cover uploads)
- Digital bookstore (books with PDF and cover uploads)
- Events calendar (event creation, registration management)
- Member testimonies (moderation, creation)
- Subscription plans (pricing, duration)
- Registered users (view, role badges, premium status)
- Payment & purchase history (read-only audit log)

**How it connects:** The dashboard is a pure frontend SPA. All data comes from the Node/Express/MongoDB backend via REST API calls authenticated with Firebase ID tokens.

---

## 2. Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7 | Build tool & dev server |
| React Router v7 | 7 | Client-side routing |
| Tailwind CSS v4 | 4.2 | Utility-first styling |
| Firebase JS SDK | 12 | Authentication |
| Axios | 1.13 | HTTP client |
| Lucide React | 0.575 | Icons |
| React Hot Toast | 2.6 | Notification toasts |

---

## 3. Folder Structure

```
frontend/
├── public/
│   └── assets/
│       └── logo.png              ← Church logo (used in sidebar, header, login)
├── src/
│   ├── api/
│   │   └── axios.ts              ← Axios instance + request/response interceptors
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx   ← Top header + sidebar shell
│   │   │   └── Sidebar.tsx           ← Left nav with grouped sections
│   │   └── ui/
│   │       ├── Badge.tsx             ← Colored status pill
│   │       ├── Button.tsx            ← Reusable button (5 variants)
│   │       ├── ConfirmDialog.tsx     ← Delete confirmation modal
│   │       ├── FileUpload.tsx        ← Drag-and-drop file input
│   │       ├── Input.tsx             ← Text, Select, Textarea inputs
│   │       ├── LoadingSpinner.tsx    ← Centered spinner
│   │       ├── Modal.tsx             ← Generic modal shell
│   │       ├── PageHeader.tsx        ← Colored banner for page tops
│   │       ├── Pagination.tsx        ← Page number controls
│   │       ├── StatsCard.tsx         ← KPI card with icon
│   │       └── Table.tsx             ← Generic data table
│   ├── context/
│   │   └── AuthContext.tsx       ← Auth state + Firebase login/logout
│   ├── lib/
│   │   └── firebase.ts           ← Firebase app initialization
│   ├── pages/
│   │   ├── books/
│   │   │   └── BooksPage.tsx
│   │   ├── events/
│   │   │   └── EventsPage.tsx
│   │   ├── payments/
│   │   │   └── PaymentsPage.tsx
│   │   ├── sermons/
│   │   │   ├── CategoriesPage.tsx
│   │   │   └── SermonsPage.tsx
│   │   ├── subscriptions/
│   │   │   └── SubscriptionPlansPage.tsx
│   │   ├── testimonies/
│   │   │   └── TestimoniesPage.tsx
│   │   ├── users/
│   │   │   └── UsersPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── LoginPage.tsx
│   ├── types/
│   │   └── index.ts              ← All shared TypeScript interfaces
│   ├── App.css
│   ├── App.tsx                   ← Root router + provider tree
│   ├── index.css                 ← Global styles + Tailwind directives
│   ├── main.tsx                  ← React DOM entry point
│   └── ProtectedRoute.tsx        ← Auth guard component
├── .env                          ← Firebase + API config (not committed)
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Environment Setup

Create `frontend/.env` with the following variables. Replace the values with your actual Firebase project credentials:

```env
VITE_API_BASE_URL=http://localhost:5000

# Firebase — get these from Firebase Console → Project Settings → Your Apps
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=1:your-app-id
```

**How to get Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create or open your project
3. Click the gear icon → **Project Settings**
4. Scroll to **Your apps** → select your Web app (or add one)
5. Copy the `firebaseConfig` object values into `.env`
6. In **Authentication** → **Sign-in method**, enable **Email/Password**

> All `VITE_` prefixed variables are bundled into the browser build by Vite. Never put secrets here that shouldn't be visible to end users — Firebase public config is safe by design.

---

## 5. How to Run

### Development

```bash
# From the project root
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` by default.

### Production Build

```bash
npm run build
# Output goes to frontend/dist/
```

### Preview Production Build

```bash
npm run preview
```

> Make sure the backend is also running at the URL specified in `VITE_API_BASE_URL`.

---

## 6. Authentication Flow

### Overview

Authentication uses **Firebase Authentication** (Email/Password provider). The flow is:

```
User enters email + password
        ↓
Firebase SDK: signInWithEmailAndPassword()
        ↓
Firebase returns a signed ID Token (JWT, ~1hr expiry)
        ↓
Frontend calls POST /api/auth/session  (Bearer: <firebase-token>)
        ↓
Backend verifies token with Firebase Admin SDK
Backend creates/updates user record in MongoDB
Backend returns user profile (role, is_admin, etc.)
        ↓
Frontend checks: role === 'admin' OR is_admin === true
  → if NOT admin: signOut() and throw error
  → if admin: store token + user in localStorage, set React state
        ↓
User is redirected to Dashboard
```

### Token Lifecycle

Firebase ID tokens expire after **1 hour**. The frontend handles refresh automatically:

1. `onAuthStateChanged` listener in `AuthContext` fires whenever Firebase refreshes the token. On each event it writes the fresh token to `localStorage.admin_token`.
2. The Axios request interceptor calls `auth.currentUser.getIdToken(false)` before every API request. Firebase returns a cached token if valid, or silently fetches a new one if it's close to expiry.
3. If a `401` response is received, the response interceptor clears localStorage and redirects to `/login`.

### localStorage Keys

| Key | Contents |
|---|---|
| `admin_token` | Firebase ID Token (string) |
| `admin_user` | Serialized `User` object (JSON string) |

### `AuthContext` API

```typescript
const { user, loading, login, logout } = useAuth();
```

| Property | Type | Description |
|---|---|---|
| `user` | `User \| null` | The logged-in admin's profile from the backend |
| `loading` | `boolean` | True while `onAuthStateChanged` is initializing |
| `login(email, password)` | `Promise<void>` | Full Firebase → backend login flow |
| `logout()` | `Promise<void>` | Firebase sign-out + localStorage cleanup |

### `ProtectedRoute` Component

Wraps all dashboard routes. If `user` is null and `loading` is false, redirects to `/login`.

```tsx
// src/ProtectedRoute.tsx
<ProtectedRoute>
  <DashboardLayout />
</ProtectedRoute>
```

---

## 7. Application Routing

All routes are defined in `src/App.tsx` using React Router v7.

```
/login                   → LoginPage          (public)
/                        → DashboardPage      (protected)
/sermons                 → SermonsPage        (protected)
/categories              → CategoriesPage     (protected)
/books                   → BooksPage          (protected)
/events                  → EventsPage         (protected)
/testimonies             → TestimoniesPage    (protected)
/subscriptions           → SubscriptionPlansPage (protected)
/users                   → UsersPage          (protected)
/payments                → PaymentsPage       (protected)
/*                       → redirect to /
```

**Protected routes** are children of a single `<Route>` element that wraps `DashboardLayout` inside `ProtectedRoute`. This means:
- The guard runs once for the entire dashboard section
- The sidebar and header are rendered by the layout, not repeated in each page
- Page content renders via `<Outlet />` inside the layout

---

## 8. Layout Architecture

### Shell Structure

```
<DashboardLayout>
  ├── <Sidebar />          ← Fixed left column (240px wide, full height)
  └── Right column
      ├── <header>         ← 56px top bar (title, search, status, bell, user)
      └── <main>           ← Scrollable content area
            └── <Outlet /> ← Renders the current page
```

### `DashboardLayout`

- Reads `location.pathname` to set the page title shown in the top header
- Displays the current `user.username` from `useAuth()` in the top-right avatar
- Uses `overflow-hidden` on the root to prevent double scrollbars; only `<main>` scrolls

### `Sidebar`

Navigation is grouped into three labeled sections:

| Section | Pages |
|---|---|
| OVERVIEW | Dashboard |
| CONTENT | Sermons, Categories, Books, Events, Testimonies |
| MANAGEMENT | Subscriptions, Users, Payments |

Active links are highlighted with an indigo background (`bg-indigo-600`). The `NavLink` component from React Router handles active detection.

The church logo (`/assets/logo.png`) is displayed using `mixBlendMode: 'screen'` on a wrapper div over a dark background — this makes the black parts of the logo transparent, showing only the golden elements.

---

## 9. State Management

There is **no global state library** (no Redux, no Zustand). State is managed with:

| Approach | Used For |
|---|---|
| React Context (`AuthContext`) | Auth user + login/logout |
| `useState` per page | Page-local data (list, modal open/closed, form fields) |
| `useEffect` + API calls | Data fetching on mount or dependency change |

Each content page follows this pattern:

```typescript
// Data state
const [items, setItems] = useState<Item[]>([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);

// Modal state
const [modalOpen, setModalOpen] = useState(false);
const [editing, setEditing] = useState<Item | null>(null);
const [saving, setSaving] = useState(false);

// Delete state
const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
const [deleting, setDeleting] = useState(false);

// Form fields (one useState per field)
const [title, setTitle] = useState('');
// ...

useEffect(() => { fetchItems(page); }, [page]);
```

---

## 10. API Communication

### Axios Instance (`src/api/axios.ts`)

A single Axios instance is created and exported as `api`. All pages import this instead of raw `axios`.

**Base URL:** Read from `VITE_API_BASE_URL` env variable (default: `http://localhost:5000`).

**Request Interceptor:**
1. Checks if `auth.currentUser` exists (Firebase user is logged in)
2. If yes: calls `getIdToken(false)` to get a valid/refreshed token → sets `Authorization: Bearer <token>` header
3. If no: falls back to `localStorage.admin_token` (handles page refreshes before `onAuthStateChanged` fires)

**Response Interceptor:**
- On `401`: clears stored token/user and redirects to `/login`
- All other errors are re-thrown for each page to handle

### API Response Shape

The backend always returns:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

**Frontend extraction pattern used throughout:**

```typescript
// For lists:
setItems(res.data?.data ?? res.data ?? []);

// For pagination:
if (res.data?.pagination) {
  setPages(res.data.pagination.pages ?? 1);
  setTotal(res.data.pagination.total ?? 0);
}
```

### File Uploads

Pages that upload images or files use `FormData`:

```typescript
const fd = new FormData();
fd.append('title', title);
fd.append('image', coverFile);   // File object from FileUpload component

await api.post('/api/books', fd);
// Axios automatically sets Content-Type: multipart/form-data
```

---

## 11. Page-by-Page Reference

### Dashboard (`/`)

**Purpose:** Overview with KPI stats and quick navigation links.

**Data fetched (parallel `Promise.allSettled`):**

| Stat | Endpoint |
|---|---|
| Books count | `GET /api/books` |
| Events total | `GET /api/events?limit=1` → `pagination.total` |
| Testimonies total | `GET /api/testimonies?limit=1` → `pagination.total` |
| Subscription plans | `GET /api/subscription/plans` → `.length` |
| Users total | `GET /api/auth/users?limit=1` → `pagination.total` |

`Promise.allSettled` is used so one failed endpoint doesn't break the whole dashboard — failed stats default to `0`.

---

### Sermons (`/sermons`)

**Purpose:** CRUD for sermons, filtered by category.

**Flow:**
1. On mount: fetch all categories (`GET /api/sermons/categories`)
2. Auto-select first category and fetch its sermons (`GET /api/sermons?categoryId=<id>`)
3. Changing the selected category triggers a new fetch

**Operations:**
- Create: `POST /api/sermons` with `FormData` (title, pastor_name, date, category, cover_image, audio_file, is_premium)
- Edit: `PUT /api/sermons/:id` with `FormData`
- Delete: `DELETE /api/sermons/:id`

---

### Sermon Categories (`/categories`)

**Purpose:** CRUD for sermon categories.

**Operations:**
- Create: `POST /api/sermons/categories` with `FormData` (name, description, image)
- Edit: `PUT /api/sermons/categories/:id` with `FormData`
- Delete: `DELETE /api/sermons/categories/:id`

---

### Books (`/books`)

**Purpose:** CRUD for the digital bookstore.

**Operations:**
- Create: `POST /api/books` with `FormData` (title, author, price, category, description, coverImage, file)
- Edit: `PUT /api/books/:id` with `FormData`
- Delete: `DELETE /api/books/:id`

---

### Events (`/events`)

**Purpose:** CRUD for church events.

**Pagination:** 10 items per page, server-side.

**Operations:**
- Create: `POST /api/events` with JSON body (title, description, date_time, location, cover_image, allows_registration, is_full)
- Edit: `PUT /api/events/:id`
- Delete: `DELETE /api/events/:id`

---

### Testimonies (`/testimonies`)

**Purpose:** Manage member testimonies.

**Pagination:** 10 items per page, server-side.

**Operations:**
- Create: `POST /api/testimonies` with `FormData` (title, text_content, verse, posted_by, youtube_video_id, images[])
- Edit: `PUT /api/testimonies/:id` with `FormData`
- Delete: `DELETE /api/testimonies/:id`
- View: inline modal showing full content, images, likes, comments

---

### Subscription Plans (`/subscriptions`)

**Purpose:** Create and view subscription plan tiers.

**Operations:**
- Create: `POST /api/subscription/plans/create` with JSON (name, price, durationDays, description)
- View all: `GET /api/subscription/plans`

> Note: The backend uses lowercase enum values (`'active'` / `'inactive'`) for `plan.status`. The status badge compares with `p.status === 'active'`.

---

### Users (`/users`)

**Purpose:** Read-only list of all registered platform users.

**Pagination:** 20 items per page, server-side.

**Endpoint:** `GET /api/auth/users?page=<n>&limit=20`

**Displays:** Avatar, username, email, role badge, premium badge, registration date.

---

### Payments (`/payments`)

**Purpose:** Read-only audit log of all book purchase transactions.

**Pagination:** 20 items per page, server-side.

**Endpoint:** `GET /api/purchase/all?page=<n>&limit=20`

**Displays:** Book title/cover, user ID, amount, payment reference, status badge, date.

---

## 12. Reusable UI Components

All components live in `src/components/ui/`.

---

### `Button`

```tsx
<Button variant="primary" size="md" onClick={...}>Save</Button>
```

| Prop | Type | Values | Default |
|---|---|---|---|
| `variant` | string | `primary` `secondary` `danger` `ghost` `light` | `primary` |
| `size` | string | `sm` `md` | `md` |

- `primary` — indigo background, white text
- `secondary` — light gray background, dark text
- `danger` — red background, white text
- `ghost` — transparent, gray text
- `light` — white/20 background with white border (for use on colored banners)

---

### `Table`

Generic table with TypeScript generics for full type safety.

```tsx
<Table
  columns={[
    { header: 'Name', cell: (row) => row.name },
    { header: 'Status', cell: (row) => <Badge>{row.status}</Badge> },
  ]}
  data={items}
  loading={loading}
  keyExtractor={(row) => row._id}
  emptyMessage="No items found"
/>
```

| Prop | Type | Required |
|---|---|---|
| `columns` | `Column<T>[]` | Yes |
| `data` | `T[]` | Yes |
| `keyExtractor` | `(row: T) => string` | Yes |
| `loading` | `boolean` | No |
| `emptyMessage` | `string` | No |

Shows a spinning loader while `loading` is true. Alternating row backgrounds (`white` / `gray-50/30`) with indigo hover.

---

### `PageHeader`

Colorful banner used at the top of every content page.

```tsx
<PageHeader
  title="Books"
  subtitle="Manage the digital library"
  icon={BookOpen}
  color="bg-blue-600"
  count={total}
  action={<Button variant="light" onClick={openCreate}><Plus size={16} /> Add Book</Button>}
/>
```

| Prop | Type | Required |
|---|---|---|
| `title` | `string` | Yes |
| `icon` | `LucideIcon` | Yes |
| `subtitle` | `string` | No |
| `color` | `string` (Tailwind bg class) | No (default: `bg-indigo-600`) |
| `count` | `number` | No |
| `action` | `ReactNode` | No |

---

### `StatsCard`

KPI metric card used on the dashboard.

```tsx
<StatsCard label="Total Books" value={42} icon={BookOpen} color="blue" />
```

Color options: `indigo` `blue` `green` `yellow` `red` `purple` `pink` `orange`

---

### `Modal`

Generic slide-over/modal container. All create/edit forms are rendered inside a `Modal`.

```tsx
<Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Book">
  {/* form fields */}
</Modal>
```

---

### `ConfirmDialog`

Used for delete confirmations before making a destructive API call.

```tsx
<ConfirmDialog
  isOpen={!!deleteTarget}
  onClose={() => setDeleteTarget(null)}
  onConfirm={handleDelete}
  loading={deleting}
  title="Delete Book"
  message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
/>
```

---

### `FileUpload`

Drag-and-drop or click-to-browse file selector.

```tsx
<FileUpload
  label="Cover Image"
  accept="image/*"
  value={coverFile}
  onChange={setCoverFile}
/>
```

---

### `Input`, `Select`, `Textarea`

Styled form controls from `src/components/ui/Input.tsx`.

```tsx
<Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
<Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
  <option value="">Select...</option>
  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
</Select>
<Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
```

---

### `Badge`

Colored status pill.

```tsx
<Badge color="green">Active</Badge>
<Badge color="red">Inactive</Badge>
<Badge color="yellow">Pending</Badge>
```

---

### `Pagination`

Page number controls, used on paginated pages (Events, Testimonies, Users, Payments).

```tsx
<Pagination page={page} pages={pages} onChange={setPage} />
```

---

## 13. TypeScript Types

All shared interfaces are in `src/types/index.ts`.

| Interface | Description |
|---|---|
| `User` | Platform user (admin or regular member) |
| `Category` | Sermon category |
| `Sermon` | Individual sermon with audio + cover |
| `Book` | Digital book in the store |
| `Event` | Church event |
| `Testimony` | Member testimony with images/comments |
| `SubscriptionPlan` | Pricing plan (`status: 'active' \| 'inactive'`) |
| `Subscription` | A user's active subscription |
| `Purchase` | Book purchase transaction |
| `PaginatedResponse<T>` | Generic wrapper for paginated API responses |

---

## 14. Backend API Contract

All API calls go to `VITE_API_BASE_URL` (default `http://localhost:5000`). All protected endpoints require `Authorization: Bearer <firebase-id-token>`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/session` | Public | Verify Firebase token, return user profile |
| `GET` | `/api/auth/profile` | User | Get own profile |
| `GET` | `/api/auth/users` | Admin | List all users (paginated) |

### Sermons

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/sermons/categories` | Public | List all categories |
| `POST` | `/api/sermons/categories` | Admin | Create category |
| `PUT` | `/api/sermons/categories/:id` | Admin | Update category |
| `DELETE` | `/api/sermons/categories/:id` | Admin | Delete category |
| `GET` | `/api/sermons?categoryId=<id>` | Public | List sermons by category |
| `POST` | `/api/sermons` | Admin | Create sermon (multipart) |
| `PUT` | `/api/sermons/:id` | Admin | Update sermon (multipart) |
| `DELETE` | `/api/sermons/:id` | Admin | Delete sermon |

### Books

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/books` | Public | List all books |
| `POST` | `/api/books` | Admin | Create book (multipart) |
| `PUT` | `/api/books/:id` | Admin | Update book (multipart) |
| `DELETE` | `/api/books/:id` | Admin | Delete book |

### Events

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/events?page=<n>&limit=10` | Public | List events (paginated) |
| `POST` | `/api/events` | Admin | Create event |
| `PUT` | `/api/events/:id` | Admin | Update event |
| `DELETE` | `/api/events/:id` | Admin | Delete event |

### Testimonies

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/testimonies?page=<n>&limit=10` | Public | List testimonies (paginated) |
| `POST` | `/api/testimonies` | Admin | Create testimony (multipart) |
| `PUT` | `/api/testimonies/:id` | Admin | Update testimony (multipart) |
| `DELETE` | `/api/testimonies/:id` | Admin | Delete testimony |

### Subscriptions

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/subscription/plans` | Public | List all plans |
| `POST` | `/api/subscription/plans/create` | Admin | Create a plan |

### Purchases

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/purchase/all?page=<n>&limit=20` | Admin | List all purchases |

---

## 15. Firebase Integration

### Files Involved

| File | Role |
|---|---|
| `src/lib/firebase.ts` | Initializes the Firebase app and exports `auth` |
| `src/context/AuthContext.tsx` | Uses Firebase auth functions |
| `src/api/axios.ts` | Reads from `auth.currentUser` for token |
| `frontend/.env` | Holds Firebase project config |

### `firebase.ts` Explained

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// getApps() check prevents duplicate initialization in HMR dev mode
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(app);
```

### Backend Firebase Admin SDK

The backend (`backend/src/modules/auth/auth.service.ts`) uses the **Firebase Admin SDK** to verify the ID token sent from the frontend:

```
Frontend: Firebase ID Token
    ↓  (sent as Authorization: Bearer header)
Backend: admin.auth().verifyIdToken(token)
    ↓  (returns decoded token with uid, email, etc.)
Backend: looks up user by firebaseUid in MongoDB
    ↓  (creates user if first login)
Backend: returns user profile to frontend
```

For this to work, the backend also needs Firebase configured via `GOOGLE_APPLICATION_CREDENTIALS` or a service account JSON in `backend/.env`.

### Setting Up Firebase for Real Use

1. Create a project at [https://console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** under Authentication → Sign-in methods
3. Register the web app, copy config to `frontend/.env`
4. Generate a **Service Account** key (Project Settings → Service Accounts → Generate new private key)
5. Add the service account JSON path to `backend/.env` as `GOOGLE_APPLICATION_CREDENTIALS`
6. Create admin users directly in Firebase Console under Authentication → Users, then set `role: 'admin'` in MongoDB for those users

---

## 16. Adding a New Page

Follow these steps to add a new admin page:

### Step 1 — Create the page file

```bash
touch frontend/src/pages/myfeature/MyFeaturePage.tsx
```

### Step 2 — Write the page

```tsx
import { useEffect, useState } from 'react';
import { SomeIcon } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import type { MyItem } from '../../types';

export default function MyFeaturePage() {
  const [items, setItems] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await api.get('/api/myfeature');
      setItems(res.data?.data ?? res.data ?? []);
    } catch {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, []);

  return (
    <div>
      <PageHeader
        title="My Feature"
        subtitle="Manage your items"
        icon={SomeIcon}
        color="bg-teal-600"
      />
      <Table
        keyExtractor={(item) => item._id}
        loading={loading}
        data={items}
        columns={[
          { header: 'Name', cell: (item) => item.name },
        ]}
      />
    </div>
  );
}
```

### Step 3 — Add the type

In `src/types/index.ts`:

```typescript
export interface MyItem {
  _id: string;
  name: string;
  createdAt: string;
}
```

### Step 4 — Add the route in `App.tsx`

```tsx
import MyFeaturePage from './pages/myfeature/MyFeaturePage';

// Inside <Routes>, inside the protected <Route>:
<Route path="/myfeature" element={<MyFeaturePage />} />
```

### Step 5 — Add the sidebar link in `Sidebar.tsx`

```tsx
// In the appropriate section's items array:
{ to: '/myfeature', icon: SomeIcon, label: 'My Feature' },
```

### Step 6 — Add the page title in `DashboardLayout.tsx`

```tsx
const titles: Record<string, string> = {
  // ... existing entries
  '/myfeature': 'My Feature',
};
```

---

## 17. Common Patterns & Conventions

### CRUD Modal Pattern

Every content page uses the same modal pattern:

```typescript
// null = closed, value = editing that item
const [editing, setEditing] = useState<Item | null>(null);
const [modalOpen, setModalOpen] = useState(false);

// Open for creating
function openCreate() {
  setEditing(null);
  resetFormFields();
  setModalOpen(true);
}

// Open for editing
function openEdit(item: Item) {
  setEditing(item);
  populateFormFields(item);
  setModalOpen(true);
}

// Submit
async function handleSave() {
  if (editing) {
    await api.put(`/api/items/${editing._id}`, payload);
  } else {
    await api.post('/api/items', payload);
  }
  fetchItems();
  setModalOpen(false);
}
```

### Optimistic Error Handling

Pages wrap API calls in `try/catch` and always:
- Show `toast.error(message)` on failure
- Show `toast.success(message)` on success
- Reset loading states in `finally` blocks

### File Uploads via FormData

When a page needs to upload files:

```typescript
const fd = new FormData();
fd.append('textField', value);
if (file) fd.append('fileField', file);

if (editing) {
  await api.put(`/api/items/${editing._id}`, fd);
} else {
  await api.post('/api/items', fd);
}
```

Axios automatically sets `Content-Type: multipart/form-data` when given a `FormData` object.

### Logo Rendering on Dark Backgrounds

The church logo has a black background. To make it appear transparent on dark backgrounds, use `mixBlendMode: 'screen'` on a **wrapper div**, not on the `<img>` itself (applying it directly to `img` conflicts with CSS filter):

```tsx
<div style={{ mixBlendMode: 'screen', display: 'inline-flex' }}>
  <img src="/assets/logo.png" alt="logo" className="w-9 h-9 object-contain" />
</div>
```

---

## 18. Known Limitations & Future Work

| Area | Current State | Recommended Improvement |
|---|---|---|
| **Search** | The search bar in the header is visual only (not wired up) | Implement client-side filtering or debounced API query params |
| **Sermons count** | Dashboard shows `0` for sermons (no dedicated count endpoint) | Add `GET /api/sermons/count` endpoint or fetch with `limit=1` and use `pagination.total` |
| **Notifications** | Bell icon is decorative | Wire to a real notification system or display recent admin activity |
| **Image previews** | Edit modals show no existing image preview | Add `<img src={editing.coverImage} />` in modal when editing |
| **Role management** | Users page is read-only | Add ability to promote/demote users to admin |
| **Token storage** | Firebase token stored in `localStorage` | Consider `sessionStorage` or in-memory for higher security |
| **Error boundaries** | No React error boundaries | Wrap pages in `<ErrorBoundary>` to prevent white screens |
| **Pagination — Sermons/Books/Categories** | No server-side pagination (loads all at once) | Add `page`/`limit` query params if collections grow large |
| **Responsive mobile** | Sidebar is always visible | Add a hamburger toggle for mobile screens |
