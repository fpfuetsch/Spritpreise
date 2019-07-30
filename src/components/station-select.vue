<template>
  <v-container grid-list-md align-content-center>
    <v-flex xs12>
      <v-select
        v-model="station"
        @change="setSelectedStation()"
        :items="getStationOptions"
        label="Tankstellen"
        return-object
      ></v-select>
    </v-flex>
    <v-flex xs12>
      <v-select
        v-model="gasType"
        @change="setSelectedGasType()"
        :items="gasTypeOptions"
        label="Typ"
      ></v-select>
    </v-flex>
  </v-container>
</template>

<script>

import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
  name: 'StationSelect',
  data() {
    return {
      station: undefined,
      gasType: undefined,
      gasTypeOptions: ['Diesel', 'E5', 'E10'],
    };
  },
  mounted() {
    this.$store.dispatch('getStations');
  },
  methods: {
    setSelectedStation: function() {
      this.setCurrentStation(this.station);
      this.$store.dispatch('getPrices', this.currentStation.stationId);
    },
    setSelectedGasType: function() {
      this.setGasType(this.gasType);
    },
    ...mapMutations([
      'setCurrentStation',
      'setGasType'
    ]),
  },
  computed: {
    ...mapGetters([
      'getStationOptions'
    ]),
    ...mapState({
      currentStation: state => state.currentStation
    })
  }
};
</script>