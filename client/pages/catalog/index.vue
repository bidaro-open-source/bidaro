<script setup lang="ts">
import type { UserResource } from '~~/server/resources/user.resource'

useHead({ title: 'Каталог' })

const route = useRoute()
const currentPage = ref(route.query.page ? parseInt(route.query.page as string) : 1)
const selectedCategory = ref<number | null>(route.query.category ? parseInt(route.query.category as string) : null)

const apiUrl = computed(() => selectedCategory.value !== null ? `/api/catalog/${selectedCategory.value}?page=${currentPage.value}` : `/api/catalog?page=${currentPage.value}`)

const categories = await $fetch('/api/categories')

const { data: catalog, pending, error } = await useFetch(() => apiUrl.value, {
  server: true,
  default: () => ({
    data: [],
    meta: {
      total: 0,
      perPage: 28,
      currentPage: 1,
      from: 0,
      to: 0,
    },
  }),
})

watch(currentPage, () => {
  navigateTo(`/catalog?page=${currentPage.value}&category=${selectedCategory.value}`)
})

function createCategoryLink(category: typeof categories[0]): any {
  return {
    label: category.displayName,
    active: selectedCategory.value === category.id,
    to: `/catalog?page=1&category=${category.id}`,
    onSelect: () => {
      selectedCategory.value = category.id
      currentPage.value = 1
      navigateTo(`/catalog?page=1&category=${category.id}`)
    },
    children: (category.children || []).map(createCategoryLink),
  }
}

const categoryLinks = computed(() => categories ? categories.map(createCategoryLink) : [])

function getUserDisplayName(user: UserResource): string {
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
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside class="lg:col-span-1">
          <div class=" rounded-lg shadow-sm border dark:border-gray-800">
            <div class="p-6 border-b dark:border-gray-800">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                Категорії
              </h2>
            </div>
            <div class="p-4">
              <UNavigationMenu orientation="vertical" :items="categoryLinks" class="data-[orientation=vertical]:w-full" />
            </div>
          </div>
        </aside>

        <main class="lg:col-span-3">
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Каталог
            </h1>
            <p v-if="catalog?.meta" class="text-gray-600">
              Показано {{ catalog.meta.from }}-{{ catalog.meta.to }} з {{ catalog.meta.total }} лотів
            </p>
          </div>

          <div v-if="pending" class="space-y-4">
            <USkeleton v-for="i in 6" :key="i" class="h-48 w-full" />
          </div>

          <UAlert
            v-else-if="error"
            icon="i-heroicons-exclamation-triangle"
            color="error"
            variant="subtle"
            title="Error loading catalog"
            :description="error.message"
          />

          <div v-else-if="catalog?.data?.length" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <UCard
                v-for="lot in catalog.data"
                :key="lot.id"
                class="hover:shadow-lg transition-shadow duration-200"
              >
                <template #header>
                  <div class="relative">
                    <img
                      v-if="lot.image"
                      :src="`/api/s3/${lot.image?.path}`"
                      :alt="lot.title"
                      class="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div
                      v-else
                      class="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center"
                    >
                      <UIcon name="i-heroicons-photo" class="text-4xl text-gray-400" />
                    </div>
                  </div>
                </template>

                <div class="space-y-3">
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-neutral-50 line-clamp-2">
                    {{ lot.title }}
                  </h3>

                  <p v-if="lot.description" class="text-gray-600 dark:text-neutral-400 text-sm line-clamp-3">
                    {{ lot.description }}
                  </p>

                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-gray-500">
                        Поточна ціна
                      </p>
                      <p class="text-xl font-bold text-green-600">
                        ₴{{ lot.bets[0].amount.toLocaleString() }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm text-gray-500">
                        Ставок
                      </p>
                      <p class="text-lg font-semibold">
                        {{ lot.betsCount }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center space-x-2">
                    <UAvatar
                      :alt="getUserDisplayName(lot.user)"
                      size="xs"
                    />
                    <span class="text-sm text-gray-600">
                      {{ getUserDisplayName(lot.user) }}
                    </span>
                  </div>

                  <div v-if="lot.category" class="flex items-center space-x-2">
                    <UBadge color="info" variant="soft">
                      {{ lot.category.displayName }}
                    </UBadge>
                  </div>

                  <div class="text-xs text-gray-500 space-y-1">
                    <div v-if="lot.effectiveDate" class="flex justify-between">
                      <span>Розпочато:</span>
                      <span>{{ formatDate(lot.effectiveDate) }}</span>
                    </div>
                    <div v-if="lot.expirationDate" class="flex justify-between">
                      <span>Закінчиться:</span>
                      <span>{{ formatDate(lot.expirationDate) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Створений:</span>
                      <span>{{ formatDate(lot.createdAt) }}</span>
                    </div>
                  </div>

                  <div v-if="lot.winner" class="p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p class="text-sm text-yellow-800">
                      <UIcon name="i-heroicons-trophy" class="inline mr-1" />
                      Переможець: {{ getUserDisplayName(lot.winner) }}
                    </p>
                  </div>
                </div>

                <template #footer>
                  <UButton
                    color="primary"
                    variant="solid"
                    block
                    :to="`/lots/${lot.id}`"
                  >
                    Перейти
                  </UButton>
                </template>
              </UCard>
            </div>

            <div v-if="catalog.meta" class="flex justify-center mt-8">
              <UPagination
                v-model:page="currentPage"
                :items-per-page="catalog.meta.perPage"
                :total="catalog.meta.total"
                :max="5"
                show-last
                show-first
              />
            </div>
          </div>

          <div v-else class="text-center py-12">
            <UIcon name="i-heroicons-archive-box" class="text-6xl text-gray-300 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              Лоти не знайдено
            </h3>
            <p class="text-gray-500">
              На даний момент лоти не доступні.
            </p>
          </div>
        </main>
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
