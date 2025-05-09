<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const auth = useAuthStore()

const items = ref<NavigationMenuItem[]>([
  {
    label: 'Про нас',
    to: '/about',
  },
  {
    label: 'Каталог',
    to: '/catalog',
    children: [
      {
        label: 'Електроніка',
        description: 'Аукціони смартфонів, ноутбуків, техніки та ґаджетів.',
        href: '/catalog/1',
        icon: 'i-lucide-smartphone',
      },
      {
        label: 'Побутова техніка',
        description: 'Холодильники, пральні, мікрохвильовки й інше.',
        href: '/catalog/1',
        icon: 'i-lucide-washing-machine',
      },
      {
        label: 'Одяг та взуття',
        description: 'Одяг і взуття для жінок та чоловіків. Новинки та бренди з торгом.',
        href: '/catalog/1',
        icon: 'i-lucide-shirt',
      },
      {
        label: 'Авто та мото',
        description: 'Продаж авто, мотоциклів, запчастин та аксесуарів.',
        href: '/catalog/1',
        icon: 'i-lucide-car',
      },
      {
        label: 'Дитячі товари',
        description: 'Іграшки, візочки, одяг, меблі та інші корисні речі.',
        href: '/catalog/1',
        icon: 'i-lucide-baby',
      },
      {
        label: 'Меблі та інтер\'єр',
        description: 'Меблі для дому, офісу та саду. Декоративні рішення.',
        href: '/catalog/1',
        icon: 'i-lucide-lamp',
      },
      {
        label: 'Колекціонування',
        description: 'Монети, марки, антикваріат і рідкісні речі для колекціонерів.',
        href: '/catalog/1',
        icon: 'i-lucide-gem',
      },
      {
        label: 'Їжа і напої',
        description: 'Продукти харчування, делікатеси та напої.',
        href: '/catalog/1',
        icon: 'i-lucide-utensils',
      },
      {
        label: 'Інше',
        description: 'Товари, які не увійшли в основні категорії.',
        href: '/catalog/1',
        icon: 'i-lucide-package-search',
      },
    ],
  },
  {
    label: 'Контакти',
    to: '/contacts',
  },
  {
    label: 'Ціни',
    to: '/pricing',
  },
  {
    label: 'Допомога',
    children: [
      {
        label: 'Часті запитання',
        description: 'Відповіді на типові питання щодо торгів, оплати й доставки.',
        href: '/faq',
        icon: 'i-lucide-help-circle',
      },
      {
        label: 'Як продавати?',
        description: 'Інструкція для продавців: як створити лот і почати торгувати.',
        href: '/faq/1',
        icon: 'i-lucide-upload',
      },
      {
        label: 'Як купувати?',
        description: 'Покроковий гайд для покупців: як знайти лот і зробити ставку.',
        href: '/faq/2',
        icon: 'i-lucide-shopping-cart',
      },
    ],
  },
  {
    label: 'Інше',
    children: [
      {
        label: 'Партнери',
        description: 'Компанії та бренди, які співпрацюють з нами.',
        icon: 'i-lucide-handshake',
      },
      {
        label: 'Вакансії',
        description: 'Актуальні вакансії в команді аукціону. Приєднуйся до нас!',
        icon: 'i-lucide-briefcase',
      },
      {
        label: 'Open Source',
        description: 'Можеш подивитися наш код, проект є на GitHub!',
        icon: 'i-lucide-github',
        href: 'https://github.com/bidaro-open-source',
        target: '_blank',
      },
    ],
  },
])

const ui = ref({
  item: 'px-2',
  childList: 'grid-cols-3',
})

const name = computed(
  () => auth.user && auth.user.name ? auth.user.name : auth.user?.username,
)
</script>

<template>
  <header class="bg-default/75 backdrop-blur border-b border-default sticky top-0 z-50">
    <div class="mx-auto px-4 container flex items-center justify-between min-h-14">
      <NuxtLink href="/" class="text-2xl font-medium">
        Bidaro
      </NuxtLink>

      <UNavigationMenu :items="items" :ui="ui" class="w-full max-w-4xl justify-center" />

      <div class="w-48 flex justify-end">
        <USkeleton v-if="auth.isAuthenticating" class="h-9 w-9 mr-[6px] rounded-full" />

        <div v-else-if="auth.isAuthenticated" class="flex gap-2">
          <ProfileDropdown
            :name="name || 'undefined'"
            :email="auth.user?.email || 'undefined'"
            :email-verified="!!auth.user?.emailVerifiedAt"
            @logout="auth.logout()"
          />
        </div>

        <div v-else class="flex gap-2">
          <UButton color="neutral" variant="outline" href="/auth/login">
            Увійти
          </UButton>
          <UButton color="neutral" href="/auth/register">
            Реєстрація
          </UButton>
        </div>
      </div>
    </div>
  </header>
</template>
