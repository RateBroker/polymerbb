Polymer({

    is: 'bluebridge-query',

    properties: {
        collection: {
            type: String,
            observer: '_collectionChanged',
        },
        query: {
            type: Object,
            observer: '_queryChanged',
            notify: true,
        },
        results: {
            type: Array,
            notify: true,
            value: [],
        },
        loading: {
            type: Boolean,
        },
    },

    ready: function () {
        if (bluebridge.ready) {
            this.bluebridgeReady();
        } else {
            bluebridge.once('ready', this.bluebridgeReady.bind(this));
        }
    },

    bluebridgeReady: function () {
        bluebridge.rpc.socket.on('connect', this.reload.bind(this));
        bluebridge.rpc.socket.on('auth', this.reload.bind(this));
        bluebridge.rpc.socket.on('deauth', this.reload.bind(this));
        bluebridge.rpc.socket.on('disconnect', this.reload.bind(this));
        this.reload();
    },

    _collectionChanged: function (collection) {
        this.reload();
    },

    _queryChanged: function (query) {
        this.reload();
    },

    reload: function () {
        if (!this.collection) {
            return;
        }

        if (!bluebridge.ready) {
            bluebridge.once('ready', this.reload.bind(this));
            return;
        }

        this.set('loading', true);
        this.set('loaded', false);
        bluebridge.find(this.collection, this.query)
            .then((results) => {
                this.set('loading', false);
                this.set('loaded', true);
                this.set('results', results);
            });
    },

    static: function (staticName) {
        return bluebridge.static(this.collection, staticName);
    },

});