/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 9662:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var isCallable = __webpack_require__(614);
var tryToString = __webpack_require__(6330);

var $TypeError = TypeError;

// `Assert: IsCallable(argument) is true`
module.exports = function (argument) {
  if (isCallable(argument)) return argument;
  throw $TypeError(tryToString(argument) + ' is not a function');
};


/***/ }),

/***/ 9670:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var isObject = __webpack_require__(111);

var $String = String;
var $TypeError = TypeError;

// `Assert: Type(argument) is Object`
module.exports = function (argument) {
  if (isObject(argument)) return argument;
  throw $TypeError($String(argument) + ' is not an object');
};


/***/ }),

/***/ 1318:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var toIndexedObject = __webpack_require__(5656);
var toAbsoluteIndex = __webpack_require__(1400);
var lengthOfArrayLike = __webpack_require__(6244);

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = lengthOfArrayLike(O);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value != value) return true;
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

/***/ 3658:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var DESCRIPTORS = __webpack_require__(9781);
var isArray = __webpack_require__(3157);

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
    throw $TypeError('Cannot set read only .length');
  } return O.length = length;
} : function (O, length) {
  return O.length = length;
};


/***/ }),

/***/ 4326:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var uncurryThis = __webpack_require__(1702);

var toString = uncurryThis({}.toString);
var stringSlice = uncurryThis(''.slice);

module.exports = function (it) {
  return stringSlice(toString(it), 8, -1);
};


/***/ }),

/***/ 9920:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var hasOwn = __webpack_require__(2597);
var ownKeys = __webpack_require__(3887);
var getOwnPropertyDescriptorModule = __webpack_require__(1236);
var definePropertyModule = __webpack_require__(3070);

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

/***/ 8880:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(9781);
var definePropertyModule = __webpack_require__(3070);
var createPropertyDescriptor = __webpack_require__(9114);

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ 9114:
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

/***/ 8052:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var isCallable = __webpack_require__(614);
var definePropertyModule = __webpack_require__(3070);
var makeBuiltIn = __webpack_require__(6339);
var defineGlobalProperty = __webpack_require__(3072);

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

/***/ 3072:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var global = __webpack_require__(7854);

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;

module.exports = function (key, value) {
  try {
    defineProperty(global, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),

/***/ 9781:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var fails = __webpack_require__(7293);

// Detect IE8's incomplete defineProperty implementation
module.exports = !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});


/***/ }),

/***/ 4154:
/***/ (function(module) {

var documentAll = typeof document == 'object' && document.all;

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
var IS_HTMLDDA = typeof documentAll == 'undefined' && documentAll !== undefined;

module.exports = {
  all: documentAll,
  IS_HTMLDDA: IS_HTMLDDA
};


/***/ }),

/***/ 317:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var global = __webpack_require__(7854);
var isObject = __webpack_require__(111);

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),

/***/ 7207:
/***/ (function(module) {

var $TypeError = TypeError;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

module.exports = function (it) {
  if (it > MAX_SAFE_INTEGER) throw $TypeError('Maximum allowed index exceeded');
  return it;
};


/***/ }),

/***/ 8113:
/***/ (function(module) {

module.exports = typeof navigator != 'undefined' && String(navigator.userAgent) || '';


/***/ }),

/***/ 7392:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var global = __webpack_require__(7854);
var userAgent = __webpack_require__(8113);

var process = global.process;
var Deno = global.Deno;
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

/***/ 748:
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

/***/ 2109:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var global = __webpack_require__(7854);
var getOwnPropertyDescriptor = (__webpack_require__(1236).f);
var createNonEnumerableProperty = __webpack_require__(8880);
var defineBuiltIn = __webpack_require__(8052);
var defineGlobalProperty = __webpack_require__(3072);
var copyConstructorProperties = __webpack_require__(9920);
var isForced = __webpack_require__(4705);

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
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
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

/***/ 7293:
/***/ (function(module) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),

/***/ 4374:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var fails = __webpack_require__(7293);

module.exports = !fails(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});


/***/ }),

/***/ 6916:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var NATIVE_BIND = __webpack_require__(4374);

var call = Function.prototype.call;

module.exports = NATIVE_BIND ? call.bind(call) : function () {
  return call.apply(call, arguments);
};


/***/ }),

/***/ 6530:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(9781);
var hasOwn = __webpack_require__(2597);

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

/***/ 1702:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var NATIVE_BIND = __webpack_require__(4374);

var FunctionPrototype = Function.prototype;
var call = FunctionPrototype.call;
var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);

module.exports = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
  return function () {
    return call.apply(fn, arguments);
  };
};


/***/ }),

/***/ 5005:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var global = __webpack_require__(7854);
var isCallable = __webpack_require__(614);

var aFunction = function (argument) {
  return isCallable(argument) ? argument : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global[namespace]) : global[namespace] && global[namespace][method];
};


/***/ }),

/***/ 8173:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var aCallable = __webpack_require__(9662);
var isNullOrUndefined = __webpack_require__(8554);

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
module.exports = function (V, P) {
  var func = V[P];
  return isNullOrUndefined(func) ? undefined : aCallable(func);
};


