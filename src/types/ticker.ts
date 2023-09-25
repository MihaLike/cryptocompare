type Ticker = {
  name: string
  price: number | string
}

interface Tickers extends Array<Ticker> {}

export type { Ticker, Tickers }
