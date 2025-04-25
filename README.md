# 🚀 Node.js Telegram Bot for Bubblemaps

This Telegram bot allows users to send a token contract address, and in return, it sends a screenshot of the token's visual representation from the BubbleMaps website. Built with Node.js and Puppeteer, the bot fetches the token's BubbleMap page and captures a snapshot for the user, providing a quick and easy way to visualize token data.

---

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kosar-luqman/bubblemaps-telegram-bot.git
cd bubblemaps-telegram-bot
```

### 2. Install dependencies

```bash
npm install
```

---

## 🔐 Environment Variables

To run the project, you need to create a `.env` file.

### ➕ Steps to create `.env`:

1. Open the project directory.
2. Create a new file named `.env` in the root.
3. Copy the contents of `.env.test` into `.env`.
4. Replace placeholder values with your actual API keys.

### Example (`.env.test`):

```env
BOT_TOKEN=your_telegram_bot_token
```

> ✅ **Note:** Never commit your `.env` file. It should stay private and be added to `.gitignore`.

---

## 🚀 Run the Project

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

---

## 🛠 Built With

- [Node.js](https://nodejs.org/)

---

## 📢 Contact

For any questions or support, contact: [kosarluqman@gmail.com](mailto:kosarluqman@gmail.com)
