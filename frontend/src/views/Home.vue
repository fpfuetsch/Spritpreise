<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <UpdateComponent/>
    <AddStationComponent/>
  </div>
</template>

<script>

import UpdateComponent from '@/components/update-stations.vue'
import AddStationComponent from '@/components/add-station.vue'

export default {
  name: 'home',
  components: {
    UpdateComponent,
    AddStationComponent
  }
}
</script>
