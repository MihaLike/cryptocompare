type Ticker = {
  name: string
  price: number
}

interface Tickers extends Array<Ticker> {}

export type { Ticker, Tickers }
