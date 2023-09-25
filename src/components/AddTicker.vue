<template>
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
            @keydown.enter="addTicker"
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
        <add-button @click="addTicker" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, toRefs, ref } from 'vue'
import AddButton from '@/components/AddButton.vue'
import { loadCoinsList } from '@/composables/api'
import type { Tickers, Ticker } from '@/types/ticker'
import type { PropType } from 'vue'

const ticker = ref('')

const props = defineProps({
  tickers: {
    type: Object as PropType<Tickers>,
    required: true
  }
})

const { tickers } = toRefs(props)

const emits = defineEmits<{
  (e: 'tickerAdded', newTicker: Ticker): void
}>()

// All coins list
const coinsListData = ref(null)

const getAllExistingCoinsList = async () => {
  const allCoinsData = await loadCoinsList()
  coinsListData.value = allCoinsData
}

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
// Helpers
const chooseHelper = (helper: string) => {
  ticker.value = helper
}

// Add ticker
const addTicker = () => {
  const currentTicker: Ticker = {
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

  ticker.value = ''
  emits('tickerAdded', currentTicker)
}

// Errors
const error = ref('')
const errorStatus = ref(false)

const errorOccur = async (text: string) => {
  errorStatus.value = true
  error.value = text
  setTimeout(() => {
    error.value = ''
    errorStatus.value = false
  }, 3000)
}
// On create
getAllExistingCoinsList()
</script>
