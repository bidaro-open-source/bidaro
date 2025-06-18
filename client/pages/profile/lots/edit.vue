<script setup lang="ts">
import { lotStatuses } from '~~/server/constants'
import { transformToFormError } from '~/uitls/transform-to-form-error'

interface LotForm {
  title: string
  description: string
  categoryId: string | null
  initialAmount: number | null
  initialDuration: string
}

interface Category {
  id: string
  name: string
}

interface SelectedImage {
  file: File
  preview: string
}

interface Lot {
  id: string
  title: string
  description?: string
  categoryId?: string
  initialAmount: number
  initialDuration: string
  image?: string
}

// Meta
definePageMeta({
  title: 'Редагування лоту',
  layout: 'profile',
})

// Route
const route = useRoute()
const lotId = route.query.id as string

// Reactive data
const formRef = ref<any>()
const form = ref<LotForm | null>(null)
const currentImage = ref<string>('')
const selectedImage = ref<SelectedImage | null>(null)
const loading = ref(true)
const isUpdating = ref(false)
const categoriesLoading = ref(false)

const isPublished = ref(false)

const auth = useAuthStore()

// Duration options
const durationOptions = [
  { label: '1 година', value: '1_hour' },
  { label: '1 день', value: '1_day' },
  { label: '3 дні', value: '3_days' },
  { label: '7 днів', value: '7_days' },
]

// Categories
const categories = ref<Category[]>([])

const categoryOptions = computed(() => {
  const arr: { label: string, value: number }[] = []

  const addToArray = (category: Category) => {
    arr.push({
      label: category.displayName,
      value: category.id,
    })

    if (category.children) {
      for (const child of category.children)
        addToArray(child)
    }
  }

  for (const category of categories.value) {
    addToArray(category)
  }

  return arr
})

// Toast
const toast = useToast()

// Redirect if no ID
if (!lotId) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Lot ID is required',
  })
}

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    fetchLot(),
    fetchCategories(),
  ])
})

// Methods
async function fetchLot() {
  try {
    loading.value = true
    const data = await $fetch<{ data: Lot }>(`/api/lots/${lotId}`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })

    if (data) {
      form.value = {
        title: data.title,
        description: data.description || '',
        categoryId: data.categoryId || null,
        initialAmount: data.initialAmount,
        initialDuration: data.initialDuration,
      }
      isPublished.value = data.status !== lotStatuses.DRAFT
      currentImage.value = `/api/s3/${data.image.path}` || ''
    }
  }
  catch (error: any) {
    console.error('Помилка завантаження лоту:', error)
    toast.add({
      title: 'Помилка',
      description: 'Не вдалося завантажити дані лоту',
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    categoriesLoading.value = true
    const data = await $fetch<{ data: Category[] }>('/api/categories')
    categories.value = data || []
  }
  catch (error) {
    console.error('Помилка завантаження категорій:', error)
  }
  finally {
    categoriesLoading.value = false
  }
}

function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        title: 'Помилка',
        description: 'Файл занадто великий. Максимальний розмір 5MB',
        color: 'error',
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.add({
        title: 'Помилка',
        description: 'Файл не є зображенням',
        color: 'error',
      })
      return
    }

    // Clean up previous preview
    if (selectedImage.value) {
      URL.revokeObjectURL(selectedImage.value.preview)
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImage.value = {
        file,
        preview: e.target?.result as string,
      }
      currentImage.value = ''
    }
    reader.readAsDataURL(file)
  }

  // Reset input
  target.value = ''
}

function removeImage() {
  if (selectedImage.value) {
    URL.revokeObjectURL(selectedImage.value.preview)
    selectedImage.value = null
  }
  currentImage.value = ''
}

