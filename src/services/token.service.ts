import axios from "axios"
import { TokenData } from "types"

export async function findTokenBlockchains(
  contract: string
): Promise<
  {
    chainId: string
    address: string
    name: string
    symbol: string
    fullData?: TokenData
  }[]
> {
  // Search for the token in the BubbleMaps API using the contract address
  const url = `https://ybxie16t2wdqg045p-1.a1.typesense.net/collections/maps/documents/search?q=${contract}&query_by=full_name,+symbol,+token_address&num_typos=2,+1,+0&group_by=chain,+token_address&facettoken_address_by=chain&filter_by=chain:%3D[eth,bsc,ftm,avax,cro,arbi,poly,base,sol,sonic]&exhaustive_search=true&sort_by=_text_match:desc,+dt_update:desc&group_limit=1&per_page=10&x-typesense-api-key=sPSsrQprrdJUe9wy6dXZedFw96lg0VyJ`

  const { data: bubblemapsData } = await axios.get(url)

  if (
    !bubblemapsData ||
    !bubblemapsData?.grouped_hits ||
    bubblemapsData?.grouped_hits.length === 0
  ) {
    throw new Error("No data found for the provided contract address.")
  }

  // Return all blockchain options for this contract
  return bubblemapsData.grouped_hits.map((group: any) => {
    const hit = group.hits[0].document

    // Create TokenData object as well to avoid needing to fetch it again
    const tokenData = {
      chainId: hit.chain,
      baseToken: {
        address: hit.token_address,
        name: hit.full_name,
        symbol: hit.symbol,
      },
    } as TokenData

    return {
      chainId: hit.chain,
      address: hit.token_address,
      name: hit.full_name,
      symbol: hit.symbol,
      fullData: tokenData, // Include the full token data
    }
  })
}

export async function fetchTokenData(
  contract: string,
  chainId: string
): Promise<TokenData> {
  // Search for the token in the BubbleMaps API using the contract address and chain ID
  const url = `https://ybxie16t2wdqg045p-1.a1.typesense.net/collections/maps/documents/search?q=${contract}&query_by=full_name,+symbol,+token_address&num_typos=2,+1,+0&group_by=chain,+token_address&facettoken_address_by=chain&filter_by=chain:%3D${chainId}&exhaustive_search=true&sort_by=_text_match:desc,+dt_update:desc&group_limit=1&per_page=1&x-typesense-api-key=sPSsrQprrdJUe9wy6dXZedFw96lg0VyJ`

  const { data: bubblemapsData } = await axios.get(url)

  if (
    !bubblemapsData ||
    !bubblemapsData?.grouped_hits ||
    bubblemapsData?.grouped_hits.length === 0
  ) {
    throw new Error(
      "No data found for the provided contract address on this blockchain."
    )
  }

  const hit = bubblemapsData?.grouped_hits[0]?.hits[0]
  const token = {
    chainId: hit?.document?.chain,
    baseToken: {
      address: hit?.document?.token_address,
      name: hit?.document?.full_name,
      symbol: hit?.document?.symbol,
    },
  } as TokenData

  if (!token) {
    throw new Error("No token data found for the provided contract address.")
  }

  return token
}
