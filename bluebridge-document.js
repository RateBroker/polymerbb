'use strict';

Polymer({
    is: 'bluebridge-document',

    properties: {
        collection: {
            type: String,
            observer: '_collectionChanged'
        },
        docId: {
            type: String,
            value: null,
            observer: '_idChanged',
            notify: true,
            reflectToAttribute: true
        },

        ensureExists: {
            type: Boolean
        },

        defaults: {
            type: Object,
            value: {}
        },

        query: {
            type: Object
        },
        data: {
            type: Object,
            notify: true,
            observer: '_dataChanged',
            value: {}
        },
        loading: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
        loaded: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
        validating: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
        valid: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
        invalid: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
        errors: {
            type: Array,
            value: []
        },
        autoSave: {
            type: Boolean,
            value: false,
            notify: true
        },
        saving: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        },
        saved: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
        }
    },

    observers: ['queryChanged(query.*)'],

    queryChanged: function queryChanged(query) {
        this.reload();
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
    _idChanged: function _idChanged(docId, oldDocId) {
        if (!this.data) {
            this.reload();
            return;
        }
        if (docId != this.data._id) {
            this.reload();
            return;
        }
    },
    _collectionChanged: function _collectionChanged(collection, oldCollection) {
        if (!oldCollection) {
            this.reload();
        }
    },
    _dataChanged: function _dataChanged(data) {
        this.fire('updated');

        if (this.autoSave) {
            return this.save();
        }
        if (data && data._id && this.docId !== data._id) {
            this.set('docId', data._id);
            return;
        }

        return Promise.resolve();
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

        var documentPromise;

        if (this.docId) {
            documentPromise = bluebridge.findById(this.collection, this.docId);
        } else if (this.query) {
            documentPromise = bluebridge.findOne(this.collection, this.query);
        } else {
            if (this.ensureExists && this.docId === undefined && this.query === undefined) {
                console.warn('doc-id and query attributes are both undefined');
            }

            documentPromise = Promise.resolve(null);
        }

        return documentPromise.then(function (doc) {
            if (!doc && _this.ensureExists) {
                return bluebridge.create(_this.collection, _this.defaults);
            }
            return Promise.resolve(doc);
        }).then(function (doc) {
            _this.set('notFound', !!doc);
            _this.set('loading', false);
            _this.set('loaded', true);
            _this.set('data', doc);
        }).catch(function (err) {
            console.error(err);
            console.error(_this.docId);
        });
    },

    save: function save(extraData) {
        var _this2 = this;

        this.set('saving', true);
        this.set('saved', false);

        return this.validate().then(function () {
            return bluebridge.save(_this2.collection, _this2.docId, Object.assign({}, extraData, _this2.data));
        }).then(function (data) {
            _this2.set('saving', false);
            _this2.set('saved', true);
            _this2.set('docId', data._id);
            _this2.set('data', data);
            return _this2.data;
        });
    },

    validate: function validate() {
        var _this3 = this;

        this.set('validating', true);
        return bluebridge.validate(this.collection, this.docId, this.data).then(function (errors) {
            _this3.set('validating', false);
            if (errors) {
                _this3.set('valid', false);
                _this3.set('invalid', true);
                _this3.set('errors', errors);
                return Promise.reject(errors);
            } else {
                _this3.set('valid', true);
                _this3.set('invalid', false);
                _this3.set('errors', []);
                return Promise.resolve();
            }
        });
    },

    method: function method(methodName) {
        return bluebridge.method(this.collection, this.docId, methodName);
    },

    static: function _static(staticName) {
        return bluebridge.static(this.collection, staticName);
    }
});