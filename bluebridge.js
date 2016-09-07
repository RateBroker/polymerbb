'use strict';

const rpcClient = require('socket.io-rpc-client');

/**
 * Provides client side bindings to serverside bluebridge RPC methods
 */
class BlueBridge {

  constructor (endpoint) {
    this.rpc = rpcClient(endpoint)
  }

  query (collection, qry) {
    return this.rpc(collection + '.query')(qry);
  }

  document (collection, documentId) {
    return this.rpc(collection + '.document')(documentId)
  }

  saveDocument (collection, documentId, data) {
    return this.rpc(collection + '.saveDocument')(documentId, data);
  }

  validateDocument (collection, documentId, data) {
    return this.rpc(collection + '.validateDocument')(documentId, data);
  }
}

window.BlueBridge = BlueBridge;
