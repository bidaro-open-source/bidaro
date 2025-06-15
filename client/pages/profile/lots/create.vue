<script setup lang="ts">
import { transformToFormError } from '~/uitls/transform-to-form-error'

interface Category {
  id: number
  displayName: string
  children?: Category[]
}
interface LotForm {
  title: string
  description: string
  categoryId: number | undefined
  initialAmount: number | null
  initialDuration: string
}

interface SelectedImage {
  file: File
  preview: string
}

definePageRestrictions('auth')
definePageMeta({
  title: 'Створення лоту',
  layout: 'profile',
})

const formRef = ref()
const form = ref<LotForm>({
  title: '',
  description: '',
  categoryId: undefined,
  initialAmount: null,
  initialDuration: '1_hour',
})

const selectedImages = ref<SelectedImage[]>([])
const isPublishLoading = ref(false)
const isDraftLoading = ref(false)
const categoriesLoading = ref(false)

const durationOptions = [
  { label: '1 година', value: '1_hour' },
  { label: '1 день', value: '1_day' },
  { label: '3 дні', value: '3_days' },
  { label: '7 днів', value: '7_days' },
]

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

const toast = useToast()

onMounted(async () => {
  await fetchCategories()
})

async function fetchCategories() {
  try {
    categoriesLoading.value = true
    const data = await $fetch('/api/categories')
    categories.value = data || []
  }
  catch (error) {
    console.error('Помилка завантаження категорій:', error)

    toast.add({
      title: 'Помилка',
      description: 'Не вдалося завантажити категорії',
      color: 'error',
    })
  }
  finally {
    categoriesLoading.value = false
  }
}

function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files) {
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.add({
          title: 'Помилка',
          description: `Файл ${file.name} занадто великий. Максимальний розмір 5MB`,
          color: 'error',
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.add({
          title: 'Помилка',
          description: `Файл ${file.name} не є зображенням`,
          color: 'error',
        })
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        selectedImages.value.push({
          file,
          preview: e.target?.result as string,
        })
      }

      reader.readAsDataURL(file)
    })
  }

  target.value = ''
}

const auth = useAuthStore()

function removeImage(index: number) {
  selectedImages.value.splice(index, 1)
}

async function createLot(isDraft = false): Promise<number | null> {
  try {
    const endpoint = isDraft ? '/api/lots/draft' : '/api/lots'
    const data = await $fetch(endpoint, {
      method: 'POST',
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

    return data.id
  }
  catch (error: any) {
    console.error('Помилка створення лоту:', error?.data)

    toast.add({
      title: 'Помилка',
      description: error.data?.message || 'Не вдалося створити лот',
      color: 'error',
    })

    if (error.data && error.data.data && error.data.data.fieldErrors) {
      formRef.value.setErrors(transformToFormError(error.data.data.fieldErrors))
    }

    return null
  }
}

async function uploadImages(lotId: number) {
  if (selectedImages.value.length === 0)
    return

  try {
    for (const image of selectedImages.value) {
      const formData = new FormData()
      formData.append('image', image.file)
      await $fetch(`/api/lots/${lotId}/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: formData,
      })
    }
  }
  catch (error: any) {
    console.error('Помилка завантаження зображень:', error)

    toast.add({
      title: 'Попередження',
      description: 'Лот створено, але не всі зображення завантажились',
      color: 'warning',
    })
  }
}

async function saveDraft() {
  try {
    isDraftLoading.value = true

    const lotId = await createLot(true)

    if (!lotId)
      return

    await uploadImages(lotId)

    toast.add({
      title: 'Успіх',
      description: 'Чернетку лоту збережено',
      color: 'success',
    })

    await navigateTo('/profile/lots/')
  }
  catch (error) {
    console.error('Помилка збереження чернетки:', error)
  }
  finally {
    isDraftLoading.value = false
  }
}

async function handleSubmit() {
  try {
    isPublishLoading.value = true

    const lotId = await createLot(false)
    if (!lotId)
      return

    await uploadImages(lotId)

    toast.add({
      title: 'Успіх',
      description: 'Лот успішно створено та опубліковано!',
      color: 'success',
    })

    await navigateTo(`/lots/${lotId}`)
  }
  catch (error) {
    console.error('Помилка публікації лоту:', error)
  }
  finally {
    isPublishLoading.value = false
  }
}

onUnmounted(() => {
  selectedImages.value.forEach((image) => {
    URL.revokeObjectURL(image.preview)
  })
})
</script>

<template>
  <div class="">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Створення лоту
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Заповніть форму для створення нового лоту
      </p>
    </div>

    <UCard class="mb-6">
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

        <UFormField label="Категорія" name="categoryId">
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
        <UFormField label="Початкова сума" name="initialAmount" required>
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
        <UFormField label="Тривалість аукціону" name="initialDuration" required>
          <USelect
            v-model="form.initialDuration"
            :items="durationOptions"
            placeholder="Оберіть тривалість"
            class="w-full"
          />
        </UFormField>

        <!-- Image Upload Section -->
        <UFormField label="Зображення лоту" name="images">
          <div class="space-y-4">
            <!-- Image Preview -->
            <div v-if="selectedImages.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="(image, index) in selectedImages"
                :key="index"
                class="relative group"
              >
                <img
                  :src="image.preview"
                  :alt="`Preview ${index + 1}`"
                  class="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                />
                <button
                  type="button"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeImage(index)"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- File Input -->
            <div class="flex items-center justify-center w-full">
              <label
                for="images"
                class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                  <UIcon name="i-heroicons-cloud-arrow-up" class="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                  <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span class="font-semibold">Натисніть для завантаження</span> або перетягніть файли
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">PNG, JPG або JPEG (макс. 5MB кожен)</p>
                </div>
                <input
                  id="images"
                  type="file"
                  class="hidden"
                  multiple
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
            :loading="isDraftLoading"
            variant="outline"
            size="lg"
            @click="saveDraft"
          >
            <UIcon name="i-heroicons-document-duplicate" class="mr-2" />
            Зберегти як чернетку
          </UButton>

          <UButton
            type="submit"
            :loading="isPublishLoading"
            size="lg"
          >
            <UIcon name="i-heroicons-rocket-launch" class="mr-2" />
            Створити та опублікувати
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
