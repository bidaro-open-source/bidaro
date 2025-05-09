<!-- eslint-disable -->
<template>
  <div class="flex flex-col min-h-screen">
    <TheHeader />

    <div class="mt-10 w-full max-w-sm mx-auto px-4 py-6 border border-neutral-300 rounded-2xl">
      <slot></slot>
    </div>

    <TheFooter class="mt-auto" />
  </div>
</template>
 <!-- eslint-enable -->
