/**
 * @fileoverview Handels the pairing and communication with Bluetooth devices.
 *
 * @license Copyright 2015 The Coding with Chrome Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author mbordihn@google.com (Markus Bordihn)
 */
goog.provide('cwc.protocol.bluetooth.Api');

goog.require('cwc.protocol.bluetooth.Adapter');
goog.require('cwc.protocol.bluetooth.Devices');
goog.require('cwc.protocol.bluetooth.Events');
goog.require('cwc.utils.Logger');

goog.require('goog.events.EventTarget');


/**
 * @param {!cwc.utils.Helper} helper
 * @constructor
 * @struct
 * @final
 */
cwc.protocol.bluetooth.Api = function(helper) {
  /** @type {string} */
  this.name = 'Bluetooth';

  /** @type {!cwc.utils.Helper} */
  this.helper = helper;

  /** @type {boolean} */
  this.enabled = false;

  /** @type {boolean} */
  this.prepared = false;

  /** @type {cwc.protocol.bluetooth.Devices} */
  this.devices = null;

  /** @type {Object} */
  this.connectionIds = {};

  /** @private {!boolean} */
  this.isChromeApp_ = this.helper.checkChromeFeature('app');

  /** @private {chrome.bluetooth} */
  this.bluetooth_ = this.isChromeApp_ && chrome.bluetooth;

  /** @private {!chrome.bluetoothSocket} */
  this.bluetoothSocket_ = this.isChromeApp_ && chrome.bluetoothSocket;

  /** @private {cwc.protocol.bluetooth.Adapter} */
  this.adapter_ = null;

  /** @private {!goog.events.EventTarget} */
  this.eventHandler_ = new goog.events.EventTarget();

  /** @private {!cwc.utils.Logger} */
  this.log_ = new cwc.utils.Logger(this.name);
};


/**
 * Prepares the bluetooth api and monitors Bluetooth adapter.
 */
cwc.protocol.bluetooth.Api.prototype.prepare = function() {
  if (!this.bluetooth_) {
    console.warn('Bluetooth 2.0 support is not available!');
    return;
  }
  if (this.prepared) {
    return;
  }

  this.log_.debug('Preparing Bluetooth 2.0 support...');

  // Monitor Bluetooth adapter
  goog.events.listen(this.eventHandler_,
    cwc.protocol.bluetooth.Events.Type.ADAPTER_STATE_CHANGE,
    this.updateDevices, false, this);
  this.adapter_ = new cwc.protocol.bluetooth.Adapter(this.bluetooth_,
    this.eventHandler_);
  this.adapter_.prepare();

  // Monitor Bluetooth devices
  this.devices = new cwc.protocol.bluetooth.Devices(this.bluetooth_,
    this.eventHandler_);
  this.devices.prepare();

  // Monitor Bluetooth sockets
  this.addEventListener_();
  this.prepared = true;
};


/**
 * @export
 */
cwc.protocol.bluetooth.Api.prototype.updateDevices = function() {
  if (this.devices) {
    this.devices.updateDevices();
  }
};


/**
 * @param {!string} address
 * @return {cwc.protocol.bluetooth.Device}
 * @export
 */
cwc.protocol.bluetooth.Api.prototype.getDevice = function(address) {
  if (this.devices) {
    return this.devices.getDevice(address);
  }
  return null;
};


/**
 * @param {!string} name
 * @return {cwc.protocol.bluetooth.Device}
 * @export
 */
cwc.protocol.bluetooth.Api.prototype.getDeviceByName = function(name) {
  if (this.devices) {
    return this.devices.getDeviceByName(name);
  }
  return null;
};


/**
 * @return {Object}
 * @export
 */
cwc.protocol.bluetooth.Api.prototype.getDevices = function() {
  if (this.devices) {
    return this.devices.getDevices();
  }
  return null;
};


/**
 * @return {!goog.events.EventTarget}
 */
cwc.protocol.bluetooth.Api.prototype.getEventHandler = function() {
  return this.eventHandler_;
};


/**
 * @param {!string} device_name
 * @param {Function} callback
 * @param {boolean=} opt_multisearch
 * @export
 */
cwc.protocol.bluetooth.Api.prototype.autoConnectDevice = function(device_name,
    callback, opt_multisearch) {
  if (this.devices) {
    this.devices.autoConnectDevice(device_name, callback, opt_multisearch);
  }
};


/**
 * @export
 */
cwc.protocol.bluetooth.Api.prototype.updateAdapterState = function() {
  if (this.adapter_) {
    this.adapter_.updateAdapterState();
  }
};


/**
 * @export
 */
cwc.protocol.bluetooth.Api.prototype.closeSockets = function() {
  if (this.devices) {
    this.devices.closeSockets();
  }
};


/**
 * Adds the different types of event listener to device.
 * @private
 */
cwc.protocol.bluetooth.Api.prototype.addEventListener_ = function() {
  this.bluetoothSocket_.onReceive.addListener(
      this.handleOnReceive_.bind(this));
  this.bluetoothSocket_.onReceiveError.addListener(
      this.handleOnReceiveError_.bind(this));
};


/**
 * @param {Object} info
 * @private
 */
cwc.protocol.bluetooth.Api.prototype.handleOnReceive_ = function(info) {
  this.devices.receiveData(info['socketId'], info['data']);
};


/**
 * @param {Object} info
 * @private
 */
cwc.protocol.bluetooth.Api.prototype.handleOnReceiveError_ = function(
    info) {
  this.devices.receiveError(info['socketId'], info['error']);
};
