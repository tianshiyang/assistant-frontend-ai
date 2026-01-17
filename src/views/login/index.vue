<template>
  <a-button type="primary" @click="handleLogin">Login</a-button>
</template>

<script setup lang="ts">
import { getUserInfoAPI } from '@/api/account'
const handleLogin = async () => {
  const res = await getUserInfoAPI()
  console.log(res)
}
</script>

<style scoped lang="scss"></style>