/***/ }),

/***/ 7854:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof __webpack_require__.g == 'object' && __webpack_require__.g) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || this || Function('return this')();


/***/ }),

/***/ 2597:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var uncurryThis = __webpack_require__(1702);
var toObject = __webpack_require__(7908);

var hasOwnProperty = uncurryThis({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
module.exports = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject(it), key);
};


/***/ }),

/***/ 3501:
/***/ (function(module) {

module.exports = {};


/***/ }),

/***/ 4664:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(9781);
var fails = __webpack_require__(7293);
var createElement = __webpack_require__(317);

// Thanks to IE8 for its funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});


/***/ }),

/***/ 8361:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var uncurryThis = __webpack_require__(1702);
var fails = __webpack_require__(7293);
var classof = __webpack_require__(4326);

var $Object = Object;
var split = uncurryThis(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split(it, '') : $Object(it);
} : $Object;


/***/ }),

/***/ 2788:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var uncurryThis = __webpack_require__(1702);
var isCallable = __webpack_require__(614);
var store = __webpack_require__(5465);

var functionToString = uncurryThis(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable(store.inspectSource)) {
  store.inspectSource = function (it) {
    return functionToString(it);
  };
}

module.exports = store.inspectSource;


/***/ }),

/***/ 9909:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var NATIVE_WEAK_MAP = __webpack_require__(4811);
var global = __webpack_require__(7854);
var isObject = __webpack_require__(111);
var createNonEnumerableProperty = __webpack_require__(8880);
var hasOwn = __webpack_require__(2597);
var shared = __webpack_require__(5465);
var sharedKey = __webpack_require__(6200);
var hiddenKeys = __webpack_require__(3501);

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError = global.TypeError;
var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
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
    if (store.has(it)) throw TypeError(OBJECT_ALREADY_INITIALIZED);
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
    if (hasOwn(it, STATE)) throw TypeError(OBJECT_ALREADY_INITIALIZED);
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

/***/ 3157:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var classof = __webpack_require__(4326);

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
module.exports = Array.isArray || function isArray(argument) {
  return classof(argument) == 'Array';
};


/***/ }),

/***/ 614:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var $documentAll = __webpack_require__(4154);

var documentAll = $documentAll.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
module.exports = $documentAll.IS_HTMLDDA ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};


/***/ }),

/***/ 4705:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var fails = __webpack_require__(7293);
var isCallable = __webpack_require__(614);

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
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

/***/ 8554:
/***/ (function(module) {

// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
module.exports = function (it) {
  return it === null || it === undefined;
};


/***/ }),

/***/ 111:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var isCallable = __webpack_require__(614);
var $documentAll = __webpack_require__(4154);

var documentAll = $documentAll.all;

module.exports = $documentAll.IS_HTMLDDA ? function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it) || it === documentAll;
} : function (it) {
  return typeof it == 'object' ? it !== null : isCallable(it);
};


/***/ }),

/***/ 1913:
/***/ (function(module) {

module.exports = false;


/***/ }),

/***/ 2190:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(5005);
var isCallable = __webpack_require__(614);
var isPrototypeOf = __webpack_require__(7976);
var USE_SYMBOL_AS_UID = __webpack_require__(3307);

var $Object = Object;

module.exports = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn('Symbol');
  return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
};


/***/ }),

/***/ 6244:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var toLength = __webpack_require__(7466);

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
module.exports = function (obj) {
  return toLength(obj.length);
};


/***/ }),

/***/ 6339:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var uncurryThis = __webpack_require__(1702);
var fails = __webpack_require__(7293);
var isCallable = __webpack_require__(614);
var hasOwn = __webpack_require__(2597);
var DESCRIPTORS = __webpack_require__(9781);
var CONFIGURABLE_FUNCTION_NAME = (__webpack_require__(6530).CONFIGURABLE);
var inspectSource = __webpack_require__(2788);
var InternalStateModule = __webpack_require__(9909);

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
    name = '[' + replace($String(name), /^Symbol\(([^)]*)\)/, '$1') + ']';
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

/***/ 4758:
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

/***/ 3070:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(9781);
var IE8_DOM_DEFINE = __webpack_require__(4664);
var V8_PROTOTYPE_DEFINE_BUG = __webpack_require__(3353);
var anObject = __webpack_require__(9670);
var toPropertyKey = __webpack_require__(4948);

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
  if ('get' in Attributes || 'set' in Attributes) throw $TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ 1236:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(9781);
var call = __webpack_require__(6916);
var propertyIsEnumerableModule = __webpack_require__(5296);
var createPropertyDescriptor = __webpack_require__(9114);
var toIndexedObject = __webpack_require__(5656);
var toPropertyKey = __webpack_require__(4948);
var hasOwn = __webpack_require__(2597);
var IE8_DOM_DEFINE = __webpack_require__(4664);

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

/***/ 8006:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

