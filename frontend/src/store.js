import fetch from 'node-fetch'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    stationAddStatus: '',
  },
  mutations: {
    setStationAddStatus(state, status) {
      state.stationAddStatus = status;
    }
  },
  actions: {
    priceUpdate() {
      fetch('http://localhost:3000/update');
    },
    async addNewGasstation(context, id) {
      const res = await fetch(`http://localhost:3000/addNewStation?id=${id}`);
      context.commit('setStationAddStatus', res.statusText)
    }
  }
})
