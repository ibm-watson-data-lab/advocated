Vue.use(VueMaterial) 

const app = new Vue({
  el: '#app',
  data: {
    userDisplayName: '',
    userid: '',
    spinning: false,
    editmode: false,
    selectedTab: 0,
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
    cookie: '',
    marker: null,
    map: null
  },
  mounted: function() {
    return;
    var jar = getCookies();
    if (jar && jar.advocatedtoken) {
      this.cookie = jar.advocatedtoken;
      this.spinning = true;
      ajax('verify', { cookie: this.cookie}, (err, data) => {
        this.spinning = false;
        console.log('ajax verify', err, data)
        if (!err) {
          this.userid = data.userid;
          this.userDisplayName = data.userDisplayName;

          // create map
          var opts =  {
            touchZoom: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false,
            center: [45.7818, -40.6787],
            minZoom: 2,
            zoom: 3,
            dragging: false,
            zoomControl: false
          }
          this.map = L.map('mapid', opts);
          L.tileLayer( 'http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(this.map);
          this.map.on('locationfound', (ev) => {
            console.log('locationfound',ev.longitude, ev.latitude);
            app.attended.longitude = ev.longitude;
            app.attended.latitude = ev.latitude;
            app.drawPin();
          });
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
    locate: (e) => {
      e.preventDefault();
      app.map.locate();
    },
    drawPin: () => {
      try {
        console.log( app.attended.longitude, app.attended.latitude);
        var long = (typeof app.attended.longitude ==='string')? parseFloat(app.attended.longitude): app.attended.longitude;
        var lat = (typeof app.attended.latitude ==='string')? parseFloat(app.attended.latitude): app.attended.latitude;
        if (isNaN(lat) || isNaN(long)) {
          return;
        }
        console.log('parsed', lat,long);
        if (app.marker) {
          app.map.removeLayer(app.marker);
        }
        app.marker = L.marker(L.latLng(lat,long)).addTo(app.map);
       /* 
        if (zoom) {
          map.setView(new L.LatLng(lat, long), zoom);
        }
        else {
          map.setView(new L.LatLng(lat, long));
        }*/
      } catch(e) {
        console.log(e);
      }
    },
    resetForms: () => {
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
      app.expense._id = app.expense._rev = app.expense.title = app.expense.description = app.expense.tags = app.expense.comments = app.expense.event = '';
    },
    onChangeTab: (tabIndex) => {
      if (tabIndex == 0) return;
      app.selectedTab = tabIndex;
      if (tabIndex === 3 || tabIndex === 6) {
        app.spinning = true;
        ajax('userevents', { cookie: app.cookie}, function(err, data) {
          app.spinning = false;
          console.log('ajax userevents', err, data)
          if (err) {
            //this.err = 'Failed to retrieve user events';
          } else {
            app.events = data.rows;
          }
        });
      } else if (tabIndex === 1) {
        app.getRecentDocs();
      } else if (tabIndex === 7) {
        console.log('report!!!!');
        ajax('userdocsbymonth', {cookie:app.cookie}, (err, data) => { 
          console.log(err, data);
          var vizdata = [];
          var starty = data.rows[0].key[1];
          var startm = data.rows[0].key[2];
          for(var i in data.rows) {
            var d = data.rows[i];
            var ym = d.key[1] + '-' + d.key[2];
            var k = d.key[3];
            var v = d.value;
            var index = null;
            for(var j in vizdata) {
              if (vizdata[j].key === ym) {
                index = j;
              }
            }
            if (!index) {
              var obj = {
                key: ym,
                value: { }
              };
              vizdata.push(obj);
              index = vizdata.length - 1;
            }
            vizdata[index].value[k] = v;
          }
          console.log(vizdata);

          SimpleDataVis(vizdata)
            .attr('type', 'stacked-bar-chart')
            .render('#reportchart')
        });
      }
      console.log('onChange is triggered', tabIndex);
      console.log('editmode', app.editmode)
      if (!app.editmode) {
        console.log('resetting the form')
        app.resetForms();
      }
     
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
              app.selectedTab = 2;
              app.attended = data;
            break;
            case 'session':
              app.selectedTab = 3;
              app.presented = data;
            break;
            case 'blog':
              app.selectedTab = 4;
              app.blogged = data;
            break;
            case 'press':
              app.selectedTab = 5;
              app.press = data;
            break;
            case 'expense':
              app.selectedTab = 6;
              app.expense = data;
            break;

          }
          console.log(data);
        }
      });
    },
    getRecentDocs: () => {
      app.spinning = true;
      ajax('userdocs', { cookie: app.cookie}, (err, data) => {
        app.spinning = false;
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
      app.spinning = true;
      console.log('on delete', id, rev);
      ajax('deletebyid', { cookie: app.cookie, id: id, rev: rev}, (err, data) => {
        app.spinning = false;
        console.log('ajax deletebyid', err, data)
        if (err) {
          app.err = 'Failed to delete document';
        } else {
          app.msg = 'Document deleted';
          app.$refs.snackbar.open();
          app.selectedTab = 1;
        }
      });
    },
    submitForm: (doc) => {

      // add auth information
      doc.cookie = app.cookie;

      // submit to serverless action
      app.spinning = true;
      ajax('submit', doc, function(err, data) {
        app.spinning = false;
        console.log('ajax submit', err, data)
        if (err) {
          this.err = 'Failed to save record';
        } else {
          doc._id = data.id;
          doc._rev = data.rev;
          app.msg = 'Thank you for advocating!';
          app.$refs.snackbar.open();
          app.selectedTab = 1;
        }

      });
    },
    logout: () => {
      console.log('logout');
       clearCookies();
       app.cookie = '';
    }
  }
})