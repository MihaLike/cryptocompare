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
          @current-page-incr="(e: number) => (currentPage = e)"
          @current-page-decr="(e: number) => (currentPage = e)"
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
      <base-graph
        v-if="selectedTicker"
        :selected-ticker="selectedTicker"
        :graph="graph"
        :new-price="updatedGraphPrice"
        @clear-selected-ticker="selectedTicker = null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import AddTicker from '@/components/AddTicker.vue'
import RemoveTicker from '@/components/RemoveTicker.vue'
import BasePagination from '@/components/BasePagination.vue'
import BaseGraph from '@/components/BaseGraph.vue'
import { computed, Ref, ref, watch, nextTick } from 'vue'
import { VALID_KEYS, TICKERS_AMOUNT_PER_PAGE } from '@/utils/constants'
import { subscribeUpdateTickerPrice, unsubscribeUpdateTickerPrice } from '@/composables/api'
import type { Tickers, Ticker } from '@/types/ticker'
// State
const tickers: Ref<Tickers> = ref([])
const selectedTicker: null | Ticker = ref(null)
const wrongTickers = ref([])
const graph = ref([])
const updatedGraphPrice = ref(0)
const filter = ref('')
const currentPage = ref(1)

// Computed
const pageStateOptions = computed(() => {
  return {
    filter: filter.value,
    page: currentPage.value
  }
})

const startIndex = computed(() => (currentPage.value - 1) * TICKERS_AMOUNT_PER_PAGE)
const endIndex = computed(() => currentPage.value * TICKERS_AMOUNT_PER_PAGE)
const filteredTickers = computed(() =>
  tickers.value.filter((ticker) => ticker.name.includes(filter.value.toUpperCase()))
)
const paginatedTickers = computed(() =>
  filteredTickers.value.slice(startIndex.value, endIndex.value)
)
const hasNextPage = computed(() => filteredTickers.value.length > endIndex.value)

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
    updatedGraphPrice.value = newPrice
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
