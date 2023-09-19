import { AUTHORIZATION_API_KEY } from '@/utils/constants'

const tickersHandlers = new Map()

// Fetch
const loadCoinsPrices = async () => {
  if (tickersHandlers.size === 0) {
    return
  }

  const params = new URLSearchParams({
    fsyms: [...tickersHandlers.keys()].join(','),
    tsyms: 'USD'
  })

  const url = `https://min-api.cryptocompare.com/data/pricemulti?${params.toString()}`

  fetch(url).then((resp) =>
    resp.json().then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      )

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const newPriceFormatted = newPrice > 1 ? newPrice.toFixed(2) : newPrice.toPrecision(2)
        const handlers = tickersHandlers.get(currency) ?? []
        handlers.forEach((fn) => fn(currency, newPriceFormatted))
      })
    })
  )
}
// Fetch coin list for filter
export const loadCoinsList = async () =>
  await fetch('https://min-api.cryptocompare.com/data/blockchain/list', {
    method: 'GET',
    headers: {
      authorization: `Apikey ${AUTHORIZATION_API_KEY}`
    }
  })
    .then((resp) => {
      return resp.json()
    })
    .then((json) => json.Data)

// FETCH start
// setInterval(loadCoinsPrices, 5000)

// WebSocket
const AGGREGATE_INDEX = '5'
const ERROR_INDEX = '500'
// const MAX_SOCKETS_LIMIT = '429'

// broadcast channel
const bc = new BroadcastChannel('price_channel')

bc.onmessage = (event) => {
  const { currency, newPrice, errorState } = event.data
  const handlers = tickersHandlers.get(currency) ?? []
  handlers.forEach((fn) => fn(currency, newPrice, errorState))
}

const ws = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${AUTHORIZATION_API_KEY}`)

ws.addEventListener('message', (e) => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data)
  let errorState = 'OK'
  if (type === ERROR_INDEX) {
    const { PARAMETER } = JSON.parse(e.data)
    const currencyWithError = PARAMETER.split('~')[2]
    errorState = 'ERROR'
    const handlers = tickersHandlers.get(currencyWithError) ?? []
    handlers.forEach((fn) => fn(currencyWithError, newPrice, errorState))
    return
  }

  // if (type === MAX_SOCKETS_LIMIT) {
  //   console.log('MAX_SOCKETS_LIMIT')
  //   // worker.postMessage(type)
  // }

  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return
  }

  const handlers = tickersHandlers.get(currency) ?? []
  handlers.forEach((fn) => fn(currency, newPrice, errorState))
  // bc channel
  bc.postMessage({ currency, newPrice, errorState })
})
// }

const sendToWebSocket = (message) => {
  const stringifiedMessage = JSON.stringify(message)

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(stringifiedMessage)
    return
  }

  ws.addEventListener(
    'open',
    () => {
      ws.send(stringifiedMessage)
    },
    { once: true }
  )
}

export const subscribeToTickerOnWs = (ticker) => {
  sendToWebSocket({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

const unsubscribeFromTickerOnWs = (ticker) => {
  sendToWebSocket({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}

// Realisation
export const subscribeUpdateTickerPrice = async (ticker, cbFunc) => {
  const tickerName = ticker.name
  const subscribers = tickersHandlers.get(tickerName) || []
  tickersHandlers.set(tickerName, [...subscribers, cbFunc])
  // ws
  subscribeToTickerOnWs(tickerName)
}

export const unsubscribeUpdateTickerPrice = (ticker) => {
  const tickerName = ticker.name
  // ws
  unsubscribeFromTickerOnWs(tickerName)
  tickersHandlers.delete(ticker.name)
}
