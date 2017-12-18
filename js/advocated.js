Vue.use(VueMaterial)

var resetForms = function() {
  var today = todayStr();
  app.attended.dtstart = today;
  app.attended.dtend = today;
  app.presented.dtstart = today;
  app.blogged.dtstart = today;
  app.press.dtstart = today;
  app.expense.dtstart = today;
  app.attended.attendees = app.presented.attendees = 0;
  app.attended.latitude = app.attended.longitude = 0.0;
  app.press.outlet = '';
  app.blogged.url = app.press.url = '';
  app.attended._id = app.attended._rev = app.attended.title = app.attended.description = app.attended.tags = app.attended.comments = '';
  app.presented._id = app.presented._rev = app.presented.title = app.presented.description = app.presented.tags = app.presented.comments = '';
  app.blogged._id = app.blogged._rev = app.blogged.title = app.blogged.description = app.blogged.tags = app.blogged.comments = '';
  app.press._id = app.press._rev = app.press.title = app.press.description = app.press.tags = app.press.comments = '';
  app.expense._id = app.expense._rev = app.expense.title = app.expense.description = app.expense.tags = app.expense.comments = '';
};

const app = new Vue({
  el: '#app',
  data: {
    userDisplayName: '',
    userid: '',
    gotit: false,
    spinning: false,
    editmode: false,
    selectedTab: -1,
    recent: [],
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
      event: '',
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
    if (jar && jar.advocatedtoken) {
      this.cookie = jar.advocatedtoken;
      ajax('verify', { cookie: this.cookie}, (err, data) => {
        console.log('ajax verify', err, data)
        if (!err) {
          this.userid = data.userid;
          this.userDisplayName = data.userDisplayName;
        }
      });
    } else {
      err = 'You are not logged in. Please type /advocated into Slack to get a login link'
    }
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
      if (tabIndex === 2 || tabIndex === 5) {
        ajax('userevents', { cookie: app.cookie}, function(err, data) {
          console.log('ajax userevents', err, data)
          if (err) {
            //this.err = 'Failed to retrieve user events';
          } else {
            app.events = data.rows;
          }
        });
      } else if (tabIndex === 0) {
        app.getRecentDocs();
      }
      console.log('onChange is triggered', tabIndex);
      console.log('editmode', app.editmode)
      if (!app.editmode) {
        resetForms();
      }
      app.selectedTab = -1;
      app.editmode = false;
    },
    onSelect: (id) => {
      console.log('onSelect', id);
      app.spinning = true;
      ajax('getbyid', { cookie: app.cookie, id: id}, (err, data) => {
        console.log('ajax getbyid', err, data)
        app.spinning = false;
        if (err) {
          app.err = 'Failed to getbyid';
        } else {
          app.editmode = true;
          switch(data.collection) {
            case 'event': 
              app.selectedTab = 1;
              app.attended = data;
            break;
            case 'session':
              app.selectedTab = 2;
              app.presented = data;
            break;
            case 'blog':
              app.selectedTab = 3;
              app.blogged = data;
            break;
            case 'press':
              app.selectedTab = 4;
              app.press = data;
            break;
            case 'expense':
              app.selectedTab = 5;
              app.expense = data;
            break;

          }
          console.log(data);
        }
      });
    },
    getRecentDocs: () => {
      ajax('userdocs', { cookie: app.cookie}, (err, data) => {
        console.log('ajax userdocs', err, data)
        if (err) {
          app.err = 'Failed to retrieve recent user docs';
        } else {
          app.recent = [];
          for(var i in data.rows) {
            app.recent.push(data.rows[i].doc);
          }
        }
      });
    },
    onDelete: (id, rev) => {
      console.log('on delete', id, rev);
      ajax('deletebyid', { cookie: app.cookie, id: id, rev: rev}, (err, data) => {
        console.log('ajax deletebyid', err, data)
        if (err) {
          app.err = 'Failed to delete document';
        } else {
          app.msg = 'Document deleted';
          app.$refs.snackbar.open();
          app.selectedTab = 0;
        }
      });
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
          app.selectedTab = 0;
        }

      });
    },
    logout: () => {
      console.log('logout');
       clearCookies();
       app.cookie = '';
       app.gotit = false;
    }
  }
})