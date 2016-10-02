
Polymer({

    is: 'bluebridge-app',

    properties: {
        endpoint: String,

        firebaseAuth: Boolean,
        firebaseAuthDomain: String,
        firebaseDatabaseUrl: String,
        firebaseApiKey: String,

        firebaseStatusKnown: {
            type: Boolean,
            observer: '_firebaseStatusKnownChanged'
        },

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

    _setDisplayName: function (user, userData) {
        return user
            .updateProfile({ displayName: `${userData.first_name} ${userData.last_name}` })
            .then(() => Promise.resolve(user));
    },

    _sendVerificationEmail: function (user) {
        return user.sendEmailVerification().then(() => Promise.resolve(user));
    },

    _createNewUser: function (newUser) {
        let auth = firebase.auth();
        let currentUser = auth.currentUser;

        let migrate = this.$.userDocument.method('migrate');
        
        return currentUser.getToken(true)
        .then(sourceUserToken => {
            return auth.createUserWithEmailAndPassword(newUser.email, newUser.password)
            .then((user) => {
                return user.getToken(true)
                .then(newUserToken => migrate(newUserToken, sourceUserToken))
                .then(() => Promise.resolve(user));
            });
        });
    },

    registerUser: function (password) {
        let userData = Object.assign({}, this.$.userDocument.data);

        return this.$.userDocument.save()
            .then(() => this._createNewUser({ email: userData.email, password: password }))
            .then((user) => this._setDisplayName(user, userData))
            .then((user) => this._sendVerificationEmail(user));
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

    _firebaseStatusKnownChanged: function (newStatus) {
        if (newStatus) {
            console.log('[bluebridge-app] Firebase is ready for action');
            
            let currentUser = firebase.auth().currentUser;

            if (currentUser) {
                this._setInternalFirebaseToken(currentUser);
            } else {
                firebase.auth().signInAnonymously();
            }
        }
    },

    _firebaseUidChanged: function (uid) {
      // No point checking uid if firebase isn't even available
      // for us to check
      if (!this.firebaseStatusKnown) {
          console.warn('[bluebridge-app] Firebase not ready when UID changed')
          return;
      }

      if (!uid) {
          console.warn('[bluebridge-app] Changed to having no uid');
          return;
      }

    //   if (uid === undefined || !uid) {
    //      // Anonymous sign-in will kick off a uid change, so we will
    //      // do nothing and that will retrigger this process
    //      return firebase.auth().signInAnonymously();
    //   }

      return this._setInternalFirebaseToken(firebase.auth().currentUser)
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
