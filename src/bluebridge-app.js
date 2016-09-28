
Polymer({

    is: 'bluebridge-app',

    properties: {
        endpoint: String,
        firebaseStatusKnown: Boolean,
        firebaseUser: Object,
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
            computed: '_init(endpoint, firebaseStatusKnown)',
            observer: '_bluebridgeChanged'
        }
    },

    _init: function (endpoint, firebaseStatusKnown) {
        if (!endpoint || !firebaseStatusKnown) {
            return null;
        }
        bluebridge.initialize({ endpoint: endpoint });
        bluebridge.on('ready', () => {
            this.bluebridgeStatusKnown = true;
        });
        bluebridge.on('unready', () => {
            this.bluebridgeStatusKnown = true;
        });
        return bluebridge;
    },

    _bluebridgeChanged: function (bluebridge) {
        if (bluebridge) {
            this._getFirebaseToken();
        }
    },

    _getFirebaseToken: function () {
        if (!firebase.auth().currentUser) {
            this.firebaseToken = null;
            firebase.auth().signInAnonymously();
            return;
        }

        firebase.auth().currentUser
            .getToken(true)
            .then((token) => {
                this.firebaseToken = token;
            });
    },

    _firebaseTokenChanged: function (firebaseToken) {
        this.app.auth('firebase', firebaseToken);
    }

});