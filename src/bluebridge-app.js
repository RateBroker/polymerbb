
Polymer({

    is: 'bluebridge-app',

    properties: {
        endpoint: String,

        firebaseAuth: Boolean,
        firebaseAuthDomain: String,
        firebaseDatabaseUrl: String,
        firebaseApiKey: String,

        firebaseStatusKnown: Boolean,
        firebaseUser: {
          type: Object,
          notify: true
        },
        firebaseToken: {
            type: String,
            observer: '_firebaseTokenChanged'
        },
        bluebridgeStatusKnown: {
            type: Boolean,
            value: false,
            notify: true
        },
        app: {
            type: Object,
            computed: '_init(endpoint)',
        },

        userQuery: {
            type: Object,
            computed: '_computeUserQuery(firebaseUser.uid)'
        },
        userId: {
            type: String
        },
        bluebridgeUser: {
            type: Object,
            notify: true
        }
    },

    observers: [
      '_firebaseUidChanged(firebaseUser.uid)'
    ],

    _init: function (endpoint) {
        bluebridge.initialize({ endpoint: endpoint });
        bluebridge.on('ready', () => {
          this.set('bluebridgeStatusKnown', true);
        });
        return bluebridge;
    },

    _firebaseUidChanged: function (uid) {
      if (!firebase.auth().currentUser) {
          this.firebaseToken = null;
          return;
      }

      firebase.auth().currentUser
          .getToken(true)
          .then((token) => {
              this.firebaseToken = token;
          });
    },

    _firebaseTokenChanged: function (firebaseToken) {
        bluebridge.auth('firebase', firebaseToken);
    },

    _computeUserQuery: function (uid) {
      if (!uid) {
          return null;
      }
      return { uid: uid };
    }

});
