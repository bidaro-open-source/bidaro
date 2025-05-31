<script setup lang="ts">
const { date, ua, uuid } = defineProps<{
  uuid: string
  date?: string
  ua?: string
}>()

defineEmits([
  'delete',
])

const auth = useAuthStore()

const formattedDate = computed(
  () => date ? new Date(date).toDateString() : 'no info',
)

const formattedUa = computed(() => ua || 'no info')
</script>

<template>
  <div class="p-4 bg-neutral-100 rounded-lg flex justify-between">
    <div>
      <div class="font-bold">
        {{ uuid }}
        {{ auth.sessionUuid === uuid ? '- (you)' : '' }}
      </div>
      <div>Date: {{ formattedDate }}</div>
      <div>User-Agent: {{ formattedUa }}</div>
    </div>
    <div>
      <UButton color="error" variant="soft" @click="$emit('delete', uuid)">
        Delete
      </UButton>
    </div>
  </div>
</template>
