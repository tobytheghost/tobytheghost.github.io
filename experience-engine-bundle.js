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
    }, copy), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)(Countdown, null), (0,preact__WEBPACK_IMPORTED_MODULE_1__.h)("a", {
      className: "".concat(containerClass, "__cta"),
      href: "/shop"
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
  var inactivityTime = 10;
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
___CSS_LOADER_EXPORT___.push([module.id, ".xp-countdown-banner {\n  margin: unset !important;\n  width: 100% !important;\n  max-width: unset !important;\n}\n.xp-countdown-banner + .wp-block-spacer {\n  display: none;\n}\n.xp-countdown-banner-container {\n  padding: 2rem;\n  text-align: center;\n  width: 100%;\n  background: #ff5858;\n  color: #ffffff;\n}\n.xp-countdown-banner-container__title {\n  font-size: 2rem;\n}\n@media (max-width: 767px) {\n  .xp-countdown-banner-container__title {\n    font-size: 1.5rem;\n  }\n}\n.xp-countdown-banner-container__cta {\n  background: #212121;\n  padding: 0.5rem 1rem;\n  margin-top: 1rem;\n  display: inline-block;\n  color: #ffffff;\n  text-decoration: none;\n}\n", "",{"version":3,"sources":["webpack://./src/experiences/countdownBanner/variation.less"],"names":[],"mappings":"AAAC;EAIC,wBAAA;EACA,sBAAA;EACA,2BAAA;AAFF;AAJC;EAUC,aAAA;AAHF;AAPC;EAcC,aAAA;EACA,kBAAA;EACA,WAAA;EACA,mBAAA;EACA,cAAA;AAJF;AAKE;EACE,eAAA;AAHJ;AAII;EAAA;IACE,iBAAA;EADJ;AACF;AAGE;EACE,mBAAA;EACA,oBAAA;EACA,gBAAA;EACA,qBAAA;EACA,cAAA;EACA,qBAAA;AADJ","sourcesContent":["@prefix: ~'.xp-countdown-banner';\n@container: ~'@{prefix}-container';\n\n@{prefix} {\n  margin: unset !important;\n  width: 100% !important;\n  max-width: unset !important;\n}\n\n@{prefix} + .wp-block-spacer {\n  display: none;\n}\n\n@{container} {\n  padding: 2rem;\n  text-align: center;\n  width: 100%;\n  background: #ff5858;\n  color: #ffffff;\n  &__title {\n    font-size: 2rem;\n    @media(max-width: 767px) {\n      font-size: 1.5rem;\n    }\n  }\n  &__cta {\n    background: #212121;\n    padding: 0.5rem 1rem;\n    margin-top: 1rem;\n    display: inline-block;\n    color: #ffffff;\n    text-decoration: none;\n  }\n}\n"],"sourceRoot":""}]);
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
___CSS_LOADER_EXPORT___.push([module.id, ".xp-exitIntent {\n  position: fixed;\n  bottom: 40px;\n  left: 40px;\n  right: 40px;\n  z-index: 9999999999;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent {\n    bottom: 20px;\n    left: 20px;\n    right: 20px;\n  }\n}\n.xp-exitIntent-carousel {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n}\n.xp-exitIntent-carousel * {\n  box-sizing: inherit;\n}\n.xp-exitIntent-carousel__track {\n  overflow: hidden;\n}\n.xp-exitIntent-carousel__slides {\n  position: relative;\n  width: 100%;\n  list-style: none;\n  backface-visibility: hidden;\n  transform-style: preserve-3d;\n  touch-action: pan-Y;\n  overflow: hidden;\n  padding: 0;\n  white-space: nowrap;\n  display: flex;\n  flex-wrap: nowrap;\n  will-change: transform;\n}\n.xp-exitIntent-carousel__slides--dragging {\n  user-select: none;\n}\n.xp-exitIntent-carousel__slide {\n  width: 100%;\n  height: 100%;\n  flex-shrink: 0;\n  white-space: normal;\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-tap-highlight-color: transparent;\n}\n.xp-exitIntent-carousel__slide a {\n  user-select: none;\n  -webkit-user-drag: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n}\n.xp-exitIntent-carousel__arrows {\n  -webkit-touch-callout: none;\n  user-select: none;\n}\n.xp-exitIntent-carousel__bullets {\n  -webkit-touch-callout: none;\n  user-select: none;\n}\n.xp-exitIntent-carousel--rtl {\n  direction: rtl;\n}\n.xp-exitIntent-container {\n  background: #ffffff;\n  box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.226043);\n  border-radius: 5px;\n  border-top: 5px solid #ff5858;\n  padding: 22px 15px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-container {\n    padding: 8px 15px 15px 15px;\n    border-top: 4px solid #ff5858;\n  }\n}\n.xp-exitIntent-container__header {\n  padding-bottom: 12px;\n}\n.xp-exitIntent-container__title {\n  font-style: normal;\n  font-weight: 700;\n  font-size: 20px;\n  line-height: 25px;\n  color: #333333;\n  text-align: center;\n  padding-bottom: 3px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-container__title {\n    font-size: 16px;\n    line-height: 20px;\n    padding-left: 20px;\n    padding-right: 20px;\n  }\n}\n.xp-exitIntent-container__subtitle {\n  font-style: normal;\n  font-weight: 400;\n  font-size: 16px;\n  line-height: 20px;\n  text-align: center;\n  letter-spacing: 0.0928571px;\n  color: #2e2e2e;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-container__subtitle {\n    font-weight: 400;\n    font-size: 13px;\n    line-height: 16px;\n  }\n}\n.xp-exitIntent-container__close {\n  background-repeat: no-repeat;\n  background-color: unset;\n  border: unset;\n  width: 26px;\n  height: 26px;\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  padding: unset;\n  color: #000000;\n}\n.xp-exitIntent-carousel {\n  padding-left: 40px;\n  padding-right: 40px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-carousel {\n    padding-left: unset;\n    padding-right: unset;\n  }\n}\n.xp-exitIntent-carousel__slides {\n  margin: unset;\n}\n.xp-exitIntent-arrow {\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  right: -15px;\n  padding: 30px 15px;\n  cursor: pointer;\n}\n.xp-exitIntent-arrow--left {\n  left: -15px;\n  right: unset;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-arrow {\n    display: none;\n  }\n}\n.xp-exitIntent-slide {\n  background: #ffffff;\n  border: 1px solid #cccccc;\n  padding: 13px;\n  display: flex;\n  justify-content: space-between;\n  text-decoration: none;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-slide {\n    padding: 12px;\n    min-height: 90px;\n  }\n}\n.xp-exitIntent-slide__image {\n  width: 30%;\n  display: flex;\n  align-items: center;\n}\n.xp-exitIntent-slide__image img {\n  max-width: 100%;\n  max-height: 70px;\n}\n.xp-exitIntent-slide__content {\n  width: calc(70% - 13px);\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  padding-top: 6px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-slide__content {\n    padding-top: unset;\n  }\n}\n.xp-exitIntent-slide__title {\n  max-width: 100%;\n  white-space: normal;\n  font-style: normal;\n  font-weight: 400;\n  font-size: 14px;\n  line-height: 14px;\n  letter-spacing: 0.1px;\n  color: #333333;\n}\n.xp-exitIntent-slide__old-price {\n  font-style: normal;\n  font-weight: 400;\n  font-size: 11px;\n  line-height: 14px;\n  letter-spacing: 0.0928571px;\n  color: #666666;\n}\n.xp-exitIntent-slide__old-price--strike {\n  text-decoration: line-through;\n}\n.xp-exitIntent-slide__new-price {\n  font-style: normal;\n  font-weight: 700;\n  font-size: 13px;\n  line-height: 14px;\n  letter-spacing: 0.0928571px;\n  display: flex;\n  flex-wrap: wrap;\n}\n.xp-exitIntent-slide__price-value {\n  color: #000000;\n  padding-right: 12px;\n}\n.xp-exitIntent-slide__price-saved {\n  color: #ff5858;\n}\n", "",{"version":3,"sources":["webpack://./src/experiences/exitIntent/variation.less"],"names":[],"mappings":"AAAC;EAQC,eAAA;EACA,YAAA;EACA,UAAA;EACA,WAAA;EACA,mBAAA;AANF;AAOE;EAAA;IACE,YAAA;IACA,UAAA;IACA,WAAA;EAJF;AACF;AAbC;EAqBC,kBAAA;EACA,WAAA;EACA,sBAAA;AALF;AAlBC;EAyBG,mBAAA;AAJJ;AAME;EACE,gBAAA;AAJJ;AAME;EACE,kBAAA;EACA,WAAA;EACA,gBAAA;EACA,2BAAA;EACA,4BAAA;EACA,mBAAA;EACA,gBAAA;EACA,UAAA;EACA,mBAAA;EACA,aAAA;EACA,iBAAA;EACA,sBAAA;AAJJ;AAKI;EACE,iBAAA;AAHN;AAME;EACE,WAAA;EACA,YAAA;EACA,cAAA;EACA,mBAAA;EACA,iBAAA;EACA,2BAAA;EACA,wCAAA;AAJJ;AAHE;EASI,iBAAA;EACA,uBAAA;EACA,sBAAA;EACA,qBAAA;AAHN;AAME;EACE,2BAAA;EACA,iBAAA;AAJJ;AAME;EACE,2BAAA;EACA,iBAAA;AAJJ;AAME;EACE,cAAA;AAJJ;AAnEC;EA4EC,mBAAA;EACA,gDAAA;EACA,kBAAA;EACA,6BAAA;EACA,kBAAA;AANF;AAOE;EAAA;IACE,2BAAA;IACA,6BAAA;EAJF;AACF;AAKE;EACE,oBAAA;AAHJ;AAKE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,cAAA;EACA,kBAAA;EACA,mBAAA;AAHJ;AAII;EAAA;IACE,eAAA;IACA,iBAAA;IACA,kBAAA;IACA,mBAAA;EADJ;AACF;AAGE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,kBAAA;EACA,2BAAA;EACA,cAAA;AADJ;AAEI;EAAA;IACE,gBAAA;IACA,eAAA;IACA,iBAAA;EACJ;AACF;AACE;EACE,4BAAA;EACA,uBAAA;EACA,aAAA;EACA,WAAA;EACA,YAAA;EACA,kBAAA;EACA,SAAA;EACA,WAAA;EACA,cAAA;EACA,cAAA;AACJ;AAhIC;EAoIC,kBAAA;EACA,mBAAA;AADF;AAEE;EAAA;IACE,mBAAA;IACA,oBAAA;EACF;AACF;AAAE;EACE,aAAA;AAEJ;AA7IC;EAgJC,kBAAA;EACA,QAAA;EACA,2BAAA;EACA,YAAA;EACA,kBAAA;EACA,eAAA;AAAF;AACE;EACE,WAAA;EACA,YAAA;AACJ;AACE;EAAA;IACE,aAAA;EAEF;AACF;AA9JC;EAgKC,mBAAA;EACA,yBAAA;EACA,aAAA;EACA,aAAA;EACA,8BAAA;EACA,qBAAA;AACF;AAAE;EAAA;IACE,aAAA;IACA,gBAAA;EAGF;AACF;AAFE;EACE,UAAA;EACA,aAAA;EACA,mBAAA;AAIJ;AAPE;EAKI,eAAA;EACA,gBAAA;AAKN;AAFE;EACE,uBAAA;EACA,aAAA;EACA,sBAAA;EACA,8BAAA;EACA,gBAAA;AAIJ;AAHI;EAAA;IACE,kBAAA;EAMJ;AACF;AAJE;EACE,eAAA;EACA,mBAAA;EACA,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,qBAAA;EACA,cAAA;AAMJ;AAJE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,2BAAA;EACA,cAAA;AAMJ;AALI;EACE,6BAAA;AAON;AAJE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,2BAAA;EACA,aAAA;EACA,eAAA;AAMJ;AAJE;EACE,cAAA;EACA,mBAAA;AAMJ;AAJE;EACE,cAAA;AAMJ","sourcesContent":["@ticket: ~'.xp-exitIntent';\n@containerClass: ~'@{ticket}-container';\n@glide: ~'@{ticket}-carousel';\n@carouselClass: ~'@{ticket}-carousel';\n@slideClass: ~'@{ticket}-slide';\n@arrowClass: ~'@{ticket}-arrow';\n\n@{ticket} {\n  position: fixed;\n  bottom: 40px;\n  left: 40px;\n  right: 40px;\n  z-index: 9999999999;\n  @media (max-width: 767px) {\n    bottom: 20px;\n    left: 20px;\n    right: 20px;\n  }\n}\n\n@{glide} {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n  * {\n    box-sizing: inherit;\n  }\n  &__track {\n    overflow: hidden;\n  }\n  &__slides {\n    position: relative;\n    width: 100%;\n    list-style: none;\n    backface-visibility: hidden;\n    transform-style: preserve-3d;\n    touch-action: pan-Y;\n    overflow: hidden;\n    padding: 0;\n    white-space: nowrap;\n    display: flex;\n    flex-wrap: nowrap;\n    will-change: transform;\n    &--dragging {\n      user-select: none;\n    }\n  }\n  &__slide {\n    width: 100%;\n    height: 100%;\n    flex-shrink: 0;\n    white-space: normal;\n    user-select: none;\n    -webkit-touch-callout: none;\n    -webkit-tap-highlight-color: transparent;\n    a {\n      user-select: none;\n      -webkit-user-drag: none;\n      -moz-user-select: none;\n      -ms-user-select: none;\n    }\n  }\n  &__arrows {\n    -webkit-touch-callout: none;\n    user-select: none;\n  }\n  &__bullets {\n    -webkit-touch-callout: none;\n    user-select: none;\n  }\n  &--rtl {\n    direction: rtl;\n  }\n}\n\n@{containerClass} {\n  background: #ffffff;\n  box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.226043);\n  border-radius: 5px;\n  border-top: 5px solid #ff5858;\n  padding: 22px 15px;\n  @media (max-width: 767px) {\n    padding: 8px 15px 15px 15px;\n    border-top: 4px solid #ff5858;\n  }\n  &__header {\n    padding-bottom: 12px;\n  }\n  &__title {\n    font-style: normal;\n    font-weight: 700;\n    font-size: 20px;\n    line-height: 25px;\n    color: #333333;\n    text-align: center;\n    padding-bottom: 3px;\n    @media (max-width: 767px) {\n      font-size: 16px;\n      line-height: 20px;\n      padding-left: 20px;\n      padding-right: 20px;\n    }\n  }\n  &__subtitle {\n    font-style: normal;\n    font-weight: 400;\n    font-size: 16px;\n    line-height: 20px;\n    text-align: center;\n    letter-spacing: 0.0928571px;\n    color: #2e2e2e;\n    @media (max-width: 767px) {\n      font-weight: 400;\n      font-size: 13px;\n      line-height: 16px;\n    }\n  }\n  &__close {\n    background-repeat: no-repeat;\n    background-color: unset;\n    border: unset;\n    width: 26px;\n    height: 26px;\n    position: absolute;\n    top: 10px;\n    right: 10px;\n    padding: unset;\n    color: #000000;\n  }\n}\n\n@{carouselClass} {\n  padding-left: 40px;\n  padding-right: 40px;\n  @media (max-width: 767px) {\n    padding-left: unset;\n    padding-right: unset;\n  }\n  &__slides {\n    margin: unset;\n  }\n}\n\n@{arrowClass} {\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  right: -15px;\n  padding: 30px 15px;\n  cursor: pointer;\n  &--left {\n    left: -15px;\n    right: unset;\n  }\n  @media (max-width: 767px) {\n    display: none;\n  }\n}\n\n@{slideClass} {\n  background: #ffffff;\n  border: 1px solid #cccccc;\n  padding: 13px;\n  display: flex;\n  justify-content: space-between;\n  text-decoration: none;\n  @media (max-width: 767px) {\n    padding: 12px;\n    min-height: 90px;\n  }\n  &__image {\n    width: 30%;\n    display: flex;\n    align-items: center;\n    img {\n      max-width: 100%;\n      max-height: 70px;\n    }\n  }\n  &__content {\n    width: calc(70% - 13px);\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    padding-top: 6px;\n    @media (max-width: 767px) {\n      padding-top: unset;\n    }\n  }\n  &__title {\n    max-width: 100%;\n    white-space: normal;\n    font-style: normal;\n    font-weight: 400;\n    font-size: 14px;\n    line-height: 14px;\n    letter-spacing: 0.1px;\n    color: #333333;\n  }\n  &__old-price {\n    font-style: normal;\n    font-weight: 400;\n    font-size: 11px;\n    line-height: 14px;\n    letter-spacing: 0.0928571px;\n    color: #666666;\n    &--strike {\n      text-decoration: line-through;\n    }\n  }\n  &__new-price {\n    font-style: normal;\n    font-weight: 700;\n    font-size: 13px;\n    line-height: 14px;\n    letter-spacing: 0.0928571px;\n    display: flex;\n    flex-wrap: wrap;\n  }\n  &__price-value {\n    color: #000000;\n    padding-right: 12px;\n  }\n  &__price-saved {\n    color: #ff5858;\n  }\n}"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEtBQUssV0FBVyxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLFdBQVcsV0FBVyxLQUFLLEtBQUssV0FBVyxXQUFXLEtBQUssS0FBSyxVQUFVLEtBQUssTUFBTSxZQUFZLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssV0FBVyxXQUFXLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssVUFBVSxXQUFXLFdBQVcsV0FBVyxLQUFLLEtBQUssS0FBSyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLEtBQUssS0FBSyxLQUFLLFdBQVcsVUFBVSxXQUFXLEtBQUssS0FBSyxLQUFLLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsS0FBSyxNQUFNLFlBQVksV0FBVyxLQUFLLEtBQUssS0FBSyxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssVUFBVSxLQUFLLE1BQU0sWUFBWSxVQUFVLFdBQVcsVUFBVSxXQUFXLFVBQVUsS0FBSyxLQUFLLFVBQVUsVUFBVSxLQUFLLEtBQUssS0FBSyxVQUFVLEtBQUssS0FBSyxNQUFNLFlBQVksV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLEtBQUssS0FBSyxLQUFLLFVBQVUsV0FBVyxLQUFLLEtBQUssS0FBSyxVQUFVLFVBQVUsV0FBVyxLQUFLLEtBQUssVUFBVSxXQUFXLEtBQUssS0FBSyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsS0FBSyxLQUFL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QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0IsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsaUJBQWlCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FB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Q0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0IsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsaUJBQWlCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FB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QUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLHdCQUF3QjtBQUMvQjtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsaUJB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O0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hC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QSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixpQkFBaUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7Ozs7Ozs7Ozs7O0FDdFRBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw0QkFBNEI7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsdUVBQXVFO0FBQzFGO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxjQUFjO0FBQ3BCO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0RGU7QUFDZjs7QUFFQSx5Q0FBeUMsU0FBUztBQUNsRDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ1JlO0FBQ2Y7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDRmU7QUFDZjtBQUNBLG9CQUFvQixzQkFBc0I7QUFDMUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDaEJlO0FBQ2Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSw0QkFBNEIsK0JBQStCO0FBQzNEOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUM1QmU7QUFDZjtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRmlEO0FBQ1k7QUFDWTtBQUN0QjtBQUNwQztBQUNmLFNBQVMsOERBQWMsU0FBUyxvRUFBb0IsWUFBWSwwRUFBMEIsWUFBWSwrREFBZTtBQUNySDs7Ozs7Ozs7Ozs7Ozs7OztBQ05xRDtBQUN0QztBQUNmO0FBQ0Esb0NBQW9DLGdFQUFnQjtBQUNwRDtBQUNBO0FBQ0E7QUFDQSxzRkFBc0YsZ0VBQWdCO0FBQ3RHOzs7Ozs7VUNSQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBRUFDLG1EQUFNO0FBQ05DLDREQUFBLENBQW9CLFVBQUFqQyxVQUFVO0VBQUEsT0FBSUEsVUFBVSxFQUFkO0FBQUEsQ0FBOUIsRSIsInNvdXJjZXMiOlsid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BxdWJpdC9wb2xsZXIvbGliL2NyZWF0ZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AcXViaXQvcG9sbGVyL2xpYi9ldmFsdWF0ZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AcXViaXQvcG9sbGVyL2xpYi9vYnNlcnZlci5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AcXViaXQvcG9sbGVyL2xpYi9yYWYuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQHF1Yml0L3BvbGxlci9saWIvdmFsaWRfZnJhbWUuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQHF1Yml0L3BvbGxlci9saWIvdmFsaWRhdGUuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQHF1Yml0L3BvbGxlci9wb2xsZXIuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci90cmlnZ2Vycy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9jb3VudGRvd25CYW5uZXIvdmFyaWF0aW9uLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NyZWF0ZUV4cGVyaWVuY2UuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L3RyaWdnZXJzLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvdmFyaWF0aW9uLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL29wdGlvbnMuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvbWFwcGVyL2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci92YXJpYXRpb24ubGVzcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L3ZhcmlhdGlvbi5sZXNzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9icm93c2VyLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9zcmMvY3JlYXRlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9zcmMvbGV2ZWxzLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9zcmMvbG9nZ2VyL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvZHJpZnR3b29kL3NyYy9wYXR0ZXJucy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9kcmlmdHdvb2Qvc3JjL3N0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvZHJpZnR3b29kL3NyYy91dGlscy9hcmdzVG9Db21wb25lbnRzLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9zcmMvdXRpbHMvY29tcG9zZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9kcmlmdHdvb2Qvc3JjL3V0aWxzL3JpZ2h0UGFkLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2pzb24tYm91cm5lL2pzb24tYm91cm5lLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL3NsYXBkYXNoL2Rpc3QvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL3ZhcmlhdGlvbi5sZXNzPzNhYzgiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC92YXJpYXRpb24ubGVzcz9mZWQ0Iiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvc3luYy1wL2RlZmVyLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL3N5bmMtcC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9jb3VudGRvd25CYW5uZXIvbm9kZV9tb2R1bGVzL0BxdWJpdC91dGlscy9kb20vaW5kZXguanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL25vZGVfbW9kdWxlcy9AcXViaXQvdXRpbHMvbGliL29uY2UuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL25vZGVfbW9kdWxlcy9AcXViaXQvdXRpbHMvbGliL3Byb21pc2VkLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci9ub2RlX21vZHVsZXMvQHF1Yml0L3V0aWxzL2xpYi93aXRoUmVzdG9yZUFsbC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9jb3VudGRvd25CYW5uZXIvbm9kZV9tb2R1bGVzL3ByZWFjdC9kaXN0L3ByZWFjdC5tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL25vZGVfbW9kdWxlcy9wcmVhY3QvaG9va3MvZGlzdC9ob29rcy5tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL25vZGVfbW9kdWxlcy9zbGFwZGFzaC9kaXN0L2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci9ub2RlX21vZHVsZXMvc3luYy1wL2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BnbGlkZWpzL2dsaWRlL2Rpc3QvZ2xpZGUuZXNtLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BxdWJpdC9jaGVjay1leGl0L2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BxdWJpdC9jaGVjay1pbmFjdGl2aXR5L2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BxdWJpdC91dGlscy9kb20vaW5kZXguanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC9ub2RlX21vZHVsZXMvQHF1Yml0L3V0aWxzL2xpYi9vbmNlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BxdWJpdC91dGlscy9saWIvcHJvbWlzZWQuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC9ub2RlX21vZHVsZXMvQHF1Yml0L3V0aWxzL2xpYi93aXRoUmVzdG9yZUFsbC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L25vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QubW9kdWxlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL3ByZWFjdC9ob29rcy9kaXN0L2hvb2tzLm1vZHVsZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L25vZGVfbW9kdWxlcy9zbGFwZGFzaC9kaXN0L2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL3N5bmMtcC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9hcnJheUxpa2VUb0FycmF5LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2FycmF5V2l0aEhvbGVzLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2V4dGVuZHMuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vaXRlcmFibGVUb0FycmF5TGltaXQuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vbm9uSXRlcmFibGVSZXN0LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL3NsaWNlZFRvQXJyYXkuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZHJpZnR3b29kID0gcmVxdWlyZSgnZHJpZnR3b29kJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGUgKHRhcmdldHMsIG9wdGlvbnMpIHtcbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KHRhcmdldHMpXG4gIHJldHVybiB7XG4gICAgdGFyZ2V0czogaXNBcnJheSA/IHRhcmdldHMgOiBbdGFyZ2V0c10sXG4gICAgZXZhbHVhdGVkOiBbXSxcbiAgICBpc1NpbmdsZXRvbjogIWlzQXJyYXksXG4gICAgcmVzb2x2ZTogb3B0aW9ucy5yZXNvbHZlLFxuICAgIHJlamVjdDogb3B0aW9ucy5yZWplY3QsXG4gICAgbG9nZ2VyOiBvcHRpb25zLmxvZ2dlciB8fCBkcmlmdHdvb2QoJ3BvbGxlcicpLFxuICAgIHRpbWVvdXQ6IG9wdGlvbnMudGltZW91dCxcbiAgICBzdG9wT25FcnJvcjogb3B0aW9ucy5zdG9wT25FcnJvcixcbiAgICBxdWVyeUFsbDogb3B0aW9ucy5xdWVyeUFsbFxuICB9XG59XG4iLCJ2YXIgZ2V0ID0gcmVxdWlyZSgnc2xhcGRhc2gnKS5nZXRcbnZhciB1bmRlZiA9IHZvaWQgMFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV2YWx1YXRlICh0YXJnZXQsIHF1ZXJ5QWxsKSB7XG4gIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSByZXR1cm4gdGFyZ2V0KCkgfHwgdW5kZWZcbiAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnICYmIHRhcmdldC5pbmRleE9mKCd3aW5kb3cuJykgPT09IDApIHJldHVybiBnZXQod2luZG93LCB0YXJnZXQpXG4gIGlmIChxdWVyeUFsbCkge1xuICAgIHZhciBpdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGFyZ2V0KVxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPyBpdGVtcyA6IHVuZGVmXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSB8fCB1bmRlZlxuICB9XG59XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVPYnNlcnZlciAoY2IpIHtcbiAgdmFyIE9ic2VydmVyID0gd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgfHwgd2luZG93LldlYktpdE11dGF0aW9uT2JzZXJ2ZXJcbiAgdmFyIHN1cHBvcnRlZCA9IEJvb2xlYW4oT2JzZXJ2ZXIgJiYgIWlzVHJpZGVudCgpKVxuICB2YXIgZGlzYWJsZWQgPSAhc3VwcG9ydGVkXG4gIHZhciBtb2JzZXJ2ZXIgPSBzdXBwb3J0ZWQgJiYgbmV3IE9ic2VydmVyKGNiKVxuICB2YXIgYWN0aXZlID0gZmFsc2VcblxuICBmdW5jdGlvbiBlbmFibGUgKCkge1xuICAgIGlmIChzdXBwb3J0ZWQpIGRpc2FibGVkID0gZmFsc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpc2FibGUgKCkge1xuICAgIHN0b3AoKVxuICAgIGRpc2FibGVkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnQgKCkge1xuICAgIGlmIChhY3RpdmUgfHwgZGlzYWJsZWQpIHJldHVyblxuICAgIG1vYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwge1xuICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgc3VidHJlZTogdHJ1ZVxuICAgIH0pXG4gICAgYWN0aXZlID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gc3RvcCAoKSB7XG4gICAgaWYgKCFhY3RpdmUgfHwgZGlzYWJsZWQpIHJldHVyblxuICAgIG1vYnNlcnZlci5kaXNjb25uZWN0KClcbiAgICBhY3RpdmUgPSBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBlbmFibGU6IGVuYWJsZSxcbiAgICBkaXNhYmxlOiBkaXNhYmxlLFxuICAgIHN0YXJ0OiBzdGFydCxcbiAgICBzdG9wOiBzdG9wXG4gIH1cbn1cblxuZnVuY3Rpb24gaXNUcmlkZW50ICgpIHtcbiAgdmFyIGFnZW50ID0gXy5nZXQod2luZG93LCAnbmF2aWdhdG9yLnVzZXJBZ2VudCcpIHx8ICcnXG4gIHJldHVybiBhZ2VudC5pbmRleE9mKCdUcmlkZW50LzcuMCcpID4gLTFcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmFmIChmbikge1xuICByZXR1cm4gZ2V0UmFmKCkoZm4pXG59XG5cbmZ1bmN0aW9uIGdldFJhZiAoKSB7XG4gIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICBkZWZlclxufVxuXG5mdW5jdGlvbiBkZWZlciAoY2FsbGJhY2spIHtcbiAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDApXG59XG4iLCJ2YXIgaW5kZXhPZiA9IHJlcXVpcmUoJ3NsYXBkYXNoJykuaW5kZXhPZlxudmFyIEZQUyA9IDYwXG5cbmZ1bmN0aW9uIHZhbGlkRnJhbWUgKHRpY2tDb3VudCkge1xuICByZXR1cm4gaW5kZXhPZihnZXRWYWxpZEZyYW1lcygpLCB0aWNrQ291bnQgJSBGUFMpICE9PSAtMVxufVxuXG5mdW5jdGlvbiBnZXRWYWxpZEZyYW1lcyAoKSB7XG4gIHJldHVybiBbMSwgMiwgMywgNSwgOCwgMTMsIDIxLCAzNCwgNTVdXG59XG5cbm1vZHVsZS5leHBvcnRzID0gdmFsaWRGcmFtZVxubW9kdWxlLmV4cG9ydHMuZ2V0VmFsaWRGcmFtZXMgPSBnZXRWYWxpZEZyYW1lc1xuIiwidmFyIF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdmFsaWRhdGUgKHRhcmdldHMsIG9wdGlvbnMpIHtcbiAgaWYgKGFyZVRhcmdldHNJbnZhbGlkKHRhcmdldHMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ1BvbGxlcjogRXhwZWN0ZWQgZmlyc3QgYXJndW1lbnQgdG8gYmUgYSBzZWxlY3RvciBzdHJpbmcgJyArXG4gICAgICAnb3IgYXJyYXkgY29udGFpbmluZyBzZWxlY3RvcnMsIHdpbmRvdyB2YXJpYWJsZXMgb3IgZnVuY3Rpb25zLidcbiAgICApXG4gIH1cbiAgaWYgKG9wdGlvbnMgIT09IHZvaWQgMCkge1xuICAgIHZhciBvcHRpb25zSXNGdW5jdGlvbiA9IHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nXG4gICAgaWYgKG9wdGlvbnNJc0Z1bmN0aW9uIHx8ICFfLmlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdQb2xsZXI6IEV4cGVjdGVkIHNlY29uZCBhcmd1bWVudCB0byBiZSBhbiBvcHRpb25zIG9iamVjdC4gJyArXG4gICAgICAgICdQb2xsZXIgaGFzIGEgbmV3IEFQSSwgc2VlIGh0dHBzOi8vZG9jcy5xdWJpdC5jb20vY29udGVudC9kZXZlbG9wZXJzL2V4cGVyaWVuY2VzLXBvbGxlcidcbiAgICAgIClcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXJlVGFyZ2V0c0ludmFsaWQgKHRhcmdldHMpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0cykpIHtcbiAgICByZXR1cm4gISFfLmZpbmQodGFyZ2V0cywgaXNJbnZhbGlkVHlwZSlcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gaXNJbnZhbGlkVHlwZSh0YXJnZXRzKVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzSW52YWxpZFR5cGUgKHRhcmdldCkge1xuICB2YXIgdGFyZ2V0VHlwZSA9IHR5cGVvZiB0YXJnZXRcbiAgcmV0dXJuIHRhcmdldFR5cGUgIT09ICdzdHJpbmcnICYmIHRhcmdldFR5cGUgIT09ICdmdW5jdGlvbidcbn1cbiIsInZhciBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxudmFyIGRlZmVyID0gcmVxdWlyZSgnc3luYy1wL2RlZmVyJylcbnZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByZXF1aXJlKCcuL2xpYi9yYWYnKVxudmFyIHZhbGlkRnJhbWUgPSByZXF1aXJlKCcuL2xpYi92YWxpZF9mcmFtZScpXG52YXIgY3JlYXRlT2JzZXJ2ZXIgPSByZXF1aXJlKCcuL2xpYi9vYnNlcnZlcicpXG52YXIgZXZhbHVhdGUgPSByZXF1aXJlKCcuL2xpYi9ldmFsdWF0ZScpXG52YXIgdmFsaWRhdGUgPSByZXF1aXJlKCcuL2xpYi92YWxpZGF0ZScpXG52YXIgY3JlYXRlID0gcmVxdWlyZSgnLi9saWIvY3JlYXRlJylcbnZhciBsb2dnZXIgPSByZXF1aXJlKCdkcmlmdHdvb2QnKSgncG9sbGVyJylcblxuLyoqXG4gKiBDb25zdGFudHMgLSB0aGVzZSBhcmUgbm90IGNvbmZpZ3VyYWJsZSB0b1xuICogbWFrZSBwb2xsaW5nIG1vcmUgZWZmaWNpZW50IGJ5IHJldXNpbmcgdGhlXG4gKiBzYW1lIGdsb2JhbCB0aW1lb3V0LlxuICovXG52YXIgSU5JVElBTF9USUNLID0gTWF0aC5yb3VuZCgxMDAwIC8gNjApIC8vIFRoZSBpbml0aWFsIHRpY2sgaW50ZXJ2YWwgZHVyYXRpb24gYmVmb3JlIHdlIHN0YXJ0IGJhY2tpbmcgb2ZmIChtcylcbnZhciBJTkNSRUFTRV9SQVRFID0gMS41IC8vIFRoZSBiYWNrb2ZmIG11bHRpcGxpZXJcbnZhciBCQUNLT0ZGX1RIUkVTSE9MRCA9IE1hdGgucm91bmQoKDMgKiAxMDAwKSAvICgxMDAwIC8gNjApKSAvLyBIb3cgbWFueSB0aWNrcyBiZWZvcmUgd2Ugc3RhcnQgYmFja2luZyBvZmZcbnZhciBERUZBVUxUUyA9IHtcbiAgbG9nZ2VyOiBsb2dnZXIsXG4gIHRpbWVvdXQ6IDE1MDAwLCAvLyBIb3cgbG9uZyBiZWZvcmUgd2Ugc3RvcCBwb2xsaW5nIChtcylcbiAgc3RvcE9uRXJyb3I6IGZhbHNlIC8vIFdoZXRoZXIgdG8gc3RvcCBhbmQgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIGV2YXVsYXRpb24gdGhyb3dzXG59XG4vKipcbiAqIEdsb2JhbHNcbiAqL1xudmFyIHRpY2tDb3VudCwgY3VycmVudFRpY2tEZWxheVxudmFyIHF1ZXVlID0gW11cbnZhciBvYnNlcnZlciA9IGNyZWF0ZU9ic2VydmVyKHRvY2spXG5cbi8qKlxuICogTWFpbiBwb2xsZXIgbWV0aG9kIHRvIHJlZ2lzdGVyICd0YXJnZXRzJyB0byBwb2xsIGZvclxuICogYW5kIGEgY2FsbGJhY2sgd2hlbiBhbGwgdGFyZ2V0cyB2YWxpZGF0ZWQgYW5kIGNvbXBsZXRlXG4gKiAndGFyZ2V0cycgY2FuIGJlIG9uZSBvZiB0aGUgZm9sbG93aW5nIGZvcm1hdHM6XG4gKiAgIC0gYSBzZWxlY3RvciBzdHJpbmcgZS5nLiAnYm9keSA+IHNwYW4uZ3JpZDE1J1xuICogICAtIGEgd2luZG93IHZhcmlhYmxlIGZvcm1hdHRlZCBhcyBhIHN0cmluZyBlLmcuICd3aW5kb3cudW5pdmVyc2FsX3ZhcmlhYmxlJ1xuICogICAtIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIGNvbmRpdGlvbiBmb3Igd2hpY2ggdG8gc3RvcCB0aGUgcG9sbGluZyBlLmcuXG4gKiAgICAgZnVuY3Rpb24gKCkge1xuICogICAgICAgcmV0dXJuICQoJy5zb21lLWNsYXNzJykubGVuZ3RoID09PSAyXG4gKiAgICAgfVxuICogICAtIGFuIGFycmF5IG9mIGFueSBvZiB0aGUgYWJvdmUgZm9ybWF0c1xuICovXG5cbmZ1bmN0aW9uIHBvbGxlciAodGFyZ2V0cywgb3B0cykge1xuICB2YXIgb3B0aW9ucyA9IF8uYXNzaWduKHt9LCBERUZBVUxUUywgb3B0cywgZGVmZXIoKSlcblxuICB0cnkge1xuICAgIHZhbGlkYXRlKHRhcmdldHMsIG9wdHMpXG5cbiAgICB2YXIgaXRlbSA9IGNyZWF0ZSh0YXJnZXRzLCBvcHRpb25zKVxuXG4gICAgc3RhcnQoKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgIHN0b3A6IHN0b3AsXG4gICAgICB0aGVuOiBvcHRpb25zLnByb21pc2UudGhlbixcbiAgICAgIGNhdGNoOiBvcHRpb25zLnByb21pc2UuY2F0Y2hcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nRXJyb3IoZXJyb3IsIG9wdGlvbnMpXG4gIH1cblxuICBmdW5jdGlvbiBzdGFydCAoKSB7XG4gICAgcmVnaXN0ZXIoaXRlbSlcbiAgICByZXR1cm4gb3B0aW9ucy5wcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiBzdG9wICgpIHtcbiAgICByZXR1cm4gdW5yZWdpc3RlcihpdGVtKVxuICB9XG59XG5cbmZ1bmN0aW9uIHRpY2sgKCkge1xuICB0aWNrQ291bnQgKz0gMVxuICB2YXIgbmV4dCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB2YXIgc2hvdWxkQmFja29mZiA9IHRpY2tDb3VudCA+PSBCQUNLT0ZGX1RIUkVTSE9MRFxuICBpZiAoc2hvdWxkQmFja29mZikge1xuICAgIGN1cnJlbnRUaWNrRGVsYXkgPSBjdXJyZW50VGlja0RlbGF5ICogSU5DUkVBU0VfUkFURVxuICAgIG5leHQgPSB3aW5kb3cuc2V0VGltZW91dFxuICB9XG4gIGlmIChzaG91bGRCYWNrb2ZmIHx8IHZhbGlkRnJhbWUodGlja0NvdW50KSkge1xuICAgIHRvY2soKVxuICB9XG4gIGlmICghaXNBY3RpdmUoKSkgcmV0dXJuXG4gIHJldHVybiBuZXh0KHRpY2ssIGN1cnJlbnRUaWNrRGVsYXkpXG59XG5cbi8qKlxuICogTG9vcCB0aHJvdWdoIGFsbCByZWdpc3RlcmVkIGl0ZW1zLCBwb2xsaW5nIGZvciBzZWxlY3RvcnMgb3IgZXhlY3V0aW5nIGZpbHRlciBmdW5jdGlvbnNcbiAqL1xuZnVuY3Rpb24gdG9jayAoKSB7XG4gIHZhciByZWFkeSA9IF8uZmlsdGVyKHF1ZXVlLCBldmFsdWF0ZVF1ZXVlKVxuXG4gIHdoaWxlIChyZWFkeS5sZW5ndGgpIHJlc29sdmUocmVhZHkucG9wKCkpXG5cbiAgZnVuY3Rpb24gZXZhbHVhdGVRdWV1ZSAoaXRlbSkge1xuICAgIHZhciBpLCByZXN1bHRcbiAgICB2YXIgY2FjaGVJbmRleCA9IGl0ZW0uZXZhbHVhdGVkLmxlbmd0aFxuICAgIHRyeSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS50YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpID49IGl0ZW0uZXZhbHVhdGVkLmxlbmd0aCkge1xuICAgICAgICAgIHJlc3VsdCA9IGV2YWx1YXRlKGl0ZW0udGFyZ2V0c1tpXSwgaXRlbS5xdWVyeUFsbClcbiAgICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGl0ZW0ubG9nZ2VyLmluZm8oJ1BvbGxlcjogcmVzb2x2ZWQgJyArIFN0cmluZyhpdGVtLnRhcmdldHNbaV0pKVxuICAgICAgICAgICAgaXRlbS5ldmFsdWF0ZWQucHVzaChyZXN1bHQpXG4gICAgICAgICAgfSBlbHNlIGlmICgobmV3IERhdGUoKSAtIGl0ZW0uc3RhcnQpID49IGl0ZW0udGltZW91dCkge1xuICAgICAgICAgICAgLy8gSXRlbSBoYXMgdGltZWQgb3V0LCByZXNvbHZlIGl0ZW1cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIENhbm5vdCByZXNvbHZlIGl0ZW0sIGV4aXRcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBFdmVyeXRoaW5nIGhhcyBiZWVuIGZvdW5kLCBsZXRzIHJlLWV2YWx1YXRlIGNhY2hlZCBlbnRyaWVzXG4gICAgICAvLyB0byBtYWtlIHN1cmUgdGhleSBoYXZlIG5vdCBnb25lIHN0YWxlXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2FjaGVJbmRleDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCA9IGV2YWx1YXRlKGl0ZW0udGFyZ2V0c1tpXSwgaXRlbS5xdWVyeUFsbClcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgaXRlbS5ldmFsdWF0ZWQgPSBpdGVtLmV2YWx1YXRlZC5zbGljZSgwLCBpKVxuICAgICAgICAgIGl0ZW0ubG9nZ2VyLmluZm8oJ1BvbGxlcjogaXRlbSB3ZW50IHN0YWxlOiAnICsgU3RyaW5nKGl0ZW0udGFyZ2V0c1tpXSkpXG4gICAgICAgICAgLy8gQ2Fubm90IHJlc29sdmUgaXRlbSwgZXhpdFxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uZXZhbHVhdGVkW2ldID0gcmVzdWx0XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQWxsIHRhcmdldHMgZXZhbHVhdGVkLCBhZGQgdG8gcmVzb2x2ZWQgbGlzdFxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nRXJyb3IoZXJyb3IsIGl0ZW0pXG4gICAgICAvLyBDYW5ub3QgcmVzb2x2ZSBpdGVtLCBleGl0XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXQgKCkge1xuICB0aWNrQ291bnQgPSAwXG4gIGN1cnJlbnRUaWNrRGVsYXkgPSBJTklUSUFMX1RJQ0tcbn1cblxuZnVuY3Rpb24gcmVzZXQgKCkge1xuICBpbml0KClcbiAgb2JzZXJ2ZXIuc3RvcCgpXG4gIHF1ZXVlID0gW11cbn1cblxuZnVuY3Rpb24gaXNBY3RpdmUgKCkge1xuICByZXR1cm4gISFxdWV1ZS5sZW5ndGhcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXIgKGl0ZW0pIHtcbiAgdmFyIGFjdGl2ZSA9IGlzQWN0aXZlKClcblxuICBpbml0KClcblxuICBpdGVtLnN0YXJ0ID0gbmV3IERhdGUoKVxuXG4gIHF1ZXVlID0gXy5maWx0ZXIocXVldWUsIGZ1bmN0aW9uIChpKSB7XG4gICAgcmV0dXJuIGkgIT09IGl0ZW1cbiAgfSlcblxuICBxdWV1ZS5wdXNoKGl0ZW0pXG5cbiAgaWYgKCFhY3RpdmUpIHtcbiAgICBpdGVtLmxvZ2dlci5pbmZvKCdQb2xsZXI6IHN0YXJ0ZWQnKVxuICAgIHRpY2soKVxuICAgIG9ic2VydmVyLnN0YXJ0KClcbiAgfVxufVxuXG5mdW5jdGlvbiB1bnJlZ2lzdGVyIChpdGVtKSB7XG4gIHF1ZXVlID0gXy5maWx0ZXIocXVldWUsIGZ1bmN0aW9uIChpKSB7XG4gICAgcmV0dXJuIGkgIT09IGl0ZW1cbiAgfSlcbiAgaWYgKCFpc0FjdGl2ZSgpKSB7XG4gICAgb2JzZXJ2ZXIuc3RvcCgpXG4gIH1cbiAgcmV0dXJuIGl0ZW0udGFyZ2V0c1tpdGVtLmV2YWx1YXRlZC5sZW5ndGhdXG59XG5cbmZ1bmN0aW9uIHJlc29sdmUgKGl0ZW0pIHtcbiAgdmFyIHJlbWFpbmRlciA9IHVucmVnaXN0ZXIoaXRlbSlcbiAgaWYgKHJlbWFpbmRlcikge1xuICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcignUG9sbGVyOiBjb3VsZCBub3QgcmVzb2x2ZSAnICsgU3RyaW5nKHJlbWFpbmRlcikpXG4gICAgZXJyb3IuY29kZSA9ICdFUE9MTEVSOlRJTUVPVVQnXG4gICAgaXRlbS5sb2dnZXIuaW5mbyhlcnJvci5tZXNzYWdlKVxuICAgIGl0ZW0ucmVqZWN0KGVycm9yKVxuICB9IGVsc2Uge1xuICAgIHZhciBldmFsdWF0ZWQgPSBpdGVtLmlzU2luZ2xldG9uXG4gICAgICA/IGl0ZW0uZXZhbHVhdGVkWzBdXG4gICAgICA6IGl0ZW0uZXZhbHVhdGVkXG4gICAgaXRlbS5yZXNvbHZlKGV2YWx1YXRlZClcbiAgfVxuXG4gIGlmICghaXNBY3RpdmUoKSkge1xuICAgIGl0ZW0ubG9nZ2VyLmluZm8oJ1BvbGxlcjogY29tcGxldGUnKVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvZ0Vycm9yIChlcnJvciwgb3B0aW9ucykge1xuICBlcnJvci5jb2RlID0gJ0VQT0xMRVInXG4gIGlmIChvcHRpb25zLmxvZ2dlcikgb3B0aW9ucy5sb2dnZXIuZXJyb3IoZXJyb3IpXG4gIGlmIChvcHRpb25zLnN0b3BPbkVycm9yKSB0aHJvdyBlcnJvclxufVxuXG5wb2xsZXIuaXNBY3RpdmUgPSBpc0FjdGl2ZVxucG9sbGVyLnJlc2V0ID0gcmVzZXRcblxucG9sbGVyLmxvZ2dlciA9IGxvZ2dlclxucG9sbGVyLmRpc2FibGVNdXRhdGlvbk9ic2VydmVyID0gb2JzZXJ2ZXIuZGlzYWJsZVxucG9sbGVyLmRlZmF1bHRzID0gZnVuY3Rpb24gKG5ld0RlZmF1bHRzKSB7XG4gIF8uYXNzaWduKERFRkFVTFRTLCBuZXdEZWZhdWx0cylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwb2xsZXJcbiIsImltcG9ydCB0cmlnZ2VycyBmcm9tICcuL3RyaWdnZXJzJ1xuaW1wb3J0IHZhcmlhdGlvbiBmcm9tICcuL3ZhcmlhdGlvbidcbmV4cG9ydCBkZWZhdWx0IHsgdHJpZ2dlcnMsIHZhcmlhdGlvbiB9XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmlnZ2VycyAob3B0aW9ucywgY2IpIHtcbiAgY29uc3QgeyBsb2csIHN0YXRlLCBwb2xsIH0gPSBvcHRpb25zXG5cbiAgbG9nLmluZm8oJ1RyaWdnZXJzJylcblxuICByZXR1cm4gcG9sbEZvckVsZW1lbnRzKCkudGhlbihjYilcblxuICBmdW5jdGlvbiBwb2xsRm9yRWxlbWVudHMgKCkge1xuICAgIGxvZy5pbmZvKCdQb2xsaW5nIGZvciBlbGVtZW50cycpXG4gICAgcmV0dXJuIHBvbGwoJyNhdGhlbWVzLWJsb2Nrcy1ibG9jay00MjhkMmQ1NCcpLnRoZW4oYW5jaG9yID0+IHtcbiAgICAgIHN0YXRlLnNldCgnYW5jaG9yJywgYW5jaG9yKVxuICAgIH0pXG4gIH1cbn1cbiIsImltcG9ydCB7IHJlbmRlciwgaCB9IGZyb20gJ3ByZWFjdCdcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdwcmVhY3QvaG9va3MnXG5pbXBvcnQgdXRpbHMgZnJvbSAnQHF1Yml0L3V0aWxzJ1xuaW1wb3J0ICcuL3ZhcmlhdGlvbi5sZXNzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB2YXJpYXRpb24gKG9wdGlvbnMpIHtcbiAgY29uc3QgeyBpbnNlcnRBZnRlciB9ID0gdXRpbHMoKVxuICBjb25zdCB7IGxvZywgc3RhdGUgfSA9IG9wdGlvbnNcbiAgY29uc3QgcHJlZml4ID0gJ3hwLWNvdW50ZG93bi1iYW5uZXInXG4gIGNvbnN0IGFuY2hvciA9IHN0YXRlLmdldCgnYW5jaG9yJylcbiAgY29uc3QgY29weSA9ICdIdXJyeSEgT3VyIHNhbGUgZW5kcyBzb29uISdcblxuICBsb2cuaW5mbygnVmFyaWF0aW9uJylcblxuICByZXR1cm4gcmVuZGVyUGxhY2VtZW50KClcblxuICBmdW5jdGlvbiByZW5kZXJQbGFjZW1lbnQgKCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gcHJlZml4XG4gICAgcmVuZGVyKDxDb250YWluZXIgLz4sIGVsZW1lbnQpXG4gICAgaW5zZXJ0QWZ0ZXIoYW5jaG9yLCBlbGVtZW50KVxuICB9XG5cbiAgZnVuY3Rpb24gQ29udGFpbmVyICgpIHtcbiAgICBjb25zdCBjb250YWluZXJDbGFzcyA9IGAke3ByZWZpeH0tY29udGFpbmVyYFxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y29udGFpbmVyQ2xhc3N9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7Y29udGFpbmVyQ2xhc3N9X190aXRsZWB9Pntjb3B5fTwvZGl2PlxuICAgICAgICA8Q291bnRkb3duIC8+XG4gICAgICAgIDxhIGNsYXNzTmFtZT17YCR7Y29udGFpbmVyQ2xhc3N9X19jdGFgfSBocmVmPScvc2hvcCc+RmluZCBvdXQgbW9yZTwvYT5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIHVzZUNvdW50ZG93blRpbWVyIChkYXRlKSB7XG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlVGltZUxlZnQgKCkge1xuICAgICAgY29uc3QgZGlmZmVyZW5jZSA9ICtuZXcgRGF0ZShkYXRlKSAtICtuZXcgRGF0ZSgpXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRheXM6IE1hdGguZmxvb3IoZGlmZmVyZW5jZSAvICgxMDAwICogNjAgKiA2MCAqIDI0KSksXG4gICAgICAgIGhvdXJzOiBNYXRoLmZsb29yKChkaWZmZXJlbmNlIC8gKDEwMDAgKiA2MCAqIDYwKSkgJSAyNCksXG4gICAgICAgIG1pbnV0ZXM6IE1hdGguZmxvb3IoKGRpZmZlcmVuY2UgLyAxMDAwIC8gNjApICUgNjApLFxuICAgICAgICBzZWNvbmRzOiBNYXRoLmZsb29yKChkaWZmZXJlbmNlIC8gMTAwMCkgJSA2MClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBbdGltZUxlZnQsIHNldFRpbWVMZWZ0XSA9IHVzZVN0YXRlKGNhbGN1bGF0ZVRpbWVMZWZ0KCkpXG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2V0VGltZUxlZnQoY2FsY3VsYXRlVGltZUxlZnQoKSlcbiAgICAgIH0sIDEwMDApXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB0aW1lTGVmdFxuICB9XG5cbiAgZnVuY3Rpb24gQ291bnRkb3duICgpIHtcbiAgICBjb25zdCBjb3VudGRvd25DbGFzcyA9IGAke3ByZWZpeH0tY291bnRkb3duYFxuICAgIGNvbnN0IHRpbWVMZWZ0ID0gdXNlQ291bnRkb3duVGltZXIoYERlY2VtYmVyIDI1LCAyMDIyYClcbiAgICBjb25zdCB0aW1lckNvbXBvbmVudHMgPSBPYmplY3Qua2V5cyh0aW1lTGVmdCkubWFwKGludGVydmFsID0+IChcbiAgICAgIDxzcGFuPlxuICAgICAgICB7dGltZUxlZnRbaW50ZXJ2YWxdfSB7aW50ZXJ2YWx9eycgJ31cbiAgICAgIDwvc3Bhbj5cbiAgICApKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjb3VudGRvd25DbGFzc30+XG4gICAgICAgIHt0aW1lckNvbXBvbmVudHMubGVuZ3RoID8gdGltZXJDb21wb25lbnRzIDogPHNwYW4+VGltZSdzIHVwITwvc3Bhbj59XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn1cbiIsImltcG9ydCBvcHRpb25zIGZyb20gJy4vb3B0aW9ucydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHsgdHJpZ2dlcnMsIHZhcmlhdGlvbiB9KSB7XG5cdHJldHVybiAoKSA9PiB0cmlnZ2VycyhvcHRpb25zLCAoKSA9PiB2YXJpYXRpb24ob3B0aW9ucykpXG59IiwiaW1wb3J0IHRyaWdnZXJzIGZyb20gJy4vdHJpZ2dlcnMnXG5pbXBvcnQgdmFyaWF0aW9uIGZyb20gJy4vdmFyaWF0aW9uJ1xuZXhwb3J0IGRlZmF1bHQgeyB0cmlnZ2VycywgdmFyaWF0aW9uIH1cbiIsImltcG9ydCBQcm9taXNlIGZyb20gJ3N5bmMtcCdcbmltcG9ydCBjaGVja0luYWN0aXZpdHkgZnJvbSAnQHF1Yml0L2NoZWNrLWluYWN0aXZpdHknXG5pbXBvcnQgY2hlY2tFeGl0IGZyb20gJ0BxdWJpdC9jaGVjay1leGl0J1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmlnZ2VycyAob3B0aW9ucywgY2IpIHtcbiAgY29uc3QgeyBsb2csIHBvbGwsIHN0YXRlIH0gPSBvcHRpb25zXG4gIGNvbnN0IGluYWN0aXZpdHlUaW1lID0gMTBcblxuICByZXR1cm4gcG9sbEZvckVsZW1lbnRzKCkudGhlbihjaGVja0RldmljZVR5cGUpXG4gICAgLnRoZW4oY2hlY2tGb3JFeGl0SW50ZW50T3JJbmFjdGl2aXR5KVxuICAgIC50aGVuKGNiKVxuXG4gIGZ1bmN0aW9uIHBvbGxGb3JFbGVtZW50cyAoKSB7XG4gICAgcmV0dXJuIHBvbGwoJ2JvZHknKS50aGVuKGFuY2hvciA9PiB7XG4gICAgICBzdGF0ZS5zZXQoJ2FuY2hvcicsIGFuY2hvcilcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tEZXZpY2VUeXBlICgpIHtcbiAgICBsb2cuaW5mbygnQ2hlY2tpbmcgZGV2aWNlIHR5cGUnKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGNvbnN0IGlzTW9iaWxlT3JUYWJsZXQgPSAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QoXG4gICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnRcbiAgICAgIClcbiAgICAgIHJldHVybiByZXNvbHZlKGlzTW9iaWxlT3JUYWJsZXQpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrRm9yRXhpdEludGVudE9ySW5hY3Rpdml0eSAoaXNNb2JpbGVPclRhYmxldCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmIChpc01vYmlsZU9yVGFibGV0KSB7XG4gICAgICAgIGxvZy5pbmZvKCdDaGVja2luZyBmb3IgaW5hY3Rpdml0eScpXG4gICAgICAgIHJldHVybiBjaGVja0luYWN0aXZpdHkoaW5hY3Rpdml0eVRpbWUsIHJlc29sdmUpXG4gICAgICB9XG4gICAgICBsb2cuaW5mbygnQ2hlY2tpbmcgZm9yIGV4aXQgaW50ZW50JylcbiAgICAgIGNvbnN0IGV4aXRJbnRlbnQgPSBjaGVja0V4aXQocmVzb2x2ZSlcbiAgICAgIGV4aXRJbnRlbnQuaW5pdCgpXG4gICAgfSlcbiAgfVxufVxuIiwiaW1wb3J0IHsgcmVuZGVyLCBoIH0gZnJvbSAncHJlYWN0J1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdwcmVhY3QvaG9va3MnXG5pbXBvcnQgdXRpbHMgZnJvbSAnQHF1Yml0L3V0aWxzJ1xuaW1wb3J0IEdsaWRlIGZyb20gJ0BnbGlkZWpzL2dsaWRlJ1xuaW1wb3J0ICcuL3ZhcmlhdGlvbi5sZXNzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB2YXJpYXRpb24gKG9wdGlvbnMpIHtcbiAgY29uc3QgeyBhcHBlbmRDaGlsZCB9ID0gdXRpbHMoKVxuICBjb25zdCB7IGxvZywgc3RhdGUgfSA9IG9wdGlvbnNcbiAgY29uc3QgYW5jaG9yID0gc3RhdGUuZ2V0KCdhbmNob3InKVxuICBjb25zdCBwcmVmaXggPSAneHAtZXhpdEludGVudCdcbiAgY29uc3QgY29udGVudCA9IHtcbiAgICBoZWFkbGluZTogJ1dhaXQhIEJlZm9yZSB5b3UgZ28uLi4nLFxuICAgIHN1YnRpdGxlOiAnWW91IG1heSBhbHNvIGxpa2UnLFxuICAgIHJlY3M6IFtcbiAgICAgIHsgdGl0bGU6ICdQcm9kdWN0IFRpdGxlJyB9LFxuICAgICAgeyB0aXRsZTogJ1Byb2R1Y3QgVGl0bGUnIH0sXG4gICAgICB7IHRpdGxlOiAnUHJvZHVjdCBUaXRsZScgfSxcbiAgICAgIHsgdGl0bGU6ICdQcm9kdWN0IFRpdGxlJyB9LFxuICAgICAgeyB0aXRsZTogJ1Byb2R1Y3QgVGl0bGUnIH1cbiAgICBdXG4gIH1cblxuICBjb25zdCBnbGlkZU9wdGlvbnMgPSB7XG4gICAgdHlwZTogJ3NsaWRlcicsXG4gICAgYm91bmQ6IHRydWUsXG4gICAgcGVyVmlldzogMy41LFxuICAgIGdhcDogOCxcbiAgICBzY3JvbGxMb2NrOiB0cnVlLFxuICAgIHJld2luZDogZmFsc2UsXG4gICAgYnJlYWtwb2ludHM6IHtcbiAgICAgIDc2Nzoge1xuICAgICAgICBwZXJWaWV3OiAxLjI1LFxuICAgICAgICBnYXA6IDhcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmlyZSgpXG5cbiAgZnVuY3Rpb24gZmlyZSAoKSB7XG4gICAgbG9nLmluZm8oJ1J1bm5pbmcgZXhwZXJpZW5jZScpXG4gICAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQoKVxuICAgIHJlbmRlclBsYWNlbWVudChlbGVtZW50KVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRWxlbWVudCAoKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKHByZWZpeClcbiAgICBhcHBlbmRDaGlsZChhbmNob3IsIGVsZW1lbnQpXG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlclBsYWNlbWVudCAoZWxlbWVudCkge1xuICAgIHJlbmRlcihcbiAgICAgIDxQbGFjZW1lbnQ+XG4gICAgICAgIDxDYXJvdXNlbCAvPlxuICAgICAgPC9QbGFjZW1lbnQ+LFxuICAgICAgZWxlbWVudFxuICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIFBsYWNlbWVudCAoeyBjaGlsZHJlbiB9KSB7XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3MgPSBgJHtwcmVmaXh9LWNvbnRhaW5lcmBcblxuICAgIGNvbnN0IGhhbmRsZUNsb3NlID0gKCkgPT4ge1xuICAgICAgY29uc3QgZXhwZXJpZW5jZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke2NvbnRhaW5lckNsYXNzfWApXG4gICAgICBleHBlcmllbmNlLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZXhwZXJpZW5jZSlcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NvbnRhaW5lckNsYXNzfT5cbiAgICAgICAgPGRpdiBjbGFzcz17YCR7Y29udGFpbmVyQ2xhc3N9X19oZWFkZXJgfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7Y29udGFpbmVyQ2xhc3N9X190aXRsZWB9Pntjb250ZW50LmhlYWRsaW5lfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtjb250YWluZXJDbGFzc31fX3N1YnRpdGxlYH0+e2NvbnRlbnQuc3VidGl0bGV9PC9kaXY+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgJHtjb250YWluZXJDbGFzc31fX2Nsb3NlYH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUNsb3NlfVxuICAgICAgICAgID5YPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICBmdW5jdGlvbiBDYXJvdXNlbCAoKSB7XG4gICAgY29uc3QgY2Fyb3VzZWxDbGFzcyA9IGAke3ByZWZpeH0tY2Fyb3VzZWxgXG4gICAgY29uc3QgY2Fyb3VzZWxDb250YWluZXIgPSB1c2VSZWYoKVxuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgIGNvbnN0IGdsaWRlID0gbmV3IEdsaWRlKGAuJHtjYXJvdXNlbENsYXNzfWAsIGdsaWRlT3B0aW9ucylcbiAgICAgIGdsaWRlLm1vdW50KClcbiAgICAgIHJldHVybiAoKSA9PiBnbGlkZS5kZXN0cm95KClcbiAgICB9LCBbXSlcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzPXtjYXJvdXNlbENsYXNzfSByZWY9e2Nhcm91c2VsQ29udGFpbmVyfT5cbiAgICAgICAgPEFycm93cyBjYXJvdXNlbENsYXNzPXtjYXJvdXNlbENsYXNzfSAvPlxuICAgICAgICA8ZGl2IGNsYXNzPXtgJHtjYXJvdXNlbENsYXNzfV9fdHJhY2tgfSBkYXRhLWdsaWRlLWVsPSd0cmFjayc+XG4gICAgICAgICAgPHVsIGNsYXNzPXtgJHtjYXJvdXNlbENsYXNzfV9fc2xpZGVzYH0+XG4gICAgICAgICAgICB7Y29udGVudC5yZWNzLm1hcCgocmVjLCBpKSA9PiAoXG4gICAgICAgICAgICAgIDxTbGlkZSBrZXk9e2l9IHsuLi5yZWN9IC8+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIEFycm93cyAoeyBjYXJvdXNlbENsYXNzIH0pIHtcbiAgICBjb25zdCBhcnJvd0NsYXNzID0gYCR7cHJlZml4fS1hcnJvd2BcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzcz17YCR7Y2Fyb3VzZWxDbGFzc31fX2Fycm93c2B9IGRhdGEtZ2xpZGUtZWw9J2NvbnRyb2xzJz5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzPXtgJHthcnJvd0NsYXNzfSAke2Fycm93Q2xhc3N9LS1sZWZ0IHByZXZpb3VzYH1cbiAgICAgICAgICBkYXRhLWdsaWRlLWRpcj0nPCdcbiAgICAgICAgPlxuICAgICAgICAgIDxzdmdcbiAgICAgICAgICAgIHdpZHRoPScxNCdcbiAgICAgICAgICAgIGhlaWdodD0nMjMnXG4gICAgICAgICAgICB2aWV3Qm94PScwIDAgMTQgMjMnXG4gICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ1xuICAgICAgICAgID5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGQ9J00tMy44MTQ3ZS0wNiAxMS41TDAuNTY3MDk0IDEyLjA1NzlMMTEuNzM0NSAyM0wxMy4zMzc2IDIxLjg4NDJMMi43MzczMSAxMS41TDEzLjMzNzYgMS4xMTU4MUwxMS43MzQ1IDBMMC41NjcwOTQgMTAuOTQyMUwtMy44MTQ3ZS0wNiAxMS41WidcbiAgICAgICAgICAgICAgZmlsbD0nIzk3OTc5NydcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPXtgJHthcnJvd0NsYXNzfSBuZXh0YH0gZGF0YS1nbGlkZS1kaXI9Jz4nPlxuICAgICAgICAgIDxzdmdcbiAgICAgICAgICAgIHdpZHRoPScxNCdcbiAgICAgICAgICAgIGhlaWdodD0nMjMnXG4gICAgICAgICAgICB2aWV3Qm94PScwIDAgMTQgMjMnXG4gICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ1xuICAgICAgICAgID5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGQ9J00xNCAxMS41TDEzLjQzMjkgMTAuOTQyMUwyLjI2NTQ3IC0xLjkwNzM1ZS0wNkwwLjY2MjM1NCAxLjExNThMMTEuMjYyNyAxMS41TDAuNjYyMzU0IDIxLjg4NDJMMi4yNjU0NyAyM0wxMy40MzI5IDEyLjA1NzlMMTQgMTEuNVonXG4gICAgICAgICAgICAgIGZpbGw9J2JsYWNrJ1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICBmdW5jdGlvbiBTbGlkZSAoKSB7XG4gICAgY29uc3Qgc2xpZGVDbGFzcyA9IGAke3ByZWZpeH0tc2xpZGVgXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGEgY2xhc3NOYW1lPXtzbGlkZUNsYXNzfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake3NsaWRlQ2xhc3N9X19pbWFnZWB9PlxuICAgICAgICAgIDxpbWcgc3JjPXsnaHR0cHM6Ly9waWNzdW0ucGhvdG9zLzIwMCd9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7c2xpZGVDbGFzc31fX2NvbnRlbnRgfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7c2xpZGVDbGFzc31fX3RpdGxlYH0+XG4gICAgICAgICAgICBQcm9kdWN0IE5hbWVcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICBjbGFzc05hbWU9e2Ake3NsaWRlQ2xhc3N9X19vbGQtcHJpY2UgJHtzbGlkZUNsYXNzfV9fb2xkLXByaWNlLS1zdHJpa2VgfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIMKjMTAuMDBcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7c2xpZGVDbGFzc31fX25ldy1wcmljZWB9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake3NsaWRlQ2xhc3N9X19wcmljZS12YWx1ZWB9PsKjMTIuMDA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtzbGlkZUNsYXNzfV9fcHJpY2Utc2F2ZWRgfT7CozEyLjAwPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hPlxuICAgIClcbiAgfVxufVxuIiwiaW1wb3J0IGNyZWF0ZUV4cGVyaWVuY2UgZnJvbSAnLi9jcmVhdGVFeHBlcmllbmNlJ1xuXG4vLyBFeHBlcmllbmNlc1xuaW1wb3J0IGNvdW50ZG93bkJhbm5lciBmcm9tICcuL2NvdW50ZG93bkJhbm5lcidcbmltcG9ydCBleGl0SW50ZW50IGZyb20gJy4vZXhpdEludGVudCdcblxuZXhwb3J0IGRlZmF1bHQgW2NyZWF0ZUV4cGVyaWVuY2UoY291bnRkb3duQmFubmVyKSwgY3JlYXRlRXhwZXJpZW5jZShleGl0SW50ZW50KV1cbiIsImltcG9ydCBwb2xsIGZyb20gJ0BxdWJpdC9wb2xsZXInXG5cbmNvbnN0IGV4cGVyaWVuY2VTdGF0ZSA9IHt9XG5cbmZ1bmN0aW9uIHNldCAoa2V5LCBkYXRhKSB7XG4gIGV4cGVyaWVuY2VTdGF0ZVtrZXldID0gZGF0YVxufVxuXG5mdW5jdGlvbiBnZXQgKGtleSkge1xuICByZXR1cm4gZXhwZXJpZW5jZVN0YXRlW2tleV1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBwb2xsLFxuICBzdGF0ZToge1xuICAgIHNldCxcbiAgICBnZXRcbiAgfSxcbiAgbG9nOiB7XG4gICAgaW5mbzogY29uc29sZS5sb2csXG4gICAgd2FybjogY29uc29sZS53YXJuLFxuICAgIGVycm9yOiBjb25zb2xlLmVycm9yXG4gIH1cbn1cbiIsImltcG9ydCBwb2xsIGZyb20gJ0BxdWJpdC9wb2xsZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJ1bk1hcHBlciAoKSB7XG4gIHdpbmRvdy54cF9ldmVudHMgPSBbXVxuXG4gIGZ1bmN0aW9uIGVtaXRFdmVudCAoZXZlbnQpIHtcbiAgICB3aW5kb3cueHBfZXZlbnRzLnB1c2goZXZlbnQpXG4gIH1cblxuICByZXR1cm4gcG9sbCgnd2luZG93LmRpZ2l0YWxEYXRhJykudGhlbihkYXRhTGF5ZXIgPT4ge1xuICAgIGVtaXRFdmVudCh7XG4gICAgICBldmVudE5hbWU6ICd4cFZpZXcnXG4gICAgfSlcbiAgfSlcbn1cbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiLnhwLWNvdW50ZG93bi1iYW5uZXIge1xcbiAgbWFyZ2luOiB1bnNldCAhaW1wb3J0YW50O1xcbiAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcXG4gIG1heC13aWR0aDogdW5zZXQgIWltcG9ydGFudDtcXG59XFxuLnhwLWNvdW50ZG93bi1iYW5uZXIgKyAud3AtYmxvY2stc3BhY2VyIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcbi54cC1jb3VudGRvd24tYmFubmVyLWNvbnRhaW5lciB7XFxuICBwYWRkaW5nOiAycmVtO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBiYWNrZ3JvdW5kOiAjZmY1ODU4O1xcbiAgY29sb3I6ICNmZmZmZmY7XFxufVxcbi54cC1jb3VudGRvd24tYmFubmVyLWNvbnRhaW5lcl9fdGl0bGUge1xcbiAgZm9udC1zaXplOiAycmVtO1xcbn1cXG5AbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC54cC1jb3VudGRvd24tYmFubmVyLWNvbnRhaW5lcl9fdGl0bGUge1xcbiAgICBmb250LXNpemU6IDEuNXJlbTtcXG4gIH1cXG59XFxuLnhwLWNvdW50ZG93bi1iYW5uZXItY29udGFpbmVyX19jdGEge1xcbiAgYmFja2dyb3VuZDogIzIxMjEyMTtcXG4gIHBhZGRpbmc6IDAuNXJlbSAxcmVtO1xcbiAgbWFyZ2luLXRvcDogMXJlbTtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIGNvbG9yOiAjZmZmZmZmO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG5cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL3ZhcmlhdGlvbi5sZXNzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFDO0VBSUMsd0JBQUE7RUFDQSxzQkFBQTtFQUNBLDJCQUFBO0FBRkY7QUFKQztFQVVDLGFBQUE7QUFIRjtBQVBDO0VBY0MsYUFBQTtFQUNBLGtCQUFBO0VBQ0EsV0FBQTtFQUNBLG1CQUFBO0VBQ0EsY0FBQTtBQUpGO0FBS0U7RUFDRSxlQUFBO0FBSEo7QUFJSTtFQUFBO0lBQ0UsaUJBQUE7RUFESjtBQUNGO0FBR0U7RUFDRSxtQkFBQTtFQUNBLG9CQUFBO0VBQ0EsZ0JBQUE7RUFDQSxxQkFBQTtFQUNBLGNBQUE7RUFDQSxxQkFBQTtBQURKXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIkBwcmVmaXg6IH4nLnhwLWNvdW50ZG93bi1iYW5uZXInO1xcbkBjb250YWluZXI6IH4nQHtwcmVmaXh9LWNvbnRhaW5lcic7XFxuXFxuQHtwcmVmaXh9IHtcXG4gIG1hcmdpbjogdW5zZXQgIWltcG9ydGFudDtcXG4gIHdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XFxuICBtYXgtd2lkdGg6IHVuc2V0ICFpbXBvcnRhbnQ7XFxufVxcblxcbkB7cHJlZml4fSArIC53cC1ibG9jay1zcGFjZXIge1xcbiAgZGlzcGxheTogbm9uZTtcXG59XFxuXFxuQHtjb250YWluZXJ9IHtcXG4gIHBhZGRpbmc6IDJyZW07XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJhY2tncm91bmQ6ICNmZjU4NTg7XFxuICBjb2xvcjogI2ZmZmZmZjtcXG4gICZfX3RpdGxlIHtcXG4gICAgZm9udC1zaXplOiAycmVtO1xcbiAgICBAbWVkaWEobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgICAgIGZvbnQtc2l6ZTogMS41cmVtO1xcbiAgICB9XFxuICB9XFxuICAmX19jdGEge1xcbiAgICBiYWNrZ3JvdW5kOiAjMjEyMTIxO1xcbiAgICBwYWRkaW5nOiAwLjVyZW0gMXJlbTtcXG4gICAgbWFyZ2luLXRvcDogMXJlbTtcXG4gICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbiAgICBjb2xvcjogI2ZmZmZmZjtcXG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgfVxcbn1cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIueHAtZXhpdEludGVudCB7XFxuICBwb3NpdGlvbjogZml4ZWQ7XFxuICBib3R0b206IDQwcHg7XFxuICBsZWZ0OiA0MHB4O1xcbiAgcmlnaHQ6IDQwcHg7XFxuICB6LWluZGV4OiA5OTk5OTk5OTk5O1xcbn1cXG5AbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC54cC1leGl0SW50ZW50IHtcXG4gICAgYm90dG9tOiAyMHB4O1xcbiAgICBsZWZ0OiAyMHB4O1xcbiAgICByaWdodDogMjBweDtcXG4gIH1cXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWwge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbCAqIHtcXG4gIGJveC1zaXppbmc6IGluaGVyaXQ7XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsX190cmFjayB7XFxuICBvdmVyZmxvdzogaGlkZGVuO1xcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbF9fc2xpZGVzIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgbGlzdC1zdHlsZTogbm9uZTtcXG4gIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gIHRyYW5zZm9ybS1zdHlsZTogcHJlc2VydmUtM2Q7XFxuICB0b3VjaC1hY3Rpb246IHBhbi1ZO1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIHBhZGRpbmc6IDA7XFxuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgd2lsbC1jaGFuZ2U6IHRyYW5zZm9ybTtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWxfX3NsaWRlcy0tZHJhZ2dpbmcge1xcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsX19zbGlkZSB7XFxuICB3aWR0aDogMTAwJTtcXG4gIGhlaWdodDogMTAwJTtcXG4gIGZsZXgtc2hyaW5rOiAwO1xcbiAgd2hpdGUtc3BhY2U6IG5vcm1hbDtcXG4gIHVzZXItc2VsZWN0OiBub25lO1xcbiAgLXdlYmtpdC10b3VjaC1jYWxsb3V0OiBub25lO1xcbiAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWxfX3NsaWRlIGEge1xcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XFxuICAtd2Via2l0LXVzZXItZHJhZzogbm9uZTtcXG4gIC1tb3otdXNlci1zZWxlY3Q6IG5vbmU7XFxuICAtbXMtdXNlci1zZWxlY3Q6IG5vbmU7XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsX19hcnJvd3Mge1xcbiAgLXdlYmtpdC10b3VjaC1jYWxsb3V0OiBub25lO1xcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsX19idWxsZXRzIHtcXG4gIC13ZWJraXQtdG91Y2gtY2FsbG91dDogbm9uZTtcXG4gIHVzZXItc2VsZWN0OiBub25lO1xcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbC0tcnRsIHtcXG4gIGRpcmVjdGlvbjogcnRsO1xcbn1cXG4ueHAtZXhpdEludGVudC1jb250YWluZXIge1xcbiAgYmFja2dyb3VuZDogI2ZmZmZmZjtcXG4gIGJveC1zaGFkb3c6IDBweCAxcHggMTBweCByZ2JhKDAsIDAsIDAsIDAuMjI2MDQzKTtcXG4gIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gIGJvcmRlci10b3A6IDVweCBzb2xpZCAjZmY1ODU4O1xcbiAgcGFkZGluZzogMjJweCAxNXB4O1xcbn1cXG5AbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC54cC1leGl0SW50ZW50LWNvbnRhaW5lciB7XFxuICAgIHBhZGRpbmc6IDhweCAxNXB4IDE1cHggMTVweDtcXG4gICAgYm9yZGVyLXRvcDogNHB4IHNvbGlkICNmZjU4NTg7XFxuICB9XFxufVxcbi54cC1leGl0SW50ZW50LWNvbnRhaW5lcl9faGVhZGVyIHtcXG4gIHBhZGRpbmctYm90dG9tOiAxMnB4O1xcbn1cXG4ueHAtZXhpdEludGVudC1jb250YWluZXJfX3RpdGxlIHtcXG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICBmb250LXNpemU6IDIwcHg7XFxuICBsaW5lLWhlaWdodDogMjVweDtcXG4gIGNvbG9yOiAjMzMzMzMzO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgcGFkZGluZy1ib3R0b206IDNweDtcXG59XFxuQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAueHAtZXhpdEludGVudC1jb250YWluZXJfX3RpdGxlIHtcXG4gICAgZm9udC1zaXplOiAxNnB4O1xcbiAgICBsaW5lLWhlaWdodDogMjBweDtcXG4gICAgcGFkZGluZy1sZWZ0OiAyMHB4O1xcbiAgICBwYWRkaW5nLXJpZ2h0OiAyMHB4O1xcbiAgfVxcbn1cXG4ueHAtZXhpdEludGVudC1jb250YWluZXJfX3N1YnRpdGxlIHtcXG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBmb250LXNpemU6IDE2cHg7XFxuICBsaW5lLWhlaWdodDogMjBweDtcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIGxldHRlci1zcGFjaW5nOiAwLjA5Mjg1NzFweDtcXG4gIGNvbG9yOiAjMmUyZTJlO1xcbn1cXG5AbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC54cC1leGl0SW50ZW50LWNvbnRhaW5lcl9fc3VidGl0bGUge1xcbiAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICBmb250LXNpemU6IDEzcHg7XFxuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xcbiAgfVxcbn1cXG4ueHAtZXhpdEludGVudC1jb250YWluZXJfX2Nsb3NlIHtcXG4gIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB1bnNldDtcXG4gIGJvcmRlcjogdW5zZXQ7XFxuICB3aWR0aDogMjZweDtcXG4gIGhlaWdodDogMjZweDtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogMTBweDtcXG4gIHJpZ2h0OiAxMHB4O1xcbiAgcGFkZGluZzogdW5zZXQ7XFxuICBjb2xvcjogIzAwMDAwMDtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWwge1xcbiAgcGFkZGluZy1sZWZ0OiA0MHB4O1xcbiAgcGFkZGluZy1yaWdodDogNDBweDtcXG59XFxuQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAueHAtZXhpdEludGVudC1jYXJvdXNlbCB7XFxuICAgIHBhZGRpbmctbGVmdDogdW5zZXQ7XFxuICAgIHBhZGRpbmctcmlnaHQ6IHVuc2V0O1xcbiAgfVxcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbF9fc2xpZGVzIHtcXG4gIG1hcmdpbjogdW5zZXQ7XFxufVxcbi54cC1leGl0SW50ZW50LWFycm93IHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogNTAlO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpO1xcbiAgcmlnaHQ6IC0xNXB4O1xcbiAgcGFkZGluZzogMzBweCAxNXB4O1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbn1cXG4ueHAtZXhpdEludGVudC1hcnJvdy0tbGVmdCB7XFxuICBsZWZ0OiAtMTVweDtcXG4gIHJpZ2h0OiB1bnNldDtcXG59XFxuQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAueHAtZXhpdEludGVudC1hcnJvdyB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxuICB9XFxufVxcbi54cC1leGl0SW50ZW50LXNsaWRlIHtcXG4gIGJhY2tncm91bmQ6ICNmZmZmZmY7XFxuICBib3JkZXI6IDFweCBzb2xpZCAjY2NjY2NjO1xcbiAgcGFkZGluZzogMTNweDtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxufVxcbkBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLnhwLWV4aXRJbnRlbnQtc2xpZGUge1xcbiAgICBwYWRkaW5nOiAxMnB4O1xcbiAgICBtaW4taGVpZ2h0OiA5MHB4O1xcbiAgfVxcbn1cXG4ueHAtZXhpdEludGVudC1zbGlkZV9faW1hZ2Uge1xcbiAgd2lkdGg6IDMwJTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBhbGlnbi1pdGVtczogY2VudGVyO1xcbn1cXG4ueHAtZXhpdEludGVudC1zbGlkZV9faW1hZ2UgaW1nIHtcXG4gIG1heC13aWR0aDogMTAwJTtcXG4gIG1heC1oZWlnaHQ6IDcwcHg7XFxufVxcbi54cC1leGl0SW50ZW50LXNsaWRlX19jb250ZW50IHtcXG4gIHdpZHRoOiBjYWxjKDcwJSAtIDEzcHgpO1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XFxuICBwYWRkaW5nLXRvcDogNnB4O1xcbn1cXG5AbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC54cC1leGl0SW50ZW50LXNsaWRlX19jb250ZW50IHtcXG4gICAgcGFkZGluZy10b3A6IHVuc2V0O1xcbiAgfVxcbn1cXG4ueHAtZXhpdEludGVudC1zbGlkZV9fdGl0bGUge1xcbiAgbWF4LXdpZHRoOiAxMDAlO1xcbiAgd2hpdGUtc3BhY2U6IG5vcm1hbDtcXG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBmb250LXNpemU6IDE0cHg7XFxuICBsaW5lLWhlaWdodDogMTRweDtcXG4gIGxldHRlci1zcGFjaW5nOiAwLjFweDtcXG4gIGNvbG9yOiAjMzMzMzMzO1xcbn1cXG4ueHAtZXhpdEludGVudC1zbGlkZV9fb2xkLXByaWNlIHtcXG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG4gIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICBmb250LXNpemU6IDExcHg7XFxuICBsaW5lLWhlaWdodDogMTRweDtcXG4gIGxldHRlci1zcGFjaW5nOiAwLjA5Mjg1NzFweDtcXG4gIGNvbG9yOiAjNjY2NjY2O1xcbn1cXG4ueHAtZXhpdEludGVudC1zbGlkZV9fb2xkLXByaWNlLS1zdHJpa2Uge1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7XFxufVxcbi54cC1leGl0SW50ZW50LXNsaWRlX19uZXctcHJpY2Uge1xcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gIGZvbnQtc2l6ZTogMTNweDtcXG4gIGxpbmUtaGVpZ2h0OiAxNHB4O1xcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDkyODU3MXB4O1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGZsZXgtd3JhcDogd3JhcDtcXG59XFxuLnhwLWV4aXRJbnRlbnQtc2xpZGVfX3ByaWNlLXZhbHVlIHtcXG4gIGNvbG9yOiAjMDAwMDAwO1xcbiAgcGFkZGluZy1yaWdodDogMTJweDtcXG59XFxuLnhwLWV4aXRJbnRlbnQtc2xpZGVfX3ByaWNlLXNhdmVkIHtcXG4gIGNvbG9yOiAjZmY1ODU4O1xcbn1cXG5cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC92YXJpYXRpb24ubGVzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQztFQVFDLGVBQUE7RUFDQSxZQUFBO0VBQ0EsVUFBQTtFQUNBLFdBQUE7RUFDQSxtQkFBQTtBQU5GO0FBT0U7RUFBQTtJQUNFLFlBQUE7SUFDQSxVQUFBO0lBQ0EsV0FBQTtFQUpGO0FBQ0Y7QUFiQztFQXFCQyxrQkFBQTtFQUNBLFdBQUE7RUFDQSxzQkFBQTtBQUxGO0FBbEJDO0VBeUJHLG1CQUFBO0FBSko7QUFNRTtFQUNFLGdCQUFBO0FBSko7QUFNRTtFQUNFLGtCQUFBO0VBQ0EsV0FBQTtFQUNBLGdCQUFBO0VBQ0EsMkJBQUE7RUFDQSw0QkFBQTtFQUNBLG1CQUFBO0VBQ0EsZ0JBQUE7RUFDQSxVQUFBO0VBQ0EsbUJBQUE7RUFDQSxhQUFBO0VBQ0EsaUJBQUE7RUFDQSxzQkFBQTtBQUpKO0FBS0k7RUFDRSxpQkFBQTtBQUhOO0FBTUU7RUFDRSxXQUFBO0VBQ0EsWUFBQTtFQUNBLGNBQUE7RUFDQSxtQkFBQTtFQUNBLGlCQUFBO0VBQ0EsMkJBQUE7RUFDQSx3Q0FBQTtBQUpKO0FBSEU7RUFTSSxpQkFBQTtFQUNBLHVCQUFBO0VBQ0Esc0JBQUE7RUFDQSxxQkFBQTtBQUhOO0FBTUU7RUFDRSwyQkFBQTtFQUNBLGlCQUFBO0FBSko7QUFNRTtFQUNFLDJCQUFBO0VBQ0EsaUJBQUE7QUFKSjtBQU1FO0VBQ0UsY0FBQTtBQUpKO0FBbkVDO0VBNEVDLG1CQUFBO0VBQ0EsZ0RBQUE7RUFDQSxrQkFBQTtFQUNBLDZCQUFBO0VBQ0Esa0JBQUE7QUFORjtBQU9FO0VBQUE7SUFDRSwyQkFBQTtJQUNBLDZCQUFBO0VBSkY7QUFDRjtBQUtFO0VBQ0Usb0JBQUE7QUFISjtBQUtFO0VBQ0Usa0JBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7RUFDQSxpQkFBQTtFQUNBLGNBQUE7RUFDQSxrQkFBQTtFQUNBLG1CQUFBO0FBSEo7QUFJSTtFQUFBO0lBQ0UsZUFBQTtJQUNBLGlCQUFBO0lBQ0Esa0JBQUE7SUFDQSxtQkFBQTtFQURKO0FBQ0Y7QUFHRTtFQUNFLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFDQSxrQkFBQTtFQUNBLDJCQUFBO0VBQ0EsY0FBQTtBQURKO0FBRUk7RUFBQTtJQUNFLGdCQUFBO0lBQ0EsZUFBQTtJQUNBLGlCQUFBO0VBQ0o7QUFDRjtBQUNFO0VBQ0UsNEJBQUE7RUFDQSx1QkFBQTtFQUNBLGFBQUE7RUFDQSxXQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0EsU0FBQTtFQUNBLFdBQUE7RUFDQSxjQUFBO0VBQ0EsY0FBQTtBQUNKO0FBaElDO0VBb0lDLGtCQUFBO0VBQ0EsbUJBQUE7QUFERjtBQUVFO0VBQUE7SUFDRSxtQkFBQTtJQUNBLG9CQUFBO0VBQ0Y7QUFDRjtBQUFFO0VBQ0UsYUFBQTtBQUVKO0FBN0lDO0VBZ0pDLGtCQUFBO0VBQ0EsUUFBQTtFQUNBLDJCQUFBO0VBQ0EsWUFBQTtFQUNBLGtCQUFBO0VBQ0EsZUFBQTtBQUFGO0FBQ0U7RUFDRSxXQUFBO0VBQ0EsWUFBQTtBQUNKO0FBQ0U7RUFBQTtJQUNFLGFBQUE7RUFFRjtBQUNGO0FBOUpDO0VBZ0tDLG1CQUFBO0VBQ0EseUJBQUE7RUFDQSxhQUFBO0VBQ0EsYUFBQTtFQUNBLDhCQUFBO0VBQ0EscUJBQUE7QUFDRjtBQUFFO0VBQUE7SUFDRSxhQUFBO0lBQ0EsZ0JBQUE7RUFHRjtBQUNGO0FBRkU7RUFDRSxVQUFBO0VBQ0EsYUFBQTtFQUNBLG1CQUFBO0FBSUo7QUFQRTtFQUtJLGVBQUE7RUFDQSxnQkFBQTtBQUtOO0FBRkU7RUFDRSx1QkFBQTtFQUNBLGFBQUE7RUFDQSxzQkFBQTtFQUNBLDhCQUFBO0VBQ0EsZ0JBQUE7QUFJSjtBQUhJO0VBQUE7SUFDRSxrQkFBQTtFQU1KO0FBQ0Y7QUFKRTtFQUNFLGVBQUE7RUFDQSxtQkFBQTtFQUNBLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFDQSxxQkFBQTtFQUNBLGNBQUE7QUFNSjtBQUpFO0VBQ0Usa0JBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7RUFDQSxpQkFBQTtFQUNBLDJCQUFBO0VBQ0EsY0FBQTtBQU1KO0FBTEk7RUFDRSw2QkFBQTtBQU9OO0FBSkU7RUFDRSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0EsMkJBQUE7RUFDQSxhQUFBO0VBQ0EsZUFBQTtBQU1KO0FBSkU7RUFDRSxjQUFBO0VBQ0EsbUJBQUE7QUFNSjtBQUpFO0VBQ0UsY0FBQTtBQU1KXCIsXCJzb3VyY2VzQ29udGVudFwiOltcIkB0aWNrZXQ6IH4nLnhwLWV4aXRJbnRlbnQnO1xcbkBjb250YWluZXJDbGFzczogfidAe3RpY2tldH0tY29udGFpbmVyJztcXG5AZ2xpZGU6IH4nQHt0aWNrZXR9LWNhcm91c2VsJztcXG5AY2Fyb3VzZWxDbGFzczogfidAe3RpY2tldH0tY2Fyb3VzZWwnO1xcbkBzbGlkZUNsYXNzOiB+J0B7dGlja2V0fS1zbGlkZSc7XFxuQGFycm93Q2xhc3M6IH4nQHt0aWNrZXR9LWFycm93JztcXG5cXG5Ae3RpY2tldH0ge1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYm90dG9tOiA0MHB4O1xcbiAgbGVmdDogNDBweDtcXG4gIHJpZ2h0OiA0MHB4O1xcbiAgei1pbmRleDogOTk5OTk5OTk5OTtcXG4gIEBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgICBib3R0b206IDIwcHg7XFxuICAgIGxlZnQ6IDIwcHg7XFxuICAgIHJpZ2h0OiAyMHB4O1xcbiAgfVxcbn1cXG5cXG5Ae2dsaWRlfSB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogMTAwJTtcXG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxuICAqIHtcXG4gICAgYm94LXNpemluZzogaW5oZXJpdDtcXG4gIH1cXG4gICZfX3RyYWNrIHtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gIH1cXG4gICZfX3NsaWRlcyB7XFxuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICAgIGJhY2tmYWNlLXZpc2liaWxpdHk6IGhpZGRlbjtcXG4gICAgdHJhbnNmb3JtLXN0eWxlOiBwcmVzZXJ2ZS0zZDtcXG4gICAgdG91Y2gtYWN0aW9uOiBwYW4tWTtcXG4gICAgb3ZlcmZsb3c6IGhpZGRlbjtcXG4gICAgcGFkZGluZzogMDtcXG4gICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiBub3dyYXA7XFxuICAgIHdpbGwtY2hhbmdlOiB0cmFuc2Zvcm07XFxuICAgICYtLWRyYWdnaW5nIHtcXG4gICAgICB1c2VyLXNlbGVjdDogbm9uZTtcXG4gICAgfVxcbiAgfVxcbiAgJl9fc2xpZGUge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICBmbGV4LXNocmluazogMDtcXG4gICAgd2hpdGUtc3BhY2U6IG5vcm1hbDtcXG4gICAgdXNlci1zZWxlY3Q6IG5vbmU7XFxuICAgIC13ZWJraXQtdG91Y2gtY2FsbG91dDogbm9uZTtcXG4gICAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgYSB7XFxuICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XFxuICAgICAgLXdlYmtpdC11c2VyLWRyYWc6IG5vbmU7XFxuICAgICAgLW1vei11c2VyLXNlbGVjdDogbm9uZTtcXG4gICAgICAtbXMtdXNlci1zZWxlY3Q6IG5vbmU7XFxuICAgIH1cXG4gIH1cXG4gICZfX2Fycm93cyB7XFxuICAgIC13ZWJraXQtdG91Y2gtY2FsbG91dDogbm9uZTtcXG4gICAgdXNlci1zZWxlY3Q6IG5vbmU7XFxuICB9XFxuICAmX19idWxsZXRzIHtcXG4gICAgLXdlYmtpdC10b3VjaC1jYWxsb3V0OiBub25lO1xcbiAgICB1c2VyLXNlbGVjdDogbm9uZTtcXG4gIH1cXG4gICYtLXJ0bCB7XFxuICAgIGRpcmVjdGlvbjogcnRsO1xcbiAgfVxcbn1cXG5cXG5Ae2NvbnRhaW5lckNsYXNzfSB7XFxuICBiYWNrZ3JvdW5kOiAjZmZmZmZmO1xcbiAgYm94LXNoYWRvdzogMHB4IDFweCAxMHB4IHJnYmEoMCwgMCwgMCwgMC4yMjYwNDMpO1xcbiAgYm9yZGVyLXJhZGl1czogNXB4O1xcbiAgYm9yZGVyLXRvcDogNXB4IHNvbGlkICNmZjU4NTg7XFxuICBwYWRkaW5nOiAyMnB4IDE1cHg7XFxuICBAbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gICAgcGFkZGluZzogOHB4IDE1cHggMTVweCAxNXB4O1xcbiAgICBib3JkZXItdG9wOiA0cHggc29saWQgI2ZmNTg1ODtcXG4gIH1cXG4gICZfX2hlYWRlciB7XFxuICAgIHBhZGRpbmctYm90dG9tOiAxMnB4O1xcbiAgfVxcbiAgJl9fdGl0bGUge1xcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGZvbnQtc2l6ZTogMjBweDtcXG4gICAgbGluZS1oZWlnaHQ6IDI1cHg7XFxuICAgIGNvbG9yOiAjMzMzMzMzO1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIHBhZGRpbmctYm90dG9tOiAzcHg7XFxuICAgIEBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgICAgIGZvbnQtc2l6ZTogMTZweDtcXG4gICAgICBsaW5lLWhlaWdodDogMjBweDtcXG4gICAgICBwYWRkaW5nLWxlZnQ6IDIwcHg7XFxuICAgICAgcGFkZGluZy1yaWdodDogMjBweDtcXG4gICAgfVxcbiAgfVxcbiAgJl9fc3VidGl0bGUge1xcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XFxuICAgIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXG4gICAgbGluZS1oZWlnaHQ6IDIwcHg7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuMDkyODU3MXB4O1xcbiAgICBjb2xvcjogIzJlMmUyZTtcXG4gICAgQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgICBmb250LXNpemU6IDEzcHg7XFxuICAgICAgbGluZS1oZWlnaHQ6IDE2cHg7XFxuICAgIH1cXG4gIH1cXG4gICZfX2Nsb3NlIHtcXG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogdW5zZXQ7XFxuICAgIGJvcmRlcjogdW5zZXQ7XFxuICAgIHdpZHRoOiAyNnB4O1xcbiAgICBoZWlnaHQ6IDI2cHg7XFxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gICAgdG9wOiAxMHB4O1xcbiAgICByaWdodDogMTBweDtcXG4gICAgcGFkZGluZzogdW5zZXQ7XFxuICAgIGNvbG9yOiAjMDAwMDAwO1xcbiAgfVxcbn1cXG5cXG5Ae2Nhcm91c2VsQ2xhc3N9IHtcXG4gIHBhZGRpbmctbGVmdDogNDBweDtcXG4gIHBhZGRpbmctcmlnaHQ6IDQwcHg7XFxuICBAbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gICAgcGFkZGluZy1sZWZ0OiB1bnNldDtcXG4gICAgcGFkZGluZy1yaWdodDogdW5zZXQ7XFxuICB9XFxuICAmX19zbGlkZXMge1xcbiAgICBtYXJnaW46IHVuc2V0O1xcbiAgfVxcbn1cXG5cXG5Ae2Fycm93Q2xhc3N9IHtcXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4gIHRvcDogNTAlO1xcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpO1xcbiAgcmlnaHQ6IC0xNXB4O1xcbiAgcGFkZGluZzogMzBweCAxNXB4O1xcbiAgY3Vyc29yOiBwb2ludGVyO1xcbiAgJi0tbGVmdCB7XFxuICAgIGxlZnQ6IC0xNXB4O1xcbiAgICByaWdodDogdW5zZXQ7XFxuICB9XFxuICBAbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gICAgZGlzcGxheTogbm9uZTtcXG4gIH1cXG59XFxuXFxuQHtzbGlkZUNsYXNzfSB7XFxuICBiYWNrZ3JvdW5kOiAjZmZmZmZmO1xcbiAgYm9yZGVyOiAxcHggc29saWQgI2NjY2NjYztcXG4gIHBhZGRpbmc6IDEzcHg7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbiAgQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAgIHBhZGRpbmc6IDEycHg7XFxuICAgIG1pbi1oZWlnaHQ6IDkwcHg7XFxuICB9XFxuICAmX19pbWFnZSB7XFxuICAgIHdpZHRoOiAzMCU7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIGltZyB7XFxuICAgICAgbWF4LXdpZHRoOiAxMDAlO1xcbiAgICAgIG1heC1oZWlnaHQ6IDcwcHg7XFxuICAgIH1cXG4gIH1cXG4gICZfX2NvbnRlbnQge1xcbiAgICB3aWR0aDogY2FsYyg3MCUgLSAxM3B4KTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgICBwYWRkaW5nLXRvcDogNnB4O1xcbiAgICBAbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gICAgICBwYWRkaW5nLXRvcDogdW5zZXQ7XFxuICAgIH1cXG4gIH1cXG4gICZfX3RpdGxlIHtcXG4gICAgbWF4LXdpZHRoOiAxMDAlO1xcbiAgICB3aGl0ZS1zcGFjZTogbm9ybWFsO1xcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XFxuICAgIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICAgIGZvbnQtc2l6ZTogMTRweDtcXG4gICAgbGluZS1oZWlnaHQ6IDE0cHg7XFxuICAgIGxldHRlci1zcGFjaW5nOiAwLjFweDtcXG4gICAgY29sb3I6ICMzMzMzMzM7XFxuICB9XFxuICAmX19vbGQtcHJpY2Uge1xcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XFxuICAgIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICAgIGZvbnQtc2l6ZTogMTFweDtcXG4gICAgbGluZS1oZWlnaHQ6IDE0cHg7XFxuICAgIGxldHRlci1zcGFjaW5nOiAwLjA5Mjg1NzFweDtcXG4gICAgY29sb3I6ICM2NjY2NjY7XFxuICAgICYtLXN0cmlrZSB7XFxuICAgICAgdGV4dC1kZWNvcmF0aW9uOiBsaW5lLXRocm91Z2g7XFxuICAgIH1cXG4gIH1cXG4gICZfX25ldy1wcmljZSB7XFxuICAgIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG4gICAgZm9udC13ZWlnaHQ6IDcwMDtcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcbiAgICBsaW5lLWhlaWdodDogMTRweDtcXG4gICAgbGV0dGVyLXNwYWNpbmc6IDAuMDkyODU3MXB4O1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBmbGV4LXdyYXA6IHdyYXA7XFxuICB9XFxuICAmX19wcmljZS12YWx1ZSB7XFxuICAgIGNvbG9yOiAjMDAwMDAwO1xcbiAgICBwYWRkaW5nLXJpZ2h0OiAxMnB4O1xcbiAgfVxcbiAgJl9fcHJpY2Utc2F2ZWQge1xcbiAgICBjb2xvcjogI2ZmNTg1ODtcXG4gIH1cXG59XCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdOyAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG5cbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBpdGVtWzVdICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpO1xuICAgICAgfVxuXG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG5cbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTsgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcblxuXG4gIGxpc3QuaSA9IGZ1bmN0aW9uIGkobW9kdWxlcywgbWVkaWEsIGRlZHVwZSwgc3VwcG9ydHMsIGxheWVyKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCB1bmRlZmluZWRdXTtcbiAgICB9XG5cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuXG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG5cbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcblxuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGxheWVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVs1XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcblxuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICB2YXIgc291cmNlVVJMcyA9IGNzc01hcHBpbmcuc291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgcmV0dXJuIFwiLyojIHNvdXJjZVVSTD1cIi5jb25jYXQoY3NzTWFwcGluZy5zb3VyY2VSb290IHx8IFwiXCIpLmNvbmNhdChzb3VyY2UsIFwiICovXCIpO1xuICAgIH0pO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KHNvdXJjZVVSTHMpLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9zcmMvY3JlYXRlJykocmVxdWlyZSgnLi9zcmMvbG9nZ2VyL2Jyb3dzZXInKSgpKVxuIiwidmFyIF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG52YXIgcGF0dGVybnMgPSByZXF1aXJlKCcuL3BhdHRlcm5zJylcbnZhciBMRVZFTFMgPSByZXF1aXJlKCcuL2xldmVscycpXG52YXIgYXJnc1RvQ29tcG9uZW50cyA9IHJlcXVpcmUoJy4vdXRpbHMvYXJnc1RvQ29tcG9uZW50cycpXG52YXIgY29tcG9zZSA9IHJlcXVpcmUoJy4vdXRpbHMvY29tcG9zZScpXG5mdW5jdGlvbiBub29wICgpIHt9XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlRHJpZnR3b29kIChwcmltYXJ5TG9nZ2VyKSB7XG4gIHZhciBnbG9iYWxTdGF0ZSA9IHsgbG9nZ2VyczogW10sIGVuYWJsZWQ6IGZhbHNlIH1cblxuICBkcmlmdHdvb2QuZW5hYmxlID0gZnVuY3Rpb24gZW5hYmxlQWxsIChmbGFncywgb3B0aW9ucykge1xuICAgIGdsb2JhbFN0YXRlLmVuYWJsZWQgPSB0cnVlXG4gICAgaWYgKGZsYWdzKSBwYXR0ZXJucy5zZXQoZmxhZ3MsIG9wdGlvbnMpXG4gICAgXy5pbnZva2UoZ2xvYmFsU3RhdGUubG9nZ2VycywgJ2VuYWJsZScsIGZsYWdzKVxuICB9XG5cbiAgZHJpZnR3b29kLmRpc2FibGUgPSBmdW5jdGlvbiBkaXNhYmxlQWxsICgpIHtcbiAgICBnbG9iYWxTdGF0ZS5lbmFibGVkID0gZmFsc2VcbiAgICBwYXR0ZXJucy5zZXQoe30pXG4gICAgcGF0dGVybnMuc2V0KHt9LCB7IHBlcnNpc3Q6IHRydWUgfSlcbiAgICBfLmludm9rZShnbG9iYWxTdGF0ZS5sb2dnZXJzLCAnZGlzYWJsZScpXG4gIH1cblxuICBkcmlmdHdvb2QuZGVzdHJveSA9IGZ1bmN0aW9uIGRlc3Ryb3lBbGwgKCkge1xuICAgIHdoaWxlIChnbG9iYWxTdGF0ZS5sb2dnZXJzLmxlbmd0aCkgZ2xvYmFsU3RhdGUubG9nZ2Vycy5wb3AoKS5kZXN0cm95KClcbiAgfVxuXG4gIGRyaWZ0d29vZC5MRVZFTFMgPSBMRVZFTFNcblxuICByZXR1cm4gZHJpZnR3b29kXG5cbiAgZnVuY3Rpb24gZHJpZnR3b29kIChuYW1lLCBhZGRpdGlvbmFsTG9nZ2VycywgaW50ZXJjZXB0b3JzKSB7XG4gICAgaWYgKCFuYW1lKSB0aHJvdyBuZXcgRXJyb3IoJ25hbWUgcmVxdWlyZWQnKVxuICAgIHZhciBjb25maWcgPSBwYXR0ZXJucy5nZXQoKVxuICAgIHZhciBzdGF0ZSA9IHtcbiAgICAgIGVuYWJsZWQ6IGdsb2JhbFN0YXRlLmVuYWJsZWQgfHwgcGF0dGVybnMubWF0Y2gobmFtZSwgY29uZmlnKSxcbiAgICAgIGxldmVsOiBwYXR0ZXJucy5nZXRMZXZlbChuYW1lLCBjb25maWcpLFxuICAgICAgY2hpbGRyZW46IFtdXG4gICAgfVxuICAgIHZhciBsb2dnZXIgPSBhZGRpdGlvbmFsTG9nZ2VycyAmJiBhZGRpdGlvbmFsTG9nZ2Vycy5sZW5ndGggPiAwXG4gICAgICA/IGNvbXBvc2UocHJpbWFyeUxvZ2dlciwgYWRkaXRpb25hbExvZ2dlcnMpXG4gICAgICA6IHByaW1hcnlMb2dnZXJcblxuICAgIHZhciBsb2cgPSBmdW5jdGlvbiBjcmVhdGVMb2dnZXIgKGxvZ05hbWUsIGV4dHJhQWRkaXRpb25hbExvZ2dlcnMsIGV4dHJhSW50ZXJjZXB0b3JzKSB7XG4gICAgICBpZiAobG9nLmVuYWJsZSA9PT0gbm9vcCkgdGhyb3cgbmV3IEVycm9yKG5hbWUgKyAnIHdhcyBkZXN0cm95ZWQnKVxuICAgICAgdmFyIGNoaWxkTG9nID0gZHJpZnR3b29kKFxuICAgICAgICBuYW1lICsgJzonICsgbG9nTmFtZSxcbiAgICAgICAgKGFkZGl0aW9uYWxMb2dnZXJzIHx8IFtdKS5jb25jYXQoZXh0cmFBZGRpdGlvbmFsTG9nZ2VycyB8fCBbXSksXG4gICAgICAgIChpbnRlcmNlcHRvcnMgfHwgW10pLmNvbmNhdChleHRyYUludGVyY2VwdG9ycyB8fCBbXSlcbiAgICAgIClcbiAgICAgIGlmIChzdGF0ZS5lbmFibGVkKSBjaGlsZExvZy5lbmFibGUoc3RhdGUuZmxhZ3MpXG4gICAgICBzdGF0ZS5jaGlsZHJlbi5wdXNoKGNoaWxkTG9nKVxuICAgICAgcmV0dXJuIGNoaWxkTG9nXG4gICAgfVxuXG4gICAgbG9nLmVuYWJsZSA9IGZ1bmN0aW9uIGVuYWJsZUxvZyAoZmxhZ3MpIHtcbiAgICAgIHN0YXRlLmVuYWJsZWQgPSB0cnVlXG4gICAgICBzdGF0ZS5mbGFncyA9IGZsYWdzXG4gICAgICBpZiAoZmxhZ3MpIHN0YXRlLmxldmVsID0gcGF0dGVybnMuZ2V0TGV2ZWwobmFtZSwgZmxhZ3MpXG4gICAgICBjcmVhdGVBUEkoKVxuICAgICAgXy5pbnZva2Uoc3RhdGUuY2hpbGRyZW4sICdlbmFibGUnLCBmbGFncylcbiAgICB9XG5cbiAgICBsb2cuZGlzYWJsZSA9IGZ1bmN0aW9uIGRpc2FibGVMb2cgKCkge1xuICAgICAgc3RhdGUuZW5hYmxlZCA9IGZhbHNlXG4gICAgICBjcmVhdGVBUEkoKVxuICAgICAgXy5pbnZva2Uoc3RhdGUuY2hpbGRyZW4sICdkaXNhYmxlJylcbiAgICB9XG5cbiAgICBsb2cuZGVzdHJveSA9IGZ1bmN0aW9uIGRlc3Ryb3lMb2cgKCkge1xuICAgICAgbG9nLmVuYWJsZSA9IG5vb3BcbiAgICAgIGxvZy5kaXNhYmxlKClcbiAgICAgIGdsb2JhbFN0YXRlLmxvZ2dlcnMgPSBfLmZpbHRlcihnbG9iYWxTdGF0ZS5sb2dnZXJzLCBmdW5jdGlvbiAobG9nZ2VyKSB7XG4gICAgICAgIHJldHVybiBsb2dnZXIgIT09IGxvZ1xuICAgICAgfSlcbiAgICAgIHdoaWxlIChzdGF0ZS5jaGlsZHJlbi5sZW5ndGgpIHN0YXRlLmNoaWxkcmVuLnBvcCgpLmRlc3Ryb3koKVxuICAgIH1cblxuICAgIGNyZWF0ZUFQSSgpXG4gICAgZ2xvYmFsU3RhdGUubG9nZ2Vycy5wdXNoKGxvZylcbiAgICByZXR1cm4gbG9nXG5cbiAgICBmdW5jdGlvbiBpbnRlcmNlcHQgKGFyZ3MpIHtcbiAgICAgIGlmIChpbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnRlcmNlcHRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gaW50ZXJjZXB0b3JzW2ldLmFwcGx5KHVuZGVmaW5lZCwgYXJncylcbiAgICAgICAgICBpZiAoXy5pc0FycmF5KHJlc3VsdCkgJiYgcmVzdWx0Lmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgYXJncyA9IHJlc3VsdFxuICAgICAgICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdChyZXN1bHQpKSB7XG4gICAgICAgICAgICBhcmdzWzNdID0gcmVzdWx0XG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcmVzdWx0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgYXJnc1szXS5tZXNzYWdlID0gcmVzdWx0XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJnc1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUFQSSAoKSB7XG4gICAgICBfLmVhY2goTEVWRUxTLk5BTUVTLCBmdW5jdGlvbiBhZGRMZXZlbExvZ2dlciAobG9nTGV2ZWwpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gTEVWRUxTLklOREVYW2xvZ0xldmVsXVxuICAgICAgICBsb2dbbG9nTGV2ZWxdID0gc3RhdGUuZW5hYmxlZFxuICAgICAgICAgID8gZnVuY3Rpb24gbGV2ZWxMb2dnZXIgKCkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID49IExFVkVMUy5JTkRFWFtzdGF0ZS5sZXZlbF0pIHtcbiAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBbbmFtZSwgbG9nTGV2ZWwsIG5ldyBEYXRlKCksIGFyZ3NUb0NvbXBvbmVudHMoYXJndW1lbnRzKV1cbiAgICAgICAgICAgICAgYXJncyA9IGludGVyY2VwdChhcmdzKVxuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5hcHBseSh1bmRlZmluZWQsIGFyZ3MpXG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICA6IG5vb3BcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgREVGQVVMVDogJ2luZm8nLFxuICBOQU1FUzogWyd0cmFjZScsICdkZWJ1ZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSxcbiAgSU5ERVg6IHt9XG59XG5cbmZvciAodmFyIGkgPSAwOyBpIDwgbW9kdWxlLmV4cG9ydHMuTkFNRVMubGVuZ3RoOyBpKyspIHtcbiAgbW9kdWxlLmV4cG9ydHMuSU5ERVhbbW9kdWxlLmV4cG9ydHMuTkFNRVNbaV1dID0gaVxufVxuIiwidmFyIF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG52YXIgTEVWRUxTID0gcmVxdWlyZSgnLi4vbGV2ZWxzJylcbnZhciByaWdodFBhZCA9IHJlcXVpcmUoJy4uL3V0aWxzL3JpZ2h0UGFkJylcbnZhciBjb25zb2xlID0gd2luZG93LmNvbnNvbGVcblxudmFyIGxldmVsQ29sb3JzID0ge1xuICB0cmFjZTogJyM2QzdBODknLFxuICBkZWJ1ZzogJyM4N0QzN0MnLFxuICBpbmZvOiAnIzQ0NkNCMycsXG4gIHdhcm46ICcjRTg3RTA0JyxcbiAgZXJyb3I6ICcjRjIyNjEzJ1xufVxuXG4vKipcbiAqIEdlbmVyYXRlIHRoZSBoZXggZm9yIGEgcmVhZGFibGUgY29sb3IgYWdhaW5zdCBhIHdoaXRlIGJhY2tncm91bmRcbiAqKi9cbmZ1bmN0aW9uIHJhbmRvbVJlYWRhYmxlQ29sb3IgKCkge1xuICB2YXIgaCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM2MClcbiAgdmFyIHMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApICsgJyUnXG4gIHZhciBsID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNjYpICsgJyUnXG5cbiAgcmV0dXJuIFsgJ2hzbCgnLCBoLCAnLCcsIHMsICcsJywgbCwgJyknIF0uam9pbignJylcbn1cblxuZnVuY3Rpb24gY29uc29sZVN1cHBvcnRzQWxsTGV2ZWxzICgpIHtcbiAgcmV0dXJuICFfLmZpbmQoTEVWRUxTLk5BTUVTLCBmdW5jdGlvbiAobGV2ZWwpIHtcbiAgICByZXR1cm4gIWNvbnNvbGVbbGV2ZWxdXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGNvbnNvbGVTdXBwb3J0c0dyb3VwaW5nICgpIHtcbiAgcmV0dXJuIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQgJiYgY29uc29sZS5ncm91cEVuZFxufVxuXG4vKipcbiAqIFByYWN0aWNhbGx5IGlzIHRoZXJlIGEgZ29vZCBjaGFuY2UgaXQgc3VwcG9ydHMgQ1NTP1xuICoqL1xuZnVuY3Rpb24gY29uc29sZUlzRmFuY3kgKCkge1xuICByZXR1cm4gY29uc29sZS50aW1lbGluZSAmJiBjb25zb2xlLnRhYmxlICYmICF3aW5kb3cuX19rYXJtYV9fXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnJvd3NlckxvZ2dlciAoKSB7XG4gIGlmICghY29uc29sZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiBub29wICgpIHsgfVxuICB9XG5cbiAgdmFyIGFsbExldmVscyA9IGNvbnNvbGVTdXBwb3J0c0FsbExldmVscygpXG4gIHZhciBncm91cGluZyA9IGNvbnNvbGVTdXBwb3J0c0dyb3VwaW5nKClcbiAgdmFyIGlzRmFuY3kgPSBjb25zb2xlSXNGYW5jeSgpXG4gIHZhciBjb2xvciA9IHJhbmRvbVJlYWRhYmxlQ29sb3IoKVxuXG4gIHJldHVybiBmdW5jdGlvbiBsb2cgKG5hbWUsIGxldmVsLCBub3csIGNvbXBvbmVudHMpIHtcbiAgICBpZiAoZ3JvdXBpbmcgJiYgY29tcG9uZW50cy5tZXRhZGF0YSkge1xuICAgICAgaWYgKGlzRmFuY3kpIHtcbiAgICAgICAgY29uc29sZS5ncm91cENvbGxhcHNlZC5hcHBseShjb25zb2xlLCBmb3JtYXRGYW5jeU1lc3NhZ2UoKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoZm9ybWF0TWVzc2FnZSgpKVxuICAgICAgfVxuXG4gICAgICBfLm9iamVjdEVhY2goY29tcG9uZW50cy5tZXRhZGF0YSwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgY29uc29sZS5sb2coa2V5LCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIGNvbnNvbGUuZ3JvdXBFbmQoKVxuICAgIH0gZWxzZSBpZiAoY29tcG9uZW50cy5tZXNzYWdlKSB7XG4gICAgICBpZiAoYWxsTGV2ZWxzKSB7XG4gICAgICAgIGlmIChpc0ZhbmN5KSB7XG4gICAgICAgICAgY29uc29sZVtsZXZlbF0uYXBwbHkoY29uc29sZSwgZm9ybWF0RmFuY3lNZXNzYWdlKCkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZVtsZXZlbF0oZm9ybWF0TWVzc2FnZSgpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBqdXN0IHVzZSBjb25zb2xlLmxvZ1xuICAgICAgICBjb25zb2xlLmxvZyhmb3JtYXRNZXNzYWdlKCkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbXBvbmVudHMuZXJyb3IpIHtcbiAgICAgIGlmIChhbGxMZXZlbHMpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihjb21wb25lbnRzLmVycm9yKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coY29tcG9uZW50cy5lcnJvcilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRNZXNzYWdlICgpIHtcbiAgICAgIHJldHVybiByaWdodFBhZChsZXZlbC50b1VwcGVyQ2FzZSgpLCA1KSArICcgWycgKyBuYW1lICsgJ106ICcgKyBjb21wb25lbnRzLm1lc3NhZ2VcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb3JtYXRGYW5jeU1lc3NhZ2UgKCkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgJyVjJyArIHJpZ2h0UGFkKGxldmVsLnRvVXBwZXJDYXNlKCksIDUpICsgJyVjICVjWycgKyBuYW1lICsgJ10lYzogJyArIGNvbXBvbmVudHMubWVzc2FnZSxcbiAgICAgICAgJ2ZvbnQtd2VpZ2h0OmJvbGQ7Y29sb3I6JyArIGxldmVsQ29sb3JzW2xldmVsXSArICc7JyxcbiAgICAgICAgJycsXG4gICAgICAgICdmb250LXdlaWdodDpib2xkO2NvbG9yOicgKyBjb2xvciArICc7JyxcbiAgICAgICAgJydcbiAgICAgIF1cbiAgICB9XG4gIH1cbn1cblxuLy8gUmV3aXJlIGRvZXNuJ3Qgd29yayBpbiBJRTggYW5kIGluamVjdC1sb2FkZXIgZG9lc24ndCB3b3JrIGluIG5vZGUsIHNvIHdlIGhhdmVcbi8vIHRvIGV4cG9zZSBvdXIgb3duIHN0dWJiaW5nIG1ldGhvZFxubW9kdWxlLmV4cG9ydHMuX19zdHViQ29uc29sZV9fID0gZnVuY3Rpb24gKHN0dWIpIHtcbiAgdmFyIG9sZENvbnNvbGUgPSBjb25zb2xlXG4gIGNvbnNvbGUgPSBzdHViIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgcmV0dXJuIGZ1bmN0aW9uIHJlc2V0ICgpIHtcbiAgICBjb25zb2xlID0gb2xkQ29uc29sZSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIH1cbn1cbiIsInZhciBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxudmFyIEpTT04gPSByZXF1aXJlKCdqc29uLWJvdXJuZScpXG52YXIgc3RvcmFnZSA9IHJlcXVpcmUoJy4vc3RvcmFnZScpXG52YXIgTEVWRUxTID0gcmVxdWlyZSgnLi9sZXZlbHMnKVxuXG5mdW5jdGlvbiBnZXQgKCkge1xuICB0cnkge1xuICAgIHZhciBwYXlsb2FkID0gc3RvcmFnZS5nZXQoKVxuICAgIHJldHVybiBwYXlsb2FkICYmIEpTT04ucGFyc2UocGF5bG9hZCkgfHwge31cbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB7fVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldCAocGF0dGVybnMsIG9wdHMpIHtcbiAgdHJ5IHtcbiAgICB2YXIgcGF5bG9hZCA9IEpTT04uc3RyaW5naWZ5KHBhdHRlcm5zKVxuICAgIHN0b3JhZ2Uuc2V0KHBheWxvYWQsIG9wdHMpXG4gIH0gY2F0Y2ggKGUpIHsgfVxufVxuXG5mdW5jdGlvbiBtYXRjaCAobmFtZSwgZmxhZ3MpIHtcbiAgdmFyIHBhdHRlcm5zID0gXy5rZXlzKGZsYWdzKVxuICByZXR1cm4gISFfLmZpbmQocGF0dGVybnMsIGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gICAgcmV0dXJuIHRlc3QocGF0dGVybiwgbmFtZSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gZ2V0TGV2ZWwgKG5hbWUsIGZsYWdzKSB7XG4gIGZvciAodmFyIHBhdHRlcm4gaW4gZmxhZ3MpIHtcbiAgICBpZiAodGVzdChwYXR0ZXJuLCBuYW1lKSkgcmV0dXJuIGZsYWdzW3BhdHRlcm5dIHx8IExFVkVMUy5ERUZBVUxUXG4gIH1cbiAgcmV0dXJuIExFVkVMUy5ERUZBVUxUXG59XG5cbmZ1bmN0aW9uIHRlc3QgKHBhdHRlcm4sIG5hbWUpIHtcbiAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnXicgKyBwYXR0ZXJuLnJlcGxhY2UoL1xcKi9nLCAnLionKSArICckJylcbiAgcmV0dXJuIHJlZ2V4LnRlc3QobmFtZSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldDogZ2V0LFxuICBzZXQ6IHNldCxcbiAgbWF0Y2g6IG1hdGNoLFxuICBnZXRMZXZlbDogZ2V0TGV2ZWxcbn1cbiIsInZhciBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxuXG52YXIgU1RPUkFHRV9OQU1FU1BBQ0UgPSAncXViaXRfbG9nZ2VyJ1xudmFyIFRFU1RfS0VZID0gJ19fZHdUZXN0X18nXG5cbnZhciBtZW1vcnlTdG9yYWdlID0gJydcblxuZnVuY3Rpb24gaGFzTG9jYWxTdG9yYWdlICgpIHtcbiAgdHJ5IHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oVEVTVF9LRVksIDEpXG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFRFU1RfS0VZKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXQgKHZhbHVlLCBvcHRzKSB7XG4gIG9wdHMgPSBfLmFzc2lnbih7XG4gICAgcGVyc2lzdDogZmFsc2VcbiAgfSwgb3B0cylcblxuICBpZiAob3B0cy5wZXJzaXN0ICYmIGhhc0xvY2FsU3RvcmFnZSgpKSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFNUT1JBR0VfTkFNRVNQQUNFLCB2YWx1ZSlcbiAgfSBlbHNlIHtcbiAgICBtZW1vcnlTdG9yYWdlID0gdmFsdWVcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXQgKCkge1xuICBpZiAobWVtb3J5U3RvcmFnZSB8fCAhaGFzTG9jYWxTdG9yYWdlKCkpIHtcbiAgICByZXR1cm4gbWVtb3J5U3RvcmFnZVxuICB9IGVsc2UgaWYgKGhhc0xvY2FsU3RvcmFnZSgpKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShTVE9SQUdFX05BTUVTUEFDRSkgfHwgJydcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNldCAoKSB7XG4gIGlmIChoYXNMb2NhbFN0b3JhZ2UoKSkge1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShTVE9SQUdFX05BTUVTUEFDRSlcbiAgfVxuICBtZW1vcnlTdG9yYWdlID0gJydcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogc2V0LFxuICBnZXQ6IGdldCxcbiAgcmVzZXQ6IHJlc2V0XG59XG4iLCIvKlxuICBMYXN0IGFyZyBjYW4gYmUgYW4gZXJyb3Igb3IgYW4gb2JqZWN0LiBBbGwgb3RoZXJcbiAgYXJncyB3aWxsIGJlIGpvaW5lZCBpbnRvIGEgc3RyaW5nLCBkZWxpbWl0ZWQgYnlcbiAgYSBzcGFjZS5cbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFyZ3NUb0NvbXBvbmVudHMgKGFyZ3MpIHtcbiAgYXJncyA9IFtdLnNsaWNlLmFwcGx5KGFyZ3MpXG4gIHZhciBsYXN0QXJnID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdXG5cbiAgdmFyIGlzRXJyb3IgPSBsYXN0QXJnIGluc3RhbmNlb2YgRXJyb3IgfHwgaXNFcnJvckxpa2UobGFzdEFyZylcbiAgdmFyIGlzTWV0YWRhdGEgPSAhaXNFcnJvciAmJiBsYXN0QXJnICYmIHR5cGVvZiBsYXN0QXJnID09PSAnb2JqZWN0J1xuXG4gIHZhciBtZXNzYWdlUGFydHMgPSBpc0Vycm9yIHx8IGlzTWV0YWRhdGEgPyBhcmdzLnNsaWNlKDAsIC0xKSA6IGFyZ3NcbiAgdmFyIG1lc3NhZ2UgPSBtZXNzYWdlUGFydHMuam9pbignICcpXG5cbiAgLy8gSGFuZGxlIGxvZy5kZWJ1Zyh7IGZvbzogJ2JhcicgfSlcbiAgaWYgKGlzTWV0YWRhdGEgJiYgIW1lc3NhZ2UpIHtcbiAgICBtZXNzYWdlID0gJ21ldGFkYXRhOidcbiAgfVxuXG4gIC8vIEhhbmRsZSBsb2cuZGVidWcobmV3IEVycm9yKCkpXG4gIGlmIChpc0Vycm9yICYmICFtZXNzYWdlKSB7XG4gICAgbWVzc2FnZSA9IGxhc3RBcmcubWVzc2FnZVxuICB9XG5cbiAgdmFyIGNvbXBvbmVudHMgPSB7XG4gICAgbWVzc2FnZTogbWVzc2FnZVxuICB9XG5cbiAgaWYgKGlzRXJyb3IgJiYgbGFzdEFyZykgY29tcG9uZW50cy5lcnJvciA9IGxhc3RBcmdcbiAgaWYgKGlzTWV0YWRhdGEgJiYgbGFzdEFyZykgY29tcG9uZW50cy5tZXRhZGF0YSA9IGxhc3RBcmdcblxuICByZXR1cm4gY29tcG9uZW50c1xufVxuXG4vLyBJbiBzb21lIGVudmlyb25tZW50cywgZXJyb3JzIGRvZXNuJ3QgcHJvcGVybHkgaW5oZXJpdCBmcm9tIGBFcnJvcmBcbmZ1bmN0aW9uIGlzRXJyb3JMaWtlICh0aGluZykge1xuICByZXR1cm4gdGhpbmcgJiYgISF0aGluZy5zdGFjayAmJiAhIXRoaW5nLm1lc3NhZ2Vcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlQ29tcG9zaXRlTG9nZ2VyIChwcmltYXJ5TG9nZ2VyLCBhZGRpdGlvbmFsTG9nZ2Vycykge1xuICB2YXIgbG9nZ2VycyA9IFtwcmltYXJ5TG9nZ2VyXS5jb25jYXQoYWRkaXRpb25hbExvZ2dlcnMpXG4gIHJldHVybiBmdW5jdGlvbiBjb21wb3NpdGVMb2dnZXIgKG5hbWUsIGxldmVsLCBkYXRlLCBjb21wb25lbnRzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2dnZXJzLmxlbmd0aDsgaSsrKSBsb2dnZXJzW2ldKG5hbWUsIGxldmVsLCBkYXRlLCBjb21wb25lbnRzKVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJpZ2h0UGFkIChzdHJpbmcsIHRvdGFsKSB7XG4gIHZhciBpID0gLTFcbiAgdmFyIHJlbWFpbmluZyA9IHRvdGFsIC0gc3RyaW5nLmxlbmd0aFxuICB3aGlsZSAoKytpIDwgcmVtYWluaW5nKSB7XG4gICAgc3RyaW5nICs9ICcgJ1xuICB9XG4gIHJldHVybiBzdHJpbmdcbn1cbiIsIi8qIGdsb2JhbCBkZWZpbmUgKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLWV4dGVuZC1uYXRpdmUgKi9cblxudmFyIGpzb25Cb3VybmUgPSB7XG4gIHN0cmluZ2lmeTogZnVuY3Rpb24gc3RyaW5naWZ5ICgpIHtcbiAgICB2YXIgZXJyb3IsIHJlc3VsdFxuICAgIHZhciBwcm90b3R5cGVzID0gbm9ybWFsaXplUHJvdG90eXBlcygpXG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IEpTT04uc3RyaW5naWZ5LmFwcGx5KEpTT04sIGFyZ3VtZW50cylcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlcnJvciA9IGVcbiAgICB9XG4gICAgcHJvdG90eXBlcy5yZXN0b3JlKClcbiAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9LFxuICBwYXJzZTogZnVuY3Rpb24gcGFyc2UgKCkge1xuICAgIHJldHVybiBKU09OLnBhcnNlLmFwcGx5KEpTT04sIGFyZ3VtZW50cylcbiAgfVxufVxuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBqc29uQm91cm5lXG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBqc29uQm91cm5lXG4gIH0pXG59IGVsc2Uge1xuICB3aW5kb3cuanNvbkJvdXJuZSA9IGpzb25Cb3VybmVcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplUHJvdG90eXBlcyAoKSB7XG4gIHZhciBhcnJheVRvSlNPTiA9IEFycmF5LnByb3RvdHlwZS50b0pTT05cbiAgdmFyIGRhdGVUb0pTT04gPSBEYXRlLnByb3RvdHlwZS50b0pTT05cbiAgZGVsZXRlIEFycmF5LnByb3RvdHlwZS50b0pTT05cbiAgRGF0ZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0b0lzb0RhdGUodGhpcylcbiAgfVxuICByZXR1cm4ge1xuICAgIHJlc3RvcmU6IGZ1bmN0aW9uIHJlc3RvcmUgKCkge1xuICAgICAgaWYgKGFycmF5VG9KU09OICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnRvSlNPTiA9IGFycmF5VG9KU09OXG4gICAgICB9XG4gICAgICBpZiAoZGF0ZVRvSlNPTiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIERhdGUucHJvdG90eXBlLnRvSlNPTiA9IGRhdGVUb0pTT05cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlbGV0ZSBEYXRlLnByb3RvdHlwZS50b0pTT05cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9Jc29EYXRlIChkYXRlKSB7XG4gIHJldHVybiBpc0Zpbml0ZShkYXRlLnZhbHVlT2YoKSkgP1xuICAgIGRhdGUuZ2V0VVRDRnVsbFllYXIoKSArICctJyArXG4gICAgcGFkKGRhdGUuZ2V0VVRDTW9udGgoKSArIDEsIDIpICsgJy0nICtcbiAgICBwYWQoZGF0ZS5nZXRVVENEYXRlKCksIDIpICsgJ1QnICtcbiAgICBwYWQoZGF0ZS5nZXRVVENIb3VycygpLCAyKSArICc6JyArXG4gICAgcGFkKGRhdGUuZ2V0VVRDTWludXRlcygpLCAyKSArICc6JyArXG4gICAgcGFkKGRhdGUuZ2V0VVRDU2Vjb25kcygpLCAyKSArICcuJyArXG4gICAgcGFkKGRhdGUuZ2V0VVRDTWlsbGlzZWNvbmRzKCksIDMpICsgJ1onIDogbnVsbFxufVxuXG5mdW5jdGlvbiBwYWQgKG51bWJlcikge1xuICB2YXIgciA9IFN0cmluZyhudW1iZXIpXG4gIGlmIChyLmxlbmd0aCA9PT0gMSkge1xuICAgIHIgPSAnMCcgKyByXG4gIH1cbiAgcmV0dXJuIHJcbn1cbiIsInZhciB0b1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZ1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxudmFyIHJlZ2V4cENoYXJhY3RlcnMgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2dcbnZhciByZWdleHBJc05hdGl2ZUZuID0gdG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSlcbiAgLnJlcGxhY2UocmVnZXhwQ2hhcmFjdGVycywgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKVxudmFyIHJlZ2V4cElzTmF0aXZlID0gUmVnRXhwKCdeJyArIHJlZ2V4cElzTmF0aXZlRm4gKyAnJCcpXG5mdW5jdGlvbiB0b1NvdXJjZSAoZnVuYykge1xuICBpZiAoIWZ1bmMpIHJldHVybiAnJ1xuICB0cnkge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGZ1bmMpXG4gIH0gY2F0Y2ggKGUpIHt9XG4gIHRyeSB7XG4gICAgcmV0dXJuIChmdW5jICsgJycpXG4gIH0gY2F0Y2ggKGUpIHt9XG59XG52YXIgYXNzaWduID0gT2JqZWN0LmFzc2lnblxudmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaFxudmFyIGV2ZXJ5ID0gQXJyYXkucHJvdG90eXBlLmV2ZXJ5XG52YXIgZmlsdGVyID0gQXJyYXkucHJvdG90eXBlLmZpbHRlclxudmFyIGZpbmQgPSBBcnJheS5wcm90b3R5cGUuZmluZFxudmFyIGluZGV4T2YgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5XG52YXIga2V5cyA9IE9iamVjdC5rZXlzXG52YXIgbWFwID0gQXJyYXkucHJvdG90eXBlLm1hcFxudmFyIHJlZHVjZSA9IEFycmF5LnByb3RvdHlwZS5yZWR1Y2VcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZVxudmFyIHNvbWUgPSBBcnJheS5wcm90b3R5cGUuc29tZVxudmFyIHZhbHVlcyA9IE9iamVjdC52YWx1ZXNcbmZ1bmN0aW9uIGlzTmF0aXZlIChtZXRob2QpIHtcbiAgcmV0dXJuIG1ldGhvZCAmJiB0eXBlb2YgbWV0aG9kID09PSAnZnVuY3Rpb24nICYmIHJlZ2V4cElzTmF0aXZlLnRlc3QodG9Tb3VyY2UobWV0aG9kKSlcbn1cbnZhciBfID0ge1xuICBhc3NpZ246IGlzTmF0aXZlKGFzc2lnbilcbiAgICA/IGFzc2lnblxuICAgIDogZnVuY3Rpb24gYXNzaWduICh0YXJnZXQpIHtcbiAgICAgIHZhciBsID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXVxuICAgICAgICBmb3IgKHZhciBqIGluIHNvdXJjZSkgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShqKSkgdGFyZ2V0W2pdID0gc291cmNlW2pdXG4gICAgICB9XG4gICAgICByZXR1cm4gdGFyZ2V0XG4gICAgfSxcbiAgYmluZDogZnVuY3Rpb24gYmluZCAobWV0aG9kLCBjb250ZXh0KSB7XG4gICAgdmFyIGFyZ3MgPSBfLnNsaWNlKGFyZ3VtZW50cywgMilcbiAgICByZXR1cm4gZnVuY3Rpb24gYm91bmRGdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KF8uc2xpY2UoYXJndW1lbnRzKSkpXG4gICAgfVxuICB9LFxuICBkZWJvdW5jZTogZnVuY3Rpb24gZGVib3VuY2UgKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpc1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHNcbiAgICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGltZW91dCA9IG51bGxcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcbiAgICAgIH1cbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dClcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KVxuICAgICAgaWYgKGNhbGxOb3cpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcbiAgICB9XG4gIH0sXG4gIGVhY2g6IGlzTmF0aXZlKGZvckVhY2gpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVFYWNoIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmb3JFYWNoLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGVhY2ggKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICB9LFxuICBldmVyeTogaXNOYXRpdmUoZXZlcnkpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVFdmVyeSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGV2ZXJ5LmNhbGwoY29sbCwgcHJlZCwgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBldmVyeSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgaWYgKCFjb2xsIHx8ICFwcmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghcHJlZC5jYWxsKGNvbnRleHQsIGNvbGxbaV0sIGksIGNvbGwpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcbiAgZmlsdGVyOiBpc05hdGl2ZShmaWx0ZXIpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVGaWx0ZXIgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZpbHRlci5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBmaWx0ZXIgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIHZhciBvdXRwdXQgPSBbXVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KSkgb3V0cHV0LnB1c2goYXJyYXlbaV0pXG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcbiAgZmluZDogaXNOYXRpdmUoZmluZClcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUZpbmQgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZpbmQuY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZmluZCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KSkgcmV0dXJuIGFycmF5W2ldXG4gICAgICB9XG4gICAgfSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQgKG9iamVjdCwgcGF0aCkge1xuICAgIHJldHVybiBfLnJlZHVjZShwYXRoLnNwbGl0KCcuJyksIGZ1bmN0aW9uIChtZW1vLCBuZXh0KSB7XG4gICAgICByZXR1cm4gKHR5cGVvZiBtZW1vICE9PSAndW5kZWZpbmVkJyAmJiBtZW1vICE9PSBudWxsKSA/IG1lbW9bbmV4dF0gOiB1bmRlZmluZWRcbiAgICB9LCBvYmplY3QpXG4gIH0sXG4gIGlkZW50aXR5OiBmdW5jdGlvbiBpZGVudGl0eSAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcbiAgaW5kZXhPZjogaXNOYXRpdmUoaW5kZXhPZilcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUluZGV4T2YgKGFycmF5LCBpdGVtKSB7XG4gICAgICByZXR1cm4gaW5kZXhPZi5jYWxsKGFycmF5LCBpdGVtKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGluZGV4T2YgKGFycmF5LCBpdGVtKSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xXG4gICAgfSxcbiAgaW52b2tlOiBmdW5jdGlvbiBpbnZva2UgKGFycmF5LCBtZXRob2ROYW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBfLnNsaWNlKGFyZ3VtZW50cywgMilcbiAgICByZXR1cm4gXy5tYXAoYXJyYXksIGZ1bmN0aW9uIGludm9rZU1hcHBlciAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZVttZXRob2ROYW1lXS5hcHBseSh2YWx1ZSwgYXJncylcbiAgICB9KVxuICB9LFxuICBpc0FycmF5OiBpc05hdGl2ZShpc0FycmF5KVxuICAgID8gZnVuY3Rpb24gbmF0aXZlQXJyYXkgKGNvbGwpIHtcbiAgICAgIHJldHVybiBpc0FycmF5KGNvbGwpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gaXNBcnJheSAob2JqKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgICB9LFxuICBpc01hdGNoOiBmdW5jdGlvbiBpc01hdGNoIChvYmosIHNwZWMpIHtcbiAgICBmb3IgKHZhciBpIGluIHNwZWMpIHtcbiAgICAgIGlmIChzcGVjLmhhc093blByb3BlcnR5KGkpICYmIG9ialtpXSAhPT0gc3BlY1tpXSkgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH0sXG4gIGlzT2JqZWN0OiBmdW5jdGlvbiBpc09iamVjdCAob2JqKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqXG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmpcbiAgfSxcbiAga2V5czogaXNOYXRpdmUoa2V5cylcbiAgICA/IGtleXNcbiAgICA6IGZ1bmN0aW9uIGtleXMgKG9iamVjdCkge1xuICAgICAgdmFyIGtleXMgPSBbXVxuICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIGtleXMucHVzaChrZXkpXG4gICAgICB9XG4gICAgICByZXR1cm4ga2V5c1xuICAgIH0sXG4gIG1hcDogaXNOYXRpdmUobWFwKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlTWFwIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBtYXAuY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gbWFwIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICB2YXIgb3V0cHV0ID0gbmV3IEFycmF5KGwpXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBvdXRwdXRbaV0gPSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXRcbiAgICB9LFxuICBtYXRjaGVzOiBmdW5jdGlvbiBtYXRjaGVzIChzcGVjKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiBfLmlzTWF0Y2gob2JqLCBzcGVjKVxuICAgIH1cbiAgfSxcbiAgbm90OiBmdW5jdGlvbiBub3QgKHZhbHVlKSB7XG4gICAgcmV0dXJuICF2YWx1ZVxuICB9LFxuICBvYmplY3RFYWNoOiBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgIHJldHVybiBfLmVhY2goXy5rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG9iamVjdFtrZXldLCBrZXksIG9iamVjdClcbiAgICB9LCBjb250ZXh0KVxuICB9LFxuICBvYmplY3RNYXA6IGZ1bmN0aW9uIG9iamVjdE1hcCAob2JqZWN0LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSB7fVxuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IGNhbGxiYWNrLmNhbGwoY29udGV4dCwgb2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH0sXG4gIG9iamVjdFJlZHVjZTogZnVuY3Rpb24gb2JqZWN0UmVkdWNlIChvYmplY3QsIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpIHtcbiAgICB2YXIgb3V0cHV0ID0gaW5pdGlhbFZhbHVlXG4gICAgZm9yICh2YXIgaSBpbiBvYmplY3QpIHtcbiAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoaSkpIG91dHB1dCA9IGNhbGxiYWNrKG91dHB1dCwgb2JqZWN0W2ldLCBpLCBvYmplY3QpXG4gICAgfVxuICAgIHJldHVybiBvdXRwdXRcbiAgfSxcbiAgcGljazogZnVuY3Rpb24gcGljayAob2JqZWN0LCB0b1BpY2spIHtcbiAgICB2YXIgb3V0ID0ge31cbiAgICBfLmVhY2godG9QaWNrLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAodHlwZW9mIG9iamVjdFtrZXldICE9PSAndW5kZWZpbmVkJykgb3V0W2tleV0gPSBvYmplY3Rba2V5XVxuICAgIH0pXG4gICAgcmV0dXJuIG91dFxuICB9LFxuICBwbHVjazogZnVuY3Rpb24gcGx1Y2sgKGFycmF5LCBrZXkpIHtcbiAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgIHZhciBvdXQgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSBpZiAoYXJyYXlbaV0pIG91dFtpXSA9IGFycmF5W2ldW2tleV1cbiAgICByZXR1cm4gb3V0XG4gIH0sXG4gIHJlZHVjZTogaXNOYXRpdmUocmVkdWNlKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlUmVkdWNlIChhcnJheSwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSkge1xuICAgICAgcmV0dXJuIHJlZHVjZS5jYWxsKGFycmF5LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIHJlZHVjZSAoYXJyYXksIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpIHtcbiAgICAgIHZhciBvdXRwdXQgPSBpbml0aWFsVmFsdWVcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykgb3V0cHV0ID0gY2FsbGJhY2sob3V0cHV0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcbiAgc2V0OiBmdW5jdGlvbiBzZXQgKG9iamVjdCwgcGF0aCwgdmFsKSB7XG4gICAgaWYgKCFvYmplY3QpIHJldHVybiBvYmplY3RcbiAgICBpZiAodHlwZW9mIG9iamVjdCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iamVjdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG9iamVjdFxuICAgIHZhciBwYXJ0cyA9IHBhdGguc3BsaXQoJy4nKVxuICAgIHZhciBjb250ZXh0ID0gb2JqZWN0XG4gICAgdmFyIG5leHRLZXlcbiAgICBkbyB7XG4gICAgICBuZXh0S2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgaWYgKHR5cGVvZiBjb250ZXh0W25leHRLZXldICE9PSAnb2JqZWN0JykgY29udGV4dFtuZXh0S2V5XSA9IHt9XG4gICAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnRleHQgPSBjb250ZXh0W25leHRLZXldXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0W25leHRLZXldID0gdmFsXG4gICAgICB9XG4gICAgfSB3aGlsZSAocGFydHMubGVuZ3RoKVxuICAgIHJldHVybiBvYmplY3RcbiAgfSxcbiAgc2xpY2U6IGlzTmF0aXZlKHNsaWNlKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlU2xpY2UgKGFycmF5LCBiZWdpbiwgZW5kKSB7XG4gICAgICBiZWdpbiA9IGJlZ2luIHx8IDBcbiAgICAgIGVuZCA9IHR5cGVvZiBlbmQgPT09ICdudW1iZXInID8gZW5kIDogYXJyYXkubGVuZ3RoXG4gICAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgYmVnaW4sIGVuZClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBzbGljZSAoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgICAgIHN0YXJ0ID0gc3RhcnQgfHwgMFxuICAgICAgZW5kID0gdHlwZW9mIGVuZCA9PT0gJ251bWJlcicgPyBlbmQgOiBhcnJheS5sZW5ndGhcbiAgICAgIHZhciBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aFxuICAgICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFtdXG4gICAgICB9XG4gICAgICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgICAgIHN0YXJ0ID0gLXN0YXJ0ID4gbGVuZ3RoID8gMCA6IChsZW5ndGggKyBzdGFydClcbiAgICAgIH1cbiAgICAgIGVuZCA9IGVuZCA+IGxlbmd0aCA/IGxlbmd0aCA6IGVuZFxuICAgICAgaWYgKGVuZCA8IDApIHtcbiAgICAgICAgZW5kICs9IGxlbmd0aFxuICAgICAgfVxuICAgICAgbGVuZ3RoID0gc3RhcnQgPiBlbmQgPyAwIDogKChlbmQgLSBzdGFydCkgPj4+IDApXG4gICAgICBzdGFydCA+Pj49IDBcbiAgICAgIHZhciBpbmRleCA9IC0xXG4gICAgICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KGxlbmd0aClcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBhcnJheVtpbmRleCArIHN0YXJ0XVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH0sXG4gIHNvbWU6IGlzTmF0aXZlKHNvbWUpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVTb21lIChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gc29tZS5jYWxsKGNvbGwsIHByZWQsIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gc29tZSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgaWYgKCFjb2xsIHx8ICFwcmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcmVkLmNhbGwoY29udGV4dCwgY29sbFtpXSwgaSwgY29sbCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9LFxuICB1bmlxdWU6IGZ1bmN0aW9uIHVuaXF1ZSAoYXJyYXkpIHtcbiAgICByZXR1cm4gXy5yZWR1Y2UoYXJyYXksIGZ1bmN0aW9uIChtZW1vLCBjdXJyKSB7XG4gICAgICBpZiAoXy5pbmRleE9mKG1lbW8sIGN1cnIpID09PSAtMSkge1xuICAgICAgICBtZW1vLnB1c2goY3VycilcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vXG4gICAgfSwgW10pXG4gIH0sXG4gIHZhbHVlczogaXNOYXRpdmUodmFsdWVzKVxuICAgID8gdmFsdWVzXG4gICAgOiBmdW5jdGlvbiB2YWx1ZXMgKG9iamVjdCkge1xuICAgICAgdmFyIG91dCA9IFtdXG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkgb3V0LnB1c2gob2JqZWN0W2tleV0pXG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0XG4gICAgfSxcbiAgbmFtZTogJ3NsYXBkYXNoJyxcbiAgdmVyc2lvbjogJzEuMy4zJ1xufVxuXy5vYmplY3RNYXAuYXNBcnJheSA9IGZ1bmN0aW9uIG9iamVjdE1hcEFzQXJyYXkgKG9iamVjdCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgcmV0dXJuIF8ubWFwKF8ua2V5cyhvYmplY3QpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgb2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KVxuICB9LCBjb250ZXh0KVxufVxubW9kdWxlLmV4cG9ydHMgPSBfXG4iLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1syXS51c2VbMl0hLi92YXJpYXRpb24ubGVzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1syXS51c2VbMl0hLi92YXJpYXRpb24ubGVzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzJdLnVzZVsyXSEuL3ZhcmlhdGlvbi5sZXNzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xlc3MtbG9hZGVyL2Rpc3QvY2pzLmpzPz9ydWxlU2V0WzFdLnJ1bGVzWzJdLnVzZVsyXSEuL3ZhcmlhdGlvbi5sZXNzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuXG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcblxuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cblxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG5cbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG5cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG5cbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG5cbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG5cbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpOyAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG5cbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG5cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuXG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cblxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG5cbiAgY3NzICs9IG9iai5jc3M7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG5cbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9IC8vIEZvciBvbGQgSUVcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG5cblxuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cblxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsInZhciBQcm9taXNlID0gcmVxdWlyZSgnLi9pbmRleCcpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmVycmVkICgpIHtcbiAgdmFyIF9yZXNvbHZlLCBfcmVqZWN0XG4gIHZhciBfcHJvbWlzZSA9IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIF9yZXNvbHZlID0gcmVzb2x2ZVxuICAgIF9yZWplY3QgPSByZWplY3RcbiAgfSlcbiAgcmV0dXJuIHtcbiAgICBwcm9taXNlOiBfcHJvbWlzZSxcbiAgICByZXNvbHZlOiBfcmVzb2x2ZSxcbiAgICByZWplY3Q6IF9yZWplY3RcbiAgfVxufVxuIiwidmFyIGVyciA9IG5ldyBFcnJvcignRXJyb3I6IHJlY3Vyc2VzISBpbmZpbml0ZSBwcm9taXNlIGNoYWluIGRldGVjdGVkJylcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcHJvbWlzZSAocmVzb2x2ZXIpIHtcbiAgdmFyIHdhaXRpbmcgPSB7IHJlczogW10sIHJlajogW10gfVxuICB2YXIgcCA9IHtcbiAgICAndGhlbic6IHRoZW4sXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24gdGhlbkNhdGNoIChvblJlamVjdCkge1xuICAgICAgcmV0dXJuIHRoZW4obnVsbCwgb25SZWplY3QpXG4gICAgfVxuICB9XG4gIHRyeSB7IHJlc29sdmVyKHJlc29sdmUsIHJlamVjdCkgfSBjYXRjaCAoZSkge1xuICAgIHAuc3RhdHVzID0gZmFsc2VcbiAgICBwLnZhbHVlID0gZVxuICB9XG4gIHJldHVybiBwXG5cbiAgZnVuY3Rpb24gdGhlbiAob25SZXNvbHZlLCBvblJlamVjdCkge1xuICAgIHJldHVybiBwcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHdhaXRpbmcucmVzLnB1c2goaGFuZGxlTmV4dChwLCB3YWl0aW5nLCBvblJlc29sdmUsIHJlc29sdmUsIHJlamVjdCwgb25SZWplY3QpKVxuICAgICAgd2FpdGluZy5yZWoucHVzaChoYW5kbGVOZXh0KHAsIHdhaXRpbmcsIG9uUmVqZWN0LCByZXNvbHZlLCByZWplY3QsIG9uUmVqZWN0KSlcbiAgICAgIGlmICh0eXBlb2YgcC5zdGF0dXMgIT09ICd1bmRlZmluZWQnKSBmbHVzaCh3YWl0aW5nLCBwKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlICh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHAuc3RhdHVzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuXG4gICAgaWYgKHZhbCA9PT0gcCkgdGhyb3cgZXJyXG4gICAgaWYgKHZhbCkgdHJ5IHsgaWYgKHR5cGVvZiB2YWwudGhlbiA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHZhbC50aGVuKHJlc29sdmUsIHJlamVjdCkgfSBjYXRjaCAoZSkge31cbiAgICBwLnN0YXR1cyA9IHRydWVcbiAgICBwLnZhbHVlID0gdmFsXG4gICAgZmx1c2god2FpdGluZywgcClcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlamVjdCAodmFsKSB7XG4gICAgaWYgKHR5cGVvZiBwLnN0YXR1cyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuICAgIGlmICh2YWwgPT09IHApIHRocm93IGVyclxuICAgIHAuc3RhdHVzID0gZmFsc2VcbiAgICBwLnZhbHVlID0gdmFsXG4gICAgZmx1c2god2FpdGluZywgcClcbiAgfVxufVxuXG5mdW5jdGlvbiBmbHVzaCAod2FpdGluZywgcCkge1xuICB2YXIgcXVldWUgPSBwLnN0YXR1cyA/IHdhaXRpbmcucmVzIDogd2FpdGluZy5yZWpcbiAgd2hpbGUgKHF1ZXVlLmxlbmd0aCkgcXVldWUuc2hpZnQoKShwLnZhbHVlKVxufVxuXG5mdW5jdGlvbiBoYW5kbGVOZXh0IChwLCB3YWl0aW5nLCBoYW5kbGVyLCByZXNvbHZlLCByZWplY3QsIGhhc1JlamVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24gbmV4dCAodmFsdWUpIHtcbiAgICB0cnkge1xuICAgICAgdmFsdWUgPSBoYW5kbGVyID8gaGFuZGxlcih2YWx1ZSkgOiB2YWx1ZVxuICAgICAgaWYgKHAuc3RhdHVzKSByZXR1cm4gcmVzb2x2ZSh2YWx1ZSlcbiAgICAgIHJldHVybiBoYXNSZWplY3QgPyByZXNvbHZlKHZhbHVlKSA6IHJlamVjdCh2YWx1ZSlcbiAgICB9IGNhdGNoIChlcnIpIHsgcmVqZWN0KGVycikgfVxuICB9XG59XG4iLCJjb25zdCBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxuY29uc3Qgb25jZSA9IHJlcXVpcmUoJy4uL2xpYi9vbmNlJylcbmNvbnN0IHdpdGhSZXN0b3JlQWxsID0gcmVxdWlyZSgnLi4vbGliL3dpdGhSZXN0b3JlQWxsJylcbmNvbnN0IHByb21pc2VkID0gcmVxdWlyZSgnLi4vbGliL3Byb21pc2VkJylcbmNvbnN0IG5vb3AgPSAoKSA9PiB7fVxuXG5mdW5jdGlvbiBvbkV2ZW50IChlbCwgdHlwZSwgZm4pIHtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbilcbiAgcmV0dXJuIG9uY2UoKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmbikpXG59XG5cbmZ1bmN0aW9uIHN0eWxlIChlbCwgY3NzLCBmbikge1xuICBjb25zdCBvcmlnaW5hbFN0eWxlID0gZWwuZ2V0QXR0cmlidXRlKCdzdHlsZScpXG4gIGNvbnN0IG5ld1N0eWxlID0gdHlwZW9mIGNzcyA9PT0gJ3N0cmluZycgPyBmcm9tU3R5bGUoY3NzKSA6IGNzc1xuICBjb25zdCBtZXJnZWQgPSB7XG4gICAgLi4uZnJvbVN0eWxlKG9yaWdpbmFsU3R5bGUpLFxuICAgIC4uLm5ld1N0eWxlXG4gIH1cbiAgZWwuc2V0QXR0cmlidXRlKCdzdHlsZScsIHRvU3R5bGUobWVyZ2VkKSlcbiAgcmV0dXJuIG9uY2UoKCkgPT4gZWwuc2V0QXR0cmlidXRlKCdzdHlsZScsIG9yaWdpbmFsU3R5bGUpKVxufVxuXG5mdW5jdGlvbiBmcm9tU3R5bGUgKHN0eWxlKSB7XG4gIGlmICghc3R5bGUpIHN0eWxlID0gJydcbiAgcmV0dXJuIHN0eWxlLnNwbGl0KCc7JykucmVkdWNlKChtZW1vLCB2YWwpID0+IHtcbiAgICBpZiAoIXZhbCkgcmV0dXJuIG1lbW9cbiAgICBjb25zdCBba2V5LCAuLi52YWx1ZV0gPSB2YWwuc3BsaXQoJzonKVxuICAgIG1lbW9ba2V5XSA9IHZhbHVlLmpvaW4oJzonKVxuICAgIHJldHVybiBtZW1vXG4gIH0sIHt9KVxufVxuXG5mdW5jdGlvbiB0b1N0eWxlIChjc3MpIHtcbiAgcmV0dXJuIF8ua2V5cyhjc3MpLnJlZHVjZSgobWVtbywga2V5KSA9PiB7XG4gICAgcmV0dXJuIG1lbW8gKyBgJHtrZWJhYihrZXkpfToke2Nzc1trZXldfTtgXG4gIH0sICcnKVxufVxuXG5mdW5jdGlvbiBrZWJhYiAoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFtBLVpdKS9nLCAnLSQxJykudG9Mb3dlckNhc2UoKVxufVxuXG5mdW5jdGlvbiBpc0luVmlld1BvcnQgKGVsKSB7XG4gIGlmIChlbCAmJiBlbC5wYXJlbnRFbGVtZW50KSB7XG4gICAgY29uc3QgeyB0b3AsIGJvdHRvbSB9ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCBpc0Fib3ZlV2luZG93c0JvdHRvbSA9XG4gICAgICB0b3AgPT09IGJvdHRvbVxuICAgICAgICA/IC8vIElmIGJvdGggYm90dG9tIGFuZCB0b3AgYXJlIGF0IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAgIC8vIHRoZSBlbGVtZW50IGlzIGVudGlyZWx5IGluc2lkZSB0aGUgdmlld3BvcnRcbiAgICAgICAgICB0b3AgPD0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIDogLy8gSWYgdGhlIGVsZW1lbnQgaGFzIGhlaWdodCwgd2hlbiB0b3AgaXMgYXQgd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICAgLy8gdGhlIGVsZW1lbnQgaXMgYmVsb3cgdGhlIHdpbmRvd1xuICAgICAgICAgIHRvcCA8IHdpbmRvdy5pbm5lckhlaWdodFxuICAgIGNvbnN0IGlzQmVsb3dXaW5kb3dzVG9wID1cbiAgICAgIHRvcCA9PT0gYm90dG9tXG4gICAgICAgID8gLy8gSWYgYm90aCBib3R0b20gYW5kIHRvcCBhcmUgYXQgMHB4XG4gICAgICAgICAgLy8gdGhlIGVsZW1lbnQgaXMgZW50aXJlbHkgaW5zaWRlIHRoZSB2aWV3cG9ydFxuICAgICAgICAgIGJvdHRvbSA+PSAwXG4gICAgICAgIDogLy8gSWYgdGhlIGVsZW1lbnQgaGFzIGhlaWdodCwgd2hlbiBib3R0b20gaXMgYXQgMHB4XG4gICAgICAgICAgLy8gdGhlIGVsZW1lbnQgaXMgYWJvdmUgdGhlIHdpbmRvd1xuICAgICAgICAgIGJvdHRvbSA+IDBcbiAgICByZXR1cm4gaXNBYm92ZVdpbmRvd3NCb3R0b20gJiYgaXNCZWxvd1dpbmRvd3NUb3BcbiAgfVxufVxuXG5mdW5jdGlvbiBvbkFueUVudGVyVmlld3BvcnQgKGVscywgZm4pIHtcbiAgY29uc3QgZGlzcG9zYWJsZXMgPSBbXVxuICBfLmVhY2goZWxzLCBlbCA9PiBkaXNwb3NhYmxlcy5wdXNoKG9uRW50ZXJWaWV3cG9ydChlbCwgZm4pKSlcbiAgcmV0dXJuIG9uY2UoKCkgPT4ge1xuICAgIHdoaWxlIChkaXNwb3NhYmxlcy5sZW5ndGgpIGRpc3Bvc2FibGVzLnBvcCgpKClcbiAgfSlcbn1cblxuZnVuY3Rpb24gb25FbnRlclZpZXdwb3J0IChlbCwgZm4sIHNjcm9sbFRhcmdldEVsID0gd2luZG93KSB7XG4gIGlmIChfLmlzQXJyYXkoZWwpKSB7XG4gICAgcmV0dXJuIG9uQW55RW50ZXJWaWV3cG9ydChlbCwgZm4pXG4gIH1cblxuICBpZiAoaXNJblZpZXdQb3J0KGVsKSkge1xuICAgIGZuKClcbiAgICByZXR1cm4gbm9vcFxuICB9XG5cbiAgY29uc3QgaGFuZGxlU2Nyb2xsID0gXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgaWYgKGlzSW5WaWV3UG9ydChlbCkpIHtcbiAgICAgIHNjcm9sbFRhcmdldEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGhhbmRsZVNjcm9sbClcbiAgICAgIGZuKClcbiAgICB9XG4gIH0sIDUwKVxuICBzY3JvbGxUYXJnZXRFbC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBoYW5kbGVTY3JvbGwpXG4gIHJldHVybiBvbmNlKCgpID0+IHNjcm9sbFRhcmdldEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGhhbmRsZVNjcm9sbCkpXG59XG5cbmZ1bmN0aW9uIHJlcGxhY2UgKHRhcmdldCwgZWwpIHtcbiAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnRcbiAgcGFyZW50Lmluc2VydEJlZm9yZShlbCwgdGFyZ2V0Lm5leHRTaWJsaW5nKVxuICBwYXJlbnQucmVtb3ZlQ2hpbGQodGFyZ2V0KVxuICByZXR1cm4gb25jZSgoKSA9PiByZXBsYWNlKGVsLCB0YXJnZXQpKVxufVxuXG5mdW5jdGlvbiBpbnNlcnRBZnRlciAodGFyZ2V0LCBlbCkge1xuICBjb25zdCBwYXJlbnQgPSB0YXJnZXQucGFyZW50RWxlbWVudFxuICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQubmV4dFNpYmxpbmcpXG4gIHJldHVybiBvbmNlKCgpID0+IHBhcmVudC5yZW1vdmVDaGlsZChlbCkpXG59XG5cbmZ1bmN0aW9uIGluc2VydEJlZm9yZSAodGFyZ2V0LCBlbCkge1xuICBjb25zdCBwYXJlbnQgPSB0YXJnZXQucGFyZW50RWxlbWVudFxuICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQpXG4gIHJldHVybiBvbmNlKCgpID0+IHBhcmVudC5yZW1vdmVDaGlsZChlbCkpXG59XG5cbmZ1bmN0aW9uIGFwcGVuZENoaWxkICh0YXJnZXQsIGVsKSB7XG4gIHRhcmdldC5hcHBlbmRDaGlsZChlbClcbiAgcmV0dXJuIG9uY2UoKCkgPT4gdGFyZ2V0LnJlbW92ZUNoaWxkKGVsKSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIGNvbnN0IHV0aWxzID0gd2l0aFJlc3RvcmVBbGwoe1xuICAgIG9uRXZlbnQsXG4gICAgb25FbnRlclZpZXdwb3J0LFxuICAgIHJlcGxhY2UsXG4gICAgc3R5bGUsXG4gICAgaW5zZXJ0QWZ0ZXIsXG4gICAgaW5zZXJ0QmVmb3JlLFxuICAgIGFwcGVuZENoaWxkLFxuICAgIGNsb3Nlc3RcbiAgfSlcblxuICBfLmVhY2goXy5rZXlzKHV0aWxzKSwga2V5ID0+IHtcbiAgICBpZiAoa2V5LmluZGV4T2YoJ29uJykgPT09IDApIHV0aWxzW2tleV0gPSBwcm9taXNlZCh1dGlsc1trZXldKVxuICB9KVxuXG4gIHJldHVybiB1dGlsc1xufVxuXG5mdW5jdGlvbiBjbG9zZXN0IChlbGVtZW50LCBzZWxlY3Rvcikge1xuICBpZiAod2luZG93LkVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgICByZXR1cm4gd2luZG93LkVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QuY2FsbChlbGVtZW50LCBzZWxlY3RvcilcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBtYXRjaGVzID0gd2luZG93LkVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgfHxcbiAgICAgIHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgd2luZG93LkVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvclxuXG4gICAgbGV0IGVsID0gZWxlbWVudFxuXG4gICAgZG8ge1xuICAgICAgaWYgKG1hdGNoZXMuY2FsbChlbCwgc2VsZWN0b3IpKSByZXR1cm4gZWxcbiAgICAgIGVsID0gZWwucGFyZW50RWxlbWVudCB8fCBlbC5wYXJlbnROb2RlXG4gICAgfSB3aGlsZSAoZWwgIT09IG51bGwgJiYgZWwubm9kZVR5cGUgPT09IDEpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvbmNlIChmbikge1xuICBsZXQgY2FsbGVkID0gZmFsc2VcbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgaWYgKGNhbGxlZCkgcmV0dXJuXG4gICAgY2FsbGVkID0gdHJ1ZVxuICAgIHJldHVybiBmbiguLi5hcmdzKVxuICB9XG59XG4iLCJjb25zdCBQcm9taXNlID0gcmVxdWlyZSgnc3luYy1wJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwcm9taXNlZCAoZm4pIHtcbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBmbiguLi5hcmdzKVxuICAgIH1cbiAgICBsZXQgZGlzcG9zZVxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGFyZ3MucHVzaChyZXNvbHZlKVxuICAgICAgZGlzcG9zZSA9IGZuKC4uLmFyZ3MpXG4gICAgfSkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGRpc3Bvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGlzcG9zZSgpXG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9KVxuICB9XG59XG4iLCJjb25zdCBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHdpdGhSZXN0b3JlQWxsICh1dGlscykge1xuICBjb25zdCBjbGVhbnVwID0gW11cblxuICBmdW5jdGlvbiByZXN0b3JhYmxlIChmbikge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgY29uc3QgZGlzcG9zZSA9IGZuKC4uLmFyZ3MpXG4gICAgICBpZiAodHlwZW9mIGRpc3Bvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2xlYW51cC5wdXNoKGRpc3Bvc2UpXG4gICAgICB9XG4gICAgICByZXR1cm4gZGlzcG9zZVxuICAgIH1cbiAgfVxuICBjb25zdCByZXN1bHQgPSB7fVxuXG4gIGZvciAoY29uc3Qga2V5IG9mIF8ua2V5cyh1dGlscykpIHtcbiAgICByZXN1bHRba2V5XSA9IHJlc3RvcmFibGUodXRpbHNba2V5XSlcbiAgfVxuXG4gIHJlc3VsdC5yZXN0b3JlQWxsID0gZnVuY3Rpb24gcmVzdG9yZUFsbCAoKSB7XG4gICAgd2hpbGUgKGNsZWFudXAubGVuZ3RoKSBjbGVhbnVwLnBvcCgpKClcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cbiIsInZhciBuLGwsdSxpLHQsbyxyLGYsZT17fSxjPVtdLHM9L2FjaXR8ZXgoPzpzfGd8bnxwfCQpfHJwaHxncmlkfG93c3xtbmN8bnR3fGluZVtjaF18em9vfF5vcmR8aXRlcmEvaTtmdW5jdGlvbiBhKG4sbCl7Zm9yKHZhciB1IGluIGwpblt1XT1sW3VdO3JldHVybiBufWZ1bmN0aW9uIGgobil7dmFyIGw9bi5wYXJlbnROb2RlO2wmJmwucmVtb3ZlQ2hpbGQobil9ZnVuY3Rpb24gdihsLHUsaSl7dmFyIHQsbyxyLGY9e307Zm9yKHIgaW4gdSlcImtleVwiPT1yP3Q9dVtyXTpcInJlZlwiPT1yP289dVtyXTpmW3JdPXVbcl07aWYoYXJndW1lbnRzLmxlbmd0aD4yJiYoZi5jaGlsZHJlbj1hcmd1bWVudHMubGVuZ3RoPjM/bi5jYWxsKGFyZ3VtZW50cywyKTppKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBsJiZudWxsIT1sLmRlZmF1bHRQcm9wcylmb3IociBpbiBsLmRlZmF1bHRQcm9wcyl2b2lkIDA9PT1mW3JdJiYoZltyXT1sLmRlZmF1bHRQcm9wc1tyXSk7cmV0dXJuIHkobCxmLHQsbyxudWxsKX1mdW5jdGlvbiB5KG4saSx0LG8scil7dmFyIGY9e3R5cGU6bixwcm9wczppLGtleTp0LHJlZjpvLF9fazpudWxsLF9fOm51bGwsX19iOjAsX19lOm51bGwsX19kOnZvaWQgMCxfX2M6bnVsbCxfX2g6bnVsbCxjb25zdHJ1Y3Rvcjp2b2lkIDAsX192Om51bGw9PXI/Kyt1OnJ9O3JldHVybiBudWxsPT1yJiZudWxsIT1sLnZub2RlJiZsLnZub2RlKGYpLGZ9ZnVuY3Rpb24gcCgpe3JldHVybntjdXJyZW50Om51bGx9fWZ1bmN0aW9uIGQobil7cmV0dXJuIG4uY2hpbGRyZW59ZnVuY3Rpb24gXyhuLGwpe3RoaXMucHJvcHM9bix0aGlzLmNvbnRleHQ9bH1mdW5jdGlvbiBrKG4sbCl7aWYobnVsbD09bClyZXR1cm4gbi5fXz9rKG4uX18sbi5fXy5fX2suaW5kZXhPZihuKSsxKTpudWxsO2Zvcih2YXIgdTtsPG4uX19rLmxlbmd0aDtsKyspaWYobnVsbCE9KHU9bi5fX2tbbF0pJiZudWxsIT11Ll9fZSlyZXR1cm4gdS5fX2U7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2Ygbi50eXBlP2sobik6bnVsbH1mdW5jdGlvbiBiKG4pe3ZhciBsLHU7aWYobnVsbCE9KG49bi5fXykmJm51bGwhPW4uX19jKXtmb3Iobi5fX2U9bi5fX2MuYmFzZT1udWxsLGw9MDtsPG4uX19rLmxlbmd0aDtsKyspaWYobnVsbCE9KHU9bi5fX2tbbF0pJiZudWxsIT11Ll9fZSl7bi5fX2U9bi5fX2MuYmFzZT11Ll9fZTticmVha31yZXR1cm4gYihuKX19ZnVuY3Rpb24gbShuKXsoIW4uX19kJiYobi5fX2Q9ITApJiZ0LnB1c2gobikmJiFnLl9fcisrfHxyIT09bC5kZWJvdW5jZVJlbmRlcmluZykmJigocj1sLmRlYm91bmNlUmVuZGVyaW5nKXx8bykoZyl9ZnVuY3Rpb24gZygpe2Zvcih2YXIgbjtnLl9fcj10Lmxlbmd0aDspbj10LnNvcnQoZnVuY3Rpb24obixsKXtyZXR1cm4gbi5fX3YuX19iLWwuX192Ll9fYn0pLHQ9W10sbi5zb21lKGZ1bmN0aW9uKG4pe3ZhciBsLHUsaSx0LG8scjtuLl9fZCYmKG89KHQ9KGw9bikuX192KS5fX2UsKHI9bC5fX1ApJiYodT1bXSwoaT1hKHt9LHQpKS5fX3Y9dC5fX3YrMSxqKHIsdCxpLGwuX19uLHZvaWQgMCE9PXIub3duZXJTVkdFbGVtZW50LG51bGwhPXQuX19oP1tvXTpudWxsLHUsbnVsbD09bz9rKHQpOm8sdC5fX2gpLHoodSx0KSx0Ll9fZSE9byYmYih0KSkpfSl9ZnVuY3Rpb24gdyhuLGwsdSxpLHQsbyxyLGYscyxhKXt2YXIgaCx2LHAsXyxiLG0sZyx3PWkmJmkuX19rfHxjLEE9dy5sZW5ndGg7Zm9yKHUuX19rPVtdLGg9MDtoPGwubGVuZ3RoO2grKylpZihudWxsIT0oXz11Ll9fa1toXT1udWxsPT0oXz1sW2hdKXx8XCJib29sZWFuXCI9PXR5cGVvZiBfP251bGw6XCJzdHJpbmdcIj09dHlwZW9mIF98fFwibnVtYmVyXCI9PXR5cGVvZiBffHxcImJpZ2ludFwiPT10eXBlb2YgXz95KG51bGwsXyxudWxsLG51bGwsXyk6QXJyYXkuaXNBcnJheShfKT95KGQse2NoaWxkcmVuOl99LG51bGwsbnVsbCxudWxsKTpfLl9fYj4wP3koXy50eXBlLF8ucHJvcHMsXy5rZXksbnVsbCxfLl9fdik6Xykpe2lmKF8uX189dSxfLl9fYj11Ll9fYisxLG51bGw9PT0ocD13W2hdKXx8cCYmXy5rZXk9PXAua2V5JiZfLnR5cGU9PT1wLnR5cGUpd1toXT12b2lkIDA7ZWxzZSBmb3Iodj0wO3Y8QTt2Kyspe2lmKChwPXdbdl0pJiZfLmtleT09cC5rZXkmJl8udHlwZT09PXAudHlwZSl7d1t2XT12b2lkIDA7YnJlYWt9cD1udWxsfWoobixfLHA9cHx8ZSx0LG8scixmLHMsYSksYj1fLl9fZSwodj1fLnJlZikmJnAucmVmIT12JiYoZ3x8KGc9W10pLHAucmVmJiZnLnB1c2gocC5yZWYsbnVsbCxfKSxnLnB1c2godixfLl9fY3x8YixfKSksbnVsbCE9Yj8obnVsbD09bSYmKG09YiksXCJmdW5jdGlvblwiPT10eXBlb2YgXy50eXBlJiZfLl9faz09PXAuX19rP18uX19kPXM9eChfLHMsbik6cz1QKG4sXyxwLHcsYixzKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiB1LnR5cGUmJih1Ll9fZD1zKSk6cyYmcC5fX2U9PXMmJnMucGFyZW50Tm9kZSE9biYmKHM9ayhwKSl9Zm9yKHUuX19lPW0saD1BO2gtLTspbnVsbCE9d1toXSYmKFwiZnVuY3Rpb25cIj09dHlwZW9mIHUudHlwZSYmbnVsbCE9d1toXS5fX2UmJndbaF0uX19lPT11Ll9fZCYmKHUuX19kPWsoaSxoKzEpKSxOKHdbaF0sd1toXSkpO2lmKGcpZm9yKGg9MDtoPGcubGVuZ3RoO2grKylNKGdbaF0sZ1srK2hdLGdbKytoXSl9ZnVuY3Rpb24geChuLGwsdSl7Zm9yKHZhciBpLHQ9bi5fX2ssbz0wO3QmJm88dC5sZW5ndGg7bysrKShpPXRbb10pJiYoaS5fXz1uLGw9XCJmdW5jdGlvblwiPT10eXBlb2YgaS50eXBlP3goaSxsLHUpOlAodSxpLGksdCxpLl9fZSxsKSk7cmV0dXJuIGx9ZnVuY3Rpb24gQShuLGwpe3JldHVybiBsPWx8fFtdLG51bGw9PW58fFwiYm9vbGVhblwiPT10eXBlb2Ygbnx8KEFycmF5LmlzQXJyYXkobik/bi5zb21lKGZ1bmN0aW9uKG4pe0EobixsKX0pOmwucHVzaChuKSksbH1mdW5jdGlvbiBQKG4sbCx1LGksdCxvKXt2YXIgcixmLGU7aWYodm9pZCAwIT09bC5fX2Qpcj1sLl9fZCxsLl9fZD12b2lkIDA7ZWxzZSBpZihudWxsPT11fHx0IT1vfHxudWxsPT10LnBhcmVudE5vZGUpbjppZihudWxsPT1vfHxvLnBhcmVudE5vZGUhPT1uKW4uYXBwZW5kQ2hpbGQodCkscj1udWxsO2Vsc2V7Zm9yKGY9byxlPTA7KGY9Zi5uZXh0U2libGluZykmJmU8aS5sZW5ndGg7ZSs9MilpZihmPT10KWJyZWFrIG47bi5pbnNlcnRCZWZvcmUodCxvKSxyPW99cmV0dXJuIHZvaWQgMCE9PXI/cjp0Lm5leHRTaWJsaW5nfWZ1bmN0aW9uIEMobixsLHUsaSx0KXt2YXIgbztmb3IobyBpbiB1KVwiY2hpbGRyZW5cIj09PW98fFwia2V5XCI9PT1vfHxvIGluIGx8fEgobixvLG51bGwsdVtvXSxpKTtmb3IobyBpbiBsKXQmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIGxbb118fFwiY2hpbGRyZW5cIj09PW98fFwia2V5XCI9PT1vfHxcInZhbHVlXCI9PT1vfHxcImNoZWNrZWRcIj09PW98fHVbb109PT1sW29dfHxIKG4sbyxsW29dLHVbb10saSl9ZnVuY3Rpb24gJChuLGwsdSl7XCItXCI9PT1sWzBdP24uc2V0UHJvcGVydHkobCx1KTpuW2xdPW51bGw9PXU/XCJcIjpcIm51bWJlclwiIT10eXBlb2YgdXx8cy50ZXN0KGwpP3U6dStcInB4XCJ9ZnVuY3Rpb24gSChuLGwsdSxpLHQpe3ZhciBvO246aWYoXCJzdHlsZVwiPT09bClpZihcInN0cmluZ1wiPT10eXBlb2YgdSluLnN0eWxlLmNzc1RleHQ9dTtlbHNle2lmKFwic3RyaW5nXCI9PXR5cGVvZiBpJiYobi5zdHlsZS5jc3NUZXh0PWk9XCJcIiksaSlmb3IobCBpbiBpKXUmJmwgaW4gdXx8JChuLnN0eWxlLGwsXCJcIik7aWYodSlmb3IobCBpbiB1KWkmJnVbbF09PT1pW2xdfHwkKG4uc3R5bGUsbCx1W2xdKX1lbHNlIGlmKFwib1wiPT09bFswXSYmXCJuXCI9PT1sWzFdKW89bCE9PShsPWwucmVwbGFjZSgvQ2FwdHVyZSQvLFwiXCIpKSxsPWwudG9Mb3dlckNhc2UoKWluIG4/bC50b0xvd2VyQ2FzZSgpLnNsaWNlKDIpOmwuc2xpY2UoMiksbi5sfHwobi5sPXt9KSxuLmxbbCtvXT11LHU/aXx8bi5hZGRFdmVudExpc3RlbmVyKGwsbz9UOkksbyk6bi5yZW1vdmVFdmVudExpc3RlbmVyKGwsbz9UOkksbyk7ZWxzZSBpZihcImRhbmdlcm91c2x5U2V0SW5uZXJIVE1MXCIhPT1sKXtpZih0KWw9bC5yZXBsYWNlKC94bGluayhIfDpoKS8sXCJoXCIpLnJlcGxhY2UoL3NOYW1lJC8sXCJzXCIpO2Vsc2UgaWYoXCJocmVmXCIhPT1sJiZcImxpc3RcIiE9PWwmJlwiZm9ybVwiIT09bCYmXCJ0YWJJbmRleFwiIT09bCYmXCJkb3dubG9hZFwiIT09bCYmbCBpbiBuKXRyeXtuW2xdPW51bGw9PXU/XCJcIjp1O2JyZWFrIG59Y2F0Y2gobil7fVwiZnVuY3Rpb25cIj09dHlwZW9mIHV8fChudWxsIT11JiYoITEhPT11fHxcImFcIj09PWxbMF0mJlwiclwiPT09bFsxXSk/bi5zZXRBdHRyaWJ1dGUobCx1KTpuLnJlbW92ZUF0dHJpYnV0ZShsKSl9fWZ1bmN0aW9uIEkobil7dGhpcy5sW24udHlwZSshMV0obC5ldmVudD9sLmV2ZW50KG4pOm4pfWZ1bmN0aW9uIFQobil7dGhpcy5sW24udHlwZSshMF0obC5ldmVudD9sLmV2ZW50KG4pOm4pfWZ1bmN0aW9uIGoobix1LGksdCxvLHIsZixlLGMpe3ZhciBzLGgsdix5LHAsayxiLG0sZyx4LEEsUD11LnR5cGU7aWYodm9pZCAwIT09dS5jb25zdHJ1Y3RvcilyZXR1cm4gbnVsbDtudWxsIT1pLl9faCYmKGM9aS5fX2gsZT11Ll9fZT1pLl9fZSx1Ll9faD1udWxsLHI9W2VdKSwocz1sLl9fYikmJnModSk7dHJ5e246aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUCl7aWYobT11LnByb3BzLGc9KHM9UC5jb250ZXh0VHlwZSkmJnRbcy5fX2NdLHg9cz9nP2cucHJvcHMudmFsdWU6cy5fXzp0LGkuX19jP2I9KGg9dS5fX2M9aS5fX2MpLl9fPWguX19FOihcInByb3RvdHlwZVwiaW4gUCYmUC5wcm90b3R5cGUucmVuZGVyP3UuX19jPWg9bmV3IFAobSx4KToodS5fX2M9aD1uZXcgXyhtLHgpLGguY29uc3RydWN0b3I9UCxoLnJlbmRlcj1PKSxnJiZnLnN1YihoKSxoLnByb3BzPW0saC5zdGF0ZXx8KGguc3RhdGU9e30pLGguY29udGV4dD14LGguX19uPXQsdj1oLl9fZD0hMCxoLl9faD1bXSksbnVsbD09aC5fX3MmJihoLl9fcz1oLnN0YXRlKSxudWxsIT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmKGguX19zPT1oLnN0YXRlJiYoaC5fX3M9YSh7fSxoLl9fcykpLGEoaC5fX3MsUC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMobSxoLl9fcykpKSx5PWgucHJvcHMscD1oLnN0YXRlLHYpbnVsbD09UC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJm51bGwhPWguY29tcG9uZW50V2lsbE1vdW50JiZoLmNvbXBvbmVudFdpbGxNb3VudCgpLG51bGwhPWguY29tcG9uZW50RGlkTW91bnQmJmguX19oLnB1c2goaC5jb21wb25lbnREaWRNb3VudCk7ZWxzZXtpZihudWxsPT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmbSE9PXkmJm51bGwhPWguY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyYmaC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG0seCksIWguX19lJiZudWxsIT1oLnNob3VsZENvbXBvbmVudFVwZGF0ZSYmITE9PT1oLnNob3VsZENvbXBvbmVudFVwZGF0ZShtLGguX19zLHgpfHx1Ll9fdj09PWkuX192KXtoLnByb3BzPW0saC5zdGF0ZT1oLl9fcyx1Ll9fdiE9PWkuX192JiYoaC5fX2Q9ITEpLGguX192PXUsdS5fX2U9aS5fX2UsdS5fX2s9aS5fX2ssdS5fX2suZm9yRWFjaChmdW5jdGlvbihuKXtuJiYobi5fXz11KX0pLGguX19oLmxlbmd0aCYmZi5wdXNoKGgpO2JyZWFrIG59bnVsbCE9aC5jb21wb25lbnRXaWxsVXBkYXRlJiZoLmNvbXBvbmVudFdpbGxVcGRhdGUobSxoLl9fcyx4KSxudWxsIT1oLmNvbXBvbmVudERpZFVwZGF0ZSYmaC5fX2gucHVzaChmdW5jdGlvbigpe2guY29tcG9uZW50RGlkVXBkYXRlKHkscCxrKX0pfWguY29udGV4dD14LGgucHJvcHM9bSxoLnN0YXRlPWguX19zLChzPWwuX19yKSYmcyh1KSxoLl9fZD0hMSxoLl9fdj11LGguX19QPW4scz1oLnJlbmRlcihoLnByb3BzLGguc3RhdGUsaC5jb250ZXh0KSxoLnN0YXRlPWguX19zLG51bGwhPWguZ2V0Q2hpbGRDb250ZXh0JiYodD1hKGEoe30sdCksaC5nZXRDaGlsZENvbnRleHQoKSkpLHZ8fG51bGw9PWguZ2V0U25hcHNob3RCZWZvcmVVcGRhdGV8fChrPWguZ2V0U25hcHNob3RCZWZvcmVVcGRhdGUoeSxwKSksQT1udWxsIT1zJiZzLnR5cGU9PT1kJiZudWxsPT1zLmtleT9zLnByb3BzLmNoaWxkcmVuOnMsdyhuLEFycmF5LmlzQXJyYXkoQSk/QTpbQV0sdSxpLHQsbyxyLGYsZSxjKSxoLmJhc2U9dS5fX2UsdS5fX2g9bnVsbCxoLl9faC5sZW5ndGgmJmYucHVzaChoKSxiJiYoaC5fX0U9aC5fXz1udWxsKSxoLl9fZT0hMX1lbHNlIG51bGw9PXImJnUuX192PT09aS5fX3Y/KHUuX19rPWkuX19rLHUuX19lPWkuX19lKTp1Ll9fZT1MKGkuX19lLHUsaSx0LG8scixmLGMpOyhzPWwuZGlmZmVkKSYmcyh1KX1jYXRjaChuKXt1Ll9fdj1udWxsLChjfHxudWxsIT1yKSYmKHUuX19lPWUsdS5fX2g9ISFjLHJbci5pbmRleE9mKGUpXT1udWxsKSxsLl9fZShuLHUsaSl9fWZ1bmN0aW9uIHoobix1KXtsLl9fYyYmbC5fX2ModSxuKSxuLnNvbWUoZnVuY3Rpb24odSl7dHJ5e249dS5fX2gsdS5fX2g9W10sbi5zb21lKGZ1bmN0aW9uKG4pe24uY2FsbCh1KX0pfWNhdGNoKG4pe2wuX19lKG4sdS5fX3YpfX0pfWZ1bmN0aW9uIEwobCx1LGksdCxvLHIsZixjKXt2YXIgcyxhLHYseT1pLnByb3BzLHA9dS5wcm9wcyxkPXUudHlwZSxfPTA7aWYoXCJzdmdcIj09PWQmJihvPSEwKSxudWxsIT1yKWZvcig7XzxyLmxlbmd0aDtfKyspaWYoKHM9cltfXSkmJlwic2V0QXR0cmlidXRlXCJpbiBzPT0hIWQmJihkP3MubG9jYWxOYW1lPT09ZDozPT09cy5ub2RlVHlwZSkpe2w9cyxyW19dPW51bGw7YnJlYWt9aWYobnVsbD09bCl7aWYobnVsbD09PWQpcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHApO2w9bz9kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLGQpOmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZCxwLmlzJiZwKSxyPW51bGwsYz0hMX1pZihudWxsPT09ZCl5PT09cHx8YyYmbC5kYXRhPT09cHx8KGwuZGF0YT1wKTtlbHNle2lmKHI9ciYmbi5jYWxsKGwuY2hpbGROb2RlcyksYT0oeT1pLnByb3BzfHxlKS5kYW5nZXJvdXNseVNldElubmVySFRNTCx2PXAuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwsIWMpe2lmKG51bGwhPXIpZm9yKHk9e30sXz0wO188bC5hdHRyaWJ1dGVzLmxlbmd0aDtfKyspeVtsLmF0dHJpYnV0ZXNbX10ubmFtZV09bC5hdHRyaWJ1dGVzW19dLnZhbHVlOyh2fHxhKSYmKHYmJihhJiZ2Ll9faHRtbD09YS5fX2h0bWx8fHYuX19odG1sPT09bC5pbm5lckhUTUwpfHwobC5pbm5lckhUTUw9diYmdi5fX2h0bWx8fFwiXCIpKX1pZihDKGwscCx5LG8sYyksdil1Ll9faz1bXTtlbHNlIGlmKF89dS5wcm9wcy5jaGlsZHJlbix3KGwsQXJyYXkuaXNBcnJheShfKT9fOltfXSx1LGksdCxvJiZcImZvcmVpZ25PYmplY3RcIiE9PWQscixmLHI/clswXTppLl9fayYmayhpLDApLGMpLG51bGwhPXIpZm9yKF89ci5sZW5ndGg7Xy0tOyludWxsIT1yW19dJiZoKHJbX10pO2N8fChcInZhbHVlXCJpbiBwJiZ2b2lkIDAhPT0oXz1wLnZhbHVlKSYmKF8hPT1sLnZhbHVlfHxcInByb2dyZXNzXCI9PT1kJiYhX3x8XCJvcHRpb25cIj09PWQmJl8hPT15LnZhbHVlKSYmSChsLFwidmFsdWVcIixfLHkudmFsdWUsITEpLFwiY2hlY2tlZFwiaW4gcCYmdm9pZCAwIT09KF89cC5jaGVja2VkKSYmXyE9PWwuY2hlY2tlZCYmSChsLFwiY2hlY2tlZFwiLF8seS5jaGVja2VkLCExKSl9cmV0dXJuIGx9ZnVuY3Rpb24gTShuLHUsaSl7dHJ5e1wiZnVuY3Rpb25cIj09dHlwZW9mIG4/bih1KTpuLmN1cnJlbnQ9dX1jYXRjaChuKXtsLl9fZShuLGkpfX1mdW5jdGlvbiBOKG4sdSxpKXt2YXIgdCxvO2lmKGwudW5tb3VudCYmbC51bm1vdW50KG4pLCh0PW4ucmVmKSYmKHQuY3VycmVudCYmdC5jdXJyZW50IT09bi5fX2V8fE0odCxudWxsLHUpKSxudWxsIT0odD1uLl9fYykpe2lmKHQuY29tcG9uZW50V2lsbFVubW91bnQpdHJ5e3QuY29tcG9uZW50V2lsbFVubW91bnQoKX1jYXRjaChuKXtsLl9fZShuLHUpfXQuYmFzZT10Ll9fUD1udWxsfWlmKHQ9bi5fX2spZm9yKG89MDtvPHQubGVuZ3RoO28rKyl0W29dJiZOKHRbb10sdSxcImZ1bmN0aW9uXCIhPXR5cGVvZiBuLnR5cGUpO2l8fG51bGw9PW4uX19lfHxoKG4uX19lKSxuLl9fZT1uLl9fZD12b2lkIDB9ZnVuY3Rpb24gTyhuLGwsdSl7cmV0dXJuIHRoaXMuY29uc3RydWN0b3Iobix1KX1mdW5jdGlvbiBTKHUsaSx0KXt2YXIgbyxyLGY7bC5fXyYmbC5fXyh1LGkpLHI9KG89XCJmdW5jdGlvblwiPT10eXBlb2YgdCk/bnVsbDp0JiZ0Ll9fa3x8aS5fX2ssZj1bXSxqKGksdT0oIW8mJnR8fGkpLl9faz12KGQsbnVsbCxbdV0pLHJ8fGUsZSx2b2lkIDAhPT1pLm93bmVyU1ZHRWxlbWVudCwhbyYmdD9bdF06cj9udWxsOmkuZmlyc3RDaGlsZD9uLmNhbGwoaS5jaGlsZE5vZGVzKTpudWxsLGYsIW8mJnQ/dDpyP3IuX19lOmkuZmlyc3RDaGlsZCxvKSx6KGYsdSl9ZnVuY3Rpb24gcShuLGwpe1MobixsLHEpfWZ1bmN0aW9uIEIobCx1LGkpe3ZhciB0LG8scixmPWEoe30sbC5wcm9wcyk7Zm9yKHIgaW4gdSlcImtleVwiPT1yP3Q9dVtyXTpcInJlZlwiPT1yP289dVtyXTpmW3JdPXVbcl07cmV0dXJuIGFyZ3VtZW50cy5sZW5ndGg+MiYmKGYuY2hpbGRyZW49YXJndW1lbnRzLmxlbmd0aD4zP24uY2FsbChhcmd1bWVudHMsMik6aSkseShsLnR5cGUsZix0fHxsLmtleSxvfHxsLnJlZixudWxsKX1mdW5jdGlvbiBEKG4sbCl7dmFyIHU9e19fYzpsPVwiX19jQ1wiK2YrKyxfXzpuLENvbnN1bWVyOmZ1bmN0aW9uKG4sbCl7cmV0dXJuIG4uY2hpbGRyZW4obCl9LFByb3ZpZGVyOmZ1bmN0aW9uKG4pe3ZhciB1LGk7cmV0dXJuIHRoaXMuZ2V0Q2hpbGRDb250ZXh0fHwodT1bXSwoaT17fSlbbF09dGhpcyx0aGlzLmdldENoaWxkQ29udGV4dD1mdW5jdGlvbigpe3JldHVybiBpfSx0aGlzLnNob3VsZENvbXBvbmVudFVwZGF0ZT1mdW5jdGlvbihuKXt0aGlzLnByb3BzLnZhbHVlIT09bi52YWx1ZSYmdS5zb21lKG0pfSx0aGlzLnN1Yj1mdW5jdGlvbihuKXt1LnB1c2gobik7dmFyIGw9bi5jb21wb25lbnRXaWxsVW5tb3VudDtuLmNvbXBvbmVudFdpbGxVbm1vdW50PWZ1bmN0aW9uKCl7dS5zcGxpY2UodS5pbmRleE9mKG4pLDEpLGwmJmwuY2FsbChuKX19KSxuLmNoaWxkcmVufX07cmV0dXJuIHUuUHJvdmlkZXIuX189dS5Db25zdW1lci5jb250ZXh0VHlwZT11fW49Yy5zbGljZSxsPXtfX2U6ZnVuY3Rpb24obixsLHUsaSl7Zm9yKHZhciB0LG8scjtsPWwuX187KWlmKCh0PWwuX19jKSYmIXQuX18pdHJ5e2lmKChvPXQuY29uc3RydWN0b3IpJiZudWxsIT1vLmdldERlcml2ZWRTdGF0ZUZyb21FcnJvciYmKHQuc2V0U3RhdGUoby5nZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IobikpLHI9dC5fX2QpLG51bGwhPXQuY29tcG9uZW50RGlkQ2F0Y2gmJih0LmNvbXBvbmVudERpZENhdGNoKG4saXx8e30pLHI9dC5fX2QpLHIpcmV0dXJuIHQuX19FPXR9Y2F0Y2gobCl7bj1sfXRocm93IG59fSx1PTAsaT1mdW5jdGlvbihuKXtyZXR1cm4gbnVsbCE9biYmdm9pZCAwPT09bi5jb25zdHJ1Y3Rvcn0sXy5wcm90b3R5cGUuc2V0U3RhdGU9ZnVuY3Rpb24obixsKXt2YXIgdTt1PW51bGwhPXRoaXMuX19zJiZ0aGlzLl9fcyE9PXRoaXMuc3RhdGU/dGhpcy5fX3M6dGhpcy5fX3M9YSh7fSx0aGlzLnN0YXRlKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBuJiYobj1uKGEoe30sdSksdGhpcy5wcm9wcykpLG4mJmEodSxuKSxudWxsIT1uJiZ0aGlzLl9fdiYmKGwmJnRoaXMuX19oLnB1c2gobCksbSh0aGlzKSl9LF8ucHJvdG90eXBlLmZvcmNlVXBkYXRlPWZ1bmN0aW9uKG4pe3RoaXMuX192JiYodGhpcy5fX2U9ITAsbiYmdGhpcy5fX2gucHVzaChuKSxtKHRoaXMpKX0sXy5wcm90b3R5cGUucmVuZGVyPWQsdD1bXSxvPVwiZnVuY3Rpb25cIj09dHlwZW9mIFByb21pc2U/UHJvbWlzZS5wcm90b3R5cGUudGhlbi5iaW5kKFByb21pc2UucmVzb2x2ZSgpKTpzZXRUaW1lb3V0LGcuX19yPTAsZj0wO2V4cG9ydHtTIGFzIHJlbmRlcixxIGFzIGh5ZHJhdGUsdiBhcyBjcmVhdGVFbGVtZW50LHYgYXMgaCxkIGFzIEZyYWdtZW50LHAgYXMgY3JlYXRlUmVmLGkgYXMgaXNWYWxpZEVsZW1lbnQsXyBhcyBDb21wb25lbnQsQiBhcyBjbG9uZUVsZW1lbnQsRCBhcyBjcmVhdGVDb250ZXh0LEEgYXMgdG9DaGlsZEFycmF5LGwgYXMgb3B0aW9uc307XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3QubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0e29wdGlvbnMgYXMgbn1mcm9tXCJwcmVhY3RcIjt2YXIgdCx1LHIsbz0wLGk9W10sYz1uLl9fYixmPW4uX19yLGU9bi5kaWZmZWQsYT1uLl9fYyx2PW4udW5tb3VudDtmdW5jdGlvbiBsKHQscil7bi5fX2gmJm4uX19oKHUsdCxvfHxyKSxvPTA7dmFyIGk9dS5fX0h8fCh1Ll9fSD17X186W10sX19oOltdfSk7cmV0dXJuIHQ+PWkuX18ubGVuZ3RoJiZpLl9fLnB1c2goe30pLGkuX19bdF19ZnVuY3Rpb24gbShuKXtyZXR1cm4gbz0xLHAodyxuKX1mdW5jdGlvbiBwKG4scixvKXt2YXIgaT1sKHQrKywyKTtyZXR1cm4gaS50PW4saS5fX2N8fChpLl9fPVtvP28ocik6dyh2b2lkIDAsciksZnVuY3Rpb24obil7dmFyIHQ9aS50KGkuX19bMF0sbik7aS5fX1swXSE9PXQmJihpLl9fPVt0LGkuX19bMV1dLGkuX19jLnNldFN0YXRlKHt9KSl9XSxpLl9fYz11KSxpLl9ffWZ1bmN0aW9uIHkocixvKXt2YXIgaT1sKHQrKywzKTshbi5fX3MmJmsoaS5fX0gsbykmJihpLl9fPXIsaS5fX0g9byx1Ll9fSC5fX2gucHVzaChpKSl9ZnVuY3Rpb24gZChyLG8pe3ZhciBpPWwodCsrLDQpOyFuLl9fcyYmayhpLl9fSCxvKSYmKGkuX189cixpLl9fSD1vLHUuX19oLnB1c2goaSkpfWZ1bmN0aW9uIGgobil7cmV0dXJuIG89NSxfKGZ1bmN0aW9uKCl7cmV0dXJue2N1cnJlbnQ6bn19LFtdKX1mdW5jdGlvbiBzKG4sdCx1KXtvPTYsZChmdW5jdGlvbigpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIG4/KG4odCgpKSxmdW5jdGlvbigpe3JldHVybiBuKG51bGwpfSk6bj8obi5jdXJyZW50PXQoKSxmdW5jdGlvbigpe3JldHVybiBuLmN1cnJlbnQ9bnVsbH0pOnZvaWQgMH0sbnVsbD09dT91OnUuY29uY2F0KG4pKX1mdW5jdGlvbiBfKG4sdSl7dmFyIHI9bCh0KyssNyk7cmV0dXJuIGsoci5fX0gsdSkmJihyLl9fPW4oKSxyLl9fSD11LHIuX19oPW4pLHIuX199ZnVuY3Rpb24gQShuLHQpe3JldHVybiBvPTgsXyhmdW5jdGlvbigpe3JldHVybiBufSx0KX1mdW5jdGlvbiBGKG4pe3ZhciByPXUuY29udGV4dFtuLl9fY10sbz1sKHQrKyw5KTtyZXR1cm4gby5jPW4scj8obnVsbD09by5fXyYmKG8uX189ITAsci5zdWIodSkpLHIucHJvcHMudmFsdWUpOm4uX199ZnVuY3Rpb24gVCh0LHUpe24udXNlRGVidWdWYWx1ZSYmbi51c2VEZWJ1Z1ZhbHVlKHU/dSh0KTp0KX1mdW5jdGlvbiBxKG4pe3ZhciByPWwodCsrLDEwKSxvPW0oKTtyZXR1cm4gci5fXz1uLHUuY29tcG9uZW50RGlkQ2F0Y2h8fCh1LmNvbXBvbmVudERpZENhdGNoPWZ1bmN0aW9uKG4pe3IuX18mJnIuX18obiksb1sxXShuKX0pLFtvWzBdLGZ1bmN0aW9uKCl7b1sxXSh2b2lkIDApfV19ZnVuY3Rpb24geCgpe2Zvcih2YXIgdDt0PWkuc2hpZnQoKTspaWYodC5fX1ApdHJ5e3QuX19ILl9faC5mb3JFYWNoKGcpLHQuX19ILl9faC5mb3JFYWNoKGopLHQuX19ILl9faD1bXX1jYXRjaCh1KXt0Ll9fSC5fX2g9W10sbi5fX2UodSx0Ll9fdil9fW4uX19iPWZ1bmN0aW9uKG4pe3U9bnVsbCxjJiZjKG4pfSxuLl9fcj1mdW5jdGlvbihuKXtmJiZmKG4pLHQ9MDt2YXIgcj0odT1uLl9fYykuX19IO3ImJihyLl9faC5mb3JFYWNoKGcpLHIuX19oLmZvckVhY2goaiksci5fX2g9W10pfSxuLmRpZmZlZD1mdW5jdGlvbih0KXtlJiZlKHQpO3ZhciBvPXQuX19jO28mJm8uX19IJiZvLl9fSC5fX2gubGVuZ3RoJiYoMSE9PWkucHVzaChvKSYmcj09PW4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHwoKHI9bi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpfHxmdW5jdGlvbihuKXt2YXIgdCx1PWZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KHIpLGImJmNhbmNlbEFuaW1hdGlvbkZyYW1lKHQpLHNldFRpbWVvdXQobil9LHI9c2V0VGltZW91dCh1LDEwMCk7YiYmKHQ9cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHUpKX0pKHgpKSx1PW51bGx9LG4uX19jPWZ1bmN0aW9uKHQsdSl7dS5zb21lKGZ1bmN0aW9uKHQpe3RyeXt0Ll9faC5mb3JFYWNoKGcpLHQuX19oPXQuX19oLmZpbHRlcihmdW5jdGlvbihuKXtyZXR1cm4hbi5fX3x8aihuKX0pfWNhdGNoKHIpe3Uuc29tZShmdW5jdGlvbihuKXtuLl9faCYmKG4uX19oPVtdKX0pLHU9W10sbi5fX2Uocix0Ll9fdil9fSksYSYmYSh0LHUpfSxuLnVubW91bnQ9ZnVuY3Rpb24odCl7diYmdih0KTt2YXIgdSxyPXQuX19jO3ImJnIuX19IJiYoci5fX0guX18uZm9yRWFjaChmdW5jdGlvbihuKXt0cnl7ZyhuKX1jYXRjaChuKXt1PW59fSksdSYmbi5fX2UodSxyLl9fdikpfTt2YXIgYj1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ZnVuY3Rpb24gZyhuKXt2YXIgdD11LHI9bi5fX2M7XCJmdW5jdGlvblwiPT10eXBlb2YgciYmKG4uX19jPXZvaWQgMCxyKCkpLHU9dH1mdW5jdGlvbiBqKG4pe3ZhciB0PXU7bi5fX2M9bi5fXygpLHU9dH1mdW5jdGlvbiBrKG4sdCl7cmV0dXJuIW58fG4ubGVuZ3RoIT09dC5sZW5ndGh8fHQuc29tZShmdW5jdGlvbih0LHUpe3JldHVybiB0IT09blt1XX0pfWZ1bmN0aW9uIHcobix0KXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0P3Qobik6dH1leHBvcnR7bSBhcyB1c2VTdGF0ZSxwIGFzIHVzZVJlZHVjZXIseSBhcyB1c2VFZmZlY3QsZCBhcyB1c2VMYXlvdXRFZmZlY3QsaCBhcyB1c2VSZWYscyBhcyB1c2VJbXBlcmF0aXZlSGFuZGxlLF8gYXMgdXNlTWVtbyxBIGFzIHVzZUNhbGxiYWNrLEYgYXMgdXNlQ29udGV4dCxUIGFzIHVzZURlYnVnVmFsdWUscSBhcyB1c2VFcnJvckJvdW5kYXJ5fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhvb2tzLm1vZHVsZS5qcy5tYXBcbiIsInZhciB0b1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZ1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxudmFyIHJlZ2V4cENoYXJhY3RlcnMgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2dcbnZhciByZWdleHBJc05hdGl2ZUZuID0gdG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSlcbiAgLnJlcGxhY2UocmVnZXhwQ2hhcmFjdGVycywgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKVxudmFyIHJlZ2V4cElzTmF0aXZlID0gUmVnRXhwKCdeJyArIHJlZ2V4cElzTmF0aXZlRm4gKyAnJCcpXG5mdW5jdGlvbiB0b1NvdXJjZSAoZnVuYykge1xuICBpZiAoIWZ1bmMpIHJldHVybiAnJ1xuICB0cnkge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGZ1bmMpXG4gIH0gY2F0Y2ggKGUpIHt9XG4gIHRyeSB7XG4gICAgcmV0dXJuIChmdW5jICsgJycpXG4gIH0gY2F0Y2ggKGUpIHt9XG59XG52YXIgYXNzaWduID0gT2JqZWN0LmFzc2lnblxudmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaFxudmFyIGV2ZXJ5ID0gQXJyYXkucHJvdG90eXBlLmV2ZXJ5XG52YXIgZmlsdGVyID0gQXJyYXkucHJvdG90eXBlLmZpbHRlclxudmFyIGZpbmQgPSBBcnJheS5wcm90b3R5cGUuZmluZFxudmFyIGluZGV4T2YgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5XG52YXIga2V5cyA9IE9iamVjdC5rZXlzXG52YXIgbWFwID0gQXJyYXkucHJvdG90eXBlLm1hcFxudmFyIHJlZHVjZSA9IEFycmF5LnByb3RvdHlwZS5yZWR1Y2VcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZVxudmFyIHNvbWUgPSBBcnJheS5wcm90b3R5cGUuc29tZVxudmFyIHZhbHVlcyA9IE9iamVjdC52YWx1ZXNcbmZ1bmN0aW9uIGlzTmF0aXZlIChtZXRob2QpIHtcbiAgcmV0dXJuIG1ldGhvZCAmJiB0eXBlb2YgbWV0aG9kID09PSAnZnVuY3Rpb24nICYmIHJlZ2V4cElzTmF0aXZlLnRlc3QodG9Tb3VyY2UobWV0aG9kKSlcbn1cbnZhciBfID0ge1xuICBhc3NpZ246IGlzTmF0aXZlKGFzc2lnbilcbiAgICA/IGFzc2lnblxuICAgIDogZnVuY3Rpb24gYXNzaWduICh0YXJnZXQpIHtcbiAgICAgIHZhciBsID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXVxuICAgICAgICBmb3IgKHZhciBqIGluIHNvdXJjZSkgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShqKSkgdGFyZ2V0W2pdID0gc291cmNlW2pdXG4gICAgICB9XG4gICAgICByZXR1cm4gdGFyZ2V0XG4gICAgfSxcbiAgYmluZDogZnVuY3Rpb24gYmluZCAobWV0aG9kLCBjb250ZXh0KSB7XG4gICAgdmFyIGFyZ3MgPSBfLnNsaWNlKGFyZ3VtZW50cywgMilcbiAgICByZXR1cm4gZnVuY3Rpb24gYm91bmRGdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KF8uc2xpY2UoYXJndW1lbnRzKSkpXG4gICAgfVxuICB9LFxuICBkZWJvdW5jZTogZnVuY3Rpb24gZGVib3VuY2UgKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpc1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHNcbiAgICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGltZW91dCA9IG51bGxcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcbiAgICAgIH1cbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dClcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KVxuICAgICAgaWYgKGNhbGxOb3cpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcbiAgICB9XG4gIH0sXG4gIGVhY2g6IGlzTmF0aXZlKGZvckVhY2gpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVFYWNoIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmb3JFYWNoLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGVhY2ggKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICB9LFxuICBldmVyeTogaXNOYXRpdmUoZXZlcnkpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVFdmVyeSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGV2ZXJ5LmNhbGwoY29sbCwgcHJlZCwgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBldmVyeSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgaWYgKCFjb2xsIHx8ICFwcmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghcHJlZC5jYWxsKGNvbnRleHQsIGNvbGxbaV0sIGksIGNvbGwpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcbiAgZmlsdGVyOiBpc05hdGl2ZShmaWx0ZXIpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVGaWx0ZXIgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZpbHRlci5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBmaWx0ZXIgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIHZhciBvdXRwdXQgPSBbXVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KSkgb3V0cHV0LnB1c2goYXJyYXlbaV0pXG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcbiAgZmluZDogaXNOYXRpdmUoZmluZClcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUZpbmQgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZpbmQuY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZmluZCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KSkgcmV0dXJuIGFycmF5W2ldXG4gICAgICB9XG4gICAgfSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQgKG9iamVjdCwgcGF0aCkge1xuICAgIHJldHVybiBfLnJlZHVjZShwYXRoLnNwbGl0KCcuJyksIGZ1bmN0aW9uIChtZW1vLCBuZXh0KSB7XG4gICAgICByZXR1cm4gKHR5cGVvZiBtZW1vICE9PSAndW5kZWZpbmVkJyAmJiBtZW1vICE9PSBudWxsKSA/IG1lbW9bbmV4dF0gOiB1bmRlZmluZWRcbiAgICB9LCBvYmplY3QpXG4gIH0sXG4gIGlkZW50aXR5OiBmdW5jdGlvbiBpZGVudGl0eSAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcbiAgaW5kZXhPZjogaXNOYXRpdmUoaW5kZXhPZilcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUluZGV4T2YgKGFycmF5LCBpdGVtKSB7XG4gICAgICByZXR1cm4gaW5kZXhPZi5jYWxsKGFycmF5LCBpdGVtKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGluZGV4T2YgKGFycmF5LCBpdGVtKSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xXG4gICAgfSxcbiAgaW52b2tlOiBmdW5jdGlvbiBpbnZva2UgKGFycmF5LCBtZXRob2ROYW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBfLnNsaWNlKGFyZ3VtZW50cywgMilcbiAgICByZXR1cm4gXy5tYXAoYXJyYXksIGZ1bmN0aW9uIGludm9rZU1hcHBlciAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZVttZXRob2ROYW1lXS5hcHBseSh2YWx1ZSwgYXJncylcbiAgICB9KVxuICB9LFxuICBpc0FycmF5OiBpc05hdGl2ZShpc0FycmF5KVxuICAgID8gZnVuY3Rpb24gbmF0aXZlQXJyYXkgKGNvbGwpIHtcbiAgICAgIHJldHVybiBpc0FycmF5KGNvbGwpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gaXNBcnJheSAob2JqKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgICB9LFxuICBpc01hdGNoOiBmdW5jdGlvbiBpc01hdGNoIChvYmosIHNwZWMpIHtcbiAgICBmb3IgKHZhciBpIGluIHNwZWMpIHtcbiAgICAgIGlmIChzcGVjLmhhc093blByb3BlcnR5KGkpICYmIG9ialtpXSAhPT0gc3BlY1tpXSkgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH0sXG4gIGlzT2JqZWN0OiBmdW5jdGlvbiBpc09iamVjdCAob2JqKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqXG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmpcbiAgfSxcbiAga2V5czogaXNOYXRpdmUoa2V5cylcbiAgICA/IGtleXNcbiAgICA6IGZ1bmN0aW9uIGtleXMgKG9iamVjdCkge1xuICAgICAgdmFyIGtleXMgPSBbXVxuICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIGtleXMucHVzaChrZXkpXG4gICAgICB9XG4gICAgICByZXR1cm4ga2V5c1xuICAgIH0sXG4gIG1hcDogaXNOYXRpdmUobWFwKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlTWFwIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBtYXAuY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gbWFwIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICB2YXIgb3V0cHV0ID0gbmV3IEFycmF5KGwpXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBvdXRwdXRbaV0gPSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXRcbiAgICB9LFxuICBtYXRjaGVzOiBmdW5jdGlvbiBtYXRjaGVzIChzcGVjKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiBfLmlzTWF0Y2gob2JqLCBzcGVjKVxuICAgIH1cbiAgfSxcbiAgbm90OiBmdW5jdGlvbiBub3QgKHZhbHVlKSB7XG4gICAgcmV0dXJuICF2YWx1ZVxuICB9LFxuICBvYmplY3RFYWNoOiBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgIHJldHVybiBfLmVhY2goXy5rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG9iamVjdFtrZXldLCBrZXksIG9iamVjdClcbiAgICB9LCBjb250ZXh0KVxuICB9LFxuICBvYmplY3RNYXA6IGZ1bmN0aW9uIG9iamVjdE1hcCAob2JqZWN0LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSB7fVxuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IGNhbGxiYWNrLmNhbGwoY29udGV4dCwgb2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH0sXG4gIG9iamVjdFJlZHVjZTogZnVuY3Rpb24gb2JqZWN0UmVkdWNlIChvYmplY3QsIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpIHtcbiAgICB2YXIgb3V0cHV0ID0gaW5pdGlhbFZhbHVlXG4gICAgZm9yICh2YXIgaSBpbiBvYmplY3QpIHtcbiAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoaSkpIG91dHB1dCA9IGNhbGxiYWNrKG91dHB1dCwgb2JqZWN0W2ldLCBpLCBvYmplY3QpXG4gICAgfVxuICAgIHJldHVybiBvdXRwdXRcbiAgfSxcbiAgcGljazogZnVuY3Rpb24gcGljayAob2JqZWN0LCB0b1BpY2spIHtcbiAgICB2YXIgb3V0ID0ge31cbiAgICBfLmVhY2godG9QaWNrLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAodHlwZW9mIG9iamVjdFtrZXldICE9PSAndW5kZWZpbmVkJykgb3V0W2tleV0gPSBvYmplY3Rba2V5XVxuICAgIH0pXG4gICAgcmV0dXJuIG91dFxuICB9LFxuICBwbHVjazogZnVuY3Rpb24gcGx1Y2sgKGFycmF5LCBrZXkpIHtcbiAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgIHZhciBvdXQgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSBpZiAoYXJyYXlbaV0pIG91dFtpXSA9IGFycmF5W2ldW2tleV1cbiAgICByZXR1cm4gb3V0XG4gIH0sXG4gIHJlZHVjZTogaXNOYXRpdmUocmVkdWNlKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlUmVkdWNlIChhcnJheSwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSkge1xuICAgICAgcmV0dXJuIHJlZHVjZS5jYWxsKGFycmF5LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIHJlZHVjZSAoYXJyYXksIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpIHtcbiAgICAgIHZhciBvdXRwdXQgPSBpbml0aWFsVmFsdWVcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykgb3V0cHV0ID0gY2FsbGJhY2sob3V0cHV0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcbiAgc2V0OiBmdW5jdGlvbiBzZXQgKG9iamVjdCwgcGF0aCwgdmFsKSB7XG4gICAgaWYgKCFvYmplY3QpIHJldHVybiBvYmplY3RcbiAgICBpZiAodHlwZW9mIG9iamVjdCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iamVjdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG9iamVjdFxuICAgIHZhciBwYXJ0cyA9IHBhdGguc3BsaXQoJy4nKVxuICAgIHZhciBjb250ZXh0ID0gb2JqZWN0XG4gICAgdmFyIG5leHRLZXlcbiAgICBkbyB7XG4gICAgICBuZXh0S2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgaWYgKHR5cGVvZiBjb250ZXh0W25leHRLZXldICE9PSAnb2JqZWN0JykgY29udGV4dFtuZXh0S2V5XSA9IHt9XG4gICAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnRleHQgPSBjb250ZXh0W25leHRLZXldXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0W25leHRLZXldID0gdmFsXG4gICAgICB9XG4gICAgfSB3aGlsZSAocGFydHMubGVuZ3RoKVxuICAgIHJldHVybiBvYmplY3RcbiAgfSxcbiAgc2xpY2U6IGlzTmF0aXZlKHNsaWNlKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlU2xpY2UgKGFycmF5LCBiZWdpbiwgZW5kKSB7XG4gICAgICBiZWdpbiA9IGJlZ2luIHx8IDBcbiAgICAgIGVuZCA9IHR5cGVvZiBlbmQgPT09ICdudW1iZXInID8gZW5kIDogYXJyYXkubGVuZ3RoXG4gICAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgYmVnaW4sIGVuZClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBzbGljZSAoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgICAgIHN0YXJ0ID0gc3RhcnQgfHwgMFxuICAgICAgZW5kID0gdHlwZW9mIGVuZCA9PT0gJ251bWJlcicgPyBlbmQgOiBhcnJheS5sZW5ndGhcbiAgICAgIHZhciBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aFxuICAgICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFtdXG4gICAgICB9XG4gICAgICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgICAgIHN0YXJ0ID0gLXN0YXJ0ID4gbGVuZ3RoID8gMCA6IChsZW5ndGggKyBzdGFydClcbiAgICAgIH1cbiAgICAgIGVuZCA9IGVuZCA+IGxlbmd0aCA/IGxlbmd0aCA6IGVuZFxuICAgICAgaWYgKGVuZCA8IDApIHtcbiAgICAgICAgZW5kICs9IGxlbmd0aFxuICAgICAgfVxuICAgICAgbGVuZ3RoID0gc3RhcnQgPiBlbmQgPyAwIDogKChlbmQgLSBzdGFydCkgPj4+IDApXG4gICAgICBzdGFydCA+Pj49IDBcbiAgICAgIHZhciBpbmRleCA9IC0xXG4gICAgICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KGxlbmd0aClcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBhcnJheVtpbmRleCArIHN0YXJ0XVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH0sXG4gIHNvbWU6IGlzTmF0aXZlKHNvbWUpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVTb21lIChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gc29tZS5jYWxsKGNvbGwsIHByZWQsIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gc29tZSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgaWYgKCFjb2xsIHx8ICFwcmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcmVkLmNhbGwoY29udGV4dCwgY29sbFtpXSwgaSwgY29sbCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9LFxuICB1bmlxdWU6IGZ1bmN0aW9uIHVuaXF1ZSAoYXJyYXkpIHtcbiAgICByZXR1cm4gXy5yZWR1Y2UoYXJyYXksIGZ1bmN0aW9uIChtZW1vLCBjdXJyKSB7XG4gICAgICBpZiAoXy5pbmRleE9mKG1lbW8sIGN1cnIpID09PSAtMSkge1xuICAgICAgICBtZW1vLnB1c2goY3VycilcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vXG4gICAgfSwgW10pXG4gIH0sXG4gIHZhbHVlczogaXNOYXRpdmUodmFsdWVzKVxuICAgID8gdmFsdWVzXG4gICAgOiBmdW5jdGlvbiB2YWx1ZXMgKG9iamVjdCkge1xuICAgICAgdmFyIG91dCA9IFtdXG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkgb3V0LnB1c2gob2JqZWN0W2tleV0pXG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0XG4gICAgfSxcbiAgbmFtZTogJ3NsYXBkYXNoJyxcbiAgdmVyc2lvbjogJzEuMy4zJ1xufVxuXy5vYmplY3RNYXAuYXNBcnJheSA9IGZ1bmN0aW9uIG9iamVjdE1hcEFzQXJyYXkgKG9iamVjdCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgcmV0dXJuIF8ubWFwKF8ua2V5cyhvYmplY3QpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgb2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KVxuICB9LCBjb250ZXh0KVxufVxubW9kdWxlLmV4cG9ydHMgPSBfXG4iLCJ2YXIgZXJyID0gbmV3IEVycm9yKCdFcnJvcjogcmVjdXJzZXMhIGluZmluaXRlIHByb21pc2UgY2hhaW4gZGV0ZWN0ZWQnKVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwcm9taXNlIChyZXNvbHZlcikge1xuICB2YXIgd2FpdGluZyA9IHsgcmVzOiBbXSwgcmVqOiBbXSB9XG4gIHZhciBwID0ge1xuICAgICd0aGVuJzogdGhlbixcbiAgICAnY2F0Y2gnOiBmdW5jdGlvbiB0aGVuQ2F0Y2ggKG9uUmVqZWN0KSB7XG4gICAgICByZXR1cm4gdGhlbihudWxsLCBvblJlamVjdClcbiAgICB9XG4gIH1cbiAgdHJ5IHsgcmVzb2x2ZXIocmVzb2x2ZSwgcmVqZWN0KSB9IGNhdGNoIChlKSB7XG4gICAgcC5zdGF0dXMgPSBmYWxzZVxuICAgIHAudmFsdWUgPSBlXG4gIH1cbiAgcmV0dXJuIHBcblxuICBmdW5jdGlvbiB0aGVuIChvblJlc29sdmUsIG9uUmVqZWN0KSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgd2FpdGluZy5yZXMucHVzaChoYW5kbGVOZXh0KHAsIHdhaXRpbmcsIG9uUmVzb2x2ZSwgcmVzb2x2ZSwgcmVqZWN0LCBvblJlamVjdCkpXG4gICAgICB3YWl0aW5nLnJlai5wdXNoKGhhbmRsZU5leHQocCwgd2FpdGluZywgb25SZWplY3QsIHJlc29sdmUsIHJlamVjdCwgb25SZWplY3QpKVxuICAgICAgaWYgKHR5cGVvZiBwLnN0YXR1cyAhPT0gJ3VuZGVmaW5lZCcpIGZsdXNoKHdhaXRpbmcsIHApXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmUgKHZhbCkge1xuICAgIGlmICh0eXBlb2YgcC5zdGF0dXMgIT09ICd1bmRlZmluZWQnKSByZXR1cm5cbiAgICBpZiAodmFsID09PSBwKSB0aHJvdyBlcnJcbiAgICBpZiAodmFsKSB0cnkgeyBpZiAodHlwZW9mIHZhbC50aGVuID09PSAnZnVuY3Rpb24nKSByZXR1cm4gdmFsLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KSB9IGNhdGNoIChlKSB7fVxuICAgIHAuc3RhdHVzID0gdHJ1ZVxuICAgIHAudmFsdWUgPSB2YWxcbiAgICBmbHVzaCh3YWl0aW5nLCBwKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVqZWN0ICh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHAuc3RhdHVzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuXG4gICAgaWYgKHZhbCA9PT0gcCkgdGhyb3cgZXJyXG4gICAgcC5zdGF0dXMgPSBmYWxzZVxuICAgIHAudmFsdWUgPSB2YWxcbiAgICBmbHVzaCh3YWl0aW5nLCBwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGZsdXNoICh3YWl0aW5nLCBwKSB7XG4gIHZhciBxdWV1ZSA9IHAuc3RhdHVzID8gd2FpdGluZy5yZXMgOiB3YWl0aW5nLnJlalxuICB3aGlsZSAocXVldWUubGVuZ3RoKSBxdWV1ZS5zaGlmdCgpKHAudmFsdWUpXG59XG5cbmZ1bmN0aW9uIGhhbmRsZU5leHQgKHAsIHdhaXRpbmcsIGhhbmRsZXIsIHJlc29sdmUsIHJlamVjdCwgaGFzUmVqZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbiBuZXh0ICh2YWx1ZSkge1xuICAgIHRyeSB7XG4gICAgICB2YWx1ZSA9IGhhbmRsZXIgPyBoYW5kbGVyKHZhbHVlKSA6IHZhbHVlXG4gICAgICBpZiAocC5zdGF0dXMpIHJldHVybiByZXNvbHZlKHZhbHVlKVxuICAgICAgcmV0dXJuIGhhc1JlamVjdCA/IHJlc29sdmUodmFsdWUpIDogcmVqZWN0KHZhbHVlKVxuICAgIH0gY2F0Y2ggKGVycikgeyByZWplY3QoZXJyKSB9XG4gIH1cbn1cbiIsIi8qIVxuICogR2xpZGUuanMgdjMuNS4yXG4gKiAoYykgMjAxMy0yMDIxIErEmWRyemVqIENoYcWCdWJlayAoaHR0cHM6Ly9naXRodWIuY29tL2plZHJ6ZWpjaGFsdWJlay8pXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiO1xuXG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikge1xuICAgIF90eXBlb2YgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIF90eXBlb2YgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIF90eXBlb2Yob2JqKTtcbn1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gIGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgcmV0dXJuIENvbnN0cnVjdG9yO1xufVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpO1xufVxuXG5mdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2Yobykge1xuICBfZ2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgOiBmdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2Yobykge1xuICAgIHJldHVybiBvLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7XG4gIH07XG4gIHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7XG59XG5cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7XG4gIF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICAgIG8uX19wcm90b19fID0gcDtcbiAgICByZXR1cm4gbztcbiAgfTtcblxuICByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApO1xufVxuXG5mdW5jdGlvbiBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCkge1xuICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwidW5kZWZpbmVkXCIgfHwgIVJlZmxlY3QuY29uc3RydWN0KSByZXR1cm4gZmFsc2U7XG4gIGlmIChSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgUHJveHkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHRydWU7XG5cbiAgdHJ5IHtcbiAgICBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbiwgW10sIGZ1bmN0aW9uICgpIHt9KSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7XG4gIGlmIChzZWxmID09PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gc2VsZjtcbn1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkge1xuICBpZiAoY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICByZXR1cm4gY2FsbDtcbiAgfSBlbHNlIGlmIChjYWxsICE9PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRGVyaXZlZCBjb25zdHJ1Y3RvcnMgbWF5IG9ubHkgcmV0dXJuIG9iamVjdCBvciB1bmRlZmluZWRcIik7XG4gIH1cblxuICByZXR1cm4gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKTtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVN1cGVyKERlcml2ZWQpIHtcbiAgdmFyIGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QgPSBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIF9jcmVhdGVTdXBlckludGVybmFsKCkge1xuICAgIHZhciBTdXBlciA9IF9nZXRQcm90b3R5cGVPZihEZXJpdmVkKSxcbiAgICAgICAgcmVzdWx0O1xuXG4gICAgaWYgKGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QpIHtcbiAgICAgIHZhciBOZXdUYXJnZXQgPSBfZ2V0UHJvdG90eXBlT2YodGhpcykuY29uc3RydWN0b3I7XG5cbiAgICAgIHJlc3VsdCA9IFJlZmxlY3QuY29uc3RydWN0KFN1cGVyLCBhcmd1bWVudHMsIE5ld1RhcmdldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IFN1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIHJlc3VsdCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIF9zdXBlclByb3BCYXNlKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgd2hpbGUgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkpIHtcbiAgICBvYmplY3QgPSBfZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcbiAgICBpZiAob2JqZWN0ID09PSBudWxsKSBicmVhaztcbiAgfVxuXG4gIHJldHVybiBvYmplY3Q7XG59XG5cbmZ1bmN0aW9uIF9nZXQoKSB7XG4gIGlmICh0eXBlb2YgUmVmbGVjdCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBSZWZsZWN0LmdldCkge1xuICAgIF9nZXQgPSBSZWZsZWN0LmdldDtcbiAgfSBlbHNlIHtcbiAgICBfZ2V0ID0gZnVuY3Rpb24gX2dldCh0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICAgICAgdmFyIGJhc2UgPSBfc3VwZXJQcm9wQmFzZSh0YXJnZXQsIHByb3BlcnR5KTtcblxuICAgICAgaWYgKCFiYXNlKSByZXR1cm47XG4gICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoYmFzZSwgcHJvcGVydHkpO1xuXG4gICAgICBpZiAoZGVzYy5nZXQpIHtcbiAgICAgICAgcmV0dXJuIGRlc2MuZ2V0LmNhbGwoYXJndW1lbnRzLmxlbmd0aCA8IDMgPyB0YXJnZXQgOiByZWNlaXZlcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gX2dldC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG52YXIgZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBUeXBlIG9mIHRoZSBtb3ZlbWVudC5cbiAgICpcbiAgICogQXZhaWxhYmxlIHR5cGVzOlxuICAgKiBgc2xpZGVyYCAtIFJld2luZHMgc2xpZGVyIHRvIHRoZSBzdGFydC9lbmQgd2hlbiBpdCByZWFjaGVzIHRoZSBmaXJzdCBvciBsYXN0IHNsaWRlLlxuICAgKiBgY2Fyb3VzZWxgIC0gQ2hhbmdlcyBzbGlkZXMgd2l0aG91dCBzdGFydGluZyBvdmVyIHdoZW4gaXQgcmVhY2hlcyB0aGUgZmlyc3Qgb3IgbGFzdCBzbGlkZS5cbiAgICpcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIHR5cGU6ICdzbGlkZXInLFxuXG4gIC8qKlxuICAgKiBTdGFydCBhdCBzcGVjaWZpYyBzbGlkZSBudW1iZXIgZGVmaW5lZCB3aXRoIHplcm8tYmFzZWQgaW5kZXguXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICBzdGFydEF0OiAwLFxuXG4gIC8qKlxuICAgKiBBIG51bWJlciBvZiBzbGlkZXMgdmlzaWJsZSBvbiB0aGUgc2luZ2xlIHZpZXdwb3J0LlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgcGVyVmlldzogMSxcblxuICAvKipcbiAgICogRm9jdXMgY3VycmVudGx5IGFjdGl2ZSBzbGlkZSBhdCBhIHNwZWNpZmllZCBwb3NpdGlvbiBpbiB0aGUgdHJhY2suXG4gICAqXG4gICAqIEF2YWlsYWJsZSBpbnB1dHM6XG4gICAqIGBjZW50ZXJgIC0gQ3VycmVudCBzbGlkZSB3aWxsIGJlIGFsd2F5cyBmb2N1c2VkIGF0IHRoZSBjZW50ZXIgb2YgYSB0cmFjay5cbiAgICogYDAsMSwyLDMuLi5gIC0gQ3VycmVudCBzbGlkZSB3aWxsIGJlIGZvY3VzZWQgb24gdGhlIHNwZWNpZmllZCB6ZXJvLWJhc2VkIGluZGV4LlxuICAgKlxuICAgKiBAdHlwZSB7U3RyaW5nfE51bWJlcn1cbiAgICovXG4gIGZvY3VzQXQ6IDAsXG5cbiAgLyoqXG4gICAqIEEgc2l6ZSBvZiB0aGUgZ2FwIGFkZGVkIGJldHdlZW4gc2xpZGVzLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgZ2FwOiAxMCxcblxuICAvKipcbiAgICogQ2hhbmdlIHNsaWRlcyBhZnRlciBhIHNwZWNpZmllZCBpbnRlcnZhbC4gVXNlIGBmYWxzZWAgZm9yIHR1cm5pbmcgb2ZmIGF1dG9wbGF5LlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfEJvb2xlYW59XG4gICAqL1xuICBhdXRvcGxheTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIFN0b3AgYXV0b3BsYXkgb24gbW91c2VvdmVyIGV2ZW50LlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG4gIGhvdmVycGF1c2U6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFsbG93IGZvciBjaGFuZ2luZyBzbGlkZXMgd2l0aCBsZWZ0IGFuZCByaWdodCBrZXlib2FyZCBhcnJvd3MuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cbiAga2V5Ym9hcmQ6IHRydWUsXG5cbiAgLyoqXG4gICAqIFN0b3AgcnVubmluZyBgcGVyVmlld2AgbnVtYmVyIG9mIHNsaWRlcyBmcm9tIHRoZSBlbmQuIFVzZSB0aGlzXG4gICAqIG9wdGlvbiBpZiB5b3UgZG9uJ3Qgd2FudCB0byBoYXZlIGFuIGVtcHR5IHNwYWNlIGFmdGVyXG4gICAqIGEgc2xpZGVyLiBXb3JrcyBvbmx5IHdpdGggYHNsaWRlcmAgdHlwZSBhbmQgYVxuICAgKiBub24tY2VudGVyZWQgYGZvY3VzQXRgIHNldHRpbmcuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cbiAgYm91bmQ6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBNaW5pbWFsIHN3aXBlIGRpc3RhbmNlIG5lZWRlZCB0byBjaGFuZ2UgdGhlIHNsaWRlLiBVc2UgYGZhbHNlYCBmb3IgdHVybmluZyBvZmYgYSBzd2lwaW5nLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfEJvb2xlYW59XG4gICAqL1xuICBzd2lwZVRocmVzaG9sZDogODAsXG5cbiAgLyoqXG4gICAqIE1pbmltYWwgbW91c2UgZHJhZyBkaXN0YW5jZSBuZWVkZWQgdG8gY2hhbmdlIHRoZSBzbGlkZS4gVXNlIGBmYWxzZWAgZm9yIHR1cm5pbmcgb2ZmIGEgZHJhZ2dpbmcuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ8Qm9vbGVhbn1cbiAgICovXG4gIGRyYWdUaHJlc2hvbGQ6IDEyMCxcblxuICAvKipcbiAgICogQSBudW1iZXIgb2Ygc2xpZGVzIG1vdmVkIG9uIHNpbmdsZSBzd2lwZS5cbiAgICpcbiAgICogQXZhaWxhYmxlIHR5cGVzOlxuICAgKiBgYCAtIE1vdmVzIHNsaWRlciBieSBvbmUgc2xpZGUgcGVyIHN3aXBlXG4gICAqIGB8YCAtIE1vdmVzIHNsaWRlciBiZXR3ZWVuIHZpZXdzIHBlciBzd2lwZSAobnVtYmVyIG9mIHNsaWRlcyBkZWZpbmVkIGluIGBwZXJWaWV3YCBvcHRpb25zKVxuICAgKlxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKi9cbiAgcGVyU3dpcGU6ICcnLFxuXG4gIC8qKlxuICAgKiBNb3ZpbmcgZGlzdGFuY2UgcmF0aW8gb2YgdGhlIHNsaWRlcyBvbiBhIHN3aXBpbmcgYW5kIGRyYWdnaW5nLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgdG91Y2hSYXRpbzogMC41LFxuXG4gIC8qKlxuICAgKiBBbmdsZSByZXF1aXJlZCB0byBhY3RpdmF0ZSBzbGlkZXMgbW92aW5nIG9uIHN3aXBpbmcgb3IgZHJhZ2dpbmcuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICB0b3VjaEFuZ2xlOiA0NSxcblxuICAvKipcbiAgICogRHVyYXRpb24gb2YgdGhlIGFuaW1hdGlvbiBpbiBtaWxsaXNlY29uZHMuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICBhbmltYXRpb25EdXJhdGlvbjogNDAwLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgbG9vcGluZyB0aGUgYHNsaWRlcmAgdHlwZS4gU2xpZGVyIHdpbGwgcmV3aW5kIHRvIHRoZSBmaXJzdC9sYXN0IHNsaWRlIHdoZW4gaXQncyBhdCB0aGUgc3RhcnQvZW5kLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG4gIHJld2luZDogdHJ1ZSxcblxuICAvKipcbiAgICogRHVyYXRpb24gb2YgdGhlIHJld2luZGluZyBhbmltYXRpb24gb2YgdGhlIGBzbGlkZXJgIHR5cGUgaW4gbWlsbGlzZWNvbmRzLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgcmV3aW5kRHVyYXRpb246IDgwMCxcblxuICAvKipcbiAgICogRWFzaW5nIGZ1bmN0aW9uIGZvciB0aGUgYW5pbWF0aW9uLlxuICAgKlxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKi9cbiAgYW5pbWF0aW9uVGltaW5nRnVuYzogJ2N1YmljLWJlemllciguMTY1LCAuODQwLCAuNDQwLCAxKScsXG5cbiAgLyoqXG4gICAqIFdhaXQgZm9yIHRoZSBhbmltYXRpb24gdG8gZmluaXNoIHVudGlsIHRoZSBuZXh0IHVzZXIgaW5wdXQgY2FuIGJlIHByb2Nlc3NlZFxuICAgKlxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICovXG4gIHdhaXRGb3JUcmFuc2l0aW9uOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBUaHJvdHRsZSBjb3N0bHkgZXZlbnRzIGF0IG1vc3Qgb25jZSBwZXIgZXZlcnkgd2FpdCBtaWxsaXNlY29uZHMuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICB0aHJvdHRsZTogMTAsXG5cbiAgLyoqXG4gICAqIE1vdmluZyBkaXJlY3Rpb24gbW9kZS5cbiAgICpcbiAgICogQXZhaWxhYmxlIGlucHV0czpcbiAgICogLSAnbHRyJyAtIGxlZnQgdG8gcmlnaHQgbW92ZW1lbnQsXG4gICAqIC0gJ3J0bCcgLSByaWdodCB0byBsZWZ0IG1vdmVtZW50LlxuICAgKlxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKi9cbiAgZGlyZWN0aW9uOiAnbHRyJyxcblxuICAvKipcbiAgICogVGhlIGRpc3RhbmNlIHZhbHVlIG9mIHRoZSBuZXh0IGFuZCBwcmV2aW91cyB2aWV3cG9ydHMgd2hpY2hcbiAgICogaGF2ZSB0byBwZWVrIGluIHRoZSBjdXJyZW50IHZpZXcuIEFjY2VwdHMgbnVtYmVyIGFuZFxuICAgKiBwaXhlbHMgYXMgYSBzdHJpbmcuIExlZnQgYW5kIHJpZ2h0IHBlZWtpbmcgY2FuIGJlXG4gICAqIHNldCB1cCBzZXBhcmF0ZWx5IHdpdGggYSBkaXJlY3Rpb25zIG9iamVjdC5cbiAgICpcbiAgICogRm9yIGV4YW1wbGU6XG4gICAqIGAxMDBgIC0gUGVlayAxMDBweCBvbiB0aGUgYm90aCBzaWRlcy5cbiAgICogeyBiZWZvcmU6IDEwMCwgYWZ0ZXI6IDUwIH1gIC0gUGVlayAxMDBweCBvbiB0aGUgbGVmdCBzaWRlIGFuZCA1MHB4IG9uIHRoZSByaWdodCBzaWRlLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfFN0cmluZ3xPYmplY3R9XG4gICAqL1xuICBwZWVrOiAwLFxuXG4gIC8qKlxuICAgKiBEZWZpbmVzIGhvdyBtYW55IGNsb25lcyBvZiBjdXJyZW50IHZpZXdwb3J0IHdpbGwgYmUgZ2VuZXJhdGVkLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgY2xvbmluZ1JhdGlvOiAxLFxuXG4gIC8qKlxuICAgKiBDb2xsZWN0aW9uIG9mIG9wdGlvbnMgYXBwbGllZCBhdCBzcGVjaWZpZWQgbWVkaWEgYnJlYWtwb2ludHMuXG4gICAqIEZvciBleGFtcGxlOiBkaXNwbGF5IHR3byBzbGlkZXMgcGVyIHZpZXcgdW5kZXIgODAwcHguXG4gICAqIGB7XG4gICAqICAgJzgwMHB4Jzoge1xuICAgKiAgICAgcGVyVmlldzogMlxuICAgKiAgIH1cbiAgICogfWBcbiAgICovXG4gIGJyZWFrcG9pbnRzOiB7fSxcblxuICAvKipcbiAgICogQ29sbGVjdGlvbiBvZiBpbnRlcm5hbGx5IHVzZWQgSFRNTCBjbGFzc2VzLlxuICAgKlxuICAgKiBAdG9kbyBSZWZhY3RvciBgc2xpZGVyYCBhbmQgYGNhcm91c2VsYCBwcm9wZXJ0aWVzIHRvIHNpbmdsZSBgdHlwZTogeyBzbGlkZXI6ICcnLCBjYXJvdXNlbDogJycgfWAgb2JqZWN0XG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuICBjbGFzc2VzOiB7XG4gICAgc3dpcGVhYmxlOiAnZ2xpZGUtLXN3aXBlYWJsZScsXG4gICAgZHJhZ2dpbmc6ICdnbGlkZS0tZHJhZ2dpbmcnLFxuICAgIGRpcmVjdGlvbjoge1xuICAgICAgbHRyOiAnZ2xpZGUtLWx0cicsXG4gICAgICBydGw6ICdnbGlkZS0tcnRsJ1xuICAgIH0sXG4gICAgdHlwZToge1xuICAgICAgc2xpZGVyOiAnZ2xpZGUtLXNsaWRlcicsXG4gICAgICBjYXJvdXNlbDogJ2dsaWRlLS1jYXJvdXNlbCdcbiAgICB9LFxuICAgIHNsaWRlOiB7XG4gICAgICBjbG9uZTogJ2dsaWRlX19zbGlkZS0tY2xvbmUnLFxuICAgICAgYWN0aXZlOiAnZ2xpZGVfX3NsaWRlLS1hY3RpdmUnXG4gICAgfSxcbiAgICBhcnJvdzoge1xuICAgICAgZGlzYWJsZWQ6ICdnbGlkZV9fYXJyb3ctLWRpc2FibGVkJ1xuICAgIH0sXG4gICAgbmF2OiB7XG4gICAgICBhY3RpdmU6ICdnbGlkZV9fYnVsbGV0LS1hY3RpdmUnXG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIE91dHB1dHMgd2FybmluZyBtZXNzYWdlIHRvIHRoZSBib3dzZXIgY29uc29sZS5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG1zZ1xuICogQHJldHVybiB7Vm9pZH1cbiAqL1xuZnVuY3Rpb24gd2Fybihtc2cpIHtcbiAgY29uc29sZS5lcnJvcihcIltHbGlkZSB3YXJuXTogXCIuY29uY2F0KG1zZykpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIHZhbHVlIGVudGVyZWQgYXMgbnVtYmVyXG4gKiBvciBzdHJpbmcgdG8gaW50ZWdlciB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIHRvSW50KHZhbHVlKSB7XG4gIHJldHVybiBwYXJzZUludCh2YWx1ZSk7XG59XG4vKipcbiAqIENvbnZlcnRzIHZhbHVlIGVudGVyZWQgYXMgbnVtYmVyXG4gKiBvciBzdHJpbmcgdG8gZmxhdCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gKi9cblxuZnVuY3Rpb24gdG9GbG9hdCh2YWx1ZSkge1xuICByZXR1cm4gcGFyc2VGbG9hdCh2YWx1ZSk7XG59XG4vKipcbiAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtICB7Kn0gICB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbn1cbi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtICB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vamFzaGtlbmFzL3VuZGVyc2NvcmVcbiAqL1xuXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IF90eXBlb2YodmFsdWUpO1xuXG4gIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhdmFsdWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tbWl4ZWQtb3BlcmF0b3JzXG59XG4vKipcbiAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gIHsqfSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG4vKipcbiAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgdW5kZWZpbmVkLlxuICpcbiAqIEBwYXJhbSAgeyp9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnO1xufVxuLyoqXG4gKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGFuIGFycmF5LlxuICpcbiAqIEBwYXJhbSAgeyp9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlLmNvbnN0cnVjdG9yID09PSBBcnJheTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuZCBpbml0aWFsaXplcyBzcGVjaWZpZWQgY29sbGVjdGlvbiBvZiBleHRlbnNpb25zLlxuICogRWFjaCBleHRlbnNpb24gcmVjZWl2ZXMgYWNjZXNzIHRvIGluc3RhbmNlIG9mIGdsaWRlIGFuZCByZXN0IG9mIGNvbXBvbmVudHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGdsaWRlXG4gKiBAcGFyYW0ge09iamVjdH0gZXh0ZW5zaW9uc1xuICpcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gbW91bnQoZ2xpZGUsIGV4dGVuc2lvbnMsIGV2ZW50cykge1xuICB2YXIgY29tcG9uZW50cyA9IHt9O1xuXG4gIGZvciAodmFyIG5hbWUgaW4gZXh0ZW5zaW9ucykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGV4dGVuc2lvbnNbbmFtZV0pKSB7XG4gICAgICBjb21wb25lbnRzW25hbWVdID0gZXh0ZW5zaW9uc1tuYW1lXShnbGlkZSwgY29tcG9uZW50cywgZXZlbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2FybignRXh0ZW5zaW9uIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIF9uYW1lIGluIGNvbXBvbmVudHMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjb21wb25lbnRzW19uYW1lXS5tb3VudCkpIHtcbiAgICAgIGNvbXBvbmVudHNbX25hbWVdLm1vdW50KCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGNvbXBvbmVudHM7XG59XG5cbi8qKlxuICogRGVmaW5lcyBnZXR0ZXIgYW5kIHNldHRlciBwcm9wZXJ0eSBvbiB0aGUgc3BlY2lmaWVkIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9iaiAgICAgICAgIE9iamVjdCB3aGVyZSBwcm9wZXJ0eSBoYXMgdG8gYmUgZGVmaW5lZC5cbiAqIEBwYXJhbSAge1N0cmluZ30gcHJvcCAgICAgICAgTmFtZSBvZiB0aGUgZGVmaW5lZCBwcm9wZXJ0eS5cbiAqIEBwYXJhbSAge09iamVjdH0gZGVmaW5pdGlvbiAgR2V0IGFuZCBzZXQgZGVmaW5pdGlvbnMgZm9yIHRoZSBwcm9wZXJ0eS5cbiAqIEByZXR1cm4ge1ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGRlZmluZShvYmosIHByb3AsIGRlZmluaXRpb24pIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgcHJvcCwgZGVmaW5pdGlvbik7XG59XG4vKipcbiAqIFNvcnRzIGFwaGFiZXRpY2FsbHkgb2JqZWN0IGtleXMuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBzb3J0S2V5cyhvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikuc29ydCgpLnJlZHVjZShmdW5jdGlvbiAociwgaykge1xuICAgIHJba10gPSBvYmpba107XG4gICAgcmV0dXJuIHJba10sIHI7XG4gIH0sIHt9KTtcbn1cbi8qKlxuICogTWVyZ2VzIHBhc3NlZCBzZXR0aW5ncyBvYmplY3Qgd2l0aCBkZWZhdWx0IG9wdGlvbnMuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBkZWZhdWx0c1xuICogQHBhcmFtICB7T2JqZWN0fSBzZXR0aW5nc1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIG1lcmdlT3B0aW9ucyhkZWZhdWx0cywgc2V0dGluZ3MpIHtcbiAgdmFyIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgc2V0dGluZ3MpOyAvLyBgT2JqZWN0LmFzc2lnbmAgZG8gbm90IGRlZXBseSBtZXJnZSBvYmplY3RzLCBzbyB3ZVxuICAvLyBoYXZlIHRvIGRvIGl0IG1hbnVhbGx5IGZvciBldmVyeSBuZXN0ZWQgb2JqZWN0XG4gIC8vIGluIG9wdGlvbnMuIEFsdGhvdWdoIGl0IGRvZXMgbm90IGxvb2sgc21hcnQsXG4gIC8vIGl0J3Mgc21hbGxlciBhbmQgZmFzdGVyIHRoYW4gc29tZSBmYW5jeVxuICAvLyBtZXJnaW5nIGRlZXAtbWVyZ2UgYWxnb3JpdGhtIHNjcmlwdC5cblxuICBpZiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ2NsYXNzZXMnKSkge1xuICAgIG9wdGlvbnMuY2xhc3NlcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLmNsYXNzZXMsIHNldHRpbmdzLmNsYXNzZXMpO1xuXG4gICAgaWYgKHNldHRpbmdzLmNsYXNzZXMuaGFzT3duUHJvcGVydHkoJ2RpcmVjdGlvbicpKSB7XG4gICAgICBvcHRpb25zLmNsYXNzZXMuZGlyZWN0aW9uID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMuY2xhc3Nlcy5kaXJlY3Rpb24sIHNldHRpbmdzLmNsYXNzZXMuZGlyZWN0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAoc2V0dGluZ3MuY2xhc3Nlcy5oYXNPd25Qcm9wZXJ0eSgndHlwZScpKSB7XG4gICAgICBvcHRpb25zLmNsYXNzZXMudHlwZSA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLmNsYXNzZXMudHlwZSwgc2V0dGluZ3MuY2xhc3Nlcy50eXBlKTtcbiAgICB9XG5cbiAgICBpZiAoc2V0dGluZ3MuY2xhc3Nlcy5oYXNPd25Qcm9wZXJ0eSgnc2xpZGUnKSkge1xuICAgICAgb3B0aW9ucy5jbGFzc2VzLnNsaWRlID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMuY2xhc3Nlcy5zbGlkZSwgc2V0dGluZ3MuY2xhc3Nlcy5zbGlkZSk7XG4gICAgfVxuXG4gICAgaWYgKHNldHRpbmdzLmNsYXNzZXMuaGFzT3duUHJvcGVydHkoJ2Fycm93JykpIHtcbiAgICAgIG9wdGlvbnMuY2xhc3Nlcy5hcnJvdyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLmNsYXNzZXMuYXJyb3csIHNldHRpbmdzLmNsYXNzZXMuYXJyb3cpO1xuICAgIH1cblxuICAgIGlmIChzZXR0aW5ncy5jbGFzc2VzLmhhc093blByb3BlcnR5KCduYXYnKSkge1xuICAgICAgb3B0aW9ucy5jbGFzc2VzLm5hdiA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLmNsYXNzZXMubmF2LCBzZXR0aW5ncy5jbGFzc2VzLm5hdik7XG4gICAgfVxuICB9XG5cbiAgaWYgKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdicmVha3BvaW50cycpKSB7XG4gICAgb3B0aW9ucy5icmVha3BvaW50cyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLmJyZWFrcG9pbnRzLCBzZXR0aW5ncy5icmVha3BvaW50cyk7XG4gIH1cblxuICByZXR1cm4gb3B0aW9ucztcbn1cblxudmFyIEV2ZW50c0J1cyA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBFdmVudEJ1cyBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50c1xuICAgKi9cbiAgZnVuY3Rpb24gRXZlbnRzQnVzKCkge1xuICAgIHZhciBldmVudHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEV2ZW50c0J1cyk7XG5cbiAgICB0aGlzLmV2ZW50cyA9IGV2ZW50cztcbiAgICB0aGlzLmhvcCA9IGV2ZW50cy5oYXNPd25Qcm9wZXJ0eTtcbiAgfVxuICAvKipcbiAgICogQWRkcyBsaXN0ZW5lciB0byB0aGUgc3BlY2lmZWQgZXZlbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBldmVudFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKEV2ZW50c0J1cywgW3tcbiAgICBrZXk6IFwib25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgIGlmIChpc0FycmF5KGV2ZW50KSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5vbihldmVudFtpXSwgaGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIENyZWF0ZSB0aGUgZXZlbnQncyBvYmplY3QgaWYgbm90IHlldCBjcmVhdGVkXG5cblxuICAgICAgaWYgKCF0aGlzLmhvcC5jYWxsKHRoaXMuZXZlbnRzLCBldmVudCkpIHtcbiAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdID0gW107XG4gICAgICB9IC8vIEFkZCB0aGUgaGFuZGxlciB0byBxdWV1ZVxuXG5cbiAgICAgIHZhciBpbmRleCA9IHRoaXMuZXZlbnRzW2V2ZW50XS5wdXNoKGhhbmRsZXIpIC0gMTsgLy8gUHJvdmlkZSBoYW5kbGUgYmFjayBmb3IgcmVtb3ZhbCBvZiBldmVudFxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5ldmVudHNbZXZlbnRdW2luZGV4XTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUnVucyByZWdpc3RlcmVkIGhhbmRsZXJzIGZvciBzcGVjaWZpZWQgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gZXZlbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdD19IGNvbnRleHRcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImVtaXRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZW1pdChldmVudCwgY29udGV4dCkge1xuICAgICAgaWYgKGlzQXJyYXkoZXZlbnQpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLmVtaXQoZXZlbnRbaV0sIGNvbnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBJZiB0aGUgZXZlbnQgZG9lc24ndCBleGlzdCwgb3IgdGhlcmUncyBubyBoYW5kbGVycyBpbiBxdWV1ZSwganVzdCBsZWF2ZVxuXG5cbiAgICAgIGlmICghdGhpcy5ob3AuY2FsbCh0aGlzLmV2ZW50cywgZXZlbnQpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gQ3ljbGUgdGhyb3VnaCBldmVudHMgcXVldWUsIGZpcmUhXG5cblxuICAgICAgdGhpcy5ldmVudHNbZXZlbnRdLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgaXRlbShjb250ZXh0IHx8IHt9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBFdmVudHNCdXM7XG59KCk7XG5cbnZhciBHbGlkZSQxID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0IGdsaWRlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7U3RyaW5nfSBzZWxlY3RvclxyXG4gICAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xyXG4gICAqL1xuICBmdW5jdGlvbiBHbGlkZShzZWxlY3Rvcikge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7fTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBHbGlkZSk7XG5cbiAgICB0aGlzLl9jID0ge307XG4gICAgdGhpcy5fdCA9IFtdO1xuICAgIHRoaXMuX2UgPSBuZXcgRXZlbnRzQnVzKCk7XG4gICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICB0aGlzLnNldHRpbmdzID0gbWVyZ2VPcHRpb25zKGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICB0aGlzLmluZGV4ID0gdGhpcy5zZXR0aW5ncy5zdGFydEF0O1xuICB9XG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIGdsaWRlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IGV4dGVuc2lvbnMgQ29sbGVjdGlvbiBvZiBleHRlbnNpb25zIHRvIGluaXRpYWxpemUuXHJcbiAgICogQHJldHVybiB7R2xpZGV9XHJcbiAgICovXG5cblxuICBfY3JlYXRlQ2xhc3MoR2xpZGUsIFt7XG4gICAga2V5OiBcIm1vdW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdW50JDEoKSB7XG4gICAgICB2YXIgZXh0ZW5zaW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG5cbiAgICAgIHRoaXMuX2UuZW1pdCgnbW91bnQuYmVmb3JlJyk7XG5cbiAgICAgIGlmIChpc09iamVjdChleHRlbnNpb25zKSkge1xuICAgICAgICB0aGlzLl9jID0gbW91bnQodGhpcywgZXh0ZW5zaW9ucywgdGhpcy5fZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuKCdZb3UgbmVlZCB0byBwcm92aWRlIGEgb2JqZWN0IG9uIGBtb3VudCgpYCcpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9lLmVtaXQoJ21vdW50LmFmdGVyJyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIENvbGxlY3RzIGFuIGluc3RhbmNlIGB0cmFuc2xhdGVgIHRyYW5zZm9ybWVycy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtBcnJheX0gdHJhbnNmb3JtZXJzIENvbGxlY3Rpb24gb2YgdHJhbnNmb3JtZXJzLlxyXG4gICAgICogQHJldHVybiB7Vm9pZH1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwibXV0YXRlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG11dGF0ZSgpIHtcbiAgICAgIHZhciB0cmFuc2Zvcm1lcnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IFtdO1xuXG4gICAgICBpZiAoaXNBcnJheSh0cmFuc2Zvcm1lcnMpKSB7XG4gICAgICAgIHRoaXMuX3QgPSB0cmFuc2Zvcm1lcnM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuKCdZb3UgbmVlZCB0byBwcm92aWRlIGEgYXJyYXkgb24gYG11dGF0ZSgpYCcpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBVcGRhdGVzIGdsaWRlIHdpdGggc3BlY2lmaWVkIHNldHRpbmdzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzZXR0aW5nc1xyXG4gICAgICogQHJldHVybiB7R2xpZGV9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInVwZGF0ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICB2YXIgc2V0dGluZ3MgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgICAgdGhpcy5zZXR0aW5ncyA9IG1lcmdlT3B0aW9ucyh0aGlzLnNldHRpbmdzLCBzZXR0aW5ncyk7XG5cbiAgICAgIGlmIChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnc3RhcnRBdCcpKSB7XG4gICAgICAgIHRoaXMuaW5kZXggPSBzZXR0aW5ncy5zdGFydEF0O1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9lLmVtaXQoJ3VwZGF0ZScpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBDaGFuZ2Ugc2xpZGUgd2l0aCBzcGVjaWZpZWQgcGF0dGVybi4gQSBwYXR0ZXJuIG11c3QgYmUgaW4gdGhlIHNwZWNpYWwgZm9ybWF0OlxyXG4gICAgICogYD5gIC0gTW92ZSBvbmUgZm9yd2FyZFxyXG4gICAgICogYDxgIC0gTW92ZSBvbmUgYmFja3dhcmRcclxuICAgICAqIGA9e2l9YCAtIEdvIHRvIHtpfSB6ZXJvLWJhc2VkIHNsaWRlIChlcS4gJz0xJywgd2lsbCBnbyB0byBzZWNvbmQgc2xpZGUpXHJcbiAgICAgKiBgPj5gIC0gUmV3aW5kcyB0byBlbmQgKGxhc3Qgc2xpZGUpXHJcbiAgICAgKiBgPDxgIC0gUmV3aW5kcyB0byBzdGFydCAoZmlyc3Qgc2xpZGUpXHJcbiAgICAgKiBgfD5gIC0gTW92ZSBvbmUgdmlld3BvcnQgZm9yd2FyZFxyXG4gICAgICogYHw8YCAtIE1vdmUgb25lIHZpZXdwb3J0IGJhY2t3YXJkXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdHRlcm5cclxuICAgICAqIEByZXR1cm4ge0dsaWRlfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJnb1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnbyhwYXR0ZXJuKSB7XG4gICAgICB0aGlzLl9jLlJ1bi5tYWtlKHBhdHRlcm4pO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBNb3ZlIHRyYWNrIGJ5IHNwZWNpZmllZCBkaXN0YW5jZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlzdGFuY2VcclxuICAgICAqIEByZXR1cm4ge0dsaWRlfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJtb3ZlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmUoZGlzdGFuY2UpIHtcbiAgICAgIHRoaXMuX2MuVHJhbnNpdGlvbi5kaXNhYmxlKCk7XG5cbiAgICAgIHRoaXMuX2MuTW92ZS5tYWtlKGRpc3RhbmNlKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogRGVzdHJveSBpbnN0YW5jZSBhbmQgcmV2ZXJ0IGFsbCBjaGFuZ2VzIGRvbmUgYnkgdGhpcy5fYy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtHbGlkZX1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVzdHJveVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgdGhpcy5fZS5lbWl0KCdkZXN0cm95Jyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFN0YXJ0IGluc3RhbmNlIGF1dG9wbGF5aW5nLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbnxOdW1iZXJ9IGludGVydmFsIFJ1biBhdXRvcGxheWluZyB3aXRoIHBhc3NlZCBpbnRlcnZhbCByZWdhcmRsZXNzIG9mIGBhdXRvcGxheWAgc2V0dGluZ3NcclxuICAgICAqIEByZXR1cm4ge0dsaWRlfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJwbGF5XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHBsYXkoKSB7XG4gICAgICB2YXIgaW50ZXJ2YWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IGZhbHNlO1xuXG4gICAgICBpZiAoaW50ZXJ2YWwpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5hdXRvcGxheSA9IGludGVydmFsO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9lLmVtaXQoJ3BsYXknKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU3RvcCBpbnN0YW5jZSBhdXRvcGxheWluZy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtHbGlkZX1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwicGF1c2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGF1c2UoKSB7XG4gICAgICB0aGlzLl9lLmVtaXQoJ3BhdXNlJyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFNldHMgZ2xpZGUgaW50byBhIGlkbGUgc3RhdHVzLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge0dsaWRlfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkaXNhYmxlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gICAgICB0aGlzLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFNldHMgZ2xpZGUgaW50byBhIGFjdGl2ZSBzdGF0dXMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7R2xpZGV9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImVuYWJsZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBlbmFibGUoKSB7XG4gICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGN1dXRvbSBldmVudCBsaXN0ZW5lciB3aXRoIGhhbmRsZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7U3RyaW5nfEFycmF5fSBldmVudFxyXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGhhbmRsZXJcclxuICAgICAqIEByZXR1cm4ge0dsaWRlfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJvblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvbihldmVudCwgaGFuZGxlcikge1xuICAgICAgdGhpcy5fZS5vbihldmVudCwgaGFuZGxlcik7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiBnbGlkZSBpcyBhIHByZWNpc2VkIHR5cGUuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJpc1R5cGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaXNUeXBlKG5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldHRpbmdzLnR5cGUgPT09IG5hbWU7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogR2V0cyB2YWx1ZSBvZiB0aGUgY29yZSBvcHRpb25zLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge09iamVjdH1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwic2V0dGluZ3NcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFNldHMgdmFsdWUgb2YgdGhlIGNvcmUgb3B0aW9ucy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IG9cclxuICAgICAqIEByZXR1cm4ge1ZvaWR9XHJcbiAgICAgKi9cbiAgICAsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQobykge1xuICAgICAgaWYgKGlzT2JqZWN0KG8pKSB7XG4gICAgICAgIHRoaXMuX28gPSBvO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2FybignT3B0aW9ucyBtdXN0IGJlIGFuIGBvYmplY3RgIGluc3RhbmNlLicpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcclxuICAgICAqIEdldHMgY3VycmVudCBpbmRleCBvZiB0aGUgc2xpZGVyLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge09iamVjdH1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiaW5kZXhcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9pO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFNldHMgY3VycmVudCBpbmRleCBhIHNsaWRlci5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XHJcbiAgICAgKi9cbiAgICAsXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQoaSkge1xuICAgICAgdGhpcy5faSA9IHRvSW50KGkpO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEdldHMgdHlwZSBuYW1lIG9mIHRoZSBzbGlkZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U3RyaW5nfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJ0eXBlXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXR0aW5ncy50eXBlO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEdldHMgdmFsdWUgb2YgdGhlIGlkbGUgc3RhdHVzLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRpc2FibGVkXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZDtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHZhbHVlIG9mIHRoZSBpZGxlIHN0YXR1cy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXG4gICAgLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KHN0YXR1cykge1xuICAgICAgdGhpcy5fZCA9ICEhc3RhdHVzO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBHbGlkZTtcbn0oKTtcblxuZnVuY3Rpb24gUnVuIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIHZhciBSdW4gPSB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgYXV0b3J1bm5pbmcgb2YgdGhlIGdsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICB0aGlzLl9vID0gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGdsaWRlcyBydW5uaW5nIGJhc2VkIG9uIHRoZSBwYXNzZWQgbW92aW5nIHNjaGVtYS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBtb3ZlXG4gICAgICovXG4gICAgbWFrZTogZnVuY3Rpb24gbWFrZShtb3ZlKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICBpZiAoIUdsaWRlLmRpc2FibGVkKSB7XG4gICAgICAgICFHbGlkZS5zZXR0aW5ncy53YWl0Rm9yVHJhbnNpdGlvbiB8fCBHbGlkZS5kaXNhYmxlKCk7XG4gICAgICAgIHRoaXMubW92ZSA9IG1vdmU7XG4gICAgICAgIEV2ZW50cy5lbWl0KCdydW4uYmVmb3JlJywgdGhpcy5tb3ZlKTtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGUoKTtcbiAgICAgICAgRXZlbnRzLmVtaXQoJ3J1bicsIHRoaXMubW92ZSk7XG4gICAgICAgIENvbXBvbmVudHMuVHJhbnNpdGlvbi5hZnRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKF90aGlzLmlzU3RhcnQoKSkge1xuICAgICAgICAgICAgRXZlbnRzLmVtaXQoJ3J1bi5zdGFydCcsIF90aGlzLm1vdmUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChfdGhpcy5pc0VuZCgpKSB7XG4gICAgICAgICAgICBFdmVudHMuZW1pdCgncnVuLmVuZCcsIF90aGlzLm1vdmUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChfdGhpcy5pc09mZnNldCgpKSB7XG4gICAgICAgICAgICBfdGhpcy5fbyA9IGZhbHNlO1xuICAgICAgICAgICAgRXZlbnRzLmVtaXQoJ3J1bi5vZmZzZXQnLCBfdGhpcy5tb3ZlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBFdmVudHMuZW1pdCgncnVuLmFmdGVyJywgX3RoaXMubW92ZSk7XG4gICAgICAgICAgR2xpZGUuZW5hYmxlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIGN1cnJlbnQgaW5kZXggYmFzZWQgb24gZGVmaW5lZCBtb3ZlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfFVuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBjYWxjdWxhdGU6IGZ1bmN0aW9uIGNhbGN1bGF0ZSgpIHtcbiAgICAgIHZhciBtb3ZlID0gdGhpcy5tb3ZlLFxuICAgICAgICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoO1xuICAgICAgdmFyIHN0ZXBzID0gbW92ZS5zdGVwcyxcbiAgICAgICAgICBkaXJlY3Rpb24gPSBtb3ZlLmRpcmVjdGlvbjsgLy8gQnkgZGVmYXVsdCBhc3N1bWUgdGhhdCBzaXplIG9mIHZpZXcgaXMgZXF1YWwgdG8gb25lIHNsaWRlXG5cbiAgICAgIHZhciB2aWV3U2l6ZSA9IDE7IC8vIFdoaWxlIGRpcmVjdGlvbiBpcyBgPWAgd2Ugd2FudCBqdW1wIHRvXG4gICAgICAvLyBhIHNwZWNpZmllZCBpbmRleCBkZXNjcmliZWQgaW4gc3RlcHMuXG5cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09ICc9Jykge1xuICAgICAgICAvLyBDaGVjayBpZiBib3VuZCBpcyB0cnVlLCBcbiAgICAgICAgLy8gYXMgd2Ugd2FudCB0byBhdm9pZCB3aGl0ZXNwYWNlcy5cbiAgICAgICAgaWYgKEdsaWRlLnNldHRpbmdzLmJvdW5kICYmIHRvSW50KHN0ZXBzKSA+IGxlbmd0aCkge1xuICAgICAgICAgIEdsaWRlLmluZGV4ID0gbGVuZ3RoO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIEdsaWRlLmluZGV4ID0gc3RlcHM7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gV2hlbiBwYXR0ZXJuIGlzIGVxdWFsIHRvIGA+PmAgd2Ugd2FudFxuICAgICAgLy8gZmFzdCBmb3J3YXJkIHRvIHRoZSBsYXN0IHNsaWRlLlxuXG5cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09ICc+JyAmJiBzdGVwcyA9PT0gJz4nKSB7XG4gICAgICAgIEdsaWRlLmluZGV4ID0gbGVuZ3RoO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIFdoZW4gcGF0dGVybiBpcyBlcXVhbCB0byBgPDxgIHdlIHdhbnRcbiAgICAgIC8vIGZhc3QgZm9yd2FyZCB0byB0aGUgZmlyc3Qgc2xpZGUuXG5cblxuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJzwnICYmIHN0ZXBzID09PSAnPCcpIHtcbiAgICAgICAgR2xpZGUuaW5kZXggPSAwO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIHBhZ2luYXRpb24gbW92ZW1lbnRcblxuXG4gICAgICBpZiAoZGlyZWN0aW9uID09PSAnfCcpIHtcbiAgICAgICAgdmlld1NpemUgPSBHbGlkZS5zZXR0aW5ncy5wZXJWaWV3IHx8IDE7XG4gICAgICB9IC8vIHdlIGFyZSBtb3ZpbmcgZm9yd2FyZFxuXG5cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09ICc+JyB8fCBkaXJlY3Rpb24gPT09ICd8JyAmJiBzdGVwcyA9PT0gJz4nKSB7XG4gICAgICAgIHZhciBpbmRleCA9IGNhbGN1bGF0ZUZvcndhcmRJbmRleCh2aWV3U2l6ZSk7XG5cbiAgICAgICAgaWYgKGluZGV4ID4gbGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy5fbyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBHbGlkZS5pbmRleCA9IG5vcm1hbGl6ZUZvcndhcmRJbmRleChpbmRleCwgdmlld1NpemUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIHdlIGFyZSBtb3ZpbmcgYmFja3dhcmRcblxuXG4gICAgICBpZiAoZGlyZWN0aW9uID09PSAnPCcgfHwgZGlyZWN0aW9uID09PSAnfCcgJiYgc3RlcHMgPT09ICc8Jykge1xuICAgICAgICB2YXIgX2luZGV4ID0gY2FsY3VsYXRlQmFja3dhcmRJbmRleCh2aWV3U2l6ZSk7XG5cbiAgICAgICAgaWYgKF9pbmRleCA8IDApIHtcbiAgICAgICAgICB0aGlzLl9vID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIEdsaWRlLmluZGV4ID0gbm9ybWFsaXplQmFja3dhcmRJbmRleChfaW5kZXgsIHZpZXdTaXplKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB3YXJuKFwiSW52YWxpZCBkaXJlY3Rpb24gcGF0dGVybiBbXCIuY29uY2F0KGRpcmVjdGlvbikuY29uY2F0KHN0ZXBzLCBcIl0gaGFzIGJlZW4gdXNlZFwiKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB3ZSBhcmUgb24gdGhlIGZpcnN0IHNsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1N0YXJ0OiBmdW5jdGlvbiBpc1N0YXJ0KCkge1xuICAgICAgcmV0dXJuIEdsaWRlLmluZGV4IDw9IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB3ZSBhcmUgb24gdGhlIGxhc3Qgc2xpZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzRW5kOiBmdW5jdGlvbiBpc0VuZCgpIHtcbiAgICAgIHJldHVybiBHbGlkZS5pbmRleCA+PSB0aGlzLmxlbmd0aDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHdlIGFyZSBtYWtpbmcgYSBvZmZzZXQgcnVuLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGRpcmVjdGlvblxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNPZmZzZXQ6IGZ1bmN0aW9uIGlzT2Zmc2V0KCkge1xuICAgICAgdmFyIGRpcmVjdGlvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoIWRpcmVjdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5fbztcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLl9vKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gLy8gZGlkIHdlIHZpZXcgdG8gdGhlIHJpZ2h0P1xuXG5cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09ICd8PicpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW92ZS5kaXJlY3Rpb24gPT09ICd8JyAmJiB0aGlzLm1vdmUuc3RlcHMgPT09ICc+JztcbiAgICAgIH0gLy8gZGlkIHdlIHZpZXcgdG8gdGhlIGxlZnQ/XG5cblxuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3w8Jykge1xuICAgICAgICByZXR1cm4gdGhpcy5tb3ZlLmRpcmVjdGlvbiA9PT0gJ3wnICYmIHRoaXMubW92ZS5zdGVwcyA9PT0gJzwnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5tb3ZlLmRpcmVjdGlvbiA9PT0gZGlyZWN0aW9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYm91bmQgbW9kZSBpcyBhY3RpdmVcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNCb3VuZDogZnVuY3Rpb24gaXNCb3VuZCgpIHtcbiAgICAgIHJldHVybiBHbGlkZS5pc1R5cGUoJ3NsaWRlcicpICYmIEdsaWRlLnNldHRpbmdzLmZvY3VzQXQgIT09ICdjZW50ZXInICYmIEdsaWRlLnNldHRpbmdzLmJvdW5kO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgaW5kZXggdmFsdWUgdG8gbW92ZSBmb3J3YXJkL3RvIHRoZSByaWdodFxuICAgKlxuICAgKiBAcGFyYW0gdmlld1NpemVcbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG5cbiAgZnVuY3Rpb24gY2FsY3VsYXRlRm9yd2FyZEluZGV4KHZpZXdTaXplKSB7XG4gICAgdmFyIGluZGV4ID0gR2xpZGUuaW5kZXg7XG5cbiAgICBpZiAoR2xpZGUuaXNUeXBlKCdjYXJvdXNlbCcpKSB7XG4gICAgICByZXR1cm4gaW5kZXggKyB2aWV3U2l6ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5kZXggKyAodmlld1NpemUgLSBpbmRleCAlIHZpZXdTaXplKTtcbiAgfVxuICAvKipcbiAgICogTm9ybWFsaXplcyB0aGUgZ2l2ZW4gZm9yd2FyZCBpbmRleCBiYXNlZCBvbiBnbGlkZSBzZXR0aW5ncywgcHJldmVudGluZyBpdCB0byBleGNlZWQgY2VydGFpbiBib3VuZGFyaWVzXG4gICAqXG4gICAqIEBwYXJhbSBpbmRleFxuICAgKiBAcGFyYW0gbGVuZ3RoXG4gICAqIEBwYXJhbSB2aWV3U2l6ZVxuICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgKi9cblxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZUZvcndhcmRJbmRleChpbmRleCwgdmlld1NpemUpIHtcbiAgICB2YXIgbGVuZ3RoID0gUnVuLmxlbmd0aDtcblxuICAgIGlmIChpbmRleCA8PSBsZW5ndGgpIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG5cbiAgICBpZiAoR2xpZGUuaXNUeXBlKCdjYXJvdXNlbCcpKSB7XG4gICAgICByZXR1cm4gaW5kZXggLSAobGVuZ3RoICsgMSk7XG4gICAgfVxuXG4gICAgaWYgKEdsaWRlLnNldHRpbmdzLnJld2luZCkge1xuICAgICAgLy8gYm91bmQgZG9lcyBmdW5ueSB0aGluZ3Mgd2l0aCB0aGUgbGVuZ3RoLCB0aGVyZWZvciB3ZSBoYXZlIHRvIGJlIGNlcnRhaW5cbiAgICAgIC8vIHRoYXQgd2UgYXJlIG9uIHRoZSBsYXN0IHBvc3NpYmxlIGluZGV4IHZhbHVlIGdpdmVuIGJ5IGJvdW5kXG4gICAgICBpZiAoUnVuLmlzQm91bmQoKSAmJiAhUnVuLmlzRW5kKCkpIHtcbiAgICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgaWYgKFJ1bi5pc0JvdW5kKCkpIHtcbiAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1hdGguZmxvb3IobGVuZ3RoIC8gdmlld1NpemUpICogdmlld1NpemU7XG4gIH1cbiAgLyoqXG4gICAqIENhbGN1bGF0ZXMgaW5kZXggdmFsdWUgdG8gbW92ZSBiYWNrd2FyZC90byB0aGUgbGVmdFxuICAgKlxuICAgKiBAcGFyYW0gdmlld1NpemVcbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG5cblxuICBmdW5jdGlvbiBjYWxjdWxhdGVCYWNrd2FyZEluZGV4KHZpZXdTaXplKSB7XG4gICAgdmFyIGluZGV4ID0gR2xpZGUuaW5kZXg7XG5cbiAgICBpZiAoR2xpZGUuaXNUeXBlKCdjYXJvdXNlbCcpKSB7XG4gICAgICByZXR1cm4gaW5kZXggLSB2aWV3U2l6ZTtcbiAgICB9IC8vIGVuc3VyZSBvdXIgYmFjayBuYXZpZ2F0aW9uIHJlc3VsdHMgaW4gdGhlIHNhbWUgaW5kZXggYXMgYSBmb3J3YXJkIG5hdmlnYXRpb25cbiAgICAvLyB0byBleHBlcmllbmNlIGEgaG9tb2dlbmVvdXMgcGFnaW5nXG5cblxuICAgIHZhciB2aWV3ID0gTWF0aC5jZWlsKGluZGV4IC8gdmlld1NpemUpO1xuICAgIHJldHVybiAodmlldyAtIDEpICogdmlld1NpemU7XG4gIH1cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIGdpdmVuIGJhY2t3YXJkIGluZGV4IGJhc2VkIG9uIGdsaWRlIHNldHRpbmdzLCBwcmV2ZW50aW5nIGl0IHRvIGV4Y2VlZCBjZXJ0YWluIGJvdW5kYXJpZXNcbiAgICpcbiAgICogQHBhcmFtIGluZGV4XG4gICAqIEBwYXJhbSBsZW5ndGhcbiAgICogQHBhcmFtIHZpZXdTaXplXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cblxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZUJhY2t3YXJkSW5kZXgoaW5kZXgsIHZpZXdTaXplKSB7XG4gICAgdmFyIGxlbmd0aCA9IFJ1bi5sZW5ndGg7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cblxuICAgIGlmIChHbGlkZS5pc1R5cGUoJ2Nhcm91c2VsJykpIHtcbiAgICAgIHJldHVybiBpbmRleCArIChsZW5ndGggKyAxKTtcbiAgICB9XG5cbiAgICBpZiAoR2xpZGUuc2V0dGluZ3MucmV3aW5kKSB7XG4gICAgICAvLyBib3VuZCBkb2VzIGZ1bm55IHRoaW5ncyB3aXRoIHRoZSBsZW5ndGgsIHRoZXJlZm9yIHdlIGhhdmUgdG8gYmUgY2VydGFpblxuICAgICAgLy8gdGhhdCB3ZSBhcmUgb24gZmlyc3QgcG9zc2libGUgaW5kZXggdmFsdWUgYmVmb3JlIHdlIHRvIHJld2luZCB0byB0aGUgbGVuZ3RoIGdpdmVuIGJ5IGJvdW5kXG4gICAgICBpZiAoUnVuLmlzQm91bmQoKSAmJiBSdW4uaXNTdGFydCgpKSB7XG4gICAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBNYXRoLmZsb29yKGxlbmd0aCAvIHZpZXdTaXplKSAqIHZpZXdTaXplO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgZGVmaW5lKFJ1biwgJ21vdmUnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyB2YWx1ZSBvZiB0aGUgbW92ZSBzY2hlbWEuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX207XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgdmFsdWUgb2YgdGhlIG1vdmUgc2NoZW1hLlxuICAgICAqXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgdmFyIHN0ZXAgPSB2YWx1ZS5zdWJzdHIoMSk7XG4gICAgICB0aGlzLl9tID0ge1xuICAgICAgICBkaXJlY3Rpb246IHZhbHVlLnN1YnN0cigwLCAxKSxcbiAgICAgICAgc3RlcHM6IHN0ZXAgPyB0b0ludChzdGVwKSA/IHRvSW50KHN0ZXApIDogc3RlcCA6IDBcbiAgICAgIH07XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKFJ1biwgJ2xlbmd0aCcsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHZhbHVlIG9mIHRoZSBydW5uaW5nIGRpc3RhbmNlIGJhc2VkXG4gICAgICogb24gemVyby1pbmRleGluZyBudW1iZXIgb2Ygc2xpZGVzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3M7XG4gICAgICB2YXIgbGVuZ3RoID0gQ29tcG9uZW50cy5IdG1sLnNsaWRlcy5sZW5ndGg7IC8vIElmIHRoZSBgYm91bmRgIG9wdGlvbiBpcyBhY3RpdmUsIGEgbWF4aW11bSBydW5uaW5nIGRpc3RhbmNlIHNob3VsZCBiZVxuICAgICAgLy8gcmVkdWNlZCBieSBgcGVyVmlld2AgYW5kIGBmb2N1c0F0YCBzZXR0aW5ncy4gUnVubmluZyBkaXN0YW5jZVxuICAgICAgLy8gc2hvdWxkIGVuZCBiZWZvcmUgY3JlYXRpbmcgYW4gZW1wdHkgc3BhY2UgYWZ0ZXIgaW5zdGFuY2UuXG5cbiAgICAgIGlmICh0aGlzLmlzQm91bmQoKSkge1xuICAgICAgICByZXR1cm4gbGVuZ3RoIC0gMSAtICh0b0ludChzZXR0aW5ncy5wZXJWaWV3KSAtIDEpICsgdG9JbnQoc2V0dGluZ3MuZm9jdXNBdCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsZW5ndGggLSAxO1xuICAgIH1cbiAgfSk7XG4gIGRlZmluZShSdW4sICdvZmZzZXQnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBzdGF0dXMgb2YgdGhlIG9mZnNldHRpbmcgZmxhZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbztcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gUnVuO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBjdXJyZW50IHRpbWUuXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiBub3coKSB7XG4gIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIHdoZW4gaW52b2tlZCwgd2lsbCBvbmx5IGJlIHRyaWdnZXJlZFxuICogYXQgbW9zdCBvbmNlIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmNcbiAqIEBwYXJhbSB7TnVtYmVyfSB3YWl0XG4gKiBAcGFyYW0ge09iamVjdD19IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICpcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2phc2hrZW5hcy91bmRlcnNjb3JlXG4gKi9cblxuZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgdGltZW91dCwgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICB2YXIgcHJldmlvdXMgPSAwO1xuICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblxuICB2YXIgbGF0ZXIgPSBmdW5jdGlvbiBsYXRlcigpIHtcbiAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogbm93KCk7XG4gICAgdGltZW91dCA9IG51bGw7XG4gICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgfTtcblxuICB2YXIgdGhyb3R0bGVkID0gZnVuY3Rpb24gdGhyb3R0bGVkKCkge1xuICAgIHZhciBhdCA9IG5vdygpO1xuICAgIGlmICghcHJldmlvdXMgJiYgb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSkgcHJldmlvdXMgPSBhdDtcbiAgICB2YXIgcmVtYWluaW5nID0gd2FpdCAtIChhdCAtIHByZXZpb3VzKTtcbiAgICBjb250ZXh0ID0gdGhpcztcbiAgICBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHByZXZpb3VzID0gYXQ7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB0aHJvdHRsZWQuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICBwcmV2aW91cyA9IDA7XG4gICAgdGltZW91dCA9IGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgfTtcblxuICByZXR1cm4gdGhyb3R0bGVkO1xufVxuXG52YXIgTUFSR0lOX1RZUEUgPSB7XG4gIGx0cjogWydtYXJnaW5MZWZ0JywgJ21hcmdpblJpZ2h0J10sXG4gIHJ0bDogWydtYXJnaW5SaWdodCcsICdtYXJnaW5MZWZ0J11cbn07XG5mdW5jdGlvbiBHYXBzIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIHZhciBHYXBzID0ge1xuICAgIC8qKlxuICAgICAqIEFwcGxpZXMgZ2FwcyBiZXR3ZWVuIHNsaWRlcy4gRmlyc3QgYW5kIGxhc3RcbiAgICAgKiBzbGlkZXMgZG8gbm90IHJlY2VpdmUgaXQncyBlZGdlIG1hcmdpbnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hUTUxDb2xsZWN0aW9ufSBzbGlkZXNcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGFwcGx5OiBmdW5jdGlvbiBhcHBseShzbGlkZXMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzbGlkZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdmFyIHN0eWxlID0gc2xpZGVzW2ldLnN0eWxlO1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gQ29tcG9uZW50cy5EaXJlY3Rpb24udmFsdWU7XG5cbiAgICAgICAgaWYgKGkgIT09IDApIHtcbiAgICAgICAgICBzdHlsZVtNQVJHSU5fVFlQRVtkaXJlY3Rpb25dWzBdXSA9IFwiXCIuY29uY2F0KHRoaXMudmFsdWUgLyAyLCBcInB4XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlW01BUkdJTl9UWVBFW2RpcmVjdGlvbl1bMF1dID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaSAhPT0gc2xpZGVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICBzdHlsZVtNQVJHSU5fVFlQRVtkaXJlY3Rpb25dWzFdXSA9IFwiXCIuY29uY2F0KHRoaXMudmFsdWUgLyAyLCBcInB4XCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlW01BUkdJTl9UWVBFW2RpcmVjdGlvbl1bMV1dID0gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBnYXBzIGZyb20gdGhlIHNsaWRlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTENvbGxlY3Rpb259IHNsaWRlc1xuICAgICAqIEByZXR1cm5zIHtWb2lkfVxuICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoc2xpZGVzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc2xpZGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHZhciBzdHlsZSA9IHNsaWRlc1tpXS5zdHlsZTtcbiAgICAgICAgc3R5bGUubWFyZ2luTGVmdCA9ICcnO1xuICAgICAgICBzdHlsZS5tYXJnaW5SaWdodCA9ICcnO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgZGVmaW5lKEdhcHMsICd2YWx1ZScsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHZhbHVlIG9mIHRoZSBnYXAuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRvSW50KEdsaWRlLnNldHRpbmdzLmdhcCk7XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKEdhcHMsICdncm93Jywge1xuICAgIC8qKlxuICAgICAqIEdldHMgYWRkaXRpb25hbCBkaW1lbnNpb25zIHZhbHVlIGNhdXNlZCBieSBnYXBzLlxuICAgICAqIFVzZWQgdG8gaW5jcmVhc2Ugd2lkdGggb2YgdGhlIHNsaWRlcyB3cmFwcGVyLlxuICAgICAqXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBHYXBzLnZhbHVlICogQ29tcG9uZW50cy5TaXplcy5sZW5ndGg7XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKEdhcHMsICdyZWR1Y3RvcicsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHJlZHVjdGlvbiB2YWx1ZSBjYXVzZWQgYnkgZ2Fwcy5cbiAgICAgKiBVc2VkIHRvIHN1YnRyYWN0IHdpZHRoIG9mIHRoZSBzbGlkZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIHBlclZpZXcgPSBHbGlkZS5zZXR0aW5ncy5wZXJWaWV3O1xuICAgICAgcmV0dXJuIEdhcHMudmFsdWUgKiAocGVyVmlldyAtIDEpIC8gcGVyVmlldztcbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogQXBwbHkgY2FsY3VsYXRlZCBnYXBzOlxuICAgKiAtIGFmdGVyIGJ1aWxkaW5nLCBzbyBzbGlkZXMgKGluY2x1ZGluZyBjbG9uZXMpIHdpbGwgcmVjZWl2ZSBwcm9wZXIgbWFyZ2luc1xuICAgKiAtIG9uIHVwZGF0aW5nIHZpYSBBUEksIHRvIHJlY2FsY3VsYXRlIGdhcHMgd2l0aCBuZXcgb3B0aW9uc1xuICAgKi9cblxuICBFdmVudHMub24oWydidWlsZC5hZnRlcicsICd1cGRhdGUnXSwgdGhyb3R0bGUoZnVuY3Rpb24gKCkge1xuICAgIEdhcHMuYXBwbHkoQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuY2hpbGRyZW4pO1xuICB9LCAzMCkpO1xuICAvKipcbiAgICogUmVtb3ZlIGdhcHM6XG4gICAqIC0gb24gZGVzdHJveWluZyB0byBicmluZyBtYXJrdXAgdG8gaXRzIGluaXRhbCBzdGF0ZVxuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgR2Fwcy5yZW1vdmUoQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuY2hpbGRyZW4pO1xuICB9KTtcbiAgcmV0dXJuIEdhcHM7XG59XG5cbi8qKlxuICogRmluZHMgc2libGluZ3Mgbm9kZXMgb2YgdGhlIHBhc3NlZCBub2RlLlxuICpcbiAqIEBwYXJhbSAge0VsZW1lbnR9IG5vZGVcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5mdW5jdGlvbiBzaWJsaW5ncyhub2RlKSB7XG4gIGlmIChub2RlICYmIG5vZGUucGFyZW50Tm9kZSkge1xuICAgIHZhciBuID0gbm9kZS5wYXJlbnROb2RlLmZpcnN0Q2hpbGQ7XG4gICAgdmFyIG1hdGNoZWQgPSBbXTtcblxuICAgIGZvciAoOyBuOyBuID0gbi5uZXh0U2libGluZykge1xuICAgICAgaWYgKG4ubm9kZVR5cGUgPT09IDEgJiYgbiAhPT0gbm9kZSkge1xuICAgICAgICBtYXRjaGVkLnB1c2gobik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hdGNoZWQ7XG4gIH1cblxuICByZXR1cm4gW107XG59XG4vKipcbiAqIENoZWNrcyBpZiBwYXNzZWQgbm9kZSBleGlzdCBhbmQgaXMgYSB2YWxpZCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSAge0VsZW1lbnR9IG5vZGVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gZXhpc3Qobm9kZSkge1xuICBpZiAobm9kZSAmJiBub2RlIGluc3RhbmNlb2Ygd2luZG93LkhUTUxFbGVtZW50KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbnZhciBUUkFDS19TRUxFQ1RPUiA9ICdbZGF0YS1nbGlkZS1lbD1cInRyYWNrXCJdJztcbmZ1bmN0aW9uIEh0bWwgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgdmFyIEh0bWwgPSB7XG4gICAgLyoqXG4gICAgICogU2V0dXAgc2xpZGVyIEhUTUwgbm9kZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0dsaWRlfSBnbGlkZVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIHRoaXMucm9vdCA9IEdsaWRlLnNlbGVjdG9yO1xuICAgICAgdGhpcy50cmFjayA9IHRoaXMucm9vdC5xdWVyeVNlbGVjdG9yKFRSQUNLX1NFTEVDVE9SKTtcbiAgICAgIHRoaXMuY29sbGVjdFNsaWRlcygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDb2xsZWN0IHNsaWRlc1xuICAgICAqL1xuICAgIGNvbGxlY3RTbGlkZXM6IGZ1bmN0aW9uIGNvbGxlY3RTbGlkZXMoKSB7XG4gICAgICB0aGlzLnNsaWRlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMud3JhcHBlci5jaGlsZHJlbikuZmlsdGVyKGZ1bmN0aW9uIChzbGlkZSkge1xuICAgICAgICByZXR1cm4gIXNsaWRlLmNsYXNzTGlzdC5jb250YWlucyhHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLnNsaWRlLmNsb25lKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lKEh0bWwsICdyb290Jywge1xuICAgIC8qKlxuICAgICAqIEdldHMgbm9kZSBvZiB0aGUgZ2xpZGUgbWFpbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIEh0bWwuX3I7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgbm9kZSBvZiB0aGUgZ2xpZGUgbWFpbiBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNldDogZnVuY3Rpb24gc2V0KHIpIHtcbiAgICAgIGlmIChpc1N0cmluZyhyKSkge1xuICAgICAgICByID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4aXN0KHIpKSB7XG4gICAgICAgIEh0bWwuX3IgPSByO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2FybignUm9vdCBlbGVtZW50IG11c3QgYmUgYSBleGlzdGluZyBIdG1sIG5vZGUnKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoSHRtbCwgJ3RyYWNrJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgbm9kZSBvZiB0aGUgZ2xpZGUgdHJhY2sgd2l0aCBzbGlkZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gSHRtbC5fdDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyBub2RlIG9mIHRoZSBnbGlkZSB0cmFjayB3aXRoIHNsaWRlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh0KSB7XG4gICAgICBpZiAoZXhpc3QodCkpIHtcbiAgICAgICAgSHRtbC5fdCA9IHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuKFwiQ291bGQgbm90IGZpbmQgdHJhY2sgZWxlbWVudC4gUGxlYXNlIHVzZSBcIi5jb25jYXQoVFJBQ0tfU0VMRUNUT1IsIFwiIGF0dHJpYnV0ZS5cIikpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGRlZmluZShIdG1sLCAnd3JhcHBlcicsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIG5vZGUgb2YgdGhlIHNsaWRlcyB3cmFwcGVyLlxuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIEh0bWwudHJhY2suY2hpbGRyZW5bMF07XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIEFkZC9yZW1vdmUvcmVvcmRlciBkeW5hbWljIHNsaWRlc1xuICAgKi9cblxuICBFdmVudHMub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBIdG1sLmNvbGxlY3RTbGlkZXMoKTtcbiAgfSk7XG4gIHJldHVybiBIdG1sO1xufVxuXG5mdW5jdGlvbiBQZWVrIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIHZhciBQZWVrID0ge1xuICAgIC8qKlxuICAgICAqIFNldHVwcyBob3cgbXVjaCB0byBwZWVrIGJhc2VkIG9uIHNldHRpbmdzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICB0aGlzLnZhbHVlID0gR2xpZGUuc2V0dGluZ3MucGVlaztcbiAgICB9XG4gIH07XG4gIGRlZmluZShQZWVrLCAndmFsdWUnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyB2YWx1ZSBvZiB0aGUgcGVlay5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ8T2JqZWN0fVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIFBlZWsuX3Y7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgdmFsdWUgb2YgdGhlIHBlZWsuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcnxPYmplY3R9IHZhbHVlXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZS5iZWZvcmUgPSB0b0ludCh2YWx1ZS5iZWZvcmUpO1xuICAgICAgICB2YWx1ZS5hZnRlciA9IHRvSW50KHZhbHVlLmFmdGVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gdG9JbnQodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBQZWVrLl92ID0gdmFsdWU7XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKFBlZWssICdyZWR1Y3RvcicsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHJlZHVjdGlvbiB2YWx1ZSBjYXVzZWQgYnkgcGVlay5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgdmFsdWUgPSBQZWVrLnZhbHVlO1xuICAgICAgdmFyIHBlclZpZXcgPSBHbGlkZS5zZXR0aW5ncy5wZXJWaWV3O1xuXG4gICAgICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5iZWZvcmUgLyBwZXJWaWV3ICsgdmFsdWUuYWZ0ZXIgLyBwZXJWaWV3O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsdWUgKiAyIC8gcGVyVmlldztcbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogUmVjYWxjdWxhdGUgcGVla2luZyBzaXplcyBvbjpcbiAgICogLSB3aGVuIHJlc2l6aW5nIHdpbmRvdyB0byB1cGRhdGUgdG8gcHJvcGVyIHBlcmNlbnRzXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ3Jlc2l6ZScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgIFBlZWsubW91bnQoKTtcbiAgfSk7XG4gIHJldHVybiBQZWVrO1xufVxuXG5mdW5jdGlvbiBNb3ZlIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIHZhciBNb3ZlID0ge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdHMgbW92ZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Vm9pZH1cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICB0aGlzLl9vID0gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyBhIG1vdmVtZW50IHZhbHVlIGJhc2VkIG9uIHBhc3NlZCBvZmZzZXQgYW5kIGN1cnJlbnRseSBhY3RpdmUgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IG9mZnNldFxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgbWFrZTogZnVuY3Rpb24gbWFrZSgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHZhciBvZmZzZXQgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IDA7XG4gICAgICB0aGlzLm9mZnNldCA9IG9mZnNldDtcbiAgICAgIEV2ZW50cy5lbWl0KCdtb3ZlJywge1xuICAgICAgICBtb3ZlbWVudDogdGhpcy52YWx1ZVxuICAgICAgfSk7XG4gICAgICBDb21wb25lbnRzLlRyYW5zaXRpb24uYWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICBFdmVudHMuZW1pdCgnbW92ZS5hZnRlcicsIHtcbiAgICAgICAgICBtb3ZlbWVudDogX3RoaXMudmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIGRlZmluZShNb3ZlLCAnb2Zmc2V0Jywge1xuICAgIC8qKlxuICAgICAqIEdldHMgYW4gb2Zmc2V0IHZhbHVlIHVzZWQgdG8gbW9kaWZ5IGN1cnJlbnQgdHJhbnNsYXRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIE1vdmUuX287XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgYW4gb2Zmc2V0IHZhbHVlIHVzZWQgdG8gbW9kaWZ5IGN1cnJlbnQgdHJhbnNsYXRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG4gICAgICBNb3ZlLl9vID0gIWlzVW5kZWZpbmVkKHZhbHVlKSA/IHRvSW50KHZhbHVlKSA6IDA7XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKE1vdmUsICd0cmFuc2xhdGUnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBhIHJhdyBtb3ZlbWVudCB2YWx1ZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBDb21wb25lbnRzLlNpemVzLnNsaWRlV2lkdGggKiBHbGlkZS5pbmRleDtcbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoTW92ZSwgJ3ZhbHVlJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgYW4gYWN0dWFsIG1vdmVtZW50IHZhbHVlIGNvcnJlY3RlZCBieSBvZmZzZXQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5vZmZzZXQ7XG4gICAgICB2YXIgdHJhbnNsYXRlID0gdGhpcy50cmFuc2xhdGU7XG5cbiAgICAgIGlmIChDb21wb25lbnRzLkRpcmVjdGlvbi5pcygncnRsJykpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZSArIG9mZnNldDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRyYW5zbGF0ZSAtIG9mZnNldDtcbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogTWFrZSBtb3ZlbWVudCB0byBwcm9wZXIgc2xpZGUgb246XG4gICAqIC0gYmVmb3JlIGJ1aWxkLCBzbyBnbGlkZSB3aWxsIHN0YXJ0IGF0IGBzdGFydEF0YCBpbmRleFxuICAgKiAtIG9uIGVhY2ggc3RhbmRhcmQgcnVuIHRvIG1vdmUgdG8gbmV3bHkgY2FsY3VsYXRlZCBpbmRleFxuICAgKi9cblxuICBFdmVudHMub24oWydidWlsZC5iZWZvcmUnLCAncnVuJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBNb3ZlLm1ha2UoKTtcbiAgfSk7XG4gIHJldHVybiBNb3ZlO1xufVxuXG5mdW5jdGlvbiBTaXplcyAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICB2YXIgU2l6ZXMgPSB7XG4gICAgLyoqXG4gICAgICogU2V0dXBzIGRpbWVuc2lvbnMgb2Ygc2xpZGVzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBzZXR1cFNsaWRlczogZnVuY3Rpb24gc2V0dXBTbGlkZXMoKSB7XG4gICAgICB2YXIgd2lkdGggPSBcIlwiLmNvbmNhdCh0aGlzLnNsaWRlV2lkdGgsIFwicHhcIik7XG4gICAgICB2YXIgc2xpZGVzID0gQ29tcG9uZW50cy5IdG1sLnNsaWRlcztcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2xpZGVzW2ldLnN0eWxlLndpZHRoID0gd2lkdGg7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHVwcyBkaW1lbnNpb25zIG9mIHNsaWRlcyB3cmFwcGVyLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBzZXR1cFdyYXBwZXI6IGZ1bmN0aW9uIHNldHVwV3JhcHBlcigpIHtcbiAgICAgIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLnN0eWxlLndpZHRoID0gXCJcIi5jb25jYXQodGhpcy53cmFwcGVyU2l6ZSwgXCJweFwiKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhcHBsaWVkIHN0eWxlcyBmcm9tIEhUTUwgZWxlbWVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Vm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHZhciBzbGlkZXMgPSBDb21wb25lbnRzLkh0bWwuc2xpZGVzO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzbGlkZXNbaV0uc3R5bGUud2lkdGggPSAnJztcbiAgICAgIH1cblxuICAgICAgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuc3R5bGUud2lkdGggPSAnJztcbiAgICB9XG4gIH07XG4gIGRlZmluZShTaXplcywgJ2xlbmd0aCcsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIGNvdW50IG51bWJlciBvZiB0aGUgc2xpZGVzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIENvbXBvbmVudHMuSHRtbC5zbGlkZXMubGVuZ3RoO1xuICAgIH1cbiAgfSk7XG4gIGRlZmluZShTaXplcywgJ3dpZHRoJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgd2lkdGggdmFsdWUgb2YgdGhlIHNsaWRlciAodmlzaWJsZSBhcmVhKS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBDb21wb25lbnRzLkh0bWwudHJhY2sub2Zmc2V0V2lkdGg7XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKFNpemVzLCAnd3JhcHBlclNpemUnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBzaXplIG9mIHRoZSBzbGlkZXMgd3JhcHBlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBTaXplcy5zbGlkZVdpZHRoICogU2l6ZXMubGVuZ3RoICsgQ29tcG9uZW50cy5HYXBzLmdyb3cgKyBDb21wb25lbnRzLkNsb25lcy5ncm93O1xuICAgIH1cbiAgfSk7XG4gIGRlZmluZShTaXplcywgJ3NsaWRlV2lkdGgnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyB3aWR0aCB2YWx1ZSBvZiBhIHNpbmdsZSBzbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBTaXplcy53aWR0aCAvIEdsaWRlLnNldHRpbmdzLnBlclZpZXcgLSBDb21wb25lbnRzLlBlZWsucmVkdWN0b3IgLSBDb21wb25lbnRzLkdhcHMucmVkdWN0b3I7XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIEFwcGx5IGNhbGN1bGF0ZWQgZ2xpZGUncyBkaW1lbnNpb25zOlxuICAgKiAtIGJlZm9yZSBidWlsZGluZywgc28gb3RoZXIgZGltZW5zaW9ucyAoZS5nLiB0cmFuc2xhdGUpIHdpbGwgYmUgY2FsY3VsYXRlZCBwcm9wZXJ0bHlcbiAgICogLSB3aGVuIHJlc2l6aW5nIHdpbmRvdyB0byByZWNhbGN1bGF0ZSBzaWxkZXMgZGltZW5zaW9uc1xuICAgKiAtIG9uIHVwZGF0aW5nIHZpYSBBUEksIHRvIGNhbGN1bGF0ZSBkaW1lbnNpb25zIGJhc2VkIG9uIG5ldyBvcHRpb25zXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ2J1aWxkLmJlZm9yZScsICdyZXNpemUnLCAndXBkYXRlJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBTaXplcy5zZXR1cFNsaWRlcygpO1xuICAgIFNpemVzLnNldHVwV3JhcHBlcigpO1xuICB9KTtcbiAgLyoqXG4gICAqIFJlbW92ZSBjYWxjdWxhdGVkIGdsaWRlJ3MgZGltZW5zaW9uczpcbiAgICogLSBvbiBkZXN0b3RpbmcgdG8gYnJpbmcgbWFya3VwIHRvIGl0cyBpbml0YWwgc3RhdGVcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIFNpemVzLnJlbW92ZSgpO1xuICB9KTtcbiAgcmV0dXJuIFNpemVzO1xufVxuXG5mdW5jdGlvbiBCdWlsZCAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICB2YXIgQnVpbGQgPSB7XG4gICAgLyoqXG4gICAgICogSW5pdCBnbGlkZSBidWlsZGluZy4gQWRkcyBjbGFzc2VzLCBzZXRzXG4gICAgICogZGltZW5zaW9ucyBhbmQgc2V0dXBzIGluaXRpYWwgc3RhdGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIEV2ZW50cy5lbWl0KCdidWlsZC5iZWZvcmUnKTtcbiAgICAgIHRoaXMudHlwZUNsYXNzKCk7XG4gICAgICB0aGlzLmFjdGl2ZUNsYXNzKCk7XG4gICAgICBFdmVudHMuZW1pdCgnYnVpbGQuYWZ0ZXInKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkcyBgdHlwZWAgY2xhc3MgdG8gdGhlIGdsaWRlIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHR5cGVDbGFzczogZnVuY3Rpb24gdHlwZUNsYXNzKCkge1xuICAgICAgQ29tcG9uZW50cy5IdG1sLnJvb3QuY2xhc3NMaXN0LmFkZChHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLnR5cGVbR2xpZGUuc2V0dGluZ3MudHlwZV0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGFjdGl2ZSBjbGFzcyB0byBjdXJyZW50IHNsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBhY3RpdmVDbGFzczogZnVuY3Rpb24gYWN0aXZlQ2xhc3MoKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IEdsaWRlLnNldHRpbmdzLmNsYXNzZXM7XG4gICAgICB2YXIgc2xpZGUgPSBDb21wb25lbnRzLkh0bWwuc2xpZGVzW0dsaWRlLmluZGV4XTtcblxuICAgICAgaWYgKHNsaWRlKSB7XG4gICAgICAgIHNsaWRlLmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5zbGlkZS5hY3RpdmUpO1xuICAgICAgICBzaWJsaW5ncyhzbGlkZSkuZm9yRWFjaChmdW5jdGlvbiAoc2libGluZykge1xuICAgICAgICAgIHNpYmxpbmcuY2xhc3NMaXN0LnJlbW92ZShjbGFzc2VzLnNsaWRlLmFjdGl2ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIEhUTUwgY2xhc3NlcyBhcHBsaWVkIGF0IGJ1aWxkaW5nLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmVDbGFzc2VzOiBmdW5jdGlvbiByZW1vdmVDbGFzc2VzKCkge1xuICAgICAgdmFyIF9HbGlkZSRzZXR0aW5ncyRjbGFzcyA9IEdsaWRlLnNldHRpbmdzLmNsYXNzZXMsXG4gICAgICAgICAgdHlwZSA9IF9HbGlkZSRzZXR0aW5ncyRjbGFzcy50eXBlLFxuICAgICAgICAgIHNsaWRlID0gX0dsaWRlJHNldHRpbmdzJGNsYXNzLnNsaWRlO1xuICAgICAgQ29tcG9uZW50cy5IdG1sLnJvb3QuY2xhc3NMaXN0LnJlbW92ZSh0eXBlW0dsaWRlLnNldHRpbmdzLnR5cGVdKTtcbiAgICAgIENvbXBvbmVudHMuSHRtbC5zbGlkZXMuZm9yRWFjaChmdW5jdGlvbiAoc2libGluZykge1xuICAgICAgICBzaWJsaW5nLmNsYXNzTGlzdC5yZW1vdmUoc2xpZGUuYWN0aXZlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIENsZWFyIGJ1aWxkaW5nIGNsYXNzZXM6XG4gICAqIC0gb24gZGVzdHJveWluZyB0byBicmluZyBIVE1MIHRvIGl0cyBpbml0aWFsIHN0YXRlXG4gICAqIC0gb24gdXBkYXRpbmcgdG8gcmVtb3ZlIGNsYXNzZXMgYmVmb3JlIHJlbW91bnRpbmcgY29tcG9uZW50XG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ2Rlc3Ryb3knLCAndXBkYXRlJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBCdWlsZC5yZW1vdmVDbGFzc2VzKCk7XG4gIH0pO1xuICAvKipcbiAgICogUmVtb3VudCBjb21wb25lbnQ6XG4gICAqIC0gb24gcmVzaXppbmcgb2YgdGhlIHdpbmRvdyB0byBjYWxjdWxhdGUgbmV3IGRpbWVuc2lvbnNcbiAgICogLSBvbiB1cGRhdGluZyBzZXR0aW5ncyB2aWEgQVBJXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ3Jlc2l6ZScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgIEJ1aWxkLm1vdW50KCk7XG4gIH0pO1xuICAvKipcbiAgICogU3dhcCBhY3RpdmUgY2xhc3Mgb2YgY3VycmVudCBzbGlkZTpcbiAgICogLSBhZnRlciBlYWNoIG1vdmUgdG8gdGhlIG5ldyBpbmRleFxuICAgKi9cblxuICBFdmVudHMub24oJ21vdmUuYWZ0ZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgQnVpbGQuYWN0aXZlQ2xhc3MoKTtcbiAgfSk7XG4gIHJldHVybiBCdWlsZDtcbn1cblxuZnVuY3Rpb24gQ2xvbmVzIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIHZhciBDbG9uZXMgPSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHBhdHRlcm4gbWFwIGFuZCBjb2xsZWN0IHNsaWRlcyB0byBiZSBjbG9uZWQuXG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgdGhpcy5pdGVtcyA9IFtdO1xuXG4gICAgICBpZiAoR2xpZGUuaXNUeXBlKCdjYXJvdXNlbCcpKSB7XG4gICAgICAgIHRoaXMuaXRlbXMgPSB0aGlzLmNvbGxlY3QoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29sbGVjdCBjbG9uZXMgd2l0aCBwYXR0ZXJuLlxuICAgICAqXG4gICAgICogQHJldHVybiB7W119XG4gICAgICovXG4gICAgY29sbGVjdDogZnVuY3Rpb24gY29sbGVjdCgpIHtcbiAgICAgIHZhciBpdGVtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogW107XG4gICAgICB2YXIgc2xpZGVzID0gQ29tcG9uZW50cy5IdG1sLnNsaWRlcztcbiAgICAgIHZhciBfR2xpZGUkc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncyxcbiAgICAgICAgICBwZXJWaWV3ID0gX0dsaWRlJHNldHRpbmdzLnBlclZpZXcsXG4gICAgICAgICAgY2xhc3NlcyA9IF9HbGlkZSRzZXR0aW5ncy5jbGFzc2VzLFxuICAgICAgICAgIGNsb25pbmdSYXRpbyA9IF9HbGlkZSRzZXR0aW5ncy5jbG9uaW5nUmF0aW87XG5cbiAgICAgIGlmIChzbGlkZXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIHZhciBwZWVrSW5jcmVtZW50ZXIgPSArISFHbGlkZS5zZXR0aW5ncy5wZWVrO1xuICAgICAgICB2YXIgY2xvbmVDb3VudCA9IHBlclZpZXcgKyBwZWVrSW5jcmVtZW50ZXIgKyBNYXRoLnJvdW5kKHBlclZpZXcgLyAyKTtcbiAgICAgICAgdmFyIGFwcGVuZCA9IHNsaWRlcy5zbGljZSgwLCBjbG9uZUNvdW50KS5yZXZlcnNlKCk7XG4gICAgICAgIHZhciBwcmVwZW5kID0gc2xpZGVzLnNsaWNlKGNsb25lQ291bnQgKiAtMSk7XG5cbiAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCBNYXRoLm1heChjbG9uaW5nUmF0aW8sIE1hdGguZmxvb3IocGVyVmlldyAvIHNsaWRlcy5sZW5ndGgpKTsgcisrKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcHBlbmQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjbG9uZSA9IGFwcGVuZFtpXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgICBjbG9uZS5jbGFzc0xpc3QuYWRkKGNsYXNzZXMuc2xpZGUuY2xvbmUpO1xuICAgICAgICAgICAgaXRlbXMucHVzaChjbG9uZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IHByZXBlbmQubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgX2Nsb25lID0gcHJlcGVuZFtfaV0uY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICBfY2xvbmUuY2xhc3NMaXN0LmFkZChjbGFzc2VzLnNsaWRlLmNsb25lKTtcblxuICAgICAgICAgICAgaXRlbXMudW5zaGlmdChfY2xvbmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gaXRlbXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFwcGVuZCBjbG9uZWQgc2xpZGVzIHdpdGggZ2VuZXJhdGVkIHBhdHRlcm4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGFwcGVuZDogZnVuY3Rpb24gYXBwZW5kKCkge1xuICAgICAgdmFyIGl0ZW1zID0gdGhpcy5pdGVtcztcbiAgICAgIHZhciBfQ29tcG9uZW50cyRIdG1sID0gQ29tcG9uZW50cy5IdG1sLFxuICAgICAgICAgIHdyYXBwZXIgPSBfQ29tcG9uZW50cyRIdG1sLndyYXBwZXIsXG4gICAgICAgICAgc2xpZGVzID0gX0NvbXBvbmVudHMkSHRtbC5zbGlkZXM7XG4gICAgICB2YXIgaGFsZiA9IE1hdGguZmxvb3IoaXRlbXMubGVuZ3RoIC8gMik7XG4gICAgICB2YXIgcHJlcGVuZCA9IGl0ZW1zLnNsaWNlKDAsIGhhbGYpLnJldmVyc2UoKTtcbiAgICAgIHZhciBhcHBlbmQgPSBpdGVtcy5zbGljZShoYWxmICogLTEpLnJldmVyc2UoKTtcbiAgICAgIHZhciB3aWR0aCA9IFwiXCIuY29uY2F0KENvbXBvbmVudHMuU2l6ZXMuc2xpZGVXaWR0aCwgXCJweFwiKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcHBlbmQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgd3JhcHBlci5hcHBlbmRDaGlsZChhcHBlbmRbaV0pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBfaTIgPSAwOyBfaTIgPCBwcmVwZW5kLmxlbmd0aDsgX2kyKyspIHtcbiAgICAgICAgd3JhcHBlci5pbnNlcnRCZWZvcmUocHJlcGVuZFtfaTJdLCBzbGlkZXNbMF0pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBfaTMgPSAwOyBfaTMgPCBpdGVtcy5sZW5ndGg7IF9pMysrKSB7XG4gICAgICAgIGl0ZW1zW19pM10uc3R5bGUud2lkdGggPSB3aWR0aDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGFsbCBjbG9uZWQgc2xpZGVzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHZhciBpdGVtcyA9IHRoaXMuaXRlbXM7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIucmVtb3ZlQ2hpbGQoaXRlbXNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgZGVmaW5lKENsb25lcywgJ2dyb3cnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBhZGRpdGlvbmFsIGRpbWVuc2lvbnMgdmFsdWUgY2F1c2VkIGJ5IGNsb25lcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiAoQ29tcG9uZW50cy5TaXplcy5zbGlkZVdpZHRoICsgQ29tcG9uZW50cy5HYXBzLnZhbHVlKSAqIENsb25lcy5pdGVtcy5sZW5ndGg7XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIEFwcGVuZCBhZGRpdGlvbmFsIHNsaWRlJ3MgY2xvbmVzOlxuICAgKiAtIHdoaWxlIGdsaWRlJ3MgdHlwZSBpcyBgY2Fyb3VzZWxgXG4gICAqL1xuXG4gIEV2ZW50cy5vbigndXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgIENsb25lcy5yZW1vdmUoKTtcbiAgICBDbG9uZXMubW91bnQoKTtcbiAgICBDbG9uZXMuYXBwZW5kKCk7XG4gIH0pO1xuICAvKipcbiAgICogQXBwZW5kIGFkZGl0aW9uYWwgc2xpZGUncyBjbG9uZXM6XG4gICAqIC0gd2hpbGUgZ2xpZGUncyB0eXBlIGlzIGBjYXJvdXNlbGBcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdidWlsZC5iZWZvcmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKEdsaWRlLmlzVHlwZSgnY2Fyb3VzZWwnKSkge1xuICAgICAgQ2xvbmVzLmFwcGVuZCgpO1xuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBSZW1vdmUgY2xvbmVzIEhUTUxFbGVtZW50czpcbiAgICogLSBvbiBkZXN0cm95aW5nLCB0byBicmluZyBIVE1MIHRvIGl0cyBpbml0aWFsIHN0YXRlXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBDbG9uZXMucmVtb3ZlKCk7XG4gIH0pO1xuICByZXR1cm4gQ2xvbmVzO1xufVxuXG52YXIgRXZlbnRzQmluZGVyID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIEV2ZW50c0JpbmRlciBpbnN0YW5jZS5cbiAgICovXG4gIGZ1bmN0aW9uIEV2ZW50c0JpbmRlcigpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFdmVudHNCaW5kZXIpO1xuXG4gICAgdGhpcy5saXN0ZW5lcnMgPSBsaXN0ZW5lcnM7XG4gIH1cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnRzIGxpc3RlbmVycyB0byBhcnJvd3MgSFRNTCBlbGVtZW50cy5cbiAgICpcbiAgICogQHBhcmFtICB7U3RyaW5nfEFycmF5fSBldmVudHNcbiAgICogQHBhcmFtICB7RWxlbWVudHxXaW5kb3d8RG9jdW1lbnR9IGVsXG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjbG9zdXJlXG4gICAqIEBwYXJhbSAge0Jvb2xlYW58T2JqZWN0fSBjYXB0dXJlXG4gICAqIEByZXR1cm4ge1ZvaWR9XG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKEV2ZW50c0JpbmRlciwgW3tcbiAgICBrZXk6IFwib25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gb24oZXZlbnRzLCBlbCwgY2xvc3VyZSkge1xuICAgICAgdmFyIGNhcHR1cmUgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IGZhbHNlO1xuXG4gICAgICBpZiAoaXNTdHJpbmcoZXZlbnRzKSkge1xuICAgICAgICBldmVudHMgPSBbZXZlbnRzXTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRzW2ldXSA9IGNsb3N1cmU7XG4gICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRzW2ldLCB0aGlzLmxpc3RlbmVyc1tldmVudHNbaV1dLCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBldmVudCBsaXN0ZW5lcnMgZnJvbSBhcnJvd3MgSFRNTCBlbGVtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xBcnJheX0gZXZlbnRzXG4gICAgICogQHBhcmFtICB7RWxlbWVudHxXaW5kb3d8RG9jdW1lbnR9IGVsXG4gICAgICogQHBhcmFtICB7Qm9vbGVhbnxPYmplY3R9IGNhcHR1cmVcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwib2ZmXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9mZihldmVudHMsIGVsKSB7XG4gICAgICB2YXIgY2FwdHVyZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG5cbiAgICAgIGlmIChpc1N0cmluZyhldmVudHMpKSB7XG4gICAgICAgIGV2ZW50cyA9IFtldmVudHNdO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50c1tpXSwgdGhpcy5saXN0ZW5lcnNbZXZlbnRzW2ldXSwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlc3Ryb3kgY29sbGVjdGVkIGxpc3RlbmVycy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtWb2lkfVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGVzdHJveVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgZGVsZXRlIHRoaXMubGlzdGVuZXJzO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBFdmVudHNCaW5kZXI7XG59KCk7XG5cbmZ1bmN0aW9uIFJlc2l6ZSAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIGJpbmRlciBmb3IgRE9NIEV2ZW50cy5cbiAgICpcbiAgICogQHR5cGUge0V2ZW50c0JpbmRlcn1cbiAgICovXG4gIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG4gIHZhciBSZXNpemUgPSB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgd2luZG93IGJpbmRpbmdzLlxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIHRoaXMuYmluZCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kcyBgcmV6c2l6ZWAgbGlzdGVuZXIgdG8gdGhlIHdpbmRvdy5cbiAgICAgKiBJdCdzIGEgY29zdGx5IGV2ZW50LCBzbyB3ZSBhcmUgZGVib3VuY2luZyBpdC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAgIEJpbmRlci5vbigncmVzaXplJywgd2luZG93LCB0aHJvdHRsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgIEV2ZW50cy5lbWl0KCdyZXNpemUnKTtcbiAgICAgIH0sIEdsaWRlLnNldHRpbmdzLnRocm90dGxlKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZHMgbGlzdGVuZXJzIGZyb20gdGhlIHdpbmRvdy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgICBCaW5kZXIub2ZmKCdyZXNpemUnLCB3aW5kb3cpO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIFJlbW92ZSBiaW5kaW5ncyBmcm9tIHdpbmRvdzpcbiAgICogLSBvbiBkZXN0cm95aW5nLCB0byByZW1vdmUgYWRkZWQgRXZlbnRMaXN0ZW5lclxuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgUmVzaXplLnVuYmluZCgpO1xuICAgIEJpbmRlci5kZXN0cm95KCk7XG4gIH0pO1xuICByZXR1cm4gUmVzaXplO1xufVxuXG52YXIgVkFMSURfRElSRUNUSU9OUyA9IFsnbHRyJywgJ3J0bCddO1xudmFyIEZMSVBFRF9NT1ZFTUVOVFMgPSB7XG4gICc+JzogJzwnLFxuICAnPCc6ICc+JyxcbiAgJz0nOiAnPSdcbn07XG5mdW5jdGlvbiBEaXJlY3Rpb24gKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgdmFyIERpcmVjdGlvbiA9IHtcbiAgICAvKipcbiAgICAgKiBTZXR1cHMgZ2FwIHZhbHVlIGJhc2VkIG9uIHNldHRpbmdzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICB0aGlzLnZhbHVlID0gR2xpZGUuc2V0dGluZ3MuZGlyZWN0aW9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNvbHZlcyBwYXR0ZXJuIGJhc2VkIG9uIGRpcmVjdGlvbiB2YWx1ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHBhdHRlcm5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfVxuICAgICAqL1xuICAgIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUocGF0dGVybikge1xuICAgICAgdmFyIHRva2VuID0gcGF0dGVybi5zbGljZSgwLCAxKTtcblxuICAgICAgaWYgKHRoaXMuaXMoJ3J0bCcpKSB7XG4gICAgICAgIHJldHVybiBwYXR0ZXJuLnNwbGl0KHRva2VuKS5qb2luKEZMSVBFRF9NT1ZFTUVOVFNbdG9rZW5dKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhdHRlcm47XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB2YWx1ZSBvZiBkaXJlY3Rpb24gbW9kZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3Rpb25cbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpczogZnVuY3Rpb24gaXMoZGlyZWN0aW9uKSB7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gZGlyZWN0aW9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGRpcmVjdGlvbiBjbGFzcyB0byB0aGUgcm9vdCBIVE1MIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGFkZENsYXNzOiBmdW5jdGlvbiBhZGRDbGFzcygpIHtcbiAgICAgIENvbXBvbmVudHMuSHRtbC5yb290LmNsYXNzTGlzdC5hZGQoR2xpZGUuc2V0dGluZ3MuY2xhc3Nlcy5kaXJlY3Rpb25bdGhpcy52YWx1ZV0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGRpcmVjdGlvbiBjbGFzcyBmcm9tIHRoZSByb290IEhUTUwgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uIHJlbW92ZUNsYXNzKCkge1xuICAgICAgQ29tcG9uZW50cy5IdG1sLnJvb3QuY2xhc3NMaXN0LnJlbW92ZShHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLmRpcmVjdGlvblt0aGlzLnZhbHVlXSk7XG4gICAgfVxuICB9O1xuICBkZWZpbmUoRGlyZWN0aW9uLCAndmFsdWUnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyB2YWx1ZSBvZiB0aGUgZGlyZWN0aW9uLlxuICAgICAqXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBEaXJlY3Rpb24uX3Y7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgdmFsdWUgb2YgdGhlIGRpcmVjdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcbiAgICAgIGlmIChWQUxJRF9ESVJFQ1RJT05TLmluZGV4T2YodmFsdWUpID4gLTEpIHtcbiAgICAgICAgRGlyZWN0aW9uLl92ID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3YXJuKCdEaXJlY3Rpb24gdmFsdWUgbXVzdCBiZSBgbHRyYCBvciBgcnRsYCcpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBDbGVhciBkaXJlY3Rpb24gY2xhc3M6XG4gICAqIC0gb24gZGVzdHJveSB0byBicmluZyBIVE1MIHRvIGl0cyBpbml0aWFsIHN0YXRlXG4gICAqIC0gb24gdXBkYXRlIHRvIHJlbW92ZSBjbGFzcyBiZWZvcmUgcmVhcHBsaW5nIGJlbGxvd1xuICAgKi9cblxuICBFdmVudHMub24oWydkZXN0cm95JywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgRGlyZWN0aW9uLnJlbW92ZUNsYXNzKCk7XG4gIH0pO1xuICAvKipcbiAgICogUmVtb3VudCBjb21wb25lbnQ6XG4gICAqIC0gb24gdXBkYXRlIHRvIHJlZmxlY3QgY2hhbmdlcyBpbiBkaXJlY3Rpb24gdmFsdWVcbiAgICovXG5cbiAgRXZlbnRzLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgRGlyZWN0aW9uLm1vdW50KCk7XG4gIH0pO1xuICAvKipcbiAgICogQXBwbHkgZGlyZWN0aW9uIGNsYXNzOlxuICAgKiAtIGJlZm9yZSBidWlsZGluZyB0byBhcHBseSBjbGFzcyBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgICogLSBvbiB1cGRhdGluZyB0byByZWFwcGx5IGRpcmVjdGlvbiBjbGFzcyB0aGF0IG1heSBjaGFuZ2VkXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ2J1aWxkLmJlZm9yZScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgIERpcmVjdGlvbi5hZGRDbGFzcygpO1xuICB9KTtcbiAgcmV0dXJuIERpcmVjdGlvbjtcbn1cblxuLyoqXG4gKiBSZWZsZWN0cyB2YWx1ZSBvZiBnbGlkZSBtb3ZlbWVudC5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IEdsaWRlXG4gKiBAcGFyYW0gIHtPYmplY3R9IENvbXBvbmVudHNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gUnRsIChHbGlkZSwgQ29tcG9uZW50cykge1xuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIE5lZ2F0ZXMgdGhlIHBhc3NlZCB0cmFuc2xhdGUgaWYgZ2xpZGUgaXMgaW4gUlRMIG9wdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gdHJhbnNsYXRlXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIG1vZGlmeTogZnVuY3Rpb24gbW9kaWZ5KHRyYW5zbGF0ZSkge1xuICAgICAgaWYgKENvbXBvbmVudHMuRGlyZWN0aW9uLmlzKCdydGwnKSkge1xuICAgICAgICByZXR1cm4gLXRyYW5zbGF0ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRyYW5zbGF0ZTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogVXBkYXRlcyBnbGlkZSBtb3ZlbWVudCB3aXRoIGEgYGdhcGAgc2V0dGluZ3MuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBHbGlkZVxuICogQHBhcmFtICB7T2JqZWN0fSBDb21wb25lbnRzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIEdhcCAoR2xpZGUsIENvbXBvbmVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBNb2RpZmllcyBwYXNzZWQgdHJhbnNsYXRlIHZhbHVlIHdpdGggbnVtYmVyIGluIHRoZSBgZ2FwYCBzZXR0aW5ncy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gdHJhbnNsYXRlXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIG1vZGlmeTogZnVuY3Rpb24gbW9kaWZ5KHRyYW5zbGF0ZSkge1xuICAgICAgdmFyIG11bHRpcGxpZXIgPSBNYXRoLmZsb29yKHRyYW5zbGF0ZSAvIENvbXBvbmVudHMuU2l6ZXMuc2xpZGVXaWR0aCk7XG4gICAgICByZXR1cm4gdHJhbnNsYXRlICsgQ29tcG9uZW50cy5HYXBzLnZhbHVlICogbXVsdGlwbGllcjtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogVXBkYXRlcyBnbGlkZSBtb3ZlbWVudCB3aXRoIHdpZHRoIG9mIGFkZGl0aW9uYWwgY2xvbmVzIHdpZHRoLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gR2xpZGVcbiAqIEBwYXJhbSAge09iamVjdH0gQ29tcG9uZW50c1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBHcm93IChHbGlkZSwgQ29tcG9uZW50cykge1xuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIEFkZHMgdG8gdGhlIHBhc3NlZCB0cmFuc2xhdGUgd2lkdGggb2YgdGhlIGhhbGYgb2YgY2xvbmVzLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSB0cmFuc2xhdGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgbW9kaWZ5OiBmdW5jdGlvbiBtb2RpZnkodHJhbnNsYXRlKSB7XG4gICAgICByZXR1cm4gdHJhbnNsYXRlICsgQ29tcG9uZW50cy5DbG9uZXMuZ3JvdyAvIDI7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZXMgZ2xpZGUgbW92ZW1lbnQgd2l0aCBhIGBwZWVrYCBzZXR0aW5ncy5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IEdsaWRlXG4gKiBAcGFyYW0gIHtPYmplY3R9IENvbXBvbmVudHNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBQZWVraW5nIChHbGlkZSwgQ29tcG9uZW50cykge1xuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIE1vZGlmaWVzIHBhc3NlZCB0cmFuc2xhdGUgdmFsdWUgd2l0aCBhIGBwZWVrYCBzZXR0aW5nLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSB0cmFuc2xhdGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgbW9kaWZ5OiBmdW5jdGlvbiBtb2RpZnkodHJhbnNsYXRlKSB7XG4gICAgICBpZiAoR2xpZGUuc2V0dGluZ3MuZm9jdXNBdCA+PSAwKSB7XG4gICAgICAgIHZhciBwZWVrID0gQ29tcG9uZW50cy5QZWVrLnZhbHVlO1xuXG4gICAgICAgIGlmIChpc09iamVjdChwZWVrKSkge1xuICAgICAgICAgIHJldHVybiB0cmFuc2xhdGUgLSBwZWVrLmJlZm9yZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cmFuc2xhdGUgLSBwZWVrO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJhbnNsYXRlO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGdsaWRlIG1vdmVtZW50IHdpdGggYSBgZm9jdXNBdGAgc2V0dGluZ3MuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBHbGlkZVxuICogQHBhcmFtICB7T2JqZWN0fSBDb21wb25lbnRzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIEZvY3VzaW5nIChHbGlkZSwgQ29tcG9uZW50cykge1xuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIE1vZGlmaWVzIHBhc3NlZCB0cmFuc2xhdGUgdmFsdWUgd2l0aCBpbmRleCBpbiB0aGUgYGZvY3VzQXRgIHNldHRpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRyYW5zbGF0ZVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBtb2RpZnk6IGZ1bmN0aW9uIG1vZGlmeSh0cmFuc2xhdGUpIHtcbiAgICAgIHZhciBnYXAgPSBDb21wb25lbnRzLkdhcHMudmFsdWU7XG4gICAgICB2YXIgd2lkdGggPSBDb21wb25lbnRzLlNpemVzLndpZHRoO1xuICAgICAgdmFyIGZvY3VzQXQgPSBHbGlkZS5zZXR0aW5ncy5mb2N1c0F0O1xuICAgICAgdmFyIHNsaWRlV2lkdGggPSBDb21wb25lbnRzLlNpemVzLnNsaWRlV2lkdGg7XG5cbiAgICAgIGlmIChmb2N1c0F0ID09PSAnY2VudGVyJykge1xuICAgICAgICByZXR1cm4gdHJhbnNsYXRlIC0gKHdpZHRoIC8gMiAtIHNsaWRlV2lkdGggLyAyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRyYW5zbGF0ZSAtIHNsaWRlV2lkdGggKiBmb2N1c0F0IC0gZ2FwICogZm9jdXNBdDtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogQXBwbGllcyBkaWZmcmVudCB0cmFuc2Zvcm1lcnMgb24gdHJhbnNsYXRlIHZhbHVlLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gR2xpZGVcbiAqIEBwYXJhbSAge09iamVjdH0gQ29tcG9uZW50c1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIG11dGF0b3IgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgLyoqXG4gICAqIE1lcmdlIGluc3RhbmNlIHRyYW5zZm9ybWVycyB3aXRoIGNvbGxlY3Rpb24gb2YgZGVmYXVsdCB0cmFuc2Zvcm1lcnMuXG4gICAqIEl0J3MgaW1wb3J0YW50IHRoYXQgdGhlIFJ0bCBjb21wb25lbnQgYmUgbGFzdCBvbiB0aGUgbGlzdCxcbiAgICogc28gaXQgcmVmbGVjdHMgYWxsIHByZXZpb3VzIHRyYW5zZm9ybWF0aW9ucy5cbiAgICpcbiAgICogQHR5cGUge0FycmF5fVxuICAgKi9cbiAgdmFyIFRSQU5TRk9STUVSUyA9IFtHYXAsIEdyb3csIFBlZWtpbmcsIEZvY3VzaW5nXS5jb25jYXQoR2xpZGUuX3QsIFtSdGxdKTtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBQaXBsaW5lcyB0cmFuc2xhdGUgdmFsdWUgd2l0aCByZWdpc3RlcmVkIHRyYW5zZm9ybWVycy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gdHJhbnNsYXRlXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIG11dGF0ZTogZnVuY3Rpb24gbXV0YXRlKHRyYW5zbGF0ZSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBUUkFOU0ZPUk1FUlMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHRyYW5zZm9ybWVyID0gVFJBTlNGT1JNRVJTW2ldO1xuXG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKHRyYW5zZm9ybWVyKSAmJiBpc0Z1bmN0aW9uKHRyYW5zZm9ybWVyKCkubW9kaWZ5KSkge1xuICAgICAgICAgIHRyYW5zbGF0ZSA9IHRyYW5zZm9ybWVyKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpLm1vZGlmeSh0cmFuc2xhdGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdhcm4oJ1RyYW5zZm9ybWVyIHNob3VsZCBiZSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBgbW9kaWZ5KClgIG1ldGhvZCcpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cmFuc2xhdGU7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBUcmFuc2xhdGUgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgdmFyIFRyYW5zbGF0ZSA9IHtcbiAgICAvKipcbiAgICAgKiBTZXRzIHZhbHVlIG9mIHRyYW5zbGF0ZSBvbiBIVE1MIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG4gICAgICB2YXIgdHJhbnNmb3JtID0gbXV0YXRvcihHbGlkZSwgQ29tcG9uZW50cykubXV0YXRlKHZhbHVlKTtcbiAgICAgIHZhciB0cmFuc2xhdGUzZCA9IFwidHJhbnNsYXRlM2QoXCIuY29uY2F0KC0xICogdHJhbnNmb3JtLCBcInB4LCAwcHgsIDBweClcIik7XG4gICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS5tb3pUcmFuc2Zvcm0gPSB0cmFuc2xhdGUzZDsgLy8gbmVlZGVkIGZvciBzdXBwb3J0ZWQgRmlyZWZveCAxMC0xNVxuXG4gICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0cmFuc2xhdGUzZDsgLy8gbmVlZGVkIGZvciBzdXBwb3J0ZWQgQ2hyb21lIDEwLTM1LCBTYWZhcmkgNS4xLTgsIGFuZCBPcGVyYSAxNS0yMlxuXG4gICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS50cmFuc2Zvcm0gPSB0cmFuc2xhdGUzZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB2YWx1ZSBvZiB0cmFuc2xhdGUgZnJvbSBIVE1MIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuc3R5bGUudHJhbnNmb3JtID0gJyc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4ge251bWJlcn1cbiAgICAgKi9cbiAgICBnZXRTdGFydEluZGV4OiBmdW5jdGlvbiBnZXRTdGFydEluZGV4KCkge1xuICAgICAgdmFyIGxlbmd0aCA9IENvbXBvbmVudHMuU2l6ZXMubGVuZ3RoO1xuICAgICAgdmFyIGluZGV4ID0gR2xpZGUuaW5kZXg7XG4gICAgICB2YXIgcGVyVmlldyA9IEdsaWRlLnNldHRpbmdzLnBlclZpZXc7XG5cbiAgICAgIGlmIChDb21wb25lbnRzLlJ1bi5pc09mZnNldCgnPicpIHx8IENvbXBvbmVudHMuUnVuLmlzT2Zmc2V0KCd8PicpKSB7XG4gICAgICAgIHJldHVybiBsZW5ndGggKyAoaW5kZXggLSBwZXJWaWV3KTtcbiAgICAgIH0gLy8gXCJtb2R1bG8gbGVuZ3RoXCIgY29udmVydHMgYW4gaW5kZXggdGhhdCBlcXVhbHMgbGVuZ3RoIHRvIHplcm9cblxuXG4gICAgICByZXR1cm4gKGluZGV4ICsgcGVyVmlldykgJSBsZW5ndGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4ge251bWJlcn1cbiAgICAgKi9cbiAgICBnZXRUcmF2ZWxEaXN0YW5jZTogZnVuY3Rpb24gZ2V0VHJhdmVsRGlzdGFuY2UoKSB7XG4gICAgICB2YXIgdHJhdmVsRGlzdGFuY2UgPSBDb21wb25lbnRzLlNpemVzLnNsaWRlV2lkdGggKiBHbGlkZS5zZXR0aW5ncy5wZXJWaWV3O1xuXG4gICAgICBpZiAoQ29tcG9uZW50cy5SdW4uaXNPZmZzZXQoJz4nKSB8fCBDb21wb25lbnRzLlJ1bi5pc09mZnNldCgnfD4nKSkge1xuICAgICAgICAvLyByZXZlcnNlIHRyYXZlbCBkaXN0YW5jZSBzbyB0aGF0IHdlIGRvbid0IGhhdmUgdG8gY2hhbmdlIHN1YnRyYWN0IG9wZXJhdGlvbnNcbiAgICAgICAgcmV0dXJuIHRyYXZlbERpc3RhbmNlICogLTE7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cmF2ZWxEaXN0YW5jZTtcbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBTZXQgbmV3IHRyYW5zbGF0ZSB2YWx1ZTpcbiAgICogLSBvbiBtb3ZlIHRvIHJlZmxlY3QgaW5kZXggY2hhbmdlXG4gICAqIC0gb24gdXBkYXRpbmcgdmlhIEFQSSB0byByZWZsZWN0IHBvc3NpYmxlIGNoYW5nZXMgaW4gb3B0aW9uc1xuICAgKi9cblxuICBFdmVudHMub24oJ21vdmUnLCBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIGlmICghR2xpZGUuaXNUeXBlKCdjYXJvdXNlbCcpIHx8ICFDb21wb25lbnRzLlJ1bi5pc09mZnNldCgpKSB7XG4gICAgICByZXR1cm4gVHJhbnNsYXRlLnNldChjb250ZXh0Lm1vdmVtZW50KTtcbiAgICB9XG5cbiAgICBDb21wb25lbnRzLlRyYW5zaXRpb24uYWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgRXZlbnRzLmVtaXQoJ3RyYW5zbGF0ZS5qdW1wJyk7XG4gICAgICBUcmFuc2xhdGUuc2V0KENvbXBvbmVudHMuU2l6ZXMuc2xpZGVXaWR0aCAqIEdsaWRlLmluZGV4KTtcbiAgICB9KTtcbiAgICB2YXIgc3RhcnRXaWR0aCA9IENvbXBvbmVudHMuU2l6ZXMuc2xpZGVXaWR0aCAqIENvbXBvbmVudHMuVHJhbnNsYXRlLmdldFN0YXJ0SW5kZXgoKTtcbiAgICByZXR1cm4gVHJhbnNsYXRlLnNldChzdGFydFdpZHRoIC0gQ29tcG9uZW50cy5UcmFuc2xhdGUuZ2V0VHJhdmVsRGlzdGFuY2UoKSk7XG4gIH0pO1xuICAvKipcbiAgICogUmVtb3ZlIHRyYW5zbGF0ZTpcbiAgICogLSBvbiBkZXN0cm95aW5nIHRvIGJyaW5nIG1hcmt1cCB0byBpdHMgaW5pdGFsIHN0YXRlXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBUcmFuc2xhdGUucmVtb3ZlKCk7XG4gIH0pO1xuICByZXR1cm4gVHJhbnNsYXRlO1xufVxuXG5mdW5jdGlvbiBUcmFuc2l0aW9uIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIC8qKlxuICAgKiBIb2xkcyBpbmFjdGl2aXR5IHN0YXR1cyBvZiB0cmFuc2l0aW9uLlxuICAgKiBXaGVuIHRydWUgdHJhbnNpdGlvbiBpcyBub3QgYXBwbGllZC5cbiAgICpcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuICB2YXIgZGlzYWJsZWQgPSBmYWxzZTtcbiAgdmFyIFRyYW5zaXRpb24gPSB7XG4gICAgLyoqXG4gICAgICogQ29tcG9zZXMgc3RyaW5nIG9mIHRoZSBDU1MgdHJhbnNpdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICBjb21wb3NlOiBmdW5jdGlvbiBjb21wb3NlKHByb3BlcnR5KSB7XG4gICAgICB2YXIgc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncztcblxuICAgICAgaWYgKCFkaXNhYmxlZCkge1xuICAgICAgICByZXR1cm4gXCJcIi5jb25jYXQocHJvcGVydHksIFwiIFwiKS5jb25jYXQodGhpcy5kdXJhdGlvbiwgXCJtcyBcIikuY29uY2F0KHNldHRpbmdzLmFuaW1hdGlvblRpbWluZ0Z1bmMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gXCJcIi5jb25jYXQocHJvcGVydHksIFwiIDBtcyBcIikuY29uY2F0KHNldHRpbmdzLmFuaW1hdGlvblRpbWluZ0Z1bmMpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHZhbHVlIG9mIHRyYW5zaXRpb24gb24gSFRNTCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmc9fSBwcm9wZXJ0eVxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQoKSB7XG4gICAgICB2YXIgcHJvcGVydHkgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICd0cmFuc2Zvcm0nO1xuICAgICAgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuc3R5bGUudHJhbnNpdGlvbiA9IHRoaXMuY29tcG9zZShwcm9wZXJ0eSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdmFsdWUgb2YgdHJhbnNpdGlvbiBmcm9tIEhUTUwgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS50cmFuc2l0aW9uID0gJyc7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJ1bnMgY2FsbGJhY2sgYWZ0ZXIgYW5pbWF0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBhZnRlcjogZnVuY3Rpb24gYWZ0ZXIoY2FsbGJhY2spIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfSwgdGhpcy5kdXJhdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuYWJsZSB0cmFuc2l0aW9uLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBlbmFibGU6IGZ1bmN0aW9uIGVuYWJsZSgpIHtcbiAgICAgIGRpc2FibGVkID0gZmFsc2U7XG4gICAgICB0aGlzLnNldCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXNhYmxlIHRyYW5zaXRpb24uXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGRpc2FibGU6IGZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgICB0aGlzLnNldCgpO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lKFRyYW5zaXRpb24sICdkdXJhdGlvbicsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIGR1cmF0aW9uIG9mIHRoZSB0cmFuc2l0aW9uIGJhc2VkXG4gICAgICogb24gY3VycmVudGx5IHJ1bm5pbmcgYW5pbWF0aW9uIHR5cGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncztcblxuICAgICAgaWYgKEdsaWRlLmlzVHlwZSgnc2xpZGVyJykgJiYgQ29tcG9uZW50cy5SdW4ub2Zmc2V0KSB7XG4gICAgICAgIHJldHVybiBzZXR0aW5ncy5yZXdpbmREdXJhdGlvbjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNldHRpbmdzLmFuaW1hdGlvbkR1cmF0aW9uO1xuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBTZXQgdHJhbnNpdGlvbiBgc3R5bGVgIHZhbHVlOlxuICAgKiAtIG9uIGVhY2ggbW92aW5nLCBiZWNhdXNlIGl0IG1heSBiZSBjbGVhcmVkIGJ5IG9mZnNldCBtb3ZlXG4gICAqL1xuXG4gIEV2ZW50cy5vbignbW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBUcmFuc2l0aW9uLnNldCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIERpc2FibGUgdHJhbnNpdGlvbjpcbiAgICogLSBiZWZvcmUgaW5pdGlhbCBidWlsZCB0byBhdm9pZCB0cmFuc2l0aW9uaW5nIGZyb20gYDBgIHRvIGBzdGFydEF0YCBpbmRleFxuICAgKiAtIHdoaWxlIHJlc2l6aW5nIHdpbmRvdyBhbmQgcmVjYWxjdWxhdGluZyBkaW1lbnNpb25zXG4gICAqIC0gb24ganVtcGluZyBmcm9tIG9mZnNldCB0cmFuc2l0aW9uIGF0IHN0YXJ0IGFuZCBlbmQgZWRnZXMgaW4gYGNhcm91c2VsYCB0eXBlXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ2J1aWxkLmJlZm9yZScsICdyZXNpemUnLCAndHJhbnNsYXRlLmp1bXAnXSwgZnVuY3Rpb24gKCkge1xuICAgIFRyYW5zaXRpb24uZGlzYWJsZSgpO1xuICB9KTtcbiAgLyoqXG4gICAqIEVuYWJsZSB0cmFuc2l0aW9uOlxuICAgKiAtIG9uIGVhY2ggcnVubmluZywgYmVjYXVzZSBpdCBtYXkgYmUgZGlzYWJsZWQgYnkgb2Zmc2V0IG1vdmVcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdydW4nLCBmdW5jdGlvbiAoKSB7XG4gICAgVHJhbnNpdGlvbi5lbmFibGUoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBSZW1vdmUgdHJhbnNpdGlvbjpcbiAgICogLSBvbiBkZXN0cm95aW5nIHRvIGJyaW5nIG1hcmt1cCB0byBpdHMgaW5pdGFsIHN0YXRlXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBUcmFuc2l0aW9uLnJlbW92ZSgpO1xuICB9KTtcbiAgcmV0dXJuIFRyYW5zaXRpb247XG59XG5cbi8qKlxuICogVGVzdCB2aWEgYSBnZXR0ZXIgaW4gdGhlIG9wdGlvbnMgb2JqZWN0IHRvIHNlZVxuICogaWYgdGhlIHBhc3NpdmUgcHJvcGVydHkgaXMgYWNjZXNzZWQuXG4gKlxuICogQHNlZSBodHRwczovL2dpdGh1Yi5jb20vV0lDRy9FdmVudExpc3RlbmVyT3B0aW9ucy9ibG9iL2doLXBhZ2VzL2V4cGxhaW5lci5tZCNmZWF0dXJlLWRldGVjdGlvblxuICovXG52YXIgc3VwcG9ydHNQYXNzaXZlID0gZmFsc2U7XG5cbnRyeSB7XG4gIHZhciBvcHRzID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAncGFzc2l2ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHN1cHBvcnRzUGFzc2l2ZSA9IHRydWU7XG4gICAgfVxuICB9KTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3RQYXNzaXZlJywgbnVsbCwgb3B0cyk7XG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0ZXN0UGFzc2l2ZScsIG51bGwsIG9wdHMpO1xufSBjYXRjaCAoZSkge31cblxudmFyIHN1cHBvcnRzUGFzc2l2ZSQxID0gc3VwcG9ydHNQYXNzaXZlO1xuXG52YXIgU1RBUlRfRVZFTlRTID0gWyd0b3VjaHN0YXJ0JywgJ21vdXNlZG93biddO1xudmFyIE1PVkVfRVZFTlRTID0gWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ107XG52YXIgRU5EX0VWRU5UUyA9IFsndG91Y2hlbmQnLCAndG91Y2hjYW5jZWwnLCAnbW91c2V1cCcsICdtb3VzZWxlYXZlJ107XG52YXIgTU9VU0VfRVZFTlRTID0gWydtb3VzZWRvd24nLCAnbW91c2Vtb3ZlJywgJ21vdXNldXAnLCAnbW91c2VsZWF2ZSddO1xuZnVuY3Rpb24gU3dpcGUgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgLyoqXG4gICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAqXG4gICAqIEB0eXBlIHtFdmVudHNCaW5kZXJ9XG4gICAqL1xuICB2YXIgQmluZGVyID0gbmV3IEV2ZW50c0JpbmRlcigpO1xuICB2YXIgc3dpcGVTaW4gPSAwO1xuICB2YXIgc3dpcGVTdGFydFggPSAwO1xuICB2YXIgc3dpcGVTdGFydFkgPSAwO1xuICB2YXIgZGlzYWJsZWQgPSBmYWxzZTtcbiAgdmFyIGNhcHR1cmUgPSBzdXBwb3J0c1Bhc3NpdmUkMSA/IHtcbiAgICBwYXNzaXZlOiB0cnVlXG4gIH0gOiBmYWxzZTtcbiAgdmFyIFN3aXBlID0ge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHN3aXBlIGJpbmRpbmdzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICB0aGlzLmJpbmRTd2lwZVN0YXJ0KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXIgZm9yIGBzd2lwZXN0YXJ0YCBldmVudC4gQ2FsY3VsYXRlcyBlbnRyeSBwb2ludHMgb2YgdGhlIHVzZXIncyB0YXAuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHN0YXJ0OiBmdW5jdGlvbiBzdGFydChldmVudCkge1xuICAgICAgaWYgKCFkaXNhYmxlZCAmJiAhR2xpZGUuZGlzYWJsZWQpIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlKCk7XG4gICAgICAgIHZhciBzd2lwZSA9IHRoaXMudG91Y2hlcyhldmVudCk7XG4gICAgICAgIHN3aXBlU2luID0gbnVsbDtcbiAgICAgICAgc3dpcGVTdGFydFggPSB0b0ludChzd2lwZS5wYWdlWCk7XG4gICAgICAgIHN3aXBlU3RhcnRZID0gdG9JbnQoc3dpcGUucGFnZVkpO1xuICAgICAgICB0aGlzLmJpbmRTd2lwZU1vdmUoKTtcbiAgICAgICAgdGhpcy5iaW5kU3dpcGVFbmQoKTtcbiAgICAgICAgRXZlbnRzLmVtaXQoJ3N3aXBlLnN0YXJ0Jyk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXIgZm9yIGBzd2lwZW1vdmVgIGV2ZW50LiBDYWxjdWxhdGVzIHVzZXIncyB0YXAgYW5nbGUgYW5kIGRpc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gICAgICovXG4gICAgbW92ZTogZnVuY3Rpb24gbW92ZShldmVudCkge1xuICAgICAgaWYgKCFHbGlkZS5kaXNhYmxlZCkge1xuICAgICAgICB2YXIgX0dsaWRlJHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3MsXG4gICAgICAgICAgICB0b3VjaEFuZ2xlID0gX0dsaWRlJHNldHRpbmdzLnRvdWNoQW5nbGUsXG4gICAgICAgICAgICB0b3VjaFJhdGlvID0gX0dsaWRlJHNldHRpbmdzLnRvdWNoUmF0aW8sXG4gICAgICAgICAgICBjbGFzc2VzID0gX0dsaWRlJHNldHRpbmdzLmNsYXNzZXM7XG4gICAgICAgIHZhciBzd2lwZSA9IHRoaXMudG91Y2hlcyhldmVudCk7XG4gICAgICAgIHZhciBzdWJFeFN4ID0gdG9JbnQoc3dpcGUucGFnZVgpIC0gc3dpcGVTdGFydFg7XG4gICAgICAgIHZhciBzdWJFeVN5ID0gdG9JbnQoc3dpcGUucGFnZVkpIC0gc3dpcGVTdGFydFk7XG4gICAgICAgIHZhciBwb3dFWCA9IE1hdGguYWJzKHN1YkV4U3ggPDwgMik7XG4gICAgICAgIHZhciBwb3dFWSA9IE1hdGguYWJzKHN1YkV5U3kgPDwgMik7XG4gICAgICAgIHZhciBzd2lwZUh5cG90ZW51c2UgPSBNYXRoLnNxcnQocG93RVggKyBwb3dFWSk7XG4gICAgICAgIHZhciBzd2lwZUNhdGhldHVzID0gTWF0aC5zcXJ0KHBvd0VZKTtcbiAgICAgICAgc3dpcGVTaW4gPSBNYXRoLmFzaW4oc3dpcGVDYXRoZXR1cyAvIHN3aXBlSHlwb3RlbnVzZSk7XG5cbiAgICAgICAgaWYgKHN3aXBlU2luICogMTgwIC8gTWF0aC5QSSA8IHRvdWNoQW5nbGUpIHtcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBDb21wb25lbnRzLk1vdmUubWFrZShzdWJFeFN4ICogdG9GbG9hdCh0b3VjaFJhdGlvKSk7XG4gICAgICAgICAgQ29tcG9uZW50cy5IdG1sLnJvb3QuY2xhc3NMaXN0LmFkZChjbGFzc2VzLmRyYWdnaW5nKTtcbiAgICAgICAgICBFdmVudHMuZW1pdCgnc3dpcGUubW92ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVyIGZvciBgc3dpcGVlbmRgIGV2ZW50LiBGaW5pdGlhbGl6ZXMgdXNlcidzIHRhcCBhbmQgZGVjaWRlcyBhYm91dCBnbGlkZSBtb3ZlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBlbmQ6IGZ1bmN0aW9uIGVuZChldmVudCkge1xuICAgICAgaWYgKCFHbGlkZS5kaXNhYmxlZCkge1xuICAgICAgICB2YXIgX0dsaWRlJHNldHRpbmdzMiA9IEdsaWRlLnNldHRpbmdzLFxuICAgICAgICAgICAgcGVyU3dpcGUgPSBfR2xpZGUkc2V0dGluZ3MyLnBlclN3aXBlLFxuICAgICAgICAgICAgdG91Y2hBbmdsZSA9IF9HbGlkZSRzZXR0aW5nczIudG91Y2hBbmdsZSxcbiAgICAgICAgICAgIGNsYXNzZXMgPSBfR2xpZGUkc2V0dGluZ3MyLmNsYXNzZXM7XG4gICAgICAgIHZhciBzd2lwZSA9IHRoaXMudG91Y2hlcyhldmVudCk7XG4gICAgICAgIHZhciB0aHJlc2hvbGQgPSB0aGlzLnRocmVzaG9sZChldmVudCk7XG4gICAgICAgIHZhciBzd2lwZURpc3RhbmNlID0gc3dpcGUucGFnZVggLSBzd2lwZVN0YXJ0WDtcbiAgICAgICAgdmFyIHN3aXBlRGVnID0gc3dpcGVTaW4gKiAxODAgLyBNYXRoLlBJO1xuICAgICAgICB0aGlzLmVuYWJsZSgpO1xuXG4gICAgICAgIGlmIChzd2lwZURpc3RhbmNlID4gdGhyZXNob2xkICYmIHN3aXBlRGVnIDwgdG91Y2hBbmdsZSkge1xuICAgICAgICAgIENvbXBvbmVudHMuUnVuLm1ha2UoQ29tcG9uZW50cy5EaXJlY3Rpb24ucmVzb2x2ZShcIlwiLmNvbmNhdChwZXJTd2lwZSwgXCI8XCIpKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3dpcGVEaXN0YW5jZSA8IC10aHJlc2hvbGQgJiYgc3dpcGVEZWcgPCB0b3VjaEFuZ2xlKSB7XG4gICAgICAgICAgQ29tcG9uZW50cy5SdW4ubWFrZShDb21wb25lbnRzLkRpcmVjdGlvbi5yZXNvbHZlKFwiXCIuY29uY2F0KHBlclN3aXBlLCBcIj5cIikpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBXaGlsZSBzd2lwZSBkb24ndCByZWFjaCBkaXN0YW5jZSBhcHBseSBwcmV2aW91cyB0cmFuc2Zvcm0uXG4gICAgICAgICAgQ29tcG9uZW50cy5Nb3ZlLm1ha2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIENvbXBvbmVudHMuSHRtbC5yb290LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3Nlcy5kcmFnZ2luZyk7XG4gICAgICAgIHRoaXMudW5iaW5kU3dpcGVNb3ZlKCk7XG4gICAgICAgIHRoaXMudW5iaW5kU3dpcGVFbmQoKTtcbiAgICAgICAgRXZlbnRzLmVtaXQoJ3N3aXBlLmVuZCcpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kcyBzd2lwZSdzIHN0YXJ0aW5nIGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBiaW5kU3dpcGVTdGFydDogZnVuY3Rpb24gYmluZFN3aXBlU3RhcnQoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgX0dsaWRlJHNldHRpbmdzMyA9IEdsaWRlLnNldHRpbmdzLFxuICAgICAgICAgIHN3aXBlVGhyZXNob2xkID0gX0dsaWRlJHNldHRpbmdzMy5zd2lwZVRocmVzaG9sZCxcbiAgICAgICAgICBkcmFnVGhyZXNob2xkID0gX0dsaWRlJHNldHRpbmdzMy5kcmFnVGhyZXNob2xkO1xuXG4gICAgICBpZiAoc3dpcGVUaHJlc2hvbGQpIHtcbiAgICAgICAgQmluZGVyLm9uKFNUQVJUX0VWRU5UU1swXSwgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIF90aGlzLnN0YXJ0KGV2ZW50KTtcbiAgICAgICAgfSwgY2FwdHVyZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkcmFnVGhyZXNob2xkKSB7XG4gICAgICAgIEJpbmRlci5vbihTVEFSVF9FVkVOVFNbMV0sIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBfdGhpcy5zdGFydChldmVudCk7XG4gICAgICAgIH0sIGNhcHR1cmUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmRzIHN3aXBlJ3Mgc3RhcnRpbmcgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHVuYmluZFN3aXBlU3RhcnQ6IGZ1bmN0aW9uIHVuYmluZFN3aXBlU3RhcnQoKSB7XG4gICAgICBCaW5kZXIub2ZmKFNUQVJUX0VWRU5UU1swXSwgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIsIGNhcHR1cmUpO1xuICAgICAgQmluZGVyLm9mZihTVEFSVF9FVkVOVFNbMV0sIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCBjYXB0dXJlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZHMgc3dpcGUncyBtb3ZpbmcgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGJpbmRTd2lwZU1vdmU6IGZ1bmN0aW9uIGJpbmRTd2lwZU1vdmUoKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgQmluZGVyLm9uKE1PVkVfRVZFTlRTLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgdGhyb3R0bGUoZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIF90aGlzMi5tb3ZlKGV2ZW50KTtcbiAgICAgIH0sIEdsaWRlLnNldHRpbmdzLnRocm90dGxlKSwgY2FwdHVyZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZHMgc3dpcGUncyBtb3ZpbmcgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHVuYmluZFN3aXBlTW92ZTogZnVuY3Rpb24gdW5iaW5kU3dpcGVNb3ZlKCkge1xuICAgICAgQmluZGVyLm9mZihNT1ZFX0VWRU5UUywgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIsIGNhcHR1cmUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kcyBzd2lwZSdzIGVuZGluZyBldmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYmluZFN3aXBlRW5kOiBmdW5jdGlvbiBiaW5kU3dpcGVFbmQoKSB7XG4gICAgICB2YXIgX3RoaXMzID0gdGhpcztcblxuICAgICAgQmluZGVyLm9uKEVORF9FVkVOVFMsIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgX3RoaXMzLmVuZChldmVudCk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kcyBzd2lwZSdzIGVuZGluZyBldmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgdW5iaW5kU3dpcGVFbmQ6IGZ1bmN0aW9uIHVuYmluZFN3aXBlRW5kKCkge1xuICAgICAgQmluZGVyLm9mZihFTkRfRVZFTlRTLCBDb21wb25lbnRzLkh0bWwud3JhcHBlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE5vcm1hbGl6ZXMgZXZlbnQgdG91Y2hlcyBwb2ludHMgYWNjb3J0aW5nIHRvIGRpZmZlcmVudCB0eXBlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICAgICAqL1xuICAgIHRvdWNoZXM6IGZ1bmN0aW9uIHRvdWNoZXMoZXZlbnQpIHtcbiAgICAgIGlmIChNT1VTRV9FVkVOVFMuaW5kZXhPZihldmVudC50eXBlKSA+IC0xKSB7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGV2ZW50LnRvdWNoZXNbMF0gfHwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldHMgdmFsdWUgb2YgbWluaW11bSBzd2lwZSBkaXN0YW5jZSBzZXR0aW5ncyBiYXNlZCBvbiBldmVudCB0eXBlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRocmVzaG9sZDogZnVuY3Rpb24gdGhyZXNob2xkKGV2ZW50KSB7XG4gICAgICB2YXIgc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncztcblxuICAgICAgaWYgKE1PVVNFX0VWRU5UUy5pbmRleE9mKGV2ZW50LnR5cGUpID4gLTEpIHtcbiAgICAgICAgcmV0dXJuIHNldHRpbmdzLmRyYWdUaHJlc2hvbGQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZXR0aW5ncy5zd2lwZVRocmVzaG9sZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyBzd2lwZSBldmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3NlbGZ9XG4gICAgICovXG4gICAgZW5hYmxlOiBmdW5jdGlvbiBlbmFibGUoKSB7XG4gICAgICBkaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgQ29tcG9uZW50cy5UcmFuc2l0aW9uLmVuYWJsZSgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERpc2FibGVzIHN3aXBlIGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7c2VsZn1cbiAgICAgKi9cbiAgICBkaXNhYmxlOiBmdW5jdGlvbiBkaXNhYmxlKCkge1xuICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgQ29tcG9uZW50cy5UcmFuc2l0aW9uLmRpc2FibGUoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIEFkZCBjb21wb25lbnQgY2xhc3M6XG4gICAqIC0gYWZ0ZXIgaW5pdGlhbCBidWlsZGluZ1xuICAgKi9cblxuICBFdmVudHMub24oJ2J1aWxkLmFmdGVyJywgZnVuY3Rpb24gKCkge1xuICAgIENvbXBvbmVudHMuSHRtbC5yb290LmNsYXNzTGlzdC5hZGQoR2xpZGUuc2V0dGluZ3MuY2xhc3Nlcy5zd2lwZWFibGUpO1xuICB9KTtcbiAgLyoqXG4gICAqIFJlbW92ZSBzd2lwaW5nIGJpbmRpbmdzOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIHJlbW92ZSBhZGRlZCBFdmVudExpc3RlbmVyc1xuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgU3dpcGUudW5iaW5kU3dpcGVTdGFydCgpO1xuICAgIFN3aXBlLnVuYmluZFN3aXBlTW92ZSgpO1xuICAgIFN3aXBlLnVuYmluZFN3aXBlRW5kKCk7XG4gICAgQmluZGVyLmRlc3Ryb3koKTtcbiAgfSk7XG4gIHJldHVybiBTd2lwZTtcbn1cblxuZnVuY3Rpb24gSW1hZ2VzIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIC8qKlxuICAgKiBJbnN0YW5jZSBvZiB0aGUgYmluZGVyIGZvciBET00gRXZlbnRzLlxuICAgKlxuICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgKi9cbiAgdmFyIEJpbmRlciA9IG5ldyBFdmVudHNCaW5kZXIoKTtcbiAgdmFyIEltYWdlcyA9IHtcbiAgICAvKipcbiAgICAgKiBCaW5kcyBsaXN0ZW5lciB0byBnbGlkZSB3cmFwcGVyLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICB0aGlzLmJpbmQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZHMgYGRyYWdzdGFydGAgZXZlbnQgb24gd3JhcHBlciB0byBwcmV2ZW50IGRyYWdnaW5nIGltYWdlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAgIEJpbmRlci5vbignZHJhZ3N0YXJ0JywgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIsIHRoaXMuZHJhZ3N0YXJ0KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kcyBgZHJhZ3N0YXJ0YCBldmVudCBvbiB3cmFwcGVyLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICAgIEJpbmRlci5vZmYoJ2RyYWdzdGFydCcsIENvbXBvbmVudHMuSHRtbC53cmFwcGVyKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXZlbnQgaGFuZGxlci4gUHJldmVudHMgZHJhZ2dpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGRyYWdzdGFydDogZnVuY3Rpb24gZHJhZ3N0YXJ0KGV2ZW50KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIFJlbW92ZSBiaW5kaW5ncyBmcm9tIGltYWdlczpcbiAgICogLSBvbiBkZXN0cm95aW5nLCB0byByZW1vdmUgYWRkZWQgRXZlbnRMaXN0ZW5lcnNcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIEltYWdlcy51bmJpbmQoKTtcbiAgICBCaW5kZXIuZGVzdHJveSgpO1xuICB9KTtcbiAgcmV0dXJuIEltYWdlcztcbn1cblxuZnVuY3Rpb24gQW5jaG9ycyAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIGJpbmRlciBmb3IgRE9NIEV2ZW50cy5cbiAgICpcbiAgICogQHR5cGUge0V2ZW50c0JpbmRlcn1cbiAgICovXG4gIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG4gIC8qKlxuICAgKiBIb2xkcyBkZXRhY2hpbmcgc3RhdHVzIG9mIGFuY2hvcnMuXG4gICAqIFByZXZlbnRzIGRldGFjaGluZyBvZiBhbHJlYWR5IGRldGFjaGVkIGFuY2hvcnMuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cblxuICB2YXIgZGV0YWNoZWQgPSBmYWxzZTtcbiAgLyoqXG4gICAqIEhvbGRzIHByZXZlbnRpbmcgc3RhdHVzIG9mIGFuY2hvcnMuXG4gICAqIElmIGB0cnVlYCByZWRpcmVjdGlvbiBhZnRlciBjbGljayB3aWxsIGJlIGRpc2FibGVkLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG5cbiAgdmFyIHByZXZlbnRlZCA9IGZhbHNlO1xuICB2YXIgQW5jaG9ycyA9IHtcbiAgICAvKipcbiAgICAgKiBTZXR1cHMgYSBpbml0aWFsIHN0YXRlIG9mIGFuY2hvcnMgY29tcG9uZW50LlxuICAgICAqXG4gICAgICogQHJldHVybnMge1ZvaWR9XG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgLyoqXG4gICAgICAgKiBIb2xkcyBjb2xsZWN0aW9uIG9mIGFuY2hvcnMgZWxlbWVudHMuXG4gICAgICAgKlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEB0eXBlIHtIVE1MQ29sbGVjdGlvbn1cbiAgICAgICAqL1xuICAgICAgdGhpcy5fYSA9IENvbXBvbmVudHMuSHRtbC53cmFwcGVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2EnKTtcbiAgICAgIHRoaXMuYmluZCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCaW5kcyBldmVudHMgdG8gYW5jaG9ycyBpbnNpZGUgYSB0cmFjay5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAgIEJpbmRlci5vbignY2xpY2snLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgdGhpcy5jbGljayk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZHMgZXZlbnRzIGF0dGFjaGVkIHRvIGFuY2hvcnMgaW5zaWRlIGEgdHJhY2suXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgICAgQmluZGVyLm9mZignY2xpY2snLCBDb21wb25lbnRzLkh0bWwud3JhcHBlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXIgZm9yIGNsaWNrIGV2ZW50LiBQcmV2ZW50cyBjbGlja3Mgd2hlbiBnbGlkZSBpcyBpbiBgcHJldmVudGAgc3RhdHVzLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBldmVudFxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgY2xpY2s6IGZ1bmN0aW9uIGNsaWNrKGV2ZW50KSB7XG4gICAgICBpZiAocHJldmVudGVkKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZXRhY2hlcyBhbmNob3JzIGNsaWNrIGV2ZW50IGluc2lkZSBnbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3NlbGZ9XG4gICAgICovXG4gICAgZGV0YWNoOiBmdW5jdGlvbiBkZXRhY2goKSB7XG4gICAgICBwcmV2ZW50ZWQgPSB0cnVlO1xuXG4gICAgICBpZiAoIWRldGFjaGVkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRoaXMuaXRlbXNbaV0uZHJhZ2dhYmxlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBkZXRhY2hlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2hlcyBhbmNob3JzIGNsaWNrIGV2ZW50cyBpbnNpZGUgZ2xpZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAqL1xuICAgIGF0dGFjaDogZnVuY3Rpb24gYXR0YWNoKCkge1xuICAgICAgcHJldmVudGVkID0gZmFsc2U7XG5cbiAgICAgIGlmIChkZXRhY2hlZCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLml0ZW1zW2ldLmRyYWdnYWJsZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBkZXRhY2hlZCA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIGRlZmluZShBbmNob3JzLCAnaXRlbXMnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBjb2xsZWN0aW9uIG9mIHRoZSBhcnJvd3MgSFRNTCBlbGVtZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50W119XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gQW5jaG9ycy5fYTtcbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogRGV0YWNoIGFuY2hvcnMgaW5zaWRlIHNsaWRlczpcbiAgICogLSBvbiBzd2lwaW5nLCBzbyB0aGV5IHdvbid0IHJlZGlyZWN0IHRvIGl0cyBgaHJlZmAgYXR0cmlidXRlc1xuICAgKi9cblxuICBFdmVudHMub24oJ3N3aXBlLm1vdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgQW5jaG9ycy5kZXRhY2goKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBBdHRhY2ggYW5jaG9ycyBpbnNpZGUgc2xpZGVzOlxuICAgKiAtIGFmdGVyIHN3aXBpbmcgYW5kIHRyYW5zaXRpb25zIGVuZHMsIHNvIHRoZXkgY2FuIHJlZGlyZWN0IGFmdGVyIGNsaWNrIGFnYWluXG4gICAqL1xuXG4gIEV2ZW50cy5vbignc3dpcGUuZW5kJywgZnVuY3Rpb24gKCkge1xuICAgIENvbXBvbmVudHMuVHJhbnNpdGlvbi5hZnRlcihmdW5jdGlvbiAoKSB7XG4gICAgICBBbmNob3JzLmF0dGFjaCgpO1xuICAgIH0pO1xuICB9KTtcbiAgLyoqXG4gICAqIFVuYmluZCBhbmNob3JzIGluc2lkZSBzbGlkZXM6XG4gICAqIC0gb24gZGVzdHJveWluZywgdG8gYnJpbmcgYW5jaG9ycyB0byBpdHMgaW5pdGlhbCBzdGF0ZVxuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgQW5jaG9ycy5hdHRhY2goKTtcbiAgICBBbmNob3JzLnVuYmluZCgpO1xuICAgIEJpbmRlci5kZXN0cm95KCk7XG4gIH0pO1xuICByZXR1cm4gQW5jaG9ycztcbn1cblxudmFyIE5BVl9TRUxFQ1RPUiA9ICdbZGF0YS1nbGlkZS1lbD1cImNvbnRyb2xzW25hdl1cIl0nO1xudmFyIENPTlRST0xTX1NFTEVDVE9SID0gJ1tkYXRhLWdsaWRlLWVsXj1cImNvbnRyb2xzXCJdJztcbnZhciBQUkVWSU9VU19DT05UUk9MU19TRUxFQ1RPUiA9IFwiXCIuY29uY2F0KENPTlRST0xTX1NFTEVDVE9SLCBcIiBbZGF0YS1nbGlkZS1kaXIqPVxcXCI8XFxcIl1cIik7XG52YXIgTkVYVF9DT05UUk9MU19TRUxFQ1RPUiA9IFwiXCIuY29uY2F0KENPTlRST0xTX1NFTEVDVE9SLCBcIiBbZGF0YS1nbGlkZS1kaXIqPVxcXCI+XFxcIl1cIik7XG5mdW5jdGlvbiBDb250cm9scyAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIGJpbmRlciBmb3IgRE9NIEV2ZW50cy5cbiAgICpcbiAgICogQHR5cGUge0V2ZW50c0JpbmRlcn1cbiAgICovXG4gIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG4gIHZhciBjYXB0dXJlID0gc3VwcG9ydHNQYXNzaXZlJDEgPyB7XG4gICAgcGFzc2l2ZTogdHJ1ZVxuICB9IDogZmFsc2U7XG4gIHZhciBDb250cm9scyA9IHtcbiAgICAvKipcbiAgICAgKiBJbml0cyBhcnJvd3MuIEJpbmRzIGV2ZW50cyBsaXN0ZW5lcnNcbiAgICAgKiB0byB0aGUgYXJyb3dzIEhUTUwgZWxlbWVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIC8qKlxuICAgICAgICogQ29sbGVjdGlvbiBvZiBuYXZpZ2F0aW9uIEhUTUwgZWxlbWVudHMuXG4gICAgICAgKlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEB0eXBlIHtIVE1MQ29sbGVjdGlvbn1cbiAgICAgICAqL1xuICAgICAgdGhpcy5fbiA9IENvbXBvbmVudHMuSHRtbC5yb290LnF1ZXJ5U2VsZWN0b3JBbGwoTkFWX1NFTEVDVE9SKTtcbiAgICAgIC8qKlxuICAgICAgICogQ29sbGVjdGlvbiBvZiBjb250cm9scyBIVE1MIGVsZW1lbnRzLlxuICAgICAgICpcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiBAdHlwZSB7SFRNTENvbGxlY3Rpb259XG4gICAgICAgKi9cblxuICAgICAgdGhpcy5fYyA9IENvbXBvbmVudHMuSHRtbC5yb290LnF1ZXJ5U2VsZWN0b3JBbGwoQ09OVFJPTFNfU0VMRUNUT1IpO1xuICAgICAgLyoqXG4gICAgICAgKiBDb2xsZWN0aW9uIG9mIGFycm93IGNvbnRyb2wgSFRNTCBlbGVtZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAqL1xuXG4gICAgICB0aGlzLl9hcnJvd0NvbnRyb2xzID0ge1xuICAgICAgICBwcmV2aW91czogQ29tcG9uZW50cy5IdG1sLnJvb3QucXVlcnlTZWxlY3RvckFsbChQUkVWSU9VU19DT05UUk9MU19TRUxFQ1RPUiksXG4gICAgICAgIG5leHQ6IENvbXBvbmVudHMuSHRtbC5yb290LnF1ZXJ5U2VsZWN0b3JBbGwoTkVYVF9DT05UUk9MU19TRUxFQ1RPUilcbiAgICAgIH07XG4gICAgICB0aGlzLmFkZEJpbmRpbmdzKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgYWN0aXZlIGNsYXNzIHRvIGN1cnJlbnQgc2xpZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHNldEFjdGl2ZTogZnVuY3Rpb24gc2V0QWN0aXZlKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuYWRkQ2xhc3ModGhpcy5fbltpXS5jaGlsZHJlbik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWN0aXZlIGNsYXNzIHRvIGN1cnJlbnQgc2xpZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHJlbW92ZUFjdGl2ZTogZnVuY3Rpb24gcmVtb3ZlQWN0aXZlKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQ2xhc3ModGhpcy5fbltpXS5jaGlsZHJlbik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZXMgYWN0aXZlIGNsYXNzIG9uIGl0ZW1zIGluc2lkZSBuYXZpZ2F0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGNvbnRyb2xzXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBhZGRDbGFzczogZnVuY3Rpb24gYWRkQ2xhc3MoY29udHJvbHMpIHtcbiAgICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuICAgICAgdmFyIGl0ZW0gPSBjb250cm9sc1tHbGlkZS5pbmRleF07XG5cbiAgICAgIGlmICghaXRlbSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZChzZXR0aW5ncy5jbGFzc2VzLm5hdi5hY3RpdmUpO1xuICAgICAgICBzaWJsaW5ncyhpdGVtKS5mb3JFYWNoKGZ1bmN0aW9uIChzaWJsaW5nKSB7XG4gICAgICAgICAgc2libGluZy5jbGFzc0xpc3QucmVtb3ZlKHNldHRpbmdzLmNsYXNzZXMubmF2LmFjdGl2ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFjdGl2ZSBjbGFzcyBmcm9tIGFjdGl2ZSBjb250cm9sLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGNvbnRyb2xzXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmVDbGFzczogZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoY29udHJvbHMpIHtcbiAgICAgIHZhciBpdGVtID0gY29udHJvbHNbR2xpZGUuaW5kZXhdO1xuXG4gICAgICBpZiAoaXRlbSkge1xuICAgICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoR2xpZGUuc2V0dGluZ3MuY2xhc3Nlcy5uYXYuYWN0aXZlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcywgcmVtb3ZlcyBvciBhZGRzIGBHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLmRpc2FibGVkQXJyb3dgIGNsYXNzIG9uIHRoZSBjb250cm9sIGFycm93c1xuICAgICAqL1xuICAgIHNldEFycm93U3RhdGU6IGZ1bmN0aW9uIHNldEFycm93U3RhdGUoKSB7XG4gICAgICBpZiAoR2xpZGUuc2V0dGluZ3MucmV3aW5kKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIG5leHQgPSBDb250cm9scy5fYXJyb3dDb250cm9scy5uZXh0O1xuICAgICAgdmFyIHByZXZpb3VzID0gQ29udHJvbHMuX2Fycm93Q29udHJvbHMucHJldmlvdXM7XG4gICAgICB0aGlzLnJlc2V0QXJyb3dTdGF0ZShuZXh0LCBwcmV2aW91cyk7XG5cbiAgICAgIGlmIChHbGlkZS5pbmRleCA9PT0gMCkge1xuICAgICAgICB0aGlzLmRpc2FibGVBcnJvdyhwcmV2aW91cyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChHbGlkZS5pbmRleCA9PT0gQ29tcG9uZW50cy5SdW4ubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuZGlzYWJsZUFycm93KG5leHQpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGBHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLmRpc2FibGVkQXJyb3dgIGZyb20gZ2l2ZW4gTm9kZUxpc3QgZWxlbWVudHNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Tm9kZUxpc3RbXX0gbGlzdHNcbiAgICAgKi9cbiAgICByZXNldEFycm93U3RhdGU6IGZ1bmN0aW9uIHJlc2V0QXJyb3dTdGF0ZSgpIHtcbiAgICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgbGlzdHMgPSBuZXcgQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGxpc3RzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICBsaXN0cy5mb3JFYWNoKGZ1bmN0aW9uIChsaXN0KSB7XG4gICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShzZXR0aW5ncy5jbGFzc2VzLmFycm93LmRpc2FibGVkKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkcyBgR2xpZGUuc2V0dGluZ3MuY2xhc3Nlcy5kaXNhYmxlZEFycm93YCB0byBnaXZlbiBOb2RlTGlzdCBlbGVtZW50c1xuICAgICAqXG4gICAgICogQHBhcmFtIHtOb2RlTGlzdFtdfSBsaXN0c1xuICAgICAqL1xuICAgIGRpc2FibGVBcnJvdzogZnVuY3Rpb24gZGlzYWJsZUFycm93KCkge1xuICAgICAgdmFyIHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3M7XG5cbiAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgbGlzdHMgPSBuZXcgQXJyYXkoX2xlbjIpLCBfa2V5MiA9IDA7IF9rZXkyIDwgX2xlbjI7IF9rZXkyKyspIHtcbiAgICAgICAgbGlzdHNbX2tleTJdID0gYXJndW1lbnRzW19rZXkyXTtcbiAgICAgIH1cblxuICAgICAgbGlzdHMuZm9yRWFjaChmdW5jdGlvbiAobGlzdCkge1xuICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoc2V0dGluZ3MuY2xhc3Nlcy5hcnJvdy5kaXNhYmxlZCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZHMgaGFuZGxlcyB0byB0aGUgZWFjaCBncm91cCBvZiBjb250cm9scy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYWRkQmluZGluZ3M6IGZ1bmN0aW9uIGFkZEJpbmRpbmdzKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9jLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuYmluZCh0aGlzLl9jW2ldLmNoaWxkcmVuKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBoYW5kbGVzIGZyb20gdGhlIGVhY2ggZ3JvdXAgb2YgY29udHJvbHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHJlbW92ZUJpbmRpbmdzOiBmdW5jdGlvbiByZW1vdmVCaW5kaW5ncygpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnVuYmluZCh0aGlzLl9jW2ldLmNoaWxkcmVuKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZHMgZXZlbnRzIHRvIGFycm93cyBIVE1MIGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MQ29sbGVjdGlvbn0gZWxlbWVudHNcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgQmluZGVyLm9uKCdjbGljaycsIGVsZW1lbnRzW2ldLCB0aGlzLmNsaWNrKTtcbiAgICAgICAgQmluZGVyLm9uKCd0b3VjaHN0YXJ0JywgZWxlbWVudHNbaV0sIHRoaXMuY2xpY2ssIGNhcHR1cmUpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmRzIGV2ZW50cyBiaW5kZWQgdG8gdGhlIGFycm93cyBIVE1MIGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MQ29sbGVjdGlvbn0gZWxlbWVudHNcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIEJpbmRlci5vZmYoWydjbGljaycsICd0b3VjaHN0YXJ0J10sIGVsZW1lbnRzW2ldKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyBgY2xpY2tgIGV2ZW50IG9uIHRoZSBhcnJvd3MgSFRNTCBlbGVtZW50cy5cbiAgICAgKiBNb3ZlcyBzbGlkZXIgaW4gZGlyZWN0aW9uIGdpdmVuIHZpYSB0aGVcbiAgICAgKiBgZGF0YS1nbGlkZS1kaXJgIGF0dHJpYnV0ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgY2xpY2s6IGZ1bmN0aW9uIGNsaWNrKGV2ZW50KSB7XG4gICAgICBpZiAoIXN1cHBvcnRzUGFzc2l2ZSQxICYmIGV2ZW50LnR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuXG4gICAgICB2YXIgZGlyZWN0aW9uID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZ2xpZGUtZGlyJyk7XG4gICAgICBDb21wb25lbnRzLlJ1bi5tYWtlKENvbXBvbmVudHMuRGlyZWN0aW9uLnJlc29sdmUoZGlyZWN0aW9uKSk7XG4gICAgfVxuICB9O1xuICBkZWZpbmUoQ29udHJvbHMsICdpdGVtcycsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIGNvbGxlY3Rpb24gb2YgdGhlIGNvbnRyb2xzIEhUTUwgZWxlbWVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudFtdfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIENvbnRyb2xzLl9jO1xuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBTd2FwIGFjdGl2ZSBjbGFzcyBvZiBjdXJyZW50IG5hdmlnYXRpb24gaXRlbTpcbiAgICogLSBhZnRlciBtb3VudGluZyB0byBzZXQgaXQgdG8gaW5pdGlhbCBpbmRleFxuICAgKiAtIGFmdGVyIGVhY2ggbW92ZSB0byB0aGUgbmV3IGluZGV4XG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ21vdW50LmFmdGVyJywgJ21vdmUuYWZ0ZXInXSwgZnVuY3Rpb24gKCkge1xuICAgIENvbnRyb2xzLnNldEFjdGl2ZSgpO1xuICB9KTtcbiAgLyoqXG4gICAqIEFkZCBvciByZW1vdmUgZGlzYWJsZWQgY2xhc3Mgb2YgYXJyb3cgZWxlbWVudHNcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsnbW91bnQuYWZ0ZXInLCAncnVuJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBDb250cm9scy5zZXRBcnJvd1N0YXRlKCk7XG4gIH0pO1xuICAvKipcbiAgICogUmVtb3ZlIGJpbmRpbmdzIGFuZCBIVE1MIENsYXNzZXM6XG4gICAqIC0gb24gZGVzdHJveWluZywgdG8gYnJpbmcgbWFya3VwIHRvIGl0cyBpbml0aWFsIHN0YXRlXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBDb250cm9scy5yZW1vdmVCaW5kaW5ncygpO1xuICAgIENvbnRyb2xzLnJlbW92ZUFjdGl2ZSgpO1xuICAgIEJpbmRlci5kZXN0cm95KCk7XG4gIH0pO1xuICByZXR1cm4gQ29udHJvbHM7XG59XG5cbmZ1bmN0aW9uIEtleWJvYXJkIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIC8qKlxuICAgKiBJbnN0YW5jZSBvZiB0aGUgYmluZGVyIGZvciBET00gRXZlbnRzLlxuICAgKlxuICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgKi9cbiAgdmFyIEJpbmRlciA9IG5ldyBFdmVudHNCaW5kZXIoKTtcbiAgdmFyIEtleWJvYXJkID0ge1xuICAgIC8qKlxuICAgICAqIEJpbmRzIGtleWJvYXJkIGV2ZW50cyBvbiBjb21wb25lbnQgbW91bnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIGlmIChHbGlkZS5zZXR0aW5ncy5rZXlib2FyZCkge1xuICAgICAgICB0aGlzLmJpbmQoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQWRkcyBrZXlib2FyZCBwcmVzcyBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgICBCaW5kZXIub24oJ2tleXVwJywgZG9jdW1lbnQsIHRoaXMucHJlc3MpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGtleWJvYXJkIHByZXNzIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgICBCaW5kZXIub2ZmKCdrZXl1cCcsIGRvY3VtZW50KTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyBrZXlib2FyZCdzIGFycm93cyBwcmVzcyBhbmQgbW92aW5nIGdsaWRlIGZvd2FyZCBhbmQgYmFja3dhcmQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGV2ZW50XG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBwcmVzczogZnVuY3Rpb24gcHJlc3MoZXZlbnQpIHtcbiAgICAgIHZhciBwZXJTd2lwZSA9IEdsaWRlLnNldHRpbmdzLnBlclN3aXBlO1xuXG4gICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzkpIHtcbiAgICAgICAgQ29tcG9uZW50cy5SdW4ubWFrZShDb21wb25lbnRzLkRpcmVjdGlvbi5yZXNvbHZlKFwiXCIuY29uY2F0KHBlclN3aXBlLCBcIj5cIikpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM3KSB7XG4gICAgICAgIENvbXBvbmVudHMuUnVuLm1ha2UoQ29tcG9uZW50cy5EaXJlY3Rpb24ucmVzb2x2ZShcIlwiLmNvbmNhdChwZXJTd2lwZSwgXCI8XCIpKSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogUmVtb3ZlIGJpbmRpbmdzIGZyb20ga2V5Ym9hcmQ6XG4gICAqIC0gb24gZGVzdHJveWluZyB0byByZW1vdmUgYWRkZWQgZXZlbnRzXG4gICAqIC0gb24gdXBkYXRpbmcgdG8gcmVtb3ZlIGV2ZW50cyBiZWZvcmUgcmVtb3VudGluZ1xuICAgKi9cblxuICBFdmVudHMub24oWydkZXN0cm95JywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgS2V5Ym9hcmQudW5iaW5kKCk7XG4gIH0pO1xuICAvKipcbiAgICogUmVtb3VudCBjb21wb25lbnRcbiAgICogLSBvbiB1cGRhdGluZyB0byByZWZsZWN0IHBvdGVudGlhbCBjaGFuZ2VzIGluIHNldHRpbmdzXG4gICAqL1xuXG4gIEV2ZW50cy5vbigndXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgIEtleWJvYXJkLm1vdW50KCk7XG4gIH0pO1xuICAvKipcbiAgICogRGVzdHJveSBiaW5kZXI6XG4gICAqIC0gb24gZGVzdHJveWluZyB0byByZW1vdmUgbGlzdGVuZXJzXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBCaW5kZXIuZGVzdHJveSgpO1xuICB9KTtcbiAgcmV0dXJuIEtleWJvYXJkO1xufVxuXG5mdW5jdGlvbiBBdXRvcGxheSAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIGJpbmRlciBmb3IgRE9NIEV2ZW50cy5cbiAgICpcbiAgICogQHR5cGUge0V2ZW50c0JpbmRlcn1cbiAgICovXG4gIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG4gIHZhciBBdXRvcGxheSA9IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyBhdXRvcGxheWluZyBhbmQgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICB0aGlzLmVuYWJsZSgpO1xuICAgICAgdGhpcy5zdGFydCgpO1xuXG4gICAgICBpZiAoR2xpZGUuc2V0dGluZ3MuaG92ZXJwYXVzZSkge1xuICAgICAgICB0aGlzLmJpbmQoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW5hYmxlcyBhdXRvcGxheWluZ1xuICAgICAqXG4gICAgICogQHJldHVybnMge1ZvaWR9XG4gICAgICovXG4gICAgZW5hYmxlOiBmdW5jdGlvbiBlbmFibGUoKSB7XG4gICAgICB0aGlzLl9lID0gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGlzYWJsZXMgYXV0b3BsYXlpbmcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Vm9pZH1cbiAgICAgKi9cbiAgICBkaXNhYmxlOiBmdW5jdGlvbiBkaXNhYmxlKCkge1xuICAgICAgdGhpcy5fZSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdGFydHMgYXV0b3BsYXlpbmcgaW4gY29uZmlndXJlZCBpbnRlcnZhbC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbnxOdW1iZXJ9IGZvcmNlIFJ1biBhdXRvcGxheWluZyB3aXRoIHBhc3NlZCBpbnRlcnZhbCByZWdhcmRsZXNzIG9mIGBhdXRvcGxheWAgc2V0dGluZ3NcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHN0YXJ0OiBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGlmICghdGhpcy5fZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZW5hYmxlKCk7XG5cbiAgICAgIGlmIChHbGlkZS5zZXR0aW5ncy5hdXRvcGxheSkge1xuICAgICAgICBpZiAoaXNVbmRlZmluZWQodGhpcy5faSkpIHtcbiAgICAgICAgICB0aGlzLl9pID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMuc3RvcCgpO1xuXG4gICAgICAgICAgICBDb21wb25lbnRzLlJ1bi5tYWtlKCc+Jyk7XG5cbiAgICAgICAgICAgIF90aGlzLnN0YXJ0KCk7XG5cbiAgICAgICAgICAgIEV2ZW50cy5lbWl0KCdhdXRvcGxheScpO1xuICAgICAgICAgIH0sIHRoaXMudGltZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgYXV0b3J1bm5pbmcgb2YgdGhlIGdsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBzdG9wOiBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgdGhpcy5faSA9IGNsZWFySW50ZXJ2YWwodGhpcy5faSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGF1dG9wbGF5aW5nIHdoaWxlIG1vdXNlIGlzIG92ZXIgZ2xpZGUncyBhcmVhLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIEJpbmRlci5vbignbW91c2VvdmVyJywgQ29tcG9uZW50cy5IdG1sLnJvb3QsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKF90aGlzMi5fZSkge1xuICAgICAgICAgIF90aGlzMi5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgQmluZGVyLm9uKCdtb3VzZW91dCcsIENvbXBvbmVudHMuSHRtbC5yb290LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChfdGhpczIuX2UpIHtcbiAgICAgICAgICBfdGhpczIuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZCBtb3VzZW92ZXIgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1ZvaWR9XG4gICAgICovXG4gICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgICBCaW5kZXIub2ZmKFsnbW91c2VvdmVyJywgJ21vdXNlb3V0J10sIENvbXBvbmVudHMuSHRtbC5yb290KTtcbiAgICB9XG4gIH07XG4gIGRlZmluZShBdXRvcGxheSwgJ3RpbWUnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyB0aW1lIHBlcmlvZCB2YWx1ZSBmb3IgdGhlIGF1dG9wbGF5IGludGVydmFsLiBQcmlvcml0aXplc1xuICAgICAqIHRpbWVzIGluIGBkYXRhLWdsaWRlLWF1dG9wbGF5YCBhdHRydWJ1dGVzIG92ZXIgb3B0aW9ucy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBhdXRvcGxheSA9IENvbXBvbmVudHMuSHRtbC5zbGlkZXNbR2xpZGUuaW5kZXhdLmdldEF0dHJpYnV0ZSgnZGF0YS1nbGlkZS1hdXRvcGxheScpO1xuXG4gICAgICBpZiAoYXV0b3BsYXkpIHtcbiAgICAgICAgcmV0dXJuIHRvSW50KGF1dG9wbGF5KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRvSW50KEdsaWRlLnNldHRpbmdzLmF1dG9wbGF5KTtcbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogU3RvcCBhdXRvcGxheWluZyBhbmQgdW5iaW5kIGV2ZW50czpcbiAgICogLSBvbiBkZXN0cm95aW5nLCB0byBjbGVhciBkZWZpbmVkIGludGVydmFsXG4gICAqIC0gb24gdXBkYXRpbmcgdmlhIEFQSSB0byByZXNldCBpbnRlcnZhbCB0aGF0IG1heSBjaGFuZ2VkXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ2Rlc3Ryb3knLCAndXBkYXRlJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBBdXRvcGxheS51bmJpbmQoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBTdG9wIGF1dG9wbGF5aW5nOlxuICAgKiAtIGJlZm9yZSBlYWNoIHJ1biwgdG8gcmVzdGFydCBhdXRvcGxheWluZ1xuICAgKiAtIG9uIHBhdXNpbmcgdmlhIEFQSVxuICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIGNsZWFyIGRlZmluZWQgaW50ZXJ2YWxcbiAgICogLSB3aGlsZSBzdGFydGluZyBhIHN3aXBlXG4gICAqIC0gb24gdXBkYXRpbmcgdmlhIEFQSSB0byByZXNldCBpbnRlcnZhbCB0aGF0IG1heSBjaGFuZ2VkXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ3J1bi5iZWZvcmUnLCAnc3dpcGUuc3RhcnQnLCAndXBkYXRlJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBBdXRvcGxheS5zdG9wKCk7XG4gIH0pO1xuICBFdmVudHMub24oWydwYXVzZScsICdkZXN0cm95J10sIGZ1bmN0aW9uICgpIHtcbiAgICBBdXRvcGxheS5kaXNhYmxlKCk7XG4gICAgQXV0b3BsYXkuc3RvcCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIFN0YXJ0IGF1dG9wbGF5aW5nOlxuICAgKiAtIGFmdGVyIGVhY2ggcnVuLCB0byByZXN0YXJ0IGF1dG9wbGF5aW5nXG4gICAqIC0gb24gcGxheWluZyB2aWEgQVBJXG4gICAqIC0gd2hpbGUgZW5kaW5nIGEgc3dpcGVcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsncnVuLmFmdGVyJywgJ3N3aXBlLmVuZCddLCBmdW5jdGlvbiAoKSB7XG4gICAgQXV0b3BsYXkuc3RhcnQoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBTdGFydCBhdXRvcGxheWluZzpcbiAgICogLSBhZnRlciBlYWNoIHJ1biwgdG8gcmVzdGFydCBhdXRvcGxheWluZ1xuICAgKiAtIG9uIHBsYXlpbmcgdmlhIEFQSVxuICAgKiAtIHdoaWxlIGVuZGluZyBhIHN3aXBlXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ3BsYXknXSwgZnVuY3Rpb24gKCkge1xuICAgIEF1dG9wbGF5LmVuYWJsZSgpO1xuICAgIEF1dG9wbGF5LnN0YXJ0KCk7XG4gIH0pO1xuICAvKipcbiAgICogUmVtb3VudCBhdXRvcGxheWluZzpcbiAgICogLSBvbiB1cGRhdGluZyB2aWEgQVBJIHRvIHJlc2V0IGludGVydmFsIHRoYXQgbWF5IGNoYW5nZWRcbiAgICovXG5cbiAgRXZlbnRzLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgQXV0b3BsYXkubW91bnQoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBEZXN0cm95IGEgYmluZGVyOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcgZ2xpZGUgaW5zdGFuY2UgdG8gY2xlYXJ1cCBsaXN0ZW5lcnNcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIEJpbmRlci5kZXN0cm95KCk7XG4gIH0pO1xuICByZXR1cm4gQXV0b3BsYXk7XG59XG5cbi8qKlxuICogU29ydHMga2V5cyBvZiBicmVha3BvaW50IG9iamVjdCBzbyB0aGV5IHdpbGwgYmUgb3JkZXJlZCBmcm9tIGxvd2VyIHRvIGJpZ2dlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcG9pbnRzXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIHNvcnRCcmVha3BvaW50cyhwb2ludHMpIHtcbiAgaWYgKGlzT2JqZWN0KHBvaW50cykpIHtcbiAgICByZXR1cm4gc29ydEtleXMocG9pbnRzKTtcbiAgfSBlbHNlIHtcbiAgICB3YXJuKFwiQnJlYWtwb2ludHMgb3B0aW9uIG11c3QgYmUgYW4gb2JqZWN0XCIpO1xuICB9XG5cbiAgcmV0dXJuIHt9O1xufVxuXG5mdW5jdGlvbiBCcmVha3BvaW50cyAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIGJpbmRlciBmb3IgRE9NIEV2ZW50cy5cbiAgICpcbiAgICogQHR5cGUge0V2ZW50c0JpbmRlcn1cbiAgICovXG4gIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG4gIC8qKlxuICAgKiBIb2xkcyByZWZlcmVuY2UgdG8gc2V0dGluZ3MuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuICAvKipcbiAgICogSG9sZHMgcmVmZXJlbmNlIHRvIGJyZWFrcG9pbnRzIG9iamVjdCBpbiBzZXR0aW5ncy4gU29ydHMgYnJlYWtwb2ludHNcbiAgICogZnJvbSBzbWFsbGVyIHRvIGxhcmdlci4gSXQgaXMgcmVxdWlyZWQgaW4gb3JkZXIgdG8gcHJvcGVyXG4gICAqIG1hdGNoaW5nIGN1cnJlbnRseSBhY3RpdmUgYnJlYWtwb2ludCBzZXR0aW5ncy5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG5cbiAgdmFyIHBvaW50cyA9IHNvcnRCcmVha3BvaW50cyhzZXR0aW5ncy5icmVha3BvaW50cyk7XG4gIC8qKlxuICAgKiBDYWNoZSBpbml0aWFsIHNldHRpbmdzIGJlZm9yZSBvdmVyd3JpdHRpbmcuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHZhciBkZWZhdWx0cyA9IE9iamVjdC5hc3NpZ24oe30sIHNldHRpbmdzKTtcbiAgdmFyIEJyZWFrcG9pbnRzID0ge1xuICAgIC8qKlxuICAgICAqIE1hdGNoZXMgc2V0dGluZ3MgZm9yIGN1cnJlY3RseSBtYXRjaGluZyBtZWRpYSBicmVha3BvaW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHBvaW50c1xuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgbWF0Y2g6IGZ1bmN0aW9uIG1hdGNoKHBvaW50cykge1xuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cubWF0Y2hNZWRpYSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZm9yICh2YXIgcG9pbnQgaW4gcG9pbnRzKSB7XG4gICAgICAgICAgaWYgKHBvaW50cy5oYXNPd25Qcm9wZXJ0eShwb2ludCkpIHtcbiAgICAgICAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShcIihtYXgtd2lkdGg6IFwiLmNvbmNhdChwb2ludCwgXCJweClcIikpLm1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBvaW50c1twb2ludF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZhdWx0cztcbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBPdmVyd3JpdGUgaW5zdGFuY2Ugc2V0dGluZ3Mgd2l0aCBjdXJyZW50bHkgbWF0Y2hpbmcgYnJlYWtwb2ludCBzZXR0aW5ncy5cbiAgICogVGhpcyBoYXBwZW5zIHJpZ2h0IGFmdGVyIGNvbXBvbmVudCBpbml0aWFsaXphdGlvbi5cbiAgICovXG5cbiAgT2JqZWN0LmFzc2lnbihzZXR0aW5ncywgQnJlYWtwb2ludHMubWF0Y2gocG9pbnRzKSk7XG4gIC8qKlxuICAgKiBVcGRhdGUgZ2xpZGUgd2l0aCBzZXR0aW5ncyBvZiBtYXRjaGVkIGJyZWtwb2ludDpcbiAgICogLSB3aW5kb3cgcmVzaXplIHRvIHVwZGF0ZSBzbGlkZXJcbiAgICovXG5cbiAgQmluZGVyLm9uKCdyZXNpemUnLCB3aW5kb3csIHRocm90dGxlKGZ1bmN0aW9uICgpIHtcbiAgICBHbGlkZS5zZXR0aW5ncyA9IG1lcmdlT3B0aW9ucyhzZXR0aW5ncywgQnJlYWtwb2ludHMubWF0Y2gocG9pbnRzKSk7XG4gIH0sIEdsaWRlLnNldHRpbmdzLnRocm90dGxlKSk7XG4gIC8qKlxuICAgKiBSZXNvcnQgYW5kIHVwZGF0ZSBkZWZhdWx0IHNldHRpbmdzOlxuICAgKiAtIG9uIHJlaW5pdCB2aWEgQVBJLCBzbyBicmVha3BvaW50IG1hdGNoaW5nIHdpbGwgYmUgcGVyZm9ybWVkIHdpdGggb3B0aW9uc1xuICAgKi9cblxuICBFdmVudHMub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBwb2ludHMgPSBzb3J0QnJlYWtwb2ludHMocG9pbnRzKTtcbiAgICBkZWZhdWx0cyA9IE9iamVjdC5hc3NpZ24oe30sIHNldHRpbmdzKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBVbmJpbmQgcmVzaXplIGxpc3RlbmVyOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIGJyaW5nIG1hcmt1cCB0byBpdHMgaW5pdGlhbCBzdGF0ZVxuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgQmluZGVyLm9mZigncmVzaXplJywgd2luZG93KTtcbiAgfSk7XG4gIHJldHVybiBCcmVha3BvaW50cztcbn1cblxudmFyIENPTVBPTkVOVFMgPSB7XG4gIC8vIFJlcXVpcmVkXG4gIEh0bWw6IEh0bWwsXG4gIFRyYW5zbGF0ZTogVHJhbnNsYXRlLFxuICBUcmFuc2l0aW9uOiBUcmFuc2l0aW9uLFxuICBEaXJlY3Rpb246IERpcmVjdGlvbixcbiAgUGVlazogUGVlayxcbiAgU2l6ZXM6IFNpemVzLFxuICBHYXBzOiBHYXBzLFxuICBNb3ZlOiBNb3ZlLFxuICBDbG9uZXM6IENsb25lcyxcbiAgUmVzaXplOiBSZXNpemUsXG4gIEJ1aWxkOiBCdWlsZCxcbiAgUnVuOiBSdW4sXG4gIC8vIE9wdGlvbmFsXG4gIFN3aXBlOiBTd2lwZSxcbiAgSW1hZ2VzOiBJbWFnZXMsXG4gIEFuY2hvcnM6IEFuY2hvcnMsXG4gIENvbnRyb2xzOiBDb250cm9scyxcbiAgS2V5Ym9hcmQ6IEtleWJvYXJkLFxuICBBdXRvcGxheTogQXV0b3BsYXksXG4gIEJyZWFrcG9pbnRzOiBCcmVha3BvaW50c1xufTtcblxudmFyIEdsaWRlID0gLyojX19QVVJFX18qL2Z1bmN0aW9uIChfQ29yZSkge1xuICBfaW5oZXJpdHMoR2xpZGUsIF9Db3JlKTtcblxuICB2YXIgX3N1cGVyID0gX2NyZWF0ZVN1cGVyKEdsaWRlKTtcblxuICBmdW5jdGlvbiBHbGlkZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgR2xpZGUpO1xuXG4gICAgcmV0dXJuIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKEdsaWRlLCBbe1xuICAgIGtleTogXCJtb3VudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIHZhciBleHRlbnNpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIHJldHVybiBfZ2V0KF9nZXRQcm90b3R5cGVPZihHbGlkZS5wcm90b3R5cGUpLCBcIm1vdW50XCIsIHRoaXMpLmNhbGwodGhpcywgT2JqZWN0LmFzc2lnbih7fSwgQ09NUE9ORU5UUywgZXh0ZW5zaW9ucykpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBHbGlkZTtcbn0oR2xpZGUkMSk7XG5cbmV4cG9ydCB7IEdsaWRlIGFzIGRlZmF1bHQgfTtcbiIsImNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdzeW5jLXAnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNoZWNrRXhpdCAoY2IsIGNvbmZpZyA9IHt9KSB7XG4gIGNvbnN0IGNhbGxiYWNrID0gY2IgfHwgZnVuY3Rpb24gKCkge31cbiAgY29uc3Qgc2Vuc2l0aXZpdHkgPSBjb25maWcuc2Vuc2l0aXZpdHkgfHwgMjBcbiAgY29uc3QgdGltZXIgPSBjb25maWcudGltZXIgfHwgMTAwMFxuICBjb25zdCBkZWxheSA9IGNvbmZpZy5kZWxheSB8fCAwXG4gIGNvbnN0IHZpZXdwb3J0ID0gY29uZmlnLnZpZXdwb3J0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuICBjb25zdCBkZWJ1ZyA9IGNvbmZpZy5kZWJ1ZyB8fCBmYWxzZVxuXG4gIGxldCBkZWxheVRpbWVyXG4gIGxldCBsaXN0ZW5lclRpbWVvdXRcbiAgbGV0IGRpc2FibGVLZXlkb3duID0gZmFsc2VcbiAgbGV0IGF0dGFjaGVkTGlzdGVuZXJzID0gZmFsc2VcblxuICBmdW5jdGlvbiBpbml0ICgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKCdjaGVja0V4aXQgLSBJbml0JylcbiAgICAgIGxpc3RlbmVyVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBhdHRhY2hFdmVudExpc3RlbmVycygpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSwgdGltZXIpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFudXAgKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmIChkZWJ1ZykgY29uc29sZS5sb2coJ2NoZWNrRXhpdCAtIENsZWFudXAnKVxuICAgICAgY2xlYXJUaW1lb3V0KGxpc3RlbmVyVGltZW91dClcbiAgICAgIGlmIChhdHRhY2hlZExpc3RlbmVycykge1xuICAgICAgICB2aWV3cG9ydC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgaGFuZGxlTW91c2VsZWF2ZSlcbiAgICAgICAgdmlld3BvcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIGhhbmRsZU1vdXNlZW50ZXIpXG4gICAgICAgIHZpZXdwb3J0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVLZXlkb3duKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmUoKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBmaXJlICgpIHtcbiAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKCdjaGVja0V4aXQgLSBGaXJlJylcbiAgICBjYWxsYmFjaygpXG4gICAgY2xlYW51cCgpXG4gIH1cblxuICBmdW5jdGlvbiBhdHRhY2hFdmVudExpc3RlbmVycyAoKSB7XG4gICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnY2hlY2tFeGl0IC0gQXR0YWNoZWQgbGlzdGVuZXJzJylcbiAgICB2aWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgaGFuZGxlTW91c2VsZWF2ZSlcbiAgICB2aWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgaGFuZGxlTW91c2VlbnRlcilcbiAgICB2aWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5ZG93bilcbiAgICBhdHRhY2hlZExpc3RlbmVycyA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlbGVhdmUgKGUpIHtcbiAgICBpZiAoZS5jbGllbnRZID4gc2Vuc2l0aXZpdHkpIHJldHVyblxuICAgIGRlbGF5VGltZXIgPSBzZXRUaW1lb3V0KGZpcmUsIGRlbGF5KVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTW91c2VlbnRlciAoKSB7XG4gICAgaWYgKCFkZWxheVRpbWVyKSByZXR1cm5cbiAgICBjbGVhclRpbWVvdXQoZGVsYXlUaW1lcilcbiAgICBkZWxheVRpbWVyID0gbnVsbFxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlS2V5ZG93biAoZSkge1xuICAgIGlmIChkaXNhYmxlS2V5ZG93biB8fCAhZS5tZXRhS2V5IHx8IGUua2V5Q29kZSAhPT0gNzYpIHJldHVyblxuICAgIGRpc2FibGVLZXlkb3duID0gdHJ1ZVxuICAgIGRlbGF5VGltZXIgPSBzZXRUaW1lb3V0KGZpcmUsIGRlbGF5KVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBpbml0LFxuICAgIGNsZWFudXBcbiAgfVxufVxuIiwiY29uc3QgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjaGVja0luYWN0aXZpdHkgKGRlbGF5LCBjYikge1xuICBjb25zdCB7IHNldFRpbWVvdXQsIGNsZWFyVGltZW91dCB9ID0gd2luZG93XG4gIGxldCB0aW1lclxuICBjb25zdCBldmVudHMgPSBbJ3RvdWNoc3RhcnQnLCAnY2xpY2snLCAnc2Nyb2xsJywgJ2tleXVwJywgJ2tleXByZXNzJywgJ21vdXNlbW92ZSddXG5cbiAgcmVzZXRUaW1lcigpXG5cbiAgZXZlbnRzLmZvckVhY2goZXZlbnQgPT4gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIF8uZGVib3VuY2UocmVzZXRUaW1lciwgNTAwKSkpXG5cbiAgZnVuY3Rpb24gcmVzZXRUaW1lciAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKVxuICAgIHRpbWVyID0gc2V0VGltZW91dChmaXJlLCBkZWxheSAqIDEwMDApXG4gIH1cblxuICBmdW5jdGlvbiBmaXJlICgpIHtcbiAgICBkaXNwb3NlKClcbiAgICBjYigpXG4gIH1cblxuICBmdW5jdGlvbiBkaXNwb3NlICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgZXZlbnRzLmZvckVhY2goZXZlbnQgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIHJlc2V0VGltZXIpKVxuICB9XG5cbiAgcmV0dXJuIGRpc3Bvc2Vcbn1cbiIsImNvbnN0IF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG5jb25zdCBvbmNlID0gcmVxdWlyZSgnLi4vbGliL29uY2UnKVxuY29uc3Qgd2l0aFJlc3RvcmVBbGwgPSByZXF1aXJlKCcuLi9saWIvd2l0aFJlc3RvcmVBbGwnKVxuY29uc3QgcHJvbWlzZWQgPSByZXF1aXJlKCcuLi9saWIvcHJvbWlzZWQnKVxuY29uc3Qgbm9vcCA9ICgpID0+IHt9XG5cbmZ1bmN0aW9uIG9uRXZlbnQgKGVsLCB0eXBlLCBmbikge1xuICBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuKVxuICByZXR1cm4gb25jZSgoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuKSlcbn1cblxuZnVuY3Rpb24gc3R5bGUgKGVsLCBjc3MsIGZuKSB7XG4gIGNvbnN0IG9yaWdpbmFsU3R5bGUgPSBlbC5nZXRBdHRyaWJ1dGUoJ3N0eWxlJylcbiAgY29uc3QgbmV3U3R5bGUgPSB0eXBlb2YgY3NzID09PSAnc3RyaW5nJyA/IGZyb21TdHlsZShjc3MpIDogY3NzXG4gIGNvbnN0IG1lcmdlZCA9IHtcbiAgICAuLi5mcm9tU3R5bGUob3JpZ2luYWxTdHlsZSksXG4gICAgLi4ubmV3U3R5bGVcbiAgfVxuICBlbC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgdG9TdHlsZShtZXJnZWQpKVxuICByZXR1cm4gb25jZSgoKSA9PiBlbC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgb3JpZ2luYWxTdHlsZSkpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHlsZSAoc3R5bGUpIHtcbiAgaWYgKCFzdHlsZSkgc3R5bGUgPSAnJ1xuICByZXR1cm4gc3R5bGUuc3BsaXQoJzsnKS5yZWR1Y2UoKG1lbW8sIHZhbCkgPT4ge1xuICAgIGlmICghdmFsKSByZXR1cm4gbWVtb1xuICAgIGNvbnN0IFtrZXksIC4uLnZhbHVlXSA9IHZhbC5zcGxpdCgnOicpXG4gICAgbWVtb1trZXldID0gdmFsdWUuam9pbignOicpXG4gICAgcmV0dXJuIG1lbW9cbiAgfSwge30pXG59XG5cbmZ1bmN0aW9uIHRvU3R5bGUgKGNzcykge1xuICByZXR1cm4gXy5rZXlzKGNzcykucmVkdWNlKChtZW1vLCBrZXkpID0+IHtcbiAgICByZXR1cm4gbWVtbyArIGAke2tlYmFiKGtleSl9OiR7Y3NzW2tleV19O2BcbiAgfSwgJycpXG59XG5cbmZ1bmN0aW9uIGtlYmFiIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW0EtWl0pL2csICctJDEnKS50b0xvd2VyQ2FzZSgpXG59XG5cbmZ1bmN0aW9uIGlzSW5WaWV3UG9ydCAoZWwpIHtcbiAgaWYgKGVsICYmIGVsLnBhcmVudEVsZW1lbnQpIHtcbiAgICBjb25zdCB7IHRvcCwgYm90dG9tIH0gPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGlzQWJvdmVXaW5kb3dzQm90dG9tID1cbiAgICAgIHRvcCA9PT0gYm90dG9tXG4gICAgICAgID8gLy8gSWYgYm90aCBib3R0b20gYW5kIHRvcCBhcmUgYXQgd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICAgLy8gdGhlIGVsZW1lbnQgaXMgZW50aXJlbHkgaW5zaWRlIHRoZSB2aWV3cG9ydFxuICAgICAgICAgIHRvcCA8PSB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgOiAvLyBJZiB0aGUgZWxlbWVudCBoYXMgaGVpZ2h0LCB3aGVuIHRvcCBpcyBhdCB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgICAvLyB0aGUgZWxlbWVudCBpcyBiZWxvdyB0aGUgd2luZG93XG4gICAgICAgICAgdG9wIDwgd2luZG93LmlubmVySGVpZ2h0XG4gICAgY29uc3QgaXNCZWxvd1dpbmRvd3NUb3AgPVxuICAgICAgdG9wID09PSBib3R0b21cbiAgICAgICAgPyAvLyBJZiBib3RoIGJvdHRvbSBhbmQgdG9wIGFyZSBhdCAwcHhcbiAgICAgICAgICAvLyB0aGUgZWxlbWVudCBpcyBlbnRpcmVseSBpbnNpZGUgdGhlIHZpZXdwb3J0XG4gICAgICAgICAgYm90dG9tID49IDBcbiAgICAgICAgOiAvLyBJZiB0aGUgZWxlbWVudCBoYXMgaGVpZ2h0LCB3aGVuIGJvdHRvbSBpcyBhdCAwcHhcbiAgICAgICAgICAvLyB0aGUgZWxlbWVudCBpcyBhYm92ZSB0aGUgd2luZG93XG4gICAgICAgICAgYm90dG9tID4gMFxuICAgIHJldHVybiBpc0Fib3ZlV2luZG93c0JvdHRvbSAmJiBpc0JlbG93V2luZG93c1RvcFxuICB9XG59XG5cbmZ1bmN0aW9uIG9uQW55RW50ZXJWaWV3cG9ydCAoZWxzLCBmbikge1xuICBjb25zdCBkaXNwb3NhYmxlcyA9IFtdXG4gIF8uZWFjaChlbHMsIGVsID0+IGRpc3Bvc2FibGVzLnB1c2gob25FbnRlclZpZXdwb3J0KGVsLCBmbikpKVxuICByZXR1cm4gb25jZSgoKSA9PiB7XG4gICAgd2hpbGUgKGRpc3Bvc2FibGVzLmxlbmd0aCkgZGlzcG9zYWJsZXMucG9wKCkoKVxuICB9KVxufVxuXG5mdW5jdGlvbiBvbkVudGVyVmlld3BvcnQgKGVsLCBmbiwgc2Nyb2xsVGFyZ2V0RWwgPSB3aW5kb3cpIHtcbiAgaWYgKF8uaXNBcnJheShlbCkpIHtcbiAgICByZXR1cm4gb25BbnlFbnRlclZpZXdwb3J0KGVsLCBmbilcbiAgfVxuXG4gIGlmIChpc0luVmlld1BvcnQoZWwpKSB7XG4gICAgZm4oKVxuICAgIHJldHVybiBub29wXG4gIH1cblxuICBjb25zdCBoYW5kbGVTY3JvbGwgPSBfLmRlYm91bmNlKCgpID0+IHtcbiAgICBpZiAoaXNJblZpZXdQb3J0KGVsKSkge1xuICAgICAgc2Nyb2xsVGFyZ2V0RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgaGFuZGxlU2Nyb2xsKVxuICAgICAgZm4oKVxuICAgIH1cbiAgfSwgNTApXG4gIHNjcm9sbFRhcmdldEVsLmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGhhbmRsZVNjcm9sbClcbiAgcmV0dXJuIG9uY2UoKCkgPT4gc2Nyb2xsVGFyZ2V0RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgaGFuZGxlU2Nyb2xsKSlcbn1cblxuZnVuY3Rpb24gcmVwbGFjZSAodGFyZ2V0LCBlbCkge1xuICBjb25zdCBwYXJlbnQgPSB0YXJnZXQucGFyZW50RWxlbWVudFxuICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQubmV4dFNpYmxpbmcpXG4gIHBhcmVudC5yZW1vdmVDaGlsZCh0YXJnZXQpXG4gIHJldHVybiBvbmNlKCgpID0+IHJlcGxhY2UoZWwsIHRhcmdldCkpXG59XG5cbmZ1bmN0aW9uIGluc2VydEFmdGVyICh0YXJnZXQsIGVsKSB7XG4gIGNvbnN0IHBhcmVudCA9IHRhcmdldC5wYXJlbnRFbGVtZW50XG4gIHBhcmVudC5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5uZXh0U2libGluZylcbiAgcmV0dXJuIG9uY2UoKCkgPT4gcGFyZW50LnJlbW92ZUNoaWxkKGVsKSlcbn1cblxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlICh0YXJnZXQsIGVsKSB7XG4gIGNvbnN0IHBhcmVudCA9IHRhcmdldC5wYXJlbnRFbGVtZW50XG4gIHBhcmVudC5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldClcbiAgcmV0dXJuIG9uY2UoKCkgPT4gcGFyZW50LnJlbW92ZUNoaWxkKGVsKSlcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ2hpbGQgKHRhcmdldCwgZWwpIHtcbiAgdGFyZ2V0LmFwcGVuZENoaWxkKGVsKVxuICByZXR1cm4gb25jZSgoKSA9PiB0YXJnZXQucmVtb3ZlQ2hpbGQoZWwpKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgY29uc3QgdXRpbHMgPSB3aXRoUmVzdG9yZUFsbCh7XG4gICAgb25FdmVudCxcbiAgICBvbkVudGVyVmlld3BvcnQsXG4gICAgcmVwbGFjZSxcbiAgICBzdHlsZSxcbiAgICBpbnNlcnRBZnRlcixcbiAgICBpbnNlcnRCZWZvcmUsXG4gICAgYXBwZW5kQ2hpbGQsXG4gICAgY2xvc2VzdFxuICB9KVxuXG4gIF8uZWFjaChfLmtleXModXRpbHMpLCBrZXkgPT4ge1xuICAgIGlmIChrZXkuaW5kZXhPZignb24nKSA9PT0gMCkgdXRpbHNba2V5XSA9IHByb21pc2VkKHV0aWxzW2tleV0pXG4gIH0pXG5cbiAgcmV0dXJuIHV0aWxzXG59XG5cbmZ1bmN0aW9uIGNsb3Nlc3QgKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gIGlmICh3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCkge1xuICAgIHJldHVybiB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdC5jYWxsKGVsZW1lbnQsIHNlbGVjdG9yKVxuICB9IGVsc2Uge1xuICAgIGNvbnN0IG1hdGNoZXMgPSB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyB8fFxuICAgICAgd2luZG93LkVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUud2Via2l0TWF0Y2hlc1NlbGVjdG9yXG5cbiAgICBsZXQgZWwgPSBlbGVtZW50XG5cbiAgICBkbyB7XG4gICAgICBpZiAobWF0Y2hlcy5jYWxsKGVsLCBzZWxlY3RvcikpIHJldHVybiBlbFxuICAgICAgZWwgPSBlbC5wYXJlbnRFbGVtZW50IHx8IGVsLnBhcmVudE5vZGVcbiAgICB9IHdoaWxlIChlbCAhPT0gbnVsbCAmJiBlbC5ub2RlVHlwZSA9PT0gMSlcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG9uY2UgKGZuKSB7XG4gIGxldCBjYWxsZWQgPSBmYWxzZVxuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICBpZiAoY2FsbGVkKSByZXR1cm5cbiAgICBjYWxsZWQgPSB0cnVlXG4gICAgcmV0dXJuIGZuKC4uLmFyZ3MpXG4gIH1cbn1cbiIsImNvbnN0IFByb21pc2UgPSByZXF1aXJlKCdzeW5jLXAnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHByb21pc2VkIChmbikge1xuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICBpZiAodHlwZW9mIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGZuKC4uLmFyZ3MpXG4gICAgfVxuICAgIGxldCBkaXNwb3NlXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgYXJncy5wdXNoKHJlc29sdmUpXG4gICAgICBkaXNwb3NlID0gZm4oLi4uYXJncylcbiAgICB9KS50aGVuKHZhbHVlID0+IHtcbiAgICAgIGlmICh0eXBlb2YgZGlzcG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkaXNwb3NlKClcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH0pXG4gIH1cbn1cbiIsImNvbnN0IF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gd2l0aFJlc3RvcmVBbGwgKHV0aWxzKSB7XG4gIGNvbnN0IGNsZWFudXAgPSBbXVxuXG4gIGZ1bmN0aW9uIHJlc3RvcmFibGUgKGZuKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICBjb25zdCBkaXNwb3NlID0gZm4oLi4uYXJncylcbiAgICAgIGlmICh0eXBlb2YgZGlzcG9zZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjbGVhbnVwLnB1c2goZGlzcG9zZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBkaXNwb3NlXG4gICAgfVxuICB9XG4gIGNvbnN0IHJlc3VsdCA9IHt9XG5cbiAgZm9yIChjb25zdCBrZXkgb2YgXy5rZXlzKHV0aWxzKSkge1xuICAgIHJlc3VsdFtrZXldID0gcmVzdG9yYWJsZSh1dGlsc1trZXldKVxuICB9XG5cbiAgcmVzdWx0LnJlc3RvcmVBbGwgPSBmdW5jdGlvbiByZXN0b3JlQWxsICgpIHtcbiAgICB3aGlsZSAoY2xlYW51cC5sZW5ndGgpIGNsZWFudXAucG9wKCkoKVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuIiwidmFyIG4sbCx1LGksdCxvLHIsZixlPXt9LGM9W10scz0vYWNpdHxleCg/OnN8Z3xufHB8JCl8cnBofGdyaWR8b3dzfG1uY3xudHd8aW5lW2NoXXx6b298Xm9yZHxpdGVyYS9pO2Z1bmN0aW9uIGEobixsKXtmb3IodmFyIHUgaW4gbCluW3VdPWxbdV07cmV0dXJuIG59ZnVuY3Rpb24gaChuKXt2YXIgbD1uLnBhcmVudE5vZGU7bCYmbC5yZW1vdmVDaGlsZChuKX1mdW5jdGlvbiB2KGwsdSxpKXt2YXIgdCxvLHIsZj17fTtmb3IociBpbiB1KVwia2V5XCI9PXI/dD11W3JdOlwicmVmXCI9PXI/bz11W3JdOmZbcl09dVtyXTtpZihhcmd1bWVudHMubGVuZ3RoPjImJihmLmNoaWxkcmVuPWFyZ3VtZW50cy5sZW5ndGg+Mz9uLmNhbGwoYXJndW1lbnRzLDIpOmkpLFwiZnVuY3Rpb25cIj09dHlwZW9mIGwmJm51bGwhPWwuZGVmYXVsdFByb3BzKWZvcihyIGluIGwuZGVmYXVsdFByb3BzKXZvaWQgMD09PWZbcl0mJihmW3JdPWwuZGVmYXVsdFByb3BzW3JdKTtyZXR1cm4geShsLGYsdCxvLG51bGwpfWZ1bmN0aW9uIHkobixpLHQsbyxyKXt2YXIgZj17dHlwZTpuLHByb3BzOmksa2V5OnQscmVmOm8sX19rOm51bGwsX186bnVsbCxfX2I6MCxfX2U6bnVsbCxfX2Q6dm9pZCAwLF9fYzpudWxsLF9faDpudWxsLGNvbnN0cnVjdG9yOnZvaWQgMCxfX3Y6bnVsbD09cj8rK3U6cn07cmV0dXJuIG51bGw9PXImJm51bGwhPWwudm5vZGUmJmwudm5vZGUoZiksZn1mdW5jdGlvbiBwKCl7cmV0dXJue2N1cnJlbnQ6bnVsbH19ZnVuY3Rpb24gZChuKXtyZXR1cm4gbi5jaGlsZHJlbn1mdW5jdGlvbiBfKG4sbCl7dGhpcy5wcm9wcz1uLHRoaXMuY29udGV4dD1sfWZ1bmN0aW9uIGsobixsKXtpZihudWxsPT1sKXJldHVybiBuLl9fP2sobi5fXyxuLl9fLl9fay5pbmRleE9mKG4pKzEpOm51bGw7Zm9yKHZhciB1O2w8bi5fX2subGVuZ3RoO2wrKylpZihudWxsIT0odT1uLl9fa1tsXSkmJm51bGwhPXUuX19lKXJldHVybiB1Ll9fZTtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBuLnR5cGU/ayhuKTpudWxsfWZ1bmN0aW9uIGIobil7dmFyIGwsdTtpZihudWxsIT0obj1uLl9fKSYmbnVsbCE9bi5fX2Mpe2ZvcihuLl9fZT1uLl9fYy5iYXNlPW51bGwsbD0wO2w8bi5fX2subGVuZ3RoO2wrKylpZihudWxsIT0odT1uLl9fa1tsXSkmJm51bGwhPXUuX19lKXtuLl9fZT1uLl9fYy5iYXNlPXUuX19lO2JyZWFrfXJldHVybiBiKG4pfX1mdW5jdGlvbiBtKG4peyghbi5fX2QmJihuLl9fZD0hMCkmJnQucHVzaChuKSYmIWcuX19yKyt8fHIhPT1sLmRlYm91bmNlUmVuZGVyaW5nKSYmKChyPWwuZGVib3VuY2VSZW5kZXJpbmcpfHxvKShnKX1mdW5jdGlvbiBnKCl7Zm9yKHZhciBuO2cuX19yPXQubGVuZ3RoOyluPXQuc29ydChmdW5jdGlvbihuLGwpe3JldHVybiBuLl9fdi5fX2ItbC5fX3YuX19ifSksdD1bXSxuLnNvbWUoZnVuY3Rpb24obil7dmFyIGwsdSxpLHQsbyxyO24uX19kJiYobz0odD0obD1uKS5fX3YpLl9fZSwocj1sLl9fUCkmJih1PVtdLChpPWEoe30sdCkpLl9fdj10Ll9fdisxLGoocix0LGksbC5fX24sdm9pZCAwIT09ci5vd25lclNWR0VsZW1lbnQsbnVsbCE9dC5fX2g/W29dOm51bGwsdSxudWxsPT1vP2sodCk6byx0Ll9faCkseih1LHQpLHQuX19lIT1vJiZiKHQpKSl9KX1mdW5jdGlvbiB3KG4sbCx1LGksdCxvLHIsZixzLGEpe3ZhciBoLHYscCxfLGIsbSxnLHc9aSYmaS5fX2t8fGMsQT13Lmxlbmd0aDtmb3IodS5fX2s9W10saD0wO2g8bC5sZW5ndGg7aCsrKWlmKG51bGwhPShfPXUuX19rW2hdPW51bGw9PShfPWxbaF0pfHxcImJvb2xlYW5cIj09dHlwZW9mIF8/bnVsbDpcInN0cmluZ1wiPT10eXBlb2YgX3x8XCJudW1iZXJcIj09dHlwZW9mIF98fFwiYmlnaW50XCI9PXR5cGVvZiBfP3kobnVsbCxfLG51bGwsbnVsbCxfKTpBcnJheS5pc0FycmF5KF8pP3koZCx7Y2hpbGRyZW46X30sbnVsbCxudWxsLG51bGwpOl8uX19iPjA/eShfLnR5cGUsXy5wcm9wcyxfLmtleSxudWxsLF8uX192KTpfKSl7aWYoXy5fXz11LF8uX19iPXUuX19iKzEsbnVsbD09PShwPXdbaF0pfHxwJiZfLmtleT09cC5rZXkmJl8udHlwZT09PXAudHlwZSl3W2hdPXZvaWQgMDtlbHNlIGZvcih2PTA7djxBO3YrKyl7aWYoKHA9d1t2XSkmJl8ua2V5PT1wLmtleSYmXy50eXBlPT09cC50eXBlKXt3W3ZdPXZvaWQgMDticmVha31wPW51bGx9aihuLF8scD1wfHxlLHQsbyxyLGYscyxhKSxiPV8uX19lLCh2PV8ucmVmKSYmcC5yZWYhPXYmJihnfHwoZz1bXSkscC5yZWYmJmcucHVzaChwLnJlZixudWxsLF8pLGcucHVzaCh2LF8uX19jfHxiLF8pKSxudWxsIT1iPyhudWxsPT1tJiYobT1iKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBfLnR5cGUmJl8uX19rPT09cC5fX2s/Xy5fX2Q9cz14KF8scyxuKTpzPVAobixfLHAsdyxiLHMpLFwiZnVuY3Rpb25cIj09dHlwZW9mIHUudHlwZSYmKHUuX19kPXMpKTpzJiZwLl9fZT09cyYmcy5wYXJlbnROb2RlIT1uJiYocz1rKHApKX1mb3IodS5fX2U9bSxoPUE7aC0tOyludWxsIT13W2hdJiYoXCJmdW5jdGlvblwiPT10eXBlb2YgdS50eXBlJiZudWxsIT13W2hdLl9fZSYmd1toXS5fX2U9PXUuX19kJiYodS5fX2Q9ayhpLGgrMSkpLE4od1toXSx3W2hdKSk7aWYoZylmb3IoaD0wO2g8Zy5sZW5ndGg7aCsrKU0oZ1toXSxnWysraF0sZ1srK2hdKX1mdW5jdGlvbiB4KG4sbCx1KXtmb3IodmFyIGksdD1uLl9fayxvPTA7dCYmbzx0Lmxlbmd0aDtvKyspKGk9dFtvXSkmJihpLl9fPW4sbD1cImZ1bmN0aW9uXCI9PXR5cGVvZiBpLnR5cGU/eChpLGwsdSk6UCh1LGksaSx0LGkuX19lLGwpKTtyZXR1cm4gbH1mdW5jdGlvbiBBKG4sbCl7cmV0dXJuIGw9bHx8W10sbnVsbD09bnx8XCJib29sZWFuXCI9PXR5cGVvZiBufHwoQXJyYXkuaXNBcnJheShuKT9uLnNvbWUoZnVuY3Rpb24obil7QShuLGwpfSk6bC5wdXNoKG4pKSxsfWZ1bmN0aW9uIFAobixsLHUsaSx0LG8pe3ZhciByLGYsZTtpZih2b2lkIDAhPT1sLl9fZClyPWwuX19kLGwuX19kPXZvaWQgMDtlbHNlIGlmKG51bGw9PXV8fHQhPW98fG51bGw9PXQucGFyZW50Tm9kZSluOmlmKG51bGw9PW98fG8ucGFyZW50Tm9kZSE9PW4pbi5hcHBlbmRDaGlsZCh0KSxyPW51bGw7ZWxzZXtmb3IoZj1vLGU9MDsoZj1mLm5leHRTaWJsaW5nKSYmZTxpLmxlbmd0aDtlKz0yKWlmKGY9PXQpYnJlYWsgbjtuLmluc2VydEJlZm9yZSh0LG8pLHI9b31yZXR1cm4gdm9pZCAwIT09cj9yOnQubmV4dFNpYmxpbmd9ZnVuY3Rpb24gQyhuLGwsdSxpLHQpe3ZhciBvO2ZvcihvIGluIHUpXCJjaGlsZHJlblwiPT09b3x8XCJrZXlcIj09PW98fG8gaW4gbHx8SChuLG8sbnVsbCx1W29dLGkpO2ZvcihvIGluIGwpdCYmXCJmdW5jdGlvblwiIT10eXBlb2YgbFtvXXx8XCJjaGlsZHJlblwiPT09b3x8XCJrZXlcIj09PW98fFwidmFsdWVcIj09PW98fFwiY2hlY2tlZFwiPT09b3x8dVtvXT09PWxbb118fEgobixvLGxbb10sdVtvXSxpKX1mdW5jdGlvbiAkKG4sbCx1KXtcIi1cIj09PWxbMF0/bi5zZXRQcm9wZXJ0eShsLHUpOm5bbF09bnVsbD09dT9cIlwiOlwibnVtYmVyXCIhPXR5cGVvZiB1fHxzLnRlc3QobCk/dTp1K1wicHhcIn1mdW5jdGlvbiBIKG4sbCx1LGksdCl7dmFyIG87bjppZihcInN0eWxlXCI9PT1sKWlmKFwic3RyaW5nXCI9PXR5cGVvZiB1KW4uc3R5bGUuY3NzVGV4dD11O2Vsc2V7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGkmJihuLnN0eWxlLmNzc1RleHQ9aT1cIlwiKSxpKWZvcihsIGluIGkpdSYmbCBpbiB1fHwkKG4uc3R5bGUsbCxcIlwiKTtpZih1KWZvcihsIGluIHUpaSYmdVtsXT09PWlbbF18fCQobi5zdHlsZSxsLHVbbF0pfWVsc2UgaWYoXCJvXCI9PT1sWzBdJiZcIm5cIj09PWxbMV0pbz1sIT09KGw9bC5yZXBsYWNlKC9DYXB0dXJlJC8sXCJcIikpLGw9bC50b0xvd2VyQ2FzZSgpaW4gbj9sLnRvTG93ZXJDYXNlKCkuc2xpY2UoMik6bC5zbGljZSgyKSxuLmx8fChuLmw9e30pLG4ubFtsK29dPXUsdT9pfHxuLmFkZEV2ZW50TGlzdGVuZXIobCxvP1Q6SSxvKTpuLnJlbW92ZUV2ZW50TGlzdGVuZXIobCxvP1Q6SSxvKTtlbHNlIGlmKFwiZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUxcIiE9PWwpe2lmKHQpbD1sLnJlcGxhY2UoL3hsaW5rKEh8OmgpLyxcImhcIikucmVwbGFjZSgvc05hbWUkLyxcInNcIik7ZWxzZSBpZihcImhyZWZcIiE9PWwmJlwibGlzdFwiIT09bCYmXCJmb3JtXCIhPT1sJiZcInRhYkluZGV4XCIhPT1sJiZcImRvd25sb2FkXCIhPT1sJiZsIGluIG4pdHJ5e25bbF09bnVsbD09dT9cIlwiOnU7YnJlYWsgbn1jYXRjaChuKXt9XCJmdW5jdGlvblwiPT10eXBlb2YgdXx8KG51bGwhPXUmJighMSE9PXV8fFwiYVwiPT09bFswXSYmXCJyXCI9PT1sWzFdKT9uLnNldEF0dHJpYnV0ZShsLHUpOm4ucmVtb3ZlQXR0cmlidXRlKGwpKX19ZnVuY3Rpb24gSShuKXt0aGlzLmxbbi50eXBlKyExXShsLmV2ZW50P2wuZXZlbnQobik6bil9ZnVuY3Rpb24gVChuKXt0aGlzLmxbbi50eXBlKyEwXShsLmV2ZW50P2wuZXZlbnQobik6bil9ZnVuY3Rpb24gaihuLHUsaSx0LG8scixmLGUsYyl7dmFyIHMsaCx2LHkscCxrLGIsbSxnLHgsQSxQPXUudHlwZTtpZih2b2lkIDAhPT11LmNvbnN0cnVjdG9yKXJldHVybiBudWxsO251bGwhPWkuX19oJiYoYz1pLl9faCxlPXUuX19lPWkuX19lLHUuX19oPW51bGwscj1bZV0pLChzPWwuX19iKSYmcyh1KTt0cnl7bjppZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBQKXtpZihtPXUucHJvcHMsZz0ocz1QLmNvbnRleHRUeXBlKSYmdFtzLl9fY10seD1zP2c/Zy5wcm9wcy52YWx1ZTpzLl9fOnQsaS5fX2M/Yj0oaD11Ll9fYz1pLl9fYykuX189aC5fX0U6KFwicHJvdG90eXBlXCJpbiBQJiZQLnByb3RvdHlwZS5yZW5kZXI/dS5fX2M9aD1uZXcgUChtLHgpOih1Ll9fYz1oPW5ldyBfKG0seCksaC5jb25zdHJ1Y3Rvcj1QLGgucmVuZGVyPU8pLGcmJmcuc3ViKGgpLGgucHJvcHM9bSxoLnN0YXRlfHwoaC5zdGF0ZT17fSksaC5jb250ZXh0PXgsaC5fX249dCx2PWguX19kPSEwLGguX19oPVtdKSxudWxsPT1oLl9fcyYmKGguX19zPWguc3RhdGUpLG51bGwhPVAuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzJiYoaC5fX3M9PWguc3RhdGUmJihoLl9fcz1hKHt9LGguX19zKSksYShoLl9fcyxQLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyhtLGguX19zKSkpLHk9aC5wcm9wcyxwPWguc3RhdGUsdiludWxsPT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmbnVsbCE9aC5jb21wb25lbnRXaWxsTW91bnQmJmguY29tcG9uZW50V2lsbE1vdW50KCksbnVsbCE9aC5jb21wb25lbnREaWRNb3VudCYmaC5fX2gucHVzaChoLmNvbXBvbmVudERpZE1vdW50KTtlbHNle2lmKG51bGw9PVAuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzJiZtIT09eSYmbnVsbCE9aC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzJiZoLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobSx4KSwhaC5fX2UmJm51bGwhPWguc2hvdWxkQ29tcG9uZW50VXBkYXRlJiYhMT09PWguc2hvdWxkQ29tcG9uZW50VXBkYXRlKG0saC5fX3MseCl8fHUuX192PT09aS5fX3Ype2gucHJvcHM9bSxoLnN0YXRlPWguX19zLHUuX192IT09aS5fX3YmJihoLl9fZD0hMSksaC5fX3Y9dSx1Ll9fZT1pLl9fZSx1Ll9faz1pLl9fayx1Ll9fay5mb3JFYWNoKGZ1bmN0aW9uKG4pe24mJihuLl9fPXUpfSksaC5fX2gubGVuZ3RoJiZmLnB1c2goaCk7YnJlYWsgbn1udWxsIT1oLmNvbXBvbmVudFdpbGxVcGRhdGUmJmguY29tcG9uZW50V2lsbFVwZGF0ZShtLGguX19zLHgpLG51bGwhPWguY29tcG9uZW50RGlkVXBkYXRlJiZoLl9faC5wdXNoKGZ1bmN0aW9uKCl7aC5jb21wb25lbnREaWRVcGRhdGUoeSxwLGspfSl9aC5jb250ZXh0PXgsaC5wcm9wcz1tLGguc3RhdGU9aC5fX3MsKHM9bC5fX3IpJiZzKHUpLGguX19kPSExLGguX192PXUsaC5fX1A9bixzPWgucmVuZGVyKGgucHJvcHMsaC5zdGF0ZSxoLmNvbnRleHQpLGguc3RhdGU9aC5fX3MsbnVsbCE9aC5nZXRDaGlsZENvbnRleHQmJih0PWEoYSh7fSx0KSxoLmdldENoaWxkQ29udGV4dCgpKSksdnx8bnVsbD09aC5nZXRTbmFwc2hvdEJlZm9yZVVwZGF0ZXx8KGs9aC5nZXRTbmFwc2hvdEJlZm9yZVVwZGF0ZSh5LHApKSxBPW51bGwhPXMmJnMudHlwZT09PWQmJm51bGw9PXMua2V5P3MucHJvcHMuY2hpbGRyZW46cyx3KG4sQXJyYXkuaXNBcnJheShBKT9BOltBXSx1LGksdCxvLHIsZixlLGMpLGguYmFzZT11Ll9fZSx1Ll9faD1udWxsLGguX19oLmxlbmd0aCYmZi5wdXNoKGgpLGImJihoLl9fRT1oLl9fPW51bGwpLGguX19lPSExfWVsc2UgbnVsbD09ciYmdS5fX3Y9PT1pLl9fdj8odS5fX2s9aS5fX2ssdS5fX2U9aS5fX2UpOnUuX19lPUwoaS5fX2UsdSxpLHQsbyxyLGYsYyk7KHM9bC5kaWZmZWQpJiZzKHUpfWNhdGNoKG4pe3UuX192PW51bGwsKGN8fG51bGwhPXIpJiYodS5fX2U9ZSx1Ll9faD0hIWMscltyLmluZGV4T2YoZSldPW51bGwpLGwuX19lKG4sdSxpKX19ZnVuY3Rpb24geihuLHUpe2wuX19jJiZsLl9fYyh1LG4pLG4uc29tZShmdW5jdGlvbih1KXt0cnl7bj11Ll9faCx1Ll9faD1bXSxuLnNvbWUoZnVuY3Rpb24obil7bi5jYWxsKHUpfSl9Y2F0Y2gobil7bC5fX2Uobix1Ll9fdil9fSl9ZnVuY3Rpb24gTChsLHUsaSx0LG8scixmLGMpe3ZhciBzLGEsdix5PWkucHJvcHMscD11LnByb3BzLGQ9dS50eXBlLF89MDtpZihcInN2Z1wiPT09ZCYmKG89ITApLG51bGwhPXIpZm9yKDtfPHIubGVuZ3RoO18rKylpZigocz1yW19dKSYmXCJzZXRBdHRyaWJ1dGVcImluIHM9PSEhZCYmKGQ/cy5sb2NhbE5hbWU9PT1kOjM9PT1zLm5vZGVUeXBlKSl7bD1zLHJbX109bnVsbDticmVha31pZihudWxsPT1sKXtpZihudWxsPT09ZClyZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUocCk7bD1vP2RvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsZCk6ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChkLHAuaXMmJnApLHI9bnVsbCxjPSExfWlmKG51bGw9PT1kKXk9PT1wfHxjJiZsLmRhdGE9PT1wfHwobC5kYXRhPXApO2Vsc2V7aWYocj1yJiZuLmNhbGwobC5jaGlsZE5vZGVzKSxhPSh5PWkucHJvcHN8fGUpLmRhbmdlcm91c2x5U2V0SW5uZXJIVE1MLHY9cC5kYW5nZXJvdXNseVNldElubmVySFRNTCwhYyl7aWYobnVsbCE9cilmb3IoeT17fSxfPTA7XzxsLmF0dHJpYnV0ZXMubGVuZ3RoO18rKyl5W2wuYXR0cmlidXRlc1tfXS5uYW1lXT1sLmF0dHJpYnV0ZXNbX10udmFsdWU7KHZ8fGEpJiYodiYmKGEmJnYuX19odG1sPT1hLl9faHRtbHx8di5fX2h0bWw9PT1sLmlubmVySFRNTCl8fChsLmlubmVySFRNTD12JiZ2Ll9faHRtbHx8XCJcIikpfWlmKEMobCxwLHksbyxjKSx2KXUuX19rPVtdO2Vsc2UgaWYoXz11LnByb3BzLmNoaWxkcmVuLHcobCxBcnJheS5pc0FycmF5KF8pP186W19dLHUsaSx0LG8mJlwiZm9yZWlnbk9iamVjdFwiIT09ZCxyLGYscj9yWzBdOmkuX19rJiZrKGksMCksYyksbnVsbCE9cilmb3IoXz1yLmxlbmd0aDtfLS07KW51bGwhPXJbX10mJmgocltfXSk7Y3x8KFwidmFsdWVcImluIHAmJnZvaWQgMCE9PShfPXAudmFsdWUpJiYoXyE9PWwudmFsdWV8fFwicHJvZ3Jlc3NcIj09PWQmJiFffHxcIm9wdGlvblwiPT09ZCYmXyE9PXkudmFsdWUpJiZIKGwsXCJ2YWx1ZVwiLF8seS52YWx1ZSwhMSksXCJjaGVja2VkXCJpbiBwJiZ2b2lkIDAhPT0oXz1wLmNoZWNrZWQpJiZfIT09bC5jaGVja2VkJiZIKGwsXCJjaGVja2VkXCIsXyx5LmNoZWNrZWQsITEpKX1yZXR1cm4gbH1mdW5jdGlvbiBNKG4sdSxpKXt0cnl7XCJmdW5jdGlvblwiPT10eXBlb2Ygbj9uKHUpOm4uY3VycmVudD11fWNhdGNoKG4pe2wuX19lKG4saSl9fWZ1bmN0aW9uIE4obix1LGkpe3ZhciB0LG87aWYobC51bm1vdW50JiZsLnVubW91bnQobiksKHQ9bi5yZWYpJiYodC5jdXJyZW50JiZ0LmN1cnJlbnQhPT1uLl9fZXx8TSh0LG51bGwsdSkpLG51bGwhPSh0PW4uX19jKSl7aWYodC5jb21wb25lbnRXaWxsVW5tb3VudCl0cnl7dC5jb21wb25lbnRXaWxsVW5tb3VudCgpfWNhdGNoKG4pe2wuX19lKG4sdSl9dC5iYXNlPXQuX19QPW51bGx9aWYodD1uLl9faylmb3Iobz0wO288dC5sZW5ndGg7bysrKXRbb10mJk4odFtvXSx1LFwiZnVuY3Rpb25cIiE9dHlwZW9mIG4udHlwZSk7aXx8bnVsbD09bi5fX2V8fGgobi5fX2UpLG4uX19lPW4uX19kPXZvaWQgMH1mdW5jdGlvbiBPKG4sbCx1KXtyZXR1cm4gdGhpcy5jb25zdHJ1Y3RvcihuLHUpfWZ1bmN0aW9uIFModSxpLHQpe3ZhciBvLHIsZjtsLl9fJiZsLl9fKHUsaSkscj0obz1cImZ1bmN0aW9uXCI9PXR5cGVvZiB0KT9udWxsOnQmJnQuX19rfHxpLl9fayxmPVtdLGooaSx1PSghbyYmdHx8aSkuX19rPXYoZCxudWxsLFt1XSkscnx8ZSxlLHZvaWQgMCE9PWkub3duZXJTVkdFbGVtZW50LCFvJiZ0P1t0XTpyP251bGw6aS5maXJzdENoaWxkP24uY2FsbChpLmNoaWxkTm9kZXMpOm51bGwsZiwhbyYmdD90OnI/ci5fX2U6aS5maXJzdENoaWxkLG8pLHooZix1KX1mdW5jdGlvbiBxKG4sbCl7UyhuLGwscSl9ZnVuY3Rpb24gQihsLHUsaSl7dmFyIHQsbyxyLGY9YSh7fSxsLnByb3BzKTtmb3IociBpbiB1KVwia2V5XCI9PXI/dD11W3JdOlwicmVmXCI9PXI/bz11W3JdOmZbcl09dVtyXTtyZXR1cm4gYXJndW1lbnRzLmxlbmd0aD4yJiYoZi5jaGlsZHJlbj1hcmd1bWVudHMubGVuZ3RoPjM/bi5jYWxsKGFyZ3VtZW50cywyKTppKSx5KGwudHlwZSxmLHR8fGwua2V5LG98fGwucmVmLG51bGwpfWZ1bmN0aW9uIEQobixsKXt2YXIgdT17X19jOmw9XCJfX2NDXCIrZisrLF9fOm4sQ29uc3VtZXI6ZnVuY3Rpb24obixsKXtyZXR1cm4gbi5jaGlsZHJlbihsKX0sUHJvdmlkZXI6ZnVuY3Rpb24obil7dmFyIHUsaTtyZXR1cm4gdGhpcy5nZXRDaGlsZENvbnRleHR8fCh1PVtdLChpPXt9KVtsXT10aGlzLHRoaXMuZ2V0Q2hpbGRDb250ZXh0PWZ1bmN0aW9uKCl7cmV0dXJuIGl9LHRoaXMuc2hvdWxkQ29tcG9uZW50VXBkYXRlPWZ1bmN0aW9uKG4pe3RoaXMucHJvcHMudmFsdWUhPT1uLnZhbHVlJiZ1LnNvbWUobSl9LHRoaXMuc3ViPWZ1bmN0aW9uKG4pe3UucHVzaChuKTt2YXIgbD1uLmNvbXBvbmVudFdpbGxVbm1vdW50O24uY29tcG9uZW50V2lsbFVubW91bnQ9ZnVuY3Rpb24oKXt1LnNwbGljZSh1LmluZGV4T2YobiksMSksbCYmbC5jYWxsKG4pfX0pLG4uY2hpbGRyZW59fTtyZXR1cm4gdS5Qcm92aWRlci5fXz11LkNvbnN1bWVyLmNvbnRleHRUeXBlPXV9bj1jLnNsaWNlLGw9e19fZTpmdW5jdGlvbihuLGwsdSxpKXtmb3IodmFyIHQsbyxyO2w9bC5fXzspaWYoKHQ9bC5fX2MpJiYhdC5fXyl0cnl7aWYoKG89dC5jb25zdHJ1Y3RvcikmJm51bGwhPW8uZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yJiYodC5zZXRTdGF0ZShvLmdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihuKSkscj10Ll9fZCksbnVsbCE9dC5jb21wb25lbnREaWRDYXRjaCYmKHQuY29tcG9uZW50RGlkQ2F0Y2gobixpfHx7fSkscj10Ll9fZCkscilyZXR1cm4gdC5fX0U9dH1jYXRjaChsKXtuPWx9dGhyb3cgbn19LHU9MCxpPWZ1bmN0aW9uKG4pe3JldHVybiBudWxsIT1uJiZ2b2lkIDA9PT1uLmNvbnN0cnVjdG9yfSxfLnByb3RvdHlwZS5zZXRTdGF0ZT1mdW5jdGlvbihuLGwpe3ZhciB1O3U9bnVsbCE9dGhpcy5fX3MmJnRoaXMuX19zIT09dGhpcy5zdGF0ZT90aGlzLl9fczp0aGlzLl9fcz1hKHt9LHRoaXMuc3RhdGUpLFwiZnVuY3Rpb25cIj09dHlwZW9mIG4mJihuPW4oYSh7fSx1KSx0aGlzLnByb3BzKSksbiYmYSh1LG4pLG51bGwhPW4mJnRoaXMuX192JiYobCYmdGhpcy5fX2gucHVzaChsKSxtKHRoaXMpKX0sXy5wcm90b3R5cGUuZm9yY2VVcGRhdGU9ZnVuY3Rpb24obil7dGhpcy5fX3YmJih0aGlzLl9fZT0hMCxuJiZ0aGlzLl9faC5wdXNoKG4pLG0odGhpcykpfSxfLnByb3RvdHlwZS5yZW5kZXI9ZCx0PVtdLG89XCJmdW5jdGlvblwiPT10eXBlb2YgUHJvbWlzZT9Qcm9taXNlLnByb3RvdHlwZS50aGVuLmJpbmQoUHJvbWlzZS5yZXNvbHZlKCkpOnNldFRpbWVvdXQsZy5fX3I9MCxmPTA7ZXhwb3J0e1MgYXMgcmVuZGVyLHEgYXMgaHlkcmF0ZSx2IGFzIGNyZWF0ZUVsZW1lbnQsdiBhcyBoLGQgYXMgRnJhZ21lbnQscCBhcyBjcmVhdGVSZWYsaSBhcyBpc1ZhbGlkRWxlbWVudCxfIGFzIENvbXBvbmVudCxCIGFzIGNsb25lRWxlbWVudCxEIGFzIGNyZWF0ZUNvbnRleHQsQSBhcyB0b0NoaWxkQXJyYXksbCBhcyBvcHRpb25zfTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXByZWFjdC5tb2R1bGUuanMubWFwXG4iLCJpbXBvcnR7b3B0aW9ucyBhcyBufWZyb21cInByZWFjdFwiO3ZhciB0LHUscixvPTAsaT1bXSxjPW4uX19iLGY9bi5fX3IsZT1uLmRpZmZlZCxhPW4uX19jLHY9bi51bm1vdW50O2Z1bmN0aW9uIGwodCxyKXtuLl9faCYmbi5fX2godSx0LG98fHIpLG89MDt2YXIgaT11Ll9fSHx8KHUuX19IPXtfXzpbXSxfX2g6W119KTtyZXR1cm4gdD49aS5fXy5sZW5ndGgmJmkuX18ucHVzaCh7fSksaS5fX1t0XX1mdW5jdGlvbiBtKG4pe3JldHVybiBvPTEscCh3LG4pfWZ1bmN0aW9uIHAobixyLG8pe3ZhciBpPWwodCsrLDIpO3JldHVybiBpLnQ9bixpLl9fY3x8KGkuX189W28/byhyKTp3KHZvaWQgMCxyKSxmdW5jdGlvbihuKXt2YXIgdD1pLnQoaS5fX1swXSxuKTtpLl9fWzBdIT09dCYmKGkuX189W3QsaS5fX1sxXV0saS5fX2Muc2V0U3RhdGUoe30pKX1dLGkuX19jPXUpLGkuX199ZnVuY3Rpb24geShyLG8pe3ZhciBpPWwodCsrLDMpOyFuLl9fcyYmayhpLl9fSCxvKSYmKGkuX189cixpLl9fSD1vLHUuX19ILl9faC5wdXNoKGkpKX1mdW5jdGlvbiBkKHIsbyl7dmFyIGk9bCh0KyssNCk7IW4uX19zJiZrKGkuX19ILG8pJiYoaS5fXz1yLGkuX19IPW8sdS5fX2gucHVzaChpKSl9ZnVuY3Rpb24gaChuKXtyZXR1cm4gbz01LF8oZnVuY3Rpb24oKXtyZXR1cm57Y3VycmVudDpufX0sW10pfWZ1bmN0aW9uIHMobix0LHUpe289NixkKGZ1bmN0aW9uKCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2Ygbj8obih0KCkpLGZ1bmN0aW9uKCl7cmV0dXJuIG4obnVsbCl9KTpuPyhuLmN1cnJlbnQ9dCgpLGZ1bmN0aW9uKCl7cmV0dXJuIG4uY3VycmVudD1udWxsfSk6dm9pZCAwfSxudWxsPT11P3U6dS5jb25jYXQobikpfWZ1bmN0aW9uIF8obix1KXt2YXIgcj1sKHQrKyw3KTtyZXR1cm4gayhyLl9fSCx1KSYmKHIuX189bigpLHIuX19IPXUsci5fX2g9biksci5fX31mdW5jdGlvbiBBKG4sdCl7cmV0dXJuIG89OCxfKGZ1bmN0aW9uKCl7cmV0dXJuIG59LHQpfWZ1bmN0aW9uIEYobil7dmFyIHI9dS5jb250ZXh0W24uX19jXSxvPWwodCsrLDkpO3JldHVybiBvLmM9bixyPyhudWxsPT1vLl9fJiYoby5fXz0hMCxyLnN1Yih1KSksci5wcm9wcy52YWx1ZSk6bi5fX31mdW5jdGlvbiBUKHQsdSl7bi51c2VEZWJ1Z1ZhbHVlJiZuLnVzZURlYnVnVmFsdWUodT91KHQpOnQpfWZ1bmN0aW9uIHEobil7dmFyIHI9bCh0KyssMTApLG89bSgpO3JldHVybiByLl9fPW4sdS5jb21wb25lbnREaWRDYXRjaHx8KHUuY29tcG9uZW50RGlkQ2F0Y2g9ZnVuY3Rpb24obil7ci5fXyYmci5fXyhuKSxvWzFdKG4pfSksW29bMF0sZnVuY3Rpb24oKXtvWzFdKHZvaWQgMCl9XX1mdW5jdGlvbiB4KCl7Zm9yKHZhciB0O3Q9aS5zaGlmdCgpOylpZih0Ll9fUCl0cnl7dC5fX0guX19oLmZvckVhY2goZyksdC5fX0guX19oLmZvckVhY2goaiksdC5fX0guX19oPVtdfWNhdGNoKHUpe3QuX19ILl9faD1bXSxuLl9fZSh1LHQuX192KX19bi5fX2I9ZnVuY3Rpb24obil7dT1udWxsLGMmJmMobil9LG4uX19yPWZ1bmN0aW9uKG4pe2YmJmYobiksdD0wO3ZhciByPSh1PW4uX19jKS5fX0g7ciYmKHIuX19oLmZvckVhY2goZyksci5fX2guZm9yRWFjaChqKSxyLl9faD1bXSl9LG4uZGlmZmVkPWZ1bmN0aW9uKHQpe2UmJmUodCk7dmFyIG89dC5fX2M7byYmby5fX0gmJm8uX19ILl9faC5sZW5ndGgmJigxIT09aS5wdXNoKG8pJiZyPT09bi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fCgocj1uLnJlcXVlc3RBbmltYXRpb25GcmFtZSl8fGZ1bmN0aW9uKG4pe3ZhciB0LHU9ZnVuY3Rpb24oKXtjbGVhclRpbWVvdXQociksYiYmY2FuY2VsQW5pbWF0aW9uRnJhbWUodCksc2V0VGltZW91dChuKX0scj1zZXRUaW1lb3V0KHUsMTAwKTtiJiYodD1yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodSkpfSkoeCkpLHU9bnVsbH0sbi5fX2M9ZnVuY3Rpb24odCx1KXt1LnNvbWUoZnVuY3Rpb24odCl7dHJ5e3QuX19oLmZvckVhY2goZyksdC5fX2g9dC5fX2guZmlsdGVyKGZ1bmN0aW9uKG4pe3JldHVybiFuLl9ffHxqKG4pfSl9Y2F0Y2gocil7dS5zb21lKGZ1bmN0aW9uKG4pe24uX19oJiYobi5fX2g9W10pfSksdT1bXSxuLl9fZShyLHQuX192KX19KSxhJiZhKHQsdSl9LG4udW5tb3VudD1mdW5jdGlvbih0KXt2JiZ2KHQpO3ZhciB1LHI9dC5fX2M7ciYmci5fX0gmJihyLl9fSC5fXy5mb3JFYWNoKGZ1bmN0aW9uKG4pe3RyeXtnKG4pfWNhdGNoKG4pe3U9bn19KSx1JiZuLl9fZSh1LHIuX192KSl9O3ZhciBiPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZTtmdW5jdGlvbiBnKG4pe3ZhciB0PXUscj1uLl9fYztcImZ1bmN0aW9uXCI9PXR5cGVvZiByJiYobi5fX2M9dm9pZCAwLHIoKSksdT10fWZ1bmN0aW9uIGoobil7dmFyIHQ9dTtuLl9fYz1uLl9fKCksdT10fWZ1bmN0aW9uIGsobix0KXtyZXR1cm4hbnx8bi5sZW5ndGghPT10Lmxlbmd0aHx8dC5zb21lKGZ1bmN0aW9uKHQsdSl7cmV0dXJuIHQhPT1uW3VdfSl9ZnVuY3Rpb24gdyhuLHQpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIHQ/dChuKTp0fWV4cG9ydHttIGFzIHVzZVN0YXRlLHAgYXMgdXNlUmVkdWNlcix5IGFzIHVzZUVmZmVjdCxkIGFzIHVzZUxheW91dEVmZmVjdCxoIGFzIHVzZVJlZixzIGFzIHVzZUltcGVyYXRpdmVIYW5kbGUsXyBhcyB1c2VNZW1vLEEgYXMgdXNlQ2FsbGJhY2ssRiBhcyB1c2VDb250ZXh0LFQgYXMgdXNlRGVidWdWYWx1ZSxxIGFzIHVzZUVycm9yQm91bmRhcnl9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aG9va3MubW9kdWxlLmpzLm1hcFxuIiwidmFyIHRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG52YXIgcmVnZXhwQ2hhcmFjdGVycyA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZ1xudmFyIHJlZ2V4cElzTmF0aXZlRm4gPSB0b1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KVxuICAucmVwbGFjZShyZWdleHBDaGFyYWN0ZXJzLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpXG52YXIgcmVnZXhwSXNOYXRpdmUgPSBSZWdFeHAoJ14nICsgcmVnZXhwSXNOYXRpdmVGbiArICckJylcbmZ1bmN0aW9uIHRvU291cmNlIChmdW5jKSB7XG4gIGlmICghZnVuYykgcmV0dXJuICcnXG4gIHRyeSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoZnVuYylcbiAgfSBjYXRjaCAoZSkge31cbiAgdHJ5IHtcbiAgICByZXR1cm4gKGZ1bmMgKyAnJylcbiAgfSBjYXRjaCAoZSkge31cbn1cbnZhciBhc3NpZ24gPSBPYmplY3QuYXNzaWduXG52YXIgZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoXG52YXIgZXZlcnkgPSBBcnJheS5wcm90b3R5cGUuZXZlcnlcbnZhciBmaWx0ZXIgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyXG52YXIgZmluZCA9IEFycmF5LnByb3RvdHlwZS5maW5kXG52YXIgaW5kZXhPZiA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXlcbnZhciBrZXlzID0gT2JqZWN0LmtleXNcbnZhciBtYXAgPSBBcnJheS5wcm90b3R5cGUubWFwXG52YXIgcmVkdWNlID0gQXJyYXkucHJvdG90eXBlLnJlZHVjZVxudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlXG52YXIgc29tZSA9IEFycmF5LnByb3RvdHlwZS5zb21lXG52YXIgdmFsdWVzID0gT2JqZWN0LnZhbHVlc1xuZnVuY3Rpb24gaXNOYXRpdmUgKG1ldGhvZCkge1xuICByZXR1cm4gbWV0aG9kICYmIHR5cGVvZiBtZXRob2QgPT09ICdmdW5jdGlvbicgJiYgcmVnZXhwSXNOYXRpdmUudGVzdCh0b1NvdXJjZShtZXRob2QpKVxufVxudmFyIF8gPSB7XG4gIGFzc2lnbjogaXNOYXRpdmUoYXNzaWduKVxuICAgID8gYXNzaWduXG4gICAgOiBmdW5jdGlvbiBhc3NpZ24gKHRhcmdldCkge1xuICAgICAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldXG4gICAgICAgIGZvciAodmFyIGogaW4gc291cmNlKSBpZiAoc291cmNlLmhhc093blByb3BlcnR5KGopKSB0YXJnZXRbal0gPSBzb3VyY2Vbal1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0YXJnZXRcbiAgICB9LFxuICBiaW5kOiBmdW5jdGlvbiBiaW5kIChtZXRob2QsIGNvbnRleHQpIHtcbiAgICB2YXIgYXJncyA9IF8uc2xpY2UoYXJndW1lbnRzLCAyKVxuICAgIHJldHVybiBmdW5jdGlvbiBib3VuZEZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncy5jb25jYXQoXy5zbGljZShhcmd1bWVudHMpKSlcbiAgICB9XG4gIH0sXG4gIGRlYm91bmNlOiBmdW5jdGlvbiBkZWJvdW5jZSAoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXRcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzXG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50c1xuICAgICAgdmFyIGxhdGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbFxuICAgICAgICBpZiAoIWltbWVkaWF0ZSkgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxuICAgICAgfVxuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXRcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KVxuICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpXG4gICAgICBpZiAoY2FsbE5vdykgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKVxuICAgIH1cbiAgfSxcbiAgZWFjaDogaXNOYXRpdmUoZm9yRWFjaClcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUVhY2ggKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZvckVhY2guY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZWFjaCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgIH0sXG4gIGV2ZXJ5OiBpc05hdGl2ZShldmVyeSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUV2ZXJ5IChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZXZlcnkuY2FsbChjb2xsLCBwcmVkLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGV2ZXJ5IChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWNvbGwgfHwgIXByZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpXG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbGwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCFwcmVkLmNhbGwoY29udGV4dCwgY29sbFtpXSwgaSwgY29sbCkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9LFxuICBmaWx0ZXI6IGlzTmF0aXZlKGZpbHRlcilcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUZpbHRlciAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZmlsdGVyLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGZpbHRlciAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgdmFyIG91dHB1dCA9IFtdXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpKSBvdXRwdXQucHVzaChhcnJheVtpXSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXRcbiAgICB9LFxuICBmaW5kOiBpc05hdGl2ZShmaW5kKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRmluZCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZmluZC5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBmaW5kIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpKSByZXR1cm4gYXJyYXlbaV1cbiAgICAgIH1cbiAgICB9LFxuICBnZXQ6IGZ1bmN0aW9uIGdldCAob2JqZWN0LCBwYXRoKSB7XG4gICAgcmV0dXJuIF8ucmVkdWNlKHBhdGguc3BsaXQoJy4nKSwgZnVuY3Rpb24gKG1lbW8sIG5leHQpIHtcbiAgICAgIHJldHVybiAodHlwZW9mIG1lbW8gIT09ICd1bmRlZmluZWQnICYmIG1lbW8gIT09IG51bGwpID8gbWVtb1tuZXh0XSA6IHVuZGVmaW5lZFxuICAgIH0sIG9iamVjdClcbiAgfSxcbiAgaWRlbnRpdHk6IGZ1bmN0aW9uIGlkZW50aXR5ICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuICBpbmRleE9mOiBpc05hdGl2ZShpbmRleE9mKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlSW5kZXhPZiAoYXJyYXksIGl0ZW0pIHtcbiAgICAgIHJldHVybiBpbmRleE9mLmNhbGwoYXJyYXksIGl0ZW0pXG4gICAgfVxuICAgIDogZnVuY3Rpb24gaW5kZXhPZiAoYXJyYXksIGl0ZW0pIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHJldHVybiBpXG4gICAgICB9XG4gICAgICByZXR1cm4gLTFcbiAgICB9LFxuICBpbnZva2U6IGZ1bmN0aW9uIGludm9rZSAoYXJyYXksIG1ldGhvZE5hbWUpIHtcbiAgICB2YXIgYXJncyA9IF8uc2xpY2UoYXJndW1lbnRzLCAyKVxuICAgIHJldHVybiBfLm1hcChhcnJheSwgZnVuY3Rpb24gaW52b2tlTWFwcGVyICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlW21ldGhvZE5hbWVdLmFwcGx5KHZhbHVlLCBhcmdzKVxuICAgIH0pXG4gIH0sXG4gIGlzQXJyYXk6IGlzTmF0aXZlKGlzQXJyYXkpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVBcnJheSAoY29sbCkge1xuICAgICAgcmV0dXJuIGlzQXJyYXkoY29sbClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBpc0FycmF5IChvYmopIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICAgIH0sXG4gIGlzTWF0Y2g6IGZ1bmN0aW9uIGlzTWF0Y2ggKG9iaiwgc3BlYykge1xuICAgIGZvciAodmFyIGkgaW4gc3BlYykge1xuICAgICAgaWYgKHNwZWMuaGFzT3duUHJvcGVydHkoaSkgJiYgb2JqW2ldICE9PSBzcGVjW2ldKSByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfSxcbiAgaXNPYmplY3Q6IGZ1bmN0aW9uIGlzT2JqZWN0IChvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmpcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9ialxuICB9LFxuICBrZXlzOiBpc05hdGl2ZShrZXlzKVxuICAgID8ga2V5c1xuICAgIDogZnVuY3Rpb24ga2V5cyAob2JqZWN0KSB7XG4gICAgICB2YXIga2V5cyA9IFtdXG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkga2V5cy5wdXNoKGtleSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBrZXlzXG4gICAgfSxcbiAgbWFwOiBpc05hdGl2ZShtYXApXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVNYXAgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIG1hcC5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBtYXAgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIHZhciBvdXRwdXQgPSBuZXcgQXJyYXkobClcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIG91dHB1dFtpXSA9IGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgIH0sXG4gIG1hdGNoZXM6IGZ1bmN0aW9uIG1hdGNoZXMgKHNwZWMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIF8uaXNNYXRjaChvYmosIHNwZWMpXG4gICAgfVxuICB9LFxuICBub3Q6IGZ1bmN0aW9uIG5vdCAodmFsdWUpIHtcbiAgICByZXR1cm4gIXZhbHVlXG4gIH0sXG4gIG9iamVjdEVhY2g6IGZ1bmN0aW9uIChvYmplY3QsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZWFjaChfLmtleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgb2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KVxuICAgIH0sIGNvbnRleHQpXG4gIH0sXG4gIG9iamVjdE1hcDogZnVuY3Rpb24gb2JqZWN0TWFwIChvYmplY3QsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gY2FsbGJhY2suY2FsbChjb250ZXh0LCBvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfSxcbiAgb2JqZWN0UmVkdWNlOiBmdW5jdGlvbiBvYmplY3RSZWR1Y2UgKG9iamVjdCwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSkge1xuICAgIHZhciBvdXRwdXQgPSBpbml0aWFsVmFsdWVcbiAgICBmb3IgKHZhciBpIGluIG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShpKSkgb3V0cHV0ID0gY2FsbGJhY2sob3V0cHV0LCBvYmplY3RbaV0sIGksIG9iamVjdClcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dFxuICB9LFxuICBwaWNrOiBmdW5jdGlvbiBwaWNrIChvYmplY3QsIHRvUGljaykge1xuICAgIHZhciBvdXQgPSB7fVxuICAgIF8uZWFjaCh0b1BpY2ssIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGlmICh0eXBlb2Ygb2JqZWN0W2tleV0gIT09ICd1bmRlZmluZWQnKSBvdXRba2V5XSA9IG9iamVjdFtrZXldXG4gICAgfSlcbiAgICByZXR1cm4gb3V0XG4gIH0sXG4gIHBsdWNrOiBmdW5jdGlvbiBwbHVjayAoYXJyYXksIGtleSkge1xuICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgdmFyIG91dCA9IFtdXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIGlmIChhcnJheVtpXSkgb3V0W2ldID0gYXJyYXlbaV1ba2V5XVxuICAgIHJldHVybiBvdXRcbiAgfSxcbiAgcmVkdWNlOiBpc05hdGl2ZShyZWR1Y2UpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVSZWR1Y2UgKGFycmF5LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKSB7XG4gICAgICByZXR1cm4gcmVkdWNlLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gcmVkdWNlIChhcnJheSwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSkge1xuICAgICAgdmFyIG91dHB1dCA9IGluaXRpYWxWYWx1ZVxuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSBvdXRwdXQgPSBjYWxsYmFjayhvdXRwdXQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICAgIHJldHVybiBvdXRwdXRcbiAgICB9LFxuICBzZXQ6IGZ1bmN0aW9uIHNldCAob2JqZWN0LCBwYXRoLCB2YWwpIHtcbiAgICBpZiAoIW9iamVjdCkgcmV0dXJuIG9iamVjdFxuICAgIGlmICh0eXBlb2Ygb2JqZWN0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqZWN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gb2JqZWN0XG4gICAgdmFyIHBhcnRzID0gcGF0aC5zcGxpdCgnLicpXG4gICAgdmFyIGNvbnRleHQgPSBvYmplY3RcbiAgICB2YXIgbmV4dEtleVxuICAgIGRvIHtcbiAgICAgIG5leHRLZXkgPSBwYXJ0cy5zaGlmdCgpXG4gICAgICBpZiAodHlwZW9mIGNvbnRleHRbbmV4dEtleV0gIT09ICdvYmplY3QnKSBjb250ZXh0W25leHRLZXldID0ge31cbiAgICAgIGlmIChwYXJ0cy5sZW5ndGgpIHtcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHRbbmV4dEtleV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRleHRbbmV4dEtleV0gPSB2YWxcbiAgICAgIH1cbiAgICB9IHdoaWxlIChwYXJ0cy5sZW5ndGgpXG4gICAgcmV0dXJuIG9iamVjdFxuICB9LFxuICBzbGljZTogaXNOYXRpdmUoc2xpY2UpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVTbGljZSAoYXJyYXksIGJlZ2luLCBlbmQpIHtcbiAgICAgIGJlZ2luID0gYmVnaW4gfHwgMFxuICAgICAgZW5kID0gdHlwZW9mIGVuZCA9PT0gJ251bWJlcicgPyBlbmQgOiBhcnJheS5sZW5ndGhcbiAgICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBiZWdpbiwgZW5kKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIHNsaWNlIChhcnJheSwgc3RhcnQsIGVuZCkge1xuICAgICAgc3RhcnQgPSBzdGFydCB8fCAwXG4gICAgICBlbmQgPSB0eXBlb2YgZW5kID09PSAnbnVtYmVyJyA/IGVuZCA6IGFycmF5Lmxlbmd0aFxuICAgICAgdmFyIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoXG4gICAgICBpZiAoIWxlbmd0aCkge1xuICAgICAgICByZXR1cm4gW11cbiAgICAgIH1cbiAgICAgIGlmIChzdGFydCA8IDApIHtcbiAgICAgICAgc3RhcnQgPSAtc3RhcnQgPiBsZW5ndGggPyAwIDogKGxlbmd0aCArIHN0YXJ0KVxuICAgICAgfVxuICAgICAgZW5kID0gZW5kID4gbGVuZ3RoID8gbGVuZ3RoIDogZW5kXG4gICAgICBpZiAoZW5kIDwgMCkge1xuICAgICAgICBlbmQgKz0gbGVuZ3RoXG4gICAgICB9XG4gICAgICBsZW5ndGggPSBzdGFydCA+IGVuZCA/IDAgOiAoKGVuZCAtIHN0YXJ0KSA+Pj4gMClcbiAgICAgIHN0YXJ0ID4+Pj0gMFxuICAgICAgdmFyIGluZGV4ID0gLTFcbiAgICAgIHZhciByZXN1bHQgPSBuZXcgQXJyYXkobGVuZ3RoKVxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IGFycmF5W2luZGV4ICsgc3RhcnRdXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSxcbiAgc29tZTogaXNOYXRpdmUoc29tZSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZVNvbWUgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBzb21lLmNhbGwoY29sbCwgcHJlZCwgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBzb21lIChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICBpZiAoIWNvbGwgfHwgIXByZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigpXG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbGwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHByZWQuY2FsbChjb250ZXh0LCBjb2xsW2ldLCBpLCBjb2xsKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sXG4gIHVuaXF1ZTogZnVuY3Rpb24gdW5pcXVlIChhcnJheSkge1xuICAgIHJldHVybiBfLnJlZHVjZShhcnJheSwgZnVuY3Rpb24gKG1lbW8sIGN1cnIpIHtcbiAgICAgIGlmIChfLmluZGV4T2YobWVtbywgY3VycikgPT09IC0xKSB7XG4gICAgICAgIG1lbW8ucHVzaChjdXJyKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW9cbiAgICB9LCBbXSlcbiAgfSxcbiAgdmFsdWVzOiBpc05hdGl2ZSh2YWx1ZXMpXG4gICAgPyB2YWx1ZXNcbiAgICA6IGZ1bmN0aW9uIHZhbHVlcyAob2JqZWN0KSB7XG4gICAgICB2YXIgb3V0ID0gW11cbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSBvdXQucHVzaChvYmplY3Rba2V5XSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRcbiAgICB9LFxuICBuYW1lOiAnc2xhcGRhc2gnLFxuICB2ZXJzaW9uOiAnMS4zLjMnXG59XG5fLm9iamVjdE1hcC5hc0FycmF5ID0gZnVuY3Rpb24gb2JqZWN0TWFwQXNBcnJheSAob2JqZWN0LCBjYWxsYmFjaywgY29udGV4dCkge1xuICByZXR1cm4gXy5tYXAoXy5rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suY2FsbChjb250ZXh0LCBvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpXG4gIH0sIGNvbnRleHQpXG59XG5tb2R1bGUuZXhwb3J0cyA9IF9cbiIsInZhciBlcnIgPSBuZXcgRXJyb3IoJ0Vycm9yOiByZWN1cnNlcyEgaW5maW5pdGUgcHJvbWlzZSBjaGFpbiBkZXRlY3RlZCcpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHByb21pc2UgKHJlc29sdmVyKSB7XG4gIHZhciB3YWl0aW5nID0geyByZXM6IFtdLCByZWo6IFtdIH1cbiAgdmFyIHAgPSB7XG4gICAgJ3RoZW4nOiB0aGVuLFxuICAgICdjYXRjaCc6IGZ1bmN0aW9uIHRoZW5DYXRjaCAob25SZWplY3QpIHtcbiAgICAgIHJldHVybiB0aGVuKG51bGwsIG9uUmVqZWN0KVxuICAgIH1cbiAgfVxuICB0cnkgeyByZXNvbHZlcihyZXNvbHZlLCByZWplY3QpIH0gY2F0Y2ggKGUpIHtcbiAgICBwLnN0YXR1cyA9IGZhbHNlXG4gICAgcC52YWx1ZSA9IGVcbiAgfVxuICByZXR1cm4gcFxuXG4gIGZ1bmN0aW9uIHRoZW4gKG9uUmVzb2x2ZSwgb25SZWplY3QpIHtcbiAgICByZXR1cm4gcHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB3YWl0aW5nLnJlcy5wdXNoKGhhbmRsZU5leHQocCwgd2FpdGluZywgb25SZXNvbHZlLCByZXNvbHZlLCByZWplY3QsIG9uUmVqZWN0KSlcbiAgICAgIHdhaXRpbmcucmVqLnB1c2goaGFuZGxlTmV4dChwLCB3YWl0aW5nLCBvblJlamVjdCwgcmVzb2x2ZSwgcmVqZWN0LCBvblJlamVjdCkpXG4gICAgICBpZiAodHlwZW9mIHAuc3RhdHVzICE9PSAndW5kZWZpbmVkJykgZmx1c2god2FpdGluZywgcClcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZSAodmFsKSB7XG4gICAgaWYgKHR5cGVvZiBwLnN0YXR1cyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuICAgIGlmICh2YWwgPT09IHApIHRocm93IGVyclxuICAgIGlmICh2YWwpIHRyeSB7IGlmICh0eXBlb2YgdmFsLnRoZW4gPT09ICdmdW5jdGlvbicpIHJldHVybiB2YWwudGhlbihyZXNvbHZlLCByZWplY3QpIH0gY2F0Y2ggKGUpIHt9XG4gICAgcC5zdGF0dXMgPSB0cnVlXG4gICAgcC52YWx1ZSA9IHZhbFxuICAgIGZsdXNoKHdhaXRpbmcsIHApXG4gIH1cblxuICBmdW5jdGlvbiByZWplY3QgKHZhbCkge1xuICAgIGlmICh0eXBlb2YgcC5zdGF0dXMgIT09ICd1bmRlZmluZWQnKSByZXR1cm5cbiAgICBpZiAodmFsID09PSBwKSB0aHJvdyBlcnJcbiAgICBwLnN0YXR1cyA9IGZhbHNlXG4gICAgcC52YWx1ZSA9IHZhbFxuICAgIGZsdXNoKHdhaXRpbmcsIHApXG4gIH1cbn1cblxuZnVuY3Rpb24gZmx1c2ggKHdhaXRpbmcsIHApIHtcbiAgdmFyIHF1ZXVlID0gcC5zdGF0dXMgPyB3YWl0aW5nLnJlcyA6IHdhaXRpbmcucmVqXG4gIHdoaWxlIChxdWV1ZS5sZW5ndGgpIHF1ZXVlLnNoaWZ0KCkocC52YWx1ZSlcbn1cblxuZnVuY3Rpb24gaGFuZGxlTmV4dCAocCwgd2FpdGluZywgaGFuZGxlciwgcmVzb2x2ZSwgcmVqZWN0LCBoYXNSZWplY3QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG5leHQgKHZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhbHVlID0gaGFuZGxlciA/IGhhbmRsZXIodmFsdWUpIDogdmFsdWVcbiAgICAgIGlmIChwLnN0YXR1cykgcmV0dXJuIHJlc29sdmUodmFsdWUpXG4gICAgICByZXR1cm4gaGFzUmVqZWN0ID8gcmVzb2x2ZSh2YWx1ZSkgOiByZWplY3QodmFsdWUpXG4gICAgfSBjYXRjaCAoZXJyKSB7IHJlamVjdChlcnIpIH1cbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gX2FycmF5TGlrZVRvQXJyYXkoYXJyLCBsZW4pIHtcbiAgaWYgKGxlbiA9PSBudWxsIHx8IGxlbiA+IGFyci5sZW5ndGgpIGxlbiA9IGFyci5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgYXJyMltpXSA9IGFycltpXTtcbiAgfVxuXG4gIHJldHVybiBhcnIyO1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF9hcnJheVdpdGhIb2xlcyhhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIGFycjtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfZXh0ZW5kcygpIHtcbiAgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcblxuICAgICAgZm9yICh2YXIga2V5IGluIHNvdXJjZSkge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xuICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xuICB9O1xuXG4gIHJldHVybiBfZXh0ZW5kcy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufSIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXlMaW1pdChhcnIsIGkpIHtcbiAgdmFyIF9pID0gYXJyID09IG51bGwgPyBudWxsIDogdHlwZW9mIFN5bWJvbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBhcnJbU3ltYm9sLml0ZXJhdG9yXSB8fCBhcnJbXCJAQGl0ZXJhdG9yXCJdO1xuXG4gIGlmIChfaSA9PSBudWxsKSByZXR1cm47XG4gIHZhciBfYXJyID0gW107XG4gIHZhciBfbiA9IHRydWU7XG4gIHZhciBfZCA9IGZhbHNlO1xuXG4gIHZhciBfcywgX2U7XG5cbiAgdHJ5IHtcbiAgICBmb3IgKF9pID0gX2kuY2FsbChhcnIpOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7XG4gICAgICBfYXJyLnB1c2goX3MudmFsdWUpO1xuXG4gICAgICBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBfZCA9IHRydWU7XG4gICAgX2UgPSBlcnI7XG4gIH0gZmluYWxseSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0gIT0gbnVsbCkgX2lbXCJyZXR1cm5cIl0oKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKF9kKSB0aHJvdyBfZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gX2Fycjtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfbm9uSXRlcmFibGVSZXN0KCkge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpO1xufSIsImltcG9ydCBhcnJheVdpdGhIb2xlcyBmcm9tIFwiLi9hcnJheVdpdGhIb2xlcy5qc1wiO1xuaW1wb3J0IGl0ZXJhYmxlVG9BcnJheUxpbWl0IGZyb20gXCIuL2l0ZXJhYmxlVG9BcnJheUxpbWl0LmpzXCI7XG5pbXBvcnQgdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkgZnJvbSBcIi4vdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkuanNcIjtcbmltcG9ydCBub25JdGVyYWJsZVJlc3QgZnJvbSBcIi4vbm9uSXRlcmFibGVSZXN0LmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfc2xpY2VkVG9BcnJheShhcnIsIGkpIHtcbiAgcmV0dXJuIGFycmF5V2l0aEhvbGVzKGFycikgfHwgaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB8fCB1bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShhcnIsIGkpIHx8IG5vbkl0ZXJhYmxlUmVzdCgpO1xufSIsImltcG9ydCBhcnJheUxpa2VUb0FycmF5IGZyb20gXCIuL2FycmF5TGlrZVRvQXJyYXkuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHtcbiAgaWYgKCFvKSByZXR1cm47XG4gIGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIGFycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTtcbiAgdmFyIG4gPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykuc2xpY2UoOCwgLTEpO1xuICBpZiAobiA9PT0gXCJPYmplY3RcIiAmJiBvLmNvbnN0cnVjdG9yKSBuID0gby5jb25zdHJ1Y3Rvci5uYW1lO1xuICBpZiAobiA9PT0gXCJNYXBcIiB8fCBuID09PSBcIlNldFwiKSByZXR1cm4gQXJyYXkuZnJvbShvKTtcbiAgaWYgKG4gPT09IFwiQXJndW1lbnRzXCIgfHwgL14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3QobikpIHJldHVybiBhcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7XG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBtYXBwZXIgZnJvbSAnLi9tYXBwZXInXG5pbXBvcnQgZXhwZXJpZW5jZXMgZnJvbSAnLi9leHBlcmllbmNlcydcblxubWFwcGVyKClcbmV4cGVyaWVuY2VzLmZvckVhY2goZXhwZXJpZW5jZSA9PiBleHBlcmllbmNlKCkpIl0sIm5hbWVzIjpbInRyaWdnZXJzIiwidmFyaWF0aW9uIiwib3B0aW9ucyIsImNiIiwibG9nIiwic3RhdGUiLCJwb2xsIiwiaW5mbyIsInBvbGxGb3JFbGVtZW50cyIsInRoZW4iLCJhbmNob3IiLCJzZXQiLCJyZW5kZXIiLCJoIiwidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJ1dGlscyIsImluc2VydEFmdGVyIiwicHJlZml4IiwiZ2V0IiwiY29weSIsInJlbmRlclBsYWNlbWVudCIsImVsZW1lbnQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJDb250YWluZXIiLCJjb250YWluZXJDbGFzcyIsInVzZUNvdW50ZG93blRpbWVyIiwiZGF0ZSIsImNhbGN1bGF0ZVRpbWVMZWZ0IiwiZGlmZmVyZW5jZSIsIkRhdGUiLCJkYXlzIiwiTWF0aCIsImZsb29yIiwiaG91cnMiLCJtaW51dGVzIiwic2Vjb25kcyIsInRpbWVMZWZ0Iiwic2V0VGltZUxlZnQiLCJ0aW1lciIsInNldFRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJDb3VudGRvd24iLCJjb3VudGRvd25DbGFzcyIsInRpbWVyQ29tcG9uZW50cyIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJpbnRlcnZhbCIsImxlbmd0aCIsIlByb21pc2UiLCJjaGVja0luYWN0aXZpdHkiLCJjaGVja0V4aXQiLCJpbmFjdGl2aXR5VGltZSIsImNoZWNrRGV2aWNlVHlwZSIsImNoZWNrRm9yRXhpdEludGVudE9ySW5hY3Rpdml0eSIsInJlc29sdmUiLCJpc01vYmlsZU9yVGFibGV0IiwidGVzdCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImV4aXRJbnRlbnQiLCJpbml0IiwidXNlUmVmIiwiR2xpZGUiLCJhcHBlbmRDaGlsZCIsImNvbnRlbnQiLCJoZWFkbGluZSIsInN1YnRpdGxlIiwicmVjcyIsInRpdGxlIiwiZ2xpZGVPcHRpb25zIiwidHlwZSIsImJvdW5kIiwicGVyVmlldyIsImdhcCIsInNjcm9sbExvY2siLCJyZXdpbmQiLCJicmVha3BvaW50cyIsImZpcmUiLCJjbGFzc0xpc3QiLCJhZGQiLCJQbGFjZW1lbnQiLCJjaGlsZHJlbiIsImhhbmRsZUNsb3NlIiwiZXhwZXJpZW5jZSIsInF1ZXJ5U2VsZWN0b3IiLCJwYXJlbnRFbGVtZW50IiwicmVtb3ZlQ2hpbGQiLCJDYXJvdXNlbCIsImNhcm91c2VsQ2xhc3MiLCJjYXJvdXNlbENvbnRhaW5lciIsImdsaWRlIiwibW91bnQiLCJkZXN0cm95IiwicmVjIiwiaSIsIkFycm93cyIsImFycm93Q2xhc3MiLCJTbGlkZSIsInNsaWRlQ2xhc3MiLCJjcmVhdGVFeHBlcmllbmNlIiwiY291bnRkb3duQmFubmVyIiwiZXhwZXJpZW5jZVN0YXRlIiwia2V5IiwiZGF0YSIsImNvbnNvbGUiLCJ3YXJuIiwiZXJyb3IiLCJydW5NYXBwZXIiLCJ3aW5kb3ciLCJ4cF9ldmVudHMiLCJlbWl0RXZlbnQiLCJldmVudCIsInB1c2giLCJkYXRhTGF5ZXIiLCJldmVudE5hbWUiLCJtYXBwZXIiLCJleHBlcmllbmNlcyIsImZvckVhY2giXSwic291cmNlUm9vdCI6IiJ9
