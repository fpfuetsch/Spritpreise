<template>
  <div>
    <h1>UpdateComponent</h1>
    <input type="button" value="Preise updaten" @click="handelClick()"/>
  </div>
</template>

<script>

export default {
  name: 'PriceUpdate',
  methods: {
    handelClick: function() {
      this.$store.dispatch('priceUpdate')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
