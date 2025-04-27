import TelegramBot from "node-telegram-bot-api"
import dotenv from "dotenv"
import fs from "fs"
import { generateScreenshot } from "./services/screenshot.service"
import { fetchTokenData, findTokenBlockchains } from "./services/token.service"
import { formatTokenInfo } from "./utils/formatter"
import { getDecentralizationScore } from "./services/getDecentralizationScore.service"
import { isValidAddress } from "./utils/isValidAddress"
import { TokenData } from "types"

dotenv.config()
const token = process.env.BOT_TOKEN || ""
const bot = new TelegramBot(token, {
  polling: true,
})

// Start command handler
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, "Send me a token contract address to get its info!")
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
      "❌ Invalid address. Please send a valid contract address."
    )
  }

  await bot.sendMessage(chatId, "⏳ Searching for token across blockchains...")

  try {
    console.time("Find blockchains")
    // Find all blockchains where this contract exists
    const blockchainOptions = await findTokenBlockchains(contract)
    console.timeEnd("Find blockchains")

    if (blockchainOptions.length === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Token not found on any supported blockchain."
      )
    } else if (blockchainOptions.length === 1) {
      // If only one blockchain, proceed directly with the token data we already have
      const option = blockchainOptions[0]
      const tokenData = option.fullData

      if (!tokenData) {
        return bot.sendMessage(
          chatId,
          "❌ Could not fetch token data. Please try again."
        )
      }

      return processTokenRequest(chatId, contract, option.chainId, tokenData)
    } else {
      // If multiple blockchains, ask user to select one
      const options = {
        reply_markup: {
          inline_keyboard: blockchainOptions.map((option) => {
            // Format the blockchain name nicely
            const chainName = formatChainName(option.chainId)
            return [
              {
                text: `${chainName} - ${option.symbol}`,
                callback_data: `chain_${option.chainId}_${contract}`,
              },
            ]
          }),
        },
      }

      return bot.sendMessage(
        chatId,
        `This token exists on ${blockchainOptions.length} blockchains. Please select one:`,
        options
      )
    }
  } catch (err) {
    console.error(err)
    bot.sendMessage(
      chatId,
      "❌ Could not retrieve data. Make sure the address is supported."
    )
  }
})

// Handle blockchain selection button clicks
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message?.chat.id
  if (!chatId) return

  const data = callbackQuery.data
  if (!data || !data.startsWith("chain_")) return

  // Extract chainId and contract from callback data
  const [_, chainId, contract] = data.split("_")

  // Send acknowledgment to Telegram to remove the "loading" state of the button
  await bot.answerCallbackQuery(callbackQuery.id)

  // Delete the selection message to clean up the chat
  if (callbackQuery.message?.message_id) {
    await bot.deleteMessage(chatId, callbackQuery.message.message_id)
  }

  // For multi-blockchain case, we need to fetch token data here
  await bot.sendMessage(
    chatId,
    `⏳ Generating map and fetching token data for ${formatChainName(
      chainId
    )}...`
  )

  try {
    // Fetch token data for the selected blockchain
    const tokenData = await fetchTokenData(contract, chainId)

    // Process the token request with the selected blockchain
    await processTokenRequest(chatId, contract, chainId, tokenData)
  } catch (err) {
    console.error(err)
    bot.sendMessage(
      chatId,
      "❌ Could not retrieve data. Make sure the address is supported."
    )
  }
})

// Function to process token requests with a specific blockchain
async function processTokenRequest(
  chatId: number,
  contract: string,
  chainId: string,
  tokenData: TokenData
) {
  try {
    console.time("Total execution time")

    // Step 1: Token data is already provided

    // Step 2: Generate screenshot
    console.time("generateScreenshot")
    const image = await generateScreenshot(contract, chainId)
    console.timeEnd("generateScreenshot")

    // Step 3: Get decentralization score
    console.time("getDecentralizationScore")
    const decentralizationScore = await getDecentralizationScore(
      contract,
      chainId
    )
    console.timeEnd("getDecentralizationScore")

    // Step 4: Format token info
    console.time("formatTokenInfo")
    const caption = formatTokenInfo(tokenData, decentralizationScore)
    console.timeEnd("formatTokenInfo")

    // Step 5: Send photo
    console.time("sendPhoto")
    await bot.sendPhoto(
      chatId,
      image,
      {
        caption,
      },
      {
        contentType: "image/png",
      }
    )
    console.timeEnd("sendPhoto")

    // Remove the image after sending
    const fileName = image.substring(image.indexOf("screenshot-"))
    fs.unlink(fileName, (err) => {
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
      "❌ Could not retrieve data. Make sure the address is supported."
    )
  }
}

// Function to format chain ID to readable name
function formatChainName(chainId: string): string {
  const chainNames: { [key: string]: string } = {
    eth: "Ethereum",
    bsc: "Binance Smart Chain",
    ftm: "Fantom",
    avax: "Avalanche",
    cro: "Cronos",
    arbi: "Arbitrum",
    poly: "Polygon",
    base: "Base",
    sol: "Solana",
    sonic: "Sonic",
  }

  return chainNames[chainId] || chainId.toUpperCase()
}

// Start bot
console.log("Bot is running...")
