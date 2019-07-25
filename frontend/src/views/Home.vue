<template>
  <v-container fill-height>
    <v-layout align-center justify-center column fill-height>
        <add-station-component/>
        <chart-component/>
    </v-layout>
  </v-container>
</template>

<script>

  import AddStationComponent from '@/components/add-station.vue'
  import ChartComponent from '@/components/chart.vue'

  export default {
    name: 'home',
    components: {
      AddStationComponent,
      ChartComponent
    }
  }
</script>
