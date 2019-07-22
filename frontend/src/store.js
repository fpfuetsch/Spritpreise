import fetch from 'node-fetch'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {

  },
  mutations: {

  },
  actions: {
    priceUpdate() {
      fetch('http://localhost:3000/update');
    }
  }
})
