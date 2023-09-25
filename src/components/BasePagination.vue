<template>
  <div>
    <button
      class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      v-if="currentPage > 1"
      @click="currentPageDecrEv"
    >
      Назад
    </button>
    <button
      class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      @click="currentPageIncrEv"
      v-if="hasNextPage"
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
  currentPage: {
    type: Number,
    required: true
  },
  hasNextPage: {
    type: Boolean,
    required: true
  }
})
const { paginatedTickers, hasNextPage } = toRefs(props)

const emits = defineEmits<{
  (e: 'currentPageDecr'): number
  (e: 'currentPageIncr'): number
}>()

const currentPageIncrEv = () => {
  emits('currentPageIncr', props.currentPage + 1)
}

const currentPageDecrEv = () => {
  emits('currentPageDecr', props.currentPage - 1)
}

// const lastPage = computed(() => )

watch(
  () => paginatedTickers,
  () => {
    if (paginatedTickers.value.length === 0 && props.currentPage > 1) {
      currentPageDecrEv()
    }
    if (paginatedTickers.value.length > TICKERS_AMOUNT_PER_PAGE && hasNextPage.value) {
      currentPageIncrEv()
    }
  },
  { deep: true }
)
</script>
