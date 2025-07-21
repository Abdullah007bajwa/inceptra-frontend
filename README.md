# Inceptra - AI-Powered Creation Platform

A comprehensive React + Vite + TypeScript frontend that integrates seamlessly with an Express server backend. Features multiple AI-powered tools for content creation, image generation, background removal, and resume analysis.

## 🚀 Features

- **AI Article Generator**: Create compelling articles from titles with configurable length
- **AI Image Generator**: Generate stunning visuals from text prompts with style options  
- **Background Remover**: Remove backgrounds from images instantly using AI
- **Resume Analyzer**: Get AI-powered insights and recommendations for resumes
- **User Authentication**: Secure authentication powered by Clerk
- **Modern UI**: Beautiful, responsive design with dark/light mode support
- **Real-time Processing**: Live feedback and progress indicators
- **History Tracking**: View and manage your past generations

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Clerk
- **API**: Axios with automatic token management
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **UI Components**: shadcn/ui with custom enhancements
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ and npm
- A running Express server at http://localhost:5000
- Clerk account and API keys

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd inceptra-frontend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Update the `.env` file with your actual values:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
VITE_CLIENT_URL=http://localhost:5173
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components (Sidebar, Header)
├── pages/              # Route components
├── lib/                # Utilities and API configuration
├── hooks/              # Custom React hooks
└── main.tsx           # Application entry point
```

## 🔐 Authentication

The app uses Clerk for authentication with the following features:

- **Token Management**: Automatic Bearer token attachment to API requests
- **Protected Routes**: Dashboard routes require authentication
- **Session Handling**: Automatic cookie and token management
- **401 Prevention**: Intelligent error handling and redirects

## 🎨 Design System

The application features a comprehensive design system with:

- **Semantic Color Tokens**: Primary, secondary, accent colors with hover states
- **Gradient Support**: Beautiful gradient backgrounds and effects
- **Shadow System**: Consistent shadow utilities including glow effects
- **Animation Utilities**: Smooth transitions and micro-interactions
- **Responsive Design**: Mobile-first approach with tablet/desktop breakpoints

## 📡 API Integration

The frontend expects the following backend endpoints:

### Authentication
- All requests include `withCredentials: true` and `Authorization: Bearer <token>`

### Article Generation
- `POST /api/article` - Generate articles
  ```json
  {
    "title": "Article title",
    "length": 600
  }
  ```

### Image Generation  
- `POST /api/image` - Generate images
  ```json
  {
    "prompt": "Image description",
    "style": "realistic",
    "size": "1024x1024"
  }
  ```

### Background Removal
- `POST /api/bg-remove` - Remove image backgrounds
  - Form data with `image` file

### Resume Analysis
- `POST /api/resume` - Analyze resumes
  - Form data with `resume` PDF file

### History
- `GET /api/history?limit=50` - Get user history

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Ensure all environment variables are properly set:

- `VITE_API_BASE_URL`: Your production API URL
- `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `VITE_CLIENT_URL`: Your production frontend URL

## 🔧 Configuration

### Vite Proxy

The development server includes a proxy configuration for API requests:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### Tailwind Configuration

Custom design tokens are configured in `tailwind.config.ts` and `src/index.css` for consistent theming.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ using modern web technologies