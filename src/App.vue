<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>
      <section>
        <div class="flex items-center relative">
          <div class="max-w-xs mr-3">
            <label
              for="wallet"
              class="block text-sm font-medium text-gray-700 mb-4"
            >
              Добавить тикер:
            </label>
            <div class="w-25 mt-1 mb-1 relative rounded-md shadow-md">
              <input
                v-model="ticker"
                @keydown.enter="add"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
            </div>
            <div
              v-if="errorStatus"
              class="bg-red-100 border border-red-400 text-red-700 px-4 py-1 rounded absolute bottom-12"
            >
              {{ error }}
            </div>
            <ul class="flex h-10 mb-11">
              <li
                v-for="(helper, index) of last4FilteredCoins"
                :key="index"
                @click="chooseHelper(helper)"
                class="flex items-center text-white bg-gray-700 p-2 m-1 h-8 shadow-sm rounded-full cursor-pointer hover:bg-gray-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {{ helper }}
              </li>
            </ul>
            <button
              @click="add"
              type="button"
              class="h-10 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <svg
                class="-ml-0.5 mr-2 h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="#ffffff"
              >
                <path
                  d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                ></path>
              </svg>
              Добавить
            </button>
          </div>
        </div>
      </section>

      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <div>
          <button
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            v-if="currentPage > 1"
            @click="currentPage = currentPage - 1"
          >
            Назад
          </button>
          <button
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="currentPage = currentPage + 1"
            v-if="hasNextPage"
          >
            Вперед
          </button>
          <div>
            <label
              for="filter"
              class="block text-sm font-medium text-gray-700 mb-4"
            >
              Фильтр:
            </label>
            <input
              v-model="filter"
              class="block w-48 pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md w-20"
              name="filter"
            />
          </div>
        </div>

        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            class="flex flex-col justify-between bg-white overflow-hidden shadow rounded-lg cursor-pointer"
            :class="{
              'outline outline-purple-800': selectedTicker === t,
              'bg-red-500': wrongTickers?.find((wt) => wt === t)
            }"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt
                class="text-sm font-medium text-gray-500 truncate"
                :class="{
                  'text-black': wrongTickers?.find((wt) => wt === t)
                }"
              >
                {{ t.name }} - USD
              </dt>
              <dd
                class="mt-1 text-3xl font-semibold text-gray-900"
                :class="{
                  'text-base text-black': wrongTickers?.find((wt) => wt === t)
                }"
              >
                {{ t.price }}
              </dd>
            </div>
            <button
              @click.stop="handleDelete(t)"
              class="flex items-center justify-center w-full border-t border-gray-200 font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-red-800 hover:bg-gray-200 hover:opacity-80 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
      </template>
      <section
        v-if="selectedTicker"
        class="relative"
      >
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - USD
        </h3>
        <div
          class="flex items-end border-gray-600 border-b border-l h-64"
          ref="graphEl"
        >
          <div
            v-for="(bar, idx) in normalizedGraph"
            :key="idx"
            :style="{ height: `${bar}%` }"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button
          @click="selectedTicker = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background: new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUpdated, onBeforeUnmount, Ref, ref, watch, nextTick } from 'vue'
import { VALID_KEYS } from '@/utils/constants'
import {
  subscribeUpdateTickerPrice,
  unsubscribeUpdateTickerPrice,
  loadCoinsList
} from '@/composables/api'

// State
const ticker = ref('')
const tickers = ref([])
const selectedTicker = ref(null)
const wrongTickers = ref([])
const graph: Ref<Array<number>> = ref([])
const graphEl = ref()
const mapGraphEl = ref(1)
const coinsListData = ref(null)
const currentPage = ref(1)
const filter = ref('')

const error = ref('')
const errorStatus = ref(false)

// Computed
const startIndex = computed(() => (currentPage.value - 1) * 6)
const endIndex = computed(() => currentPage.value * 6)

const filteredTickers = computed(() =>
  tickers.value.filter((ticker) => ticker.name.includes(filter.value.toUpperCase()))
)
const paginatedTickers = computed(() =>
  filteredTickers.value.slice(startIndex.value, endIndex.value)
)

const hasNextPage = computed(() => filteredTickers.value.length > endIndex.value)

const pageStateOptions = computed(() => {
  return {
    filter: filter.value,
    page: currentPage.value
  }
})

// All coins list
const coinsList = computed(() => {
  if (coinsListData.value)
    return ['BTC', 'ETH', 'PEPE', 'DOGE'].concat(Object.keys(coinsListData.value))
  else return []
})

