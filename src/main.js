// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './render/components/App'

Vue.config.productionTip = false;

/* eslint-disable no-new */
global.vue = new Vue({
  el: '#app',
  components: { App },
  template: '<App ref="app" />'
});
