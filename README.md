# BlogPost Frontend

Modern React frontend for the Blog Platform with beautiful gradients and glassmorphism design.

## Tech Stack

- **React 18** - UI library with hooks
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling with custom gradients
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Modern icons
- **Date-fns** - Date formatting

## Features

### User Features
- 🏠 **Homepage** - Animated hero + popular blogs
- 📚 **Browse Blogs** - Search, filter, pagination
- 📖 **Read Blogs** - Full content + comments + reactions
- 👍 **Like/Dislike** - One-click reactions
- 💬 **Comments** - Post comments with spam protection
- ✉️ **Subscribe** - Email subscription with OTP verification
- ✍️ **Submit Blog** - 3-step submission (OTP verified)

### Admin Features (Protected)
- 🔐 **Login** - HTTP Basic Auth
- 📊 **Dashboard** - Stats overview
- ✅ **Moderate Blogs** - Approve/reject pending submissions
- 🗑️ **Manage Comments** - Hide/delete comments
- 👥 **View Subscribers** - Subscriber management

## Design System

- **Gradient Backgrounds** - Animated mesh gradients
- **Glassmorphism** - Frosted glass effect cards
- **Modern Colors** - Violet, fuchsia, cyan gradients
- **Smooth Animations** - Fade-in, slide-up, scale effects
- **Responsive** - Mobile-first design

## Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=SecureAdmin@2026
```

## Admin Access

**Login Credentials:**
- Username: `admin`
- Password: `SecureAdmin@2026`

Admin routes are protected and require HTTP Basic Authentication with the backend.

## API Integration

All API calls go through Axios with:
- Base URL from environment variable
- Automatic Basic Auth headers for admin routes
- Error handling with toast notifications
- Automatic redirect to login on 401

## Project Structure

```
src/
├── api/              # Axios config + API functions
├── components/       # Reusable components
│   ├── ui/           # Button, Card, Input, etc.
│   ├── layout/       # Header, Footer
│   └── ProtectedRoute.jsx
├── hooks/            # Custom React hooks
├── pages/            # Page components
│   ├── user/         # Public pages
│   └── admin/        # Protected admin pages
├── App.jsx           # Main app with routing
├── main.jsx          # Entry point
└── index.css         # Global styles + Tailwind

## Admin Route Protection

Admin routes are protected with:
1. **Client-side auth check** - ProtectedRoute component
2. **Backend Basic Auth** - Spring Security on /api/admin/*
3. **Auto-redirect on 401** - Axios interceptor

## Development

```bash
# Run with backend
# 1. Start Spring Boot backend on port 8080
# 2. Start frontend: npm run dev
# 3. Open http://localhost:5173
```

## Security Notes

⚠️ **Current Implementation:**
- Admin credentials stored in `.env` (client-side check)
- Backend uses HTTP Basic Auth
- Suitable for admin-only internal use

🔒 **For Production:**
- Implement JWT tokens
- Add user roles and permissions
- Use HTTPS only
- Remove credentials from client code
