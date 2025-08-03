# ✨ Inceptra – AI Creation Platform

A modern frontend built with **React**, **Vite**, and **TypeScript**, seamlessly integrated with an Express backend. It features a suite of intelligent tools for content creation, image generation, background removal, and resume analysis.

---

## 🚀 Features

- **Article Generator** – Auto-generate structured articles based on titles
- **Image Generator** – Create visuals from text prompts with style and resolution options
- **Background Remover** – Quickly remove backgrounds from uploaded images
- **Resume Analyzer** – Extract insights and suggestions from resume PDFs
- **User Authentication** – Secure login powered by Clerk
- **Responsive UI** – Includes light/dark mode and adaptive layouts
- **Live Feedback** – Real-time progress indicators
- **Generation History** – Access and manage previously created assets

---

## 🔧 Tech Stack

- **Frameworks**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Clerk
- **Data Handling**: Axios, TanStack React Query
- **Routing**: React Router v6
- **UI**: shadcn/ui with tailored components
- **Animations**: Framer Motion

---

## 📋 Prerequisites

- Node.js 18+
- Express backend running on `http://localhost:5000`
- Clerk account and API credentials

---

## 🛠️ Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd inceptra-frontend
pnpm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Configure the `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_CLIENT_URL=http://localhost:5173
```

### 3. Start the App

```bash
pnpm run dev
```

Runs at: `http://localhost:5173`

---

## 📦 Scripts

- `pnpm run dev` — Start development server
- `pnpm run build` — Create production build
- `pnpm run preview` — Preview production output
- `pnpm run lint` — Run ESLint checks

---

## 🧱 Project Structure

```text
src/
├── components/      # Reusable UI elements
│   ├── ui/          # Base components (shadcn/ui)
│   └── layout/      # Layouts like Sidebar and Header
├── pages/           # Route views
├── lib/             # API config and utilities
├── hooks/           # Custom hooks
└── main.tsx         # Entry point
```

---

## 🔐 Authentication

Features:
- Auto-attached bearer tokens on API requests
- Protected routing and session handling
- Intelligent redirect for unauthorized access

---

## 🎨 Design System

Includes:
- Semantic color tokens
- Gradients and glow/shadow utilities
- Smooth animations and transitions
- Mobile-first responsive layout

---

## 📡 API Endpoints

All requests use `Authorization: Bearer <token>` and `withCredentials: true`

### Article Generator
```http
POST /api/article
{
  "title": "Your article title",
  "length": 600
}
```

### Image Generator
```http
POST /api/image
{
  "prompt": "Image description",
  "style": "realistic",
  "size": "1024x1024"
}
```

### Background Remover
```http
POST /api/bg-remove
FormData: image file
```

### Resume Analyzer
```http
POST /api/resume
FormData: PDF resume
```

### History
```http
GET /api/history?limit=50
```

---

## 🌐 Deployment

```bash
pnpm run build
```

Set these production environment variables:

- `VITE_API_BASE_URL`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_CLIENT_URL`

---

## ⚙️ Dev Configuration

### Vite Proxy

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### Tailwind Setup

Custom tokens and themes defined in:
- `tailwind.config.ts`
- `src/index.css`

---

## 🤝 Contributing

1. Fork the repo
2. `git checkout -b feature/your-feature`
3. `git commit -am 'Add feature'`
4. `git push origin feature/your-feature`
5. Open a pull request

---

## 📝 License

Licensed under the MIT License.

---

## 📬 Support

Open an issue or contact the dev team via abdullah.bajwa.co@gmail.com.
