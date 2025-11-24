# Vercel Deployment Guide

## 🚀 Step-by-Step Deployment Instructions

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Supabase project (for backend features)

---

## Part 1: Prepare Your Repository

### 1. Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Church website ready for deployment"

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

---

## Part 2: Deploy to Vercel

### 2. Import Project to Vercel

1. Go to https://vercel.com and sign in
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Vercel will auto-detect Vite configuration

### 3. Configure Build Settings

Vercel should auto-detect these settings:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**Do NOT change these unless you have a specific reason.**

### 4. Add Environment Variables

Click on **"Environment Variables"** and add the following:

#### Required Variables (from Supabase):
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

#### Optional Variables:
```
VITE_GOOGLE_SPREADSHEET_ID = your-spreadsheet-id (if using Google Sheets)
VITE_ADMIN_PASSWORD = your-admin-password
```

**Where to find Supabase credentials:**
- Go to your Supabase project dashboard
- Click **Settings** → **API**
- Copy **Project URL** and **anon/public key**

### 5. Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://your-site.vercel.app`

---

## Part 3: Common Issues & Solutions

### ❌ Issue 1: "Build Failed" Error

**Solution:**
```bash
# Test build locally first
npm install
npm run build

# If it builds locally, check Vercel build logs for specific errors
```

### ❌ Issue 2: "404 Not Found" on Page Refresh

**Solution:** This is already fixed in `vercel.json` with rewrites. If still happening:
- Check that `vercel.json` is in root directory
- Verify `outputDirectory` is set to `dist`

### ❌ Issue 3: Environment Variables Not Working

**Solution:**
- Ensure all env variables start with `VITE_` prefix
- Redeploy after adding variables: **Deployments** → **Redeploy**
- Check variables are added to "Production" environment

### ❌ Issue 4: "Module not found" Errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

Then push changes and redeploy.

### ❌ Issue 5: Backend Features Not Working

**Important:** The Supabase backend functions need to be deployed separately!

**Solution:**
1. Install Supabase CLI: https://supabase.com/docs/guides/cli
2. Deploy functions:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   supabase functions deploy make-server-9f158f76
   ```

---

## Part 4: Post-Deployment Checklist

### ✅ Verify Deployment

- [ ] Homepage loads correctly
- [ ] Navigation works on all pages
- [ ] Images and videos display properly
- [ ] Forms can be submitted (test volunteer signup)
- [ ] Admin dashboard login works
- [ ] YouTube Live stream displays
- [ ] Mobile responsive design works

### ✅ Configure Custom Domain (Optional)

1. Go to project in Vercel
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as shown
5. Wait for SSL certificate (automatic)

---

## Part 5: Continuous Deployment

### Auto-Deploy on Git Push

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update content"
git push

# Vercel will automatically deploy the changes
```

### Environment Variables in Production

To update environment variables without redeploying:
1. Go to **Project Settings** → **Environment Variables**
2. Edit variable value
3. Click **Save**
4. Go to **Deployments** → **Redeploy** (choose latest)

---

## 🆘 Still Having Issues?

### Debug Steps:

1. **Check Vercel Build Logs:**
   - Go to **Deployments** → Click failed deployment
   - Review "Building" section for errors

2. **Check Browser Console:**
   - Open site → Press F12
   - Look for JavaScript errors in Console tab

3. **Common Error Messages:**

   | Error | Solution |
   |-------|----------|
   | `Cannot find module '@/...'` | Check vite.config.ts alias configuration |
   | `process is not defined` | Already fixed in vite.config.ts |
   | `Failed to fetch` | Check CORS and Supabase URL |
   | `404 on refresh` | Check vercel.json rewrites |

4. **Test Locally Before Deploying:**
   ```bash
   npm run build
   npm run preview
   ```
   This simulates production build locally.

---

## 📊 Monitoring Your Site

### Vercel Analytics
- Go to **Analytics** tab in Vercel dashboard
- View traffic, performance, and errors

### Check Deployment Status
- Go to https://vercel.com/dashboard
- Click your project
- View latest deployments

---

## 🔒 Security Notes

### Important:
- ✅ **DO** use environment variables for sensitive data
- ✅ **DO** keep `.env` files in `.gitignore`
- ✅ **DO** use `VITE_` prefix for frontend variables
- ❌ **DON'T** commit `.env` files to GitHub
- ❌ **DON'T** expose `SUPABASE_SERVICE_ROLE_KEY` in frontend

---

## 📞 Support Resources

- Vercel Documentation: https://vercel.com/docs
- Vite Documentation: https://vitejs.dev
- Supabase Documentation: https://supabase.com/docs
- Vercel Support: https://vercel.com/support

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel (if using Vercel CLI)
vercel --prod
```

---

**Your site is now deployed! 🎉**

Access it at: `https://your-site.vercel.app`
