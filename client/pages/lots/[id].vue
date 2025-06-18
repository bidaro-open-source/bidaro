<script setup lang="ts">
import { lotStatuses } from '~~/server/constants'
import { calcualteLotMinimalStep } from '~~/server/services/lot-service'

const route = useRoute()
const apiUrl = computed(() => `/api/lots/${route.params.id}`)
const apiBetsUrl = computed(() => `/api/lots/${route.params.id}/bets`)

const { data: lot, pending, error, refresh } = await useFetch(() => apiUrl.value, {
  server: true,
})

useHead({
  title: computed(() => lot.value ? `${lot.value?.title} - Аукціон` : 'Завантаження...'),
})

// Завантаження ставок
const { data: bets, pending: betsLoading, refresh: refreshBets } = await useFetch(() => apiBetsUrl.value, {
  server: false,
  default: () => [],
})

const betAmount = ref<number>()
const placingBet = ref(false)

const canPlaceBet = computed(() => {
  return lot.value?.status === lotStatuses.IN_TRADING_PROCESS
})

const highestBet = computed(() => lot.value?.bets[0].amount)

const minBetAmount = computed(() => highestBet.value ? highestBet.value + calcualteLotMinimalStep(highestBet.value) : 1)

const isValidBetAmount = computed(() => {
  return betAmount.value && betAmount.value >= minBetAmount.value
})

function getUserDisplayName(user: { name?: string, surname?: string, username: string }): string {
  if (user.name && user.surname) {
    return `${user.name} ${user.surname}`
  }
  if (user.name) {
    return user.name
  }
  return user.username
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Розміщення ставки
const toast = useToast()

const auth = useAuthStore()
async function placeBet() {
  if (!auth.isAuthenticated) {
    navigateTo('/auth/login')
    return
  }

  if (!isValidBetAmount.value || !betAmount.value) {
    toast.add({
      title: 'Помилка',
      description: 'Введіть коректну суму ставки',
      color: 'error',
    })
    return
  }

  placingBet.value = true

  try {
    await $fetch(apiBetsUrl.value, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: {
        amount: betAmount.value,
      },
    })

    toast.add({
      title: 'Успіх!',
      description: 'Ваша ставка успішно розміщена',
      color: 'success',
    })

    betAmount.value = undefined
    await Promise.all([refreshBets(), refresh()])
  }
  catch (error: any) {
    toast.add({
      title: 'Помилка',
      description: error?.data.message || 'Не вдалося розмістити ставку',
      color: 'error',
    })
  }
  finally {
    placingBet.value = false
  }
}

if (error.value?.statusCode === 404) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Лот не знайдено',
  })
}
</script>

