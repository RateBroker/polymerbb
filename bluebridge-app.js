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

    _firebaseUidChanged: function _firebaseUidChanged(uid) {
        var _this2 = this;

        if (uid !== undefined && !uid) {
            firebase.auth().signInAnonymously();
            return;
        }

        if (firebase.auth().currentUser) {
            firebase.auth().currentUser.getToken(true).then(function (token) {
                _this2.firebaseToken = token;
            });
        } else {
            this.firebaseToken = null;
        }
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