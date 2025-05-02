<script setup lang="ts">
const auth = useAuthStore()

const role = computed(
  () => auth.user && auth.user.role
    ? auth.user.role.displayName
      ? auth.user.role.displayName
      : auth.user.role.name
    : 'null',
)

const permissions = computed(
  () => auth.user && auth.user.permissions ? auth.user.permissions : [],
)
</script>

<template>
  <div v-if="auth.isAuthenticated && auth.user">
    <div>Session token: {{ auth.sessionUuid }}</div>

    <ul>
      <li>User name: {{ auth.user.username }}</li>
      <li>Email: {{ auth.user.email }}</li>
      <li>Role: {{ role }}</li>
      <li>
        Permissions:

        <ul>
          <li v-for="permission in permissions" :key="permission.name">
            {{
              permission.displayName
                ? permission.displayName
                : permission.name
            }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
