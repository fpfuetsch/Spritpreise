<template>
  <div>
    <h1>Neue Tankstelle hinzufügen</h1>
    <input v-model="id" type="text" placeholder="Id der Tankstelle"/>
    <input type="button" value="Hinzufügen" @click="requestAdd()"/>
    <div>{{ status }}</div>
  </div>
</template>

<script>

import { mapActions, mapState } from 'vuex'

export default {
  name: 'AddStation',
  data: () =>  {
    return {
      id: ''
    }
  },
  methods: {
    requestAdd: function() {
      this.addNewGasstation(this.id);
    },
    ...mapActions([
      'addNewGasstation'
    ])
  },
   computed: {
     ...mapState({
       status: state => state.stationAddStatus,
     }),
   }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
