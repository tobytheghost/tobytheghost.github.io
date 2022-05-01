/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@qubit/poller/lib/create.js":
/*!**************************************************!*\
  !*** ./node_modules/@qubit/poller/lib/create.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var driftwood = __webpack_require__(/*! driftwood */ "./node_modules/driftwood/browser.js")

module.exports = function create (targets, options) {
  var isArray = Array.isArray(targets)
  return {
    targets: isArray ? targets : [targets],
    evaluated: [],
    isSingleton: !isArray,
    resolve: options.resolve,
    reject: options.reject,
    logger: options.logger || driftwood('poller'),
    timeout: options.timeout,
    stopOnError: options.stopOnError,
    queryAll: options.queryAll
  }
}


/***/ }),

/***/ "./node_modules/@qubit/poller/lib/evaluate.js":
/*!****************************************************!*\
  !*** ./node_modules/@qubit/poller/lib/evaluate.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var get = (__webpack_require__(/*! slapdash */ "./node_modules/slapdash/dist/index.js").get)
var undef = void 0

module.exports = function evaluate (target, queryAll) {
  if (typeof target === 'function') return target() || undef
  if (typeof target === 'string' && target.indexOf('window.') === 0) return get(window, target)
  if (queryAll) {
    var items = document.querySelectorAll(target)
    return items.length ? items : undef
  } else {
    return document.querySelector(target) || undef
  }
}


/***/ }),

/***/ "./node_modules/@qubit/poller/lib/observer.js":
/*!****************************************************!*\
  !*** ./node_modules/@qubit/poller/lib/observer.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _ = __webpack_require__(/*! slapdash */ "./node_modules/slapdash/dist/index.js")

module.exports = function createObserver (cb) {
  var Observer = window.MutationObserver || window.WebKitMutationObserver
  var supported = Boolean(Observer && !isTrident())
  var disabled = !supported
  var mobserver = supported && new Observer(cb)
  var active = false

  function enable () {
    if (supported) disabled = false
  }

  function disable () {
    stop()
    disabled = true
  }

  function start () {
    if (active || disabled) return
    mobserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    })
    active = true
  }

  function stop () {
    if (!active || disabled) return
    mobserver.disconnect()
    active = false
  }

  return {
    enable: enable,
    disable: disable,
    start: start,
    stop: stop
  }
}

function isTrident () {
  var agent = _.get(window, 'navigator.userAgent') || ''
  return agent.indexOf('Trident/7.0') > -1
}


/***/ }),

/***/ "./node_modules/@qubit/poller/lib/raf.js":
/*!***********************************************!*\
  !*** ./node_modules/@qubit/poller/lib/raf.js ***!
  \***********************************************/
/***/ ((module) => {

module.exports = function raf (fn) {
  return getRaf()(fn)
}

function getRaf () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    defer
}

function defer (callback) {
  window.setTimeout(callback, 0)
}


/***/ }),

/***/ "./node_modules/@qubit/poller/lib/valid_frame.js":
/*!*******************************************************!*\
  !*** ./node_modules/@qubit/poller/lib/valid_frame.js ***!
  \*******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var indexOf = (__webpack_require__(/*! slapdash */ "./node_modules/slapdash/dist/index.js").indexOf)
var FPS = 60

function validFrame (tickCount) {
  return indexOf(getValidFrames(), tickCount % FPS) !== -1
}

function getValidFrames () {
  return [1, 2, 3, 5, 8, 13, 21, 34, 55]
}

module.exports = validFrame
module.exports.getValidFrames = getValidFrames


/***/ }),

/***/ "./node_modules/@qubit/poller/lib/validate.js":
/*!****************************************************!*\
  !*** ./node_modules/@qubit/poller/lib/validate.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _ = __webpack_require__(/*! slapdash */ "./node_modules/slapdash/dist/index.js")

module.exports = function validate (targets, options) {
  if (areTargetsInvalid(targets)) {
    throw new Error(
      'Poller: Expected first argument to be a selector string ' +
      'or array containing selectors, window variables or functions.'
    )
  }
  if (options !== void 0) {
    var optionsIsFunction = typeof options === 'function'
    if (optionsIsFunction || !_.isObject(options)) {
      throw new Error(
        'Poller: Expected second argument to be an options object. ' +
        'Poller has a new API, see https://docs.qubit.com/content/developers/experiences-poller'
      )
    }
  }
}

function areTargetsInvalid (targets) {
  if (Array.isArray(targets)) {
    return !!_.find(targets, isInvalidType)
  } else {
    return isInvalidType(targets)
  }
}

function isInvalidType (target) {
  var targetType = typeof target
  return targetType !== 'string' && targetType !== 'function'
}


/***/ }),

/***/ "./node_modules/@qubit/poller/poller.js":
/*!**********************************************!*\
  !*** ./node_modules/@qubit/poller/poller.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _ = __webpack_require__(/*! slapdash */ "./node_modules/slapdash/dist/index.js")
var defer = __webpack_require__(/*! sync-p/defer */ "./node_modules/sync-p/defer.js")
var requestAnimationFrame = __webpack_require__(/*! ./lib/raf */ "./node_modules/@qubit/poller/lib/raf.js")
var validFrame = __webpack_require__(/*! ./lib/valid_frame */ "./node_modules/@qubit/poller/lib/valid_frame.js")
var createObserver = __webpack_require__(/*! ./lib/observer */ "./node_modules/@qubit/poller/lib/observer.js")
var evaluate = __webpack_require__(/*! ./lib/evaluate */ "./node_modules/@qubit/poller/lib/evaluate.js")
var validate = __webpack_require__(/*! ./lib/validate */ "./node_modules/@qubit/poller/lib/validate.js")
var create = __webpack_require__(/*! ./lib/create */ "./node_modules/@qubit/poller/lib/create.js")
var logger = __webpack_require__(/*! driftwood */ "./node_modules/driftwood/browser.js")('poller')

/**
 * Constants - these are not configurable to
 * make polling more efficient by reusing the
 * same global timeout.
 */
var INITIAL_TICK = Math.round(1000 / 60) // The initial tick interval duration before we start backing off (ms)
var INCREASE_RATE = 1.5 // The backoff multiplier
var BACKOFF_THRESHOLD = Math.round((3 * 1000) / (1000 / 60)) // How many ticks before we start backing off
var DEFAULTS = {
  logger: logger,
  timeout: 15000, // How long before we stop polling (ms)
  stopOnError: false // Whether to stop and throw an error if the evaulation throws
}
/**
 * Globals
 */
var tickCount, currentTickDelay
var queue = []
var observer = createObserver(tock)

/**
 * Main poller method to register 'targets' to poll for
 * and a callback when all targets validated and complete
 * 'targets' can be one of the following formats:
 *   - a selector string e.g. 'body > span.grid15'
 *   - a window variable formatted as a string e.g. 'window.universal_variable'
 *   - a function which returns a condition for which to stop the polling e.g.
 *     function () {
 *       return $('.some-class').length === 2
 *     }
 *   - an array of any of the above formats
 */

function poller (targets, opts) {
  var options = _.assign({}, DEFAULTS, opts, defer())

  try {
    validate(targets, opts)

    var item = create(targets, options)

    start()

    return {
      start: start,
      stop: stop,
      then: options.promise.then,
      catch: options.promise.catch
    }
  } catch (error) {
    logError(error, options)
  }

  function start () {
    register(item)
    return options.promise
  }

  function stop () {
    return unregister(item)
  }
}

function tick () {
  tickCount += 1
  var next = requestAnimationFrame
  var shouldBackoff = tickCount >= BACKOFF_THRESHOLD
  if (shouldBackoff) {
    currentTickDelay = currentTickDelay * INCREASE_RATE
    next = window.setTimeout
  }
  if (shouldBackoff || validFrame(tickCount)) {
    tock()
  }
  if (!isActive()) return
  return next(tick, currentTickDelay)
}

/**
 * Loop through all registered items, polling for selectors or executing filter functions
 */
function tock () {
  var ready = _.filter(queue, evaluateQueue)

  while (ready.length) resolve(ready.pop())

  function evaluateQueue (item) {
    var i, result
    var cacheIndex = item.evaluated.length
    try {
      for (i = 0; i < item.targets.length; i++) {
        if (i >= item.evaluated.length) {
          result = evaluate(item.targets[i], item.queryAll)
          if (typeof result !== 'undefined') {
            item.logger.info('Poller: resolved ' + String(item.targets[i]))
            item.evaluated.push(result)
          } else if ((new Date() - item.start) >= item.timeout) {
            // Item has timed out, resolve item
            return true
          } else {
            // Cannot resolve item, exit
            return
          }
        }
      }

      // Everything has been found, lets re-evaluate cached entries
      // to make sure they have not gone stale
      for (i = 0; i < cacheIndex; i++) {
        result = evaluate(item.targets[i], item.queryAll)
        if (typeof result === 'undefined') {
          item.evaluated = item.evaluated.slice(0, i)
          item.logger.info('Poller: item went stale: ' + String(item.targets[i]))
          // Cannot resolve item, exit
          return
        } else {
          item.evaluated[i] = result
        }
      }

      // All targets evaluated, add to resolved list
      return true
    } catch (error) {
      logError(error, item)
      // Cannot resolve item, exit
    }
  }
}

function init () {
  tickCount = 0
  currentTickDelay = INITIAL_TICK
}

function reset () {
  init()
  observer.stop()
  queue = []
}

function isActive () {
  return !!queue.length
}

function register (item) {
  var active = isActive()

  init()

  item.start = new Date()

  queue = _.filter(queue, function (i) {
    return i !== item
  })

  queue.push(item)

  if (!active) {
    item.logger.info('Poller: started')
    tick()
    observer.start()
  }
}

function unregister (item) {
  queue = _.filter(queue, function (i) {
    return i !== item
  })
  if (!isActive()) {
    observer.stop()
  }
  return item.targets[item.evaluated.length]
}

function resolve (item) {
  var remainder = unregister(item)
  if (remainder) {
    var error = new Error('Poller: could not resolve ' + String(remainder))
    error.code = 'EPOLLER:TIMEOUT'
    item.logger.info(error.message)
    item.reject(error)
  } else {
    var evaluated = item.isSingleton
      ? item.evaluated[0]
      : item.evaluated
    item.resolve(evaluated)
  }

  if (!isActive()) {
    item.logger.info('Poller: complete')
  }
}

function logError (error, options) {
  error.code = 'EPOLLER'
  if (options.logger) options.logger.error(error)
  if (options.stopOnError) throw error
}

poller.isActive = isActive
poller.reset = reset

poller.logger = logger
poller.disableMutationObserver = observer.disable
poller.defaults = function (newDefaults) {
  _.assign(DEFAULTS, newDefaults)
}

module.exports = poller


/***/ }),

/***/ "./src/experiences/countdownBanner/index.js":
/*!**************************************************!*\
  !*** ./src/experiences/countdownBanner/index.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _triggers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./triggers */ "./src/experiences/countdownBanner/triggers.js");
/* harmony import */ var _variation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./variation */ "./src/experiences/countdownBanner/variation.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  triggers: _triggers__WEBPACK_IMPORTED_MODULE_0__["default"],
  variation: _variation__WEBPACK_IMPORTED_MODULE_1__["default"]
});

/***/ }),

/***/ "./src/experiences/countdownBanner/triggers.js":
/*!*****************************************************!*\
  !*** ./src/experiences/countdownBanner/triggers.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ triggers)
/* harmony export */ });
function triggers(options, cb) {
  var log = options.log,
      state = options.state,
      poll = options.poll;
  log.info('Triggers');
  return pollForElements().then(cb);

  function pollForElements() {
    log.info('Polling for elements');
    return poll('#athemes-blocks-block-428d2d54').then(function (anchor) {
      state.set('anchor', anchor);
    });
  }
}

/***/ }),

/***/ "./src/experiences/countdownBanner/variation.js":
/*!******************************************************!*\
  !*** ./src/experiences/countdownBanner/variation.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ variation)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js");
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! preact */ "./src/experiences/countdownBanner/node_modules/preact/dist/preact.module.js");
/* harmony import */ var preact_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! preact/hooks */ "./src/experiences/countdownBanner/node_modules/preact/hooks/dist/hooks.module.js");
/* harmony import */ var _qubit_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @qubit/utils */ "./src/experiences/countdownBanner/node_modules/@qubit/utils/dom/index.js");
/* harmony import */ var _qubit_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_qubit_utils__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _variation_less__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./variation.less */ "./src/experiences/countdownBanner/variation.less");





function variation(options) {
  var _utils = _qubit_utils__WEBPACK_IMPORTED_MODULE_3___default()(),
      insertAfter = _utils.insertAfter;

  var log = options.log,
      state = options.state;
  var prefix = 'xp-countdown-banner';
  var anchor = state.get('anchor');
  var copy = 'Hurry! Our sale ends soon!';
  log.info('Variation');
  return renderPlacement();

  function renderPlacement() {
    var element = document.createElement('div');
    element.className = prefix;
    (0,preact__WEBPACK_IMPORTED_MODULE_1__.render)((0,preact__WEBPACK_IMPORTED_MODULE_1__.h)(Container, null), element);
    insertAfter(anchor, element);
  }

  function Container() {
    var containerClass = "".concat(prefix, "-container");
    return (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: containerClass
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: "".concat(containerClass, "__title")
    }, copy), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)(Countdown, null), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: "".concat(containerClass, "__cta")
    }, "Find out more"));
  }

  function useCountdownTimer(date) {
    function calculateTimeLeft() {
      var difference = +new Date(date) - +new Date();
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(difference / (1000 * 60 * 60) % 24),
        minutes: Math.floor(difference / 1000 / 60 % 60),
        seconds: Math.floor(difference / 1000 % 60)
      };
    }

    var _useState = (0,preact_hooks__WEBPACK_IMPORTED_MODULE_2__.useState)(calculateTimeLeft()),
        _useState2 = (0,_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(_useState, 2),
        timeLeft = _useState2[0],
        setTimeLeft = _useState2[1];

    (0,preact_hooks__WEBPACK_IMPORTED_MODULE_2__.useEffect)(function () {
      var timer = setTimeout(function () {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      return function () {
        clearTimeout(timer);
      };
    });
    return timeLeft;
  }

  function Countdown() {
    var countdownClass = "".concat(prefix, "-countdown");
    var timeLeft = useCountdownTimer("December 25, 2022");
    var timerComponents = Object.keys(timeLeft).map(function (interval) {
      return (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("span", null, timeLeft[interval], " ", interval, ' ');
    });
    return (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: countdownClass
    }, timerComponents.length ? timerComponents : (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("span", null, "Time's up!"));
  }
}

/***/ }),

/***/ "./src/experiences/createExperience.js":
/*!*********************************************!*\
  !*** ./src/experiences/createExperience.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* export default binding */ __WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _options__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./options */ "./src/experiences/options.js");

/* harmony default export */ function __WEBPACK_DEFAULT_EXPORT__(_ref) {
  var triggers = _ref.triggers,
      variation = _ref.variation;
  return function () {
    return triggers(_options__WEBPACK_IMPORTED_MODULE_0__["default"], function () {
      return variation(_options__WEBPACK_IMPORTED_MODULE_0__["default"]);
    });
  };
}

/***/ }),

/***/ "./src/experiences/exitIntent/index.js":
/*!*********************************************!*\
  !*** ./src/experiences/exitIntent/index.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _triggers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./triggers */ "./src/experiences/exitIntent/triggers.js");
/* harmony import */ var _variation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./variation */ "./src/experiences/exitIntent/variation.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  triggers: _triggers__WEBPACK_IMPORTED_MODULE_0__["default"],
  variation: _variation__WEBPACK_IMPORTED_MODULE_1__["default"]
});

/***/ }),

/***/ "./src/experiences/exitIntent/triggers.js":
/*!************************************************!*\
  !*** ./src/experiences/exitIntent/triggers.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ triggers)
/* harmony export */ });
/* harmony import */ var sync_p__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! sync-p */ "./src/experiences/exitIntent/node_modules/sync-p/index.js");
/* harmony import */ var sync_p__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(sync_p__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _qubit_check_inactivity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @qubit/check-inactivity */ "./src/experiences/exitIntent/node_modules/@qubit/check-inactivity/index.js");
/* harmony import */ var _qubit_check_inactivity__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_qubit_check_inactivity__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _qubit_check_exit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @qubit/check-exit */ "./src/experiences/exitIntent/node_modules/@qubit/check-exit/index.js");
/* harmony import */ var _qubit_check_exit__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_qubit_check_exit__WEBPACK_IMPORTED_MODULE_2__);



function triggers(options, cb) {
  var log = options.log,
      poll = options.poll,
      state = options.state;
  return pollForElements().then(checkDeviceType).then(checkForExitIntentOrInactivity).then(cb);

  function pollForElements() {
    return poll('body').then(function (anchor) {
      state.set('anchor', anchor);
    });
  }

  function checkDeviceType() {
    log.info('Checking device type');
    return new (sync_p__WEBPACK_IMPORTED_MODULE_0___default())(function (resolve) {
      var isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      return resolve(isMobileOrTablet);
    });
  }

  function checkForExitIntentOrInactivity(isMobileOrTablet) {
    return new (sync_p__WEBPACK_IMPORTED_MODULE_0___default())(function (resolve) {
      if (isMobileOrTablet) {
        log.info('Checking for inactivity');
        return _qubit_check_inactivity__WEBPACK_IMPORTED_MODULE_1___default()(inactivityTime, resolve);
      }

      log.info('Checking for exit intent');
      var exitIntent = _qubit_check_exit__WEBPACK_IMPORTED_MODULE_2___default()(resolve);
      exitIntent.init();
    });
  }
}

/***/ }),

/***/ "./src/experiences/exitIntent/variation.js":
/*!*************************************************!*\
  !*** ./src/experiences/exitIntent/variation.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ variation)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/extends */ "./node_modules/@babel/runtime/helpers/esm/extends.js");
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! preact */ "./src/experiences/exitIntent/node_modules/preact/dist/preact.module.js");
/* harmony import */ var preact_hooks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! preact/hooks */ "./src/experiences/exitIntent/node_modules/preact/hooks/dist/hooks.module.js");
/* harmony import */ var _qubit_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @qubit/utils */ "./src/experiences/exitIntent/node_modules/@qubit/utils/dom/index.js");
/* harmony import */ var _qubit_utils__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_qubit_utils__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _glidejs_glide__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @glidejs/glide */ "./src/experiences/exitIntent/node_modules/@glidejs/glide/dist/glide.esm.js");
/* harmony import */ var _variation_less__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./variation.less */ "./src/experiences/exitIntent/variation.less");






function variation(options) {
  var _utils = _qubit_utils__WEBPACK_IMPORTED_MODULE_3___default()(),
      appendChild = _utils.appendChild;

  var log = options.log,
      state = options.state;
  var anchor = state.get('anchor');
  var prefix = 'xp-exitIntent';
  var content = {
    headline: 'Wait! Before you go...',
    subtitle: 'You may also like',
    recs: [{
      title: 'Product Title'
    }, {
      title: 'Product Title'
    }, {
      title: 'Product Title'
    }, {
      title: 'Product Title'
    }, {
      title: 'Product Title'
    }]
  };
  var glideOptions = {
    type: 'slider',
    bound: true,
    perView: 3.5,
    gap: 8,
    scrollLock: true,
    rewind: false,
    breakpoints: {
      767: {
        perView: 1.25,
        gap: 8
      }
    }
  };
  return fire();

  function fire() {
    log.info('Running experience');
    var element = createElement();
    renderPlacement(element);
  }

  function createElement() {
    var element = document.createElement('div');
    element.classList.add(prefix);
    appendChild(anchor, element);
    return element;
  }

  function renderPlacement(element) {
    (0,preact__WEBPACK_IMPORTED_MODULE_1__.render)((0,preact__WEBPACK_IMPORTED_MODULE_1__.h)(Placement, null, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)(Carousel, null)), element);
  }

  function Placement(_ref) {
    var children = _ref.children;
    var containerClass = "".concat(prefix, "-container");

    var handleClose = function handleClose() {
      var experience = document.querySelector(".".concat(containerClass));
      experience.parentElement.removeChild(experience);
    };

    return (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: containerClass
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      "class": "".concat(containerClass, "__header")
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: "".concat(containerClass, "__title")
    }, content.headline), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: "".concat(containerClass, "__subtitle")
    }, content.subtitle), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("button", {
      className: "".concat(containerClass, "__close"),
      onClick: handleClose
    }, "X")), children);
  }

  function Carousel() {
    var carouselClass = "".concat(prefix, "-carousel");
    var carouselContainer = (0,preact_hooks__WEBPACK_IMPORTED_MODULE_2__.useRef)();
    (0,preact_hooks__WEBPACK_IMPORTED_MODULE_2__.useEffect)(function () {
      var glide = new _glidejs_glide__WEBPACK_IMPORTED_MODULE_4__["default"](".".concat(carouselClass), glideOptions);
      glide.mount();
      return function () {
        return glide.destroy();
      };
    }, []);
    return (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      "class": carouselClass,
      ref: carouselContainer
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)(Arrows, {
      carouselClass: carouselClass
    }), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      "class": "".concat(carouselClass, "__track"),
      "data-glide-el": "track"
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("ul", {
      "class": "".concat(carouselClass, "__slides")
    }, content.recs.map(function (rec, i) {
      return (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)(Slide, (0,_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__["default"])({
        key: i
      }, rec));
    }))));
  }

  function Arrows(_ref2) {
    var carouselClass = _ref2.carouselClass;
    var arrowClass = "".concat(prefix, "-arrow");
    return (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      "class": "".concat(carouselClass, "__arrows"),
      "data-glide-el": "controls"
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      "class": "".concat(arrowClass, " ").concat(arrowClass, "--left previous"),
      "data-glide-dir": "<"
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("svg", {
      width: "14",
      height: "23",
      viewBox: "0 0 14 23",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("path", {
      d: "M-3.8147e-06 11.5L0.567094 12.0579L11.7345 23L13.3376 21.8842L2.73731 11.5L13.3376 1.11581L11.7345 0L0.567094 10.9421L-3.8147e-06 11.5Z",
      fill: "#979797"
    }))), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      "class": "".concat(arrowClass, " next"),
      "data-glide-dir": ">"
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("svg", {
      width: "14",
      height: "23",
      viewBox: "0 0 14 23",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg"
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("path", {
      d: "M14 11.5L13.4329 10.9421L2.26547 -1.90735e-06L0.662354 1.1158L11.2627 11.5L0.662354 21.8842L2.26547 23L13.4329 12.0579L14 11.5Z",
      fill: "black"
    }))));
  }

  function Slide() {
    var slideClass = "".concat(prefix, "-slide");
    return (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("a", {
      className: slideClass
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: "".concat(slideClass, "__image")
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("img", {
      src: 'https://picsum.photos/200'
    })), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: "".concat(slideClass, "__content")
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: "".concat(slideClass, "__title")
    }, "Product Name"), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: "".concat(slideClass, "__old-price ").concat(slideClass, "__old-price--strike")
    }, "\xA310.00"), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: "".concat(slideClass, "__new-price")
    }, (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: "".concat(slideClass, "__price-value")
    }, "\xA312.00"), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("div", {
      className: "".concat(slideClass, "__price-saved")
    }, "\xA312.00"))));
  }
}

/***/ }),

/***/ "./src/experiences/index.js":
/*!**********************************!*\
  !*** ./src/experiences/index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _createExperience__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createExperience */ "./src/experiences/createExperience.js");
/* harmony import */ var _countdownBanner__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./countdownBanner */ "./src/experiences/countdownBanner/index.js");
/* harmony import */ var _exitIntent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./exitIntent */ "./src/experiences/exitIntent/index.js");
 // Experiences



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ([(0,_createExperience__WEBPACK_IMPORTED_MODULE_0__["default"])(_countdownBanner__WEBPACK_IMPORTED_MODULE_1__["default"]), (0,_createExperience__WEBPACK_IMPORTED_MODULE_0__["default"])(_exitIntent__WEBPACK_IMPORTED_MODULE_2__["default"])]);

/***/ }),

/***/ "./src/experiences/options.js":
/*!************************************!*\
  !*** ./src/experiences/options.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _qubit_poller__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @qubit/poller */ "./node_modules/@qubit/poller/poller.js");
/* harmony import */ var _qubit_poller__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_qubit_poller__WEBPACK_IMPORTED_MODULE_0__);

var experienceState = {};

function set(key, data) {
  experienceState[key] = data;
}

function get(key) {
  return experienceState[key];
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  poll: (_qubit_poller__WEBPACK_IMPORTED_MODULE_0___default()),
  state: {
    set: set,
    get: get
  },
  log: {
    info: console.log,
    warn: console.warn,
    error: console.error
  }
});

/***/ }),

/***/ "./src/mapper/index.js":
/*!*****************************!*\
  !*** ./src/mapper/index.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ runMapper)
/* harmony export */ });
/* harmony import */ var _qubit_poller__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @qubit/poller */ "./node_modules/@qubit/poller/poller.js");
/* harmony import */ var _qubit_poller__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_qubit_poller__WEBPACK_IMPORTED_MODULE_0__);

function runMapper() {
  window.xp_events = [];

  function emitEvent(event) {
    window.xp_events.push(event);
  }

  return _qubit_poller__WEBPACK_IMPORTED_MODULE_0___default()('window.digitalData').then(function (dataLayer) {
    emitEvent({
      eventName: 'xpView'
    });
  });
}

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js??ruleSet[1].rules[2].use[2]!./src/experiences/countdownBanner/variation.less":
/*!*****************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js??ruleSet[1].rules[2].use[2]!./src/experiences/countdownBanner/variation.less ***!
  \*****************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".xp-countdown-banner {\n  margin: unset !important;\n  width: 100% !important;\n  max-width: unset !important;\n}\n.xp-countdown-banner + .wp-block-spacer {\n  display: none;\n}\n.xp-countdown-banner-container {\n  padding: 2rem;\n  text-align: center;\n  width: 100%;\n  background: #ff5858;\n  color: #ffffff;\n}\n.xp-countdown-banner-container__title {\n  font-size: 2rem;\n}\n.xp-countdown-banner-container__cta {\n  background: #212121;\n  padding: 0.5rem 1rem;\n  margin-top: 1rem;\n  display: inline-block;\n}\n", "",{"version":3,"sources":["webpack://./src/experiences/countdownBanner/variation.less"],"names":[],"mappings":"AAAC;EAIC,wBAAA;EACA,sBAAA;EACA,2BAAA;AAFF;AAJC;EAUC,aAAA;AAHF;AAPC;EAcC,aAAA;EACA,kBAAA;EACA,WAAA;EACA,mBAAA;EACA,cAAA;AAJF;AAKE;EACE,eAAA;AAHJ;AAKE;EACE,mBAAA;EACA,oBAAA;EACA,gBAAA;EACA,qBAAA;AAHJ","sourcesContent":["@prefix: ~'.xp-countdown-banner';\n@container: ~'@{prefix}-container';\n\n@{prefix} {\n  margin: unset !important;\n  width: 100% !important;\n  max-width: unset !important;\n}\n\n@{prefix} + .wp-block-spacer {\n  display: none;\n}\n\n@{container} {\n  padding: 2rem;\n  text-align: center;\n  width: 100%;\n  background: #ff5858;\n  color: #ffffff;\n  &__title {\n    font-size: 2rem;\n  }\n  &__cta {\n    background: #212121;\n    padding: 0.5rem 1rem;\n    margin-top: 1rem;\n    display: inline-block;\n  }\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js??ruleSet[1].rules[2].use[2]!./src/experiences/exitIntent/variation.less":
/*!************************************************************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js??ruleSet[1].rules[2].use[2]!./src/experiences/exitIntent/variation.less ***!
  \************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, ".xp-exitIntent {\n  position: fixed;\n  bottom: 40px;\n  left: 40px;\n  right: 40px;\n  z-index: 9999999999;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent {\n    bottom: 20px;\n    left: 20px;\n    right: 20px;\n  }\n}\n.xp-exitIntent-carousel {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n}\n.xp-exitIntent-carousel * {\n  box-sizing: inherit;\n}\n.xp-exitIntent-carousel__track {\n  overflow: hidden;\n}\n.xp-exitIntent-carousel__slides {\n  position: relative;\n  width: 100%;\n  list-style: none;\n  backface-visibility: hidden;\n  transform-style: preserve-3d;\n  touch-action: pan-Y;\n  overflow: hidden;\n  padding: 0;\n  white-space: nowrap;\n  display: flex;\n  flex-wrap: nowrap;\n  will-change: transform;\n}\n.xp-exitIntent-carousel__slides--dragging {\n  user-select: none;\n}\n.xp-exitIntent-carousel__slide {\n  width: 100%;\n  height: 100%;\n  flex-shrink: 0;\n  white-space: normal;\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-tap-highlight-color: transparent;\n}\n.xp-exitIntent-carousel__slide a {\n  user-select: none;\n  -webkit-user-drag: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n}\n.xp-exitIntent-carousel__arrows {\n  -webkit-touch-callout: none;\n  user-select: none;\n}\n.xp-exitIntent-carousel__bullets {\n  -webkit-touch-callout: none;\n  user-select: none;\n}\n.xp-exitIntent-carousel--rtl {\n  direction: rtl;\n}\n.xp-exitIntent-container {\n  background: #ffffff;\n  box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.226043);\n  border-radius: 5px;\n  border-top: 5px solid #d81f0d;\n  padding: 22px 15px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-container {\n    padding: 8px 15px 15px 15px;\n    border-top: 4px solid #d81f0d;\n  }\n}\n.xp-exitIntent-container__header {\n  padding-bottom: 12px;\n}\n.xp-exitIntent-container__title {\n  font-style: normal;\n  font-weight: 700;\n  font-size: 20px;\n  line-height: 25px;\n  color: #333333;\n  text-align: center;\n  padding-bottom: 3px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-container__title {\n    font-size: 16px;\n    line-height: 20px;\n    padding-left: 20px;\n    padding-right: 20px;\n  }\n}\n.xp-exitIntent-container__subtitle {\n  font-style: normal;\n  font-weight: 400;\n  font-size: 16px;\n  line-height: 20px;\n  text-align: center;\n  letter-spacing: 0.0928571px;\n  color: #2e2e2e;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-container__subtitle {\n    font-weight: 400;\n    font-size: 13px;\n    line-height: 16px;\n  }\n}\n.xp-exitIntent-container__close {\n  background-repeat: no-repeat;\n  background-color: unset;\n  border: unset;\n  width: 26px;\n  height: 26px;\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  padding: unset;\n  color: #000000;\n}\n.xp-exitIntent-carousel {\n  padding-left: 40px;\n  padding-right: 40px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-carousel {\n    padding-left: unset;\n    padding-right: unset;\n  }\n}\n.xp-exitIntent-carousel__slides {\n  margin: unset;\n}\n.xp-exitIntent-arrow {\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  right: -15px;\n  padding: 30px 15px;\n  cursor: pointer;\n}\n.xp-exitIntent-arrow--left {\n  left: -15px;\n  right: unset;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-arrow {\n    display: none;\n  }\n}\n.xp-exitIntent-slide {\n  background: #ffffff;\n  border: 1px solid #cccccc;\n  padding: 13px;\n  display: flex;\n  justify-content: space-between;\n  text-decoration: none;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-slide {\n    padding: 12px;\n    min-height: 90px;\n  }\n}\n.xp-exitIntent-slide__image {\n  width: 30%;\n  display: flex;\n  align-items: center;\n}\n.xp-exitIntent-slide__image img {\n  max-width: 100%;\n  max-height: 70px;\n}\n.xp-exitIntent-slide__content {\n  width: calc(70% - 13px);\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  padding-top: 6px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-slide__content {\n    padding-top: unset;\n  }\n}\n.xp-exitIntent-slide__title {\n  max-width: 100%;\n  white-space: normal;\n  font-style: normal;\n  font-weight: 400;\n  font-size: 14px;\n  line-height: 14px;\n  letter-spacing: 0.1px;\n  color: #333333;\n}\n.xp-exitIntent-slide__old-price {\n  font-style: normal;\n  font-weight: 400;\n  font-size: 11px;\n  line-height: 14px;\n  letter-spacing: 0.0928571px;\n  color: #666666;\n}\n.xp-exitIntent-slide__old-price--strike {\n  text-decoration: line-through;\n}\n.xp-exitIntent-slide__new-price {\n  font-style: normal;\n  font-weight: 700;\n  font-size: 13px;\n  line-height: 14px;\n  letter-spacing: 0.0928571px;\n  display: flex;\n  flex-wrap: wrap;\n}\n.xp-exitIntent-slide__price-value {\n  color: #000000;\n  padding-right: 12px;\n}\n.xp-exitIntent-slide__price-saved {\n  color: #c93b32;\n}\n", "",{"version":3,"sources":["webpack://./src/experiences/exitIntent/variation.less"],"names":[],"mappings":"AAAC;EAQC,eAAA;EACA,YAAA;EACA,UAAA;EACA,WAAA;EACA,mBAAA;AANF;AAOE;EAAA;IACE,YAAA;IACA,UAAA;IACA,WAAA;EAJF;AACF;AAbC;EAqBC,kBAAA;EACA,WAAA;EACA,sBAAA;AALF;AAlBC;EAyBG,mBAAA;AAJJ;AAME;EACE,gBAAA;AAJJ;AAME;EACE,kBAAA;EACA,WAAA;EACA,gBAAA;EACA,2BAAA;EACA,4BAAA;EACA,mBAAA;EACA,gBAAA;EACA,UAAA;EACA,mBAAA;EACA,aAAA;EACA,iBAAA;EACA,sBAAA;AAJJ;AAKI;EACE,iBAAA;AAHN;AAME;EACE,WAAA;EACA,YAAA;EACA,cAAA;EACA,mBAAA;EACA,iBAAA;EACA,2BAAA;EACA,wCAAA;AAJJ;AAHE;EASI,iBAAA;EACA,uBAAA;EACA,sBAAA;EACA,qBAAA;AAHN;AAME;EACE,2BAAA;EACA,iBAAA;AAJJ;AAME;EACE,2BAAA;EACA,iBAAA;AAJJ;AAME;EACE,cAAA;AAJJ;AAnEC;EA4EC,mBAAA;EACA,gDAAA;EACA,kBAAA;EACA,6BAAA;EACA,kBAAA;AANF;AAOE;EAAA;IACE,2BAAA;IACA,6BAAA;EAJF;AACF;AAKE;EACE,oBAAA;AAHJ;AAKE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,cAAA;EACA,kBAAA;EACA,mBAAA;AAHJ;AAII;EAAA;IACE,eAAA;IACA,iBAAA;IACA,kBAAA;IACA,mBAAA;EADJ;AACF;AAGE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,kBAAA;EACA,2BAAA;EACA,cAAA;AADJ;AAEI;EAAA;IACE,gBAAA;IACA,eAAA;IACA,iBAAA;EACJ;AACF;AACE;EACE,4BAAA;EACA,uBAAA;EACA,aAAA;EACA,WAAA;EACA,YAAA;EACA,kBAAA;EACA,SAAA;EACA,WAAA;EACA,cAAA;EACA,cAAA;AACJ;AAhIC;EAoIC,kBAAA;EACA,mBAAA;AADF;AAEE;EAAA;IACE,mBAAA;IACA,oBAAA;EACF;AACF;AAAE;EACE,aAAA;AAEJ;AA7IC;EAgJC,kBAAA;EACA,QAAA;EACA,2BAAA;EACA,YAAA;EACA,kBAAA;EACA,eAAA;AAAF;AACE;EACE,WAAA;EACA,YAAA;AACJ;AACE;EAAA;IACE,aAAA;EAEF;AACF;AA9JC;EAgKC,mBAAA;EACA,yBAAA;EACA,aAAA;EACA,aAAA;EACA,8BAAA;EACA,qBAAA;AACF;AAAE;EAAA;IACE,aAAA;IACA,gBAAA;EAGF;AACF;AAFE;EACE,UAAA;EACA,aAAA;EACA,mBAAA;AAIJ;AAPE;EAKI,eAAA;EACA,gBAAA;AAKN;AAFE;EACE,uBAAA;EACA,aAAA;EACA,sBAAA;EACA,8BAAA;EACA,gBAAA;AAIJ;AAHI;EAAA;IACE,kBAAA;EAMJ;AACF;AAJE;EACE,eAAA;EACA,mBAAA;EACA,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,qBAAA;EACA,cAAA;AAMJ;AAJE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,2BAAA;EACA,cAAA;AAMJ;AALI;EACE,6BAAA;AAON;AAJE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,2BAAA;EACA,aAAA;EACA,eAAA;AAMJ;AAJE;EACE,cAAA;EACA,mBAAA;AAMJ;AAJE;EACE,cAAA;AAMJ","sourcesContent":["@ticket: ~'.xp-exitIntent';\n@containerClass: ~'@{ticket}-container';\n@glide: ~'@{ticket}-carousel';\n@carouselClass: ~'@{ticket}-carousel';\n@slideClass: ~'@{ticket}-slide';\n@arrowClass: ~'@{ticket}-arrow';\n\n@{ticket} {\n  position: fixed;\n  bottom: 40px;\n  left: 40px;\n  right: 40px;\n  z-index: 9999999999;\n  @media (max-width: 767px) {\n    bottom: 20px;\n    left: 20px;\n    right: 20px;\n  }\n}\n\n@{glide} {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n  * {\n    box-sizing: inherit;\n  }\n  &__track {\n    overflow: hidden;\n  }\n  &__slides {\n    position: relative;\n    width: 100%;\n    list-style: none;\n    backface-visibility: hidden;\n    transform-style: preserve-3d;\n    touch-action: pan-Y;\n    overflow: hidden;\n    padding: 0;\n    white-space: nowrap;\n    display: flex;\n    flex-wrap: nowrap;\n    will-change: transform;\n    &--dragging {\n      user-select: none;\n    }\n  }\n  &__slide {\n    width: 100%;\n    height: 100%;\n    flex-shrink: 0;\n    white-space: normal;\n    user-select: none;\n    -webkit-touch-callout: none;\n    -webkit-tap-highlight-color: transparent;\n    a {\n      user-select: none;\n      -webkit-user-drag: none;\n      -moz-user-select: none;\n      -ms-user-select: none;\n    }\n  }\n  &__arrows {\n    -webkit-touch-callout: none;\n    user-select: none;\n  }\n  &__bullets {\n    -webkit-touch-callout: none;\n    user-select: none;\n  }\n  &--rtl {\n    direction: rtl;\n  }\n}\n\n@{containerClass} {\n  background: #ffffff;\n  box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.226043);\n  border-radius: 5px;\n  border-top: 5px solid #d81f0d;\n  padding: 22px 15px;\n  @media (max-width: 767px) {\n    padding: 8px 15px 15px 15px;\n    border-top: 4px solid #d81f0d;\n  }\n  &__header {\n    padding-bottom: 12px;\n  }\n  &__title {\n    font-style: normal;\n    font-weight: 700;\n    font-size: 20px;\n    line-height: 25px;\n    color: #333333;\n    text-align: center;\n    padding-bottom: 3px;\n    @media (max-width: 767px) {\n      font-size: 16px;\n      line-height: 20px;\n      padding-left: 20px;\n      padding-right: 20px;\n    }\n  }\n  &__subtitle {\n    font-style: normal;\n    font-weight: 400;\n    font-size: 16px;\n    line-height: 20px;\n    text-align: center;\n    letter-spacing: 0.0928571px;\n    color: #2e2e2e;\n    @media (max-width: 767px) {\n      font-weight: 400;\n      font-size: 13px;\n      line-height: 16px;\n    }\n  }\n  &__close {\n    background-repeat: no-repeat;\n    background-color: unset;\n    border: unset;\n    width: 26px;\n    height: 26px;\n    position: absolute;\n    top: 10px;\n    right: 10px;\n    padding: unset;\n    color: #000000;\n  }\n}\n\n@{carouselClass} {\n  padding-left: 40px;\n  padding-right: 40px;\n  @media (max-width: 767px) {\n    padding-left: unset;\n    padding-right: unset;\n  }\n  &__slides {\n    margin: unset;\n  }\n}\n\n@{arrowClass} {\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  right: -15px;\n  padding: 30px 15px;\n  cursor: pointer;\n  &--left {\n    left: -15px;\n    right: unset;\n  }\n  @media (max-width: 767px) {\n    display: none;\n  }\n}\n\n@{slideClass} {\n  background: #ffffff;\n  border: 1px solid #cccccc;\n  padding: 13px;\n  display: flex;\n  justify-content: space-between;\n  text-decoration: none;\n  @media (max-width: 767px) {\n    padding: 12px;\n    min-height: 90px;\n  }\n  &__image {\n    width: 30%;\n    display: flex;\n    align-items: center;\n    img {\n      max-width: 100%;\n      max-height: 70px;\n    }\n  }\n  &__content {\n    width: calc(70% - 13px);\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    padding-top: 6px;\n    @media (max-width: 767px) {\n      padding-top: unset;\n    }\n  }\n  &__title {\n    max-width: 100%;\n    white-space: normal;\n    font-style: normal;\n    font-weight: 400;\n    font-size: 14px;\n    line-height: 14px;\n    letter-spacing: 0.1px;\n    color: #333333;\n  }\n  &__old-price {\n    font-style: normal;\n    font-weight: 400;\n    font-size: 11px;\n    line-height: 14px;\n    letter-spacing: 0.0928571px;\n    color: #666666;\n    &--strike {\n      text-decoration: line-through;\n    }\n  }\n  &__new-price {\n    font-style: normal;\n    font-weight: 700;\n    font-size: 13px;\n    line-height: 14px;\n    letter-spacing: 0.0928571px;\n    display: flex;\n    flex-wrap: wrap;\n  }\n  &__price-value {\n    color: #000000;\n    padding-right: 12px;\n  }\n  &__price-saved {\n    color: #c93b32;\n  }\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/driftwood/browser.js":
/*!*******************************************!*\
  !*** ./node_modules/driftwood/browser.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./src/create */ "./node_modules/driftwood/src/create.js")(__webpack_require__(/*! ./src/logger/browser */ "./node_modules/driftwood/src/logger/browser.js")())


/***/ }),

/***/ "./node_modules/driftwood/src/create.js":
/*!**********************************************!*\
  !*** ./node_modules/driftwood/src/create.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _ = __webpack_require__(/*! slapdash */ "./node_modules/slapdash/dist/index.js")
var patterns = __webpack_require__(/*! ./patterns */ "./node_modules/driftwood/src/patterns.js")
var LEVELS = __webpack_require__(/*! ./levels */ "./node_modules/driftwood/src/levels.js")
var argsToComponents = __webpack_require__(/*! ./utils/argsToComponents */ "./node_modules/driftwood/src/utils/argsToComponents.js")
var compose = __webpack_require__(/*! ./utils/compose */ "./node_modules/driftwood/src/utils/compose.js")
function noop () {}

module.exports = function createDriftwood (primaryLogger) {
  var globalState = { loggers: [], enabled: false }

  driftwood.enable = function enableAll (flags, options) {
    globalState.enabled = true
    if (flags) patterns.set(flags, options)
    _.invoke(globalState.loggers, 'enable', flags)
  }

  driftwood.disable = function disableAll () {
    globalState.enabled = false
    patterns.set({})
    patterns.set({}, { persist: true })
    _.invoke(globalState.loggers, 'disable')
  }

  driftwood.destroy = function destroyAll () {
    while (globalState.loggers.length) globalState.loggers.pop().destroy()
  }

  driftwood.LEVELS = LEVELS

  return driftwood

  function driftwood (name, additionalLoggers, interceptors) {
    if (!name) throw new Error('name required')
    var config = patterns.get()
    var state = {
      enabled: globalState.enabled || patterns.match(name, config),
      level: patterns.getLevel(name, config),
      children: []
    }
    var logger = additionalLoggers && additionalLoggers.length > 0
      ? compose(primaryLogger, additionalLoggers)
      : primaryLogger

    var log = function createLogger (logName, extraAdditionalLoggers, extraInterceptors) {
      if (log.enable === noop) throw new Error(name + ' was destroyed')
      var childLog = driftwood(
        name + ':' + logName,
        (additionalLoggers || []).concat(extraAdditionalLoggers || []),
        (interceptors || []).concat(extraInterceptors || [])
      )
      if (state.enabled) childLog.enable(state.flags)
      state.children.push(childLog)
      return childLog
    }

    log.enable = function enableLog (flags) {
      state.enabled = true
      state.flags = flags
      if (flags) state.level = patterns.getLevel(name, flags)
      createAPI()
      _.invoke(state.children, 'enable', flags)
    }

    log.disable = function disableLog () {
      state.enabled = false
      createAPI()
      _.invoke(state.children, 'disable')
    }

    log.destroy = function destroyLog () {
      log.enable = noop
      log.disable()
      globalState.loggers = _.filter(globalState.loggers, function (logger) {
        return logger !== log
      })
      while (state.children.length) state.children.pop().destroy()
    }

    createAPI()
    globalState.loggers.push(log)
    return log

    function intercept (args) {
      if (interceptors && interceptors.length > 0) {
        for (var i = 0; i < interceptors.length; i++) {
          var result = interceptors[i].apply(undefined, args)
          if (_.isArray(result) && result.length === 4) {
            args = result
          } else if (_.isObject(result)) {
            args[3] = result
          } else if (typeof result === 'string') {
            args[3].message = result
          }
        }
      }
      return args
    }

    function createAPI () {
      _.each(LEVELS.NAMES, function addLevelLogger (logLevel) {
        var index = LEVELS.INDEX[logLevel]
        log[logLevel] = state.enabled
          ? function levelLogger () {
            if (index >= LEVELS.INDEX[state.level]) {
              var args = [name, logLevel, new Date(), argsToComponents(arguments)]
              args = intercept(args)
              try {
                logger.apply(undefined, args)
              } catch (e) { }
            }
          }
          : noop
      })
    }
  }
}


/***/ }),

/***/ "./node_modules/driftwood/src/levels.js":
/*!**********************************************!*\
  !*** ./node_modules/driftwood/src/levels.js ***!
  \**********************************************/
/***/ ((module) => {

module.exports = {
  DEFAULT: 'info',
  NAMES: ['trace', 'debug', 'info', 'warn', 'error'],
  INDEX: {}
}

for (var i = 0; i < module.exports.NAMES.length; i++) {
  module.exports.INDEX[module.exports.NAMES[i]] = i
}


/***/ }),

/***/ "./node_modules/driftwood/src/logger/browser.js":
/*!******************************************************!*\
  !*** ./node_modules/driftwood/src/logger/browser.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _ = __webpack_require__(/*! slapdash */ "./node_modules/slapdash/dist/index.js")
var LEVELS = __webpack_require__(/*! ../levels */ "./node_modules/driftwood/src/levels.js")
var rightPad = __webpack_require__(/*! ../utils/rightPad */ "./node_modules/driftwood/src/utils/rightPad.js")
var console = window.console

var levelColors = {
  trace: '#6C7A89',
  debug: '#87D37C',
  info: '#446CB3',
  warn: '#E87E04',
  error: '#F22613'
}

/**
 * Generate the hex for a readable color against a white background
 **/
function randomReadableColor () {
  var h = Math.floor(Math.random() * 360)
  var s = Math.floor(Math.random() * 100) + '%'
  var l = Math.floor(Math.random() * 66) + '%'

  return [ 'hsl(', h, ',', s, ',', l, ')' ].join('')
}

function consoleSupportsAllLevels () {
  return !_.find(LEVELS.NAMES, function (level) {
    return !console[level]
  })
}

function consoleSupportsGrouping () {
  return console.groupCollapsed && console.groupEnd
}

/**
 * Practically is there a good chance it supports CSS?
 **/
function consoleIsFancy () {
  return console.timeline && console.table && !window.__karma__
}

module.exports = function browserLogger () {
  if (!console) {
    return function noop () { }
  }

  var allLevels = consoleSupportsAllLevels()
  var grouping = consoleSupportsGrouping()
  var isFancy = consoleIsFancy()
  var color = randomReadableColor()

  return function log (name, level, now, components) {
    if (grouping && components.metadata) {
      if (isFancy) {
        console.groupCollapsed.apply(console, formatFancyMessage())
      } else {
        console.groupCollapsed(formatMessage())
      }

      _.objectEach(components.metadata, function (value, key) {
        console.log(key, value)
      })

      console.groupEnd()
    } else if (components.message) {
      if (allLevels) {
        if (isFancy) {
          console[level].apply(console, formatFancyMessage())
        } else {
          console[level](formatMessage())
        }
      } else {
        // just use console.log
        console.log(formatMessage())
      }
    }

    if (components.error) {
      if (allLevels) {
        console.error(components.error)
      } else {
        console.log(components.error)
      }
    }

    function formatMessage () {
      return rightPad(level.toUpperCase(), 5) + ' [' + name + ']: ' + components.message
    }

    function formatFancyMessage () {
      return [
        '%c' + rightPad(level.toUpperCase(), 5) + '%c %c[' + name + ']%c: ' + components.message,
        'font-weight:bold;color:' + levelColors[level] + ';',
        '',
        'font-weight:bold;color:' + color + ';',
        ''
      ]
    }
  }
}

// Rewire doesn't work in IE8 and inject-loader doesn't work in node, so we have
// to expose our own stubbing method
module.exports.__stubConsole__ = function (stub) {
  var oldConsole = console
  console = stub // eslint-disable-line
  return function reset () {
    console = oldConsole // eslint-disable-line
  }
}


/***/ }),

/***/ "./node_modules/driftwood/src/patterns.js":
/*!************************************************!*\
  !*** ./node_modules/driftwood/src/patterns.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _ = __webpack_require__(/*! slapdash */ "./node_modules/slapdash/dist/index.js")
var JSON = __webpack_require__(/*! json-bourne */ "./node_modules/json-bourne/json-bourne.js")
var storage = __webpack_require__(/*! ./storage */ "./node_modules/driftwood/src/storage.js")
var LEVELS = __webpack_require__(/*! ./levels */ "./node_modules/driftwood/src/levels.js")

function get () {
  try {
    var payload = storage.get()
    return payload && JSON.parse(payload) || {}
  } catch (e) {
    return {}
  }
}

function set (patterns, opts) {
  try {
    var payload = JSON.stringify(patterns)
    storage.set(payload, opts)
  } catch (e) { }
}

function match (name, flags) {
  var patterns = _.keys(flags)
  return !!_.find(patterns, function (pattern) {
    return test(pattern, name)
  })
}

function getLevel (name, flags) {
  for (var pattern in flags) {
    if (test(pattern, name)) return flags[pattern] || LEVELS.DEFAULT
  }
  return LEVELS.DEFAULT
}

function test (pattern, name) {
  var regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
  return regex.test(name)
}

module.exports = {
  get: get,
  set: set,
  match: match,
  getLevel: getLevel
}


/***/ }),

/***/ "./node_modules/driftwood/src/storage.js":
/*!***********************************************!*\
  !*** ./node_modules/driftwood/src/storage.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _ = __webpack_require__(/*! slapdash */ "./node_modules/slapdash/dist/index.js")

var STORAGE_NAMESPACE = 'qubit_logger'
var TEST_KEY = '__dwTest__'

var memoryStorage = ''

function hasLocalStorage () {
  try {
    window.localStorage.setItem(TEST_KEY, 1)
    window.localStorage.removeItem(TEST_KEY)
    return true
  } catch (e) {
    return false
  }
}

function set (value, opts) {
  opts = _.assign({
    persist: false
  }, opts)

  if (opts.persist && hasLocalStorage()) {
    window.localStorage.setItem(STORAGE_NAMESPACE, value)
  } else {
    memoryStorage = value
  }
}

function get () {
  if (memoryStorage || !hasLocalStorage()) {
    return memoryStorage
  } else if (hasLocalStorage()) {
    return window.localStorage.getItem(STORAGE_NAMESPACE) || ''
  }
}

function reset () {
  if (hasLocalStorage()) {
    window.localStorage.removeItem(STORAGE_NAMESPACE)
  }
  memoryStorage = ''
}

module.exports = {
  set: set,
  get: get,
  reset: reset
}


/***/ }),

/***/ "./node_modules/driftwood/src/utils/argsToComponents.js":
/*!**************************************************************!*\
  !*** ./node_modules/driftwood/src/utils/argsToComponents.js ***!
  \**************************************************************/
/***/ ((module) => {

/*
  Last arg can be an error or an object. All other
  args will be joined into a string, delimited by
  a space.
*/
module.exports = function argsToComponents (args) {
  args = [].slice.apply(args)
  var lastArg = args[args.length - 1]

  var isError = lastArg instanceof Error || isErrorLike(lastArg)
  var isMetadata = !isError && lastArg && typeof lastArg === 'object'

  var messageParts = isError || isMetadata ? args.slice(0, -1) : args
  var message = messageParts.join(' ')

  // Handle log.debug({ foo: 'bar' })
  if (isMetadata && !message) {
    message = 'metadata:'
  }

  // Handle log.debug(new Error())
  if (isError && !message) {
    message = lastArg.message
  }

  var components = {
    message: message
  }

  if (isError && lastArg) components.error = lastArg
  if (isMetadata && lastArg) components.metadata = lastArg

  return components
}

// In some environments, errors doesn't properly inherit from `Error`
function isErrorLike (thing) {
  return thing && !!thing.stack && !!thing.message
}


/***/ }),

/***/ "./node_modules/driftwood/src/utils/compose.js":
/*!*****************************************************!*\
  !*** ./node_modules/driftwood/src/utils/compose.js ***!
  \*****************************************************/
/***/ ((module) => {

module.exports = function createCompositeLogger (primaryLogger, additionalLoggers) {
  var loggers = [primaryLogger].concat(additionalLoggers)
  return function compositeLogger (name, level, date, components) {
    for (var i = 0; i < loggers.length; i++) loggers[i](name, level, date, components)
  }
}


/***/ }),

/***/ "./node_modules/driftwood/src/utils/rightPad.js":
/*!******************************************************!*\
  !*** ./node_modules/driftwood/src/utils/rightPad.js ***!
  \******************************************************/
/***/ ((module) => {

module.exports = function rightPad (string, total) {
  var i = -1
  var remaining = total - string.length
  while (++i < remaining) {
    string += ' '
  }
  return string
}


/***/ }),

/***/ "./node_modules/json-bourne/json-bourne.js":
/*!*************************************************!*\
  !*** ./node_modules/json-bourne/json-bourne.js ***!
  \*************************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/* global define */
/* eslint-disable no-extend-native */

var jsonBourne = {
  stringify: function stringify () {
    var error, result
    var prototypes = normalizePrototypes()
    try {
      result = JSON.stringify.apply(JSON, arguments)
    } catch (e) {
      error = e
    }
    prototypes.restore()
    if (error) throw error
    return result
  },
  parse: function parse () {
    return JSON.parse.apply(JSON, arguments)
  }
}

if ( true && module.exports) {
  module.exports = jsonBourne
} else if (true) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
    return jsonBourne
  }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
} else {}

function normalizePrototypes () {
  var arrayToJSON = Array.prototype.toJSON
  var dateToJSON = Date.prototype.toJSON
  delete Array.prototype.toJSON
  Date.prototype.toJSON = function () {
    return toIsoDate(this)
  }
  return {
    restore: function restore () {
      if (arrayToJSON !== undefined) {
        Array.prototype.toJSON = arrayToJSON
      }
      if (dateToJSON !== undefined) {
        Date.prototype.toJSON = dateToJSON
      } else {
        delete Date.prototype.toJSON
      }
    }
  }
}

function toIsoDate (date) {
  return isFinite(date.valueOf()) ?
    date.getUTCFullYear() + '-' +
    pad(date.getUTCMonth() + 1, 2) + '-' +
    pad(date.getUTCDate(), 2) + 'T' +
    pad(date.getUTCHours(), 2) + ':' +
    pad(date.getUTCMinutes(), 2) + ':' +
    pad(date.getUTCSeconds(), 2) + '.' +
    pad(date.getUTCMilliseconds(), 3) + 'Z' : null
}

function pad (number) {
  var r = String(number)
  if (r.length === 1) {
    r = '0' + r
  }
  return r
}


/***/ }),

/***/ "./node_modules/slapdash/dist/index.js":
/*!*********************************************!*\
  !*** ./node_modules/slapdash/dist/index.js ***!
  \*********************************************/
/***/ ((module) => {

var toString = Function.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty
var regexpCharacters = /[\\^$.*+?()[\]{}|]/g
var regexpIsNativeFn = toString.call(hasOwnProperty)
  .replace(regexpCharacters, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?')
var regexpIsNative = RegExp('^' + regexpIsNativeFn + '$')
function toSource (func) {
  if (!func) return ''
  try {
    return toString.call(func)
  } catch (e) {}
  try {
    return (func + '')
  } catch (e) {}
}
var assign = Object.assign
var forEach = Array.prototype.forEach
var every = Array.prototype.every
var filter = Array.prototype.filter
var find = Array.prototype.find
var indexOf = Array.prototype.indexOf
var isArray = Array.isArray
var keys = Object.keys
var map = Array.prototype.map
var reduce = Array.prototype.reduce
var slice = Array.prototype.slice
var some = Array.prototype.some
var values = Object.values
function isNative (method) {
  return method && typeof method === 'function' && regexpIsNative.test(toSource(method))
}
var _ = {
  assign: isNative(assign)
    ? assign
    : function assign (target) {
      var l = arguments.length
      for (var i = 1; i < l; i++) {
        var source = arguments[i]
        for (var j in source) if (source.hasOwnProperty(j)) target[j] = source[j]
      }
      return target
    },
  bind: function bind (method, context) {
    var args = _.slice(arguments, 2)
    return function boundFunction () {
      return method.apply(context, args.concat(_.slice(arguments)))
    }
  },
  debounce: function debounce (func, wait, immediate) {
    var timeout
    return function () {
      var context = this
      var args = arguments
      var later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  },
  each: isNative(forEach)
    ? function nativeEach (array, callback, context) {
      return forEach.call(array, callback, context)
    }
    : function each (array, callback, context) {
      var l = array.length
      for (var i = 0; i < l; i++) callback.call(context, array[i], i, array)
    },
  every: isNative(every)
    ? function nativeEvery (coll, pred, context) {
      return every.call(coll, pred, context)
    }
    : function every (coll, pred, context) {
      if (!coll || !pred) {
        throw new TypeError()
      }
      for (var i = 0; i < coll.length; i++) {
        if (!pred.call(context, coll[i], i, coll)) {
          return false
        }
      }
      return true
    },
  filter: isNative(filter)
    ? function nativeFilter (array, callback, context) {
      return filter.call(array, callback, context)
    }
    : function filter (array, callback, context) {
      var l = array.length
      var output = []
      for (var i = 0; i < l; i++) {
        if (callback.call(context, array[i], i, array)) output.push(array[i])
      }
      return output
    },
  find: isNative(find)
    ? function nativeFind (array, callback, context) {
      return find.call(array, callback, context)
    }
    : function find (array, callback, context) {
      var l = array.length
      for (var i = 0; i < l; i++) {
        if (callback.call(context, array[i], i, array)) return array[i]
      }
    },
  get: function get (object, path) {
    return _.reduce(path.split('.'), function (memo, next) {
      return (typeof memo !== 'undefined' && memo !== null) ? memo[next] : undefined
    }, object)
  },
  identity: function identity (value) {
    return value
  },
  indexOf: isNative(indexOf)
    ? function nativeIndexOf (array, item) {
      return indexOf.call(array, item)
    }
    : function indexOf (array, item) {
      var l = array.length
      for (var i = 0; i < l; i++) {
        if (array[i] === item) return i
      }
      return -1
    },
  invoke: function invoke (array, methodName) {
    var args = _.slice(arguments, 2)
    return _.map(array, function invokeMapper (value) {
      return value[methodName].apply(value, args)
    })
  },
  isArray: isNative(isArray)
    ? function nativeArray (coll) {
      return isArray(coll)
    }
    : function isArray (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]'
    },
  isMatch: function isMatch (obj, spec) {
    for (var i in spec) {
      if (spec.hasOwnProperty(i) && obj[i] !== spec[i]) return false
    }
    return true
  },
  isObject: function isObject (obj) {
    var type = typeof obj
    return type === 'function' || type === 'object' && !!obj
  },
  keys: isNative(keys)
    ? keys
    : function keys (object) {
      var keys = []
      for (var key in object) {
        if (object.hasOwnProperty(key)) keys.push(key)
      }
      return keys
    },
  map: isNative(map)
    ? function nativeMap (array, callback, context) {
      return map.call(array, callback, context)
    }
    : function map (array, callback, context) {
      var l = array.length
      var output = new Array(l)
      for (var i = 0; i < l; i++) {
        output[i] = callback.call(context, array[i], i, array)
      }
      return output
    },
  matches: function matches (spec) {
    return function (obj) {
      return _.isMatch(obj, spec)
    }
  },
  not: function not (value) {
    return !value
  },
  objectEach: function (object, callback, context) {
    return _.each(_.keys(object), function (key) {
      return callback.call(context, object[key], key, object)
    }, context)
  },
  objectMap: function objectMap (object, callback, context) {
    var result = {}
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        result[key] = callback.call(context, object[key], key, object)
      }
    }
    return result
  },
  objectReduce: function objectReduce (object, callback, initialValue) {
    var output = initialValue
    for (var i in object) {
      if (object.hasOwnProperty(i)) output = callback(output, object[i], i, object)
    }
    return output
  },
  pick: function pick (object, toPick) {
    var out = {}
    _.each(toPick, function (key) {
      if (typeof object[key] !== 'undefined') out[key] = object[key]
    })
    return out
  },
  pluck: function pluck (array, key) {
    var l = array.length
    var out = []
    for (var i = 0; i < l; i++) if (array[i]) out[i] = array[i][key]
    return out
  },
  reduce: isNative(reduce)
    ? function nativeReduce (array, callback, initialValue) {
      return reduce.call(array, callback, initialValue)
    }
    : function reduce (array, callback, initialValue) {
      var output = initialValue
      var l = array.length
      for (var i = 0; i < l; i++) output = callback(output, array[i], i, array)
      return output
    },
  set: function set (object, path, val) {
    if (!object) return object
    if (typeof object !== 'object' && typeof object !== 'function') return object
    var parts = path.split('.')
    var context = object
    var nextKey
    do {
      nextKey = parts.shift()
      if (typeof context[nextKey] !== 'object') context[nextKey] = {}
      if (parts.length) {
        context = context[nextKey]
      } else {
        context[nextKey] = val
      }
    } while (parts.length)
    return object
  },
  slice: isNative(slice)
    ? function nativeSlice (array, begin, end) {
      begin = begin || 0
      end = typeof end === 'number' ? end : array.length
      return slice.call(array, begin, end)
    }
    : function slice (array, start, end) {
      start = start || 0
      end = typeof end === 'number' ? end : array.length
      var length = array == null ? 0 : array.length
      if (!length) {
        return []
      }
      if (start < 0) {
        start = -start > length ? 0 : (length + start)
      }
      end = end > length ? length : end
      if (end < 0) {
        end += length
      }
      length = start > end ? 0 : ((end - start) >>> 0)
      start >>>= 0
      var index = -1
      var result = new Array(length)
      while (++index < length) {
        result[index] = array[index + start]
      }
      return result
    },
  some: isNative(some)
    ? function nativeSome (coll, pred, context) {
      return some.call(coll, pred, context)
    }
    : function some (coll, pred, context) {
      if (!coll || !pred) {
        throw new TypeError()
      }
      for (var i = 0; i < coll.length; i++) {
        if (pred.call(context, coll[i], i, coll)) {
          return true
        }
      }
      return false
    },
  unique: function unique (array) {
    return _.reduce(array, function (memo, curr) {
      if (_.indexOf(memo, curr) === -1) {
        memo.push(curr)
      }
      return memo
    }, [])
  },
  values: isNative(values)
    ? values
    : function values (object) {
      var out = []
      for (var key in object) {
        if (object.hasOwnProperty(key)) out.push(object[key])
      }
      return out
    },
  name: 'slapdash',
  version: '1.3.3'
}
_.objectMap.asArray = function objectMapAsArray (object, callback, context) {
  return _.map(_.keys(object), function (key) {
    return callback.call(context, object[key], key, object)
  }, context)
}
module.exports = _


/***/ }),

/***/ "./src/experiences/countdownBanner/variation.less":
/*!********************************************************!*\
  !*** ./src/experiences/countdownBanner/variation.less ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_ruleSet_1_rules_2_use_2_variation_less__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../../node_modules/css-loader/dist/cjs.js!../../../node_modules/less-loader/dist/cjs.js??ruleSet[1].rules[2].use[2]!./variation.less */ "./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js??ruleSet[1].rules[2].use[2]!./src/experiences/countdownBanner/variation.less");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_ruleSet_1_rules_2_use_2_variation_less__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_ruleSet_1_rules_2_use_2_variation_less__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_ruleSet_1_rules_2_use_2_variation_less__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_ruleSet_1_rules_2_use_2_variation_less__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/experiences/exitIntent/variation.less":
/*!***************************************************!*\
  !*** ./src/experiences/exitIntent/variation.less ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_ruleSet_1_rules_2_use_2_variation_less__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../../node_modules/css-loader/dist/cjs.js!../../../node_modules/less-loader/dist/cjs.js??ruleSet[1].rules[2].use[2]!./variation.less */ "./node_modules/css-loader/dist/cjs.js!./node_modules/less-loader/dist/cjs.js??ruleSet[1].rules[2].use[2]!./src/experiences/exitIntent/variation.less");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_ruleSet_1_rules_2_use_2_variation_less__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_ruleSet_1_rules_2_use_2_variation_less__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_ruleSet_1_rules_2_use_2_variation_less__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_less_loader_dist_cjs_js_ruleSet_1_rules_2_use_2_variation_less__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./node_modules/sync-p/defer.js":
/*!**************************************!*\
  !*** ./node_modules/sync-p/defer.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Promise = __webpack_require__(/*! ./index */ "./node_modules/sync-p/index.js")
module.exports = function deferred () {
  var _resolve, _reject
  var _promise = Promise(function (resolve, reject) {
    _resolve = resolve
    _reject = reject
  })
  return {
    promise: _promise,
    resolve: _resolve,
    reject: _reject
  }
}


/***/ }),

/***/ "./node_modules/sync-p/index.js":
/*!**************************************!*\
  !*** ./node_modules/sync-p/index.js ***!
  \**************************************/
/***/ ((module) => {

var err = new Error('Error: recurses! infinite promise chain detected')
module.exports = function promise (resolver) {
  var waiting = { res: [], rej: [] }
  var p = {
    'then': then,
    'catch': function thenCatch (onReject) {
      return then(null, onReject)
    }
  }
  try { resolver(resolve, reject) } catch (e) {
    p.status = false
    p.value = e
  }
  return p

  function then (onResolve, onReject) {
    return promise(function (resolve, reject) {
      waiting.res.push(handleNext(p, waiting, onResolve, resolve, reject, onReject))
      waiting.rej.push(handleNext(p, waiting, onReject, resolve, reject, onReject))
      if (typeof p.status !== 'undefined') flush(waiting, p)
    })
  }

  function resolve (val) {
    if (typeof p.status !== 'undefined') return
    if (val === p) throw err
    if (val) try { if (typeof val.then === 'function') return val.then(resolve, reject) } catch (e) {}
    p.status = true
    p.value = val
    flush(waiting, p)
  }

  function reject (val) {
    if (typeof p.status !== 'undefined') return
    if (val === p) throw err
    p.status = false
    p.value = val
    flush(waiting, p)
  }
}

function flush (waiting, p) {
  var queue = p.status ? waiting.res : waiting.rej
  while (queue.length) queue.shift()(p.value)
}

function handleNext (p, waiting, handler, resolve, reject, hasReject) {
  return function next (value) {
    try {
      value = handler ? handler(value) : value
      if (p.status) return resolve(value)
      return hasReject ? resolve(value) : reject(value)
    } catch (err) { reject(err) }
  }
}


/***/ }),

/***/ "./src/experiences/countdownBanner/node_modules/@qubit/utils/dom/index.js":
/*!********************************************************************************!*\
  !*** ./src/experiences/countdownBanner/node_modules/@qubit/utils/dom/index.js ***!
  \********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const _ = __webpack_require__(/*! slapdash */ "./src/experiences/countdownBanner/node_modules/slapdash/dist/index.js")
const once = __webpack_require__(/*! ../lib/once */ "./src/experiences/countdownBanner/node_modules/@qubit/utils/lib/once.js")
const withRestoreAll = __webpack_require__(/*! ../lib/withRestoreAll */ "./src/experiences/countdownBanner/node_modules/@qubit/utils/lib/withRestoreAll.js")
const promised = __webpack_require__(/*! ../lib/promised */ "./src/experiences/countdownBanner/node_modules/@qubit/utils/lib/promised.js")
const noop = () => {}

function onEvent (el, type, fn) {
  el.addEventListener(type, fn)
  return once(() => el.removeEventListener(type, fn))
}

function style (el, css, fn) {
  const originalStyle = el.getAttribute('style')
  const newStyle = typeof css === 'string' ? fromStyle(css) : css
  const merged = {
    ...fromStyle(originalStyle),
    ...newStyle
  }
  el.setAttribute('style', toStyle(merged))
  return once(() => el.setAttribute('style', originalStyle))
}

function fromStyle (style) {
  if (!style) style = ''
  return style.split(';').reduce((memo, val) => {
    if (!val) return memo
    const [key, ...value] = val.split(':')
    memo[key] = value.join(':')
    return memo
  }, {})
}

function toStyle (css) {
  return _.keys(css).reduce((memo, key) => {
    return memo + `${kebab(key)}:${css[key]};`
  }, '')
}

function kebab (str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function isInViewPort (el) {
  if (el && el.parentElement) {
    const { top, bottom } = el.getBoundingClientRect()
    const isAboveWindowsBottom =
      top === bottom
        ? // If both bottom and top are at window.innerHeight
          // the element is entirely inside the viewport
          top <= window.innerHeight
        : // If the element has height, when top is at window.innerHeight
          // the element is below the window
          top < window.innerHeight
    const isBelowWindowsTop =
      top === bottom
        ? // If both bottom and top are at 0px
          // the element is entirely inside the viewport
          bottom >= 0
        : // If the element has height, when bottom is at 0px
          // the element is above the window
          bottom > 0
    return isAboveWindowsBottom && isBelowWindowsTop
  }
}

function onAnyEnterViewport (els, fn) {
  const disposables = []
  _.each(els, el => disposables.push(onEnterViewport(el, fn)))
  return once(() => {
    while (disposables.length) disposables.pop()()
  })
}

function onEnterViewport (el, fn, scrollTargetEl = window) {
  if (_.isArray(el)) {
    return onAnyEnterViewport(el, fn)
  }

  if (isInViewPort(el)) {
    fn()
    return noop
  }

  const handleScroll = _.debounce(() => {
    if (isInViewPort(el)) {
      scrollTargetEl.removeEventListener('scroll', handleScroll)
      fn()
    }
  }, 50)
  scrollTargetEl.addEventListener('scroll', handleScroll)
  return once(() => scrollTargetEl.removeEventListener('scroll', handleScroll))
}

function replace (target, el) {
  const parent = target.parentElement
  parent.insertBefore(el, target.nextSibling)
  parent.removeChild(target)
  return once(() => replace(el, target))
}

function insertAfter (target, el) {
  const parent = target.parentElement
  parent.insertBefore(el, target.nextSibling)
  return once(() => parent.removeChild(el))
}

function insertBefore (target, el) {
  const parent = target.parentElement
  parent.insertBefore(el, target)
  return once(() => parent.removeChild(el))
}

function appendChild (target, el) {
  target.appendChild(el)
  return once(() => target.removeChild(el))
}

module.exports = () => {
  const utils = withRestoreAll({
    onEvent,
    onEnterViewport,
    replace,
    style,
    insertAfter,
    insertBefore,
    appendChild,
    closest
  })

  _.each(_.keys(utils), key => {
    if (key.indexOf('on') === 0) utils[key] = promised(utils[key])
  })

  return utils
}

function closest (element, selector) {
  if (window.Element.prototype.closest) {
    return window.Element.prototype.closest.call(element, selector)
  } else {
    const matches = window.Element.prototype.matches ||
      window.Element.prototype.msMatchesSelector ||
      window.Element.prototype.webkitMatchesSelector

    let el = element

    do {
      if (matches.call(el, selector)) return el
      el = el.parentElement || el.parentNode
    } while (el !== null && el.nodeType === 1)
    return null
  }
}


/***/ }),

/***/ "./src/experiences/countdownBanner/node_modules/@qubit/utils/lib/once.js":
/*!*******************************************************************************!*\
  !*** ./src/experiences/countdownBanner/node_modules/@qubit/utils/lib/once.js ***!
  \*******************************************************************************/
/***/ ((module) => {

module.exports = function once (fn) {
  let called = false
  return (...args) => {
    if (called) return
    called = true
    return fn(...args)
  }
}


/***/ }),

/***/ "./src/experiences/countdownBanner/node_modules/@qubit/utils/lib/promised.js":
/*!***********************************************************************************!*\
  !*** ./src/experiences/countdownBanner/node_modules/@qubit/utils/lib/promised.js ***!
  \***********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Promise = __webpack_require__(/*! sync-p */ "./src/experiences/countdownBanner/node_modules/sync-p/index.js")

module.exports = function promised (fn) {
  return (...args) => {
    if (typeof args[args.length - 1] === 'function') {
      return fn(...args)
    }
    let dispose
    return new Promise(resolve => {
      args.push(resolve)
      dispose = fn(...args)
    }).then(value => {
      if (typeof dispose === 'function') {
        dispose()
      }
      return value
    })
  }
}


/***/ }),

/***/ "./src/experiences/countdownBanner/node_modules/@qubit/utils/lib/withRestoreAll.js":
/*!*****************************************************************************************!*\
  !*** ./src/experiences/countdownBanner/node_modules/@qubit/utils/lib/withRestoreAll.js ***!
  \*****************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const _ = __webpack_require__(/*! slapdash */ "./src/experiences/countdownBanner/node_modules/slapdash/dist/index.js")

module.exports = function withRestoreAll (utils) {
  const cleanup = []

  function restorable (fn) {
    return (...args) => {
      const dispose = fn(...args)
      if (typeof dispose === 'function') {
        cleanup.push(dispose)
      }
      return dispose
    }
  }
  const result = {}

  for (const key of _.keys(utils)) {
    result[key] = restorable(utils[key])
  }

  result.restoreAll = function restoreAll () {
    while (cleanup.length) cleanup.pop()()
  }

  return result
}


/***/ }),

/***/ "./src/experiences/countdownBanner/node_modules/preact/dist/preact.module.js":
/*!***********************************************************************************!*\
  !*** ./src/experiences/countdownBanner/node_modules/preact/dist/preact.module.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Component": () => (/* binding */ _),
/* harmony export */   "Fragment": () => (/* binding */ d),
/* harmony export */   "cloneElement": () => (/* binding */ B),
/* harmony export */   "createContext": () => (/* binding */ D),
/* harmony export */   "createElement": () => (/* binding */ v),
/* harmony export */   "createRef": () => (/* binding */ p),
/* harmony export */   "h": () => (/* binding */ v),
/* harmony export */   "hydrate": () => (/* binding */ q),
/* harmony export */   "isValidElement": () => (/* binding */ i),
/* harmony export */   "options": () => (/* binding */ l),
/* harmony export */   "render": () => (/* binding */ S),
/* harmony export */   "toChildArray": () => (/* binding */ A)
/* harmony export */ });
var n,l,u,i,t,o,r,f,e={},c=[],s=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function a(n,l){for(var u in l)n[u]=l[u];return n}function h(n){var l=n.parentNode;l&&l.removeChild(n)}function v(l,u,i){var t,o,r,f={};for(r in u)"key"==r?t=u[r]:"ref"==r?o=u[r]:f[r]=u[r];if(arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):i),"function"==typeof l&&null!=l.defaultProps)for(r in l.defaultProps)void 0===f[r]&&(f[r]=l.defaultProps[r]);return y(l,f,t,o,null)}function y(n,i,t,o,r){var f={type:n,props:i,key:t,ref:o,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==r?++u:r};return null==r&&null!=l.vnode&&l.vnode(f),f}function p(){return{current:null}}function d(n){return n.children}function _(n,l){this.props=n,this.context=l}function k(n,l){if(null==l)return n.__?k(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return"function"==typeof n.type?k(n):null}function b(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return b(n)}}function m(n){(!n.__d&&(n.__d=!0)&&t.push(n)&&!g.__r++||r!==l.debounceRendering)&&((r=l.debounceRendering)||o)(g)}function g(){for(var n;g.__r=t.length;)n=t.sort(function(n,l){return n.__v.__b-l.__v.__b}),t=[],n.some(function(n){var l,u,i,t,o,r;n.__d&&(o=(t=(l=n).__v).__e,(r=l.__P)&&(u=[],(i=a({},t)).__v=t.__v+1,j(r,t,i,l.__n,void 0!==r.ownerSVGElement,null!=t.__h?[o]:null,u,null==o?k(t):o,t.__h),z(u,t),t.__e!=o&&b(t)))})}function w(n,l,u,i,t,o,r,f,s,a){var h,v,p,_,b,m,g,w=i&&i.__k||c,A=w.length;for(u.__k=[],h=0;h<l.length;h++)if(null!=(_=u.__k[h]=null==(_=l[h])||"boolean"==typeof _?null:"string"==typeof _||"number"==typeof _||"bigint"==typeof _?y(null,_,null,null,_):Array.isArray(_)?y(d,{children:_},null,null,null):_.__b>0?y(_.type,_.props,_.key,null,_.__v):_)){if(_.__=u,_.__b=u.__b+1,null===(p=w[h])||p&&_.key==p.key&&_.type===p.type)w[h]=void 0;else for(v=0;v<A;v++){if((p=w[v])&&_.key==p.key&&_.type===p.type){w[v]=void 0;break}p=null}j(n,_,p=p||e,t,o,r,f,s,a),b=_.__e,(v=_.ref)&&p.ref!=v&&(g||(g=[]),p.ref&&g.push(p.ref,null,_),g.push(v,_.__c||b,_)),null!=b?(null==m&&(m=b),"function"==typeof _.type&&_.__k===p.__k?_.__d=s=x(_,s,n):s=P(n,_,p,w,b,s),"function"==typeof u.type&&(u.__d=s)):s&&p.__e==s&&s.parentNode!=n&&(s=k(p))}for(u.__e=m,h=A;h--;)null!=w[h]&&("function"==typeof u.type&&null!=w[h].__e&&w[h].__e==u.__d&&(u.__d=k(i,h+1)),N(w[h],w[h]));if(g)for(h=0;h<g.length;h++)M(g[h],g[++h],g[++h])}function x(n,l,u){for(var i,t=n.__k,o=0;t&&o<t.length;o++)(i=t[o])&&(i.__=n,l="function"==typeof i.type?x(i,l,u):P(u,i,i,t,i.__e,l));return l}function A(n,l){return l=l||[],null==n||"boolean"==typeof n||(Array.isArray(n)?n.some(function(n){A(n,l)}):l.push(n)),l}function P(n,l,u,i,t,o){var r,f,e;if(void 0!==l.__d)r=l.__d,l.__d=void 0;else if(null==u||t!=o||null==t.parentNode)n:if(null==o||o.parentNode!==n)n.appendChild(t),r=null;else{for(f=o,e=0;(f=f.nextSibling)&&e<i.length;e+=2)if(f==t)break n;n.insertBefore(t,o),r=o}return void 0!==r?r:t.nextSibling}function C(n,l,u,i,t){var o;for(o in u)"children"===o||"key"===o||o in l||H(n,o,null,u[o],i);for(o in l)t&&"function"!=typeof l[o]||"children"===o||"key"===o||"value"===o||"checked"===o||u[o]===l[o]||H(n,o,l[o],u[o],i)}function $(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||s.test(l)?u:u+"px"}function H(n,l,u,i,t){var o;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else{if("string"==typeof i&&(n.style.cssText=i=""),i)for(l in i)u&&l in u||$(n.style,l,"");if(u)for(l in u)i&&u[l]===i[l]||$(n.style,l,u[l])}else if("o"===l[0]&&"n"===l[1])o=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+o]=u,u?i||n.addEventListener(l,o?T:I,o):n.removeEventListener(l,o?T:I,o);else if("dangerouslySetInnerHTML"!==l){if(t)l=l.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null!=u&&(!1!==u||"a"===l[0]&&"r"===l[1])?n.setAttribute(l,u):n.removeAttribute(l))}}function I(n){this.l[n.type+!1](l.event?l.event(n):n)}function T(n){this.l[n.type+!0](l.event?l.event(n):n)}function j(n,u,i,t,o,r,f,e,c){var s,h,v,y,p,k,b,m,g,x,A,P=u.type;if(void 0!==u.constructor)return null;null!=i.__h&&(c=i.__h,e=u.__e=i.__e,u.__h=null,r=[e]),(s=l.__b)&&s(u);try{n:if("function"==typeof P){if(m=u.props,g=(s=P.contextType)&&t[s.__c],x=s?g?g.props.value:s.__:t,i.__c?b=(h=u.__c=i.__c).__=h.__E:("prototype"in P&&P.prototype.render?u.__c=h=new P(m,x):(u.__c=h=new _(m,x),h.constructor=P,h.render=O),g&&g.sub(h),h.props=m,h.state||(h.state={}),h.context=x,h.__n=t,v=h.__d=!0,h.__h=[]),null==h.__s&&(h.__s=h.state),null!=P.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=a({},h.__s)),a(h.__s,P.getDerivedStateFromProps(m,h.__s))),y=h.props,p=h.state,v)null==P.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else{if(null==P.getDerivedStateFromProps&&m!==y&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(m,x),!h.__e&&null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(m,h.__s,x)||u.__v===i.__v){h.props=m,h.state=h.__s,u.__v!==i.__v&&(h.__d=!1),h.__v=u,u.__e=i.__e,u.__k=i.__k,u.__k.forEach(function(n){n&&(n.__=u)}),h.__h.length&&f.push(h);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(m,h.__s,x),null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(y,p,k)})}h.context=x,h.props=m,h.state=h.__s,(s=l.__r)&&s(u),h.__d=!1,h.__v=u,h.__P=n,s=h.render(h.props,h.state,h.context),h.state=h.__s,null!=h.getChildContext&&(t=a(a({},t),h.getChildContext())),v||null==h.getSnapshotBeforeUpdate||(k=h.getSnapshotBeforeUpdate(y,p)),A=null!=s&&s.type===d&&null==s.key?s.props.children:s,w(n,Array.isArray(A)?A:[A],u,i,t,o,r,f,e,c),h.base=u.__e,u.__h=null,h.__h.length&&f.push(h),b&&(h.__E=h.__=null),h.__e=!1}else null==r&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=L(i.__e,u,i,t,o,r,f,c);(s=l.diffed)&&s(u)}catch(n){u.__v=null,(c||null!=r)&&(u.__e=e,u.__h=!!c,r[r.indexOf(e)]=null),l.__e(n,u,i)}}function z(n,u){l.__c&&l.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u)})}catch(n){l.__e(n,u.__v)}})}function L(l,u,i,t,o,r,f,c){var s,a,v,y=i.props,p=u.props,d=u.type,_=0;if("svg"===d&&(o=!0),null!=r)for(;_<r.length;_++)if((s=r[_])&&"setAttribute"in s==!!d&&(d?s.localName===d:3===s.nodeType)){l=s,r[_]=null;break}if(null==l){if(null===d)return document.createTextNode(p);l=o?document.createElementNS("http://www.w3.org/2000/svg",d):document.createElement(d,p.is&&p),r=null,c=!1}if(null===d)y===p||c&&l.data===p||(l.data=p);else{if(r=r&&n.call(l.childNodes),a=(y=i.props||e).dangerouslySetInnerHTML,v=p.dangerouslySetInnerHTML,!c){if(null!=r)for(y={},_=0;_<l.attributes.length;_++)y[l.attributes[_].name]=l.attributes[_].value;(v||a)&&(v&&(a&&v.__html==a.__html||v.__html===l.innerHTML)||(l.innerHTML=v&&v.__html||""))}if(C(l,p,y,o,c),v)u.__k=[];else if(_=u.props.children,w(l,Array.isArray(_)?_:[_],u,i,t,o&&"foreignObject"!==d,r,f,r?r[0]:i.__k&&k(i,0),c),null!=r)for(_=r.length;_--;)null!=r[_]&&h(r[_]);c||("value"in p&&void 0!==(_=p.value)&&(_!==l.value||"progress"===d&&!_||"option"===d&&_!==y.value)&&H(l,"value",_,y.value,!1),"checked"in p&&void 0!==(_=p.checked)&&_!==l.checked&&H(l,"checked",_,y.checked,!1))}return l}function M(n,u,i){try{"function"==typeof n?n(u):n.current=u}catch(n){l.__e(n,i)}}function N(n,u,i){var t,o;if(l.unmount&&l.unmount(n),(t=n.ref)&&(t.current&&t.current!==n.__e||M(t,null,u)),null!=(t=n.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount()}catch(n){l.__e(n,u)}t.base=t.__P=null}if(t=n.__k)for(o=0;o<t.length;o++)t[o]&&N(t[o],u,"function"!=typeof n.type);i||null==n.__e||h(n.__e),n.__e=n.__d=void 0}function O(n,l,u){return this.constructor(n,u)}function S(u,i,t){var o,r,f;l.__&&l.__(u,i),r=(o="function"==typeof t)?null:t&&t.__k||i.__k,f=[],j(i,u=(!o&&t||i).__k=v(d,null,[u]),r||e,e,void 0!==i.ownerSVGElement,!o&&t?[t]:r?null:i.firstChild?n.call(i.childNodes):null,f,!o&&t?t:r?r.__e:i.firstChild,o),z(f,u)}function q(n,l){S(n,l,q)}function B(l,u,i){var t,o,r,f=a({},l.props);for(r in u)"key"==r?t=u[r]:"ref"==r?o=u[r]:f[r]=u[r];return arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):i),y(l.type,f,t||l.key,o||l.ref,null)}function D(n,l){var u={__c:l="__cC"+f++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,i;return this.getChildContext||(u=[],(i={})[l]=this,this.getChildContext=function(){return i},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(m)},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n)}}),n.children}};return u.Provider.__=u.Consumer.contextType=u}n=c.slice,l={__e:function(n,l,u,i){for(var t,o,r;l=l.__;)if((t=l.__c)&&!t.__)try{if((o=t.constructor)&&null!=o.getDerivedStateFromError&&(t.setState(o.getDerivedStateFromError(n)),r=t.__d),null!=t.componentDidCatch&&(t.componentDidCatch(n,i||{}),r=t.__d),r)return t.__E=t}catch(l){n=l}throw n}},u=0,i=function(n){return null!=n&&void 0===n.constructor},_.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=a({},this.state),"function"==typeof n&&(n=n(a({},u),this.props)),n&&a(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),m(this))},_.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),m(this))},_.prototype.render=d,t=[],o="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,g.__r=0,f=0;
//# sourceMappingURL=preact.module.js.map


/***/ }),

/***/ "./src/experiences/countdownBanner/node_modules/preact/hooks/dist/hooks.module.js":
/*!****************************************************************************************!*\
  !*** ./src/experiences/countdownBanner/node_modules/preact/hooks/dist/hooks.module.js ***!
  \****************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useCallback": () => (/* binding */ A),
/* harmony export */   "useContext": () => (/* binding */ F),
/* harmony export */   "useDebugValue": () => (/* binding */ T),
/* harmony export */   "useEffect": () => (/* binding */ y),
/* harmony export */   "useErrorBoundary": () => (/* binding */ q),
/* harmony export */   "useImperativeHandle": () => (/* binding */ s),
/* harmony export */   "useLayoutEffect": () => (/* binding */ d),
/* harmony export */   "useMemo": () => (/* binding */ _),
/* harmony export */   "useReducer": () => (/* binding */ p),
/* harmony export */   "useRef": () => (/* binding */ h),
/* harmony export */   "useState": () => (/* binding */ m)
/* harmony export */ });
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./src/experiences/countdownBanner/node_modules/preact/dist/preact.module.js");
var t,u,r,o=0,i=[],c=preact__WEBPACK_IMPORTED_MODULE_0__.options.__b,f=preact__WEBPACK_IMPORTED_MODULE_0__.options.__r,e=preact__WEBPACK_IMPORTED_MODULE_0__.options.diffed,a=preact__WEBPACK_IMPORTED_MODULE_0__.options.__c,v=preact__WEBPACK_IMPORTED_MODULE_0__.options.unmount;function l(t,r){preact__WEBPACK_IMPORTED_MODULE_0__.options.__h&&preact__WEBPACK_IMPORTED_MODULE_0__.options.__h(u,t,o||r),o=0;var i=u.__H||(u.__H={__:[],__h:[]});return t>=i.__.length&&i.__.push({}),i.__[t]}function m(n){return o=1,p(w,n)}function p(n,r,o){var i=l(t++,2);return i.t=n,i.__c||(i.__=[o?o(r):w(void 0,r),function(n){var t=i.t(i.__[0],n);i.__[0]!==t&&(i.__=[t,i.__[1]],i.__c.setState({}))}],i.__c=u),i.__}function y(r,o){var i=l(t++,3);!preact__WEBPACK_IMPORTED_MODULE_0__.options.__s&&k(i.__H,o)&&(i.__=r,i.__H=o,u.__H.__h.push(i))}function d(r,o){var i=l(t++,4);!preact__WEBPACK_IMPORTED_MODULE_0__.options.__s&&k(i.__H,o)&&(i.__=r,i.__H=o,u.__h.push(i))}function h(n){return o=5,_(function(){return{current:n}},[])}function s(n,t,u){o=6,d(function(){return"function"==typeof n?(n(t()),function(){return n(null)}):n?(n.current=t(),function(){return n.current=null}):void 0},null==u?u:u.concat(n))}function _(n,u){var r=l(t++,7);return k(r.__H,u)&&(r.__=n(),r.__H=u,r.__h=n),r.__}function A(n,t){return o=8,_(function(){return n},t)}function F(n){var r=u.context[n.__c],o=l(t++,9);return o.c=n,r?(null==o.__&&(o.__=!0,r.sub(u)),r.props.value):n.__}function T(t,u){preact__WEBPACK_IMPORTED_MODULE_0__.options.useDebugValue&&preact__WEBPACK_IMPORTED_MODULE_0__.options.useDebugValue(u?u(t):t)}function q(n){var r=l(t++,10),o=m();return r.__=n,u.componentDidCatch||(u.componentDidCatch=function(n){r.__&&r.__(n),o[1](n)}),[o[0],function(){o[1](void 0)}]}function x(){for(var t;t=i.shift();)if(t.__P)try{t.__H.__h.forEach(g),t.__H.__h.forEach(j),t.__H.__h=[]}catch(u){t.__H.__h=[],preact__WEBPACK_IMPORTED_MODULE_0__.options.__e(u,t.__v)}}preact__WEBPACK_IMPORTED_MODULE_0__.options.__b=function(n){u=null,c&&c(n)},preact__WEBPACK_IMPORTED_MODULE_0__.options.__r=function(n){f&&f(n),t=0;var r=(u=n.__c).__H;r&&(r.__h.forEach(g),r.__h.forEach(j),r.__h=[])},preact__WEBPACK_IMPORTED_MODULE_0__.options.diffed=function(t){e&&e(t);var o=t.__c;o&&o.__H&&o.__H.__h.length&&(1!==i.push(o)&&r===preact__WEBPACK_IMPORTED_MODULE_0__.options.requestAnimationFrame||((r=preact__WEBPACK_IMPORTED_MODULE_0__.options.requestAnimationFrame)||function(n){var t,u=function(){clearTimeout(r),b&&cancelAnimationFrame(t),setTimeout(n)},r=setTimeout(u,100);b&&(t=requestAnimationFrame(u))})(x)),u=null},preact__WEBPACK_IMPORTED_MODULE_0__.options.__c=function(t,u){u.some(function(t){try{t.__h.forEach(g),t.__h=t.__h.filter(function(n){return!n.__||j(n)})}catch(r){u.some(function(n){n.__h&&(n.__h=[])}),u=[],preact__WEBPACK_IMPORTED_MODULE_0__.options.__e(r,t.__v)}}),a&&a(t,u)},preact__WEBPACK_IMPORTED_MODULE_0__.options.unmount=function(t){v&&v(t);var u,r=t.__c;r&&r.__H&&(r.__H.__.forEach(function(n){try{g(n)}catch(n){u=n}}),u&&preact__WEBPACK_IMPORTED_MODULE_0__.options.__e(u,r.__v))};var b="function"==typeof requestAnimationFrame;function g(n){var t=u,r=n.__c;"function"==typeof r&&(n.__c=void 0,r()),u=t}function j(n){var t=u;n.__c=n.__(),u=t}function k(n,t){return!n||n.length!==t.length||t.some(function(t,u){return t!==n[u]})}function w(n,t){return"function"==typeof t?t(n):t}
//# sourceMappingURL=hooks.module.js.map


/***/ }),

/***/ "./src/experiences/countdownBanner/node_modules/slapdash/dist/index.js":
/*!*****************************************************************************!*\
  !*** ./src/experiences/countdownBanner/node_modules/slapdash/dist/index.js ***!
  \*****************************************************************************/
/***/ ((module) => {

var toString = Function.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty
var regexpCharacters = /[\\^$.*+?()[\]{}|]/g
var regexpIsNativeFn = toString.call(hasOwnProperty)
  .replace(regexpCharacters, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?')
var regexpIsNative = RegExp('^' + regexpIsNativeFn + '$')
function toSource (func) {
  if (!func) return ''
  try {
    return toString.call(func)
  } catch (e) {}
  try {
    return (func + '')
  } catch (e) {}
}
var assign = Object.assign
var forEach = Array.prototype.forEach
var every = Array.prototype.every
var filter = Array.prototype.filter
var find = Array.prototype.find
var indexOf = Array.prototype.indexOf
var isArray = Array.isArray
var keys = Object.keys
var map = Array.prototype.map
var reduce = Array.prototype.reduce
var slice = Array.prototype.slice
var some = Array.prototype.some
var values = Object.values
function isNative (method) {
  return method && typeof method === 'function' && regexpIsNative.test(toSource(method))
}
var _ = {
  assign: isNative(assign)
    ? assign
    : function assign (target) {
      var l = arguments.length
      for (var i = 1; i < l; i++) {
        var source = arguments[i]
        for (var j in source) if (source.hasOwnProperty(j)) target[j] = source[j]
      }
      return target
    },
  bind: function bind (method, context) {
    var args = _.slice(arguments, 2)
    return function boundFunction () {
      return method.apply(context, args.concat(_.slice(arguments)))
    }
  },
  debounce: function debounce (func, wait, immediate) {
    var timeout
    return function () {
      var context = this
      var args = arguments
      var later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  },
  each: isNative(forEach)
    ? function nativeEach (array, callback, context) {
      return forEach.call(array, callback, context)
    }
    : function each (array, callback, context) {
      var l = array.length
      for (var i = 0; i < l; i++) callback.call(context, array[i], i, array)
    },
  every: isNative(every)
    ? function nativeEvery (coll, pred, context) {
      return every.call(coll, pred, context)
    }
    : function every (coll, pred, context) {
      if (!coll || !pred) {
        throw new TypeError()
      }
      for (var i = 0; i < coll.length; i++) {
        if (!pred.call(context, coll[i], i, coll)) {
          return false
        }
      }
      return true
    },
  filter: isNative(filter)
    ? function nativeFilter (array, callback, context) {
      return filter.call(array, callback, context)
    }
    : function filter (array, callback, context) {
      var l = array.length
      var output = []
      for (var i = 0; i < l; i++) {
        if (callback.call(context, array[i], i, array)) output.push(array[i])
      }
      return output
    },
  find: isNative(find)
    ? function nativeFind (array, callback, context) {
      return find.call(array, callback, context)
    }
    : function find (array, callback, context) {
      var l = array.length
      for (var i = 0; i < l; i++) {
        if (callback.call(context, array[i], i, array)) return array[i]
      }
    },
  get: function get (object, path) {
    return _.reduce(path.split('.'), function (memo, next) {
      return (typeof memo !== 'undefined' && memo !== null) ? memo[next] : undefined
    }, object)
  },
  identity: function identity (value) {
    return value
  },
  indexOf: isNative(indexOf)
    ? function nativeIndexOf (array, item) {
      return indexOf.call(array, item)
    }
    : function indexOf (array, item) {
      var l = array.length
      for (var i = 0; i < l; i++) {
        if (array[i] === item) return i
      }
      return -1
    },
  invoke: function invoke (array, methodName) {
    var args = _.slice(arguments, 2)
    return _.map(array, function invokeMapper (value) {
      return value[methodName].apply(value, args)
    })
  },
  isArray: isNative(isArray)
    ? function nativeArray (coll) {
      return isArray(coll)
    }
    : function isArray (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]'
    },
  isMatch: function isMatch (obj, spec) {
    for (var i in spec) {
      if (spec.hasOwnProperty(i) && obj[i] !== spec[i]) return false
    }
    return true
  },
  isObject: function isObject (obj) {
    var type = typeof obj
    return type === 'function' || type === 'object' && !!obj
  },
  keys: isNative(keys)
    ? keys
    : function keys (object) {
      var keys = []
      for (var key in object) {
        if (object.hasOwnProperty(key)) keys.push(key)
      }
      return keys
    },
  map: isNative(map)
    ? function nativeMap (array, callback, context) {
      return map.call(array, callback, context)
    }
    : function map (array, callback, context) {
      var l = array.length
      var output = new Array(l)
      for (var i = 0; i < l; i++) {
        output[i] = callback.call(context, array[i], i, array)
      }
      return output
    },
  matches: function matches (spec) {
    return function (obj) {
      return _.isMatch(obj, spec)
    }
  },
  not: function not (value) {
    return !value
  },
  objectEach: function (object, callback, context) {
    return _.each(_.keys(object), function (key) {
      return callback.call(context, object[key], key, object)
    }, context)
  },
  objectMap: function objectMap (object, callback, context) {
    var result = {}
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        result[key] = callback.call(context, object[key], key, object)
      }
    }
    return result
  },
  objectReduce: function objectReduce (object, callback, initialValue) {
    var output = initialValue
    for (var i in object) {
      if (object.hasOwnProperty(i)) output = callback(output, object[i], i, object)
    }
    return output
  },
  pick: function pick (object, toPick) {
    var out = {}
    _.each(toPick, function (key) {
      if (typeof object[key] !== 'undefined') out[key] = object[key]
    })
    return out
  },
  pluck: function pluck (array, key) {
    var l = array.length
    var out = []
    for (var i = 0; i < l; i++) if (array[i]) out[i] = array[i][key]
    return out
  },
  reduce: isNative(reduce)
    ? function nativeReduce (array, callback, initialValue) {
      return reduce.call(array, callback, initialValue)
    }
    : function reduce (array, callback, initialValue) {
      var output = initialValue
      var l = array.length
      for (var i = 0; i < l; i++) output = callback(output, array[i], i, array)
      return output
    },
  set: function set (object, path, val) {
    if (!object) return object
    if (typeof object !== 'object' && typeof object !== 'function') return object
    var parts = path.split('.')
    var context = object
    var nextKey
    do {
      nextKey = parts.shift()
      if (typeof context[nextKey] !== 'object') context[nextKey] = {}
      if (parts.length) {
        context = context[nextKey]
      } else {
        context[nextKey] = val
      }
    } while (parts.length)
    return object
  },
  slice: isNative(slice)
    ? function nativeSlice (array, begin, end) {
      begin = begin || 0
      end = typeof end === 'number' ? end : array.length
      return slice.call(array, begin, end)
    }
    : function slice (array, start, end) {
      start = start || 0
      end = typeof end === 'number' ? end : array.length
      var length = array == null ? 0 : array.length
      if (!length) {
        return []
      }
      if (start < 0) {
        start = -start > length ? 0 : (length + start)
      }
      end = end > length ? length : end
      if (end < 0) {
        end += length
      }
      length = start > end ? 0 : ((end - start) >>> 0)
      start >>>= 0
      var index = -1
      var result = new Array(length)
      while (++index < length) {
        result[index] = array[index + start]
      }
      return result
    },
  some: isNative(some)
    ? function nativeSome (coll, pred, context) {
      return some.call(coll, pred, context)
    }
    : function some (coll, pred, context) {
      if (!coll || !pred) {
        throw new TypeError()
      }
      for (var i = 0; i < coll.length; i++) {
        if (pred.call(context, coll[i], i, coll)) {
          return true
        }
      }
      return false
    },
  unique: function unique (array) {
    return _.reduce(array, function (memo, curr) {
      if (_.indexOf(memo, curr) === -1) {
        memo.push(curr)
      }
      return memo
    }, [])
  },
  values: isNative(values)
    ? values
    : function values (object) {
      var out = []
      for (var key in object) {
        if (object.hasOwnProperty(key)) out.push(object[key])
      }
      return out
    },
  name: 'slapdash',
  version: '1.3.3'
}
_.objectMap.asArray = function objectMapAsArray (object, callback, context) {
  return _.map(_.keys(object), function (key) {
    return callback.call(context, object[key], key, object)
  }, context)
}
module.exports = _


/***/ }),

/***/ "./src/experiences/countdownBanner/node_modules/sync-p/index.js":
/*!**********************************************************************!*\
  !*** ./src/experiences/countdownBanner/node_modules/sync-p/index.js ***!
  \**********************************************************************/
/***/ ((module) => {

var err = new Error('Error: recurses! infinite promise chain detected')
module.exports = function promise (resolver) {
  var waiting = { res: [], rej: [] }
  var p = {
    'then': then,
    'catch': function thenCatch (onReject) {
      return then(null, onReject)
    }
  }
  try { resolver(resolve, reject) } catch (e) {
    p.status = false
    p.value = e
  }
  return p

  function then (onResolve, onReject) {
    return promise(function (resolve, reject) {
      waiting.res.push(handleNext(p, waiting, onResolve, resolve, reject, onReject))
      waiting.rej.push(handleNext(p, waiting, onReject, resolve, reject, onReject))
      if (typeof p.status !== 'undefined') flush(waiting, p)
    })
  }

  function resolve (val) {
    if (typeof p.status !== 'undefined') return
    if (val === p) throw err
    if (val) try { if (typeof val.then === 'function') return val.then(resolve, reject) } catch (e) {}
    p.status = true
    p.value = val
    flush(waiting, p)
  }

  function reject (val) {
    if (typeof p.status !== 'undefined') return
    if (val === p) throw err
    p.status = false
    p.value = val
    flush(waiting, p)
  }
}

function flush (waiting, p) {
  var queue = p.status ? waiting.res : waiting.rej
  while (queue.length) queue.shift()(p.value)
}

function handleNext (p, waiting, handler, resolve, reject, hasReject) {
  return function next (value) {
    try {
      value = handler ? handler(value) : value
      if (p.status) return resolve(value)
      return hasReject ? resolve(value) : reject(value)
    } catch (err) { reject(err) }
  }
}


/***/ }),

/***/ "./src/experiences/exitIntent/node_modules/@glidejs/glide/dist/glide.esm.js":
/*!**********************************************************************************!*\
  !*** ./src/experiences/exitIntent/node_modules/@glidejs/glide/dist/glide.esm.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Glide)
/* harmony export */ });
/*!
 * Glide.js v3.5.2
 * (c) 2013-2021 Jędrzej Chałubek (https://github.com/jedrzejchalubek/)
 * Released under the MIT License.
 */

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get() {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(arguments.length < 3 ? target : receiver);
      }

      return desc.value;
    };
  }

  return _get.apply(this, arguments);
}

var defaults = {
  /**
   * Type of the movement.
   *
   * Available types:
   * `slider` - Rewinds slider to the start/end when it reaches the first or last slide.
   * `carousel` - Changes slides without starting over when it reaches the first or last slide.
   *
   * @type {String}
   */
  type: 'slider',

  /**
   * Start at specific slide number defined with zero-based index.
   *
   * @type {Number}
   */
  startAt: 0,

  /**
   * A number of slides visible on the single viewport.
   *
   * @type {Number}
   */
  perView: 1,

  /**
   * Focus currently active slide at a specified position in the track.
   *
   * Available inputs:
   * `center` - Current slide will be always focused at the center of a track.
   * `0,1,2,3...` - Current slide will be focused on the specified zero-based index.
   *
   * @type {String|Number}
   */
  focusAt: 0,

  /**
   * A size of the gap added between slides.
   *
   * @type {Number}
   */
  gap: 10,

  /**
   * Change slides after a specified interval. Use `false` for turning off autoplay.
   *
   * @type {Number|Boolean}
   */
  autoplay: false,

  /**
   * Stop autoplay on mouseover event.
   *
   * @type {Boolean}
   */
  hoverpause: true,

  /**
   * Allow for changing slides with left and right keyboard arrows.
   *
   * @type {Boolean}
   */
  keyboard: true,

  /**
   * Stop running `perView` number of slides from the end. Use this
   * option if you don't want to have an empty space after
   * a slider. Works only with `slider` type and a
   * non-centered `focusAt` setting.
   *
   * @type {Boolean}
   */
  bound: false,

  /**
   * Minimal swipe distance needed to change the slide. Use `false` for turning off a swiping.
   *
   * @type {Number|Boolean}
   */
  swipeThreshold: 80,

  /**
   * Minimal mouse drag distance needed to change the slide. Use `false` for turning off a dragging.
   *
   * @type {Number|Boolean}
   */
  dragThreshold: 120,

  /**
   * A number of slides moved on single swipe.
   *
   * Available types:
   * `` - Moves slider by one slide per swipe
   * `|` - Moves slider between views per swipe (number of slides defined in `perView` options)
   *
   * @type {String}
   */
  perSwipe: '',

  /**
   * Moving distance ratio of the slides on a swiping and dragging.
   *
   * @type {Number}
   */
  touchRatio: 0.5,

  /**
   * Angle required to activate slides moving on swiping or dragging.
   *
   * @type {Number}
   */
  touchAngle: 45,

  /**
   * Duration of the animation in milliseconds.
   *
   * @type {Number}
   */
  animationDuration: 400,

  /**
   * Allows looping the `slider` type. Slider will rewind to the first/last slide when it's at the start/end.
   *
   * @type {Boolean}
   */
  rewind: true,

  /**
   * Duration of the rewinding animation of the `slider` type in milliseconds.
   *
   * @type {Number}
   */
  rewindDuration: 800,

  /**
   * Easing function for the animation.
   *
   * @type {String}
   */
  animationTimingFunc: 'cubic-bezier(.165, .840, .440, 1)',

  /**
   * Wait for the animation to finish until the next user input can be processed
   *
   * @type {boolean}
   */
  waitForTransition: true,

  /**
   * Throttle costly events at most once per every wait milliseconds.
   *
   * @type {Number}
   */
  throttle: 10,

  /**
   * Moving direction mode.
   *
   * Available inputs:
   * - 'ltr' - left to right movement,
   * - 'rtl' - right to left movement.
   *
   * @type {String}
   */
  direction: 'ltr',

  /**
   * The distance value of the next and previous viewports which
   * have to peek in the current view. Accepts number and
   * pixels as a string. Left and right peeking can be
   * set up separately with a directions object.
   *
   * For example:
   * `100` - Peek 100px on the both sides.
   * { before: 100, after: 50 }` - Peek 100px on the left side and 50px on the right side.
   *
   * @type {Number|String|Object}
   */
  peek: 0,

  /**
   * Defines how many clones of current viewport will be generated.
   *
   * @type {Number}
   */
  cloningRatio: 1,

  /**
   * Collection of options applied at specified media breakpoints.
   * For example: display two slides per view under 800px.
   * `{
   *   '800px': {
   *     perView: 2
   *   }
   * }`
   */
  breakpoints: {},

  /**
   * Collection of internally used HTML classes.
   *
   * @todo Refactor `slider` and `carousel` properties to single `type: { slider: '', carousel: '' }` object
   * @type {Object}
   */
  classes: {
    swipeable: 'glide--swipeable',
    dragging: 'glide--dragging',
    direction: {
      ltr: 'glide--ltr',
      rtl: 'glide--rtl'
    },
    type: {
      slider: 'glide--slider',
      carousel: 'glide--carousel'
    },
    slide: {
      clone: 'glide__slide--clone',
      active: 'glide__slide--active'
    },
    arrow: {
      disabled: 'glide__arrow--disabled'
    },
    nav: {
      active: 'glide__bullet--active'
    }
  }
};

/**
 * Outputs warning message to the bowser console.
 *
 * @param  {String} msg
 * @return {Void}
 */
function warn(msg) {
  console.error("[Glide warn]: ".concat(msg));
}

/**
 * Converts value entered as number
 * or string to integer value.
 *
 * @param {String} value
 * @returns {Number}
 */
function toInt(value) {
  return parseInt(value);
}
/**
 * Converts value entered as number
 * or string to flat value.
 *
 * @param {String} value
 * @returns {Number}
 */

function toFloat(value) {
  return parseFloat(value);
}
/**
 * Indicates whether the specified value is a string.
 *
 * @param  {*}   value
 * @return {Boolean}
 */

function isString(value) {
  return typeof value === 'string';
}
/**
 * Indicates whether the specified value is an object.
 *
 * @param  {*} value
 * @return {Boolean}
 *
 * @see https://github.com/jashkenas/underscore
 */

function isObject(value) {
  var type = _typeof(value);

  return type === 'function' || type === 'object' && !!value; // eslint-disable-line no-mixed-operators
}
/**
 * Indicates whether the specified value is a function.
 *
 * @param  {*} value
 * @return {Boolean}
 */

function isFunction(value) {
  return typeof value === 'function';
}
/**
 * Indicates whether the specified value is undefined.
 *
 * @param  {*} value
 * @return {Boolean}
 */

function isUndefined(value) {
  return typeof value === 'undefined';
}
/**
 * Indicates whether the specified value is an array.
 *
 * @param  {*} value
 * @return {Boolean}
 */

function isArray(value) {
  return value.constructor === Array;
}

/**
 * Creates and initializes specified collection of extensions.
 * Each extension receives access to instance of glide and rest of components.
 *
 * @param {Object} glide
 * @param {Object} extensions
 *
 * @returns {Object}
 */

function mount(glide, extensions, events) {
  var components = {};

  for (var name in extensions) {
    if (isFunction(extensions[name])) {
      components[name] = extensions[name](glide, components, events);
    } else {
      warn('Extension must be a function');
    }
  }

  for (var _name in components) {
    if (isFunction(components[_name].mount)) {
      components[_name].mount();
    }
  }

  return components;
}

/**
 * Defines getter and setter property on the specified object.
 *
 * @param  {Object} obj         Object where property has to be defined.
 * @param  {String} prop        Name of the defined property.
 * @param  {Object} definition  Get and set definitions for the property.
 * @return {Void}
 */
function define(obj, prop, definition) {
  Object.defineProperty(obj, prop, definition);
}
/**
 * Sorts aphabetically object keys.
 *
 * @param  {Object} obj
 * @return {Object}
 */

function sortKeys(obj) {
  return Object.keys(obj).sort().reduce(function (r, k) {
    r[k] = obj[k];
    return r[k], r;
  }, {});
}
/**
 * Merges passed settings object with default options.
 *
 * @param  {Object} defaults
 * @param  {Object} settings
 * @return {Object}
 */

function mergeOptions(defaults, settings) {
  var options = Object.assign({}, defaults, settings); // `Object.assign` do not deeply merge objects, so we
  // have to do it manually for every nested object
  // in options. Although it does not look smart,
  // it's smaller and faster than some fancy
  // merging deep-merge algorithm script.

  if (settings.hasOwnProperty('classes')) {
    options.classes = Object.assign({}, defaults.classes, settings.classes);

    if (settings.classes.hasOwnProperty('direction')) {
      options.classes.direction = Object.assign({}, defaults.classes.direction, settings.classes.direction);
    }

    if (settings.classes.hasOwnProperty('type')) {
      options.classes.type = Object.assign({}, defaults.classes.type, settings.classes.type);
    }

    if (settings.classes.hasOwnProperty('slide')) {
      options.classes.slide = Object.assign({}, defaults.classes.slide, settings.classes.slide);
    }

    if (settings.classes.hasOwnProperty('arrow')) {
      options.classes.arrow = Object.assign({}, defaults.classes.arrow, settings.classes.arrow);
    }

    if (settings.classes.hasOwnProperty('nav')) {
      options.classes.nav = Object.assign({}, defaults.classes.nav, settings.classes.nav);
    }
  }

  if (settings.hasOwnProperty('breakpoints')) {
    options.breakpoints = Object.assign({}, defaults.breakpoints, settings.breakpoints);
  }

  return options;
}

var EventsBus = /*#__PURE__*/function () {
  /**
   * Construct a EventBus instance.
   *
   * @param {Object} events
   */
  function EventsBus() {
    var events = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, EventsBus);

    this.events = events;
    this.hop = events.hasOwnProperty;
  }
  /**
   * Adds listener to the specifed event.
   *
   * @param {String|Array} event
   * @param {Function} handler
   */


  _createClass(EventsBus, [{
    key: "on",
    value: function on(event, handler) {
      if (isArray(event)) {
        for (var i = 0; i < event.length; i++) {
          this.on(event[i], handler);
        }

        return;
      } // Create the event's object if not yet created


      if (!this.hop.call(this.events, event)) {
        this.events[event] = [];
      } // Add the handler to queue


      var index = this.events[event].push(handler) - 1; // Provide handle back for removal of event

      return {
        remove: function remove() {
          delete this.events[event][index];
        }
      };
    }
    /**
     * Runs registered handlers for specified event.
     *
     * @param {String|Array} event
     * @param {Object=} context
     */

  }, {
    key: "emit",
    value: function emit(event, context) {
      if (isArray(event)) {
        for (var i = 0; i < event.length; i++) {
          this.emit(event[i], context);
        }

        return;
      } // If the event doesn't exist, or there's no handlers in queue, just leave


      if (!this.hop.call(this.events, event)) {
        return;
      } // Cycle through events queue, fire!


      this.events[event].forEach(function (item) {
        item(context || {});
      });
    }
  }]);

  return EventsBus;
}();

var Glide$1 = /*#__PURE__*/function () {
  /**
   * Construct glide.
   *
   * @param  {String} selector
   * @param  {Object} options
   */
  function Glide(selector) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Glide);

    this._c = {};
    this._t = [];
    this._e = new EventsBus();
    this.disabled = false;
    this.selector = selector;
    this.settings = mergeOptions(defaults, options);
    this.index = this.settings.startAt;
  }
  /**
   * Initializes glide.
   *
   * @param {Object} extensions Collection of extensions to initialize.
   * @return {Glide}
   */


  _createClass(Glide, [{
    key: "mount",
    value: function mount$1() {
      var extensions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this._e.emit('mount.before');

      if (isObject(extensions)) {
        this._c = mount(this, extensions, this._e);
      } else {
        warn('You need to provide a object on `mount()`');
      }

      this._e.emit('mount.after');

      return this;
    }
    /**
     * Collects an instance `translate` transformers.
     *
     * @param  {Array} transformers Collection of transformers.
     * @return {Void}
     */

  }, {
    key: "mutate",
    value: function mutate() {
      var transformers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (isArray(transformers)) {
        this._t = transformers;
      } else {
        warn('You need to provide a array on `mutate()`');
      }

      return this;
    }
    /**
     * Updates glide with specified settings.
     *
     * @param {Object} settings
     * @return {Glide}
     */

  }, {
    key: "update",
    value: function update() {
      var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.settings = mergeOptions(this.settings, settings);

      if (settings.hasOwnProperty('startAt')) {
        this.index = settings.startAt;
      }

      this._e.emit('update');

      return this;
    }
    /**
     * Change slide with specified pattern. A pattern must be in the special format:
     * `>` - Move one forward
     * `<` - Move one backward
     * `={i}` - Go to {i} zero-based slide (eq. '=1', will go to second slide)
     * `>>` - Rewinds to end (last slide)
     * `<<` - Rewinds to start (first slide)
     * `|>` - Move one viewport forward
     * `|<` - Move one viewport backward
     *
     * @param {String} pattern
     * @return {Glide}
     */

  }, {
    key: "go",
    value: function go(pattern) {
      this._c.Run.make(pattern);

      return this;
    }
    /**
     * Move track by specified distance.
     *
     * @param {String} distance
     * @return {Glide}
     */

  }, {
    key: "move",
    value: function move(distance) {
      this._c.Transition.disable();

      this._c.Move.make(distance);

      return this;
    }
    /**
     * Destroy instance and revert all changes done by this._c.
     *
     * @return {Glide}
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this._e.emit('destroy');

      return this;
    }
    /**
     * Start instance autoplaying.
     *
     * @param {Boolean|Number} interval Run autoplaying with passed interval regardless of `autoplay` settings
     * @return {Glide}
     */

  }, {
    key: "play",
    value: function play() {
      var interval = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (interval) {
        this.settings.autoplay = interval;
      }

      this._e.emit('play');

      return this;
    }
    /**
     * Stop instance autoplaying.
     *
     * @return {Glide}
     */

  }, {
    key: "pause",
    value: function pause() {
      this._e.emit('pause');

      return this;
    }
    /**
     * Sets glide into a idle status.
     *
     * @return {Glide}
     */

  }, {
    key: "disable",
    value: function disable() {
      this.disabled = true;
      return this;
    }
    /**
     * Sets glide into a active status.
     *
     * @return {Glide}
     */

  }, {
    key: "enable",
    value: function enable() {
      this.disabled = false;
      return this;
    }
    /**
     * Adds cuutom event listener with handler.
     *
     * @param  {String|Array} event
     * @param  {Function} handler
     * @return {Glide}
     */

  }, {
    key: "on",
    value: function on(event, handler) {
      this._e.on(event, handler);

      return this;
    }
    /**
     * Checks if glide is a precised type.
     *
     * @param  {String} name
     * @return {Boolean}
     */

  }, {
    key: "isType",
    value: function isType(name) {
      return this.settings.type === name;
    }
    /**
     * Gets value of the core options.
     *
     * @return {Object}
     */

  }, {
    key: "settings",
    get: function get() {
      return this._o;
    }
    /**
     * Sets value of the core options.
     *
     * @param  {Object} o
     * @return {Void}
     */
    ,
    set: function set(o) {
      if (isObject(o)) {
        this._o = o;
      } else {
        warn('Options must be an `object` instance.');
      }
    }
    /**
     * Gets current index of the slider.
     *
     * @return {Object}
     */

  }, {
    key: "index",
    get: function get() {
      return this._i;
    }
    /**
     * Sets current index a slider.
     *
     * @return {Object}
     */
    ,
    set: function set(i) {
      this._i = toInt(i);
    }
    /**
     * Gets type name of the slider.
     *
     * @return {String}
     */

  }, {
    key: "type",
    get: function get() {
      return this.settings.type;
    }
    /**
     * Gets value of the idle status.
     *
     * @return {Boolean}
     */

  }, {
    key: "disabled",
    get: function get() {
      return this._d;
    }
    /**
     * Sets value of the idle status.
     *
     * @return {Boolean}
     */
    ,
    set: function set(status) {
      this._d = !!status;
    }
  }]);

  return Glide;
}();

function Run (Glide, Components, Events) {
  var Run = {
    /**
     * Initializes autorunning of the glide.
     *
     * @return {Void}
     */
    mount: function mount() {
      this._o = false;
    },

    /**
     * Makes glides running based on the passed moving schema.
     *
     * @param {String} move
     */
    make: function make(move) {
      var _this = this;

      if (!Glide.disabled) {
        !Glide.settings.waitForTransition || Glide.disable();
        this.move = move;
        Events.emit('run.before', this.move);
        this.calculate();
        Events.emit('run', this.move);
        Components.Transition.after(function () {
          if (_this.isStart()) {
            Events.emit('run.start', _this.move);
          }

          if (_this.isEnd()) {
            Events.emit('run.end', _this.move);
          }

          if (_this.isOffset()) {
            _this._o = false;
            Events.emit('run.offset', _this.move);
          }

          Events.emit('run.after', _this.move);
          Glide.enable();
        });
      }
    },

    /**
     * Calculates current index based on defined move.
     *
     * @return {Number|Undefined}
     */
    calculate: function calculate() {
      var move = this.move,
          length = this.length;
      var steps = move.steps,
          direction = move.direction; // By default assume that size of view is equal to one slide

      var viewSize = 1; // While direction is `=` we want jump to
      // a specified index described in steps.

      if (direction === '=') {
        // Check if bound is true, 
        // as we want to avoid whitespaces.
        if (Glide.settings.bound && toInt(steps) > length) {
          Glide.index = length;
          return;
        }

        Glide.index = steps;
        return;
      } // When pattern is equal to `>>` we want
      // fast forward to the last slide.


      if (direction === '>' && steps === '>') {
        Glide.index = length;
        return;
      } // When pattern is equal to `<<` we want
      // fast forward to the first slide.


      if (direction === '<' && steps === '<') {
        Glide.index = 0;
        return;
      } // pagination movement


      if (direction === '|') {
        viewSize = Glide.settings.perView || 1;
      } // we are moving forward


      if (direction === '>' || direction === '|' && steps === '>') {
        var index = calculateForwardIndex(viewSize);

        if (index > length) {
          this._o = true;
        }

        Glide.index = normalizeForwardIndex(index, viewSize);
        return;
      } // we are moving backward


      if (direction === '<' || direction === '|' && steps === '<') {
        var _index = calculateBackwardIndex(viewSize);

        if (_index < 0) {
          this._o = true;
        }

        Glide.index = normalizeBackwardIndex(_index, viewSize);
        return;
      }

      warn("Invalid direction pattern [".concat(direction).concat(steps, "] has been used"));
    },

    /**
     * Checks if we are on the first slide.
     *
     * @return {Boolean}
     */
    isStart: function isStart() {
      return Glide.index <= 0;
    },

    /**
     * Checks if we are on the last slide.
     *
     * @return {Boolean}
     */
    isEnd: function isEnd() {
      return Glide.index >= this.length;
    },

    /**
     * Checks if we are making a offset run.
     *
     * @param {String} direction
     * @return {Boolean}
     */
    isOffset: function isOffset() {
      var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      if (!direction) {
        return this._o;
      }

      if (!this._o) {
        return false;
      } // did we view to the right?


      if (direction === '|>') {
        return this.move.direction === '|' && this.move.steps === '>';
      } // did we view to the left?


      if (direction === '|<') {
        return this.move.direction === '|' && this.move.steps === '<';
      }

      return this.move.direction === direction;
    },

    /**
     * Checks if bound mode is active
     *
     * @return {Boolean}
     */
    isBound: function isBound() {
      return Glide.isType('slider') && Glide.settings.focusAt !== 'center' && Glide.settings.bound;
    }
  };
  /**
   * Returns index value to move forward/to the right
   *
   * @param viewSize
   * @returns {Number}
   */

  function calculateForwardIndex(viewSize) {
    var index = Glide.index;

    if (Glide.isType('carousel')) {
      return index + viewSize;
    }

    return index + (viewSize - index % viewSize);
  }
  /**
   * Normalizes the given forward index based on glide settings, preventing it to exceed certain boundaries
   *
   * @param index
   * @param length
   * @param viewSize
   * @returns {Number}
   */


  function normalizeForwardIndex(index, viewSize) {
    var length = Run.length;

    if (index <= length) {
      return index;
    }

    if (Glide.isType('carousel')) {
      return index - (length + 1);
    }

    if (Glide.settings.rewind) {
      // bound does funny things with the length, therefor we have to be certain
      // that we are on the last possible index value given by bound
      if (Run.isBound() && !Run.isEnd()) {
        return length;
      }

      return 0;
    }

    if (Run.isBound()) {
      return length;
    }

    return Math.floor(length / viewSize) * viewSize;
  }
  /**
   * Calculates index value to move backward/to the left
   *
   * @param viewSize
   * @returns {Number}
   */


  function calculateBackwardIndex(viewSize) {
    var index = Glide.index;

    if (Glide.isType('carousel')) {
      return index - viewSize;
    } // ensure our back navigation results in the same index as a forward navigation
    // to experience a homogeneous paging


    var view = Math.ceil(index / viewSize);
    return (view - 1) * viewSize;
  }
  /**
   * Normalizes the given backward index based on glide settings, preventing it to exceed certain boundaries
   *
   * @param index
   * @param length
   * @param viewSize
   * @returns {*}
   */


  function normalizeBackwardIndex(index, viewSize) {
    var length = Run.length;

    if (index >= 0) {
      return index;
    }

    if (Glide.isType('carousel')) {
      return index + (length + 1);
    }

    if (Glide.settings.rewind) {
      // bound does funny things with the length, therefor we have to be certain
      // that we are on first possible index value before we to rewind to the length given by bound
      if (Run.isBound() && Run.isStart()) {
        return length;
      }

      return Math.floor(length / viewSize) * viewSize;
    }

    return 0;
  }

  define(Run, 'move', {
    /**
     * Gets value of the move schema.
     *
     * @returns {Object}
     */
    get: function get() {
      return this._m;
    },

    /**
     * Sets value of the move schema.
     *
     * @returns {Object}
     */
    set: function set(value) {
      var step = value.substr(1);
      this._m = {
        direction: value.substr(0, 1),
        steps: step ? toInt(step) ? toInt(step) : step : 0
      };
    }
  });
  define(Run, 'length', {
    /**
     * Gets value of the running distance based
     * on zero-indexing number of slides.
     *
     * @return {Number}
     */
    get: function get() {
      var settings = Glide.settings;
      var length = Components.Html.slides.length; // If the `bound` option is active, a maximum running distance should be
      // reduced by `perView` and `focusAt` settings. Running distance
      // should end before creating an empty space after instance.

      if (this.isBound()) {
        return length - 1 - (toInt(settings.perView) - 1) + toInt(settings.focusAt);
      }

      return length - 1;
    }
  });
  define(Run, 'offset', {
    /**
     * Gets status of the offsetting flag.
     *
     * @return {Boolean}
     */
    get: function get() {
      return this._o;
    }
  });
  return Run;
}

/**
 * Returns a current time.
 *
 * @return {Number}
 */
function now() {
  return new Date().getTime();
}

/**
 * Returns a function, that, when invoked, will only be triggered
 * at most once during a given window of time.
 *
 * @param {Function} func
 * @param {Number} wait
 * @param {Object=} options
 * @return {Function}
 *
 * @see https://github.com/jashkenas/underscore
 */

function throttle(func, wait, options) {
  var timeout, context, args, result;
  var previous = 0;
  if (!options) options = {};

  var later = function later() {
    previous = options.leading === false ? 0 : now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  var throttled = function throttled() {
    var at = now();
    if (!previous && options.leading === false) previous = at;
    var remaining = wait - (at - previous);
    context = this;
    args = arguments;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = at;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }

    return result;
  };

  throttled.cancel = function () {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
}

var MARGIN_TYPE = {
  ltr: ['marginLeft', 'marginRight'],
  rtl: ['marginRight', 'marginLeft']
};
function Gaps (Glide, Components, Events) {
  var Gaps = {
    /**
     * Applies gaps between slides. First and last
     * slides do not receive it's edge margins.
     *
     * @param {HTMLCollection} slides
     * @return {Void}
     */
    apply: function apply(slides) {
      for (var i = 0, len = slides.length; i < len; i++) {
        var style = slides[i].style;
        var direction = Components.Direction.value;

        if (i !== 0) {
          style[MARGIN_TYPE[direction][0]] = "".concat(this.value / 2, "px");
        } else {
          style[MARGIN_TYPE[direction][0]] = '';
        }

        if (i !== slides.length - 1) {
          style[MARGIN_TYPE[direction][1]] = "".concat(this.value / 2, "px");
        } else {
          style[MARGIN_TYPE[direction][1]] = '';
        }
      }
    },

    /**
     * Removes gaps from the slides.
     *
     * @param {HTMLCollection} slides
     * @returns {Void}
    */
    remove: function remove(slides) {
      for (var i = 0, len = slides.length; i < len; i++) {
        var style = slides[i].style;
        style.marginLeft = '';
        style.marginRight = '';
      }
    }
  };
  define(Gaps, 'value', {
    /**
     * Gets value of the gap.
     *
     * @returns {Number}
     */
    get: function get() {
      return toInt(Glide.settings.gap);
    }
  });
  define(Gaps, 'grow', {
    /**
     * Gets additional dimensions value caused by gaps.
     * Used to increase width of the slides wrapper.
     *
     * @returns {Number}
     */
    get: function get() {
      return Gaps.value * Components.Sizes.length;
    }
  });
  define(Gaps, 'reductor', {
    /**
     * Gets reduction value caused by gaps.
     * Used to subtract width of the slides.
     *
     * @returns {Number}
     */
    get: function get() {
      var perView = Glide.settings.perView;
      return Gaps.value * (perView - 1) / perView;
    }
  });
  /**
   * Apply calculated gaps:
   * - after building, so slides (including clones) will receive proper margins
   * - on updating via API, to recalculate gaps with new options
   */

  Events.on(['build.after', 'update'], throttle(function () {
    Gaps.apply(Components.Html.wrapper.children);
  }, 30));
  /**
   * Remove gaps:
   * - on destroying to bring markup to its inital state
   */

  Events.on('destroy', function () {
    Gaps.remove(Components.Html.wrapper.children);
  });
  return Gaps;
}

/**
 * Finds siblings nodes of the passed node.
 *
 * @param  {Element} node
 * @return {Array}
 */
function siblings(node) {
  if (node && node.parentNode) {
    var n = node.parentNode.firstChild;
    var matched = [];

    for (; n; n = n.nextSibling) {
      if (n.nodeType === 1 && n !== node) {
        matched.push(n);
      }
    }

    return matched;
  }

  return [];
}
/**
 * Checks if passed node exist and is a valid element.
 *
 * @param  {Element} node
 * @return {Boolean}
 */

function exist(node) {
  if (node && node instanceof window.HTMLElement) {
    return true;
  }

  return false;
}

var TRACK_SELECTOR = '[data-glide-el="track"]';
function Html (Glide, Components, Events) {
  var Html = {
    /**
     * Setup slider HTML nodes.
     *
     * @param {Glide} glide
     */
    mount: function mount() {
      this.root = Glide.selector;
      this.track = this.root.querySelector(TRACK_SELECTOR);
      this.collectSlides();
    },

    /**
     * Collect slides
     */
    collectSlides: function collectSlides() {
      this.slides = Array.prototype.slice.call(this.wrapper.children).filter(function (slide) {
        return !slide.classList.contains(Glide.settings.classes.slide.clone);
      });
    }
  };
  define(Html, 'root', {
    /**
     * Gets node of the glide main element.
     *
     * @return {Object}
     */
    get: function get() {
      return Html._r;
    },

    /**
     * Sets node of the glide main element.
     *
     * @return {Object}
     */
    set: function set(r) {
      if (isString(r)) {
        r = document.querySelector(r);
      }

      if (exist(r)) {
        Html._r = r;
      } else {
        warn('Root element must be a existing Html node');
      }
    }
  });
  define(Html, 'track', {
    /**
     * Gets node of the glide track with slides.
     *
     * @return {Object}
     */
    get: function get() {
      return Html._t;
    },

    /**
     * Sets node of the glide track with slides.
     *
     * @return {Object}
     */
    set: function set(t) {
      if (exist(t)) {
        Html._t = t;
      } else {
        warn("Could not find track element. Please use ".concat(TRACK_SELECTOR, " attribute."));
      }
    }
  });
  define(Html, 'wrapper', {
    /**
     * Gets node of the slides wrapper.
     *
     * @return {Object}
     */
    get: function get() {
      return Html.track.children[0];
    }
  });
  /**
   * Add/remove/reorder dynamic slides
   */

  Events.on('update', function () {
    Html.collectSlides();
  });
  return Html;
}

function Peek (Glide, Components, Events) {
  var Peek = {
    /**
     * Setups how much to peek based on settings.
     *
     * @return {Void}
     */
    mount: function mount() {
      this.value = Glide.settings.peek;
    }
  };
  define(Peek, 'value', {
    /**
     * Gets value of the peek.
     *
     * @returns {Number|Object}
     */
    get: function get() {
      return Peek._v;
    },

    /**
     * Sets value of the peek.
     *
     * @param {Number|Object} value
     * @return {Void}
     */
    set: function set(value) {
      if (isObject(value)) {
        value.before = toInt(value.before);
        value.after = toInt(value.after);
      } else {
        value = toInt(value);
      }

      Peek._v = value;
    }
  });
  define(Peek, 'reductor', {
    /**
     * Gets reduction value caused by peek.
     *
     * @returns {Number}
     */
    get: function get() {
      var value = Peek.value;
      var perView = Glide.settings.perView;

      if (isObject(value)) {
        return value.before / perView + value.after / perView;
      }

      return value * 2 / perView;
    }
  });
  /**
   * Recalculate peeking sizes on:
   * - when resizing window to update to proper percents
   */

  Events.on(['resize', 'update'], function () {
    Peek.mount();
  });
  return Peek;
}

function Move (Glide, Components, Events) {
  var Move = {
    /**
     * Constructs move component.
     *
     * @returns {Void}
     */
    mount: function mount() {
      this._o = 0;
    },

    /**
     * Calculates a movement value based on passed offset and currently active index.
     *
     * @param  {Number} offset
     * @return {Void}
     */
    make: function make() {
      var _this = this;

      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      this.offset = offset;
      Events.emit('move', {
        movement: this.value
      });
      Components.Transition.after(function () {
        Events.emit('move.after', {
          movement: _this.value
        });
      });
    }
  };
  define(Move, 'offset', {
    /**
     * Gets an offset value used to modify current translate.
     *
     * @return {Object}
     */
    get: function get() {
      return Move._o;
    },

    /**
     * Sets an offset value used to modify current translate.
     *
     * @return {Object}
     */
    set: function set(value) {
      Move._o = !isUndefined(value) ? toInt(value) : 0;
    }
  });
  define(Move, 'translate', {
    /**
     * Gets a raw movement value.
     *
     * @return {Number}
     */
    get: function get() {
      return Components.Sizes.slideWidth * Glide.index;
    }
  });
  define(Move, 'value', {
    /**
     * Gets an actual movement value corrected by offset.
     *
     * @return {Number}
     */
    get: function get() {
      var offset = this.offset;
      var translate = this.translate;

      if (Components.Direction.is('rtl')) {
        return translate + offset;
      }

      return translate - offset;
    }
  });
  /**
   * Make movement to proper slide on:
   * - before build, so glide will start at `startAt` index
   * - on each standard run to move to newly calculated index
   */

  Events.on(['build.before', 'run'], function () {
    Move.make();
  });
  return Move;
}

function Sizes (Glide, Components, Events) {
  var Sizes = {
    /**
     * Setups dimensions of slides.
     *
     * @return {Void}
     */
    setupSlides: function setupSlides() {
      var width = "".concat(this.slideWidth, "px");
      var slides = Components.Html.slides;

      for (var i = 0; i < slides.length; i++) {
        slides[i].style.width = width;
      }
    },

    /**
     * Setups dimensions of slides wrapper.
     *
     * @return {Void}
     */
    setupWrapper: function setupWrapper() {
      Components.Html.wrapper.style.width = "".concat(this.wrapperSize, "px");
    },

    /**
     * Removes applied styles from HTML elements.
     *
     * @returns {Void}
     */
    remove: function remove() {
      var slides = Components.Html.slides;

      for (var i = 0; i < slides.length; i++) {
        slides[i].style.width = '';
      }

      Components.Html.wrapper.style.width = '';
    }
  };
  define(Sizes, 'length', {
    /**
     * Gets count number of the slides.
     *
     * @return {Number}
     */
    get: function get() {
      return Components.Html.slides.length;
    }
  });
  define(Sizes, 'width', {
    /**
     * Gets width value of the slider (visible area).
     *
     * @return {Number}
     */
    get: function get() {
      return Components.Html.track.offsetWidth;
    }
  });
  define(Sizes, 'wrapperSize', {
    /**
     * Gets size of the slides wrapper.
     *
     * @return {Number}
     */
    get: function get() {
      return Sizes.slideWidth * Sizes.length + Components.Gaps.grow + Components.Clones.grow;
    }
  });
  define(Sizes, 'slideWidth', {
    /**
     * Gets width value of a single slide.
     *
     * @return {Number}
     */
    get: function get() {
      return Sizes.width / Glide.settings.perView - Components.Peek.reductor - Components.Gaps.reductor;
    }
  });
  /**
   * Apply calculated glide's dimensions:
   * - before building, so other dimensions (e.g. translate) will be calculated propertly
   * - when resizing window to recalculate sildes dimensions
   * - on updating via API, to calculate dimensions based on new options
   */

  Events.on(['build.before', 'resize', 'update'], function () {
    Sizes.setupSlides();
    Sizes.setupWrapper();
  });
  /**
   * Remove calculated glide's dimensions:
   * - on destoting to bring markup to its inital state
   */

  Events.on('destroy', function () {
    Sizes.remove();
  });
  return Sizes;
}

function Build (Glide, Components, Events) {
  var Build = {
    /**
     * Init glide building. Adds classes, sets
     * dimensions and setups initial state.
     *
     * @return {Void}
     */
    mount: function mount() {
      Events.emit('build.before');
      this.typeClass();
      this.activeClass();
      Events.emit('build.after');
    },

    /**
     * Adds `type` class to the glide element.
     *
     * @return {Void}
     */
    typeClass: function typeClass() {
      Components.Html.root.classList.add(Glide.settings.classes.type[Glide.settings.type]);
    },

    /**
     * Sets active class to current slide.
     *
     * @return {Void}
     */
    activeClass: function activeClass() {
      var classes = Glide.settings.classes;
      var slide = Components.Html.slides[Glide.index];

      if (slide) {
        slide.classList.add(classes.slide.active);
        siblings(slide).forEach(function (sibling) {
          sibling.classList.remove(classes.slide.active);
        });
      }
    },

    /**
     * Removes HTML classes applied at building.
     *
     * @return {Void}
     */
    removeClasses: function removeClasses() {
      var _Glide$settings$class = Glide.settings.classes,
          type = _Glide$settings$class.type,
          slide = _Glide$settings$class.slide;
      Components.Html.root.classList.remove(type[Glide.settings.type]);
      Components.Html.slides.forEach(function (sibling) {
        sibling.classList.remove(slide.active);
      });
    }
  };
  /**
   * Clear building classes:
   * - on destroying to bring HTML to its initial state
   * - on updating to remove classes before remounting component
   */

  Events.on(['destroy', 'update'], function () {
    Build.removeClasses();
  });
  /**
   * Remount component:
   * - on resizing of the window to calculate new dimensions
   * - on updating settings via API
   */

  Events.on(['resize', 'update'], function () {
    Build.mount();
  });
  /**
   * Swap active class of current slide:
   * - after each move to the new index
   */

  Events.on('move.after', function () {
    Build.activeClass();
  });
  return Build;
}

function Clones (Glide, Components, Events) {
  var Clones = {
    /**
     * Create pattern map and collect slides to be cloned.
     */
    mount: function mount() {
      this.items = [];

      if (Glide.isType('carousel')) {
        this.items = this.collect();
      }
    },

    /**
     * Collect clones with pattern.
     *
     * @return {[]}
     */
    collect: function collect() {
      var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var slides = Components.Html.slides;
      var _Glide$settings = Glide.settings,
          perView = _Glide$settings.perView,
          classes = _Glide$settings.classes,
          cloningRatio = _Glide$settings.cloningRatio;

      if (slides.length !== 0) {
        var peekIncrementer = +!!Glide.settings.peek;
        var cloneCount = perView + peekIncrementer + Math.round(perView / 2);
        var append = slides.slice(0, cloneCount).reverse();
        var prepend = slides.slice(cloneCount * -1);

        for (var r = 0; r < Math.max(cloningRatio, Math.floor(perView / slides.length)); r++) {
          for (var i = 0; i < append.length; i++) {
            var clone = append[i].cloneNode(true);
            clone.classList.add(classes.slide.clone);
            items.push(clone);
          }

          for (var _i = 0; _i < prepend.length; _i++) {
            var _clone = prepend[_i].cloneNode(true);

            _clone.classList.add(classes.slide.clone);

            items.unshift(_clone);
          }
        }
      }

      return items;
    },

    /**
     * Append cloned slides with generated pattern.
     *
     * @return {Void}
     */
    append: function append() {
      var items = this.items;
      var _Components$Html = Components.Html,
          wrapper = _Components$Html.wrapper,
          slides = _Components$Html.slides;
      var half = Math.floor(items.length / 2);
      var prepend = items.slice(0, half).reverse();
      var append = items.slice(half * -1).reverse();
      var width = "".concat(Components.Sizes.slideWidth, "px");

      for (var i = 0; i < append.length; i++) {
        wrapper.appendChild(append[i]);
      }

      for (var _i2 = 0; _i2 < prepend.length; _i2++) {
        wrapper.insertBefore(prepend[_i2], slides[0]);
      }

      for (var _i3 = 0; _i3 < items.length; _i3++) {
        items[_i3].style.width = width;
      }
    },

    /**
     * Remove all cloned slides.
     *
     * @return {Void}
     */
    remove: function remove() {
      var items = this.items;

      for (var i = 0; i < items.length; i++) {
        Components.Html.wrapper.removeChild(items[i]);
      }
    }
  };
  define(Clones, 'grow', {
    /**
     * Gets additional dimensions value caused by clones.
     *
     * @return {Number}
     */
    get: function get() {
      return (Components.Sizes.slideWidth + Components.Gaps.value) * Clones.items.length;
    }
  });
  /**
   * Append additional slide's clones:
   * - while glide's type is `carousel`
   */

  Events.on('update', function () {
    Clones.remove();
    Clones.mount();
    Clones.append();
  });
  /**
   * Append additional slide's clones:
   * - while glide's type is `carousel`
   */

  Events.on('build.before', function () {
    if (Glide.isType('carousel')) {
      Clones.append();
    }
  });
  /**
   * Remove clones HTMLElements:
   * - on destroying, to bring HTML to its initial state
   */

  Events.on('destroy', function () {
    Clones.remove();
  });
  return Clones;
}

var EventsBinder = /*#__PURE__*/function () {
  /**
   * Construct a EventsBinder instance.
   */
  function EventsBinder() {
    var listeners = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, EventsBinder);

    this.listeners = listeners;
  }
  /**
   * Adds events listeners to arrows HTML elements.
   *
   * @param  {String|Array} events
   * @param  {Element|Window|Document} el
   * @param  {Function} closure
   * @param  {Boolean|Object} capture
   * @return {Void}
   */


  _createClass(EventsBinder, [{
    key: "on",
    value: function on(events, el, closure) {
      var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (isString(events)) {
        events = [events];
      }

      for (var i = 0; i < events.length; i++) {
        this.listeners[events[i]] = closure;
        el.addEventListener(events[i], this.listeners[events[i]], capture);
      }
    }
    /**
     * Removes event listeners from arrows HTML elements.
     *
     * @param  {String|Array} events
     * @param  {Element|Window|Document} el
     * @param  {Boolean|Object} capture
     * @return {Void}
     */

  }, {
    key: "off",
    value: function off(events, el) {
      var capture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (isString(events)) {
        events = [events];
      }

      for (var i = 0; i < events.length; i++) {
        el.removeEventListener(events[i], this.listeners[events[i]], capture);
      }
    }
    /**
     * Destroy collected listeners.
     *
     * @returns {Void}
     */

  }, {
    key: "destroy",
    value: function destroy() {
      delete this.listeners;
    }
  }]);

  return EventsBinder;
}();

function Resize (Glide, Components, Events) {
  /**
   * Instance of the binder for DOM Events.
   *
   * @type {EventsBinder}
   */
  var Binder = new EventsBinder();
  var Resize = {
    /**
     * Initializes window bindings.
     */
    mount: function mount() {
      this.bind();
    },

    /**
     * Binds `rezsize` listener to the window.
     * It's a costly event, so we are debouncing it.
     *
     * @return {Void}
     */
    bind: function bind() {
      Binder.on('resize', window, throttle(function () {
        Events.emit('resize');
      }, Glide.settings.throttle));
    },

    /**
     * Unbinds listeners from the window.
     *
     * @return {Void}
     */
    unbind: function unbind() {
      Binder.off('resize', window);
    }
  };
  /**
   * Remove bindings from window:
   * - on destroying, to remove added EventListener
   */

  Events.on('destroy', function () {
    Resize.unbind();
    Binder.destroy();
  });
  return Resize;
}

var VALID_DIRECTIONS = ['ltr', 'rtl'];
var FLIPED_MOVEMENTS = {
  '>': '<',
  '<': '>',
  '=': '='
};
function Direction (Glide, Components, Events) {
  var Direction = {
    /**
     * Setups gap value based on settings.
     *
     * @return {Void}
     */
    mount: function mount() {
      this.value = Glide.settings.direction;
    },

    /**
     * Resolves pattern based on direction value
     *
     * @param {String} pattern
     * @returns {String}
     */
    resolve: function resolve(pattern) {
      var token = pattern.slice(0, 1);

      if (this.is('rtl')) {
        return pattern.split(token).join(FLIPED_MOVEMENTS[token]);
      }

      return pattern;
    },

    /**
     * Checks value of direction mode.
     *
     * @param {String} direction
     * @returns {Boolean}
     */
    is: function is(direction) {
      return this.value === direction;
    },

    /**
     * Applies direction class to the root HTML element.
     *
     * @return {Void}
     */
    addClass: function addClass() {
      Components.Html.root.classList.add(Glide.settings.classes.direction[this.value]);
    },

    /**
     * Removes direction class from the root HTML element.
     *
     * @return {Void}
     */
    removeClass: function removeClass() {
      Components.Html.root.classList.remove(Glide.settings.classes.direction[this.value]);
    }
  };
  define(Direction, 'value', {
    /**
     * Gets value of the direction.
     *
     * @returns {Number}
     */
    get: function get() {
      return Direction._v;
    },

    /**
     * Sets value of the direction.
     *
     * @param {String} value
     * @return {Void}
     */
    set: function set(value) {
      if (VALID_DIRECTIONS.indexOf(value) > -1) {
        Direction._v = value;
      } else {
        warn('Direction value must be `ltr` or `rtl`');
      }
    }
  });
  /**
   * Clear direction class:
   * - on destroy to bring HTML to its initial state
   * - on update to remove class before reappling bellow
   */

  Events.on(['destroy', 'update'], function () {
    Direction.removeClass();
  });
  /**
   * Remount component:
   * - on update to reflect changes in direction value
   */

  Events.on('update', function () {
    Direction.mount();
  });
  /**
   * Apply direction class:
   * - before building to apply class for the first time
   * - on updating to reapply direction class that may changed
   */

  Events.on(['build.before', 'update'], function () {
    Direction.addClass();
  });
  return Direction;
}

/**
 * Reflects value of glide movement.
 *
 * @param  {Object} Glide
 * @param  {Object} Components
 * @return {Object}
 */
function Rtl (Glide, Components) {
  return {
    /**
     * Negates the passed translate if glide is in RTL option.
     *
     * @param  {Number} translate
     * @return {Number}
     */
    modify: function modify(translate) {
      if (Components.Direction.is('rtl')) {
        return -translate;
      }

      return translate;
    }
  };
}

/**
 * Updates glide movement with a `gap` settings.
 *
 * @param  {Object} Glide
 * @param  {Object} Components
 * @return {Object}
 */
function Gap (Glide, Components) {
  return {
    /**
     * Modifies passed translate value with number in the `gap` settings.
     *
     * @param  {Number} translate
     * @return {Number}
     */
    modify: function modify(translate) {
      var multiplier = Math.floor(translate / Components.Sizes.slideWidth);
      return translate + Components.Gaps.value * multiplier;
    }
  };
}

/**
 * Updates glide movement with width of additional clones width.
 *
 * @param  {Object} Glide
 * @param  {Object} Components
 * @return {Object}
 */
function Grow (Glide, Components) {
  return {
    /**
     * Adds to the passed translate width of the half of clones.
     *
     * @param  {Number} translate
     * @return {Number}
     */
    modify: function modify(translate) {
      return translate + Components.Clones.grow / 2;
    }
  };
}

/**
 * Updates glide movement with a `peek` settings.
 *
 * @param  {Object} Glide
 * @param  {Object} Components
 * @return {Object}
 */

function Peeking (Glide, Components) {
  return {
    /**
     * Modifies passed translate value with a `peek` setting.
     *
     * @param  {Number} translate
     * @return {Number}
     */
    modify: function modify(translate) {
      if (Glide.settings.focusAt >= 0) {
        var peek = Components.Peek.value;

        if (isObject(peek)) {
          return translate - peek.before;
        }

        return translate - peek;
      }

      return translate;
    }
  };
}

/**
 * Updates glide movement with a `focusAt` settings.
 *
 * @param  {Object} Glide
 * @param  {Object} Components
 * @return {Object}
 */
function Focusing (Glide, Components) {
  return {
    /**
     * Modifies passed translate value with index in the `focusAt` setting.
     *
     * @param  {Number} translate
     * @return {Number}
     */
    modify: function modify(translate) {
      var gap = Components.Gaps.value;
      var width = Components.Sizes.width;
      var focusAt = Glide.settings.focusAt;
      var slideWidth = Components.Sizes.slideWidth;

      if (focusAt === 'center') {
        return translate - (width / 2 - slideWidth / 2);
      }

      return translate - slideWidth * focusAt - gap * focusAt;
    }
  };
}

/**
 * Applies diffrent transformers on translate value.
 *
 * @param  {Object} Glide
 * @param  {Object} Components
 * @return {Object}
 */

function mutator (Glide, Components, Events) {
  /**
   * Merge instance transformers with collection of default transformers.
   * It's important that the Rtl component be last on the list,
   * so it reflects all previous transformations.
   *
   * @type {Array}
   */
  var TRANSFORMERS = [Gap, Grow, Peeking, Focusing].concat(Glide._t, [Rtl]);
  return {
    /**
     * Piplines translate value with registered transformers.
     *
     * @param  {Number} translate
     * @return {Number}
     */
    mutate: function mutate(translate) {
      for (var i = 0; i < TRANSFORMERS.length; i++) {
        var transformer = TRANSFORMERS[i];

        if (isFunction(transformer) && isFunction(transformer().modify)) {
          translate = transformer(Glide, Components, Events).modify(translate);
        } else {
          warn('Transformer should be a function that returns an object with `modify()` method');
        }
      }

      return translate;
    }
  };
}

function Translate (Glide, Components, Events) {
  var Translate = {
    /**
     * Sets value of translate on HTML element.
     *
     * @param {Number} value
     * @return {Void}
     */
    set: function set(value) {
      var transform = mutator(Glide, Components).mutate(value);
      var translate3d = "translate3d(".concat(-1 * transform, "px, 0px, 0px)");
      Components.Html.wrapper.style.mozTransform = translate3d; // needed for supported Firefox 10-15

      Components.Html.wrapper.style.webkitTransform = translate3d; // needed for supported Chrome 10-35, Safari 5.1-8, and Opera 15-22

      Components.Html.wrapper.style.transform = translate3d;
    },

    /**
     * Removes value of translate from HTML element.
     *
     * @return {Void}
     */
    remove: function remove() {
      Components.Html.wrapper.style.transform = '';
    },

    /**
     * @return {number}
     */
    getStartIndex: function getStartIndex() {
      var length = Components.Sizes.length;
      var index = Glide.index;
      var perView = Glide.settings.perView;

      if (Components.Run.isOffset('>') || Components.Run.isOffset('|>')) {
        return length + (index - perView);
      } // "modulo length" converts an index that equals length to zero


      return (index + perView) % length;
    },

    /**
     * @return {number}
     */
    getTravelDistance: function getTravelDistance() {
      var travelDistance = Components.Sizes.slideWidth * Glide.settings.perView;

      if (Components.Run.isOffset('>') || Components.Run.isOffset('|>')) {
        // reverse travel distance so that we don't have to change subtract operations
        return travelDistance * -1;
      }

      return travelDistance;
    }
  };
  /**
   * Set new translate value:
   * - on move to reflect index change
   * - on updating via API to reflect possible changes in options
   */

  Events.on('move', function (context) {
    if (!Glide.isType('carousel') || !Components.Run.isOffset()) {
      return Translate.set(context.movement);
    }

    Components.Transition.after(function () {
      Events.emit('translate.jump');
      Translate.set(Components.Sizes.slideWidth * Glide.index);
    });
    var startWidth = Components.Sizes.slideWidth * Components.Translate.getStartIndex();
    return Translate.set(startWidth - Components.Translate.getTravelDistance());
  });
  /**
   * Remove translate:
   * - on destroying to bring markup to its inital state
   */

  Events.on('destroy', function () {
    Translate.remove();
  });
  return Translate;
}

function Transition (Glide, Components, Events) {
  /**
   * Holds inactivity status of transition.
   * When true transition is not applied.
   *
   * @type {Boolean}
   */
  var disabled = false;
  var Transition = {
    /**
     * Composes string of the CSS transition.
     *
     * @param {String} property
     * @return {String}
     */
    compose: function compose(property) {
      var settings = Glide.settings;

      if (!disabled) {
        return "".concat(property, " ").concat(this.duration, "ms ").concat(settings.animationTimingFunc);
      }

      return "".concat(property, " 0ms ").concat(settings.animationTimingFunc);
    },

    /**
     * Sets value of transition on HTML element.
     *
     * @param {String=} property
     * @return {Void}
     */
    set: function set() {
      var property = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'transform';
      Components.Html.wrapper.style.transition = this.compose(property);
    },

    /**
     * Removes value of transition from HTML element.
     *
     * @return {Void}
     */
    remove: function remove() {
      Components.Html.wrapper.style.transition = '';
    },

    /**
     * Runs callback after animation.
     *
     * @param  {Function} callback
     * @return {Void}
     */
    after: function after(callback) {
      setTimeout(function () {
        callback();
      }, this.duration);
    },

    /**
     * Enable transition.
     *
     * @return {Void}
     */
    enable: function enable() {
      disabled = false;
      this.set();
    },

    /**
     * Disable transition.
     *
     * @return {Void}
     */
    disable: function disable() {
      disabled = true;
      this.set();
    }
  };
  define(Transition, 'duration', {
    /**
     * Gets duration of the transition based
     * on currently running animation type.
     *
     * @return {Number}
     */
    get: function get() {
      var settings = Glide.settings;

      if (Glide.isType('slider') && Components.Run.offset) {
        return settings.rewindDuration;
      }

      return settings.animationDuration;
    }
  });
  /**
   * Set transition `style` value:
   * - on each moving, because it may be cleared by offset move
   */

  Events.on('move', function () {
    Transition.set();
  });
  /**
   * Disable transition:
   * - before initial build to avoid transitioning from `0` to `startAt` index
   * - while resizing window and recalculating dimensions
   * - on jumping from offset transition at start and end edges in `carousel` type
   */

  Events.on(['build.before', 'resize', 'translate.jump'], function () {
    Transition.disable();
  });
  /**
   * Enable transition:
   * - on each running, because it may be disabled by offset move
   */

  Events.on('run', function () {
    Transition.enable();
  });
  /**
   * Remove transition:
   * - on destroying to bring markup to its inital state
   */

  Events.on('destroy', function () {
    Transition.remove();
  });
  return Transition;
}

/**
 * Test via a getter in the options object to see
 * if the passive property is accessed.
 *
 * @see https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
 */
var supportsPassive = false;

try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function get() {
      supportsPassive = true;
    }
  });
  window.addEventListener('testPassive', null, opts);
  window.removeEventListener('testPassive', null, opts);
} catch (e) {}

var supportsPassive$1 = supportsPassive;

var START_EVENTS = ['touchstart', 'mousedown'];
var MOVE_EVENTS = ['touchmove', 'mousemove'];
var END_EVENTS = ['touchend', 'touchcancel', 'mouseup', 'mouseleave'];
var MOUSE_EVENTS = ['mousedown', 'mousemove', 'mouseup', 'mouseleave'];
function Swipe (Glide, Components, Events) {
  /**
   * Instance of the binder for DOM Events.
   *
   * @type {EventsBinder}
   */
  var Binder = new EventsBinder();
  var swipeSin = 0;
  var swipeStartX = 0;
  var swipeStartY = 0;
  var disabled = false;
  var capture = supportsPassive$1 ? {
    passive: true
  } : false;
  var Swipe = {
    /**
     * Initializes swipe bindings.
     *
     * @return {Void}
     */
    mount: function mount() {
      this.bindSwipeStart();
    },

    /**
     * Handler for `swipestart` event. Calculates entry points of the user's tap.
     *
     * @param {Object} event
     * @return {Void}
     */
    start: function start(event) {
      if (!disabled && !Glide.disabled) {
        this.disable();
        var swipe = this.touches(event);
        swipeSin = null;
        swipeStartX = toInt(swipe.pageX);
        swipeStartY = toInt(swipe.pageY);
        this.bindSwipeMove();
        this.bindSwipeEnd();
        Events.emit('swipe.start');
      }
    },

    /**
     * Handler for `swipemove` event. Calculates user's tap angle and distance.
     *
     * @param {Object} event
     */
    move: function move(event) {
      if (!Glide.disabled) {
        var _Glide$settings = Glide.settings,
            touchAngle = _Glide$settings.touchAngle,
            touchRatio = _Glide$settings.touchRatio,
            classes = _Glide$settings.classes;
        var swipe = this.touches(event);
        var subExSx = toInt(swipe.pageX) - swipeStartX;
        var subEySy = toInt(swipe.pageY) - swipeStartY;
        var powEX = Math.abs(subExSx << 2);
        var powEY = Math.abs(subEySy << 2);
        var swipeHypotenuse = Math.sqrt(powEX + powEY);
        var swipeCathetus = Math.sqrt(powEY);
        swipeSin = Math.asin(swipeCathetus / swipeHypotenuse);

        if (swipeSin * 180 / Math.PI < touchAngle) {
          event.stopPropagation();
          Components.Move.make(subExSx * toFloat(touchRatio));
          Components.Html.root.classList.add(classes.dragging);
          Events.emit('swipe.move');
        } else {
          return false;
        }
      }
    },

    /**
     * Handler for `swipeend` event. Finitializes user's tap and decides about glide move.
     *
     * @param {Object} event
     * @return {Void}
     */
    end: function end(event) {
      if (!Glide.disabled) {
        var _Glide$settings2 = Glide.settings,
            perSwipe = _Glide$settings2.perSwipe,
            touchAngle = _Glide$settings2.touchAngle,
            classes = _Glide$settings2.classes;
        var swipe = this.touches(event);
        var threshold = this.threshold(event);
        var swipeDistance = swipe.pageX - swipeStartX;
        var swipeDeg = swipeSin * 180 / Math.PI;
        this.enable();

        if (swipeDistance > threshold && swipeDeg < touchAngle) {
          Components.Run.make(Components.Direction.resolve("".concat(perSwipe, "<")));
        } else if (swipeDistance < -threshold && swipeDeg < touchAngle) {
          Components.Run.make(Components.Direction.resolve("".concat(perSwipe, ">")));
        } else {
          // While swipe don't reach distance apply previous transform.
          Components.Move.make();
        }

        Components.Html.root.classList.remove(classes.dragging);
        this.unbindSwipeMove();
        this.unbindSwipeEnd();
        Events.emit('swipe.end');
      }
    },

    /**
     * Binds swipe's starting event.
     *
     * @return {Void}
     */
    bindSwipeStart: function bindSwipeStart() {
      var _this = this;

      var _Glide$settings3 = Glide.settings,
          swipeThreshold = _Glide$settings3.swipeThreshold,
          dragThreshold = _Glide$settings3.dragThreshold;

      if (swipeThreshold) {
        Binder.on(START_EVENTS[0], Components.Html.wrapper, function (event) {
          _this.start(event);
        }, capture);
      }

      if (dragThreshold) {
        Binder.on(START_EVENTS[1], Components.Html.wrapper, function (event) {
          _this.start(event);
        }, capture);
      }
    },

    /**
     * Unbinds swipe's starting event.
     *
     * @return {Void}
     */
    unbindSwipeStart: function unbindSwipeStart() {
      Binder.off(START_EVENTS[0], Components.Html.wrapper, capture);
      Binder.off(START_EVENTS[1], Components.Html.wrapper, capture);
    },

    /**
     * Binds swipe's moving event.
     *
     * @return {Void}
     */
    bindSwipeMove: function bindSwipeMove() {
      var _this2 = this;

      Binder.on(MOVE_EVENTS, Components.Html.wrapper, throttle(function (event) {
        _this2.move(event);
      }, Glide.settings.throttle), capture);
    },

    /**
     * Unbinds swipe's moving event.
     *
     * @return {Void}
     */
    unbindSwipeMove: function unbindSwipeMove() {
      Binder.off(MOVE_EVENTS, Components.Html.wrapper, capture);
    },

    /**
     * Binds swipe's ending event.
     *
     * @return {Void}
     */
    bindSwipeEnd: function bindSwipeEnd() {
      var _this3 = this;

      Binder.on(END_EVENTS, Components.Html.wrapper, function (event) {
        _this3.end(event);
      });
    },

    /**
     * Unbinds swipe's ending event.
     *
     * @return {Void}
     */
    unbindSwipeEnd: function unbindSwipeEnd() {
      Binder.off(END_EVENTS, Components.Html.wrapper);
    },

    /**
     * Normalizes event touches points accorting to different types.
     *
     * @param {Object} event
     */
    touches: function touches(event) {
      if (MOUSE_EVENTS.indexOf(event.type) > -1) {
        return event;
      }

      return event.touches[0] || event.changedTouches[0];
    },

    /**
     * Gets value of minimum swipe distance settings based on event type.
     *
     * @return {Number}
     */
    threshold: function threshold(event) {
      var settings = Glide.settings;

      if (MOUSE_EVENTS.indexOf(event.type) > -1) {
        return settings.dragThreshold;
      }

      return settings.swipeThreshold;
    },

    /**
     * Enables swipe event.
     *
     * @return {self}
     */
    enable: function enable() {
      disabled = false;
      Components.Transition.enable();
      return this;
    },

    /**
     * Disables swipe event.
     *
     * @return {self}
     */
    disable: function disable() {
      disabled = true;
      Components.Transition.disable();
      return this;
    }
  };
  /**
   * Add component class:
   * - after initial building
   */

  Events.on('build.after', function () {
    Components.Html.root.classList.add(Glide.settings.classes.swipeable);
  });
  /**
   * Remove swiping bindings:
   * - on destroying, to remove added EventListeners
   */

  Events.on('destroy', function () {
    Swipe.unbindSwipeStart();
    Swipe.unbindSwipeMove();
    Swipe.unbindSwipeEnd();
    Binder.destroy();
  });
  return Swipe;
}

function Images (Glide, Components, Events) {
  /**
   * Instance of the binder for DOM Events.
   *
   * @type {EventsBinder}
   */
  var Binder = new EventsBinder();
  var Images = {
    /**
     * Binds listener to glide wrapper.
     *
     * @return {Void}
     */
    mount: function mount() {
      this.bind();
    },

    /**
     * Binds `dragstart` event on wrapper to prevent dragging images.
     *
     * @return {Void}
     */
    bind: function bind() {
      Binder.on('dragstart', Components.Html.wrapper, this.dragstart);
    },

    /**
     * Unbinds `dragstart` event on wrapper.
     *
     * @return {Void}
     */
    unbind: function unbind() {
      Binder.off('dragstart', Components.Html.wrapper);
    },

    /**
     * Event handler. Prevents dragging.
     *
     * @return {Void}
     */
    dragstart: function dragstart(event) {
      event.preventDefault();
    }
  };
  /**
   * Remove bindings from images:
   * - on destroying, to remove added EventListeners
   */

  Events.on('destroy', function () {
    Images.unbind();
    Binder.destroy();
  });
  return Images;
}

function Anchors (Glide, Components, Events) {
  /**
   * Instance of the binder for DOM Events.
   *
   * @type {EventsBinder}
   */
  var Binder = new EventsBinder();
  /**
   * Holds detaching status of anchors.
   * Prevents detaching of already detached anchors.
   *
   * @private
   * @type {Boolean}
   */

  var detached = false;
  /**
   * Holds preventing status of anchors.
   * If `true` redirection after click will be disabled.
   *
   * @private
   * @type {Boolean}
   */

  var prevented = false;
  var Anchors = {
    /**
     * Setups a initial state of anchors component.
     *
     * @returns {Void}
     */
    mount: function mount() {
      /**
       * Holds collection of anchors elements.
       *
       * @private
       * @type {HTMLCollection}
       */
      this._a = Components.Html.wrapper.querySelectorAll('a');
      this.bind();
    },

    /**
     * Binds events to anchors inside a track.
     *
     * @return {Void}
     */
    bind: function bind() {
      Binder.on('click', Components.Html.wrapper, this.click);
    },

    /**
     * Unbinds events attached to anchors inside a track.
     *
     * @return {Void}
     */
    unbind: function unbind() {
      Binder.off('click', Components.Html.wrapper);
    },

    /**
     * Handler for click event. Prevents clicks when glide is in `prevent` status.
     *
     * @param  {Object} event
     * @return {Void}
     */
    click: function click(event) {
      if (prevented) {
        event.stopPropagation();
        event.preventDefault();
      }
    },

    /**
     * Detaches anchors click event inside glide.
     *
     * @return {self}
     */
    detach: function detach() {
      prevented = true;

      if (!detached) {
        for (var i = 0; i < this.items.length; i++) {
          this.items[i].draggable = false;
        }

        detached = true;
      }

      return this;
    },

    /**
     * Attaches anchors click events inside glide.
     *
     * @return {self}
     */
    attach: function attach() {
      prevented = false;

      if (detached) {
        for (var i = 0; i < this.items.length; i++) {
          this.items[i].draggable = true;
        }

        detached = false;
      }

      return this;
    }
  };
  define(Anchors, 'items', {
    /**
     * Gets collection of the arrows HTML elements.
     *
     * @return {HTMLElement[]}
     */
    get: function get() {
      return Anchors._a;
    }
  });
  /**
   * Detach anchors inside slides:
   * - on swiping, so they won't redirect to its `href` attributes
   */

  Events.on('swipe.move', function () {
    Anchors.detach();
  });
  /**
   * Attach anchors inside slides:
   * - after swiping and transitions ends, so they can redirect after click again
   */

  Events.on('swipe.end', function () {
    Components.Transition.after(function () {
      Anchors.attach();
    });
  });
  /**
   * Unbind anchors inside slides:
   * - on destroying, to bring anchors to its initial state
   */

  Events.on('destroy', function () {
    Anchors.attach();
    Anchors.unbind();
    Binder.destroy();
  });
  return Anchors;
}

var NAV_SELECTOR = '[data-glide-el="controls[nav]"]';
var CONTROLS_SELECTOR = '[data-glide-el^="controls"]';
var PREVIOUS_CONTROLS_SELECTOR = "".concat(CONTROLS_SELECTOR, " [data-glide-dir*=\"<\"]");
var NEXT_CONTROLS_SELECTOR = "".concat(CONTROLS_SELECTOR, " [data-glide-dir*=\">\"]");
function Controls (Glide, Components, Events) {
  /**
   * Instance of the binder for DOM Events.
   *
   * @type {EventsBinder}
   */
  var Binder = new EventsBinder();
  var capture = supportsPassive$1 ? {
    passive: true
  } : false;
  var Controls = {
    /**
     * Inits arrows. Binds events listeners
     * to the arrows HTML elements.
     *
     * @return {Void}
     */
    mount: function mount() {
      /**
       * Collection of navigation HTML elements.
       *
       * @private
       * @type {HTMLCollection}
       */
      this._n = Components.Html.root.querySelectorAll(NAV_SELECTOR);
      /**
       * Collection of controls HTML elements.
       *
       * @private
       * @type {HTMLCollection}
       */

      this._c = Components.Html.root.querySelectorAll(CONTROLS_SELECTOR);
      /**
       * Collection of arrow control HTML elements.
       *
       * @private
       * @type {Object}
       */

      this._arrowControls = {
        previous: Components.Html.root.querySelectorAll(PREVIOUS_CONTROLS_SELECTOR),
        next: Components.Html.root.querySelectorAll(NEXT_CONTROLS_SELECTOR)
      };
      this.addBindings();
    },

    /**
     * Sets active class to current slide.
     *
     * @return {Void}
     */
    setActive: function setActive() {
      for (var i = 0; i < this._n.length; i++) {
        this.addClass(this._n[i].children);
      }
    },

    /**
     * Removes active class to current slide.
     *
     * @return {Void}
     */
    removeActive: function removeActive() {
      for (var i = 0; i < this._n.length; i++) {
        this.removeClass(this._n[i].children);
      }
    },

    /**
     * Toggles active class on items inside navigation.
     *
     * @param  {HTMLElement} controls
     * @return {Void}
     */
    addClass: function addClass(controls) {
      var settings = Glide.settings;
      var item = controls[Glide.index];

      if (!item) {
        return;
      }

      if (item) {
        item.classList.add(settings.classes.nav.active);
        siblings(item).forEach(function (sibling) {
          sibling.classList.remove(settings.classes.nav.active);
        });
      }
    },

    /**
     * Removes active class from active control.
     *
     * @param  {HTMLElement} controls
     * @return {Void}
     */
    removeClass: function removeClass(controls) {
      var item = controls[Glide.index];

      if (item) {
        item.classList.remove(Glide.settings.classes.nav.active);
      }
    },

    /**
     * Calculates, removes or adds `Glide.settings.classes.disabledArrow` class on the control arrows
     */
    setArrowState: function setArrowState() {
      if (Glide.settings.rewind) {
        return;
      }

      var next = Controls._arrowControls.next;
      var previous = Controls._arrowControls.previous;
      this.resetArrowState(next, previous);

      if (Glide.index === 0) {
        this.disableArrow(previous);
      }

      if (Glide.index === Components.Run.length) {
        this.disableArrow(next);
      }
    },

    /**
     * Removes `Glide.settings.classes.disabledArrow` from given NodeList elements
     *
     * @param {NodeList[]} lists
     */
    resetArrowState: function resetArrowState() {
      var settings = Glide.settings;

      for (var _len = arguments.length, lists = new Array(_len), _key = 0; _key < _len; _key++) {
        lists[_key] = arguments[_key];
      }

      lists.forEach(function (list) {
        list.forEach(function (element) {
          element.classList.remove(settings.classes.arrow.disabled);
        });
      });
    },

    /**
     * Adds `Glide.settings.classes.disabledArrow` to given NodeList elements
     *
     * @param {NodeList[]} lists
     */
    disableArrow: function disableArrow() {
      var settings = Glide.settings;

      for (var _len2 = arguments.length, lists = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        lists[_key2] = arguments[_key2];
      }

      lists.forEach(function (list) {
        list.forEach(function (element) {
          element.classList.add(settings.classes.arrow.disabled);
        });
      });
    },

    /**
     * Adds handles to the each group of controls.
     *
     * @return {Void}
     */
    addBindings: function addBindings() {
      for (var i = 0; i < this._c.length; i++) {
        this.bind(this._c[i].children);
      }
    },

    /**
     * Removes handles from the each group of controls.
     *
     * @return {Void}
     */
    removeBindings: function removeBindings() {
      for (var i = 0; i < this._c.length; i++) {
        this.unbind(this._c[i].children);
      }
    },

    /**
     * Binds events to arrows HTML elements.
     *
     * @param {HTMLCollection} elements
     * @return {Void}
     */
    bind: function bind(elements) {
      for (var i = 0; i < elements.length; i++) {
        Binder.on('click', elements[i], this.click);
        Binder.on('touchstart', elements[i], this.click, capture);
      }
    },

    /**
     * Unbinds events binded to the arrows HTML elements.
     *
     * @param {HTMLCollection} elements
     * @return {Void}
     */
    unbind: function unbind(elements) {
      for (var i = 0; i < elements.length; i++) {
        Binder.off(['click', 'touchstart'], elements[i]);
      }
    },

    /**
     * Handles `click` event on the arrows HTML elements.
     * Moves slider in direction given via the
     * `data-glide-dir` attribute.
     *
     * @param {Object} event
     * @return {void}
     */
    click: function click(event) {
      if (!supportsPassive$1 && event.type === 'touchstart') {
        event.preventDefault();
      }

      var direction = event.currentTarget.getAttribute('data-glide-dir');
      Components.Run.make(Components.Direction.resolve(direction));
    }
  };
  define(Controls, 'items', {
    /**
     * Gets collection of the controls HTML elements.
     *
     * @return {HTMLElement[]}
     */
    get: function get() {
      return Controls._c;
    }
  });
  /**
   * Swap active class of current navigation item:
   * - after mounting to set it to initial index
   * - after each move to the new index
   */

  Events.on(['mount.after', 'move.after'], function () {
    Controls.setActive();
  });
  /**
   * Add or remove disabled class of arrow elements
   */

  Events.on(['mount.after', 'run'], function () {
    Controls.setArrowState();
  });
  /**
   * Remove bindings and HTML Classes:
   * - on destroying, to bring markup to its initial state
   */

  Events.on('destroy', function () {
    Controls.removeBindings();
    Controls.removeActive();
    Binder.destroy();
  });
  return Controls;
}

function Keyboard (Glide, Components, Events) {
  /**
   * Instance of the binder for DOM Events.
   *
   * @type {EventsBinder}
   */
  var Binder = new EventsBinder();
  var Keyboard = {
    /**
     * Binds keyboard events on component mount.
     *
     * @return {Void}
     */
    mount: function mount() {
      if (Glide.settings.keyboard) {
        this.bind();
      }
    },

    /**
     * Adds keyboard press events.
     *
     * @return {Void}
     */
    bind: function bind() {
      Binder.on('keyup', document, this.press);
    },

    /**
     * Removes keyboard press events.
     *
     * @return {Void}
     */
    unbind: function unbind() {
      Binder.off('keyup', document);
    },

    /**
     * Handles keyboard's arrows press and moving glide foward and backward.
     *
     * @param  {Object} event
     * @return {Void}
     */
    press: function press(event) {
      var perSwipe = Glide.settings.perSwipe;

      if (event.keyCode === 39) {
        Components.Run.make(Components.Direction.resolve("".concat(perSwipe, ">")));
      }

      if (event.keyCode === 37) {
        Components.Run.make(Components.Direction.resolve("".concat(perSwipe, "<")));
      }
    }
  };
  /**
   * Remove bindings from keyboard:
   * - on destroying to remove added events
   * - on updating to remove events before remounting
   */

  Events.on(['destroy', 'update'], function () {
    Keyboard.unbind();
  });
  /**
   * Remount component
   * - on updating to reflect potential changes in settings
   */

  Events.on('update', function () {
    Keyboard.mount();
  });
  /**
   * Destroy binder:
   * - on destroying to remove listeners
   */

  Events.on('destroy', function () {
    Binder.destroy();
  });
  return Keyboard;
}

function Autoplay (Glide, Components, Events) {
  /**
   * Instance of the binder for DOM Events.
   *
   * @type {EventsBinder}
   */
  var Binder = new EventsBinder();
  var Autoplay = {
    /**
     * Initializes autoplaying and events.
     *
     * @return {Void}
     */
    mount: function mount() {
      this.enable();
      this.start();

      if (Glide.settings.hoverpause) {
        this.bind();
      }
    },

    /**
     * Enables autoplaying
     *
     * @returns {Void}
     */
    enable: function enable() {
      this._e = true;
    },

    /**
     * Disables autoplaying.
     *
     * @returns {Void}
     */
    disable: function disable() {
      this._e = false;
    },

    /**
     * Starts autoplaying in configured interval.
     *
     * @param {Boolean|Number} force Run autoplaying with passed interval regardless of `autoplay` settings
     * @return {Void}
     */
    start: function start() {
      var _this = this;

      if (!this._e) {
        return;
      }

      this.enable();

      if (Glide.settings.autoplay) {
        if (isUndefined(this._i)) {
          this._i = setInterval(function () {
            _this.stop();

            Components.Run.make('>');

            _this.start();

            Events.emit('autoplay');
          }, this.time);
        }
      }
    },

    /**
     * Stops autorunning of the glide.
     *
     * @return {Void}
     */
    stop: function stop() {
      this._i = clearInterval(this._i);
    },

    /**
     * Stops autoplaying while mouse is over glide's area.
     *
     * @return {Void}
     */
    bind: function bind() {
      var _this2 = this;

      Binder.on('mouseover', Components.Html.root, function () {
        if (_this2._e) {
          _this2.stop();
        }
      });
      Binder.on('mouseout', Components.Html.root, function () {
        if (_this2._e) {
          _this2.start();
        }
      });
    },

    /**
     * Unbind mouseover events.
     *
     * @returns {Void}
     */
    unbind: function unbind() {
      Binder.off(['mouseover', 'mouseout'], Components.Html.root);
    }
  };
  define(Autoplay, 'time', {
    /**
     * Gets time period value for the autoplay interval. Prioritizes
     * times in `data-glide-autoplay` attrubutes over options.
     *
     * @return {Number}
     */
    get: function get() {
      var autoplay = Components.Html.slides[Glide.index].getAttribute('data-glide-autoplay');

      if (autoplay) {
        return toInt(autoplay);
      }

      return toInt(Glide.settings.autoplay);
    }
  });
  /**
   * Stop autoplaying and unbind events:
   * - on destroying, to clear defined interval
   * - on updating via API to reset interval that may changed
   */

  Events.on(['destroy', 'update'], function () {
    Autoplay.unbind();
  });
  /**
   * Stop autoplaying:
   * - before each run, to restart autoplaying
   * - on pausing via API
   * - on destroying, to clear defined interval
   * - while starting a swipe
   * - on updating via API to reset interval that may changed
   */

  Events.on(['run.before', 'swipe.start', 'update'], function () {
    Autoplay.stop();
  });
  Events.on(['pause', 'destroy'], function () {
    Autoplay.disable();
    Autoplay.stop();
  });
  /**
   * Start autoplaying:
   * - after each run, to restart autoplaying
   * - on playing via API
   * - while ending a swipe
   */

  Events.on(['run.after', 'swipe.end'], function () {
    Autoplay.start();
  });
  /**
   * Start autoplaying:
   * - after each run, to restart autoplaying
   * - on playing via API
   * - while ending a swipe
   */

  Events.on(['play'], function () {
    Autoplay.enable();
    Autoplay.start();
  });
  /**
   * Remount autoplaying:
   * - on updating via API to reset interval that may changed
   */

  Events.on('update', function () {
    Autoplay.mount();
  });
  /**
   * Destroy a binder:
   * - on destroying glide instance to clearup listeners
   */

  Events.on('destroy', function () {
    Binder.destroy();
  });
  return Autoplay;
}

/**
 * Sorts keys of breakpoint object so they will be ordered from lower to bigger.
 *
 * @param {Object} points
 * @returns {Object}
 */

function sortBreakpoints(points) {
  if (isObject(points)) {
    return sortKeys(points);
  } else {
    warn("Breakpoints option must be an object");
  }

  return {};
}

function Breakpoints (Glide, Components, Events) {
  /**
   * Instance of the binder for DOM Events.
   *
   * @type {EventsBinder}
   */
  var Binder = new EventsBinder();
  /**
   * Holds reference to settings.
   *
   * @type {Object}
   */

  var settings = Glide.settings;
  /**
   * Holds reference to breakpoints object in settings. Sorts breakpoints
   * from smaller to larger. It is required in order to proper
   * matching currently active breakpoint settings.
   *
   * @type {Object}
   */

  var points = sortBreakpoints(settings.breakpoints);
  /**
   * Cache initial settings before overwritting.
   *
   * @type {Object}
   */

  var defaults = Object.assign({}, settings);
  var Breakpoints = {
    /**
     * Matches settings for currectly matching media breakpoint.
     *
     * @param {Object} points
     * @returns {Object}
     */
    match: function match(points) {
      if (typeof window.matchMedia !== 'undefined') {
        for (var point in points) {
          if (points.hasOwnProperty(point)) {
            if (window.matchMedia("(max-width: ".concat(point, "px)")).matches) {
              return points[point];
            }
          }
        }
      }

      return defaults;
    }
  };
  /**
   * Overwrite instance settings with currently matching breakpoint settings.
   * This happens right after component initialization.
   */

  Object.assign(settings, Breakpoints.match(points));
  /**
   * Update glide with settings of matched brekpoint:
   * - window resize to update slider
   */

  Binder.on('resize', window, throttle(function () {
    Glide.settings = mergeOptions(settings, Breakpoints.match(points));
  }, Glide.settings.throttle));
  /**
   * Resort and update default settings:
   * - on reinit via API, so breakpoint matching will be performed with options
   */

  Events.on('update', function () {
    points = sortBreakpoints(points);
    defaults = Object.assign({}, settings);
  });
  /**
   * Unbind resize listener:
   * - on destroying, to bring markup to its initial state
   */

  Events.on('destroy', function () {
    Binder.off('resize', window);
  });
  return Breakpoints;
}

var COMPONENTS = {
  // Required
  Html: Html,
  Translate: Translate,
  Transition: Transition,
  Direction: Direction,
  Peek: Peek,
  Sizes: Sizes,
  Gaps: Gaps,
  Move: Move,
  Clones: Clones,
  Resize: Resize,
  Build: Build,
  Run: Run,
  // Optional
  Swipe: Swipe,
  Images: Images,
  Anchors: Anchors,
  Controls: Controls,
  Keyboard: Keyboard,
  Autoplay: Autoplay,
  Breakpoints: Breakpoints
};

var Glide = /*#__PURE__*/function (_Core) {
  _inherits(Glide, _Core);

  var _super = _createSuper(Glide);

  function Glide() {
    _classCallCheck(this, Glide);

    return _super.apply(this, arguments);
  }

  _createClass(Glide, [{
    key: "mount",
    value: function mount() {
      var extensions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return _get(_getPrototypeOf(Glide.prototype), "mount", this).call(this, Object.assign({}, COMPONENTS, extensions));
    }
  }]);

  return Glide;
}(Glide$1);




/***/ }),

/***/ "./src/experiences/exitIntent/node_modules/@qubit/check-exit/index.js":
/*!****************************************************************************!*\
  !*** ./src/experiences/exitIntent/node_modules/@qubit/check-exit/index.js ***!
  \****************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Promise = __webpack_require__(/*! sync-p */ "./src/experiences/exitIntent/node_modules/sync-p/index.js")

module.exports = function checkExit (cb, config = {}) {
  const callback = cb || function () {}
  const sensitivity = config.sensitivity || 20
  const timer = config.timer || 1000
  const delay = config.delay || 0
  const viewport = config.viewport || document.documentElement
  const debug = config.debug || false

  let delayTimer
  let listenerTimeout
  let disableKeydown = false
  let attachedListeners = false

  function init () {
    return new Promise(resolve => {
      if (debug) console.log('checkExit - Init')
      listenerTimeout = setTimeout(() => {
        attachEventListeners()
        resolve()
      }, timer)
    })
  }

  function cleanup () {
    return new Promise(resolve => {
      if (debug) console.log('checkExit - Cleanup')
      clearTimeout(listenerTimeout)
      if (attachedListeners) {
        viewport.removeEventListener('mouseleave', handleMouseleave)
        viewport.removeEventListener('mouseenter', handleMouseenter)
        viewport.removeEventListener('keydown', handleKeydown)
      }
      return resolve()
    })
  }

  function fire () {
    if (debug) console.log('checkExit - Fire')
    callback()
    cleanup()
  }

  function attachEventListeners () {
    if (debug) console.log('checkExit - Attached listeners')
    viewport.addEventListener('mouseleave', handleMouseleave)
    viewport.addEventListener('mouseenter', handleMouseenter)
    viewport.addEventListener('keydown', handleKeydown)
    attachedListeners = true
  }

  function handleMouseleave (e) {
    if (e.clientY > sensitivity) return
    delayTimer = setTimeout(fire, delay)
  }

  function handleMouseenter () {
    if (!delayTimer) return
    clearTimeout(delayTimer)
    delayTimer = null
  }

  function handleKeydown (e) {
    if (disableKeydown || !e.metaKey || e.keyCode !== 76) return
    disableKeydown = true
    delayTimer = setTimeout(fire, delay)
  }

  return {
    init,
    cleanup
  }
}


/***/ }),

/***/ "./src/experiences/exitIntent/node_modules/@qubit/check-inactivity/index.js":
/*!**********************************************************************************!*\
  !*** ./src/experiences/exitIntent/node_modules/@qubit/check-inactivity/index.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const _ = __webpack_require__(/*! slapdash */ "./src/experiences/exitIntent/node_modules/slapdash/dist/index.js")

module.exports = function checkInactivity (delay, cb) {
  const { setTimeout, clearTimeout } = window
  let timer
  const events = ['touchstart', 'click', 'scroll', 'keyup', 'keypress', 'mousemove']

  resetTimer()

  events.forEach(event => window.addEventListener(event, _.debounce(resetTimer, 500)))

  function resetTimer () {
    clearTimeout(timer)
    timer = setTimeout(fire, delay * 1000)
  }

  function fire () {
    dispose()
    cb()
  }

  function dispose () {
    clearTimeout(timer)
    events.forEach(event => window.removeEventListener(event, resetTimer))
  }

  return dispose
}


/***/ }),

/***/ "./src/experiences/exitIntent/node_modules/@qubit/utils/dom/index.js":
/*!***************************************************************************!*\
  !*** ./src/experiences/exitIntent/node_modules/@qubit/utils/dom/index.js ***!
  \***************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const _ = __webpack_require__(/*! slapdash */ "./src/experiences/exitIntent/node_modules/slapdash/dist/index.js")
const once = __webpack_require__(/*! ../lib/once */ "./src/experiences/exitIntent/node_modules/@qubit/utils/lib/once.js")
const withRestoreAll = __webpack_require__(/*! ../lib/withRestoreAll */ "./src/experiences/exitIntent/node_modules/@qubit/utils/lib/withRestoreAll.js")
const promised = __webpack_require__(/*! ../lib/promised */ "./src/experiences/exitIntent/node_modules/@qubit/utils/lib/promised.js")
const noop = () => {}

function onEvent (el, type, fn) {
  el.addEventListener(type, fn)
  return once(() => el.removeEventListener(type, fn))
}

function style (el, css, fn) {
  const originalStyle = el.getAttribute('style')
  const newStyle = typeof css === 'string' ? fromStyle(css) : css
  const merged = {
    ...fromStyle(originalStyle),
    ...newStyle
  }
  el.setAttribute('style', toStyle(merged))
  return once(() => el.setAttribute('style', originalStyle))
}

function fromStyle (style) {
  if (!style) style = ''
  return style.split(';').reduce((memo, val) => {
    if (!val) return memo
    const [key, ...value] = val.split(':')
    memo[key] = value.join(':')
    return memo
  }, {})
}

function toStyle (css) {
  return _.keys(css).reduce((memo, key) => {
    return memo + `${kebab(key)}:${css[key]};`
  }, '')
}

function kebab (str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function isInViewPort (el) {
  if (el && el.parentElement) {
    const { top, bottom } = el.getBoundingClientRect()
    const isAboveWindowsBottom =
      top === bottom
        ? // If both bottom and top are at window.innerHeight
          // the element is entirely inside the viewport
          top <= window.innerHeight
        : // If the element has height, when top is at window.innerHeight
          // the element is below the window
          top < window.innerHeight
    const isBelowWindowsTop =
      top === bottom
        ? // If both bottom and top are at 0px
          // the element is entirely inside the viewport
          bottom >= 0
        : // If the element has height, when bottom is at 0px
          // the element is above the window
          bottom > 0
    return isAboveWindowsBottom && isBelowWindowsTop
  }
}

function onAnyEnterViewport (els, fn) {
  const disposables = []
  _.each(els, el => disposables.push(onEnterViewport(el, fn)))
  return once(() => {
    while (disposables.length) disposables.pop()()
  })
}

function onEnterViewport (el, fn, scrollTargetEl = window) {
  if (_.isArray(el)) {
    return onAnyEnterViewport(el, fn)
  }

  if (isInViewPort(el)) {
    fn()
    return noop
  }

  const handleScroll = _.debounce(() => {
    if (isInViewPort(el)) {
      scrollTargetEl.removeEventListener('scroll', handleScroll)
      fn()
    }
  }, 50)
  scrollTargetEl.addEventListener('scroll', handleScroll)
  return once(() => scrollTargetEl.removeEventListener('scroll', handleScroll))
}

function replace (target, el) {
  const parent = target.parentElement
  parent.insertBefore(el, target.nextSibling)
  parent.removeChild(target)
  return once(() => replace(el, target))
}

function insertAfter (target, el) {
  const parent = target.parentElement
  parent.insertBefore(el, target.nextSibling)
  return once(() => parent.removeChild(el))
}

function insertBefore (target, el) {
  const parent = target.parentElement
  parent.insertBefore(el, target)
  return once(() => parent.removeChild(el))
}

function appendChild (target, el) {
  target.appendChild(el)
  return once(() => target.removeChild(el))
}

module.exports = () => {
  const utils = withRestoreAll({
    onEvent,
    onEnterViewport,
    replace,
    style,
    insertAfter,
    insertBefore,
    appendChild,
    closest
  })

  _.each(_.keys(utils), key => {
    if (key.indexOf('on') === 0) utils[key] = promised(utils[key])
  })

  return utils
}

function closest (element, selector) {
  if (window.Element.prototype.closest) {
    return window.Element.prototype.closest.call(element, selector)
  } else {
    const matches = window.Element.prototype.matches ||
      window.Element.prototype.msMatchesSelector ||
      window.Element.prototype.webkitMatchesSelector

    let el = element

    do {
      if (matches.call(el, selector)) return el
      el = el.parentElement || el.parentNode
    } while (el !== null && el.nodeType === 1)
    return null
  }
}


/***/ }),

/***/ "./src/experiences/exitIntent/node_modules/@qubit/utils/lib/once.js":
/*!**************************************************************************!*\
  !*** ./src/experiences/exitIntent/node_modules/@qubit/utils/lib/once.js ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = function once (fn) {
  let called = false
  return (...args) => {
    if (called) return
    called = true
    return fn(...args)
  }
}


/***/ }),

/***/ "./src/experiences/exitIntent/node_modules/@qubit/utils/lib/promised.js":
/*!******************************************************************************!*\
  !*** ./src/experiences/exitIntent/node_modules/@qubit/utils/lib/promised.js ***!
  \******************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const Promise = __webpack_require__(/*! sync-p */ "./src/experiences/exitIntent/node_modules/sync-p/index.js")

module.exports = function promised (fn) {
  return (...args) => {
    if (typeof args[args.length - 1] === 'function') {
      return fn(...args)
    }
    let dispose
    return new Promise(resolve => {
      args.push(resolve)
      dispose = fn(...args)
    }).then(value => {
      if (typeof dispose === 'function') {
        dispose()
      }
      return value
    })
  }
}


/***/ }),

/***/ "./src/experiences/exitIntent/node_modules/@qubit/utils/lib/withRestoreAll.js":
/*!************************************************************************************!*\
  !*** ./src/experiences/exitIntent/node_modules/@qubit/utils/lib/withRestoreAll.js ***!
  \************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const _ = __webpack_require__(/*! slapdash */ "./src/experiences/exitIntent/node_modules/slapdash/dist/index.js")

module.exports = function withRestoreAll (utils) {
  const cleanup = []

  function restorable (fn) {
    return (...args) => {
      const dispose = fn(...args)
      if (typeof dispose === 'function') {
        cleanup.push(dispose)
      }
      return dispose
    }
  }
  const result = {}

  for (const key of _.keys(utils)) {
    result[key] = restorable(utils[key])
  }

  result.restoreAll = function restoreAll () {
    while (cleanup.length) cleanup.pop()()
  }

  return result
}


/***/ }),

/***/ "./src/experiences/exitIntent/node_modules/preact/dist/preact.module.js":
/*!******************************************************************************!*\
  !*** ./src/experiences/exitIntent/node_modules/preact/dist/preact.module.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Component": () => (/* binding */ _),
/* harmony export */   "Fragment": () => (/* binding */ d),
/* harmony export */   "cloneElement": () => (/* binding */ B),
/* harmony export */   "createContext": () => (/* binding */ D),
/* harmony export */   "createElement": () => (/* binding */ v),
/* harmony export */   "createRef": () => (/* binding */ p),
/* harmony export */   "h": () => (/* binding */ v),
/* harmony export */   "hydrate": () => (/* binding */ q),
/* harmony export */   "isValidElement": () => (/* binding */ i),
/* harmony export */   "options": () => (/* binding */ l),
/* harmony export */   "render": () => (/* binding */ S),
/* harmony export */   "toChildArray": () => (/* binding */ A)
/* harmony export */ });
var n,l,u,i,t,o,r,f,e={},c=[],s=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function a(n,l){for(var u in l)n[u]=l[u];return n}function h(n){var l=n.parentNode;l&&l.removeChild(n)}function v(l,u,i){var t,o,r,f={};for(r in u)"key"==r?t=u[r]:"ref"==r?o=u[r]:f[r]=u[r];if(arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):i),"function"==typeof l&&null!=l.defaultProps)for(r in l.defaultProps)void 0===f[r]&&(f[r]=l.defaultProps[r]);return y(l,f,t,o,null)}function y(n,i,t,o,r){var f={type:n,props:i,key:t,ref:o,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==r?++u:r};return null==r&&null!=l.vnode&&l.vnode(f),f}function p(){return{current:null}}function d(n){return n.children}function _(n,l){this.props=n,this.context=l}function k(n,l){if(null==l)return n.__?k(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return"function"==typeof n.type?k(n):null}function b(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return b(n)}}function m(n){(!n.__d&&(n.__d=!0)&&t.push(n)&&!g.__r++||r!==l.debounceRendering)&&((r=l.debounceRendering)||o)(g)}function g(){for(var n;g.__r=t.length;)n=t.sort(function(n,l){return n.__v.__b-l.__v.__b}),t=[],n.some(function(n){var l,u,i,t,o,r;n.__d&&(o=(t=(l=n).__v).__e,(r=l.__P)&&(u=[],(i=a({},t)).__v=t.__v+1,j(r,t,i,l.__n,void 0!==r.ownerSVGElement,null!=t.__h?[o]:null,u,null==o?k(t):o,t.__h),z(u,t),t.__e!=o&&b(t)))})}function w(n,l,u,i,t,o,r,f,s,a){var h,v,p,_,b,m,g,w=i&&i.__k||c,A=w.length;for(u.__k=[],h=0;h<l.length;h++)if(null!=(_=u.__k[h]=null==(_=l[h])||"boolean"==typeof _?null:"string"==typeof _||"number"==typeof _||"bigint"==typeof _?y(null,_,null,null,_):Array.isArray(_)?y(d,{children:_},null,null,null):_.__b>0?y(_.type,_.props,_.key,null,_.__v):_)){if(_.__=u,_.__b=u.__b+1,null===(p=w[h])||p&&_.key==p.key&&_.type===p.type)w[h]=void 0;else for(v=0;v<A;v++){if((p=w[v])&&_.key==p.key&&_.type===p.type){w[v]=void 0;break}p=null}j(n,_,p=p||e,t,o,r,f,s,a),b=_.__e,(v=_.ref)&&p.ref!=v&&(g||(g=[]),p.ref&&g.push(p.ref,null,_),g.push(v,_.__c||b,_)),null!=b?(null==m&&(m=b),"function"==typeof _.type&&_.__k===p.__k?_.__d=s=x(_,s,n):s=P(n,_,p,w,b,s),"function"==typeof u.type&&(u.__d=s)):s&&p.__e==s&&s.parentNode!=n&&(s=k(p))}for(u.__e=m,h=A;h--;)null!=w[h]&&("function"==typeof u.type&&null!=w[h].__e&&w[h].__e==u.__d&&(u.__d=k(i,h+1)),N(w[h],w[h]));if(g)for(h=0;h<g.length;h++)M(g[h],g[++h],g[++h])}function x(n,l,u){for(var i,t=n.__k,o=0;t&&o<t.length;o++)(i=t[o])&&(i.__=n,l="function"==typeof i.type?x(i,l,u):P(u,i,i,t,i.__e,l));return l}function A(n,l){return l=l||[],null==n||"boolean"==typeof n||(Array.isArray(n)?n.some(function(n){A(n,l)}):l.push(n)),l}function P(n,l,u,i,t,o){var r,f,e;if(void 0!==l.__d)r=l.__d,l.__d=void 0;else if(null==u||t!=o||null==t.parentNode)n:if(null==o||o.parentNode!==n)n.appendChild(t),r=null;else{for(f=o,e=0;(f=f.nextSibling)&&e<i.length;e+=2)if(f==t)break n;n.insertBefore(t,o),r=o}return void 0!==r?r:t.nextSibling}function C(n,l,u,i,t){var o;for(o in u)"children"===o||"key"===o||o in l||H(n,o,null,u[o],i);for(o in l)t&&"function"!=typeof l[o]||"children"===o||"key"===o||"value"===o||"checked"===o||u[o]===l[o]||H(n,o,l[o],u[o],i)}function $(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||s.test(l)?u:u+"px"}function H(n,l,u,i,t){var o;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else{if("string"==typeof i&&(n.style.cssText=i=""),i)for(l in i)u&&l in u||$(n.style,l,"");if(u)for(l in u)i&&u[l]===i[l]||$(n.style,l,u[l])}else if("o"===l[0]&&"n"===l[1])o=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+o]=u,u?i||n.addEventListener(l,o?T:I,o):n.removeEventListener(l,o?T:I,o);else if("dangerouslySetInnerHTML"!==l){if(t)l=l.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null!=u&&(!1!==u||"a"===l[0]&&"r"===l[1])?n.setAttribute(l,u):n.removeAttribute(l))}}function I(n){this.l[n.type+!1](l.event?l.event(n):n)}function T(n){this.l[n.type+!0](l.event?l.event(n):n)}function j(n,u,i,t,o,r,f,e,c){var s,h,v,y,p,k,b,m,g,x,A,P=u.type;if(void 0!==u.constructor)return null;null!=i.__h&&(c=i.__h,e=u.__e=i.__e,u.__h=null,r=[e]),(s=l.__b)&&s(u);try{n:if("function"==typeof P){if(m=u.props,g=(s=P.contextType)&&t[s.__c],x=s?g?g.props.value:s.__:t,i.__c?b=(h=u.__c=i.__c).__=h.__E:("prototype"in P&&P.prototype.render?u.__c=h=new P(m,x):(u.__c=h=new _(m,x),h.constructor=P,h.render=O),g&&g.sub(h),h.props=m,h.state||(h.state={}),h.context=x,h.__n=t,v=h.__d=!0,h.__h=[]),null==h.__s&&(h.__s=h.state),null!=P.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=a({},h.__s)),a(h.__s,P.getDerivedStateFromProps(m,h.__s))),y=h.props,p=h.state,v)null==P.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else{if(null==P.getDerivedStateFromProps&&m!==y&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(m,x),!h.__e&&null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(m,h.__s,x)||u.__v===i.__v){h.props=m,h.state=h.__s,u.__v!==i.__v&&(h.__d=!1),h.__v=u,u.__e=i.__e,u.__k=i.__k,u.__k.forEach(function(n){n&&(n.__=u)}),h.__h.length&&f.push(h);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(m,h.__s,x),null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(y,p,k)})}h.context=x,h.props=m,h.state=h.__s,(s=l.__r)&&s(u),h.__d=!1,h.__v=u,h.__P=n,s=h.render(h.props,h.state,h.context),h.state=h.__s,null!=h.getChildContext&&(t=a(a({},t),h.getChildContext())),v||null==h.getSnapshotBeforeUpdate||(k=h.getSnapshotBeforeUpdate(y,p)),A=null!=s&&s.type===d&&null==s.key?s.props.children:s,w(n,Array.isArray(A)?A:[A],u,i,t,o,r,f,e,c),h.base=u.__e,u.__h=null,h.__h.length&&f.push(h),b&&(h.__E=h.__=null),h.__e=!1}else null==r&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=L(i.__e,u,i,t,o,r,f,c);(s=l.diffed)&&s(u)}catch(n){u.__v=null,(c||null!=r)&&(u.__e=e,u.__h=!!c,r[r.indexOf(e)]=null),l.__e(n,u,i)}}function z(n,u){l.__c&&l.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u)})}catch(n){l.__e(n,u.__v)}})}function L(l,u,i,t,o,r,f,c){var s,a,v,y=i.props,p=u.props,d=u.type,_=0;if("svg"===d&&(o=!0),null!=r)for(;_<r.length;_++)if((s=r[_])&&"setAttribute"in s==!!d&&(d?s.localName===d:3===s.nodeType)){l=s,r[_]=null;break}if(null==l){if(null===d)return document.createTextNode(p);l=o?document.createElementNS("http://www.w3.org/2000/svg",d):document.createElement(d,p.is&&p),r=null,c=!1}if(null===d)y===p||c&&l.data===p||(l.data=p);else{if(r=r&&n.call(l.childNodes),a=(y=i.props||e).dangerouslySetInnerHTML,v=p.dangerouslySetInnerHTML,!c){if(null!=r)for(y={},_=0;_<l.attributes.length;_++)y[l.attributes[_].name]=l.attributes[_].value;(v||a)&&(v&&(a&&v.__html==a.__html||v.__html===l.innerHTML)||(l.innerHTML=v&&v.__html||""))}if(C(l,p,y,o,c),v)u.__k=[];else if(_=u.props.children,w(l,Array.isArray(_)?_:[_],u,i,t,o&&"foreignObject"!==d,r,f,r?r[0]:i.__k&&k(i,0),c),null!=r)for(_=r.length;_--;)null!=r[_]&&h(r[_]);c||("value"in p&&void 0!==(_=p.value)&&(_!==l.value||"progress"===d&&!_||"option"===d&&_!==y.value)&&H(l,"value",_,y.value,!1),"checked"in p&&void 0!==(_=p.checked)&&_!==l.checked&&H(l,"checked",_,y.checked,!1))}return l}function M(n,u,i){try{"function"==typeof n?n(u):n.current=u}catch(n){l.__e(n,i)}}function N(n,u,i){var t,o;if(l.unmount&&l.unmount(n),(t=n.ref)&&(t.current&&t.current!==n.__e||M(t,null,u)),null!=(t=n.__c)){if(t.componentWillUnmount)try{t.componentWillUnmount()}catch(n){l.__e(n,u)}t.base=t.__P=null}if(t=n.__k)for(o=0;o<t.length;o++)t[o]&&N(t[o],u,"function"!=typeof n.type);i||null==n.__e||h(n.__e),n.__e=n.__d=void 0}function O(n,l,u){return this.constructor(n,u)}function S(u,i,t){var o,r,f;l.__&&l.__(u,i),r=(o="function"==typeof t)?null:t&&t.__k||i.__k,f=[],j(i,u=(!o&&t||i).__k=v(d,null,[u]),r||e,e,void 0!==i.ownerSVGElement,!o&&t?[t]:r?null:i.firstChild?n.call(i.childNodes):null,f,!o&&t?t:r?r.__e:i.firstChild,o),z(f,u)}function q(n,l){S(n,l,q)}function B(l,u,i){var t,o,r,f=a({},l.props);for(r in u)"key"==r?t=u[r]:"ref"==r?o=u[r]:f[r]=u[r];return arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):i),y(l.type,f,t||l.key,o||l.ref,null)}function D(n,l){var u={__c:l="__cC"+f++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,i;return this.getChildContext||(u=[],(i={})[l]=this,this.getChildContext=function(){return i},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(m)},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n)}}),n.children}};return u.Provider.__=u.Consumer.contextType=u}n=c.slice,l={__e:function(n,l,u,i){for(var t,o,r;l=l.__;)if((t=l.__c)&&!t.__)try{if((o=t.constructor)&&null!=o.getDerivedStateFromError&&(t.setState(o.getDerivedStateFromError(n)),r=t.__d),null!=t.componentDidCatch&&(t.componentDidCatch(n,i||{}),r=t.__d),r)return t.__E=t}catch(l){n=l}throw n}},u=0,i=function(n){return null!=n&&void 0===n.constructor},_.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=a({},this.state),"function"==typeof n&&(n=n(a({},u),this.props)),n&&a(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),m(this))},_.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),m(this))},_.prototype.render=d,t=[],o="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,g.__r=0,f=0;
//# sourceMappingURL=preact.module.js.map


/***/ }),

/***/ "./src/experiences/exitIntent/node_modules/preact/hooks/dist/hooks.module.js":
/*!***********************************************************************************!*\
  !*** ./src/experiences/exitIntent/node_modules/preact/hooks/dist/hooks.module.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "useCallback": () => (/* binding */ A),
/* harmony export */   "useContext": () => (/* binding */ F),
/* harmony export */   "useDebugValue": () => (/* binding */ T),
/* harmony export */   "useEffect": () => (/* binding */ y),
/* harmony export */   "useErrorBoundary": () => (/* binding */ q),
/* harmony export */   "useImperativeHandle": () => (/* binding */ s),
/* harmony export */   "useLayoutEffect": () => (/* binding */ d),
/* harmony export */   "useMemo": () => (/* binding */ _),
/* harmony export */   "useReducer": () => (/* binding */ p),
/* harmony export */   "useRef": () => (/* binding */ h),
/* harmony export */   "useState": () => (/* binding */ m)
/* harmony export */ });
/* harmony import */ var preact__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! preact */ "./src/experiences/exitIntent/node_modules/preact/dist/preact.module.js");
var t,u,r,o=0,i=[],c=preact__WEBPACK_IMPORTED_MODULE_0__.options.__b,f=preact__WEBPACK_IMPORTED_MODULE_0__.options.__r,e=preact__WEBPACK_IMPORTED_MODULE_0__.options.diffed,a=preact__WEBPACK_IMPORTED_MODULE_0__.options.__c,v=preact__WEBPACK_IMPORTED_MODULE_0__.options.unmount;function l(t,r){preact__WEBPACK_IMPORTED_MODULE_0__.options.__h&&preact__WEBPACK_IMPORTED_MODULE_0__.options.__h(u,t,o||r),o=0;var i=u.__H||(u.__H={__:[],__h:[]});return t>=i.__.length&&i.__.push({}),i.__[t]}function m(n){return o=1,p(w,n)}function p(n,r,o){var i=l(t++,2);return i.t=n,i.__c||(i.__=[o?o(r):w(void 0,r),function(n){var t=i.t(i.__[0],n);i.__[0]!==t&&(i.__=[t,i.__[1]],i.__c.setState({}))}],i.__c=u),i.__}function y(r,o){var i=l(t++,3);!preact__WEBPACK_IMPORTED_MODULE_0__.options.__s&&k(i.__H,o)&&(i.__=r,i.__H=o,u.__H.__h.push(i))}function d(r,o){var i=l(t++,4);!preact__WEBPACK_IMPORTED_MODULE_0__.options.__s&&k(i.__H,o)&&(i.__=r,i.__H=o,u.__h.push(i))}function h(n){return o=5,_(function(){return{current:n}},[])}function s(n,t,u){o=6,d(function(){return"function"==typeof n?(n(t()),function(){return n(null)}):n?(n.current=t(),function(){return n.current=null}):void 0},null==u?u:u.concat(n))}function _(n,u){var r=l(t++,7);return k(r.__H,u)&&(r.__=n(),r.__H=u,r.__h=n),r.__}function A(n,t){return o=8,_(function(){return n},t)}function F(n){var r=u.context[n.__c],o=l(t++,9);return o.c=n,r?(null==o.__&&(o.__=!0,r.sub(u)),r.props.value):n.__}function T(t,u){preact__WEBPACK_IMPORTED_MODULE_0__.options.useDebugValue&&preact__WEBPACK_IMPORTED_MODULE_0__.options.useDebugValue(u?u(t):t)}function q(n){var r=l(t++,10),o=m();return r.__=n,u.componentDidCatch||(u.componentDidCatch=function(n){r.__&&r.__(n),o[1](n)}),[o[0],function(){o[1](void 0)}]}function x(){for(var t;t=i.shift();)if(t.__P)try{t.__H.__h.forEach(g),t.__H.__h.forEach(j),t.__H.__h=[]}catch(u){t.__H.__h=[],preact__WEBPACK_IMPORTED_MODULE_0__.options.__e(u,t.__v)}}preact__WEBPACK_IMPORTED_MODULE_0__.options.__b=function(n){u=null,c&&c(n)},preact__WEBPACK_IMPORTED_MODULE_0__.options.__r=function(n){f&&f(n),t=0;var r=(u=n.__c).__H;r&&(r.__h.forEach(g),r.__h.forEach(j),r.__h=[])},preact__WEBPACK_IMPORTED_MODULE_0__.options.diffed=function(t){e&&e(t);var o=t.__c;o&&o.__H&&o.__H.__h.length&&(1!==i.push(o)&&r===preact__WEBPACK_IMPORTED_MODULE_0__.options.requestAnimationFrame||((r=preact__WEBPACK_IMPORTED_MODULE_0__.options.requestAnimationFrame)||function(n){var t,u=function(){clearTimeout(r),b&&cancelAnimationFrame(t),setTimeout(n)},r=setTimeout(u,100);b&&(t=requestAnimationFrame(u))})(x)),u=null},preact__WEBPACK_IMPORTED_MODULE_0__.options.__c=function(t,u){u.some(function(t){try{t.__h.forEach(g),t.__h=t.__h.filter(function(n){return!n.__||j(n)})}catch(r){u.some(function(n){n.__h&&(n.__h=[])}),u=[],preact__WEBPACK_IMPORTED_MODULE_0__.options.__e(r,t.__v)}}),a&&a(t,u)},preact__WEBPACK_IMPORTED_MODULE_0__.options.unmount=function(t){v&&v(t);var u,r=t.__c;r&&r.__H&&(r.__H.__.forEach(function(n){try{g(n)}catch(n){u=n}}),u&&preact__WEBPACK_IMPORTED_MODULE_0__.options.__e(u,r.__v))};var b="function"==typeof requestAnimationFrame;function g(n){var t=u,r=n.__c;"function"==typeof r&&(n.__c=void 0,r()),u=t}function j(n){var t=u;n.__c=n.__(),u=t}function k(n,t){return!n||n.length!==t.length||t.some(function(t,u){return t!==n[u]})}function w(n,t){return"function"==typeof t?t(n):t}
//# sourceMappingURL=hooks.module.js.map


/***/ }),

/***/ "./src/experiences/exitIntent/node_modules/slapdash/dist/index.js":
/*!************************************************************************!*\
  !*** ./src/experiences/exitIntent/node_modules/slapdash/dist/index.js ***!
  \************************************************************************/
/***/ ((module) => {

var toString = Function.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty
var regexpCharacters = /[\\^$.*+?()[\]{}|]/g
var regexpIsNativeFn = toString.call(hasOwnProperty)
  .replace(regexpCharacters, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?')
var regexpIsNative = RegExp('^' + regexpIsNativeFn + '$')
function toSource (func) {
  if (!func) return ''
  try {
    return toString.call(func)
  } catch (e) {}
  try {
    return (func + '')
  } catch (e) {}
}
var assign = Object.assign
var forEach = Array.prototype.forEach
var every = Array.prototype.every
var filter = Array.prototype.filter
var find = Array.prototype.find
var indexOf = Array.prototype.indexOf
var isArray = Array.isArray
var keys = Object.keys
var map = Array.prototype.map
var reduce = Array.prototype.reduce
var slice = Array.prototype.slice
var some = Array.prototype.some
var values = Object.values
function isNative (method) {
  return method && typeof method === 'function' && regexpIsNative.test(toSource(method))
}
var _ = {
  assign: isNative(assign)
    ? assign
    : function assign (target) {
      var l = arguments.length
      for (var i = 1; i < l; i++) {
        var source = arguments[i]
        for (var j in source) if (source.hasOwnProperty(j)) target[j] = source[j]
      }
      return target
    },
  bind: function bind (method, context) {
    var args = _.slice(arguments, 2)
    return function boundFunction () {
      return method.apply(context, args.concat(_.slice(arguments)))
    }
  },
  debounce: function debounce (func, wait, immediate) {
    var timeout
    return function () {
      var context = this
      var args = arguments
      var later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  },
  each: isNative(forEach)
    ? function nativeEach (array, callback, context) {
      return forEach.call(array, callback, context)
    }
    : function each (array, callback, context) {
      var l = array.length
      for (var i = 0; i < l; i++) callback.call(context, array[i], i, array)
    },
  every: isNative(every)
    ? function nativeEvery (coll, pred, context) {
      return every.call(coll, pred, context)
    }
    : function every (coll, pred, context) {
      if (!coll || !pred) {
        throw new TypeError()
      }
      for (var i = 0; i < coll.length; i++) {
        if (!pred.call(context, coll[i], i, coll)) {
          return false
        }
      }
      return true
    },
  filter: isNative(filter)
    ? function nativeFilter (array, callback, context) {
      return filter.call(array, callback, context)
    }
    : function filter (array, callback, context) {
      var l = array.length
      var output = []
      for (var i = 0; i < l; i++) {
        if (callback.call(context, array[i], i, array)) output.push(array[i])
      }
      return output
    },
  find: isNative(find)
    ? function nativeFind (array, callback, context) {
      return find.call(array, callback, context)
    }
    : function find (array, callback, context) {
      var l = array.length
      for (var i = 0; i < l; i++) {
        if (callback.call(context, array[i], i, array)) return array[i]
      }
    },
  get: function get (object, path) {
    return _.reduce(path.split('.'), function (memo, next) {
      return (typeof memo !== 'undefined' && memo !== null) ? memo[next] : undefined
    }, object)
  },
  identity: function identity (value) {
    return value
  },
  indexOf: isNative(indexOf)
    ? function nativeIndexOf (array, item) {
      return indexOf.call(array, item)
    }
    : function indexOf (array, item) {
      var l = array.length
      for (var i = 0; i < l; i++) {
        if (array[i] === item) return i
      }
      return -1
    },
  invoke: function invoke (array, methodName) {
    var args = _.slice(arguments, 2)
    return _.map(array, function invokeMapper (value) {
      return value[methodName].apply(value, args)
    })
  },
  isArray: isNative(isArray)
    ? function nativeArray (coll) {
      return isArray(coll)
    }
    : function isArray (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]'
    },
  isMatch: function isMatch (obj, spec) {
    for (var i in spec) {
      if (spec.hasOwnProperty(i) && obj[i] !== spec[i]) return false
    }
    return true
  },
  isObject: function isObject (obj) {
    var type = typeof obj
    return type === 'function' || type === 'object' && !!obj
  },
  keys: isNative(keys)
    ? keys
    : function keys (object) {
      var keys = []
      for (var key in object) {
        if (object.hasOwnProperty(key)) keys.push(key)
      }
      return keys
    },
  map: isNative(map)
    ? function nativeMap (array, callback, context) {
      return map.call(array, callback, context)
    }
    : function map (array, callback, context) {
      var l = array.length
      var output = new Array(l)
      for (var i = 0; i < l; i++) {
        output[i] = callback.call(context, array[i], i, array)
      }
      return output
    },
  matches: function matches (spec) {
    return function (obj) {
      return _.isMatch(obj, spec)
    }
  },
  not: function not (value) {
    return !value
  },
  objectEach: function (object, callback, context) {
    return _.each(_.keys(object), function (key) {
      return callback.call(context, object[key], key, object)
    }, context)
  },
  objectMap: function objectMap (object, callback, context) {
    var result = {}
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        result[key] = callback.call(context, object[key], key, object)
      }
    }
    return result
  },
  objectReduce: function objectReduce (object, callback, initialValue) {
    var output = initialValue
    for (var i in object) {
      if (object.hasOwnProperty(i)) output = callback(output, object[i], i, object)
    }
    return output
  },
  pick: function pick (object, toPick) {
    var out = {}
    _.each(toPick, function (key) {
      if (typeof object[key] !== 'undefined') out[key] = object[key]
    })
    return out
  },
  pluck: function pluck (array, key) {
    var l = array.length
    var out = []
    for (var i = 0; i < l; i++) if (array[i]) out[i] = array[i][key]
    return out
  },
  reduce: isNative(reduce)
    ? function nativeReduce (array, callback, initialValue) {
      return reduce.call(array, callback, initialValue)
    }
    : function reduce (array, callback, initialValue) {
      var output = initialValue
      var l = array.length
      for (var i = 0; i < l; i++) output = callback(output, array[i], i, array)
      return output
    },
  set: function set (object, path, val) {
    if (!object) return object
    if (typeof object !== 'object' && typeof object !== 'function') return object
    var parts = path.split('.')
    var context = object
    var nextKey
    do {
      nextKey = parts.shift()
      if (typeof context[nextKey] !== 'object') context[nextKey] = {}
      if (parts.length) {
        context = context[nextKey]
      } else {
        context[nextKey] = val
      }
    } while (parts.length)
    return object
  },
  slice: isNative(slice)
    ? function nativeSlice (array, begin, end) {
      begin = begin || 0
      end = typeof end === 'number' ? end : array.length
      return slice.call(array, begin, end)
    }
    : function slice (array, start, end) {
      start = start || 0
      end = typeof end === 'number' ? end : array.length
      var length = array == null ? 0 : array.length
      if (!length) {
        return []
      }
      if (start < 0) {
        start = -start > length ? 0 : (length + start)
      }
      end = end > length ? length : end
      if (end < 0) {
        end += length
      }
      length = start > end ? 0 : ((end - start) >>> 0)
      start >>>= 0
      var index = -1
      var result = new Array(length)
      while (++index < length) {
        result[index] = array[index + start]
      }
      return result
    },
  some: isNative(some)
    ? function nativeSome (coll, pred, context) {
      return some.call(coll, pred, context)
    }
    : function some (coll, pred, context) {
      if (!coll || !pred) {
        throw new TypeError()
      }
      for (var i = 0; i < coll.length; i++) {
        if (pred.call(context, coll[i], i, coll)) {
          return true
        }
      }
      return false
    },
  unique: function unique (array) {
    return _.reduce(array, function (memo, curr) {
      if (_.indexOf(memo, curr) === -1) {
        memo.push(curr)
      }
      return memo
    }, [])
  },
  values: isNative(values)
    ? values
    : function values (object) {
      var out = []
      for (var key in object) {
        if (object.hasOwnProperty(key)) out.push(object[key])
      }
      return out
    },
  name: 'slapdash',
  version: '1.3.3'
}
_.objectMap.asArray = function objectMapAsArray (object, callback, context) {
  return _.map(_.keys(object), function (key) {
    return callback.call(context, object[key], key, object)
  }, context)
}
module.exports = _


/***/ }),

/***/ "./src/experiences/exitIntent/node_modules/sync-p/index.js":
/*!*****************************************************************!*\
  !*** ./src/experiences/exitIntent/node_modules/sync-p/index.js ***!
  \*****************************************************************/
/***/ ((module) => {

var err = new Error('Error: recurses! infinite promise chain detected')
module.exports = function promise (resolver) {
  var waiting = { res: [], rej: [] }
  var p = {
    'then': then,
    'catch': function thenCatch (onReject) {
      return then(null, onReject)
    }
  }
  try { resolver(resolve, reject) } catch (e) {
    p.status = false
    p.value = e
  }
  return p

  function then (onResolve, onReject) {
    return promise(function (resolve, reject) {
      waiting.res.push(handleNext(p, waiting, onResolve, resolve, reject, onReject))
      waiting.rej.push(handleNext(p, waiting, onReject, resolve, reject, onReject))
      if (typeof p.status !== 'undefined') flush(waiting, p)
    })
  }

  function resolve (val) {
    if (typeof p.status !== 'undefined') return
    if (val === p) throw err
    if (val) try { if (typeof val.then === 'function') return val.then(resolve, reject) } catch (e) {}
    p.status = true
    p.value = val
    flush(waiting, p)
  }

  function reject (val) {
    if (typeof p.status !== 'undefined') return
    if (val === p) throw err
    p.status = false
    p.value = val
    flush(waiting, p)
  }
}

function flush (waiting, p) {
  var queue = p.status ? waiting.res : waiting.rej
  while (queue.length) queue.shift()(p.value)
}

function handleNext (p, waiting, handler, resolve, reject, hasReject) {
  return function next (value) {
    try {
      value = handler ? handler(value) : value
      if (p.status) return resolve(value)
      return hasReject ? resolve(value) : reject(value)
    } catch (err) { reject(err) }
  }
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayLikeToArray)
/* harmony export */ });
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _arrayWithHoles)
/* harmony export */ });
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/extends.js":
/*!************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/extends.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _extends)
/* harmony export */ });
function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _iterableToArrayLimit)
/* harmony export */ });
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _nonIterableRest)
/* harmony export */ });
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/slicedToArray.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _slicedToArray)
/* harmony export */ });
/* harmony import */ var _arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js");
/* harmony import */ var _iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArrayLimit.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableRest.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js");




function _slicedToArray(arr, i) {
  return (0,_arrayWithHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || (0,_iterableToArrayLimit_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr, i) || (0,_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr, i) || (0,_nonIterableRest_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _unsupportedIterableToArray)
/* harmony export */ });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return (0,_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
}

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
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _mapper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mapper */ "./src/mapper/index.js");
/* harmony import */ var _experiences__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./experiences */ "./src/experiences/index.js");


(0,_mapper__WEBPACK_IMPORTED_MODULE_0__["default"])();
_experiences__WEBPACK_IMPORTED_MODULE_1__["default"].forEach(function (experience) {
  return experience();
});
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SyxXQUFXLFdBQVcsS0FBSyxLQUFLLFdBQVcsV0FBVyxLQUFLLEtBQUssVUFBVSxLQUFLLE1BQU0sWUFBWSxXQUFXLFdBQVcsV0FBVyxXQUFXLEtBQUssS0FBSyxLQUFLLFdBQVcsV0FBVyxLQUFLLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFXLFdBQVcsVUFBVSxXQUFXLFVBQVUsV0FBVyxXQUFXLEtBQUssS0FBSyxLQUFLLFVBQVUsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsVUFBVSxLQUFLLEtBQUssS0FBSyxXQUFXLFVBQVUsV0FBVyxLQUFLLEtBQUssS0FBSyxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLEtBQUssTUFBTSxZQUFZLFdBQVcsS0FBSyxLQUFLLEtBQUssV0FBVyxXQUFXLEtBQUssS0FBSyxLQUFLLFVBQVUsS0FBSyxNQUFNLFlBQVksVUFBVSxXQUFXLFVBQVUsV0FBVyxVQUFVLEtBQUssS0FBSyxVQUFVLFVBQVUsS0FBSyxLQUFLLEtBQUssVUFBVSxLQUFLLEtBQUssTUFBTSxZQUFZLFdBQVcsVUFBVSxVQUFVLFdBQVcsV0FBVyxLQUFLLEtBQUssS0FBSyxVQUFVLFdBQVcsS0FBSyxLQUFLLEtBQUssVUFBVSxVQUFVLFdBQVcsS0FBSyxLQUFLLFVBQVUsV0FBVyxLQUFLLEtBQUssV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLEtBQUssVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLEtBQUssS0FBSyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsVUFBVSxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsVUFBVSxLQUFLLEtBQUssVUFBVSxXQUFXLEtBQUssS0FBSyxVQUFVLG9EQUFvRCx1QkFBdUIsT0FBTyxZQUFZLGNBQWMsT0FBTyxXQUFXLHNCQUFzQixPQUFPLFdBQVcsbUJBQW1CLE9BQU8sUUFBUSxtQkFBbUIsT0FBTyxRQUFRLE1BQU0sU0FBUyxvQkFBb0IsaUJBQWlCLGVBQWUsZ0JBQWdCLHdCQUF3QiwrQkFBK0IsbUJBQW1CLGlCQUFpQixrQkFBa0IsS0FBSyxHQUFHLE1BQU0sUUFBUSx1QkFBdUIsZ0JBQWdCLDJCQUEyQixPQUFPLDBCQUEwQixLQUFLLGNBQWMsdUJBQXVCLEtBQUssZUFBZSx5QkFBeUIsa0JBQWtCLHVCQUF1QixrQ0FBa0MsbUNBQW1DLDBCQUEwQix1QkFBdUIsaUJBQWlCLDBCQUEwQixvQkFBb0Isd0JBQXdCLDZCQUE2QixtQkFBbUIsMEJBQTBCLE9BQU8sS0FBSyxjQUFjLGtCQUFrQixtQkFBbUIscUJBQXFCLDBCQUEwQix3QkFBd0Isa0NBQWtDLCtDQUErQyxTQUFTLDBCQUEwQixnQ0FBZ0MsK0JBQStCLDhCQUE4QixPQUFPLEtBQUssZUFBZSxrQ0FBa0Msd0JBQXdCLEtBQUssZ0JBQWdCLGtDQUFrQyx3QkFBd0IsS0FBSyxZQUFZLHFCQUFxQixLQUFLLEdBQUcsTUFBTSxpQkFBaUIsd0JBQXdCLHFEQUFxRCx1QkFBdUIsa0NBQWtDLHVCQUF1QiwrQkFBK0Isa0NBQWtDLG9DQUFvQyxLQUFLLGVBQWUsMkJBQTJCLEtBQUssY0FBYyx5QkFBeUIsdUJBQXVCLHNCQUFzQix3QkFBd0IscUJBQXFCLHlCQUF5QiwwQkFBMEIsaUNBQWlDLHdCQUF3QiwwQkFBMEIsMkJBQTJCLDRCQUE0QixPQUFPLEtBQUssaUJBQWlCLHlCQUF5Qix1QkFBdUIsc0JBQXNCLHdCQUF3Qix5QkFBeUIsa0NBQWtDLHFCQUFxQixpQ0FBaUMseUJBQXlCLHdCQUF3QiwwQkFBMEIsT0FBTyxLQUFLLGNBQWMsbUNBQW1DLDhCQUE4QixvQkFBb0Isa0JBQWtCLG1CQUFtQix5QkFBeUIsZ0JBQWdCLGtCQUFrQixxQkFBcUIscUJBQXFCLEtBQUssR0FBRyxNQUFNLGdCQUFnQix1QkFBdUIsd0JBQXdCLCtCQUErQiwwQkFBMEIsMkJBQTJCLEtBQUssZUFBZSxvQkFBb0IsS0FBSyxHQUFHLE1BQU0sYUFBYSx1QkFBdUIsYUFBYSxnQ0FBZ0MsaUJBQWlCLHVCQUF1QixvQkFBb0IsYUFBYSxrQkFBa0IsbUJBQW1CLEtBQUssK0JBQStCLG9CQUFvQixLQUFLLEdBQUcsTUFBTSxhQUFhLHdCQUF3Qiw4QkFBOEIsa0JBQWtCLGtCQUFrQixtQ0FBbUMsMEJBQTBCLCtCQUErQixvQkFBb0IsdUJBQXVCLEtBQUssY0FBYyxpQkFBaUIsb0JBQW9CLDBCQUEwQixXQUFXLHdCQUF3Qix5QkFBeUIsT0FBTyxLQUFLLGdCQUFnQiw4QkFBOEIsb0JBQW9CLDZCQUE2QixxQ0FBcUMsdUJBQXVCLGlDQUFpQywyQkFBMkIsT0FBTyxLQUFLLGNBQWMsc0JBQXNCLDBCQUEwQix5QkFBeUIsdUJBQXVCLHNCQUFzQix3QkFBd0IsNEJBQTRCLHFCQUFxQixLQUFLLGtCQUFrQix5QkFBeUIsdUJBQXVCLHNCQUFzQix3QkFBd0Isa0NBQWtDLHFCQUFxQixpQkFBaUIsc0NBQXNDLE9BQU8sS0FBSyxrQkFBa0IseUJBQXlCLHVCQUF1QixzQkFBc0Isd0JBQXdCLGtDQUFrQyxvQkFBb0Isc0JBQXNCLEtBQUssb0JBQW9CLHFCQUFxQiwwQkFBMEIsS0FBSyxvQkFBb0IscUJBQXFCLEtBQUssR0FBRyxtQkFBbUI7QUFDbHZXO0FBQ0EsaUVBQWUsdUJBQXVCLEVBQUM7Ozs7Ozs7Ozs7OztBQ1AxQjs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCOztBQUVqQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFEQUFxRDtBQUNyRDs7QUFFQTtBQUNBLGdEQUFnRDtBQUNoRDs7QUFFQTtBQUNBLHFGQUFxRjtBQUNyRjs7QUFFQTs7QUFFQTtBQUNBLHFCQUFxQjtBQUNyQjs7QUFFQTtBQUNBLHFCQUFxQjtBQUNyQjs7QUFFQTtBQUNBLHFCQUFxQjtBQUNyQjs7QUFFQTtBQUNBLEtBQUs7QUFDTCxLQUFLOzs7QUFHTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLHNCQUFzQixpQkFBaUI7QUFDdkM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQkFBcUIscUJBQXFCO0FBQzFDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Ysc0ZBQXNGLHFCQUFxQjtBQUMzRztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWLGlEQUFpRCxxQkFBcUI7QUFDdEU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixzREFBc0QscUJBQXFCO0FBQzNFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7QUNyR2E7O0FBRWI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdURBQXVELGNBQWM7QUFDckU7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7OztBQ3JCQSxpQkFBaUIsbUJBQU8sQ0FBQyw0REFBYyxFQUFFLG1CQUFPLENBQUMsNEVBQXNCOzs7Ozs7Ozs7OztBQ0F2RSxRQUFRLG1CQUFPLENBQUMsdURBQVU7QUFDMUIsZUFBZSxtQkFBTyxDQUFDLDREQUFZO0FBQ25DLGFBQWEsbUJBQU8sQ0FBQyx3REFBVTtBQUMvQix1QkFBdUIsbUJBQU8sQ0FBQyx3RkFBMEI7QUFDekQsY0FBYyxtQkFBTyxDQUFDLHNFQUFpQjtBQUN2Qzs7QUFFQTtBQUNBLHNCQUFzQjs7QUFFdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25CLG1CQUFtQixJQUFJLGVBQWU7QUFDdEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0JBQXdCLHlCQUF5QjtBQUNqRDtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZ0JBQWdCLGlDQUFpQztBQUNqRDtBQUNBOzs7Ozs7Ozs7OztBQ1JBLFFBQVEsbUJBQU8sQ0FBQyx1REFBVTtBQUMxQixhQUFhLG1CQUFPLENBQUMseURBQVc7QUFDaEMsZUFBZSxtQkFBTyxDQUFDLHlFQUFtQjtBQUMxQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLGlDQUFpQztBQUMzRDtBQUNBLDBCQUEwQixvQkFBb0I7QUFDOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUM3R0EsUUFBUSxtQkFBTyxDQUFDLHVEQUFVO0FBQzFCLFdBQVcsbUJBQU8sQ0FBQyw4REFBYTtBQUNoQyxjQUFjLG1CQUFPLENBQUMsMERBQVc7QUFDakMsYUFBYSxtQkFBTyxDQUFDLHdEQUFVOztBQUUvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUM3Q0EsUUFBUSxtQkFBTyxDQUFDLHVEQUFVOztBQUUxQjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsd0JBQXdCLFlBQVk7QUFDcEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDdENBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixvQkFBb0I7QUFDeEM7QUFDQTs7Ozs7Ozs7Ozs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ1BBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSSxLQUE2QjtBQUNqQztBQUNBLEVBQUUsU0FBUyxJQUEwQztBQUNyRCxFQUFFLG1DQUFPO0FBQ1Q7QUFDQSxHQUFHO0FBQUEsa0dBQUM7QUFDSixFQUFFLEtBQUssRUFFTjs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDckVBO0FBQ0E7QUFDQSx3Q0FBd0M7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGlCQUFpQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixPQUFPO0FBQzNCO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsaUJBQWlCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOzs7Ozs7Ozs7OztBQ3RUQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsNEJBQTRCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHVFQUF1RTtBQUMxRjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sY0FBYztBQUNwQjtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQkFBa0Isa0JBQWtCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGdGQUFnRjtBQUNoRjtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxNQUFNO0FBQ047QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyx3QkFBd0I7QUFDL0I7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLGlCQUFpQjs7QUFFakI7QUFDQTtBQUNBO0FBQ0EsMEVBQTBFLDBCQUEwQjtBQUNwRyxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGlCQUFpQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0Is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Q0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7O0FDTkE7QUFDQTtBQUVBQyxtREFBTTtBQUNOQyw0REFBQSxDQUFvQixVQUFBakMsVUFBVTtFQUFBLE9BQUlBLFVBQVUsRUFBZDtBQUFBLENBQTlCLEUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AcXViaXQvcG9sbGVyL2xpYi9jcmVhdGUuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQHF1Yml0L3BvbGxlci9saWIvZXZhbHVhdGUuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQHF1Yml0L3BvbGxlci9saWIvb2JzZXJ2ZXIuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQHF1Yml0L3BvbGxlci9saWIvcmFmLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BxdWJpdC9wb2xsZXIvbGliL3ZhbGlkX2ZyYW1lLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BxdWJpdC9wb2xsZXIvbGliL3ZhbGlkYXRlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BxdWJpdC9wb2xsZXIvcG9sbGVyLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9jb3VudGRvd25CYW5uZXIvdHJpZ2dlcnMuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL3ZhcmlhdGlvbi5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9jcmVhdGVFeHBlcmllbmNlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC90cmlnZ2Vycy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L3ZhcmlhdGlvbi5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9vcHRpb25zLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL21hcHBlci9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9jb3VudGRvd25CYW5uZXIvdmFyaWF0aW9uLmxlc3MiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC92YXJpYXRpb24ubGVzcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9kcmlmdHdvb2QvYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9kcmlmdHdvb2Qvc3JjL2NyZWF0ZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9kcmlmdHdvb2Qvc3JjL2xldmVscy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9kcmlmdHdvb2Qvc3JjL2xvZ2dlci9icm93c2VyLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9zcmMvcGF0dGVybnMuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvZHJpZnR3b29kL3NyYy9zdG9yYWdlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9zcmMvdXRpbHMvYXJnc1RvQ29tcG9uZW50cy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9kcmlmdHdvb2Qvc3JjL3V0aWxzL2NvbXBvc2UuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvZHJpZnR3b29kL3NyYy91dGlscy9yaWdodFBhZC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9qc29uLWJvdXJuZS9qc29uLWJvdXJuZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9zbGFwZGFzaC9kaXN0L2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci92YXJpYXRpb24ubGVzcz8zYWM4Iiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvdmFyaWF0aW9uLmxlc3M/ZmVkNCIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL3N5bmMtcC9kZWZlci5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9zeW5jLXAvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL25vZGVfbW9kdWxlcy9AcXViaXQvdXRpbHMvZG9tL2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci9ub2RlX21vZHVsZXMvQHF1Yml0L3V0aWxzL2xpYi9vbmNlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci9ub2RlX21vZHVsZXMvQHF1Yml0L3V0aWxzL2xpYi9wcm9taXNlZC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9jb3VudGRvd25CYW5uZXIvbm9kZV9tb2R1bGVzL0BxdWJpdC91dGlscy9saWIvd2l0aFJlc3RvcmVBbGwuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL25vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QubW9kdWxlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci9ub2RlX21vZHVsZXMvcHJlYWN0L2hvb2tzL2Rpc3QvaG9va3MubW9kdWxlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci9ub2RlX21vZHVsZXMvc2xhcGRhc2gvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9jb3VudGRvd25CYW5uZXIvbm9kZV9tb2R1bGVzL3N5bmMtcC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L25vZGVfbW9kdWxlcy9AZ2xpZGVqcy9nbGlkZS9kaXN0L2dsaWRlLmVzbS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L25vZGVfbW9kdWxlcy9AcXViaXQvY2hlY2stZXhpdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L25vZGVfbW9kdWxlcy9AcXViaXQvY2hlY2staW5hY3Rpdml0eS9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L25vZGVfbW9kdWxlcy9AcXViaXQvdXRpbHMvZG9tL2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BxdWJpdC91dGlscy9saWIvb25jZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L25vZGVfbW9kdWxlcy9AcXViaXQvdXRpbHMvbGliL3Byb21pc2VkLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BxdWJpdC91dGlscy9saWIvd2l0aFJlc3RvcmVBbGwuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC9ub2RlX21vZHVsZXMvcHJlYWN0L2Rpc3QvcHJlYWN0Lm1vZHVsZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L25vZGVfbW9kdWxlcy9wcmVhY3QvaG9va3MvZGlzdC9ob29rcy5tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC9ub2RlX21vZHVsZXMvc2xhcGRhc2gvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L25vZGVfbW9kdWxlcy9zeW5jLXAvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vYXJyYXlMaWtlVG9BcnJheS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9hcnJheVdpdGhIb2xlcy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9leHRlbmRzLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2l0ZXJhYmxlVG9BcnJheUxpbWl0LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL25vbkl0ZXJhYmxlUmVzdC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9zbGljZWRUb0FycmF5LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIGRyaWZ0d29vZCA9IHJlcXVpcmUoJ2RyaWZ0d29vZCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlICh0YXJnZXRzLCBvcHRpb25zKSB7XG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSh0YXJnZXRzKVxuICByZXR1cm4ge1xuICAgIHRhcmdldHM6IGlzQXJyYXkgPyB0YXJnZXRzIDogW3RhcmdldHNdLFxuICAgIGV2YWx1YXRlZDogW10sXG4gICAgaXNTaW5nbGV0b246ICFpc0FycmF5LFxuICAgIHJlc29sdmU6IG9wdGlvbnMucmVzb2x2ZSxcbiAgICByZWplY3Q6IG9wdGlvbnMucmVqZWN0LFxuICAgIGxvZ2dlcjogb3B0aW9ucy5sb2dnZXIgfHwgZHJpZnR3b29kKCdwb2xsZXInKSxcbiAgICB0aW1lb3V0OiBvcHRpb25zLnRpbWVvdXQsXG4gICAgc3RvcE9uRXJyb3I6IG9wdGlvbnMuc3RvcE9uRXJyb3IsXG4gICAgcXVlcnlBbGw6IG9wdGlvbnMucXVlcnlBbGxcbiAgfVxufVxuIiwidmFyIGdldCA9IHJlcXVpcmUoJ3NsYXBkYXNoJykuZ2V0XG52YXIgdW5kZWYgPSB2b2lkIDBcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBldmFsdWF0ZSAodGFyZ2V0LCBxdWVyeUFsbCkge1xuICBpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHRhcmdldCgpIHx8IHVuZGVmXG4gIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnc3RyaW5nJyAmJiB0YXJnZXQuaW5kZXhPZignd2luZG93LicpID09PSAwKSByZXR1cm4gZ2V0KHdpbmRvdywgdGFyZ2V0KVxuICBpZiAocXVlcnlBbGwpIHtcbiAgICB2YXIgaXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRhcmdldClcbiAgICByZXR1cm4gaXRlbXMubGVuZ3RoID8gaXRlbXMgOiB1bmRlZlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCkgfHwgdW5kZWZcbiAgfVxufVxuIiwidmFyIF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlT2JzZXJ2ZXIgKGNiKSB7XG4gIHZhciBPYnNlcnZlciA9IHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyIHx8IHdpbmRvdy5XZWJLaXRNdXRhdGlvbk9ic2VydmVyXG4gIHZhciBzdXBwb3J0ZWQgPSBCb29sZWFuKE9ic2VydmVyICYmICFpc1RyaWRlbnQoKSlcbiAgdmFyIGRpc2FibGVkID0gIXN1cHBvcnRlZFxuICB2YXIgbW9ic2VydmVyID0gc3VwcG9ydGVkICYmIG5ldyBPYnNlcnZlcihjYilcbiAgdmFyIGFjdGl2ZSA9IGZhbHNlXG5cbiAgZnVuY3Rpb24gZW5hYmxlICgpIHtcbiAgICBpZiAoc3VwcG9ydGVkKSBkaXNhYmxlZCA9IGZhbHNlXG4gIH1cblxuICBmdW5jdGlvbiBkaXNhYmxlICgpIHtcbiAgICBzdG9wKClcbiAgICBkaXNhYmxlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0ICgpIHtcbiAgICBpZiAoYWN0aXZlIHx8IGRpc2FibGVkKSByZXR1cm5cbiAgICBtb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHtcbiAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgIHN1YnRyZWU6IHRydWVcbiAgICB9KVxuICAgIGFjdGl2ZSA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3AgKCkge1xuICAgIGlmICghYWN0aXZlIHx8IGRpc2FibGVkKSByZXR1cm5cbiAgICBtb2JzZXJ2ZXIuZGlzY29ubmVjdCgpXG4gICAgYWN0aXZlID0gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZW5hYmxlOiBlbmFibGUsXG4gICAgZGlzYWJsZTogZGlzYWJsZSxcbiAgICBzdGFydDogc3RhcnQsXG4gICAgc3RvcDogc3RvcFxuICB9XG59XG5cbmZ1bmN0aW9uIGlzVHJpZGVudCAoKSB7XG4gIHZhciBhZ2VudCA9IF8uZ2V0KHdpbmRvdywgJ25hdmlnYXRvci51c2VyQWdlbnQnKSB8fCAnJ1xuICByZXR1cm4gYWdlbnQuaW5kZXhPZignVHJpZGVudC83LjAnKSA+IC0xXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJhZiAoZm4pIHtcbiAgcmV0dXJuIGdldFJhZigpKGZuKVxufVxuXG5mdW5jdGlvbiBnZXRSYWYgKCkge1xuICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgZGVmZXJcbn1cblxuZnVuY3Rpb24gZGVmZXIgKGNhbGxiYWNrKSB7XG4gIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAwKVxufVxuIiwidmFyIGluZGV4T2YgPSByZXF1aXJlKCdzbGFwZGFzaCcpLmluZGV4T2ZcbnZhciBGUFMgPSA2MFxuXG5mdW5jdGlvbiB2YWxpZEZyYW1lICh0aWNrQ291bnQpIHtcbiAgcmV0dXJuIGluZGV4T2YoZ2V0VmFsaWRGcmFtZXMoKSwgdGlja0NvdW50ICUgRlBTKSAhPT0gLTFcbn1cblxuZnVuY3Rpb24gZ2V0VmFsaWRGcmFtZXMgKCkge1xuICByZXR1cm4gWzEsIDIsIDMsIDUsIDgsIDEzLCAyMSwgMzQsIDU1XVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHZhbGlkRnJhbWVcbm1vZHVsZS5leHBvcnRzLmdldFZhbGlkRnJhbWVzID0gZ2V0VmFsaWRGcmFtZXNcbiIsInZhciBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHZhbGlkYXRlICh0YXJnZXRzLCBvcHRpb25zKSB7XG4gIGlmIChhcmVUYXJnZXRzSW52YWxpZCh0YXJnZXRzKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdQb2xsZXI6IEV4cGVjdGVkIGZpcnN0IGFyZ3VtZW50IHRvIGJlIGEgc2VsZWN0b3Igc3RyaW5nICcgK1xuICAgICAgJ29yIGFycmF5IGNvbnRhaW5pbmcgc2VsZWN0b3JzLCB3aW5kb3cgdmFyaWFibGVzIG9yIGZ1bmN0aW9ucy4nXG4gICAgKVxuICB9XG4gIGlmIChvcHRpb25zICE9PSB2b2lkIDApIHtcbiAgICB2YXIgb3B0aW9uc0lzRnVuY3Rpb24gPSB0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJ1xuICAgIGlmIChvcHRpb25zSXNGdW5jdGlvbiB8fCAhXy5pc09iamVjdChvcHRpb25zKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnUG9sbGVyOiBFeHBlY3RlZCBzZWNvbmQgYXJndW1lbnQgdG8gYmUgYW4gb3B0aW9ucyBvYmplY3QuICcgK1xuICAgICAgICAnUG9sbGVyIGhhcyBhIG5ldyBBUEksIHNlZSBodHRwczovL2RvY3MucXViaXQuY29tL2NvbnRlbnQvZGV2ZWxvcGVycy9leHBlcmllbmNlcy1wb2xsZXInXG4gICAgICApXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFyZVRhcmdldHNJbnZhbGlkICh0YXJnZXRzKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHRhcmdldHMpKSB7XG4gICAgcmV0dXJuICEhXy5maW5kKHRhcmdldHMsIGlzSW52YWxpZFR5cGUpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGlzSW52YWxpZFR5cGUodGFyZ2V0cylcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0ludmFsaWRUeXBlICh0YXJnZXQpIHtcbiAgdmFyIHRhcmdldFR5cGUgPSB0eXBlb2YgdGFyZ2V0XG4gIHJldHVybiB0YXJnZXRUeXBlICE9PSAnc3RyaW5nJyAmJiB0YXJnZXRUeXBlICE9PSAnZnVuY3Rpb24nXG59XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcbnZhciBkZWZlciA9IHJlcXVpcmUoJ3N5bmMtcC9kZWZlcicpXG52YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcmVxdWlyZSgnLi9saWIvcmFmJylcbnZhciB2YWxpZEZyYW1lID0gcmVxdWlyZSgnLi9saWIvdmFsaWRfZnJhbWUnKVxudmFyIGNyZWF0ZU9ic2VydmVyID0gcmVxdWlyZSgnLi9saWIvb2JzZXJ2ZXInKVxudmFyIGV2YWx1YXRlID0gcmVxdWlyZSgnLi9saWIvZXZhbHVhdGUnKVxudmFyIHZhbGlkYXRlID0gcmVxdWlyZSgnLi9saWIvdmFsaWRhdGUnKVxudmFyIGNyZWF0ZSA9IHJlcXVpcmUoJy4vbGliL2NyZWF0ZScpXG52YXIgbG9nZ2VyID0gcmVxdWlyZSgnZHJpZnR3b29kJykoJ3BvbGxlcicpXG5cbi8qKlxuICogQ29uc3RhbnRzIC0gdGhlc2UgYXJlIG5vdCBjb25maWd1cmFibGUgdG9cbiAqIG1ha2UgcG9sbGluZyBtb3JlIGVmZmljaWVudCBieSByZXVzaW5nIHRoZVxuICogc2FtZSBnbG9iYWwgdGltZW91dC5cbiAqL1xudmFyIElOSVRJQUxfVElDSyA9IE1hdGgucm91bmQoMTAwMCAvIDYwKSAvLyBUaGUgaW5pdGlhbCB0aWNrIGludGVydmFsIGR1cmF0aW9uIGJlZm9yZSB3ZSBzdGFydCBiYWNraW5nIG9mZiAobXMpXG52YXIgSU5DUkVBU0VfUkFURSA9IDEuNSAvLyBUaGUgYmFja29mZiBtdWx0aXBsaWVyXG52YXIgQkFDS09GRl9USFJFU0hPTEQgPSBNYXRoLnJvdW5kKCgzICogMTAwMCkgLyAoMTAwMCAvIDYwKSkgLy8gSG93IG1hbnkgdGlja3MgYmVmb3JlIHdlIHN0YXJ0IGJhY2tpbmcgb2ZmXG52YXIgREVGQVVMVFMgPSB7XG4gIGxvZ2dlcjogbG9nZ2VyLFxuICB0aW1lb3V0OiAxNTAwMCwgLy8gSG93IGxvbmcgYmVmb3JlIHdlIHN0b3AgcG9sbGluZyAobXMpXG4gIHN0b3BPbkVycm9yOiBmYWxzZSAvLyBXaGV0aGVyIHRvIHN0b3AgYW5kIHRocm93IGFuIGVycm9yIGlmIHRoZSBldmF1bGF0aW9uIHRocm93c1xufVxuLyoqXG4gKiBHbG9iYWxzXG4gKi9cbnZhciB0aWNrQ291bnQsIGN1cnJlbnRUaWNrRGVsYXlcbnZhciBxdWV1ZSA9IFtdXG52YXIgb2JzZXJ2ZXIgPSBjcmVhdGVPYnNlcnZlcih0b2NrKVxuXG4vKipcbiAqIE1haW4gcG9sbGVyIG1ldGhvZCB0byByZWdpc3RlciAndGFyZ2V0cycgdG8gcG9sbCBmb3JcbiAqIGFuZCBhIGNhbGxiYWNrIHdoZW4gYWxsIHRhcmdldHMgdmFsaWRhdGVkIGFuZCBjb21wbGV0ZVxuICogJ3RhcmdldHMnIGNhbiBiZSBvbmUgb2YgdGhlIGZvbGxvd2luZyBmb3JtYXRzOlxuICogICAtIGEgc2VsZWN0b3Igc3RyaW5nIGUuZy4gJ2JvZHkgPiBzcGFuLmdyaWQxNSdcbiAqICAgLSBhIHdpbmRvdyB2YXJpYWJsZSBmb3JtYXR0ZWQgYXMgYSBzdHJpbmcgZS5nLiAnd2luZG93LnVuaXZlcnNhbF92YXJpYWJsZSdcbiAqICAgLSBhIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYSBjb25kaXRpb24gZm9yIHdoaWNoIHRvIHN0b3AgdGhlIHBvbGxpbmcgZS5nLlxuICogICAgIGZ1bmN0aW9uICgpIHtcbiAqICAgICAgIHJldHVybiAkKCcuc29tZS1jbGFzcycpLmxlbmd0aCA9PT0gMlxuICogICAgIH1cbiAqICAgLSBhbiBhcnJheSBvZiBhbnkgb2YgdGhlIGFib3ZlIGZvcm1hdHNcbiAqL1xuXG5mdW5jdGlvbiBwb2xsZXIgKHRhcmdldHMsIG9wdHMpIHtcbiAgdmFyIG9wdGlvbnMgPSBfLmFzc2lnbih7fSwgREVGQVVMVFMsIG9wdHMsIGRlZmVyKCkpXG5cbiAgdHJ5IHtcbiAgICB2YWxpZGF0ZSh0YXJnZXRzLCBvcHRzKVxuXG4gICAgdmFyIGl0ZW0gPSBjcmVhdGUodGFyZ2V0cywgb3B0aW9ucylcblxuICAgIHN0YXJ0KClcblxuICAgIHJldHVybiB7XG4gICAgICBzdGFydDogc3RhcnQsXG4gICAgICBzdG9wOiBzdG9wLFxuICAgICAgdGhlbjogb3B0aW9ucy5wcm9taXNlLnRoZW4sXG4gICAgICBjYXRjaDogb3B0aW9ucy5wcm9taXNlLmNhdGNoXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ0Vycm9yKGVycm9yLCBvcHRpb25zKVxuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnQgKCkge1xuICAgIHJlZ2lzdGVyKGl0ZW0pXG4gICAgcmV0dXJuIG9wdGlvbnMucHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gc3RvcCAoKSB7XG4gICAgcmV0dXJuIHVucmVnaXN0ZXIoaXRlbSlcbiAgfVxufVxuXG5mdW5jdGlvbiB0aWNrICgpIHtcbiAgdGlja0NvdW50ICs9IDFcbiAgdmFyIG5leHQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgdmFyIHNob3VsZEJhY2tvZmYgPSB0aWNrQ291bnQgPj0gQkFDS09GRl9USFJFU0hPTERcbiAgaWYgKHNob3VsZEJhY2tvZmYpIHtcbiAgICBjdXJyZW50VGlja0RlbGF5ID0gY3VycmVudFRpY2tEZWxheSAqIElOQ1JFQVNFX1JBVEVcbiAgICBuZXh0ID0gd2luZG93LnNldFRpbWVvdXRcbiAgfVxuICBpZiAoc2hvdWxkQmFja29mZiB8fCB2YWxpZEZyYW1lKHRpY2tDb3VudCkpIHtcbiAgICB0b2NrKClcbiAgfVxuICBpZiAoIWlzQWN0aXZlKCkpIHJldHVyblxuICByZXR1cm4gbmV4dCh0aWNrLCBjdXJyZW50VGlja0RlbGF5KVxufVxuXG4vKipcbiAqIExvb3AgdGhyb3VnaCBhbGwgcmVnaXN0ZXJlZCBpdGVtcywgcG9sbGluZyBmb3Igc2VsZWN0b3JzIG9yIGV4ZWN1dGluZyBmaWx0ZXIgZnVuY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIHRvY2sgKCkge1xuICB2YXIgcmVhZHkgPSBfLmZpbHRlcihxdWV1ZSwgZXZhbHVhdGVRdWV1ZSlcblxuICB3aGlsZSAocmVhZHkubGVuZ3RoKSByZXNvbHZlKHJlYWR5LnBvcCgpKVxuXG4gIGZ1bmN0aW9uIGV2YWx1YXRlUXVldWUgKGl0ZW0pIHtcbiAgICB2YXIgaSwgcmVzdWx0XG4gICAgdmFyIGNhY2hlSW5kZXggPSBpdGVtLmV2YWx1YXRlZC5sZW5ndGhcbiAgICB0cnkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IGl0ZW0udGFyZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaSA+PSBpdGVtLmV2YWx1YXRlZC5sZW5ndGgpIHtcbiAgICAgICAgICByZXN1bHQgPSBldmFsdWF0ZShpdGVtLnRhcmdldHNbaV0sIGl0ZW0ucXVlcnlBbGwpXG4gICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBpdGVtLmxvZ2dlci5pbmZvKCdQb2xsZXI6IHJlc29sdmVkICcgKyBTdHJpbmcoaXRlbS50YXJnZXRzW2ldKSlcbiAgICAgICAgICAgIGl0ZW0uZXZhbHVhdGVkLnB1c2gocmVzdWx0KVxuICAgICAgICAgIH0gZWxzZSBpZiAoKG5ldyBEYXRlKCkgLSBpdGVtLnN0YXJ0KSA+PSBpdGVtLnRpbWVvdXQpIHtcbiAgICAgICAgICAgIC8vIEl0ZW0gaGFzIHRpbWVkIG91dCwgcmVzb2x2ZSBpdGVtXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBDYW5ub3QgcmVzb2x2ZSBpdGVtLCBleGl0XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRXZlcnl0aGluZyBoYXMgYmVlbiBmb3VuZCwgbGV0cyByZS1ldmFsdWF0ZSBjYWNoZWQgZW50cmllc1xuICAgICAgLy8gdG8gbWFrZSBzdXJlIHRoZXkgaGF2ZSBub3QgZ29uZSBzdGFsZVxuICAgICAgZm9yIChpID0gMDsgaSA8IGNhY2hlSW5kZXg7IGkrKykge1xuICAgICAgICByZXN1bHQgPSBldmFsdWF0ZShpdGVtLnRhcmdldHNbaV0sIGl0ZW0ucXVlcnlBbGwpXG4gICAgICAgIGlmICh0eXBlb2YgcmVzdWx0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGl0ZW0uZXZhbHVhdGVkID0gaXRlbS5ldmFsdWF0ZWQuc2xpY2UoMCwgaSlcbiAgICAgICAgICBpdGVtLmxvZ2dlci5pbmZvKCdQb2xsZXI6IGl0ZW0gd2VudCBzdGFsZTogJyArIFN0cmluZyhpdGVtLnRhcmdldHNbaV0pKVxuICAgICAgICAgIC8vIENhbm5vdCByZXNvbHZlIGl0ZW0sIGV4aXRcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtLmV2YWx1YXRlZFtpXSA9IHJlc3VsdFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEFsbCB0YXJnZXRzIGV2YWx1YXRlZCwgYWRkIHRvIHJlc29sdmVkIGxpc3RcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGxvZ0Vycm9yKGVycm9yLCBpdGVtKVxuICAgICAgLy8gQ2Fubm90IHJlc29sdmUgaXRlbSwgZXhpdFxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0ICgpIHtcbiAgdGlja0NvdW50ID0gMFxuICBjdXJyZW50VGlja0RlbGF5ID0gSU5JVElBTF9USUNLXG59XG5cbmZ1bmN0aW9uIHJlc2V0ICgpIHtcbiAgaW5pdCgpXG4gIG9ic2VydmVyLnN0b3AoKVxuICBxdWV1ZSA9IFtdXG59XG5cbmZ1bmN0aW9uIGlzQWN0aXZlICgpIHtcbiAgcmV0dXJuICEhcXVldWUubGVuZ3RoXG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyIChpdGVtKSB7XG4gIHZhciBhY3RpdmUgPSBpc0FjdGl2ZSgpXG5cbiAgaW5pdCgpXG5cbiAgaXRlbS5zdGFydCA9IG5ldyBEYXRlKClcblxuICBxdWV1ZSA9IF8uZmlsdGVyKHF1ZXVlLCBmdW5jdGlvbiAoaSkge1xuICAgIHJldHVybiBpICE9PSBpdGVtXG4gIH0pXG5cbiAgcXVldWUucHVzaChpdGVtKVxuXG4gIGlmICghYWN0aXZlKSB7XG4gICAgaXRlbS5sb2dnZXIuaW5mbygnUG9sbGVyOiBzdGFydGVkJylcbiAgICB0aWNrKClcbiAgICBvYnNlcnZlci5zdGFydCgpXG4gIH1cbn1cblxuZnVuY3Rpb24gdW5yZWdpc3RlciAoaXRlbSkge1xuICBxdWV1ZSA9IF8uZmlsdGVyKHF1ZXVlLCBmdW5jdGlvbiAoaSkge1xuICAgIHJldHVybiBpICE9PSBpdGVtXG4gIH0pXG4gIGlmICghaXNBY3RpdmUoKSkge1xuICAgIG9ic2VydmVyLnN0b3AoKVxuICB9XG4gIHJldHVybiBpdGVtLnRhcmdldHNbaXRlbS5ldmFsdWF0ZWQubGVuZ3RoXVxufVxuXG5mdW5jdGlvbiByZXNvbHZlIChpdGVtKSB7XG4gIHZhciByZW1haW5kZXIgPSB1bnJlZ2lzdGVyKGl0ZW0pXG4gIGlmIChyZW1haW5kZXIpIHtcbiAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3IoJ1BvbGxlcjogY291bGQgbm90IHJlc29sdmUgJyArIFN0cmluZyhyZW1haW5kZXIpKVxuICAgIGVycm9yLmNvZGUgPSAnRVBPTExFUjpUSU1FT1VUJ1xuICAgIGl0ZW0ubG9nZ2VyLmluZm8oZXJyb3IubWVzc2FnZSlcbiAgICBpdGVtLnJlamVjdChlcnJvcilcbiAgfSBlbHNlIHtcbiAgICB2YXIgZXZhbHVhdGVkID0gaXRlbS5pc1NpbmdsZXRvblxuICAgICAgPyBpdGVtLmV2YWx1YXRlZFswXVxuICAgICAgOiBpdGVtLmV2YWx1YXRlZFxuICAgIGl0ZW0ucmVzb2x2ZShldmFsdWF0ZWQpXG4gIH1cblxuICBpZiAoIWlzQWN0aXZlKCkpIHtcbiAgICBpdGVtLmxvZ2dlci5pbmZvKCdQb2xsZXI6IGNvbXBsZXRlJylcbiAgfVxufVxuXG5mdW5jdGlvbiBsb2dFcnJvciAoZXJyb3IsIG9wdGlvbnMpIHtcbiAgZXJyb3IuY29kZSA9ICdFUE9MTEVSJ1xuICBpZiAob3B0aW9ucy5sb2dnZXIpIG9wdGlvbnMubG9nZ2VyLmVycm9yKGVycm9yKVxuICBpZiAob3B0aW9ucy5zdG9wT25FcnJvcikgdGhyb3cgZXJyb3Jcbn1cblxucG9sbGVyLmlzQWN0aXZlID0gaXNBY3RpdmVcbnBvbGxlci5yZXNldCA9IHJlc2V0XG5cbnBvbGxlci5sb2dnZXIgPSBsb2dnZXJcbnBvbGxlci5kaXNhYmxlTXV0YXRpb25PYnNlcnZlciA9IG9ic2VydmVyLmRpc2FibGVcbnBvbGxlci5kZWZhdWx0cyA9IGZ1bmN0aW9uIChuZXdEZWZhdWx0cykge1xuICBfLmFzc2lnbihERUZBVUxUUywgbmV3RGVmYXVsdHMpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gcG9sbGVyXG4iLCJpbXBvcnQgdHJpZ2dlcnMgZnJvbSAnLi90cmlnZ2VycydcbmltcG9ydCB2YXJpYXRpb24gZnJvbSAnLi92YXJpYXRpb24nXG5leHBvcnQgZGVmYXVsdCB7IHRyaWdnZXJzLCB2YXJpYXRpb24gfVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJpZ2dlcnMgKG9wdGlvbnMsIGNiKSB7XG4gIGNvbnN0IHsgbG9nLCBzdGF0ZSwgcG9sbCB9ID0gb3B0aW9uc1xuXG4gIGxvZy5pbmZvKCdUcmlnZ2VycycpXG5cbiAgcmV0dXJuIHBvbGxGb3JFbGVtZW50cygpLnRoZW4oY2IpXG5cbiAgZnVuY3Rpb24gcG9sbEZvckVsZW1lbnRzICgpIHtcbiAgICBsb2cuaW5mbygnUG9sbGluZyBmb3IgZWxlbWVudHMnKVxuICAgIHJldHVybiBwb2xsKCcjYXRoZW1lcy1ibG9ja3MtYmxvY2stNDI4ZDJkNTQnKS50aGVuKGFuY2hvciA9PiB7XG4gICAgICBzdGF0ZS5zZXQoJ2FuY2hvcicsIGFuY2hvcilcbiAgICB9KVxuICB9XG59XG4iLCJpbXBvcnQgeyByZW5kZXIsIGggfSBmcm9tICdwcmVhY3QnXG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncHJlYWN0L2hvb2tzJ1xuaW1wb3J0IHV0aWxzIGZyb20gJ0BxdWJpdC91dGlscydcbmltcG9ydCAnLi92YXJpYXRpb24ubGVzcydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmFyaWF0aW9uIChvcHRpb25zKSB7XG4gIGNvbnN0IHsgaW5zZXJ0QWZ0ZXIgfSA9IHV0aWxzKClcbiAgY29uc3QgeyBsb2csIHN0YXRlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHByZWZpeCA9ICd4cC1jb3VudGRvd24tYmFubmVyJ1xuICBjb25zdCBhbmNob3IgPSBzdGF0ZS5nZXQoJ2FuY2hvcicpXG4gIGNvbnN0IGNvcHkgPSAnSHVycnkhIE91ciBzYWxlIGVuZHMgc29vbiEnXG5cbiAgbG9nLmluZm8oJ1ZhcmlhdGlvbicpXG5cbiAgcmV0dXJuIHJlbmRlclBsYWNlbWVudCgpXG5cbiAgZnVuY3Rpb24gcmVuZGVyUGxhY2VtZW50ICgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBlbGVtZW50LmNsYXNzTmFtZSA9IHByZWZpeFxuICAgIHJlbmRlcig8Q29udGFpbmVyIC8+LCBlbGVtZW50KVxuICAgIGluc2VydEFmdGVyKGFuY2hvciwgZWxlbWVudClcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRhaW5lciAoKSB7XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3MgPSBgJHtwcmVmaXh9LWNvbnRhaW5lcmBcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NvbnRhaW5lckNsYXNzfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2NvbnRhaW5lckNsYXNzfV9fdGl0bGVgfT57Y29weX08L2Rpdj5cbiAgICAgICAgPENvdW50ZG93biAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7Y29udGFpbmVyQ2xhc3N9X19jdGFgfT5GaW5kIG91dCBtb3JlPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICBmdW5jdGlvbiB1c2VDb3VudGRvd25UaW1lciAoZGF0ZSkge1xuICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZVRpbWVMZWZ0ICgpIHtcbiAgICAgIGNvbnN0IGRpZmZlcmVuY2UgPSArbmV3IERhdGUoZGF0ZSkgLSArbmV3IERhdGUoKVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXlzOiBNYXRoLmZsb29yKGRpZmZlcmVuY2UgLyAoMTAwMCAqIDYwICogNjAgKiAyNCkpLFxuICAgICAgICBob3VyczogTWF0aC5mbG9vcigoZGlmZmVyZW5jZSAvICgxMDAwICogNjAgKiA2MCkpICUgMjQpLFxuICAgICAgICBtaW51dGVzOiBNYXRoLmZsb29yKChkaWZmZXJlbmNlIC8gMTAwMCAvIDYwKSAlIDYwKSxcbiAgICAgICAgc2Vjb25kczogTWF0aC5mbG9vcigoZGlmZmVyZW5jZSAvIDEwMDApICUgNjApXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgW3RpbWVMZWZ0LCBzZXRUaW1lTGVmdF0gPSB1c2VTdGF0ZShjYWxjdWxhdGVUaW1lTGVmdCgpKVxuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHNldFRpbWVMZWZ0KGNhbGN1bGF0ZVRpbWVMZWZ0KCkpXG4gICAgICB9LCAxMDAwKVxuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGltZUxlZnRcbiAgfVxuXG4gIGZ1bmN0aW9uIENvdW50ZG93biAoKSB7XG4gICAgY29uc3QgY291bnRkb3duQ2xhc3MgPSBgJHtwcmVmaXh9LWNvdW50ZG93bmBcbiAgICBjb25zdCB0aW1lTGVmdCA9IHVzZUNvdW50ZG93blRpbWVyKGBEZWNlbWJlciAyNSwgMjAyMmApXG4gICAgY29uc3QgdGltZXJDb21wb25lbnRzID0gT2JqZWN0LmtleXModGltZUxlZnQpLm1hcChpbnRlcnZhbCA9PiAoXG4gICAgICA8c3Bhbj5cbiAgICAgICAge3RpbWVMZWZ0W2ludGVydmFsXX0ge2ludGVydmFsfXsnICd9XG4gICAgICA8L3NwYW4+XG4gICAgKSlcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y291bnRkb3duQ2xhc3N9PlxuICAgICAgICB7dGltZXJDb21wb25lbnRzLmxlbmd0aCA/IHRpbWVyQ29tcG9uZW50cyA6IDxzcGFuPlRpbWUncyB1cCE8L3NwYW4+fVxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59XG4iLCJpbXBvcnQgb3B0aW9ucyBmcm9tICcuL29wdGlvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICh7IHRyaWdnZXJzLCB2YXJpYXRpb24gfSkge1xuXHRyZXR1cm4gKCkgPT4gdHJpZ2dlcnMob3B0aW9ucywgKCkgPT4gdmFyaWF0aW9uKG9wdGlvbnMpKVxufSIsImltcG9ydCB0cmlnZ2VycyBmcm9tICcuL3RyaWdnZXJzJ1xuaW1wb3J0IHZhcmlhdGlvbiBmcm9tICcuL3ZhcmlhdGlvbidcbmV4cG9ydCBkZWZhdWx0IHsgdHJpZ2dlcnMsIHZhcmlhdGlvbiB9XG4iLCJpbXBvcnQgUHJvbWlzZSBmcm9tICdzeW5jLXAnXG5pbXBvcnQgY2hlY2tJbmFjdGl2aXR5IGZyb20gJ0BxdWJpdC9jaGVjay1pbmFjdGl2aXR5J1xuaW1wb3J0IGNoZWNrRXhpdCBmcm9tICdAcXViaXQvY2hlY2stZXhpdCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJpZ2dlcnMgKG9wdGlvbnMsIGNiKSB7XG4gIGNvbnN0IHsgbG9nLCBwb2xsLCBzdGF0ZSB9ID0gb3B0aW9uc1xuXG4gIHJldHVybiBwb2xsRm9yRWxlbWVudHMoKS50aGVuKGNoZWNrRGV2aWNlVHlwZSlcbiAgICAudGhlbihjaGVja0ZvckV4aXRJbnRlbnRPckluYWN0aXZpdHkpXG4gICAgLnRoZW4oY2IpXG5cbiAgZnVuY3Rpb24gcG9sbEZvckVsZW1lbnRzICgpIHtcbiAgICByZXR1cm4gcG9sbCgnYm9keScpLnRoZW4oYW5jaG9yID0+IHtcbiAgICAgIHN0YXRlLnNldCgnYW5jaG9yJywgYW5jaG9yKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0RldmljZVR5cGUgKCkge1xuICAgIGxvZy5pbmZvKCdDaGVja2luZyBkZXZpY2UgdHlwZScpXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgY29uc3QgaXNNb2JpbGVPclRhYmxldCA9IC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeXxJRU1vYmlsZXxPcGVyYSBNaW5pL2kudGVzdChcbiAgICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudFxuICAgICAgKVxuICAgICAgcmV0dXJuIHJlc29sdmUoaXNNb2JpbGVPclRhYmxldClcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tGb3JFeGl0SW50ZW50T3JJbmFjdGl2aXR5IChpc01vYmlsZU9yVGFibGV0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKGlzTW9iaWxlT3JUYWJsZXQpIHtcbiAgICAgICAgbG9nLmluZm8oJ0NoZWNraW5nIGZvciBpbmFjdGl2aXR5JylcbiAgICAgICAgcmV0dXJuIGNoZWNrSW5hY3Rpdml0eShpbmFjdGl2aXR5VGltZSwgcmVzb2x2ZSlcbiAgICAgIH1cbiAgICAgIGxvZy5pbmZvKCdDaGVja2luZyBmb3IgZXhpdCBpbnRlbnQnKVxuICAgICAgY29uc3QgZXhpdEludGVudCA9IGNoZWNrRXhpdChyZXNvbHZlKVxuICAgICAgZXhpdEludGVudC5pbml0KClcbiAgICB9KVxuICB9XG59XG4iLCJpbXBvcnQgeyByZW5kZXIsIGggfSBmcm9tICdwcmVhY3QnXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gJ3ByZWFjdC9ob29rcydcbmltcG9ydCB1dGlscyBmcm9tICdAcXViaXQvdXRpbHMnXG5pbXBvcnQgR2xpZGUgZnJvbSAnQGdsaWRlanMvZ2xpZGUnXG5pbXBvcnQgJy4vdmFyaWF0aW9uLmxlc3MnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHZhcmlhdGlvbiAob3B0aW9ucykge1xuICBjb25zdCB7IGFwcGVuZENoaWxkIH0gPSB1dGlscygpXG4gIGNvbnN0IHsgbG9nLCBzdGF0ZSB9ID0gb3B0aW9uc1xuICBjb25zdCBhbmNob3IgPSBzdGF0ZS5nZXQoJ2FuY2hvcicpXG4gIGNvbnN0IHByZWZpeCA9ICd4cC1leGl0SW50ZW50J1xuICBjb25zdCBjb250ZW50ID0ge1xuICAgIGhlYWRsaW5lOiAnV2FpdCEgQmVmb3JlIHlvdSBnby4uLicsXG4gICAgc3VidGl0bGU6ICdZb3UgbWF5IGFsc28gbGlrZScsXG4gICAgcmVjczogW1xuICAgICAgeyB0aXRsZTogJ1Byb2R1Y3QgVGl0bGUnIH0sXG4gICAgICB7IHRpdGxlOiAnUHJvZHVjdCBUaXRsZScgfSxcbiAgICAgIHsgdGl0bGU6ICdQcm9kdWN0IFRpdGxlJyB9LFxuICAgICAgeyB0aXRsZTogJ1Byb2R1Y3QgVGl0bGUnIH0sXG4gICAgICB7IHRpdGxlOiAnUHJvZHVjdCBUaXRsZScgfVxuICAgIF1cbiAgfVxuXG4gIGNvbnN0IGdsaWRlT3B0aW9ucyA9IHtcbiAgICB0eXBlOiAnc2xpZGVyJyxcbiAgICBib3VuZDogdHJ1ZSxcbiAgICBwZXJWaWV3OiAzLjUsXG4gICAgZ2FwOiA4LFxuICAgIHNjcm9sbExvY2s6IHRydWUsXG4gICAgcmV3aW5kOiBmYWxzZSxcbiAgICBicmVha3BvaW50czoge1xuICAgICAgNzY3OiB7XG4gICAgICAgIHBlclZpZXc6IDEuMjUsXG4gICAgICAgIGdhcDogOFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmaXJlKClcblxuICBmdW5jdGlvbiBmaXJlICgpIHtcbiAgICBsb2cuaW5mbygnUnVubmluZyBleHBlcmllbmNlJylcbiAgICBjb25zdCBlbGVtZW50ID0gY3JlYXRlRWxlbWVudCgpXG4gICAgcmVuZGVyUGxhY2VtZW50KGVsZW1lbnQpXG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVFbGVtZW50ICgpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQocHJlZml4KVxuICAgIGFwcGVuZENoaWxkKGFuY2hvciwgZWxlbWVudClcbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyUGxhY2VtZW50IChlbGVtZW50KSB7XG4gICAgcmVuZGVyKFxuICAgICAgPFBsYWNlbWVudD5cbiAgICAgICAgPENhcm91c2VsIC8+XG4gICAgICA8L1BsYWNlbWVudD4sXG4gICAgICBlbGVtZW50XG4gICAgKVxuICB9XG5cbiAgZnVuY3Rpb24gUGxhY2VtZW50ICh7IGNoaWxkcmVuIH0pIHtcbiAgICBjb25zdCBjb250YWluZXJDbGFzcyA9IGAke3ByZWZpeH0tY29udGFpbmVyYFxuXG4gICAgY29uc3QgaGFuZGxlQ2xvc2UgPSAoKSA9PiB7XG4gICAgICBjb25zdCBleHBlcmllbmNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLiR7Y29udGFpbmVyQ2xhc3N9YClcbiAgICAgIGV4cGVyaWVuY2UucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZChleHBlcmllbmNlKVxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y29udGFpbmVyQ2xhc3N9PlxuICAgICAgICA8ZGl2IGNsYXNzPXtgJHtjb250YWluZXJDbGFzc31fX2hlYWRlcmB9PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtjb250YWluZXJDbGFzc31fX3RpdGxlYH0+e2NvbnRlbnQuaGVhZGxpbmV9PC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake2NvbnRhaW5lckNsYXNzfV9fc3VidGl0bGVgfT57Y29udGVudC5zdWJ0aXRsZX08L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e2Ake2NvbnRhaW5lckNsYXNzfV9fY2xvc2VgfVxuICAgICAgICAgICAgb25DbGljaz17aGFuZGxlQ2xvc2V9XG4gICAgICAgICAgPlg8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIENhcm91c2VsICgpIHtcbiAgICBjb25zdCBjYXJvdXNlbENsYXNzID0gYCR7cHJlZml4fS1jYXJvdXNlbGBcbiAgICBjb25zdCBjYXJvdXNlbENvbnRhaW5lciA9IHVzZVJlZigpXG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgY29uc3QgZ2xpZGUgPSBuZXcgR2xpZGUoYC4ke2Nhcm91c2VsQ2xhc3N9YCwgZ2xpZGVPcHRpb25zKVxuICAgICAgZ2xpZGUubW91bnQoKVxuICAgICAgcmV0dXJuICgpID0+IGdsaWRlLmRlc3Ryb3koKVxuICAgIH0sIFtdKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3M9e2Nhcm91c2VsQ2xhc3N9IHJlZj17Y2Fyb3VzZWxDb250YWluZXJ9PlxuICAgICAgICA8QXJyb3dzIGNhcm91c2VsQ2xhc3M9e2Nhcm91c2VsQ2xhc3N9IC8+XG4gICAgICAgIDxkaXYgY2xhc3M9e2Ake2Nhcm91c2VsQ2xhc3N9X190cmFja2B9IGRhdGEtZ2xpZGUtZWw9J3RyYWNrJz5cbiAgICAgICAgICA8dWwgY2xhc3M9e2Ake2Nhcm91c2VsQ2xhc3N9X19zbGlkZXNgfT5cbiAgICAgICAgICAgIHtjb250ZW50LnJlY3MubWFwKChyZWMsIGkpID0+IChcbiAgICAgICAgICAgICAgPFNsaWRlIGtleT17aX0gey4uLnJlY30gLz5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgZnVuY3Rpb24gQXJyb3dzICh7IGNhcm91c2VsQ2xhc3MgfSkge1xuICAgIGNvbnN0IGFycm93Q2xhc3MgPSBgJHtwcmVmaXh9LWFycm93YFxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzPXtgJHtjYXJvdXNlbENsYXNzfV9fYXJyb3dzYH0gZGF0YS1nbGlkZS1lbD0nY29udHJvbHMnPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3M9e2Ake2Fycm93Q2xhc3N9ICR7YXJyb3dDbGFzc30tLWxlZnQgcHJldmlvdXNgfVxuICAgICAgICAgIGRhdGEtZ2xpZGUtZGlyPSc8J1xuICAgICAgICA+XG4gICAgICAgICAgPHN2Z1xuICAgICAgICAgICAgd2lkdGg9JzE0J1xuICAgICAgICAgICAgaGVpZ2h0PScyMydcbiAgICAgICAgICAgIHZpZXdCb3g9JzAgMCAxNCAyMydcbiAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZD0nTS0zLjgxNDdlLTA2IDExLjVMMC41NjcwOTQgMTIuMDU3OUwxMS43MzQ1IDIzTDEzLjMzNzYgMjEuODg0MkwyLjczNzMxIDExLjVMMTMuMzM3NiAxLjExNTgxTDExLjczNDUgMEwwLjU2NzA5NCAxMC45NDIxTC0zLjgxNDdlLTA2IDExLjVaJ1xuICAgICAgICAgICAgICBmaWxsPScjOTc5Nzk3J1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9e2Ake2Fycm93Q2xhc3N9IG5leHRgfSBkYXRhLWdsaWRlLWRpcj0nPic+XG4gICAgICAgICAgPHN2Z1xuICAgICAgICAgICAgd2lkdGg9JzE0J1xuICAgICAgICAgICAgaGVpZ2h0PScyMydcbiAgICAgICAgICAgIHZpZXdCb3g9JzAgMCAxNCAyMydcbiAgICAgICAgICAgIGZpbGw9J25vbmUnXG4gICAgICAgICAgICB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgICAgZD0nTTE0IDExLjVMMTMuNDMyOSAxMC45NDIxTDIuMjY1NDcgLTEuOTA3MzVlLTA2TDAuNjYyMzU0IDEuMTE1OEwxMS4yNjI3IDExLjVMMC42NjIzNTQgMjEuODg0MkwyLjI2NTQ3IDIzTDEzLjQzMjkgMTIuMDU3OUwxNCAxMS41WidcbiAgICAgICAgICAgICAgZmlsbD0nYmxhY2snXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvc3ZnPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIFNsaWRlICgpIHtcbiAgICBjb25zdCBzbGlkZUNsYXNzID0gYCR7cHJlZml4fS1zbGlkZWBcblxuICAgIHJldHVybiAoXG4gICAgICA8YSBjbGFzc05hbWU9e3NsaWRlQ2xhc3N9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7c2xpZGVDbGFzc31fX2ltYWdlYH0+XG4gICAgICAgICAgPGltZyBzcmM9eydodHRwczovL3BpY3N1bS5waG90b3MvMjAwJ30gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtzbGlkZUNsYXNzfV9fY29udGVudGB9PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtzbGlkZUNsYXNzfV9fdGl0bGVgfT5cbiAgICAgICAgICAgIFByb2R1Y3QgTmFtZVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT17YCR7c2xpZGVDbGFzc31fX29sZC1wcmljZSAke3NsaWRlQ2xhc3N9X19vbGQtcHJpY2UtLXN0cmlrZWB9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgwqMxMC4wMFxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtzbGlkZUNsYXNzfV9fbmV3LXByaWNlYH0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7c2xpZGVDbGFzc31fX3ByaWNlLXZhbHVlYH0+wqMxMi4wMDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake3NsaWRlQ2xhc3N9X19wcmljZS1zYXZlZGB9PsKjMTIuMDA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2E+XG4gICAgKVxuICB9XG59XG4iLCJpbXBvcnQgY3JlYXRlRXhwZXJpZW5jZSBmcm9tICcuL2NyZWF0ZUV4cGVyaWVuY2UnXG5cbi8vIEV4cGVyaWVuY2VzXG5pbXBvcnQgY291bnRkb3duQmFubmVyIGZyb20gJy4vY291bnRkb3duQmFubmVyJ1xuaW1wb3J0IGV4aXRJbnRlbnQgZnJvbSAnLi9leGl0SW50ZW50J1xuXG5leHBvcnQgZGVmYXVsdCBbY3JlYXRlRXhwZXJpZW5jZShjb3VudGRvd25CYW5uZXIpLCBjcmVhdGVFeHBlcmllbmNlKGV4aXRJbnRlbnQpXVxuIiwiaW1wb3J0IHBvbGwgZnJvbSAnQHF1Yml0L3BvbGxlcidcblxuY29uc3QgZXhwZXJpZW5jZVN0YXRlID0ge31cblxuZnVuY3Rpb24gc2V0IChrZXksIGRhdGEpIHtcbiAgZXhwZXJpZW5jZVN0YXRlW2tleV0gPSBkYXRhXG59XG5cbmZ1bmN0aW9uIGdldCAoa2V5KSB7XG4gIHJldHVybiBleHBlcmllbmNlU3RhdGVba2V5XVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHBvbGwsXG4gIHN0YXRlOiB7XG4gICAgc2V0LFxuICAgIGdldFxuICB9LFxuICBsb2c6IHtcbiAgICBpbmZvOiBjb25zb2xlLmxvZyxcbiAgICB3YXJuOiBjb25zb2xlLndhcm4sXG4gICAgZXJyb3I6IGNvbnNvbGUuZXJyb3JcbiAgfVxufVxuIiwiaW1wb3J0IHBvbGwgZnJvbSAnQHF1Yml0L3BvbGxlcidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcnVuTWFwcGVyICgpIHtcbiAgd2luZG93LnhwX2V2ZW50cyA9IFtdXG5cbiAgZnVuY3Rpb24gZW1pdEV2ZW50IChldmVudCkge1xuICAgIHdpbmRvdy54cF9ldmVudHMucHVzaChldmVudClcbiAgfVxuXG4gIHJldHVybiBwb2xsKCd3aW5kb3cuZGlnaXRhbERhdGEnKS50aGVuKGRhdGFMYXllciA9PiB7XG4gICAgZW1pdEV2ZW50KHtcbiAgICAgIGV2ZW50TmFtZTogJ3hwVmlldydcbiAgICB9KVxuICB9KVxufVxuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIueHAtY291bnRkb3duLWJhbm5lciB7XFxuICBtYXJnaW46IHVuc2V0ICFpbXBvcnRhbnQ7XFxuICB3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xcbiAgbWF4LXdpZHRoOiB1bnNldCAhaW1wb3J0YW50O1xcbn1cXG4ueHAtY291bnRkb3duLWJhbm5lciArIC53cC1ibG9jay1zcGFjZXIge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuLnhwLWNvdW50ZG93bi1iYW5uZXItY29udGFpbmVyIHtcXG4gIHBhZGRpbmc6IDJyZW07XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJhY2tncm91bmQ6ICNmZjU4NTg7XFxuICBjb2xvcjogI2ZmZmZmZjtcXG59XFxuLnhwLWNvdW50ZG93bi1iYW5uZXItY29udGFpbmVyX190aXRsZSB7XFxuICBmb250LXNpemU6IDJyZW07XFxufVxcbi54cC1jb3VudGRvd24tYmFubmVyLWNvbnRhaW5lcl9fY3RhIHtcXG4gIGJhY2tncm91bmQ6ICMyMTIxMjE7XFxuICBwYWRkaW5nOiAwLjVyZW0gMXJlbTtcXG4gIG1hcmdpbi10b3A6IDFyZW07XFxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxufVxcblwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9leHBlcmllbmNlcy9jb3VudGRvd25CYW5uZXIvdmFyaWF0aW9uLmxlc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUM7RUFJQyx3QkFBQTtFQUNBLHNCQUFBO0VBQ0EsMkJBQUE7QUFGRjtBQUpDO0VBVUMsYUFBQTtBQUhGO0FBUEM7RUFjQyxhQUFBO0VBQ0Esa0JBQUE7RUFDQSxXQUFBO0VBQ0EsbUJBQUE7RUFDQSxjQUFBO0FBSkY7QUFLRTtFQUNFLGVBQUE7QUFISjtBQUtFO0VBQ0UsbUJBQUE7RUFDQSxvQkFBQTtFQUNBLGdCQUFBO0VBQ0EscUJBQUE7QUFISlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAcHJlZml4OiB+Jy54cC1jb3VudGRvd24tYmFubmVyJztcXG5AY29udGFpbmVyOiB+J0B7cHJlZml4fS1jb250YWluZXInO1xcblxcbkB7cHJlZml4fSB7XFxuICBtYXJnaW46IHVuc2V0ICFpbXBvcnRhbnQ7XFxuICB3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xcbiAgbWF4LXdpZHRoOiB1bnNldCAhaW1wb3J0YW50O1xcbn1cXG5cXG5Ae3ByZWZpeH0gKyAud3AtYmxvY2stc3BhY2VyIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbkB7Y29udGFpbmVyfSB7XFxuICBwYWRkaW5nOiAycmVtO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBiYWNrZ3JvdW5kOiAjZmY1ODU4O1xcbiAgY29sb3I6ICNmZmZmZmY7XFxuICAmX190aXRsZSB7XFxuICAgIGZvbnQtc2l6ZTogMnJlbTtcXG4gIH1cXG4gICZfX2N0YSB7XFxuICAgIGJhY2tncm91bmQ6ICMyMTIxMjE7XFxuICAgIHBhZGRpbmc6IDAuNXJlbSAxcmVtO1xcbiAgICBtYXJnaW4tdG9wOiAxcmVtO1xcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XFxuICB9XFxufVxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbi8vIE1vZHVsZVxuX19fQ1NTX0xPQURFUl9FWFBPUlRfX18ucHVzaChbbW9kdWxlLmlkLCBcIi54cC1leGl0SW50ZW50IHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGJvdHRvbTogNDBweDtcXG4gIGxlZnQ6IDQwcHg7XFxuICByaWdodDogNDBweDtcXG4gIHotaW5kZXg6IDk5OTk5OTk5OTk7XFxufVxcbkBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLnhwLWV4aXRJbnRlbnQge1xcbiAgICBib3R0b206IDIwcHg7XFxuICAgIGxlZnQ6IDIwcHg7XFxuICAgIHJpZ2h0OiAyMHB4O1xcbiAgfVxcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbCB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsICoge1xcbiAgYm94LXNpemluZzogaW5oZXJpdDtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWxfX3RyYWNrIHtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsX19zbGlkZXMge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBsaXN0LXN0eWxlOiBub25lO1xcbiAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gIHRvdWNoLWFjdGlvbjogcGFuLVk7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgcGFkZGluZzogMDtcXG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC13cmFwOiBub3dyYXA7XFxuICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtO1xcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbF9fc2xpZGVzLS1kcmFnZ2luZyB7XFxuICB1c2VyLXNlbGVjdDogbm9uZTtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWxfX3NsaWRlIHtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgaGVpZ2h0OiAxMDAlO1xcbiAgZmxleC1zaHJpbms6IDA7XFxuICB3aGl0ZS1zcGFjZTogbm9ybWFsO1xcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XFxuICAtd2Via2l0LXRvdWNoLWNhbGxvdXQ6IG5vbmU7XFxuICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50O1xcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbF9fc2xpZGUgYSB7XFxuICB1c2VyLXNlbGVjdDogbm9uZTtcXG4gIC13ZWJraXQtdXNlci1kcmFnOiBub25lO1xcbiAgLW1vei11c2VyLXNlbGVjdDogbm9uZTtcXG4gIC1tcy11c2VyLXNlbGVjdDogbm9uZTtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWxfX2Fycm93cyB7XFxuICAtd2Via2l0LXRvdWNoLWNhbGxvdXQ6IG5vbmU7XFxuICB1c2VyLXNlbGVjdDogbm9uZTtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWxfX2J1bGxldHMge1xcbiAgLXdlYmtpdC10b3VjaC1jYWxsb3V0OiBub25lO1xcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsLS1ydGwge1xcbiAgZGlyZWN0aW9uOiBydGw7XFxufVxcbi54cC1leGl0SW50ZW50LWNvbnRhaW5lciB7XFxuICBiYWNrZ3JvdW5kOiAjZmZmZmZmO1xcbiAgYm94LXNoYWRvdzogMHB4IDFweCAxMHB4IHJnYmEoMCwgMCwgMCwgMC4yMjYwNDMpO1xcbiAgYm9yZGVyLXJhZGl1czogNXB4O1xcbiAgYm9yZGVyLXRvcDogNXB4IHNvbGlkICNkODFmMGQ7XFxuICBwYWRkaW5nOiAyMnB4IDE1cHg7XFxufVxcbkBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLnhwLWV4aXRJbnRlbnQtY29udGFpbmVyIHtcXG4gICAgcGFkZGluZzogOHB4IDE1cHggMTVweCAxNXB4O1xcbiAgICBib3JkZXItdG9wOiA0cHggc29saWQgI2Q4MWYwZDtcXG4gIH1cXG59XFxuLnhwLWV4aXRJbnRlbnQtY29udGFpbmVyX19oZWFkZXIge1xcbiAgcGFkZGluZy1ib3R0b206IDEycHg7XFxufVxcbi54cC1leGl0SW50ZW50LWNvbnRhaW5lcl9fdGl0bGUge1xcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIGZvbnQtc2l6ZTogMjBweDtcXG4gIGxpbmUtaGVpZ2h0OiAyNXB4O1xcbiAgY29sb3I6ICMzMzMzMzM7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBwYWRkaW5nLWJvdHRvbTogM3B4O1xcbn1cXG5AbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC54cC1leGl0SW50ZW50LWNvbnRhaW5lcl9fdGl0bGUge1xcbiAgICBmb250LXNpemU6IDE2cHg7XFxuICAgIGxpbmUtaGVpZ2h0OiAyMHB4O1xcbiAgICBwYWRkaW5nLWxlZnQ6IDIwcHg7XFxuICAgIHBhZGRpbmctcmlnaHQ6IDIwcHg7XFxuICB9XFxufVxcbi54cC1leGl0SW50ZW50LWNvbnRhaW5lcl9fc3VidGl0bGUge1xcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGZvbnQtc2l6ZTogMTZweDtcXG4gIGxpbmUtaGVpZ2h0OiAyMHB4O1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDkyODU3MXB4O1xcbiAgY29sb3I6ICMyZTJlMmU7XFxufVxcbkBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLnhwLWV4aXRJbnRlbnQtY29udGFpbmVyX19zdWJ0aXRsZSB7XFxuICAgIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICAgIGZvbnQtc2l6ZTogMTNweDtcXG4gICAgbGluZS1oZWlnaHQ6IDE2cHg7XFxuICB9XFxufVxcbi54cC1leGl0SW50ZW50LWNvbnRhaW5lcl9fY2xvc2Uge1xcbiAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gIGJhY2tncm91bmQtY29sb3I6IHVuc2V0O1xcbiAgYm9yZGVyOiB1bnNldDtcXG4gIHdpZHRoOiAyNnB4O1xcbiAgaGVpZ2h0OiAyNnB4O1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiAxMHB4O1xcbiAgcmlnaHQ6IDEwcHg7XFxuICBwYWRkaW5nOiB1bnNldDtcXG4gIGNvbG9yOiAjMDAwMDAwO1xcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbCB7XFxuICBwYWRkaW5nLWxlZnQ6IDQwcHg7XFxuICBwYWRkaW5nLXJpZ2h0OiA0MHB4O1xcbn1cXG5AbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC54cC1leGl0SW50ZW50LWNhcm91c2VsIHtcXG4gICAgcGFkZGluZy1sZWZ0OiB1bnNldDtcXG4gICAgcGFkZGluZy1yaWdodDogdW5zZXQ7XFxuICB9XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsX19zbGlkZXMge1xcbiAgbWFyZ2luOiB1bnNldDtcXG59XFxuLnhwLWV4aXRJbnRlbnQtYXJyb3cge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiA1MCU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7XFxuICByaWdodDogLTE1cHg7XFxuICBwYWRkaW5nOiAzMHB4IDE1cHg7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxufVxcbi54cC1leGl0SW50ZW50LWFycm93LS1sZWZ0IHtcXG4gIGxlZnQ6IC0xNXB4O1xcbiAgcmlnaHQ6IHVuc2V0O1xcbn1cXG5AbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC54cC1leGl0SW50ZW50LWFycm93IHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gIH1cXG59XFxuLnhwLWV4aXRJbnRlbnQtc2xpZGUge1xcbiAgYmFja2dyb3VuZDogI2ZmZmZmZjtcXG4gIGJvcmRlcjogMXB4IHNvbGlkICNjY2NjY2M7XFxuICBwYWRkaW5nOiAxM3B4O1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG59XFxuQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAueHAtZXhpdEludGVudC1zbGlkZSB7XFxuICAgIHBhZGRpbmc6IDEycHg7XFxuICAgIG1pbi1oZWlnaHQ6IDkwcHg7XFxuICB9XFxufVxcbi54cC1leGl0SW50ZW50LXNsaWRlX19pbWFnZSB7XFxuICB3aWR0aDogMzAlO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxufVxcbi54cC1leGl0SW50ZW50LXNsaWRlX19pbWFnZSBpbWcge1xcbiAgbWF4LXdpZHRoOiAxMDAlO1xcbiAgbWF4LWhlaWdodDogNzBweDtcXG59XFxuLnhwLWV4aXRJbnRlbnQtc2xpZGVfX2NvbnRlbnQge1xcbiAgd2lkdGg6IGNhbGMoNzAlIC0gMTNweCk7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHBhZGRpbmctdG9wOiA2cHg7XFxufVxcbkBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLnhwLWV4aXRJbnRlbnQtc2xpZGVfX2NvbnRlbnQge1xcbiAgICBwYWRkaW5nLXRvcDogdW5zZXQ7XFxuICB9XFxufVxcbi54cC1leGl0SW50ZW50LXNsaWRlX190aXRsZSB7XFxuICBtYXgtd2lkdGg6IDEwMCU7XFxuICB3aGl0ZS1zcGFjZTogbm9ybWFsO1xcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGZvbnQtc2l6ZTogMTRweDtcXG4gIGxpbmUtaGVpZ2h0OiAxNHB4O1xcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMXB4O1xcbiAgY29sb3I6ICMzMzMzMzM7XFxufVxcbi54cC1leGl0SW50ZW50LXNsaWRlX19vbGQtcHJpY2Uge1xcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gIGZvbnQtc2l6ZTogMTFweDtcXG4gIGxpbmUtaGVpZ2h0OiAxNHB4O1xcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDkyODU3MXB4O1xcbiAgY29sb3I6ICM2NjY2NjY7XFxufVxcbi54cC1leGl0SW50ZW50LXNsaWRlX19vbGQtcHJpY2UtLXN0cmlrZSB7XFxuICB0ZXh0LWRlY29yYXRpb246IGxpbmUtdGhyb3VnaDtcXG59XFxuLnhwLWV4aXRJbnRlbnQtc2xpZGVfX25ldy1wcmljZSB7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgZm9udC1zaXplOiAxM3B4O1xcbiAgbGluZS1oZWlnaHQ6IDE0cHg7XFxuICBsZXR0ZXItc3BhY2luZzogMC4wOTI4NTcxcHg7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgZmxleC13cmFwOiB3cmFwO1xcbn1cXG4ueHAtZXhpdEludGVudC1zbGlkZV9fcHJpY2UtdmFsdWUge1xcbiAgY29sb3I6ICMwMDAwMDA7XFxuICBwYWRkaW5nLXJpZ2h0OiAxMnB4O1xcbn1cXG4ueHAtZXhpdEludGVudC1zbGlkZV9fcHJpY2Utc2F2ZWQge1xcbiAgY29sb3I6ICNjOTNiMzI7XFxufVxcblwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L3ZhcmlhdGlvbi5sZXNzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFDO0VBUUMsZUFBQTtFQUNBLFlBQUE7RUFDQSxVQUFBO0VBQ0EsV0FBQTtFQUNBLG1CQUFBO0FBTkY7QUFPRTtFQUFBO0lBQ0UsWUFBQTtJQUNBLFVBQUE7SUFDQSxXQUFBO0VBSkY7QUFDRjtBQWJDO0VBcUJDLGtCQUFBO0VBQ0EsV0FBQTtFQUNBLHNCQUFBO0FBTEY7QUFsQkM7RUF5QkcsbUJBQUE7QUFKSjtBQU1FO0VBQ0UsZ0JBQUE7QUFKSjtBQU1FO0VBQ0Usa0JBQUE7RUFDQSxXQUFBO0VBQ0EsZ0JBQUE7RUFDQSwyQkFBQTtFQUNBLDRCQUFBO0VBQ0EsbUJBQUE7RUFDQSxnQkFBQTtFQUNBLFVBQUE7RUFDQSxtQkFBQTtFQUNBLGFBQUE7RUFDQSxpQkFBQTtFQUNBLHNCQUFBO0FBSko7QUFLSTtFQUNFLGlCQUFBO0FBSE47QUFNRTtFQUNFLFdBQUE7RUFDQSxZQUFBO0VBQ0EsY0FBQTtFQUNBLG1CQUFBO0VBQ0EsaUJBQUE7RUFDQSwyQkFBQTtFQUNBLHdDQUFBO0FBSko7QUFIRTtFQVNJLGlCQUFBO0VBQ0EsdUJBQUE7RUFDQSxzQkFBQTtFQUNBLHFCQUFBO0FBSE47QUFNRTtFQUNFLDJCQUFBO0VBQ0EsaUJBQUE7QUFKSjtBQU1FO0VBQ0UsMkJBQUE7RUFDQSxpQkFBQTtBQUpKO0FBTUU7RUFDRSxjQUFBO0FBSko7QUFuRUM7RUE0RUMsbUJBQUE7RUFDQSxnREFBQTtFQUNBLGtCQUFBO0VBQ0EsNkJBQUE7RUFDQSxrQkFBQTtBQU5GO0FBT0U7RUFBQTtJQUNFLDJCQUFBO0lBQ0EsNkJBQUE7RUFKRjtBQUNGO0FBS0U7RUFDRSxvQkFBQTtBQUhKO0FBS0U7RUFDRSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0EsY0FBQTtFQUNBLGtCQUFBO0VBQ0EsbUJBQUE7QUFISjtBQUlJO0VBQUE7SUFDRSxlQUFBO0lBQ0EsaUJBQUE7SUFDQSxrQkFBQTtJQUNBLG1CQUFBO0VBREo7QUFDRjtBQUdFO0VBQ0Usa0JBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7RUFDQSxpQkFBQTtFQUNBLGtCQUFBO0VBQ0EsMkJBQUE7RUFDQSxjQUFBO0FBREo7QUFFSTtFQUFBO0lBQ0UsZ0JBQUE7SUFDQSxlQUFBO0lBQ0EsaUJBQUE7RUFDSjtBQUNGO0FBQ0U7RUFDRSw0QkFBQTtFQUNBLHVCQUFBO0VBQ0EsYUFBQTtFQUNBLFdBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxTQUFBO0VBQ0EsV0FBQTtFQUNBLGNBQUE7RUFDQSxjQUFBO0FBQ0o7QUFoSUM7RUFvSUMsa0JBQUE7RUFDQSxtQkFBQTtBQURGO0FBRUU7RUFBQTtJQUNFLG1CQUFBO0lBQ0Esb0JBQUE7RUFDRjtBQUNGO0FBQUU7RUFDRSxhQUFBO0FBRUo7QUE3SUM7RUFnSkMsa0JBQUE7RUFDQSxRQUFBO0VBQ0EsMkJBQUE7RUFDQSxZQUFBO0VBQ0Esa0JBQUE7RUFDQSxlQUFBO0FBQUY7QUFDRTtFQUNFLFdBQUE7RUFDQSxZQUFBO0FBQ0o7QUFDRTtFQUFBO0lBQ0UsYUFBQTtFQUVGO0FBQ0Y7QUE5SkM7RUFnS0MsbUJBQUE7RUFDQSx5QkFBQTtFQUNBLGFBQUE7RUFDQSxhQUFBO0VBQ0EsOEJBQUE7RUFDQSxxQkFBQTtBQUNGO0FBQUU7RUFBQTtJQUNFLGFBQUE7SUFDQSxnQkFBQTtFQUdGO0FBQ0Y7QUFGRTtFQUNFLFVBQUE7RUFDQSxhQUFBO0VBQ0EsbUJBQUE7QUFJSjtBQVBFO0VBS0ksZUFBQTtFQUNBLGdCQUFBO0FBS047QUFGRTtFQUNFLHVCQUFBO0VBQ0EsYUFBQTtFQUNBLHNCQUFBO0VBQ0EsOEJBQUE7RUFDQSxnQkFBQTtBQUlKO0FBSEk7RUFBQTtJQUNFLGtCQUFBO0VBTUo7QUFDRjtBQUpFO0VBQ0UsZUFBQTtFQUNBLG1CQUFBO0VBQ0Esa0JBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7RUFDQSxpQkFBQTtFQUNBLHFCQUFBO0VBQ0EsY0FBQTtBQU1KO0FBSkU7RUFDRSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0EsMkJBQUE7RUFDQSxjQUFBO0FBTUo7QUFMSTtFQUNFLDZCQUFBO0FBT047QUFKRTtFQUNFLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFDQSwyQkFBQTtFQUNBLGFBQUE7RUFDQSxlQUFBO0FBTUo7QUFKRTtFQUNFLGNBQUE7RUFDQSxtQkFBQTtBQU1KO0FBSkU7RUFDRSxjQUFBO0FBTUpcIixcInNvdXJjZXNDb250ZW50XCI6W1wiQHRpY2tldDogficueHAtZXhpdEludGVudCc7XFxuQGNvbnRhaW5lckNsYXNzOiB+J0B7dGlja2V0fS1jb250YWluZXInO1xcbkBnbGlkZTogfidAe3RpY2tldH0tY2Fyb3VzZWwnO1xcbkBjYXJvdXNlbENsYXNzOiB+J0B7dGlja2V0fS1jYXJvdXNlbCc7XFxuQHNsaWRlQ2xhc3M6IH4nQHt0aWNrZXR9LXNsaWRlJztcXG5AYXJyb3dDbGFzczogfidAe3RpY2tldH0tYXJyb3cnO1xcblxcbkB7dGlja2V0fSB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBib3R0b206IDQwcHg7XFxuICBsZWZ0OiA0MHB4O1xcbiAgcmlnaHQ6IDQwcHg7XFxuICB6LWluZGV4OiA5OTk5OTk5OTk5O1xcbiAgQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAgIGJvdHRvbTogMjBweDtcXG4gICAgbGVmdDogMjBweDtcXG4gICAgcmlnaHQ6IDIwcHg7XFxuICB9XFxufVxcblxcbkB7Z2xpZGV9IHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG4gICoge1xcbiAgICBib3gtc2l6aW5nOiBpbmhlcml0O1xcbiAgfVxcbiAgJl9fdHJhY2sge1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgfVxcbiAgJl9fc2xpZGVzIHtcXG4gICAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgbGlzdC1zdHlsZTogbm9uZTtcXG4gICAgYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuO1xcbiAgICB0cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkO1xcbiAgICB0b3VjaC1hY3Rpb246IHBhbi1ZO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICBwYWRkaW5nOiAwO1xcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LXdyYXA6IG5vd3JhcDtcXG4gICAgd2lsbC1jaGFuZ2U6IHRyYW5zZm9ybTtcXG4gICAgJi0tZHJhZ2dpbmcge1xcbiAgICAgIHVzZXItc2VsZWN0OiBub25lO1xcbiAgICB9XFxuICB9XFxuICAmX19zbGlkZSB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIGZsZXgtc2hyaW5rOiAwO1xcbiAgICB3aGl0ZS1zcGFjZTogbm9ybWFsO1xcbiAgICB1c2VyLXNlbGVjdDogbm9uZTtcXG4gICAgLXdlYmtpdC10b3VjaC1jYWxsb3V0OiBub25lO1xcbiAgICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgICBhIHtcXG4gICAgICB1c2VyLXNlbGVjdDogbm9uZTtcXG4gICAgICAtd2Via2l0LXVzZXItZHJhZzogbm9uZTtcXG4gICAgICAtbW96LXVzZXItc2VsZWN0OiBub25lO1xcbiAgICAgIC1tcy11c2VyLXNlbGVjdDogbm9uZTtcXG4gICAgfVxcbiAgfVxcbiAgJl9fYXJyb3dzIHtcXG4gICAgLXdlYmtpdC10b3VjaC1jYWxsb3V0OiBub25lO1xcbiAgICB1c2VyLXNlbGVjdDogbm9uZTtcXG4gIH1cXG4gICZfX2J1bGxldHMge1xcbiAgICAtd2Via2l0LXRvdWNoLWNhbGxvdXQ6IG5vbmU7XFxuICAgIHVzZXItc2VsZWN0OiBub25lO1xcbiAgfVxcbiAgJi0tcnRsIHtcXG4gICAgZGlyZWN0aW9uOiBydGw7XFxuICB9XFxufVxcblxcbkB7Y29udGFpbmVyQ2xhc3N9IHtcXG4gIGJhY2tncm91bmQ6ICNmZmZmZmY7XFxuICBib3gtc2hhZG93OiAwcHggMXB4IDEwcHggcmdiYSgwLCAwLCAwLCAwLjIyNjA0Myk7XFxuICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICBib3JkZXItdG9wOiA1cHggc29saWQgI2Q4MWYwZDtcXG4gIHBhZGRpbmc6IDIycHggMTVweDtcXG4gIEBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgICBwYWRkaW5nOiA4cHggMTVweCAxNXB4IDE1cHg7XFxuICAgIGJvcmRlci10b3A6IDRweCBzb2xpZCAjZDgxZjBkO1xcbiAgfVxcbiAgJl9faGVhZGVyIHtcXG4gICAgcGFkZGluZy1ib3R0b206IDEycHg7XFxuICB9XFxuICAmX190aXRsZSB7XFxuICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgZm9udC1zaXplOiAyMHB4O1xcbiAgICBsaW5lLWhlaWdodDogMjVweDtcXG4gICAgY29sb3I6ICMzMzMzMzM7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgcGFkZGluZy1ib3R0b206IDNweDtcXG4gICAgQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAgICAgZm9udC1zaXplOiAxNnB4O1xcbiAgICAgIGxpbmUtaGVpZ2h0OiAyMHB4O1xcbiAgICAgIHBhZGRpbmctbGVmdDogMjBweDtcXG4gICAgICBwYWRkaW5nLXJpZ2h0OiAyMHB4O1xcbiAgICB9XFxuICB9XFxuICAmX19zdWJ0aXRsZSB7XFxuICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG4gICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgZm9udC1zaXplOiAxNnB4O1xcbiAgICBsaW5lLWhlaWdodDogMjBweDtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBsZXR0ZXItc3BhY2luZzogMC4wOTI4NTcxcHg7XFxuICAgIGNvbG9yOiAjMmUyZTJlO1xcbiAgICBAbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gICAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICAgIGZvbnQtc2l6ZTogMTNweDtcXG4gICAgICBsaW5lLWhlaWdodDogMTZweDtcXG4gICAgfVxcbiAgfVxcbiAgJl9fY2xvc2Uge1xcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB1bnNldDtcXG4gICAgYm9yZGVyOiB1bnNldDtcXG4gICAgd2lkdGg6IDI2cHg7XFxuICAgIGhlaWdodDogMjZweDtcXG4gICAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgICB0b3A6IDEwcHg7XFxuICAgIHJpZ2h0OiAxMHB4O1xcbiAgICBwYWRkaW5nOiB1bnNldDtcXG4gICAgY29sb3I6ICMwMDAwMDA7XFxuICB9XFxufVxcblxcbkB7Y2Fyb3VzZWxDbGFzc30ge1xcbiAgcGFkZGluZy1sZWZ0OiA0MHB4O1xcbiAgcGFkZGluZy1yaWdodDogNDBweDtcXG4gIEBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgICBwYWRkaW5nLWxlZnQ6IHVuc2V0O1xcbiAgICBwYWRkaW5nLXJpZ2h0OiB1bnNldDtcXG4gIH1cXG4gICZfX3NsaWRlcyB7XFxuICAgIG1hcmdpbjogdW5zZXQ7XFxuICB9XFxufVxcblxcbkB7YXJyb3dDbGFzc30ge1xcbiAgcG9zaXRpb246IGFic29sdXRlO1xcbiAgdG9wOiA1MCU7XFxuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7XFxuICByaWdodDogLTE1cHg7XFxuICBwYWRkaW5nOiAzMHB4IDE1cHg7XFxuICBjdXJzb3I6IHBvaW50ZXI7XFxuICAmLS1sZWZ0IHtcXG4gICAgbGVmdDogLTE1cHg7XFxuICAgIHJpZ2h0OiB1bnNldDtcXG4gIH1cXG4gIEBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcbn1cXG5cXG5Ae3NsaWRlQ2xhc3N9IHtcXG4gIGJhY2tncm91bmQ6ICNmZmZmZmY7XFxuICBib3JkZXI6IDFweCBzb2xpZCAjY2NjY2NjO1xcbiAgcGFkZGluZzogMTNweDtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuICBAbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gICAgcGFkZGluZzogMTJweDtcXG4gICAgbWluLWhlaWdodDogOTBweDtcXG4gIH1cXG4gICZfX2ltYWdlIHtcXG4gICAgd2lkdGg6IDMwJTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgaW1nIHtcXG4gICAgICBtYXgtd2lkdGg6IDEwMCU7XFxuICAgICAgbWF4LWhlaWdodDogNzBweDtcXG4gICAgfVxcbiAgfVxcbiAgJl9fY29udGVudCB7XFxuICAgIHdpZHRoOiBjYWxjKDcwJSAtIDEzcHgpO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICAgIHBhZGRpbmctdG9wOiA2cHg7XFxuICAgIEBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgICAgIHBhZGRpbmctdG9wOiB1bnNldDtcXG4gICAgfVxcbiAgfVxcbiAgJl9fdGl0bGUge1xcbiAgICBtYXgtd2lkdGg6IDEwMCU7XFxuICAgIHdoaXRlLXNwYWNlOiBub3JtYWw7XFxuICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG4gICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgZm9udC1zaXplOiAxNHB4O1xcbiAgICBsaW5lLWhlaWdodDogMTRweDtcXG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuMXB4O1xcbiAgICBjb2xvcjogIzMzMzMzMztcXG4gIH1cXG4gICZfX29sZC1wcmljZSB7XFxuICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG4gICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgZm9udC1zaXplOiAxMXB4O1xcbiAgICBsaW5lLWhlaWdodDogMTRweDtcXG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuMDkyODU3MXB4O1xcbiAgICBjb2xvcjogIzY2NjY2NjtcXG4gICAgJi0tc3RyaWtlIHtcXG4gICAgICB0ZXh0LWRlY29yYXRpb246IGxpbmUtdGhyb3VnaDtcXG4gICAgfVxcbiAgfVxcbiAgJl9fbmV3LXByaWNlIHtcXG4gICAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBmb250LXNpemU6IDEzcHg7XFxuICAgIGxpbmUtaGVpZ2h0OiAxNHB4O1xcbiAgICBsZXR0ZXItc3BhY2luZzogMC4wOTI4NTcxcHg7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogd3JhcDtcXG4gIH1cXG4gICZfX3ByaWNlLXZhbHVlIHtcXG4gICAgY29sb3I6ICMwMDAwMDA7XFxuICAgIHBhZGRpbmctcmlnaHQ6IDEycHg7XFxuICB9XFxuICAmX19wcmljZS1zYXZlZCB7XFxuICAgIGNvbG9yOiAjYzkzYjMyO1xcbiAgfVxcbn1cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgXCJcIikuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL3NyYy9jcmVhdGUnKShyZXF1aXJlKCcuL3NyYy9sb2dnZXIvYnJvd3NlcicpKCkpXG4iLCJ2YXIgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcbnZhciBwYXR0ZXJucyA9IHJlcXVpcmUoJy4vcGF0dGVybnMnKVxudmFyIExFVkVMUyA9IHJlcXVpcmUoJy4vbGV2ZWxzJylcbnZhciBhcmdzVG9Db21wb25lbnRzID0gcmVxdWlyZSgnLi91dGlscy9hcmdzVG9Db21wb25lbnRzJylcbnZhciBjb21wb3NlID0gcmVxdWlyZSgnLi91dGlscy9jb21wb3NlJylcbmZ1bmN0aW9uIG5vb3AgKCkge31cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVEcmlmdHdvb2QgKHByaW1hcnlMb2dnZXIpIHtcbiAgdmFyIGdsb2JhbFN0YXRlID0geyBsb2dnZXJzOiBbXSwgZW5hYmxlZDogZmFsc2UgfVxuXG4gIGRyaWZ0d29vZC5lbmFibGUgPSBmdW5jdGlvbiBlbmFibGVBbGwgKGZsYWdzLCBvcHRpb25zKSB7XG4gICAgZ2xvYmFsU3RhdGUuZW5hYmxlZCA9IHRydWVcbiAgICBpZiAoZmxhZ3MpIHBhdHRlcm5zLnNldChmbGFncywgb3B0aW9ucylcbiAgICBfLmludm9rZShnbG9iYWxTdGF0ZS5sb2dnZXJzLCAnZW5hYmxlJywgZmxhZ3MpXG4gIH1cblxuICBkcmlmdHdvb2QuZGlzYWJsZSA9IGZ1bmN0aW9uIGRpc2FibGVBbGwgKCkge1xuICAgIGdsb2JhbFN0YXRlLmVuYWJsZWQgPSBmYWxzZVxuICAgIHBhdHRlcm5zLnNldCh7fSlcbiAgICBwYXR0ZXJucy5zZXQoe30sIHsgcGVyc2lzdDogdHJ1ZSB9KVxuICAgIF8uaW52b2tlKGdsb2JhbFN0YXRlLmxvZ2dlcnMsICdkaXNhYmxlJylcbiAgfVxuXG4gIGRyaWZ0d29vZC5kZXN0cm95ID0gZnVuY3Rpb24gZGVzdHJveUFsbCAoKSB7XG4gICAgd2hpbGUgKGdsb2JhbFN0YXRlLmxvZ2dlcnMubGVuZ3RoKSBnbG9iYWxTdGF0ZS5sb2dnZXJzLnBvcCgpLmRlc3Ryb3koKVxuICB9XG5cbiAgZHJpZnR3b29kLkxFVkVMUyA9IExFVkVMU1xuXG4gIHJldHVybiBkcmlmdHdvb2RcblxuICBmdW5jdGlvbiBkcmlmdHdvb2QgKG5hbWUsIGFkZGl0aW9uYWxMb2dnZXJzLCBpbnRlcmNlcHRvcnMpIHtcbiAgICBpZiAoIW5hbWUpIHRocm93IG5ldyBFcnJvcignbmFtZSByZXF1aXJlZCcpXG4gICAgdmFyIGNvbmZpZyA9IHBhdHRlcm5zLmdldCgpXG4gICAgdmFyIHN0YXRlID0ge1xuICAgICAgZW5hYmxlZDogZ2xvYmFsU3RhdGUuZW5hYmxlZCB8fCBwYXR0ZXJucy5tYXRjaChuYW1lLCBjb25maWcpLFxuICAgICAgbGV2ZWw6IHBhdHRlcm5zLmdldExldmVsKG5hbWUsIGNvbmZpZyksXG4gICAgICBjaGlsZHJlbjogW11cbiAgICB9XG4gICAgdmFyIGxvZ2dlciA9IGFkZGl0aW9uYWxMb2dnZXJzICYmIGFkZGl0aW9uYWxMb2dnZXJzLmxlbmd0aCA+IDBcbiAgICAgID8gY29tcG9zZShwcmltYXJ5TG9nZ2VyLCBhZGRpdGlvbmFsTG9nZ2VycylcbiAgICAgIDogcHJpbWFyeUxvZ2dlclxuXG4gICAgdmFyIGxvZyA9IGZ1bmN0aW9uIGNyZWF0ZUxvZ2dlciAobG9nTmFtZSwgZXh0cmFBZGRpdGlvbmFsTG9nZ2VycywgZXh0cmFJbnRlcmNlcHRvcnMpIHtcbiAgICAgIGlmIChsb2cuZW5hYmxlID09PSBub29wKSB0aHJvdyBuZXcgRXJyb3IobmFtZSArICcgd2FzIGRlc3Ryb3llZCcpXG4gICAgICB2YXIgY2hpbGRMb2cgPSBkcmlmdHdvb2QoXG4gICAgICAgIG5hbWUgKyAnOicgKyBsb2dOYW1lLFxuICAgICAgICAoYWRkaXRpb25hbExvZ2dlcnMgfHwgW10pLmNvbmNhdChleHRyYUFkZGl0aW9uYWxMb2dnZXJzIHx8IFtdKSxcbiAgICAgICAgKGludGVyY2VwdG9ycyB8fCBbXSkuY29uY2F0KGV4dHJhSW50ZXJjZXB0b3JzIHx8IFtdKVxuICAgICAgKVxuICAgICAgaWYgKHN0YXRlLmVuYWJsZWQpIGNoaWxkTG9nLmVuYWJsZShzdGF0ZS5mbGFncylcbiAgICAgIHN0YXRlLmNoaWxkcmVuLnB1c2goY2hpbGRMb2cpXG4gICAgICByZXR1cm4gY2hpbGRMb2dcbiAgICB9XG5cbiAgICBsb2cuZW5hYmxlID0gZnVuY3Rpb24gZW5hYmxlTG9nIChmbGFncykge1xuICAgICAgc3RhdGUuZW5hYmxlZCA9IHRydWVcbiAgICAgIHN0YXRlLmZsYWdzID0gZmxhZ3NcbiAgICAgIGlmIChmbGFncykgc3RhdGUubGV2ZWwgPSBwYXR0ZXJucy5nZXRMZXZlbChuYW1lLCBmbGFncylcbiAgICAgIGNyZWF0ZUFQSSgpXG4gICAgICBfLmludm9rZShzdGF0ZS5jaGlsZHJlbiwgJ2VuYWJsZScsIGZsYWdzKVxuICAgIH1cblxuICAgIGxvZy5kaXNhYmxlID0gZnVuY3Rpb24gZGlzYWJsZUxvZyAoKSB7XG4gICAgICBzdGF0ZS5lbmFibGVkID0gZmFsc2VcbiAgICAgIGNyZWF0ZUFQSSgpXG4gICAgICBfLmludm9rZShzdGF0ZS5jaGlsZHJlbiwgJ2Rpc2FibGUnKVxuICAgIH1cblxuICAgIGxvZy5kZXN0cm95ID0gZnVuY3Rpb24gZGVzdHJveUxvZyAoKSB7XG4gICAgICBsb2cuZW5hYmxlID0gbm9vcFxuICAgICAgbG9nLmRpc2FibGUoKVxuICAgICAgZ2xvYmFsU3RhdGUubG9nZ2VycyA9IF8uZmlsdGVyKGdsb2JhbFN0YXRlLmxvZ2dlcnMsIGZ1bmN0aW9uIChsb2dnZXIpIHtcbiAgICAgICAgcmV0dXJuIGxvZ2dlciAhPT0gbG9nXG4gICAgICB9KVxuICAgICAgd2hpbGUgKHN0YXRlLmNoaWxkcmVuLmxlbmd0aCkgc3RhdGUuY2hpbGRyZW4ucG9wKCkuZGVzdHJveSgpXG4gICAgfVxuXG4gICAgY3JlYXRlQVBJKClcbiAgICBnbG9iYWxTdGF0ZS5sb2dnZXJzLnB1c2gobG9nKVxuICAgIHJldHVybiBsb2dcblxuICAgIGZ1bmN0aW9uIGludGVyY2VwdCAoYXJncykge1xuICAgICAgaWYgKGludGVyY2VwdG9ycyAmJiBpbnRlcmNlcHRvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGludGVyY2VwdG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBpbnRlcmNlcHRvcnNbaV0uYXBwbHkodW5kZWZpbmVkLCBhcmdzKVxuICAgICAgICAgIGlmIChfLmlzQXJyYXkocmVzdWx0KSAmJiByZXN1bHQubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICBhcmdzID0gcmVzdWx0XG4gICAgICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KHJlc3VsdCkpIHtcbiAgICAgICAgICAgIGFyZ3NbM10gPSByZXN1bHRcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXN1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBhcmdzWzNdLm1lc3NhZ2UgPSByZXN1bHRcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBhcmdzXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlQVBJICgpIHtcbiAgICAgIF8uZWFjaChMRVZFTFMuTkFNRVMsIGZ1bmN0aW9uIGFkZExldmVsTG9nZ2VyIChsb2dMZXZlbCkge1xuICAgICAgICB2YXIgaW5kZXggPSBMRVZFTFMuSU5ERVhbbG9nTGV2ZWxdXG4gICAgICAgIGxvZ1tsb2dMZXZlbF0gPSBzdGF0ZS5lbmFibGVkXG4gICAgICAgICAgPyBmdW5jdGlvbiBsZXZlbExvZ2dlciAoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gTEVWRUxTLklOREVYW3N0YXRlLmxldmVsXSkge1xuICAgICAgICAgICAgICB2YXIgYXJncyA9IFtuYW1lLCBsb2dMZXZlbCwgbmV3IERhdGUoKSwgYXJnc1RvQ29tcG9uZW50cyhhcmd1bWVudHMpXVxuICAgICAgICAgICAgICBhcmdzID0gaW50ZXJjZXB0KGFyZ3MpXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmFwcGx5KHVuZGVmaW5lZCwgYXJncylcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIDogbm9vcFxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBERUZBVUxUOiAnaW5mbycsXG4gIE5BTUVTOiBbJ3RyYWNlJywgJ2RlYnVnJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddLFxuICBJTkRFWDoge31cbn1cblxuZm9yICh2YXIgaSA9IDA7IGkgPCBtb2R1bGUuZXhwb3J0cy5OQU1FUy5sZW5ndGg7IGkrKykge1xuICBtb2R1bGUuZXhwb3J0cy5JTkRFWFttb2R1bGUuZXhwb3J0cy5OQU1FU1tpXV0gPSBpXG59XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcbnZhciBMRVZFTFMgPSByZXF1aXJlKCcuLi9sZXZlbHMnKVxudmFyIHJpZ2h0UGFkID0gcmVxdWlyZSgnLi4vdXRpbHMvcmlnaHRQYWQnKVxudmFyIGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZVxuXG52YXIgbGV2ZWxDb2xvcnMgPSB7XG4gIHRyYWNlOiAnIzZDN0E4OScsXG4gIGRlYnVnOiAnIzg3RDM3QycsXG4gIGluZm86ICcjNDQ2Q0IzJyxcbiAgd2FybjogJyNFODdFMDQnLFxuICBlcnJvcjogJyNGMjI2MTMnXG59XG5cbi8qKlxuICogR2VuZXJhdGUgdGhlIGhleCBmb3IgYSByZWFkYWJsZSBjb2xvciBhZ2FpbnN0IGEgd2hpdGUgYmFja2dyb3VuZFxuICoqL1xuZnVuY3Rpb24gcmFuZG9tUmVhZGFibGVDb2xvciAoKSB7XG4gIHZhciBoID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzYwKVxuICB2YXIgcyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCkgKyAnJSdcbiAgdmFyIGwgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2NikgKyAnJSdcblxuICByZXR1cm4gWyAnaHNsKCcsIGgsICcsJywgcywgJywnLCBsLCAnKScgXS5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBjb25zb2xlU3VwcG9ydHNBbGxMZXZlbHMgKCkge1xuICByZXR1cm4gIV8uZmluZChMRVZFTFMuTkFNRVMsIGZ1bmN0aW9uIChsZXZlbCkge1xuICAgIHJldHVybiAhY29uc29sZVtsZXZlbF1cbiAgfSlcbn1cblxuZnVuY3Rpb24gY29uc29sZVN1cHBvcnRzR3JvdXBpbmcgKCkge1xuICByZXR1cm4gY29uc29sZS5ncm91cENvbGxhcHNlZCAmJiBjb25zb2xlLmdyb3VwRW5kXG59XG5cbi8qKlxuICogUHJhY3RpY2FsbHkgaXMgdGhlcmUgYSBnb29kIGNoYW5jZSBpdCBzdXBwb3J0cyBDU1M/XG4gKiovXG5mdW5jdGlvbiBjb25zb2xlSXNGYW5jeSAoKSB7XG4gIHJldHVybiBjb25zb2xlLnRpbWVsaW5lICYmIGNvbnNvbGUudGFibGUgJiYgIXdpbmRvdy5fX2thcm1hX19cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBicm93c2VyTG9nZ2VyICgpIHtcbiAgaWYgKCFjb25zb2xlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5vb3AgKCkgeyB9XG4gIH1cblxuICB2YXIgYWxsTGV2ZWxzID0gY29uc29sZVN1cHBvcnRzQWxsTGV2ZWxzKClcbiAgdmFyIGdyb3VwaW5nID0gY29uc29sZVN1cHBvcnRzR3JvdXBpbmcoKVxuICB2YXIgaXNGYW5jeSA9IGNvbnNvbGVJc0ZhbmN5KClcbiAgdmFyIGNvbG9yID0gcmFuZG9tUmVhZGFibGVDb2xvcigpXG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGxvZyAobmFtZSwgbGV2ZWwsIG5vdywgY29tcG9uZW50cykge1xuICAgIGlmIChncm91cGluZyAmJiBjb21wb25lbnRzLm1ldGFkYXRhKSB7XG4gICAgICBpZiAoaXNGYW5jeSkge1xuICAgICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkLmFwcGx5KGNvbnNvbGUsIGZvcm1hdEZhbmN5TWVzc2FnZSgpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZChmb3JtYXRNZXNzYWdlKCkpXG4gICAgICB9XG5cbiAgICAgIF8ub2JqZWN0RWFjaChjb21wb25lbnRzLm1ldGFkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICBjb25zb2xlLmxvZyhrZXksIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgY29uc29sZS5ncm91cEVuZCgpXG4gICAgfSBlbHNlIGlmIChjb21wb25lbnRzLm1lc3NhZ2UpIHtcbiAgICAgIGlmIChhbGxMZXZlbHMpIHtcbiAgICAgICAgaWYgKGlzRmFuY3kpIHtcbiAgICAgICAgICBjb25zb2xlW2xldmVsXS5hcHBseShjb25zb2xlLCBmb3JtYXRGYW5jeU1lc3NhZ2UoKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlW2xldmVsXShmb3JtYXRNZXNzYWdlKCkpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGp1c3QgdXNlIGNvbnNvbGUubG9nXG4gICAgICAgIGNvbnNvbGUubG9nKGZvcm1hdE1lc3NhZ2UoKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29tcG9uZW50cy5lcnJvcikge1xuICAgICAgaWYgKGFsbExldmVscykge1xuICAgICAgICBjb25zb2xlLmVycm9yKGNvbXBvbmVudHMuZXJyb3IpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhjb21wb25lbnRzLmVycm9yKVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2UgKCkge1xuICAgICAgcmV0dXJuIHJpZ2h0UGFkKGxldmVsLnRvVXBwZXJDYXNlKCksIDUpICsgJyBbJyArIG5hbWUgKyAnXTogJyArIGNvbXBvbmVudHMubWVzc2FnZVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdEZhbmN5TWVzc2FnZSAoKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICAnJWMnICsgcmlnaHRQYWQobGV2ZWwudG9VcHBlckNhc2UoKSwgNSkgKyAnJWMgJWNbJyArIG5hbWUgKyAnXSVjOiAnICsgY29tcG9uZW50cy5tZXNzYWdlLFxuICAgICAgICAnZm9udC13ZWlnaHQ6Ym9sZDtjb2xvcjonICsgbGV2ZWxDb2xvcnNbbGV2ZWxdICsgJzsnLFxuICAgICAgICAnJyxcbiAgICAgICAgJ2ZvbnQtd2VpZ2h0OmJvbGQ7Y29sb3I6JyArIGNvbG9yICsgJzsnLFxuICAgICAgICAnJ1xuICAgICAgXVxuICAgIH1cbiAgfVxufVxuXG4vLyBSZXdpcmUgZG9lc24ndCB3b3JrIGluIElFOCBhbmQgaW5qZWN0LWxvYWRlciBkb2Vzbid0IHdvcmsgaW4gbm9kZSwgc28gd2UgaGF2ZVxuLy8gdG8gZXhwb3NlIG91ciBvd24gc3R1YmJpbmcgbWV0aG9kXG5tb2R1bGUuZXhwb3J0cy5fX3N0dWJDb25zb2xlX18gPSBmdW5jdGlvbiAoc3R1Yikge1xuICB2YXIgb2xkQ29uc29sZSA9IGNvbnNvbGVcbiAgY29uc29sZSA9IHN0dWIgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICByZXR1cm4gZnVuY3Rpb24gcmVzZXQgKCkge1xuICAgIGNvbnNvbGUgPSBvbGRDb25zb2xlIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgfVxufVxuIiwidmFyIF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG52YXIgSlNPTiA9IHJlcXVpcmUoJ2pzb24tYm91cm5lJylcbnZhciBzdG9yYWdlID0gcmVxdWlyZSgnLi9zdG9yYWdlJylcbnZhciBMRVZFTFMgPSByZXF1aXJlKCcuL2xldmVscycpXG5cbmZ1bmN0aW9uIGdldCAoKSB7XG4gIHRyeSB7XG4gICAgdmFyIHBheWxvYWQgPSBzdG9yYWdlLmdldCgpXG4gICAgcmV0dXJuIHBheWxvYWQgJiYgSlNPTi5wYXJzZShwYXlsb2FkKSB8fCB7fVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHt9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0IChwYXR0ZXJucywgb3B0cykge1xuICB0cnkge1xuICAgIHZhciBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkocGF0dGVybnMpXG4gICAgc3RvcmFnZS5zZXQocGF5bG9hZCwgb3B0cylcbiAgfSBjYXRjaCAoZSkgeyB9XG59XG5cbmZ1bmN0aW9uIG1hdGNoIChuYW1lLCBmbGFncykge1xuICB2YXIgcGF0dGVybnMgPSBfLmtleXMoZmxhZ3MpXG4gIHJldHVybiAhIV8uZmluZChwYXR0ZXJucywgZnVuY3Rpb24gKHBhdHRlcm4pIHtcbiAgICByZXR1cm4gdGVzdChwYXR0ZXJuLCBuYW1lKVxuICB9KVxufVxuXG5mdW5jdGlvbiBnZXRMZXZlbCAobmFtZSwgZmxhZ3MpIHtcbiAgZm9yICh2YXIgcGF0dGVybiBpbiBmbGFncykge1xuICAgIGlmICh0ZXN0KHBhdHRlcm4sIG5hbWUpKSByZXR1cm4gZmxhZ3NbcGF0dGVybl0gfHwgTEVWRUxTLkRFRkFVTFRcbiAgfVxuICByZXR1cm4gTEVWRUxTLkRFRkFVTFRcbn1cblxuZnVuY3Rpb24gdGVzdCAocGF0dGVybiwgbmFtZSkge1xuICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKCdeJyArIHBhdHRlcm4ucmVwbGFjZSgvXFwqL2csICcuKicpICsgJyQnKVxuICByZXR1cm4gcmVnZXgudGVzdChuYW1lKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0OiBnZXQsXG4gIHNldDogc2V0LFxuICBtYXRjaDogbWF0Y2gsXG4gIGdldExldmVsOiBnZXRMZXZlbFxufVxuIiwidmFyIF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG5cbnZhciBTVE9SQUdFX05BTUVTUEFDRSA9ICdxdWJpdF9sb2dnZXInXG52YXIgVEVTVF9LRVkgPSAnX19kd1Rlc3RfXydcblxudmFyIG1lbW9yeVN0b3JhZ2UgPSAnJ1xuXG5mdW5jdGlvbiBoYXNMb2NhbFN0b3JhZ2UgKCkge1xuICB0cnkge1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShURVNUX0tFWSwgMSlcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oVEVTVF9LRVkpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldCAodmFsdWUsIG9wdHMpIHtcbiAgb3B0cyA9IF8uYXNzaWduKHtcbiAgICBwZXJzaXN0OiBmYWxzZVxuICB9LCBvcHRzKVxuXG4gIGlmIChvcHRzLnBlcnNpc3QgJiYgaGFzTG9jYWxTdG9yYWdlKCkpIHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oU1RPUkFHRV9OQU1FU1BBQ0UsIHZhbHVlKVxuICB9IGVsc2Uge1xuICAgIG1lbW9yeVN0b3JhZ2UgPSB2YWx1ZVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldCAoKSB7XG4gIGlmIChtZW1vcnlTdG9yYWdlIHx8ICFoYXNMb2NhbFN0b3JhZ2UoKSkge1xuICAgIHJldHVybiBtZW1vcnlTdG9yYWdlXG4gIH0gZWxzZSBpZiAoaGFzTG9jYWxTdG9yYWdlKCkpIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFNUT1JBR0VfTkFNRVNQQUNFKSB8fCAnJ1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc2V0ICgpIHtcbiAgaWYgKGhhc0xvY2FsU3RvcmFnZSgpKSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFNUT1JBR0VfTkFNRVNQQUNFKVxuICB9XG4gIG1lbW9yeVN0b3JhZ2UgPSAnJ1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBzZXQsXG4gIGdldDogZ2V0LFxuICByZXNldDogcmVzZXRcbn1cbiIsIi8qXG4gIExhc3QgYXJnIGNhbiBiZSBhbiBlcnJvciBvciBhbiBvYmplY3QuIEFsbCBvdGhlclxuICBhcmdzIHdpbGwgYmUgam9pbmVkIGludG8gYSBzdHJpbmcsIGRlbGltaXRlZCBieVxuICBhIHNwYWNlLlxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXJnc1RvQ29tcG9uZW50cyAoYXJncykge1xuICBhcmdzID0gW10uc2xpY2UuYXBwbHkoYXJncylcbiAgdmFyIGxhc3RBcmcgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV1cblxuICB2YXIgaXNFcnJvciA9IGxhc3RBcmcgaW5zdGFuY2VvZiBFcnJvciB8fCBpc0Vycm9yTGlrZShsYXN0QXJnKVxuICB2YXIgaXNNZXRhZGF0YSA9ICFpc0Vycm9yICYmIGxhc3RBcmcgJiYgdHlwZW9mIGxhc3RBcmcgPT09ICdvYmplY3QnXG5cbiAgdmFyIG1lc3NhZ2VQYXJ0cyA9IGlzRXJyb3IgfHwgaXNNZXRhZGF0YSA/IGFyZ3Muc2xpY2UoMCwgLTEpIDogYXJnc1xuICB2YXIgbWVzc2FnZSA9IG1lc3NhZ2VQYXJ0cy5qb2luKCcgJylcblxuICAvLyBIYW5kbGUgbG9nLmRlYnVnKHsgZm9vOiAnYmFyJyB9KVxuICBpZiAoaXNNZXRhZGF0YSAmJiAhbWVzc2FnZSkge1xuICAgIG1lc3NhZ2UgPSAnbWV0YWRhdGE6J1xuICB9XG5cbiAgLy8gSGFuZGxlIGxvZy5kZWJ1ZyhuZXcgRXJyb3IoKSlcbiAgaWYgKGlzRXJyb3IgJiYgIW1lc3NhZ2UpIHtcbiAgICBtZXNzYWdlID0gbGFzdEFyZy5tZXNzYWdlXG4gIH1cblxuICB2YXIgY29tcG9uZW50cyA9IHtcbiAgICBtZXNzYWdlOiBtZXNzYWdlXG4gIH1cblxuICBpZiAoaXNFcnJvciAmJiBsYXN0QXJnKSBjb21wb25lbnRzLmVycm9yID0gbGFzdEFyZ1xuICBpZiAoaXNNZXRhZGF0YSAmJiBsYXN0QXJnKSBjb21wb25lbnRzLm1ldGFkYXRhID0gbGFzdEFyZ1xuXG4gIHJldHVybiBjb21wb25lbnRzXG59XG5cbi8vIEluIHNvbWUgZW52aXJvbm1lbnRzLCBlcnJvcnMgZG9lc24ndCBwcm9wZXJseSBpbmhlcml0IGZyb20gYEVycm9yYFxuZnVuY3Rpb24gaXNFcnJvckxpa2UgKHRoaW5nKSB7XG4gIHJldHVybiB0aGluZyAmJiAhIXRoaW5nLnN0YWNrICYmICEhdGhpbmcubWVzc2FnZVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVDb21wb3NpdGVMb2dnZXIgKHByaW1hcnlMb2dnZXIsIGFkZGl0aW9uYWxMb2dnZXJzKSB7XG4gIHZhciBsb2dnZXJzID0gW3ByaW1hcnlMb2dnZXJdLmNvbmNhdChhZGRpdGlvbmFsTG9nZ2VycylcbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbXBvc2l0ZUxvZ2dlciAobmFtZSwgbGV2ZWwsIGRhdGUsIGNvbXBvbmVudHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvZ2dlcnMubGVuZ3RoOyBpKyspIGxvZ2dlcnNbaV0obmFtZSwgbGV2ZWwsIGRhdGUsIGNvbXBvbmVudHMpXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmlnaHRQYWQgKHN0cmluZywgdG90YWwpIHtcbiAgdmFyIGkgPSAtMVxuICB2YXIgcmVtYWluaW5nID0gdG90YWwgLSBzdHJpbmcubGVuZ3RoXG4gIHdoaWxlICgrK2kgPCByZW1haW5pbmcpIHtcbiAgICBzdHJpbmcgKz0gJyAnXG4gIH1cbiAgcmV0dXJuIHN0cmluZ1xufVxuIiwiLyogZ2xvYmFsIGRlZmluZSAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tZXh0ZW5kLW5hdGl2ZSAqL1xuXG52YXIganNvbkJvdXJuZSA9IHtcbiAgc3RyaW5naWZ5OiBmdW5jdGlvbiBzdHJpbmdpZnkgKCkge1xuICAgIHZhciBlcnJvciwgcmVzdWx0XG4gICAgdmFyIHByb3RvdHlwZXMgPSBub3JtYWxpemVQcm90b3R5cGVzKClcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkuYXBwbHkoSlNPTiwgYXJndW1lbnRzKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGVycm9yID0gZVxuICAgIH1cbiAgICBwcm90b3R5cGVzLnJlc3RvcmUoKVxuICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3JcbiAgICByZXR1cm4gcmVzdWx0XG4gIH0sXG4gIHBhcnNlOiBmdW5jdGlvbiBwYXJzZSAoKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UuYXBwbHkoSlNPTiwgYXJndW1lbnRzKVxuICB9XG59XG5cbmlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGpzb25Cb3VybmVcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gIGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGpzb25Cb3VybmVcbiAgfSlcbn0gZWxzZSB7XG4gIHdpbmRvdy5qc29uQm91cm5lID0ganNvbkJvdXJuZVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVQcm90b3R5cGVzICgpIHtcbiAgdmFyIGFycmF5VG9KU09OID0gQXJyYXkucHJvdG90eXBlLnRvSlNPTlxuICB2YXIgZGF0ZVRvSlNPTiA9IERhdGUucHJvdG90eXBlLnRvSlNPTlxuICBkZWxldGUgQXJyYXkucHJvdG90eXBlLnRvSlNPTlxuICBEYXRlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRvSXNvRGF0ZSh0aGlzKVxuICB9XG4gIHJldHVybiB7XG4gICAgcmVzdG9yZTogZnVuY3Rpb24gcmVzdG9yZSAoKSB7XG4gICAgICBpZiAoYXJyYXlUb0pTT04gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBBcnJheS5wcm90b3R5cGUudG9KU09OID0gYXJyYXlUb0pTT05cbiAgICAgIH1cbiAgICAgIGlmIChkYXRlVG9KU09OICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgRGF0ZS5wcm90b3R5cGUudG9KU09OID0gZGF0ZVRvSlNPTlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVsZXRlIERhdGUucHJvdG90eXBlLnRvSlNPTlxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiB0b0lzb0RhdGUgKGRhdGUpIHtcbiAgcmV0dXJuIGlzRmluaXRlKGRhdGUudmFsdWVPZigpKSA/XG4gICAgZGF0ZS5nZXRVVENGdWxsWWVhcigpICsgJy0nICtcbiAgICBwYWQoZGF0ZS5nZXRVVENNb250aCgpICsgMSwgMikgKyAnLScgK1xuICAgIHBhZChkYXRlLmdldFVUQ0RhdGUoKSwgMikgKyAnVCcgK1xuICAgIHBhZChkYXRlLmdldFVUQ0hvdXJzKCksIDIpICsgJzonICtcbiAgICBwYWQoZGF0ZS5nZXRVVENNaW51dGVzKCksIDIpICsgJzonICtcbiAgICBwYWQoZGF0ZS5nZXRVVENTZWNvbmRzKCksIDIpICsgJy4nICtcbiAgICBwYWQoZGF0ZS5nZXRVVENNaWxsaXNlY29uZHMoKSwgMykgKyAnWicgOiBudWxsXG59XG5cbmZ1bmN0aW9uIHBhZCAobnVtYmVyKSB7XG4gIHZhciByID0gU3RyaW5nKG51bWJlcilcbiAgaWYgKHIubGVuZ3RoID09PSAxKSB7XG4gICAgciA9ICcwJyArIHJcbiAgfVxuICByZXR1cm4gclxufVxuIiwidmFyIHRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG52YXIgcmVnZXhwQ2hhcmFjdGVycyA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZ1xudmFyIHJlZ2V4cElzTmF0aXZlRm4gPSB0b1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KVxuICAucmVwbGFjZShyZWdleHBDaGFyYWN0ZXJzLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpXG52YXIgcmVnZXhwSXNOYXRpdmUgPSBSZWdFeHAoJ14nICsgcmVnZXhwSXNOYXRpdmVGbiArICckJylcbmZ1bmN0aW9uIHRvU291cmNlIChmdW5jKSB7XG4gIGlmICghZnVuYykgcmV0dXJuICcnXG4gIHRyeSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoZnVuYylcbiAgfSBjYXRjaCAoZSkge31cbiAgdHJ5IHtcbiAgICByZXR1cm4gKGZ1bmMgKyAnJylcbiAgfSBjYXRjaCAoZSkge31cbn1cbnZhciBhc3NpZ24gPSBPYmplY3QuYXNzaWduXG52YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoXG52YXIgZXZlcnkgPSBBcnJheS5wcm90b3R5cGUuZXZlcnlcbnZhciBmaWx0ZXIgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyXG52YXIgZmluZCA9IEFycmF5LnByb3RvdHlwZS5maW5kXG52YXIgaW5kZXhPZiA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXlcbnZhciBrZXlzID0gT2JqZWN0LmtleXNcbnZhciBtYXAgPSBBcnJheS5wcm90b3R5cGUubWFwXG52YXIgcmVkdWNlID0gQXJyYXkucHJvdG90eXBlLnJlZHVjZVxudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlXG52YXIgc29tZSA9IEFycmF5LnByb3RvdHlwZS5zb21lXG52YXIgdmFsdWVzID0gT2JqZWN0LnZhbHVlc1xuZnVuY3Rpb24gaXNOYXRpdmUgKG1ldGhvZCkge1xuICByZXR1cm4gbWV0aG9kICYmIHR5cGVvZiBtZXRob2QgPT09ICdmdW5jdGlvbicgJiYgcmVnZXhwSXNOYXRpdmUudGVzdCh0b1NvdXJjZShtZXRob2QpKVxufVxudmFyIF8gPSB7XG4gIGFzc2lnbjogaXNOYXRpdmUoYXNzaWduKVxuICAgID8gYXNzaWduXG4gICAgOiBmdW5jdGlvbiBhc3NpZ24gKHRhcmdldCkge1xuICAgICAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG4gICAgICAgIGZvciAodmFyIGogaW4gc291cmNlKSBpZiAoc291cmNlLmhhc093blByb3BlcnR5KGopKSB0YXJnZXRbal0gPSBzb3VyY2Vbal1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0YXJnZXRcbiAgICB9LFxuICBiaW5kOiBmdW5jdGlvbiBiaW5kIChtZXRob2QsIGNvbnRleHQpIHtcbiAgICB2YXIgYXJncyA9IF8uc2xpY2UoYXJndW1lbnRzLCAyKVxuICAgIHJldHVybiBmdW5jdGlvbiBib3VuZEZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncy5jb25jYXQoXy5zbGljZShhcmd1bWVudHMpKSlcbiAgICB9XG4gIH0sXG4gIGRlYm91bmNlOiBmdW5jdGlvbiBkZWJvdW5jZSAoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXRcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzXG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50c1xuICAgICAgdmFyIGxhdGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbFxuICAgICAgICBpZiAoIWltbWVkaWF0ZSkgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxuICAgICAgfVxuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXRcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KVxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpXG4gICAgICBpZiAoY2FsbE5vdykgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxuICAgIH1cbiAgfSxcbiAgZWFjaDogaXNOYXRpdmUoZm9yRWFjaClcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUVhY2ggKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZvckVhY2guY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZWFjaCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgIH0sXG4gIGV2ZXJ5OiBpc05hdGl2ZShldmVyeSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUV2ZXJ5IChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZXZlcnkuY2FsbChjb2xsLCBwcmVkLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGV2ZXJ5IChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWNvbGwgfHwgIXByZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpXG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbGwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCFwcmVkLmNhbGwoY29udGV4dCwgY29sbFtpXSwgaSwgY29sbCkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuICBmaWx0ZXI6IGlzTmF0aXZlKGZpbHRlcilcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUZpbHRlciAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZmlsdGVyLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGZpbHRlciAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgdmFyIG91dHB1dCA9IFtdXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpKSBvdXRwdXQucHVzaChhcnJheVtpXSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXRcbiAgICB9LFxuICBmaW5kOiBpc05hdGl2ZShmaW5kKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRmluZCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZmluZC5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBmaW5kIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpKSByZXR1cm4gYXJyYXlbaV1cbiAgICAgIH1cbiAgICB9LFxuICBnZXQ6IGZ1bmN0aW9uIGdldCAob2JqZWN0LCBwYXRoKSB7XG4gICAgcmV0dXJuIF8ucmVkdWNlKHBhdGguc3BsaXQoJy4nKSwgZnVuY3Rpb24gKG1lbW8sIG5leHQpIHtcbiAgICAgIHJldHVybiAodHlwZW9mIG1lbW8gIT09ICd1bmRlZmluZWQnICYmIG1lbW8gIT09IG51bGwpID8gbWVtb1tuZXh0XSA6IHVuZGVmaW5lZFxuICAgIH0sIG9iamVjdClcbiAgfSxcbiAgaWRlbnRpdHk6IGZ1bmN0aW9uIGlkZW50aXR5ICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuICBpbmRleE9mOiBpc05hdGl2ZShpbmRleE9mKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlSW5kZXhPZiAoYXJyYXksIGl0ZW0pIHtcbiAgICAgIHJldHVybiBpbmRleE9mLmNhbGwoYXJyYXksIGl0ZW0pXG4gICAgfVxuICAgIDogZnVuY3Rpb24gaW5kZXhPZiAoYXJyYXksIGl0ZW0pIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpXG4gICAgICB9XG4gICAgICByZXR1cm4gLTFcbiAgICB9LFxuICBpbnZva2U6IGZ1bmN0aW9uIGludm9rZSAoYXJyYXksIG1ldGhvZE5hbWUpIHtcbiAgICB2YXIgYXJncyA9IF8uc2xpY2UoYXJndW1lbnRzLCAyKVxuICAgIHJldHVybiBfLm1hcChhcnJheSwgZnVuY3Rpb24gaW52b2tlTWFwcGVyICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlW21ldGhvZE5hbWVdLmFwcGx5KHZhbHVlLCBhcmdzKVxuICAgIH0pXG4gIH0sXG4gIGlzQXJyYXk6IGlzTmF0aXZlKGlzQXJyYXkpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVBcnJheSAoY29sbCkge1xuICAgICAgcmV0dXJuIGlzQXJyYXkoY29sbClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBpc0FycmF5IChvYmopIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICAgIH0sXG4gIGlzTWF0Y2g6IGZ1bmN0aW9uIGlzTWF0Y2ggKG9iaiwgc3BlYykge1xuICAgIGZvciAodmFyIGkgaW4gc3BlYykge1xuICAgICAgaWYgKHNwZWMuaGFzT3duUHJvcGVydHkoaSkgJiYgb2JqW2ldICE9PSBzcGVjW2ldKSByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uIGlzT2JqZWN0IChvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmpcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9ialxuICB9LFxuICBrZXlzOiBpc05hdGl2ZShrZXlzKVxuICAgID8ga2V5c1xuICAgIDogZnVuY3Rpb24ga2V5cyAob2JqZWN0KSB7XG4gICAgICB2YXIga2V5cyA9IFtdXG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkga2V5cy5wdXNoKGtleSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBrZXlzXG4gICAgfSxcbiAgbWFwOiBpc05hdGl2ZShtYXApXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVNYXAgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIG1hcC5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBtYXAgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIHZhciBvdXRwdXQgPSBuZXcgQXJyYXkobClcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG91dHB1dFtpXSA9IGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgIH0sXG4gIG1hdGNoZXM6IGZ1bmN0aW9uIG1hdGNoZXMgKHNwZWMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIF8uaXNNYXRjaChvYmosIHNwZWMpXG4gICAgfVxuICB9LFxuICBub3Q6IGZ1bmN0aW9uIG5vdCAodmFsdWUpIHtcbiAgICByZXR1cm4gIXZhbHVlXG4gIH0sXG4gIG9iamVjdEVhY2g6IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZWFjaChfLmtleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgb2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KVxuICAgIH0sIGNvbnRleHQpXG4gIH0sXG4gIG9iamVjdE1hcDogZnVuY3Rpb24gb2JqZWN0TWFwIChvYmplY3QsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gY2FsbGJhY2suY2FsbChjb250ZXh0LCBvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfSxcbiAgb2JqZWN0UmVkdWNlOiBmdW5jdGlvbiBvYmplY3RSZWR1Y2UgKG9iamVjdCwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSkge1xuICAgIHZhciBvdXRwdXQgPSBpbml0aWFsVmFsdWVcbiAgICBmb3IgKHZhciBpIGluIG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShpKSkgb3V0cHV0ID0gY2FsbGJhY2sob3V0cHV0LCBvYmplY3RbaV0sIGksIG9iamVjdClcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dFxuICB9LFxuICBwaWNrOiBmdW5jdGlvbiBwaWNrIChvYmplY3QsIHRvUGljaykge1xuICAgIHZhciBvdXQgPSB7fVxuICAgIF8uZWFjaCh0b1BpY2ssIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICh0eXBlb2Ygb2JqZWN0W2tleV0gIT09ICd1bmRlZmluZWQnKSBvdXRba2V5XSA9IG9iamVjdFtrZXldXG4gICAgfSlcbiAgICByZXR1cm4gb3V0XG4gIH0sXG4gIHBsdWNrOiBmdW5jdGlvbiBwbHVjayAoYXJyYXksIGtleSkge1xuICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgdmFyIG91dCA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIGlmIChhcnJheVtpXSkgb3V0W2ldID0gYXJyYXlbaV1ba2V5XVxuICAgIHJldHVybiBvdXRcbiAgfSxcbiAgcmVkdWNlOiBpc05hdGl2ZShyZWR1Y2UpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVSZWR1Y2UgKGFycmF5LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKSB7XG4gICAgICByZXR1cm4gcmVkdWNlLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gcmVkdWNlIChhcnJheSwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSkge1xuICAgICAgdmFyIG91dHB1dCA9IGluaXRpYWxWYWx1ZVxuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSBvdXRwdXQgPSBjYWxsYmFjayhvdXRwdXQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICAgIHJldHVybiBvdXRwdXRcbiAgICB9LFxuICBzZXQ6IGZ1bmN0aW9uIHNldCAob2JqZWN0LCBwYXRoLCB2YWwpIHtcbiAgICBpZiAoIW9iamVjdCkgcmV0dXJuIG9iamVjdFxuICAgIGlmICh0eXBlb2Ygb2JqZWN0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqZWN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gb2JqZWN0XG4gICAgdmFyIHBhcnRzID0gcGF0aC5zcGxpdCgnLicpXG4gICAgdmFyIGNvbnRleHQgPSBvYmplY3RcbiAgICB2YXIgbmV4dEtleVxuICAgIGRvIHtcbiAgICAgIG5leHRLZXkgPSBwYXJ0cy5zaGlmdCgpXG4gICAgICBpZiAodHlwZW9mIGNvbnRleHRbbmV4dEtleV0gIT09ICdvYmplY3QnKSBjb250ZXh0W25leHRLZXldID0ge31cbiAgICAgIGlmIChwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHRbbmV4dEtleV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRleHRbbmV4dEtleV0gPSB2YWxcbiAgICAgIH1cbiAgICB9IHdoaWxlIChwYXJ0cy5sZW5ndGgpXG4gICAgcmV0dXJuIG9iamVjdFxuICB9LFxuICBzbGljZTogaXNOYXRpdmUoc2xpY2UpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVTbGljZSAoYXJyYXksIGJlZ2luLCBlbmQpIHtcbiAgICAgIGJlZ2luID0gYmVnaW4gfHwgMFxuICAgICAgZW5kID0gdHlwZW9mIGVuZCA9PT0gJ251bWJlcicgPyBlbmQgOiBhcnJheS5sZW5ndGhcbiAgICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBiZWdpbiwgZW5kKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIHNsaWNlIChhcnJheSwgc3RhcnQsIGVuZCkge1xuICAgICAgc3RhcnQgPSBzdGFydCB8fCAwXG4gICAgICBlbmQgPSB0eXBlb2YgZW5kID09PSAnbnVtYmVyJyA/IGVuZCA6IGFycmF5Lmxlbmd0aFxuICAgICAgdmFyIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoXG4gICAgICBpZiAoIWxlbmd0aCkge1xuICAgICAgICByZXR1cm4gW11cbiAgICAgIH1cbiAgICAgIGlmIChzdGFydCA8IDApIHtcbiAgICAgICAgc3RhcnQgPSAtc3RhcnQgPiBsZW5ndGggPyAwIDogKGxlbmd0aCArIHN0YXJ0KVxuICAgICAgfVxuICAgICAgZW5kID0gZW5kID4gbGVuZ3RoID8gbGVuZ3RoIDogZW5kXG4gICAgICBpZiAoZW5kIDwgMCkge1xuICAgICAgICBlbmQgKz0gbGVuZ3RoXG4gICAgICB9XG4gICAgICBsZW5ndGggPSBzdGFydCA+IGVuZCA/IDAgOiAoKGVuZCAtIHN0YXJ0KSA+Pj4gMClcbiAgICAgIHN0YXJ0ID4+Pj0gMFxuICAgICAgdmFyIGluZGV4ID0gLTFcbiAgICAgIHZhciByZXN1bHQgPSBuZXcgQXJyYXkobGVuZ3RoKVxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IGFycmF5W2luZGV4ICsgc3RhcnRdXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSxcbiAgc29tZTogaXNOYXRpdmUoc29tZSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZVNvbWUgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBzb21lLmNhbGwoY29sbCwgcHJlZCwgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBzb21lIChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWNvbGwgfHwgIXByZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpXG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbGwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByZWQuY2FsbChjb250ZXh0LCBjb2xsW2ldLCBpLCBjb2xsKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sXG4gIHVuaXF1ZTogZnVuY3Rpb24gdW5pcXVlIChhcnJheSkge1xuICAgIHJldHVybiBfLnJlZHVjZShhcnJheSwgZnVuY3Rpb24gKG1lbW8sIGN1cnIpIHtcbiAgICAgIGlmIChfLmluZGV4T2YobWVtbywgY3VycikgPT09IC0xKSB7XG4gICAgICAgIG1lbW8ucHVzaChjdXJyKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW9cbiAgICB9LCBbXSlcbiAgfSxcbiAgdmFsdWVzOiBpc05hdGl2ZSh2YWx1ZXMpXG4gICAgPyB2YWx1ZXNcbiAgICA6IGZ1bmN0aW9uIHZhbHVlcyAob2JqZWN0KSB7XG4gICAgICB2YXIgb3V0ID0gW11cbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSBvdXQucHVzaChvYmplY3Rba2V5XSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRcbiAgICB9LFxuICBuYW1lOiAnc2xhcGRhc2gnLFxuICB2ZXJzaW9uOiAnMS4zLjMnXG59XG5fLm9iamVjdE1hcC5hc0FycmF5ID0gZnVuY3Rpb24gb2JqZWN0TWFwQXNBcnJheSAob2JqZWN0LCBjYWxsYmFjaywgY29udGV4dCkge1xuICByZXR1cm4gXy5tYXAoXy5rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suY2FsbChjb250ZXh0LCBvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpXG4gIH0sIGNvbnRleHQpXG59XG5tb2R1bGUuZXhwb3J0cyA9IF9cbiIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzJdLnVzZVsyXSEuL3ZhcmlhdGlvbi5sZXNzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzJdLnVzZVsyXSEuL3ZhcmlhdGlvbi5sZXNzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMl0udXNlWzJdIS4vdmFyaWF0aW9uLmxlc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMl0udXNlWzJdIS4vdmFyaWF0aW9uLmxlc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcblxuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXBkYXRlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cblxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcblxuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cblxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuXG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cblxuICBjc3MgKz0gb2JqLmNzcztcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwidmFyIFByb21pc2UgPSByZXF1aXJlKCcuL2luZGV4Jylcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmZXJyZWQgKCkge1xuICB2YXIgX3Jlc29sdmUsIF9yZWplY3RcbiAgdmFyIF9wcm9taXNlID0gUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgX3Jlc29sdmUgPSByZXNvbHZlXG4gICAgX3JlamVjdCA9IHJlamVjdFxuICB9KVxuICByZXR1cm4ge1xuICAgIHByb21pc2U6IF9wcm9taXNlLFxuICAgIHJlc29sdmU6IF9yZXNvbHZlLFxuICAgIHJlamVjdDogX3JlamVjdFxuICB9XG59XG4iLCJ2YXIgZXJyID0gbmV3IEVycm9yKCdFcnJvcjogcmVjdXJzZXMhIGluZmluaXRlIHByb21pc2UgY2hhaW4gZGV0ZWN0ZWQnKVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwcm9taXNlIChyZXNvbHZlcikge1xuICB2YXIgd2FpdGluZyA9IHsgcmVzOiBbXSwgcmVqOiBbXSB9XG4gIHZhciBwID0ge1xuICAgICd0aGVuJzogdGhlbixcbiAgICAnY2F0Y2gnOiBmdW5jdGlvbiB0aGVuQ2F0Y2ggKG9uUmVqZWN0KSB7XG4gICAgICByZXR1cm4gdGhlbihudWxsLCBvblJlamVjdClcbiAgICB9XG4gIH1cbiAgdHJ5IHsgcmVzb2x2ZXIocmVzb2x2ZSwgcmVqZWN0KSB9IGNhdGNoIChlKSB7XG4gICAgcC5zdGF0dXMgPSBmYWxzZVxuICAgIHAudmFsdWUgPSBlXG4gIH1cbiAgcmV0dXJuIHBcblxuICBmdW5jdGlvbiB0aGVuIChvblJlc29sdmUsIG9uUmVqZWN0KSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgd2FpdGluZy5yZXMucHVzaChoYW5kbGVOZXh0KHAsIHdhaXRpbmcsIG9uUmVzb2x2ZSwgcmVzb2x2ZSwgcmVqZWN0LCBvblJlamVjdCkpXG4gICAgICB3YWl0aW5nLnJlai5wdXNoKGhhbmRsZU5leHQocCwgd2FpdGluZywgb25SZWplY3QsIHJlc29sdmUsIHJlamVjdCwgb25SZWplY3QpKVxuICAgICAgaWYgKHR5cGVvZiBwLnN0YXR1cyAhPT0gJ3VuZGVmaW5lZCcpIGZsdXNoKHdhaXRpbmcsIHApXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmUgKHZhbCkge1xuICAgIGlmICh0eXBlb2YgcC5zdGF0dXMgIT09ICd1bmRlZmluZWQnKSByZXR1cm5cbiAgICBpZiAodmFsID09PSBwKSB0aHJvdyBlcnJcbiAgICBpZiAodmFsKSB0cnkgeyBpZiAodHlwZW9mIHZhbC50aGVuID09PSAnZnVuY3Rpb24nKSByZXR1cm4gdmFsLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KSB9IGNhdGNoIChlKSB7fVxuICAgIHAuc3RhdHVzID0gdHJ1ZVxuICAgIHAudmFsdWUgPSB2YWxcbiAgICBmbHVzaCh3YWl0aW5nLCBwKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVqZWN0ICh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHAuc3RhdHVzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuXG4gICAgaWYgKHZhbCA9PT0gcCkgdGhyb3cgZXJyXG4gICAgcC5zdGF0dXMgPSBmYWxzZVxuICAgIHAudmFsdWUgPSB2YWxcbiAgICBmbHVzaCh3YWl0aW5nLCBwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGZsdXNoICh3YWl0aW5nLCBwKSB7XG4gIHZhciBxdWV1ZSA9IHAuc3RhdHVzID8gd2FpdGluZy5yZXMgOiB3YWl0aW5nLnJlalxuICB3aGlsZSAocXVldWUubGVuZ3RoKSBxdWV1ZS5zaGlmdCgpKHAudmFsdWUpXG59XG5cbmZ1bmN0aW9uIGhhbmRsZU5leHQgKHAsIHdhaXRpbmcsIGhhbmRsZXIsIHJlc29sdmUsIHJlamVjdCwgaGFzUmVqZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbiBuZXh0ICh2YWx1ZSkge1xuICAgIHRyeSB7XG4gICAgICB2YWx1ZSA9IGhhbmRsZXIgPyBoYW5kbGVyKHZhbHVlKSA6IHZhbHVlXG4gICAgICBpZiAocC5zdGF0dXMpIHJldHVybiByZXNvbHZlKHZhbHVlKVxuICAgICAgcmV0dXJuIGhhc1JlamVjdCA/IHJlc29sdmUodmFsdWUpIDogcmVqZWN0KHZhbHVlKVxuICAgIH0gY2F0Y2ggKGVycikgeyByZWplY3QoZXJyKSB9XG4gIH1cbn1cbiIsImNvbnN0IF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG5jb25zdCBvbmNlID0gcmVxdWlyZSgnLi4vbGliL29uY2UnKVxuY29uc3Qgd2l0aFJlc3RvcmVBbGwgPSByZXF1aXJlKCcuLi9saWIvd2l0aFJlc3RvcmVBbGwnKVxuY29uc3QgcHJvbWlzZWQgPSByZXF1aXJlKCcuLi9saWIvcHJvbWlzZWQnKVxuY29uc3Qgbm9vcCA9ICgpID0+IHt9XG5cbmZ1bmN0aW9uIG9uRXZlbnQgKGVsLCB0eXBlLCBmbikge1xuICBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuKVxuICByZXR1cm4gb25jZSgoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuKSlcbn1cblxuZnVuY3Rpb24gc3R5bGUgKGVsLCBjc3MsIGZuKSB7XG4gIGNvbnN0IG9yaWdpbmFsU3R5bGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ3N0eWxlJylcbiAgY29uc3QgbmV3U3R5bGUgPSB0eXBlb2YgY3NzID09PSAnc3RyaW5nJyA/IGZyb21TdHlsZShjc3MpIDogY3NzXG4gIGNvbnN0IG1lcmdlZCA9IHtcbiAgICAuLi5mcm9tU3R5bGUob3JpZ2luYWxTdHlsZSksXG4gICAgLi4ubmV3U3R5bGVcbiAgfVxuICBlbC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgdG9TdHlsZShtZXJnZWQpKVxuICByZXR1cm4gb25jZSgoKSA9PiBlbC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgb3JpZ2luYWxTdHlsZSkpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHlsZSAoc3R5bGUpIHtcbiAgaWYgKCFzdHlsZSkgc3R5bGUgPSAnJ1xuICByZXR1cm4gc3R5bGUuc3BsaXQoJzsnKS5yZWR1Y2UoKG1lbW8sIHZhbCkgPT4ge1xuICAgIGlmICghdmFsKSByZXR1cm4gbWVtb1xuICAgIGNvbnN0IFtrZXksIC4uLnZhbHVlXSA9IHZhbC5zcGxpdCgnOicpXG4gICAgbWVtb1trZXldID0gdmFsdWUuam9pbignOicpXG4gICAgcmV0dXJuIG1lbW9cbiAgfSwge30pXG59XG5cbmZ1bmN0aW9uIHRvU3R5bGUgKGNzcykge1xuICByZXR1cm4gXy5rZXlzKGNzcykucmVkdWNlKChtZW1vLCBrZXkpID0+IHtcbiAgICByZXR1cm4gbWVtbyArIGAke2tlYmFiKGtleSl9OiR7Y3NzW2tleV19O2BcbiAgfSwgJycpXG59XG5cbmZ1bmN0aW9uIGtlYmFiIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW0EtWl0pL2csICctJDEnKS50b0xvd2VyQ2FzZSgpXG59XG5cbmZ1bmN0aW9uIGlzSW5WaWV3UG9ydCAoZWwpIHtcbiAgaWYgKGVsICYmIGVsLnBhcmVudEVsZW1lbnQpIHtcbiAgICBjb25zdCB7IHRvcCwgYm90dG9tIH0gPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGlzQWJvdmVXaW5kb3dzQm90dG9tID1cbiAgICAgIHRvcCA9PT0gYm90dG9tXG4gICAgICAgID8gLy8gSWYgYm90aCBib3R0b20gYW5kIHRvcCBhcmUgYXQgd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICAgLy8gdGhlIGVsZW1lbnQgaXMgZW50aXJlbHkgaW5zaWRlIHRoZSB2aWV3cG9ydFxuICAgICAgICAgIHRvcCA8PSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgOiAvLyBJZiB0aGUgZWxlbWVudCBoYXMgaGVpZ2h0LCB3aGVuIHRvcCBpcyBhdCB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgICAvLyB0aGUgZWxlbWVudCBpcyBiZWxvdyB0aGUgd2luZG93XG4gICAgICAgICAgdG9wIDwgd2luZG93LmlubmVySGVpZ2h0XG4gICAgY29uc3QgaXNCZWxvd1dpbmRvd3NUb3AgPVxuICAgICAgdG9wID09PSBib3R0b21cbiAgICAgICAgPyAvLyBJZiBib3RoIGJvdHRvbSBhbmQgdG9wIGFyZSBhdCAwcHhcbiAgICAgICAgICAvLyB0aGUgZWxlbWVudCBpcyBlbnRpcmVseSBpbnNpZGUgdGhlIHZpZXdwb3J0XG4gICAgICAgICAgYm90dG9tID49IDBcbiAgICAgICAgOiAvLyBJZiB0aGUgZWxlbWVudCBoYXMgaGVpZ2h0LCB3aGVuIGJvdHRvbSBpcyBhdCAwcHhcbiAgICAgICAgICAvLyB0aGUgZWxlbWVudCBpcyBhYm92ZSB0aGUgd2luZG93XG4gICAgICAgICAgYm90dG9tID4gMFxuICAgIHJldHVybiBpc0Fib3ZlV2luZG93c0JvdHRvbSAmJiBpc0JlbG93V2luZG93c1RvcFxuICB9XG59XG5cbmZ1bmN0aW9uIG9uQW55RW50ZXJWaWV3cG9ydCAoZWxzLCBmbikge1xuICBjb25zdCBkaXNwb3NhYmxlcyA9IFtdXG4gIF8uZWFjaChlbHMsIGVsID0+IGRpc3Bvc2FibGVzLnB1c2gob25FbnRlclZpZXdwb3J0KGVsLCBmbikpKVxuICByZXR1cm4gb25jZSgoKSA9PiB7XG4gICAgd2hpbGUgKGRpc3Bvc2FibGVzLmxlbmd0aCkgZGlzcG9zYWJsZXMucG9wKCkoKVxuICB9KVxufVxuXG5mdW5jdGlvbiBvbkVudGVyVmlld3BvcnQgKGVsLCBmbiwgc2Nyb2xsVGFyZ2V0RWwgPSB3aW5kb3cpIHtcbiAgaWYgKF8uaXNBcnJheShlbCkpIHtcbiAgICByZXR1cm4gb25BbnlFbnRlclZpZXdwb3J0KGVsLCBmbilcbiAgfVxuXG4gIGlmIChpc0luVmlld1BvcnQoZWwpKSB7XG4gICAgZm4oKVxuICAgIHJldHVybiBub29wXG4gIH1cblxuICBjb25zdCBoYW5kbGVTY3JvbGwgPSBfLmRlYm91bmNlKCgpID0+IHtcbiAgICBpZiAoaXNJblZpZXdQb3J0KGVsKSkge1xuICAgICAgc2Nyb2xsVGFyZ2V0RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgaGFuZGxlU2Nyb2xsKVxuICAgICAgZm4oKVxuICAgIH1cbiAgfSwgNTApXG4gIHNjcm9sbFRhcmdldEVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGhhbmRsZVNjcm9sbClcbiAgcmV0dXJuIG9uY2UoKCkgPT4gc2Nyb2xsVGFyZ2V0RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgaGFuZGxlU2Nyb2xsKSlcbn1cblxuZnVuY3Rpb24gcmVwbGFjZSAodGFyZ2V0LCBlbCkge1xuICBjb25zdCBwYXJlbnQgPSB0YXJnZXQucGFyZW50RWxlbWVudFxuICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQubmV4dFNpYmxpbmcpXG4gIHBhcmVudC5yZW1vdmVDaGlsZCh0YXJnZXQpXG4gIHJldHVybiBvbmNlKCgpID0+IHJlcGxhY2UoZWwsIHRhcmdldCkpXG59XG5cbmZ1bmN0aW9uIGluc2VydEFmdGVyICh0YXJnZXQsIGVsKSB7XG4gIGNvbnN0IHBhcmVudCA9IHRhcmdldC5wYXJlbnRFbGVtZW50XG4gIHBhcmVudC5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5uZXh0U2libGluZylcbiAgcmV0dXJuIG9uY2UoKCkgPT4gcGFyZW50LnJlbW92ZUNoaWxkKGVsKSlcbn1cblxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlICh0YXJnZXQsIGVsKSB7XG4gIGNvbnN0IHBhcmVudCA9IHRhcmdldC5wYXJlbnRFbGVtZW50XG4gIHBhcmVudC5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldClcbiAgcmV0dXJuIG9uY2UoKCkgPT4gcGFyZW50LnJlbW92ZUNoaWxkKGVsKSlcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ2hpbGQgKHRhcmdldCwgZWwpIHtcbiAgdGFyZ2V0LmFwcGVuZENoaWxkKGVsKVxuICByZXR1cm4gb25jZSgoKSA9PiB0YXJnZXQucmVtb3ZlQ2hpbGQoZWwpKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgY29uc3QgdXRpbHMgPSB3aXRoUmVzdG9yZUFsbCh7XG4gICAgb25FdmVudCxcbiAgICBvbkVudGVyVmlld3BvcnQsXG4gICAgcmVwbGFjZSxcbiAgICBzdHlsZSxcbiAgICBpbnNlcnRBZnRlcixcbiAgICBpbnNlcnRCZWZvcmUsXG4gICAgYXBwZW5kQ2hpbGQsXG4gICAgY2xvc2VzdFxuICB9KVxuXG4gIF8uZWFjaChfLmtleXModXRpbHMpLCBrZXkgPT4ge1xuICAgIGlmIChrZXkuaW5kZXhPZignb24nKSA9PT0gMCkgdXRpbHNba2V5XSA9IHByb21pc2VkKHV0aWxzW2tleV0pXG4gIH0pXG5cbiAgcmV0dXJuIHV0aWxzXG59XG5cbmZ1bmN0aW9uIGNsb3Nlc3QgKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gIGlmICh3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCkge1xuICAgIHJldHVybiB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdC5jYWxsKGVsZW1lbnQsIHNlbGVjdG9yKVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IG1hdGNoZXMgPSB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyB8fFxuICAgICAgd2luZG93LkVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yXG5cbiAgICBsZXQgZWwgPSBlbGVtZW50XG5cbiAgICBkbyB7XG4gICAgICBpZiAobWF0Y2hlcy5jYWxsKGVsLCBzZWxlY3RvcikpIHJldHVybiBlbFxuICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50IHx8IGVsLnBhcmVudE5vZGVcbiAgICB9IHdoaWxlIChlbCAhPT0gbnVsbCAmJiBlbC5ub2RlVHlwZSA9PT0gMSlcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG9uY2UgKGZuKSB7XG4gIGxldCBjYWxsZWQgPSBmYWxzZVxuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICBpZiAoY2FsbGVkKSByZXR1cm5cbiAgICBjYWxsZWQgPSB0cnVlXG4gICAgcmV0dXJuIGZuKC4uLmFyZ3MpXG4gIH1cbn1cbiIsImNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdzeW5jLXAnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHByb21pc2VkIChmbikge1xuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICBpZiAodHlwZW9mIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGZuKC4uLmFyZ3MpXG4gICAgfVxuICAgIGxldCBkaXNwb3NlXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgYXJncy5wdXNoKHJlc29sdmUpXG4gICAgICBkaXNwb3NlID0gZm4oLi4uYXJncylcbiAgICB9KS50aGVuKHZhbHVlID0+IHtcbiAgICAgIGlmICh0eXBlb2YgZGlzcG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkaXNwb3NlKClcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH0pXG4gIH1cbn1cbiIsImNvbnN0IF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gd2l0aFJlc3RvcmVBbGwgKHV0aWxzKSB7XG4gIGNvbnN0IGNsZWFudXAgPSBbXVxuXG4gIGZ1bmN0aW9uIHJlc3RvcmFibGUgKGZuKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICBjb25zdCBkaXNwb3NlID0gZm4oLi4uYXJncylcbiAgICAgIGlmICh0eXBlb2YgZGlzcG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjbGVhbnVwLnB1c2goZGlzcG9zZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBkaXNwb3NlXG4gICAgfVxuICB9XG4gIGNvbnN0IHJlc3VsdCA9IHt9XG5cbiAgZm9yIChjb25zdCBrZXkgb2YgXy5rZXlzKHV0aWxzKSkge1xuICAgIHJlc3VsdFtrZXldID0gcmVzdG9yYWJsZSh1dGlsc1trZXldKVxuICB9XG5cbiAgcmVzdWx0LnJlc3RvcmVBbGwgPSBmdW5jdGlvbiByZXN0b3JlQWxsICgpIHtcbiAgICB3aGlsZSAoY2xlYW51cC5sZW5ndGgpIGNsZWFudXAucG9wKCkoKVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuIiwidmFyIG4sbCx1LGksdCxvLHIsZixlPXt9LGM9W10scz0vYWNpdHxleCg/OnN8Z3xufHB8JCl8cnBofGdyaWR8b3dzfG1uY3xudHd8aW5lW2NoXXx6b298Xm9yZHxpdGVyYS9pO2Z1bmN0aW9uIGEobixsKXtmb3IodmFyIHUgaW4gbCluW3VdPWxbdV07cmV0dXJuIG59ZnVuY3Rpb24gaChuKXt2YXIgbD1uLnBhcmVudE5vZGU7bCYmbC5yZW1vdmVDaGlsZChuKX1mdW5jdGlvbiB2KGwsdSxpKXt2YXIgdCxvLHIsZj17fTtmb3IociBpbiB1KVwia2V5XCI9PXI/dD11W3JdOlwicmVmXCI9PXI/bz11W3JdOmZbcl09dVtyXTtpZihhcmd1bWVudHMubGVuZ3RoPjImJihmLmNoaWxkcmVuPWFyZ3VtZW50cy5sZW5ndGg+Mz9uLmNhbGwoYXJndW1lbnRzLDIpOmkpLFwiZnVuY3Rpb25cIj09dHlwZW9mIGwmJm51bGwhPWwuZGVmYXVsdFByb3BzKWZvcihyIGluIGwuZGVmYXVsdFByb3BzKXZvaWQgMD09PWZbcl0mJihmW3JdPWwuZGVmYXVsdFByb3BzW3JdKTtyZXR1cm4geShsLGYsdCxvLG51bGwpfWZ1bmN0aW9uIHkobixpLHQsbyxyKXt2YXIgZj17dHlwZTpuLHByb3BzOmksa2V5OnQscmVmOm8sX19rOm51bGwsX186bnVsbCxfX2I6MCxfX2U6bnVsbCxfX2Q6dm9pZCAwLF9fYzpudWxsLF9faDpudWxsLGNvbnN0cnVjdG9yOnZvaWQgMCxfX3Y6bnVsbD09cj8rK3U6cn07cmV0dXJuIG51bGw9PXImJm51bGwhPWwudm5vZGUmJmwudm5vZGUoZiksZn1mdW5jdGlvbiBwKCl7cmV0dXJue2N1cnJlbnQ6bnVsbH19ZnVuY3Rpb24gZChuKXtyZXR1cm4gbi5jaGlsZHJlbn1mdW5jdGlvbiBfKG4sbCl7dGhpcy5wcm9wcz1uLHRoaXMuY29udGV4dD1sfWZ1bmN0aW9uIGsobixsKXtpZihudWxsPT1sKXJldHVybiBuLl9fP2sobi5fXyxuLl9fLl9fay5pbmRleE9mKG4pKzEpOm51bGw7Zm9yKHZhciB1O2w8bi5fX2subGVuZ3RoO2wrKylpZihudWxsIT0odT1uLl9fa1tsXSkmJm51bGwhPXUuX19lKXJldHVybiB1Ll9fZTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBuLnR5cGU/ayhuKTpudWxsfWZ1bmN0aW9uIGIobil7dmFyIGwsdTtpZihudWxsIT0obj1uLl9fKSYmbnVsbCE9bi5fX2Mpe2ZvcihuLl9fZT1uLl9fYy5iYXNlPW51bGwsbD0wO2w8bi5fX2subGVuZ3RoO2wrKylpZihudWxsIT0odT1uLl9fa1tsXSkmJm51bGwhPXUuX19lKXtuLl9fZT1uLl9fYy5iYXNlPXUuX19lO2JyZWFrfXJldHVybiBiKG4pfX1mdW5jdGlvbiBtKG4peyghbi5fX2QmJihuLl9fZD0hMCkmJnQucHVzaChuKSYmIWcuX19yKyt8fHIhPT1sLmRlYm91bmNlUmVuZGVyaW5nKSYmKChyPWwuZGVib3VuY2VSZW5kZXJpbmcpfHxvKShnKX1mdW5jdGlvbiBnKCl7Zm9yKHZhciBuO2cuX19yPXQubGVuZ3RoOyluPXQuc29ydChmdW5jdGlvbihuLGwpe3JldHVybiBuLl9fdi5fX2ItbC5fX3YuX19ifSksdD1bXSxuLnNvbWUoZnVuY3Rpb24obil7dmFyIGwsdSxpLHQsbyxyO24uX19kJiYobz0odD0obD1uKS5fX3YpLl9fZSwocj1sLl9fUCkmJih1PVtdLChpPWEoe30sdCkpLl9fdj10Ll9fdisxLGoocix0LGksbC5fX24sdm9pZCAwIT09ci5vd25lclNWR0VsZW1lbnQsbnVsbCE9dC5fX2g/W29dOm51bGwsdSxudWxsPT1vP2sodCk6byx0Ll9faCkseih1LHQpLHQuX19lIT1vJiZiKHQpKSl9KX1mdW5jdGlvbiB3KG4sbCx1LGksdCxvLHIsZixzLGEpe3ZhciBoLHYscCxfLGIsbSxnLHc9aSYmaS5fX2t8fGMsQT13Lmxlbmd0aDtmb3IodS5fX2s9W10saD0wO2g8bC5sZW5ndGg7aCsrKWlmKG51bGwhPShfPXUuX19rW2hdPW51bGw9PShfPWxbaF0pfHxcImJvb2xlYW5cIj09dHlwZW9mIF8/bnVsbDpcInN0cmluZ1wiPT10eXBlb2YgX3x8XCJudW1iZXJcIj09dHlwZW9mIF98fFwiYmlnaW50XCI9PXR5cGVvZiBfP3kobnVsbCxfLG51bGwsbnVsbCxfKTpBcnJheS5pc0FycmF5KF8pP3koZCx7Y2hpbGRyZW46X30sbnVsbCxudWxsLG51bGwpOl8uX19iPjA/eShfLnR5cGUsXy5wcm9wcyxfLmtleSxudWxsLF8uX192KTpfKSl7aWYoXy5fXz11LF8uX19iPXUuX19iKzEsbnVsbD09PShwPXdbaF0pfHxwJiZfLmtleT09cC5rZXkmJl8udHlwZT09PXAudHlwZSl3W2hdPXZvaWQgMDtlbHNlIGZvcih2PTA7djxBO3YrKyl7aWYoKHA9d1t2XSkmJl8ua2V5PT1wLmtleSYmXy50eXBlPT09cC50eXBlKXt3W3ZdPXZvaWQgMDticmVha31wPW51bGx9aihuLF8scD1wfHxlLHQsbyxyLGYscyxhKSxiPV8uX19lLCh2PV8ucmVmKSYmcC5yZWYhPXYmJihnfHwoZz1bXSkscC5yZWYmJmcucHVzaChwLnJlZixudWxsLF8pLGcucHVzaCh2LF8uX19jfHxiLF8pKSxudWxsIT1iPyhudWxsPT1tJiYobT1iKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBfLnR5cGUmJl8uX19rPT09cC5fX2s/Xy5fX2Q9cz14KF8scyxuKTpzPVAobixfLHAsdyxiLHMpLFwiZnVuY3Rpb25cIj09dHlwZW9mIHUudHlwZSYmKHUuX19kPXMpKTpzJiZwLl9fZT09cyYmcy5wYXJlbnROb2RlIT1uJiYocz1rKHApKX1mb3IodS5fX2U9bSxoPUE7aC0tOyludWxsIT13W2hdJiYoXCJmdW5jdGlvblwiPT10eXBlb2YgdS50eXBlJiZudWxsIT13W2hdLl9fZSYmd1toXS5fX2U9PXUuX19kJiYodS5fX2Q9ayhpLGgrMSkpLE4od1toXSx3W2hdKSk7aWYoZylmb3IoaD0wO2g8Zy5sZW5ndGg7aCsrKU0oZ1toXSxnWysraF0sZ1srK2hdKX1mdW5jdGlvbiB4KG4sbCx1KXtmb3IodmFyIGksdD1uLl9fayxvPTA7dCYmbzx0Lmxlbmd0aDtvKyspKGk9dFtvXSkmJihpLl9fPW4sbD1cImZ1bmN0aW9uXCI9PXR5cGVvZiBpLnR5cGU/eChpLGwsdSk6UCh1LGksaSx0LGkuX19lLGwpKTtyZXR1cm4gbH1mdW5jdGlvbiBBKG4sbCl7cmV0dXJuIGw9bHx8W10sbnVsbD09bnx8XCJib29sZWFuXCI9PXR5cGVvZiBufHwoQXJyYXkuaXNBcnJheShuKT9uLnNvbWUoZnVuY3Rpb24obil7QShuLGwpfSk6bC5wdXNoKG4pKSxsfWZ1bmN0aW9uIFAobixsLHUsaSx0LG8pe3ZhciByLGYsZTtpZih2b2lkIDAhPT1sLl9fZClyPWwuX19kLGwuX19kPXZvaWQgMDtlbHNlIGlmKG51bGw9PXV8fHQhPW98fG51bGw9PXQucGFyZW50Tm9kZSluOmlmKG51bGw9PW98fG8ucGFyZW50Tm9kZSE9PW4pbi5hcHBlbmRDaGlsZCh0KSxyPW51bGw7ZWxzZXtmb3IoZj1vLGU9MDsoZj1mLm5leHRTaWJsaW5nKSYmZTxpLmxlbmd0aDtlKz0yKWlmKGY9PXQpYnJlYWsgbjtuLmluc2VydEJlZm9yZSh0LG8pLHI9b31yZXR1cm4gdm9pZCAwIT09cj9yOnQubmV4dFNpYmxpbmd9ZnVuY3Rpb24gQyhuLGwsdSxpLHQpe3ZhciBvO2ZvcihvIGluIHUpXCJjaGlsZHJlblwiPT09b3x8XCJrZXlcIj09PW98fG8gaW4gbHx8SChuLG8sbnVsbCx1W29dLGkpO2ZvcihvIGluIGwpdCYmXCJmdW5jdGlvblwiIT10eXBlb2YgbFtvXXx8XCJjaGlsZHJlblwiPT09b3x8XCJrZXlcIj09PW98fFwidmFsdWVcIj09PW98fFwiY2hlY2tlZFwiPT09b3x8dVtvXT09PWxbb118fEgobixvLGxbb10sdVtvXSxpKX1mdW5jdGlvbiAkKG4sbCx1KXtcIi1cIj09PWxbMF0/bi5zZXRQcm9wZXJ0eShsLHUpOm5bbF09bnVsbD09dT9cIlwiOlwibnVtYmVyXCIhPXR5cGVvZiB1fHxzLnRlc3QobCk/dTp1K1wicHhcIn1mdW5jdGlvbiBIKG4sbCx1LGksdCl7dmFyIG87bjppZihcInN0eWxlXCI9PT1sKWlmKFwic3RyaW5nXCI9PXR5cGVvZiB1KW4uc3R5bGUuY3NzVGV4dD11O2Vsc2V7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGkmJihuLnN0eWxlLmNzc1RleHQ9aT1cIlwiKSxpKWZvcihsIGluIGkpdSYmbCBpbiB1fHwkKG4uc3R5bGUsbCxcIlwiKTtpZih1KWZvcihsIGluIHUpaSYmdVtsXT09PWlbbF18fCQobi5zdHlsZSxsLHVbbF0pfWVsc2UgaWYoXCJvXCI9PT1sWzBdJiZcIm5cIj09PWxbMV0pbz1sIT09KGw9bC5yZXBsYWNlKC9DYXB0dXJlJC8sXCJcIikpLGw9bC50b0xvd2VyQ2FzZSgpaW4gbj9sLnRvTG93ZXJDYXNlKCkuc2xpY2UoMik6bC5zbGljZSgyKSxuLmx8fChuLmw9e30pLG4ubFtsK29dPXUsdT9pfHxuLmFkZEV2ZW50TGlzdGVuZXIobCxvP1Q6SSxvKTpuLnJlbW92ZUV2ZW50TGlzdGVuZXIobCxvP1Q6SSxvKTtlbHNlIGlmKFwiZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUxcIiE9PWwpe2lmKHQpbD1sLnJlcGxhY2UoL3hsaW5rKEh8OmgpLyxcImhcIikucmVwbGFjZSgvc05hbWUkLyxcInNcIik7ZWxzZSBpZihcImhyZWZcIiE9PWwmJlwibGlzdFwiIT09bCYmXCJmb3JtXCIhPT1sJiZcInRhYkluZGV4XCIhPT1sJiZcImRvd25sb2FkXCIhPT1sJiZsIGluIG4pdHJ5e25bbF09bnVsbD09dT9cIlwiOnU7YnJlYWsgbn1jYXRjaChuKXt9XCJmdW5jdGlvblwiPT10eXBlb2YgdXx8KG51bGwhPXUmJighMSE9PXV8fFwiYVwiPT09bFswXSYmXCJyXCI9PT1sWzFdKT9uLnNldEF0dHJpYnV0ZShsLHUpOm4ucmVtb3ZlQXR0cmlidXRlKGwpKX19ZnVuY3Rpb24gSShuKXt0aGlzLmxbbi50eXBlKyExXShsLmV2ZW50P2wuZXZlbnQobik6bil9ZnVuY3Rpb24gVChuKXt0aGlzLmxbbi50eXBlKyEwXShsLmV2ZW50P2wuZXZlbnQobik6bil9ZnVuY3Rpb24gaihuLHUsaSx0LG8scixmLGUsYyl7dmFyIHMsaCx2LHkscCxrLGIsbSxnLHgsQSxQPXUudHlwZTtpZih2b2lkIDAhPT11LmNvbnN0cnVjdG9yKXJldHVybiBudWxsO251bGwhPWkuX19oJiYoYz1pLl9faCxlPXUuX19lPWkuX19lLHUuX19oPW51bGwscj1bZV0pLChzPWwuX19iKSYmcyh1KTt0cnl7bjppZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBQKXtpZihtPXUucHJvcHMsZz0ocz1QLmNvbnRleHRUeXBlKSYmdFtzLl9fY10seD1zP2c/Zy5wcm9wcy52YWx1ZTpzLl9fOnQsaS5fX2M/Yj0oaD11Ll9fYz1pLl9fYykuX189aC5fX0U6KFwicHJvdG90eXBlXCJpbiBQJiZQLnByb3RvdHlwZS5yZW5kZXI/dS5fX2M9aD1uZXcgUChtLHgpOih1Ll9fYz1oPW5ldyBfKG0seCksaC5jb25zdHJ1Y3Rvcj1QLGgucmVuZGVyPU8pLGcmJmcuc3ViKGgpLGgucHJvcHM9bSxoLnN0YXRlfHwoaC5zdGF0ZT17fSksaC5jb250ZXh0PXgsaC5fX249dCx2PWguX19kPSEwLGguX19oPVtdKSxudWxsPT1oLl9fcyYmKGguX19zPWguc3RhdGUpLG51bGwhPVAuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzJiYoaC5fX3M9PWguc3RhdGUmJihoLl9fcz1hKHt9LGguX19zKSksYShoLl9fcyxQLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyhtLGguX19zKSkpLHk9aC5wcm9wcyxwPWguc3RhdGUsdiludWxsPT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmbnVsbCE9aC5jb21wb25lbnRXaWxsTW91bnQmJmguY29tcG9uZW50V2lsbE1vdW50KCksbnVsbCE9aC5jb21wb25lbnREaWRNb3VudCYmaC5fX2gucHVzaChoLmNvbXBvbmVudERpZE1vdW50KTtlbHNle2lmKG51bGw9PVAuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzJiZtIT09eSYmbnVsbCE9aC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJiZoLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobSx4KSwhaC5fX2UmJm51bGwhPWguc2hvdWxkQ29tcG9uZW50VXBkYXRlJiYhMT09PWguc2hvdWxkQ29tcG9uZW50VXBkYXRlKG0saC5fX3MseCl8fHUuX192PT09aS5fX3Ype2gucHJvcHM9bSxoLnN0YXRlPWguX19zLHUuX192IT09aS5fX3YmJihoLl9fZD0hMSksaC5fX3Y9dSx1Ll9fZT1pLl9fZSx1Ll9faz1pLl9fayx1Ll9fay5mb3JFYWNoKGZ1bmN0aW9uKG4pe24mJihuLl9fPXUpfSksaC5fX2gubGVuZ3RoJiZmLnB1c2goaCk7YnJlYWsgbn1udWxsIT1oLmNvbXBvbmVudFdpbGxVcGRhdGUmJmguY29tcG9uZW50V2lsbFVwZGF0ZShtLGguX19zLHgpLG51bGwhPWguY29tcG9uZW50RGlkVXBkYXRlJiZoLl9faC5wdXNoKGZ1bmN0aW9uKCl7aC5jb21wb25lbnREaWRVcGRhdGUoeSxwLGspfSl9aC5jb250ZXh0PXgsaC5wcm9wcz1tLGguc3RhdGU9aC5fX3MsKHM9bC5fX3IpJiZzKHUpLGguX19kPSExLGguX192PXUsaC5fX1A9bixzPWgucmVuZGVyKGgucHJvcHMsaC5zdGF0ZSxoLmNvbnRleHQpLGguc3RhdGU9aC5fX3MsbnVsbCE9aC5nZXRDaGlsZENvbnRleHQmJih0PWEoYSh7fSx0KSxoLmdldENoaWxkQ29udGV4dCgpKSksdnx8bnVsbD09aC5nZXRTbmFwc2hvdEJlZm9yZVVwZGF0ZXx8KGs9aC5nZXRTbmFwc2hvdEJlZm9yZVVwZGF0ZSh5LHApKSxBPW51bGwhPXMmJnMudHlwZT09PWQmJm51bGw9PXMua2V5P3MucHJvcHMuY2hpbGRyZW46cyx3KG4sQXJyYXkuaXNBcnJheShBKT9BOltBXSx1LGksdCxvLHIsZixlLGMpLGguYmFzZT11Ll9fZSx1Ll9faD1udWxsLGguX19oLmxlbmd0aCYmZi5wdXNoKGgpLGImJihoLl9fRT1oLl9fPW51bGwpLGguX19lPSExfWVsc2UgbnVsbD09ciYmdS5fX3Y9PT1pLl9fdj8odS5fX2s9aS5fX2ssdS5fX2U9aS5fX2UpOnUuX19lPUwoaS5fX2UsdSxpLHQsbyxyLGYsYyk7KHM9bC5kaWZmZWQpJiZzKHUpfWNhdGNoKG4pe3UuX192PW51bGwsKGN8fG51bGwhPXIpJiYodS5fX2U9ZSx1Ll9faD0hIWMscltyLmluZGV4T2YoZSldPW51bGwpLGwuX19lKG4sdSxpKX19ZnVuY3Rpb24geihuLHUpe2wuX19jJiZsLl9fYyh1LG4pLG4uc29tZShmdW5jdGlvbih1KXt0cnl7bj11Ll9faCx1Ll9faD1bXSxuLnNvbWUoZnVuY3Rpb24obil7bi5jYWxsKHUpfSl9Y2F0Y2gobil7bC5fX2Uobix1Ll9fdil9fSl9ZnVuY3Rpb24gTChsLHUsaSx0LG8scixmLGMpe3ZhciBzLGEsdix5PWkucHJvcHMscD11LnByb3BzLGQ9dS50eXBlLF89MDtpZihcInN2Z1wiPT09ZCYmKG89ITApLG51bGwhPXIpZm9yKDtfPHIubGVuZ3RoO18rKylpZigocz1yW19dKSYmXCJzZXRBdHRyaWJ1dGVcImluIHM9PSEhZCYmKGQ/cy5sb2NhbE5hbWU9PT1kOjM9PT1zLm5vZGVUeXBlKSl7bD1zLHJbX109bnVsbDticmVha31pZihudWxsPT1sKXtpZihudWxsPT09ZClyZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocCk7bD1vP2RvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsZCk6ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChkLHAuaXMmJnApLHI9bnVsbCxjPSExfWlmKG51bGw9PT1kKXk9PT1wfHxjJiZsLmRhdGE9PT1wfHwobC5kYXRhPXApO2Vsc2V7aWYocj1yJiZuLmNhbGwobC5jaGlsZE5vZGVzKSxhPSh5PWkucHJvcHN8fGUpLmRhbmdlcm91c2x5U2V0SW5uZXJIVE1MLHY9cC5kYW5nZXJvdXNseVNldElubmVySFRNTCwhYyl7aWYobnVsbCE9cilmb3IoeT17fSxfPTA7XzxsLmF0dHJpYnV0ZXMubGVuZ3RoO18rKyl5W2wuYXR0cmlidXRlc1tfXS5uYW1lXT1sLmF0dHJpYnV0ZXNbX10udmFsdWU7KHZ8fGEpJiYodiYmKGEmJnYuX19odG1sPT1hLl9faHRtbHx8di5fX2h0bWw9PT1sLmlubmVySFRNTCl8fChsLmlubmVySFRNTD12JiZ2Ll9faHRtbHx8XCJcIikpfWlmKEMobCxwLHksbyxjKSx2KXUuX19rPVtdO2Vsc2UgaWYoXz11LnByb3BzLmNoaWxkcmVuLHcobCxBcnJheS5pc0FycmF5KF8pP186W19dLHUsaSx0LG8mJlwiZm9yZWlnbk9iamVjdFwiIT09ZCxyLGYscj9yWzBdOmkuX19rJiZrKGksMCksYyksbnVsbCE9cilmb3IoXz1yLmxlbmd0aDtfLS07KW51bGwhPXJbX10mJmgocltfXSk7Y3x8KFwidmFsdWVcImluIHAmJnZvaWQgMCE9PShfPXAudmFsdWUpJiYoXyE9PWwudmFsdWV8fFwicHJvZ3Jlc3NcIj09PWQmJiFffHxcIm9wdGlvblwiPT09ZCYmXyE9PXkudmFsdWUpJiZIKGwsXCJ2YWx1ZVwiLF8seS52YWx1ZSwhMSksXCJjaGVja2VkXCJpbiBwJiZ2b2lkIDAhPT0oXz1wLmNoZWNrZWQpJiZfIT09bC5jaGVja2VkJiZIKGwsXCJjaGVja2VkXCIsXyx5LmNoZWNrZWQsITEpKX1yZXR1cm4gbH1mdW5jdGlvbiBNKG4sdSxpKXt0cnl7XCJmdW5jdGlvblwiPT10eXBlb2Ygbj9uKHUpOm4uY3VycmVudD11fWNhdGNoKG4pe2wuX19lKG4saSl9fWZ1bmN0aW9uIE4obix1LGkpe3ZhciB0LG87aWYobC51bm1vdW50JiZsLnVubW91bnQobiksKHQ9bi5yZWYpJiYodC5jdXJyZW50JiZ0LmN1cnJlbnQhPT1uLl9fZXx8TSh0LG51bGwsdSkpLG51bGwhPSh0PW4uX19jKSl7aWYodC5jb21wb25lbnRXaWxsVW5tb3VudCl0cnl7dC5jb21wb25lbnRXaWxsVW5tb3VudCgpfWNhdGNoKG4pe2wuX19lKG4sdSl9dC5iYXNlPXQuX19QPW51bGx9aWYodD1uLl9faylmb3Iobz0wO288dC5sZW5ndGg7bysrKXRbb10mJk4odFtvXSx1LFwiZnVuY3Rpb25cIiE9dHlwZW9mIG4udHlwZSk7aXx8bnVsbD09bi5fX2V8fGgobi5fX2UpLG4uX19lPW4uX19kPXZvaWQgMH1mdW5jdGlvbiBPKG4sbCx1KXtyZXR1cm4gdGhpcy5jb25zdHJ1Y3RvcihuLHUpfWZ1bmN0aW9uIFModSxpLHQpe3ZhciBvLHIsZjtsLl9fJiZsLl9fKHUsaSkscj0obz1cImZ1bmN0aW9uXCI9PXR5cGVvZiB0KT9udWxsOnQmJnQuX19rfHxpLl9fayxmPVtdLGooaSx1PSghbyYmdHx8aSkuX19rPXYoZCxudWxsLFt1XSkscnx8ZSxlLHZvaWQgMCE9PWkub3duZXJTVkdFbGVtZW50LCFvJiZ0P1t0XTpyP251bGw6aS5maXJzdENoaWxkP24uY2FsbChpLmNoaWxkTm9kZXMpOm51bGwsZiwhbyYmdD90OnI/ci5fX2U6aS5maXJzdENoaWxkLG8pLHooZix1KX1mdW5jdGlvbiBxKG4sbCl7UyhuLGwscSl9ZnVuY3Rpb24gQihsLHUsaSl7dmFyIHQsbyxyLGY9YSh7fSxsLnByb3BzKTtmb3IociBpbiB1KVwia2V5XCI9PXI/dD11W3JdOlwicmVmXCI9PXI/bz11W3JdOmZbcl09dVtyXTtyZXR1cm4gYXJndW1lbnRzLmxlbmd0aD4yJiYoZi5jaGlsZHJlbj1hcmd1bWVudHMubGVuZ3RoPjM/bi5jYWxsKGFyZ3VtZW50cywyKTppKSx5KGwudHlwZSxmLHR8fGwua2V5LG98fGwucmVmLG51bGwpfWZ1bmN0aW9uIEQobixsKXt2YXIgdT17X19jOmw9XCJfX2NDXCIrZisrLF9fOm4sQ29uc3VtZXI6ZnVuY3Rpb24obixsKXtyZXR1cm4gbi5jaGlsZHJlbihsKX0sUHJvdmlkZXI6ZnVuY3Rpb24obil7dmFyIHUsaTtyZXR1cm4gdGhpcy5nZXRDaGlsZENvbnRleHR8fCh1PVtdLChpPXt9KVtsXT10aGlzLHRoaXMuZ2V0Q2hpbGRDb250ZXh0PWZ1bmN0aW9uKCl7cmV0dXJuIGl9LHRoaXMuc2hvdWxkQ29tcG9uZW50VXBkYXRlPWZ1bmN0aW9uKG4pe3RoaXMucHJvcHMudmFsdWUhPT1uLnZhbHVlJiZ1LnNvbWUobSl9LHRoaXMuc3ViPWZ1bmN0aW9uKG4pe3UucHVzaChuKTt2YXIgbD1uLmNvbXBvbmVudFdpbGxVbm1vdW50O24uY29tcG9uZW50V2lsbFVubW91bnQ9ZnVuY3Rpb24oKXt1LnNwbGljZSh1LmluZGV4T2YobiksMSksbCYmbC5jYWxsKG4pfX0pLG4uY2hpbGRyZW59fTtyZXR1cm4gdS5Qcm92aWRlci5fXz11LkNvbnN1bWVyLmNvbnRleHRUeXBlPXV9bj1jLnNsaWNlLGw9e19fZTpmdW5jdGlvbihuLGwsdSxpKXtmb3IodmFyIHQsbyxyO2w9bC5fXzspaWYoKHQ9bC5fX2MpJiYhdC5fXyl0cnl7aWYoKG89dC5jb25zdHJ1Y3RvcikmJm51bGwhPW8uZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yJiYodC5zZXRTdGF0ZShvLmdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihuKSkscj10Ll9fZCksbnVsbCE9dC5jb21wb25lbnREaWRDYXRjaCYmKHQuY29tcG9uZW50RGlkQ2F0Y2gobixpfHx7fSkscj10Ll9fZCkscilyZXR1cm4gdC5fX0U9dH1jYXRjaChsKXtuPWx9dGhyb3cgbn19LHU9MCxpPWZ1bmN0aW9uKG4pe3JldHVybiBudWxsIT1uJiZ2b2lkIDA9PT1uLmNvbnN0cnVjdG9yfSxfLnByb3RvdHlwZS5zZXRTdGF0ZT1mdW5jdGlvbihuLGwpe3ZhciB1O3U9bnVsbCE9dGhpcy5fX3MmJnRoaXMuX19zIT09dGhpcy5zdGF0ZT90aGlzLl9fczp0aGlzLl9fcz1hKHt9LHRoaXMuc3RhdGUpLFwiZnVuY3Rpb25cIj09dHlwZW9mIG4mJihuPW4oYSh7fSx1KSx0aGlzLnByb3BzKSksbiYmYSh1LG4pLG51bGwhPW4mJnRoaXMuX192JiYobCYmdGhpcy5fX2gucHVzaChsKSxtKHRoaXMpKX0sXy5wcm90b3R5cGUuZm9yY2VVcGRhdGU9ZnVuY3Rpb24obil7dGhpcy5fX3YmJih0aGlzLl9fZT0hMCxuJiZ0aGlzLl9faC5wdXNoKG4pLG0odGhpcykpfSxfLnByb3RvdHlwZS5yZW5kZXI9ZCx0PVtdLG89XCJmdW5jdGlvblwiPT10eXBlb2YgUHJvbWlzZT9Qcm9taXNlLnByb3RvdHlwZS50aGVuLmJpbmQoUHJvbWlzZS5yZXNvbHZlKCkpOnNldFRpbWVvdXQsZy5fX3I9MCxmPTA7ZXhwb3J0e1MgYXMgcmVuZGVyLHEgYXMgaHlkcmF0ZSx2IGFzIGNyZWF0ZUVsZW1lbnQsdiBhcyBoLGQgYXMgRnJhZ21lbnQscCBhcyBjcmVhdGVSZWYsaSBhcyBpc1ZhbGlkRWxlbWVudCxfIGFzIENvbXBvbmVudCxCIGFzIGNsb25lRWxlbWVudCxEIGFzIGNyZWF0ZUNvbnRleHQsQSBhcyB0b0NoaWxkQXJyYXksbCBhcyBvcHRpb25zfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByZWFjdC5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnR7b3B0aW9ucyBhcyBufWZyb21cInByZWFjdFwiO3ZhciB0LHUscixvPTAsaT1bXSxjPW4uX19iLGY9bi5fX3IsZT1uLmRpZmZlZCxhPW4uX19jLHY9bi51bm1vdW50O2Z1bmN0aW9uIGwodCxyKXtuLl9faCYmbi5fX2godSx0LG98fHIpLG89MDt2YXIgaT11Ll9fSHx8KHUuX19IPXtfXzpbXSxfX2g6W119KTtyZXR1cm4gdD49aS5fXy5sZW5ndGgmJmkuX18ucHVzaCh7fSksaS5fX1t0XX1mdW5jdGlvbiBtKG4pe3JldHVybiBvPTEscCh3LG4pfWZ1bmN0aW9uIHAobixyLG8pe3ZhciBpPWwodCsrLDIpO3JldHVybiBpLnQ9bixpLl9fY3x8KGkuX189W28/byhyKTp3KHZvaWQgMCxyKSxmdW5jdGlvbihuKXt2YXIgdD1pLnQoaS5fX1swXSxuKTtpLl9fWzBdIT09dCYmKGkuX189W3QsaS5fX1sxXV0saS5fX2Muc2V0U3RhdGUoe30pKX1dLGkuX19jPXUpLGkuX199ZnVuY3Rpb24geShyLG8pe3ZhciBpPWwodCsrLDMpOyFuLl9fcyYmayhpLl9fSCxvKSYmKGkuX189cixpLl9fSD1vLHUuX19ILl9faC5wdXNoKGkpKX1mdW5jdGlvbiBkKHIsbyl7dmFyIGk9bCh0KyssNCk7IW4uX19zJiZrKGkuX19ILG8pJiYoaS5fXz1yLGkuX19IPW8sdS5fX2gucHVzaChpKSl9ZnVuY3Rpb24gaChuKXtyZXR1cm4gbz01LF8oZnVuY3Rpb24oKXtyZXR1cm57Y3VycmVudDpufX0sW10pfWZ1bmN0aW9uIHMobix0LHUpe289NixkKGZ1bmN0aW9uKCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2Ygbj8obih0KCkpLGZ1bmN0aW9uKCl7cmV0dXJuIG4obnVsbCl9KTpuPyhuLmN1cnJlbnQ9dCgpLGZ1bmN0aW9uKCl7cmV0dXJuIG4uY3VycmVudD1udWxsfSk6dm9pZCAwfSxudWxsPT11P3U6dS5jb25jYXQobikpfWZ1bmN0aW9uIF8obix1KXt2YXIgcj1sKHQrKyw3KTtyZXR1cm4gayhyLl9fSCx1KSYmKHIuX189bigpLHIuX19IPXUsci5fX2g9biksci5fX31mdW5jdGlvbiBBKG4sdCl7cmV0dXJuIG89OCxfKGZ1bmN0aW9uKCl7cmV0dXJuIG59LHQpfWZ1bmN0aW9uIEYobil7dmFyIHI9dS5jb250ZXh0W24uX19jXSxvPWwodCsrLDkpO3JldHVybiBvLmM9bixyPyhudWxsPT1vLl9fJiYoby5fXz0hMCxyLnN1Yih1KSksci5wcm9wcy52YWx1ZSk6bi5fX31mdW5jdGlvbiBUKHQsdSl7bi51c2VEZWJ1Z1ZhbHVlJiZuLnVzZURlYnVnVmFsdWUodT91KHQpOnQpfWZ1bmN0aW9uIHEobil7dmFyIHI9bCh0KyssMTApLG89bSgpO3JldHVybiByLl9fPW4sdS5jb21wb25lbnREaWRDYXRjaHx8KHUuY29tcG9uZW50RGlkQ2F0Y2g9ZnVuY3Rpb24obil7ci5fXyYmci5fXyhuKSxvWzFdKG4pfSksW29bMF0sZnVuY3Rpb24oKXtvWzFdKHZvaWQgMCl9XX1mdW5jdGlvbiB4KCl7Zm9yKHZhciB0O3Q9aS5zaGlmdCgpOylpZih0Ll9fUCl0cnl7dC5fX0guX19oLmZvckVhY2goZyksdC5fX0guX19oLmZvckVhY2goaiksdC5fX0guX19oPVtdfWNhdGNoKHUpe3QuX19ILl9faD1bXSxuLl9fZSh1LHQuX192KX19bi5fX2I9ZnVuY3Rpb24obil7dT1udWxsLGMmJmMobil9LG4uX19yPWZ1bmN0aW9uKG4pe2YmJmYobiksdD0wO3ZhciByPSh1PW4uX19jKS5fX0g7ciYmKHIuX19oLmZvckVhY2goZyksci5fX2guZm9yRWFjaChqKSxyLl9faD1bXSl9LG4uZGlmZmVkPWZ1bmN0aW9uKHQpe2UmJmUodCk7dmFyIG89dC5fX2M7byYmby5fX0gmJm8uX19ILl9faC5sZW5ndGgmJigxIT09aS5wdXNoKG8pJiZyPT09bi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fCgocj1uLnJlcXVlc3RBbmltYXRpb25GcmFtZSl8fGZ1bmN0aW9uKG4pe3ZhciB0LHU9ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQociksYiYmY2FuY2VsQW5pbWF0aW9uRnJhbWUodCksc2V0VGltZW91dChuKX0scj1zZXRUaW1lb3V0KHUsMTAwKTtiJiYodD1yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodSkpfSkoeCkpLHU9bnVsbH0sbi5fX2M9ZnVuY3Rpb24odCx1KXt1LnNvbWUoZnVuY3Rpb24odCl7dHJ5e3QuX19oLmZvckVhY2goZyksdC5fX2g9dC5fX2guZmlsdGVyKGZ1bmN0aW9uKG4pe3JldHVybiFuLl9ffHxqKG4pfSl9Y2F0Y2gocil7dS5zb21lKGZ1bmN0aW9uKG4pe24uX19oJiYobi5fX2g9W10pfSksdT1bXSxuLl9fZShyLHQuX192KX19KSxhJiZhKHQsdSl9LG4udW5tb3VudD1mdW5jdGlvbih0KXt2JiZ2KHQpO3ZhciB1LHI9dC5fX2M7ciYmci5fX0gmJihyLl9fSC5fXy5mb3JFYWNoKGZ1bmN0aW9uKG4pe3RyeXtnKG4pfWNhdGNoKG4pe3U9bn19KSx1JiZuLl9fZSh1LHIuX192KSl9O3ZhciBiPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZTtmdW5jdGlvbiBnKG4pe3ZhciB0PXUscj1uLl9fYztcImZ1bmN0aW9uXCI9PXR5cGVvZiByJiYobi5fX2M9dm9pZCAwLHIoKSksdT10fWZ1bmN0aW9uIGoobil7dmFyIHQ9dTtuLl9fYz1uLl9fKCksdT10fWZ1bmN0aW9uIGsobix0KXtyZXR1cm4hbnx8bi5sZW5ndGghPT10Lmxlbmd0aHx8dC5zb21lKGZ1bmN0aW9uKHQsdSl7cmV0dXJuIHQhPT1uW3VdfSl9ZnVuY3Rpb24gdyhuLHQpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQ/dChuKTp0fWV4cG9ydHttIGFzIHVzZVN0YXRlLHAgYXMgdXNlUmVkdWNlcix5IGFzIHVzZUVmZmVjdCxkIGFzIHVzZUxheW91dEVmZmVjdCxoIGFzIHVzZVJlZixzIGFzIHVzZUltcGVyYXRpdmVIYW5kbGUsXyBhcyB1c2VNZW1vLEEgYXMgdXNlQ2FsbGJhY2ssRiBhcyB1c2VDb250ZXh0LFQgYXMgdXNlRGVidWdWYWx1ZSxxIGFzIHVzZUVycm9yQm91bmRhcnl9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aG9va3MubW9kdWxlLmpzLm1hcFxuIiwidmFyIHRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG52YXIgcmVnZXhwQ2hhcmFjdGVycyA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZ1xudmFyIHJlZ2V4cElzTmF0aXZlRm4gPSB0b1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KVxuICAucmVwbGFjZShyZWdleHBDaGFyYWN0ZXJzLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpXG52YXIgcmVnZXhwSXNOYXRpdmUgPSBSZWdFeHAoJ14nICsgcmVnZXhwSXNOYXRpdmVGbiArICckJylcbmZ1bmN0aW9uIHRvU291cmNlIChmdW5jKSB7XG4gIGlmICghZnVuYykgcmV0dXJuICcnXG4gIHRyeSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoZnVuYylcbiAgfSBjYXRjaCAoZSkge31cbiAgdHJ5IHtcbiAgICByZXR1cm4gKGZ1bmMgKyAnJylcbiAgfSBjYXRjaCAoZSkge31cbn1cbnZhciBhc3NpZ24gPSBPYmplY3QuYXNzaWduXG52YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoXG52YXIgZXZlcnkgPSBBcnJheS5wcm90b3R5cGUuZXZlcnlcbnZhciBmaWx0ZXIgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyXG52YXIgZmluZCA9IEFycmF5LnByb3RvdHlwZS5maW5kXG52YXIgaW5kZXhPZiA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXlcbnZhciBrZXlzID0gT2JqZWN0LmtleXNcbnZhciBtYXAgPSBBcnJheS5wcm90b3R5cGUubWFwXG52YXIgcmVkdWNlID0gQXJyYXkucHJvdG90eXBlLnJlZHVjZVxudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlXG52YXIgc29tZSA9IEFycmF5LnByb3RvdHlwZS5zb21lXG52YXIgdmFsdWVzID0gT2JqZWN0LnZhbHVlc1xuZnVuY3Rpb24gaXNOYXRpdmUgKG1ldGhvZCkge1xuICByZXR1cm4gbWV0aG9kICYmIHR5cGVvZiBtZXRob2QgPT09ICdmdW5jdGlvbicgJiYgcmVnZXhwSXNOYXRpdmUudGVzdCh0b1NvdXJjZShtZXRob2QpKVxufVxudmFyIF8gPSB7XG4gIGFzc2lnbjogaXNOYXRpdmUoYXNzaWduKVxuICAgID8gYXNzaWduXG4gICAgOiBmdW5jdGlvbiBhc3NpZ24gKHRhcmdldCkge1xuICAgICAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG4gICAgICAgIGZvciAodmFyIGogaW4gc291cmNlKSBpZiAoc291cmNlLmhhc093blByb3BlcnR5KGopKSB0YXJnZXRbal0gPSBzb3VyY2Vbal1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0YXJnZXRcbiAgICB9LFxuICBiaW5kOiBmdW5jdGlvbiBiaW5kIChtZXRob2QsIGNvbnRleHQpIHtcbiAgICB2YXIgYXJncyA9IF8uc2xpY2UoYXJndW1lbnRzLCAyKVxuICAgIHJldHVybiBmdW5jdGlvbiBib3VuZEZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncy5jb25jYXQoXy5zbGljZShhcmd1bWVudHMpKSlcbiAgICB9XG4gIH0sXG4gIGRlYm91bmNlOiBmdW5jdGlvbiBkZWJvdW5jZSAoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXRcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzXG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50c1xuICAgICAgdmFyIGxhdGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbFxuICAgICAgICBpZiAoIWltbWVkaWF0ZSkgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxuICAgICAgfVxuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXRcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KVxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpXG4gICAgICBpZiAoY2FsbE5vdykgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxuICAgIH1cbiAgfSxcbiAgZWFjaDogaXNOYXRpdmUoZm9yRWFjaClcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUVhY2ggKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZvckVhY2guY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZWFjaCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgIH0sXG4gIGV2ZXJ5OiBpc05hdGl2ZShldmVyeSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUV2ZXJ5IChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZXZlcnkuY2FsbChjb2xsLCBwcmVkLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGV2ZXJ5IChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWNvbGwgfHwgIXByZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpXG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbGwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCFwcmVkLmNhbGwoY29udGV4dCwgY29sbFtpXSwgaSwgY29sbCkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuICBmaWx0ZXI6IGlzTmF0aXZlKGZpbHRlcilcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUZpbHRlciAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZmlsdGVyLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGZpbHRlciAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgdmFyIG91dHB1dCA9IFtdXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpKSBvdXRwdXQucHVzaChhcnJheVtpXSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXRcbiAgICB9LFxuICBmaW5kOiBpc05hdGl2ZShmaW5kKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRmluZCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZmluZC5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBmaW5kIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpKSByZXR1cm4gYXJyYXlbaV1cbiAgICAgIH1cbiAgICB9LFxuICBnZXQ6IGZ1bmN0aW9uIGdldCAob2JqZWN0LCBwYXRoKSB7XG4gICAgcmV0dXJuIF8ucmVkdWNlKHBhdGguc3BsaXQoJy4nKSwgZnVuY3Rpb24gKG1lbW8sIG5leHQpIHtcbiAgICAgIHJldHVybiAodHlwZW9mIG1lbW8gIT09ICd1bmRlZmluZWQnICYmIG1lbW8gIT09IG51bGwpID8gbWVtb1tuZXh0XSA6IHVuZGVmaW5lZFxuICAgIH0sIG9iamVjdClcbiAgfSxcbiAgaWRlbnRpdHk6IGZ1bmN0aW9uIGlkZW50aXR5ICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuICBpbmRleE9mOiBpc05hdGl2ZShpbmRleE9mKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlSW5kZXhPZiAoYXJyYXksIGl0ZW0pIHtcbiAgICAgIHJldHVybiBpbmRleE9mLmNhbGwoYXJyYXksIGl0ZW0pXG4gICAgfVxuICAgIDogZnVuY3Rpb24gaW5kZXhPZiAoYXJyYXksIGl0ZW0pIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpXG4gICAgICB9XG4gICAgICByZXR1cm4gLTFcbiAgICB9LFxuICBpbnZva2U6IGZ1bmN0aW9uIGludm9rZSAoYXJyYXksIG1ldGhvZE5hbWUpIHtcbiAgICB2YXIgYXJncyA9IF8uc2xpY2UoYXJndW1lbnRzLCAyKVxuICAgIHJldHVybiBfLm1hcChhcnJheSwgZnVuY3Rpb24gaW52b2tlTWFwcGVyICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlW21ldGhvZE5hbWVdLmFwcGx5KHZhbHVlLCBhcmdzKVxuICAgIH0pXG4gIH0sXG4gIGlzQXJyYXk6IGlzTmF0aXZlKGlzQXJyYXkpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVBcnJheSAoY29sbCkge1xuICAgICAgcmV0dXJuIGlzQXJyYXkoY29sbClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBpc0FycmF5IChvYmopIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICAgIH0sXG4gIGlzTWF0Y2g6IGZ1bmN0aW9uIGlzTWF0Y2ggKG9iaiwgc3BlYykge1xuICAgIGZvciAodmFyIGkgaW4gc3BlYykge1xuICAgICAgaWYgKHNwZWMuaGFzT3duUHJvcGVydHkoaSkgJiYgb2JqW2ldICE9PSBzcGVjW2ldKSByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uIGlzT2JqZWN0IChvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmpcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9ialxuICB9LFxuICBrZXlzOiBpc05hdGl2ZShrZXlzKVxuICAgID8ga2V5c1xuICAgIDogZnVuY3Rpb24ga2V5cyAob2JqZWN0KSB7XG4gICAgICB2YXIga2V5cyA9IFtdXG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkga2V5cy5wdXNoKGtleSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBrZXlzXG4gICAgfSxcbiAgbWFwOiBpc05hdGl2ZShtYXApXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVNYXAgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIG1hcC5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBtYXAgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIHZhciBvdXRwdXQgPSBuZXcgQXJyYXkobClcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG91dHB1dFtpXSA9IGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgIH0sXG4gIG1hdGNoZXM6IGZ1bmN0aW9uIG1hdGNoZXMgKHNwZWMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIF8uaXNNYXRjaChvYmosIHNwZWMpXG4gICAgfVxuICB9LFxuICBub3Q6IGZ1bmN0aW9uIG5vdCAodmFsdWUpIHtcbiAgICByZXR1cm4gIXZhbHVlXG4gIH0sXG4gIG9iamVjdEVhY2g6IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZWFjaChfLmtleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgb2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KVxuICAgIH0sIGNvbnRleHQpXG4gIH0sXG4gIG9iamVjdE1hcDogZnVuY3Rpb24gb2JqZWN0TWFwIChvYmplY3QsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gY2FsbGJhY2suY2FsbChjb250ZXh0LCBvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfSxcbiAgb2JqZWN0UmVkdWNlOiBmdW5jdGlvbiBvYmplY3RSZWR1Y2UgKG9iamVjdCwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSkge1xuICAgIHZhciBvdXRwdXQgPSBpbml0aWFsVmFsdWVcbiAgICBmb3IgKHZhciBpIGluIG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShpKSkgb3V0cHV0ID0gY2FsbGJhY2sob3V0cHV0LCBvYmplY3RbaV0sIGksIG9iamVjdClcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dFxuICB9LFxuICBwaWNrOiBmdW5jdGlvbiBwaWNrIChvYmplY3QsIHRvUGljaykge1xuICAgIHZhciBvdXQgPSB7fVxuICAgIF8uZWFjaCh0b1BpY2ssIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICh0eXBlb2Ygb2JqZWN0W2tleV0gIT09ICd1bmRlZmluZWQnKSBvdXRba2V5XSA9IG9iamVjdFtrZXldXG4gICAgfSlcbiAgICByZXR1cm4gb3V0XG4gIH0sXG4gIHBsdWNrOiBmdW5jdGlvbiBwbHVjayAoYXJyYXksIGtleSkge1xuICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgdmFyIG91dCA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIGlmIChhcnJheVtpXSkgb3V0W2ldID0gYXJyYXlbaV1ba2V5XVxuICAgIHJldHVybiBvdXRcbiAgfSxcbiAgcmVkdWNlOiBpc05hdGl2ZShyZWR1Y2UpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVSZWR1Y2UgKGFycmF5LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKSB7XG4gICAgICByZXR1cm4gcmVkdWNlLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gcmVkdWNlIChhcnJheSwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSkge1xuICAgICAgdmFyIG91dHB1dCA9IGluaXRpYWxWYWx1ZVxuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSBvdXRwdXQgPSBjYWxsYmFjayhvdXRwdXQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICAgIHJldHVybiBvdXRwdXRcbiAgICB9LFxuICBzZXQ6IGZ1bmN0aW9uIHNldCAob2JqZWN0LCBwYXRoLCB2YWwpIHtcbiAgICBpZiAoIW9iamVjdCkgcmV0dXJuIG9iamVjdFxuICAgIGlmICh0eXBlb2Ygb2JqZWN0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqZWN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gb2JqZWN0XG4gICAgdmFyIHBhcnRzID0gcGF0aC5zcGxpdCgnLicpXG4gICAgdmFyIGNvbnRleHQgPSBvYmplY3RcbiAgICB2YXIgbmV4dEtleVxuICAgIGRvIHtcbiAgICAgIG5leHRLZXkgPSBwYXJ0cy5zaGlmdCgpXG4gICAgICBpZiAodHlwZW9mIGNvbnRleHRbbmV4dEtleV0gIT09ICdvYmplY3QnKSBjb250ZXh0W25leHRLZXldID0ge31cbiAgICAgIGlmIChwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHRbbmV4dEtleV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRleHRbbmV4dEtleV0gPSB2YWxcbiAgICAgIH1cbiAgICB9IHdoaWxlIChwYXJ0cy5sZW5ndGgpXG4gICAgcmV0dXJuIG9iamVjdFxuICB9LFxuICBzbGljZTogaXNOYXRpdmUoc2xpY2UpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVTbGljZSAoYXJyYXksIGJlZ2luLCBlbmQpIHtcbiAgICAgIGJlZ2luID0gYmVnaW4gfHwgMFxuICAgICAgZW5kID0gdHlwZW9mIGVuZCA9PT0gJ251bWJlcicgPyBlbmQgOiBhcnJheS5sZW5ndGhcbiAgICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBiZWdpbiwgZW5kKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIHNsaWNlIChhcnJheSwgc3RhcnQsIGVuZCkge1xuICAgICAgc3RhcnQgPSBzdGFydCB8fCAwXG4gICAgICBlbmQgPSB0eXBlb2YgZW5kID09PSAnbnVtYmVyJyA/IGVuZCA6IGFycmF5Lmxlbmd0aFxuICAgICAgdmFyIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoXG4gICAgICBpZiAoIWxlbmd0aCkge1xuICAgICAgICByZXR1cm4gW11cbiAgICAgIH1cbiAgICAgIGlmIChzdGFydCA8IDApIHtcbiAgICAgICAgc3RhcnQgPSAtc3RhcnQgPiBsZW5ndGggPyAwIDogKGxlbmd0aCArIHN0YXJ0KVxuICAgICAgfVxuICAgICAgZW5kID0gZW5kID4gbGVuZ3RoID8gbGVuZ3RoIDogZW5kXG4gICAgICBpZiAoZW5kIDwgMCkge1xuICAgICAgICBlbmQgKz0gbGVuZ3RoXG4gICAgICB9XG4gICAgICBsZW5ndGggPSBzdGFydCA+IGVuZCA/IDAgOiAoKGVuZCAtIHN0YXJ0KSA+Pj4gMClcbiAgICAgIHN0YXJ0ID4+Pj0gMFxuICAgICAgdmFyIGluZGV4ID0gLTFcbiAgICAgIHZhciByZXN1bHQgPSBuZXcgQXJyYXkobGVuZ3RoKVxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IGFycmF5W2luZGV4ICsgc3RhcnRdXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSxcbiAgc29tZTogaXNOYXRpdmUoc29tZSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZVNvbWUgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBzb21lLmNhbGwoY29sbCwgcHJlZCwgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBzb21lIChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWNvbGwgfHwgIXByZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpXG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbGwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByZWQuY2FsbChjb250ZXh0LCBjb2xsW2ldLCBpLCBjb2xsKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sXG4gIHVuaXF1ZTogZnVuY3Rpb24gdW5pcXVlIChhcnJheSkge1xuICAgIHJldHVybiBfLnJlZHVjZShhcnJheSwgZnVuY3Rpb24gKG1lbW8sIGN1cnIpIHtcbiAgICAgIGlmIChfLmluZGV4T2YobWVtbywgY3VycikgPT09IC0xKSB7XG4gICAgICAgIG1lbW8ucHVzaChjdXJyKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW9cbiAgICB9LCBbXSlcbiAgfSxcbiAgdmFsdWVzOiBpc05hdGl2ZSh2YWx1ZXMpXG4gICAgPyB2YWx1ZXNcbiAgICA6IGZ1bmN0aW9uIHZhbHVlcyAob2JqZWN0KSB7XG4gICAgICB2YXIgb3V0ID0gW11cbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSBvdXQucHVzaChvYmplY3Rba2V5XSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRcbiAgICB9LFxuICBuYW1lOiAnc2xhcGRhc2gnLFxuICB2ZXJzaW9uOiAnMS4zLjMnXG59XG5fLm9iamVjdE1hcC5hc0FycmF5ID0gZnVuY3Rpb24gb2JqZWN0TWFwQXNBcnJheSAob2JqZWN0LCBjYWxsYmFjaywgY29udGV4dCkge1xuICByZXR1cm4gXy5tYXAoXy5rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suY2FsbChjb250ZXh0LCBvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpXG4gIH0sIGNvbnRleHQpXG59XG5tb2R1bGUuZXhwb3J0cyA9IF9cbiIsInZhciBlcnIgPSBuZXcgRXJyb3IoJ0Vycm9yOiByZWN1cnNlcyEgaW5maW5pdGUgcHJvbWlzZSBjaGFpbiBkZXRlY3RlZCcpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHByb21pc2UgKHJlc29sdmVyKSB7XG4gIHZhciB3YWl0aW5nID0geyByZXM6IFtdLCByZWo6IFtdIH1cbiAgdmFyIHAgPSB7XG4gICAgJ3RoZW4nOiB0aGVuLFxuICAgICdjYXRjaCc6IGZ1bmN0aW9uIHRoZW5DYXRjaCAob25SZWplY3QpIHtcbiAgICAgIHJldHVybiB0aGVuKG51bGwsIG9uUmVqZWN0KVxuICAgIH1cbiAgfVxuICB0cnkgeyByZXNvbHZlcihyZXNvbHZlLCByZWplY3QpIH0gY2F0Y2ggKGUpIHtcbiAgICBwLnN0YXR1cyA9IGZhbHNlXG4gICAgcC52YWx1ZSA9IGVcbiAgfVxuICByZXR1cm4gcFxuXG4gIGZ1bmN0aW9uIHRoZW4gKG9uUmVzb2x2ZSwgb25SZWplY3QpIHtcbiAgICByZXR1cm4gcHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB3YWl0aW5nLnJlcy5wdXNoKGhhbmRsZU5leHQocCwgd2FpdGluZywgb25SZXNvbHZlLCByZXNvbHZlLCByZWplY3QsIG9uUmVqZWN0KSlcbiAgICAgIHdhaXRpbmcucmVqLnB1c2goaGFuZGxlTmV4dChwLCB3YWl0aW5nLCBvblJlamVjdCwgcmVzb2x2ZSwgcmVqZWN0LCBvblJlamVjdCkpXG4gICAgICBpZiAodHlwZW9mIHAuc3RhdHVzICE9PSAndW5kZWZpbmVkJykgZmx1c2god2FpdGluZywgcClcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZSAodmFsKSB7XG4gICAgaWYgKHR5cGVvZiBwLnN0YXR1cyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuICAgIGlmICh2YWwgPT09IHApIHRocm93IGVyclxuICAgIGlmICh2YWwpIHRyeSB7IGlmICh0eXBlb2YgdmFsLnRoZW4gPT09ICdmdW5jdGlvbicpIHJldHVybiB2YWwudGhlbihyZXNvbHZlLCByZWplY3QpIH0gY2F0Y2ggKGUpIHt9XG4gICAgcC5zdGF0dXMgPSB0cnVlXG4gICAgcC52YWx1ZSA9IHZhbFxuICAgIGZsdXNoKHdhaXRpbmcsIHApXG4gIH1cblxuICBmdW5jdGlvbiByZWplY3QgKHZhbCkge1xuICAgIGlmICh0eXBlb2YgcC5zdGF0dXMgIT09ICd1bmRlZmluZWQnKSByZXR1cm5cbiAgICBpZiAodmFsID09PSBwKSB0aHJvdyBlcnJcbiAgICBwLnN0YXR1cyA9IGZhbHNlXG4gICAgcC52YWx1ZSA9IHZhbFxuICAgIGZsdXNoKHdhaXRpbmcsIHApXG4gIH1cbn1cblxuZnVuY3Rpb24gZmx1c2ggKHdhaXRpbmcsIHApIHtcbiAgdmFyIHF1ZXVlID0gcC5zdGF0dXMgPyB3YWl0aW5nLnJlcyA6IHdhaXRpbmcucmVqXG4gIHdoaWxlIChxdWV1ZS5sZW5ndGgpIHF1ZXVlLnNoaWZ0KCkocC52YWx1ZSlcbn1cblxuZnVuY3Rpb24gaGFuZGxlTmV4dCAocCwgd2FpdGluZywgaGFuZGxlciwgcmVzb2x2ZSwgcmVqZWN0LCBoYXNSZWplY3QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG5leHQgKHZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhbHVlID0gaGFuZGxlciA/IGhhbmRsZXIodmFsdWUpIDogdmFsdWVcbiAgICAgIGlmIChwLnN0YXR1cykgcmV0dXJuIHJlc29sdmUodmFsdWUpXG4gICAgICByZXR1cm4gaGFzUmVqZWN0ID8gcmVzb2x2ZSh2YWx1ZSkgOiByZWplY3QodmFsdWUpXG4gICAgfSBjYXRjaCAoZXJyKSB7IHJlamVjdChlcnIpIH1cbiAgfVxufVxuIiwiLyohXG4gKiBHbGlkZS5qcyB2My41LjJcbiAqIChjKSAyMDEzLTIwMjEgSsSZZHJ6ZWogQ2hhxYJ1YmVrIChodHRwczovL2dpdGh1Yi5jb20vamVkcnplamNoYWx1YmVrLylcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqL1xuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7XG5cbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7XG4gICAgX3R5cGVvZiA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgX3R5cGVvZiA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gX3R5cGVvZihvYmopO1xufVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIF9zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7XG59XG5cbmZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7XG4gIF9nZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5nZXRQcm90b3R5cGVPZiA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7XG4gICAgcmV0dXJuIG8uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTtcbiAgfTtcbiAgcmV0dXJuIF9nZXRQcm90b3R5cGVPZihvKTtcbn1cblxuZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHtcbiAgX3NldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7XG4gICAgby5fX3Byb3RvX18gPSBwO1xuICAgIHJldHVybiBvO1xuICB9O1xuXG4gIHJldHVybiBfc2V0UHJvdG90eXBlT2YobywgcCk7XG59XG5cbmZ1bmN0aW9uIF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7XG4gIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhUmVmbGVjdC5jb25zdHJ1Y3QpIHJldHVybiBmYWxzZTtcbiAgaWYgKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pIHJldHVybiBmYWxzZTtcbiAgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTtcblxuICB0cnkge1xuICAgIEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2YuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChCb29sZWFuLCBbXSwgZnVuY3Rpb24gKCkge30pKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHtcbiAgaWYgKHNlbGYgPT09IHZvaWQgMCkge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtcbiAgfVxuXG4gIHJldHVybiBzZWxmO1xufVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7XG4gIGlmIChjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgIHJldHVybiBjYWxsO1xuICB9IGVsc2UgaWYgKGNhbGwgIT09IHZvaWQgMCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJEZXJpdmVkIGNvbnN0cnVjdG9ycyBtYXkgb25seSByZXR1cm4gb2JqZWN0IG9yIHVuZGVmaW5lZFwiKTtcbiAgfVxuXG4gIHJldHVybiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpO1xufVxuXG5mdW5jdGlvbiBfY3JlYXRlU3VwZXIoRGVyaXZlZCkge1xuICB2YXIgaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKTtcblxuICByZXR1cm4gZnVuY3Rpb24gX2NyZWF0ZVN1cGVySW50ZXJuYWwoKSB7XG4gICAgdmFyIFN1cGVyID0gX2dldFByb3RvdHlwZU9mKERlcml2ZWQpLFxuICAgICAgICByZXN1bHQ7XG5cbiAgICBpZiAoaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCkge1xuICAgICAgdmFyIE5ld1RhcmdldCA9IF9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjtcblxuICAgICAgcmVzdWx0ID0gUmVmbGVjdC5jb25zdHJ1Y3QoU3VwZXIsIGFyZ3VtZW50cywgTmV3VGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gU3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgcmVzdWx0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gX3N1cGVyUHJvcEJhc2Uob2JqZWN0LCBwcm9wZXJ0eSkge1xuICB3aGlsZSAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSkge1xuICAgIG9iamVjdCA9IF9nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuICAgIGlmIChvYmplY3QgPT09IG51bGwpIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuZnVuY3Rpb24gX2dldCgpIHtcbiAgaWYgKHR5cGVvZiBSZWZsZWN0ICE9PSBcInVuZGVmaW5lZFwiICYmIFJlZmxlY3QuZ2V0KSB7XG4gICAgX2dldCA9IFJlZmxlY3QuZ2V0O1xuICB9IGVsc2Uge1xuICAgIF9nZXQgPSBmdW5jdGlvbiBfZ2V0KHRhcmdldCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gICAgICB2YXIgYmFzZSA9IF9zdXBlclByb3BCYXNlKHRhcmdldCwgcHJvcGVydHkpO1xuXG4gICAgICBpZiAoIWJhc2UpIHJldHVybjtcbiAgICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihiYXNlLCBwcm9wZXJ0eSk7XG5cbiAgICAgIGlmIChkZXNjLmdldCkge1xuICAgICAgICByZXR1cm4gZGVzYy5nZXQuY2FsbChhcmd1bWVudHMubGVuZ3RoIDwgMyA/IHRhcmdldCA6IHJlY2VpdmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlc2MudmFsdWU7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfZ2V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIFR5cGUgb2YgdGhlIG1vdmVtZW50LlxuICAgKlxuICAgKiBBdmFpbGFibGUgdHlwZXM6XG4gICAqIGBzbGlkZXJgIC0gUmV3aW5kcyBzbGlkZXIgdG8gdGhlIHN0YXJ0L2VuZCB3aGVuIGl0IHJlYWNoZXMgdGhlIGZpcnN0IG9yIGxhc3Qgc2xpZGUuXG4gICAqIGBjYXJvdXNlbGAgLSBDaGFuZ2VzIHNsaWRlcyB3aXRob3V0IHN0YXJ0aW5nIG92ZXIgd2hlbiBpdCByZWFjaGVzIHRoZSBmaXJzdCBvciBsYXN0IHNsaWRlLlxuICAgKlxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKi9cbiAgdHlwZTogJ3NsaWRlcicsXG5cbiAgLyoqXG4gICAqIFN0YXJ0IGF0IHNwZWNpZmljIHNsaWRlIG51bWJlciBkZWZpbmVkIHdpdGggemVyby1iYXNlZCBpbmRleC5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHN0YXJ0QXQ6IDAsXG5cbiAgLyoqXG4gICAqIEEgbnVtYmVyIG9mIHNsaWRlcyB2aXNpYmxlIG9uIHRoZSBzaW5nbGUgdmlld3BvcnQuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICBwZXJWaWV3OiAxLFxuXG4gIC8qKlxuICAgKiBGb2N1cyBjdXJyZW50bHkgYWN0aXZlIHNsaWRlIGF0IGEgc3BlY2lmaWVkIHBvc2l0aW9uIGluIHRoZSB0cmFjay5cbiAgICpcbiAgICogQXZhaWxhYmxlIGlucHV0czpcbiAgICogYGNlbnRlcmAgLSBDdXJyZW50IHNsaWRlIHdpbGwgYmUgYWx3YXlzIGZvY3VzZWQgYXQgdGhlIGNlbnRlciBvZiBhIHRyYWNrLlxuICAgKiBgMCwxLDIsMy4uLmAgLSBDdXJyZW50IHNsaWRlIHdpbGwgYmUgZm9jdXNlZCBvbiB0aGUgc3BlY2lmaWVkIHplcm8tYmFzZWQgaW5kZXguXG4gICAqXG4gICAqIEB0eXBlIHtTdHJpbmd8TnVtYmVyfVxuICAgKi9cbiAgZm9jdXNBdDogMCxcblxuICAvKipcbiAgICogQSBzaXplIG9mIHRoZSBnYXAgYWRkZWQgYmV0d2VlbiBzbGlkZXMuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICBnYXA6IDEwLFxuXG4gIC8qKlxuICAgKiBDaGFuZ2Ugc2xpZGVzIGFmdGVyIGEgc3BlY2lmaWVkIGludGVydmFsLiBVc2UgYGZhbHNlYCBmb3IgdHVybmluZyBvZmYgYXV0b3BsYXkuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ8Qm9vbGVhbn1cbiAgICovXG4gIGF1dG9wbGF5OiBmYWxzZSxcblxuICAvKipcbiAgICogU3RvcCBhdXRvcGxheSBvbiBtb3VzZW92ZXIgZXZlbnQuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cbiAgaG92ZXJwYXVzZTogdHJ1ZSxcblxuICAvKipcbiAgICogQWxsb3cgZm9yIGNoYW5naW5nIHNsaWRlcyB3aXRoIGxlZnQgYW5kIHJpZ2h0IGtleWJvYXJkIGFycm93cy5cbiAgICpcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuICBrZXlib2FyZDogdHJ1ZSxcblxuICAvKipcbiAgICogU3RvcCBydW5uaW5nIGBwZXJWaWV3YCBudW1iZXIgb2Ygc2xpZGVzIGZyb20gdGhlIGVuZC4gVXNlIHRoaXNcbiAgICogb3B0aW9uIGlmIHlvdSBkb24ndCB3YW50IHRvIGhhdmUgYW4gZW1wdHkgc3BhY2UgYWZ0ZXJcbiAgICogYSBzbGlkZXIuIFdvcmtzIG9ubHkgd2l0aCBgc2xpZGVyYCB0eXBlIGFuZCBhXG4gICAqIG5vbi1jZW50ZXJlZCBgZm9jdXNBdGAgc2V0dGluZy5cbiAgICpcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuICBib3VuZDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIE1pbmltYWwgc3dpcGUgZGlzdGFuY2UgbmVlZGVkIHRvIGNoYW5nZSB0aGUgc2xpZGUuIFVzZSBgZmFsc2VgIGZvciB0dXJuaW5nIG9mZiBhIHN3aXBpbmcuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ8Qm9vbGVhbn1cbiAgICovXG4gIHN3aXBlVGhyZXNob2xkOiA4MCxcblxuICAvKipcbiAgICogTWluaW1hbCBtb3VzZSBkcmFnIGRpc3RhbmNlIG5lZWRlZCB0byBjaGFuZ2UgdGhlIHNsaWRlLiBVc2UgYGZhbHNlYCBmb3IgdHVybmluZyBvZmYgYSBkcmFnZ2luZy5cbiAgICpcbiAgICogQHR5cGUge051bWJlcnxCb29sZWFufVxuICAgKi9cbiAgZHJhZ1RocmVzaG9sZDogMTIwLFxuXG4gIC8qKlxuICAgKiBBIG51bWJlciBvZiBzbGlkZXMgbW92ZWQgb24gc2luZ2xlIHN3aXBlLlxuICAgKlxuICAgKiBBdmFpbGFibGUgdHlwZXM6XG4gICAqIGBgIC0gTW92ZXMgc2xpZGVyIGJ5IG9uZSBzbGlkZSBwZXIgc3dpcGVcbiAgICogYHxgIC0gTW92ZXMgc2xpZGVyIGJldHdlZW4gdmlld3MgcGVyIHN3aXBlIChudW1iZXIgb2Ygc2xpZGVzIGRlZmluZWQgaW4gYHBlclZpZXdgIG9wdGlvbnMpXG4gICAqXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBwZXJTd2lwZTogJycsXG5cbiAgLyoqXG4gICAqIE1vdmluZyBkaXN0YW5jZSByYXRpbyBvZiB0aGUgc2xpZGVzIG9uIGEgc3dpcGluZyBhbmQgZHJhZ2dpbmcuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICB0b3VjaFJhdGlvOiAwLjUsXG5cbiAgLyoqXG4gICAqIEFuZ2xlIHJlcXVpcmVkIHRvIGFjdGl2YXRlIHNsaWRlcyBtb3Zpbmcgb24gc3dpcGluZyBvciBkcmFnZ2luZy5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHRvdWNoQW5nbGU6IDQ1LFxuXG4gIC8qKlxuICAgKiBEdXJhdGlvbiBvZiB0aGUgYW5pbWF0aW9uIGluIG1pbGxpc2Vjb25kcy5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGFuaW1hdGlvbkR1cmF0aW9uOiA0MDAsXG5cbiAgLyoqXG4gICAqIEFsbG93cyBsb29waW5nIHRoZSBgc2xpZGVyYCB0eXBlLiBTbGlkZXIgd2lsbCByZXdpbmQgdG8gdGhlIGZpcnN0L2xhc3Qgc2xpZGUgd2hlbiBpdCdzIGF0IHRoZSBzdGFydC9lbmQuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cbiAgcmV3aW5kOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBEdXJhdGlvbiBvZiB0aGUgcmV3aW5kaW5nIGFuaW1hdGlvbiBvZiB0aGUgYHNsaWRlcmAgdHlwZSBpbiBtaWxsaXNlY29uZHMuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICByZXdpbmREdXJhdGlvbjogODAwLFxuXG4gIC8qKlxuICAgKiBFYXNpbmcgZnVuY3Rpb24gZm9yIHRoZSBhbmltYXRpb24uXG4gICAqXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBhbmltYXRpb25UaW1pbmdGdW5jOiAnY3ViaWMtYmV6aWVyKC4xNjUsIC44NDAsIC40NDAsIDEpJyxcblxuICAvKipcbiAgICogV2FpdCBmb3IgdGhlIGFuaW1hdGlvbiB0byBmaW5pc2ggdW50aWwgdGhlIG5leHQgdXNlciBpbnB1dCBjYW4gYmUgcHJvY2Vzc2VkXG4gICAqXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKi9cbiAgd2FpdEZvclRyYW5zaXRpb246IHRydWUsXG5cbiAgLyoqXG4gICAqIFRocm90dGxlIGNvc3RseSBldmVudHMgYXQgbW9zdCBvbmNlIHBlciBldmVyeSB3YWl0IG1pbGxpc2Vjb25kcy5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHRocm90dGxlOiAxMCxcblxuICAvKipcbiAgICogTW92aW5nIGRpcmVjdGlvbiBtb2RlLlxuICAgKlxuICAgKiBBdmFpbGFibGUgaW5wdXRzOlxuICAgKiAtICdsdHInIC0gbGVmdCB0byByaWdodCBtb3ZlbWVudCxcbiAgICogLSAncnRsJyAtIHJpZ2h0IHRvIGxlZnQgbW92ZW1lbnQuXG4gICAqXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBkaXJlY3Rpb246ICdsdHInLFxuXG4gIC8qKlxuICAgKiBUaGUgZGlzdGFuY2UgdmFsdWUgb2YgdGhlIG5leHQgYW5kIHByZXZpb3VzIHZpZXdwb3J0cyB3aGljaFxuICAgKiBoYXZlIHRvIHBlZWsgaW4gdGhlIGN1cnJlbnQgdmlldy4gQWNjZXB0cyBudW1iZXIgYW5kXG4gICAqIHBpeGVscyBhcyBhIHN0cmluZy4gTGVmdCBhbmQgcmlnaHQgcGVla2luZyBjYW4gYmVcbiAgICogc2V0IHVwIHNlcGFyYXRlbHkgd2l0aCBhIGRpcmVjdGlvbnMgb2JqZWN0LlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZTpcbiAgICogYDEwMGAgLSBQZWVrIDEwMHB4IG9uIHRoZSBib3RoIHNpZGVzLlxuICAgKiB7IGJlZm9yZTogMTAwLCBhZnRlcjogNTAgfWAgLSBQZWVrIDEwMHB4IG9uIHRoZSBsZWZ0IHNpZGUgYW5kIDUwcHggb24gdGhlIHJpZ2h0IHNpZGUuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ8U3RyaW5nfE9iamVjdH1cbiAgICovXG4gIHBlZWs6IDAsXG5cbiAgLyoqXG4gICAqIERlZmluZXMgaG93IG1hbnkgY2xvbmVzIG9mIGN1cnJlbnQgdmlld3BvcnQgd2lsbCBiZSBnZW5lcmF0ZWQuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICBjbG9uaW5nUmF0aW86IDEsXG5cbiAgLyoqXG4gICAqIENvbGxlY3Rpb24gb2Ygb3B0aW9ucyBhcHBsaWVkIGF0IHNwZWNpZmllZCBtZWRpYSBicmVha3BvaW50cy5cbiAgICogRm9yIGV4YW1wbGU6IGRpc3BsYXkgdHdvIHNsaWRlcyBwZXIgdmlldyB1bmRlciA4MDBweC5cbiAgICogYHtcbiAgICogICAnODAwcHgnOiB7XG4gICAqICAgICBwZXJWaWV3OiAyXG4gICAqICAgfVxuICAgKiB9YFxuICAgKi9cbiAgYnJlYWtwb2ludHM6IHt9LFxuXG4gIC8qKlxuICAgKiBDb2xsZWN0aW9uIG9mIGludGVybmFsbHkgdXNlZCBIVE1MIGNsYXNzZXMuXG4gICAqXG4gICAqIEB0b2RvIFJlZmFjdG9yIGBzbGlkZXJgIGFuZCBgY2Fyb3VzZWxgIHByb3BlcnRpZXMgdG8gc2luZ2xlIGB0eXBlOiB7IHNsaWRlcjogJycsIGNhcm91c2VsOiAnJyB9YCBvYmplY3RcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG4gIGNsYXNzZXM6IHtcbiAgICBzd2lwZWFibGU6ICdnbGlkZS0tc3dpcGVhYmxlJyxcbiAgICBkcmFnZ2luZzogJ2dsaWRlLS1kcmFnZ2luZycsXG4gICAgZGlyZWN0aW9uOiB7XG4gICAgICBsdHI6ICdnbGlkZS0tbHRyJyxcbiAgICAgIHJ0bDogJ2dsaWRlLS1ydGwnXG4gICAgfSxcbiAgICB0eXBlOiB7XG4gICAgICBzbGlkZXI6ICdnbGlkZS0tc2xpZGVyJyxcbiAgICAgIGNhcm91c2VsOiAnZ2xpZGUtLWNhcm91c2VsJ1xuICAgIH0sXG4gICAgc2xpZGU6IHtcbiAgICAgIGNsb25lOiAnZ2xpZGVfX3NsaWRlLS1jbG9uZScsXG4gICAgICBhY3RpdmU6ICdnbGlkZV9fc2xpZGUtLWFjdGl2ZSdcbiAgICB9LFxuICAgIGFycm93OiB7XG4gICAgICBkaXNhYmxlZDogJ2dsaWRlX19hcnJvdy0tZGlzYWJsZWQnXG4gICAgfSxcbiAgICBuYXY6IHtcbiAgICAgIGFjdGl2ZTogJ2dsaWRlX19idWxsZXQtLWFjdGl2ZSdcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogT3V0cHV0cyB3YXJuaW5nIG1lc3NhZ2UgdG8gdGhlIGJvd3NlciBjb25zb2xlLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gbXNnXG4gKiBAcmV0dXJuIHtWb2lkfVxuICovXG5mdW5jdGlvbiB3YXJuKG1zZykge1xuICBjb25zb2xlLmVycm9yKFwiW0dsaWRlIHdhcm5dOiBcIi5jb25jYXQobXNnKSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgdmFsdWUgZW50ZXJlZCBhcyBudW1iZXJcbiAqIG9yIHN0cmluZyB0byBpbnRlZ2VyIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICogQHJldHVybnMge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gdG9JbnQodmFsdWUpIHtcbiAgcmV0dXJuIHBhcnNlSW50KHZhbHVlKTtcbn1cbi8qKlxuICogQ29udmVydHMgdmFsdWUgZW50ZXJlZCBhcyBudW1iZXJcbiAqIG9yIHN0cmluZyB0byBmbGF0IHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICogQHJldHVybnMge051bWJlcn1cbiAqL1xuXG5mdW5jdGlvbiB0b0Zsb2F0KHZhbHVlKSB7XG4gIHJldHVybiBwYXJzZUZsb2F0KHZhbHVlKTtcbn1cbi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gIHsqfSAgIHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xufVxuLyoqXG4gKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gIHsqfSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gX3R5cGVvZih2YWx1ZSk7XG5cbiAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISF2YWx1ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1taXhlZC1vcGVyYXRvcnNcbn1cbi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSAgeyp9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cbi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyB1bmRlZmluZWQuXG4gKlxuICogQHBhcmFtICB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCc7XG59XG4vKipcbiAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYW4gYXJyYXkuXG4gKlxuICogQHBhcmFtICB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaXNBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUuY29uc3RydWN0b3IgPT09IEFycmF5O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW5kIGluaXRpYWxpemVzIHNwZWNpZmllZCBjb2xsZWN0aW9uIG9mIGV4dGVuc2lvbnMuXG4gKiBFYWNoIGV4dGVuc2lvbiByZWNlaXZlcyBhY2Nlc3MgdG8gaW5zdGFuY2Ugb2YgZ2xpZGUgYW5kIHJlc3Qgb2YgY29tcG9uZW50cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZ2xpZGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBleHRlbnNpb25zXG4gKlxuICogQHJldHVybnMge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBtb3VudChnbGlkZSwgZXh0ZW5zaW9ucywgZXZlbnRzKSB7XG4gIHZhciBjb21wb25lbnRzID0ge307XG5cbiAgZm9yICh2YXIgbmFtZSBpbiBleHRlbnNpb25zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oZXh0ZW5zaW9uc1tuYW1lXSkpIHtcbiAgICAgIGNvbXBvbmVudHNbbmFtZV0gPSBleHRlbnNpb25zW25hbWVdKGdsaWRlLCBjb21wb25lbnRzLCBldmVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3YXJuKCdFeHRlbnNpb24gbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgX25hbWUgaW4gY29tcG9uZW50cykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNvbXBvbmVudHNbX25hbWVdLm1vdW50KSkge1xuICAgICAgY29tcG9uZW50c1tfbmFtZV0ubW91bnQoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gY29tcG9uZW50cztcbn1cblxuLyoqXG4gKiBEZWZpbmVzIGdldHRlciBhbmQgc2V0dGVyIHByb3BlcnR5IG9uIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqICAgICAgICAgT2JqZWN0IHdoZXJlIHByb3BlcnR5IGhhcyB0byBiZSBkZWZpbmVkLlxuICogQHBhcmFtICB7U3RyaW5nfSBwcm9wICAgICAgICBOYW1lIG9mIHRoZSBkZWZpbmVkIHByb3BlcnR5LlxuICogQHBhcmFtICB7T2JqZWN0fSBkZWZpbml0aW9uICBHZXQgYW5kIHNldCBkZWZpbml0aW9ucyBmb3IgdGhlIHByb3BlcnR5LlxuICogQHJldHVybiB7Vm9pZH1cbiAqL1xuZnVuY3Rpb24gZGVmaW5lKG9iaiwgcHJvcCwgZGVmaW5pdGlvbikge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wLCBkZWZpbml0aW9uKTtcbn1cbi8qKlxuICogU29ydHMgYXBoYWJldGljYWxseSBvYmplY3Qga2V5cy5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIHNvcnRLZXlzKG9iaikge1xuICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5zb3J0KCkucmVkdWNlKGZ1bmN0aW9uIChyLCBrKSB7XG4gICAgcltrXSA9IG9ialtrXTtcbiAgICByZXR1cm4gcltrXSwgcjtcbiAgfSwge30pO1xufVxuLyoqXG4gKiBNZXJnZXMgcGFzc2VkIHNldHRpbmdzIG9iamVjdCB3aXRoIGRlZmF1bHQgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRlZmF1bHRzXG4gKiBAcGFyYW0gIHtPYmplY3R9IHNldHRpbmdzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gbWVyZ2VPcHRpb25zKGRlZmF1bHRzLCBzZXR0aW5ncykge1xuICB2YXIgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBzZXR0aW5ncyk7IC8vIGBPYmplY3QuYXNzaWduYCBkbyBub3QgZGVlcGx5IG1lcmdlIG9iamVjdHMsIHNvIHdlXG4gIC8vIGhhdmUgdG8gZG8gaXQgbWFudWFsbHkgZm9yIGV2ZXJ5IG5lc3RlZCBvYmplY3RcbiAgLy8gaW4gb3B0aW9ucy4gQWx0aG91Z2ggaXQgZG9lcyBub3QgbG9vayBzbWFydCxcbiAgLy8gaXQncyBzbWFsbGVyIGFuZCBmYXN0ZXIgdGhhbiBzb21lIGZhbmN5XG4gIC8vIG1lcmdpbmcgZGVlcC1tZXJnZSBhbGdvcml0aG0gc2NyaXB0LlxuXG4gIGlmIChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnY2xhc3NlcycpKSB7XG4gICAgb3B0aW9ucy5jbGFzc2VzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMuY2xhc3Nlcywgc2V0dGluZ3MuY2xhc3Nlcyk7XG5cbiAgICBpZiAoc2V0dGluZ3MuY2xhc3Nlcy5oYXNPd25Qcm9wZXJ0eSgnZGlyZWN0aW9uJykpIHtcbiAgICAgIG9wdGlvbnMuY2xhc3Nlcy5kaXJlY3Rpb24gPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cy5jbGFzc2VzLmRpcmVjdGlvbiwgc2V0dGluZ3MuY2xhc3Nlcy5kaXJlY3Rpb24pO1xuICAgIH1cblxuICAgIGlmIChzZXR0aW5ncy5jbGFzc2VzLmhhc093blByb3BlcnR5KCd0eXBlJykpIHtcbiAgICAgIG9wdGlvbnMuY2xhc3Nlcy50eXBlID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMuY2xhc3Nlcy50eXBlLCBzZXR0aW5ncy5jbGFzc2VzLnR5cGUpO1xuICAgIH1cblxuICAgIGlmIChzZXR0aW5ncy5jbGFzc2VzLmhhc093blByb3BlcnR5KCdzbGlkZScpKSB7XG4gICAgICBvcHRpb25zLmNsYXNzZXMuc2xpZGUgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cy5jbGFzc2VzLnNsaWRlLCBzZXR0aW5ncy5jbGFzc2VzLnNsaWRlKTtcbiAgICB9XG5cbiAgICBpZiAoc2V0dGluZ3MuY2xhc3Nlcy5oYXNPd25Qcm9wZXJ0eSgnYXJyb3cnKSkge1xuICAgICAgb3B0aW9ucy5jbGFzc2VzLmFycm93ID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMuY2xhc3Nlcy5hcnJvdywgc2V0dGluZ3MuY2xhc3Nlcy5hcnJvdyk7XG4gICAgfVxuXG4gICAgaWYgKHNldHRpbmdzLmNsYXNzZXMuaGFzT3duUHJvcGVydHkoJ25hdicpKSB7XG4gICAgICBvcHRpb25zLmNsYXNzZXMubmF2ID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMuY2xhc3Nlcy5uYXYsIHNldHRpbmdzLmNsYXNzZXMubmF2KTtcbiAgICB9XG4gIH1cblxuICBpZiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2JyZWFrcG9pbnRzJykpIHtcbiAgICBvcHRpb25zLmJyZWFrcG9pbnRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMuYnJlYWtwb2ludHMsIHNldHRpbmdzLmJyZWFrcG9pbnRzKTtcbiAgfVxuXG4gIHJldHVybiBvcHRpb25zO1xufVxuXG52YXIgRXZlbnRzQnVzID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIEV2ZW50QnVzIGluc3RhbmNlLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRzXG4gICAqL1xuICBmdW5jdGlvbiBFdmVudHNCdXMoKSB7XG4gICAgdmFyIGV2ZW50cyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRXZlbnRzQnVzKTtcblxuICAgIHRoaXMuZXZlbnRzID0gZXZlbnRzO1xuICAgIHRoaXMuaG9wID0gZXZlbnRzLmhhc093blByb3BlcnR5O1xuICB9XG4gIC8qKlxuICAgKiBBZGRzIGxpc3RlbmVyIHRvIHRoZSBzcGVjaWZlZCBldmVudC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IGV2ZW50XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAgICovXG5cblxuICBfY3JlYXRlQ2xhc3MoRXZlbnRzQnVzLCBbe1xuICAgIGtleTogXCJvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvbihldmVudCwgaGFuZGxlcikge1xuICAgICAgaWYgKGlzQXJyYXkoZXZlbnQpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLm9uKGV2ZW50W2ldLCBoYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gQ3JlYXRlIHRoZSBldmVudCdzIG9iamVjdCBpZiBub3QgeWV0IGNyZWF0ZWRcblxuXG4gICAgICBpZiAoIXRoaXMuaG9wLmNhbGwodGhpcy5ldmVudHMsIGV2ZW50KSkge1xuICAgICAgICB0aGlzLmV2ZW50c1tldmVudF0gPSBbXTtcbiAgICAgIH0gLy8gQWRkIHRoZSBoYW5kbGVyIHRvIHF1ZXVlXG5cblxuICAgICAgdmFyIGluZGV4ID0gdGhpcy5ldmVudHNbZXZlbnRdLnB1c2goaGFuZGxlcikgLSAxOyAvLyBQcm92aWRlIGhhbmRsZSBiYWNrIGZvciByZW1vdmFsIG9mIGV2ZW50XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmV2ZW50c1tldmVudF1baW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSdW5zIHJlZ2lzdGVyZWQgaGFuZGxlcnMgZm9yIHNwZWNpZmllZCBldmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBldmVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0PX0gY29udGV4dFxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZW1pdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBlbWl0KGV2ZW50LCBjb250ZXh0KSB7XG4gICAgICBpZiAoaXNBcnJheShldmVudCkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRoaXMuZW1pdChldmVudFtpXSwgY29udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIElmIHRoZSBldmVudCBkb2Vzbid0IGV4aXN0LCBvciB0aGVyZSdzIG5vIGhhbmRsZXJzIGluIHF1ZXVlLCBqdXN0IGxlYXZlXG5cblxuICAgICAgaWYgKCF0aGlzLmhvcC5jYWxsKHRoaXMuZXZlbnRzLCBldmVudCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBDeWNsZSB0aHJvdWdoIGV2ZW50cyBxdWV1ZSwgZmlyZSFcblxuXG4gICAgICB0aGlzLmV2ZW50c1tldmVudF0uZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBpdGVtKGNvbnRleHQgfHwge30pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEV2ZW50c0J1cztcbn0oKTtcblxudmFyIEdsaWRlJDEgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICAvKipcclxuICAgKiBDb25zdHJ1Y3QgZ2xpZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHNlbGVjdG9yXHJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXHJcbiAgICovXG4gIGZ1bmN0aW9uIEdsaWRlKHNlbGVjdG9yKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEdsaWRlKTtcblxuICAgIHRoaXMuX2MgPSB7fTtcbiAgICB0aGlzLl90ID0gW107XG4gICAgdGhpcy5fZSA9IG5ldyBFdmVudHNCdXMoKTtcbiAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XG4gICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIHRoaXMuc2V0dGluZ3MgPSBtZXJnZU9wdGlvbnMoZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMuaW5kZXggPSB0aGlzLnNldHRpbmdzLnN0YXJ0QXQ7XG4gIH1cbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgZ2xpZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge09iamVjdH0gZXh0ZW5zaW9ucyBDb2xsZWN0aW9uIG9mIGV4dGVuc2lvbnMgdG8gaW5pdGlhbGl6ZS5cclxuICAgKiBAcmV0dXJuIHtHbGlkZX1cclxuICAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhHbGlkZSwgW3tcbiAgICBrZXk6IFwibW91bnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW91bnQkMSgpIHtcbiAgICAgIHZhciBleHRlbnNpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcblxuICAgICAgdGhpcy5fZS5lbWl0KCdtb3VudC5iZWZvcmUnKTtcblxuICAgICAgaWYgKGlzT2JqZWN0KGV4dGVuc2lvbnMpKSB7XG4gICAgICAgIHRoaXMuX2MgPSBtb3VudCh0aGlzLCBleHRlbnNpb25zLCB0aGlzLl9lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm4oJ1lvdSBuZWVkIHRvIHByb3ZpZGUgYSBvYmplY3Qgb24gYG1vdW50KClgJyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2UuZW1pdCgnbW91bnQuYWZ0ZXInKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogQ29sbGVjdHMgYW4gaW5zdGFuY2UgYHRyYW5zbGF0ZWAgdHJhbnNmb3JtZXJzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge0FycmF5fSB0cmFuc2Zvcm1lcnMgQ29sbGVjdGlvbiBvZiB0cmFuc2Zvcm1lcnMuXHJcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJtdXRhdGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbXV0YXRlKCkge1xuICAgICAgdmFyIHRyYW5zZm9ybWVycyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogW107XG5cbiAgICAgIGlmIChpc0FycmF5KHRyYW5zZm9ybWVycykpIHtcbiAgICAgICAgdGhpcy5fdCA9IHRyYW5zZm9ybWVycztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm4oJ1lvdSBuZWVkIHRvIHByb3ZpZGUgYSBhcnJheSBvbiBgbXV0YXRlKClgJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFVwZGF0ZXMgZ2xpZGUgd2l0aCBzcGVjaWZpZWQgc2V0dGluZ3MuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHNldHRpbmdzXHJcbiAgICAgKiBAcmV0dXJuIHtHbGlkZX1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgIHZhciBzZXR0aW5ncyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICB0aGlzLnNldHRpbmdzID0gbWVyZ2VPcHRpb25zKHRoaXMuc2V0dGluZ3MsIHNldHRpbmdzKTtcblxuICAgICAgaWYgKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdzdGFydEF0JykpIHtcbiAgICAgICAgdGhpcy5pbmRleCA9IHNldHRpbmdzLnN0YXJ0QXQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2UuZW1pdCgndXBkYXRlJyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIENoYW5nZSBzbGlkZSB3aXRoIHNwZWNpZmllZCBwYXR0ZXJuLiBBIHBhdHRlcm4gbXVzdCBiZSBpbiB0aGUgc3BlY2lhbCBmb3JtYXQ6XHJcbiAgICAgKiBgPmAgLSBNb3ZlIG9uZSBmb3J3YXJkXHJcbiAgICAgKiBgPGAgLSBNb3ZlIG9uZSBiYWNrd2FyZFxyXG4gICAgICogYD17aX1gIC0gR28gdG8ge2l9IHplcm8tYmFzZWQgc2xpZGUgKGVxLiAnPTEnLCB3aWxsIGdvIHRvIHNlY29uZCBzbGlkZSlcclxuICAgICAqIGA+PmAgLSBSZXdpbmRzIHRvIGVuZCAobGFzdCBzbGlkZSlcclxuICAgICAqIGA8PGAgLSBSZXdpbmRzIHRvIHN0YXJ0IChmaXJzdCBzbGlkZSlcclxuICAgICAqIGB8PmAgLSBNb3ZlIG9uZSB2aWV3cG9ydCBmb3J3YXJkXHJcbiAgICAgKiBgfDxgIC0gTW92ZSBvbmUgdmlld3BvcnQgYmFja3dhcmRcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0dGVyblxyXG4gICAgICogQHJldHVybiB7R2xpZGV9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImdvXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdvKHBhdHRlcm4pIHtcbiAgICAgIHRoaXMuX2MuUnVuLm1ha2UocGF0dGVybik7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIE1vdmUgdHJhY2sgYnkgc3BlY2lmaWVkIGRpc3RhbmNlLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkaXN0YW5jZVxyXG4gICAgICogQHJldHVybiB7R2xpZGV9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIm1vdmVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW92ZShkaXN0YW5jZSkge1xuICAgICAgdGhpcy5fYy5UcmFuc2l0aW9uLmRpc2FibGUoKTtcblxuICAgICAgdGhpcy5fYy5Nb3ZlLm1ha2UoZGlzdGFuY2UpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBEZXN0cm95IGluc3RhbmNlIGFuZCByZXZlcnQgYWxsIGNoYW5nZXMgZG9uZSBieSB0aGlzLl9jLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge0dsaWRlfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZXN0cm95XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICB0aGlzLl9lLmVtaXQoJ2Rlc3Ryb3knKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU3RhcnQgaW5zdGFuY2UgYXV0b3BsYXlpbmcuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufE51bWJlcn0gaW50ZXJ2YWwgUnVuIGF1dG9wbGF5aW5nIHdpdGggcGFzc2VkIGludGVydmFsIHJlZ2FyZGxlc3Mgb2YgYGF1dG9wbGF5YCBzZXR0aW5nc1xyXG4gICAgICogQHJldHVybiB7R2xpZGV9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInBsYXlcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGxheSgpIHtcbiAgICAgIHZhciBpbnRlcnZhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogZmFsc2U7XG5cbiAgICAgIGlmIChpbnRlcnZhbCkge1xuICAgICAgICB0aGlzLnNldHRpbmdzLmF1dG9wbGF5ID0gaW50ZXJ2YWw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2UuZW1pdCgncGxheScpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBTdG9wIGluc3RhbmNlIGF1dG9wbGF5aW5nLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge0dsaWRlfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJwYXVzZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwYXVzZSgpIHtcbiAgICAgIHRoaXMuX2UuZW1pdCgncGF1c2UnKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU2V0cyBnbGlkZSBpbnRvIGEgaWRsZSBzdGF0dXMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7R2xpZGV9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRpc2FibGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU2V0cyBnbGlkZSBpbnRvIGEgYWN0aXZlIHN0YXR1cy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtHbGlkZX1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZW5hYmxlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGVuYWJsZSgpIHtcbiAgICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEFkZHMgY3V1dG9tIGV2ZW50IGxpc3RlbmVyIHdpdGggaGFuZGxlci5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8QXJyYXl9IGV2ZW50XHJcbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gaGFuZGxlclxyXG4gICAgICogQHJldHVybiB7R2xpZGV9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIm9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICB0aGlzLl9lLm9uKGV2ZW50LCBoYW5kbGVyKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIGdsaWRlIGlzIGEgcHJlY2lzZWQgdHlwZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IG5hbWVcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImlzVHlwZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpc1R5cGUobmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ3MudHlwZSA9PT0gbmFtZTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHZhbHVlIG9mIHRoZSBjb3JlIG9wdGlvbnMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJzZXR0aW5nc1wiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX287XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU2V0cyB2YWx1ZSBvZiB0aGUgY29yZSBvcHRpb25zLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge09iamVjdH0gb1xyXG4gICAgICogQHJldHVybiB7Vm9pZH1cclxuICAgICAqL1xuICAgICxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldChvKSB7XG4gICAgICBpZiAoaXNPYmplY3QobykpIHtcbiAgICAgICAgdGhpcy5fbyA9IG87XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuKCdPcHRpb25zIG11c3QgYmUgYW4gYG9iamVjdGAgaW5zdGFuY2UuJyk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogR2V0cyBjdXJyZW50IGluZGV4IG9mIHRoZSBzbGlkZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJpbmRleFwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2k7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU2V0cyBjdXJyZW50IGluZGV4IGEgc2xpZGVyLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge09iamVjdH1cclxuICAgICAqL1xuICAgICxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldChpKSB7XG4gICAgICB0aGlzLl9pID0gdG9JbnQoaSk7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0eXBlIG5hbWUgb2YgdGhlIHNsaWRlci5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInR5cGVcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldHRpbmdzLnR5cGU7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogR2V0cyB2YWx1ZSBvZiB0aGUgaWRsZSBzdGF0dXMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGlzYWJsZWRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFNldHMgdmFsdWUgb2YgdGhlIGlkbGUgc3RhdHVzLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cbiAgICAsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQoc3RhdHVzKSB7XG4gICAgICB0aGlzLl9kID0gISFzdGF0dXM7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEdsaWRlO1xufSgpO1xuXG5mdW5jdGlvbiBSdW4gKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgdmFyIFJ1biA9IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyBhdXRvcnVubmluZyBvZiB0aGUgZ2xpZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIHRoaXMuX28gPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTWFrZXMgZ2xpZGVzIHJ1bm5pbmcgYmFzZWQgb24gdGhlIHBhc3NlZCBtb3Zpbmcgc2NoZW1hLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG1vdmVcbiAgICAgKi9cbiAgICBtYWtlOiBmdW5jdGlvbiBtYWtlKG1vdmUpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGlmICghR2xpZGUuZGlzYWJsZWQpIHtcbiAgICAgICAgIUdsaWRlLnNldHRpbmdzLndhaXRGb3JUcmFuc2l0aW9uIHx8IEdsaWRlLmRpc2FibGUoKTtcbiAgICAgICAgdGhpcy5tb3ZlID0gbW92ZTtcbiAgICAgICAgRXZlbnRzLmVtaXQoJ3J1bi5iZWZvcmUnLCB0aGlzLm1vdmUpO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xuICAgICAgICBFdmVudHMuZW1pdCgncnVuJywgdGhpcy5tb3ZlKTtcbiAgICAgICAgQ29tcG9uZW50cy5UcmFuc2l0aW9uLmFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoX3RoaXMuaXNTdGFydCgpKSB7XG4gICAgICAgICAgICBFdmVudHMuZW1pdCgncnVuLnN0YXJ0JywgX3RoaXMubW92ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKF90aGlzLmlzRW5kKCkpIHtcbiAgICAgICAgICAgIEV2ZW50cy5lbWl0KCdydW4uZW5kJywgX3RoaXMubW92ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKF90aGlzLmlzT2Zmc2V0KCkpIHtcbiAgICAgICAgICAgIF90aGlzLl9vID0gZmFsc2U7XG4gICAgICAgICAgICBFdmVudHMuZW1pdCgncnVuLm9mZnNldCcsIF90aGlzLm1vdmUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIEV2ZW50cy5lbWl0KCdydW4uYWZ0ZXInLCBfdGhpcy5tb3ZlKTtcbiAgICAgICAgICBHbGlkZS5lbmFibGUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgY3VycmVudCBpbmRleCBiYXNlZCBvbiBkZWZpbmVkIG1vdmUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ8VW5kZWZpbmVkfVxuICAgICAqL1xuICAgIGNhbGN1bGF0ZTogZnVuY3Rpb24gY2FsY3VsYXRlKCkge1xuICAgICAgdmFyIG1vdmUgPSB0aGlzLm1vdmUsXG4gICAgICAgICAgbGVuZ3RoID0gdGhpcy5sZW5ndGg7XG4gICAgICB2YXIgc3RlcHMgPSBtb3ZlLnN0ZXBzLFxuICAgICAgICAgIGRpcmVjdGlvbiA9IG1vdmUuZGlyZWN0aW9uOyAvLyBCeSBkZWZhdWx0IGFzc3VtZSB0aGF0IHNpemUgb2YgdmlldyBpcyBlcXVhbCB0byBvbmUgc2xpZGVcblxuICAgICAgdmFyIHZpZXdTaXplID0gMTsgLy8gV2hpbGUgZGlyZWN0aW9uIGlzIGA9YCB3ZSB3YW50IGp1bXAgdG9cbiAgICAgIC8vIGEgc3BlY2lmaWVkIGluZGV4IGRlc2NyaWJlZCBpbiBzdGVwcy5cblxuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJz0nKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIGJvdW5kIGlzIHRydWUsIFxuICAgICAgICAvLyBhcyB3ZSB3YW50IHRvIGF2b2lkIHdoaXRlc3BhY2VzLlxuICAgICAgICBpZiAoR2xpZGUuc2V0dGluZ3MuYm91bmQgJiYgdG9JbnQoc3RlcHMpID4gbGVuZ3RoKSB7XG4gICAgICAgICAgR2xpZGUuaW5kZXggPSBsZW5ndGg7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgR2xpZGUuaW5kZXggPSBzdGVwcztcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBXaGVuIHBhdHRlcm4gaXMgZXF1YWwgdG8gYD4+YCB3ZSB3YW50XG4gICAgICAvLyBmYXN0IGZvcndhcmQgdG8gdGhlIGxhc3Qgc2xpZGUuXG5cblxuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJz4nICYmIHN0ZXBzID09PSAnPicpIHtcbiAgICAgICAgR2xpZGUuaW5kZXggPSBsZW5ndGg7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gV2hlbiBwYXR0ZXJuIGlzIGVxdWFsIHRvIGA8PGAgd2Ugd2FudFxuICAgICAgLy8gZmFzdCBmb3J3YXJkIHRvIHRoZSBmaXJzdCBzbGlkZS5cblxuXG4gICAgICBpZiAoZGlyZWN0aW9uID09PSAnPCcgJiYgc3RlcHMgPT09ICc8Jykge1xuICAgICAgICBHbGlkZS5pbmRleCA9IDA7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gcGFnaW5hdGlvbiBtb3ZlbWVudFxuXG5cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09ICd8Jykge1xuICAgICAgICB2aWV3U2l6ZSA9IEdsaWRlLnNldHRpbmdzLnBlclZpZXcgfHwgMTtcbiAgICAgIH0gLy8gd2UgYXJlIG1vdmluZyBmb3J3YXJkXG5cblxuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJz4nIHx8IGRpcmVjdGlvbiA9PT0gJ3wnICYmIHN0ZXBzID09PSAnPicpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gY2FsY3VsYXRlRm9yd2FyZEluZGV4KHZpZXdTaXplKTtcblxuICAgICAgICBpZiAoaW5kZXggPiBsZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLl9vID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIEdsaWRlLmluZGV4ID0gbm9ybWFsaXplRm9yd2FyZEluZGV4KGluZGV4LCB2aWV3U2l6ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gd2UgYXJlIG1vdmluZyBiYWNrd2FyZFxuXG5cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09ICc8JyB8fCBkaXJlY3Rpb24gPT09ICd8JyAmJiBzdGVwcyA9PT0gJzwnKSB7XG4gICAgICAgIHZhciBfaW5kZXggPSBjYWxjdWxhdGVCYWNrd2FyZEluZGV4KHZpZXdTaXplKTtcblxuICAgICAgICBpZiAoX2luZGV4IDwgMCkge1xuICAgICAgICAgIHRoaXMuX28gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgR2xpZGUuaW5kZXggPSBub3JtYWxpemVCYWNrd2FyZEluZGV4KF9pbmRleCwgdmlld1NpemUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHdhcm4oXCJJbnZhbGlkIGRpcmVjdGlvbiBwYXR0ZXJuIFtcIi5jb25jYXQoZGlyZWN0aW9uKS5jb25jYXQoc3RlcHMsIFwiXSBoYXMgYmVlbiB1c2VkXCIpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHdlIGFyZSBvbiB0aGUgZmlyc3Qgc2xpZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU3RhcnQ6IGZ1bmN0aW9uIGlzU3RhcnQoKSB7XG4gICAgICByZXR1cm4gR2xpZGUuaW5kZXggPD0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHdlIGFyZSBvbiB0aGUgbGFzdCBzbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNFbmQ6IGZ1bmN0aW9uIGlzRW5kKCkge1xuICAgICAgcmV0dXJuIEdsaWRlLmluZGV4ID49IHRoaXMubGVuZ3RoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgd2UgYXJlIG1ha2luZyBhIG9mZnNldCBydW4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc09mZnNldDogZnVuY3Rpb24gaXNPZmZzZXQoKSB7XG4gICAgICB2YXIgZGlyZWN0aW9uID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQ7XG5cbiAgICAgIGlmICghZGlyZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9vO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuX28pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSAvLyBkaWQgd2UgdmlldyB0byB0aGUgcmlnaHQ/XG5cblxuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3w+Jykge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlLmRpcmVjdGlvbiA9PT0gJ3wnICYmIHRoaXMubW92ZS5zdGVwcyA9PT0gJz4nO1xuICAgICAgfSAvLyBkaWQgd2UgdmlldyB0byB0aGUgbGVmdD9cblxuXG4gICAgICBpZiAoZGlyZWN0aW9uID09PSAnfDwnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdmUuZGlyZWN0aW9uID09PSAnfCcgJiYgdGhpcy5tb3ZlLnN0ZXBzID09PSAnPCc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLm1vdmUuZGlyZWN0aW9uID09PSBkaXJlY3Rpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBib3VuZCBtb2RlIGlzIGFjdGl2ZVxuICAgICAqXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0JvdW5kOiBmdW5jdGlvbiBpc0JvdW5kKCkge1xuICAgICAgcmV0dXJuIEdsaWRlLmlzVHlwZSgnc2xpZGVyJykgJiYgR2xpZGUuc2V0dGluZ3MuZm9jdXNBdCAhPT0gJ2NlbnRlcicgJiYgR2xpZGUuc2V0dGluZ3MuYm91bmQ7XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogUmV0dXJucyBpbmRleCB2YWx1ZSB0byBtb3ZlIGZvcndhcmQvdG8gdGhlIHJpZ2h0XG4gICAqXG4gICAqIEBwYXJhbSB2aWV3U2l6ZVxuICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgKi9cblxuICBmdW5jdGlvbiBjYWxjdWxhdGVGb3J3YXJkSW5kZXgodmlld1NpemUpIHtcbiAgICB2YXIgaW5kZXggPSBHbGlkZS5pbmRleDtcblxuICAgIGlmIChHbGlkZS5pc1R5cGUoJ2Nhcm91c2VsJykpIHtcbiAgICAgIHJldHVybiBpbmRleCArIHZpZXdTaXplO1xuICAgIH1cblxuICAgIHJldHVybiBpbmRleCArICh2aWV3U2l6ZSAtIGluZGV4ICUgdmlld1NpemUpO1xuICB9XG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIHRoZSBnaXZlbiBmb3J3YXJkIGluZGV4IGJhc2VkIG9uIGdsaWRlIHNldHRpbmdzLCBwcmV2ZW50aW5nIGl0IHRvIGV4Y2VlZCBjZXJ0YWluIGJvdW5kYXJpZXNcbiAgICpcbiAgICogQHBhcmFtIGluZGV4XG4gICAqIEBwYXJhbSBsZW5ndGhcbiAgICogQHBhcmFtIHZpZXdTaXplXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplRm9yd2FyZEluZGV4KGluZGV4LCB2aWV3U2l6ZSkge1xuICAgIHZhciBsZW5ndGggPSBSdW4ubGVuZ3RoO1xuXG4gICAgaWYgKGluZGV4IDw9IGxlbmd0aCkge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cblxuICAgIGlmIChHbGlkZS5pc1R5cGUoJ2Nhcm91c2VsJykpIHtcbiAgICAgIHJldHVybiBpbmRleCAtIChsZW5ndGggKyAxKTtcbiAgICB9XG5cbiAgICBpZiAoR2xpZGUuc2V0dGluZ3MucmV3aW5kKSB7XG4gICAgICAvLyBib3VuZCBkb2VzIGZ1bm55IHRoaW5ncyB3aXRoIHRoZSBsZW5ndGgsIHRoZXJlZm9yIHdlIGhhdmUgdG8gYmUgY2VydGFpblxuICAgICAgLy8gdGhhdCB3ZSBhcmUgb24gdGhlIGxhc3QgcG9zc2libGUgaW5kZXggdmFsdWUgZ2l2ZW4gYnkgYm91bmRcbiAgICAgIGlmIChSdW4uaXNCb3VuZCgpICYmICFSdW4uaXNFbmQoKSkge1xuICAgICAgICByZXR1cm4gbGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBpZiAoUnVuLmlzQm91bmQoKSkge1xuICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gTWF0aC5mbG9vcihsZW5ndGggLyB2aWV3U2l6ZSkgKiB2aWV3U2l6ZTtcbiAgfVxuICAvKipcbiAgICogQ2FsY3VsYXRlcyBpbmRleCB2YWx1ZSB0byBtb3ZlIGJhY2t3YXJkL3RvIHRoZSBsZWZ0XG4gICAqXG4gICAqIEBwYXJhbSB2aWV3U2l6ZVxuICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgKi9cblxuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZUJhY2t3YXJkSW5kZXgodmlld1NpemUpIHtcbiAgICB2YXIgaW5kZXggPSBHbGlkZS5pbmRleDtcblxuICAgIGlmIChHbGlkZS5pc1R5cGUoJ2Nhcm91c2VsJykpIHtcbiAgICAgIHJldHVybiBpbmRleCAtIHZpZXdTaXplO1xuICAgIH0gLy8gZW5zdXJlIG91ciBiYWNrIG5hdmlnYXRpb24gcmVzdWx0cyBpbiB0aGUgc2FtZSBpbmRleCBhcyBhIGZvcndhcmQgbmF2aWdhdGlvblxuICAgIC8vIHRvIGV4cGVyaWVuY2UgYSBob21vZ2VuZW91cyBwYWdpbmdcblxuXG4gICAgdmFyIHZpZXcgPSBNYXRoLmNlaWwoaW5kZXggLyB2aWV3U2l6ZSk7XG4gICAgcmV0dXJuICh2aWV3IC0gMSkgKiB2aWV3U2l6ZTtcbiAgfVxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgZ2l2ZW4gYmFja3dhcmQgaW5kZXggYmFzZWQgb24gZ2xpZGUgc2V0dGluZ3MsIHByZXZlbnRpbmcgaXQgdG8gZXhjZWVkIGNlcnRhaW4gYm91bmRhcmllc1xuICAgKlxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIGxlbmd0aFxuICAgKiBAcGFyYW0gdmlld1NpemVcbiAgICogQHJldHVybnMgeyp9XG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplQmFja3dhcmRJbmRleChpbmRleCwgdmlld1NpemUpIHtcbiAgICB2YXIgbGVuZ3RoID0gUnVuLmxlbmd0aDtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuXG4gICAgaWYgKEdsaWRlLmlzVHlwZSgnY2Fyb3VzZWwnKSkge1xuICAgICAgcmV0dXJuIGluZGV4ICsgKGxlbmd0aCArIDEpO1xuICAgIH1cblxuICAgIGlmIChHbGlkZS5zZXR0aW5ncy5yZXdpbmQpIHtcbiAgICAgIC8vIGJvdW5kIGRvZXMgZnVubnkgdGhpbmdzIHdpdGggdGhlIGxlbmd0aCwgdGhlcmVmb3Igd2UgaGF2ZSB0byBiZSBjZXJ0YWluXG4gICAgICAvLyB0aGF0IHdlIGFyZSBvbiBmaXJzdCBwb3NzaWJsZSBpbmRleCB2YWx1ZSBiZWZvcmUgd2UgdG8gcmV3aW5kIHRvIHRoZSBsZW5ndGggZ2l2ZW4gYnkgYm91bmRcbiAgICAgIGlmIChSdW4uaXNCb3VuZCgpICYmIFJ1bi5pc1N0YXJ0KCkpIHtcbiAgICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIE1hdGguZmxvb3IobGVuZ3RoIC8gdmlld1NpemUpICogdmlld1NpemU7XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBkZWZpbmUoUnVuLCAnbW92ZScsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHZhbHVlIG9mIHRoZSBtb3ZlIHNjaGVtYS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyB2YWx1ZSBvZiB0aGUgbW92ZSBzY2hlbWEuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG4gICAgICB2YXIgc3RlcCA9IHZhbHVlLnN1YnN0cigxKTtcbiAgICAgIHRoaXMuX20gPSB7XG4gICAgICAgIGRpcmVjdGlvbjogdmFsdWUuc3Vic3RyKDAsIDEpLFxuICAgICAgICBzdGVwczogc3RlcCA/IHRvSW50KHN0ZXApID8gdG9JbnQoc3RlcCkgOiBzdGVwIDogMFxuICAgICAgfTtcbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoUnVuLCAnbGVuZ3RoJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgdmFsdWUgb2YgdGhlIHJ1bm5pbmcgZGlzdGFuY2UgYmFzZWRcbiAgICAgKiBvbiB6ZXJvLWluZGV4aW5nIG51bWJlciBvZiBzbGlkZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncztcbiAgICAgIHZhciBsZW5ndGggPSBDb21wb25lbnRzLkh0bWwuc2xpZGVzLmxlbmd0aDsgLy8gSWYgdGhlIGBib3VuZGAgb3B0aW9uIGlzIGFjdGl2ZSwgYSBtYXhpbXVtIHJ1bm5pbmcgZGlzdGFuY2Ugc2hvdWxkIGJlXG4gICAgICAvLyByZWR1Y2VkIGJ5IGBwZXJWaWV3YCBhbmQgYGZvY3VzQXRgIHNldHRpbmdzLiBSdW5uaW5nIGRpc3RhbmNlXG4gICAgICAvLyBzaG91bGQgZW5kIGJlZm9yZSBjcmVhdGluZyBhbiBlbXB0eSBzcGFjZSBhZnRlciBpbnN0YW5jZS5cblxuICAgICAgaWYgKHRoaXMuaXNCb3VuZCgpKSB7XG4gICAgICAgIHJldHVybiBsZW5ndGggLSAxIC0gKHRvSW50KHNldHRpbmdzLnBlclZpZXcpIC0gMSkgKyB0b0ludChzZXR0aW5ncy5mb2N1c0F0KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxlbmd0aCAtIDE7XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKFJ1biwgJ29mZnNldCcsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHN0YXR1cyBvZiB0aGUgb2Zmc2V0dGluZyBmbGFnLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBSdW47XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGN1cnJlbnQgdGltZS5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIG5vdygpIHtcbiAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkXG4gKiBhdCBtb3N0IG9uY2UgZHVyaW5nIGEgZ2l2ZW4gd2luZG93IG9mIHRpbWUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY1xuICogQHBhcmFtIHtOdW1iZXJ9IHdhaXRcbiAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0aW9uc1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKlxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vamFzaGtlbmFzL3VuZGVyc2NvcmVcbiAqL1xuXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciB0aW1lb3V0LCBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gIHZhciBwcmV2aW91cyA9IDA7XG4gIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXG4gIHZhciBsYXRlciA9IGZ1bmN0aW9uIGxhdGVyKCkge1xuICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBub3coKTtcbiAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICB9O1xuXG4gIHZhciB0aHJvdHRsZWQgPSBmdW5jdGlvbiB0aHJvdHRsZWQoKSB7XG4gICAgdmFyIGF0ID0gbm93KCk7XG4gICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IGF0O1xuICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKGF0IC0gcHJldmlvdXMpO1xuICAgIGNvbnRleHQgPSB0aGlzO1xuICAgIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICBpZiAocmVtYWluaW5nIDw9IDAgfHwgcmVtYWluaW5nID4gd2FpdCkge1xuICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcHJldmlvdXMgPSBhdDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9IGVsc2UgaWYgKCF0aW1lb3V0ICYmIG9wdGlvbnMudHJhaWxpbmcgIT09IGZhbHNlKSB7XG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHRocm90dGxlZC5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgIHByZXZpb3VzID0gMDtcbiAgICB0aW1lb3V0ID0gY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICB9O1xuXG4gIHJldHVybiB0aHJvdHRsZWQ7XG59XG5cbnZhciBNQVJHSU5fVFlQRSA9IHtcbiAgbHRyOiBbJ21hcmdpbkxlZnQnLCAnbWFyZ2luUmlnaHQnXSxcbiAgcnRsOiBbJ21hcmdpblJpZ2h0JywgJ21hcmdpbkxlZnQnXVxufTtcbmZ1bmN0aW9uIEdhcHMgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgdmFyIEdhcHMgPSB7XG4gICAgLyoqXG4gICAgICogQXBwbGllcyBnYXBzIGJldHdlZW4gc2xpZGVzLiBGaXJzdCBhbmQgbGFzdFxuICAgICAqIHNsaWRlcyBkbyBub3QgcmVjZWl2ZSBpdCdzIGVkZ2UgbWFyZ2lucy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTENvbGxlY3Rpb259IHNsaWRlc1xuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYXBwbHk6IGZ1bmN0aW9uIGFwcGx5KHNsaWRlcykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNsaWRlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YXIgc3R5bGUgPSBzbGlkZXNbaV0uc3R5bGU7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBDb21wb25lbnRzLkRpcmVjdGlvbi52YWx1ZTtcblxuICAgICAgICBpZiAoaSAhPT0gMCkge1xuICAgICAgICAgIHN0eWxlW01BUkdJTl9UWVBFW2RpcmVjdGlvbl1bMF1dID0gXCJcIi5jb25jYXQodGhpcy52YWx1ZSAvIDIsIFwicHhcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGVbTUFSR0lOX1RZUEVbZGlyZWN0aW9uXVswXV0gPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpICE9PSBzbGlkZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHN0eWxlW01BUkdJTl9UWVBFW2RpcmVjdGlvbl1bMV1dID0gXCJcIi5jb25jYXQodGhpcy52YWx1ZSAvIDIsIFwicHhcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGVbTUFSR0lOX1RZUEVbZGlyZWN0aW9uXVsxXV0gPSAnJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGdhcHMgZnJvbSB0aGUgc2xpZGVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MQ29sbGVjdGlvbn0gc2xpZGVzXG4gICAgICogQHJldHVybnMge1ZvaWR9XG4gICAgKi9cbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShzbGlkZXMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzbGlkZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdmFyIHN0eWxlID0gc2xpZGVzW2ldLnN0eWxlO1xuICAgICAgICBzdHlsZS5tYXJnaW5MZWZ0ID0gJyc7XG4gICAgICAgIHN0eWxlLm1hcmdpblJpZ2h0ID0gJyc7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBkZWZpbmUoR2FwcywgJ3ZhbHVlJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgdmFsdWUgb2YgdGhlIGdhcC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdG9JbnQoR2xpZGUuc2V0dGluZ3MuZ2FwKTtcbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoR2FwcywgJ2dyb3cnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBhZGRpdGlvbmFsIGRpbWVuc2lvbnMgdmFsdWUgY2F1c2VkIGJ5IGdhcHMuXG4gICAgICogVXNlZCB0byBpbmNyZWFzZSB3aWR0aCBvZiB0aGUgc2xpZGVzIHdyYXBwZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIEdhcHMudmFsdWUgKiBDb21wb25lbnRzLlNpemVzLmxlbmd0aDtcbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoR2FwcywgJ3JlZHVjdG9yJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgcmVkdWN0aW9uIHZhbHVlIGNhdXNlZCBieSBnYXBzLlxuICAgICAqIFVzZWQgdG8gc3VidHJhY3Qgd2lkdGggb2YgdGhlIHNsaWRlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgcGVyVmlldyA9IEdsaWRlLnNldHRpbmdzLnBlclZpZXc7XG4gICAgICByZXR1cm4gR2Fwcy52YWx1ZSAqIChwZXJWaWV3IC0gMSkgLyBwZXJWaWV3O1xuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBBcHBseSBjYWxjdWxhdGVkIGdhcHM6XG4gICAqIC0gYWZ0ZXIgYnVpbGRpbmcsIHNvIHNsaWRlcyAoaW5jbHVkaW5nIGNsb25lcykgd2lsbCByZWNlaXZlIHByb3BlciBtYXJnaW5zXG4gICAqIC0gb24gdXBkYXRpbmcgdmlhIEFQSSwgdG8gcmVjYWxjdWxhdGUgZ2FwcyB3aXRoIG5ldyBvcHRpb25zXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ2J1aWxkLmFmdGVyJywgJ3VwZGF0ZSddLCB0aHJvdHRsZShmdW5jdGlvbiAoKSB7XG4gICAgR2Fwcy5hcHBseShDb21wb25lbnRzLkh0bWwud3JhcHBlci5jaGlsZHJlbik7XG4gIH0sIDMwKSk7XG4gIC8qKlxuICAgKiBSZW1vdmUgZ2FwczpcbiAgICogLSBvbiBkZXN0cm95aW5nIHRvIGJyaW5nIG1hcmt1cCB0byBpdHMgaW5pdGFsIHN0YXRlXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBHYXBzLnJlbW92ZShDb21wb25lbnRzLkh0bWwud3JhcHBlci5jaGlsZHJlbik7XG4gIH0pO1xuICByZXR1cm4gR2Fwcztcbn1cblxuLyoqXG4gKiBGaW5kcyBzaWJsaW5ncyBub2RlcyBvZiB0aGUgcGFzc2VkIG5vZGUuXG4gKlxuICogQHBhcmFtICB7RWxlbWVudH0gbm9kZVxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cbmZ1bmN0aW9uIHNpYmxpbmdzKG5vZGUpIHtcbiAgaWYgKG5vZGUgJiYgbm9kZS5wYXJlbnROb2RlKSB7XG4gICAgdmFyIG4gPSBub2RlLnBhcmVudE5vZGUuZmlyc3RDaGlsZDtcbiAgICB2YXIgbWF0Y2hlZCA9IFtdO1xuXG4gICAgZm9yICg7IG47IG4gPSBuLm5leHRTaWJsaW5nKSB7XG4gICAgICBpZiAobi5ub2RlVHlwZSA9PT0gMSAmJiBuICE9PSBub2RlKSB7XG4gICAgICAgIG1hdGNoZWQucHVzaChuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWF0Y2hlZDtcbiAgfVxuXG4gIHJldHVybiBbXTtcbn1cbi8qKlxuICogQ2hlY2tzIGlmIHBhc3NlZCBub2RlIGV4aXN0IGFuZCBpcyBhIHZhbGlkIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtICB7RWxlbWVudH0gbm9kZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBleGlzdChub2RlKSB7XG4gIGlmIChub2RlICYmIG5vZGUgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTEVsZW1lbnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxudmFyIFRSQUNLX1NFTEVDVE9SID0gJ1tkYXRhLWdsaWRlLWVsPVwidHJhY2tcIl0nO1xuZnVuY3Rpb24gSHRtbCAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICB2YXIgSHRtbCA9IHtcbiAgICAvKipcbiAgICAgKiBTZXR1cCBzbGlkZXIgSFRNTCBub2Rlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7R2xpZGV9IGdsaWRlXG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgdGhpcy5yb290ID0gR2xpZGUuc2VsZWN0b3I7XG4gICAgICB0aGlzLnRyYWNrID0gdGhpcy5yb290LnF1ZXJ5U2VsZWN0b3IoVFJBQ0tfU0VMRUNUT1IpO1xuICAgICAgdGhpcy5jb2xsZWN0U2xpZGVzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbGxlY3Qgc2xpZGVzXG4gICAgICovXG4gICAgY29sbGVjdFNsaWRlczogZnVuY3Rpb24gY29sbGVjdFNsaWRlcygpIHtcbiAgICAgIHRoaXMuc2xpZGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy53cmFwcGVyLmNoaWxkcmVuKS5maWx0ZXIoZnVuY3Rpb24gKHNsaWRlKSB7XG4gICAgICAgIHJldHVybiAhc2xpZGUuY2xhc3NMaXN0LmNvbnRhaW5zKEdsaWRlLnNldHRpbmdzLmNsYXNzZXMuc2xpZGUuY2xvbmUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICBkZWZpbmUoSHRtbCwgJ3Jvb3QnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBub2RlIG9mIHRoZSBnbGlkZSBtYWluIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gSHRtbC5fcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyBub2RlIG9mIHRoZSBnbGlkZSBtYWluIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQocikge1xuICAgICAgaWYgKGlzU3RyaW5nKHIpKSB7XG4gICAgICAgIHIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXhpc3QocikpIHtcbiAgICAgICAgSHRtbC5fciA9IHI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuKCdSb290IGVsZW1lbnQgbXVzdCBiZSBhIGV4aXN0aW5nIEh0bWwgbm9kZScpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGRlZmluZShIdG1sLCAndHJhY2snLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBub2RlIG9mIHRoZSBnbGlkZSB0cmFjayB3aXRoIHNsaWRlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBIdG1sLl90O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIG5vZGUgb2YgdGhlIGdsaWRlIHRyYWNrIHdpdGggc2xpZGVzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNldDogZnVuY3Rpb24gc2V0KHQpIHtcbiAgICAgIGlmIChleGlzdCh0KSkge1xuICAgICAgICBIdG1sLl90ID0gdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm4oXCJDb3VsZCBub3QgZmluZCB0cmFjayBlbGVtZW50LiBQbGVhc2UgdXNlIFwiLmNvbmNhdChUUkFDS19TRUxFQ1RPUiwgXCIgYXR0cmlidXRlLlwiKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKEh0bWwsICd3cmFwcGVyJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgbm9kZSBvZiB0aGUgc2xpZGVzIHdyYXBwZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gSHRtbC50cmFjay5jaGlsZHJlblswXTtcbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogQWRkL3JlbW92ZS9yZW9yZGVyIGR5bmFtaWMgc2xpZGVzXG4gICAqL1xuXG4gIEV2ZW50cy5vbigndXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgIEh0bWwuY29sbGVjdFNsaWRlcygpO1xuICB9KTtcbiAgcmV0dXJuIEh0bWw7XG59XG5cbmZ1bmN0aW9uIFBlZWsgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgdmFyIFBlZWsgPSB7XG4gICAgLyoqXG4gICAgICogU2V0dXBzIGhvdyBtdWNoIHRvIHBlZWsgYmFzZWQgb24gc2V0dGluZ3MuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIHRoaXMudmFsdWUgPSBHbGlkZS5zZXR0aW5ncy5wZWVrO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lKFBlZWssICd2YWx1ZScsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHZhbHVlIG9mIHRoZSBwZWVrLlxuICAgICAqXG4gICAgICogQHJldHVybnMge051bWJlcnxPYmplY3R9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gUGVlay5fdjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyB2YWx1ZSBvZiB0aGUgcGVlay5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfE9iamVjdH0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG4gICAgICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlLmJlZm9yZSA9IHRvSW50KHZhbHVlLmJlZm9yZSk7XG4gICAgICAgIHZhbHVlLmFmdGVyID0gdG9JbnQodmFsdWUuYWZ0ZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSB0b0ludCh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIFBlZWsuX3YgPSB2YWx1ZTtcbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoUGVlaywgJ3JlZHVjdG9yJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgcmVkdWN0aW9uIHZhbHVlIGNhdXNlZCBieSBwZWVrLlxuICAgICAqXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IFBlZWsudmFsdWU7XG4gICAgICB2YXIgcGVyVmlldyA9IEdsaWRlLnNldHRpbmdzLnBlclZpZXc7XG5cbiAgICAgIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLmJlZm9yZSAvIHBlclZpZXcgKyB2YWx1ZS5hZnRlciAvIHBlclZpZXc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZSAqIDIgLyBwZXJWaWV3O1xuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBSZWNhbGN1bGF0ZSBwZWVraW5nIHNpemVzIG9uOlxuICAgKiAtIHdoZW4gcmVzaXppbmcgd2luZG93IHRvIHVwZGF0ZSB0byBwcm9wZXIgcGVyY2VudHNcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsncmVzaXplJywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgUGVlay5tb3VudCgpO1xuICB9KTtcbiAgcmV0dXJuIFBlZWs7XG59XG5cbmZ1bmN0aW9uIE1vdmUgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgdmFyIE1vdmUgPSB7XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBtb3ZlIGNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtWb2lkfVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIHRoaXMuX28gPSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIGEgbW92ZW1lbnQgdmFsdWUgYmFzZWQgb24gcGFzc2VkIG9mZnNldCBhbmQgY3VycmVudGx5IGFjdGl2ZSBpbmRleC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gb2Zmc2V0XG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBtYWtlOiBmdW5jdGlvbiBtYWtlKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIG9mZnNldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogMDtcbiAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgRXZlbnRzLmVtaXQoJ21vdmUnLCB7XG4gICAgICAgIG1vdmVtZW50OiB0aGlzLnZhbHVlXG4gICAgICB9KTtcbiAgICAgIENvbXBvbmVudHMuVHJhbnNpdGlvbi5hZnRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIEV2ZW50cy5lbWl0KCdtb3ZlLmFmdGVyJywge1xuICAgICAgICAgIG1vdmVtZW50OiBfdGhpcy52YWx1ZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lKE1vdmUsICdvZmZzZXQnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBhbiBvZmZzZXQgdmFsdWUgdXNlZCB0byBtb2RpZnkgY3VycmVudCB0cmFuc2xhdGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gTW92ZS5fbztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyBhbiBvZmZzZXQgdmFsdWUgdXNlZCB0byBtb2RpZnkgY3VycmVudCB0cmFuc2xhdGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcbiAgICAgIE1vdmUuX28gPSAhaXNVbmRlZmluZWQodmFsdWUpID8gdG9JbnQodmFsdWUpIDogMDtcbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoTW92ZSwgJ3RyYW5zbGF0ZScsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIGEgcmF3IG1vdmVtZW50IHZhbHVlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIENvbXBvbmVudHMuU2l6ZXMuc2xpZGVXaWR0aCAqIEdsaWRlLmluZGV4O1xuICAgIH1cbiAgfSk7XG4gIGRlZmluZShNb3ZlLCAndmFsdWUnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBhbiBhY3R1YWwgbW92ZW1lbnQgdmFsdWUgY29ycmVjdGVkIGJ5IG9mZnNldC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBvZmZzZXQgPSB0aGlzLm9mZnNldDtcbiAgICAgIHZhciB0cmFuc2xhdGUgPSB0aGlzLnRyYW5zbGF0ZTtcblxuICAgICAgaWYgKENvbXBvbmVudHMuRGlyZWN0aW9uLmlzKCdydGwnKSkge1xuICAgICAgICByZXR1cm4gdHJhbnNsYXRlICsgb2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJhbnNsYXRlIC0gb2Zmc2V0O1xuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBNYWtlIG1vdmVtZW50IHRvIHByb3BlciBzbGlkZSBvbjpcbiAgICogLSBiZWZvcmUgYnVpbGQsIHNvIGdsaWRlIHdpbGwgc3RhcnQgYXQgYHN0YXJ0QXRgIGluZGV4XG4gICAqIC0gb24gZWFjaCBzdGFuZGFyZCBydW4gdG8gbW92ZSB0byBuZXdseSBjYWxjdWxhdGVkIGluZGV4XG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ2J1aWxkLmJlZm9yZScsICdydW4nXSwgZnVuY3Rpb24gKCkge1xuICAgIE1vdmUubWFrZSgpO1xuICB9KTtcbiAgcmV0dXJuIE1vdmU7XG59XG5cbmZ1bmN0aW9uIFNpemVzIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIHZhciBTaXplcyA9IHtcbiAgICAvKipcbiAgICAgKiBTZXR1cHMgZGltZW5zaW9ucyBvZiBzbGlkZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHNldHVwU2xpZGVzOiBmdW5jdGlvbiBzZXR1cFNsaWRlcygpIHtcbiAgICAgIHZhciB3aWR0aCA9IFwiXCIuY29uY2F0KHRoaXMuc2xpZGVXaWR0aCwgXCJweFwiKTtcbiAgICAgIHZhciBzbGlkZXMgPSBDb21wb25lbnRzLkh0bWwuc2xpZGVzO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzbGlkZXNbaV0uc3R5bGUud2lkdGggPSB3aWR0aDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0dXBzIGRpbWVuc2lvbnMgb2Ygc2xpZGVzIHdyYXBwZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHNldHVwV3JhcHBlcjogZnVuY3Rpb24gc2V0dXBXcmFwcGVyKCkge1xuICAgICAgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuc3R5bGUud2lkdGggPSBcIlwiLmNvbmNhdCh0aGlzLndyYXBwZXJTaXplLCBcInB4XCIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFwcGxpZWQgc3R5bGVzIGZyb20gSFRNTCBlbGVtZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtWb2lkfVxuICAgICAqL1xuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgdmFyIHNsaWRlcyA9IENvbXBvbmVudHMuSHRtbC5zbGlkZXM7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNsaWRlc1tpXS5zdHlsZS53aWR0aCA9ICcnO1xuICAgICAgfVxuXG4gICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS53aWR0aCA9ICcnO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lKFNpemVzLCAnbGVuZ3RoJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgY291bnQgbnVtYmVyIG9mIHRoZSBzbGlkZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gQ29tcG9uZW50cy5IdG1sLnNsaWRlcy5sZW5ndGg7XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKFNpemVzLCAnd2lkdGgnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyB3aWR0aCB2YWx1ZSBvZiB0aGUgc2xpZGVyICh2aXNpYmxlIGFyZWEpLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIENvbXBvbmVudHMuSHRtbC50cmFjay5vZmZzZXRXaWR0aDtcbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoU2l6ZXMsICd3cmFwcGVyU2l6ZScsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHNpemUgb2YgdGhlIHNsaWRlcyB3cmFwcGVyLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIFNpemVzLnNsaWRlV2lkdGggKiBTaXplcy5sZW5ndGggKyBDb21wb25lbnRzLkdhcHMuZ3JvdyArIENvbXBvbmVudHMuQ2xvbmVzLmdyb3c7XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKFNpemVzLCAnc2xpZGVXaWR0aCcsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHdpZHRoIHZhbHVlIG9mIGEgc2luZ2xlIHNsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIFNpemVzLndpZHRoIC8gR2xpZGUuc2V0dGluZ3MucGVyVmlldyAtIENvbXBvbmVudHMuUGVlay5yZWR1Y3RvciAtIENvbXBvbmVudHMuR2Fwcy5yZWR1Y3RvcjtcbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogQXBwbHkgY2FsY3VsYXRlZCBnbGlkZSdzIGRpbWVuc2lvbnM6XG4gICAqIC0gYmVmb3JlIGJ1aWxkaW5nLCBzbyBvdGhlciBkaW1lbnNpb25zIChlLmcuIHRyYW5zbGF0ZSkgd2lsbCBiZSBjYWxjdWxhdGVkIHByb3BlcnRseVxuICAgKiAtIHdoZW4gcmVzaXppbmcgd2luZG93IHRvIHJlY2FsY3VsYXRlIHNpbGRlcyBkaW1lbnNpb25zXG4gICAqIC0gb24gdXBkYXRpbmcgdmlhIEFQSSwgdG8gY2FsY3VsYXRlIGRpbWVuc2lvbnMgYmFzZWQgb24gbmV3IG9wdGlvbnNcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsnYnVpbGQuYmVmb3JlJywgJ3Jlc2l6ZScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgIFNpemVzLnNldHVwU2xpZGVzKCk7XG4gICAgU2l6ZXMuc2V0dXBXcmFwcGVyKCk7XG4gIH0pO1xuICAvKipcbiAgICogUmVtb3ZlIGNhbGN1bGF0ZWQgZ2xpZGUncyBkaW1lbnNpb25zOlxuICAgKiAtIG9uIGRlc3RvdGluZyB0byBicmluZyBtYXJrdXAgdG8gaXRzIGluaXRhbCBzdGF0ZVxuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgU2l6ZXMucmVtb3ZlKCk7XG4gIH0pO1xuICByZXR1cm4gU2l6ZXM7XG59XG5cbmZ1bmN0aW9uIEJ1aWxkIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIHZhciBCdWlsZCA9IHtcbiAgICAvKipcbiAgICAgKiBJbml0IGdsaWRlIGJ1aWxkaW5nLiBBZGRzIGNsYXNzZXMsIHNldHNcbiAgICAgKiBkaW1lbnNpb25zIGFuZCBzZXR1cHMgaW5pdGlhbCBzdGF0ZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgRXZlbnRzLmVtaXQoJ2J1aWxkLmJlZm9yZScpO1xuICAgICAgdGhpcy50eXBlQ2xhc3MoKTtcbiAgICAgIHRoaXMuYWN0aXZlQ2xhc3MoKTtcbiAgICAgIEV2ZW50cy5lbWl0KCdidWlsZC5hZnRlcicpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGB0eXBlYCBjbGFzcyB0byB0aGUgZ2xpZGUgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgdHlwZUNsYXNzOiBmdW5jdGlvbiB0eXBlQ2xhc3MoKSB7XG4gICAgICBDb21wb25lbnRzLkh0bWwucm9vdC5jbGFzc0xpc3QuYWRkKEdsaWRlLnNldHRpbmdzLmNsYXNzZXMudHlwZVtHbGlkZS5zZXR0aW5ncy50eXBlXSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgYWN0aXZlIGNsYXNzIHRvIGN1cnJlbnQgc2xpZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGFjdGl2ZUNsYXNzOiBmdW5jdGlvbiBhY3RpdmVDbGFzcygpIHtcbiAgICAgIHZhciBjbGFzc2VzID0gR2xpZGUuc2V0dGluZ3MuY2xhc3NlcztcbiAgICAgIHZhciBzbGlkZSA9IENvbXBvbmVudHMuSHRtbC5zbGlkZXNbR2xpZGUuaW5kZXhdO1xuXG4gICAgICBpZiAoc2xpZGUpIHtcbiAgICAgICAgc2xpZGUuY2xhc3NMaXN0LmFkZChjbGFzc2VzLnNsaWRlLmFjdGl2ZSk7XG4gICAgICAgIHNpYmxpbmdzKHNsaWRlKS5mb3JFYWNoKGZ1bmN0aW9uIChzaWJsaW5nKSB7XG4gICAgICAgICAgc2libGluZy5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzZXMuc2xpZGUuYWN0aXZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgSFRNTCBjbGFzc2VzIGFwcGxpZWQgYXQgYnVpbGRpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHJlbW92ZUNsYXNzZXM6IGZ1bmN0aW9uIHJlbW92ZUNsYXNzZXMoKSB7XG4gICAgICB2YXIgX0dsaWRlJHNldHRpbmdzJGNsYXNzID0gR2xpZGUuc2V0dGluZ3MuY2xhc3NlcyxcbiAgICAgICAgICB0eXBlID0gX0dsaWRlJHNldHRpbmdzJGNsYXNzLnR5cGUsXG4gICAgICAgICAgc2xpZGUgPSBfR2xpZGUkc2V0dGluZ3MkY2xhc3Muc2xpZGU7XG4gICAgICBDb21wb25lbnRzLkh0bWwucm9vdC5jbGFzc0xpc3QucmVtb3ZlKHR5cGVbR2xpZGUuc2V0dGluZ3MudHlwZV0pO1xuICAgICAgQ29tcG9uZW50cy5IdG1sLnNsaWRlcy5mb3JFYWNoKGZ1bmN0aW9uIChzaWJsaW5nKSB7XG4gICAgICAgIHNpYmxpbmcuY2xhc3NMaXN0LnJlbW92ZShzbGlkZS5hY3RpdmUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogQ2xlYXIgYnVpbGRpbmcgY2xhc3NlczpcbiAgICogLSBvbiBkZXN0cm95aW5nIHRvIGJyaW5nIEhUTUwgdG8gaXRzIGluaXRpYWwgc3RhdGVcbiAgICogLSBvbiB1cGRhdGluZyB0byByZW1vdmUgY2xhc3NlcyBiZWZvcmUgcmVtb3VudGluZyBjb21wb25lbnRcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsnZGVzdHJveScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgIEJ1aWxkLnJlbW92ZUNsYXNzZXMoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBSZW1vdW50IGNvbXBvbmVudDpcbiAgICogLSBvbiByZXNpemluZyBvZiB0aGUgd2luZG93IHRvIGNhbGN1bGF0ZSBuZXcgZGltZW5zaW9uc1xuICAgKiAtIG9uIHVwZGF0aW5nIHNldHRpbmdzIHZpYSBBUElcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsncmVzaXplJywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgQnVpbGQubW91bnQoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBTd2FwIGFjdGl2ZSBjbGFzcyBvZiBjdXJyZW50IHNsaWRlOlxuICAgKiAtIGFmdGVyIGVhY2ggbW92ZSB0byB0aGUgbmV3IGluZGV4XG4gICAqL1xuXG4gIEV2ZW50cy5vbignbW92ZS5hZnRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICBCdWlsZC5hY3RpdmVDbGFzcygpO1xuICB9KTtcbiAgcmV0dXJuIEJ1aWxkO1xufVxuXG5mdW5jdGlvbiBDbG9uZXMgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgdmFyIENsb25lcyA9IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgcGF0dGVybiBtYXAgYW5kIGNvbGxlY3Qgc2xpZGVzIHRvIGJlIGNsb25lZC5cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICB0aGlzLml0ZW1zID0gW107XG5cbiAgICAgIGlmIChHbGlkZS5pc1R5cGUoJ2Nhcm91c2VsJykpIHtcbiAgICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuY29sbGVjdCgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb2xsZWN0IGNsb25lcyB3aXRoIHBhdHRlcm4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtbXX1cbiAgICAgKi9cbiAgICBjb2xsZWN0OiBmdW5jdGlvbiBjb2xsZWN0KCkge1xuICAgICAgdmFyIGl0ZW1zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBbXTtcbiAgICAgIHZhciBzbGlkZXMgPSBDb21wb25lbnRzLkh0bWwuc2xpZGVzO1xuICAgICAgdmFyIF9HbGlkZSRzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzLFxuICAgICAgICAgIHBlclZpZXcgPSBfR2xpZGUkc2V0dGluZ3MucGVyVmlldyxcbiAgICAgICAgICBjbGFzc2VzID0gX0dsaWRlJHNldHRpbmdzLmNsYXNzZXMsXG4gICAgICAgICAgY2xvbmluZ1JhdGlvID0gX0dsaWRlJHNldHRpbmdzLmNsb25pbmdSYXRpbztcblxuICAgICAgaWYgKHNsaWRlcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgdmFyIHBlZWtJbmNyZW1lbnRlciA9ICshIUdsaWRlLnNldHRpbmdzLnBlZWs7XG4gICAgICAgIHZhciBjbG9uZUNvdW50ID0gcGVyVmlldyArIHBlZWtJbmNyZW1lbnRlciArIE1hdGgucm91bmQocGVyVmlldyAvIDIpO1xuICAgICAgICB2YXIgYXBwZW5kID0gc2xpZGVzLnNsaWNlKDAsIGNsb25lQ291bnQpLnJldmVyc2UoKTtcbiAgICAgICAgdmFyIHByZXBlbmQgPSBzbGlkZXMuc2xpY2UoY2xvbmVDb3VudCAqIC0xKTtcblxuICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IE1hdGgubWF4KGNsb25pbmdSYXRpbywgTWF0aC5mbG9vcihwZXJWaWV3IC8gc2xpZGVzLmxlbmd0aCkpOyByKyspIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFwcGVuZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGNsb25lID0gYXBwZW5kW2ldLmNsb25lTm9kZSh0cnVlKTtcbiAgICAgICAgICAgIGNsb25lLmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5zbGlkZS5jbG9uZSk7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKGNsb25lKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgcHJlcGVuZC5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBfY2xvbmUgPSBwcmVwZW5kW19pXS5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgICAgICAgIF9jbG9uZS5jbGFzc0xpc3QuYWRkKGNsYXNzZXMuc2xpZGUuY2xvbmUpO1xuXG4gICAgICAgICAgICBpdGVtcy51bnNoaWZ0KF9jbG9uZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBpdGVtcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXBwZW5kIGNsb25lZCBzbGlkZXMgd2l0aCBnZW5lcmF0ZWQgcGF0dGVybi5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYXBwZW5kOiBmdW5jdGlvbiBhcHBlbmQoKSB7XG4gICAgICB2YXIgaXRlbXMgPSB0aGlzLml0ZW1zO1xuICAgICAgdmFyIF9Db21wb25lbnRzJEh0bWwgPSBDb21wb25lbnRzLkh0bWwsXG4gICAgICAgICAgd3JhcHBlciA9IF9Db21wb25lbnRzJEh0bWwud3JhcHBlcixcbiAgICAgICAgICBzbGlkZXMgPSBfQ29tcG9uZW50cyRIdG1sLnNsaWRlcztcbiAgICAgIHZhciBoYWxmID0gTWF0aC5mbG9vcihpdGVtcy5sZW5ndGggLyAyKTtcbiAgICAgIHZhciBwcmVwZW5kID0gaXRlbXMuc2xpY2UoMCwgaGFsZikucmV2ZXJzZSgpO1xuICAgICAgdmFyIGFwcGVuZCA9IGl0ZW1zLnNsaWNlKGhhbGYgKiAtMSkucmV2ZXJzZSgpO1xuICAgICAgdmFyIHdpZHRoID0gXCJcIi5jb25jYXQoQ29tcG9uZW50cy5TaXplcy5zbGlkZVdpZHRoLCBcInB4XCIpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFwcGVuZC5sZW5ndGg7IGkrKykge1xuICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGFwcGVuZFtpXSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIF9pMiA9IDA7IF9pMiA8IHByZXBlbmQubGVuZ3RoOyBfaTIrKykge1xuICAgICAgICB3cmFwcGVyLmluc2VydEJlZm9yZShwcmVwZW5kW19pMl0sIHNsaWRlc1swXSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIF9pMyA9IDA7IF9pMyA8IGl0ZW1zLmxlbmd0aDsgX2kzKyspIHtcbiAgICAgICAgaXRlbXNbX2kzXS5zdHlsZS53aWR0aCA9IHdpZHRoO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYWxsIGNsb25lZCBzbGlkZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgdmFyIGl0ZW1zID0gdGhpcy5pdGVtcztcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5yZW1vdmVDaGlsZChpdGVtc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBkZWZpbmUoQ2xvbmVzLCAnZ3JvdycsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIGFkZGl0aW9uYWwgZGltZW5zaW9ucyB2YWx1ZSBjYXVzZWQgYnkgY2xvbmVzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIChDb21wb25lbnRzLlNpemVzLnNsaWRlV2lkdGggKyBDb21wb25lbnRzLkdhcHMudmFsdWUpICogQ2xvbmVzLml0ZW1zLmxlbmd0aDtcbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogQXBwZW5kIGFkZGl0aW9uYWwgc2xpZGUncyBjbG9uZXM6XG4gICAqIC0gd2hpbGUgZ2xpZGUncyB0eXBlIGlzIGBjYXJvdXNlbGBcbiAgICovXG5cbiAgRXZlbnRzLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgQ2xvbmVzLnJlbW92ZSgpO1xuICAgIENsb25lcy5tb3VudCgpO1xuICAgIENsb25lcy5hcHBlbmQoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBBcHBlbmQgYWRkaXRpb25hbCBzbGlkZSdzIGNsb25lczpcbiAgICogLSB3aGlsZSBnbGlkZSdzIHR5cGUgaXMgYGNhcm91c2VsYFxuICAgKi9cblxuICBFdmVudHMub24oJ2J1aWxkLmJlZm9yZScsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoR2xpZGUuaXNUeXBlKCdjYXJvdXNlbCcpKSB7XG4gICAgICBDbG9uZXMuYXBwZW5kKCk7XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIFJlbW92ZSBjbG9uZXMgSFRNTEVsZW1lbnRzOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIGJyaW5nIEhUTUwgdG8gaXRzIGluaXRpYWwgc3RhdGVcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIENsb25lcy5yZW1vdmUoKTtcbiAgfSk7XG4gIHJldHVybiBDbG9uZXM7XG59XG5cbnZhciBFdmVudHNCaW5kZXIgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICogQ29uc3RydWN0IGEgRXZlbnRzQmluZGVyIGluc3RhbmNlLlxuICAgKi9cbiAgZnVuY3Rpb24gRXZlbnRzQmluZGVyKCkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEV2ZW50c0JpbmRlcik7XG5cbiAgICB0aGlzLmxpc3RlbmVycyA9IGxpc3RlbmVycztcbiAgfVxuICAvKipcbiAgICogQWRkcyBldmVudHMgbGlzdGVuZXJzIHRvIGFycm93cyBIVE1MIGVsZW1lbnRzLlxuICAgKlxuICAgKiBAcGFyYW0gIHtTdHJpbmd8QXJyYXl9IGV2ZW50c1xuICAgKiBAcGFyYW0gIHtFbGVtZW50fFdpbmRvd3xEb2N1bWVudH0gZWxcbiAgICogQHBhcmFtICB7RnVuY3Rpb259IGNsb3N1cmVcbiAgICogQHBhcmFtICB7Qm9vbGVhbnxPYmplY3R9IGNhcHR1cmVcbiAgICogQHJldHVybiB7Vm9pZH1cbiAgICovXG5cblxuICBfY3JlYXRlQ2xhc3MoRXZlbnRzQmluZGVyLCBbe1xuICAgIGtleTogXCJvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvbihldmVudHMsIGVsLCBjbG9zdXJlKSB7XG4gICAgICB2YXIgY2FwdHVyZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogZmFsc2U7XG5cbiAgICAgIGlmIChpc1N0cmluZyhldmVudHMpKSB7XG4gICAgICAgIGV2ZW50cyA9IFtldmVudHNdO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLmxpc3RlbmVyc1tldmVudHNbaV1dID0gY2xvc3VyZTtcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudHNbaV0sIHRoaXMubGlzdGVuZXJzW2V2ZW50c1tpXV0sIGNhcHR1cmUpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGV2ZW50IGxpc3RlbmVycyBmcm9tIGFycm93cyBIVE1MIGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7U3RyaW5nfEFycmF5fSBldmVudHNcbiAgICAgKiBAcGFyYW0gIHtFbGVtZW50fFdpbmRvd3xEb2N1bWVudH0gZWxcbiAgICAgKiBAcGFyYW0gIHtCb29sZWFufE9iamVjdH0gY2FwdHVyZVxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJvZmZcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gb2ZmKGV2ZW50cywgZWwpIHtcbiAgICAgIHZhciBjYXB0dXJlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiBmYWxzZTtcblxuICAgICAgaWYgKGlzU3RyaW5nKGV2ZW50cykpIHtcbiAgICAgICAgZXZlbnRzID0gW2V2ZW50c107XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRzW2ldLCB0aGlzLmxpc3RlbmVyc1tldmVudHNbaV1dLCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVzdHJveSBjb2xsZWN0ZWQgbGlzdGVuZXJzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1ZvaWR9XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkZXN0cm95XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICBkZWxldGUgdGhpcy5saXN0ZW5lcnM7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEV2ZW50c0JpbmRlcjtcbn0oKTtcblxuZnVuY3Rpb24gUmVzaXplIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIC8qKlxuICAgKiBJbnN0YW5jZSBvZiB0aGUgYmluZGVyIGZvciBET00gRXZlbnRzLlxuICAgKlxuICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgKi9cbiAgdmFyIEJpbmRlciA9IG5ldyBFdmVudHNCaW5kZXIoKTtcbiAgdmFyIFJlc2l6ZSA9IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB3aW5kb3cgYmluZGluZ3MuXG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgdGhpcy5iaW5kKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmRzIGByZXpzaXplYCBsaXN0ZW5lciB0byB0aGUgd2luZG93LlxuICAgICAqIEl0J3MgYSBjb3N0bHkgZXZlbnQsIHNvIHdlIGFyZSBkZWJvdW5jaW5nIGl0LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgICAgQmluZGVyLm9uKCdyZXNpemUnLCB3aW5kb3csIHRocm90dGxlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgRXZlbnRzLmVtaXQoJ3Jlc2l6ZScpO1xuICAgICAgfSwgR2xpZGUuc2V0dGluZ3MudGhyb3R0bGUpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kcyBsaXN0ZW5lcnMgZnJvbSB0aGUgd2luZG93LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICAgIEJpbmRlci5vZmYoJ3Jlc2l6ZScsIHdpbmRvdyk7XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogUmVtb3ZlIGJpbmRpbmdzIGZyb20gd2luZG93OlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIHJlbW92ZSBhZGRlZCBFdmVudExpc3RlbmVyXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBSZXNpemUudW5iaW5kKCk7XG4gICAgQmluZGVyLmRlc3Ryb3koKTtcbiAgfSk7XG4gIHJldHVybiBSZXNpemU7XG59XG5cbnZhciBWQUxJRF9ESVJFQ1RJT05TID0gWydsdHInLCAncnRsJ107XG52YXIgRkxJUEVEX01PVkVNRU5UUyA9IHtcbiAgJz4nOiAnPCcsXG4gICc8JzogJz4nLFxuICAnPSc6ICc9J1xufTtcbmZ1bmN0aW9uIERpcmVjdGlvbiAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICB2YXIgRGlyZWN0aW9uID0ge1xuICAgIC8qKlxuICAgICAqIFNldHVwcyBnYXAgdmFsdWUgYmFzZWQgb24gc2V0dGluZ3MuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIHRoaXMudmFsdWUgPSBHbGlkZS5zZXR0aW5ncy5kaXJlY3Rpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc29sdmVzIHBhdHRlcm4gYmFzZWQgb24gZGlyZWN0aW9uIHZhbHVlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0dGVyblxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICovXG4gICAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZShwYXR0ZXJuKSB7XG4gICAgICB2YXIgdG9rZW4gPSBwYXR0ZXJuLnNsaWNlKDAsIDEpO1xuXG4gICAgICBpZiAodGhpcy5pcygncnRsJykpIHtcbiAgICAgICAgcmV0dXJuIHBhdHRlcm4uc3BsaXQodG9rZW4pLmpvaW4oRkxJUEVEX01PVkVNRU5UU1t0b2tlbl0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGF0dGVybjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHZhbHVlIG9mIGRpcmVjdGlvbiBtb2RlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvblxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzOiBmdW5jdGlvbiBpcyhkaXJlY3Rpb24pIHtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlID09PSBkaXJlY3Rpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGxpZXMgZGlyZWN0aW9uIGNsYXNzIHRvIHRoZSByb290IEhUTUwgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYWRkQ2xhc3M6IGZ1bmN0aW9uIGFkZENsYXNzKCkge1xuICAgICAgQ29tcG9uZW50cy5IdG1sLnJvb3QuY2xhc3NMaXN0LmFkZChHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLmRpcmVjdGlvblt0aGlzLnZhbHVlXSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgZGlyZWN0aW9uIGNsYXNzIGZyb20gdGhlIHJvb3QgSFRNTCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmVDbGFzczogZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoKSB7XG4gICAgICBDb21wb25lbnRzLkh0bWwucm9vdC5jbGFzc0xpc3QucmVtb3ZlKEdsaWRlLnNldHRpbmdzLmNsYXNzZXMuZGlyZWN0aW9uW3RoaXMudmFsdWVdKTtcbiAgICB9XG4gIH07XG4gIGRlZmluZShEaXJlY3Rpb24sICd2YWx1ZScsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHZhbHVlIG9mIHRoZSBkaXJlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIERpcmVjdGlvbi5fdjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyB2YWx1ZSBvZiB0aGUgZGlyZWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgaWYgKFZBTElEX0RJUkVDVElPTlMuaW5kZXhPZih2YWx1ZSkgPiAtMSkge1xuICAgICAgICBEaXJlY3Rpb24uX3YgPSB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm4oJ0RpcmVjdGlvbiB2YWx1ZSBtdXN0IGJlIGBsdHJgIG9yIGBydGxgJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIENsZWFyIGRpcmVjdGlvbiBjbGFzczpcbiAgICogLSBvbiBkZXN0cm95IHRvIGJyaW5nIEhUTUwgdG8gaXRzIGluaXRpYWwgc3RhdGVcbiAgICogLSBvbiB1cGRhdGUgdG8gcmVtb3ZlIGNsYXNzIGJlZm9yZSByZWFwcGxpbmcgYmVsbG93XG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ2Rlc3Ryb3knLCAndXBkYXRlJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBEaXJlY3Rpb24ucmVtb3ZlQ2xhc3MoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBSZW1vdW50IGNvbXBvbmVudDpcbiAgICogLSBvbiB1cGRhdGUgdG8gcmVmbGVjdCBjaGFuZ2VzIGluIGRpcmVjdGlvbiB2YWx1ZVxuICAgKi9cblxuICBFdmVudHMub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBEaXJlY3Rpb24ubW91bnQoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBBcHBseSBkaXJlY3Rpb24gY2xhc3M6XG4gICAqIC0gYmVmb3JlIGJ1aWxkaW5nIHRvIGFwcGx5IGNsYXNzIGZvciB0aGUgZmlyc3QgdGltZVxuICAgKiAtIG9uIHVwZGF0aW5nIHRvIHJlYXBwbHkgZGlyZWN0aW9uIGNsYXNzIHRoYXQgbWF5IGNoYW5nZWRcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsnYnVpbGQuYmVmb3JlJywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgRGlyZWN0aW9uLmFkZENsYXNzKCk7XG4gIH0pO1xuICByZXR1cm4gRGlyZWN0aW9uO1xufVxuXG4vKipcbiAqIFJlZmxlY3RzIHZhbHVlIG9mIGdsaWRlIG1vdmVtZW50LlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gR2xpZGVcbiAqIEBwYXJhbSAge09iamVjdH0gQ29tcG9uZW50c1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBSdGwgKEdsaWRlLCBDb21wb25lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogTmVnYXRlcyB0aGUgcGFzc2VkIHRyYW5zbGF0ZSBpZiBnbGlkZSBpcyBpbiBSVEwgb3B0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSB0cmFuc2xhdGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgbW9kaWZ5OiBmdW5jdGlvbiBtb2RpZnkodHJhbnNsYXRlKSB7XG4gICAgICBpZiAoQ29tcG9uZW50cy5EaXJlY3Rpb24uaXMoJ3J0bCcpKSB7XG4gICAgICAgIHJldHVybiAtdHJhbnNsYXRlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJhbnNsYXRlO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGdsaWRlIG1vdmVtZW50IHdpdGggYSBgZ2FwYCBzZXR0aW5ncy5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IEdsaWRlXG4gKiBAcGFyYW0gIHtPYmplY3R9IENvbXBvbmVudHNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gR2FwIChHbGlkZSwgQ29tcG9uZW50cykge1xuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIE1vZGlmaWVzIHBhc3NlZCB0cmFuc2xhdGUgdmFsdWUgd2l0aCBudW1iZXIgaW4gdGhlIGBnYXBgIHNldHRpbmdzLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSB0cmFuc2xhdGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgbW9kaWZ5OiBmdW5jdGlvbiBtb2RpZnkodHJhbnNsYXRlKSB7XG4gICAgICB2YXIgbXVsdGlwbGllciA9IE1hdGguZmxvb3IodHJhbnNsYXRlIC8gQ29tcG9uZW50cy5TaXplcy5zbGlkZVdpZHRoKTtcbiAgICAgIHJldHVybiB0cmFuc2xhdGUgKyBDb21wb25lbnRzLkdhcHMudmFsdWUgKiBtdWx0aXBsaWVyO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGdsaWRlIG1vdmVtZW50IHdpdGggd2lkdGggb2YgYWRkaXRpb25hbCBjbG9uZXMgd2lkdGguXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBHbGlkZVxuICogQHBhcmFtICB7T2JqZWN0fSBDb21wb25lbnRzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIEdyb3cgKEdsaWRlLCBDb21wb25lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogQWRkcyB0byB0aGUgcGFzc2VkIHRyYW5zbGF0ZSB3aWR0aCBvZiB0aGUgaGFsZiBvZiBjbG9uZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRyYW5zbGF0ZVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBtb2RpZnk6IGZ1bmN0aW9uIG1vZGlmeSh0cmFuc2xhdGUpIHtcbiAgICAgIHJldHVybiB0cmFuc2xhdGUgKyBDb21wb25lbnRzLkNsb25lcy5ncm93IC8gMjtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogVXBkYXRlcyBnbGlkZSBtb3ZlbWVudCB3aXRoIGEgYHBlZWtgIHNldHRpbmdzLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gR2xpZGVcbiAqIEBwYXJhbSAge09iamVjdH0gQ29tcG9uZW50c1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIFBlZWtpbmcgKEdsaWRlLCBDb21wb25lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogTW9kaWZpZXMgcGFzc2VkIHRyYW5zbGF0ZSB2YWx1ZSB3aXRoIGEgYHBlZWtgIHNldHRpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRyYW5zbGF0ZVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBtb2RpZnk6IGZ1bmN0aW9uIG1vZGlmeSh0cmFuc2xhdGUpIHtcbiAgICAgIGlmIChHbGlkZS5zZXR0aW5ncy5mb2N1c0F0ID49IDApIHtcbiAgICAgICAgdmFyIHBlZWsgPSBDb21wb25lbnRzLlBlZWsudmFsdWU7XG5cbiAgICAgICAgaWYgKGlzT2JqZWN0KHBlZWspKSB7XG4gICAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZSAtIHBlZWsuYmVmb3JlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZSAtIHBlZWs7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cmFuc2xhdGU7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZXMgZ2xpZGUgbW92ZW1lbnQgd2l0aCBhIGBmb2N1c0F0YCBzZXR0aW5ncy5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IEdsaWRlXG4gKiBAcGFyYW0gIHtPYmplY3R9IENvbXBvbmVudHNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gRm9jdXNpbmcgKEdsaWRlLCBDb21wb25lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogTW9kaWZpZXMgcGFzc2VkIHRyYW5zbGF0ZSB2YWx1ZSB3aXRoIGluZGV4IGluIHRoZSBgZm9jdXNBdGAgc2V0dGluZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gdHJhbnNsYXRlXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIG1vZGlmeTogZnVuY3Rpb24gbW9kaWZ5KHRyYW5zbGF0ZSkge1xuICAgICAgdmFyIGdhcCA9IENvbXBvbmVudHMuR2Fwcy52YWx1ZTtcbiAgICAgIHZhciB3aWR0aCA9IENvbXBvbmVudHMuU2l6ZXMud2lkdGg7XG4gICAgICB2YXIgZm9jdXNBdCA9IEdsaWRlLnNldHRpbmdzLmZvY3VzQXQ7XG4gICAgICB2YXIgc2xpZGVXaWR0aCA9IENvbXBvbmVudHMuU2l6ZXMuc2xpZGVXaWR0aDtcblxuICAgICAgaWYgKGZvY3VzQXQgPT09ICdjZW50ZXInKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2xhdGUgLSAod2lkdGggLyAyIC0gc2xpZGVXaWR0aCAvIDIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJhbnNsYXRlIC0gc2xpZGVXaWR0aCAqIGZvY3VzQXQgLSBnYXAgKiBmb2N1c0F0O1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGRpZmZyZW50IHRyYW5zZm9ybWVycyBvbiB0cmFuc2xhdGUgdmFsdWUuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBHbGlkZVxuICogQHBhcmFtICB7T2JqZWN0fSBDb21wb25lbnRzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gbXV0YXRvciAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAvKipcbiAgICogTWVyZ2UgaW5zdGFuY2UgdHJhbnNmb3JtZXJzIHdpdGggY29sbGVjdGlvbiBvZiBkZWZhdWx0IHRyYW5zZm9ybWVycy5cbiAgICogSXQncyBpbXBvcnRhbnQgdGhhdCB0aGUgUnRsIGNvbXBvbmVudCBiZSBsYXN0IG9uIHRoZSBsaXN0LFxuICAgKiBzbyBpdCByZWZsZWN0cyBhbGwgcHJldmlvdXMgdHJhbnNmb3JtYXRpb25zLlxuICAgKlxuICAgKiBAdHlwZSB7QXJyYXl9XG4gICAqL1xuICB2YXIgVFJBTlNGT1JNRVJTID0gW0dhcCwgR3JvdywgUGVla2luZywgRm9jdXNpbmddLmNvbmNhdChHbGlkZS5fdCwgW1J0bF0pO1xuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIFBpcGxpbmVzIHRyYW5zbGF0ZSB2YWx1ZSB3aXRoIHJlZ2lzdGVyZWQgdHJhbnNmb3JtZXJzLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSB0cmFuc2xhdGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgbXV0YXRlOiBmdW5jdGlvbiBtdXRhdGUodHJhbnNsYXRlKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IFRSQU5TRk9STUVSUy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdHJhbnNmb3JtZXIgPSBUUkFOU0ZPUk1FUlNbaV07XG5cbiAgICAgICAgaWYgKGlzRnVuY3Rpb24odHJhbnNmb3JtZXIpICYmIGlzRnVuY3Rpb24odHJhbnNmb3JtZXIoKS5tb2RpZnkpKSB7XG4gICAgICAgICAgdHJhbnNsYXRlID0gdHJhbnNmb3JtZXIoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykubW9kaWZ5KHRyYW5zbGF0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2FybignVHJhbnNmb3JtZXIgc2hvdWxkIGJlIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIG9iamVjdCB3aXRoIGBtb2RpZnkoKWAgbWV0aG9kJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRyYW5zbGF0ZTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIFRyYW5zbGF0ZSAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICB2YXIgVHJhbnNsYXRlID0ge1xuICAgIC8qKlxuICAgICAqIFNldHMgdmFsdWUgb2YgdHJhbnNsYXRlIG9uIEhUTUwgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcbiAgICAgIHZhciB0cmFuc2Zvcm0gPSBtdXRhdG9yKEdsaWRlLCBDb21wb25lbnRzKS5tdXRhdGUodmFsdWUpO1xuICAgICAgdmFyIHRyYW5zbGF0ZTNkID0gXCJ0cmFuc2xhdGUzZChcIi5jb25jYXQoLTEgKiB0cmFuc2Zvcm0sIFwicHgsIDBweCwgMHB4KVwiKTtcbiAgICAgIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLnN0eWxlLm1velRyYW5zZm9ybSA9IHRyYW5zbGF0ZTNkOyAvLyBuZWVkZWQgZm9yIHN1cHBvcnRlZCBGaXJlZm94IDEwLTE1XG5cbiAgICAgIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9IHRyYW5zbGF0ZTNkOyAvLyBuZWVkZWQgZm9yIHN1cHBvcnRlZCBDaHJvbWUgMTAtMzUsIFNhZmFyaSA1LjEtOCwgYW5kIE9wZXJhIDE1LTIyXG5cbiAgICAgIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLnN0eWxlLnRyYW5zZm9ybSA9IHRyYW5zbGF0ZTNkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHZhbHVlIG9mIHRyYW5zbGF0ZSBmcm9tIEhUTUwgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS50cmFuc2Zvcm0gPSAnJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxuICAgICAqL1xuICAgIGdldFN0YXJ0SW5kZXg6IGZ1bmN0aW9uIGdldFN0YXJ0SW5kZXgoKSB7XG4gICAgICB2YXIgbGVuZ3RoID0gQ29tcG9uZW50cy5TaXplcy5sZW5ndGg7XG4gICAgICB2YXIgaW5kZXggPSBHbGlkZS5pbmRleDtcbiAgICAgIHZhciBwZXJWaWV3ID0gR2xpZGUuc2V0dGluZ3MucGVyVmlldztcblxuICAgICAgaWYgKENvbXBvbmVudHMuUnVuLmlzT2Zmc2V0KCc+JykgfHwgQ29tcG9uZW50cy5SdW4uaXNPZmZzZXQoJ3w+JykpIHtcbiAgICAgICAgcmV0dXJuIGxlbmd0aCArIChpbmRleCAtIHBlclZpZXcpO1xuICAgICAgfSAvLyBcIm1vZHVsbyBsZW5ndGhcIiBjb252ZXJ0cyBhbiBpbmRleCB0aGF0IGVxdWFscyBsZW5ndGggdG8gemVyb1xuXG5cbiAgICAgIHJldHVybiAoaW5kZXggKyBwZXJWaWV3KSAlIGxlbmd0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxuICAgICAqL1xuICAgIGdldFRyYXZlbERpc3RhbmNlOiBmdW5jdGlvbiBnZXRUcmF2ZWxEaXN0YW5jZSgpIHtcbiAgICAgIHZhciB0cmF2ZWxEaXN0YW5jZSA9IENvbXBvbmVudHMuU2l6ZXMuc2xpZGVXaWR0aCAqIEdsaWRlLnNldHRpbmdzLnBlclZpZXc7XG5cbiAgICAgIGlmIChDb21wb25lbnRzLlJ1bi5pc09mZnNldCgnPicpIHx8IENvbXBvbmVudHMuUnVuLmlzT2Zmc2V0KCd8PicpKSB7XG4gICAgICAgIC8vIHJldmVyc2UgdHJhdmVsIGRpc3RhbmNlIHNvIHRoYXQgd2UgZG9uJ3QgaGF2ZSB0byBjaGFuZ2Ugc3VidHJhY3Qgb3BlcmF0aW9uc1xuICAgICAgICByZXR1cm4gdHJhdmVsRGlzdGFuY2UgKiAtMTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRyYXZlbERpc3RhbmNlO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIFNldCBuZXcgdHJhbnNsYXRlIHZhbHVlOlxuICAgKiAtIG9uIG1vdmUgdG8gcmVmbGVjdCBpbmRleCBjaGFuZ2VcbiAgICogLSBvbiB1cGRhdGluZyB2aWEgQVBJIHRvIHJlZmxlY3QgcG9zc2libGUgY2hhbmdlcyBpbiBvcHRpb25zXG4gICAqL1xuXG4gIEV2ZW50cy5vbignbW92ZScsIGZ1bmN0aW9uIChjb250ZXh0KSB7XG4gICAgaWYgKCFHbGlkZS5pc1R5cGUoJ2Nhcm91c2VsJykgfHwgIUNvbXBvbmVudHMuUnVuLmlzT2Zmc2V0KCkpIHtcbiAgICAgIHJldHVybiBUcmFuc2xhdGUuc2V0KGNvbnRleHQubW92ZW1lbnQpO1xuICAgIH1cblxuICAgIENvbXBvbmVudHMuVHJhbnNpdGlvbi5hZnRlcihmdW5jdGlvbiAoKSB7XG4gICAgICBFdmVudHMuZW1pdCgndHJhbnNsYXRlLmp1bXAnKTtcbiAgICAgIFRyYW5zbGF0ZS5zZXQoQ29tcG9uZW50cy5TaXplcy5zbGlkZVdpZHRoICogR2xpZGUuaW5kZXgpO1xuICAgIH0pO1xuICAgIHZhciBzdGFydFdpZHRoID0gQ29tcG9uZW50cy5TaXplcy5zbGlkZVdpZHRoICogQ29tcG9uZW50cy5UcmFuc2xhdGUuZ2V0U3RhcnRJbmRleCgpO1xuICAgIHJldHVybiBUcmFuc2xhdGUuc2V0KHN0YXJ0V2lkdGggLSBDb21wb25lbnRzLlRyYW5zbGF0ZS5nZXRUcmF2ZWxEaXN0YW5jZSgpKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBSZW1vdmUgdHJhbnNsYXRlOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcgdG8gYnJpbmcgbWFya3VwIHRvIGl0cyBpbml0YWwgc3RhdGVcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIFRyYW5zbGF0ZS5yZW1vdmUoKTtcbiAgfSk7XG4gIHJldHVybiBUcmFuc2xhdGU7XG59XG5cbmZ1bmN0aW9uIFRyYW5zaXRpb24gKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgLyoqXG4gICAqIEhvbGRzIGluYWN0aXZpdHkgc3RhdHVzIG9mIHRyYW5zaXRpb24uXG4gICAqIFdoZW4gdHJ1ZSB0cmFuc2l0aW9uIGlzIG5vdCBhcHBsaWVkLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG4gIHZhciBkaXNhYmxlZCA9IGZhbHNlO1xuICB2YXIgVHJhbnNpdGlvbiA9IHtcbiAgICAvKipcbiAgICAgKiBDb21wb3NlcyBzdHJpbmcgb2YgdGhlIENTUyB0cmFuc2l0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAgICogQHJldHVybiB7U3RyaW5nfVxuICAgICAqL1xuICAgIGNvbXBvc2U6IGZ1bmN0aW9uIGNvbXBvc2UocHJvcGVydHkpIHtcbiAgICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuXG4gICAgICBpZiAoIWRpc2FibGVkKSB7XG4gICAgICAgIHJldHVybiBcIlwiLmNvbmNhdChwcm9wZXJ0eSwgXCIgXCIpLmNvbmNhdCh0aGlzLmR1cmF0aW9uLCBcIm1zIFwiKS5jb25jYXQoc2V0dGluZ3MuYW5pbWF0aW9uVGltaW5nRnVuYyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBcIlwiLmNvbmNhdChwcm9wZXJ0eSwgXCIgMG1zIFwiKS5jb25jYXQoc2V0dGluZ3MuYW5pbWF0aW9uVGltaW5nRnVuYyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgdmFsdWUgb2YgdHJhbnNpdGlvbiBvbiBIVE1MIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZz19IHByb3BlcnR5XG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCgpIHtcbiAgICAgIHZhciBwcm9wZXJ0eSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJ3RyYW5zZm9ybSc7XG4gICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS50cmFuc2l0aW9uID0gdGhpcy5jb21wb3NlKHByb3BlcnR5KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB2YWx1ZSBvZiB0cmFuc2l0aW9uIGZyb20gSFRNTCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLnN0eWxlLnRyYW5zaXRpb24gPSAnJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUnVucyBjYWxsYmFjayBhZnRlciBhbmltYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGFmdGVyOiBmdW5jdGlvbiBhZnRlcihjYWxsYmFjaykge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9LCB0aGlzLmR1cmF0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlIHRyYW5zaXRpb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGVuYWJsZTogZnVuY3Rpb24gZW5hYmxlKCkge1xuICAgICAgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuc2V0KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERpc2FibGUgdHJhbnNpdGlvbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgZGlzYWJsZTogZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgICAgIGRpc2FibGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuc2V0KCk7XG4gICAgfVxuICB9O1xuICBkZWZpbmUoVHJhbnNpdGlvbiwgJ2R1cmF0aW9uJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgZHVyYXRpb24gb2YgdGhlIHRyYW5zaXRpb24gYmFzZWRcbiAgICAgKiBvbiBjdXJyZW50bHkgcnVubmluZyBhbmltYXRpb24gdHlwZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuXG4gICAgICBpZiAoR2xpZGUuaXNUeXBlKCdzbGlkZXInKSAmJiBDb21wb25lbnRzLlJ1bi5vZmZzZXQpIHtcbiAgICAgICAgcmV0dXJuIHNldHRpbmdzLnJld2luZER1cmF0aW9uO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2V0dGluZ3MuYW5pbWF0aW9uRHVyYXRpb247XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIFNldCB0cmFuc2l0aW9uIGBzdHlsZWAgdmFsdWU6XG4gICAqIC0gb24gZWFjaCBtb3ZpbmcsIGJlY2F1c2UgaXQgbWF5IGJlIGNsZWFyZWQgYnkgb2Zmc2V0IG1vdmVcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdtb3ZlJywgZnVuY3Rpb24gKCkge1xuICAgIFRyYW5zaXRpb24uc2V0KCk7XG4gIH0pO1xuICAvKipcbiAgICogRGlzYWJsZSB0cmFuc2l0aW9uOlxuICAgKiAtIGJlZm9yZSBpbml0aWFsIGJ1aWxkIHRvIGF2b2lkIHRyYW5zaXRpb25pbmcgZnJvbSBgMGAgdG8gYHN0YXJ0QXRgIGluZGV4XG4gICAqIC0gd2hpbGUgcmVzaXppbmcgd2luZG93IGFuZCByZWNhbGN1bGF0aW5nIGRpbWVuc2lvbnNcbiAgICogLSBvbiBqdW1waW5nIGZyb20gb2Zmc2V0IHRyYW5zaXRpb24gYXQgc3RhcnQgYW5kIGVuZCBlZGdlcyBpbiBgY2Fyb3VzZWxgIHR5cGVcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsnYnVpbGQuYmVmb3JlJywgJ3Jlc2l6ZScsICd0cmFuc2xhdGUuanVtcCddLCBmdW5jdGlvbiAoKSB7XG4gICAgVHJhbnNpdGlvbi5kaXNhYmxlKCk7XG4gIH0pO1xuICAvKipcbiAgICogRW5hYmxlIHRyYW5zaXRpb246XG4gICAqIC0gb24gZWFjaCBydW5uaW5nLCBiZWNhdXNlIGl0IG1heSBiZSBkaXNhYmxlZCBieSBvZmZzZXQgbW92ZVxuICAgKi9cblxuICBFdmVudHMub24oJ3J1bicsIGZ1bmN0aW9uICgpIHtcbiAgICBUcmFuc2l0aW9uLmVuYWJsZSgpO1xuICB9KTtcbiAgLyoqXG4gICAqIFJlbW92ZSB0cmFuc2l0aW9uOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcgdG8gYnJpbmcgbWFya3VwIHRvIGl0cyBpbml0YWwgc3RhdGVcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIFRyYW5zaXRpb24ucmVtb3ZlKCk7XG4gIH0pO1xuICByZXR1cm4gVHJhbnNpdGlvbjtcbn1cblxuLyoqXG4gKiBUZXN0IHZpYSBhIGdldHRlciBpbiB0aGUgb3B0aW9ucyBvYmplY3QgdG8gc2VlXG4gKiBpZiB0aGUgcGFzc2l2ZSBwcm9wZXJ0eSBpcyBhY2Nlc3NlZC5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9XSUNHL0V2ZW50TGlzdGVuZXJPcHRpb25zL2Jsb2IvZ2gtcGFnZXMvZXhwbGFpbmVyLm1kI2ZlYXR1cmUtZGV0ZWN0aW9uXG4gKi9cbnZhciBzdXBwb3J0c1Bhc3NpdmUgPSBmYWxzZTtcblxudHJ5IHtcbiAgdmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdFBhc3NpdmUnLCBudWxsLCBvcHRzKTtcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Rlc3RQYXNzaXZlJywgbnVsbCwgb3B0cyk7XG59IGNhdGNoIChlKSB7fVxuXG52YXIgc3VwcG9ydHNQYXNzaXZlJDEgPSBzdXBwb3J0c1Bhc3NpdmU7XG5cbnZhciBTVEFSVF9FVkVOVFMgPSBbJ3RvdWNoc3RhcnQnLCAnbW91c2Vkb3duJ107XG52YXIgTU9WRV9FVkVOVFMgPSBbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXTtcbnZhciBFTkRfRVZFTlRTID0gWyd0b3VjaGVuZCcsICd0b3VjaGNhbmNlbCcsICdtb3VzZXVwJywgJ21vdXNlbGVhdmUnXTtcbnZhciBNT1VTRV9FVkVOVFMgPSBbJ21vdXNlZG93bicsICdtb3VzZW1vdmUnLCAnbW91c2V1cCcsICdtb3VzZWxlYXZlJ107XG5mdW5jdGlvbiBTd2lwZSAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIGJpbmRlciBmb3IgRE9NIEV2ZW50cy5cbiAgICpcbiAgICogQHR5cGUge0V2ZW50c0JpbmRlcn1cbiAgICovXG4gIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG4gIHZhciBzd2lwZVNpbiA9IDA7XG4gIHZhciBzd2lwZVN0YXJ0WCA9IDA7XG4gIHZhciBzd2lwZVN0YXJ0WSA9IDA7XG4gIHZhciBkaXNhYmxlZCA9IGZhbHNlO1xuICB2YXIgY2FwdHVyZSA9IHN1cHBvcnRzUGFzc2l2ZSQxID8ge1xuICAgIHBhc3NpdmU6IHRydWVcbiAgfSA6IGZhbHNlO1xuICB2YXIgU3dpcGUgPSB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgc3dpcGUgYmluZGluZ3MuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIHRoaXMuYmluZFN3aXBlU3RhcnQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgYHN3aXBlc3RhcnRgIGV2ZW50LiBDYWxjdWxhdGVzIGVudHJ5IHBvaW50cyBvZiB0aGUgdXNlcidzIHRhcC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KGV2ZW50KSB7XG4gICAgICBpZiAoIWRpc2FibGVkICYmICFHbGlkZS5kaXNhYmxlZCkge1xuICAgICAgICB0aGlzLmRpc2FibGUoKTtcbiAgICAgICAgdmFyIHN3aXBlID0gdGhpcy50b3VjaGVzKGV2ZW50KTtcbiAgICAgICAgc3dpcGVTaW4gPSBudWxsO1xuICAgICAgICBzd2lwZVN0YXJ0WCA9IHRvSW50KHN3aXBlLnBhZ2VYKTtcbiAgICAgICAgc3dpcGVTdGFydFkgPSB0b0ludChzd2lwZS5wYWdlWSk7XG4gICAgICAgIHRoaXMuYmluZFN3aXBlTW92ZSgpO1xuICAgICAgICB0aGlzLmJpbmRTd2lwZUVuZCgpO1xuICAgICAgICBFdmVudHMuZW1pdCgnc3dpcGUuc3RhcnQnKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgYHN3aXBlbW92ZWAgZXZlbnQuIENhbGN1bGF0ZXMgdXNlcidzIHRhcCBhbmdsZSBhbmQgZGlzdGFuY2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAgICAgKi9cbiAgICBtb3ZlOiBmdW5jdGlvbiBtb3ZlKGV2ZW50KSB7XG4gICAgICBpZiAoIUdsaWRlLmRpc2FibGVkKSB7XG4gICAgICAgIHZhciBfR2xpZGUkc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncyxcbiAgICAgICAgICAgIHRvdWNoQW5nbGUgPSBfR2xpZGUkc2V0dGluZ3MudG91Y2hBbmdsZSxcbiAgICAgICAgICAgIHRvdWNoUmF0aW8gPSBfR2xpZGUkc2V0dGluZ3MudG91Y2hSYXRpbyxcbiAgICAgICAgICAgIGNsYXNzZXMgPSBfR2xpZGUkc2V0dGluZ3MuY2xhc3NlcztcbiAgICAgICAgdmFyIHN3aXBlID0gdGhpcy50b3VjaGVzKGV2ZW50KTtcbiAgICAgICAgdmFyIHN1YkV4U3ggPSB0b0ludChzd2lwZS5wYWdlWCkgLSBzd2lwZVN0YXJ0WDtcbiAgICAgICAgdmFyIHN1YkV5U3kgPSB0b0ludChzd2lwZS5wYWdlWSkgLSBzd2lwZVN0YXJ0WTtcbiAgICAgICAgdmFyIHBvd0VYID0gTWF0aC5hYnMoc3ViRXhTeCA8PCAyKTtcbiAgICAgICAgdmFyIHBvd0VZID0gTWF0aC5hYnMoc3ViRXlTeSA8PCAyKTtcbiAgICAgICAgdmFyIHN3aXBlSHlwb3RlbnVzZSA9IE1hdGguc3FydChwb3dFWCArIHBvd0VZKTtcbiAgICAgICAgdmFyIHN3aXBlQ2F0aGV0dXMgPSBNYXRoLnNxcnQocG93RVkpO1xuICAgICAgICBzd2lwZVNpbiA9IE1hdGguYXNpbihzd2lwZUNhdGhldHVzIC8gc3dpcGVIeXBvdGVudXNlKTtcblxuICAgICAgICBpZiAoc3dpcGVTaW4gKiAxODAgLyBNYXRoLlBJIDwgdG91Y2hBbmdsZSkge1xuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIENvbXBvbmVudHMuTW92ZS5tYWtlKHN1YkV4U3ggKiB0b0Zsb2F0KHRvdWNoUmF0aW8pKTtcbiAgICAgICAgICBDb21wb25lbnRzLkh0bWwucm9vdC5jbGFzc0xpc3QuYWRkKGNsYXNzZXMuZHJhZ2dpbmcpO1xuICAgICAgICAgIEV2ZW50cy5lbWl0KCdzd2lwZS5tb3ZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXIgZm9yIGBzd2lwZWVuZGAgZXZlbnQuIEZpbml0aWFsaXplcyB1c2VyJ3MgdGFwIGFuZCBkZWNpZGVzIGFib3V0IGdsaWRlIG1vdmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGVuZDogZnVuY3Rpb24gZW5kKGV2ZW50KSB7XG4gICAgICBpZiAoIUdsaWRlLmRpc2FibGVkKSB7XG4gICAgICAgIHZhciBfR2xpZGUkc2V0dGluZ3MyID0gR2xpZGUuc2V0dGluZ3MsXG4gICAgICAgICAgICBwZXJTd2lwZSA9IF9HbGlkZSRzZXR0aW5nczIucGVyU3dpcGUsXG4gICAgICAgICAgICB0b3VjaEFuZ2xlID0gX0dsaWRlJHNldHRpbmdzMi50b3VjaEFuZ2xlLFxuICAgICAgICAgICAgY2xhc3NlcyA9IF9HbGlkZSRzZXR0aW5nczIuY2xhc3NlcztcbiAgICAgICAgdmFyIHN3aXBlID0gdGhpcy50b3VjaGVzKGV2ZW50KTtcbiAgICAgICAgdmFyIHRocmVzaG9sZCA9IHRoaXMudGhyZXNob2xkKGV2ZW50KTtcbiAgICAgICAgdmFyIHN3aXBlRGlzdGFuY2UgPSBzd2lwZS5wYWdlWCAtIHN3aXBlU3RhcnRYO1xuICAgICAgICB2YXIgc3dpcGVEZWcgPSBzd2lwZVNpbiAqIDE4MCAvIE1hdGguUEk7XG4gICAgICAgIHRoaXMuZW5hYmxlKCk7XG5cbiAgICAgICAgaWYgKHN3aXBlRGlzdGFuY2UgPiB0aHJlc2hvbGQgJiYgc3dpcGVEZWcgPCB0b3VjaEFuZ2xlKSB7XG4gICAgICAgICAgQ29tcG9uZW50cy5SdW4ubWFrZShDb21wb25lbnRzLkRpcmVjdGlvbi5yZXNvbHZlKFwiXCIuY29uY2F0KHBlclN3aXBlLCBcIjxcIikpKTtcbiAgICAgICAgfSBlbHNlIGlmIChzd2lwZURpc3RhbmNlIDwgLXRocmVzaG9sZCAmJiBzd2lwZURlZyA8IHRvdWNoQW5nbGUpIHtcbiAgICAgICAgICBDb21wb25lbnRzLlJ1bi5tYWtlKENvbXBvbmVudHMuRGlyZWN0aW9uLnJlc29sdmUoXCJcIi5jb25jYXQocGVyU3dpcGUsIFwiPlwiKSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFdoaWxlIHN3aXBlIGRvbid0IHJlYWNoIGRpc3RhbmNlIGFwcGx5IHByZXZpb3VzIHRyYW5zZm9ybS5cbiAgICAgICAgICBDb21wb25lbnRzLk1vdmUubWFrZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgQ29tcG9uZW50cy5IdG1sLnJvb3QuY2xhc3NMaXN0LnJlbW92ZShjbGFzc2VzLmRyYWdnaW5nKTtcbiAgICAgICAgdGhpcy51bmJpbmRTd2lwZU1vdmUoKTtcbiAgICAgICAgdGhpcy51bmJpbmRTd2lwZUVuZCgpO1xuICAgICAgICBFdmVudHMuZW1pdCgnc3dpcGUuZW5kJyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmRzIHN3aXBlJ3Mgc3RhcnRpbmcgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGJpbmRTd2lwZVN0YXJ0OiBmdW5jdGlvbiBiaW5kU3dpcGVTdGFydCgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBfR2xpZGUkc2V0dGluZ3MzID0gR2xpZGUuc2V0dGluZ3MsXG4gICAgICAgICAgc3dpcGVUaHJlc2hvbGQgPSBfR2xpZGUkc2V0dGluZ3MzLnN3aXBlVGhyZXNob2xkLFxuICAgICAgICAgIGRyYWdUaHJlc2hvbGQgPSBfR2xpZGUkc2V0dGluZ3MzLmRyYWdUaHJlc2hvbGQ7XG5cbiAgICAgIGlmIChzd2lwZVRocmVzaG9sZCkge1xuICAgICAgICBCaW5kZXIub24oU1RBUlRfRVZFTlRTWzBdLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgX3RoaXMuc3RhcnQoZXZlbnQpO1xuICAgICAgICB9LCBjYXB0dXJlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRyYWdUaHJlc2hvbGQpIHtcbiAgICAgICAgQmluZGVyLm9uKFNUQVJUX0VWRU5UU1sxXSwgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIF90aGlzLnN0YXJ0KGV2ZW50KTtcbiAgICAgICAgfSwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZHMgc3dpcGUncyBzdGFydGluZyBldmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgdW5iaW5kU3dpcGVTdGFydDogZnVuY3Rpb24gdW5iaW5kU3dpcGVTdGFydCgpIHtcbiAgICAgIEJpbmRlci5vZmYoU1RBUlRfRVZFTlRTWzBdLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgY2FwdHVyZSk7XG4gICAgICBCaW5kZXIub2ZmKFNUQVJUX0VWRU5UU1sxXSwgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIsIGNhcHR1cmUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kcyBzd2lwZSdzIG1vdmluZyBldmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYmluZFN3aXBlTW92ZTogZnVuY3Rpb24gYmluZFN3aXBlTW92ZSgpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBCaW5kZXIub24oTU9WRV9FVkVOVFMsIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCB0aHJvdHRsZShmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgX3RoaXMyLm1vdmUoZXZlbnQpO1xuICAgICAgfSwgR2xpZGUuc2V0dGluZ3MudGhyb3R0bGUpLCBjYXB0dXJlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kcyBzd2lwZSdzIG1vdmluZyBldmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgdW5iaW5kU3dpcGVNb3ZlOiBmdW5jdGlvbiB1bmJpbmRTd2lwZU1vdmUoKSB7XG4gICAgICBCaW5kZXIub2ZmKE1PVkVfRVZFTlRTLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgY2FwdHVyZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmRzIHN3aXBlJ3MgZW5kaW5nIGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBiaW5kU3dpcGVFbmQ6IGZ1bmN0aW9uIGJpbmRTd2lwZUVuZCgpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICBCaW5kZXIub24oRU5EX0VWRU5UUywgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBfdGhpczMuZW5kKGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmRzIHN3aXBlJ3MgZW5kaW5nIGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICB1bmJpbmRTd2lwZUVuZDogZnVuY3Rpb24gdW5iaW5kU3dpcGVFbmQoKSB7XG4gICAgICBCaW5kZXIub2ZmKEVORF9FVkVOVFMsIENvbXBvbmVudHMuSHRtbC53cmFwcGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTm9ybWFsaXplcyBldmVudCB0b3VjaGVzIHBvaW50cyBhY2NvcnRpbmcgdG8gZGlmZmVyZW50IHR5cGVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gICAgICovXG4gICAgdG91Y2hlczogZnVuY3Rpb24gdG91Y2hlcyhldmVudCkge1xuICAgICAgaWYgKE1PVVNFX0VWRU5UUy5pbmRleE9mKGV2ZW50LnR5cGUpID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0cyB2YWx1ZSBvZiBtaW5pbXVtIHN3aXBlIGRpc3RhbmNlIHNldHRpbmdzIGJhc2VkIG9uIGV2ZW50IHR5cGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhyZXNob2xkOiBmdW5jdGlvbiB0aHJlc2hvbGQoZXZlbnQpIHtcbiAgICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuXG4gICAgICBpZiAoTU9VU0VfRVZFTlRTLmluZGV4T2YoZXZlbnQudHlwZSkgPiAtMSkge1xuICAgICAgICByZXR1cm4gc2V0dGluZ3MuZHJhZ1RocmVzaG9sZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNldHRpbmdzLnN3aXBlVGhyZXNob2xkO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmFibGVzIHN3aXBlIGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7c2VsZn1cbiAgICAgKi9cbiAgICBlbmFibGU6IGZ1bmN0aW9uIGVuYWJsZSgpIHtcbiAgICAgIGRpc2FibGVkID0gZmFsc2U7XG4gICAgICBDb21wb25lbnRzLlRyYW5zaXRpb24uZW5hYmxlKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGlzYWJsZXMgc3dpcGUgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAqL1xuICAgIGRpc2FibGU6IGZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgICBDb21wb25lbnRzLlRyYW5zaXRpb24uZGlzYWJsZSgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogQWRkIGNvbXBvbmVudCBjbGFzczpcbiAgICogLSBhZnRlciBpbml0aWFsIGJ1aWxkaW5nXG4gICAqL1xuXG4gIEV2ZW50cy5vbignYnVpbGQuYWZ0ZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgQ29tcG9uZW50cy5IdG1sLnJvb3QuY2xhc3NMaXN0LmFkZChHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLnN3aXBlYWJsZSk7XG4gIH0pO1xuICAvKipcbiAgICogUmVtb3ZlIHN3aXBpbmcgYmluZGluZ3M6XG4gICAqIC0gb24gZGVzdHJveWluZywgdG8gcmVtb3ZlIGFkZGVkIEV2ZW50TGlzdGVuZXJzXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBTd2lwZS51bmJpbmRTd2lwZVN0YXJ0KCk7XG4gICAgU3dpcGUudW5iaW5kU3dpcGVNb3ZlKCk7XG4gICAgU3dpcGUudW5iaW5kU3dpcGVFbmQoKTtcbiAgICBCaW5kZXIuZGVzdHJveSgpO1xuICB9KTtcbiAgcmV0dXJuIFN3aXBlO1xufVxuXG5mdW5jdGlvbiBJbWFnZXMgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgLyoqXG4gICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAqXG4gICAqIEB0eXBlIHtFdmVudHNCaW5kZXJ9XG4gICAqL1xuICB2YXIgQmluZGVyID0gbmV3IEV2ZW50c0JpbmRlcigpO1xuICB2YXIgSW1hZ2VzID0ge1xuICAgIC8qKlxuICAgICAqIEJpbmRzIGxpc3RlbmVyIHRvIGdsaWRlIHdyYXBwZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIHRoaXMuYmluZCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kcyBgZHJhZ3N0YXJ0YCBldmVudCBvbiB3cmFwcGVyIHRvIHByZXZlbnQgZHJhZ2dpbmcgaW1hZ2VzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgICAgQmluZGVyLm9uKCdkcmFnc3RhcnQnLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgdGhpcy5kcmFnc3RhcnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmRzIGBkcmFnc3RhcnRgIGV2ZW50IG9uIHdyYXBwZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgICAgQmluZGVyLm9mZignZHJhZ3N0YXJ0JywgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFdmVudCBoYW5kbGVyLiBQcmV2ZW50cyBkcmFnZ2luZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgZHJhZ3N0YXJ0OiBmdW5jdGlvbiBkcmFnc3RhcnQoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogUmVtb3ZlIGJpbmRpbmdzIGZyb20gaW1hZ2VzOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIHJlbW92ZSBhZGRlZCBFdmVudExpc3RlbmVyc1xuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgSW1hZ2VzLnVuYmluZCgpO1xuICAgIEJpbmRlci5kZXN0cm95KCk7XG4gIH0pO1xuICByZXR1cm4gSW1hZ2VzO1xufVxuXG5mdW5jdGlvbiBBbmNob3JzIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIC8qKlxuICAgKiBJbnN0YW5jZSBvZiB0aGUgYmluZGVyIGZvciBET00gRXZlbnRzLlxuICAgKlxuICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgKi9cbiAgdmFyIEJpbmRlciA9IG5ldyBFdmVudHNCaW5kZXIoKTtcbiAgLyoqXG4gICAqIEhvbGRzIGRldGFjaGluZyBzdGF0dXMgb2YgYW5jaG9ycy5cbiAgICogUHJldmVudHMgZGV0YWNoaW5nIG9mIGFscmVhZHkgZGV0YWNoZWQgYW5jaG9ycy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuXG4gIHZhciBkZXRhY2hlZCA9IGZhbHNlO1xuICAvKipcbiAgICogSG9sZHMgcHJldmVudGluZyBzdGF0dXMgb2YgYW5jaG9ycy5cbiAgICogSWYgYHRydWVgIHJlZGlyZWN0aW9uIGFmdGVyIGNsaWNrIHdpbGwgYmUgZGlzYWJsZWQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cblxuICB2YXIgcHJldmVudGVkID0gZmFsc2U7XG4gIHZhciBBbmNob3JzID0ge1xuICAgIC8qKlxuICAgICAqIFNldHVwcyBhIGluaXRpYWwgc3RhdGUgb2YgYW5jaG9ycyBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Vm9pZH1cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICAvKipcbiAgICAgICAqIEhvbGRzIGNvbGxlY3Rpb24gb2YgYW5jaG9ycyBlbGVtZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICogQHR5cGUge0hUTUxDb2xsZWN0aW9ufVxuICAgICAgICovXG4gICAgICB0aGlzLl9hID0gQ29tcG9uZW50cy5IdG1sLndyYXBwZXIucXVlcnlTZWxlY3RvckFsbCgnYScpO1xuICAgICAgdGhpcy5iaW5kKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmRzIGV2ZW50cyB0byBhbmNob3JzIGluc2lkZSBhIHRyYWNrLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgICAgQmluZGVyLm9uKCdjbGljaycsIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCB0aGlzLmNsaWNrKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kcyBldmVudHMgYXR0YWNoZWQgdG8gYW5jaG9ycyBpbnNpZGUgYSB0cmFjay5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgICBCaW5kZXIub2ZmKCdjbGljaycsIENvbXBvbmVudHMuSHRtbC53cmFwcGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgY2xpY2sgZXZlbnQuIFByZXZlbnRzIGNsaWNrcyB3aGVuIGdsaWRlIGlzIGluIGBwcmV2ZW50YCBzdGF0dXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50XG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBjbGljazogZnVuY3Rpb24gY2xpY2soZXZlbnQpIHtcbiAgICAgIGlmIChwcmV2ZW50ZWQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERldGFjaGVzIGFuY2hvcnMgY2xpY2sgZXZlbnQgaW5zaWRlIGdsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7c2VsZn1cbiAgICAgKi9cbiAgICBkZXRhY2g6IGZ1bmN0aW9uIGRldGFjaCgpIHtcbiAgICAgIHByZXZlbnRlZCA9IHRydWU7XG5cbiAgICAgIGlmICghZGV0YWNoZWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5pdGVtc1tpXS5kcmFnZ2FibGUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRldGFjaGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaGVzIGFuY2hvcnMgY2xpY2sgZXZlbnRzIGluc2lkZSBnbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3NlbGZ9XG4gICAgICovXG4gICAgYXR0YWNoOiBmdW5jdGlvbiBhdHRhY2goKSB7XG4gICAgICBwcmV2ZW50ZWQgPSBmYWxzZTtcblxuICAgICAgaWYgKGRldGFjaGVkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRoaXMuaXRlbXNbaV0uZHJhZ2dhYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRldGFjaGVkID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lKEFuY2hvcnMsICdpdGVtcycsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIGNvbGxlY3Rpb24gb2YgdGhlIGFycm93cyBIVE1MIGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnRbXX1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBBbmNob3JzLl9hO1xuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBEZXRhY2ggYW5jaG9ycyBpbnNpZGUgc2xpZGVzOlxuICAgKiAtIG9uIHN3aXBpbmcsIHNvIHRoZXkgd29uJ3QgcmVkaXJlY3QgdG8gaXRzIGBocmVmYCBhdHRyaWJ1dGVzXG4gICAqL1xuXG4gIEV2ZW50cy5vbignc3dpcGUubW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBBbmNob3JzLmRldGFjaCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIEF0dGFjaCBhbmNob3JzIGluc2lkZSBzbGlkZXM6XG4gICAqIC0gYWZ0ZXIgc3dpcGluZyBhbmQgdHJhbnNpdGlvbnMgZW5kcywgc28gdGhleSBjYW4gcmVkaXJlY3QgYWZ0ZXIgY2xpY2sgYWdhaW5cbiAgICovXG5cbiAgRXZlbnRzLm9uKCdzd2lwZS5lbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgQ29tcG9uZW50cy5UcmFuc2l0aW9uLmFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIEFuY2hvcnMuYXR0YWNoKCk7XG4gICAgfSk7XG4gIH0pO1xuICAvKipcbiAgICogVW5iaW5kIGFuY2hvcnMgaW5zaWRlIHNsaWRlczpcbiAgICogLSBvbiBkZXN0cm95aW5nLCB0byBicmluZyBhbmNob3JzIHRvIGl0cyBpbml0aWFsIHN0YXRlXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBBbmNob3JzLmF0dGFjaCgpO1xuICAgIEFuY2hvcnMudW5iaW5kKCk7XG4gICAgQmluZGVyLmRlc3Ryb3koKTtcbiAgfSk7XG4gIHJldHVybiBBbmNob3JzO1xufVxuXG52YXIgTkFWX1NFTEVDVE9SID0gJ1tkYXRhLWdsaWRlLWVsPVwiY29udHJvbHNbbmF2XVwiXSc7XG52YXIgQ09OVFJPTFNfU0VMRUNUT1IgPSAnW2RhdGEtZ2xpZGUtZWxePVwiY29udHJvbHNcIl0nO1xudmFyIFBSRVZJT1VTX0NPTlRST0xTX1NFTEVDVE9SID0gXCJcIi5jb25jYXQoQ09OVFJPTFNfU0VMRUNUT1IsIFwiIFtkYXRhLWdsaWRlLWRpcio9XFxcIjxcXFwiXVwiKTtcbnZhciBORVhUX0NPTlRST0xTX1NFTEVDVE9SID0gXCJcIi5jb25jYXQoQ09OVFJPTFNfU0VMRUNUT1IsIFwiIFtkYXRhLWdsaWRlLWRpcio9XFxcIj5cXFwiXVwiKTtcbmZ1bmN0aW9uIENvbnRyb2xzIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIC8qKlxuICAgKiBJbnN0YW5jZSBvZiB0aGUgYmluZGVyIGZvciBET00gRXZlbnRzLlxuICAgKlxuICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgKi9cbiAgdmFyIEJpbmRlciA9IG5ldyBFdmVudHNCaW5kZXIoKTtcbiAgdmFyIGNhcHR1cmUgPSBzdXBwb3J0c1Bhc3NpdmUkMSA/IHtcbiAgICBwYXNzaXZlOiB0cnVlXG4gIH0gOiBmYWxzZTtcbiAgdmFyIENvbnRyb2xzID0ge1xuICAgIC8qKlxuICAgICAqIEluaXRzIGFycm93cy4gQmluZHMgZXZlbnRzIGxpc3RlbmVyc1xuICAgICAqIHRvIHRoZSBhcnJvd3MgSFRNTCBlbGVtZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgLyoqXG4gICAgICAgKiBDb2xsZWN0aW9uIG9mIG5hdmlnYXRpb24gSFRNTCBlbGVtZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICogQHR5cGUge0hUTUxDb2xsZWN0aW9ufVxuICAgICAgICovXG4gICAgICB0aGlzLl9uID0gQ29tcG9uZW50cy5IdG1sLnJvb3QucXVlcnlTZWxlY3RvckFsbChOQVZfU0VMRUNUT1IpO1xuICAgICAgLyoqXG4gICAgICAgKiBDb2xsZWN0aW9uIG9mIGNvbnRyb2xzIEhUTUwgZWxlbWVudHMuXG4gICAgICAgKlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEB0eXBlIHtIVE1MQ29sbGVjdGlvbn1cbiAgICAgICAqL1xuXG4gICAgICB0aGlzLl9jID0gQ29tcG9uZW50cy5IdG1sLnJvb3QucXVlcnlTZWxlY3RvckFsbChDT05UUk9MU19TRUxFQ1RPUik7XG4gICAgICAvKipcbiAgICAgICAqIENvbGxlY3Rpb24gb2YgYXJyb3cgY29udHJvbCBIVE1MIGVsZW1lbnRzLlxuICAgICAgICpcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICovXG5cbiAgICAgIHRoaXMuX2Fycm93Q29udHJvbHMgPSB7XG4gICAgICAgIHByZXZpb3VzOiBDb21wb25lbnRzLkh0bWwucm9vdC5xdWVyeVNlbGVjdG9yQWxsKFBSRVZJT1VTX0NPTlRST0xTX1NFTEVDVE9SKSxcbiAgICAgICAgbmV4dDogQ29tcG9uZW50cy5IdG1sLnJvb3QucXVlcnlTZWxlY3RvckFsbChORVhUX0NPTlRST0xTX1NFTEVDVE9SKVxuICAgICAgfTtcbiAgICAgIHRoaXMuYWRkQmluZGluZ3MoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyBhY3RpdmUgY2xhc3MgdG8gY3VycmVudCBzbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgc2V0QWN0aXZlOiBmdW5jdGlvbiBzZXRBY3RpdmUoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5hZGRDbGFzcyh0aGlzLl9uW2ldLmNoaWxkcmVuKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhY3RpdmUgY2xhc3MgdG8gY3VycmVudCBzbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlQWN0aXZlOiBmdW5jdGlvbiByZW1vdmVBY3RpdmUoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX24ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5yZW1vdmVDbGFzcyh0aGlzLl9uW2ldLmNoaWxkcmVuKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVG9nZ2xlcyBhY3RpdmUgY2xhc3Mgb24gaXRlbXMgaW5zaWRlIG5hdmlnYXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gY29udHJvbHNcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGFkZENsYXNzOiBmdW5jdGlvbiBhZGRDbGFzcyhjb250cm9scykge1xuICAgICAgdmFyIHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3M7XG4gICAgICB2YXIgaXRlbSA9IGNvbnRyb2xzW0dsaWRlLmluZGV4XTtcblxuICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKHNldHRpbmdzLmNsYXNzZXMubmF2LmFjdGl2ZSk7XG4gICAgICAgIHNpYmxpbmdzKGl0ZW0pLmZvckVhY2goZnVuY3Rpb24gKHNpYmxpbmcpIHtcbiAgICAgICAgICBzaWJsaW5nLmNsYXNzTGlzdC5yZW1vdmUoc2V0dGluZ3MuY2xhc3Nlcy5uYXYuYWN0aXZlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWN0aXZlIGNsYXNzIGZyb20gYWN0aXZlIGNvbnRyb2wuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gY29udHJvbHNcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbiByZW1vdmVDbGFzcyhjb250cm9scykge1xuICAgICAgdmFyIGl0ZW0gPSBjb250cm9sc1tHbGlkZS5pbmRleF07XG5cbiAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZShHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLm5hdi5hY3RpdmUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzLCByZW1vdmVzIG9yIGFkZHMgYEdsaWRlLnNldHRpbmdzLmNsYXNzZXMuZGlzYWJsZWRBcnJvd2AgY2xhc3Mgb24gdGhlIGNvbnRyb2wgYXJyb3dzXG4gICAgICovXG4gICAgc2V0QXJyb3dTdGF0ZTogZnVuY3Rpb24gc2V0QXJyb3dTdGF0ZSgpIHtcbiAgICAgIGlmIChHbGlkZS5zZXR0aW5ncy5yZXdpbmQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgbmV4dCA9IENvbnRyb2xzLl9hcnJvd0NvbnRyb2xzLm5leHQ7XG4gICAgICB2YXIgcHJldmlvdXMgPSBDb250cm9scy5fYXJyb3dDb250cm9scy5wcmV2aW91cztcbiAgICAgIHRoaXMucmVzZXRBcnJvd1N0YXRlKG5leHQsIHByZXZpb3VzKTtcblxuICAgICAgaWYgKEdsaWRlLmluZGV4ID09PSAwKSB7XG4gICAgICAgIHRoaXMuZGlzYWJsZUFycm93KHByZXZpb3VzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKEdsaWRlLmluZGV4ID09PSBDb21wb25lbnRzLlJ1bi5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlQXJyb3cobmV4dCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYEdsaWRlLnNldHRpbmdzLmNsYXNzZXMuZGlzYWJsZWRBcnJvd2AgZnJvbSBnaXZlbiBOb2RlTGlzdCBlbGVtZW50c1xuICAgICAqXG4gICAgICogQHBhcmFtIHtOb2RlTGlzdFtdfSBsaXN0c1xuICAgICAqL1xuICAgIHJlc2V0QXJyb3dTdGF0ZTogZnVuY3Rpb24gcmVzZXRBcnJvd1N0YXRlKCkge1xuICAgICAgdmFyIHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3M7XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBsaXN0cyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgbGlzdHNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIGxpc3RzLmZvckVhY2goZnVuY3Rpb24gKGxpc3QpIHtcbiAgICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHNldHRpbmdzLmNsYXNzZXMuYXJyb3cuZGlzYWJsZWQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGBHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLmRpc2FibGVkQXJyb3dgIHRvIGdpdmVuIE5vZGVMaXN0IGVsZW1lbnRzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge05vZGVMaXN0W119IGxpc3RzXG4gICAgICovXG4gICAgZGlzYWJsZUFycm93OiBmdW5jdGlvbiBkaXNhYmxlQXJyb3coKSB7XG4gICAgICB2YXIgc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncztcblxuICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBsaXN0cyA9IG5ldyBBcnJheShfbGVuMiksIF9rZXkyID0gMDsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgICBsaXN0c1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuICAgICAgfVxuXG4gICAgICBsaXN0cy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0KSB7XG4gICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChzZXR0aW5ncy5jbGFzc2VzLmFycm93LmRpc2FibGVkKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkcyBoYW5kbGVzIHRvIHRoZSBlYWNoIGdyb3VwIG9mIGNvbnRyb2xzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBhZGRCaW5kaW5nczogZnVuY3Rpb24gYWRkQmluZGluZ3MoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5iaW5kKHRoaXMuX2NbaV0uY2hpbGRyZW4pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGhhbmRsZXMgZnJvbSB0aGUgZWFjaCBncm91cCBvZiBjb250cm9scy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlQmluZGluZ3M6IGZ1bmN0aW9uIHJlbW92ZUJpbmRpbmdzKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9jLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMudW5iaW5kKHRoaXMuX2NbaV0uY2hpbGRyZW4pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kcyBldmVudHMgdG8gYXJyb3dzIEhUTUwgZWxlbWVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hUTUxDb2xsZWN0aW9ufSBlbGVtZW50c1xuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYmluZDogZnVuY3Rpb24gYmluZChlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBCaW5kZXIub24oJ2NsaWNrJywgZWxlbWVudHNbaV0sIHRoaXMuY2xpY2spO1xuICAgICAgICBCaW5kZXIub24oJ3RvdWNoc3RhcnQnLCBlbGVtZW50c1tpXSwgdGhpcy5jbGljaywgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZHMgZXZlbnRzIGJpbmRlZCB0byB0aGUgYXJyb3dzIEhUTUwgZWxlbWVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hUTUxDb2xsZWN0aW9ufSBlbGVtZW50c1xuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgQmluZGVyLm9mZihbJ2NsaWNrJywgJ3RvdWNoc3RhcnQnXSwgZWxlbWVudHNbaV0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIGBjbGlja2AgZXZlbnQgb24gdGhlIGFycm93cyBIVE1MIGVsZW1lbnRzLlxuICAgICAqIE1vdmVzIHNsaWRlciBpbiBkaXJlY3Rpb24gZ2l2ZW4gdmlhIHRoZVxuICAgICAqIGBkYXRhLWdsaWRlLWRpcmAgYXR0cmlidXRlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBjbGljazogZnVuY3Rpb24gY2xpY2soZXZlbnQpIHtcbiAgICAgIGlmICghc3VwcG9ydHNQYXNzaXZlJDEgJiYgZXZlbnQudHlwZSA9PT0gJ3RvdWNoc3RhcnQnKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIHZhciBkaXJlY3Rpb24gPSBldmVudC5jdXJyZW50VGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1nbGlkZS1kaXInKTtcbiAgICAgIENvbXBvbmVudHMuUnVuLm1ha2UoQ29tcG9uZW50cy5EaXJlY3Rpb24ucmVzb2x2ZShkaXJlY3Rpb24pKTtcbiAgICB9XG4gIH07XG4gIGRlZmluZShDb250cm9scywgJ2l0ZW1zJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgY29sbGVjdGlvbiBvZiB0aGUgY29udHJvbHMgSFRNTCBlbGVtZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50W119XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gQ29udHJvbHMuX2M7XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIFN3YXAgYWN0aXZlIGNsYXNzIG9mIGN1cnJlbnQgbmF2aWdhdGlvbiBpdGVtOlxuICAgKiAtIGFmdGVyIG1vdW50aW5nIHRvIHNldCBpdCB0byBpbml0aWFsIGluZGV4XG4gICAqIC0gYWZ0ZXIgZWFjaCBtb3ZlIHRvIHRoZSBuZXcgaW5kZXhcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsnbW91bnQuYWZ0ZXInLCAnbW92ZS5hZnRlciddLCBmdW5jdGlvbiAoKSB7XG4gICAgQ29udHJvbHMuc2V0QWN0aXZlKCk7XG4gIH0pO1xuICAvKipcbiAgICogQWRkIG9yIHJlbW92ZSBkaXNhYmxlZCBjbGFzcyBvZiBhcnJvdyBlbGVtZW50c1xuICAgKi9cblxuICBFdmVudHMub24oWydtb3VudC5hZnRlcicsICdydW4nXSwgZnVuY3Rpb24gKCkge1xuICAgIENvbnRyb2xzLnNldEFycm93U3RhdGUoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBSZW1vdmUgYmluZGluZ3MgYW5kIEhUTUwgQ2xhc3NlczpcbiAgICogLSBvbiBkZXN0cm95aW5nLCB0byBicmluZyBtYXJrdXAgdG8gaXRzIGluaXRpYWwgc3RhdGVcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIENvbnRyb2xzLnJlbW92ZUJpbmRpbmdzKCk7XG4gICAgQ29udHJvbHMucmVtb3ZlQWN0aXZlKCk7XG4gICAgQmluZGVyLmRlc3Ryb3koKTtcbiAgfSk7XG4gIHJldHVybiBDb250cm9scztcbn1cblxuZnVuY3Rpb24gS2V5Ym9hcmQgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgLyoqXG4gICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAqXG4gICAqIEB0eXBlIHtFdmVudHNCaW5kZXJ9XG4gICAqL1xuICB2YXIgQmluZGVyID0gbmV3IEV2ZW50c0JpbmRlcigpO1xuICB2YXIgS2V5Ym9hcmQgPSB7XG4gICAgLyoqXG4gICAgICogQmluZHMga2V5Ym9hcmQgZXZlbnRzIG9uIGNvbXBvbmVudCBtb3VudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgaWYgKEdsaWRlLnNldHRpbmdzLmtleWJvYXJkKSB7XG4gICAgICAgIHRoaXMuYmluZCgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGtleWJvYXJkIHByZXNzIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAgIEJpbmRlci5vbigna2V5dXAnLCBkb2N1bWVudCwgdGhpcy5wcmVzcyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMga2V5Ym9hcmQgcHJlc3MgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICAgIEJpbmRlci5vZmYoJ2tleXVwJywgZG9jdW1lbnQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIGtleWJvYXJkJ3MgYXJyb3dzIHByZXNzIGFuZCBtb3ZpbmcgZ2xpZGUgZm93YXJkIGFuZCBiYWNrd2FyZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnRcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHByZXNzOiBmdW5jdGlvbiBwcmVzcyhldmVudCkge1xuICAgICAgdmFyIHBlclN3aXBlID0gR2xpZGUuc2V0dGluZ3MucGVyU3dpcGU7XG5cbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAzOSkge1xuICAgICAgICBDb21wb25lbnRzLlJ1bi5tYWtlKENvbXBvbmVudHMuRGlyZWN0aW9uLnJlc29sdmUoXCJcIi5jb25jYXQocGVyU3dpcGUsIFwiPlwiKSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzcpIHtcbiAgICAgICAgQ29tcG9uZW50cy5SdW4ubWFrZShDb21wb25lbnRzLkRpcmVjdGlvbi5yZXNvbHZlKFwiXCIuY29uY2F0KHBlclN3aXBlLCBcIjxcIikpKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBSZW1vdmUgYmluZGluZ3MgZnJvbSBrZXlib2FyZDpcbiAgICogLSBvbiBkZXN0cm95aW5nIHRvIHJlbW92ZSBhZGRlZCBldmVudHNcbiAgICogLSBvbiB1cGRhdGluZyB0byByZW1vdmUgZXZlbnRzIGJlZm9yZSByZW1vdW50aW5nXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ2Rlc3Ryb3knLCAndXBkYXRlJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBLZXlib2FyZC51bmJpbmQoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBSZW1vdW50IGNvbXBvbmVudFxuICAgKiAtIG9uIHVwZGF0aW5nIHRvIHJlZmxlY3QgcG90ZW50aWFsIGNoYW5nZXMgaW4gc2V0dGluZ3NcbiAgICovXG5cbiAgRXZlbnRzLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgS2V5Ym9hcmQubW91bnQoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBEZXN0cm95IGJpbmRlcjpcbiAgICogLSBvbiBkZXN0cm95aW5nIHRvIHJlbW92ZSBsaXN0ZW5lcnNcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIEJpbmRlci5kZXN0cm95KCk7XG4gIH0pO1xuICByZXR1cm4gS2V5Ym9hcmQ7XG59XG5cbmZ1bmN0aW9uIEF1dG9wbGF5IChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIC8qKlxuICAgKiBJbnN0YW5jZSBvZiB0aGUgYmluZGVyIGZvciBET00gRXZlbnRzLlxuICAgKlxuICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgKi9cbiAgdmFyIEJpbmRlciA9IG5ldyBFdmVudHNCaW5kZXIoKTtcbiAgdmFyIEF1dG9wbGF5ID0ge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIGF1dG9wbGF5aW5nIGFuZCBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIHRoaXMuZW5hYmxlKCk7XG4gICAgICB0aGlzLnN0YXJ0KCk7XG5cbiAgICAgIGlmIChHbGlkZS5zZXR0aW5ncy5ob3ZlcnBhdXNlKSB7XG4gICAgICAgIHRoaXMuYmluZCgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmFibGVzIGF1dG9wbGF5aW5nXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Vm9pZH1cbiAgICAgKi9cbiAgICBlbmFibGU6IGZ1bmN0aW9uIGVuYWJsZSgpIHtcbiAgICAgIHRoaXMuX2UgPSB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXNhYmxlcyBhdXRvcGxheWluZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtWb2lkfVxuICAgICAqL1xuICAgIGRpc2FibGU6IGZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gICAgICB0aGlzLl9lID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyBhdXRvcGxheWluZyBpbiBjb25maWd1cmVkIGludGVydmFsLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtCb29sZWFufE51bWJlcn0gZm9yY2UgUnVuIGF1dG9wbGF5aW5nIHdpdGggcGFzc2VkIGludGVydmFsIHJlZ2FyZGxlc3Mgb2YgYGF1dG9wbGF5YCBzZXR0aW5nc1xuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgaWYgKCF0aGlzLl9lKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbmFibGUoKTtcblxuICAgICAgaWYgKEdsaWRlLnNldHRpbmdzLmF1dG9wbGF5KSB7XG4gICAgICAgIGlmIChpc1VuZGVmaW5lZCh0aGlzLl9pKSkge1xuICAgICAgICAgIHRoaXMuX2kgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5zdG9wKCk7XG5cbiAgICAgICAgICAgIENvbXBvbmVudHMuUnVuLm1ha2UoJz4nKTtcblxuICAgICAgICAgICAgX3RoaXMuc3RhcnQoKTtcblxuICAgICAgICAgICAgRXZlbnRzLmVtaXQoJ2F1dG9wbGF5Jyk7XG4gICAgICAgICAgfSwgdGhpcy50aW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBhdXRvcnVubmluZyBvZiB0aGUgZ2xpZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHN0b3A6IGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICB0aGlzLl9pID0gY2xlYXJJbnRlcnZhbCh0aGlzLl9pKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgYXV0b3BsYXlpbmcgd2hpbGUgbW91c2UgaXMgb3ZlciBnbGlkZSdzIGFyZWEuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgQmluZGVyLm9uKCdtb3VzZW92ZXInLCBDb21wb25lbnRzLkh0bWwucm9vdCwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoX3RoaXMyLl9lKSB7XG4gICAgICAgICAgX3RoaXMyLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBCaW5kZXIub24oJ21vdXNlb3V0JywgQ29tcG9uZW50cy5IdG1sLnJvb3QsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKF90aGlzMi5fZSkge1xuICAgICAgICAgIF90aGlzMi5zdGFydCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kIG1vdXNlb3ZlciBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Vm9pZH1cbiAgICAgKi9cbiAgICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICAgIEJpbmRlci5vZmYoWydtb3VzZW92ZXInLCAnbW91c2VvdXQnXSwgQ29tcG9uZW50cy5IdG1sLnJvb3QpO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lKEF1dG9wbGF5LCAndGltZScsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHRpbWUgcGVyaW9kIHZhbHVlIGZvciB0aGUgYXV0b3BsYXkgaW50ZXJ2YWwuIFByaW9yaXRpemVzXG4gICAgICogdGltZXMgaW4gYGRhdGEtZ2xpZGUtYXV0b3BsYXlgIGF0dHJ1YnV0ZXMgb3ZlciBvcHRpb25zLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIGF1dG9wbGF5ID0gQ29tcG9uZW50cy5IdG1sLnNsaWRlc1tHbGlkZS5pbmRleF0uZ2V0QXR0cmlidXRlKCdkYXRhLWdsaWRlLWF1dG9wbGF5Jyk7XG5cbiAgICAgIGlmIChhdXRvcGxheSkge1xuICAgICAgICByZXR1cm4gdG9JbnQoYXV0b3BsYXkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdG9JbnQoR2xpZGUuc2V0dGluZ3MuYXV0b3BsYXkpO1xuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBTdG9wIGF1dG9wbGF5aW5nIGFuZCB1bmJpbmQgZXZlbnRzOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIGNsZWFyIGRlZmluZWQgaW50ZXJ2YWxcbiAgICogLSBvbiB1cGRhdGluZyB2aWEgQVBJIHRvIHJlc2V0IGludGVydmFsIHRoYXQgbWF5IGNoYW5nZWRcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsnZGVzdHJveScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgIEF1dG9wbGF5LnVuYmluZCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIFN0b3AgYXV0b3BsYXlpbmc6XG4gICAqIC0gYmVmb3JlIGVhY2ggcnVuLCB0byByZXN0YXJ0IGF1dG9wbGF5aW5nXG4gICAqIC0gb24gcGF1c2luZyB2aWEgQVBJXG4gICAqIC0gb24gZGVzdHJveWluZywgdG8gY2xlYXIgZGVmaW5lZCBpbnRlcnZhbFxuICAgKiAtIHdoaWxlIHN0YXJ0aW5nIGEgc3dpcGVcbiAgICogLSBvbiB1cGRhdGluZyB2aWEgQVBJIHRvIHJlc2V0IGludGVydmFsIHRoYXQgbWF5IGNoYW5nZWRcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsncnVuLmJlZm9yZScsICdzd2lwZS5zdGFydCcsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgIEF1dG9wbGF5LnN0b3AoKTtcbiAgfSk7XG4gIEV2ZW50cy5vbihbJ3BhdXNlJywgJ2Rlc3Ryb3knXSwgZnVuY3Rpb24gKCkge1xuICAgIEF1dG9wbGF5LmRpc2FibGUoKTtcbiAgICBBdXRvcGxheS5zdG9wKCk7XG4gIH0pO1xuICAvKipcbiAgICogU3RhcnQgYXV0b3BsYXlpbmc6XG4gICAqIC0gYWZ0ZXIgZWFjaCBydW4sIHRvIHJlc3RhcnQgYXV0b3BsYXlpbmdcbiAgICogLSBvbiBwbGF5aW5nIHZpYSBBUElcbiAgICogLSB3aGlsZSBlbmRpbmcgYSBzd2lwZVxuICAgKi9cblxuICBFdmVudHMub24oWydydW4uYWZ0ZXInLCAnc3dpcGUuZW5kJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBBdXRvcGxheS5zdGFydCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIFN0YXJ0IGF1dG9wbGF5aW5nOlxuICAgKiAtIGFmdGVyIGVhY2ggcnVuLCB0byByZXN0YXJ0IGF1dG9wbGF5aW5nXG4gICAqIC0gb24gcGxheWluZyB2aWEgQVBJXG4gICAqIC0gd2hpbGUgZW5kaW5nIGEgc3dpcGVcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsncGxheSddLCBmdW5jdGlvbiAoKSB7XG4gICAgQXV0b3BsYXkuZW5hYmxlKCk7XG4gICAgQXV0b3BsYXkuc3RhcnQoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBSZW1vdW50IGF1dG9wbGF5aW5nOlxuICAgKiAtIG9uIHVwZGF0aW5nIHZpYSBBUEkgdG8gcmVzZXQgaW50ZXJ2YWwgdGhhdCBtYXkgY2hhbmdlZFxuICAgKi9cblxuICBFdmVudHMub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBBdXRvcGxheS5tb3VudCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIERlc3Ryb3kgYSBiaW5kZXI6XG4gICAqIC0gb24gZGVzdHJveWluZyBnbGlkZSBpbnN0YW5jZSB0byBjbGVhcnVwIGxpc3RlbmVyc1xuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgQmluZGVyLmRlc3Ryb3koKTtcbiAgfSk7XG4gIHJldHVybiBBdXRvcGxheTtcbn1cblxuLyoqXG4gKiBTb3J0cyBrZXlzIG9mIGJyZWFrcG9pbnQgb2JqZWN0IHNvIHRoZXkgd2lsbCBiZSBvcmRlcmVkIGZyb20gbG93ZXIgdG8gYmlnZ2VyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwb2ludHNcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gc29ydEJyZWFrcG9pbnRzKHBvaW50cykge1xuICBpZiAoaXNPYmplY3QocG9pbnRzKSkge1xuICAgIHJldHVybiBzb3J0S2V5cyhwb2ludHMpO1xuICB9IGVsc2Uge1xuICAgIHdhcm4oXCJCcmVha3BvaW50cyBvcHRpb24gbXVzdCBiZSBhbiBvYmplY3RcIik7XG4gIH1cblxuICByZXR1cm4ge307XG59XG5cbmZ1bmN0aW9uIEJyZWFrcG9pbnRzIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIC8qKlxuICAgKiBJbnN0YW5jZSBvZiB0aGUgYmluZGVyIGZvciBET00gRXZlbnRzLlxuICAgKlxuICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgKi9cbiAgdmFyIEJpbmRlciA9IG5ldyBFdmVudHNCaW5kZXIoKTtcbiAgLyoqXG4gICAqIEhvbGRzIHJlZmVyZW5jZSB0byBzZXR0aW5ncy5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG5cbiAgdmFyIHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3M7XG4gIC8qKlxuICAgKiBIb2xkcyByZWZlcmVuY2UgdG8gYnJlYWtwb2ludHMgb2JqZWN0IGluIHNldHRpbmdzLiBTb3J0cyBicmVha3BvaW50c1xuICAgKiBmcm9tIHNtYWxsZXIgdG8gbGFyZ2VyLiBJdCBpcyByZXF1aXJlZCBpbiBvcmRlciB0byBwcm9wZXJcbiAgICogbWF0Y2hpbmcgY3VycmVudGx5IGFjdGl2ZSBicmVha3BvaW50IHNldHRpbmdzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICB2YXIgcG9pbnRzID0gc29ydEJyZWFrcG9pbnRzKHNldHRpbmdzLmJyZWFrcG9pbnRzKTtcbiAgLyoqXG4gICAqIENhY2hlIGluaXRpYWwgc2V0dGluZ3MgYmVmb3JlIG92ZXJ3cml0dGluZy5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG5cbiAgdmFyIGRlZmF1bHRzID0gT2JqZWN0LmFzc2lnbih7fSwgc2V0dGluZ3MpO1xuICB2YXIgQnJlYWtwb2ludHMgPSB7XG4gICAgLyoqXG4gICAgICogTWF0Y2hlcyBzZXR0aW5ncyBmb3IgY3VycmVjdGx5IG1hdGNoaW5nIG1lZGlhIGJyZWFrcG9pbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcG9pbnRzXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBtYXRjaDogZnVuY3Rpb24gbWF0Y2gocG9pbnRzKSB7XG4gICAgICBpZiAodHlwZW9mIHdpbmRvdy5tYXRjaE1lZGlhICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBmb3IgKHZhciBwb2ludCBpbiBwb2ludHMpIHtcbiAgICAgICAgICBpZiAocG9pbnRzLmhhc093blByb3BlcnR5KHBvaW50KSkge1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKFwiKG1heC13aWR0aDogXCIuY29uY2F0KHBvaW50LCBcInB4KVwiKSkubWF0Y2hlcykge1xuICAgICAgICAgICAgICByZXR1cm4gcG9pbnRzW3BvaW50XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmF1bHRzO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIE92ZXJ3cml0ZSBpbnN0YW5jZSBzZXR0aW5ncyB3aXRoIGN1cnJlbnRseSBtYXRjaGluZyBicmVha3BvaW50IHNldHRpbmdzLlxuICAgKiBUaGlzIGhhcHBlbnMgcmlnaHQgYWZ0ZXIgY29tcG9uZW50IGluaXRpYWxpemF0aW9uLlxuICAgKi9cblxuICBPYmplY3QuYXNzaWduKHNldHRpbmdzLCBCcmVha3BvaW50cy5tYXRjaChwb2ludHMpKTtcbiAgLyoqXG4gICAqIFVwZGF0ZSBnbGlkZSB3aXRoIHNldHRpbmdzIG9mIG1hdGNoZWQgYnJla3BvaW50OlxuICAgKiAtIHdpbmRvdyByZXNpemUgdG8gdXBkYXRlIHNsaWRlclxuICAgKi9cblxuICBCaW5kZXIub24oJ3Jlc2l6ZScsIHdpbmRvdywgdGhyb3R0bGUoZnVuY3Rpb24gKCkge1xuICAgIEdsaWRlLnNldHRpbmdzID0gbWVyZ2VPcHRpb25zKHNldHRpbmdzLCBCcmVha3BvaW50cy5tYXRjaChwb2ludHMpKTtcbiAgfSwgR2xpZGUuc2V0dGluZ3MudGhyb3R0bGUpKTtcbiAgLyoqXG4gICAqIFJlc29ydCBhbmQgdXBkYXRlIGRlZmF1bHQgc2V0dGluZ3M6XG4gICAqIC0gb24gcmVpbml0IHZpYSBBUEksIHNvIGJyZWFrcG9pbnQgbWF0Y2hpbmcgd2lsbCBiZSBwZXJmb3JtZWQgd2l0aCBvcHRpb25zXG4gICAqL1xuXG4gIEV2ZW50cy5vbigndXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgIHBvaW50cyA9IHNvcnRCcmVha3BvaW50cyhwb2ludHMpO1xuICAgIGRlZmF1bHRzID0gT2JqZWN0LmFzc2lnbih7fSwgc2V0dGluZ3MpO1xuICB9KTtcbiAgLyoqXG4gICAqIFVuYmluZCByZXNpemUgbGlzdGVuZXI6XG4gICAqIC0gb24gZGVzdHJveWluZywgdG8gYnJpbmcgbWFya3VwIHRvIGl0cyBpbml0aWFsIHN0YXRlXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBCaW5kZXIub2ZmKCdyZXNpemUnLCB3aW5kb3cpO1xuICB9KTtcbiAgcmV0dXJuIEJyZWFrcG9pbnRzO1xufVxuXG52YXIgQ09NUE9ORU5UUyA9IHtcbiAgLy8gUmVxdWlyZWRcbiAgSHRtbDogSHRtbCxcbiAgVHJhbnNsYXRlOiBUcmFuc2xhdGUsXG4gIFRyYW5zaXRpb246IFRyYW5zaXRpb24sXG4gIERpcmVjdGlvbjogRGlyZWN0aW9uLFxuICBQZWVrOiBQZWVrLFxuICBTaXplczogU2l6ZXMsXG4gIEdhcHM6IEdhcHMsXG4gIE1vdmU6IE1vdmUsXG4gIENsb25lczogQ2xvbmVzLFxuICBSZXNpemU6IFJlc2l6ZSxcbiAgQnVpbGQ6IEJ1aWxkLFxuICBSdW46IFJ1bixcbiAgLy8gT3B0aW9uYWxcbiAgU3dpcGU6IFN3aXBlLFxuICBJbWFnZXM6IEltYWdlcyxcbiAgQW5jaG9yczogQW5jaG9ycyxcbiAgQ29udHJvbHM6IENvbnRyb2xzLFxuICBLZXlib2FyZDogS2V5Ym9hcmQsXG4gIEF1dG9wbGF5OiBBdXRvcGxheSxcbiAgQnJlYWtwb2ludHM6IEJyZWFrcG9pbnRzXG59O1xuXG52YXIgR2xpZGUgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKF9Db3JlKSB7XG4gIF9pbmhlcml0cyhHbGlkZSwgX0NvcmUpO1xuXG4gIHZhciBfc3VwZXIgPSBfY3JlYXRlU3VwZXIoR2xpZGUpO1xuXG4gIGZ1bmN0aW9uIEdsaWRlKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBHbGlkZSk7XG5cbiAgICByZXR1cm4gX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoR2xpZGUsIFt7XG4gICAga2V5OiBcIm1vdW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgdmFyIGV4dGVuc2lvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgICAgcmV0dXJuIF9nZXQoX2dldFByb3RvdHlwZU9mKEdsaWRlLnByb3RvdHlwZSksIFwibW91bnRcIiwgdGhpcykuY2FsbCh0aGlzLCBPYmplY3QuYXNzaWduKHt9LCBDT01QT05FTlRTLCBleHRlbnNpb25zKSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEdsaWRlO1xufShHbGlkZSQxKTtcblxuZXhwb3J0IHsgR2xpZGUgYXMgZGVmYXVsdCB9O1xuIiwiY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoJ3N5bmMtcCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2hlY2tFeGl0IChjYiwgY29uZmlnID0ge30pIHtcbiAgY29uc3QgY2FsbGJhY2sgPSBjYiB8fCBmdW5jdGlvbiAoKSB7fVxuICBjb25zdCBzZW5zaXRpdml0eSA9IGNvbmZpZy5zZW5zaXRpdml0eSB8fCAyMFxuICBjb25zdCB0aW1lciA9IGNvbmZpZy50aW1lciB8fCAxMDAwXG4gIGNvbnN0IGRlbGF5ID0gY29uZmlnLmRlbGF5IHx8IDBcbiAgY29uc3Qgdmlld3BvcnQgPSBjb25maWcudmlld3BvcnQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG4gIGNvbnN0IGRlYnVnID0gY29uZmlnLmRlYnVnIHx8IGZhbHNlXG5cbiAgbGV0IGRlbGF5VGltZXJcbiAgbGV0IGxpc3RlbmVyVGltZW91dFxuICBsZXQgZGlzYWJsZUtleWRvd24gPSBmYWxzZVxuICBsZXQgYXR0YWNoZWRMaXN0ZW5lcnMgPSBmYWxzZVxuXG4gIGZ1bmN0aW9uIGluaXQgKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmIChkZWJ1ZykgY29uc29sZS5sb2coJ2NoZWNrRXhpdCAtIEluaXQnKVxuICAgICAgbGlzdGVuZXJUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGF0dGFjaEV2ZW50TGlzdGVuZXJzKClcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9LCB0aW1lcilcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gY2xlYW51cCAoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnY2hlY2tFeGl0IC0gQ2xlYW51cCcpXG4gICAgICBjbGVhclRpbWVvdXQobGlzdGVuZXJUaW1lb3V0KVxuICAgICAgaWYgKGF0dGFjaGVkTGlzdGVuZXJzKSB7XG4gICAgICAgIHZpZXdwb3J0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBoYW5kbGVNb3VzZWxlYXZlKVxuICAgICAgICB2aWV3cG9ydC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgaGFuZGxlTW91c2VlbnRlcilcbiAgICAgICAgdmlld3BvcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUtleWRvd24pXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZSgpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcmUgKCkge1xuICAgIGlmIChkZWJ1ZykgY29uc29sZS5sb2coJ2NoZWNrRXhpdCAtIEZpcmUnKVxuICAgIGNhbGxiYWNrKClcbiAgICBjbGVhbnVwKClcbiAgfVxuXG4gIGZ1bmN0aW9uIGF0dGFjaEV2ZW50TGlzdGVuZXJzICgpIHtcbiAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKCdjaGVja0V4aXQgLSBBdHRhY2hlZCBsaXN0ZW5lcnMnKVxuICAgIHZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBoYW5kbGVNb3VzZWxlYXZlKVxuICAgIHZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBoYW5kbGVNb3VzZWVudGVyKVxuICAgIHZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICAgIGF0dGFjaGVkTGlzdGVuZXJzID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTW91c2VsZWF2ZSAoZSkge1xuICAgIGlmIChlLmNsaWVudFkgPiBzZW5zaXRpdml0eSkgcmV0dXJuXG4gICAgZGVsYXlUaW1lciA9IHNldFRpbWVvdXQoZmlyZSwgZGVsYXkpXG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVNb3VzZWVudGVyICgpIHtcbiAgICBpZiAoIWRlbGF5VGltZXIpIHJldHVyblxuICAgIGNsZWFyVGltZW91dChkZWxheVRpbWVyKVxuICAgIGRlbGF5VGltZXIgPSBudWxsXG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVLZXlkb3duIChlKSB7XG4gICAgaWYgKGRpc2FibGVLZXlkb3duIHx8ICFlLm1ldGFLZXkgfHwgZS5rZXlDb2RlICE9PSA3NikgcmV0dXJuXG4gICAgZGlzYWJsZUtleWRvd24gPSB0cnVlXG4gICAgZGVsYXlUaW1lciA9IHNldFRpbWVvdXQoZmlyZSwgZGVsYXkpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIGluaXQsXG4gICAgY2xlYW51cFxuICB9XG59XG4iLCJjb25zdCBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNoZWNrSW5hY3Rpdml0eSAoZGVsYXksIGNiKSB7XG4gIGNvbnN0IHsgc2V0VGltZW91dCwgY2xlYXJUaW1lb3V0IH0gPSB3aW5kb3dcbiAgbGV0IHRpbWVyXG4gIGNvbnN0IGV2ZW50cyA9IFsndG91Y2hzdGFydCcsICdjbGljaycsICdzY3JvbGwnLCAna2V5dXAnLCAna2V5cHJlc3MnLCAnbW91c2Vtb3ZlJ11cblxuICByZXNldFRpbWVyKClcblxuICBldmVudHMuZm9yRWFjaChldmVudCA9PiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgXy5kZWJvdW5jZShyZXNldFRpbWVyLCA1MDApKSlcblxuICBmdW5jdGlvbiByZXNldFRpbWVyICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZpcmUsIGRlbGF5ICogMTAwMClcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpcmUgKCkge1xuICAgIGRpc3Bvc2UoKVxuICAgIGNiKClcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpc3Bvc2UgKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcilcbiAgICBldmVudHMuZm9yRWFjaChldmVudCA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgcmVzZXRUaW1lcikpXG4gIH1cblxuICByZXR1cm4gZGlzcG9zZVxufVxuIiwiY29uc3QgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcbmNvbnN0IG9uY2UgPSByZXF1aXJlKCcuLi9saWIvb25jZScpXG5jb25zdCB3aXRoUmVzdG9yZUFsbCA9IHJlcXVpcmUoJy4uL2xpYi93aXRoUmVzdG9yZUFsbCcpXG5jb25zdCBwcm9taXNlZCA9IHJlcXVpcmUoJy4uL2xpYi9wcm9taXNlZCcpXG5jb25zdCBub29wID0gKCkgPT4ge31cblxuZnVuY3Rpb24gb25FdmVudCAoZWwsIHR5cGUsIGZuKSB7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZm4pXG4gIHJldHVybiBvbmNlKCgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZm4pKVxufVxuXG5mdW5jdGlvbiBzdHlsZSAoZWwsIGNzcywgZm4pIHtcbiAgY29uc3Qgb3JpZ2luYWxTdHlsZSA9IGVsLmdldEF0dHJpYnV0ZSgnc3R5bGUnKVxuICBjb25zdCBuZXdTdHlsZSA9IHR5cGVvZiBjc3MgPT09ICdzdHJpbmcnID8gZnJvbVN0eWxlKGNzcykgOiBjc3NcbiAgY29uc3QgbWVyZ2VkID0ge1xuICAgIC4uLmZyb21TdHlsZShvcmlnaW5hbFN0eWxlKSxcbiAgICAuLi5uZXdTdHlsZVxuICB9XG4gIGVsLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCB0b1N0eWxlKG1lcmdlZCkpXG4gIHJldHVybiBvbmNlKCgpID0+IGVsLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBvcmlnaW5hbFN0eWxlKSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0eWxlIChzdHlsZSkge1xuICBpZiAoIXN0eWxlKSBzdHlsZSA9ICcnXG4gIHJldHVybiBzdHlsZS5zcGxpdCgnOycpLnJlZHVjZSgobWVtbywgdmFsKSA9PiB7XG4gICAgaWYgKCF2YWwpIHJldHVybiBtZW1vXG4gICAgY29uc3QgW2tleSwgLi4udmFsdWVdID0gdmFsLnNwbGl0KCc6JylcbiAgICBtZW1vW2tleV0gPSB2YWx1ZS5qb2luKCc6JylcbiAgICByZXR1cm4gbWVtb1xuICB9LCB7fSlcbn1cblxuZnVuY3Rpb24gdG9TdHlsZSAoY3NzKSB7XG4gIHJldHVybiBfLmtleXMoY3NzKS5yZWR1Y2UoKG1lbW8sIGtleSkgPT4ge1xuICAgIHJldHVybiBtZW1vICsgYCR7a2ViYWIoa2V5KX06JHtjc3Nba2V5XX07YFxuICB9LCAnJylcbn1cblxuZnVuY3Rpb24ga2ViYWIgKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbQS1aXSkvZywgJy0kMScpLnRvTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gaXNJblZpZXdQb3J0IChlbCkge1xuICBpZiAoZWwgJiYgZWwucGFyZW50RWxlbWVudCkge1xuICAgIGNvbnN0IHsgdG9wLCBib3R0b20gfSA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgaXNBYm92ZVdpbmRvd3NCb3R0b20gPVxuICAgICAgdG9wID09PSBib3R0b21cbiAgICAgICAgPyAvLyBJZiBib3RoIGJvdHRvbSBhbmQgdG9wIGFyZSBhdCB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgICAvLyB0aGUgZWxlbWVudCBpcyBlbnRpcmVseSBpbnNpZGUgdGhlIHZpZXdwb3J0XG4gICAgICAgICAgdG9wIDw9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICA6IC8vIElmIHRoZSBlbGVtZW50IGhhcyBoZWlnaHQsIHdoZW4gdG9wIGlzIGF0IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAgIC8vIHRoZSBlbGVtZW50IGlzIGJlbG93IHRoZSB3aW5kb3dcbiAgICAgICAgICB0b3AgPCB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICBjb25zdCBpc0JlbG93V2luZG93c1RvcCA9XG4gICAgICB0b3AgPT09IGJvdHRvbVxuICAgICAgICA/IC8vIElmIGJvdGggYm90dG9tIGFuZCB0b3AgYXJlIGF0IDBweFxuICAgICAgICAgIC8vIHRoZSBlbGVtZW50IGlzIGVudGlyZWx5IGluc2lkZSB0aGUgdmlld3BvcnRcbiAgICAgICAgICBib3R0b20gPj0gMFxuICAgICAgICA6IC8vIElmIHRoZSBlbGVtZW50IGhhcyBoZWlnaHQsIHdoZW4gYm90dG9tIGlzIGF0IDBweFxuICAgICAgICAgIC8vIHRoZSBlbGVtZW50IGlzIGFib3ZlIHRoZSB3aW5kb3dcbiAgICAgICAgICBib3R0b20gPiAwXG4gICAgcmV0dXJuIGlzQWJvdmVXaW5kb3dzQm90dG9tICYmIGlzQmVsb3dXaW5kb3dzVG9wXG4gIH1cbn1cblxuZnVuY3Rpb24gb25BbnlFbnRlclZpZXdwb3J0IChlbHMsIGZuKSB7XG4gIGNvbnN0IGRpc3Bvc2FibGVzID0gW11cbiAgXy5lYWNoKGVscywgZWwgPT4gZGlzcG9zYWJsZXMucHVzaChvbkVudGVyVmlld3BvcnQoZWwsIGZuKSkpXG4gIHJldHVybiBvbmNlKCgpID0+IHtcbiAgICB3aGlsZSAoZGlzcG9zYWJsZXMubGVuZ3RoKSBkaXNwb3NhYmxlcy5wb3AoKSgpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIG9uRW50ZXJWaWV3cG9ydCAoZWwsIGZuLCBzY3JvbGxUYXJnZXRFbCA9IHdpbmRvdykge1xuICBpZiAoXy5pc0FycmF5KGVsKSkge1xuICAgIHJldHVybiBvbkFueUVudGVyVmlld3BvcnQoZWwsIGZuKVxuICB9XG5cbiAgaWYgKGlzSW5WaWV3UG9ydChlbCkpIHtcbiAgICBmbigpXG4gICAgcmV0dXJuIG5vb3BcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZVNjcm9sbCA9IF8uZGVib3VuY2UoKCkgPT4ge1xuICAgIGlmIChpc0luVmlld1BvcnQoZWwpKSB7XG4gICAgICBzY3JvbGxUYXJnZXRFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBoYW5kbGVTY3JvbGwpXG4gICAgICBmbigpXG4gICAgfVxuICB9LCA1MClcbiAgc2Nyb2xsVGFyZ2V0RWwuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgaGFuZGxlU2Nyb2xsKVxuICByZXR1cm4gb25jZSgoKSA9PiBzY3JvbGxUYXJnZXRFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBoYW5kbGVTY3JvbGwpKVxufVxuXG5mdW5jdGlvbiByZXBsYWNlICh0YXJnZXQsIGVsKSB7XG4gIGNvbnN0IHBhcmVudCA9IHRhcmdldC5wYXJlbnRFbGVtZW50XG4gIHBhcmVudC5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5uZXh0U2libGluZylcbiAgcGFyZW50LnJlbW92ZUNoaWxkKHRhcmdldClcbiAgcmV0dXJuIG9uY2UoKCkgPT4gcmVwbGFjZShlbCwgdGFyZ2V0KSlcbn1cblxuZnVuY3Rpb24gaW5zZXJ0QWZ0ZXIgKHRhcmdldCwgZWwpIHtcbiAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnRcbiAgcGFyZW50Lmluc2VydEJlZm9yZShlbCwgdGFyZ2V0Lm5leHRTaWJsaW5nKVxuICByZXR1cm4gb25jZSgoKSA9PiBwYXJlbnQucmVtb3ZlQ2hpbGQoZWwpKVxufVxuXG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUgKHRhcmdldCwgZWwpIHtcbiAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnRcbiAgcGFyZW50Lmluc2VydEJlZm9yZShlbCwgdGFyZ2V0KVxuICByZXR1cm4gb25jZSgoKSA9PiBwYXJlbnQucmVtb3ZlQ2hpbGQoZWwpKVxufVxuXG5mdW5jdGlvbiBhcHBlbmRDaGlsZCAodGFyZ2V0LCBlbCkge1xuICB0YXJnZXQuYXBwZW5kQ2hpbGQoZWwpXG4gIHJldHVybiBvbmNlKCgpID0+IHRhcmdldC5yZW1vdmVDaGlsZChlbCkpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICBjb25zdCB1dGlscyA9IHdpdGhSZXN0b3JlQWxsKHtcbiAgICBvbkV2ZW50LFxuICAgIG9uRW50ZXJWaWV3cG9ydCxcbiAgICByZXBsYWNlLFxuICAgIHN0eWxlLFxuICAgIGluc2VydEFmdGVyLFxuICAgIGluc2VydEJlZm9yZSxcbiAgICBhcHBlbmRDaGlsZCxcbiAgICBjbG9zZXN0XG4gIH0pXG5cbiAgXy5lYWNoKF8ua2V5cyh1dGlscyksIGtleSA9PiB7XG4gICAgaWYgKGtleS5pbmRleE9mKCdvbicpID09PSAwKSB1dGlsc1trZXldID0gcHJvbWlzZWQodXRpbHNba2V5XSlcbiAgfSlcblxuICByZXR1cm4gdXRpbHNcbn1cblxuZnVuY3Rpb24gY2xvc2VzdCAoZWxlbWVudCwgc2VsZWN0b3IpIHtcbiAgaWYgKHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XG4gICAgcmV0dXJuIHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0LmNhbGwoZWxlbWVudCwgc2VsZWN0b3IpXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzIHx8XG4gICAgICB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgIHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3JcblxuICAgIGxldCBlbCA9IGVsZW1lbnRcblxuICAgIGRvIHtcbiAgICAgIGlmIChtYXRjaGVzLmNhbGwoZWwsIHNlbGVjdG9yKSkgcmV0dXJuIGVsXG4gICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQgfHwgZWwucGFyZW50Tm9kZVxuICAgIH0gd2hpbGUgKGVsICE9PSBudWxsICYmIGVsLm5vZGVUeXBlID09PSAxKVxuICAgIHJldHVybiBudWxsXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gb25jZSAoZm4pIHtcbiAgbGV0IGNhbGxlZCA9IGZhbHNlXG4gIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgIGlmIChjYWxsZWQpIHJldHVyblxuICAgIGNhbGxlZCA9IHRydWVcbiAgICByZXR1cm4gZm4oLi4uYXJncylcbiAgfVxufVxuIiwiY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoJ3N5bmMtcCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcHJvbWlzZWQgKGZuKSB7XG4gIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgIGlmICh0eXBlb2YgYXJnc1thcmdzLmxlbmd0aCAtIDFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZm4oLi4uYXJncylcbiAgICB9XG4gICAgbGV0IGRpc3Bvc2VcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBhcmdzLnB1c2gocmVzb2x2ZSlcbiAgICAgIGRpc3Bvc2UgPSBmbiguLi5hcmdzKVxuICAgIH0pLnRoZW4odmFsdWUgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBkaXNwb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRpc3Bvc2UoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfSlcbiAgfVxufVxuIiwiY29uc3QgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB3aXRoUmVzdG9yZUFsbCAodXRpbHMpIHtcbiAgY29uc3QgY2xlYW51cCA9IFtdXG5cbiAgZnVuY3Rpb24gcmVzdG9yYWJsZSAoZm4pIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgIGNvbnN0IGRpc3Bvc2UgPSBmbiguLi5hcmdzKVxuICAgICAgaWYgKHR5cGVvZiBkaXNwb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNsZWFudXAucHVzaChkaXNwb3NlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGRpc3Bvc2VcbiAgICB9XG4gIH1cbiAgY29uc3QgcmVzdWx0ID0ge31cblxuICBmb3IgKGNvbnN0IGtleSBvZiBfLmtleXModXRpbHMpKSB7XG4gICAgcmVzdWx0W2tleV0gPSByZXN0b3JhYmxlKHV0aWxzW2tleV0pXG4gIH1cblxuICByZXN1bHQucmVzdG9yZUFsbCA9IGZ1bmN0aW9uIHJlc3RvcmVBbGwgKCkge1xuICAgIHdoaWxlIChjbGVhbnVwLmxlbmd0aCkgY2xlYW51cC5wb3AoKSgpXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG4iLCJ2YXIgbixsLHUsaSx0LG8scixmLGU9e30sYz1bXSxzPS9hY2l0fGV4KD86c3xnfG58cHwkKXxycGh8Z3JpZHxvd3N8bW5jfG50d3xpbmVbY2hdfHpvb3xeb3JkfGl0ZXJhL2k7ZnVuY3Rpb24gYShuLGwpe2Zvcih2YXIgdSBpbiBsKW5bdV09bFt1XTtyZXR1cm4gbn1mdW5jdGlvbiBoKG4pe3ZhciBsPW4ucGFyZW50Tm9kZTtsJiZsLnJlbW92ZUNoaWxkKG4pfWZ1bmN0aW9uIHYobCx1LGkpe3ZhciB0LG8scixmPXt9O2ZvcihyIGluIHUpXCJrZXlcIj09cj90PXVbcl06XCJyZWZcIj09cj9vPXVbcl06ZltyXT11W3JdO2lmKGFyZ3VtZW50cy5sZW5ndGg+MiYmKGYuY2hpbGRyZW49YXJndW1lbnRzLmxlbmd0aD4zP24uY2FsbChhcmd1bWVudHMsMik6aSksXCJmdW5jdGlvblwiPT10eXBlb2YgbCYmbnVsbCE9bC5kZWZhdWx0UHJvcHMpZm9yKHIgaW4gbC5kZWZhdWx0UHJvcHMpdm9pZCAwPT09ZltyXSYmKGZbcl09bC5kZWZhdWx0UHJvcHNbcl0pO3JldHVybiB5KGwsZix0LG8sbnVsbCl9ZnVuY3Rpb24geShuLGksdCxvLHIpe3ZhciBmPXt0eXBlOm4scHJvcHM6aSxrZXk6dCxyZWY6byxfX2s6bnVsbCxfXzpudWxsLF9fYjowLF9fZTpudWxsLF9fZDp2b2lkIDAsX19jOm51bGwsX19oOm51bGwsY29uc3RydWN0b3I6dm9pZCAwLF9fdjpudWxsPT1yPysrdTpyfTtyZXR1cm4gbnVsbD09ciYmbnVsbCE9bC52bm9kZSYmbC52bm9kZShmKSxmfWZ1bmN0aW9uIHAoKXtyZXR1cm57Y3VycmVudDpudWxsfX1mdW5jdGlvbiBkKG4pe3JldHVybiBuLmNoaWxkcmVufWZ1bmN0aW9uIF8obixsKXt0aGlzLnByb3BzPW4sdGhpcy5jb250ZXh0PWx9ZnVuY3Rpb24gayhuLGwpe2lmKG51bGw9PWwpcmV0dXJuIG4uX18/ayhuLl9fLG4uX18uX19rLmluZGV4T2YobikrMSk6bnVsbDtmb3IodmFyIHU7bDxuLl9fay5sZW5ndGg7bCsrKWlmKG51bGwhPSh1PW4uX19rW2xdKSYmbnVsbCE9dS5fX2UpcmV0dXJuIHUuX19lO3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIG4udHlwZT9rKG4pOm51bGx9ZnVuY3Rpb24gYihuKXt2YXIgbCx1O2lmKG51bGwhPShuPW4uX18pJiZudWxsIT1uLl9fYyl7Zm9yKG4uX19lPW4uX19jLmJhc2U9bnVsbCxsPTA7bDxuLl9fay5sZW5ndGg7bCsrKWlmKG51bGwhPSh1PW4uX19rW2xdKSYmbnVsbCE9dS5fX2Upe24uX19lPW4uX19jLmJhc2U9dS5fX2U7YnJlYWt9cmV0dXJuIGIobil9fWZ1bmN0aW9uIG0obil7KCFuLl9fZCYmKG4uX19kPSEwKSYmdC5wdXNoKG4pJiYhZy5fX3IrK3x8ciE9PWwuZGVib3VuY2VSZW5kZXJpbmcpJiYoKHI9bC5kZWJvdW5jZVJlbmRlcmluZyl8fG8pKGcpfWZ1bmN0aW9uIGcoKXtmb3IodmFyIG47Zy5fX3I9dC5sZW5ndGg7KW49dC5zb3J0KGZ1bmN0aW9uKG4sbCl7cmV0dXJuIG4uX192Ll9fYi1sLl9fdi5fX2J9KSx0PVtdLG4uc29tZShmdW5jdGlvbihuKXt2YXIgbCx1LGksdCxvLHI7bi5fX2QmJihvPSh0PShsPW4pLl9fdikuX19lLChyPWwuX19QKSYmKHU9W10sKGk9YSh7fSx0KSkuX192PXQuX192KzEsaihyLHQsaSxsLl9fbix2b2lkIDAhPT1yLm93bmVyU1ZHRWxlbWVudCxudWxsIT10Ll9faD9bb106bnVsbCx1LG51bGw9PW8/ayh0KTpvLHQuX19oKSx6KHUsdCksdC5fX2UhPW8mJmIodCkpKX0pfWZ1bmN0aW9uIHcobixsLHUsaSx0LG8scixmLHMsYSl7dmFyIGgsdixwLF8sYixtLGcsdz1pJiZpLl9fa3x8YyxBPXcubGVuZ3RoO2Zvcih1Ll9faz1bXSxoPTA7aDxsLmxlbmd0aDtoKyspaWYobnVsbCE9KF89dS5fX2tbaF09bnVsbD09KF89bFtoXSl8fFwiYm9vbGVhblwiPT10eXBlb2YgXz9udWxsOlwic3RyaW5nXCI9PXR5cGVvZiBffHxcIm51bWJlclwiPT10eXBlb2YgX3x8XCJiaWdpbnRcIj09dHlwZW9mIF8/eShudWxsLF8sbnVsbCxudWxsLF8pOkFycmF5LmlzQXJyYXkoXyk/eShkLHtjaGlsZHJlbjpffSxudWxsLG51bGwsbnVsbCk6Xy5fX2I+MD95KF8udHlwZSxfLnByb3BzLF8ua2V5LG51bGwsXy5fX3YpOl8pKXtpZihfLl9fPXUsXy5fX2I9dS5fX2IrMSxudWxsPT09KHA9d1toXSl8fHAmJl8ua2V5PT1wLmtleSYmXy50eXBlPT09cC50eXBlKXdbaF09dm9pZCAwO2Vsc2UgZm9yKHY9MDt2PEE7disrKXtpZigocD13W3ZdKSYmXy5rZXk9PXAua2V5JiZfLnR5cGU9PT1wLnR5cGUpe3dbdl09dm9pZCAwO2JyZWFrfXA9bnVsbH1qKG4sXyxwPXB8fGUsdCxvLHIsZixzLGEpLGI9Xy5fX2UsKHY9Xy5yZWYpJiZwLnJlZiE9diYmKGd8fChnPVtdKSxwLnJlZiYmZy5wdXNoKHAucmVmLG51bGwsXyksZy5wdXNoKHYsXy5fX2N8fGIsXykpLG51bGwhPWI/KG51bGw9PW0mJihtPWIpLFwiZnVuY3Rpb25cIj09dHlwZW9mIF8udHlwZSYmXy5fX2s9PT1wLl9faz9fLl9fZD1zPXgoXyxzLG4pOnM9UChuLF8scCx3LGIscyksXCJmdW5jdGlvblwiPT10eXBlb2YgdS50eXBlJiYodS5fX2Q9cykpOnMmJnAuX19lPT1zJiZzLnBhcmVudE5vZGUhPW4mJihzPWsocCkpfWZvcih1Ll9fZT1tLGg9QTtoLS07KW51bGwhPXdbaF0mJihcImZ1bmN0aW9uXCI9PXR5cGVvZiB1LnR5cGUmJm51bGwhPXdbaF0uX19lJiZ3W2hdLl9fZT09dS5fX2QmJih1Ll9fZD1rKGksaCsxKSksTih3W2hdLHdbaF0pKTtpZihnKWZvcihoPTA7aDxnLmxlbmd0aDtoKyspTShnW2hdLGdbKytoXSxnWysraF0pfWZ1bmN0aW9uIHgobixsLHUpe2Zvcih2YXIgaSx0PW4uX19rLG89MDt0JiZvPHQubGVuZ3RoO28rKykoaT10W29dKSYmKGkuX189bixsPVwiZnVuY3Rpb25cIj09dHlwZW9mIGkudHlwZT94KGksbCx1KTpQKHUsaSxpLHQsaS5fX2UsbCkpO3JldHVybiBsfWZ1bmN0aW9uIEEobixsKXtyZXR1cm4gbD1sfHxbXSxudWxsPT1ufHxcImJvb2xlYW5cIj09dHlwZW9mIG58fChBcnJheS5pc0FycmF5KG4pP24uc29tZShmdW5jdGlvbihuKXtBKG4sbCl9KTpsLnB1c2gobikpLGx9ZnVuY3Rpb24gUChuLGwsdSxpLHQsbyl7dmFyIHIsZixlO2lmKHZvaWQgMCE9PWwuX19kKXI9bC5fX2QsbC5fX2Q9dm9pZCAwO2Vsc2UgaWYobnVsbD09dXx8dCE9b3x8bnVsbD09dC5wYXJlbnROb2RlKW46aWYobnVsbD09b3x8by5wYXJlbnROb2RlIT09biluLmFwcGVuZENoaWxkKHQpLHI9bnVsbDtlbHNle2ZvcihmPW8sZT0wOyhmPWYubmV4dFNpYmxpbmcpJiZlPGkubGVuZ3RoO2UrPTIpaWYoZj09dClicmVhayBuO24uaW5zZXJ0QmVmb3JlKHQsbykscj1vfXJldHVybiB2b2lkIDAhPT1yP3I6dC5uZXh0U2libGluZ31mdW5jdGlvbiBDKG4sbCx1LGksdCl7dmFyIG87Zm9yKG8gaW4gdSlcImNoaWxkcmVuXCI9PT1vfHxcImtleVwiPT09b3x8byBpbiBsfHxIKG4sbyxudWxsLHVbb10saSk7Zm9yKG8gaW4gbCl0JiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBsW29dfHxcImNoaWxkcmVuXCI9PT1vfHxcImtleVwiPT09b3x8XCJ2YWx1ZVwiPT09b3x8XCJjaGVja2VkXCI9PT1vfHx1W29dPT09bFtvXXx8SChuLG8sbFtvXSx1W29dLGkpfWZ1bmN0aW9uICQobixsLHUpe1wiLVwiPT09bFswXT9uLnNldFByb3BlcnR5KGwsdSk6bltsXT1udWxsPT11P1wiXCI6XCJudW1iZXJcIiE9dHlwZW9mIHV8fHMudGVzdChsKT91OnUrXCJweFwifWZ1bmN0aW9uIEgobixsLHUsaSx0KXt2YXIgbztuOmlmKFwic3R5bGVcIj09PWwpaWYoXCJzdHJpbmdcIj09dHlwZW9mIHUpbi5zdHlsZS5jc3NUZXh0PXU7ZWxzZXtpZihcInN0cmluZ1wiPT10eXBlb2YgaSYmKG4uc3R5bGUuY3NzVGV4dD1pPVwiXCIpLGkpZm9yKGwgaW4gaSl1JiZsIGluIHV8fCQobi5zdHlsZSxsLFwiXCIpO2lmKHUpZm9yKGwgaW4gdSlpJiZ1W2xdPT09aVtsXXx8JChuLnN0eWxlLGwsdVtsXSl9ZWxzZSBpZihcIm9cIj09PWxbMF0mJlwiblwiPT09bFsxXSlvPWwhPT0obD1sLnJlcGxhY2UoL0NhcHR1cmUkLyxcIlwiKSksbD1sLnRvTG93ZXJDYXNlKClpbiBuP2wudG9Mb3dlckNhc2UoKS5zbGljZSgyKTpsLnNsaWNlKDIpLG4ubHx8KG4ubD17fSksbi5sW2wrb109dSx1P2l8fG4uYWRkRXZlbnRMaXN0ZW5lcihsLG8/VDpJLG8pOm4ucmVtb3ZlRXZlbnRMaXN0ZW5lcihsLG8/VDpJLG8pO2Vsc2UgaWYoXCJkYW5nZXJvdXNseVNldElubmVySFRNTFwiIT09bCl7aWYodClsPWwucmVwbGFjZSgveGxpbmsoSHw6aCkvLFwiaFwiKS5yZXBsYWNlKC9zTmFtZSQvLFwic1wiKTtlbHNlIGlmKFwiaHJlZlwiIT09bCYmXCJsaXN0XCIhPT1sJiZcImZvcm1cIiE9PWwmJlwidGFiSW5kZXhcIiE9PWwmJlwiZG93bmxvYWRcIiE9PWwmJmwgaW4gbil0cnl7bltsXT1udWxsPT11P1wiXCI6dTticmVhayBufWNhdGNoKG4pe31cImZ1bmN0aW9uXCI9PXR5cGVvZiB1fHwobnVsbCE9dSYmKCExIT09dXx8XCJhXCI9PT1sWzBdJiZcInJcIj09PWxbMV0pP24uc2V0QXR0cmlidXRlKGwsdSk6bi5yZW1vdmVBdHRyaWJ1dGUobCkpfX1mdW5jdGlvbiBJKG4pe3RoaXMubFtuLnR5cGUrITFdKGwuZXZlbnQ/bC5ldmVudChuKTpuKX1mdW5jdGlvbiBUKG4pe3RoaXMubFtuLnR5cGUrITBdKGwuZXZlbnQ/bC5ldmVudChuKTpuKX1mdW5jdGlvbiBqKG4sdSxpLHQsbyxyLGYsZSxjKXt2YXIgcyxoLHYseSxwLGssYixtLGcseCxBLFA9dS50eXBlO2lmKHZvaWQgMCE9PXUuY29uc3RydWN0b3IpcmV0dXJuIG51bGw7bnVsbCE9aS5fX2gmJihjPWkuX19oLGU9dS5fX2U9aS5fX2UsdS5fX2g9bnVsbCxyPVtlXSksKHM9bC5fX2IpJiZzKHUpO3RyeXtuOmlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFApe2lmKG09dS5wcm9wcyxnPShzPVAuY29udGV4dFR5cGUpJiZ0W3MuX19jXSx4PXM/Zz9nLnByb3BzLnZhbHVlOnMuX186dCxpLl9fYz9iPShoPXUuX19jPWkuX19jKS5fXz1oLl9fRTooXCJwcm90b3R5cGVcImluIFAmJlAucHJvdG90eXBlLnJlbmRlcj91Ll9fYz1oPW5ldyBQKG0seCk6KHUuX19jPWg9bmV3IF8obSx4KSxoLmNvbnN0cnVjdG9yPVAsaC5yZW5kZXI9TyksZyYmZy5zdWIoaCksaC5wcm9wcz1tLGguc3RhdGV8fChoLnN0YXRlPXt9KSxoLmNvbnRleHQ9eCxoLl9fbj10LHY9aC5fX2Q9ITAsaC5fX2g9W10pLG51bGw9PWguX19zJiYoaC5fX3M9aC5zdGF0ZSksbnVsbCE9UC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJihoLl9fcz09aC5zdGF0ZSYmKGguX19zPWEoe30saC5fX3MpKSxhKGguX19zLFAuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKG0saC5fX3MpKSkseT1oLnByb3BzLHA9aC5zdGF0ZSx2KW51bGw9PVAuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzJiZudWxsIT1oLmNvbXBvbmVudFdpbGxNb3VudCYmaC5jb21wb25lbnRXaWxsTW91bnQoKSxudWxsIT1oLmNvbXBvbmVudERpZE1vdW50JiZoLl9faC5wdXNoKGguY29tcG9uZW50RGlkTW91bnQpO2Vsc2V7aWYobnVsbD09UC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJm0hPT15JiZudWxsIT1oLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMmJmguY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhtLHgpLCFoLl9fZSYmbnVsbCE9aC5zaG91bGRDb21wb25lbnRVcGRhdGUmJiExPT09aC5zaG91bGRDb21wb25lbnRVcGRhdGUobSxoLl9fcyx4KXx8dS5fX3Y9PT1pLl9fdil7aC5wcm9wcz1tLGguc3RhdGU9aC5fX3MsdS5fX3YhPT1pLl9fdiYmKGguX19kPSExKSxoLl9fdj11LHUuX19lPWkuX19lLHUuX19rPWkuX19rLHUuX19rLmZvckVhY2goZnVuY3Rpb24obil7biYmKG4uX189dSl9KSxoLl9faC5sZW5ndGgmJmYucHVzaChoKTticmVhayBufW51bGwhPWguY29tcG9uZW50V2lsbFVwZGF0ZSYmaC5jb21wb25lbnRXaWxsVXBkYXRlKG0saC5fX3MseCksbnVsbCE9aC5jb21wb25lbnREaWRVcGRhdGUmJmguX19oLnB1c2goZnVuY3Rpb24oKXtoLmNvbXBvbmVudERpZFVwZGF0ZSh5LHAsayl9KX1oLmNvbnRleHQ9eCxoLnByb3BzPW0saC5zdGF0ZT1oLl9fcywocz1sLl9fcikmJnModSksaC5fX2Q9ITEsaC5fX3Y9dSxoLl9fUD1uLHM9aC5yZW5kZXIoaC5wcm9wcyxoLnN0YXRlLGguY29udGV4dCksaC5zdGF0ZT1oLl9fcyxudWxsIT1oLmdldENoaWxkQ29udGV4dCYmKHQ9YShhKHt9LHQpLGguZ2V0Q2hpbGRDb250ZXh0KCkpKSx2fHxudWxsPT1oLmdldFNuYXBzaG90QmVmb3JlVXBkYXRlfHwoaz1oLmdldFNuYXBzaG90QmVmb3JlVXBkYXRlKHkscCkpLEE9bnVsbCE9cyYmcy50eXBlPT09ZCYmbnVsbD09cy5rZXk/cy5wcm9wcy5jaGlsZHJlbjpzLHcobixBcnJheS5pc0FycmF5KEEpP0E6W0FdLHUsaSx0LG8scixmLGUsYyksaC5iYXNlPXUuX19lLHUuX19oPW51bGwsaC5fX2gubGVuZ3RoJiZmLnB1c2goaCksYiYmKGguX19FPWguX189bnVsbCksaC5fX2U9ITF9ZWxzZSBudWxsPT1yJiZ1Ll9fdj09PWkuX192Pyh1Ll9faz1pLl9fayx1Ll9fZT1pLl9fZSk6dS5fX2U9TChpLl9fZSx1LGksdCxvLHIsZixjKTsocz1sLmRpZmZlZCkmJnModSl9Y2F0Y2gobil7dS5fX3Y9bnVsbCwoY3x8bnVsbCE9cikmJih1Ll9fZT1lLHUuX19oPSEhYyxyW3IuaW5kZXhPZihlKV09bnVsbCksbC5fX2Uobix1LGkpfX1mdW5jdGlvbiB6KG4sdSl7bC5fX2MmJmwuX19jKHUsbiksbi5zb21lKGZ1bmN0aW9uKHUpe3RyeXtuPXUuX19oLHUuX19oPVtdLG4uc29tZShmdW5jdGlvbihuKXtuLmNhbGwodSl9KX1jYXRjaChuKXtsLl9fZShuLHUuX192KX19KX1mdW5jdGlvbiBMKGwsdSxpLHQsbyxyLGYsYyl7dmFyIHMsYSx2LHk9aS5wcm9wcyxwPXUucHJvcHMsZD11LnR5cGUsXz0wO2lmKFwic3ZnXCI9PT1kJiYobz0hMCksbnVsbCE9cilmb3IoO188ci5sZW5ndGg7XysrKWlmKChzPXJbX10pJiZcInNldEF0dHJpYnV0ZVwiaW4gcz09ISFkJiYoZD9zLmxvY2FsTmFtZT09PWQ6Mz09PXMubm9kZVR5cGUpKXtsPXMscltfXT1udWxsO2JyZWFrfWlmKG51bGw9PWwpe2lmKG51bGw9PT1kKXJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShwKTtsPW8/ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixkKTpkb2N1bWVudC5jcmVhdGVFbGVtZW50KGQscC5pcyYmcCkscj1udWxsLGM9ITF9aWYobnVsbD09PWQpeT09PXB8fGMmJmwuZGF0YT09PXB8fChsLmRhdGE9cCk7ZWxzZXtpZihyPXImJm4uY2FsbChsLmNoaWxkTm9kZXMpLGE9KHk9aS5wcm9wc3x8ZSkuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwsdj1wLmRhbmdlcm91c2x5U2V0SW5uZXJIVE1MLCFjKXtpZihudWxsIT1yKWZvcih5PXt9LF89MDtfPGwuYXR0cmlidXRlcy5sZW5ndGg7XysrKXlbbC5hdHRyaWJ1dGVzW19dLm5hbWVdPWwuYXR0cmlidXRlc1tfXS52YWx1ZTsodnx8YSkmJih2JiYoYSYmdi5fX2h0bWw9PWEuX19odG1sfHx2Ll9faHRtbD09PWwuaW5uZXJIVE1MKXx8KGwuaW5uZXJIVE1MPXYmJnYuX19odG1sfHxcIlwiKSl9aWYoQyhsLHAseSxvLGMpLHYpdS5fX2s9W107ZWxzZSBpZihfPXUucHJvcHMuY2hpbGRyZW4sdyhsLEFycmF5LmlzQXJyYXkoXyk/XzpbX10sdSxpLHQsbyYmXCJmb3JlaWduT2JqZWN0XCIhPT1kLHIsZixyP3JbMF06aS5fX2smJmsoaSwwKSxjKSxudWxsIT1yKWZvcihfPXIubGVuZ3RoO18tLTspbnVsbCE9cltfXSYmaChyW19dKTtjfHwoXCJ2YWx1ZVwiaW4gcCYmdm9pZCAwIT09KF89cC52YWx1ZSkmJihfIT09bC52YWx1ZXx8XCJwcm9ncmVzc1wiPT09ZCYmIV98fFwib3B0aW9uXCI9PT1kJiZfIT09eS52YWx1ZSkmJkgobCxcInZhbHVlXCIsXyx5LnZhbHVlLCExKSxcImNoZWNrZWRcImluIHAmJnZvaWQgMCE9PShfPXAuY2hlY2tlZCkmJl8hPT1sLmNoZWNrZWQmJkgobCxcImNoZWNrZWRcIixfLHkuY2hlY2tlZCwhMSkpfXJldHVybiBsfWZ1bmN0aW9uIE0obix1LGkpe3RyeXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBuP24odSk6bi5jdXJyZW50PXV9Y2F0Y2gobil7bC5fX2UobixpKX19ZnVuY3Rpb24gTihuLHUsaSl7dmFyIHQsbztpZihsLnVubW91bnQmJmwudW5tb3VudChuKSwodD1uLnJlZikmJih0LmN1cnJlbnQmJnQuY3VycmVudCE9PW4uX19lfHxNKHQsbnVsbCx1KSksbnVsbCE9KHQ9bi5fX2MpKXtpZih0LmNvbXBvbmVudFdpbGxVbm1vdW50KXRyeXt0LmNvbXBvbmVudFdpbGxVbm1vdW50KCl9Y2F0Y2gobil7bC5fX2Uobix1KX10LmJhc2U9dC5fX1A9bnVsbH1pZih0PW4uX19rKWZvcihvPTA7bzx0Lmxlbmd0aDtvKyspdFtvXSYmTih0W29dLHUsXCJmdW5jdGlvblwiIT10eXBlb2Ygbi50eXBlKTtpfHxudWxsPT1uLl9fZXx8aChuLl9fZSksbi5fX2U9bi5fX2Q9dm9pZCAwfWZ1bmN0aW9uIE8obixsLHUpe3JldHVybiB0aGlzLmNvbnN0cnVjdG9yKG4sdSl9ZnVuY3Rpb24gUyh1LGksdCl7dmFyIG8scixmO2wuX18mJmwuX18odSxpKSxyPShvPVwiZnVuY3Rpb25cIj09dHlwZW9mIHQpP251bGw6dCYmdC5fX2t8fGkuX19rLGY9W10saihpLHU9KCFvJiZ0fHxpKS5fX2s9dihkLG51bGwsW3VdKSxyfHxlLGUsdm9pZCAwIT09aS5vd25lclNWR0VsZW1lbnQsIW8mJnQ/W3RdOnI/bnVsbDppLmZpcnN0Q2hpbGQ/bi5jYWxsKGkuY2hpbGROb2Rlcyk6bnVsbCxmLCFvJiZ0P3Q6cj9yLl9fZTppLmZpcnN0Q2hpbGQsbykseihmLHUpfWZ1bmN0aW9uIHEobixsKXtTKG4sbCxxKX1mdW5jdGlvbiBCKGwsdSxpKXt2YXIgdCxvLHIsZj1hKHt9LGwucHJvcHMpO2ZvcihyIGluIHUpXCJrZXlcIj09cj90PXVbcl06XCJyZWZcIj09cj9vPXVbcl06ZltyXT11W3JdO3JldHVybiBhcmd1bWVudHMubGVuZ3RoPjImJihmLmNoaWxkcmVuPWFyZ3VtZW50cy5sZW5ndGg+Mz9uLmNhbGwoYXJndW1lbnRzLDIpOmkpLHkobC50eXBlLGYsdHx8bC5rZXksb3x8bC5yZWYsbnVsbCl9ZnVuY3Rpb24gRChuLGwpe3ZhciB1PXtfX2M6bD1cIl9fY0NcIitmKyssX186bixDb25zdW1lcjpmdW5jdGlvbihuLGwpe3JldHVybiBuLmNoaWxkcmVuKGwpfSxQcm92aWRlcjpmdW5jdGlvbihuKXt2YXIgdSxpO3JldHVybiB0aGlzLmdldENoaWxkQ29udGV4dHx8KHU9W10sKGk9e30pW2xdPXRoaXMsdGhpcy5nZXRDaGlsZENvbnRleHQ9ZnVuY3Rpb24oKXtyZXR1cm4gaX0sdGhpcy5zaG91bGRDb21wb25lbnRVcGRhdGU9ZnVuY3Rpb24obil7dGhpcy5wcm9wcy52YWx1ZSE9PW4udmFsdWUmJnUuc29tZShtKX0sdGhpcy5zdWI9ZnVuY3Rpb24obil7dS5wdXNoKG4pO3ZhciBsPW4uY29tcG9uZW50V2lsbFVubW91bnQ7bi5jb21wb25lbnRXaWxsVW5tb3VudD1mdW5jdGlvbigpe3Uuc3BsaWNlKHUuaW5kZXhPZihuKSwxKSxsJiZsLmNhbGwobil9fSksbi5jaGlsZHJlbn19O3JldHVybiB1LlByb3ZpZGVyLl9fPXUuQ29uc3VtZXIuY29udGV4dFR5cGU9dX1uPWMuc2xpY2UsbD17X19lOmZ1bmN0aW9uKG4sbCx1LGkpe2Zvcih2YXIgdCxvLHI7bD1sLl9fOylpZigodD1sLl9fYykmJiF0Ll9fKXRyeXtpZigobz10LmNvbnN0cnVjdG9yKSYmbnVsbCE9by5nZXREZXJpdmVkU3RhdGVGcm9tRXJyb3ImJih0LnNldFN0YXRlKG8uZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKG4pKSxyPXQuX19kKSxudWxsIT10LmNvbXBvbmVudERpZENhdGNoJiYodC5jb21wb25lbnREaWRDYXRjaChuLGl8fHt9KSxyPXQuX19kKSxyKXJldHVybiB0Ll9fRT10fWNhdGNoKGwpe249bH10aHJvdyBufX0sdT0wLGk9ZnVuY3Rpb24obil7cmV0dXJuIG51bGwhPW4mJnZvaWQgMD09PW4uY29uc3RydWN0b3J9LF8ucHJvdG90eXBlLnNldFN0YXRlPWZ1bmN0aW9uKG4sbCl7dmFyIHU7dT1udWxsIT10aGlzLl9fcyYmdGhpcy5fX3MhPT10aGlzLnN0YXRlP3RoaXMuX19zOnRoaXMuX19zPWEoe30sdGhpcy5zdGF0ZSksXCJmdW5jdGlvblwiPT10eXBlb2YgbiYmKG49bihhKHt9LHUpLHRoaXMucHJvcHMpKSxuJiZhKHUsbiksbnVsbCE9biYmdGhpcy5fX3YmJihsJiZ0aGlzLl9faC5wdXNoKGwpLG0odGhpcykpfSxfLnByb3RvdHlwZS5mb3JjZVVwZGF0ZT1mdW5jdGlvbihuKXt0aGlzLl9fdiYmKHRoaXMuX19lPSEwLG4mJnRoaXMuX19oLnB1c2gobiksbSh0aGlzKSl9LF8ucHJvdG90eXBlLnJlbmRlcj1kLHQ9W10sbz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBQcm9taXNlP1Byb21pc2UucHJvdG90eXBlLnRoZW4uYmluZChQcm9taXNlLnJlc29sdmUoKSk6c2V0VGltZW91dCxnLl9fcj0wLGY9MDtleHBvcnR7UyBhcyByZW5kZXIscSBhcyBoeWRyYXRlLHYgYXMgY3JlYXRlRWxlbWVudCx2IGFzIGgsZCBhcyBGcmFnbWVudCxwIGFzIGNyZWF0ZVJlZixpIGFzIGlzVmFsaWRFbGVtZW50LF8gYXMgQ29tcG9uZW50LEIgYXMgY2xvbmVFbGVtZW50LEQgYXMgY3JlYXRlQ29udGV4dCxBIGFzIHRvQ2hpbGRBcnJheSxsIGFzIG9wdGlvbnN9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJlYWN0Lm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydHtvcHRpb25zIGFzIG59ZnJvbVwicHJlYWN0XCI7dmFyIHQsdSxyLG89MCxpPVtdLGM9bi5fX2IsZj1uLl9fcixlPW4uZGlmZmVkLGE9bi5fX2Msdj1uLnVubW91bnQ7ZnVuY3Rpb24gbCh0LHIpe24uX19oJiZuLl9faCh1LHQsb3x8ciksbz0wO3ZhciBpPXUuX19IfHwodS5fX0g9e19fOltdLF9faDpbXX0pO3JldHVybiB0Pj1pLl9fLmxlbmd0aCYmaS5fXy5wdXNoKHt9KSxpLl9fW3RdfWZ1bmN0aW9uIG0obil7cmV0dXJuIG89MSxwKHcsbil9ZnVuY3Rpb24gcChuLHIsbyl7dmFyIGk9bCh0KyssMik7cmV0dXJuIGkudD1uLGkuX19jfHwoaS5fXz1bbz9vKHIpOncodm9pZCAwLHIpLGZ1bmN0aW9uKG4pe3ZhciB0PWkudChpLl9fWzBdLG4pO2kuX19bMF0hPT10JiYoaS5fXz1bdCxpLl9fWzFdXSxpLl9fYy5zZXRTdGF0ZSh7fSkpfV0saS5fX2M9dSksaS5fX31mdW5jdGlvbiB5KHIsbyl7dmFyIGk9bCh0KyssMyk7IW4uX19zJiZrKGkuX19ILG8pJiYoaS5fXz1yLGkuX19IPW8sdS5fX0guX19oLnB1c2goaSkpfWZ1bmN0aW9uIGQocixvKXt2YXIgaT1sKHQrKyw0KTshbi5fX3MmJmsoaS5fX0gsbykmJihpLl9fPXIsaS5fX0g9byx1Ll9faC5wdXNoKGkpKX1mdW5jdGlvbiBoKG4pe3JldHVybiBvPTUsXyhmdW5jdGlvbigpe3JldHVybntjdXJyZW50Om59fSxbXSl9ZnVuY3Rpb24gcyhuLHQsdSl7bz02LGQoZnVuY3Rpb24oKXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBuPyhuKHQoKSksZnVuY3Rpb24oKXtyZXR1cm4gbihudWxsKX0pOm4/KG4uY3VycmVudD10KCksZnVuY3Rpb24oKXtyZXR1cm4gbi5jdXJyZW50PW51bGx9KTp2b2lkIDB9LG51bGw9PXU/dTp1LmNvbmNhdChuKSl9ZnVuY3Rpb24gXyhuLHUpe3ZhciByPWwodCsrLDcpO3JldHVybiBrKHIuX19ILHUpJiYoci5fXz1uKCksci5fX0g9dSxyLl9faD1uKSxyLl9ffWZ1bmN0aW9uIEEobix0KXtyZXR1cm4gbz04LF8oZnVuY3Rpb24oKXtyZXR1cm4gbn0sdCl9ZnVuY3Rpb24gRihuKXt2YXIgcj11LmNvbnRleHRbbi5fX2NdLG89bCh0KyssOSk7cmV0dXJuIG8uYz1uLHI/KG51bGw9PW8uX18mJihvLl9fPSEwLHIuc3ViKHUpKSxyLnByb3BzLnZhbHVlKTpuLl9ffWZ1bmN0aW9uIFQodCx1KXtuLnVzZURlYnVnVmFsdWUmJm4udXNlRGVidWdWYWx1ZSh1P3UodCk6dCl9ZnVuY3Rpb24gcShuKXt2YXIgcj1sKHQrKywxMCksbz1tKCk7cmV0dXJuIHIuX189bix1LmNvbXBvbmVudERpZENhdGNofHwodS5jb21wb25lbnREaWRDYXRjaD1mdW5jdGlvbihuKXtyLl9fJiZyLl9fKG4pLG9bMV0obil9KSxbb1swXSxmdW5jdGlvbigpe29bMV0odm9pZCAwKX1dfWZ1bmN0aW9uIHgoKXtmb3IodmFyIHQ7dD1pLnNoaWZ0KCk7KWlmKHQuX19QKXRyeXt0Ll9fSC5fX2guZm9yRWFjaChnKSx0Ll9fSC5fX2guZm9yRWFjaChqKSx0Ll9fSC5fX2g9W119Y2F0Y2godSl7dC5fX0guX19oPVtdLG4uX19lKHUsdC5fX3YpfX1uLl9fYj1mdW5jdGlvbihuKXt1PW51bGwsYyYmYyhuKX0sbi5fX3I9ZnVuY3Rpb24obil7ZiYmZihuKSx0PTA7dmFyIHI9KHU9bi5fX2MpLl9fSDtyJiYoci5fX2guZm9yRWFjaChnKSxyLl9faC5mb3JFYWNoKGopLHIuX19oPVtdKX0sbi5kaWZmZWQ9ZnVuY3Rpb24odCl7ZSYmZSh0KTt2YXIgbz10Ll9fYztvJiZvLl9fSCYmby5fX0guX19oLmxlbmd0aCYmKDEhPT1pLnB1c2gobykmJnI9PT1uLnJlcXVlc3RBbmltYXRpb25GcmFtZXx8KChyPW4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lKXx8ZnVuY3Rpb24obil7dmFyIHQsdT1mdW5jdGlvbigpe2NsZWFyVGltZW91dChyKSxiJiZjYW5jZWxBbmltYXRpb25GcmFtZSh0KSxzZXRUaW1lb3V0KG4pfSxyPXNldFRpbWVvdXQodSwxMDApO2ImJih0PXJlcXVlc3RBbmltYXRpb25GcmFtZSh1KSl9KSh4KSksdT1udWxsfSxuLl9fYz1mdW5jdGlvbih0LHUpe3Uuc29tZShmdW5jdGlvbih0KXt0cnl7dC5fX2guZm9yRWFjaChnKSx0Ll9faD10Ll9faC5maWx0ZXIoZnVuY3Rpb24obil7cmV0dXJuIW4uX198fGoobil9KX1jYXRjaChyKXt1LnNvbWUoZnVuY3Rpb24obil7bi5fX2gmJihuLl9faD1bXSl9KSx1PVtdLG4uX19lKHIsdC5fX3YpfX0pLGEmJmEodCx1KX0sbi51bm1vdW50PWZ1bmN0aW9uKHQpe3YmJnYodCk7dmFyIHUscj10Ll9fYztyJiZyLl9fSCYmKHIuX19ILl9fLmZvckVhY2goZnVuY3Rpb24obil7dHJ5e2cobil9Y2F0Y2gobil7dT1ufX0pLHUmJm4uX19lKHUsci5fX3YpKX07dmFyIGI9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lO2Z1bmN0aW9uIGcobil7dmFyIHQ9dSxyPW4uX19jO1wiZnVuY3Rpb25cIj09dHlwZW9mIHImJihuLl9fYz12b2lkIDAscigpKSx1PXR9ZnVuY3Rpb24gaihuKXt2YXIgdD11O24uX19jPW4uX18oKSx1PXR9ZnVuY3Rpb24gayhuLHQpe3JldHVybiFufHxuLmxlbmd0aCE9PXQubGVuZ3RofHx0LnNvbWUoZnVuY3Rpb24odCx1KXtyZXR1cm4gdCE9PW5bdV19KX1mdW5jdGlvbiB3KG4sdCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdD90KG4pOnR9ZXhwb3J0e20gYXMgdXNlU3RhdGUscCBhcyB1c2VSZWR1Y2VyLHkgYXMgdXNlRWZmZWN0LGQgYXMgdXNlTGF5b3V0RWZmZWN0LGggYXMgdXNlUmVmLHMgYXMgdXNlSW1wZXJhdGl2ZUhhbmRsZSxfIGFzIHVzZU1lbW8sQSBhcyB1c2VDYWxsYmFjayxGIGFzIHVzZUNvbnRleHQsVCBhcyB1c2VEZWJ1Z1ZhbHVlLHEgYXMgdXNlRXJyb3JCb3VuZGFyeX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ob29rcy5tb2R1bGUuanMubWFwXG4iLCJ2YXIgdG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmdcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcbnZhciByZWdleHBDaGFyYWN0ZXJzID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nXG52YXIgcmVnZXhwSXNOYXRpdmVGbiA9IHRvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpXG4gIC5yZXBsYWNlKHJlZ2V4cENoYXJhY3RlcnMsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JylcbnZhciByZWdleHBJc05hdGl2ZSA9IFJlZ0V4cCgnXicgKyByZWdleHBJc05hdGl2ZUZuICsgJyQnKVxuZnVuY3Rpb24gdG9Tb3VyY2UgKGZ1bmMpIHtcbiAgaWYgKCFmdW5jKSByZXR1cm4gJydcbiAgdHJ5IHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChmdW5jKVxuICB9IGNhdGNoIChlKSB7fVxuICB0cnkge1xuICAgIHJldHVybiAoZnVuYyArICcnKVxuICB9IGNhdGNoIChlKSB7fVxufVxudmFyIGFzc2lnbiA9IE9iamVjdC5hc3NpZ25cbnZhciBmb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2hcbnZhciBldmVyeSA9IEFycmF5LnByb3RvdHlwZS5ldmVyeVxudmFyIGZpbHRlciA9IEFycmF5LnByb3RvdHlwZS5maWx0ZXJcbnZhciBmaW5kID0gQXJyYXkucHJvdG90eXBlLmZpbmRcbnZhciBpbmRleE9mID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2ZcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheVxudmFyIGtleXMgPSBPYmplY3Qua2V5c1xudmFyIG1hcCA9IEFycmF5LnByb3RvdHlwZS5tYXBcbnZhciByZWR1Y2UgPSBBcnJheS5wcm90b3R5cGUucmVkdWNlXG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2VcbnZhciBzb21lID0gQXJyYXkucHJvdG90eXBlLnNvbWVcbnZhciB2YWx1ZXMgPSBPYmplY3QudmFsdWVzXG5mdW5jdGlvbiBpc05hdGl2ZSAobWV0aG9kKSB7XG4gIHJldHVybiBtZXRob2QgJiYgdHlwZW9mIG1ldGhvZCA9PT0gJ2Z1bmN0aW9uJyAmJiByZWdleHBJc05hdGl2ZS50ZXN0KHRvU291cmNlKG1ldGhvZCkpXG59XG52YXIgXyA9IHtcbiAgYXNzaWduOiBpc05hdGl2ZShhc3NpZ24pXG4gICAgPyBhc3NpZ25cbiAgICA6IGZ1bmN0aW9uIGFzc2lnbiAodGFyZ2V0KSB7XG4gICAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV1cbiAgICAgICAgZm9yICh2YXIgaiBpbiBzb3VyY2UpIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoaikpIHRhcmdldFtqXSA9IHNvdXJjZVtqXVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRhcmdldFxuICAgIH0sXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQgKG1ldGhvZCwgY29udGV4dCkge1xuICAgIHZhciBhcmdzID0gXy5zbGljZShhcmd1bWVudHMsIDIpXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGJvdW5kRnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChfLnNsaWNlKGFyZ3VtZW50cykpKVxuICAgIH1cbiAgfSxcbiAgZGVib3VuY2U6IGZ1bmN0aW9uIGRlYm91bmNlIChmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dFxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXNcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzXG4gICAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsXG4gICAgICAgIGlmICghaW1tZWRpYXRlKSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgICB9XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dFxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpXG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdClcbiAgICAgIGlmIChjYWxsTm93KSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgfVxuICB9LFxuICBlYWNoOiBpc05hdGl2ZShmb3JFYWNoKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRWFjaCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZm9yRWFjaC5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBlYWNoIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykgY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgfSxcbiAgZXZlcnk6IGlzTmF0aXZlKGV2ZXJ5KVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRXZlcnkgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBldmVyeS5jYWxsKGNvbGwsIHByZWQsIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZXZlcnkgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIGlmICghY29sbCB8fCAhcHJlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKClcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXByZWQuY2FsbChjb250ZXh0LCBjb2xsW2ldLCBpLCBjb2xsKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG4gIGZpbHRlcjogaXNOYXRpdmUoZmlsdGVyKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRmlsdGVyIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmaWx0ZXIuY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZmlsdGVyIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICB2YXIgb3V0cHV0ID0gW11cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSkpIG91dHB1dC5wdXNoKGFycmF5W2ldKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgIH0sXG4gIGZpbmQ6IGlzTmF0aXZlKGZpbmQpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVGaW5kIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmaW5kLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGZpbmQgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSkpIHJldHVybiBhcnJheVtpXVxuICAgICAgfVxuICAgIH0sXG4gIGdldDogZnVuY3Rpb24gZ2V0IChvYmplY3QsIHBhdGgpIHtcbiAgICByZXR1cm4gXy5yZWR1Y2UocGF0aC5zcGxpdCgnLicpLCBmdW5jdGlvbiAobWVtbywgbmV4dCkge1xuICAgICAgcmV0dXJuICh0eXBlb2YgbWVtbyAhPT0gJ3VuZGVmaW5lZCcgJiYgbWVtbyAhPT0gbnVsbCkgPyBtZW1vW25leHRdIDogdW5kZWZpbmVkXG4gICAgfSwgb2JqZWN0KVxuICB9LFxuICBpZGVudGl0eTogZnVuY3Rpb24gaWRlbnRpdHkgKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG4gIGluZGV4T2Y6IGlzTmF0aXZlKGluZGV4T2YpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVJbmRleE9mIChhcnJheSwgaXRlbSkge1xuICAgICAgcmV0dXJuIGluZGV4T2YuY2FsbChhcnJheSwgaXRlbSlcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBpbmRleE9mIChhcnJheSwgaXRlbSkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGlcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMVxuICAgIH0sXG4gIGludm9rZTogZnVuY3Rpb24gaW52b2tlIChhcnJheSwgbWV0aG9kTmFtZSkge1xuICAgIHZhciBhcmdzID0gXy5zbGljZShhcmd1bWVudHMsIDIpXG4gICAgcmV0dXJuIF8ubWFwKGFycmF5LCBmdW5jdGlvbiBpbnZva2VNYXBwZXIgKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWVbbWV0aG9kTmFtZV0uYXBwbHkodmFsdWUsIGFyZ3MpXG4gICAgfSlcbiAgfSxcbiAgaXNBcnJheTogaXNOYXRpdmUoaXNBcnJheSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUFycmF5IChjb2xsKSB7XG4gICAgICByZXR1cm4gaXNBcnJheShjb2xsKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGlzQXJyYXkgKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgfSxcbiAgaXNNYXRjaDogZnVuY3Rpb24gaXNNYXRjaCAob2JqLCBzcGVjKSB7XG4gICAgZm9yICh2YXIgaSBpbiBzcGVjKSB7XG4gICAgICBpZiAoc3BlYy5oYXNPd25Qcm9wZXJ0eShpKSAmJiBvYmpbaV0gIT09IHNwZWNbaV0pIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9LFxuICBpc09iamVjdDogZnVuY3Rpb24gaXNPYmplY3QgKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9ialxuICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqXG4gIH0sXG4gIGtleXM6IGlzTmF0aXZlKGtleXMpXG4gICAgPyBrZXlzXG4gICAgOiBmdW5jdGlvbiBrZXlzIChvYmplY3QpIHtcbiAgICAgIHZhciBrZXlzID0gW11cbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSBrZXlzLnB1c2goa2V5KVxuICAgICAgfVxuICAgICAgcmV0dXJuIGtleXNcbiAgICB9LFxuICBtYXA6IGlzTmF0aXZlKG1hcClcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZU1hcCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gbWFwLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIG1hcCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgdmFyIG91dHB1dCA9IG5ldyBBcnJheShsKVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgb3V0cHV0W2ldID0gY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcbiAgbWF0Y2hlczogZnVuY3Rpb24gbWF0Y2hlcyAoc3BlYykge1xuICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gXy5pc01hdGNoKG9iaiwgc3BlYylcbiAgICB9XG4gIH0sXG4gIG5vdDogZnVuY3Rpb24gbm90ICh2YWx1ZSkge1xuICAgIHJldHVybiAhdmFsdWVcbiAgfSxcbiAgb2JqZWN0RWFjaDogZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICByZXR1cm4gXy5lYWNoKF8ua2V5cyhvYmplY3QpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2suY2FsbChjb250ZXh0LCBvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpXG4gICAgfSwgY29udGV4dClcbiAgfSxcbiAgb2JqZWN0TWFwOiBmdW5jdGlvbiBvYmplY3RNYXAgKG9iamVjdCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge31cbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG9iamVjdFtrZXldLCBrZXksIG9iamVjdClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9LFxuICBvYmplY3RSZWR1Y2U6IGZ1bmN0aW9uIG9iamVjdFJlZHVjZSAob2JqZWN0LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKSB7XG4gICAgdmFyIG91dHB1dCA9IGluaXRpYWxWYWx1ZVxuICAgIGZvciAodmFyIGkgaW4gb2JqZWN0KSB7XG4gICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGkpKSBvdXRwdXQgPSBjYWxsYmFjayhvdXRwdXQsIG9iamVjdFtpXSwgaSwgb2JqZWN0KVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0XG4gIH0sXG4gIHBpY2s6IGZ1bmN0aW9uIHBpY2sgKG9iamVjdCwgdG9QaWNrKSB7XG4gICAgdmFyIG91dCA9IHt9XG4gICAgXy5lYWNoKHRvUGljaywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKHR5cGVvZiBvYmplY3Rba2V5XSAhPT0gJ3VuZGVmaW5lZCcpIG91dFtrZXldID0gb2JqZWN0W2tleV1cbiAgICB9KVxuICAgIHJldHVybiBvdXRcbiAgfSxcbiAgcGx1Y2s6IGZ1bmN0aW9uIHBsdWNrIChhcnJheSwga2V5KSB7XG4gICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICB2YXIgb3V0ID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykgaWYgKGFycmF5W2ldKSBvdXRbaV0gPSBhcnJheVtpXVtrZXldXG4gICAgcmV0dXJuIG91dFxuICB9LFxuICByZWR1Y2U6IGlzTmF0aXZlKHJlZHVjZSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZVJlZHVjZSAoYXJyYXksIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpIHtcbiAgICAgIHJldHVybiByZWR1Y2UuY2FsbChhcnJheSwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSlcbiAgICB9XG4gICAgOiBmdW5jdGlvbiByZWR1Y2UgKGFycmF5LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKSB7XG4gICAgICB2YXIgb3V0cHV0ID0gaW5pdGlhbFZhbHVlXG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIG91dHB1dCA9IGNhbGxiYWNrKG91dHB1dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgIH0sXG4gIHNldDogZnVuY3Rpb24gc2V0IChvYmplY3QsIHBhdGgsIHZhbCkge1xuICAgIGlmICghb2JqZWN0KSByZXR1cm4gb2JqZWN0XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnICYmIHR5cGVvZiBvYmplY3QgIT09ICdmdW5jdGlvbicpIHJldHVybiBvYmplY3RcbiAgICB2YXIgcGFydHMgPSBwYXRoLnNwbGl0KCcuJylcbiAgICB2YXIgY29udGV4dCA9IG9iamVjdFxuICAgIHZhciBuZXh0S2V5XG4gICAgZG8ge1xuICAgICAgbmV4dEtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgIGlmICh0eXBlb2YgY29udGV4dFtuZXh0S2V5XSAhPT0gJ29iamVjdCcpIGNvbnRleHRbbmV4dEtleV0gPSB7fVxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCkge1xuICAgICAgICBjb250ZXh0ID0gY29udGV4dFtuZXh0S2V5XVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGV4dFtuZXh0S2V5XSA9IHZhbFxuICAgICAgfVxuICAgIH0gd2hpbGUgKHBhcnRzLmxlbmd0aClcbiAgICByZXR1cm4gb2JqZWN0XG4gIH0sXG4gIHNsaWNlOiBpc05hdGl2ZShzbGljZSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZVNsaWNlIChhcnJheSwgYmVnaW4sIGVuZCkge1xuICAgICAgYmVnaW4gPSBiZWdpbiB8fCAwXG4gICAgICBlbmQgPSB0eXBlb2YgZW5kID09PSAnbnVtYmVyJyA/IGVuZCA6IGFycmF5Lmxlbmd0aFxuICAgICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIGJlZ2luLCBlbmQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gc2xpY2UgKGFycmF5LCBzdGFydCwgZW5kKSB7XG4gICAgICBzdGFydCA9IHN0YXJ0IHx8IDBcbiAgICAgIGVuZCA9IHR5cGVvZiBlbmQgPT09ICdudW1iZXInID8gZW5kIDogYXJyYXkubGVuZ3RoXG4gICAgICB2YXIgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGhcbiAgICAgIGlmICghbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBbXVxuICAgICAgfVxuICAgICAgaWYgKHN0YXJ0IDwgMCkge1xuICAgICAgICBzdGFydCA9IC1zdGFydCA+IGxlbmd0aCA/IDAgOiAobGVuZ3RoICsgc3RhcnQpXG4gICAgICB9XG4gICAgICBlbmQgPSBlbmQgPiBsZW5ndGggPyBsZW5ndGggOiBlbmRcbiAgICAgIGlmIChlbmQgPCAwKSB7XG4gICAgICAgIGVuZCArPSBsZW5ndGhcbiAgICAgIH1cbiAgICAgIGxlbmd0aCA9IHN0YXJ0ID4gZW5kID8gMCA6ICgoZW5kIC0gc3RhcnQpID4+PiAwKVxuICAgICAgc3RhcnQgPj4+PSAwXG4gICAgICB2YXIgaW5kZXggPSAtMVxuICAgICAgdmFyIHJlc3VsdCA9IG5ldyBBcnJheShsZW5ndGgpXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gYXJyYXlbaW5kZXggKyBzdGFydF1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9LFxuICBzb21lOiBpc05hdGl2ZShzb21lKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlU29tZSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHNvbWUuY2FsbChjb2xsLCBwcmVkLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIHNvbWUgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIGlmICghY29sbCB8fCAhcHJlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKClcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJlZC5jYWxsKGNvbnRleHQsIGNvbGxbaV0sIGksIGNvbGwpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSxcbiAgdW5pcXVlOiBmdW5jdGlvbiB1bmlxdWUgKGFycmF5KSB7XG4gICAgcmV0dXJuIF8ucmVkdWNlKGFycmF5LCBmdW5jdGlvbiAobWVtbywgY3Vycikge1xuICAgICAgaWYgKF8uaW5kZXhPZihtZW1vLCBjdXJyKSA9PT0gLTEpIHtcbiAgICAgICAgbWVtby5wdXNoKGN1cnIpXG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0sIFtdKVxuICB9LFxuICB2YWx1ZXM6IGlzTmF0aXZlKHZhbHVlcylcbiAgICA/IHZhbHVlc1xuICAgIDogZnVuY3Rpb24gdmFsdWVzIChvYmplY3QpIHtcbiAgICAgIHZhciBvdXQgPSBbXVxuICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIG91dC5wdXNoKG9iamVjdFtrZXldKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dFxuICAgIH0sXG4gIG5hbWU6ICdzbGFwZGFzaCcsXG4gIHZlcnNpb246ICcxLjMuMydcbn1cbl8ub2JqZWN0TWFwLmFzQXJyYXkgPSBmdW5jdGlvbiBvYmplY3RNYXBBc0FycmF5IChvYmplY3QsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIHJldHVybiBfLm1hcChfLmtleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG9iamVjdFtrZXldLCBrZXksIG9iamVjdClcbiAgfSwgY29udGV4dClcbn1cbm1vZHVsZS5leHBvcnRzID0gX1xuIiwidmFyIGVyciA9IG5ldyBFcnJvcignRXJyb3I6IHJlY3Vyc2VzISBpbmZpbml0ZSBwcm9taXNlIGNoYWluIGRldGVjdGVkJylcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcHJvbWlzZSAocmVzb2x2ZXIpIHtcbiAgdmFyIHdhaXRpbmcgPSB7IHJlczogW10sIHJlajogW10gfVxuICB2YXIgcCA9IHtcbiAgICAndGhlbic6IHRoZW4sXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24gdGhlbkNhdGNoIChvblJlamVjdCkge1xuICAgICAgcmV0dXJuIHRoZW4obnVsbCwgb25SZWplY3QpXG4gICAgfVxuICB9XG4gIHRyeSB7IHJlc29sdmVyKHJlc29sdmUsIHJlamVjdCkgfSBjYXRjaCAoZSkge1xuICAgIHAuc3RhdHVzID0gZmFsc2VcbiAgICBwLnZhbHVlID0gZVxuICB9XG4gIHJldHVybiBwXG5cbiAgZnVuY3Rpb24gdGhlbiAob25SZXNvbHZlLCBvblJlamVjdCkge1xuICAgIHJldHVybiBwcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHdhaXRpbmcucmVzLnB1c2goaGFuZGxlTmV4dChwLCB3YWl0aW5nLCBvblJlc29sdmUsIHJlc29sdmUsIHJlamVjdCwgb25SZWplY3QpKVxuICAgICAgd2FpdGluZy5yZWoucHVzaChoYW5kbGVOZXh0KHAsIHdhaXRpbmcsIG9uUmVqZWN0LCByZXNvbHZlLCByZWplY3QsIG9uUmVqZWN0KSlcbiAgICAgIGlmICh0eXBlb2YgcC5zdGF0dXMgIT09ICd1bmRlZmluZWQnKSBmbHVzaCh3YWl0aW5nLCBwKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlICh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHAuc3RhdHVzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuXG4gICAgaWYgKHZhbCA9PT0gcCkgdGhyb3cgZXJyXG4gICAgaWYgKHZhbCkgdHJ5IHsgaWYgKHR5cGVvZiB2YWwudGhlbiA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHZhbC50aGVuKHJlc29sdmUsIHJlamVjdCkgfSBjYXRjaCAoZSkge31cbiAgICBwLnN0YXR1cyA9IHRydWVcbiAgICBwLnZhbHVlID0gdmFsXG4gICAgZmx1c2god2FpdGluZywgcClcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlamVjdCAodmFsKSB7XG4gICAgaWYgKHR5cGVvZiBwLnN0YXR1cyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuICAgIGlmICh2YWwgPT09IHApIHRocm93IGVyclxuICAgIHAuc3RhdHVzID0gZmFsc2VcbiAgICBwLnZhbHVlID0gdmFsXG4gICAgZmx1c2god2FpdGluZywgcClcbiAgfVxufVxuXG5mdW5jdGlvbiBmbHVzaCAod2FpdGluZywgcCkge1xuICB2YXIgcXVldWUgPSBwLnN0YXR1cyA/IHdhaXRpbmcucmVzIDogd2FpdGluZy5yZWpcbiAgd2hpbGUgKHF1ZXVlLmxlbmd0aCkgcXVldWUuc2hpZnQoKShwLnZhbHVlKVxufVxuXG5mdW5jdGlvbiBoYW5kbGVOZXh0IChwLCB3YWl0aW5nLCBoYW5kbGVyLCByZXNvbHZlLCByZWplY3QsIGhhc1JlamVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24gbmV4dCAodmFsdWUpIHtcbiAgICB0cnkge1xuICAgICAgdmFsdWUgPSBoYW5kbGVyID8gaGFuZGxlcih2YWx1ZSkgOiB2YWx1ZVxuICAgICAgaWYgKHAuc3RhdHVzKSByZXR1cm4gcmVzb2x2ZSh2YWx1ZSlcbiAgICAgIHJldHVybiBoYXNSZWplY3QgPyByZXNvbHZlKHZhbHVlKSA6IHJlamVjdCh2YWx1ZSlcbiAgICB9IGNhdGNoIChlcnIpIHsgcmVqZWN0KGVycikgfVxuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikge1xuICBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IG5ldyBBcnJheShsZW4pOyBpIDwgbGVuOyBpKyspIHtcbiAgICBhcnIyW2ldID0gYXJyW2ldO1xuICB9XG5cbiAgcmV0dXJuIGFycjI7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gX2FycmF5V2l0aEhvbGVzKGFycikge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSByZXR1cm4gYXJyO1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF9leHRlbmRzKCkge1xuICBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkge1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldO1xuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0YXJnZXQ7XG4gIH07XG5cbiAgcmV0dXJuIF9leHRlbmRzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkge1xuICB2YXIgX2kgPSBhcnIgPT0gbnVsbCA/IG51bGwgOiB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIGFycltTeW1ib2wuaXRlcmF0b3JdIHx8IGFycltcIkBAaXRlcmF0b3JcIl07XG5cbiAgaWYgKF9pID09IG51bGwpIHJldHVybjtcbiAgdmFyIF9hcnIgPSBbXTtcbiAgdmFyIF9uID0gdHJ1ZTtcbiAgdmFyIF9kID0gZmFsc2U7XG5cbiAgdmFyIF9zLCBfZTtcblxuICB0cnkge1xuICAgIGZvciAoX2kgPSBfaS5jYWxsKGFycik7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHtcbiAgICAgIF9hcnIucHVzaChfcy52YWx1ZSk7XG5cbiAgICAgIGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhaztcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIF9kID0gdHJ1ZTtcbiAgICBfZSA9IGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cnkge1xuICAgICAgaWYgKCFfbiAmJiBfaVtcInJldHVyblwiXSAhPSBudWxsKSBfaVtcInJldHVyblwiXSgpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoX2QpIHRocm93IF9lO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBfYXJyO1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7XG59IiwiaW1wb3J0IGFycmF5V2l0aEhvbGVzIGZyb20gXCIuL2FycmF5V2l0aEhvbGVzLmpzXCI7XG5pbXBvcnQgaXRlcmFibGVUb0FycmF5TGltaXQgZnJvbSBcIi4vaXRlcmFibGVUb0FycmF5TGltaXQuanNcIjtcbmltcG9ydCB1bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheSBmcm9tIFwiLi91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheS5qc1wiO1xuaW1wb3J0IG5vbkl0ZXJhYmxlUmVzdCBmcm9tIFwiLi9ub25JdGVyYWJsZVJlc3QuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF9zbGljZWRUb0FycmF5KGFyciwgaSkge1xuICByZXR1cm4gYXJyYXlXaXRoSG9sZXMoYXJyKSB8fCBpdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHx8IHVuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFyciwgaSkgfHwgbm9uSXRlcmFibGVSZXN0KCk7XG59IiwiaW1wb3J0IGFycmF5TGlrZVRvQXJyYXkgZnJvbSBcIi4vYXJyYXlMaWtlVG9BcnJheS5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KG8sIG1pbkxlbikge1xuICBpZiAoIW8pIHJldHVybjtcbiAgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSByZXR1cm4gYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pO1xuICB2YXIgbiA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSk7XG4gIGlmIChuID09PSBcIk9iamVjdFwiICYmIG8uY29uc3RydWN0b3IpIG4gPSBvLmNvbnN0cnVjdG9yLm5hbWU7XG4gIGlmIChuID09PSBcIk1hcFwiIHx8IG4gPT09IFwiU2V0XCIpIHJldHVybiBBcnJheS5mcm9tKG8pO1xuICBpZiAobiA9PT0gXCJBcmd1bWVudHNcIiB8fCAvXig/OlVpfEkpbnQoPzo4fDE2fDMyKSg/OkNsYW1wZWQpP0FycmF5JC8udGVzdChuKSkgcmV0dXJuIGFycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTtcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdGlkOiBtb2R1bGVJZCxcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IG1hcHBlciBmcm9tICcuL21hcHBlcidcbmltcG9ydCBleHBlcmllbmNlcyBmcm9tICcuL2V4cGVyaWVuY2VzJ1xuXG5tYXBwZXIoKVxuZXhwZXJpZW5jZXMuZm9yRWFjaChleHBlcmllbmNlID0+IGV4cGVyaWVuY2UoKSkiXSwibmFtZXMiOlsidHJpZ2dlcnMiLCJ2YXJpYXRpb24iLCJvcHRpb25zIiwiY2IiLCJsb2ciLCJzdGF0ZSIsInBvbGwiLCJpbmZvIiwicG9sbEZvckVsZW1lbnRzIiwidGhlbiIsImFuY2hvciIsInNldCIsInJlbmRlciIsImgiLCJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsInV0aWxzIiwiaW5zZXJ0QWZ0ZXIiLCJwcmVmaXgiLCJnZXQiLCJjb3B5IiwicmVuZGVyUGxhY2VtZW50IiwiZWxlbWVudCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTmFtZSIsIkNvbnRhaW5lciIsImNvbnRhaW5lckNsYXNzIiwidXNlQ291bnRkb3duVGltZXIiLCJkYXRlIiwiY2FsY3VsYXRlVGltZUxlZnQiLCJkaWZmZXJlbmNlIiwiRGF0ZSIsImRheXMiLCJNYXRoIiwiZmxvb3IiLCJob3VycyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwidGltZUxlZnQiLCJzZXRUaW1lTGVmdCIsInRpbWVyIiwic2V0VGltZW91dCIsImNsZWFyVGltZW91dCIsIkNvdW50ZG93biIsImNvdW50ZG93bkNsYXNzIiwidGltZXJDb21wb25lbnRzIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsImludGVydmFsIiwibGVuZ3RoIiwiUHJvbWlzZSIsImNoZWNrSW5hY3Rpdml0eSIsImNoZWNrRXhpdCIsImNoZWNrRGV2aWNlVHlwZSIsImNoZWNrRm9yRXhpdEludGVudE9ySW5hY3Rpdml0eSIsInJlc29sdmUiLCJpc01vYmlsZU9yVGFibGV0IiwidGVzdCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImluYWN0aXZpdHlUaW1lIiwiZXhpdEludGVudCIsImluaXQiLCJ1c2VSZWYiLCJHbGlkZSIsImFwcGVuZENoaWxkIiwiY29udGVudCIsImhlYWRsaW5lIiwic3VidGl0bGUiLCJyZWNzIiwidGl0bGUiLCJnbGlkZU9wdGlvbnMiLCJ0eXBlIiwiYm91bmQiLCJwZXJWaWV3IiwiZ2FwIiwic2Nyb2xsTG9jayIsInJld2luZCIsImJyZWFrcG9pbnRzIiwiZmlyZSIsImNsYXNzTGlzdCIsImFkZCIsIlBsYWNlbWVudCIsImNoaWxkcmVuIiwiaGFuZGxlQ2xvc2UiLCJleHBlcmllbmNlIiwicXVlcnlTZWxlY3RvciIsInBhcmVudEVsZW1lbnQiLCJyZW1vdmVDaGlsZCIsIkNhcm91c2VsIiwiY2Fyb3VzZWxDbGFzcyIsImNhcm91c2VsQ29udGFpbmVyIiwiZ2xpZGUiLCJtb3VudCIsImRlc3Ryb3kiLCJyZWMiLCJpIiwiQXJyb3dzIiwiYXJyb3dDbGFzcyIsIlNsaWRlIiwic2xpZGVDbGFzcyIsImNyZWF0ZUV4cGVyaWVuY2UiLCJjb3VudGRvd25CYW5uZXIiLCJleHBlcmllbmNlU3RhdGUiLCJrZXkiLCJkYXRhIiwiY29uc29sZSIsIndhcm4iLCJlcnJvciIsInJ1bk1hcHBlciIsIndpbmRvdyIsInhwX2V2ZW50cyIsImVtaXRFdmVudCIsImV2ZW50IiwicHVzaCIsImRhdGFMYXllciIsImV2ZW50TmFtZSIsIm1hcHBlciIsImV4cGVyaWVuY2VzIiwiZm9yRWFjaCJdLCJzb3VyY2VSb290IjoiIn0=
