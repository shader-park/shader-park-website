<template>
  <main id="app" class="section">
    <div class="container">
      <nav-main></nav-main>
      <router-view></router-view>
      <!-- <codemirror v-model="code"></codemirror> -->
    </div>
  </main>
</template>

<script>
import Header from './components/Header.vue';
// import { codemirror } from 'vue-codemirror-lite'

export default {
  components: {
    navMain: Header,
    // codemirror
  },
  methods: {
    setUser: function() {
      this.$store.dispatch('setUser');
    }
  },
  created() {
    // when the app is created run the set user method
    // this uses Vuex to check if a user is signed in
    // check out mutations in the store.js file
    this.setUser();
  }
};
</script>

