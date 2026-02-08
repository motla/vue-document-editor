/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 6262:
/***/ (function(__unused_webpack_module, exports) {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
// runtime helper for setting properties on components
// in a tree-shakable way
exports.A = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
        target[key] = val;
    }
    return target;
};


/***/ }),

/***/ 9306:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var isCallable = __webpack_require__(4901);
var tryToString = __webpack_require__(6823);

var $TypeError = TypeError;

// `Assert: IsCallable(argument) is true`
module.exports = function (argument) {
  if (isCallable(argument)) return argument;
  throw new $TypeError(tryToString(argument) + ' is not a function');
};


/***/ }),

/***/ 7080:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var has = (__webpack_require__(4402).has);

// Perform ? RequireInternalSlot(M, [[SetData]])
module.exports = function (it) {
  has(it);
  return it;
};


/***/ }),

/***/ 679:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var isPrototypeOf = __webpack_require__(1625);

var $TypeError = TypeError;

module.exports = function (it, Prototype) {
  if (isPrototypeOf(Prototype, it)) return it;
  throw new $TypeError('Incorrect invocation');
};


/***/ }),

/***/ 8551:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var isObject = __webpack_require__(34);

var $String = String;
var $TypeError = TypeError;

// `Assert: Type(argument) is Object`
module.exports = function (argument) {
  if (isObject(argument)) return argument;
  throw new $TypeError($String(argument) + ' is not an object');
};


/***/ }),

/***/ 9617:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var toIndexedObject = __webpack_require__(5397);
var toAbsoluteIndex = __webpack_require__(5610);
var lengthOfArrayLike = __webpack_require__(6198);

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = lengthOfArrayLike(O);
    if (length === 0) return !IS_INCLUDES && -1;
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el !== el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value !== value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),

/***/ 4527:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var DESCRIPTORS = __webpack_require__(3724);
var isArray = __webpack_require__(4376);

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Safari < 13 does not throw an error in this case
var SILENT_ON_NON_WRITABLE_LENGTH_SET = DESCRIPTORS && !function () {
  // makes no sense without proper strict mode support
  if (this !== undefined) return true;
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).length = 1;
  } catch (error) {
    return error instanceof TypeError;
  }
}();

module.exports = SILENT_ON_NON_WRITABLE_LENGTH_SET ? function (O, length) {
  if (isArray(O) && !getOwnPropertyDescriptor(O, 'length').writable) {
    throw new $TypeError('Cannot set read only .length');
  } return O.length = length;
} : function (O, length) {
  return O.length = length;
};


/***/ }),

/***/ 6319:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var anObject = __webpack_require__(8551);
var iteratorClose = __webpack_require__(9539);

// call something on iterator step with safe closing on error
module.exports = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose(iterator, 'throw', error);
  }
};


/***/ }),

/***/ 2195:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(9504);

var toString = uncurryThis({}.toString);
var stringSlice = uncurryThis(''.slice);

module.exports = function (it) {
  return stringSlice(toString(it), 8, -1);
};


/***/ }),

/***/ 6955:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var TO_STRING_TAG_SUPPORT = __webpack_require__(2140);
var isCallable = __webpack_require__(4901);
var classofRaw = __webpack_require__(2195);
var wellKnownSymbol = __webpack_require__(8227);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var $Object = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
};


/***/ }),

/***/ 7740:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var hasOwn = __webpack_require__(9297);
var ownKeys = __webpack_require__(5031);
var getOwnPropertyDescriptorModule = __webpack_require__(7347);
var definePropertyModule = __webpack_require__(4913);

module.exports = function (target, source, exceptions) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};


/***/ }),

/***/ 2211:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var fails = __webpack_require__(9039);

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});


/***/ }),

/***/ 2529:
/***/ (function(module) {


// `CreateIterResultObject` abstract operation
// https://tc39.es/ecma262/#sec-createiterresultobject
module.exports = function (value, done) {
  return { value: value, done: done };
};


/***/ }),

/***/ 6699:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var DESCRIPTORS = __webpack_require__(3724);
var definePropertyModule = __webpack_require__(4913);
var createPropertyDescriptor = __webpack_require__(6980);

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ 6980:
/***/ (function(module) {


module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ 4659:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var DESCRIPTORS = __webpack_require__(3724);
var definePropertyModule = __webpack_require__(4913);
var createPropertyDescriptor = __webpack_require__(6980);

module.exports = function (object, key, value) {
  if (DESCRIPTORS) definePropertyModule.f(object, key, createPropertyDescriptor(0, value));
  else object[key] = value;
};


/***/ }),

/***/ 2106:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var makeBuiltIn = __webpack_require__(283);
var defineProperty = __webpack_require__(4913);

module.exports = function (target, name, descriptor) {
  if (descriptor.get) makeBuiltIn(descriptor.get, name, { getter: true });
  if (descriptor.set) makeBuiltIn(descriptor.set, name, { setter: true });
  return defineProperty.f(target, name, descriptor);
};


/***/ }),

/***/ 6840:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var isCallable = __webpack_require__(4901);
var definePropertyModule = __webpack_require__(4913);
var makeBuiltIn = __webpack_require__(283);
var defineGlobalProperty = __webpack_require__(9433);

module.exports = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable(value)) makeBuiltIn(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else definePropertyModule.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};


/***/ }),

/***/ 6279:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var defineBuiltIn = __webpack_require__(6840);

module.exports = function (target, src, options) {
  for (var key in src) defineBuiltIn(target, key, src[key], options);
  return target;
};


/***/ }),

/***/ 9433:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var globalThis = __webpack_require__(4576);

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;

module.exports = function (key, value) {
  try {
    defineProperty(globalThis, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    globalThis[key] = value;
  } return value;
};


/***/ }),

/***/ 3724:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var fails = __webpack_require__(9039);

// Detect IE8's incomplete defineProperty implementation
module.exports = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
});


/***/ }),

/***/ 4055:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var globalThis = __webpack_require__(4576);
var isObject = __webpack_require__(34);

var document = globalThis.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),

/***/ 6837:
/***/ (function(module) {


var $TypeError = TypeError;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

module.exports = function (it) {
  if (it > MAX_SAFE_INTEGER) throw $TypeError('Maximum allowed index exceeded');
  return it;
};


/***/ }),

/***/ 8727:
/***/ (function(module) {


// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),

/***/ 2839:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var globalThis = __webpack_require__(4576);

var navigator = globalThis.navigator;
var userAgent = navigator && navigator.userAgent;

module.exports = userAgent ? String(userAgent) : '';


/***/ }),

/***/ 9519:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var globalThis = __webpack_require__(4576);
var userAgent = __webpack_require__(2839);

var process = globalThis.process;
var Deno = globalThis.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

module.exports = version;


/***/ }),

/***/ 6518:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var globalThis = __webpack_require__(4576);
var getOwnPropertyDescriptor = (__webpack_require__(7347).f);
var createNonEnumerableProperty = __webpack_require__(6699);
var defineBuiltIn = __webpack_require__(6840);
var defineGlobalProperty = __webpack_require__(9433);
var copyConstructorProperties = __webpack_require__(7740);
var isForced = __webpack_require__(2796);

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = globalThis;
  } else if (STATIC) {
    target = globalThis[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = globalThis[TARGET] && globalThis[TARGET].prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    defineBuiltIn(target, key, sourceProperty, options);
  }
};


/***/ }),

/***/ 9039:
/***/ (function(module) {


module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),

/***/ 6080:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(7476);
var aCallable = __webpack_require__(9306);
var NATIVE_BIND = __webpack_require__(616);

var bind = uncurryThis(uncurryThis.bind);

// optional / simple context binding
module.exports = function (fn, that) {
  aCallable(fn);
  return that === undefined ? fn : NATIVE_BIND ? bind(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ 616:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var fails = __webpack_require__(9039);

module.exports = !fails(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});


/***/ }),

/***/ 9565:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var NATIVE_BIND = __webpack_require__(616);

var call = Function.prototype.call;
// eslint-disable-next-line es/no-function-prototype-bind -- safe
module.exports = NATIVE_BIND ? call.bind(call) : function () {
  return call.apply(call, arguments);
};


/***/ }),

/***/ 350:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var DESCRIPTORS = __webpack_require__(3724);
var hasOwn = __webpack_require__(9297);

var FunctionPrototype = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn(FunctionPrototype, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS || (DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable));

module.exports = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};


/***/ }),

/***/ 6706:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(9504);
var aCallable = __webpack_require__(9306);

module.exports = function (object, key, method) {
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    return uncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
  } catch (error) { /* empty */ }
};


/***/ }),

/***/ 7476:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var classofRaw = __webpack_require__(2195);
var uncurryThis = __webpack_require__(9504);

module.exports = function (fn) {
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  if (classofRaw(fn) === 'Function') return uncurryThis(fn);
};


/***/ }),

/***/ 9504:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var NATIVE_BIND = __webpack_require__(616);

var FunctionPrototype = Function.prototype;
var call = FunctionPrototype.call;
// eslint-disable-next-line es/no-function-prototype-bind -- safe
var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);

module.exports = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
  return function () {
    return call.apply(fn, arguments);
  };
};


/***/ }),

/***/ 7751:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var globalThis = __webpack_require__(4576);
var isCallable = __webpack_require__(4901);

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(globalThis[namespace]) : globalThis[namespace] && globalThis[namespace][method];
};


/***/ }),

/***/ 1767:
/***/ (function(module) {


// `GetIteratorDirect(obj)` abstract operation
// https://tc39.es/ecma262/#sec-getiteratordirect
module.exports = function (obj) {
  return {
    iterator: obj,
    next: obj.next,
    done: false
  };
};


/***/ }),

/***/ 851:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var classof = __webpack_require__(6955);
var getMethod = __webpack_require__(5966);
var isNullOrUndefined = __webpack_require__(4117);
var Iterators = __webpack_require__(6269);
var wellKnownSymbol = __webpack_require__(8227);

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR)
    || getMethod(it, '@@iterator')
    || Iterators[classof(it)];
};


/***/ }),

/***/ 81:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var call = __webpack_require__(9565);
var aCallable = __webpack_require__(9306);
var anObject = __webpack_require__(8551);
var tryToString = __webpack_require__(6823);
var getIteratorMethod = __webpack_require__(851);

var $TypeError = TypeError;

module.exports = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
  if (aCallable(iteratorMethod)) return anObject(call(iteratorMethod, argument));
  throw new $TypeError(tryToString(argument) + ' is not iterable');
};


/***/ }),

/***/ 5966:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var aCallable = __webpack_require__(9306);
var isNullOrUndefined = __webpack_require__(4117);

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
module.exports = function (V, P) {
  var func = V[P];
  return isNullOrUndefined(func) ? undefined : aCallable(func);
};


/***/ }),

/***/ 3789:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var aCallable = __webpack_require__(9306);
var anObject = __webpack_require__(8551);
var call = __webpack_require__(9565);
var toIntegerOrInfinity = __webpack_require__(1291);
var getIteratorDirect = __webpack_require__(1767);

var INVALID_SIZE = 'Invalid size';
var $RangeError = RangeError;
var $TypeError = TypeError;
var max = Math.max;

var SetRecord = function (set, intSize) {
  this.set = set;
  this.size = max(intSize, 0);
  this.has = aCallable(set.has);
  this.keys = aCallable(set.keys);
};

SetRecord.prototype = {
  getIterator: function () {
    return getIteratorDirect(anObject(call(this.keys, this.set)));
  },
  includes: function (it) {
    return call(this.has, this.set, it);
  }
};

// `GetSetRecord` abstract operation
// https://tc39.es/proposal-set-methods/#sec-getsetrecord
module.exports = function (obj) {
  anObject(obj);
  var numSize = +obj.size;
  // NOTE: If size is undefined, then numSize will be NaN
  // eslint-disable-next-line no-self-compare -- NaN check
  if (numSize !== numSize) throw new $TypeError(INVALID_SIZE);
  var intSize = toIntegerOrInfinity(numSize);
  if (intSize < 0) throw new $RangeError(INVALID_SIZE);
  return new SetRecord(obj, intSize);
};


/***/ }),

/***/ 4576:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var check = function (it) {
  return it && it.Math === Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof __webpack_require__.g == 'object' && __webpack_require__.g) ||
  check(typeof this == 'object' && this) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();


/***/ }),

/***/ 9297:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(9504);
var toObject = __webpack_require__(8981);

var hasOwnProperty = uncurryThis({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
module.exports = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};


/***/ }),

/***/ 421:
/***/ (function(module) {


module.exports = {};


/***/ }),

/***/ 397:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var getBuiltIn = __webpack_require__(7751);

module.exports = getBuiltIn('document', 'documentElement');


/***/ }),

/***/ 5917:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var DESCRIPTORS = __webpack_require__(3724);
var fails = __webpack_require__(9039);
var createElement = __webpack_require__(4055);

// Thanks to IE8 for its funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a !== 7;
});


/***/ }),

/***/ 7055:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(9504);
var fails = __webpack_require__(9039);
var classof = __webpack_require__(2195);

var $Object = Object;
var split = uncurryThis(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) === 'String' ? split(it, '') : $Object(it);
} : $Object;


/***/ }),

/***/ 3706:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(9504);
var isCallable = __webpack_require__(4901);
var store = __webpack_require__(7629);

var functionToString = uncurryThis(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable(store.inspectSource)) {
  store.inspectSource = function (it) {
    return functionToString(it);
  };
}

module.exports = store.inspectSource;


/***/ }),

/***/ 1181:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var NATIVE_WEAK_MAP = __webpack_require__(8622);
var globalThis = __webpack_require__(4576);
var isObject = __webpack_require__(34);
var createNonEnumerableProperty = __webpack_require__(6699);
var hasOwn = __webpack_require__(9297);
var shared = __webpack_require__(7629);
var sharedKey = __webpack_require__(6119);
var hiddenKeys = __webpack_require__(421);

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError = globalThis.TypeError;
var WeakMap = globalThis.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw new TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP || shared.state) {
  var store = shared.state || (shared.state = new WeakMap());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store.get = store.get;
  store.has = store.has;
  store.set = store.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set = function (it, metadata) {
    if (store.has(it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store.set(it, metadata);
    return metadata;
  };
  get = function (it) {
    return store.get(it) || {};
  };
  has = function (it) {
    return store.has(it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    if (hasOwn(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),

/***/ 4209:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var wellKnownSymbol = __webpack_require__(8227);
var Iterators = __webpack_require__(6269);

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};


/***/ }),

/***/ 4376:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var classof = __webpack_require__(2195);

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
module.exports = Array.isArray || function isArray(argument) {
  return classof(argument) === 'Array';
};


/***/ }),

/***/ 4901:
/***/ (function(module) {


// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
var documentAll = typeof document == 'object' && document.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
module.exports = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};


/***/ }),

