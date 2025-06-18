<script setup lang="ts">
import { lotStatuses } from '~~/server/constants'

const auth = useAuthStore()
const toast = useToast()

definePageRestrictions('auth')
definePageMeta({
  layout: 'profile',
})
useHead({ title: 'Мої ставки - Профіль' })

const { data: lots, pending, error, refresh } = await useFetch(`/api/users/${auth.user?.id}/bets`, {
  server: true,
  default: () => [],
})

function canReceive(lot: any): boolean {
  return lot.status === lotStatuses.IN_DELIVERY_PROCESS && lot.winner?.id === auth.user?.id
}

function getUserDisplayName(user: any): string {
  if (user.name && user.surname) {
    return `${user.name} ${user.surname}`
  }
  if (user.name) {
    return user.name
  }
  return user.username
}

function getStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    [lotStatuses.DRAFT]: 'Чернетка',
    [lotStatuses.IN_TRADING_PROCESS]: 'В торгах',
    [lotStatuses.IN_DISCUSSION_PROCESS]: 'Обговорення',
    [lotStatuses.IN_DELIVERY_PROCESS]: 'Доставка',
    [lotStatuses.RECEIVED]: 'Завершено',
    [lotStatuses.REJECTED]: 'Скасовано',
  }

  return statusTexts[status] || status
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function receiveLot(lot: Lot) {
  try {
    await $fetch(`/api/lots/${lot.id}/confirm-receive`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })

    toast.add({
      title: 'Успіх!',
      description: 'Лот отримано',
      color: 'success',
    })

    await refresh()
  }
  catch (error: any) {
    toast.add({
      title: 'Помилка',
      description: error?.data.message || 'Не вдалося отримати лот',
      color: 'error',
    })
  }
}
</script>

<template>
  <div class="">
    <div class="container mx-auto px-4 py-8">
      <!-- Заголовок сторінки -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-90 dark:text-white mb-2">
          Мої ставки
        </h1>
        <p class="text-gray-600">
          Керуйте своїми ставками та відстежуйте їхній статус
        </p>
      </div>

      <!-- Стан завантаження -->
      <div v-if="pending" class="space-y-4">
        <USkeleton v-for="i in 5" :key="i" class="h-32 w-full" />
      </div>

      <!-- Помилка -->
      <UAlert
        v-else-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="subtle"
        title="Помилка завантаження лотів"
        :description="error.message"
      />

      <!-- Список лотів -->
      <div v-else-if="lots?.length" class="space-y-4">
        <UCard
          v-for="lot in lots"
          :key="lot.id"
          class="hover:shadow-md transition-shadow duration-200"
        >
          <div class="flex items-start space-x-6">
            <!-- Зображення лоту -->
            <div class="flex-shrink-0">
              <img
                v-if="lot.image"
                :src="`/api/s3/${lot.image?.path}`"
                :alt="lot.title"
                class="w-24 h-24 object-cover rounded-lg"
              />
              <div
                v-else
                class="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center"
              >
                <UIcon name="i-heroicons-photo" class="text-xl text-gray-400" />
              </div>
            </div>

            <!-- Основна інформація -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {{ lot.title }}
                  </h3>

                  <p v-if="lot.description" class="text-gray-600 text-sm mb-3 line-clamp-2">
                    {{ lot.description }}
                  </p>

                  <div class="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>Створено: {{ formatDate(lot.createdAt) }}</span>
                    <span v-if="lot.category">{{ lot.category.displayName }}</span>
                    <span v-if="lot.bets.length">Ставок: {{ lot.betsCount }}</span>
                  </div>

                  <!-- Дати -->
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <span v-if="lot.effectiveDate">
                      Початок: {{ formatDate(lot.effectiveDate) }}
                    </span>
                    <span v-if="lot.expirationDate">
                      Завершення: {{ formatDate(lot.expirationDate) }}
                    </span>
                  </div>
                </div>

                <!-- Статус та ціна -->
                <div class="flex flex-col items-end space-y-2 ml-4">
                  <UBadge
                    color="neutral"
                    variant="solid"
                    size="lg"
                  >
                    {{ getStatusText(lot.status) }}
                  </UBadge>

                  <div class="text-right">
                    <p class="text-sm text-gray-500">
                      Початкова сума
                    </p>
                    <p class="text-xl font-bold text-green-600">
                      ₴{{ lot.initialAmount.toLocaleString() }}
                    </p>
                  </div>

                  <div v-if="lot.bets.length" class="text-right">
                    <p class="text-sm text-gray-500">
                      Ціна
                    </p>
                    <p class="text-lg font-semibold text-blue-600">
                      ₴{{ (lot.bets[0] ? lot.bets[0].amount : lot.initialAmount).toLocaleString() }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Переможець -->
              <div v-if="lot.winner" class="mt-4 p-3 bg-yellow-50 dark:bg-transparent border border-yellow-200 rounded-lg">
                <div class="flex items-center space-x-2">
                  <UIcon name="i-heroicons-trophy" class="text-yellow-600 dark:text-yellow-200" />
                  <span class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Переможець: {{ getUserDisplayName(lot.winner) }}
                  </span>
                </div>
              </div>

              <div class="mt-4 flex items-center space-x-3">
                <UButton
                  v-if="canReceive(lot)"
                  color="info"
                  variant="outline"
                  size="sm"
                  @click="receiveLot(lot)"
                >
                  <UIcon name="i-heroicons-inbox-arrow-down" class="mr-1" />
                  Отримати
                </UButton>

                <UButton
                  v-if="lot.status !== lotStatuses.DRAFT"
                  variant="ghost"
                  size="sm"
                  :to="`/lots/${lot.id}`"
                >
                  <UIcon name="i-heroicons-eye" class="mr-1" />
                  Переглянути
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <div v-else class="text-center py-12">
        <UIcon name="i-heroicons-archive-box" class="text-6xl text-gray-300 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Ставок нема
        </h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