const filteredCoinsList = computed(() => {
  const filtered = coinsList.value.filter((coin) =>
    coin.includes(ticker.value.toUpperCase().trim())
  )
  // Uniq coins
  return Array.from(new Set(filtered))
})

const last4FilteredCoins = computed(() => filteredCoinsList.value.slice(0, 4))

const normalizedGraph = computed(() => {
  const maxValue = Math.max.apply(null, graph.value)
  const minValue = Math.min.apply(null, graph.value)

  if (maxValue === minValue) {
    return graph.value.map(() => 50)
  }
  return graph.value.map((price) => 5 + ((price - minValue) * 95) / (maxValue - minValue))
})

// Methods
const add = () => {
  const currentTicker = {
    name: ticker.value.toUpperCase(),
    price: '-'
  }
  // No equal tickers
  if (tickers.value.find((ticker) => ticker.name === currentTicker.name)) {
    errorOccur('Данный тикер уже есть')
    return
  }

  // || no empty tickers
  if (!currentTicker.name.length) {
    errorOccur('Введите название тикера')
    return
  }

  // || no unexisting tickers
  // if (coinsList.value.findIndex((ticker) => ticker === currentTicker.name) < 0) {
  //   errorOccur('Данного тикера не существует')
  //   return
  // }

  tickers.value.push(currentTicker)
  subscribeUpdateTickerPrice(currentTicker, updateTicker)
  ticker.value = ''
  filter.value = ''
}

const errorOccur = async (text: string) => {
  errorStatus.value = true
  error.value = text
  setTimeout(() => {
    error.value = ''
    errorStatus.value = false
  }, 3000)
}

const select = (ticker) => {
  if (selectedTicker.value === ticker) {
    selectedTicker.value = ''
  } else {
    selectedTicker.value = ticker
  }
}

const handleDelete = (tickerToRemove) => {
  tickers.value = tickers.value.filter((t) => t !== tickerToRemove)
  if (selectedTicker.value === tickerToRemove) {
    selectedTicker.value = null
  }
  unsubscribeUpdateTickerPrice(tickerToRemove)
}

const chooseHelper = (helper) => {
  ticker.value = helper
}

const getAllCoins = async () => {
  const allCoinsData = await loadCoinsList()
  coinsListData.value = allCoinsData
}

const getSavedTickers = () => {
  const tickersData = localStorage.getItem('cryptonomicon-list')
  if (tickersData) {
    tickers.value = JSON.parse(tickersData)
    tickers.value.forEach((ticker) => subscribeUpdateTickerPrice(ticker, updateTicker))
  }
}

const updateTicker = (tickerName, newPrice, status) => {
  const currentTicker = tickers.value.find((t) => t.name === tickerName)

  if (status === 'ERROR') {
    wrongTickers.value.push(currentTicker)
    currentTicker.price = 'Нет данных'
    return
  }

  currentTicker.price = newPrice
  if (currentTicker == selectedTicker.value) {
    graph.value.push(newPrice)
    if (graphEl.value) {
      if (graph.value.length > mapGraphEl.value) {
        const amountToDelete = graph.value.length - mapGraphEl.value
        graph.value.splice(0, amountToDelete)
      }
    }
  }
}

const getPreviousState = () => {
  const windowData = Object.fromEntries(new URL(window.location).searchParams.entries())

  VALID_KEYS.forEach((key) => {
    if (windowData[key]) {
      if (key === 'filter') {
        filter.value = windowData[key]
      }
      if (key === 'page') {
        currentPage.value = Number(windowData[key])
      }
    }
  })
}

const calculateGraphBarAmount = (): void => {
  if (!graphEl.value) {
    return
  }
  mapGraphEl.value = Math.floor(graphEl.value.clientWidth / 38)
}

onMounted(() => {
  window.addEventListener('resize', calculateGraphBarAmount)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', calculateGraphBarAmount)
})

watch(paginatedTickers, () => {
  // console.log('Changed pg', paginatedTickers)
  if (paginatedTickers.value.length === 0 && currentPage.value > 1) {
    currentPage.value -= 1
  }
})

watch(selectedTicker, () => {
  nextTick().then(() => {
    calculateGraphBarAmount()
  })
  graph.value = []
})

watch(pageStateOptions, (value) => {
  window.history.pushState(
    null,
    document.title,
    `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
  )
})

watch(
  () => tickers,
  () => {
    // console.log('tickers changed')
    localStorage.setItem('cryptonomicon-list', JSON.stringify(tickers.value))
  },
  { deep: true }
)

// On create
getAllCoins()
getSavedTickers()
getPreviousState()
</script>

<style scoped>
* {
  user-select: none;
}
</style>