/***/ 2796:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var fails = __webpack_require__(9039);
var isCallable = __webpack_require__(4901);

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value === POLYFILL ? true
    : value === NATIVE ? false
    : isCallable(detection) ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),

/***/ 4117:
/***/ (function(module) {


// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
module.exports = function (it) {
  return it === null || it === undefined;
};


/***/ }),

/***/ 34:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var isCallable = __webpack_require__(4901);

module.exports = function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};


/***/ }),

/***/ 6395:
/***/ (function(module) {


module.exports = false;


/***/ }),

/***/ 757:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var getBuiltIn = __webpack_require__(7751);
var isCallable = __webpack_require__(4901);
var isPrototypeOf = __webpack_require__(1625);
var USE_SYMBOL_AS_UID = __webpack_require__(7040);

var $Object = Object;

module.exports = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
};


/***/ }),

/***/ 507:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var call = __webpack_require__(9565);

module.exports = function (record, fn, ITERATOR_INSTEAD_OF_RECORD) {
  var iterator = ITERATOR_INSTEAD_OF_RECORD ? record : record.iterator;
  var next = record.next;
  var step, result;
  while (!(step = call(next, iterator)).done) {
    result = fn(step.value);
    if (result !== undefined) return result;
  }
};


/***/ }),

/***/ 2652:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var bind = __webpack_require__(6080);
var call = __webpack_require__(9565);
var anObject = __webpack_require__(8551);
var tryToString = __webpack_require__(6823);
var isArrayIteratorMethod = __webpack_require__(4209);
var lengthOfArrayLike = __webpack_require__(6198);
var isPrototypeOf = __webpack_require__(1625);
var getIterator = __webpack_require__(81);
var getIteratorMethod = __webpack_require__(851);
var iteratorClose = __webpack_require__(9539);

var $TypeError = TypeError;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var ResultPrototype = Result.prototype;

module.exports = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_RECORD = !!(options && options.IS_RECORD);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = bind(unboundFunction, that);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose(iterator, 'normal');
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_RECORD) {
    iterator = iterable.iterator;
  } else if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (!iterFn) throw new $TypeError(tryToString(iterable) + ' is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && isPrototypeOf(ResultPrototype, result)) return result;
      } return new Result(false);
    }
    iterator = getIterator(iterable, iterFn);
  }

  next = IS_RECORD ? iterable.next : iterator.next;
  while (!(step = call(next, iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose(iterator, 'throw', error);
    }
    if (typeof result == 'object' && result && isPrototypeOf(ResultPrototype, result)) return result;
  } return new Result(false);
};


/***/ }),

/***/ 1385:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var iteratorClose = __webpack_require__(9539);

module.exports = function (iters, kind, value) {
  for (var i = iters.length - 1; i >= 0; i--) {
    if (iters[i] === undefined) continue;
    try {
      value = iteratorClose(iters[i].iterator, kind, value);
    } catch (error) {
      kind = 'throw';
      value = error;
    }
  }
  if (kind === 'throw') throw value;
  return value;
};


/***/ }),

/***/ 9539:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var call = __webpack_require__(9565);
var anObject = __webpack_require__(8551);
var getMethod = __webpack_require__(5966);

module.exports = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject(iterator);
  try {
    innerResult = getMethod(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = call(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject(innerResult);
  return value;
};


/***/ }),

/***/ 9462:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var call = __webpack_require__(9565);
var create = __webpack_require__(2360);
var createNonEnumerableProperty = __webpack_require__(6699);
var defineBuiltIns = __webpack_require__(6279);
var wellKnownSymbol = __webpack_require__(8227);
var InternalStateModule = __webpack_require__(1181);
var getMethod = __webpack_require__(5966);
var IteratorPrototype = (__webpack_require__(7657).IteratorPrototype);
var createIterResultObject = __webpack_require__(2529);
var iteratorClose = __webpack_require__(9539);
var iteratorCloseAll = __webpack_require__(1385);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var ITERATOR_HELPER = 'IteratorHelper';
var WRAP_FOR_VALID_ITERATOR = 'WrapForValidIterator';
var NORMAL = 'normal';
var THROW = 'throw';
var setInternalState = InternalStateModule.set;

var createIteratorProxyPrototype = function (IS_ITERATOR) {
  var getInternalState = InternalStateModule.getterFor(IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER);

  return defineBuiltIns(create(IteratorPrototype), {
    next: function next() {
      var state = getInternalState(this);
      // for simplification:
      //   for `%WrapForValidIteratorPrototype%.next` or with `state.returnHandlerResult` our `nextHandler` returns `IterResultObject`
      //   for `%IteratorHelperPrototype%.next` - just a value
      if (IS_ITERATOR) return state.nextHandler();
      if (state.done) return createIterResultObject(undefined, true);
      try {
        var result = state.nextHandler();
        return state.returnHandlerResult ? result : createIterResultObject(result, state.done);
      } catch (error) {
        state.done = true;
        throw error;
      }
    },
    'return': function () {
      var state = getInternalState(this);
      var iterator = state.iterator;
      state.done = true;
      if (IS_ITERATOR) {
        var returnMethod = getMethod(iterator, 'return');
        return returnMethod ? call(returnMethod, iterator) : createIterResultObject(undefined, true);
      }
      if (state.inner) try {
        iteratorClose(state.inner.iterator, NORMAL);
      } catch (error) {
        return iteratorClose(iterator, THROW, error);
      }
      if (state.openIters) try {
        iteratorCloseAll(state.openIters, NORMAL);
      } catch (error) {
        return iteratorClose(iterator, THROW, error);
      }
      if (iterator) iteratorClose(iterator, NORMAL);
      return createIterResultObject(undefined, true);
    }
  });
};

var WrapForValidIteratorPrototype = createIteratorProxyPrototype(true);
var IteratorHelperPrototype = createIteratorProxyPrototype(false);

createNonEnumerableProperty(IteratorHelperPrototype, TO_STRING_TAG, 'Iterator Helper');

module.exports = function (nextHandler, IS_ITERATOR, RETURN_HANDLER_RESULT) {
  var IteratorProxy = function Iterator(record, state) {
    if (state) {
      state.iterator = record.iterator;
      state.next = record.next;
    } else state = record;
    state.type = IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER;
    state.returnHandlerResult = !!RETURN_HANDLER_RESULT;
    state.nextHandler = nextHandler;
    state.counter = 0;
    state.done = false;
    setInternalState(this, state);
  };

  IteratorProxy.prototype = IS_ITERATOR ? WrapForValidIteratorPrototype : IteratorHelperPrototype;

  return IteratorProxy;
};


/***/ }),

/***/ 684:
/***/ (function(module) {


// Should throw an error on invalid iterator
// https://issues.chromium.org/issues/336839115
module.exports = function (methodName, argument) {
  // eslint-disable-next-line es/no-iterator -- required for testing
  var method = typeof Iterator == 'function' && Iterator.prototype[methodName];
  if (method) try {
    method.call({ next: null }, argument).next();
  } catch (error) {
    return true;
  }
};


/***/ }),

/***/ 4549:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var globalThis = __webpack_require__(4576);

// https://github.com/tc39/ecma262/pull/3467
module.exports = function (METHOD_NAME, ExpectedError) {
  var Iterator = globalThis.Iterator;
  var IteratorPrototype = Iterator && Iterator.prototype;
  var method = IteratorPrototype && IteratorPrototype[METHOD_NAME];

  var CLOSED = false;

  if (method) try {
    method.call({
      next: function () { return { done: true }; },
      'return': function () { CLOSED = true; }
    }, -1);
  } catch (error) {
    // https://bugs.webkit.org/show_bug.cgi?id=291195
    if (!(error instanceof ExpectedError)) CLOSED = false;
  }

  if (!CLOSED) return method;
};


/***/ }),

/***/ 7657:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var fails = __webpack_require__(9039);
var isCallable = __webpack_require__(4901);
var isObject = __webpack_require__(34);
var create = __webpack_require__(2360);
var getPrototypeOf = __webpack_require__(2787);
var defineBuiltIn = __webpack_require__(6840);
var wellKnownSymbol = __webpack_require__(8227);
var IS_PURE = __webpack_require__(6395);

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = !isObject(IteratorPrototype) || fails(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype[ITERATOR].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};
else if (IS_PURE) IteratorPrototype = create(IteratorPrototype);

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable(IteratorPrototype[ITERATOR])) {
  defineBuiltIn(IteratorPrototype, ITERATOR, function () {
    return this;
  });
}

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};


/***/ }),

/***/ 6269:
/***/ (function(module) {


module.exports = {};


/***/ }),

/***/ 6198:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var toLength = __webpack_require__(8014);

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
module.exports = function (obj) {
  return toLength(obj.length);
};


/***/ }),

/***/ 283:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(9504);
var fails = __webpack_require__(9039);
var isCallable = __webpack_require__(4901);
var hasOwn = __webpack_require__(9297);
var DESCRIPTORS = __webpack_require__(3724);
var CONFIGURABLE_FUNCTION_NAME = (__webpack_require__(350).CONFIGURABLE);
var inspectSource = __webpack_require__(3706);
var InternalStateModule = __webpack_require__(1181);

var enforceInternalState = InternalStateModule.enforce;
var getInternalState = InternalStateModule.get;
var $String = String;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var stringSlice = uncurryThis(''.slice);
var replace = uncurryThis(''.replace);
var join = uncurryThis([].join);

var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails(function () {
  return defineProperty(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn = module.exports = function (value, name, options) {
  if (stringSlice($String(name), 0, 7) === 'Symbol(') {
    name = '[' + replace($String(name), /^Symbol\(([^)]*)\).*$/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwn(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
    if (DESCRIPTORS) defineProperty(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn(options, 'arity') && value.length !== options.arity) {
    defineProperty(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwn(options, 'constructor') && options.constructor) {
      if (DESCRIPTORS) defineProperty(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState(value);
  if (!hasOwn(state, 'source')) {
    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn(function toString() {
  return isCallable(this) && getInternalState(this).source || inspectSource(this);
}, 'toString');


/***/ }),

/***/ 741:
/***/ (function(module) {


var ceil = Math.ceil;
var floor = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
module.exports = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor : ceil)(n);
};


/***/ }),

/***/ 2360:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


/* global ActiveXObject -- old IE, WSH */
var anObject = __webpack_require__(8551);
var definePropertiesModule = __webpack_require__(6801);
var enumBugKeys = __webpack_require__(8727);
var hiddenKeys = __webpack_require__(421);
var html = __webpack_require__(397);
var documentCreateElement = __webpack_require__(4055);
var sharedKey = __webpack_require__(6119);

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  // eslint-disable-next-line no-useless-assignment -- avoid memory leak
  activeXDocument = null;
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys[IE_PROTO] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
};


/***/ }),

/***/ 6801:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var DESCRIPTORS = __webpack_require__(3724);
var V8_PROTOTYPE_DEFINE_BUG = __webpack_require__(8686);
var definePropertyModule = __webpack_require__(4913);
var anObject = __webpack_require__(8551);
var toIndexedObject = __webpack_require__(5397);
var objectKeys = __webpack_require__(1072);

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
exports.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var props = toIndexedObject(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
  return O;
};


/***/ }),

/***/ 4913:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var DESCRIPTORS = __webpack_require__(3724);
var IE8_DOM_DEFINE = __webpack_require__(5917);
var V8_PROTOTYPE_DEFINE_BUG = __webpack_require__(8686);
var anObject = __webpack_require__(8551);
var toPropertyKey = __webpack_require__(6969);

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPropertyKey(P);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ 7347:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var DESCRIPTORS = __webpack_require__(3724);
var call = __webpack_require__(9565);
var propertyIsEnumerableModule = __webpack_require__(8773);
var createPropertyDescriptor = __webpack_require__(6980);
var toIndexedObject = __webpack_require__(5397);
var toPropertyKey = __webpack_require__(6969);
var hasOwn = __webpack_require__(9297);
var IE8_DOM_DEFINE = __webpack_require__(5917);

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPropertyKey(P);
  if (IE8_DOM_DEFINE) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
};


/***/ }),

/***/ 8480:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var internalObjectKeys = __webpack_require__(1828);
var enumBugKeys = __webpack_require__(8727);

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),

/***/ 3717:
/***/ (function(__unused_webpack_module, exports) {


// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ 2787:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var hasOwn = __webpack_require__(9297);
var isCallable = __webpack_require__(4901);
var toObject = __webpack_require__(8981);
var sharedKey = __webpack_require__(6119);
var CORRECT_PROTOTYPE_GETTER = __webpack_require__(2211);

var IE_PROTO = sharedKey('IE_PROTO');
var $Object = Object;
var ObjectPrototype = $Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
module.exports = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function (O) {
  var object = toObject(O);
  if (hasOwn(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof $Object ? ObjectPrototype : null;
};


/***/ }),

/***/ 1625:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(9504);

module.exports = uncurryThis({}.isPrototypeOf);


/***/ }),

/***/ 1828:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(9504);
var hasOwn = __webpack_require__(9297);
var toIndexedObject = __webpack_require__(5397);
var indexOf = (__webpack_require__(9617).indexOf);
var hiddenKeys = __webpack_require__(421);

var push = uncurryThis([].push);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn(O, key = names[i++])) {
    ~indexOf(result, key) || push(result, key);
  }
  return result;
};


/***/ }),

/***/ 1072:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var internalObjectKeys = __webpack_require__(1828);
var enumBugKeys = __webpack_require__(8727);

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};


/***/ }),

/***/ 8773:
/***/ (function(__unused_webpack_module, exports) {


var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;


/***/ }),

/***/ 4270:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var call = __webpack_require__(9565);
var isCallable = __webpack_require__(4901);
var isObject = __webpack_require__(34);

var $TypeError = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
module.exports = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  throw new $TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ 5031:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var getBuiltIn = __webpack_require__(7751);
var uncurryThis = __webpack_require__(9504);
var getOwnPropertyNamesModule = __webpack_require__(8480);
var getOwnPropertySymbolsModule = __webpack_require__(3717);
var anObject = __webpack_require__(8551);

