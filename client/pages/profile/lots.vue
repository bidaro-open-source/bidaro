<script setup lang="ts">
import { lotStatuses } from '~~/server/constants'

const auth = useAuthStore()
const toast = useToast()

definePageRestrictions('auth')
definePageMeta({
  layout: 'profile',
})
useHead({ title: 'Мої лоти - Профіль' })

const deleteModal = ref({
  lot: null as any,
})

const { data: lots, pending, error, refresh } = await useFetch(`/api/users/${auth.user?.id}/lots`, {
  server: true,
  default: () => [],
})

function canEdit(lot: any): boolean {
  return lot.status === lotStatuses.IN_TRADING_PROCESS || lot.status === 'draft'
}

function canShowWinner(lot: any): boolean {
  return lot.status === lotStatuses.IN_TRADING_PROCESS && new Date(lot.expirationDate) < new Date()
}

function canSend(lot: any): boolean {
  return lot.status === lotStatuses.IN_TRADING_PROCESS && lot.user?.id === auth.user?.id
}

function canReceive(lot: any): boolean {
  return lot.status === lotStatuses.IN_DELIVERY_PROCESS && lot.winner?.id === auth.user?.id
}

function canDelete(lot: any): boolean {
  return lot.status === lotStatuses.DRAFT
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

async function showWinner(lot: any) {
  try {
    await $fetch(`/api/lots/${lot.id}/confirm-winner`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })

    toast.add({
      title: 'Успіх!',
      description: 'Переможець визначений',
      color: 'success',
    })

    await refresh()
  }
  catch (error: any) {
    toast.add({
      title: 'Помилка',
      description: error.message || 'Не вдалося визначити переможця',
      color: 'error',
    })
  }
}

async function sendLot(lot: any) {
  try {
    await $fetch(`/api/lots/${lot.id}/confirm-ship`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })

    toast.add({
      title: 'Успіх!',
      description: 'Лот відправлено',
      color: 'success',
    })

    await refresh()
  }
  catch (error: any) {
    toast.add({
      title: 'Помилка',
      description: error.message || 'Не вдалося відправити лот',
      color: 'error',
    })
  }
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
      description: error.message || 'Не вдалося отримати лот',
      color: 'error',
    })
  }
}

async function deleteLot(lot: Lot) {
  try {
    await $fetch(`/api/lots/${lot.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })

    toast.add({
      title: 'Успіх!',
      description: 'Лот видалено',
      color: 'success',
    })

    await refresh()
  }
  catch (error: any) {
    toast.add({
      title: 'Помилка',
      description: error.message || 'Не вдалося видалити лот',
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
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Мої лоти
        </h1>
        <p class="text-gray-600">
          Керуйте своїми лотами та відстежуйте їхній статус
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
                  <h3 class="text-lg font-semibold text-gray-900 mb-1">
                    <NuxtLink
                      :to="`/lots/${lot.id}`"
                      class="hover:text-blue-600 transition-colors"
                    >
                      {{ lot.title }}
                    </NuxtLink>
                  </h3>

                  <p v-if="lot.description" class="text-gray-600 text-sm mb-3 line-clamp-2">
                    {{ lot.description }}
                  </p>

                  <div class="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>Створено: {{ formatDate(lot.createdAt) }}</span>
                    <span v-if="lot.category">{{ lot.category.displayName }}</span>
                    <span>Ставок: {{ lot.betsCount }}</span>
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

                  <div class="text-right">
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
              <div v-if="lot.winner" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex items-center space-x-2">
                  <UIcon name="i-heroicons-trophy" class="text-yellow-600" />
                  <span class="text-sm font-medium text-yellow-800">
                    Переможець: {{ getUserDisplayName(lot.winner) }}
                  </span>
                </div>
              </div>

              <!-- Кнопки дій -->
              <div class="mt-4 flex items-center space-x-3">
                <!-- Редагувати -->
                <UButton
                  v-if="canEdit(lot)"
                  color="info"
                  variant="outline"
                  size="sm"
                  :to="`/lots/${lot.id}/edit`"
                >
                  <UIcon name="i-heroicons-pencil-square" class="mr-1" />
                  Редагувати
                </UButton>

                <!-- Показати переможця -->
                <UButton
                  v-if="canShowWinner(lot)"
                  color="success"
                  variant="outline"
                  size="sm"
                  @click="showWinner(lot)"
                >
                  <UIcon name="i-heroicons-trophy" class="mr-1" />
                  Показати переможця
                </UButton>

                <!-- Відправити -->
                <UButton
                  v-if="canSend(lot)"
                  color="info"
                  variant="outline"
                  size="sm"
                  @click="sendLot(lot)"
                >
                  <UIcon name="i-heroicons-paper-airplane" class="mr-1" />
                  Відправити
                </UButton>

                <!-- Отримати -->
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

                <!-- Модальне вікно підтвердження видалення -->
                <UModal v-if="canDelete(lot)">
                  <UButton
                    color="error"
                    variant="outline"
                    size="sm"
                  >
                    <UIcon name="i-heroicons-trash" class="mr-1" />
                    Видалити
                  </UButton>

                  <template #content>
                    <UCard>
                      <template #header>
                        <h3 class="text-lg font-semibold">
                          Підтвердити видалення
                        </h3>
                      </template>

                      <p class="text-gray-600 mb-4">
                        Ви впевнені, що хочете видалити лот "<strong>{{ deleteModal.lot?.title }}</strong>"?
                      </p>
                      <p class="text-sm text-red-600">
                        Цю дію неможливо скасувати.
                      </p>

                      <template #footer>
                        <div class="flex justify-end space-x-3">
                          <UButton
                            color="error"
                            @click="deleteLot(lot)"
                          >
                            Видалити
                          </UButton>
                        </div>
                      </template>
                    </UCard>
                  </template>
                </UModal>

                <UButton
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
          Лотів нема
        </h3>
        <UButton
          color="primary"
          to="/lots/create"
        >
          <UIcon name="i-heroicons-plus" class="mr-2" />
          Створити новий лот
        </UButton>
      </div>
    </div>

    <!-- Toast повідомлення -->
    <UNotifications />
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
