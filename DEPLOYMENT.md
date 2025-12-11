# 🚀 Deployment Guide - Poker Planning

This guide covers multiple deployment options for your Poker Planning application, from easiest to most advanced.

## Quick Comparison

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| **Render** | ⭐ Easy | Free tier | Quick deployment, no credit card |
| **Railway** | ⭐ Easy | Free tier | Modern platform, auto-deploy |
| **Heroku** | ⭐⭐ Medium | Free tier limited | Traditional choice |
| **DigitalOcean** | ⭐⭐⭐ Advanced | $4/month | Full control, production |
| **Vercel** | ⭐ Easy | Free tier | Requires serverless adaptation |

---

## Option 1: Render (Recommended - Easiest)

**Best for**: Quick deployment with zero configuration

### Steps

1. **Create account** at [render.com](https://render.com)

2. **Push code to GitHub** (if not already):
   ```bash
   cd "/home/blink/Documents/Github/Poker Planning"
   git init
   git add .
   git commit -m "Initial commit - Poker Planning app"
   git branch -M main
   # Create repo on GitHub, then:
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

3. **Create Web Service on Render**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `poker-planning`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: Free

4. **Deploy**: Click "Create Web Service"

5. **Access**: Your app will be at `https://poker-planning-XXXX.onrender.com`

### Pros
- ✅ Free tier (no credit card required)
- ✅ Auto-deploy on git push
- ✅ HTTPS included
- ✅ Easy setup

### Cons
- ⚠️ Free tier spins down after inactivity (30s cold start)

---

## Option 2: Railway

**Best for**: Modern deployment with great developer experience

### Steps

1. **Create account** at [railway.app](https://railway.app)

2. **Install Railway CLI** (optional):
   ```bash
   npm install -g @railway/cli
   railway login
   ```

3. **Deploy via Dashboard**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway auto-detects Node.js and deploys

4. **Or deploy via CLI**:
   ```bash
   cd "/home/blink/Documents/Github/Poker Planning"
   railway init
   railway up
   ```

5. **Generate domain**:
   - Go to Settings → Generate Domain

### Pros
- ✅ $5 free credit monthly
- ✅ Fast deployments
- ✅ Great developer experience
- ✅ Auto-scaling

### Cons
- ⚠️ Requires credit card after trial

---

## Option 3: Heroku

**Best for**: Traditional PaaS with extensive documentation

### Steps

1. **Create account** at [heroku.com](https://heroku.com)

2. **Install Heroku CLI**:
   ```bash
   # Ubuntu/Debian
   curl https://cli-assets.heroku.com/install.sh | sh
   
   # Login
   heroku login
   ```

3. **Create Procfile** (required for Heroku):
   ```bash
   cd "/home/blink/Documents/Github/Poker Planning"
   echo "web: node server.js" > Procfile
   ```

4. **Update server.js** to use PORT from environment:
   - Already done! ✅ (Line: `const PORT = process.env.PORT || 3000;`)

5. **Deploy**:
   ```bash
   git add Procfile
   git commit -m "Add Procfile for Heroku"
   
   heroku create poker-planning-YOUR-NAME
   git push heroku main
   heroku open
   ```

### Pros
- ✅ Well-documented
- ✅ Many add-ons available
- ✅ Reliable

### Cons
- ⚠️ Free tier discontinued (requires paid plan)

---

## Option 4: DigitalOcean App Platform

**Best for**: Production deployments with full control

### Steps

1. **Create account** at [digitalocean.com](https://digitalocean.com)

2. **Create App**:
   - Apps → Create App
   - Connect GitHub repository
   - Configure:
     - **Type**: Web Service
     - **Build Command**: `npm install`
     - **Run Command**: `node server.js`
     - **HTTP Port**: 3000

3. **Deploy**: Click "Create Resources"

### Pricing
- Basic plan: $5/month
- Includes 512MB RAM, 1 vCPU

### Pros
- ✅ Production-ready
- ✅ Scalable
- ✅ Good performance
- ✅ Full control

### Cons
- ⚠️ No free tier
- ⚠️ Requires credit card

---

## Option 5: VPS (DigitalOcean Droplet / AWS EC2)

**Best for**: Maximum control and customization

### Steps (DigitalOcean Droplet)

1. **Create Droplet**:
   - Ubuntu 22.04 LTS
   - Basic plan: $4/month
   - Choose datacenter region

2. **SSH into server**:
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

3. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   ```

4. **Upload your code**:
   ```bash
   # From your local machine
   scp -r "/home/blink/Documents/Github/Poker Planning" root@YOUR_DROPLET_IP:/var/www/
   ```

5. **Install dependencies**:
   ```bash
   cd /var/www/Poker\ Planning
   npm install
   ```

6. **Install PM2** (process manager):
   ```bash
   npm install -g pm2
   pm2 start server.js --name poker-planning
   pm2 startup
   pm2 save
   ```

7. **Setup Nginx** (reverse proxy):
   ```bash
   apt-get install nginx
   ```

   Create `/etc/nginx/sites-available/poker-planning`:
   ```nginx
   server {
       listen 80;
       server_name YOUR_DOMAIN_OR_IP;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   ln -s /etc/nginx/sites-available/poker-planning /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

8. **Setup SSL** (optional but recommended):
   ```bash
   apt-get install certbot python3-certbot-nginx
   certbot --nginx -d YOUR_DOMAIN
   ```

### Pros
- ✅ Full control
- ✅ Can host multiple apps
- ✅ Best performance
- ✅ Custom configurations

### Cons
- ⚠️ Requires server management skills
- ⚠️ Manual security updates
- ⚠️ More complex setup

---

## Option 6: Vercel (Requires Adaptation)

**Note**: Vercel is designed for serverless/static sites. Socket.io requires persistent connections, so you'd need to:

1. Deploy frontend to Vercel
2. Deploy backend separately (Render/Railway)
3. Update client to connect to separate backend URL

**Not recommended** for this project due to added complexity.

---

## Environment Variables

For production, you may want to add environment variables:

### Create `.env` file:
```env
PORT=3000
NODE_ENV=production
```

### Update `server.js`:
```javascript
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

### Install dotenv:
```bash
npm install dotenv
```

---

## Pre-Deployment Checklist

- [ ] Add `.gitignore`:
  ```
  node_modules/
  .env
  *.log
  .DS_Store
  ```

- [ ] Test locally one more time
- [ ] Ensure `package.json` has correct start script
- [ ] Push latest code to GitHub
- [ ] Choose deployment platform
- [ ] Configure environment variables (if needed)
- [ ] Test deployed application
- [ ] Share URL with team!

---

## Recommended Path for You

**For quick testing/demo**: Use **Render** (free, no credit card)

**For production use**: Use **Railway** or **DigitalOcean App Platform**

**For learning/full control**: Use **DigitalOcean Droplet** with PM2 + Nginx

---

## Post-Deployment Testing

1. Open deployed URL
2. Create a session
3. Open URL on different device/browser
4. Join the session
5. Test voting flow
6. Verify real-time sync works

---

## Troubleshooting

### WebSocket connection fails
- Ensure platform supports WebSocket (all listed do)
- Check if HTTPS is enabled (required for secure WebSocket)
- Verify firewall allows WebSocket connections

### App crashes on startup
- Check logs: `heroku logs --tail` or platform equivalent
- Verify `package.json` has all dependencies
- Ensure `PORT` environment variable is used

### Slow cold starts
- Upgrade from free tier
- Use VPS with PM2 for always-on service
- Consider adding health check endpoint

---

Need help with a specific platform? Let me know!
