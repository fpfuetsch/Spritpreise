<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <UpdateComponent/>
  </div>
</template>

<script>
// @ is an alias to /src
import UpdateComponent from '@/components/Update.vue'

export default {
  name: 'home',
  components: {
    UpdateComponent
  }
}
</script>
