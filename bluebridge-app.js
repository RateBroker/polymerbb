'use strict';

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

    _init: function _init(endpoint) {
        var _this = this;

        bluebridge.initialize({ endpoint: endpoint });
        bluebridge.on('ready', function () {
            _this.set('bluebridgeStatusKnown', true);
        });
        return bluebridge;
    },

    _setInternalFirebaseToken: function _setInternalFirebaseToken(user) {
        var _this2 = this;

        if (!user) {
            this.firebaseToken = null;
            return Promise.reject('No user specified to set internal token with');
        }

        return user.getToken(true).then(function (token) {
            _this2.firebaseToken = token;
            return Promise.resolve(user);
        });
    },

    _firebaseUidChanged: function _firebaseUidChanged(uid) {
        var promise = null;

        if (uid === undefined || !uid) {
            promise = firebase.auth().signInAnonymously()
            //.then(this._setInternalFirebaseToken.bind(this))
            .catch(function (err) {
                return Promise.reject('Failed to sign in anonymously ' + err);
            });
        } else {
            promise = this._setInternalFirebaseToken(firebase.auth().currentUser);
        }

        promise.then(function (user) {
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