Vue.use(VueMaterial)

const app = new Vue({
  el: '#app',
  data: {
    events: [],
    attended: {
      _id: '',
      _rev: '',
      collection: 'event',
      title: '',
      dtstart: '2017-11-30',
      dtend: '2017-11-30',
      description: '',
      attendees: 0,
      conference: false,
      meetup: false,
      hackathon: false,
      sponsored: false,
      tags: '',
      comments: '',
      latitude: 0.0,
      longitude: 0.0
    },
    presented: {
      _id: '',
      _rev: '',
      collection: 'session',
      title: '',
      dtstart: '2017-11-30',
      description: '',
      attendees: 0,
      conference: false,
      meetup: false,
      hackathon: false,
      webinar: false,
      sponsored: false,
      tags: '',
      comments: ''
    },
    blogged: {
      _id: '',
      _rev: '',
      collection: 'blog',
      title: '',
      dtstart: '2017-11-30',
      url: '',
      comments: ''
    },
    press: {
      _id: '',
      _rev: '',
      collection: 'press',
      title: '',
      outlet: '',
      dtstart: '2017-11-30',
      url: '',
      comments: ''
    },
    expense: {
      _id: '',
      _rev: '',
      collection: 'expense',
      title: '',
      dtstart: '2017-11-30',
      comments: '',
      travel_expenses_currency: 'USD',
      travel_expenses: 0.0,
      non_travel_expenses_currency: 'USD',
      non_travel_expenses: 0.0
    },
    err: '',
    msg: '',
    cookie: ''
  },
  mounted: function() {
    var jar = getCookies();
    if (jar.advocatedtoken) {
      this.cookie = jar.advocatedtoken
    } else {
      err = 'You are not logged in. Please type /advocated into Slack to get a login link'
    }
    var today = todayStr();
    this.attended.dtstart = today;
    this.attended.dtend = today;
    this.presented.dtstart = today;
    this.blogged.dtstart = today;
    this.press.dtstart = today;
    this.expense.dtstart = today;
    
  },
  computed: {
    bloggedReady: function() {
      return (this.blogged && this.blogged.title && this.blogged.dtstart && this.blogged.url);
    },
    attendedReady: function() {
      return (this.attended && this.attended.title && this.attended.dtstart && this.attended.dtend && this.attended.attendees > 0);
    },
    presentedReady: function() {
      return (this.presented && this.presented.title && this.presented.dtstart && this.presented.attendees > 0);
    },
    expenseReady: function() {
      return (this.expense && this.expense.title && this.expense.dtstart);
    },
    pressReady: function() {
      return (this.press && this.press.title && this.press.dtstart && this.press.url);
    }
  },
  methods: {
    onChangeTab: (tabIndex) => {
      if (tabIndex === 2) {
        ajax('userevents', { cookie: app.cookie}, function(err, data) {
          console.log('ajax userevents', err, data)
          if (err) {
            this.err = 'Failed to retrieve user events';
          } else {
            app.events = data.rows;
          }
        });
      }
      console.log('onChange is triggered', tabIndex);
    },
    submitForm: (doc) => {
      if (typeof doc.attendees === 'string') {
        doc.attendees = parseInt(doc.attendees);
      }
      if (typeof doc.latitude === 'string') {
        doc.latitude = parseFloat(doc.latitude);
      }
      if (typeof doc.longitude === 'string') {
        doc.longitude = parseFloat(doc.longitude);
      }
      if (typeof doc.travel_expenses === 'string') {
        doc.travel_expenses = parseFloat(doc.travel_expenses);
      }
      if (typeof doc.non_travel_expenses === 'string') {
        doc.non_travel_expenses = parseFloat(doc.non_travel_expenses);
      }

      console.log('i', doc);

      // add auth information
      doc.cookie = app.cookie;

      // submit to serverless action
      ajax('submit', doc, function(err, data) {
        console.log('ajax submit', err, data)
        if (err) {
          this.err = 'Failed to save record';
        } else {
          doc._id = data.id;
          doc._rev = data.rev;
          app.msg = 'Thank you for advocating!';
          app.$refs.snackbar.open();
        }

      });
    }
  }
})