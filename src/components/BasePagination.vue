<template>
  <div>
    <button
      class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      v-if="currentPage > 1"
      @click="currentPageDecr"
    >
      Назад
    </button>
    <button
      class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      @click="currentPageIncr"
      v-if="hasNextPage"
    >
      Вперед
    </button>
  </div>
</template>

<script setup lang="ts">
import { watch, toRefs } from 'vue'
import type { Tickers } from '@/types/ticker.ts'
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
const { paginatedTickers, currentPage, hasNextPage } = toRefs(props)

const emits = defineEmits(['currentPageDecr', 'currentPageIncr'])

const currentPageIncr = () => {
  emits('currentPageIncr')
}

const currentPageDecr = () => {
  emits('currentPageDecr')
}

watch(
  () => paginatedTickers,
  () => {
    if (paginatedTickers.value.length === 0 && currentPage.value > 1) {
      emits('currentPageDecr')
    }
    if (hasNextPage.value) {
      emits('currentPageIncr')
    }
  },
  { deep: true }
)
</script>
