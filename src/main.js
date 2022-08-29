import Vue from 'vue'
import VueMoment from 'vue-moment'
import moment from 'moment-timezone'
import App from './App.vue'

Vue.config.productionTip = false
Vue.use(VueMoment, {
  moment,
})

new Vue({
  render: function (h) { return h(App) },
}).$mount('#app')
