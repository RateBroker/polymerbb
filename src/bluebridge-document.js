Polymer({
    is: 'bluebridge-document',

    properties: {
        collection: {
            type: String,
            observer: '_collectionChanged',
        },
        docId: {
            type: String,
            value: null,
            observer: '_idChanged',
            notify: true,
            reflectToAttribute: true,
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
            reflectToAttribute: true,
        },
        loaded: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
        },
        validating: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
        },
        valid: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
        },
        invalid: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
        },
        errors: {
            type: Array,
            value: [],
        },
        autoSave: {
            type: Boolean,
            value: false,
            notify: true,
        },
        saving: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
        },
        saved: {
            type: Boolean,
            value: false,
            reflectToAttribute: true,
        },
    },

    observers: [
        'queryChanged(query.*)'
    ],

    queryChanged: function (query) {
        this.reload();
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
    _idChanged: function (docId, oldDocId) {
        if (!this.data) {
            this.reload();
            return;
        }
        if (docId != this.data._id) {
            this.reload();
            return;
        }
    },
    _collectionChanged: function (collection, oldCollection) {
        if (!oldCollection) {
            this.reload();
        }
    },
    _dataChanged: function (data) {
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

    reload: function () {
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

        return documentPromise
            .then(doc => {
                if (!doc && this.ensureExists) {
                    return bluebridge.create(this.collection, this.defaults);
                }
                return Promise.resolve(doc);
            })
            .then(doc => {
                this.set('notFound', !!doc);
                this.set('loading', false);
                this.set('loaded', true);
                this.set('data', doc);
            })
            .catch(err => {
                console.error(err);
                console.error(this.docId);
            });
    },

    save: function (extraData) {

        this.set('saving', true);
        this.set('saved', false);

        return this.validate()
            .then(() => bluebridge.save(this.collection, this.docId, Object.assign({}, extraData, this.data)))
            .then(data => {
                this.set('saving', false);
                this.set('saved', true);
                this.set('docId', data._id);
                this.set('data', data);
                return this.data;
            });
    },

    validate: function () {
        this.set('validating', true);
        return bluebridge.validate(this.collection, this.docId, this.data)
            .then((errors) => {
                this.set('validating', false);
                if (errors) {
                    this.set('valid', false);
                    this.set('invalid', true);
                    this.set('errors', errors);
                    return Promise.reject(errors);
                } else {
                    this.set('valid', true);
                    this.set('invalid', false);
                    this.set('errors', []);
                    return Promise.resolve();
                }
            });
    },

    method: function (methodName) {
        return bluebridge.method(this.collection, this.docId, methodName);
    },

    static: function (staticName) {
        return bluebridge.static(this.collection, staticName);
    }
});