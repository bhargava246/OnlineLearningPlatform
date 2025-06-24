# Deployment Guide

This guide will help you deploy the Online Learning Platform to Railway (backend) and Vercel (frontend).

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Railway Account** - For backend deployment
3. **Vercel Account** - For frontend deployment
4. **MongoDB Atlas Account** - For database (free tier available)

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`)
5. Whitelist Railway's IP addresses (or allow access from anywhere for testing)

## Step 2: Deploy Backend to Railway

### 2.1 Connect to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository

### 2.2 Configure Backend Service

1. **Root Directory**: Set to `server`
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. **Environment**: Node.js

### 2.3 Set Environment Variables

In Railway dashboard, add these environment variables:

```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/your-database?retryWrites=true&w=majority
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.vercel.app
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here
```

### 2.4 Deploy

1. Click "Deploy Now"
2. Wait for the build to complete
3. Note your Railway URL (e.g., `https://your-app.railway.app`)

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your GitHub repository

### 3.2 Configure Frontend Service

1. **Framework Preset**: Vite
2. **Root Directory**: `client`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 3.3 Set Environment Variables

In Vercel dashboard, add these environment variables:

```
VITE_API_URL=https://your-backend-domain.railway.app
VITE_NODE_ENV=production
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Note your Vercel URL (e.g., `https://your-app.vercel.app`)

## Step 4: Update Environment Variables

After both deployments are complete:

### 4.1 Update Backend (Railway)

Go back to Railway and update the `FRONTEND_URL` environment variable with your actual Vercel URL:

```
FRONTEND_URL=https://your-actual-frontend-domain.vercel.app
```

### 4.2 Update Frontend (Vercel)

Go back to Vercel and update the `VITE_API_URL` environment variable with your actual Railway URL:

```
VITE_API_URL=https://your-actual-backend-domain.railway.app
```

## Step 5: Test Your Deployment

1. **Health Check**: Visit `https://your-backend-domain.railway.app/health`
2. **Frontend**: Visit your Vercel URL
3. **API Test**: Try logging in or accessing protected routes

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. **Database Connection**: Verify your MongoDB Atlas connection string and IP whitelist
3. **Build Failures**: Check the build logs in Railway/Vercel for specific errors
4. **Environment Variables**: Ensure all required environment variables are set

### Debugging

1. **Railway Logs**: Check the logs in Railway dashboard for backend errors
2. **Vercel Logs**: Check the function logs in Vercel dashboard for frontend errors
3. **Network Tab**: Use browser dev tools to check API requests

## Security Notes

1. **JWT Secret**: Generate a strong, random JWT secret
2. **Session Secret**: Generate a strong, random session secret
3. **MongoDB**: Use strong passwords and limit IP access
4. **Environment Variables**: Never commit secrets to your repository

## Cost Optimization

1. **Railway**: Free tier includes 500 hours/month
2. **Vercel**: Free tier includes unlimited deployments
3. **MongoDB Atlas**: Free tier includes 512MB storage

## Monitoring

1. **Railway**: Monitor your service usage and logs
2. **Vercel**: Monitor your deployment analytics
3. **MongoDB Atlas**: Monitor your database usage

## Updates and Maintenance

1. **Automatic Deployments**: Both Railway and Vercel will automatically deploy when you push to your main branch
2. **Manual Deployments**: You can trigger manual deployments from the dashboard
3. **Rollbacks**: Both platforms support easy rollbacks to previous versions 