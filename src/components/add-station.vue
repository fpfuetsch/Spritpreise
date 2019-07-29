<template>
  <v-container grid-list-md align-content-center>
    <v-layout wrap>
      <v-flex xs12>
        <h1>Neue Tankstelle hinzufügen</h1>
      </v-flex>
      <v-flex xs10>
        <v-text-field
          v-model="id"
          label="Tankstellen ID"
        ></v-text-field>
      </v-flex>
      <v-flex align-self-center xs2>
        <v-btn @click="requestAdd()">Hinzufügen</v-btn>
      </v-flex>
      <v-flex xs12>
         <div>{{ status }}</div>
      </v-flex>
     </v-layout>
  </v-container>
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
