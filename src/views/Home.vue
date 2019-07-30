<template>
  <v-container fill-height>
    <v-layout align-center justify-center column fill-height>
        <station-select-component/>
        <add-station-component/>
        <chart-component/>
    </v-layout>
  </v-container>
</template>

<script>

import AddStationComponent from '@/components/add-station.vue';
import ChartComponent from '@/components/chart.vue';
import StationSelectComponent from '@/components/station-select.vue';

export default {
  name: 'home',
  components: {
    AddStationComponent,
    ChartComponent,
    StationSelectComponent
  }
};
</script>
