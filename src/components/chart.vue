<template>
   <v-container>
     <apexchart width="100%" type="line" :options="chartOptions" :series="series"></apexchart>
   </v-container>
</template>
<script>
import { mapGetters, mapState } from 'vuex';

export default {
  data: function() {
    return {
    };
  },
  computed: {
    ...mapGetters([
      'getPrices',
    ]),
    ...mapState({
      gasType: state => state.gasType,
    }),
    chartOptions: function() {
      return {
        chart: {
          id: 'vuechart-example'
        },
        xaxis: {
          type: "datetime",
          categories: this.getPrices? this.getPrices.map(val => val.timestamp) : []
        }

      };
    },
    series: function() {
      return  [{
        name: this.gasType ? this.gasType : 'Nicht gesetzt',
        data: this.getPrices? this.getPrices.map(val => val.price) : [],
        colors: ['#FFFFFF',]
      }];
    }
  }
};
</script>

<style>
.apexcharts-toolbar {
  z-index: 0
}
</style>
