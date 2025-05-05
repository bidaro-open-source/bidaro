<template>
  <div>
    <div>
      <NuxtLink href="/">
        Home
      </NuxtLink>
      <NuxtLink href="/auth/login">
        Login
      </NuxtLink>
      <NuxtLink href="/auth/register">
        Register
      </NuxtLink>
      <NuxtLink href="/profile">
        Profile
      </NuxtLink>
    </div>
    <slot></slot>
  </div>
</template>
