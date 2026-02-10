# Equb Management System

## Project Structure

```
equb-managment/
├── backend/          # NestJS Backend API
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # Ionic React Frontend
│   └── equb-frontend/
│       └── blank/
├── docker-compose.yml
└── README.md
```

## Running the Project

### Backend (NestJS)
```bash
cd backend
pnpm install
pnpm start:dev
```

### Frontend (Ionic React)
```bash
cd frontend/equb-frontend/blank
npm install
npm run dev
```

### Database (PostgreSQL)
```bash
docker-compose up -d
```

## Environment Variables

Create a `.env` file in the `backend` directory with:
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=equb_management
JWT_SECRET=your-secret-key
```

## Features

- **Backend**: NestJS with TypeORM, PostgreSQL, JWT Authentication
- **Frontend**: Ionic React with Tailwind CSS v4
- **Database**: PostgreSQL with pgAdmin

## Development

- Backend runs on `http://localhost:3000`
- Frontend runs on `http://localhost:5173`
- pgAdmin runs on `http://localhost:5050`
