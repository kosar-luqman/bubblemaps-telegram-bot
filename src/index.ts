import TelegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
import fs from "fs"
import { generateScreenshot } from "./services/screenshot.service"
import { fetchTokenData } from "./services/token.service"
import { formatTokenInfo } from "./utils/formatter"
import { getDecentralizationScore } from "./services/getDecentralizationScore.service"
import { isValidAddress } from "./utils/isValidAddress"

dotenv.config()

const token = process.env.BOT_TOKEN || ""
const bot = new TelegramBot(token, { polling: true })

// Create menu keyboard
const getMainMenuKeyboard = () => {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "/start" }],
        [{ text: "/about" }],
        [{ text: "/blockchains" }],
      ],
      resize_keyboard: true,
    },
  }
}

// Start command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(
    chatId,
    "Send me a token contract address to get its info!",
    getMainMenuKeyboard()
  )
})

// About command handler
bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(
    chatId,
    "This bot analyzes token contracts and provides information about their decentralization, distribution, and gets screenshots of bubbles for tokens from bubblemaps website.",
    getMainMenuKeyboard()
  )
})

// Blockchains command handler
bot.onText(/\/blockchains/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(
    chatId,
    "Currently supported blockchains:\n\n" +
      "• Ethereum (ETH)\n" +
      "• BNB Chain (BNB)\n" +
      "• Fantom (FTM)\n" +
      "• Avalanche (AVAX)\n" +
      "• Cronos (CRO)\n" +
      "• Arbitrum (ARB)\n" +
      "• Polygon (MATIC)\n" +
      "• Base (BASE)\n" +
      "• Solana (SOL)\n" +
      "• Sonic (SONIC)\n\n" +
      "Send me a token contract address from any of these networks!",
    getMainMenuKeyboard()
  )
})

// Handle all text messages
bot.on("message", async (msg) => {
  // Only process text messages
  if (!msg.text) return

  const chatId = msg.chat.id
  const contract = msg.text.trim()

  // Skip command messages
  if (contract.startsWith("/")) return

  if (!isValidAddress(contract)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid address. Please send a valid contract address.",
      getMainMenuKeyboard()
    )
  }

  await bot.sendMessage(chatId, "⏳ Generating map and fetching token data...")

  try {
    console.time("Total execution time")

    // Step 1: Fetch token data
    console.time("fetchTokenData")
    const tokenData = await fetchTokenData(contract)
    console.timeEnd("fetchTokenData")

    if (!tokenData) {
      return bot.sendMessage(
        chatId,
        "❌ Unsupported blockchain. Please send a valid contract address.",
        getMainMenuKeyboard()
      )
    }

    // Step 2: Generate screenshot
    console.time("generateScreenshot")
    const image = await generateScreenshot(contract, tokenData.chainId)
    console.timeEnd("generateScreenshot")

    // Step 3: Get decentralization score
    console.time("getDecentralizationScore")
    const decentralizationScore = await getDecentralizationScore(
      contract,
      tokenData.chainId
    )
    console.timeEnd("getDecentralizationScore")

    // Step 4: Format token info
    console.time("formatTokenInfo")
    const caption = formatTokenInfo(tokenData, decentralizationScore)
    console.timeEnd("formatTokenInfo")

    // Step 5: Send photo
    console.time("sendPhoto")
    await bot.sendPhoto(chatId, image, {
      caption,
      reply_markup: getMainMenuKeyboard().reply_markup,
    })
    console.timeEnd("sendPhoto")

    // Remove the image after sending
    fs.unlink(image, (err) => {
      if (err) {
        console.error("Error deleting file:", err)
      } else {
        console.log("File deleted successfully")
      }
    })

    console.timeEnd("Total execution time")
  } catch (err) {
    console.error(err)
    bot.sendMessage(
      chatId,
      "❌ Could not retrieve data. Make sure the address is supported.",
      getMainMenuKeyboard()
    )
  }
})

// Start bot
console.log("Bot is running...")
