<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>
      <add-ticker
        :tickers="tickers"
        @ticker-added="tickerAdded"
      />
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <base-pagination
          :paginated-tickers="paginatedTickers"
          :has-next-page="hasNextPage"
          :current-page="currentPage"
          @current-page-incr="currentPage++"
          @current-page-decr="currentPage--"
        />
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
            <remove-ticker
              :ticker-to-remove="t"
              @ticker-deleted="handleDelete"
            />
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
import AddTicker from '@/components/AddTicker.vue'
import RemoveTicker from '@/components/RemoveTicker.vue'
import BasePagination from '@/components/BasePagination.vue'
import { computed, onMounted, onBeforeUnmount, Ref, ref, watch, nextTick } from 'vue'
import { VALID_KEYS } from '@/utils/constants'
import { subscribeUpdateTickerPrice, unsubscribeUpdateTickerPrice } from '@/composables/api'
import type { Tickers, Ticker } from '@/types/ticker'
// State
const tickers: Ref<Tickers> = ref([])
const selectedTicker: null | Ticker = ref(null)
const wrongTickers = ref([])
const graph: Ref<Array<number>> = ref([])
const graphEl = ref()
const mapGraphEl = ref(1)
const filter = ref('')
const currentPage = ref(1)

// Computed
const pageStateOptions = computed(() => {
  return {
    filter: filter.value,
    page: currentPage.value
  }
})

const startIndex = computed(() => (currentPage.value - 1) * 6)
const endIndex = computed(() => currentPage.value * 6)
const filteredTickers = computed(() =>
  tickers.value.filter((ticker) => ticker.name.includes(filter.value.toUpperCase()))
)
const paginatedTickers = computed(() =>
  filteredTickers.value.slice(startIndex.value, endIndex.value)
)
const hasNextPage = computed(() => filteredTickers.value.length > endIndex.value)

const normalizedGraph = computed(() => {
  const maxValue = Math.max.apply(null, graph.value)
  const minValue = Math.min.apply(null, graph.value)

  if (maxValue === minValue) {
    return graph.value.map(() => 50)
  }
  return graph.value.map((price) => 5 + ((price - minValue) * 95) / (maxValue - minValue))
})

// Methods
const select = (ticker: Ticker) => {
  if (selectedTicker.value === ticker) {
    selectedTicker.value = ''
  } else {
    selectedTicker.value = ticker
  }
}

const handleDelete = (tickerToRemove: Ticker) => {
  tickers.value = tickers.value.filter((t) => t !== tickerToRemove)
  if (selectedTicker.value === tickerToRemove) {
    selectedTicker.value = null
  }
  unsubscribeUpdateTickerPrice(tickerToRemove)
}

const getSavedTickers = () => {
  const tickersData = localStorage.getItem('cryptonomicon-list')
  if (tickersData) {
    tickers.value = JSON.parse(tickersData)
    tickers.value.forEach((ticker) => subscribeUpdateTickerPrice(ticker, updateTicker))
  }
}

const tickerAdded = (currentTicker: Ticker) => {
  tickers.value.push(currentTicker)
  subscribeUpdateTickerPrice(currentTicker, updateTicker)
  filter.value = ''
}

const updateTicker = (tickerName: string, newPrice: number, status: string) => {
  const currentTicker = tickers.value.find((t) => t.name === tickerName)
  if (!currentTicker) {
    return
  }

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
getSavedTickers()
getPreviousState()
</script>

<style scoped>
* {
  user-select: none;
}
</style>
