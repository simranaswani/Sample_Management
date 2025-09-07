# Deployment Guide for Allen Jorgio Textile Management System

## Option 1: Vercel (Frontend) + Railway (Backend) - RECOMMENDED

### Frontend Deployment (Vercel)

1. **Prepare Frontend for Production:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Set Root Directory to `frontend`
   - Add Environment Variable: `REACT_APP_API_URL` = `https://your-backend-url.railway.app`
   - Deploy!

### Backend Deployment (Railway)

1. **Prepare Backend:**
   ```bash
   cd backend
   ```

2. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Sign up/Login with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set Root Directory to `backend`
   - Add Environment Variables:
     - `MONGODB_URI` = Your MongoDB connection string
     - `PORT` = 5000
   - Deploy!

## Option 2: Netlify (Frontend) + Heroku (Backend)

### Frontend Deployment (Netlify)

1. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `frontend/build` folder
   - Or connect GitHub repository
   - Set Build Command: `npm run build`
   - Set Publish Directory: `build`
   - Add Environment Variable: `REACT_APP_API_URL` = `https://your-heroku-app.herokuapp.com`

### Backend Deployment (Heroku)

1. **Create Heroku App:**
   ```bash
   # Install Heroku CLI first
   heroku create your-app-name
   ```

2. **Add MongoDB:**
   - Use MongoDB Atlas (free tier)
   - Or add Heroku MongoDB addon

3. **Deploy:**
   ```bash
   git subtree push --prefix backend heroku main
   ```

## Option 3: Full Stack on Railway

1. **Deploy Both Frontend and Backend:**
   - Railway supports full-stack deployments
   - Create two services in one project
   - Frontend service: Root directory `frontend`
   - Backend service: Root directory `backend`

## Environment Variables Needed

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/textile-management
PORT=5000
NODE_ENV=production
```

## Database Setup (MongoDB Atlas)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster
4. Get connection string
5. Add to backend environment variables

## Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend API responding
- [ ] Database connected
- [ ] Environment variables set
- [ ] CORS configured for production domain
- [ ] Test all features (QR scanning, PDF generation, etc.)

## Custom Domain (Optional)

1. Buy domain from Namecheap, GoDaddy, etc.
2. Add DNS records pointing to your deployment
3. Configure SSL certificate (usually automatic)
