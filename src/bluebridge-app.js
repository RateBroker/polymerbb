
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
        },
        // bluebridgeUserDocument: {
        //   type: Object,
        //   value: function () {
        //     return this.$.userDocument
        //   }
        // }
    },

    observers: [
      '_firebaseUidChanged(firebaseUser.uid)'
    ],

    saveUser: function () {
      return this.$.userDocument.save();
    },

    _init: function (endpoint) {
        bluebridge.initialize({ endpoint: endpoint });
        bluebridge.on('ready', () => {
          this.set('bluebridgeStatusKnown', true);
        });
        return bluebridge;
    },

    _firebaseUidChanged: function (uid) {
      if (uid !== undefined && !uid) {
        firebase.auth().signInAnonymously();
        return;
      }

      if (firebase.auth().currentUser) {
        firebase.auth().currentUser
            .getToken(true)
            .then((token) => {
                this.firebaseToken = token;
            });
      } else {
        this.firebaseToken = null;
      }
    },

    _firebaseTokenChanged: function (firebaseToken) {
        bluebridge.auth('firebase', firebaseToken);
    },

    _computeUserQuery: function (uid) {
      console.log('computing user query for uid: ', uid);
      if (!uid) {
          return undefined;
      }
      return { uid: uid };
    }

});
