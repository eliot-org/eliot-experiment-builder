<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "ELIOT",
  computed: {
    isLoggedIn: function () {
      return this.$store.getters.isLoggedIn;
    },
  },
  methods: {
      //Global logout Function
    logout: function () {
      this.$store.dispatch("logout").then(() => {
        if (this.$router.currentRoute.name != "/login") {
          this.$router.push("/login");
        }
      });
    },
  },
  created: function () {
      //Logs the user out if a server response is with code 401
    this.$http.interceptors.response.use(undefined, function (err) {
      return new Promise(function () {
        if (err.status === 401 && err.config && !err.config.__isRetryRequest) {
          this.$store.dispatch("logout");
        }
        throw err;
      });
    });
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Open+Sans");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Open Sans", sans-serif;
}
</style>
