# UIET Connect Frontend Setup Guide

## Development Server Installation

## FRONTEND

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Resolve Dependency Conflicts
```bash
npm install eslint@8.57.1 --save-dev
npm audit fix
npm install vite --save-dev
```

### 3. Verify Installations
```bash
npm list eslint
npm list vite
```

### 4. Start Development Server
```bash
npm run dev
```
Or using absolute path:
```bash 
npm --prefix "C:\Users\Manshi yaday\OneDrive\Desktop\UIET_Connect-main\frontend" run dev
```

## Accessing the Application
- Development server runs at: http://localhost:5173/
- Features hot module replacement (live reloading)
- Press `Ctrl+C` to stop the server

## Troubleshooting
If you encounter "Missing script" errors:
1. Ensure you're in the frontend directory
2. Verify package.json contains the "dev" script
3. Try using absolute path with --prefix flag as shown above

## Project Structure
- Main configuration: `package.json`
- Entry point: `index.html`
- Vite config: `vite.config.js`

## BACKEND
 
1. Use the command npm start.