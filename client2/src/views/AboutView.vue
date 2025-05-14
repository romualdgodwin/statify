<script setup>
  import {useCounterStore} from '../stores/counter'
  const counter = useCounterStore()
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <span>Count is: {{ counter.count }}</span>
    <button @click="counter.increment">Increment</button>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
  }
}
</style>