var internalObjectKeys = __webpack_require__(6324);
var enumBugKeys = __webpack_require__(748);

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),

/***/ 5181:
/***/ (function(__unused_webpack_module, exports) {

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ 7976:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var uncurryThis = __webpack_require__(1702);

module.exports = uncurryThis({}.isPrototypeOf);


/***/ }),

/***/ 6324:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var uncurryThis = __webpack_require__(1702);
var hasOwn = __webpack_require__(2597);
var toIndexedObject = __webpack_require__(5656);
var indexOf = (__webpack_require__(1318).indexOf);
var hiddenKeys = __webpack_require__(3501);

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

/***/ 5296:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

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

/***/ 2140:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var call = __webpack_require__(6916);
var isCallable = __webpack_require__(614);
var isObject = __webpack_require__(111);

var $TypeError = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
module.exports = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
  throw $TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ 3887:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(5005);
var uncurryThis = __webpack_require__(1702);
var getOwnPropertyNamesModule = __webpack_require__(8006);
var getOwnPropertySymbolsModule = __webpack_require__(5181);
var anObject = __webpack_require__(9670);

var concat = uncurryThis([].concat);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};


/***/ }),

/***/ 4488:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var isNullOrUndefined = __webpack_require__(8554);

var $TypeError = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (isNullOrUndefined(it)) throw $TypeError("Can't call method on " + it);
  return it;
};


/***/ }),

/***/ 6200:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var shared = __webpack_require__(2309);
var uid = __webpack_require__(9711);

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),

/***/ 5465:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var global = __webpack_require__(7854);
var defineGlobalProperty = __webpack_require__(3072);

var SHARED = '__core-js_shared__';
var store = global[SHARED] || defineGlobalProperty(SHARED, {});

module.exports = store;


/***/ }),

/***/ 2309:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var IS_PURE = __webpack_require__(1913);
var store = __webpack_require__(5465);

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.30.2',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2014-2023 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.30.2/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});


/***/ }),

/***/ 6293:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION = __webpack_require__(7392);
var fails = __webpack_require__(7293);
var global = __webpack_require__(7854);

var $String = global.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  var symbol = Symbol();
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
});


/***/ }),

/***/ 1400:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var toIntegerOrInfinity = __webpack_require__(9303);

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

/***/ 5656:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(8361);
var requireObjectCoercible = __webpack_require__(4488);

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),

/***/ 9303:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var trunc = __webpack_require__(4758);

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
module.exports = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc(number);
};


/***/ }),

/***/ 7466:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var toIntegerOrInfinity = __webpack_require__(9303);

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),

/***/ 7908:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var requireObjectCoercible = __webpack_require__(4488);

var $Object = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
module.exports = function (argument) {
  return $Object(requireObjectCoercible(argument));
};


/***/ }),

/***/ 7593:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var call = __webpack_require__(6916);
var isObject = __webpack_require__(111);
var isSymbol = __webpack_require__(2190);
var getMethod = __webpack_require__(8173);
var ordinaryToPrimitive = __webpack_require__(2140);
var wellKnownSymbol = __webpack_require__(5112);

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
    throw $TypeError("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};


/***/ }),

/***/ 4948:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var toPrimitive = __webpack_require__(7593);
var isSymbol = __webpack_require__(2190);

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
module.exports = function (argument) {
  var key = toPrimitive(argument, 'string');
  return isSymbol(key) ? key : key + '';
};


/***/ }),

/***/ 6330:
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

/***/ 9711:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var uncurryThis = __webpack_require__(1702);

var id = 0;
var postfix = Math.random();
var toString = uncurryThis(1.0.toString);

module.exports = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
};


/***/ }),

/***/ 3307:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL = __webpack_require__(6293);

module.exports = NATIVE_SYMBOL
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';


/***/ }),

/***/ 3353:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(9781);
var fails = __webpack_require__(7293);

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
module.exports = DESCRIPTORS && fails(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype != 42;
});


/***/ }),

/***/ 4811:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var global = __webpack_require__(7854);
var isCallable = __webpack_require__(614);

var WeakMap = global.WeakMap;

module.exports = isCallable(WeakMap) && /native code/.test(String(WeakMap));


/***/ }),

/***/ 5112:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var global = __webpack_require__(7854);
var shared = __webpack_require__(2309);
var hasOwn = __webpack_require__(2597);
var uid = __webpack_require__(9711);
var NATIVE_SYMBOL = __webpack_require__(6293);
var USE_SYMBOL_AS_UID = __webpack_require__(3307);

var Symbol = global.Symbol;
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

/***/ 7658:
/***/ (function(__unused_webpack_module, __unused_webpack_exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(2109);
var toObject = __webpack_require__(7908);
var lengthOfArrayLike = __webpack_require__(6244);
var setArrayLength = __webpack_require__(3658);
var doesNotExceedSafeInteger = __webpack_require__(7207);
var fails = __webpack_require__(7293);

var INCORRECT_TO_LENGTH = fails(function () {
  return [].push.call({ length: 0x100000000 }, 1) !== 4294967297;
});

// V8 and Safari <= 15.4, FF < 23 throws InternalError
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

/***/ 3744:
/***/ (function(__unused_webpack_module, exports) {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
// runtime helper for setting properties on components
// in a tree-shakable way
exports.Z = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
        target[key] = val;
    }
    return target;
};


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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ entry_lib; }
});

;// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
/* eslint-disable no-var */
// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var currentScript = window.document.currentScript
  if (false) { var getCurrentScript; }

  var src = currentScript && currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)
  if (src) {
    __webpack_require__.p = src[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
/* harmony default export */ var setPublicPath = (null);

;// CONCATENATED MODULE: external {"commonjs":"vue","commonjs2":"vue","root":"Vue"}
var external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject = require("vue");
;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/templateLoader.js??ruleSet[1].rules[3]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/DocumentEditor/DocumentEditor.vue?vue&type=template&id=604af7f9&scoped=true

const _withScopeId = n => (_pushScopeId("data-v-604af7f9"), n = n(), _popScopeId(), n);
const _hoisted_1 = {
  class: "editor",
  ref: "editor"
};
const _hoisted_2 = {
  key: 0,
  class: "overlays",
  ref: "overlays"
};
const _hoisted_3 = ["innerHTML"];
const _hoisted_4 = ["contenteditable"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", _hoisted_1, [$props.overlay ? ((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", _hoisted_2, [((0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(true), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)(external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.Fragment, null, (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.renderList)($data.pages, (page, page_idx) => {
    return (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.openBlock)(), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementBlock)("div", {
      class: "overlay",
      key: page.uuid + '-overlay',
      ref_for: true,
      ref: elt => $data.pages_overlay_refs[page.uuid] = elt,
      innerHTML: $props.overlay(page_idx + 1, $data.pages.length),
      style: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeStyle)($options.page_style(page_idx, false))
    }, null, 12, _hoisted_3);
  }), 128))], 512)) : (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createCommentVNode)("", true), (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.createElementVNode)("div", {
    class: "content",
    ref: "content",
    contenteditable: $props.editable,
    style: (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.normalizeStyle)($options.page_style(-1)),
    onInput: _cache[0] || (_cache[0] = (...args) => $options.input && $options.input(...args)),
    onKeyup: _cache[1] || (_cache[1] = (...args) => $options.process_current_text_style && $options.process_current_text_style(...args)),
    onKeydown: _cache[2] || (_cache[2] = (...args) => $options.keydown && $options.keydown(...args))
  }, null, 44, _hoisted_4)], 512);
}
;// CONCATENATED MODULE: ./src/DocumentEditor/DocumentEditor.vue?vue&type=template&id=604af7f9&scoped=true

// EXTERNAL MODULE: ./node_modules/core-js/modules/es.array.push.js
var es_array_push = __webpack_require__(7658);
;// CONCATENATED MODULE: ./src/DocumentEditor/imports/page-transition-mgmt.js
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

;// CONCATENATED MODULE: ./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib/index.js??clonedRuleSet-40.use[1]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/DocumentEditor/DocumentEditor.vue?vue&type=script&lang=js