var concat = uncurryThis([].concat);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};


/***/ }),

/***/ 7750:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var isNullOrUndefined = __webpack_require__(4117);

var $TypeError = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
  return it;
};


/***/ }),

/***/ 9286:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var SetHelpers = __webpack_require__(4402);
var iterate = __webpack_require__(8469);

var Set = SetHelpers.Set;
var add = SetHelpers.add;

module.exports = function (set) {
  var result = new Set();
  iterate(set, function (it) {
    add(result, it);
  });
  return result;
};


/***/ }),

/***/ 3440:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var aSet = __webpack_require__(7080);
var SetHelpers = __webpack_require__(4402);
var clone = __webpack_require__(9286);
var size = __webpack_require__(5170);
var getSetRecord = __webpack_require__(3789);
var iterateSet = __webpack_require__(8469);
var iterateSimple = __webpack_require__(507);

var has = SetHelpers.has;
var remove = SetHelpers.remove;

// `Set.prototype.difference` method
// https://tc39.es/ecma262/#sec-set.prototype.difference
module.exports = function difference(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  var result = clone(O);
  if (size(O) <= otherRec.size) iterateSet(O, function (e) {
    if (otherRec.includes(e)) remove(result, e);
  });
  else iterateSimple(otherRec.getIterator(), function (e) {
    if (has(result, e)) remove(result, e);
  });
  return result;
};


/***/ }),

/***/ 4402:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(9504);

// eslint-disable-next-line es/no-set -- safe
var SetPrototype = Set.prototype;

module.exports = {
  // eslint-disable-next-line es/no-set -- safe
  Set: Set,
  add: uncurryThis(SetPrototype.add),
  has: uncurryThis(SetPrototype.has),
  remove: uncurryThis(SetPrototype['delete']),
  proto: SetPrototype
};


/***/ }),

/***/ 8750:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var aSet = __webpack_require__(7080);
var SetHelpers = __webpack_require__(4402);
var size = __webpack_require__(5170);
var getSetRecord = __webpack_require__(3789);
var iterateSet = __webpack_require__(8469);
var iterateSimple = __webpack_require__(507);

var Set = SetHelpers.Set;
var add = SetHelpers.add;
var has = SetHelpers.has;

// `Set.prototype.intersection` method
// https://tc39.es/ecma262/#sec-set.prototype.intersection
module.exports = function intersection(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  var result = new Set();

  if (size(O) > otherRec.size) {
    iterateSimple(otherRec.getIterator(), function (e) {
      if (has(O, e)) add(result, e);
    });
  } else {
    iterateSet(O, function (e) {
      if (otherRec.includes(e)) add(result, e);
    });
  }

  return result;
};


/***/ }),

/***/ 4449:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var aSet = __webpack_require__(7080);
var has = (__webpack_require__(4402).has);
var size = __webpack_require__(5170);
var getSetRecord = __webpack_require__(3789);
var iterateSet = __webpack_require__(8469);
var iterateSimple = __webpack_require__(507);
var iteratorClose = __webpack_require__(9539);

// `Set.prototype.isDisjointFrom` method
// https://tc39.es/ecma262/#sec-set.prototype.isdisjointfrom
module.exports = function isDisjointFrom(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  if (size(O) <= otherRec.size) return iterateSet(O, function (e) {
    if (otherRec.includes(e)) return false;
  }, true) !== false;
  var iterator = otherRec.getIterator();
  return iterateSimple(iterator, function (e) {
    if (has(O, e)) return iteratorClose(iterator, 'normal', false);
  }) !== false;
};


/***/ }),

/***/ 3838:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var aSet = __webpack_require__(7080);
var size = __webpack_require__(5170);
var iterate = __webpack_require__(8469);
var getSetRecord = __webpack_require__(3789);

// `Set.prototype.isSubsetOf` method
// https://tc39.es/ecma262/#sec-set.prototype.issubsetof
module.exports = function isSubsetOf(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  if (size(O) > otherRec.size) return false;
  return iterate(O, function (e) {
    if (!otherRec.includes(e)) return false;
  }, true) !== false;
};


/***/ }),

/***/ 8527:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var aSet = __webpack_require__(7080);
var has = (__webpack_require__(4402).has);
var size = __webpack_require__(5170);
var getSetRecord = __webpack_require__(3789);
var iterateSimple = __webpack_require__(507);
var iteratorClose = __webpack_require__(9539);

// `Set.prototype.isSupersetOf` method
// https://tc39.es/ecma262/#sec-set.prototype.issupersetof
module.exports = function isSupersetOf(other) {
  var O = aSet(this);
  var otherRec = getSetRecord(other);
  if (size(O) < otherRec.size) return false;
  var iterator = otherRec.getIterator();
  return iterateSimple(iterator, function (e) {
    if (!has(O, e)) return iteratorClose(iterator, 'normal', false);
  }) !== false;
};


/***/ }),

/***/ 8469:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(9504);
var iterateSimple = __webpack_require__(507);
var SetHelpers = __webpack_require__(4402);

var Set = SetHelpers.Set;
var SetPrototype = SetHelpers.proto;
var forEach = uncurryThis(SetPrototype.forEach);
var keys = uncurryThis(SetPrototype.keys);
var next = keys(new Set()).next;

module.exports = function (set, fn, interruptible) {
  return interruptible ? iterateSimple({ iterator: keys(set), next: next }, fn) : forEach(set, fn);
};


/***/ }),

/***/ 4916:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var getBuiltIn = __webpack_require__(7751);

var createSetLike = function (size) {
  return {
    size: size,
    has: function () {
      return false;
    },
    keys: function () {
      return {
        next: function () {
          return { done: true };
        }
      };
    }
  };
};

var createSetLikeWithInfinitySize = function (size) {
  return {
    size: size,
    has: function () {
      return true;
    },
    keys: function () {
      throw new Error('e');
    }
  };
};

module.exports = function (name, callback) {
  var Set = getBuiltIn('Set');
  try {
    new Set()[name](createSetLike(0));
    try {
      // late spec change, early WebKit ~ Safari 17 implementation does not pass it
      // https://github.com/tc39/proposal-set-methods/pull/88
      // also covered engines with
      // https://bugs.webkit.org/show_bug.cgi?id=272679
      new Set()[name](createSetLike(-1));
      return false;
    } catch (error2) {
      if (!callback) return true;
      // early V8 implementation bug
      // https://issues.chromium.org/issues/351332634
      try {
        new Set()[name](createSetLikeWithInfinitySize(-Infinity));
        return false;
      } catch (error) {
        var set = new Set([1, 2]);
        return callback(set[name](createSetLikeWithInfinitySize(Infinity)));
      }
    }
  } catch (error) {
    return false;
  }
};


/***/ }),

/***/ 9835:
/***/ (function(module) {


// Should get iterator record of a set-like object before cloning this
// https://bugs.webkit.org/show_bug.cgi?id=289430
module.exports = function (METHOD_NAME) {
  try {
    // eslint-disable-next-line es/no-set -- needed for test
    var baseSet = new Set();
    var setLike = {
      size: 0,
      has: function () { return true; },
      keys: function () {
        // eslint-disable-next-line es/no-object-defineproperty -- needed for test
        return Object.defineProperty({}, 'next', {
          get: function () {
            baseSet.clear();
            baseSet.add(4);
            return function () {
              return { done: true };
            };
          }
        });
      }
    };
    var result = baseSet[METHOD_NAME](setLike);

    return result.size === 1 && result.values().next().value === 4;
  } catch (error) {
    return false;
  }
};


/***/ }),

/***/ 5170:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThisAccessor = __webpack_require__(6706);
var SetHelpers = __webpack_require__(4402);

module.exports = uncurryThisAccessor(SetHelpers.proto, 'size', 'get') || function (set) {
  return set.size;
};


/***/ }),

/***/ 3650:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var aSet = __webpack_require__(7080);
var SetHelpers = __webpack_require__(4402);
var clone = __webpack_require__(9286);
var getSetRecord = __webpack_require__(3789);
var iterateSimple = __webpack_require__(507);

var add = SetHelpers.add;
var has = SetHelpers.has;
var remove = SetHelpers.remove;

// `Set.prototype.symmetricDifference` method
// https://tc39.es/ecma262/#sec-set.prototype.symmetricdifference
module.exports = function symmetricDifference(other) {
  var O = aSet(this);
  var keysIter = getSetRecord(other).getIterator();
  var result = clone(O);
  iterateSimple(keysIter, function (e) {
    if (has(O, e)) remove(result, e);
    else add(result, e);
  });
  return result;
};


/***/ }),

/***/ 4204:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var aSet = __webpack_require__(7080);
var add = (__webpack_require__(4402).add);
var clone = __webpack_require__(9286);
var getSetRecord = __webpack_require__(3789);
var iterateSimple = __webpack_require__(507);

// `Set.prototype.union` method
// https://tc39.es/ecma262/#sec-set.prototype.union
module.exports = function union(other) {
  var O = aSet(this);
  var keysIter = getSetRecord(other).getIterator();
  var result = clone(O);
  iterateSimple(keysIter, function (it) {
    add(result, it);
  });
  return result;
};


/***/ }),

/***/ 6119:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var shared = __webpack_require__(5745);
var uid = __webpack_require__(3392);

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),

/***/ 7629:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var IS_PURE = __webpack_require__(6395);
var globalThis = __webpack_require__(4576);
var defineGlobalProperty = __webpack_require__(9433);

var SHARED = '__core-js_shared__';
var store = module.exports = globalThis[SHARED] || defineGlobalProperty(SHARED, {});

(store.versions || (store.versions = [])).push({
  version: '3.48.0',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2013–2025 Denis Pushkarev (zloirock.ru), 2025–2026 CoreJS Company (core-js.io). All rights reserved.',
  license: 'https://github.com/zloirock/core-js/blob/v3.48.0/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});


/***/ }),

/***/ 5745:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var store = __webpack_require__(7629);

module.exports = function (key, value) {
  return store[key] || (store[key] = value || {});
};


/***/ }),

/***/ 4495:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION = __webpack_require__(9519);
var fails = __webpack_require__(9039);
var globalThis = __webpack_require__(4576);

var $String = globalThis.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  var symbol = Symbol('symbol detection');
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
});


/***/ }),

/***/ 5610:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var toIntegerOrInfinity = __webpack_require__(1291);

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
module.exports = function (index, length) {
  var integer = toIntegerOrInfinity(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),

/***/ 5397:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(7055);
var requireObjectCoercible = __webpack_require__(7750);

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),

/***/ 1291:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var trunc = __webpack_require__(741);

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
module.exports = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc(number);
};


/***/ }),

/***/ 8014:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var toIntegerOrInfinity = __webpack_require__(1291);

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
module.exports = function (argument) {
  var len = toIntegerOrInfinity(argument);
  return len > 0 ? min(len, 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),

/***/ 8981:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var requireObjectCoercible = __webpack_require__(7750);

var $Object = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
module.exports = function (argument) {
  return $Object(requireObjectCoercible(argument));
};


/***/ }),

/***/ 2777:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var call = __webpack_require__(9565);
var isObject = __webpack_require__(34);
var isSymbol = __webpack_require__(757);
var getMethod = __webpack_require__(5966);
var ordinaryToPrimitive = __webpack_require__(4270);
var wellKnownSymbol = __webpack_require__(8227);

var $TypeError = TypeError;
var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
module.exports = function (input, pref) {
  if (!isObject(input) || isSymbol(input)) return input;
  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call(exoticToPrim, input, pref);
    if (!isObject(result) || isSymbol(result)) return result;
    throw new $TypeError("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};


/***/ }),

/***/ 6969:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var toPrimitive = __webpack_require__(2777);
var isSymbol = __webpack_require__(757);

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
module.exports = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : key + '';
};


/***/ }),

/***/ 2140:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var wellKnownSymbol = __webpack_require__(8227);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};
// eslint-disable-next-line unicorn/no-immediate-mutation -- ES3 syntax limitation
test[TO_STRING_TAG] = 'z';

module.exports = String(test) === '[object z]';


/***/ }),

/***/ 6823:
/***/ (function(module) {


var $String = String;

module.exports = function (argument) {
  try {
    return $String(argument);
  } catch (error) {
    return 'Object';
  }
};


/***/ }),

/***/ 3392:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var uncurryThis = __webpack_require__(9504);

var id = 0;
var postfix = Math.random();
var toString = uncurryThis(1.1.toString);

module.exports = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
};


/***/ }),

/***/ 7040:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL = __webpack_require__(4495);

module.exports = NATIVE_SYMBOL &&
  !Symbol.sham &&
  typeof Symbol.iterator == 'symbol';


/***/ }),

/***/ 8686:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var DESCRIPTORS = __webpack_require__(3724);
var fails = __webpack_require__(9039);

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
module.exports = DESCRIPTORS && fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype !== 42;
});


/***/ }),

/***/ 8622:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var globalThis = __webpack_require__(4576);
var isCallable = __webpack_require__(4901);

var WeakMap = globalThis.WeakMap;

module.exports = isCallable(WeakMap) && /native code/.test(String(WeakMap));


/***/ }),

/***/ 8227:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {


var globalThis = __webpack_require__(4576);
var shared = __webpack_require__(5745);
var hasOwn = __webpack_require__(9297);
var uid = __webpack_require__(3392);
var NATIVE_SYMBOL = __webpack_require__(4495);
var USE_SYMBOL_AS_UID = __webpack_require__(7040);

var Symbol = globalThis.Symbol;
var WellKnownSymbolsStore = shared('wks');
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol['for'] || Symbol : Symbol && Symbol.withoutSetter || uid;

module.exports = function (name) {
  if (!hasOwn(WellKnownSymbolsStore, name)) {
    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol, name)
      ? Symbol[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};


/***/ }),

/***/ 4114:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var toObject = __webpack_require__(8981);
var lengthOfArrayLike = __webpack_require__(6198);
var setArrayLength = __webpack_require__(4527);
var doesNotExceedSafeInteger = __webpack_require__(6837);
var fails = __webpack_require__(9039);

var INCORRECT_TO_LENGTH = fails(function () {
  return [].push.call({ length: 0x100000000 }, 1) !== 4294967297;
});

// V8 <= 121 and Safari <= 15.4; FF < 23 throws InternalError
// https://bugs.chromium.org/p/v8/issues/detail?id=12681
var properErrorOnNonWritableLength = function () {
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).push();
  } catch (error) {
    return error instanceof TypeError;
  }
};

