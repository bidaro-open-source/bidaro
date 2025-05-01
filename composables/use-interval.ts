export function useInterval(fn: () => void, delay: number) {
  const interval = ref<ReturnType<typeof setInterval> | null>(null)

  onMounted(() => {
    if (interval.value)
      return
    interval.value = setInterval(fn, delay)
  })

  onBeforeUnmount(() => {
    if (!interval.value)
      return
    clearInterval(interval.value)
    interval.value = null
  })
}
