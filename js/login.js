Vue.use(VueMaterial)

const app = new Vue({
  el: '#app',
  data: {
    err: ''
  },
  mounted: function() {
    const hash = window.location.hash.replace('#','');;
    if (hash) {
      ajax('verify',{ cookie: hash}, function(err, data) {
        if (err) {
          this.err = 'Invalid Token';
        } else {
          document.cookie = 'advocatedtoken=' + hash;
          window.location.hash="";
          window.location.pathname="/";
        }

      });
    } else {
      this.err = 'Missing token';
    }
  },
  computed: {
    
  },
  methods: {
    
  }
})