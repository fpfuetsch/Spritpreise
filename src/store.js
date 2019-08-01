import fetch from 'node-fetch';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:8080/api';

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
    async priceUpdate({ dispatch, state }) {
      await fetch(`${API_URL}/update`);
      console.log(state.currentStation)
      if (state.currentStation) dispatch('getPrices', state.currentStation.stationId);
    },
    async addNewGasstation(context, id) {
      const res = await fetch(`${API_URL}/addNewStation?id=${id}`);
      context.commit('setStationAddStatus', res.statusText);
      context.dispatch('getStations');
    },
    async getStations(context) {
      const res = await fetch(`${API_URL}/getStations`).then(res => res.json());
      context.commit('setStations', res);
    },
    async getPrices(context, id) {
      const res = await fetch(`${API_URL}/getPricesFor?id=${id}`).then(res => res.json());
      context.commit('setCurrentStationPrices', res);
    }
  }
});
