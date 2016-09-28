'use strict';

Polymer({

    is: 'bluebridge-query',

    properties: {
        collection: {
            type: String,
            observer: '_collectionChanged'
        },
        query: {
            type: Object,
            observer: '_queryChanged',
            notify: true
        },
        results: {
            type: Array,
            notify: true,
            value: []
        },
        loading: {
            type: Boolean
        }
    },

    ready: function ready() {
        if (bluebridge.ready) {
            this.bluebridgeReady();
        } else {
            bluebridge.once('ready', this.bluebridgeReady.bind(this));
        }
    },

    bluebridgeReady: function bluebridgeReady() {
        bluebridge.rpc.socket.on('connect', this.reload.bind(this));
        bluebridge.rpc.socket.on('auth', this.reload.bind(this));
        bluebridge.rpc.socket.on('deauth', this.reload.bind(this));
        bluebridge.rpc.socket.on('disconnect', this.reload.bind(this));
        this.reload();
    },

    _collectionChanged: function _collectionChanged(collection) {
        this.reload();
    },

    _queryChanged: function _queryChanged(query) {
        this.reload();
    },

    reload: function reload() {
        var _this = this;

        if (!this.collection) {
            return;
        }

        if (!bluebridge.ready) {
            bluebridge.once('ready', this.reload.bind(this));
            return;
        }

        this.set('loading', true);
        this.set('loaded', false);
        bluebridge.find(this.collection, this.query).then(function (results) {
            _this.set('loading', false);
            _this.set('loaded', true);
            _this.set('results', results);
        });
    },

    static: function _static(staticName) {
        return bluebridge.static(this.collection, staticName);
    }

});