'use strict';

const rpcClient = require('socket.io-rpc-client');

/**
 * Provides client side bindings to serverside bluebridge RPC methods
 */
class BlueBridge {

  constructor (endpoint, authToken) {
  }

  query (collection, qry) {
    return this.rpc(collection + '.query')(qry);
  }

  document (collection, documentId, isNew) {
    return this.rpc(collection + '.document')(documentId, isNew)
  }

  save (collection, documentId, data) {
    return this.rpc(collection + '.save')(documentId, data);
  }

  validate (collection, documentId, data) {
    return this.rpc(collection + '.validate')(documentId, data);
  }

  initialize (data) {
    if (this.rpc) {

    }
    this.rpc = rpcClient(data.endpoint, data.authToken);
  }

  destroy () {
    this.rpc.destroy();
  }
}

window.bluebridge = new BlueBridge();
