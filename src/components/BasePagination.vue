<template>
  <div>
    <button
      class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      :disabled="currentPage <= 1"
      :class="{ 'opacity-50 cursor-not-allowed': currentPage <= 1 }"
      @click="currentPageDecrEv"
    >
      Назад
    </button>
    <button
      class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      @click="currentPageIncrEv(1)"
      :disabled="!hasNextPage"
      :class="{ 'opacity-50 cursor-not-allowed': !hasNextPage }"
    >
      Вперед
    </button>
  </div>
</template>

<script setup lang="ts">
import { watch, toRefs } from 'vue'
import { TICKERS_AMOUNT_PER_PAGE } from '@/utils/constants'
import type { Tickers } from '@/types/ticker'
import type { PropType } from 'vue'

const props = defineProps({
  paginatedTickers: {
    type: Object as PropType<Tickers>,
    required: true
  },
  totalTickersAmount: {
    type: Number,
    required: true
  },
  currentPage: {
    type: Number,
    required: true
  },
  hasNextPage: {
    type: Boolean,
    required: true
  }
})
const { paginatedTickers, hasNextPage, totalTickersAmount } = toRefs(props)

const emits = defineEmits<{
  (e: 'currentPageDecr', newPage: number): void
  (e: 'currentPageIncr', newPage: number): void
}>()

const currentPageIncrEv = (pageNumber: number = 1) => {
  if (pageNumber !== 1) {
    emits('currentPageIncr', pageNumber)
  } else {
    emits('currentPageIncr', props.currentPage + pageNumber)
  }
}

const currentPageDecrEv = () => {
  emits('currentPageDecr', props.currentPage - 1)
}

watch(totalTickersAmount, () => {
  if (paginatedTickers.value.length === 0 && props.currentPage > 1) {
    currentPageDecrEv()
  }
  if (totalTickersAmount.value > TICKERS_AMOUNT_PER_PAGE && hasNextPage.value) {
    const lastPage = Math.ceil(totalTickersAmount.value / TICKERS_AMOUNT_PER_PAGE)
    if (props.currentPage + 1 !== lastPage) {
      currentPageIncrEv(lastPage)
    } else currentPageIncrEv(1)
  }
})
</script>