var FORCED = INCORRECT_TO_LENGTH || !properErrorOnNonWritableLength();

// `Array.prototype.push` method
// https://tc39.es/ecma262/#sec-array.prototype.push
$({ target: 'Array', proto: true, arity: 1, forced: FORCED }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  push: function push(item) {
    var O = toObject(this);
    var len = lengthOfArrayLike(O);
    var argCount = arguments.length;
    doesNotExceedSafeInteger(len + argCount);
    for (var i = 0; i < argCount; i++) {
      O[len] = arguments[i];
      len++;
    }
    setArrayLength(O, len);
    return len;
  }
});


/***/ }),

/***/ 8111:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var globalThis = __webpack_require__(4576);
var anInstance = __webpack_require__(679);
var anObject = __webpack_require__(8551);
var isCallable = __webpack_require__(4901);
var getPrototypeOf = __webpack_require__(2787);
var defineBuiltInAccessor = __webpack_require__(2106);
var createProperty = __webpack_require__(4659);
var fails = __webpack_require__(9039);
var hasOwn = __webpack_require__(9297);
var wellKnownSymbol = __webpack_require__(8227);
var IteratorPrototype = (__webpack_require__(7657).IteratorPrototype);
var DESCRIPTORS = __webpack_require__(3724);
var IS_PURE = __webpack_require__(6395);

var CONSTRUCTOR = 'constructor';
var ITERATOR = 'Iterator';
var TO_STRING_TAG = wellKnownSymbol('toStringTag');

var $TypeError = TypeError;
var NativeIterator = globalThis[ITERATOR];

// FF56- have non-standard global helper `Iterator`
var FORCED = IS_PURE
  || !isCallable(NativeIterator)
  || NativeIterator.prototype !== IteratorPrototype
  // FF44- non-standard `Iterator` passes previous tests
  || !fails(function () { NativeIterator({}); });

var IteratorConstructor = function Iterator() {
  anInstance(this, IteratorPrototype);
  if (getPrototypeOf(this) === IteratorPrototype) throw new $TypeError('Abstract class Iterator not directly constructable');
};

var defineIteratorPrototypeAccessor = function (key, value) {
  if (DESCRIPTORS) {
    defineBuiltInAccessor(IteratorPrototype, key, {
      configurable: true,
      get: function () {
        return value;
      },
      set: function (replacement) {
        anObject(this);
        if (this === IteratorPrototype) throw new $TypeError("You can't redefine this property");
        if (hasOwn(this, key)) this[key] = replacement;
        else createProperty(this, key, replacement);
      }
    });
  } else IteratorPrototype[key] = value;
};

if (!hasOwn(IteratorPrototype, TO_STRING_TAG)) defineIteratorPrototypeAccessor(TO_STRING_TAG, ITERATOR);

if (FORCED || !hasOwn(IteratorPrototype, CONSTRUCTOR) || IteratorPrototype[CONSTRUCTOR] === Object) {
  defineIteratorPrototypeAccessor(CONSTRUCTOR, IteratorConstructor);
}

IteratorConstructor.prototype = IteratorPrototype;

// `Iterator` constructor
// https://tc39.es/ecma262/#sec-iterator
$({ global: true, constructor: true, forced: FORCED }, {
  Iterator: IteratorConstructor
});


/***/ }),

/***/ 2489:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var call = __webpack_require__(9565);
var aCallable = __webpack_require__(9306);
var anObject = __webpack_require__(8551);
var getIteratorDirect = __webpack_require__(1767);
var createIteratorProxy = __webpack_require__(9462);
var callWithSafeIterationClosing = __webpack_require__(6319);
var IS_PURE = __webpack_require__(6395);
var iteratorClose = __webpack_require__(9539);
var iteratorHelperThrowsOnInvalidIterator = __webpack_require__(684);
var iteratorHelperWithoutClosingOnEarlyError = __webpack_require__(4549);

var FILTER_WITHOUT_THROWING_ON_INVALID_ITERATOR = !IS_PURE && !iteratorHelperThrowsOnInvalidIterator('filter', function () { /* empty */ });
var filterWithoutClosingOnEarlyError = !IS_PURE && !FILTER_WITHOUT_THROWING_ON_INVALID_ITERATOR
  && iteratorHelperWithoutClosingOnEarlyError('filter', TypeError);

var FORCED = IS_PURE || FILTER_WITHOUT_THROWING_ON_INVALID_ITERATOR || filterWithoutClosingOnEarlyError;

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  var predicate = this.predicate;
  var next = this.next;
  var result, done, value;
  while (true) {
    result = anObject(call(next, iterator));
    done = this.done = !!result.done;
    if (done) return;
    value = result.value;
    if (callWithSafeIterationClosing(iterator, predicate, [value, this.counter++], true)) return value;
  }
});

// `Iterator.prototype.filter` method
// https://tc39.es/ecma262/#sec-iterator.prototype.filter
$({ target: 'Iterator', proto: true, real: true, forced: FORCED }, {
  filter: function filter(predicate) {
    anObject(this);
    try {
      aCallable(predicate);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (filterWithoutClosingOnEarlyError) return call(filterWithoutClosingOnEarlyError, this, predicate);

    return new IteratorProxy(getIteratorDirect(this), {
      predicate: predicate
    });
  }
});


/***/ }),

/***/ 116:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var call = __webpack_require__(9565);
var iterate = __webpack_require__(2652);
var aCallable = __webpack_require__(9306);
var anObject = __webpack_require__(8551);
var getIteratorDirect = __webpack_require__(1767);
var iteratorClose = __webpack_require__(9539);
var iteratorHelperWithoutClosingOnEarlyError = __webpack_require__(4549);

var findWithoutClosingOnEarlyError = iteratorHelperWithoutClosingOnEarlyError('find', TypeError);

// `Iterator.prototype.find` method
// https://tc39.es/ecma262/#sec-iterator.prototype.find
$({ target: 'Iterator', proto: true, real: true, forced: findWithoutClosingOnEarlyError }, {
  find: function find(predicate) {
    anObject(this);
    try {
      aCallable(predicate);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (findWithoutClosingOnEarlyError) return call(findWithoutClosingOnEarlyError, this, predicate);

    var record = getIteratorDirect(this);
    var counter = 0;
    return iterate(record, function (value, stop) {
      if (predicate(value, counter++)) return stop(value);
    }, { IS_RECORD: true, INTERRUPTED: true }).result;
  }
});


/***/ }),

/***/ 1701:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var call = __webpack_require__(9565);
var aCallable = __webpack_require__(9306);
var anObject = __webpack_require__(8551);
var getIteratorDirect = __webpack_require__(1767);
var createIteratorProxy = __webpack_require__(9462);
var callWithSafeIterationClosing = __webpack_require__(6319);
var iteratorClose = __webpack_require__(9539);
var iteratorHelperThrowsOnInvalidIterator = __webpack_require__(684);
var iteratorHelperWithoutClosingOnEarlyError = __webpack_require__(4549);
var IS_PURE = __webpack_require__(6395);

var MAP_WITHOUT_THROWING_ON_INVALID_ITERATOR = !IS_PURE && !iteratorHelperThrowsOnInvalidIterator('map', function () { /* empty */ });
var mapWithoutClosingOnEarlyError = !IS_PURE && !MAP_WITHOUT_THROWING_ON_INVALID_ITERATOR
  && iteratorHelperWithoutClosingOnEarlyError('map', TypeError);

var FORCED = IS_PURE || MAP_WITHOUT_THROWING_ON_INVALID_ITERATOR || mapWithoutClosingOnEarlyError;

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  var result = anObject(call(this.next, iterator));
  var done = this.done = !!result.done;
  if (!done) return callWithSafeIterationClosing(iterator, this.mapper, [result.value, this.counter++], true);
});

// `Iterator.prototype.map` method
// https://tc39.es/ecma262/#sec-iterator.prototype.map
$({ target: 'Iterator', proto: true, real: true, forced: FORCED }, {
  map: function map(mapper) {
    anObject(this);
    try {
      aCallable(mapper);
    } catch (error) {
      iteratorClose(this, 'throw', error);
    }

    if (mapWithoutClosingOnEarlyError) return call(mapWithoutClosingOnEarlyError, this, mapper);

    return new IteratorProxy(getIteratorDirect(this), {
      mapper: mapper
    });
  }
});


/***/ }),

/***/ 7642:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var difference = __webpack_require__(3440);
var fails = __webpack_require__(9039);
var setMethodAcceptSetLike = __webpack_require__(4916);

var SET_LIKE_INCORRECT_BEHAVIOR = !setMethodAcceptSetLike('difference', function (result) {
  return result.size === 0;
});

var FORCED = SET_LIKE_INCORRECT_BEHAVIOR || fails(function () {
  // https://bugs.webkit.org/show_bug.cgi?id=288595
  var setLike = {
    size: 1,
    has: function () { return true; },
    keys: function () {
      var index = 0;
      return {
        next: function () {
          var done = index++ > 1;
          if (baseSet.has(1)) baseSet.clear();
          return { done: done, value: 2 };
        }
      };
    }
  };
  // eslint-disable-next-line es/no-set -- testing
  var baseSet = new Set([1, 2, 3, 4]);
  // eslint-disable-next-line es/no-set-prototype-difference -- testing
  return baseSet.difference(setLike).size !== 3;
});

// `Set.prototype.difference` method
// https://tc39.es/ecma262/#sec-set.prototype.difference
$({ target: 'Set', proto: true, real: true, forced: FORCED }, {
  difference: difference
});


/***/ }),

/***/ 8004:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var fails = __webpack_require__(9039);
var intersection = __webpack_require__(8750);
var setMethodAcceptSetLike = __webpack_require__(4916);

var INCORRECT = !setMethodAcceptSetLike('intersection', function (result) {
  return result.size === 2 && result.has(1) && result.has(2);
}) || fails(function () {
  // eslint-disable-next-line es/no-array-from, es/no-set, es/no-set-prototype-intersection -- testing
  return String(Array.from(new Set([1, 2, 3]).intersection(new Set([3, 2])))) !== '3,2';
});

// `Set.prototype.intersection` method
// https://tc39.es/ecma262/#sec-set.prototype.intersection
$({ target: 'Set', proto: true, real: true, forced: INCORRECT }, {
  intersection: intersection
});


/***/ }),

/***/ 3853:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var isDisjointFrom = __webpack_require__(4449);
var setMethodAcceptSetLike = __webpack_require__(4916);

var INCORRECT = !setMethodAcceptSetLike('isDisjointFrom', function (result) {
  return !result;
});

// `Set.prototype.isDisjointFrom` method
// https://tc39.es/ecma262/#sec-set.prototype.isdisjointfrom
$({ target: 'Set', proto: true, real: true, forced: INCORRECT }, {
  isDisjointFrom: isDisjointFrom
});


/***/ }),

/***/ 5876:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var isSubsetOf = __webpack_require__(3838);
var setMethodAcceptSetLike = __webpack_require__(4916);

var INCORRECT = !setMethodAcceptSetLike('isSubsetOf', function (result) {
  return result;
});

// `Set.prototype.isSubsetOf` method
// https://tc39.es/ecma262/#sec-set.prototype.issubsetof
$({ target: 'Set', proto: true, real: true, forced: INCORRECT }, {
  isSubsetOf: isSubsetOf
});


/***/ }),

/***/ 2475:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var isSupersetOf = __webpack_require__(8527);
var setMethodAcceptSetLike = __webpack_require__(4916);

var INCORRECT = !setMethodAcceptSetLike('isSupersetOf', function (result) {
  return !result;
});

// `Set.prototype.isSupersetOf` method
// https://tc39.es/ecma262/#sec-set.prototype.issupersetof
$({ target: 'Set', proto: true, real: true, forced: INCORRECT }, {
  isSupersetOf: isSupersetOf
});


/***/ }),

/***/ 5024:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var symmetricDifference = __webpack_require__(3650);
var setMethodGetKeysBeforeCloning = __webpack_require__(9835);
var setMethodAcceptSetLike = __webpack_require__(4916);

var FORCED = !setMethodAcceptSetLike('symmetricDifference') || !setMethodGetKeysBeforeCloning('symmetricDifference');

// `Set.prototype.symmetricDifference` method
// https://tc39.es/ecma262/#sec-set.prototype.symmetricdifference
$({ target: 'Set', proto: true, real: true, forced: FORCED }, {
  symmetricDifference: symmetricDifference
});


/***/ }),

/***/ 1698:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {


var $ = __webpack_require__(6518);
var union = __webpack_require__(4204);
var setMethodGetKeysBeforeCloning = __webpack_require__(9835);
var setMethodAcceptSetLike = __webpack_require__(4916);

var FORCED = !setMethodAcceptSetLike('union') || !setMethodGetKeysBeforeCloning('union');

// `Set.prototype.union` method
// https://tc39.es/ecma262/#sec-set.prototype.union
$({ target: 'Set', proto: true, real: true, forced: FORCED }, {
  union: union
});


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	!function() {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	!function() {
/******/ 		__webpack_require__.p = "";
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ entry_lib; }
});

