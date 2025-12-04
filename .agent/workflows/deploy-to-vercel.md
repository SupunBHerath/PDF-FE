---
description: How to deploy the frontend to Vercel
---

# Deploy Frontend to Vercel

## Prerequisites
- Vercel account (free at vercel.com)
- Git repository (optional for Method 2)

## Method 1: Quick Deploy with Vercel CLI

### Step 1: Install Vercel CLI
```powershell
npm install -g vercel
```

### Step 2: Login to Vercel
```powershell
vercel login
```

### Step 3: Deploy to Preview
```powershell
vercel
```

### Step 4: Deploy to Production
```powershell
vercel --prod
```

---

## Method 2: GitHub Integration (Continuous Deployment)

### Step 1: Push Code to GitHub
Ensure your code is in a GitHub repository.

### Step 2: Import Project on Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository
4. Configure settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add:
- `VITE_API_URL` (your backend API URL)
- Any other `VITE_*` variables from your `.env` file

### Step 4: Deploy
Click "Deploy" - Vercel will automatically build and deploy.

---

## Environment Variables Setup

### Local Development (.env file):
```
VITE_API_URL=http://localhost:5000
```

### Production (Vercel Dashboard):
```
VITE_API_URL=https://your-backend-api.com
```

⚠️ **Important**: All environment variables in Vite must start with `VITE_` prefix.

---

## Build Verification

Before deploying, test the build locally:

// turbo
```powershell
npm run build
```

// turbo
```powershell
npm run preview
```

This will build the project and preview it locally at http://localhost:4173

---

## Troubleshooting

### Build Fails
- Check for TypeScript/ESLint errors
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

### 404 on Refresh
- Ensure `vercel.json` has proper rewrites (already configured)

### API Connection Issues
- Verify `VITE_API_URL` is set correctly in Vercel
- Check CORS settings on your backend
- Ensure backend is deployed and accessible

---

## Custom Domain Setup

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Wait for DNS propagation (5-60 minutes)

---

## Redeployment

### Automatic (GitHub Integration):
- Simply push to your main branch
- Vercel will automatically rebuild and deploy

### Manual (CLI):
```powershell
vercel --prod
```

---

## Useful Commands

```powershell
# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm [deployment-url]

# Open project in browser
vercel --open
```
