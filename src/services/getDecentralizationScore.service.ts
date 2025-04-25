import axios from "axios"
import { TokenData } from "types"

export async function getDecentralizationScore(
  contract: string,
  chain: string
): Promise<number> {
  // get decentralization score from bubblemaps api
  const decentralizationUrl = `https://api-legacy.bubblemaps.io/map-metadata?chain=${chain}&token=${contract}`
  const decentralizationResponse = await axios.get(decentralizationUrl)
  const decentralizationData = decentralizationResponse.data
  const decentralizationScore =
    decentralizationData?.decentralisation_score || 0

  return decentralizationScore
}