;// ./node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
/* eslint-disable no-var */
// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var currentScript = window.document.currentScript
  if (false) // removed by dead control flow
{ var getCurrentScript; }

  var src = currentScript && currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)
  if (src) {
    __webpack_require__.p = src[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
/* harmony default export */ var setPublicPath = (null);

;// external {"commonjs":"vue","commonjs2":"vue","root":"Vue"}
var external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject = require("vue");
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.iterator.constructor.js
var es_iterator_constructor = __webpack_require__(8111);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.iterator.map.js
var es_iterator_map = __webpack_require__(1701);
;// ./src/DocumentEditor/core/utils.js


// Pure utility functions (no dependencies)

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
function new_uuid() {
  return Math.random().toString(36).slice(-5);
}
function css_to_string(css) {
  return Object.entries(css).map(([k, v]) => k.replace(/[A-Z]/g, match => "-" + match.toLowerCase()) + ":" + v).join(';');
}
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.iterator.find.js
var es_iterator_find = __webpack_require__(116);
;// ./src/DocumentEditor/core/page-layout.js


// Page positioning, sizing, and DOM management

function setupPageLayout(ctx) {
  const {
    state,
    props,
    refs
  } = ctx;
  ctx.page_style = function (page_idx, allow_overflow) {
    const px_in_mm = 0.2645833333333;
    const page_width = props.page_format_mm[0] / px_in_mm;
    const page_spacing_mm = 10;
    const page_with_plus_spacing = (page_spacing_mm + props.page_format_mm[0]) * props.zoom / px_in_mm;
    const view_padding = 20;
    const inner_width = state.editor_width - 2 * view_padding;
    let nb_pages_x = 1,
      page_column,
      x_pos,
      x_ofx,
      left_px,
      top_mm,
      bkg_width_mm,
      bkg_height_mm;
    if (props.display == "horizontal") {
      if (inner_width > state.pages.length * page_with_plus_spacing) {
        nb_pages_x = Math.floor(inner_width / page_with_plus_spacing);
        left_px = inner_width / (nb_pages_x * 2) * (1 + page_idx * 2) - page_width / 2;
      } else {
        nb_pages_x = state.pages.length;
        left_px = page_with_plus_spacing * page_idx + page_width / 2 * (props.zoom - 1);
      }
      top_mm = 0;
      bkg_width_mm = props.zoom * (props.page_format_mm[0] * nb_pages_x + (nb_pages_x - 1) * page_spacing_mm);
      bkg_height_mm = props.page_format_mm[1] * props.zoom;
    } else {
      nb_pages_x = Math.floor(inner_width / page_with_plus_spacing);
      if (nb_pages_x < 1 || props.display == "vertical") nb_pages_x = 1;
      page_column = page_idx % nb_pages_x;
      x_pos = inner_width / (nb_pages_x * 2) * (1 + page_column * 2) - page_width / 2;
      x_ofx = Math.max(0, (page_width * props.zoom - inner_width) / 2);
      left_px = x_pos + x_ofx;
      top_mm = (props.page_format_mm[1] + page_spacing_mm) * props.zoom * Math.floor(page_idx / nb_pages_x);
      const nb_pages_y = Math.ceil(state.pages.length / nb_pages_x);
      bkg_width_mm = props.zoom * (props.page_format_mm[0] * nb_pages_x + (nb_pages_x - 1) * page_spacing_mm);
      bkg_height_mm = props.zoom * (props.page_format_mm[1] * nb_pages_y + (nb_pages_y - 1) * page_spacing_mm);
    }
    if (page_idx >= 0) {
      const epm = ctx.effective_page_margins.value;
      const style = {
        position: "absolute",
        left: "calc(" + left_px + "px + " + view_padding + "px)",
        top: "calc(" + top_mm + "mm + " + view_padding + "px)",
        width: props.page_format_mm[0] + "mm",
        padding: typeof epm == "function" ? epm(page_idx + 1, state.pages.length) : epm,
        transform: "scale(" + props.zoom + ")"
      };
      style[allow_overflow ? "minHeight" : "height"] = props.page_format_mm[1] + "mm";
      return style;
    } else {
      return {
        width: "calc(" + bkg_width_mm + "mm + " + 2 * view_padding + "px)",
        height: "calc(" + bkg_height_mm + "mm + " + 2 * view_padding + "px)"
      };
    }
  };
  ctx.update_pages_elts = function () {
    const deleted_pages = [...refs.content.value.children].filter(page_elt => !state.pages.find(page => page.elt == page_elt));
    for (const page_elt of deleted_pages) {
      page_elt.remove();
    }
    for (const [page_idx, page] of state.pages.entries()) {
      if (!page.elt) {
        page.elt = document.createElement("div");
        page.elt.className = "page";
        page.elt.dataset.isVDEPage = "";
        const next_page = state.pages[page_idx + 1];
        refs.content.value.insertBefore(page.elt, next_page ? next_page.elt : null);
      }
      page.elt.dataset.contentIdx = page.content_idx;
      if (!state.printing_mode) page.elt.style = css_to_string(ctx.page_style(page_idx, page.template ? false : true));
      page.elt.contentEditable = props.editable && !page.template ? true : false;
    }
  };
  ctx.update_editor_width = function () {
    refs.editor.value.classList.add("hide_children");
    state.editor_width = refs.editor.value.clientWidth;
    ctx.update_pages_elts();
    refs.editor.value.classList.remove("hide_children");
  };
  ctx.update_css_media_style = function () {
    ctx.css_media_style.value.innerHTML = "@media print { @page { size: " + props.page_format_mm[0] + "mm " + props.page_format_mm[1] + "mm; margin: 0 !important; } .hidden-print { display: none !important; } }";
  };
}
;// ./src/DocumentEditor/core/virtual-scroll.js
// Virtual scrolling: viewport-based page virtualization

function setupVirtualScroll(ctx) {
  const {
    state,
    props,
    refs
  } = ctx;
  ctx.get_scroll_container = function () {
    let el = refs.editor.value;
    while (el) {
      const style = window.getComputedStyle(el);
      if (style.overflow === 'auto' || style.overflow === 'scroll' || style.overflowY === 'auto' || style.overflowY === 'scroll') {
        return el;
      }
      el = el.parentElement;
    }
    return window;
  };
  ctx.calculate_visible_range = function () {
    const px_in_mm = 0.2645833333333;
    const page_height_px = (props.page_format_mm[1] + 10) * props.zoom / px_in_mm;
    const container = ctx.get_scroll_container();
    let scroll_top, viewport_height;
    if (container === window) {
      scroll_top = window.scrollY || document.documentElement.scrollTop;
      viewport_height = window.innerHeight;
    } else {
      scroll_top = container.scrollTop;
      viewport_height = container.clientHeight;
    }
    const view_padding = 20;
    const inner_width = state.editor_width - 2 * view_padding;
    const page_with_plus_spacing = (10 + props.page_format_mm[0]) * props.zoom / px_in_mm;
    let nb_pages_x = 1;
    if (props.display === "horizontal") {
      nb_pages_x = state.pages.length;
    } else {
      nb_pages_x = Math.floor(inner_width / page_with_plus_spacing);
      if (nb_pages_x < 1 || props.display === "vertical") nb_pages_x = 1;
    }
    if (props.display === "horizontal") {
      return {
        start: 0,
        end: state.pages.length - 1
      };
    }
    const first_visible_row = Math.max(0, Math.floor((scroll_top - view_padding) / page_height_px));
    const last_visible_row = Math.floor((scroll_top + viewport_height) / page_height_px);
    const buffer = 2;
    const start = Math.max(0, (first_visible_row - buffer) * nb_pages_x);
    const end = Math.min(state.pages.length - 1, (last_visible_row + buffer + 1) * nb_pages_x - 1);
    return {
      start,
      end
    };
  };
  ctx.virtualize_pages = function () {
    if (!state.virtualization_enabled || state.printing_mode) return;
    const range = ctx.calculate_visible_range();
    state.visible_range = range;
    for (let i = 0; i < state.pages.length; i++) {
      const page = state.pages[i];
      if (!page.elt) continue;
      const is_in_range = i >= range.start && i <= range.end;
      if (!is_in_range && !page.nao_renderizada && !page.template) {
        page.cached_html = page.elt.innerHTML;
        page.elt.innerHTML = '';
        page.nao_renderizada = true;
        page.elt.classList.add('nao-renderizada');
      } else if (is_in_range && page.nao_renderizada) {
        if (page.cached_html != null) {
          page.elt.innerHTML = page.cached_html;
          page.cached_html = null;
        }
        page.nao_renderizada = false;
        page.elt.classList.remove('nao-renderizada');
      }
    }
  };
  ctx.on_scroll = function () {
    if (!state.virtualization_enabled || state.printing_mode) return;
    ctx.virtualize_pages();
    ctx._update_page_statuses();
  };
}
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.iterator.filter.js
var es_iterator_filter = __webpack_require__(2489);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.set.difference.v2.js
var es_set_difference_v2 = __webpack_require__(7642);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.set.intersection.v2.js
var es_set_intersection_v2 = __webpack_require__(8004);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.set.is-disjoint-from.v2.js
var es_set_is_disjoint_from_v2 = __webpack_require__(3853);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.set.is-subset-of.v2.js
var es_set_is_subset_of_v2 = __webpack_require__(5876);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.set.is-superset-of.v2.js
var es_set_is_superset_of_v2 = __webpack_require__(2475);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.set.symmetric-difference.v2.js
var es_set_symmetric_difference_v2 = __webpack_require__(5024);
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.set.union.v2.js
var es_set_union_v2 = __webpack_require__(1698);
;// ./src/DocumentEditor/core/overlays.js










// Progress indicators, paste overlays, and page status overlays

function setupOverlays(ctx) {
  const {
    state,
    refs
  } = ctx;
  ctx._show_progress = function (current_page, total_pages) {
    const el = refs.progress_indicator.value;
    const txt = refs.progress_text.value;
    if (el) el.style.display = 'flex';
    if (txt) txt.textContent = `Atualizando página ${current_page + 1}/${total_pages}`;
  };
  ctx._hide_progress = function () {
    const el = refs.progress_indicator.value;
    if (el) el.style.display = 'none';
  };
  ctx._show_paste_overlay = function (text) {
    const el = refs.paste_overlay.value;
    const txt = refs.paste_text.value;
    if (el) el.style.display = 'flex';
    if (txt) txt.textContent = text;
  };
  ctx._hide_paste_overlay = function () {
    const el = refs.paste_overlay.value;
    if (el) el.style.display = 'none';
  };
  ctx._update_page_statuses = function () {
    const editing_idx = ctx._get_editing_page_idx();
    const visible = ctx.calculate_visible_range();
    for (let i = 0; i < state.pages.length; i++) {
      const page = state.pages[i];
      let status;
      if (ctx._dirty_from_page === null || i < ctx._dirty_from_page) {
        if (i === editing_idx || i === editing_idx + 1) {
          status = 'editing';
        } else {
          status = 'ready';
        }
      } else {
        if (i >= visible.start && i <= visible.end) {
          status = 'loading';
        } else {
          status = 'await';
        }
      }
      page.pg_status = status;
    }
    ctx._render_page_status_overlays();
  };
  ctx._render_page_status_overlays = function () {
    if (!ctx._status_overlay_container) {
      ctx._status_overlay_container = document.createElement('div');
      ctx._status_overlay_container.className = 'page-status-overlays';
      refs.editor.value.appendChild(ctx._status_overlay_container);
    }
    if (state._paste_in_progress) {
      ctx._status_overlay_container.innerHTML = '';
      return;
    }
    const overlay_pages = state.pages.filter(p => p.pg_status === 'loading' || p.pg_status === 'await');
    const overlay_uuids = new Set(overlay_pages.map(p => p.uuid));
    const existing_overlays = [...ctx._status_overlay_container.children];
    for (const el of existing_overlays) {
      if (!overlay_uuids.has(el.dataset.pageUuid)) {
        el.remove();
      }
    }
    for (const [page_idx, page] of state.pages.entries()) {
      if (page.pg_status !== 'loading' && page.pg_status !== 'await') continue;
      let overlay_el = ctx._status_overlay_container.querySelector(`[data-page-uuid="${page.uuid}"]`);
      if (!overlay_el) {
        overlay_el = document.createElement('div');
        overlay_el.className = 'page-status-overlay';
        overlay_el.dataset.pageUuid = page.uuid;
        ctx._status_overlay_container.appendChild(overlay_el);
      }
      overlay_el.classList.toggle('pg-loading', page.pg_status === 'loading');
      overlay_el.classList.toggle('pg-await', page.pg_status === 'await');
      if (page.pg_status === 'loading' && !overlay_el.querySelector('.status-spinner')) {
        overlay_el.innerHTML = '<div class="status-spinner"></div>';
      } else if (page.pg_status === 'await' && !overlay_el.querySelector('.status-await-icon')) {
        overlay_el.innerHTML = '<div class="status-await-icon"></div>';
      }
      const style = ctx.page_style(page_idx, false);
      overlay_el.style = css_to_string(style);
      overlay_el.style.overflow = 'hidden';
    }
  };
  ctx._clear_page_statuses = function () {
    if (ctx._status_overlay_container) {
      ctx._status_overlay_container.innerHTML = '';
    }
    for (const page of state.pages) {
      page.pg_status = 'ready';
    }
  };
}
// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.push.js
var es_array_push = __webpack_require__(4114);
;// ./src/DocumentEditor/core/deferred-reflow.js

// Deferred reflow: background page processing with rAF+setTimeout pattern

function setupDeferredReflow(ctx) {
  const {
    state,
    refs
  } = ctx;
  ctx._cancel_deferred_reflow = function () {
    if (ctx._deferred_raf_id) {
      cancelAnimationFrame(ctx._deferred_raf_id);
      ctx._deferred_raf_id = null;
    }
  };

  // Pre-splits pages whose content is much larger than page height into roughly page-sized chunks
  ctx._pre_split_large_pages = function () {
    if (!state.pages_height) return;
    let did_split = false;
    for (let pi = 0; pi < state.pages.length; pi++) {
      const page = state.pages[pi];
      if (page.template) continue;
      const scroll_h = page.elt.scrollHeight;
      const ratio = scroll_h / state.pages_height;
      if (ratio <= 3) continue;
      const wrapper = page.elt.firstChild;
      if (!wrapper || !wrapper.children || wrapper.children.length < 2) continue;
      const children = [...wrapper.children];
      const est_pages = state._import_page_count && state._import_page_count > ratio ? state._import_page_count : Math.ceil(ratio);
      const per_page = Math.max(1, Math.ceil(children.length / est_pages));
      const num_new_pages = Math.ceil(children.length / per_page) - 1;
      if (num_new_pages < 1) continue;
      const new_pages = [];
      for (let i = 0; i < num_new_pages; i++) {
        new_pages.push({
          uuid: new_uuid(),
          content_idx: page.content_idx
        });
      }
      state.pages.splice(pi + 1, 0, ...new_pages);
      ctx.update_pages_elts();
      for (let g = 0; g < num_new_pages; g++) {
        const target = state.pages[pi + 1 + g];
        const new_wrapper = document.createElement('div');
        const start = (g + 1) * per_page;
        const end = Math.min((g + 2) * per_page, children.length);
        for (let ci = start; ci < end; ci++) {
          new_wrapper.appendChild(children[ci]);
        }
        target.elt.appendChild(new_wrapper);
      }
      pi += num_new_pages;
      did_split = true;
    }
    if (did_split) {
      for (const page of state.pages) {
        refs.content.value.appendChild(page.elt);
      }
    }
  };
  ctx._schedule_deferred_reflow = function () {
    ctx._cancel_deferred_reflow();
    ctx._deferred_raf_id = requestAnimationFrame(() => {
      setTimeout(() => {
        ctx._deferred_raf_id = null;
        ctx._deferred_reflow_step();
      }, 0);
    });
  };
  ctx._deferred_reflow_step = function () {
    if (ctx._dirty_from_page === null || ctx._dirty_from_page >= state.pages.length) {
      ctx._dirty_from_page = null;
      ctx._update_page_statuses();
      ctx._hide_progress();
      if (state._paste_in_progress) {
        state._paste_in_progress = false;
        ctx._hide_paste_overlay();
      }
      state._import_page_count = 0;
      ctx.emit_new_content();
      return;
    }
    const total_pages = state._import_page_count && state._import_page_count > state.pages.length ? state._import_page_count : state.pages.length;
    const pct = Math.round(ctx._dirty_from_page / total_pages * 100);
    if (state._paste_in_progress) {
      ctx._show_paste_overlay(`Processando página ${ctx._dirty_from_page + 1} de ${total_pages} (${pct}%)`);
    } else {
      ctx._show_progress(ctx._dirty_from_page, total_pages);
    }
    const batch_size = state._paste_in_progress ? 5 : 1;
    ctx.fit_content_over_pages(batch_size, ctx._dirty_from_page);
    ctx._update_page_statuses();
    if (ctx._dirty_from_page !== null) {
      const pct2 = Math.round(ctx._dirty_from_page / total_pages * 100);
      if (state._paste_in_progress) {
        ctx._show_paste_overlay(`Processando página ${ctx._dirty_from_page + 1} de ${total_pages} (${pct2}%)`);
      } else {
        ctx._show_progress(ctx._dirty_from_page, total_pages);
      }
      ctx._schedule_deferred_reflow();
    } else {
      ctx._hide_progress();
      if (state._paste_in_progress) {
        state._paste_in_progress = false;
        ctx._hide_paste_overlay();
      }
      state._import_page_count = 0;
      ctx.emit_new_content();
    }
  };
}
;// ./src/DocumentEditor/imports/page-transition-mgmt.js
/**
 * Utility function that acts like an Array.filter on childNodes of "container"
 * @param {HTMLElement} container 
 * @param {string} s_tag 
 */
function find_sub_child_sibling_node(container, s_tag) {
  if (!container || !s_tag) return false;
  const child_nodes = container.childNodes;
  for (let i = 0; i < child_nodes.length; i++) {
    if (child_nodes[i].s_tag == s_tag) return child_nodes[i];
  }
  return false;
}

/**
 * This function moves every sub-child of argument "child" to the start of the "child_sibling"
 * argument, beginning from the last child, with word splitting and format preserving.
 * Typically, "child" is the current page which content overflows, and "child_sibling" is the 
 * next page.
 * @param {HTMLElement} child Element to take children from (current page)
 * @param {HTMLElement} child_sibling Element to copy children to (next page)
 * @param {function} stop_condition Check function that returns a boolean if content doesn't overflow anymore
 * @param {function(HTMLElement):boolean?} do_not_break Optional function that receives the current child element and should return true if the child should not be split over two pages but rather be moved directly to the next page
 * @param {boolean?} not_first_child Should be unset. Used internally to let at least one child in the page
 */
function move_children_forward_recursively(child, child_sibling, stop_condition, do_not_break, not_first_child) {
  // if the child still has nodes and the current page still overflows
  while (child.childNodes.length && !stop_condition()) {
    // check if page has only one child tree left
    not_first_child = not_first_child || child.childNodes.length != 1;

    // select the last sub-child
    const sub_child = child.lastChild;

    // if it is a text node, move its content to next page word(/space) by word
    if (sub_child.nodeType == Node.TEXT_NODE) {
      const sub_child_hashes = sub_child.textContent.match(/(\s|\S+)/g);
      const sub_child_continuation = document.createTextNode('');
      child_sibling.prepend(sub_child_continuation);
      const l = sub_child_hashes ? sub_child_hashes.length : 0;
      for (let i = 0; i < l; i++) {
        if (i == l - 1 && !not_first_child) return; // never remove the first word of the page
        sub_child.textContent = sub_child_hashes.slice(0, l - i - 1).join('');
        sub_child_continuation.textContent = sub_child_hashes.slice(l - i - 1, l).join('');
        if (stop_condition()) return;
      }
    }

    // we simply move it to the next page if it is either:
    // - a node with no content (e.g. <img>)
    // - a header title (e.g. <h1>)
    // - a table row (e.g. <tr>)
    // - any element on whose user-custom `do_not_break` function returns true
    else if (!sub_child.childNodes.length || sub_child.tagName.match(/h\d/i) || sub_child.tagName.match(/tr/i) || typeof do_not_break === "function" && do_not_break(sub_child)) {
      // just prevent moving the last child of the page
      if (!not_first_child) {
        console.log("Move-forward: first child reached with no stop condition. Aborting");
        return;
      }
      child_sibling.prepend(sub_child);
    }

    // for every other node that is not text and not the first child, clone it recursively to next page
    else {
      // check if sub child has already been cloned before
      let sub_child_sibling = find_sub_child_sibling_node(child_sibling, sub_child.s_tag);

      // if not, create it and watermark the relationship with a random tag
      if (!sub_child_sibling) {
        if (!sub_child.s_tag) {
          const new_random_tag = Math.random().toString(36).slice(2, 8);
          sub_child.s_tag = new_random_tag;
        }
        sub_child_sibling = sub_child.cloneNode(false);
        sub_child_sibling.s_tag = sub_child.s_tag;
        child_sibling.prepend(sub_child_sibling);
      }

      // then move/clone its children and sub-children recursively
      move_children_forward_recursively(sub_child, sub_child_sibling, stop_condition, do_not_break, not_first_child);
      sub_child_sibling.normalize(); // merge consecutive text nodes
    }

    // if sub_child was a container that was cloned and is now empty, we clean it
    if (child.contains(sub_child)) {
      if (sub_child.childNodes.length == 0 || sub_child.innerHTML == "") child.removeChild(sub_child);else if (!stop_condition()) {
        // the only case when it can be non empty should be when stop_condition is now true
        console.log("sub_child:", sub_child, "that is in child:", child);
        throw Error("Document editor is trying to remove a non-empty sub-child. This " + "is a bug and should not happen. Please report a repeatable set of actions that " + "leaded to this error to https://github.com/motla/vue-document-editor/issues/new");
      }
    }
  }
}

/**
 * This function moves the first element from "next_page_html_div" to the end of "page_html_div", with
 * merging sibling tags previously watermarked by "move_children_forward_recursively", if any.
 * @param {HTMLElement} page_html_div Current page element
 * @param {HTMLElement} next_page_html_div Next page element
 * @param {function} stop_condition Check function that returns a boolean if content overflows
 */
function move_children_backwards_with_merging(page_html_div, next_page_html_div, stop_condition) {
  // loop until content is overflowing
  while (!stop_condition()) {
    // find first child of next page
    const first_child = next_page_html_div.firstChild;

    // merge it at the end of the current page
    var merge_recursively = (container, elt) => {
      // check if child had been splitted (= has a sibling on previous page)
      const elt_sibling = find_sub_child_sibling_node(container, elt.s_tag);
      if (elt_sibling && elt.childNodes.length) {
        // then dig for deeper children, in case of
        merge_recursively(elt_sibling, elt.firstChild);
      }
      // else move the child inside the right container at current page
      else {
        container.append(elt);
        container.normalize();
      }
    };
    merge_recursively(page_html_div, first_child);
  }
}

;// ./src/DocumentEditor/core/reflow-engine.js










// Core reflow engine: reset_content, fit_content_over_pages, content emission



function setupReflowEngine(ctx) {
  const {
    state,
    props,
    emit,
    refs
  } = ctx;
  ctx._get_editing_page_idx = function () {
    const sel = document.getSelection();
    if (!sel || !sel.anchorNode) return 0;
    let node = sel.anchorNode;
    while (node && node.parentElement) {
      if (node.dataset && node.dataset.isVDEPage !== undefined) {
        const idx = state.pages.findIndex(p => p.elt === node);
        return idx >= 0 ? idx : 0;
      }
      node = node.parentElement;
    }
    return 0;
  };
  ctx.reset_content = function () {
    if (ctx._reset_in_progress) return;
    ctx._reset_in_progress = true;
    ctx._cancel_deferred_reflow();
    if (!props.content.length) {
      ctx._reset_in_progress = false;
      emit("update:content", [""]);
      return;
    }
    state.pages = props.content.map((content, content_idx) => ({
      uuid: new_uuid(),
      content_idx,
      template: content.template,
      props: content.props
    }));
    ctx.update_pages_elts();
    const first_page_elt = state.pages[0].elt;
    if (!refs.content.value.contains(first_page_elt)) refs.content.value.appendChild(first_page_elt);
    state.pages_height = first_page_elt.clientHeight + 1;
    for (const page of state.pages) {
      if (!props.content[page.content_idx]) page.elt.innerHTML = "<div><br></div>";else if (typeof props.content[page.content_idx] == "string") page.elt.innerHTML = "<div>" + props.content[page.content_idx] + "</div>";else if (page.template) {
        const componentElement = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.defineCustomElement)(page.template);
        customElements.define('component-' + page.uuid, componentElement);
        page.elt.appendChild(new componentElement({
          modelValue: page.props
        }));
      }
      if (!refs.content.value.contains(page.elt)) refs.content.value.appendChild(page.elt);
    }
    ctx._pre_split_large_pages();
    state._paste_in_progress = true;
    ctx._show_paste_overlay('Processando documento...');
    ctx._dirty_from_page = 0;
    refs.content.value.blur();
    state.virtualization_enabled = true;
    ctx.virtualize_pages();
    ctx._reset_in_progress = false;
    ctx._update_page_statuses();
    if (ctx._dirty_from_page !== null) {
      ctx._schedule_deferred_reflow();
    } else {
      state._paste_in_progress = false;
      ctx._hide_paste_overlay();
    }
  };
  ctx.fit_content_over_pages = function (max_pages, start_from) {
    if (max_pages === undefined) max_pages = Infinity;
    if (start_from === undefined) start_from = 0;
    if (!state.pages_height) return;
    if (ctx._fit_in_progress) return;
    ctx._fit_in_progress = true;
    for (let page_idx = state.pages.length - 1; page_idx >= 0; page_idx--) {
      const page = state.pages[page_idx];
      if (!page.elt || !document.body.contains(page.elt)) state.pages.splice(page_idx, 1);
    }
    if (!state.pages.length) {
      ctx._fit_in_progress = false;
      emit("update:content", [""]);
      return;
    }
    const selection = window.getSelection();
    const start_marker = document.createElement("null");
    const end_marker = document.createElement("null");
    if (selection && selection.rangeCount && selection.anchorNode && !(selection.anchorNode.dataset && selection.anchorNode.dataset.isVDEPage != null)) {
      const range = selection.getRangeAt(0);
      range.insertNode(start_marker);
      range.collapse(false);
      range.insertNode(end_marker);
    }
    const touched_pages = new Set();
    let pages_added_or_removed = false;
    let cascade_truncated = false;
    let prev_page_modified_flag = start_from > 0;
    let cascade_count = 0;
    for (let page_idx = start_from; page_idx < state.pages.length; page_idx++) {
      const page = state.pages[page_idx];
      if (page.nao_renderizada && !prev_page_modified_flag) {
        continue;
      }
      if (max_pages !== Infinity && cascade_count >= max_pages && prev_page_modified_flag) {
        ctx._dirty_from_page = page_idx;
        cascade_truncated = true;
        break;
      }
      if (page.nao_renderizada) {
        if (page.cached_html != null) {
          page.elt.innerHTML = page.cached_html;
          page.cached_html = null;
        }
        page.nao_renderizada = false;
        page.elt.classList.remove('nao-renderizada');
      }
      let next_page = state.pages[page_idx + 1];
      let next_page_elt = next_page ? next_page.elt : null;
      if (next_page && next_page.nao_renderizada && (prev_page_modified_flag || page.elt.innerHTML != page.prev_innerHTML)) {
        if (next_page.cached_html != null) {
          next_page.elt.innerHTML = next_page.cached_html;
          next_page.cached_html = null;
        }
        next_page.nao_renderizada = false;
        next_page.elt.classList.remove('nao-renderizada');
        next_page_elt = next_page.elt;
      }
      if (!page.template && (prev_page_modified_flag || page.elt.innerHTML != page.prev_innerHTML || next_page_elt && !next_page.template && !next_page.nao_renderizada && next_page_elt.innerHTML != next_page.prev_innerHTML)) {
        cascade_count++;
        const next_page_html_before = next_page_elt && !next_page.nao_renderizada ? next_page_elt.innerHTML : null;
        touched_pages.add(page_idx);
        if (page.elt.clientHeight <= state.pages_height && next_page && next_page.content_idx == page.content_idx) {
          move_children_backwards_with_merging(page.elt, next_page_elt, () => !next_page_elt.childNodes.length || page.elt.clientHeight > state.pages_height);
        }
        if (page.elt.clientHeight > state.pages_height) {
          if (!next_page || next_page.content_idx != page.content_idx) {
            next_page = {
              uuid: new_uuid(),
              content_idx: page.content_idx
            };
            state.pages.splice(page_idx + 1, 0, next_page);
            ctx.update_pages_elts();
            next_page_elt = next_page.elt;
            pages_added_or_removed = true;
          }
          move_children_forward_recursively(page.elt, next_page_elt, () => page.elt.clientHeight <= state.pages_height, props.do_not_break);
        }
        if (next_page_elt && next_page.content_idx == page.content_idx && !next_page_elt.childNodes.length) {
          state.pages.splice(page_idx + 1, 1);
          pages_added_or_removed = true;
        }
        const current_next_page = state.pages[page_idx + 1];
        const current_next_elt = current_next_page ? current_next_page.elt : null;
        if (current_next_elt && next_page_html_before !== null && !current_next_page.nao_renderizada && current_next_elt.innerHTML === next_page_html_before) {
          prev_page_modified_flag = false;
        } else {
          prev_page_modified_flag = true;
          if (current_next_page) touched_pages.add(page_idx + 1);
        }
      } else {
        touched_pages.add(page_idx);
      }
    }
    if (!cascade_truncated) {
      ctx._dirty_from_page = null;
    }
    if (pages_added_or_removed) {
      ctx.update_pages_elts();
    }
    for (const page_idx of touched_pages) {
      const page = state.pages[page_idx];
      if (page && !page.template && !page.nao_renderizada) page.elt.normalize();
    }
    if (document.body.contains(start_marker)) {
      const range = document.createRange();
      range.setStart(start_marker, 0);
      if (document.body.contains(end_marker)) range.setEnd(end_marker, 0);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    if (start_marker.parentElement) start_marker.parentElement.removeChild(start_marker);
    if (end_marker.parentElement) end_marker.parentElement.removeChild(end_marker);
    for (const page_idx of touched_pages) {
      const page = state.pages[page_idx];
      if (page && !page.nao_renderizada) {
        page.prev_innerHTML = page.elt.innerHTML;
      }
    }
    if (state.virtualization_enabled) {
      ctx.virtualize_pages();
    }
    ctx._fit_in_progress = false;
  };
  ctx.emit_new_content = function () {
    let removed_pages_flag = false;
    const new_content = props.content.map((item, content_idx) => {
      const pages = state.pages.filter(page => page.content_idx == content_idx);
      if (!pages.length) {
        removed_pages_flag = true;
        return false;
      } else if (typeof item == "string") {
        return pages.map(page => {
          if (page.nao_renderizada && page.cached_html != null) {
            const temp = document.createElement('div');
            temp.innerHTML = page.cached_html;
            let elt = temp;
            while (elt.children.length == 1 && elt.firstChild.tagName && elt.firstChild.tagName.toLowerCase() == "div" && !elt.firstChild.getAttribute("style")) {
              elt = elt.firstChild;
            }
            return elt.innerHTML == "<br>" || elt.innerHTML == "<!---->" ? "" : elt.innerHTML;
          }
          let elt = page.elt;
          while (elt.children.length == 1 && elt.firstChild.tagName && elt.firstChild.tagName.toLowerCase() == "div" && !elt.firstChild.getAttribute("style")) {
            elt = elt.firstChild;
          }
          return elt.innerHTML == "<br>" || elt.innerHTML == "<!---->" ? "" : elt.innerHTML;
        }).join('');
      } else return {
        template: item.template,
        props: {
          ...item.props
        }
      };
    }).filter(item => item !== false);
    if (!removed_pages_flag) state.prevent_next_content_update_from_parent = true;
    emit("update:content", new_content);
  };
}
;// ./src/DocumentEditor/core/input-handler.js

// Input handling (keystrokes, paste) and text style detection

function setupInputHandler(ctx) {
  const {
    state
  } = ctx;
  ctx.process_current_text_style = function () {
    let style = false;
    const sel = window.getSelection();
    if (sel.focusNode) {
      const element = sel.focusNode.tagName ? sel.focusNode : sel.focusNode.parentElement;
      if (element && element.isContentEditable) {
        style = window.getComputedStyle(element);
        style.textDecorationStack = [];
        style.headerLevel = 0;
        style.isList = false;
        let parent = element;
        while (parent) {
          const parent_style = window.getComputedStyle(parent);
          style.textDecorationStack.push(parent_style.textDecoration);
          if (parent_style.display == "list-item") style.isList = true;
          if (!style.headerLevel) {
            for (let i = 1; i <= 6; i++) {
              if (parent.tagName.toUpperCase() == "H" + i) {
                style.headerLevel = i;
                break;
              }
            }
          }
          parent = parent.parentElement;
        }
      }
    }
    state.current_text_style = style;
  };
  ctx._do_input_work = function () {
    ctx._cancel_deferred_reflow();
    ctx.fit_content_over_pages(2);
    ctx.emit_new_content();
    if (ctx._last_input_type != "insertText") ctx.process_current_text_style();
    ctx._update_page_statuses();
    if (ctx._dirty_from_page !== null) {
      ctx._schedule_deferred_reflow();
    } else {
      if (state._paste_in_progress) {
        state._paste_in_progress = false;
        ctx._hide_paste_overlay();
      }
    }
  };
  ctx.onInput = function (e) {
    if (!e) return;
    ctx._last_input_type = e.inputType;
    if (ctx._input_timer) clearTimeout(ctx._input_timer);
    const is_paste = e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop';
    if (is_paste) {
      state._paste_in_progress = true;
      ctx._show_paste_overlay('Colando texto...');
      ctx._input_timer = setTimeout(() => {
        ctx._input_timer = null;
        requestAnimationFrame(() => {
          setTimeout(() => {
            ctx._do_input_work();
          }, 0);
        });
      }, 10);
    } else {
      ctx._input_timer = setTimeout(() => {
        ctx._input_timer = null;
        ctx._do_input_work();
      }, 10);
    }
  };
}
;// ./src/DocumentEditor/core/print.js
// Print management: before_print / after_print

function setupPrint(ctx) {
  const {
    state,
    props,
    refs
  } = ctx;
  ctx.before_print = function () {
    if (state.editing_hf) ctx.stop_editing_hf();
    state.printing_mode = true;
    ctx._cancel_deferred_reflow();
    if (ctx._dirty_from_page !== null) {
      ctx.fit_content_over_pages(Infinity, ctx._dirty_from_page);
      ctx._dirty_from_page = null;
    }
    ctx._clear_page_statuses();
    for (const page of state.pages) {
      if (page.nao_renderizada && page.cached_html != null) {
        page.elt.innerHTML = page.cached_html;
        page.cached_html = null;
        page.nao_renderizada = false;
        page.elt.classList.remove('nao-renderizada');
      }
    }
    ctx._page_body = document.body;
    const print_body = document.createElement("body");
    print_body.style.margin = "0";
    print_body.style.padding = "0";
    print_body.style.background = "white";
    print_body.style.font = window.getComputedStyle(refs.editor.value).font;
    print_body.className = refs.editor.value.className;
    for (const [page_idx, page] of state.pages.entries()) {
      page.elt.style = "";
      page.elt.style.position = "relative";
      const epm = ctx.effective_page_margins.value;
      page.elt.style.padding = typeof epm == "function" ? epm(page_idx + 1, state.pages.length) : epm;
      page.elt.style.breakBefore = page_idx ? "page" : "auto";
      page.elt.style.width = "calc(" + props.page_format_mm[0] + "mm - 2px)";
      page.elt.style.height = "calc(" + props.page_format_mm[1] + "mm - 2px)";
      page.elt.style.boxSizing = "border-box";
      page.elt.style.overflow = "hidden";
      const overlay_elt = state.pages_overlay_refs[page.uuid];
      if (overlay_elt) {
        overlay_elt.style.position = "absolute";
        overlay_elt.style.left = "0";
        overlay_elt.style.top = "0";
        overlay_elt.style.transform = "none";
        overlay_elt.style.padding = "0";
        overlay_elt.style.overflow = "hidden";
        page.elt.prepend(overlay_elt);
      }
      print_body.append(page.elt);
    }
    const return_overlay = document.createElement("div");
    return_overlay.className = "hidden-print";
    return_overlay.style.position = "fixed";
    return_overlay.style.left = "0";
    return_overlay.style.top = "0";
    return_overlay.style.right = "0";
    return_overlay.style.bottom = "0";
    return_overlay.style.display = "flex";
    return_overlay.style.alignItems = "center";
    return_overlay.style.justifyContent = "center";
    return_overlay.style.background = "rgba(255, 255, 255, 0.95)";
    return_overlay.style.cursor = "pointer";
    return_overlay.innerHTML = '<svg width="220" height="220"><path fill="rgba(0, 0, 0, 0.7)" d="M120.774,179.271v40c47.303,0,85.784-38.482,85.784-85.785c0-47.3-38.481-85.782-85.784-85.782H89.282L108.7,28.286L80.417,0L12.713,67.703l67.703,67.701l28.283-28.284L89.282,87.703h31.492c25.246,0,45.784,20.538,45.784,45.783C166.558,158.73,146.02,179.271,120.774,179.271z"/></svg>';
    return_overlay.addEventListener("click", ctx.after_print);
    print_body.append(return_overlay);
    document.body = print_body;
  };
  ctx.after_print = function () {
    state.printing_mode = false;
    for (const [page_idx, page] of state.pages.entries()) {
      page.elt.style = css_to_string(ctx.page_style(page_idx, page.template ? false : true));
      refs.content.value.append(page.elt);
      const overlay_elt = state.pages_overlay_refs[page.uuid];
      if (overlay_elt) {
        overlay_elt.style = css_to_string(ctx.page_style(page_idx, false));
        refs.overlays.value.append(overlay_elt);
      }
    }
    document.body = ctx._page_body;
    ctx.update_editor_width();
    if (state.virtualization_enabled) {
      ctx.virtualize_pages();
    }
  };
}
;// ./src/DocumentEditor/core/header-footer.js
// Header/Footer editing: inline contenteditable h/f zones

function setupHeaderFooter(ctx) {
  const {
    state,
    props,
    emit,
    refs
  } = ctx;
  ctx.start_editing_hf = async function (mode, page_idx) {
    state.editing_hf = mode;
    state.editing_hf_page = page_idx;
    await (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.nextTick)();
    const el = refs.overlays.value && refs.overlays.value.querySelector('.hf-active[contenteditable]');
    if (el) {
      const content = mode === 'header' ? props.header || '' : props.footer || '';
      el.innerHTML = content || '<div><br></div>';
      el.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      ctx._hf_editor_el = el;
    }
  };
  ctx.stop_editing_hf = function () {
    if (!state.editing_hf) return;
    if (ctx._hf_measure_timer) {
      clearTimeout(ctx._hf_measure_timer);
      ctx._hf_measure_timer = null;
    }
    if (ctx._hf_editor_el) {
      let html = ctx._hf_editor_el.innerHTML;
      if (html === '<br>' || html === '<div><br></div>') html = '';
      emit('update:' + state.editing_hf, html);
      ctx._hf_editor_el = null;
    }
    state.editing_hf = null;
    state.editing_hf_page = null;
    (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.nextTick)(() => {
      ctx._measure_hf_heights();
    });
  };
  ctx.on_hf_input = function (mode) {
    if (ctx._hf_editor_el) {
      let html = ctx._hf_editor_el.innerHTML;
      if (html === '<br>' || html === '<div><br></div>') html = '';
      emit('update:' + mode, html);
    }
    if (ctx._hf_measure_timer) clearTimeout(ctx._hf_measure_timer);
    ctx._hf_measure_timer = setTimeout(() => {
      ctx._measure_hf_heights();
    }, 300);
  };
  ctx._measure_hf_heights = function () {
    const px_to_mm = 0.2645833333333;
    const m = ctx.parsed_margins.value;
    const origTop = parseFloat(m.top) || 10;
    const origBottom = parseFloat(m.bottom) || 10;
    let hMM = 0,
      fMM = 0;
    if (state.editing_hf && ctx._hf_editor_el) {
      const elMM = ctx._hf_editor_el.scrollHeight * px_to_mm + 1;
      if (state.editing_hf === 'header') {
        hMM = elMM;
      } else {
        fMM = elMM;
      }
      if (refs.overlays.value) {
        const other = refs.overlays.value.querySelector(state.editing_hf === 'header' ? '.hf-footer:not(.hf-active)' : '.hf-header:not(.hf-active)');
        const otherMM = other ? other.scrollHeight * px_to_mm + 1 : 0;
        if (state.editing_hf === 'header') {
          fMM = otherMM;
        } else {
          hMM = otherMM;
        }
      }
    } else if (refs.overlays.value) {
      const hZone = refs.overlays.value.querySelector('.hf-header');
      const fZone = refs.overlays.value.querySelector('.hf-footer');
      if (hZone) hMM = hZone.scrollHeight * px_to_mm + 1;
      if (fZone) fMM = fZone.scrollHeight * px_to_mm + 1;
    }
    const newTop = Math.ceil(hMM) > origTop ? Math.ceil(hMM) : 0;
    const newBottom = Math.ceil(fMM) > origBottom ? Math.ceil(fMM) : 0;
    if (newTop !== state.hf_top_height_mm || newBottom !== state.hf_bottom_height_mm) {
      state.hf_top_height_mm = newTop;
      state.hf_bottom_height_mm = newBottom;
      (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.nextTick)(() => {
        ctx.update_pages_elts();
        ctx._cancel_deferred_reflow();
        if (!state._paste_in_progress) {
          state._paste_in_progress = true;
          ctx._show_paste_overlay('Processando documento...');
        }
        ctx.fit_content_over_pages(2);
        ctx._update_page_statuses();
        if (ctx._dirty_from_page !== null) {
          ctx._schedule_deferred_reflow();
        } else {
          ctx.emit_new_content();
          if (state.virtualization_enabled) ctx.virtualize_pages();
          state._paste_in_progress = false;
          ctx._hide_paste_overlay();
        }
      });
    }
  };
  ctx.on_content_click = function () {
    if (state.editing_hf) {
      ctx.stop_editing_hf();
    }
  };
}
;// ./src/DocumentEditor/core/use-editor.js










function useEditor(props, emit, refs) {
  // ─── Reactive State ───────────────────────────────────────────────
  const state = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.reactive)({
    pages: [],
    pages_overlay_refs: {},
    pages_height: 0,
    editor_width: 0,
    prevent_next_content_update_from_parent: false,
    current_text_style: false,
    printing_mode: false,
    visible_range: {
      start: 0,
      end: 5
    },
    virtualization_enabled: false,
    editing_hf: null,
    editing_hf_page: null,
    hf_top_height_mm: 0,
    hf_bottom_height_mm: 0,
    _paste_in_progress: false,
    _import_page_count: 0
  });

  // ─── Computed ─────────────────────────────────────────────────────
  const css_media_style = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.computed)(() => {
    const style = document.createElement("style");
    document.head.appendChild(style);
    return style;
  });
  const parsed_margins = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.computed)(() => {
    const m = typeof props.page_margins === 'string' ? props.page_margins : '10mm 15mm';
    const parts = m.trim().split(/\s+/);
    if (parts.length === 1) return {
      top: parts[0],
      right: parts[0],
      bottom: parts[0],
      left: parts[0]
    };
    if (parts.length === 2) return {
      top: parts[0],
      right: parts[1],
      bottom: parts[0],
      left: parts[1]
    };
    if (parts.length === 3) return {
      top: parts[0],
      right: parts[1],
      bottom: parts[2],
      left: parts[1]
    };
    return {
      top: parts[0],
      right: parts[1],
      bottom: parts[2],
      left: parts[3]
    };
  });
  const hf_header_style = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.computed)(() => {
    const m = parsed_margins.value;
    return {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      minHeight: m.top,
      padding: '2mm ' + m.right + ' 2mm ' + m.left,
      boxSizing: 'border-box'
    };
  });
  const hf_footer_style = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.computed)(() => {
    const m = parsed_margins.value;
    return {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      minHeight: m.bottom,
      padding: '2mm ' + m.right + ' 2mm ' + m.left,
      boxSizing: 'border-box'
    };
  });
  const effective_page_margins = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.computed)(() => {
    if (typeof props.page_margins === 'function') return props.page_margins;
    if (!state.hf_top_height_mm && !state.hf_bottom_height_mm) return props.page_margins;
    const m = parsed_margins.value;
    const origTop = parseFloat(m.top) || 10;
    const origBottom = parseFloat(m.bottom) || 10;
    const effTop = state.hf_top_height_mm ? Math.max(origTop, state.hf_top_height_mm) : origTop;
    const effBottom = state.hf_bottom_height_mm ? Math.max(origBottom, state.hf_bottom_height_mm) : origBottom;
    return effTop + 'mm ' + m.right + ' ' + effBottom + 'mm ' + m.left;
  });

  // ─── Shared Context ───────────────────────────────────────────────
  // All sub-modules receive this object and attach their methods to it.
  // This avoids circular dependencies: each module calls ctx.otherMethod().
  const ctx = {
    state,
    props,
    emit,
    refs,
    // Computed refs (accessed as ctx.xxx.value)
    css_media_style,
    parsed_margins,
    effective_page_margins,
    // Non-reactive internal state
    _dirty_from_page: null,
    _deferred_raf_id: null,
    _status_overlay_container: null,
    _hf_editor_el: null,
    _hf_measure_timer: null,
    _input_timer: null,
    _last_input_type: null,
    _page_body: null,
    _reset_in_progress: false,
    _fit_in_progress: false
  };

  // ─── Setup Sub-modules ────────────────────────────────────────────
  setupPageLayout(ctx);
  setupVirtualScroll(ctx);
  setupOverlays(ctx);
  setupDeferredReflow(ctx);
  setupReflowEngine(ctx);
  setupInputHandler(ctx);
  setupPrint(ctx);
  setupHeaderFooter(ctx);

  // ─── Watchers ─────────────────────────────────────────────────────
  (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.watch)(() => props.content, () => {
    if (state.prevent_next_content_update_from_parent) {
      state.prevent_next_content_update_from_parent = false;
    } else ctx.reset_content();
  }, {
    deep: true
  });
  (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.watch)(() => props.display, () => {
    ctx.update_pages_elts();
  });
  (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.watch)(() => props.page_format_mm, () => {
    ctx.update_css_media_style();
    ctx.reset_content();
  });
  (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.watch)(() => props.page_margins, () => {
    ctx.reset_content();
  });
  (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.watch)(() => props.zoom, () => {
    ctx.update_pages_elts();
  });
  (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.watch)(() => props.header, () => {
    if (!state.editing_hf) {
      (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.nextTick)(() => {
        ctx._measure_hf_heights();
      });
    }
  });
  (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.watch)(() => props.footer, () => {
    if (!state.editing_hf) {
      (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.nextTick)(() => {
        ctx._measure_hf_heights();
      });
    }
  });

  // ─── Lifecycle ────────────────────────────────────────────────────
  let _scroll_handler = null;
  let _scroll_container = null;
  (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.onMounted)(() => {
    ctx.update_editor_width();
    ctx.update_css_media_style();
    ctx.reset_content();
    (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.nextTick)(() => {
      ctx._measure_hf_heights();
    });
    window.addEventListener("resize", ctx.update_editor_width);
    window.addEventListener("click", ctx.process_current_text_style);
    window.addEventListener("beforeprint", ctx.before_print);
    window.addEventListener("afterprint", ctx.after_print);
    _scroll_handler = debounce(() => ctx.on_scroll(), 100);
    _scroll_container = ctx.get_scroll_container();
    if (_scroll_container === window) {
      window.addEventListener("scroll", _scroll_handler);
    } else {
      _scroll_container.addEventListener("scroll", _scroll_handler);
    }
  });
  (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.onBeforeUpdate)(() => {
    state.pages_overlay_refs = [];
  });
  (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.onBeforeUnmount)(() => {
    window.removeEventListener("resize", ctx.update_editor_width);
    window.removeEventListener("click", ctx.process_current_text_style);
    window.removeEventListener("beforeprint", ctx.before_print);
    window.removeEventListener("afterprint", ctx.after_print);
    if (_scroll_handler) {
      if (_scroll_container === window) {
        window.removeEventListener("scroll", _scroll_handler);
      } else if (_scroll_container) {
        _scroll_container.removeEventListener("scroll", _scroll_handler);
      }
    }
    if (ctx._input_timer) clearTimeout(ctx._input_timer);
    ctx._cancel_deferred_reflow();
  });

  // ─── Return Public API ────────────────────────────────────────────
  return {
    state,
    hf_header_style,
    hf_footer_style,
    page_style: ctx.page_style,
    process_current_text_style: ctx.process_current_text_style,
    start_editing_hf: ctx.start_editing_hf,
    stop_editing_hf: ctx.stop_editing_hf,
    on_hf_input: ctx.on_hf_input,
    on_content_click: ctx.on_content_click,
    onInput: ctx.onInput,
    reset_content: ctx.reset_content,
    _show_paste_overlay: ctx._show_paste_overlay,
    _hide_paste_overlay: ctx._hide_paste_overlay
  };
}
;// ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/DocumentEditor/DocumentEditor.vue?vue&type=script&setup=true&lang=js

