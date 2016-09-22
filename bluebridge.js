'use strict';

const rpcClient = require('socket.io-rpc-client');
const EventEmitter = require('event-emitter-es6');

/**
 * Provides client side bindings to serverside bluebridge RPC methods
 */
class BlueBridge extends EventEmitter {

  constructor () {
    super();
    this.ready = false;
    this.emit('unready');
  }

  auth (type, opts) {
    return this.rpc('auth.' + type)(opts);
  }

  create(collection, data = {}) {
    return this.rpc(collection + '.create')(data)
  }

  find (collection, query) {
    return this.rpc(collection + '.find')(query);
  }

  findById (collection, id) {
    return this.rpc(collection + '.findById')(id)
  }

  findOne (collection, query) {
    return this.rpc(collection + '.findOne')(query)
  }

  save (collection, documentId, data) {
    return this.rpc(collection + '.save')(documentId, data);
  }

  validate (collection, documentId, data) {
    return this.rpc(collection + '.validate')(documentId, data);
  }

  method (collection, documentId, methodName) {
    return this.rpc(collection + '.methods.' + methodName).bind(this.rpc, documentId);
  }

  static (collection, staticName) {
    return this.rpc(collection + '.statics.' + staticName);
  }

  initialize (data) {
    this.ready = false;
    this.emit('unready');
    this.rpc = rpcClient(data.endpoint, data.authToken);
    this.rpc.socket.once('auth', () => {
      this.ready = true;
      this.emit('ready');
    });
  }
}

window.bluebridge = new BlueBridge();
