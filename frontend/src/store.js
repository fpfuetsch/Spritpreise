import fetch from 'node-fetch'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    stationAddStatus: '',
    dieselData: undefined,
  },
  mutations: {
    setStationAddStatus(state, status) {
      state.stationAddStatus = status;
    },
    setDieselData(state, data) {
      state.dieselData = data;
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
    async fetchDiesel(context) {
      const res = await fetch('http://localhost:8080/getDiesel').then(res => res.json());
      context.commit('setDieselData', res);
    }
  }
})
