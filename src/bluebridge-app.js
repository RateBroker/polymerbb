
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

    _setInternalFirebaseToken: function (user) {
        if (!user) {
            this.firebaseToken = null;
            return Promise.reject('No user specified to set internal token with');
        }

        return user.getToken(true).then(token => {
            this.firebaseToken = token;
            return Promise.resolve(user);
        });
    },

    _firebaseUidChanged: function (uid) {
      let promise = null
      
      if (uid === undefined || !uid) {
          promise = firebase.auth().signInAnonymously()
            .catch(err => Promise.reject(`Failed to sign in anonymously ${err}`));
      } else {
          promise = this._setInternalFirebaseToken(firebase.auth().currentUser);
      }

      promise
        .then(user => console.log('[bluebridge-app] Successfully set firebase token', user))
        .catch(err => console.error('[bluebridge-app] Could not assign firebase token', err));
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
