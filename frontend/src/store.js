import fetch from 'node-fetch'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    currentStation: undefined,
    currentStationPrices: undefined,
    gasType: undefined,
    stations: [],
    stationAddStatus: undefined,
  },
  mutations: {
    setStationAddStatus(state, status) {
      state.stationAddStatus = status;
    },
    setStations(state, stations) {
      state.stations = stations;
    },
    setCurrentStation(state, station) {
      state.currentStation = station.value;
    },
    setCurrentStationPrices(state, prices) {
      state.currentStationPrices = prices;
    },
    setGasType(state, type) {
      state.gasType = type;
    }
  },
  getters: {
    getStationOptions: state => {
      return state.stations.length != 0 ? state.stations.map(station => {
        return {value: station,
                text: station.name + ' ' + station.street
               };
      }) : [];
    },
    getPrices: state => {
      return state.currentStationPrices && state.gasType ? state.currentStationPrices[state.gasType.toLowerCase()] : undefined;
    }
  },
  actions: {
    priceUpdate() {
      fetch('http://localhost:8080/update');
    },
    async addNewGasstation(context, id) {
      const res = await fetch(`http://localhost:8080/addNewStation?id=${id}`);
      context.commit('setStationAddStatus', res.statusText)
    },
    async getStations(context) {
      const res = await fetch('http://localhost:8080/getStations').then(res => res.json());
      context.commit('setStations', res);
    },
    async getPrices(context, id) {
      const res = await fetch(`http://localhost:8080/getPricesFor?id=${id}`).then(res => res.json());
      context.commit('setCurrentStationPrices', res);
    }
  }
})
