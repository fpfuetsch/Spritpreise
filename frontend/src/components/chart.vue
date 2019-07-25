<template>
   <v-container>
     <apexchart width="1000" type="line" :options="chartOptions" :series="series"></apexchart>
   </v-container>
</template>
<script>
  import { mapState } from 'vuex'

  export default {
    data: function() {
      return {
      }
    },
    computed: {
     ...mapState({
       diesel: state => state.dieselData,
     }),
     chartOptions: function() {
      return {
          chart: {
            id: 'vuechart-example'
          },
          xaxis: {
            categories: this.diesel? this.diesel.map(val => val.timestamp) : []
          }

        }
      },
      series: function() {
        return  [{
          name: 'Diesel',
          data: this.diesel? this.diesel.map(val => val.price) : [],
          colors:['#FFFFFF',]
        }]
      }
    }
  }
</script>