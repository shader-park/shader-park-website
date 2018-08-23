<template>
  <section class="section">
    <h1 class="title has-text-centered">Profile</h1>
    <article class="notification is-info">
      <p>Secure Route</p>
    </article>
  </section>
</template>

<script>
export default {
  computed: {
    currUserID () {
      return this.$store.getters.getUser.uid
    }
  },
  mounted() {
    console.log(this.currUserID);
    // console.log(this.$store.state.scene);
  }
};


</script>