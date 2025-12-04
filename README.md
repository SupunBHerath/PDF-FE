# PDF Management System - Frontend

## Overview
React-based frontend for the PDF Generation & Item Management System with Ant Design UI components and React Query for state management.

## Features
- 🎨 Modern UI with Ant Design
- 🔐 JWT Authentication
- 📊 Role-based dashboards
- 🏢 Company management (Admin)
- 👥 User management (Admin)
- 📦 Item CRUD operations
- 📄 Quotation generation with PDF export
- 📜 History tracking
- 🔍 Advanced search and filters
- 📱 Responsive design

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Ant Design 5
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **PDF Handling**: Puppeteer (backend)

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=PDF Management System
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/              # API client and services
├── components/       # Reusable components
├── layouts/          # Layout components
├── pages/           # Page components
│   ├── Admin/       # Admin pages
│   ├── Auth/        # Authentication pages
│   ├── Quotations/  # Quotation pages
│   └── ...
├── store/           # Zustand stores
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

## Key Features

### Authentication
- JWT token-based authentication
- Persistent login state
- Role-based route protection

### Admin Features
- Company CRUD with logo upload
- User management
- Multi-company assignment
- System-wide statistics

### Company User Features
- Item management
- Quotation creation
- PDF generation
- History view

## Deployment

### Vercel Deployment

1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables
4. Deploy

## License
ISC
