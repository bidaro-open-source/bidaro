<script setup lang="ts">
import type { NuxtError } from '#app'

const { error } = defineProps<{
  error: unknown | null | undefined
}>()

const statusCode = computed(
  () => error && Object.hasOwn(error, 'statusCode')
    ? (error as NuxtError).statusCode
    : undefined,
)

const statusMessage = computed(
  () => error && Object.hasOwn(error, 'statusMessage')
    ? (error as NuxtError).statusMessage
    : undefined,
)

const url = computed(
  () => error && Object.hasOwn(error, 'url')
    ? (error as NuxtError & { url: string }).url
    : undefined,
)

const message = computed(
  () => error && Object.hasOwn(error, 'message')
    ? (error as NuxtError).message
    : undefined,
)

const stack = computed(
  () => error && Object.hasOwn(error, 'stack')
    ? Array.isArray((error as NuxtError).stack)
      ? (error as NuxtError).stack
      : [(error as NuxtError).stack]
    : [],
)

const data = computed(
  () => error && Object.hasOwn(error, 'data')
    ? (error as NuxtError).data
    : undefined,
)
</script>

<template>
  <div class="wrapper">
    <details>
      <summary>{{ message ? message : 'Не можу прочитати помилку' }}</summary>
      <ul>
        <li v-if="statusCode">
          <span>{{ url ? url : 'Url unknown' }}</span>
        </li>
        <li v-if="statusCode">
          <span>{{ statusCode }} - {{ statusMessage }}</span>
        </li>
        <li v-if="data">
          Data: <pre>{{ data }}</pre>
        </li>
        <li v-if="stack && stack.length">
          Stack:
          <ul>
            <li v-for="(row, index) in stack" :key="index">
              {{ index }}: {{ row }}
            </li>
          </ul>
        </li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
.wrapper {
  border: 1px solid;
  padding: 4px 10px;
  border-radius: 8px;
}
</style>
