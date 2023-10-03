export const debugLog = (message: string) => {
  if(process.env.NODE_ENV === "development") {
    console.log(`🔷 [Sky Follower Bridge] ${message}`)
  }
}

export const isOneSymbol = (str: string) => {
  return /^[^\w\s]$/.test(str);
}
