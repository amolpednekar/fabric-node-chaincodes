/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const shim = require('fabric-shim');
const util = require('util');
const ClientIdentity = require('fabric-shim').ClientIdentity;

let Chaincode = class {

  async Init(stub) {
    console.info('=========== Instantiated fabcar chaincode ===========');
    let cid = new ClientIdentity(stub)
    console.info("Id", cid.getID())
    console.info("MspId", cid.getMSPID())
    console.info("x509cert", cid.getX509Certificate())
    return shim.success();
  }

  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async queryCar(stub, args) {
    if (args.length != 1) {
      throw new Error('Incorrect number of arguments. Expecting CarNumber ex: CAR01');
    }
    let carNumber = args[0];

    let carAsBytes = await stub.getState(carNumber); //get the car from chaincode state
    if (!carAsBytes || carAsBytes.toString().length <= 0) {
      throw new Error(carNumber + ' does not exist: ');
    }
    console.log(carAsBytes.toString());
    return carAsBytes;
  }

  async getMspId(stub, args){
    let cid = new ClientIdentity(stub);
    console.info("Id", cid.getID())
    console.info("MspId", cid.getMSPID())
  }

  async getX509Certificate(stub, args){
    let cid = new ClientIdentity(stub);
    console.info("x509cert", cid.getX509Certificate())
  }
 
};

shim.start(new Chaincode());
