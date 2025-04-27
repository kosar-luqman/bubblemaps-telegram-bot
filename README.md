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

### 3. Create a Telegram Bot and Get the Bot Token

Before running the project, you need a Telegram Bot Token. Here's how to create one:

1. Open Telegram and search for @BotFather.
2. Start a chat with BotFather and click /start.
3. Send the command /newbot to create a new bot.
4. Follow the instructions:
   
   . Choose a name for your bot (can be anything, like "BubbleMapsBot").
   
   . Choose a username for your bot (must end with bot, like "bubblemaps_visual_bot").
6. After creating the bot, BotFather will send you a Bot Token.
7. Copy the Bot Token and paste it into your .env file like this:

```env
BOT_TOKEN=your_telegram_bot_token
```

📢 Important: Keep your Bot Token secret. If someone else gets it, they can control your bot!

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
