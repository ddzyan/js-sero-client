'use strict'

const ffi = require('ffi')
const ref = require('ref')
const utils = require('./utils.js')
const base58 = require('bs58')

let czero = undefined;

function ReportError (msg) {
  throw new Error(msg || 'Assertion failed')
}

const cVoid = ref.types.void
const cUchar = ref.types.uchar
const cChar = ref.types.char
const cBytes = ref.refType(cUchar)

function NewBytesBuffer (len) {
  var buf = utils.AllocBuffer(len)
  buf.type = cBytes
  return buf
}

function NewBytesBufferFromBase58 (str) {
  var bufDec = base58.decode(str)
  var buf = utils.AllocBuffer(bufDec.length, bufDec)
  buf.type = cBytes
  return buf
}

function InitCZero () {
  if (czero === undefined) {
    var p = utils.GetBinPath()
    czero = ffi.Library(
      p.libczero_dir,
      {
        'zero_init_no_circuit': [cVoid, []],
        'zero_random32': [cVoid, [cBytes]],
        'zero_seed2sk': [cVoid, [cBytes, cBytes]],
        'zero_sk2tk': [cVoid, [cBytes, cBytes]],
        'zero_tk2pk': [cVoid, [cBytes, cBytes]],
        'zero_pk2pkr': [cVoid, [cBytes, cBytes, cBytes]],
        'zero_pk_valid': [cChar, [cBytes]],
        'zero_pkr_valid': [cChar, [cBytes]],
        'zero_ismy_pkr': [cChar, [cBytes, cBytes]]
      }
    )
    czero.p = p
    czero.zero_init_no_circuit()
    czero.RandomU32 = function () {
      var buf = NewBytesBuffer(32)
      czero.zero_random32(buf)
      return buf
    }
  } else {
    return czero
  }
  return czero
}

module.exports = {
  czero:InitCZero(),
  NewBytesBuffer,
  NewBytesBufferFromBase58,
  ReportError
}
