<template>
  <!-- The backdrop -->
  <div
    v-if="props.showModal"
    class="backdrop"
    @click="closeModal"
  >
    <!-- Where the actual content goes -->
    <div
      class="popup"
      @click.stop
    >
      <div class="bg-white text-black">
        <slot
          name="confirmation"
          :close-modal="closeModal"
        ></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  showModal: {
    type: Boolean,
    required: true
  }
})

const emits = defineEmits<{
  (e: 'closeModal'): void
}>()

const closeModal = () => {
  emits('closeModal')
}
</script>

<style scoped>
.popup {
  top: 50px;
  padding: 20px;
  left: 50%;
  transform: translateX(-50%);
  position: fixed;
  z-index: 101;
  background-color: white;
  border-radius: 10px;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 100;
}
</style>