async function updateLot(): Promise<boolean> {
  try {
    await $fetch(`/api/lots/${lotId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: {
        title: form.value.title,
        description: form.value.description || undefined,
        categoryId: form.value.categoryId || undefined,
        initialAmount: form.value.initialAmount,
        initialDuration: form.value.initialDuration,
      },
    })

    return true
  }
  catch (error: any) {
    console.error('Помилка оновлення лоту:', error)
    toast.add({
      title: 'Помилка',
      description: error.data?.message || 'Не вдалося оновити лот',
      color: 'error',
    })
    if (error.data && error.data.data && error.data.data.fieldErrors) {
      formRef.value.setErrors(transformToFormError(error.data.data.fieldErrors))
    }
    return false
  }
}

async function uploadImage() {
  if (!selectedImage.value)
    return

  try {
    const formData = new FormData()
    formData.append('image', selectedImage.value.file)

    await $fetch(`/api/lots/${lotId}/image`, {
      method: 'POST',
      body: formData,
    })
  }
  catch (error: any) {
    console.error('Помилка завантаження зображення:', error)
    toast.add({
      title: 'Попередження',
      description: 'Лот оновлено, але зображення не завантажилось',
      color: 'error',
    })
  }
}

async function handleSubmit() {
  try {
    isUpdating.value = true

    const updated = await updateLot()
    if (!updated)
      return

    if (selectedImage.value) {
      await uploadImage()
    }

    toast.add({
      title: 'Успіх',
      description: 'Лот успішно оновлено!',
      color: 'success',
    })
  }
  catch (error) {
    console.error('Помилка збереження змін:', error)
  }
  finally {
    isUpdating.value = false
  }
}

// Cleanup image preview on unmount
onUnmounted(() => {
  if (selectedImage.value) {
    URL.revokeObjectURL(selectedImage.value.preview)
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Редагування лоту
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Оновіть інформацію про ваш лот
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
    </div>

    <UCard v-else-if="form" class="mb-6">
      <UForm ref="formRef" :state="form" class="space-y-6" @submit.prevent="handleSubmit">
        <UFormField label="Назва лоту" name="title" required>
          <UInput
            v-model="form.title"
            placeholder="Введіть назву лоту"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <!-- Description Field -->
        <UFormField label="Опис лоту" name="description">
          <UTextarea
            v-model="form.description"
            placeholder="Введіть детальний опис лоту (необов'язково)"
            :rows="4"
            resize
            class="w-full"
            autoresize
          />
        </UFormField>

        <UFormField v-if="!isPublished" label="Категорія" name="categoryId">
          <USelectMenu
            v-model="form.categoryId"
            :items="categoryOptions"
            placeholder="Оберіть категорію (необов'язково)"
            :loading="categoriesLoading"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <!-- Initial Amount Field -->
        <UFormField v-if="!isPublished" label="Початкова сума" name="initialAmount" required>
          <UInput
            v-model.number="form.initialAmount"
            type="number"
            size="lg"
            min="0"
            step="0.01"
            class="w-full"
          >
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400 text-sm">₴</span>
            </template>
          </UInput>
        </UFormField>

        <!-- Duration Field -->
        <UFormField v-if="!isPublished" label="Тривалість аукціону" name="initialDuration" required>
          <USelect
            v-model="form.initialDuration"
            :items="durationOptions"
            placeholder="Оберіть тривалість"
            class="w-full"
          />
        </UFormField>

        <!-- Image Upload Section -->
        <UFormField label="Зображення лоту" name="image">
          <div class="space-y-4">
            <!-- Current Image Preview -->
            <div v-if="currentImage || selectedImage" class="relative">
              <img
                :src="selectedImage?.preview || currentImage"
                alt="Зображення лоту"
                class="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
              />
              <button
                type="button"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                @click="removeImage"
              >
                ×
              </button>
            </div>

            <!-- File Input -->
            <div v-if="!currentImage && !selectedImage" class="flex items-center justify-center w-full">
              <label
                for="image"
                class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <UIcon name="i-heroicons-cloud-arrow-up" class="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                  <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-semibold">Натисніть для завантаження</span> або перетягніть файл
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG або JPEG (макс. 5MB)</p>
                </div>
                <input
                  id="image"
                  type="file"
                  class="hidden"
                  accept="image/*"
                  @change="handleImageSelect"
                />
              </label>
            </div>

            <!-- Change Image Button -->
            <div v-if="currentImage || selectedImage" class="flex justify-center">
              <label
                for="image"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <UIcon name="i-heroicons-photo" class="mr-2" />
                Змінити зображення
                <input
                  id="image"
                  type="file"
                  class="hidden"
                  accept="image/*"
                  @change="handleImageSelect"
                />
              </label>
            </div>
          </div>
        </UFormField>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <UButton
            type="button"
            variant="outline"
            size="lg"
            class="flex-1"
            @click="navigateTo('/profile/lots')"
          >
            <UIcon name="i-heroicons-arrow-left" class="mr-2" />
            Скасувати
          </UButton>

          <UButton
            type="submit"
            :loading="isUpdating"
            :disabled="!form.title || !form.initialAmount"
            size="lg"
            class="flex-1"
          >
            <UIcon name="i-heroicons-check" class="mr-2" />
            Зберегти зміни
          </UButton>
        </div>
      </UForm>
    </UCard>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">
        Лот не знайдено
      </p>
    </div>
  </div>
</template>
