# Step-by-Step Deployment Guide

## Backend Deployment (Render) - First

### Step 1: Prepare Your Repository
1. Push all your current code to GitHub
2. Make sure your repository is public or you have Render access

### Step 2: Deploy to Render
1. Go to **https://render.com** and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository from the list
5. Configure the service:
   - **Name**: `eduplatform-backend` (or any name you prefer)
   - **Branch**: `main` (or your default branch)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:backend`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid for better performance)

### Step 3: Set Environment Variables in Render
In the Render dashboard, go to Environment tab and add:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://Himanshu:Himanshu123@himanshu.pe7xrly.mongodb.net/LMS
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
SESSION_SECRET=your-session-secret-key-here-also-long-and-random
CORS_ORIGIN=https://online-learning-platform-puce-sigma.vercel.app
```

### Step 4: Deploy Backend
1. Click **"Deploy"**
2. Wait for deployment to complete
3. Your backend will be available at: `https://onlinelearningplatform-ppes.onrender.com`
4. Test by visiting: `https://onlinelearningplatform-ppes.onrender.com/api/mongo/courses`

## Frontend Deployment (Vercel) - Second

### Step 5: Build Frontend Locally First
```bash
npm run build:frontend
```

### Step 6: Deploy to Vercel
1. Go to **https://vercel.com** and sign up/login with GitHub
2. Click **"New Project"**
3. Import your repository
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build:frontend`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

### Step 7: Set Environment Variables in Vercel
In Vercel project settings → Environment Variables:
```
VITE_API_URL=https://onlinelearningplatform-ppes.onrender.com
```

### Step 8: Configure Custom Domain
1. In Vercel project dashboard → Settings → Domains
2. Add domain: `online-learning-platform-puce-sigma.vercel.app`
3. Follow Vercel's DNS configuration instructions

### Step 9: Deploy Frontend
1. Click **"Deploy"**
2. Wait for deployment to complete
3. Your frontend will be available at: `https://online-learning-platform-puce-sigma.vercel.app`

## Testing Your Deployment

### Backend Tests
- Visit: `https://onlinelearningplatform-ppes.onrender.com/api/mongo/courses`
- Should return course data from MongoDB

### Frontend Tests
- Visit: `https://online-learning-platform-puce-sigma.vercel.app`
- Try logging in/registering
- Check if courses load
- Test admin features

### Integration Tests
- Register a new user on frontend
- Check if user appears in MongoDB
- Test course enrollment
- Test admin approval workflow

## Common Issues & Solutions

### Backend Issues
- **Build fails**: Check if all dependencies are in package.json
- **MongoDB connection fails**: Verify MONGODB_URI environment variable
- **CORS errors**: Ensure CORS_ORIGIN matches your Vercel domain

### Frontend Issues
- **API calls fail**: Check VITE_API_URL environment variable
- **Build fails**: Run `npm run build:frontend` locally first
- **Domain not working**: Check Vercel DNS configuration

### Need Help?
- Check Render logs for backend errors
- Check Vercel function logs for frontend errors
- Verify all environment variables are set correctly