<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- Навігаційні крихти -->
      <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm">
          <li>
            <NuxtLink to="/" class="text-gray-500 hover:text-gray-700">
              Головна
            </NuxtLink>
          </li>
          <li class="text-gray-500">
            /
          </li>
          <li>
            <NuxtLink to="/catalog" class="text-gray-500 hover:text-gray-700">
              Каталог
            </NuxtLink>
          </li>
          <li class="text-gray-500">
            /
          </li>
          <li class="text-gray-900 dark:text-white font-medium">
            {{ lot?.title || 'Завантаження...' }}
          </li>
        </ol>
      </nav>

      <!-- Стан завантаження -->
      <div v-if="pending" class="space-y-6">
        <USkeleton class="h-96 w-full" />
        <USkeleton class="h-48 w-full" />
      </div>

      <UAlert
        v-else-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="subtle"
        title="Помилка завантаження лоту"
        :description="error.message"
      />

      <div v-else-if="lot" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div class="relative">
              <img
                v-if="lot.image"
                :src="`/api/s3/${lot.image?.path}`"
                :alt="lot.title"
                class="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div
                v-else
                class="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center"
              >
                <UIcon name="i-heroicons-photo" class="text-6xl text-gray-400 dark:text-gray-600" />
                <span class="ml-2 text-gray-500">Немає зображення</span>
              </div>
            </div>

            <div v-if="lot.bets.length > 1" class="grid grid-cols-4 gap-2">
              <div
                v-for="bet in lot.bets.slice(1, 5)"
                :key="bet.id"
                class="relative cursor-pointer"
              >
                <img
                  v-if="bet.image"
                  :src="bet.image.path"
                  :alt="`Ставка ${bet.id}`"
                  class="w-full h-20 object-cover rounded border hover:border-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Інформація про лот -->
          <div class="space-y-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ lot.title }}
              </h1>
              <p v-if="lot.description" class="text-gray-600 dark:text-gray-400 text-lg">
                {{ lot.description }}
              </p>
            </div>

            <!-- Ціна та ставки -->
            <UCard>
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-lg text-gray-600 dark:text-gray-400">Початкова сума:</span>
                  <span class="text-2xl font-bold text-green-600">
                    ₴{{ lot.initialAmount?.toLocaleString() }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-lg text-gray-600 dark:text-gray-400">Кількість ставок:</span>
                  <span class="text-xl font-semibold">{{ lot.betsCount }}</span>
                </div>
                <div v-if="highestBet" class="flex justify-between items-center border-t dark:border-gray-700 pt-4">
                  <span class="text-lg text-gray-600 dark:text-gray-400">Найвища ставка:</span>
                  <span class="text-2xl font-bold text-blue-600">
                    ₴{{ highestBet?.toLocaleString() }}
                  </span>
                </div>
              </div>
            </UCard>

            <UAlert
              v-if="lot.winner"
              icon="i-heroicons-trophy"
              color="warning"
              variant="subtle"
              title="Переможець аукціону"
              :description="getUserDisplayName(lot.winner)"
            />

            <!-- Форма ставки -->
            <UCard v-if="canPlaceBet">
              <template #header>
                <h3 class="text-lg font-semibold">
                  Зробити ставку
                </h3>
              </template>

              <form class="flex space-x-4" @submit.prevent="placeBet">
                <UFormGroup label="Сума ставки (₴)" required>
                  <UInput
                    v-model="betAmount"
                    type="number"
                    :placeholder="`Мінімум ₴${minBetAmount?.toLocaleString()}`"
                    size="lg"
                    class="min-w-3xs"
                  />
                </UFormGroup>

                <UButton
                  type="submit"
                  color="primary"
                  variant="solid"
                  size="lg"
                  block
                  :loading="placingBet"
                >
                  {{ placingBet ? 'Розміщення ставки...' : 'Зробити ставку' }}
                </UButton>
              </form>
            </UCard>

            <!-- Інформація про неможливість ставки -->
            <UAlert
              v-else-if="lot.status !== lotStatuses.IN_TRADING_PROCESS"
              icon="i-heroicons-information-circle"
              color="neutral"
              variant="subtle"
              title="Аукціон завершено"
              description="Ставки більше не приймаються для цього лоту."
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">
                Власник
              </h3>
            </template>
            <div class="flex items-center space-x-3">
              <UAvatar
                :alt="getUserDisplayName(lot.user)"
                size="md"
              />
              <div>
                <p class="font-medium">
                  {{ getUserDisplayName(lot.user) }}
                </p>
                <p class="text-sm text-gray-500">
                  @{{ lot.user.username }}
                </p>
              </div>
            </div>
          </UCard>

          <!-- Категорія -->
          <UCard v-if="lot.category">
            <template #header>
              <h3 class="text-lg font-semibold">
                Категорія
              </h3>
            </template>
            <div>
              <UBadge color="blue" variant="soft" size="lg">
                {{ lot.category.displayName }}
              </UBadge>
              <p v-if="lot.category.description" class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {{ lot.category.description }}
              </p>
            </div>
          </UCard>

          <!-- Дати -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">
                Важливі дати
              </h3>
            </template>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Створено:</span>
                <span>{{ formatDate(lot.createdAt) }}</span>
              </div>
              <div v-if="lot.effectiveDate" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Початок:</span>
                <span>{{ formatDate(lot.effectiveDate) }}</span>
              </div>
              <div v-if="lot.expirationDate" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Завершення:</span>
                <span>{{ formatDate(lot.expirationDate) }}</span>
              </div>
              <div v-if="lot.updatedAt" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Оновлено:</span>
                <span>{{ formatDate(lot.updatedAt) }}</span>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Історія ставок -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">
                Історія ставок
              </h3>
              <UButton
                variant="ghost"
                size="sm"
                :loading="betsLoading"
                @click="refreshBets"
              >
                <UIcon name="i-heroicons-arrow-path" />
                Оновити
              </UButton>
            </div>
          </template>

          <div v-if="betsLoading" class="space-y-3">
            <USkeleton v-for="i in 1" :key="i" class="h-16 w-full" />
          </div>

          <div v-else-if="bets?.length" class="space-y-3">
            <div
              v-for="bet in bets"
              :key="bet.id"
              class="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <UAvatar
                  :alt="getUserDisplayName(bet.user)"
                  size="sm"
                />
                <div>
                  <p class="font-medium">
                    {{ getUserDisplayName(bet.user) }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ formatDateTime(bet.createdAt) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-green-600">
                  ₴{{ bet.amount.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <UIcon name="i-heroicons-currency-dollar" class="text-4xl text-gray-300 mb-2" />
            <p class="text-gray-500">
              Ставок поки що немає
            </p>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Toast для повідомлень -->
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