const _hoisted_1 = ["innerHTML", "onDblclick"];
const _hoisted_2 = ["innerHTML", "onDblclick"];
const _hoisted_3 = ["innerHTML"];
const _hoisted_4 = ["contenteditable"];
const _hoisted_5 = {
  class: "vde-paste-box"
};


/* harmony default export */ var DocumentEditorvue_type_script_setup_true_lang_js = ({
  __name: 'DocumentEditor',
  props: {
    content: {
      type: Array,
      required: true
    },
    display: {
      type: String,
      default: "grid"
    },
    editable: {
      type: Boolean,
      default: true
    },
    overlay: Function,
    header: {
      type: String,
      default: undefined
    },
    footer: {
      type: String,
      default: undefined
    },
    page_format_mm: {
      type: Array,
      default: () => [210, 297]
    },
    page_margins: {
      type: [String, Function],
      default: "10mm 15mm"
    },
    zoom: {
      type: Number,
      default: 1
    },
    do_not_break: Function
  },
  emits: ['update:content', 'update:header', 'update:footer'],
  setup(__props, {
    expose: __expose,
    emit: __emit
  }) {
    const props = __props;
    const emit = __emit;

    // Template refs
    const editor = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.ref)(null);
    const content = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.ref)(null);
    const overlays = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.ref)(null);
    const progress_indicator = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.ref)(null);
    const progress_text = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.ref)(null);
    const paste_overlay = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.ref)(null);
    const paste_text = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.ref)(null);

    // Composable
    const {
      state,
      hf_header_style,
      hf_footer_style,
      page_style,
      process_current_text_style,
      start_editing_hf,
      stop_editing_hf,
      on_hf_input,
      on_content_click,
      onInput,
      reset_content,
      _show_paste_overlay,
      _hide_paste_overlay
    } = useEditor(props, emit, {
      editor,
      content,
      overlays,
      progress_indicator,
      progress_text,
      paste_overlay,
      paste_text
    });

    // Expose for parent (Demo.vue) access via $refs.editor
    __expose({
      current_text_style: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toRef)(state, 'current_text_style'),
      pages: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toRef)(state, 'pages'),
      _paste_in_progress: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toRef)(state, '_paste_in_progress'),
      _import_page_count: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.toRef)(state, '_import_page_count'),
      _show_paste_overlay,
      _hide_paste_overlay,
      reset_content,
      contentEl: content,
      overlaysEl: overlays
    });
    return (_ctx, _cache) => {
      return (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", {
        class: "editor",
        ref_key: "editor",
        ref: editor
      }, [__props.overlay || __props.header != null || __props.footer != null ? ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", {
        key: 0,
        class: "overlays",
        ref_key: "overlays",
        ref: overlays
      }, [((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(true), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)(external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.Fragment, null, (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.renderList)((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(state).pages, (page, page_idx) => {
        return (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", {
          class: "overlay",
          key: page.uuid + '-overlay',
          ref_for: true,
          ref: elt => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(state).pages_overlay_refs[page.uuid] = elt,
          style: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeStyle)((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(page_style)(page_idx, false))
        }, [__props.header != null ? ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)(external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.Fragment, {
          key: 0
        }, [(0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(state).editing_hf === 'header' && (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(state).editing_hf_page === page_idx ? ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", {
          key: 0,
          class: "hf-zone hf-header hf-active",
          style: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeStyle)((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(hf_header_style)),
          contenteditable: "true",
          onInput: _cache[0] || (_cache[0] = $event => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(on_hf_input)('header')),
          onKeyup: _cache[1] || (_cache[1] = (...args) => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(process_current_text_style) && (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(process_current_text_style)(...args)),
          onKeydown: _cache[2] || (_cache[2] = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.withKeys)((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.withModifiers)((...args) => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(stop_editing_hf) && (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(stop_editing_hf)(...args), ["prevent"]), ["esc"])),
          "data-hf-label": "Cabeçalho"
        }, null, 36)) : ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", {
          key: 1,
          class: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeClass)(["hf-zone hf-header", {
            'hf-dim': (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(state).editing_hf === 'footer'
          }]),
          style: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeStyle)((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(hf_header_style)),
          innerHTML: __props.header,
          onDblclick: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.withModifiers)($event => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(start_editing_hf)('header', page_idx), ["stop"])
        }, null, 46, _hoisted_1))], 64)) : (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createCommentVNode)("", true), __props.footer != null ? ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)(external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.Fragment, {
          key: 1
        }, [(0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(state).editing_hf === 'footer' && (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(state).editing_hf_page === page_idx ? ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", {
          key: 0,
          class: "hf-zone hf-footer hf-active",
          style: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeStyle)((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(hf_footer_style)),
          contenteditable: "true",
          onInput: _cache[3] || (_cache[3] = $event => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(on_hf_input)('footer')),
          onKeyup: _cache[4] || (_cache[4] = (...args) => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(process_current_text_style) && (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(process_current_text_style)(...args)),
          onKeydown: _cache[5] || (_cache[5] = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.withKeys)((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.withModifiers)((...args) => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(stop_editing_hf) && (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(stop_editing_hf)(...args), ["prevent"]), ["esc"])),
          "data-hf-label": "Rodapé"
        }, null, 36)) : ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", {
          key: 1,
          class: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeClass)(["hf-zone hf-footer", {
            'hf-dim': (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(state).editing_hf === 'header'
          }]),
          style: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeStyle)((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(hf_footer_style)),
          innerHTML: __props.footer,
          onDblclick: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.withModifiers)($event => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(start_editing_hf)('footer', page_idx), ["stop"])
        }, null, 46, _hoisted_2))], 64)) : (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createCommentVNode)("", true), __props.overlay ? ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", {
          key: 2,
          innerHTML: __props.overlay(page_idx + 1, (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(state).pages.length),
          style: {
            "pointer-events": "none"
          }
        }, null, 8, _hoisted_3)) : (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createCommentVNode)("", true)], 4);
      }), 128))], 512)) : (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createCommentVNode)("", true), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", {
        class: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeClass)(["content", {
          'hf-body-dim': !!(0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(state).editing_hf
        }]),
        ref_key: "content",
        ref: content,
        contenteditable: __props.editable && !(0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(state).editing_hf,
        style: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeStyle)((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(page_style)(-1)),
        onInput: _cache[6] || (_cache[6] = (...args) => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(onInput) && (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(onInput)(...args)),
        onKeyup: _cache[7] || (_cache[7] = (...args) => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(process_current_text_style) && (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(process_current_text_style)(...args)),
        onClick: _cache[8] || (_cache[8] = (...args) => (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(on_content_click) && (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.unref)(on_content_click)(...args))
      }, null, 46, _hoisted_4), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", {
        class: "vde-progress-indicator",
        ref_key: "progress_indicator",
        ref: progress_indicator
      }, [_cache[9] || (_cache[9] = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", {
        class: "vde-progress-spinner"
      }, null, -1)), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("span", {
        class: "vde-progress-text",
        ref_key: "progress_text",
        ref: progress_text
      }, null, 512)], 512), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", {
        class: "vde-paste-overlay",
        ref_key: "paste_overlay",
        ref: paste_overlay
      }, [(0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", _hoisted_5, [_cache[10] || (_cache[10] = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", {
        class: "vde-paste-spinner"
      }, null, -1)), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("span", {
        class: "vde-paste-text",
        ref_key: "paste_text",
        ref: paste_text
      }, "Colando texto...", 512)])], 512)], 512);
    };
  }
});
;// ./src/DocumentEditor/DocumentEditor.vue?vue&type=script&setup=true&lang=js
 
;// ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-12.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-12.use[1]!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-12.use[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/DocumentEditor/DocumentEditor.vue?vue&type=style&index=0&id=72b617c0&lang=css
// extracted by mini-css-extract-plugin

;// ./src/DocumentEditor/DocumentEditor.vue?vue&type=style&index=0&id=72b617c0&lang=css

;// ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-12.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-12.use[1]!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-12.use[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/DocumentEditor/DocumentEditor.vue?vue&type=style&index=1&id=72b617c0&scoped=true&lang=css
// extracted by mini-css-extract-plugin

;// ./src/DocumentEditor/DocumentEditor.vue?vue&type=style&index=1&id=72b617c0&scoped=true&lang=css

// EXTERNAL MODULE: ./node_modules/vue-loader/dist/exportHelper.js
var exportHelper = __webpack_require__(6262);
;// ./src/DocumentEditor/DocumentEditor.vue



;



const __exports__ = /*#__PURE__*/(0,exportHelper/* default */.A)(DocumentEditorvue_type_script_setup_true_lang_js, [['__scopeId',"data-v-72b617c0"]])

/* harmony default export */ var DocumentEditor = (__exports__);
;// ./node_modules/@vue/cli-service/lib/commands/build/entry-lib.js


/* harmony default export */ var entry_lib = (DocumentEditor);


module.exports = __webpack_exports__["default"];
/******/ })()
;
//# sourceMappingURL=VueDocumentEditor.common.js.map