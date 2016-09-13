'use strict';

const rpcClient = require('socket.io-rpc-client');

/**
 * Provides client side bindings to serverside bluebridge RPC methods
 */
class BlueBridge {

  constructor () { }

  auth (type, opts) {
    return this.rpc('auth.' + type)(opts);
  }

  query (collection, qry) {
    return this.rpc(collection + '.query')(qry);
  }

  create(collection) {
    return this.rpc(collection + '.create')()
  }

  document (collection, documentId) {
    return this.rpc(collection + '.document')(documentId)
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
    this.rpc = rpcClient(data.endpoint, data.authToken);
  }
}

window.bluebridge = new BlueBridge();
