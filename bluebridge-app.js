'use strict';

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
            computed: '_init(endpoint)'
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

    observers: ['_firebaseUidChanged(firebaseUser.uid)'],

    saveUser: function saveUser() {
        return this.$.userDocument.save();
    },

    _setDisplayName: function _setDisplayName(user, userData) {
        return user.updateProfile({ displayName: userData.first_name + ' ' + userData.last_name }).then(function () {
            return Promise.resolve(user);
        });
    },

    _sendVerificationEmail: function _sendVerificationEmail(user) {
        return user.sendEmailVerification().then(function () {
            return Promise.resolve(user);
        });
    },

    _createNewUser: function _createNewUser(newUser) {
        var auth = firebase.auth();
        var currentUser = auth.currentUser;

        var migrate = this.$.userDocument.method('migrate');

        return currentUser.getToken(true).then(function (sourceUserToken) {
            return auth.createUserWithEmailAndPassword(newUser.email, newUser.password).then(function (user) {
                return user.getToken(true).then(function (newUserToken) {
                    return migrate(newUserToken, sourceUserToken);
                }).then(function () {
                    return Promise.resolve(user);
                });
            });
        });
    },

    registerUser: function registerUser(password) {
        var _this = this;

        var userData = Object.assign({}, this.$.userDocument.data);

        return this.$.userDocument.save().then(function () {
            return _this._createNewUser({ email: userData.email, password: password });
        }).then(function (user) {
            return _this._setDisplayName(user, userData);
        }).then(function (user) {
            return _this._sendVerificationEmail(user);
        });
    },

    _init: function _init(endpoint) {
        var _this2 = this;

        bluebridge.initialize({ endpoint: endpoint });
        bluebridge.on('ready', function () {
            _this2.set('bluebridgeStatusKnown', true);
        });
        return bluebridge;
    },

    _setInternalFirebaseToken: function _setInternalFirebaseToken(user) {
        var _this3 = this;

        if (!user) {
            this.firebaseToken = null;
            return Promise.reject('No user specified to set internal token with');
        }

        return user.getToken(true).then(function (token) {
            _this3.firebaseToken = token;
            return Promise.resolve(user);
        });
    },

    _firebaseStatusKnownChanged: function _firebaseStatusKnownChanged(newStatus) {
        if (newStatus) {
            console.log('[bluebridge-app] Firebase is ready for action');

            var currentUser = firebase.auth().currentUser;

            if (currentUser) {
                this._setInternalFirebaseToken(currentUser);
            } else {
                firebase.auth().signInAnonymously();
            }
        }
    },

    _firebaseUidChanged: function _firebaseUidChanged(uid) {
        // No point checking uid if firebase isn't even available
        // for us to check
        if (!this.firebaseStatusKnown) {
            console.warn('[bluebridge-app] Firebase not ready when UID changed');
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

        return this._setInternalFirebaseToken(firebase.auth().currentUser).then(function (user) {
            return console.log('[bluebridge-app] Successfully set firebase token', user);
        }).catch(function (err) {
            return console.error('[bluebridge-app] Could not assign firebase token', err);
        });
    },

    _firebaseTokenChanged: function _firebaseTokenChanged(firebaseToken) {
        bluebridge.auth('firebase', firebaseToken);
    },

    _computeUserQuery: function _computeUserQuery(uid) {
        console.log('computing user query for uid: ', uid);
        if (!uid) {
            return undefined;
        }
        return { uid: uid };
    }

});