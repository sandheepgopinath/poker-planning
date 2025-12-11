# 🚀 Quick Deployment Steps

Your Poker Planning app is ready to deploy! Here are the **fastest** options:

---

## ⚡ Option 1: Render (Easiest - Recommended)

**Time**: ~5 minutes | **Cost**: FREE

### Steps:

1. **Push to GitHub**:
   ```bash
   # Create a new repository on GitHub first, then:
   cd "/home/blink/Documents/Github/Poker Planning"
   git remote add origin https://github.com/YOUR_USERNAME/poker-planning.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com) and sign up (free)
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub account
   - Select your `poker-planning` repository
   - Render auto-detects settings:
     - Build: `npm install`
     - Start: `node server.js`
   - Click **"Create Web Service"**

3. **Done!** Your app will be live at `https://poker-planning-XXXX.onrender.com`

**Note**: Free tier sleeps after 15 min of inactivity (30s wake-up time)

---

## ⚡ Option 2: Railway (Modern & Fast)

**Time**: ~3 minutes | **Cost**: $5 free credit/month

### Steps:

1. **Push to GitHub** (same as above)

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app) and sign up
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Select your repository
   - Railway auto-deploys!
   - Click **"Settings"** → **"Generate Domain"**

3. **Done!** Your app is live

---

## 📋 Pre-Deployment Checklist

✅ Git repository initialized  
✅ `.gitignore` created  
✅ `Procfile` created  
✅ Code committed  
⬜ Push to GitHub  
⬜ Deploy to platform  

---

## 🔗 Next Steps

1. **Create GitHub repository**:
   - Go to [github.com/new](https://github.com/new)
   - Name: `poker-planning`
   - Don't initialize with README (we already have files)
   - Create repository

2. **Push your code**:
   ```bash
   cd "/home/blink/Documents/Github/Poker Planning"
   git remote add origin https://github.com/YOUR_USERNAME/poker-planning.git
   git push -u origin main
   ```

3. **Choose deployment platform** (Render or Railway recommended)

4. **Test your deployed app**:
   - Open the URL
   - Create a session
   - Join from another device
   - Test voting!

---

## 📚 Full Deployment Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Detailed instructions for all platforms
- VPS deployment (DigitalOcean, AWS)
- SSL setup
- Environment variables
- Troubleshooting

---

## 🆘 Need Help?

**Common Issues**:

- **WebSocket not working**: Make sure your platform supports WebSocket (Render, Railway, Heroku all do)
- **App won't start**: Check that `package.json` has `"start": "node server.js"`
- **Port error**: Server already uses `process.env.PORT` ✅

---

**Your app is ready to go live! 🎉**

Choose Render or Railway and you'll be deployed in minutes!
