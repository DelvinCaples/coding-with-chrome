/**
 * @fileoverview General-purpose ByteArray.
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
goog.provide('cwc.utils.ByteArray');
goog.provide('cwc.utils.ByteArrayTypes');


/**
 * @enum {!string}
 */
cwc.utils.ByteArrayTypes = {
  BYTE: 'byte',
  SHORT: 'short',
  INT: 'int',
  UINT: 'uint',
  UINT16: 'uint16',
  STR: 'str',
};


/**
 * @constructor
 * @param {string|number=} byteHeader
 * @param {string|number=} shortHeader
 * @param {string|number=} integerHeader
 * @param {string|number=} stringHeader
 * @final
 * @export
 */
cwc.utils.ByteArray = function(byteHeader = '', shortHeader = '',
    integerHeader = '', stringHeader = '') {
  /** @private {!Array} */
  this.data_ = [];

  /** @private {Object.<cwc.utils.ByteArrayTypes|string|number>} */
  this.headers_ = {};

  if (byteHeader) {
    this.setHeader(cwc.utils.ByteArrayTypes.BYTE, byteHeader);
  }

  if (shortHeader) {
    this.setHeader(cwc.utils.ByteArrayTypes.SHORT, shortHeader);
  }

  if (integerHeader) {
    this.setHeader(cwc.utils.ByteArrayTypes.INT, integerHeader);
  }

  if (stringHeader) {
    this.setHeader(cwc.utils.ByteArrayTypes.STR, stringHeader);
  }
};


/**
 * Writes a byte into the buffer.
 * @param {number} value
 * @param {number=} defaultValue
 * @export
 */
cwc.utils.ByteArray.prototype.writeByte = function(value, defaultValue = 0x00) {
  this.addHeader(cwc.utils.ByteArrayTypes.BYTE);
  this.write(value === undefined ? defaultValue : value);
};


/**
 * Writes a short into the buffer.
 * @param {number} value
 * @export
 */
cwc.utils.ByteArray.prototype.writeShort = function(value) {
  this.addHeader(cwc.utils.ByteArrayTypes.SHORT);
  this.write(value);
  this.write(value >> 8);
};


/**
 * Writes an integer into the buffer.
 * @param {number} value
 * @export
 */
cwc.utils.ByteArray.prototype.writeInt = function(value) {
  this.addHeader(cwc.utils.ByteArrayTypes.INT);
  this.write(value);
  this.write(value >> 8);
  this.write(value >> 16);
  this.write(value >> 24);
};


/**
 * Writes an unsigned integer into the buffer.
 * @param {number} value
 * @export
 */
cwc.utils.ByteArray.prototype.writeUInt = function(value) {
  this.addHeader(cwc.utils.ByteArrayTypes.UINT);
  this.write(value & 0xFF);
};


/**
 * Writes an unsigned 16bit integer into the buffer.
 * @param {number} value
 * @export
 */
cwc.utils.ByteArray.prototype.writeUInt16 = function(value) {
  this.addHeader(cwc.utils.ByteArrayTypes.UINT16);
  this.write(value >> 8);
  this.write(value & 0xFF);
};


/**
 * Writes a string into the buffer.
 * @param {string} value
 * @export
 */
cwc.utils.ByteArray.prototype.writeString = function(value) {
  this.addHeader(cwc.utils.ByteArrayTypes.STR);
  let valueLength = value.length;
  for (let i = 0; i < valueLength; i++) {
    this.write(value.charCodeAt(i));
  }
  this.write(0x00);
};


/**
 * @param {string|number} data
 * @export
 */
cwc.utils.ByteArray.prototype.write = function(data) {
  this.data_.push(data);
};


/**
 * @return {number}
 * @export
 */
cwc.utils.ByteArray.prototype.length = function() {
  return this.data_.length;
};


/**
 * @return {!Array}
 * @export
 */
cwc.utils.ByteArray.prototype.getData = function() {
  return this.data_;
};


/**
 * @export
 */
cwc.utils.ByteArray.prototype.clearData = function() {
  this.data_ = [];
};


/**
 * @param {cwc.utils.ByteArrayTypes} type
 * @export
 */
cwc.utils.ByteArray.prototype.addHeader = function(type) {
  if (this.hasHeader(type)) {
    this.write(this.headers_[type]);
  }
};


/**
 * @param {cwc.utils.ByteArrayTypes} type
 * @param {string|number} data
 * @export
 */
cwc.utils.ByteArray.prototype.setHeader = function(type, data) {
  this.headers_[type] = data;
};


/**
 * @param {cwc.utils.ByteArrayTypes} type
 * @return {boolean}
 * @export
 */
cwc.utils.ByteArray.prototype.hasHeader = function(type) {
  return type in this.headers_;
};


/**
 * @param {cwc.utils.ByteArrayTypes} type
 * @return {string|number}
 * @export
 */
cwc.utils.ByteArray.prototype.getHeader = function(type) {
  return this.headers_[type];
};
