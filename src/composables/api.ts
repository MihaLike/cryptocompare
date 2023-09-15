import { AUTHORIZATION_API_KEY } from '@/utils/constants'

export const loadCoinsPrice = async (tickers) => {
  //   console.log('TICKERS', tickers)

  let tickerNames = ''
  tickers.forEach((t) => {
    tickerNames += `${t.name},`
  })

  const params = new URLSearchParams({
    fsyms: tickerNames,
    tsyms: 'USD'
  })

  const url = `https://min-api.cryptocompare.com/data/pricemulti?${params.toString()}`

  return await fetch(url, {}).then((resp) => resp.json())

  // return await fetch(url, {
  //     method: 'GET',
  //     mode: 'no-cors',
  //     headers: params
  //   }).then((resp) => resp.json())
  // }
}

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