/* harmony default export */ var DocumentEditorvue_type_script_lang_js = ({
  props: {
    // This contains the initial content of the document that can be synced
    // It must be an Array: each array item is a new set of pages containing the
    // item (string or component). You can see that as predefined page breaks.
    // See the Demo.vue file for a good usage example.
    content: {
      type: Array,
      required: true
    },
    // Display mode of the pages
    display: {
      type: String,
      default: "grid" // ["grid", "horizontal", "vertical"]
    },

    // Sets whether document text can be modified
    editable: {
      type: Boolean,
      default: true
    },
    // Overlay function returning page headers and footers in HTML
    overlay: Function,
    // Pages format in mm (should be an array containing [width, height])
    page_format_mm: {
      type: Array,
      default: () => [210, 297]
    },
    // Page margins in CSS
    page_margins: {
      type: [String, Function],
      default: "10mm 15mm"
    },
    // Display zoom. Only acts on the screen display
    zoom: {
      type: Number,
      default: 1.0
    },
    // "Do not break" test function: should return true on elements you don't want to be split over multiple pages but rather be moved to the next page
    do_not_break: Function
  },
  data() {
    return {
      pages: [],
      // contains {uuid, content_idx, prev_html, template, props, elt} for each pages of the document
      pages_overlay_refs: {},
      // contains page overlay ref elements indexed by uuid
      pages_height: 0,
      // real measured page height in px (corresponding to page_format_mm[1])
      editor_width: 0,
      // real measured with of an empty editor <div> in px
      prevent_next_content_update_from_parent: false,
      // workaround to avoid infinite update loop
      current_text_style: false,
      // contains the style at caret position
      printing_mode: false // flag set when page is rendering in printing mode
    };
  },

  mounted() {
    this.update_editor_width();
    this.update_css_media_style();
    this.reset_content();
    window.addEventListener("resize", this.update_editor_width);
    window.addEventListener("click", this.process_current_text_style);
    window.addEventListener("beforeprint", this.before_print);
    window.addEventListener("afterprint", this.after_print);
  },
  beforeUpdate() {
    this.pages_overlay_refs = [];
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.update_editor_width);
    window.removeEventListener("click", this.process_current_text_style);
    window.removeEventListener("beforeprint", this.before_print);
    window.removeEventListener("afterprint", this.after_print);
  },
  computed: {
    css_media_style() {
      // creates a CSS <style> and returns it
      const style = document.createElement("style");
      document.head.appendChild(style);
      return style;
    }
  },
  methods: {
    // Computes a random 5-char UUID
    new_uuid: () => Math.random().toString(36).slice(-5),
    // Resets all content from the content property
    reset_content() {
      // Prevent launching this function multiple times
      if (this.reset_in_progress) return;
      this.reset_in_progress = true;

      // If provided content is empty, initialize it first and exit
      if (!this.content.length) {
        this.reset_in_progress = false;
        this.$emit("update:content", [""]);
        return;
      }

      // Delete all pages and set one new page per content item
      this.pages = this.content.map((content, content_idx) => ({
        uuid: this.new_uuid(),
        content_idx,
        template: content.template,
        props: content.props
      }));
      this.update_pages_elts();

      // Get page height from first empty page
      const first_page_elt = this.pages[0].elt;
      if (!this.$refs.content.contains(first_page_elt)) this.$refs.content.appendChild(first_page_elt); // restore page in DOM in case it was removed
      this.pages_height = first_page_elt.clientHeight + 1; // allow one pixel precision

      // Initialize text pages
      for (const page of this.pages) {
        // set raw HTML content
        if (!this.content[page.content_idx]) page.elt.innerHTML = "<div><br></div>";else if (typeof this.content[page.content_idx] == "string") page.elt.innerHTML = "<div>" + this.content[page.content_idx] + "</div>";else if (page.template) {
          const componentElement = (0,external_commonjs_vue_commonjs2_vue_root_Vue_namespaceObject.defineCustomElement)(page.template);
          customElements.define('component-' + page.uuid, componentElement);
          page.elt.appendChild(new componentElement({
            modelValue: page.props
          }));
        }

        // restore page in DOM in case it was removed
        if (!this.$refs.content.contains(page.elt)) this.$refs.content.appendChild(page.elt);
      }

      // Spread content over several pages if it overflows
      this.fit_content_over_pages();

      // Remove the text cursor from the content, if any (its position is lost anyway)
      this.$refs.content.blur();

      // Clear "reset in progress" flag
      this.reset_in_progress = false;
    },
    // Spreads the HTML content over several pages until it fits
    fit_content_over_pages() {
      // Data variable this.pages_height must have been set before calling this function
      if (!this.pages_height) return;

      // Prevent launching this function multiple times
      if (this.fit_in_progress) return;
      this.fit_in_progress = true;

      // Check pages that were deleted from the DOM (start from the end)
      for (let page_idx = this.pages.length - 1; page_idx >= 0; page_idx--) {
        const page = this.pages[page_idx];

        // if user deleted the page from the DOM, then remove it from this.pages array
        if (!page.elt || !document.body.contains(page.elt)) this.pages.splice(page_idx, 1);
      }

      // If all the document was wiped out, start a new empty document
      if (!this.pages.length) {
        this.$emit("update:content", [""]);
        return;
      }

      // Save current selection (or cursor position) by inserting empty HTML elements at the start and the end of it
      const selection = window.getSelection();
      const start_marker = document.createElement("null");
      const end_marker = document.createElement("null");
      // don't insert markers in case selection fails (if we are editing in components in the shadow-root it selects the page <div> as anchorNode)
      if (selection && selection.rangeCount && selection.anchorNode && !(selection.anchorNode.dataset && selection.anchorNode.dataset.isVDEPage != null)) {
        const range = selection.getRangeAt(0);
        range.insertNode(start_marker);
        range.collapse(false);
        range.insertNode(end_marker);
      }

      // Browse every remaining page
      let prev_page_modified_flag = false;
      for (let page_idx = 0; page_idx < this.pages.length; page_idx++) {
        // page length can grow inside this loop
        const page = this.pages[page_idx];
        let next_page = this.pages[page_idx + 1];
        let next_page_elt = next_page ? next_page.elt : null;

        // check if this page, the next page, or any previous page content has been modified by the user (don't apply to template pages)
        if (!page.template && (prev_page_modified_flag || page.elt.innerHTML != page.prev_innerHTML || next_page_elt && !next_page.template && next_page_elt.innerHTML != next_page.prev_innerHTML)) {
          prev_page_modified_flag = true;

          // BACKWARD-PROPAGATION
          // check if content doesn't overflow, and that next page exists and has the same content_idx
          if (page.elt.clientHeight <= this.pages_height && next_page && next_page.content_idx == page.content_idx) {
            // try to append every node from the next page until it doesn't fit
            move_children_backwards_with_merging(page.elt, next_page_elt, () => !next_page_elt.childNodes.length || page.elt.clientHeight > this.pages_height);
          }

          // FORWARD-PROPAGATION
          // check if content overflows
          if (page.elt.clientHeight > this.pages_height) {
            // if there is no next page for the same content, create it
            if (!next_page || next_page.content_idx != page.content_idx) {
              next_page = {
                uuid: this.new_uuid(),
                content_idx: page.content_idx
              };
              this.pages.splice(page_idx + 1, 0, next_page);
              this.update_pages_elts();
              next_page_elt = next_page.elt;
            }

            // move the content step by step to the next page, until it fits
            move_children_forward_recursively(page.elt, next_page_elt, () => page.elt.clientHeight <= this.pages_height, this.do_not_break);
          }

          // CLEANING
          // remove next page if it is empty
          if (next_page_elt && next_page.content_idx == page.content_idx && !next_page_elt.childNodes.length) {
            this.pages.splice(page_idx + 1, 1);
          }
        }

        // update pages in the DOM
        this.update_pages_elts();
      }

      // Restore selection and remove empty elements
      if (document.body.contains(start_marker)) {
        const range = document.createRange();
        range.setStart(start_marker, 0);
        if (document.body.contains(end_marker)) range.setEnd(end_marker, 0);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      if (start_marker.parentElement) start_marker.parentElement.removeChild(start_marker);
      if (end_marker.parentElement) end_marker.parentElement.removeChild(end_marker);

      // Normalize and store current page HTML content
      for (const page of this.pages) {
        if (!page.template) page.elt.normalize(); // normalize HTML (merge text nodes) - don't touch template pages or it can break Vue
        page.prev_innerHTML = page.elt.innerHTML; // store current pages innerHTML for next call
      }

      // Clear "fit in progress" flag
      this.fit_in_progress = false;
    },
    // Input event
    input(e) {
      if (!e) return; // check that event is set
      this.fit_content_over_pages(); // fit content according to modifications
      this.emit_new_content(); // emit content modification
      if (e.inputType != "insertText") this.process_current_text_style(); // update current style if it has changed
    },

    // Keydown event
    keydown(e) {
      // if the document is empty, prevent removing the first page container with a backspace input (keycode 8)
      // which is now the default behavior for web browsers
      if (e.keyCode == 8 && this.content.length <= 1 && typeof this.content[0] == "string") {
        const text = this.content[0].replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
        if (!text) e.preventDefault();
      }
    },
    // Emit content change to parent
    emit_new_content() {
      let removed_pages_flag = false; // flag to call reset_content if some pages were removed by the user

      // process the new content
      const new_content = this.content.map((item, content_idx) => {
        // select pages that correspond to this content item (represented by its index in the array)
        const pages = this.pages.filter(page => page.content_idx == content_idx);

        // if there are no pages representing this content (because deleted by the user), mark item as false to remove it
        if (!pages.length) {
          removed_pages_flag = true;
          return false;
        }
        // if item is a string, concatenate each page content and set that
        else if (typeof item == "string") {
          return pages.map(page => {
            // remove any useless <div> surrounding the content
            let elt = page.elt;
            while (elt.children.length == 1 && elt.firstChild.tagName && elt.firstChild.tagName.toLowerCase() == "div" && !elt.firstChild.getAttribute("style")) {
              elt = elt.firstChild;
            }
            return elt.innerHTML;
          }).join('') || false;
        }
        // if item is a component, just clone the item
        else return {
          template: item.template,
          props: {
            ...item.props
          }
        };
      }).filter(item => item != false); // remove empty items

      // avoid calling reset_content after the parent content is updated (infinite loop)
      if (!removed_pages_flag) this.prevent_next_content_update_from_parent = true;

      // send event to parent to update the synced content
      this.$emit("update:content", new_content);
    },
    // Sets current_text_style with CSS style at caret position
    process_current_text_style() {
      let style = false;
      const sel = window.getSelection();
      if (sel.focusNode) {
        const element = sel.focusNode.tagName ? sel.focusNode : sel.focusNode.parentElement;
        if (element && element.isContentEditable) {
          style = window.getComputedStyle(element);

          // compute additional properties
          style.textDecorationStack = []; // array of text-decoration strings from parent elements
          style.headerLevel = 0;
          style.isList = false;
          let parent = element;
          while (parent) {
            const parent_style = window.getComputedStyle(parent);
            // stack CSS text-decoration as it is not overridden by children
            style.textDecorationStack.push(parent_style.textDecoration);
            // check if one parent is a list-item
            if (parent_style.display == "list-item") style.isList = true;
            // get first header level, if any
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
      this.current_text_style = style;
    },
    // Process the specific style (position and size) of each page <div> and content <div>
    page_style(page_idx, allow_overflow) {
      const px_in_mm = 0.2645833333333;
      const page_width = this.page_format_mm[0] / px_in_mm;
      const page_spacing_mm = 10;
      const page_with_plus_spacing = (page_spacing_mm + this.page_format_mm[0]) * this.zoom / px_in_mm;
      const view_padding = 20;
      const inner_width = this.editor_width - 2 * view_padding;
      let nb_pages_x = 1,
        page_column,
        x_pos,
        x_ofx,
        left_px,
        top_mm,
        bkg_width_mm,
        bkg_height_mm;
      if (this.display == "horizontal") {
        if (inner_width > this.pages.length * page_with_plus_spacing) {
          nb_pages_x = Math.floor(inner_width / page_with_plus_spacing);
          left_px = inner_width / (nb_pages_x * 2) * (1 + page_idx * 2) - page_width / 2;
        } else {
          nb_pages_x = this.pages.length;
          left_px = page_with_plus_spacing * page_idx + page_width / 2 * (this.zoom - 1);
        }
        top_mm = 0;
        bkg_width_mm = this.zoom * (this.page_format_mm[0] * nb_pages_x + (nb_pages_x - 1) * page_spacing_mm);
        bkg_height_mm = this.page_format_mm[1] * this.zoom;
      } else {
        // "grid", vertical
        nb_pages_x = Math.floor(inner_width / page_with_plus_spacing);
        if (nb_pages_x < 1 || this.display == "vertical") nb_pages_x = 1;
        page_column = page_idx % nb_pages_x;
        x_pos = inner_width / (nb_pages_x * 2) * (1 + page_column * 2) - page_width / 2;
        x_ofx = Math.max(0, (page_width * this.zoom - inner_width) / 2);
        left_px = x_pos + x_ofx;
        top_mm = (this.page_format_mm[1] + page_spacing_mm) * this.zoom * Math.floor(page_idx / nb_pages_x);
        const nb_pages_y = Math.ceil(this.pages.length / nb_pages_x);
        bkg_width_mm = this.zoom * (this.page_format_mm[0] * nb_pages_x + (nb_pages_x - 1) * page_spacing_mm);
        bkg_height_mm = this.zoom * (this.page_format_mm[1] * nb_pages_y + (nb_pages_y - 1) * page_spacing_mm);
      }
      if (page_idx >= 0) {
        const style = {
          position: "absolute",
          left: "calc(" + left_px + "px + " + view_padding + "px)",
          top: "calc(" + top_mm + "mm + " + view_padding + "px)",
          width: this.page_format_mm[0] + "mm",
          // "height" is set below
          padding: typeof this.page_margins == "function" ? this.page_margins(page_idx + 1, this.pages.length) : this.page_margins,
          transform: "scale(" + this.zoom + ")"
        };
        style[allow_overflow ? "minHeight" : "height"] = this.page_format_mm[1] + "mm";
        return style;
      } else {
        // Content/background <div> is sized so it lets a margin around pages when scrolling at the end
        return {
          width: "calc(" + bkg_width_mm + "mm + " + 2 * view_padding + "px)",
          height: "calc(" + bkg_height_mm + "mm + " + 2 * view_padding + "px)"
        };
      }
    },
    // Utility to convert page_style to CSS string
    css_to_string: css => Object.entries(css).map(([k, v]) => k.replace(/[A-Z]/g, match => "-" + match.toLowerCase()) + ":" + v).join(';'),
    // Update pages <div> from this.pages data
    update_pages_elts() {
      // Removing deleted pages
      const deleted_pages = [...this.$refs.content.children].filter(page_elt => !this.pages.find(page => page.elt == page_elt));
      for (const page_elt of deleted_pages) {
        page_elt.remove();
      }

      // Adding / updating pages
      for (const [page_idx, page] of this.pages.entries()) {
        // Get either existing page_elt or create it
        if (!page.elt) {
          page.elt = document.createElement("div");
          page.elt.className = "page";
          page.elt.dataset.isVDEPage = "";
          const next_page = this.pages[page_idx + 1];
          this.$refs.content.insertBefore(page.elt, next_page ? next_page.elt : null);
        }
        // Update page properties
        page.elt.dataset.contentIdx = page.content_idx;
        if (!this.printing_mode) page.elt.style = Object.entries(this.page_style(page_idx, page.template ? false : true)).map(([k, v]) => k.replace(/[A-Z]/g, match => "-" + match.toLowerCase()) + ":" + v).join(';'); // (convert page_style to CSS string)
        page.elt.contentEditable = this.editable && !page.template ? true : false;
      }
    },
    // Get and store empty editor <div> width
    update_editor_width() {
      this.$refs.editor.classList.add("hide_children");
      this.editor_width = this.$refs.editor.clientWidth;
      this.update_pages_elts();
      this.$refs.editor.classList.remove("hide_children");
    },
    update_css_media_style() {
      this.css_media_style.innerHTML = "@media print { @page { size: " + this.page_format_mm[0] + "mm " + this.page_format_mm[1] + "mm; margin: 0 !important; } .hidden-print { display: none !important; } }";
    },
    // Prepare content before opening the native print box
    before_print() {
      // set the printing mode flag
      this.printing_mode = true;

      // store the current body aside
      this._page_body = document.body;

      // create a new body for the print and overwrite CSS
      const print_body = document.createElement("body");
      print_body.style.margin = "0";
      print_body.style.padding = "0";
      print_body.style.background = "white";
      print_body.style.font = window.getComputedStyle(this.$refs.editor).font;
      print_body.className = this.$refs.editor.className;

      // move each page to the print body
      for (const [page_idx, page] of this.pages.entries()) {
        //const page_clone = page_elt.cloneNode(true);
        page.elt.style = ""; // reset page style for the clone
        page.elt.style.position = "relative";
        page.elt.style.padding = typeof this.page_margins == "function" ? this.page_margins(page_idx + 1, this.pages.length) : this.page_margins;
        page.elt.style.breakBefore = page_idx ? "page" : "auto";
        page.elt.style.width = "calc(" + this.page_format_mm[0] + "mm - 2px)";
        page.elt.style.height = "calc(" + this.page_format_mm[1] + "mm - 2px)";
        page.elt.style.boxSizing = "border-box";
        page.elt.style.overflow = "hidden";

        // add overlays if any
        const overlay_elt = this.pages_overlay_refs[page.uuid];
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

      // display a return arrow to let the user restore the original body in case the navigator doesn't call after_print() (it happens sometimes in Chrome)
      const return_overlay = document.createElement("div");
      return_overlay.className = "hidden-print"; // css managed in update_css_media_style method
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
      return_overlay.addEventListener("click", this.after_print);
      print_body.append(return_overlay);

      // replace current body by the print body
      document.body = print_body;
    },
    // Restore content after closing the native print box
    after_print() {
      // clear the printing mode flag
      this.printing_mode = false;

      // restore pages and overlays
      for (const [page_idx, page] of this.pages.entries()) {
        page.elt.style = this.css_to_string(this.page_style(page_idx, page.template ? false : true));
        this.$refs.content.append(page.elt);
        const overlay_elt = this.pages_overlay_refs[page.uuid];
        if (overlay_elt) {
          overlay_elt.style = this.css_to_string(this.page_style(page_idx, false));
          this.$refs.overlays.append(overlay_elt);
        }
      }
      document.body = this._page_body;

      // recompute editor with and reposition elements
      this.update_editor_width();
    }
  },
  // Watch for changes and adapt content accordingly
  watch: {
    content: {
      handler() {
        // prevent infinite loop as reset_content triggers a content update and it's async
        if (this.prevent_next_content_update_from_parent) {
          this.prevent_next_content_update_from_parent = false;
        } else this.reset_content();
      },
      deep: true
    },
    display: {
      handler() {
        this.update_pages_elts();
      }
    },
    page_format_mm: {
      handler() {
        this.update_css_media_style();
        this.reset_content();
      }
    },
    page_margins: {
      handler() {
        this.reset_content();
      }
    },
    zoom: {
      handler() {
        this.update_pages_elts();
      }
    }
  }
});
;// CONCATENATED MODULE: ./src/DocumentEditor/DocumentEditor.vue?vue&type=script&lang=js
 
;// CONCATENATED MODULE: ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-12.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-12.use[1]!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-12.use[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/DocumentEditor/DocumentEditor.vue?vue&type=style&index=0&id=604af7f9&lang=css
// extracted by mini-css-extract-plugin

;// CONCATENATED MODULE: ./src/DocumentEditor/DocumentEditor.vue?vue&type=style&index=0&id=604af7f9&lang=css

;// CONCATENATED MODULE: ./node_modules/mini-css-extract-plugin/dist/loader.js??clonedRuleSet-12.use[0]!./node_modules/css-loader/dist/cjs.js??clonedRuleSet-12.use[1]!./node_modules/vue-loader/dist/stylePostLoader.js!./node_modules/postcss-loader/dist/cjs.js??clonedRuleSet-12.use[2]!./node_modules/vue-loader/dist/index.js??ruleSet[0].use[0]!./src/DocumentEditor/DocumentEditor.vue?vue&type=style&index=1&id=604af7f9&scoped=true&lang=css
// extracted by mini-css-extract-plugin

;// CONCATENATED MODULE: ./src/DocumentEditor/DocumentEditor.vue?vue&type=style&index=1&id=604af7f9&scoped=true&lang=css

// EXTERNAL MODULE: ./node_modules/vue-loader/dist/exportHelper.js
var exportHelper = __webpack_require__(3744);
;// CONCATENATED MODULE: ./src/DocumentEditor/DocumentEditor.vue




;



const __exports__ = /*#__PURE__*/(0,exportHelper/* default */.Z)(DocumentEditorvue_type_script_lang_js, [['render',render],['__scopeId',"data-v-604af7f9"]])

/* harmony default export */ var DocumentEditor = (__exports__);
;// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/entry-lib.js


/* harmony default export */ var entry_lib = (DocumentEditor);


}();
module.exports = __webpack_exports__["default"];
/******/ })()
;
//# sourceMappingURL=VueDocumentEditor.common.js.map