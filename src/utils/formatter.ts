import { TokenData } from "types"

export function formatTokenInfo(
  data: TokenData,
  decentralizationScore: number
): string {
  return `
Name: ${data?.baseToken?.name || "N/A"}
Symbol: ${data?.baseToken?.symbol || "N/A"}
Blockchain: ${
    data.chainId.charAt(0).toUpperCase() + data.chainId.slice(1) || "N/A"
  }
Decentralization Score: ${
    decentralizationScore ? decentralizationScore + "%" : "0"
  }
`.trim()
}
