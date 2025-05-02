<template>
  <div class="wrapper">
    <div class="card">
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
      </div>

      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  justify-content: center;
}

.card {
  width: 300px;
  border: 1px solid;
  border-radius: 8px;
  padding: 40px 20px;
}
</style>
