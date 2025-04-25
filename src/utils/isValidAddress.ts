export function isValidAddress(address: string): boolean {
  const evmRegex = /^0x[a-fA-F0-9]{40}$/
  const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

  return evmRegex.test(address) || solanaRegex.test(address)
}
