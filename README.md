# SmartSeason Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season.

## Overview

SmartSeason helps farm coordinators (admins) and field agents monitor crop fields through their lifecycle:
- **Planted** → **Growing** → **Ready** → **Harvested**

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartseason.com | admin123 |
| Field Agent | agent1@smartseason.com | agent123 |
| Field Agent | agent2@smartseason.com | agent123 |

## Tech Stack

### Backend
- **Node.js** with **Express** and **TypeScript**
- **Prisma ORM** with **SQLite** database
- **JWT** for authentication
- **Zod** for validation

### Frontend
- **React** with **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization
- **Axios** for API calls

## Project Structure

```
smartseason/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── db.ts             # Prisma client
│   │   ├── types.ts          # Shared types
│   │   ├── middleware/
│   │   │   └── auth.ts       # JWT auth middleware
│   │   ├── routes/
│   │   │   ├── auth.ts       # Login/register
│   │   │   ├── fields.ts     # Field CRUD + updates
│   │   │   └── users.ts      # Agent management
│   │   ├── utils/
│   │   │   └── status.ts     # Status computation logic
│   │   └── seed.ts           # Demo data seeding
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx          # Entry point
│   │   ├── App.tsx           # Routes
│   │   ├── types.ts          # TypeScript types
│   │   ├── api/client.ts     # Axios client
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── pages/
│   │       ├── Login.tsx
│   │       ├── Dashboard.tsx
│   │       ├── Fields.tsx
│   │       └── Agents.tsx
│   └── package.json
└── README.md
```

## Field Status Logic

Fields have a computed status based on:

1. **Stage** - The current lifecycle stage (Planted/Growing/Ready/Harvested)
2. **Timing** - How long the field has been in its current stage

### Status Rules:

| Status | Condition |
|--------|-----------|
| **COMPLETED** | Field is in HARVESTED stage |
| **AT_RISK** | PLANTED for > 45 days OR GROWING for > 150 days |
| **ACTIVE** | Normal progression, no timing concerns |

This logic helps identify fields that may need attention based on expected crop timelines.

## Setup Instructions

### Prerequisites
- Node.js 18+ installed

### Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

The backend will start on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

## Features

### Authentication
- JWT-based authentication
- Role-based access control (Admin vs Field Agent)
- Protected routes

### Admin Features
- View all fields across the system
- Create new fields with crop type, planting date, location, size
- Assign fields to field agents
- Delete fields
- View all field agents
- Monitor updates across agents
- Dashboard with status breakdown and recent activity

### Field Agent Features
- View assigned fields only
- Update field stage with notes/observations
- Dashboard showing personal field summary

### Dashboard
- Total field count
- Status breakdown (Active/At Risk/Completed)
- Stage distribution charts
- Recent field updates with agent notes

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Login | Public |
| POST | /api/auth/register | Register | Public |
| GET | /api/users/me | Get current user | Required |
| GET | /api/users/agents | List field agents | Admin |
| GET | /api/fields | List fields (role-based) | Required |
| POST | /api/fields | Create field | Admin |
| PATCH | /api/fields/:id | Update field | Admin |
| DELETE | /api/fields/:id | Delete field | Admin |
| POST | /api/fields/:id/updates | Add field update | Required |
| GET | /api/fields/stats/dashboard | Dashboard stats | Required |

## Design Decisions

1. **SQLite with Prisma**: Chosen for simplicity in a demo/assessment context. Easy to set up, no external DB server needed.

2. **JWT Authentication**: Stateless, scalable, easy to implement. Tokens stored in localStorage for SPA.

3. **Computed Status**: Status is computed dynamically based on stage + timing rather than stored. This ensures status is always accurate based on current data.

4. **Separate Frontend/Backend**: Clear separation of concerns, allows independent scaling, easier testing.

5. **TypeScript Throughout**: Type safety across the stack reduces bugs and improves developer experience.

6. **Tailwind CSS**: Utility-first approach enables rapid UI development with consistent design.

## Assumptions Made

1. A single admin/coordinator manages the system
2. Field agents only need to see and update their assigned fields
3. Crop lifecycle follows the standard 4 stages
4. Risk assessment is based on typical crop growing timelines
5. No need for complex user management (registration is open, but agent role assignment is admin-controlled)

## Testing

Login with the demo credentials above to explore both admin and field agent experiences.

## Development

```bash
# Start both servers (in separate terminals)
cd backend && npm run dev
cd frontend && npm run dev
```

The frontend is configured with a proxy to route API calls to the backend during development.
