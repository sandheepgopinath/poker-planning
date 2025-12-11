# 🎴 Poker Planning

A fun and interactive real-time web application for agile teams to estimate Jira stories using Planning Poker methodology.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socket.io&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)

## ✨ Features

- 🎯 **Real-time Collaboration** - Multiple players across different devices
- 🎨 **Premium Design** - Glassmorphism effects, gradients, and smooth animations
- 🔧 **Customizable Cards** - Configure numeric or text values (Fibonacci, T-shirt sizes, custom)
- 👑 **Admin Controls** - Start estimation, reveal cards, configure settings
- 📊 **Automatic Averaging** - Calculates average for numeric votes
- 🎭 **Private Voting** - Votes hidden until admin reveals
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🔄 **Auto Admin Transfer** - Session continues if admin leaves

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
# Navigate to project directory
cd "Poker Planning"

# Install dependencies
npm install

# Start the server
npm start
```

The application will be running at **http://localhost:3000**

## 🎮 How to Use

### Creating a Session

1. Open http://localhost:3000 in your browser
2. Enter your name
3. Click **"Create Session"**
4. Share the 5-character session code with your team

### Joining a Session

1. Open http://localhost:3000
2. Enter the session code
3. Enter your name
4. Click **"Join Session"**

### Estimating Stories

1. **Admin** clicks **"Estimate a Ticket"**
2. All players select their estimate from the cards
3. **Admin** clicks **"Reveal Cards"** to show all votes
4. View the results and average
5. **Admin** clicks **"Estimate Again"** for next ticket

### Configuring Cards

1. **Admin** clicks the ⚙️ icon
2. Choose a preset or add custom values
3. Click **"Save Configuration"**
4. All players will see the updated cards

## 🎨 Card Presets

- **Fibonacci**: 1, 2, 3, 5, 8, 13, 21, 34, 55
- **T-Shirt Sizes**: XS, S, M, L, XL, XXL
- **Powers of 2**: 1, 2, 4, 8, 16, 32, 64
- **Custom**: Add any values you need!

## 🌐 Network Access

To allow other devices on your network to join:

1. Find your computer's IP address:
   ```bash
   # Linux/Mac
   hostname -I
   
   # Windows
   ipconfig
   ```

2. Share the URL: `http://YOUR_IP:3000`

## 📁 Project Structure

```
Poker Planning/
├── server.js          # Node.js + Socket.io server
├── client.js          # Client-side JavaScript
├── index.html         # HTML structure
├── styles.css         # CSS design system
├── favicon.svg        # App icon
├── package.json       # Dependencies
└── README.md          # This file
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Real-time**: WebSocket (Socket.io)
- **Design**: Custom CSS with glassmorphism and animations

## 🎯 Key Technical Features

- Real-time bidirectional communication using Socket.io
- Session-based room management
- In-memory session storage
- Automatic admin role transfer
- Responsive CSS Grid layouts
- CSS custom properties for theming
- Smooth animations and transitions

## 📝 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Enjoy your planning sessions!** 🎉
