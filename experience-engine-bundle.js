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
___CSS_LOADER_EXPORT___.push([module.id, ".xp-countdown-banner {\n  margin: unset !important;\n  width: 100% !important;\n  max-width: unset !important;\n}\n.xp-countdown-banner + .wp-block-spacer {\n  display: none;\n}\n.xp-countdown-banner-container {\n  padding: 2rem;\n  text-align: center;\n  width: 100%;\n  background: #ff5858;\n  color: #ffffff;\n}\n.xp-countdown-banner-container__title {\n  font-size: 2rem;\n}\n@media (max-width: 767px) {\n  .xp-countdown-banner-container__title {\n    font-size: 1.5rem;\n  }\n}\n.xp-countdown-banner-container__cta {\n  background: #212121;\n  padding: 0.5rem 1rem;\n  margin-top: 1rem;\n  display: inline-block;\n}\n", "",{"version":3,"sources":["webpack://./src/experiences/countdownBanner/variation.less"],"names":[],"mappings":"AAAC;EAIC,wBAAA;EACA,sBAAA;EACA,2BAAA;AAFF;AAJC;EAUC,aAAA;AAHF;AAPC;EAcC,aAAA;EACA,kBAAA;EACA,WAAA;EACA,mBAAA;EACA,cAAA;AAJF;AAKE;EACE,eAAA;AAHJ;AAII;EAAA;IACE,iBAAA;EADJ;AACF;AAGE;EACE,mBAAA;EACA,oBAAA;EACA,gBAAA;EACA,qBAAA;AADJ","sourcesContent":["@prefix: ~'.xp-countdown-banner';\n@container: ~'@{prefix}-container';\n\n@{prefix} {\n  margin: unset !important;\n  width: 100% !important;\n  max-width: unset !important;\n}\n\n@{prefix} + .wp-block-spacer {\n  display: none;\n}\n\n@{container} {\n  padding: 2rem;\n  text-align: center;\n  width: 100%;\n  background: #ff5858;\n  color: #ffffff;\n  &__title {\n    font-size: 2rem;\n    @media(max-width: 767px) {\n      font-size: 1.5rem;\n    }\n  }\n  &__cta {\n    background: #212121;\n    padding: 0.5rem 1rem;\n    margin-top: 1rem;\n    display: inline-block;\n  }\n}\n"],"sourceRoot":""}]);
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
___CSS_LOADER_EXPORT___.push([module.id, ".xp-exitIntent {\n  position: fixed;\n  bottom: 40px;\n  left: 40px;\n  right: 40px;\n  z-index: 9999999999;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent {\n    bottom: 20px;\n    left: 20px;\n    right: 20px;\n  }\n}\n.xp-exitIntent-carousel {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n}\n.xp-exitIntent-carousel * {\n  box-sizing: inherit;\n}\n.xp-exitIntent-carousel__track {\n  overflow: hidden;\n}\n.xp-exitIntent-carousel__slides {\n  position: relative;\n  width: 100%;\n  list-style: none;\n  backface-visibility: hidden;\n  transform-style: preserve-3d;\n  touch-action: pan-Y;\n  overflow: hidden;\n  padding: 0;\n  white-space: nowrap;\n  display: flex;\n  flex-wrap: nowrap;\n  will-change: transform;\n}\n.xp-exitIntent-carousel__slides--dragging {\n  user-select: none;\n}\n.xp-exitIntent-carousel__slide {\n  width: 100%;\n  height: 100%;\n  flex-shrink: 0;\n  white-space: normal;\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-tap-highlight-color: transparent;\n}\n.xp-exitIntent-carousel__slide a {\n  user-select: none;\n  -webkit-user-drag: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n}\n.xp-exitIntent-carousel__arrows {\n  -webkit-touch-callout: none;\n  user-select: none;\n}\n.xp-exitIntent-carousel__bullets {\n  -webkit-touch-callout: none;\n  user-select: none;\n}\n.xp-exitIntent-carousel--rtl {\n  direction: rtl;\n}\n.xp-exitIntent-container {\n  background: #ffffff;\n  box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.226043);\n  border-radius: 5px;\n  border-top: 5px solid #d81f0d;\n  padding: 22px 15px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-container {\n    padding: 8px 15px 15px 15px;\n    border-top: 4px solid #d81f0d;\n  }\n}\n.xp-exitIntent-container__header {\n  padding-bottom: 12px;\n}\n.xp-exitIntent-container__title {\n  font-style: normal;\n  font-weight: 700;\n  font-size: 20px;\n  line-height: 25px;\n  color: #333333;\n  text-align: center;\n  padding-bottom: 3px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-container__title {\n    font-size: 16px;\n    line-height: 20px;\n    padding-left: 20px;\n    padding-right: 20px;\n  }\n}\n.xp-exitIntent-container__subtitle {\n  font-style: normal;\n  font-weight: 400;\n  font-size: 16px;\n  line-height: 20px;\n  text-align: center;\n  letter-spacing: 0.0928571px;\n  color: #2e2e2e;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-container__subtitle {\n    font-weight: 400;\n    font-size: 13px;\n    line-height: 16px;\n  }\n}\n.xp-exitIntent-container__close {\n  background-repeat: no-repeat;\n  background-color: unset;\n  border: unset;\n  width: 26px;\n  height: 26px;\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  padding: unset;\n  color: #000000;\n}\n.xp-exitIntent-carousel {\n  padding-left: 40px;\n  padding-right: 40px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-carousel {\n    padding-left: unset;\n    padding-right: unset;\n  }\n}\n.xp-exitIntent-carousel__slides {\n  margin: unset;\n}\n.xp-exitIntent-arrow {\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  right: -15px;\n  padding: 30px 15px;\n  cursor: pointer;\n}\n.xp-exitIntent-arrow--left {\n  left: -15px;\n  right: unset;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-arrow {\n    display: none;\n  }\n}\n.xp-exitIntent-slide {\n  background: #ffffff;\n  border: 1px solid #cccccc;\n  padding: 13px;\n  display: flex;\n  justify-content: space-between;\n  text-decoration: none;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-slide {\n    padding: 12px;\n    min-height: 90px;\n  }\n}\n.xp-exitIntent-slide__image {\n  width: 30%;\n  display: flex;\n  align-items: center;\n}\n.xp-exitIntent-slide__image img {\n  max-width: 100%;\n  max-height: 70px;\n}\n.xp-exitIntent-slide__content {\n  width: calc(70% - 13px);\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  padding-top: 6px;\n}\n@media (max-width: 767px) {\n  .xp-exitIntent-slide__content {\n    padding-top: unset;\n  }\n}\n.xp-exitIntent-slide__title {\n  max-width: 100%;\n  white-space: normal;\n  font-style: normal;\n  font-weight: 400;\n  font-size: 14px;\n  line-height: 14px;\n  letter-spacing: 0.1px;\n  color: #333333;\n}\n.xp-exitIntent-slide__old-price {\n  font-style: normal;\n  font-weight: 400;\n  font-size: 11px;\n  line-height: 14px;\n  letter-spacing: 0.0928571px;\n  color: #666666;\n}\n.xp-exitIntent-slide__old-price--strike {\n  text-decoration: line-through;\n}\n.xp-exitIntent-slide__new-price {\n  font-style: normal;\n  font-weight: 700;\n  font-size: 13px;\n  line-height: 14px;\n  letter-spacing: 0.0928571px;\n  display: flex;\n  flex-wrap: wrap;\n}\n.xp-exitIntent-slide__price-value {\n  color: #000000;\n  padding-right: 12px;\n}\n.xp-exitIntent-slide__price-saved {\n  color: #ff5858;\n}\n", "",{"version":3,"sources":["webpack://./src/experiences/exitIntent/variation.less"],"names":[],"mappings":"AAAC;EAQC,eAAA;EACA,YAAA;EACA,UAAA;EACA,WAAA;EACA,mBAAA;AANF;AAOE;EAAA;IACE,YAAA;IACA,UAAA;IACA,WAAA;EAJF;AACF;AAbC;EAqBC,kBAAA;EACA,WAAA;EACA,sBAAA;AALF;AAlBC;EAyBG,mBAAA;AAJJ;AAME;EACE,gBAAA;AAJJ;AAME;EACE,kBAAA;EACA,WAAA;EACA,gBAAA;EACA,2BAAA;EACA,4BAAA;EACA,mBAAA;EACA,gBAAA;EACA,UAAA;EACA,mBAAA;EACA,aAAA;EACA,iBAAA;EACA,sBAAA;AAJJ;AAKI;EACE,iBAAA;AAHN;AAME;EACE,WAAA;EACA,YAAA;EACA,cAAA;EACA,mBAAA;EACA,iBAAA;EACA,2BAAA;EACA,wCAAA;AAJJ;AAHE;EASI,iBAAA;EACA,uBAAA;EACA,sBAAA;EACA,qBAAA;AAHN;AAME;EACE,2BAAA;EACA,iBAAA;AAJJ;AAME;EACE,2BAAA;EACA,iBAAA;AAJJ;AAME;EACE,cAAA;AAJJ;AAnEC;EA4EC,mBAAA;EACA,gDAAA;EACA,kBAAA;EACA,6BAAA;EACA,kBAAA;AANF;AAOE;EAAA;IACE,2BAAA;IACA,6BAAA;EAJF;AACF;AAKE;EACE,oBAAA;AAHJ;AAKE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,cAAA;EACA,kBAAA;EACA,mBAAA;AAHJ;AAII;EAAA;IACE,eAAA;IACA,iBAAA;IACA,kBAAA;IACA,mBAAA;EADJ;AACF;AAGE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,kBAAA;EACA,2BAAA;EACA,cAAA;AADJ;AAEI;EAAA;IACE,gBAAA;IACA,eAAA;IACA,iBAAA;EACJ;AACF;AACE;EACE,4BAAA;EACA,uBAAA;EACA,aAAA;EACA,WAAA;EACA,YAAA;EACA,kBAAA;EACA,SAAA;EACA,WAAA;EACA,cAAA;EACA,cAAA;AACJ;AAhIC;EAoIC,kBAAA;EACA,mBAAA;AADF;AAEE;EAAA;IACE,mBAAA;IACA,oBAAA;EACF;AACF;AAAE;EACE,aAAA;AAEJ;AA7IC;EAgJC,kBAAA;EACA,QAAA;EACA,2BAAA;EACA,YAAA;EACA,kBAAA;EACA,eAAA;AAAF;AACE;EACE,WAAA;EACA,YAAA;AACJ;AACE;EAAA;IACE,aAAA;EAEF;AACF;AA9JC;EAgKC,mBAAA;EACA,yBAAA;EACA,aAAA;EACA,aAAA;EACA,8BAAA;EACA,qBAAA;AACF;AAAE;EAAA;IACE,aAAA;IACA,gBAAA;EAGF;AACF;AAFE;EACE,UAAA;EACA,aAAA;EACA,mBAAA;AAIJ;AAPE;EAKI,eAAA;EACA,gBAAA;AAKN;AAFE;EACE,uBAAA;EACA,aAAA;EACA,sBAAA;EACA,8BAAA;EACA,gBAAA;AAIJ;AAHI;EAAA;IACE,kBAAA;EAMJ;AACF;AAJE;EACE,eAAA;EACA,mBAAA;EACA,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,qBAAA;EACA,cAAA;AAMJ;AAJE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,2BAAA;EACA,cAAA;AAMJ;AALI;EACE,6BAAA;AAON;AAJE;EACE,kBAAA;EACA,gBAAA;EACA,eAAA;EACA,iBAAA;EACA,2BAAA;EACA,aAAA;EACA,eAAA;AAMJ;AAJE;EACE,cAAA;EACA,mBAAA;AAMJ;AAJE;EACE,cAAA;AAMJ","sourcesContent":["@ticket: ~'.xp-exitIntent';\n@containerClass: ~'@{ticket}-container';\n@glide: ~'@{ticket}-carousel';\n@carouselClass: ~'@{ticket}-carousel';\n@slideClass: ~'@{ticket}-slide';\n@arrowClass: ~'@{ticket}-arrow';\n\n@{ticket} {\n  position: fixed;\n  bottom: 40px;\n  left: 40px;\n  right: 40px;\n  z-index: 9999999999;\n  @media (max-width: 767px) {\n    bottom: 20px;\n    left: 20px;\n    right: 20px;\n  }\n}\n\n@{glide} {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n  * {\n    box-sizing: inherit;\n  }\n  &__track {\n    overflow: hidden;\n  }\n  &__slides {\n    position: relative;\n    width: 100%;\n    list-style: none;\n    backface-visibility: hidden;\n    transform-style: preserve-3d;\n    touch-action: pan-Y;\n    overflow: hidden;\n    padding: 0;\n    white-space: nowrap;\n    display: flex;\n    flex-wrap: nowrap;\n    will-change: transform;\n    &--dragging {\n      user-select: none;\n    }\n  }\n  &__slide {\n    width: 100%;\n    height: 100%;\n    flex-shrink: 0;\n    white-space: normal;\n    user-select: none;\n    -webkit-touch-callout: none;\n    -webkit-tap-highlight-color: transparent;\n    a {\n      user-select: none;\n      -webkit-user-drag: none;\n      -moz-user-select: none;\n      -ms-user-select: none;\n    }\n  }\n  &__arrows {\n    -webkit-touch-callout: none;\n    user-select: none;\n  }\n  &__bullets {\n    -webkit-touch-callout: none;\n    user-select: none;\n  }\n  &--rtl {\n    direction: rtl;\n  }\n}\n\n@{containerClass} {\n  background: #ffffff;\n  box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.226043);\n  border-radius: 5px;\n  border-top: 5px solid #d81f0d;\n  padding: 22px 15px;\n  @media (max-width: 767px) {\n    padding: 8px 15px 15px 15px;\n    border-top: 4px solid #d81f0d;\n  }\n  &__header {\n    padding-bottom: 12px;\n  }\n  &__title {\n    font-style: normal;\n    font-weight: 700;\n    font-size: 20px;\n    line-height: 25px;\n    color: #333333;\n    text-align: center;\n    padding-bottom: 3px;\n    @media (max-width: 767px) {\n      font-size: 16px;\n      line-height: 20px;\n      padding-left: 20px;\n      padding-right: 20px;\n    }\n  }\n  &__subtitle {\n    font-style: normal;\n    font-weight: 400;\n    font-size: 16px;\n    line-height: 20px;\n    text-align: center;\n    letter-spacing: 0.0928571px;\n    color: #2e2e2e;\n    @media (max-width: 767px) {\n      font-weight: 400;\n      font-size: 13px;\n      line-height: 16px;\n    }\n  }\n  &__close {\n    background-repeat: no-repeat;\n    background-color: unset;\n    border: unset;\n    width: 26px;\n    height: 26px;\n    position: absolute;\n    top: 10px;\n    right: 10px;\n    padding: unset;\n    color: #000000;\n  }\n}\n\n@{carouselClass} {\n  padding-left: 40px;\n  padding-right: 40px;\n  @media (max-width: 767px) {\n    padding-left: unset;\n    padding-right: unset;\n  }\n  &__slides {\n    margin: unset;\n  }\n}\n\n@{arrowClass} {\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  right: -15px;\n  padding: 30px 15px;\n  cursor: pointer;\n  &--left {\n    left: -15px;\n    right: unset;\n  }\n  @media (max-width: 767px) {\n    display: none;\n  }\n}\n\n@{slideClass} {\n  background: #ffffff;\n  border: 1px solid #cccccc;\n  padding: 13px;\n  display: flex;\n  justify-content: space-between;\n  text-decoration: none;\n  @media (max-width: 767px) {\n    padding: 12px;\n    min-height: 90px;\n  }\n  &__image {\n    width: 30%;\n    display: flex;\n    align-items: center;\n    img {\n      max-width: 100%;\n      max-height: 70px;\n    }\n  }\n  &__content {\n    width: calc(70% - 13px);\n    display: flex;\n    flex-direction: column;\n    justify-content: space-between;\n    padding-top: 6px;\n    @media (max-width: 767px) {\n      padding-top: unset;\n    }\n  }\n  &__title {\n    max-width: 100%;\n    white-space: normal;\n    font-style: normal;\n    font-weight: 400;\n    font-size: 14px;\n    line-height: 14px;\n    letter-spacing: 0.1px;\n    color: #333333;\n  }\n  &__old-price {\n    font-style: normal;\n    font-weight: 400;\n    font-size: 11px;\n    line-height: 14px;\n    letter-spacing: 0.0928571px;\n    color: #666666;\n    &--strike {\n      text-decoration: line-through;\n    }\n  }\n  &__new-price {\n    font-style: normal;\n    font-weight: 700;\n    font-size: 13px;\n    line-height: 14px;\n    letter-spacing: 0.0928571px;\n    display: flex;\n    flex-wrap: wrap;\n  }\n  &__price-value {\n    color: #000000;\n    padding-right: 12px;\n  }\n  &__price-saved {\n    color: #ff5858;\n  }\n}"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFdBQVcsS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFVBQVUsVUFBVSxVQUFVLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLFdBQVcsV0FBVyxLQUFLLEtBQUssV0FBVyxXQUFXLEtBQUssS0FBSyxVQUFVLEtBQUssTUFBTSxZQUFZLFdBQVcsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssV0FBVyxXQUFXLEtBQUssS0FBSyxLQUFLLFdBQVcsS0FBSyxLQUFLLFdBQVcsV0FBVyxVQUFVLFdBQVcsVUFBVSxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssVUFBVSxXQUFXLFdBQVcsV0FBVyxLQUFLLEtBQUssS0FBSyxXQUFXLFdBQVcsVUFBVSxXQUFXLFdBQVcsV0FBVyxVQUFVLEtBQUssS0FBSyxLQUFLLFdBQVcsVUFBVSxXQUFXLEtBQUssS0FBSyxLQUFLLFdBQVcsV0FBVyxVQUFVLFVBQVUsVUFBVSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsS0FBSyxNQUFNLFlBQVksV0FBVyxLQUFLLEtBQUssS0FBSyxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssVUFBVSxLQUFLLE1BQU0sWUFBWSxVQUFVLFdBQVcsVUFBVSxXQUFXLFVBQVUsS0FBSyxLQUFLLFVBQVUsVUFBVSxLQUFLLEtBQUssS0FBSyxVQUFVLEtBQUssS0FBSyxNQUFNLFlBQVksV0FBVyxVQUFVLFVBQVUsV0FBVyxXQUFXLEtBQUssS0FBSyxLQUFLLFVBQVUsV0FBVyxLQUFLLEtBQUssS0FBSyxVQUFVLFVBQVUsV0FBVyxLQUFLLEtBQUssVUFBVSxXQUFXLEtBQUssS0FBSyxXQUFXLFVBQVUsV0FBVyxXQUFXLFdBQVcsS0FBSyxLQUFLLEtBQUssV0FBVyxLQUFLLEtBQUssS0FBSyxVQUFVLFdBQVcsV0FBVyxXQUFXLFVBQVUsV0FBVyxXQUFXLFVBQVUsS0FBSyxLQUFLLFdBQVcsV0FBVyxVQUFVLFdBQVcsV0FBVyxVQUFVLEtBQUssS0FBSyxXQUFXLEtBQUssS0FBSyxXQUFX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Q0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0IsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsaUJBQWlCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FB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O0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixpQkFBaUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7Ozs7Ozs7Ozs7O0FDdFRBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw0QkFBNEI7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsdUVBQXVFO0FBQzFGO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxjQUFjO0FBQ3BCO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQixrQkFBa0I7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0ZBQWdGO0FBQ2hGO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLHdCQUF3QjtBQUMvQjtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsaUJBQWlCOztBQUVqQjtBQUNBO0FBQ0E7QUFDQSwwRUFBMEUsMEJBQTBCO0FBQ3BHLFlBQVk7QUFDWjtBQUNB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QUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFD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QTtBQUNBLGVBQWUsUUFBUTtBQUN2QixnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixRQUFRO0FBQ3hCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEIsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixRQUFRO0FBQ3hCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxRQUFRO0FBQ3BCLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsUUFBUTtBQUN4QixnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEIsWUFBWTtBQUNaOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsUUFBUTtBQUN4QixnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNB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QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0IsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsaUJBQWlCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLE9BQU87QUFDN0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixPQUFPO0FBQzdCO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTztBQUM3QjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixpQkFBaUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7Ozs7Ozs7Ozs7O0FDdFRBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw0QkFBNEI7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsdUVBQXVFO0FBQzFGO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxjQUFjO0FBQ3BCO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0RGU7QUFDZjs7QUFFQSx5Q0FBeUMsU0FBUztBQUNsRDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ1JlO0FBQ2Y7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDRmU7QUFDZjtBQUNBLG9CQUFvQixzQkFBc0I7QUFDMUM7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDaEJlO0FBQ2Y7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSw0QkFBNEIsK0JBQStCO0FBQzNEOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUM1QmU7QUFDZjtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRmlEO0FBQ1k7QUFDWTtBQUN0QjtBQUNwQztBQUNmLFNBQVMsOERBQWMsU0FBUyxvRUFBb0IsWUFBWSwwRUFBMEIsWUFBWSwrREFBZTtBQUNySDs7Ozs7Ozs7Ozs7Ozs7OztBQ05xRDtBQUN0QztBQUNmO0FBQ0Esb0NBQW9DLGdFQUFnQjtBQUNwRDtBQUNBO0FBQ0E7QUFDQSxzRkFBc0YsZ0VBQWdCO0FBQ3RHOzs7Ozs7VUNSQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBRUFDLG1EQUFNO0FBQ05DLDREQUFBLENBQW9CLFVBQUFqQyxVQUFVO0VBQUEsT0FBSUEsVUFBVSxFQUFkO0FBQUEsQ0FBOUIsRSIsInNvdXJjZXMiOlsid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BxdWJpdC9wb2xsZXIvbGliL2NyZWF0ZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AcXViaXQvcG9sbGVyL2xpYi9ldmFsdWF0ZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AcXViaXQvcG9sbGVyL2xpYi9vYnNlcnZlci5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AcXViaXQvcG9sbGVyL2xpYi9yYWYuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQHF1Yml0L3BvbGxlci9saWIvdmFsaWRfZnJhbWUuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQHF1Yml0L3BvbGxlci9saWIvdmFsaWRhdGUuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQHF1Yml0L3BvbGxlci9wb2xsZXIuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci90cmlnZ2Vycy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9jb3VudGRvd25CYW5uZXIvdmFyaWF0aW9uLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NyZWF0ZUV4cGVyaWVuY2UuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L3RyaWdnZXJzLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvdmFyaWF0aW9uLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL29wdGlvbnMuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvbWFwcGVyL2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci92YXJpYXRpb24ubGVzcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L3ZhcmlhdGlvbi5sZXNzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9icm93c2VyLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9zcmMvY3JlYXRlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9zcmMvbGV2ZWxzLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9zcmMvbG9nZ2VyL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvZHJpZnR3b29kL3NyYy9wYXR0ZXJucy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9kcmlmdHdvb2Qvc3JjL3N0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvZHJpZnR3b29kL3NyYy91dGlscy9hcmdzVG9Db21wb25lbnRzLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2RyaWZ0d29vZC9zcmMvdXRpbHMvY29tcG9zZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9kcmlmdHdvb2Qvc3JjL3V0aWxzL3JpZ2h0UGFkLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL2pzb24tYm91cm5lL2pzb24tYm91cm5lLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL3NsYXBkYXNoL2Rpc3QvaW5kZXguanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL3ZhcmlhdGlvbi5sZXNzPzNhYzgiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC92YXJpYXRpb24ubGVzcz9mZWQ0Iiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvc3luYy1wL2RlZmVyLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL3N5bmMtcC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9jb3VudGRvd25CYW5uZXIvbm9kZV9tb2R1bGVzL0BxdWJpdC91dGlscy9kb20vaW5kZXguanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL25vZGVfbW9kdWxlcy9AcXViaXQvdXRpbHMvbGliL29uY2UuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL25vZGVfbW9kdWxlcy9AcXViaXQvdXRpbHMvbGliL3Byb21pc2VkLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci9ub2RlX21vZHVsZXMvQHF1Yml0L3V0aWxzL2xpYi93aXRoUmVzdG9yZUFsbC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9jb3VudGRvd25CYW5uZXIvbm9kZV9tb2R1bGVzL3ByZWFjdC9kaXN0L3ByZWFjdC5tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL25vZGVfbW9kdWxlcy9wcmVhY3QvaG9va3MvZGlzdC9ob29rcy5tb2R1bGUuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvY291bnRkb3duQmFubmVyL25vZGVfbW9kdWxlcy9zbGFwZGFzaC9kaXN0L2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci9ub2RlX21vZHVsZXMvc3luYy1wL2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BnbGlkZWpzL2dsaWRlL2Rpc3QvZ2xpZGUuZXNtLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BxdWJpdC9jaGVjay1leGl0L2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BxdWJpdC9jaGVjay1pbmFjdGl2aXR5L2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BxdWJpdC91dGlscy9kb20vaW5kZXguanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC9ub2RlX21vZHVsZXMvQHF1Yml0L3V0aWxzL2xpYi9vbmNlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL0BxdWJpdC91dGlscy9saWIvcHJvbWlzZWQuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9zcmMvZXhwZXJpZW5jZXMvZXhpdEludGVudC9ub2RlX21vZHVsZXMvQHF1Yml0L3V0aWxzL2xpYi93aXRoUmVzdG9yZUFsbC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L25vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QubW9kdWxlLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL3ByZWFjdC9ob29rcy9kaXN0L2hvb2tzLm1vZHVsZS5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9leHBlcmllbmNlcy9leGl0SW50ZW50L25vZGVfbW9kdWxlcy9zbGFwZGFzaC9kaXN0L2luZGV4LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvbm9kZV9tb2R1bGVzL3N5bmMtcC9pbmRleC5qcyIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL25vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2VzbS9hcnJheUxpa2VUb0FycmF5LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2FycmF5V2l0aEhvbGVzLmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL2V4dGVuZHMuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vaXRlcmFibGVUb0FycmF5TGltaXQuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vbm9uSXRlcmFibGVSZXN0LmpzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lLy4vbm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvZXNtL3NsaWNlZFRvQXJyYXkuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvLi9ub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9lc20vdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkuanMiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4cGVyaWVuY2UtZW5naW5lL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhwZXJpZW5jZS1lbmdpbmUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leHBlcmllbmNlLWVuZ2luZS8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgZHJpZnR3b29kID0gcmVxdWlyZSgnZHJpZnR3b29kJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGUgKHRhcmdldHMsIG9wdGlvbnMpIHtcbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5KHRhcmdldHMpXG4gIHJldHVybiB7XG4gICAgdGFyZ2V0czogaXNBcnJheSA/IHRhcmdldHMgOiBbdGFyZ2V0c10sXG4gICAgZXZhbHVhdGVkOiBbXSxcbiAgICBpc1NpbmdsZXRvbjogIWlzQXJyYXksXG4gICAgcmVzb2x2ZTogb3B0aW9ucy5yZXNvbHZlLFxuICAgIHJlamVjdDogb3B0aW9ucy5yZWplY3QsXG4gICAgbG9nZ2VyOiBvcHRpb25zLmxvZ2dlciB8fCBkcmlmdHdvb2QoJ3BvbGxlcicpLFxuICAgIHRpbWVvdXQ6IG9wdGlvbnMudGltZW91dCxcbiAgICBzdG9wT25FcnJvcjogb3B0aW9ucy5zdG9wT25FcnJvcixcbiAgICBxdWVyeUFsbDogb3B0aW9ucy5xdWVyeUFsbFxuICB9XG59XG4iLCJ2YXIgZ2V0ID0gcmVxdWlyZSgnc2xhcGRhc2gnKS5nZXRcbnZhciB1bmRlZiA9IHZvaWQgMFxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV2YWx1YXRlICh0YXJnZXQsIHF1ZXJ5QWxsKSB7XG4gIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSByZXR1cm4gdGFyZ2V0KCkgfHwgdW5kZWZcbiAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnICYmIHRhcmdldC5pbmRleE9mKCd3aW5kb3cuJykgPT09IDApIHJldHVybiBnZXQod2luZG93LCB0YXJnZXQpXG4gIGlmIChxdWVyeUFsbCkge1xuICAgIHZhciBpdGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGFyZ2V0KVxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPyBpdGVtcyA6IHVuZGVmXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KSB8fCB1bmRlZlxuICB9XG59XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVPYnNlcnZlciAoY2IpIHtcbiAgdmFyIE9ic2VydmVyID0gd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXIgfHwgd2luZG93LldlYktpdE11dGF0aW9uT2JzZXJ2ZXJcbiAgdmFyIHN1cHBvcnRlZCA9IEJvb2xlYW4oT2JzZXJ2ZXIgJiYgIWlzVHJpZGVudCgpKVxuICB2YXIgZGlzYWJsZWQgPSAhc3VwcG9ydGVkXG4gIHZhciBtb2JzZXJ2ZXIgPSBzdXBwb3J0ZWQgJiYgbmV3IE9ic2VydmVyKGNiKVxuICB2YXIgYWN0aXZlID0gZmFsc2VcblxuICBmdW5jdGlvbiBlbmFibGUgKCkge1xuICAgIGlmIChzdXBwb3J0ZWQpIGRpc2FibGVkID0gZmFsc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpc2FibGUgKCkge1xuICAgIHN0b3AoKVxuICAgIGRpc2FibGVkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnQgKCkge1xuICAgIGlmIChhY3RpdmUgfHwgZGlzYWJsZWQpIHJldHVyblxuICAgIG1vYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwge1xuICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgc3VidHJlZTogdHJ1ZVxuICAgIH0pXG4gICAgYWN0aXZlID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gc3RvcCAoKSB7XG4gICAgaWYgKCFhY3RpdmUgfHwgZGlzYWJsZWQpIHJldHVyblxuICAgIG1vYnNlcnZlci5kaXNjb25uZWN0KClcbiAgICBhY3RpdmUgPSBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBlbmFibGU6IGVuYWJsZSxcbiAgICBkaXNhYmxlOiBkaXNhYmxlLFxuICAgIHN0YXJ0OiBzdGFydCxcbiAgICBzdG9wOiBzdG9wXG4gIH1cbn1cblxuZnVuY3Rpb24gaXNUcmlkZW50ICgpIHtcbiAgdmFyIGFnZW50ID0gXy5nZXQod2luZG93LCAnbmF2aWdhdG9yLnVzZXJBZ2VudCcpIHx8ICcnXG4gIHJldHVybiBhZ2VudC5pbmRleE9mKCdUcmlkZW50LzcuMCcpID4gLTFcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmFmIChmbikge1xuICByZXR1cm4gZ2V0UmFmKCkoZm4pXG59XG5cbmZ1bmN0aW9uIGdldFJhZiAoKSB7XG4gIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICBkZWZlclxufVxuXG5mdW5jdGlvbiBkZWZlciAoY2FsbGJhY2spIHtcbiAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDApXG59XG4iLCJ2YXIgaW5kZXhPZiA9IHJlcXVpcmUoJ3NsYXBkYXNoJykuaW5kZXhPZlxudmFyIEZQUyA9IDYwXG5cbmZ1bmN0aW9uIHZhbGlkRnJhbWUgKHRpY2tDb3VudCkge1xuICByZXR1cm4gaW5kZXhPZihnZXRWYWxpZEZyYW1lcygpLCB0aWNrQ291bnQgJSBGUFMpICE9PSAtMVxufVxuXG5mdW5jdGlvbiBnZXRWYWxpZEZyYW1lcyAoKSB7XG4gIHJldHVybiBbMSwgMiwgMywgNSwgOCwgMTMsIDIxLCAzNCwgNTVdXG59XG5cbm1vZHVsZS5leHBvcnRzID0gdmFsaWRGcmFtZVxubW9kdWxlLmV4cG9ydHMuZ2V0VmFsaWRGcmFtZXMgPSBnZXRWYWxpZEZyYW1lc1xuIiwidmFyIF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdmFsaWRhdGUgKHRhcmdldHMsIG9wdGlvbnMpIHtcbiAgaWYgKGFyZVRhcmdldHNJbnZhbGlkKHRhcmdldHMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ1BvbGxlcjogRXhwZWN0ZWQgZmlyc3QgYXJndW1lbnQgdG8gYmUgYSBzZWxlY3RvciBzdHJpbmcgJyArXG4gICAgICAnb3IgYXJyYXkgY29udGFpbmluZyBzZWxlY3RvcnMsIHdpbmRvdyB2YXJpYWJsZXMgb3IgZnVuY3Rpb25zLidcbiAgICApXG4gIH1cbiAgaWYgKG9wdGlvbnMgIT09IHZvaWQgMCkge1xuICAgIHZhciBvcHRpb25zSXNGdW5jdGlvbiA9IHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nXG4gICAgaWYgKG9wdGlvbnNJc0Z1bmN0aW9uIHx8ICFfLmlzT2JqZWN0KG9wdGlvbnMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdQb2xsZXI6IEV4cGVjdGVkIHNlY29uZCBhcmd1bWVudCB0byBiZSBhbiBvcHRpb25zIG9iamVjdC4gJyArXG4gICAgICAgICdQb2xsZXIgaGFzIGEgbmV3IEFQSSwgc2VlIGh0dHBzOi8vZG9jcy5xdWJpdC5jb20vY29udGVudC9kZXZlbG9wZXJzL2V4cGVyaWVuY2VzLXBvbGxlcidcbiAgICAgIClcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXJlVGFyZ2V0c0ludmFsaWQgKHRhcmdldHMpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0cykpIHtcbiAgICByZXR1cm4gISFfLmZpbmQodGFyZ2V0cywgaXNJbnZhbGlkVHlwZSlcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gaXNJbnZhbGlkVHlwZSh0YXJnZXRzKVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzSW52YWxpZFR5cGUgKHRhcmdldCkge1xuICB2YXIgdGFyZ2V0VHlwZSA9IHR5cGVvZiB0YXJnZXRcbiAgcmV0dXJuIHRhcmdldFR5cGUgIT09ICdzdHJpbmcnICYmIHRhcmdldFR5cGUgIT09ICdmdW5jdGlvbidcbn1cbiIsInZhciBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxudmFyIGRlZmVyID0gcmVxdWlyZSgnc3luYy1wL2RlZmVyJylcbnZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByZXF1aXJlKCcuL2xpYi9yYWYnKVxudmFyIHZhbGlkRnJhbWUgPSByZXF1aXJlKCcuL2xpYi92YWxpZF9mcmFtZScpXG52YXIgY3JlYXRlT2JzZXJ2ZXIgPSByZXF1aXJlKCcuL2xpYi9vYnNlcnZlcicpXG52YXIgZXZhbHVhdGUgPSByZXF1aXJlKCcuL2xpYi9ldmFsdWF0ZScpXG52YXIgdmFsaWRhdGUgPSByZXF1aXJlKCcuL2xpYi92YWxpZGF0ZScpXG52YXIgY3JlYXRlID0gcmVxdWlyZSgnLi9saWIvY3JlYXRlJylcbnZhciBsb2dnZXIgPSByZXF1aXJlKCdkcmlmdHdvb2QnKSgncG9sbGVyJylcblxuLyoqXG4gKiBDb25zdGFudHMgLSB0aGVzZSBhcmUgbm90IGNvbmZpZ3VyYWJsZSB0b1xuICogbWFrZSBwb2xsaW5nIG1vcmUgZWZmaWNpZW50IGJ5IHJldXNpbmcgdGhlXG4gKiBzYW1lIGdsb2JhbCB0aW1lb3V0LlxuICovXG52YXIgSU5JVElBTF9USUNLID0gTWF0aC5yb3VuZCgxMDAwIC8gNjApIC8vIFRoZSBpbml0aWFsIHRpY2sgaW50ZXJ2YWwgZHVyYXRpb24gYmVmb3JlIHdlIHN0YXJ0IGJhY2tpbmcgb2ZmIChtcylcbnZhciBJTkNSRUFTRV9SQVRFID0gMS41IC8vIFRoZSBiYWNrb2ZmIG11bHRpcGxpZXJcbnZhciBCQUNLT0ZGX1RIUkVTSE9MRCA9IE1hdGgucm91bmQoKDMgKiAxMDAwKSAvICgxMDAwIC8gNjApKSAvLyBIb3cgbWFueSB0aWNrcyBiZWZvcmUgd2Ugc3RhcnQgYmFja2luZyBvZmZcbnZhciBERUZBVUxUUyA9IHtcbiAgbG9nZ2VyOiBsb2dnZXIsXG4gIHRpbWVvdXQ6IDE1MDAwLCAvLyBIb3cgbG9uZyBiZWZvcmUgd2Ugc3RvcCBwb2xsaW5nIChtcylcbiAgc3RvcE9uRXJyb3I6IGZhbHNlIC8vIFdoZXRoZXIgdG8gc3RvcCBhbmQgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIGV2YXVsYXRpb24gdGhyb3dzXG59XG4vKipcbiAqIEdsb2JhbHNcbiAqL1xudmFyIHRpY2tDb3VudCwgY3VycmVudFRpY2tEZWxheVxudmFyIHF1ZXVlID0gW11cbnZhciBvYnNlcnZlciA9IGNyZWF0ZU9ic2VydmVyKHRvY2spXG5cbi8qKlxuICogTWFpbiBwb2xsZXIgbWV0aG9kIHRvIHJlZ2lzdGVyICd0YXJnZXRzJyB0byBwb2xsIGZvclxuICogYW5kIGEgY2FsbGJhY2sgd2hlbiBhbGwgdGFyZ2V0cyB2YWxpZGF0ZWQgYW5kIGNvbXBsZXRlXG4gKiAndGFyZ2V0cycgY2FuIGJlIG9uZSBvZiB0aGUgZm9sbG93aW5nIGZvcm1hdHM6XG4gKiAgIC0gYSBzZWxlY3RvciBzdHJpbmcgZS5nLiAnYm9keSA+IHNwYW4uZ3JpZDE1J1xuICogICAtIGEgd2luZG93IHZhcmlhYmxlIGZvcm1hdHRlZCBhcyBhIHN0cmluZyBlLmcuICd3aW5kb3cudW5pdmVyc2FsX3ZhcmlhYmxlJ1xuICogICAtIGEgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhIGNvbmRpdGlvbiBmb3Igd2hpY2ggdG8gc3RvcCB0aGUgcG9sbGluZyBlLmcuXG4gKiAgICAgZnVuY3Rpb24gKCkge1xuICogICAgICAgcmV0dXJuICQoJy5zb21lLWNsYXNzJykubGVuZ3RoID09PSAyXG4gKiAgICAgfVxuICogICAtIGFuIGFycmF5IG9mIGFueSBvZiB0aGUgYWJvdmUgZm9ybWF0c1xuICovXG5cbmZ1bmN0aW9uIHBvbGxlciAodGFyZ2V0cywgb3B0cykge1xuICB2YXIgb3B0aW9ucyA9IF8uYXNzaWduKHt9LCBERUZBVUxUUywgb3B0cywgZGVmZXIoKSlcblxuICB0cnkge1xuICAgIHZhbGlkYXRlKHRhcmdldHMsIG9wdHMpXG5cbiAgICB2YXIgaXRlbSA9IGNyZWF0ZSh0YXJnZXRzLCBvcHRpb25zKVxuXG4gICAgc3RhcnQoKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgIHN0b3A6IHN0b3AsXG4gICAgICB0aGVuOiBvcHRpb25zLnByb21pc2UudGhlbixcbiAgICAgIGNhdGNoOiBvcHRpb25zLnByb21pc2UuY2F0Y2hcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nRXJyb3IoZXJyb3IsIG9wdGlvbnMpXG4gIH1cblxuICBmdW5jdGlvbiBzdGFydCAoKSB7XG4gICAgcmVnaXN0ZXIoaXRlbSlcbiAgICByZXR1cm4gb3B0aW9ucy5wcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiBzdG9wICgpIHtcbiAgICByZXR1cm4gdW5yZWdpc3RlcihpdGVtKVxuICB9XG59XG5cbmZ1bmN0aW9uIHRpY2sgKCkge1xuICB0aWNrQ291bnQgKz0gMVxuICB2YXIgbmV4dCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB2YXIgc2hvdWxkQmFja29mZiA9IHRpY2tDb3VudCA+PSBCQUNLT0ZGX1RIUkVTSE9MRFxuICBpZiAoc2hvdWxkQmFja29mZikge1xuICAgIGN1cnJlbnRUaWNrRGVsYXkgPSBjdXJyZW50VGlja0RlbGF5ICogSU5DUkVBU0VfUkFURVxuICAgIG5leHQgPSB3aW5kb3cuc2V0VGltZW91dFxuICB9XG4gIGlmIChzaG91bGRCYWNrb2ZmIHx8IHZhbGlkRnJhbWUodGlja0NvdW50KSkge1xuICAgIHRvY2soKVxuICB9XG4gIGlmICghaXNBY3RpdmUoKSkgcmV0dXJuXG4gIHJldHVybiBuZXh0KHRpY2ssIGN1cnJlbnRUaWNrRGVsYXkpXG59XG5cbi8qKlxuICogTG9vcCB0aHJvdWdoIGFsbCByZWdpc3RlcmVkIGl0ZW1zLCBwb2xsaW5nIGZvciBzZWxlY3RvcnMgb3IgZXhlY3V0aW5nIGZpbHRlciBmdW5jdGlvbnNcbiAqL1xuZnVuY3Rpb24gdG9jayAoKSB7XG4gIHZhciByZWFkeSA9IF8uZmlsdGVyKHF1ZXVlLCBldmFsdWF0ZVF1ZXVlKVxuXG4gIHdoaWxlIChyZWFkeS5sZW5ndGgpIHJlc29sdmUocmVhZHkucG9wKCkpXG5cbiAgZnVuY3Rpb24gZXZhbHVhdGVRdWV1ZSAoaXRlbSkge1xuICAgIHZhciBpLCByZXN1bHRcbiAgICB2YXIgY2FjaGVJbmRleCA9IGl0ZW0uZXZhbHVhdGVkLmxlbmd0aFxuICAgIHRyeSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgaXRlbS50YXJnZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpID49IGl0ZW0uZXZhbHVhdGVkLmxlbmd0aCkge1xuICAgICAgICAgIHJlc3VsdCA9IGV2YWx1YXRlKGl0ZW0udGFyZ2V0c1tpXSwgaXRlbS5xdWVyeUFsbClcbiAgICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGl0ZW0ubG9nZ2VyLmluZm8oJ1BvbGxlcjogcmVzb2x2ZWQgJyArIFN0cmluZyhpdGVtLnRhcmdldHNbaV0pKVxuICAgICAgICAgICAgaXRlbS5ldmFsdWF0ZWQucHVzaChyZXN1bHQpXG4gICAgICAgICAgfSBlbHNlIGlmICgobmV3IERhdGUoKSAtIGl0ZW0uc3RhcnQpID49IGl0ZW0udGltZW91dCkge1xuICAgICAgICAgICAgLy8gSXRlbSBoYXMgdGltZWQgb3V0LCByZXNvbHZlIGl0ZW1cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIENhbm5vdCByZXNvbHZlIGl0ZW0sIGV4aXRcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBFdmVyeXRoaW5nIGhhcyBiZWVuIGZvdW5kLCBsZXRzIHJlLWV2YWx1YXRlIGNhY2hlZCBlbnRyaWVzXG4gICAgICAvLyB0byBtYWtlIHN1cmUgdGhleSBoYXZlIG5vdCBnb25lIHN0YWxlXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2FjaGVJbmRleDsgaSsrKSB7XG4gICAgICAgIHJlc3VsdCA9IGV2YWx1YXRlKGl0ZW0udGFyZ2V0c1tpXSwgaXRlbS5xdWVyeUFsbClcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgaXRlbS5ldmFsdWF0ZWQgPSBpdGVtLmV2YWx1YXRlZC5zbGljZSgwLCBpKVxuICAgICAgICAgIGl0ZW0ubG9nZ2VyLmluZm8oJ1BvbGxlcjogaXRlbSB3ZW50IHN0YWxlOiAnICsgU3RyaW5nKGl0ZW0udGFyZ2V0c1tpXSkpXG4gICAgICAgICAgLy8gQ2Fubm90IHJlc29sdmUgaXRlbSwgZXhpdFxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW0uZXZhbHVhdGVkW2ldID0gcmVzdWx0XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQWxsIHRhcmdldHMgZXZhbHVhdGVkLCBhZGQgdG8gcmVzb2x2ZWQgbGlzdFxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nRXJyb3IoZXJyb3IsIGl0ZW0pXG4gICAgICAvLyBDYW5ub3QgcmVzb2x2ZSBpdGVtLCBleGl0XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXQgKCkge1xuICB0aWNrQ291bnQgPSAwXG4gIGN1cnJlbnRUaWNrRGVsYXkgPSBJTklUSUFMX1RJQ0tcbn1cblxuZnVuY3Rpb24gcmVzZXQgKCkge1xuICBpbml0KClcbiAgb2JzZXJ2ZXIuc3RvcCgpXG4gIHF1ZXVlID0gW11cbn1cblxuZnVuY3Rpb24gaXNBY3RpdmUgKCkge1xuICByZXR1cm4gISFxdWV1ZS5sZW5ndGhcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXIgKGl0ZW0pIHtcbiAgdmFyIGFjdGl2ZSA9IGlzQWN0aXZlKClcblxuICBpbml0KClcblxuICBpdGVtLnN0YXJ0ID0gbmV3IERhdGUoKVxuXG4gIHF1ZXVlID0gXy5maWx0ZXIocXVldWUsIGZ1bmN0aW9uIChpKSB7XG4gICAgcmV0dXJuIGkgIT09IGl0ZW1cbiAgfSlcblxuICBxdWV1ZS5wdXNoKGl0ZW0pXG5cbiAgaWYgKCFhY3RpdmUpIHtcbiAgICBpdGVtLmxvZ2dlci5pbmZvKCdQb2xsZXI6IHN0YXJ0ZWQnKVxuICAgIHRpY2soKVxuICAgIG9ic2VydmVyLnN0YXJ0KClcbiAgfVxufVxuXG5mdW5jdGlvbiB1bnJlZ2lzdGVyIChpdGVtKSB7XG4gIHF1ZXVlID0gXy5maWx0ZXIocXVldWUsIGZ1bmN0aW9uIChpKSB7XG4gICAgcmV0dXJuIGkgIT09IGl0ZW1cbiAgfSlcbiAgaWYgKCFpc0FjdGl2ZSgpKSB7XG4gICAgb2JzZXJ2ZXIuc3RvcCgpXG4gIH1cbiAgcmV0dXJuIGl0ZW0udGFyZ2V0c1tpdGVtLmV2YWx1YXRlZC5sZW5ndGhdXG59XG5cbmZ1bmN0aW9uIHJlc29sdmUgKGl0ZW0pIHtcbiAgdmFyIHJlbWFpbmRlciA9IHVucmVnaXN0ZXIoaXRlbSlcbiAgaWYgKHJlbWFpbmRlcikge1xuICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcignUG9sbGVyOiBjb3VsZCBub3QgcmVzb2x2ZSAnICsgU3RyaW5nKHJlbWFpbmRlcikpXG4gICAgZXJyb3IuY29kZSA9ICdFUE9MTEVSOlRJTUVPVVQnXG4gICAgaXRlbS5sb2dnZXIuaW5mbyhlcnJvci5tZXNzYWdlKVxuICAgIGl0ZW0ucmVqZWN0KGVycm9yKVxuICB9IGVsc2Uge1xuICAgIHZhciBldmFsdWF0ZWQgPSBpdGVtLmlzU2luZ2xldG9uXG4gICAgICA/IGl0ZW0uZXZhbHVhdGVkWzBdXG4gICAgICA6IGl0ZW0uZXZhbHVhdGVkXG4gICAgaXRlbS5yZXNvbHZlKGV2YWx1YXRlZClcbiAgfVxuXG4gIGlmICghaXNBY3RpdmUoKSkge1xuICAgIGl0ZW0ubG9nZ2VyLmluZm8oJ1BvbGxlcjogY29tcGxldGUnKVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvZ0Vycm9yIChlcnJvciwgb3B0aW9ucykge1xuICBlcnJvci5jb2RlID0gJ0VQT0xMRVInXG4gIGlmIChvcHRpb25zLmxvZ2dlcikgb3B0aW9ucy5sb2dnZXIuZXJyb3IoZXJyb3IpXG4gIGlmIChvcHRpb25zLnN0b3BPbkVycm9yKSB0aHJvdyBlcnJvclxufVxuXG5wb2xsZXIuaXNBY3RpdmUgPSBpc0FjdGl2ZVxucG9sbGVyLnJlc2V0ID0gcmVzZXRcblxucG9sbGVyLmxvZ2dlciA9IGxvZ2dlclxucG9sbGVyLmRpc2FibGVNdXRhdGlvbk9ic2VydmVyID0gb2JzZXJ2ZXIuZGlzYWJsZVxucG9sbGVyLmRlZmF1bHRzID0gZnVuY3Rpb24gKG5ld0RlZmF1bHRzKSB7XG4gIF8uYXNzaWduKERFRkFVTFRTLCBuZXdEZWZhdWx0cylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwb2xsZXJcbiIsImltcG9ydCB0cmlnZ2VycyBmcm9tICcuL3RyaWdnZXJzJ1xuaW1wb3J0IHZhcmlhdGlvbiBmcm9tICcuL3ZhcmlhdGlvbidcbmV4cG9ydCBkZWZhdWx0IHsgdHJpZ2dlcnMsIHZhcmlhdGlvbiB9XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmlnZ2VycyAob3B0aW9ucywgY2IpIHtcbiAgY29uc3QgeyBsb2csIHN0YXRlLCBwb2xsIH0gPSBvcHRpb25zXG5cbiAgbG9nLmluZm8oJ1RyaWdnZXJzJylcblxuICByZXR1cm4gcG9sbEZvckVsZW1lbnRzKCkudGhlbihjYilcblxuICBmdW5jdGlvbiBwb2xsRm9yRWxlbWVudHMgKCkge1xuICAgIGxvZy5pbmZvKCdQb2xsaW5nIGZvciBlbGVtZW50cycpXG4gICAgcmV0dXJuIHBvbGwoJyNhdGhlbWVzLWJsb2Nrcy1ibG9jay00MjhkMmQ1NCcpLnRoZW4oYW5jaG9yID0+IHtcbiAgICAgIHN0YXRlLnNldCgnYW5jaG9yJywgYW5jaG9yKVxuICAgIH0pXG4gIH1cbn1cbiIsImltcG9ydCB7IHJlbmRlciwgaCB9IGZyb20gJ3ByZWFjdCdcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdwcmVhY3QvaG9va3MnXG5pbXBvcnQgdXRpbHMgZnJvbSAnQHF1Yml0L3V0aWxzJ1xuaW1wb3J0ICcuL3ZhcmlhdGlvbi5sZXNzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB2YXJpYXRpb24gKG9wdGlvbnMpIHtcbiAgY29uc3QgeyBpbnNlcnRBZnRlciB9ID0gdXRpbHMoKVxuICBjb25zdCB7IGxvZywgc3RhdGUgfSA9IG9wdGlvbnNcbiAgY29uc3QgcHJlZml4ID0gJ3hwLWNvdW50ZG93bi1iYW5uZXInXG4gIGNvbnN0IGFuY2hvciA9IHN0YXRlLmdldCgnYW5jaG9yJylcbiAgY29uc3QgY29weSA9ICdIdXJyeSEgT3VyIHNhbGUgZW5kcyBzb29uISdcblxuICBsb2cuaW5mbygnVmFyaWF0aW9uJylcblxuICByZXR1cm4gcmVuZGVyUGxhY2VtZW50KClcblxuICBmdW5jdGlvbiByZW5kZXJQbGFjZW1lbnQgKCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gcHJlZml4XG4gICAgcmVuZGVyKDxDb250YWluZXIgLz4sIGVsZW1lbnQpXG4gICAgaW5zZXJ0QWZ0ZXIoYW5jaG9yLCBlbGVtZW50KVxuICB9XG5cbiAgZnVuY3Rpb24gQ29udGFpbmVyICgpIHtcbiAgICBjb25zdCBjb250YWluZXJDbGFzcyA9IGAke3ByZWZpeH0tY29udGFpbmVyYFxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y29udGFpbmVyQ2xhc3N9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7Y29udGFpbmVyQ2xhc3N9X190aXRsZWB9Pntjb3B5fTwvZGl2PlxuICAgICAgICA8Q291bnRkb3duIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtjb250YWluZXJDbGFzc31fX2N0YWB9PkZpbmQgb3V0IG1vcmU8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIHVzZUNvdW50ZG93blRpbWVyIChkYXRlKSB7XG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlVGltZUxlZnQgKCkge1xuICAgICAgY29uc3QgZGlmZmVyZW5jZSA9ICtuZXcgRGF0ZShkYXRlKSAtICtuZXcgRGF0ZSgpXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRheXM6IE1hdGguZmxvb3IoZGlmZmVyZW5jZSAvICgxMDAwICogNjAgKiA2MCAqIDI0KSksXG4gICAgICAgIGhvdXJzOiBNYXRoLmZsb29yKChkaWZmZXJlbmNlIC8gKDEwMDAgKiA2MCAqIDYwKSkgJSAyNCksXG4gICAgICAgIG1pbnV0ZXM6IE1hdGguZmxvb3IoKGRpZmZlcmVuY2UgLyAxMDAwIC8gNjApICUgNjApLFxuICAgICAgICBzZWNvbmRzOiBNYXRoLmZsb29yKChkaWZmZXJlbmNlIC8gMTAwMCkgJSA2MClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBbdGltZUxlZnQsIHNldFRpbWVMZWZ0XSA9IHVzZVN0YXRlKGNhbGN1bGF0ZVRpbWVMZWZ0KCkpXG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2V0VGltZUxlZnQoY2FsY3VsYXRlVGltZUxlZnQoKSlcbiAgICAgIH0sIDEwMDApXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB0aW1lTGVmdFxuICB9XG5cbiAgZnVuY3Rpb24gQ291bnRkb3duICgpIHtcbiAgICBjb25zdCBjb3VudGRvd25DbGFzcyA9IGAke3ByZWZpeH0tY291bnRkb3duYFxuICAgIGNvbnN0IHRpbWVMZWZ0ID0gdXNlQ291bnRkb3duVGltZXIoYERlY2VtYmVyIDI1LCAyMDIyYClcbiAgICBjb25zdCB0aW1lckNvbXBvbmVudHMgPSBPYmplY3Qua2V5cyh0aW1lTGVmdCkubWFwKGludGVydmFsID0+IChcbiAgICAgIDxzcGFuPlxuICAgICAgICB7dGltZUxlZnRbaW50ZXJ2YWxdfSB7aW50ZXJ2YWx9eycgJ31cbiAgICAgIDwvc3Bhbj5cbiAgICApKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjb3VudGRvd25DbGFzc30+XG4gICAgICAgIHt0aW1lckNvbXBvbmVudHMubGVuZ3RoID8gdGltZXJDb21wb25lbnRzIDogPHNwYW4+VGltZSdzIHVwITwvc3Bhbj59XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn1cbiIsImltcG9ydCBvcHRpb25zIGZyb20gJy4vb3B0aW9ucydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHsgdHJpZ2dlcnMsIHZhcmlhdGlvbiB9KSB7XG5cdHJldHVybiAoKSA9PiB0cmlnZ2VycyhvcHRpb25zLCAoKSA9PiB2YXJpYXRpb24ob3B0aW9ucykpXG59IiwiaW1wb3J0IHRyaWdnZXJzIGZyb20gJy4vdHJpZ2dlcnMnXG5pbXBvcnQgdmFyaWF0aW9uIGZyb20gJy4vdmFyaWF0aW9uJ1xuZXhwb3J0IGRlZmF1bHQgeyB0cmlnZ2VycywgdmFyaWF0aW9uIH1cbiIsImltcG9ydCBQcm9taXNlIGZyb20gJ3N5bmMtcCdcbmltcG9ydCBjaGVja0luYWN0aXZpdHkgZnJvbSAnQHF1Yml0L2NoZWNrLWluYWN0aXZpdHknXG5pbXBvcnQgY2hlY2tFeGl0IGZyb20gJ0BxdWJpdC9jaGVjay1leGl0J1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmlnZ2VycyAob3B0aW9ucywgY2IpIHtcbiAgY29uc3QgeyBsb2csIHBvbGwsIHN0YXRlIH0gPSBvcHRpb25zXG4gIGNvbnN0IGluYWN0aXZpdHlUaW1lID0gMTBcblxuICByZXR1cm4gcG9sbEZvckVsZW1lbnRzKCkudGhlbihjaGVja0RldmljZVR5cGUpXG4gICAgLnRoZW4oY2hlY2tGb3JFeGl0SW50ZW50T3JJbmFjdGl2aXR5KVxuICAgIC50aGVuKGNiKVxuXG4gIGZ1bmN0aW9uIHBvbGxGb3JFbGVtZW50cyAoKSB7XG4gICAgcmV0dXJuIHBvbGwoJ2JvZHknKS50aGVuKGFuY2hvciA9PiB7XG4gICAgICBzdGF0ZS5zZXQoJ2FuY2hvcicsIGFuY2hvcilcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tEZXZpY2VUeXBlICgpIHtcbiAgICBsb2cuaW5mbygnQ2hlY2tpbmcgZGV2aWNlIHR5cGUnKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGNvbnN0IGlzTW9iaWxlT3JUYWJsZXQgPSAvQW5kcm9pZHx3ZWJPU3xpUGhvbmV8aVBhZHxpUG9kfEJsYWNrQmVycnl8SUVNb2JpbGV8T3BlcmEgTWluaS9pLnRlc3QoXG4gICAgICAgIG5hdmlnYXRvci51c2VyQWdlbnRcbiAgICAgIClcbiAgICAgIHJldHVybiByZXNvbHZlKGlzTW9iaWxlT3JUYWJsZXQpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrRm9yRXhpdEludGVudE9ySW5hY3Rpdml0eSAoaXNNb2JpbGVPclRhYmxldCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGlmIChpc01vYmlsZU9yVGFibGV0KSB7XG4gICAgICAgIGxvZy5pbmZvKCdDaGVja2luZyBmb3IgaW5hY3Rpdml0eScpXG4gICAgICAgIHJldHVybiBjaGVja0luYWN0aXZpdHkoaW5hY3Rpdml0eVRpbWUsIHJlc29sdmUpXG4gICAgICB9XG4gICAgICBsb2cuaW5mbygnQ2hlY2tpbmcgZm9yIGV4aXQgaW50ZW50JylcbiAgICAgIGNvbnN0IGV4aXRJbnRlbnQgPSBjaGVja0V4aXQocmVzb2x2ZSlcbiAgICAgIGV4aXRJbnRlbnQuaW5pdCgpXG4gICAgfSlcbiAgfVxufVxuIiwiaW1wb3J0IHsgcmVuZGVyLCBoIH0gZnJvbSAncHJlYWN0J1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdwcmVhY3QvaG9va3MnXG5pbXBvcnQgdXRpbHMgZnJvbSAnQHF1Yml0L3V0aWxzJ1xuaW1wb3J0IEdsaWRlIGZyb20gJ0BnbGlkZWpzL2dsaWRlJ1xuaW1wb3J0ICcuL3ZhcmlhdGlvbi5sZXNzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB2YXJpYXRpb24gKG9wdGlvbnMpIHtcbiAgY29uc3QgeyBhcHBlbmRDaGlsZCB9ID0gdXRpbHMoKVxuICBjb25zdCB7IGxvZywgc3RhdGUgfSA9IG9wdGlvbnNcbiAgY29uc3QgYW5jaG9yID0gc3RhdGUuZ2V0KCdhbmNob3InKVxuICBjb25zdCBwcmVmaXggPSAneHAtZXhpdEludGVudCdcbiAgY29uc3QgY29udGVudCA9IHtcbiAgICBoZWFkbGluZTogJ1dhaXQhIEJlZm9yZSB5b3UgZ28uLi4nLFxuICAgIHN1YnRpdGxlOiAnWW91IG1heSBhbHNvIGxpa2UnLFxuICAgIHJlY3M6IFtcbiAgICAgIHsgdGl0bGU6ICdQcm9kdWN0IFRpdGxlJyB9LFxuICAgICAgeyB0aXRsZTogJ1Byb2R1Y3QgVGl0bGUnIH0sXG4gICAgICB7IHRpdGxlOiAnUHJvZHVjdCBUaXRsZScgfSxcbiAgICAgIHsgdGl0bGU6ICdQcm9kdWN0IFRpdGxlJyB9LFxuICAgICAgeyB0aXRsZTogJ1Byb2R1Y3QgVGl0bGUnIH1cbiAgICBdXG4gIH1cblxuICBjb25zdCBnbGlkZU9wdGlvbnMgPSB7XG4gICAgdHlwZTogJ3NsaWRlcicsXG4gICAgYm91bmQ6IHRydWUsXG4gICAgcGVyVmlldzogMy41LFxuICAgIGdhcDogOCxcbiAgICBzY3JvbGxMb2NrOiB0cnVlLFxuICAgIHJld2luZDogZmFsc2UsXG4gICAgYnJlYWtwb2ludHM6IHtcbiAgICAgIDc2Nzoge1xuICAgICAgICBwZXJWaWV3OiAxLjI1LFxuICAgICAgICBnYXA6IDhcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmlyZSgpXG5cbiAgZnVuY3Rpb24gZmlyZSAoKSB7XG4gICAgbG9nLmluZm8oJ1J1bm5pbmcgZXhwZXJpZW5jZScpXG4gICAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQoKVxuICAgIHJlbmRlclBsYWNlbWVudChlbGVtZW50KVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRWxlbWVudCAoKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKHByZWZpeClcbiAgICBhcHBlbmRDaGlsZChhbmNob3IsIGVsZW1lbnQpXG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbmRlclBsYWNlbWVudCAoZWxlbWVudCkge1xuICAgIHJlbmRlcihcbiAgICAgIDxQbGFjZW1lbnQ+XG4gICAgICAgIDxDYXJvdXNlbCAvPlxuICAgICAgPC9QbGFjZW1lbnQ+LFxuICAgICAgZWxlbWVudFxuICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIFBsYWNlbWVudCAoeyBjaGlsZHJlbiB9KSB7XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3MgPSBgJHtwcmVmaXh9LWNvbnRhaW5lcmBcblxuICAgIGNvbnN0IGhhbmRsZUNsb3NlID0gKCkgPT4ge1xuICAgICAgY29uc3QgZXhwZXJpZW5jZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke2NvbnRhaW5lckNsYXNzfWApXG4gICAgICBleHBlcmllbmNlLnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoZXhwZXJpZW5jZSlcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NvbnRhaW5lckNsYXNzfT5cbiAgICAgICAgPGRpdiBjbGFzcz17YCR7Y29udGFpbmVyQ2xhc3N9X19oZWFkZXJgfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7Y29udGFpbmVyQ2xhc3N9X190aXRsZWB9Pntjb250ZW50LmhlYWRsaW5lfTwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtjb250YWluZXJDbGFzc31fX3N1YnRpdGxlYH0+e2NvbnRlbnQuc3VidGl0bGV9PC9kaXY+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgJHtjb250YWluZXJDbGFzc31fX2Nsb3NlYH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUNsb3NlfVxuICAgICAgICAgID5YPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICBmdW5jdGlvbiBDYXJvdXNlbCAoKSB7XG4gICAgY29uc3QgY2Fyb3VzZWxDbGFzcyA9IGAke3ByZWZpeH0tY2Fyb3VzZWxgXG4gICAgY29uc3QgY2Fyb3VzZWxDb250YWluZXIgPSB1c2VSZWYoKVxuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgIGNvbnN0IGdsaWRlID0gbmV3IEdsaWRlKGAuJHtjYXJvdXNlbENsYXNzfWAsIGdsaWRlT3B0aW9ucylcbiAgICAgIGdsaWRlLm1vdW50KClcbiAgICAgIHJldHVybiAoKSA9PiBnbGlkZS5kZXN0cm95KClcbiAgICB9LCBbXSlcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzPXtjYXJvdXNlbENsYXNzfSByZWY9e2Nhcm91c2VsQ29udGFpbmVyfT5cbiAgICAgICAgPEFycm93cyBjYXJvdXNlbENsYXNzPXtjYXJvdXNlbENsYXNzfSAvPlxuICAgICAgICA8ZGl2IGNsYXNzPXtgJHtjYXJvdXNlbENsYXNzfV9fdHJhY2tgfSBkYXRhLWdsaWRlLWVsPSd0cmFjayc+XG4gICAgICAgICAgPHVsIGNsYXNzPXtgJHtjYXJvdXNlbENsYXNzfV9fc2xpZGVzYH0+XG4gICAgICAgICAgICB7Y29udGVudC5yZWNzLm1hcCgocmVjLCBpKSA9PiAoXG4gICAgICAgICAgICAgIDxTbGlkZSBrZXk9e2l9IHsuLi5yZWN9IC8+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIEFycm93cyAoeyBjYXJvdXNlbENsYXNzIH0pIHtcbiAgICBjb25zdCBhcnJvd0NsYXNzID0gYCR7cHJlZml4fS1hcnJvd2BcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzcz17YCR7Y2Fyb3VzZWxDbGFzc31fX2Fycm93c2B9IGRhdGEtZ2xpZGUtZWw9J2NvbnRyb2xzJz5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzPXtgJHthcnJvd0NsYXNzfSAke2Fycm93Q2xhc3N9LS1sZWZ0IHByZXZpb3VzYH1cbiAgICAgICAgICBkYXRhLWdsaWRlLWRpcj0nPCdcbiAgICAgICAgPlxuICAgICAgICAgIDxzdmdcbiAgICAgICAgICAgIHdpZHRoPScxNCdcbiAgICAgICAgICAgIGhlaWdodD0nMjMnXG4gICAgICAgICAgICB2aWV3Qm94PScwIDAgMTQgMjMnXG4gICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ1xuICAgICAgICAgID5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGQ9J00tMy44MTQ3ZS0wNiAxMS41TDAuNTY3MDk0IDEyLjA1NzlMMTEuNzM0NSAyM0wxMy4zMzc2IDIxLjg4NDJMMi43MzczMSAxMS41TDEzLjMzNzYgMS4xMTU4MUwxMS43MzQ1IDBMMC41NjcwOTQgMTAuOTQyMUwtMy44MTQ3ZS0wNiAxMS41WidcbiAgICAgICAgICAgICAgZmlsbD0nIzk3OTc5NydcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPXtgJHthcnJvd0NsYXNzfSBuZXh0YH0gZGF0YS1nbGlkZS1kaXI9Jz4nPlxuICAgICAgICAgIDxzdmdcbiAgICAgICAgICAgIHdpZHRoPScxNCdcbiAgICAgICAgICAgIGhlaWdodD0nMjMnXG4gICAgICAgICAgICB2aWV3Qm94PScwIDAgMTQgMjMnXG4gICAgICAgICAgICBmaWxsPSdub25lJ1xuICAgICAgICAgICAgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ1xuICAgICAgICAgID5cbiAgICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICAgIGQ9J00xNCAxMS41TDEzLjQzMjkgMTAuOTQyMUwyLjI2NTQ3IC0xLjkwNzM1ZS0wNkwwLjY2MjM1NCAxLjExNThMMTEuMjYyNyAxMS41TDAuNjYyMzU0IDIxLjg4NDJMMi4yNjU0NyAyM0wxMy40MzI5IDEyLjA1NzlMMTQgMTEuNVonXG4gICAgICAgICAgICAgIGZpbGw9J2JsYWNrJ1xuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxuICBmdW5jdGlvbiBTbGlkZSAoKSB7XG4gICAgY29uc3Qgc2xpZGVDbGFzcyA9IGAke3ByZWZpeH0tc2xpZGVgXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGEgY2xhc3NOYW1lPXtzbGlkZUNsYXNzfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake3NsaWRlQ2xhc3N9X19pbWFnZWB9PlxuICAgICAgICAgIDxpbWcgc3JjPXsnaHR0cHM6Ly9waWNzdW0ucGhvdG9zLzIwMCd9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7c2xpZGVDbGFzc31fX2NvbnRlbnRgfT5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7c2xpZGVDbGFzc31fX3RpdGxlYH0+XG4gICAgICAgICAgICBQcm9kdWN0IE5hbWVcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICBjbGFzc05hbWU9e2Ake3NsaWRlQ2xhc3N9X19vbGQtcHJpY2UgJHtzbGlkZUNsYXNzfV9fb2xkLXByaWNlLS1zdHJpa2VgfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIMKjMTAuMDBcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7c2xpZGVDbGFzc31fX25ldy1wcmljZWB9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake3NsaWRlQ2xhc3N9X19wcmljZS12YWx1ZWB9PsKjMTIuMDA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtzbGlkZUNsYXNzfV9fcHJpY2Utc2F2ZWRgfT7CozEyLjAwPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hPlxuICAgIClcbiAgfVxufVxuIiwiaW1wb3J0IGNyZWF0ZUV4cGVyaWVuY2UgZnJvbSAnLi9jcmVhdGVFeHBlcmllbmNlJ1xuXG4vLyBFeHBlcmllbmNlc1xuaW1wb3J0IGNvdW50ZG93bkJhbm5lciBmcm9tICcuL2NvdW50ZG93bkJhbm5lcidcbmltcG9ydCBleGl0SW50ZW50IGZyb20gJy4vZXhpdEludGVudCdcblxuZXhwb3J0IGRlZmF1bHQgW2NyZWF0ZUV4cGVyaWVuY2UoY291bnRkb3duQmFubmVyKSwgY3JlYXRlRXhwZXJpZW5jZShleGl0SW50ZW50KV1cbiIsImltcG9ydCBwb2xsIGZyb20gJ0BxdWJpdC9wb2xsZXInXG5cbmNvbnN0IGV4cGVyaWVuY2VTdGF0ZSA9IHt9XG5cbmZ1bmN0aW9uIHNldCAoa2V5LCBkYXRhKSB7XG4gIGV4cGVyaWVuY2VTdGF0ZVtrZXldID0gZGF0YVxufVxuXG5mdW5jdGlvbiBnZXQgKGtleSkge1xuICByZXR1cm4gZXhwZXJpZW5jZVN0YXRlW2tleV1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBwb2xsLFxuICBzdGF0ZToge1xuICAgIHNldCxcbiAgICBnZXRcbiAgfSxcbiAgbG9nOiB7XG4gICAgaW5mbzogY29uc29sZS5sb2csXG4gICAgd2FybjogY29uc29sZS53YXJuLFxuICAgIGVycm9yOiBjb25zb2xlLmVycm9yXG4gIH1cbn1cbiIsImltcG9ydCBwb2xsIGZyb20gJ0BxdWJpdC9wb2xsZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJ1bk1hcHBlciAoKSB7XG4gIHdpbmRvdy54cF9ldmVudHMgPSBbXVxuXG4gIGZ1bmN0aW9uIGVtaXRFdmVudCAoZXZlbnQpIHtcbiAgICB3aW5kb3cueHBfZXZlbnRzLnB1c2goZXZlbnQpXG4gIH1cblxuICByZXR1cm4gcG9sbCgnd2luZG93LmRpZ2l0YWxEYXRhJykudGhlbihkYXRhTGF5ZXIgPT4ge1xuICAgIGVtaXRFdmVudCh7XG4gICAgICBldmVudE5hbWU6ICd4cFZpZXcnXG4gICAgfSlcbiAgfSlcbn1cbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiLnhwLWNvdW50ZG93bi1iYW5uZXIge1xcbiAgbWFyZ2luOiB1bnNldCAhaW1wb3J0YW50O1xcbiAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcXG4gIG1heC13aWR0aDogdW5zZXQgIWltcG9ydGFudDtcXG59XFxuLnhwLWNvdW50ZG93bi1iYW5uZXIgKyAud3AtYmxvY2stc3BhY2VyIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcbi54cC1jb3VudGRvd24tYmFubmVyLWNvbnRhaW5lciB7XFxuICBwYWRkaW5nOiAycmVtO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBiYWNrZ3JvdW5kOiAjZmY1ODU4O1xcbiAgY29sb3I6ICNmZmZmZmY7XFxufVxcbi54cC1jb3VudGRvd24tYmFubmVyLWNvbnRhaW5lcl9fdGl0bGUge1xcbiAgZm9udC1zaXplOiAycmVtO1xcbn1cXG5AbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC54cC1jb3VudGRvd24tYmFubmVyLWNvbnRhaW5lcl9fdGl0bGUge1xcbiAgICBmb250LXNpemU6IDEuNXJlbTtcXG4gIH1cXG59XFxuLnhwLWNvdW50ZG93bi1iYW5uZXItY29udGFpbmVyX19jdGEge1xcbiAgYmFja2dyb3VuZDogIzIxMjEyMTtcXG4gIHBhZGRpbmc6IDAuNXJlbSAxcmVtO1xcbiAgbWFyZ2luLXRvcDogMXJlbTtcXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG59XFxuXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL2V4cGVyaWVuY2VzL2NvdW50ZG93bkJhbm5lci92YXJpYXRpb24ubGVzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQztFQUlDLHdCQUFBO0VBQ0Esc0JBQUE7RUFDQSwyQkFBQTtBQUZGO0FBSkM7RUFVQyxhQUFBO0FBSEY7QUFQQztFQWNDLGFBQUE7RUFDQSxrQkFBQTtFQUNBLFdBQUE7RUFDQSxtQkFBQTtFQUNBLGNBQUE7QUFKRjtBQUtFO0VBQ0UsZUFBQTtBQUhKO0FBSUk7RUFBQTtJQUNFLGlCQUFBO0VBREo7QUFDRjtBQUdFO0VBQ0UsbUJBQUE7RUFDQSxvQkFBQTtFQUNBLGdCQUFBO0VBQ0EscUJBQUE7QUFESlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAcHJlZml4OiB+Jy54cC1jb3VudGRvd24tYmFubmVyJztcXG5AY29udGFpbmVyOiB+J0B7cHJlZml4fS1jb250YWluZXInO1xcblxcbkB7cHJlZml4fSB7XFxuICBtYXJnaW46IHVuc2V0ICFpbXBvcnRhbnQ7XFxuICB3aWR0aDogMTAwJSAhaW1wb3J0YW50O1xcbiAgbWF4LXdpZHRoOiB1bnNldCAhaW1wb3J0YW50O1xcbn1cXG5cXG5Ae3ByZWZpeH0gKyAud3AtYmxvY2stc3BhY2VyIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbkB7Y29udGFpbmVyfSB7XFxuICBwYWRkaW5nOiAycmVtO1xcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBiYWNrZ3JvdW5kOiAjZmY1ODU4O1xcbiAgY29sb3I6ICNmZmZmZmY7XFxuICAmX190aXRsZSB7XFxuICAgIGZvbnQtc2l6ZTogMnJlbTtcXG4gICAgQG1lZGlhKG1heC13aWR0aDogNzY3cHgpIHtcXG4gICAgICBmb250LXNpemU6IDEuNXJlbTtcXG4gICAgfVxcbiAgfVxcbiAgJl9fY3RhIHtcXG4gICAgYmFja2dyb3VuZDogIzIxMjEyMTtcXG4gICAgcGFkZGluZzogMC41cmVtIDFyZW07XFxuICAgIG1hcmdpbi10b3A6IDFyZW07XFxuICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG4gIH1cXG59XFxuXCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiLnhwLWV4aXRJbnRlbnQge1xcbiAgcG9zaXRpb246IGZpeGVkO1xcbiAgYm90dG9tOiA0MHB4O1xcbiAgbGVmdDogNDBweDtcXG4gIHJpZ2h0OiA0MHB4O1xcbiAgei1pbmRleDogOTk5OTk5OTk5OTtcXG59XFxuQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAueHAtZXhpdEludGVudCB7XFxuICAgIGJvdHRvbTogMjBweDtcXG4gICAgbGVmdDogMjBweDtcXG4gICAgcmlnaHQ6IDIwcHg7XFxuICB9XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsIHtcXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcXG4gIHdpZHRoOiAxMDAlO1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWwgKiB7XFxuICBib3gtc2l6aW5nOiBpbmhlcml0O1xcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbF9fdHJhY2sge1xcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWxfX3NsaWRlcyB7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB3aWR0aDogMTAwJTtcXG4gIGxpc3Qtc3R5bGU6IG5vbmU7XFxuICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICB0cmFuc2Zvcm0tc3R5bGU6IHByZXNlcnZlLTNkO1xcbiAgdG91Y2gtYWN0aW9uOiBwYW4tWTtcXG4gIG92ZXJmbG93OiBoaWRkZW47XFxuICBwYWRkaW5nOiAwO1xcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LXdyYXA6IG5vd3JhcDtcXG4gIHdpbGwtY2hhbmdlOiB0cmFuc2Zvcm07XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsX19zbGlkZXMtLWRyYWdnaW5nIHtcXG4gIHVzZXItc2VsZWN0OiBub25lO1xcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbF9fc2xpZGUge1xcbiAgd2lkdGg6IDEwMCU7XFxuICBoZWlnaHQ6IDEwMCU7XFxuICBmbGV4LXNocmluazogMDtcXG4gIHdoaXRlLXNwYWNlOiBub3JtYWw7XFxuICB1c2VyLXNlbGVjdDogbm9uZTtcXG4gIC13ZWJraXQtdG91Y2gtY2FsbG91dDogbm9uZTtcXG4gIC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsX19zbGlkZSBhIHtcXG4gIHVzZXItc2VsZWN0OiBub25lO1xcbiAgLXdlYmtpdC11c2VyLWRyYWc6IG5vbmU7XFxuICAtbW96LXVzZXItc2VsZWN0OiBub25lO1xcbiAgLW1zLXVzZXItc2VsZWN0OiBub25lO1xcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbF9fYXJyb3dzIHtcXG4gIC13ZWJraXQtdG91Y2gtY2FsbG91dDogbm9uZTtcXG4gIHVzZXItc2VsZWN0OiBub25lO1xcbn1cXG4ueHAtZXhpdEludGVudC1jYXJvdXNlbF9fYnVsbGV0cyB7XFxuICAtd2Via2l0LXRvdWNoLWNhbGxvdXQ6IG5vbmU7XFxuICB1c2VyLXNlbGVjdDogbm9uZTtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWwtLXJ0bCB7XFxuICBkaXJlY3Rpb246IHJ0bDtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY29udGFpbmVyIHtcXG4gIGJhY2tncm91bmQ6ICNmZmZmZmY7XFxuICBib3gtc2hhZG93OiAwcHggMXB4IDEwcHggcmdiYSgwLCAwLCAwLCAwLjIyNjA0Myk7XFxuICBib3JkZXItcmFkaXVzOiA1cHg7XFxuICBib3JkZXItdG9wOiA1cHggc29saWQgI2Q4MWYwZDtcXG4gIHBhZGRpbmc6IDIycHggMTVweDtcXG59XFxuQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAueHAtZXhpdEludGVudC1jb250YWluZXIge1xcbiAgICBwYWRkaW5nOiA4cHggMTVweCAxNXB4IDE1cHg7XFxuICAgIGJvcmRlci10b3A6IDRweCBzb2xpZCAjZDgxZjBkO1xcbiAgfVxcbn1cXG4ueHAtZXhpdEludGVudC1jb250YWluZXJfX2hlYWRlciB7XFxuICBwYWRkaW5nLWJvdHRvbTogMTJweDtcXG59XFxuLnhwLWV4aXRJbnRlbnQtY29udGFpbmVyX190aXRsZSB7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxuICBmb250LXdlaWdodDogNzAwO1xcbiAgZm9udC1zaXplOiAyMHB4O1xcbiAgbGluZS1oZWlnaHQ6IDI1cHg7XFxuICBjb2xvcjogIzMzMzMzMztcXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gIHBhZGRpbmctYm90dG9tOiAzcHg7XFxufVxcbkBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLnhwLWV4aXRJbnRlbnQtY29udGFpbmVyX190aXRsZSB7XFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXG4gICAgbGluZS1oZWlnaHQ6IDIwcHg7XFxuICAgIHBhZGRpbmctbGVmdDogMjBweDtcXG4gICAgcGFkZGluZy1yaWdodDogMjBweDtcXG4gIH1cXG59XFxuLnhwLWV4aXRJbnRlbnQtY29udGFpbmVyX19zdWJ0aXRsZSB7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxuICBmb250LXdlaWdodDogNDAwO1xcbiAgZm9udC1zaXplOiAxNnB4O1xcbiAgbGluZS1oZWlnaHQ6IDIwcHg7XFxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICBsZXR0ZXItc3BhY2luZzogMC4wOTI4NTcxcHg7XFxuICBjb2xvcjogIzJlMmUyZTtcXG59XFxuQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAueHAtZXhpdEludGVudC1jb250YWluZXJfX3N1YnRpdGxlIHtcXG4gICAgZm9udC13ZWlnaHQ6IDQwMDtcXG4gICAgZm9udC1zaXplOiAxM3B4O1xcbiAgICBsaW5lLWhlaWdodDogMTZweDtcXG4gIH1cXG59XFxuLnhwLWV4aXRJbnRlbnQtY29udGFpbmVyX19jbG9zZSB7XFxuICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xcbiAgYmFja2dyb3VuZC1jb2xvcjogdW5zZXQ7XFxuICBib3JkZXI6IHVuc2V0O1xcbiAgd2lkdGg6IDI2cHg7XFxuICBoZWlnaHQ6IDI2cHg7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDEwcHg7XFxuICByaWdodDogMTBweDtcXG4gIHBhZGRpbmc6IHVuc2V0O1xcbiAgY29sb3I6ICMwMDAwMDA7XFxufVxcbi54cC1leGl0SW50ZW50LWNhcm91c2VsIHtcXG4gIHBhZGRpbmctbGVmdDogNDBweDtcXG4gIHBhZGRpbmctcmlnaHQ6IDQwcHg7XFxufVxcbkBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWwge1xcbiAgICBwYWRkaW5nLWxlZnQ6IHVuc2V0O1xcbiAgICBwYWRkaW5nLXJpZ2h0OiB1bnNldDtcXG4gIH1cXG59XFxuLnhwLWV4aXRJbnRlbnQtY2Fyb3VzZWxfX3NsaWRlcyB7XFxuICBtYXJnaW46IHVuc2V0O1xcbn1cXG4ueHAtZXhpdEludGVudC1hcnJvdyB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDUwJTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTtcXG4gIHJpZ2h0OiAtMTVweDtcXG4gIHBhZGRpbmc6IDMwcHggMTVweDtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG59XFxuLnhwLWV4aXRJbnRlbnQtYXJyb3ctLWxlZnQge1xcbiAgbGVmdDogLTE1cHg7XFxuICByaWdodDogdW5zZXQ7XFxufVxcbkBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgLnhwLWV4aXRJbnRlbnQtYXJyb3cge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcbn1cXG4ueHAtZXhpdEludGVudC1zbGlkZSB7XFxuICBiYWNrZ3JvdW5kOiAjZmZmZmZmO1xcbiAgYm9yZGVyOiAxcHggc29saWQgI2NjY2NjYztcXG4gIHBhZGRpbmc6IDEzcHg7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG5AbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gIC54cC1leGl0SW50ZW50LXNsaWRlIHtcXG4gICAgcGFkZGluZzogMTJweDtcXG4gICAgbWluLWhlaWdodDogOTBweDtcXG4gIH1cXG59XFxuLnhwLWV4aXRJbnRlbnQtc2xpZGVfX2ltYWdlIHtcXG4gIHdpZHRoOiAzMCU7XFxuICBkaXNwbGF5OiBmbGV4O1xcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG59XFxuLnhwLWV4aXRJbnRlbnQtc2xpZGVfX2ltYWdlIGltZyB7XFxuICBtYXgtd2lkdGg6IDEwMCU7XFxuICBtYXgtaGVpZ2h0OiA3MHB4O1xcbn1cXG4ueHAtZXhpdEludGVudC1zbGlkZV9fY29udGVudCB7XFxuICB3aWR0aDogY2FsYyg3MCUgLSAxM3B4KTtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xcbiAgcGFkZGluZy10b3A6IDZweDtcXG59XFxuQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAueHAtZXhpdEludGVudC1zbGlkZV9fY29udGVudCB7XFxuICAgIHBhZGRpbmctdG9wOiB1bnNldDtcXG4gIH1cXG59XFxuLnhwLWV4aXRJbnRlbnQtc2xpZGVfX3RpdGxlIHtcXG4gIG1heC13aWR0aDogMTAwJTtcXG4gIHdoaXRlLXNwYWNlOiBub3JtYWw7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxuICBmb250LXdlaWdodDogNDAwO1xcbiAgZm9udC1zaXplOiAxNHB4O1xcbiAgbGluZS1oZWlnaHQ6IDE0cHg7XFxuICBsZXR0ZXItc3BhY2luZzogMC4xcHg7XFxuICBjb2xvcjogIzMzMzMzMztcXG59XFxuLnhwLWV4aXRJbnRlbnQtc2xpZGVfX29sZC1wcmljZSB7XFxuICBmb250LXN0eWxlOiBub3JtYWw7XFxuICBmb250LXdlaWdodDogNDAwO1xcbiAgZm9udC1zaXplOiAxMXB4O1xcbiAgbGluZS1oZWlnaHQ6IDE0cHg7XFxuICBsZXR0ZXItc3BhY2luZzogMC4wOTI4NTcxcHg7XFxuICBjb2xvcjogIzY2NjY2NjtcXG59XFxuLnhwLWV4aXRJbnRlbnQtc2xpZGVfX29sZC1wcmljZS0tc3RyaWtlIHtcXG4gIHRleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO1xcbn1cXG4ueHAtZXhpdEludGVudC1zbGlkZV9fbmV3LXByaWNlIHtcXG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcXG4gIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICBmb250LXNpemU6IDEzcHg7XFxuICBsaW5lLWhlaWdodDogMTRweDtcXG4gIGxldHRlci1zcGFjaW5nOiAwLjA5Mjg1NzFweDtcXG4gIGRpc3BsYXk6IGZsZXg7XFxuICBmbGV4LXdyYXA6IHdyYXA7XFxufVxcbi54cC1leGl0SW50ZW50LXNsaWRlX19wcmljZS12YWx1ZSB7XFxuICBjb2xvcjogIzAwMDAwMDtcXG4gIHBhZGRpbmctcmlnaHQ6IDEycHg7XFxufVxcbi54cC1leGl0SW50ZW50LXNsaWRlX19wcmljZS1zYXZlZCB7XFxuICBjb2xvcjogI2ZmNTg1ODtcXG59XFxuXCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL2V4cGVyaWVuY2VzL2V4aXRJbnRlbnQvdmFyaWF0aW9uLmxlc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUM7RUFRQyxlQUFBO0VBQ0EsWUFBQTtFQUNBLFVBQUE7RUFDQSxXQUFBO0VBQ0EsbUJBQUE7QUFORjtBQU9FO0VBQUE7SUFDRSxZQUFBO0lBQ0EsVUFBQTtJQUNBLFdBQUE7RUFKRjtBQUNGO0FBYkM7RUFxQkMsa0JBQUE7RUFDQSxXQUFBO0VBQ0Esc0JBQUE7QUFMRjtBQWxCQztFQXlCRyxtQkFBQTtBQUpKO0FBTUU7RUFDRSxnQkFBQTtBQUpKO0FBTUU7RUFDRSxrQkFBQTtFQUNBLFdBQUE7RUFDQSxnQkFBQTtFQUNBLDJCQUFBO0VBQ0EsNEJBQUE7RUFDQSxtQkFBQTtFQUNBLGdCQUFBO0VBQ0EsVUFBQTtFQUNBLG1CQUFBO0VBQ0EsYUFBQTtFQUNBLGlCQUFBO0VBQ0Esc0JBQUE7QUFKSjtBQUtJO0VBQ0UsaUJBQUE7QUFITjtBQU1FO0VBQ0UsV0FBQTtFQUNBLFlBQUE7RUFDQSxjQUFBO0VBQ0EsbUJBQUE7RUFDQSxpQkFBQTtFQUNBLDJCQUFBO0VBQ0Esd0NBQUE7QUFKSjtBQUhFO0VBU0ksaUJBQUE7RUFDQSx1QkFBQTtFQUNBLHNCQUFBO0VBQ0EscUJBQUE7QUFITjtBQU1FO0VBQ0UsMkJBQUE7RUFDQSxpQkFBQTtBQUpKO0FBTUU7RUFDRSwyQkFBQTtFQUNBLGlCQUFBO0FBSko7QUFNRTtFQUNFLGNBQUE7QUFKSjtBQW5FQztFQTRFQyxtQkFBQTtFQUNBLGdEQUFBO0VBQ0Esa0JBQUE7RUFDQSw2QkFBQTtFQUNBLGtCQUFBO0FBTkY7QUFPRTtFQUFBO0lBQ0UsMkJBQUE7SUFDQSw2QkFBQTtFQUpGO0FBQ0Y7QUFLRTtFQUNFLG9CQUFBO0FBSEo7QUFLRTtFQUNFLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFDQSxjQUFBO0VBQ0Esa0JBQUE7RUFDQSxtQkFBQTtBQUhKO0FBSUk7RUFBQTtJQUNFLGVBQUE7SUFDQSxpQkFBQTtJQUNBLGtCQUFBO0lBQ0EsbUJBQUE7RUFESjtBQUNGO0FBR0U7RUFDRSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0Esa0JBQUE7RUFDQSwyQkFBQTtFQUNBLGNBQUE7QUFESjtBQUVJO0VBQUE7SUFDRSxnQkFBQTtJQUNBLGVBQUE7SUFDQSxpQkFBQTtFQUNKO0FBQ0Y7QUFDRTtFQUNFLDRCQUFBO0VBQ0EsdUJBQUE7RUFDQSxhQUFBO0VBQ0EsV0FBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLFNBQUE7RUFDQSxXQUFBO0VBQ0EsY0FBQTtFQUNBLGNBQUE7QUFDSjtBQWhJQztFQW9JQyxrQkFBQTtFQUNBLG1CQUFBO0FBREY7QUFFRTtFQUFBO0lBQ0UsbUJBQUE7SUFDQSxvQkFBQTtFQUNGO0FBQ0Y7QUFBRTtFQUNFLGFBQUE7QUFFSjtBQTdJQztFQWdKQyxrQkFBQTtFQUNBLFFBQUE7RUFDQSwyQkFBQTtFQUNBLFlBQUE7RUFDQSxrQkFBQTtFQUNBLGVBQUE7QUFBRjtBQUNFO0VBQ0UsV0FBQTtFQUNBLFlBQUE7QUFDSjtBQUNFO0VBQUE7SUFDRSxhQUFBO0VBRUY7QUFDRjtBQTlKQztFQWdLQyxtQkFBQTtFQUNBLHlCQUFBO0VBQ0EsYUFBQTtFQUNBLGFBQUE7RUFDQSw4QkFBQTtFQUNBLHFCQUFBO0FBQ0Y7QUFBRTtFQUFBO0lBQ0UsYUFBQTtJQUNBLGdCQUFBO0VBR0Y7QUFDRjtBQUZFO0VBQ0UsVUFBQTtFQUNBLGFBQUE7RUFDQSxtQkFBQTtBQUlKO0FBUEU7RUFLSSxlQUFBO0VBQ0EsZ0JBQUE7QUFLTjtBQUZFO0VBQ0UsdUJBQUE7RUFDQSxhQUFBO0VBQ0Esc0JBQUE7RUFDQSw4QkFBQTtFQUNBLGdCQUFBO0FBSUo7QUFISTtFQUFBO0lBQ0Usa0JBQUE7RUFNSjtBQUNGO0FBSkU7RUFDRSxlQUFBO0VBQ0EsbUJBQUE7RUFDQSxrQkFBQTtFQUNBLGdCQUFBO0VBQ0EsZUFBQTtFQUNBLGlCQUFBO0VBQ0EscUJBQUE7RUFDQSxjQUFBO0FBTUo7QUFKRTtFQUNFLGtCQUFBO0VBQ0EsZ0JBQUE7RUFDQSxlQUFBO0VBQ0EsaUJBQUE7RUFDQSwyQkFBQTtFQUNBLGNBQUE7QUFNSjtBQUxJO0VBQ0UsNkJBQUE7QUFPTjtBQUpFO0VBQ0Usa0JBQUE7RUFDQSxnQkFBQTtFQUNBLGVBQUE7RUFDQSxpQkFBQTtFQUNBLDJCQUFBO0VBQ0EsYUFBQTtFQUNBLGVBQUE7QUFNSjtBQUpFO0VBQ0UsY0FBQTtFQUNBLG1CQUFBO0FBTUo7QUFKRTtFQUNFLGNBQUE7QUFNSlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJAdGlja2V0OiB+Jy54cC1leGl0SW50ZW50JztcXG5AY29udGFpbmVyQ2xhc3M6IH4nQHt0aWNrZXR9LWNvbnRhaW5lcic7XFxuQGdsaWRlOiB+J0B7dGlja2V0fS1jYXJvdXNlbCc7XFxuQGNhcm91c2VsQ2xhc3M6IH4nQHt0aWNrZXR9LWNhcm91c2VsJztcXG5Ac2xpZGVDbGFzczogfidAe3RpY2tldH0tc2xpZGUnO1xcbkBhcnJvd0NsYXNzOiB+J0B7dGlja2V0fS1hcnJvdyc7XFxuXFxuQHt0aWNrZXR9IHtcXG4gIHBvc2l0aW9uOiBmaXhlZDtcXG4gIGJvdHRvbTogNDBweDtcXG4gIGxlZnQ6IDQwcHg7XFxuICByaWdodDogNDBweDtcXG4gIHotaW5kZXg6IDk5OTk5OTk5OTk7XFxuICBAbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gICAgYm90dG9tOiAyMHB4O1xcbiAgICBsZWZ0OiAyMHB4O1xcbiAgICByaWdodDogMjBweDtcXG4gIH1cXG59XFxuXFxuQHtnbGlkZX0ge1xcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xcbiAgd2lkdGg6IDEwMCU7XFxuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbiAgKiB7XFxuICAgIGJveC1zaXppbmc6IGluaGVyaXQ7XFxuICB9XFxuICAmX190cmFjayB7XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICB9XFxuICAmX19zbGlkZXMge1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBsaXN0LXN0eWxlOiBub25lO1xcbiAgICBiYWNrZmFjZS12aXNpYmlsaXR5OiBoaWRkZW47XFxuICAgIHRyYW5zZm9ybS1zdHlsZTogcHJlc2VydmUtM2Q7XFxuICAgIHRvdWNoLWFjdGlvbjogcGFuLVk7XFxuICAgIG92ZXJmbG93OiBoaWRkZW47XFxuICAgIHBhZGRpbmc6IDA7XFxuICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtd3JhcDogbm93cmFwO1xcbiAgICB3aWxsLWNoYW5nZTogdHJhbnNmb3JtO1xcbiAgICAmLS1kcmFnZ2luZyB7XFxuICAgICAgdXNlci1zZWxlY3Q6IG5vbmU7XFxuICAgIH1cXG4gIH1cXG4gICZfX3NsaWRlIHtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgZmxleC1zaHJpbms6IDA7XFxuICAgIHdoaXRlLXNwYWNlOiBub3JtYWw7XFxuICAgIHVzZXItc2VsZWN0OiBub25lO1xcbiAgICAtd2Via2l0LXRvdWNoLWNhbGxvdXQ6IG5vbmU7XFxuICAgIC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XFxuICAgIGEge1xcbiAgICAgIHVzZXItc2VsZWN0OiBub25lO1xcbiAgICAgIC13ZWJraXQtdXNlci1kcmFnOiBub25lO1xcbiAgICAgIC1tb3otdXNlci1zZWxlY3Q6IG5vbmU7XFxuICAgICAgLW1zLXVzZXItc2VsZWN0OiBub25lO1xcbiAgICB9XFxuICB9XFxuICAmX19hcnJvd3Mge1xcbiAgICAtd2Via2l0LXRvdWNoLWNhbGxvdXQ6IG5vbmU7XFxuICAgIHVzZXItc2VsZWN0OiBub25lO1xcbiAgfVxcbiAgJl9fYnVsbGV0cyB7XFxuICAgIC13ZWJraXQtdG91Y2gtY2FsbG91dDogbm9uZTtcXG4gICAgdXNlci1zZWxlY3Q6IG5vbmU7XFxuICB9XFxuICAmLS1ydGwge1xcbiAgICBkaXJlY3Rpb246IHJ0bDtcXG4gIH1cXG59XFxuXFxuQHtjb250YWluZXJDbGFzc30ge1xcbiAgYmFja2dyb3VuZDogI2ZmZmZmZjtcXG4gIGJveC1zaGFkb3c6IDBweCAxcHggMTBweCByZ2JhKDAsIDAsIDAsIDAuMjI2MDQzKTtcXG4gIGJvcmRlci1yYWRpdXM6IDVweDtcXG4gIGJvcmRlci10b3A6IDVweCBzb2xpZCAjZDgxZjBkO1xcbiAgcGFkZGluZzogMjJweCAxNXB4O1xcbiAgQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAgIHBhZGRpbmc6IDhweCAxNXB4IDE1cHggMTVweDtcXG4gICAgYm9yZGVyLXRvcDogNHB4IHNvbGlkICNkODFmMGQ7XFxuICB9XFxuICAmX19oZWFkZXIge1xcbiAgICBwYWRkaW5nLWJvdHRvbTogMTJweDtcXG4gIH1cXG4gICZfX3RpdGxlIHtcXG4gICAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgICBmb250LXdlaWdodDogNzAwO1xcbiAgICBmb250LXNpemU6IDIwcHg7XFxuICAgIGxpbmUtaGVpZ2h0OiAyNXB4O1xcbiAgICBjb2xvcjogIzMzMzMzMztcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBwYWRkaW5nLWJvdHRvbTogM3B4O1xcbiAgICBAbWVkaWEgKG1heC13aWR0aDogNzY3cHgpIHtcXG4gICAgICBmb250LXNpemU6IDE2cHg7XFxuICAgICAgbGluZS1oZWlnaHQ6IDIwcHg7XFxuICAgICAgcGFkZGluZy1sZWZ0OiAyMHB4O1xcbiAgICAgIHBhZGRpbmctcmlnaHQ6IDIwcHg7XFxuICAgIH1cXG4gIH1cXG4gICZfX3N1YnRpdGxlIHtcXG4gICAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICBmb250LXNpemU6IDE2cHg7XFxuICAgIGxpbmUtaGVpZ2h0OiAyMHB4O1xcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XFxuICAgIGxldHRlci1zcGFjaW5nOiAwLjA5Mjg1NzFweDtcXG4gICAgY29sb3I6ICMyZTJlMmU7XFxuICAgIEBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XFxuICAgICAgZm9udC1zaXplOiAxM3B4O1xcbiAgICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xcbiAgICB9XFxuICB9XFxuICAmX19jbG9zZSB7XFxuICAgIGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHVuc2V0O1xcbiAgICBib3JkZXI6IHVuc2V0O1xcbiAgICB3aWR0aDogMjZweDtcXG4gICAgaGVpZ2h0OiAyNnB4O1xcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICAgIHRvcDogMTBweDtcXG4gICAgcmlnaHQ6IDEwcHg7XFxuICAgIHBhZGRpbmc6IHVuc2V0O1xcbiAgICBjb2xvcjogIzAwMDAwMDtcXG4gIH1cXG59XFxuXFxuQHtjYXJvdXNlbENsYXNzfSB7XFxuICBwYWRkaW5nLWxlZnQ6IDQwcHg7XFxuICBwYWRkaW5nLXJpZ2h0OiA0MHB4O1xcbiAgQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAgIHBhZGRpbmctbGVmdDogdW5zZXQ7XFxuICAgIHBhZGRpbmctcmlnaHQ6IHVuc2V0O1xcbiAgfVxcbiAgJl9fc2xpZGVzIHtcXG4gICAgbWFyZ2luOiB1bnNldDtcXG4gIH1cXG59XFxuXFxuQHthcnJvd0NsYXNzfSB7XFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XFxuICB0b3A6IDUwJTtcXG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTtcXG4gIHJpZ2h0OiAtMTVweDtcXG4gIHBhZGRpbmc6IDMwcHggMTVweDtcXG4gIGN1cnNvcjogcG9pbnRlcjtcXG4gICYtLWxlZnQge1xcbiAgICBsZWZ0OiAtMTVweDtcXG4gICAgcmlnaHQ6IHVuc2V0O1xcbiAgfVxcbiAgQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAgIGRpc3BsYXk6IG5vbmU7XFxuICB9XFxufVxcblxcbkB7c2xpZGVDbGFzc30ge1xcbiAgYmFja2dyb3VuZDogI2ZmZmZmZjtcXG4gIGJvcmRlcjogMXB4IHNvbGlkICNjY2NjY2M7XFxuICBwYWRkaW5nOiAxM3B4O1xcbiAgZGlzcGxheTogZmxleDtcXG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG4gIEBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xcbiAgICBwYWRkaW5nOiAxMnB4O1xcbiAgICBtaW4taGVpZ2h0OiA5MHB4O1xcbiAgfVxcbiAgJl9faW1hZ2Uge1xcbiAgICB3aWR0aDogMzAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xcbiAgICBpbWcge1xcbiAgICAgIG1heC13aWR0aDogMTAwJTtcXG4gICAgICBtYXgtaGVpZ2h0OiA3MHB4O1xcbiAgICB9XFxuICB9XFxuICAmX19jb250ZW50IHtcXG4gICAgd2lkdGg6IGNhbGMoNzAlIC0gMTNweCk7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcXG4gICAgcGFkZGluZy10b3A6IDZweDtcXG4gICAgQG1lZGlhIChtYXgtd2lkdGg6IDc2N3B4KSB7XFxuICAgICAgcGFkZGluZy10b3A6IHVuc2V0O1xcbiAgICB9XFxuICB9XFxuICAmX190aXRsZSB7XFxuICAgIG1heC13aWR0aDogMTAwJTtcXG4gICAgd2hpdGUtc3BhY2U6IG5vcm1hbDtcXG4gICAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICBmb250LXNpemU6IDE0cHg7XFxuICAgIGxpbmUtaGVpZ2h0OiAxNHB4O1xcbiAgICBsZXR0ZXItc3BhY2luZzogMC4xcHg7XFxuICAgIGNvbG9yOiAjMzMzMzMzO1xcbiAgfVxcbiAgJl9fb2xkLXByaWNlIHtcXG4gICAgZm9udC1zdHlsZTogbm9ybWFsO1xcbiAgICBmb250LXdlaWdodDogNDAwO1xcbiAgICBmb250LXNpemU6IDExcHg7XFxuICAgIGxpbmUtaGVpZ2h0OiAxNHB4O1xcbiAgICBsZXR0ZXItc3BhY2luZzogMC4wOTI4NTcxcHg7XFxuICAgIGNvbG9yOiAjNjY2NjY2O1xcbiAgICAmLS1zdHJpa2Uge1xcbiAgICAgIHRleHQtZGVjb3JhdGlvbjogbGluZS10aHJvdWdoO1xcbiAgICB9XFxuICB9XFxuICAmX19uZXctcHJpY2Uge1xcbiAgICBmb250LXN0eWxlOiBub3JtYWw7XFxuICAgIGZvbnQtd2VpZ2h0OiA3MDA7XFxuICAgIGZvbnQtc2l6ZTogMTNweDtcXG4gICAgbGluZS1oZWlnaHQ6IDE0cHg7XFxuICAgIGxldHRlci1zcGFjaW5nOiAwLjA5Mjg1NzFweDtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC13cmFwOiB3cmFwO1xcbiAgfVxcbiAgJl9fcHJpY2UtdmFsdWUge1xcbiAgICBjb2xvcjogIzAwMDAwMDtcXG4gICAgcGFkZGluZy1yaWdodDogMTJweDtcXG4gIH1cXG4gICZfX3ByaWNlLXNhdmVkIHtcXG4gICAgY29sb3I6ICNmZjU4NTg7XFxuICB9XFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTsgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcblxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuXG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07IC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG5cblxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuXG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcblxuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuXG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG5cbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG5cbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgdmFyIHNvdXJjZVVSTHMgPSBjc3NNYXBwaW5nLnNvdXJjZXMubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBcIi8qIyBzb3VyY2VVUkw9XCIuY29uY2F0KGNzc01hcHBpbmcuc291cmNlUm9vdCB8fCBcIlwiKS5jb25jYXQoc291cmNlLCBcIiAqL1wiKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChzb3VyY2VVUkxzKS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vc3JjL2NyZWF0ZScpKHJlcXVpcmUoJy4vc3JjL2xvZ2dlci9icm93c2VyJykoKSlcbiIsInZhciBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxudmFyIHBhdHRlcm5zID0gcmVxdWlyZSgnLi9wYXR0ZXJucycpXG52YXIgTEVWRUxTID0gcmVxdWlyZSgnLi9sZXZlbHMnKVxudmFyIGFyZ3NUb0NvbXBvbmVudHMgPSByZXF1aXJlKCcuL3V0aWxzL2FyZ3NUb0NvbXBvbmVudHMnKVxudmFyIGNvbXBvc2UgPSByZXF1aXJlKCcuL3V0aWxzL2NvbXBvc2UnKVxuZnVuY3Rpb24gbm9vcCAoKSB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZURyaWZ0d29vZCAocHJpbWFyeUxvZ2dlcikge1xuICB2YXIgZ2xvYmFsU3RhdGUgPSB7IGxvZ2dlcnM6IFtdLCBlbmFibGVkOiBmYWxzZSB9XG5cbiAgZHJpZnR3b29kLmVuYWJsZSA9IGZ1bmN0aW9uIGVuYWJsZUFsbCAoZmxhZ3MsIG9wdGlvbnMpIHtcbiAgICBnbG9iYWxTdGF0ZS5lbmFibGVkID0gdHJ1ZVxuICAgIGlmIChmbGFncykgcGF0dGVybnMuc2V0KGZsYWdzLCBvcHRpb25zKVxuICAgIF8uaW52b2tlKGdsb2JhbFN0YXRlLmxvZ2dlcnMsICdlbmFibGUnLCBmbGFncylcbiAgfVxuXG4gIGRyaWZ0d29vZC5kaXNhYmxlID0gZnVuY3Rpb24gZGlzYWJsZUFsbCAoKSB7XG4gICAgZ2xvYmFsU3RhdGUuZW5hYmxlZCA9IGZhbHNlXG4gICAgcGF0dGVybnMuc2V0KHt9KVxuICAgIHBhdHRlcm5zLnNldCh7fSwgeyBwZXJzaXN0OiB0cnVlIH0pXG4gICAgXy5pbnZva2UoZ2xvYmFsU3RhdGUubG9nZ2VycywgJ2Rpc2FibGUnKVxuICB9XG5cbiAgZHJpZnR3b29kLmRlc3Ryb3kgPSBmdW5jdGlvbiBkZXN0cm95QWxsICgpIHtcbiAgICB3aGlsZSAoZ2xvYmFsU3RhdGUubG9nZ2Vycy5sZW5ndGgpIGdsb2JhbFN0YXRlLmxvZ2dlcnMucG9wKCkuZGVzdHJveSgpXG4gIH1cblxuICBkcmlmdHdvb2QuTEVWRUxTID0gTEVWRUxTXG5cbiAgcmV0dXJuIGRyaWZ0d29vZFxuXG4gIGZ1bmN0aW9uIGRyaWZ0d29vZCAobmFtZSwgYWRkaXRpb25hbExvZ2dlcnMsIGludGVyY2VwdG9ycykge1xuICAgIGlmICghbmFtZSkgdGhyb3cgbmV3IEVycm9yKCduYW1lIHJlcXVpcmVkJylcbiAgICB2YXIgY29uZmlnID0gcGF0dGVybnMuZ2V0KClcbiAgICB2YXIgc3RhdGUgPSB7XG4gICAgICBlbmFibGVkOiBnbG9iYWxTdGF0ZS5lbmFibGVkIHx8IHBhdHRlcm5zLm1hdGNoKG5hbWUsIGNvbmZpZyksXG4gICAgICBsZXZlbDogcGF0dGVybnMuZ2V0TGV2ZWwobmFtZSwgY29uZmlnKSxcbiAgICAgIGNoaWxkcmVuOiBbXVxuICAgIH1cbiAgICB2YXIgbG9nZ2VyID0gYWRkaXRpb25hbExvZ2dlcnMgJiYgYWRkaXRpb25hbExvZ2dlcnMubGVuZ3RoID4gMFxuICAgICAgPyBjb21wb3NlKHByaW1hcnlMb2dnZXIsIGFkZGl0aW9uYWxMb2dnZXJzKVxuICAgICAgOiBwcmltYXJ5TG9nZ2VyXG5cbiAgICB2YXIgbG9nID0gZnVuY3Rpb24gY3JlYXRlTG9nZ2VyIChsb2dOYW1lLCBleHRyYUFkZGl0aW9uYWxMb2dnZXJzLCBleHRyYUludGVyY2VwdG9ycykge1xuICAgICAgaWYgKGxvZy5lbmFibGUgPT09IG5vb3ApIHRocm93IG5ldyBFcnJvcihuYW1lICsgJyB3YXMgZGVzdHJveWVkJylcbiAgICAgIHZhciBjaGlsZExvZyA9IGRyaWZ0d29vZChcbiAgICAgICAgbmFtZSArICc6JyArIGxvZ05hbWUsXG4gICAgICAgIChhZGRpdGlvbmFsTG9nZ2VycyB8fCBbXSkuY29uY2F0KGV4dHJhQWRkaXRpb25hbExvZ2dlcnMgfHwgW10pLFxuICAgICAgICAoaW50ZXJjZXB0b3JzIHx8IFtdKS5jb25jYXQoZXh0cmFJbnRlcmNlcHRvcnMgfHwgW10pXG4gICAgICApXG4gICAgICBpZiAoc3RhdGUuZW5hYmxlZCkgY2hpbGRMb2cuZW5hYmxlKHN0YXRlLmZsYWdzKVxuICAgICAgc3RhdGUuY2hpbGRyZW4ucHVzaChjaGlsZExvZylcbiAgICAgIHJldHVybiBjaGlsZExvZ1xuICAgIH1cblxuICAgIGxvZy5lbmFibGUgPSBmdW5jdGlvbiBlbmFibGVMb2cgKGZsYWdzKSB7XG4gICAgICBzdGF0ZS5lbmFibGVkID0gdHJ1ZVxuICAgICAgc3RhdGUuZmxhZ3MgPSBmbGFnc1xuICAgICAgaWYgKGZsYWdzKSBzdGF0ZS5sZXZlbCA9IHBhdHRlcm5zLmdldExldmVsKG5hbWUsIGZsYWdzKVxuICAgICAgY3JlYXRlQVBJKClcbiAgICAgIF8uaW52b2tlKHN0YXRlLmNoaWxkcmVuLCAnZW5hYmxlJywgZmxhZ3MpXG4gICAgfVxuXG4gICAgbG9nLmRpc2FibGUgPSBmdW5jdGlvbiBkaXNhYmxlTG9nICgpIHtcbiAgICAgIHN0YXRlLmVuYWJsZWQgPSBmYWxzZVxuICAgICAgY3JlYXRlQVBJKClcbiAgICAgIF8uaW52b2tlKHN0YXRlLmNoaWxkcmVuLCAnZGlzYWJsZScpXG4gICAgfVxuXG4gICAgbG9nLmRlc3Ryb3kgPSBmdW5jdGlvbiBkZXN0cm95TG9nICgpIHtcbiAgICAgIGxvZy5lbmFibGUgPSBub29wXG4gICAgICBsb2cuZGlzYWJsZSgpXG4gICAgICBnbG9iYWxTdGF0ZS5sb2dnZXJzID0gXy5maWx0ZXIoZ2xvYmFsU3RhdGUubG9nZ2VycywgZnVuY3Rpb24gKGxvZ2dlcikge1xuICAgICAgICByZXR1cm4gbG9nZ2VyICE9PSBsb2dcbiAgICAgIH0pXG4gICAgICB3aGlsZSAoc3RhdGUuY2hpbGRyZW4ubGVuZ3RoKSBzdGF0ZS5jaGlsZHJlbi5wb3AoKS5kZXN0cm95KClcbiAgICB9XG5cbiAgICBjcmVhdGVBUEkoKVxuICAgIGdsb2JhbFN0YXRlLmxvZ2dlcnMucHVzaChsb2cpXG4gICAgcmV0dXJuIGxvZ1xuXG4gICAgZnVuY3Rpb24gaW50ZXJjZXB0IChhcmdzKSB7XG4gICAgICBpZiAoaW50ZXJjZXB0b3JzICYmIGludGVyY2VwdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW50ZXJjZXB0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IGludGVyY2VwdG9yc1tpXS5hcHBseSh1bmRlZmluZWQsIGFyZ3MpXG4gICAgICAgICAgaWYgKF8uaXNBcnJheShyZXN1bHQpICYmIHJlc3VsdC5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgIGFyZ3MgPSByZXN1bHRcbiAgICAgICAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QocmVzdWx0KSkge1xuICAgICAgICAgICAgYXJnc1szXSA9IHJlc3VsdFxuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlc3VsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGFyZ3NbM10ubWVzc2FnZSA9IHJlc3VsdFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFyZ3NcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVBUEkgKCkge1xuICAgICAgXy5lYWNoKExFVkVMUy5OQU1FUywgZnVuY3Rpb24gYWRkTGV2ZWxMb2dnZXIgKGxvZ0xldmVsKSB7XG4gICAgICAgIHZhciBpbmRleCA9IExFVkVMUy5JTkRFWFtsb2dMZXZlbF1cbiAgICAgICAgbG9nW2xvZ0xldmVsXSA9IHN0YXRlLmVuYWJsZWRcbiAgICAgICAgICA/IGZ1bmN0aW9uIGxldmVsTG9nZ2VyICgpIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA+PSBMRVZFTFMuSU5ERVhbc3RhdGUubGV2ZWxdKSB7XG4gICAgICAgICAgICAgIHZhciBhcmdzID0gW25hbWUsIGxvZ0xldmVsLCBuZXcgRGF0ZSgpLCBhcmdzVG9Db21wb25lbnRzKGFyZ3VtZW50cyldXG4gICAgICAgICAgICAgIGFyZ3MgPSBpbnRlcmNlcHQoYXJncylcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuYXBwbHkodW5kZWZpbmVkLCBhcmdzKVxuICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7IH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgOiBub29wXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIERFRkFVTFQ6ICdpbmZvJyxcbiAgTkFNRVM6IFsndHJhY2UnLCAnZGVidWcnLCAnaW5mbycsICd3YXJuJywgJ2Vycm9yJ10sXG4gIElOREVYOiB7fVxufVxuXG5mb3IgKHZhciBpID0gMDsgaSA8IG1vZHVsZS5leHBvcnRzLk5BTUVTLmxlbmd0aDsgaSsrKSB7XG4gIG1vZHVsZS5leHBvcnRzLklOREVYW21vZHVsZS5leHBvcnRzLk5BTUVTW2ldXSA9IGlcbn1cbiIsInZhciBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxudmFyIExFVkVMUyA9IHJlcXVpcmUoJy4uL2xldmVscycpXG52YXIgcmlnaHRQYWQgPSByZXF1aXJlKCcuLi91dGlscy9yaWdodFBhZCcpXG52YXIgY29uc29sZSA9IHdpbmRvdy5jb25zb2xlXG5cbnZhciBsZXZlbENvbG9ycyA9IHtcbiAgdHJhY2U6ICcjNkM3QTg5JyxcbiAgZGVidWc6ICcjODdEMzdDJyxcbiAgaW5mbzogJyM0NDZDQjMnLFxuICB3YXJuOiAnI0U4N0UwNCcsXG4gIGVycm9yOiAnI0YyMjYxMydcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSB0aGUgaGV4IGZvciBhIHJlYWRhYmxlIGNvbG9yIGFnYWluc3QgYSB3aGl0ZSBiYWNrZ3JvdW5kXG4gKiovXG5mdW5jdGlvbiByYW5kb21SZWFkYWJsZUNvbG9yICgpIHtcbiAgdmFyIGggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApXG4gIHZhciBzID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKSArICclJ1xuICB2YXIgbCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDY2KSArICclJ1xuXG4gIHJldHVybiBbICdoc2woJywgaCwgJywnLCBzLCAnLCcsIGwsICcpJyBdLmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGNvbnNvbGVTdXBwb3J0c0FsbExldmVscyAoKSB7XG4gIHJldHVybiAhXy5maW5kKExFVkVMUy5OQU1FUywgZnVuY3Rpb24gKGxldmVsKSB7XG4gICAgcmV0dXJuICFjb25zb2xlW2xldmVsXVxuICB9KVxufVxuXG5mdW5jdGlvbiBjb25zb2xlU3VwcG9ydHNHcm91cGluZyAoKSB7XG4gIHJldHVybiBjb25zb2xlLmdyb3VwQ29sbGFwc2VkICYmIGNvbnNvbGUuZ3JvdXBFbmRcbn1cblxuLyoqXG4gKiBQcmFjdGljYWxseSBpcyB0aGVyZSBhIGdvb2QgY2hhbmNlIGl0IHN1cHBvcnRzIENTUz9cbiAqKi9cbmZ1bmN0aW9uIGNvbnNvbGVJc0ZhbmN5ICgpIHtcbiAgcmV0dXJuIGNvbnNvbGUudGltZWxpbmUgJiYgY29uc29sZS50YWJsZSAmJiAhd2luZG93Ll9fa2FybWFfX1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJyb3dzZXJMb2dnZXIgKCkge1xuICBpZiAoIWNvbnNvbGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gbm9vcCAoKSB7IH1cbiAgfVxuXG4gIHZhciBhbGxMZXZlbHMgPSBjb25zb2xlU3VwcG9ydHNBbGxMZXZlbHMoKVxuICB2YXIgZ3JvdXBpbmcgPSBjb25zb2xlU3VwcG9ydHNHcm91cGluZygpXG4gIHZhciBpc0ZhbmN5ID0gY29uc29sZUlzRmFuY3koKVxuICB2YXIgY29sb3IgPSByYW5kb21SZWFkYWJsZUNvbG9yKClcblxuICByZXR1cm4gZnVuY3Rpb24gbG9nIChuYW1lLCBsZXZlbCwgbm93LCBjb21wb25lbnRzKSB7XG4gICAgaWYgKGdyb3VwaW5nICYmIGNvbXBvbmVudHMubWV0YWRhdGEpIHtcbiAgICAgIGlmIChpc0ZhbmN5KSB7XG4gICAgICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQuYXBwbHkoY29uc29sZSwgZm9ybWF0RmFuY3lNZXNzYWdlKCkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGZvcm1hdE1lc3NhZ2UoKSlcbiAgICAgIH1cblxuICAgICAgXy5vYmplY3RFYWNoKGNvbXBvbmVudHMubWV0YWRhdGEsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGtleSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICBjb25zb2xlLmdyb3VwRW5kKClcbiAgICB9IGVsc2UgaWYgKGNvbXBvbmVudHMubWVzc2FnZSkge1xuICAgICAgaWYgKGFsbExldmVscykge1xuICAgICAgICBpZiAoaXNGYW5jeSkge1xuICAgICAgICAgIGNvbnNvbGVbbGV2ZWxdLmFwcGx5KGNvbnNvbGUsIGZvcm1hdEZhbmN5TWVzc2FnZSgpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGVbbGV2ZWxdKGZvcm1hdE1lc3NhZ2UoKSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8ganVzdCB1c2UgY29uc29sZS5sb2dcbiAgICAgICAgY29uc29sZS5sb2coZm9ybWF0TWVzc2FnZSgpKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb21wb25lbnRzLmVycm9yKSB7XG4gICAgICBpZiAoYWxsTGV2ZWxzKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoY29tcG9uZW50cy5lcnJvcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGNvbXBvbmVudHMuZXJyb3IpXG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZSAoKSB7XG4gICAgICByZXR1cm4gcmlnaHRQYWQobGV2ZWwudG9VcHBlckNhc2UoKSwgNSkgKyAnIFsnICsgbmFtZSArICddOiAnICsgY29tcG9uZW50cy5tZXNzYWdlXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm9ybWF0RmFuY3lNZXNzYWdlICgpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgICclYycgKyByaWdodFBhZChsZXZlbC50b1VwcGVyQ2FzZSgpLCA1KSArICclYyAlY1snICsgbmFtZSArICddJWM6ICcgKyBjb21wb25lbnRzLm1lc3NhZ2UsXG4gICAgICAgICdmb250LXdlaWdodDpib2xkO2NvbG9yOicgKyBsZXZlbENvbG9yc1tsZXZlbF0gKyAnOycsXG4gICAgICAgICcnLFxuICAgICAgICAnZm9udC13ZWlnaHQ6Ym9sZDtjb2xvcjonICsgY29sb3IgKyAnOycsXG4gICAgICAgICcnXG4gICAgICBdXG4gICAgfVxuICB9XG59XG5cbi8vIFJld2lyZSBkb2Vzbid0IHdvcmsgaW4gSUU4IGFuZCBpbmplY3QtbG9hZGVyIGRvZXNuJ3Qgd29yayBpbiBub2RlLCBzbyB3ZSBoYXZlXG4vLyB0byBleHBvc2Ugb3VyIG93biBzdHViYmluZyBtZXRob2Rcbm1vZHVsZS5leHBvcnRzLl9fc3R1YkNvbnNvbGVfXyA9IGZ1bmN0aW9uIChzdHViKSB7XG4gIHZhciBvbGRDb25zb2xlID0gY29uc29sZVxuICBjb25zb2xlID0gc3R1YiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIHJldHVybiBmdW5jdGlvbiByZXNldCAoKSB7XG4gICAgY29uc29sZSA9IG9sZENvbnNvbGUgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB9XG59XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcbnZhciBKU09OID0gcmVxdWlyZSgnanNvbi1ib3VybmUnKVxudmFyIHN0b3JhZ2UgPSByZXF1aXJlKCcuL3N0b3JhZ2UnKVxudmFyIExFVkVMUyA9IHJlcXVpcmUoJy4vbGV2ZWxzJylcblxuZnVuY3Rpb24gZ2V0ICgpIHtcbiAgdHJ5IHtcbiAgICB2YXIgcGF5bG9hZCA9IHN0b3JhZ2UuZ2V0KClcbiAgICByZXR1cm4gcGF5bG9hZCAmJiBKU09OLnBhcnNlKHBheWxvYWQpIHx8IHt9XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4ge31cbiAgfVxufVxuXG5mdW5jdGlvbiBzZXQgKHBhdHRlcm5zLCBvcHRzKSB7XG4gIHRyeSB7XG4gICAgdmFyIHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeShwYXR0ZXJucylcbiAgICBzdG9yYWdlLnNldChwYXlsb2FkLCBvcHRzKVxuICB9IGNhdGNoIChlKSB7IH1cbn1cblxuZnVuY3Rpb24gbWF0Y2ggKG5hbWUsIGZsYWdzKSB7XG4gIHZhciBwYXR0ZXJucyA9IF8ua2V5cyhmbGFncylcbiAgcmV0dXJuICEhXy5maW5kKHBhdHRlcm5zLCBmdW5jdGlvbiAocGF0dGVybikge1xuICAgIHJldHVybiB0ZXN0KHBhdHRlcm4sIG5hbWUpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGdldExldmVsIChuYW1lLCBmbGFncykge1xuICBmb3IgKHZhciBwYXR0ZXJuIGluIGZsYWdzKSB7XG4gICAgaWYgKHRlc3QocGF0dGVybiwgbmFtZSkpIHJldHVybiBmbGFnc1twYXR0ZXJuXSB8fCBMRVZFTFMuREVGQVVMVFxuICB9XG4gIHJldHVybiBMRVZFTFMuREVGQVVMVFxufVxuXG5mdW5jdGlvbiB0ZXN0IChwYXR0ZXJuLCBuYW1lKSB7XG4gIHZhciByZWdleCA9IG5ldyBSZWdFeHAoJ14nICsgcGF0dGVybi5yZXBsYWNlKC9cXCovZywgJy4qJykgKyAnJCcpXG4gIHJldHVybiByZWdleC50ZXN0KG5hbWUpXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXQ6IGdldCxcbiAgc2V0OiBzZXQsXG4gIG1hdGNoOiBtYXRjaCxcbiAgZ2V0TGV2ZWw6IGdldExldmVsXG59XG4iLCJ2YXIgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcblxudmFyIFNUT1JBR0VfTkFNRVNQQUNFID0gJ3F1Yml0X2xvZ2dlcidcbnZhciBURVNUX0tFWSA9ICdfX2R3VGVzdF9fJ1xuXG52YXIgbWVtb3J5U3RvcmFnZSA9ICcnXG5cbmZ1bmN0aW9uIGhhc0xvY2FsU3RvcmFnZSAoKSB7XG4gIHRyeSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFRFU1RfS0VZLCAxKVxuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShURVNUX0tFWSlcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0ICh2YWx1ZSwgb3B0cykge1xuICBvcHRzID0gXy5hc3NpZ24oe1xuICAgIHBlcnNpc3Q6IGZhbHNlXG4gIH0sIG9wdHMpXG5cbiAgaWYgKG9wdHMucGVyc2lzdCAmJiBoYXNMb2NhbFN0b3JhZ2UoKSkge1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShTVE9SQUdFX05BTUVTUEFDRSwgdmFsdWUpXG4gIH0gZWxzZSB7XG4gICAgbWVtb3J5U3RvcmFnZSA9IHZhbHVlXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0ICgpIHtcbiAgaWYgKG1lbW9yeVN0b3JhZ2UgfHwgIWhhc0xvY2FsU3RvcmFnZSgpKSB7XG4gICAgcmV0dXJuIG1lbW9yeVN0b3JhZ2VcbiAgfSBlbHNlIGlmIChoYXNMb2NhbFN0b3JhZ2UoKSkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oU1RPUkFHRV9OQU1FU1BBQ0UpIHx8ICcnXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzZXQgKCkge1xuICBpZiAoaGFzTG9jYWxTdG9yYWdlKCkpIHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oU1RPUkFHRV9OQU1FU1BBQ0UpXG4gIH1cbiAgbWVtb3J5U3RvcmFnZSA9ICcnXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IHNldCxcbiAgZ2V0OiBnZXQsXG4gIHJlc2V0OiByZXNldFxufVxuIiwiLypcbiAgTGFzdCBhcmcgY2FuIGJlIGFuIGVycm9yIG9yIGFuIG9iamVjdC4gQWxsIG90aGVyXG4gIGFyZ3Mgd2lsbCBiZSBqb2luZWQgaW50byBhIHN0cmluZywgZGVsaW1pdGVkIGJ5XG4gIGEgc3BhY2UuXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhcmdzVG9Db21wb25lbnRzIChhcmdzKSB7XG4gIGFyZ3MgPSBbXS5zbGljZS5hcHBseShhcmdzKVxuICB2YXIgbGFzdEFyZyA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXVxuXG4gIHZhciBpc0Vycm9yID0gbGFzdEFyZyBpbnN0YW5jZW9mIEVycm9yIHx8IGlzRXJyb3JMaWtlKGxhc3RBcmcpXG4gIHZhciBpc01ldGFkYXRhID0gIWlzRXJyb3IgJiYgbGFzdEFyZyAmJiB0eXBlb2YgbGFzdEFyZyA9PT0gJ29iamVjdCdcblxuICB2YXIgbWVzc2FnZVBhcnRzID0gaXNFcnJvciB8fCBpc01ldGFkYXRhID8gYXJncy5zbGljZSgwLCAtMSkgOiBhcmdzXG4gIHZhciBtZXNzYWdlID0gbWVzc2FnZVBhcnRzLmpvaW4oJyAnKVxuXG4gIC8vIEhhbmRsZSBsb2cuZGVidWcoeyBmb286ICdiYXInIH0pXG4gIGlmIChpc01ldGFkYXRhICYmICFtZXNzYWdlKSB7XG4gICAgbWVzc2FnZSA9ICdtZXRhZGF0YTonXG4gIH1cblxuICAvLyBIYW5kbGUgbG9nLmRlYnVnKG5ldyBFcnJvcigpKVxuICBpZiAoaXNFcnJvciAmJiAhbWVzc2FnZSkge1xuICAgIG1lc3NhZ2UgPSBsYXN0QXJnLm1lc3NhZ2VcbiAgfVxuXG4gIHZhciBjb21wb25lbnRzID0ge1xuICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgfVxuXG4gIGlmIChpc0Vycm9yICYmIGxhc3RBcmcpIGNvbXBvbmVudHMuZXJyb3IgPSBsYXN0QXJnXG4gIGlmIChpc01ldGFkYXRhICYmIGxhc3RBcmcpIGNvbXBvbmVudHMubWV0YWRhdGEgPSBsYXN0QXJnXG5cbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cblxuLy8gSW4gc29tZSBlbnZpcm9ubWVudHMsIGVycm9ycyBkb2Vzbid0IHByb3Blcmx5IGluaGVyaXQgZnJvbSBgRXJyb3JgXG5mdW5jdGlvbiBpc0Vycm9yTGlrZSAodGhpbmcpIHtcbiAgcmV0dXJuIHRoaW5nICYmICEhdGhpbmcuc3RhY2sgJiYgISF0aGluZy5tZXNzYWdlXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUNvbXBvc2l0ZUxvZ2dlciAocHJpbWFyeUxvZ2dlciwgYWRkaXRpb25hbExvZ2dlcnMpIHtcbiAgdmFyIGxvZ2dlcnMgPSBbcHJpbWFyeUxvZ2dlcl0uY29uY2F0KGFkZGl0aW9uYWxMb2dnZXJzKVxuICByZXR1cm4gZnVuY3Rpb24gY29tcG9zaXRlTG9nZ2VyIChuYW1lLCBsZXZlbCwgZGF0ZSwgY29tcG9uZW50cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9nZ2Vycy5sZW5ndGg7IGkrKykgbG9nZ2Vyc1tpXShuYW1lLCBsZXZlbCwgZGF0ZSwgY29tcG9uZW50cylcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByaWdodFBhZCAoc3RyaW5nLCB0b3RhbCkge1xuICB2YXIgaSA9IC0xXG4gIHZhciByZW1haW5pbmcgPSB0b3RhbCAtIHN0cmluZy5sZW5ndGhcbiAgd2hpbGUgKCsraSA8IHJlbWFpbmluZykge1xuICAgIHN0cmluZyArPSAnICdcbiAgfVxuICByZXR1cm4gc3RyaW5nXG59XG4iLCIvKiBnbG9iYWwgZGVmaW5lICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1leHRlbmQtbmF0aXZlICovXG5cbnZhciBqc29uQm91cm5lID0ge1xuICBzdHJpbmdpZnk6IGZ1bmN0aW9uIHN0cmluZ2lmeSAoKSB7XG4gICAgdmFyIGVycm9yLCByZXN1bHRcbiAgICB2YXIgcHJvdG90eXBlcyA9IG5vcm1hbGl6ZVByb3RvdHlwZXMoKVxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSBKU09OLnN0cmluZ2lmeS5hcHBseShKU09OLCBhcmd1bWVudHMpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZXJyb3IgPSBlXG4gICAgfVxuICAgIHByb3RvdHlwZXMucmVzdG9yZSgpXG4gICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvclxuICAgIHJldHVybiByZXN1bHRcbiAgfSxcbiAgcGFyc2U6IGZ1bmN0aW9uIHBhcnNlICgpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZS5hcHBseShKU09OLCBhcmd1bWVudHMpXG4gIH1cbn1cblxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0ganNvbkJvdXJuZVxufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ganNvbkJvdXJuZVxuICB9KVxufSBlbHNlIHtcbiAgd2luZG93Lmpzb25Cb3VybmUgPSBqc29uQm91cm5lXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVByb3RvdHlwZXMgKCkge1xuICB2YXIgYXJyYXlUb0pTT04gPSBBcnJheS5wcm90b3R5cGUudG9KU09OXG4gIHZhciBkYXRlVG9KU09OID0gRGF0ZS5wcm90b3R5cGUudG9KU09OXG4gIGRlbGV0ZSBBcnJheS5wcm90b3R5cGUudG9KU09OXG4gIERhdGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdG9Jc29EYXRlKHRoaXMpXG4gIH1cbiAgcmV0dXJuIHtcbiAgICByZXN0b3JlOiBmdW5jdGlvbiByZXN0b3JlICgpIHtcbiAgICAgIGlmIChhcnJheVRvSlNPTiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIEFycmF5LnByb3RvdHlwZS50b0pTT04gPSBhcnJheVRvSlNPTlxuICAgICAgfVxuICAgICAgaWYgKGRhdGVUb0pTT04gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBEYXRlLnByb3RvdHlwZS50b0pTT04gPSBkYXRlVG9KU09OXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZWxldGUgRGF0ZS5wcm90b3R5cGUudG9KU09OXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHRvSXNvRGF0ZSAoZGF0ZSkge1xuICByZXR1cm4gaXNGaW5pdGUoZGF0ZS52YWx1ZU9mKCkpID9cbiAgICBkYXRlLmdldFVUQ0Z1bGxZZWFyKCkgKyAnLScgK1xuICAgIHBhZChkYXRlLmdldFVUQ01vbnRoKCkgKyAxLCAyKSArICctJyArXG4gICAgcGFkKGRhdGUuZ2V0VVRDRGF0ZSgpLCAyKSArICdUJyArXG4gICAgcGFkKGRhdGUuZ2V0VVRDSG91cnMoKSwgMikgKyAnOicgK1xuICAgIHBhZChkYXRlLmdldFVUQ01pbnV0ZXMoKSwgMikgKyAnOicgK1xuICAgIHBhZChkYXRlLmdldFVUQ1NlY29uZHMoKSwgMikgKyAnLicgK1xuICAgIHBhZChkYXRlLmdldFVUQ01pbGxpc2Vjb25kcygpLCAzKSArICdaJyA6IG51bGxcbn1cblxuZnVuY3Rpb24gcGFkIChudW1iZXIpIHtcbiAgdmFyIHIgPSBTdHJpbmcobnVtYmVyKVxuICBpZiAoci5sZW5ndGggPT09IDEpIHtcbiAgICByID0gJzAnICsgclxuICB9XG4gIHJldHVybiByXG59XG4iLCJ2YXIgdG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmdcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcbnZhciByZWdleHBDaGFyYWN0ZXJzID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nXG52YXIgcmVnZXhwSXNOYXRpdmVGbiA9IHRvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpXG4gIC5yZXBsYWNlKHJlZ2V4cENoYXJhY3RlcnMsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JylcbnZhciByZWdleHBJc05hdGl2ZSA9IFJlZ0V4cCgnXicgKyByZWdleHBJc05hdGl2ZUZuICsgJyQnKVxuZnVuY3Rpb24gdG9Tb3VyY2UgKGZ1bmMpIHtcbiAgaWYgKCFmdW5jKSByZXR1cm4gJydcbiAgdHJ5IHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChmdW5jKVxuICB9IGNhdGNoIChlKSB7fVxuICB0cnkge1xuICAgIHJldHVybiAoZnVuYyArICcnKVxuICB9IGNhdGNoIChlKSB7fVxufVxudmFyIGFzc2lnbiA9IE9iamVjdC5hc3NpZ25cbnZhciBmb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2hcbnZhciBldmVyeSA9IEFycmF5LnByb3RvdHlwZS5ldmVyeVxudmFyIGZpbHRlciA9IEFycmF5LnByb3RvdHlwZS5maWx0ZXJcbnZhciBmaW5kID0gQXJyYXkucHJvdG90eXBlLmZpbmRcbnZhciBpbmRleE9mID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2ZcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheVxudmFyIGtleXMgPSBPYmplY3Qua2V5c1xudmFyIG1hcCA9IEFycmF5LnByb3RvdHlwZS5tYXBcbnZhciByZWR1Y2UgPSBBcnJheS5wcm90b3R5cGUucmVkdWNlXG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2VcbnZhciBzb21lID0gQXJyYXkucHJvdG90eXBlLnNvbWVcbnZhciB2YWx1ZXMgPSBPYmplY3QudmFsdWVzXG5mdW5jdGlvbiBpc05hdGl2ZSAobWV0aG9kKSB7XG4gIHJldHVybiBtZXRob2QgJiYgdHlwZW9mIG1ldGhvZCA9PT0gJ2Z1bmN0aW9uJyAmJiByZWdleHBJc05hdGl2ZS50ZXN0KHRvU291cmNlKG1ldGhvZCkpXG59XG52YXIgXyA9IHtcbiAgYXNzaWduOiBpc05hdGl2ZShhc3NpZ24pXG4gICAgPyBhc3NpZ25cbiAgICA6IGZ1bmN0aW9uIGFzc2lnbiAodGFyZ2V0KSB7XG4gICAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV1cbiAgICAgICAgZm9yICh2YXIgaiBpbiBzb3VyY2UpIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoaikpIHRhcmdldFtqXSA9IHNvdXJjZVtqXVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRhcmdldFxuICAgIH0sXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQgKG1ldGhvZCwgY29udGV4dCkge1xuICAgIHZhciBhcmdzID0gXy5zbGljZShhcmd1bWVudHMsIDIpXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGJvdW5kRnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChfLnNsaWNlKGFyZ3VtZW50cykpKVxuICAgIH1cbiAgfSxcbiAgZGVib3VuY2U6IGZ1bmN0aW9uIGRlYm91bmNlIChmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dFxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXNcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzXG4gICAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsXG4gICAgICAgIGlmICghaW1tZWRpYXRlKSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgICB9XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dFxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpXG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdClcbiAgICAgIGlmIChjYWxsTm93KSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgfVxuICB9LFxuICBlYWNoOiBpc05hdGl2ZShmb3JFYWNoKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRWFjaCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZm9yRWFjaC5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBlYWNoIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykgY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgfSxcbiAgZXZlcnk6IGlzTmF0aXZlKGV2ZXJ5KVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRXZlcnkgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBldmVyeS5jYWxsKGNvbGwsIHByZWQsIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZXZlcnkgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIGlmICghY29sbCB8fCAhcHJlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKClcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXByZWQuY2FsbChjb250ZXh0LCBjb2xsW2ldLCBpLCBjb2xsKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG4gIGZpbHRlcjogaXNOYXRpdmUoZmlsdGVyKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRmlsdGVyIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmaWx0ZXIuY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZmlsdGVyIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICB2YXIgb3V0cHV0ID0gW11cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSkpIG91dHB1dC5wdXNoKGFycmF5W2ldKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgIH0sXG4gIGZpbmQ6IGlzTmF0aXZlKGZpbmQpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVGaW5kIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmaW5kLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGZpbmQgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSkpIHJldHVybiBhcnJheVtpXVxuICAgICAgfVxuICAgIH0sXG4gIGdldDogZnVuY3Rpb24gZ2V0IChvYmplY3QsIHBhdGgpIHtcbiAgICByZXR1cm4gXy5yZWR1Y2UocGF0aC5zcGxpdCgnLicpLCBmdW5jdGlvbiAobWVtbywgbmV4dCkge1xuICAgICAgcmV0dXJuICh0eXBlb2YgbWVtbyAhPT0gJ3VuZGVmaW5lZCcgJiYgbWVtbyAhPT0gbnVsbCkgPyBtZW1vW25leHRdIDogdW5kZWZpbmVkXG4gICAgfSwgb2JqZWN0KVxuICB9LFxuICBpZGVudGl0eTogZnVuY3Rpb24gaWRlbnRpdHkgKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG4gIGluZGV4T2Y6IGlzTmF0aXZlKGluZGV4T2YpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVJbmRleE9mIChhcnJheSwgaXRlbSkge1xuICAgICAgcmV0dXJuIGluZGV4T2YuY2FsbChhcnJheSwgaXRlbSlcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBpbmRleE9mIChhcnJheSwgaXRlbSkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGlcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMVxuICAgIH0sXG4gIGludm9rZTogZnVuY3Rpb24gaW52b2tlIChhcnJheSwgbWV0aG9kTmFtZSkge1xuICAgIHZhciBhcmdzID0gXy5zbGljZShhcmd1bWVudHMsIDIpXG4gICAgcmV0dXJuIF8ubWFwKGFycmF5LCBmdW5jdGlvbiBpbnZva2VNYXBwZXIgKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWVbbWV0aG9kTmFtZV0uYXBwbHkodmFsdWUsIGFyZ3MpXG4gICAgfSlcbiAgfSxcbiAgaXNBcnJheTogaXNOYXRpdmUoaXNBcnJheSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUFycmF5IChjb2xsKSB7XG4gICAgICByZXR1cm4gaXNBcnJheShjb2xsKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGlzQXJyYXkgKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgfSxcbiAgaXNNYXRjaDogZnVuY3Rpb24gaXNNYXRjaCAob2JqLCBzcGVjKSB7XG4gICAgZm9yICh2YXIgaSBpbiBzcGVjKSB7XG4gICAgICBpZiAoc3BlYy5oYXNPd25Qcm9wZXJ0eShpKSAmJiBvYmpbaV0gIT09IHNwZWNbaV0pIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9LFxuICBpc09iamVjdDogZnVuY3Rpb24gaXNPYmplY3QgKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9ialxuICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqXG4gIH0sXG4gIGtleXM6IGlzTmF0aXZlKGtleXMpXG4gICAgPyBrZXlzXG4gICAgOiBmdW5jdGlvbiBrZXlzIChvYmplY3QpIHtcbiAgICAgIHZhciBrZXlzID0gW11cbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSBrZXlzLnB1c2goa2V5KVxuICAgICAgfVxuICAgICAgcmV0dXJuIGtleXNcbiAgICB9LFxuICBtYXA6IGlzTmF0aXZlKG1hcClcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZU1hcCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gbWFwLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIG1hcCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgdmFyIG91dHB1dCA9IG5ldyBBcnJheShsKVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgb3V0cHV0W2ldID0gY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcbiAgbWF0Y2hlczogZnVuY3Rpb24gbWF0Y2hlcyAoc3BlYykge1xuICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gXy5pc01hdGNoKG9iaiwgc3BlYylcbiAgICB9XG4gIH0sXG4gIG5vdDogZnVuY3Rpb24gbm90ICh2YWx1ZSkge1xuICAgIHJldHVybiAhdmFsdWVcbiAgfSxcbiAgb2JqZWN0RWFjaDogZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICByZXR1cm4gXy5lYWNoKF8ua2V5cyhvYmplY3QpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2suY2FsbChjb250ZXh0LCBvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpXG4gICAgfSwgY29udGV4dClcbiAgfSxcbiAgb2JqZWN0TWFwOiBmdW5jdGlvbiBvYmplY3RNYXAgKG9iamVjdCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge31cbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG9iamVjdFtrZXldLCBrZXksIG9iamVjdClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9LFxuICBvYmplY3RSZWR1Y2U6IGZ1bmN0aW9uIG9iamVjdFJlZHVjZSAob2JqZWN0LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKSB7XG4gICAgdmFyIG91dHB1dCA9IGluaXRpYWxWYWx1ZVxuICAgIGZvciAodmFyIGkgaW4gb2JqZWN0KSB7XG4gICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGkpKSBvdXRwdXQgPSBjYWxsYmFjayhvdXRwdXQsIG9iamVjdFtpXSwgaSwgb2JqZWN0KVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0XG4gIH0sXG4gIHBpY2s6IGZ1bmN0aW9uIHBpY2sgKG9iamVjdCwgdG9QaWNrKSB7XG4gICAgdmFyIG91dCA9IHt9XG4gICAgXy5lYWNoKHRvUGljaywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKHR5cGVvZiBvYmplY3Rba2V5XSAhPT0gJ3VuZGVmaW5lZCcpIG91dFtrZXldID0gb2JqZWN0W2tleV1cbiAgICB9KVxuICAgIHJldHVybiBvdXRcbiAgfSxcbiAgcGx1Y2s6IGZ1bmN0aW9uIHBsdWNrIChhcnJheSwga2V5KSB7XG4gICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICB2YXIgb3V0ID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykgaWYgKGFycmF5W2ldKSBvdXRbaV0gPSBhcnJheVtpXVtrZXldXG4gICAgcmV0dXJuIG91dFxuICB9LFxuICByZWR1Y2U6IGlzTmF0aXZlKHJlZHVjZSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZVJlZHVjZSAoYXJyYXksIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpIHtcbiAgICAgIHJldHVybiByZWR1Y2UuY2FsbChhcnJheSwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSlcbiAgICB9XG4gICAgOiBmdW5jdGlvbiByZWR1Y2UgKGFycmF5LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKSB7XG4gICAgICB2YXIgb3V0cHV0ID0gaW5pdGlhbFZhbHVlXG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIG91dHB1dCA9IGNhbGxiYWNrKG91dHB1dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgIH0sXG4gIHNldDogZnVuY3Rpb24gc2V0IChvYmplY3QsIHBhdGgsIHZhbCkge1xuICAgIGlmICghb2JqZWN0KSByZXR1cm4gb2JqZWN0XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnICYmIHR5cGVvZiBvYmplY3QgIT09ICdmdW5jdGlvbicpIHJldHVybiBvYmplY3RcbiAgICB2YXIgcGFydHMgPSBwYXRoLnNwbGl0KCcuJylcbiAgICB2YXIgY29udGV4dCA9IG9iamVjdFxuICAgIHZhciBuZXh0S2V5XG4gICAgZG8ge1xuICAgICAgbmV4dEtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgIGlmICh0eXBlb2YgY29udGV4dFtuZXh0S2V5XSAhPT0gJ29iamVjdCcpIGNvbnRleHRbbmV4dEtleV0gPSB7fVxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCkge1xuICAgICAgICBjb250ZXh0ID0gY29udGV4dFtuZXh0S2V5XVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGV4dFtuZXh0S2V5XSA9IHZhbFxuICAgICAgfVxuICAgIH0gd2hpbGUgKHBhcnRzLmxlbmd0aClcbiAgICByZXR1cm4gb2JqZWN0XG4gIH0sXG4gIHNsaWNlOiBpc05hdGl2ZShzbGljZSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZVNsaWNlIChhcnJheSwgYmVnaW4sIGVuZCkge1xuICAgICAgYmVnaW4gPSBiZWdpbiB8fCAwXG4gICAgICBlbmQgPSB0eXBlb2YgZW5kID09PSAnbnVtYmVyJyA/IGVuZCA6IGFycmF5Lmxlbmd0aFxuICAgICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIGJlZ2luLCBlbmQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gc2xpY2UgKGFycmF5LCBzdGFydCwgZW5kKSB7XG4gICAgICBzdGFydCA9IHN0YXJ0IHx8IDBcbiAgICAgIGVuZCA9IHR5cGVvZiBlbmQgPT09ICdudW1iZXInID8gZW5kIDogYXJyYXkubGVuZ3RoXG4gICAgICB2YXIgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGhcbiAgICAgIGlmICghbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBbXVxuICAgICAgfVxuICAgICAgaWYgKHN0YXJ0IDwgMCkge1xuICAgICAgICBzdGFydCA9IC1zdGFydCA+IGxlbmd0aCA/IDAgOiAobGVuZ3RoICsgc3RhcnQpXG4gICAgICB9XG4gICAgICBlbmQgPSBlbmQgPiBsZW5ndGggPyBsZW5ndGggOiBlbmRcbiAgICAgIGlmIChlbmQgPCAwKSB7XG4gICAgICAgIGVuZCArPSBsZW5ndGhcbiAgICAgIH1cbiAgICAgIGxlbmd0aCA9IHN0YXJ0ID4gZW5kID8gMCA6ICgoZW5kIC0gc3RhcnQpID4+PiAwKVxuICAgICAgc3RhcnQgPj4+PSAwXG4gICAgICB2YXIgaW5kZXggPSAtMVxuICAgICAgdmFyIHJlc3VsdCA9IG5ldyBBcnJheShsZW5ndGgpXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gYXJyYXlbaW5kZXggKyBzdGFydF1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9LFxuICBzb21lOiBpc05hdGl2ZShzb21lKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlU29tZSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHNvbWUuY2FsbChjb2xsLCBwcmVkLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIHNvbWUgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIGlmICghY29sbCB8fCAhcHJlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKClcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJlZC5jYWxsKGNvbnRleHQsIGNvbGxbaV0sIGksIGNvbGwpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSxcbiAgdW5pcXVlOiBmdW5jdGlvbiB1bmlxdWUgKGFycmF5KSB7XG4gICAgcmV0dXJuIF8ucmVkdWNlKGFycmF5LCBmdW5jdGlvbiAobWVtbywgY3Vycikge1xuICAgICAgaWYgKF8uaW5kZXhPZihtZW1vLCBjdXJyKSA9PT0gLTEpIHtcbiAgICAgICAgbWVtby5wdXNoKGN1cnIpXG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0sIFtdKVxuICB9LFxuICB2YWx1ZXM6IGlzTmF0aXZlKHZhbHVlcylcbiAgICA/IHZhbHVlc1xuICAgIDogZnVuY3Rpb24gdmFsdWVzIChvYmplY3QpIHtcbiAgICAgIHZhciBvdXQgPSBbXVxuICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIG91dC5wdXNoKG9iamVjdFtrZXldKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dFxuICAgIH0sXG4gIG5hbWU6ICdzbGFwZGFzaCcsXG4gIHZlcnNpb246ICcxLjMuMydcbn1cbl8ub2JqZWN0TWFwLmFzQXJyYXkgPSBmdW5jdGlvbiBvYmplY3RNYXBBc0FycmF5IChvYmplY3QsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIHJldHVybiBfLm1hcChfLmtleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG9iamVjdFtrZXldLCBrZXksIG9iamVjdClcbiAgfSwgY29udGV4dClcbn1cbm1vZHVsZS5leHBvcnRzID0gX1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMl0udXNlWzJdIS4vdmFyaWF0aW9uLmxlc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi8uLi8uLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi8uLi8uLi9ub2RlX21vZHVsZXMvbGVzcy1sb2FkZXIvZGlzdC9janMuanM/P3J1bGVTZXRbMV0ucnVsZXNbMl0udXNlWzJdIS4vdmFyaWF0aW9uLmxlc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1syXS51c2VbMl0hLi92YXJpYXRpb24ubGVzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4uLy4uLy4uL25vZGVfbW9kdWxlcy9sZXNzLWxvYWRlci9kaXN0L2Nqcy5qcz8/cnVsZVNldFsxXS5ydWxlc1syXS51c2VbMl0hLi92YXJpYXRpb24ubGVzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcblxuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG5cbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG5cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuXG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuXG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiB1cGRhdGVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuXG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcblxuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuXG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuXG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuXG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTsgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcblxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuXG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuXG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuXG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcblxuICBpZiAobm9uY2UpIHtcbiAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgbm9uY2UpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG5cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuXG4gIGNzcyArPSBvYmouY3NzO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuXG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfSAvLyBGb3Igb2xkIElFXG5cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuXG5cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuXG5cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG5cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCJ2YXIgUHJvbWlzZSA9IHJlcXVpcmUoJy4vaW5kZXgnKVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZlcnJlZCAoKSB7XG4gIHZhciBfcmVzb2x2ZSwgX3JlamVjdFxuICB2YXIgX3Byb21pc2UgPSBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBfcmVzb2x2ZSA9IHJlc29sdmVcbiAgICBfcmVqZWN0ID0gcmVqZWN0XG4gIH0pXG4gIHJldHVybiB7XG4gICAgcHJvbWlzZTogX3Byb21pc2UsXG4gICAgcmVzb2x2ZTogX3Jlc29sdmUsXG4gICAgcmVqZWN0OiBfcmVqZWN0XG4gIH1cbn1cbiIsInZhciBlcnIgPSBuZXcgRXJyb3IoJ0Vycm9yOiByZWN1cnNlcyEgaW5maW5pdGUgcHJvbWlzZSBjaGFpbiBkZXRlY3RlZCcpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHByb21pc2UgKHJlc29sdmVyKSB7XG4gIHZhciB3YWl0aW5nID0geyByZXM6IFtdLCByZWo6IFtdIH1cbiAgdmFyIHAgPSB7XG4gICAgJ3RoZW4nOiB0aGVuLFxuICAgICdjYXRjaCc6IGZ1bmN0aW9uIHRoZW5DYXRjaCAob25SZWplY3QpIHtcbiAgICAgIHJldHVybiB0aGVuKG51bGwsIG9uUmVqZWN0KVxuICAgIH1cbiAgfVxuICB0cnkgeyByZXNvbHZlcihyZXNvbHZlLCByZWplY3QpIH0gY2F0Y2ggKGUpIHtcbiAgICBwLnN0YXR1cyA9IGZhbHNlXG4gICAgcC52YWx1ZSA9IGVcbiAgfVxuICByZXR1cm4gcFxuXG4gIGZ1bmN0aW9uIHRoZW4gKG9uUmVzb2x2ZSwgb25SZWplY3QpIHtcbiAgICByZXR1cm4gcHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB3YWl0aW5nLnJlcy5wdXNoKGhhbmRsZU5leHQocCwgd2FpdGluZywgb25SZXNvbHZlLCByZXNvbHZlLCByZWplY3QsIG9uUmVqZWN0KSlcbiAgICAgIHdhaXRpbmcucmVqLnB1c2goaGFuZGxlTmV4dChwLCB3YWl0aW5nLCBvblJlamVjdCwgcmVzb2x2ZSwgcmVqZWN0LCBvblJlamVjdCkpXG4gICAgICBpZiAodHlwZW9mIHAuc3RhdHVzICE9PSAndW5kZWZpbmVkJykgZmx1c2god2FpdGluZywgcClcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZSAodmFsKSB7XG4gICAgaWYgKHR5cGVvZiBwLnN0YXR1cyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuICAgIGlmICh2YWwgPT09IHApIHRocm93IGVyclxuICAgIGlmICh2YWwpIHRyeSB7IGlmICh0eXBlb2YgdmFsLnRoZW4gPT09ICdmdW5jdGlvbicpIHJldHVybiB2YWwudGhlbihyZXNvbHZlLCByZWplY3QpIH0gY2F0Y2ggKGUpIHt9XG4gICAgcC5zdGF0dXMgPSB0cnVlXG4gICAgcC52YWx1ZSA9IHZhbFxuICAgIGZsdXNoKHdhaXRpbmcsIHApXG4gIH1cblxuICBmdW5jdGlvbiByZWplY3QgKHZhbCkge1xuICAgIGlmICh0eXBlb2YgcC5zdGF0dXMgIT09ICd1bmRlZmluZWQnKSByZXR1cm5cbiAgICBpZiAodmFsID09PSBwKSB0aHJvdyBlcnJcbiAgICBwLnN0YXR1cyA9IGZhbHNlXG4gICAgcC52YWx1ZSA9IHZhbFxuICAgIGZsdXNoKHdhaXRpbmcsIHApXG4gIH1cbn1cblxuZnVuY3Rpb24gZmx1c2ggKHdhaXRpbmcsIHApIHtcbiAgdmFyIHF1ZXVlID0gcC5zdGF0dXMgPyB3YWl0aW5nLnJlcyA6IHdhaXRpbmcucmVqXG4gIHdoaWxlIChxdWV1ZS5sZW5ndGgpIHF1ZXVlLnNoaWZ0KCkocC52YWx1ZSlcbn1cblxuZnVuY3Rpb24gaGFuZGxlTmV4dCAocCwgd2FpdGluZywgaGFuZGxlciwgcmVzb2x2ZSwgcmVqZWN0LCBoYXNSZWplY3QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG5leHQgKHZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhbHVlID0gaGFuZGxlciA/IGhhbmRsZXIodmFsdWUpIDogdmFsdWVcbiAgICAgIGlmIChwLnN0YXR1cykgcmV0dXJuIHJlc29sdmUodmFsdWUpXG4gICAgICByZXR1cm4gaGFzUmVqZWN0ID8gcmVzb2x2ZSh2YWx1ZSkgOiByZWplY3QodmFsdWUpXG4gICAgfSBjYXRjaCAoZXJyKSB7IHJlamVjdChlcnIpIH1cbiAgfVxufVxuIiwiY29uc3QgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcbmNvbnN0IG9uY2UgPSByZXF1aXJlKCcuLi9saWIvb25jZScpXG5jb25zdCB3aXRoUmVzdG9yZUFsbCA9IHJlcXVpcmUoJy4uL2xpYi93aXRoUmVzdG9yZUFsbCcpXG5jb25zdCBwcm9taXNlZCA9IHJlcXVpcmUoJy4uL2xpYi9wcm9taXNlZCcpXG5jb25zdCBub29wID0gKCkgPT4ge31cblxuZnVuY3Rpb24gb25FdmVudCAoZWwsIHR5cGUsIGZuKSB7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgZm4pXG4gIHJldHVybiBvbmNlKCgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgZm4pKVxufVxuXG5mdW5jdGlvbiBzdHlsZSAoZWwsIGNzcywgZm4pIHtcbiAgY29uc3Qgb3JpZ2luYWxTdHlsZSA9IGVsLmdldEF0dHJpYnV0ZSgnc3R5bGUnKVxuICBjb25zdCBuZXdTdHlsZSA9IHR5cGVvZiBjc3MgPT09ICdzdHJpbmcnID8gZnJvbVN0eWxlKGNzcykgOiBjc3NcbiAgY29uc3QgbWVyZ2VkID0ge1xuICAgIC4uLmZyb21TdHlsZShvcmlnaW5hbFN0eWxlKSxcbiAgICAuLi5uZXdTdHlsZVxuICB9XG4gIGVsLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCB0b1N0eWxlKG1lcmdlZCkpXG4gIHJldHVybiBvbmNlKCgpID0+IGVsLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBvcmlnaW5hbFN0eWxlKSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0eWxlIChzdHlsZSkge1xuICBpZiAoIXN0eWxlKSBzdHlsZSA9ICcnXG4gIHJldHVybiBzdHlsZS5zcGxpdCgnOycpLnJlZHVjZSgobWVtbywgdmFsKSA9PiB7XG4gICAgaWYgKCF2YWwpIHJldHVybiBtZW1vXG4gICAgY29uc3QgW2tleSwgLi4udmFsdWVdID0gdmFsLnNwbGl0KCc6JylcbiAgICBtZW1vW2tleV0gPSB2YWx1ZS5qb2luKCc6JylcbiAgICByZXR1cm4gbWVtb1xuICB9LCB7fSlcbn1cblxuZnVuY3Rpb24gdG9TdHlsZSAoY3NzKSB7XG4gIHJldHVybiBfLmtleXMoY3NzKS5yZWR1Y2UoKG1lbW8sIGtleSkgPT4ge1xuICAgIHJldHVybiBtZW1vICsgYCR7a2ViYWIoa2V5KX06JHtjc3Nba2V5XX07YFxuICB9LCAnJylcbn1cblxuZnVuY3Rpb24ga2ViYWIgKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbQS1aXSkvZywgJy0kMScpLnRvTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gaXNJblZpZXdQb3J0IChlbCkge1xuICBpZiAoZWwgJiYgZWwucGFyZW50RWxlbWVudCkge1xuICAgIGNvbnN0IHsgdG9wLCBib3R0b20gfSA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgaXNBYm92ZVdpbmRvd3NCb3R0b20gPVxuICAgICAgdG9wID09PSBib3R0b21cbiAgICAgICAgPyAvLyBJZiBib3RoIGJvdHRvbSBhbmQgdG9wIGFyZSBhdCB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICAgICAgICAvLyB0aGUgZWxlbWVudCBpcyBlbnRpcmVseSBpbnNpZGUgdGhlIHZpZXdwb3J0XG4gICAgICAgICAgdG9wIDw9IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICA6IC8vIElmIHRoZSBlbGVtZW50IGhhcyBoZWlnaHQsIHdoZW4gdG9wIGlzIGF0IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAgIC8vIHRoZSBlbGVtZW50IGlzIGJlbG93IHRoZSB3aW5kb3dcbiAgICAgICAgICB0b3AgPCB3aW5kb3cuaW5uZXJIZWlnaHRcbiAgICBjb25zdCBpc0JlbG93V2luZG93c1RvcCA9XG4gICAgICB0b3AgPT09IGJvdHRvbVxuICAgICAgICA/IC8vIElmIGJvdGggYm90dG9tIGFuZCB0b3AgYXJlIGF0IDBweFxuICAgICAgICAgIC8vIHRoZSBlbGVtZW50IGlzIGVudGlyZWx5IGluc2lkZSB0aGUgdmlld3BvcnRcbiAgICAgICAgICBib3R0b20gPj0gMFxuICAgICAgICA6IC8vIElmIHRoZSBlbGVtZW50IGhhcyBoZWlnaHQsIHdoZW4gYm90dG9tIGlzIGF0IDBweFxuICAgICAgICAgIC8vIHRoZSBlbGVtZW50IGlzIGFib3ZlIHRoZSB3aW5kb3dcbiAgICAgICAgICBib3R0b20gPiAwXG4gICAgcmV0dXJuIGlzQWJvdmVXaW5kb3dzQm90dG9tICYmIGlzQmVsb3dXaW5kb3dzVG9wXG4gIH1cbn1cblxuZnVuY3Rpb24gb25BbnlFbnRlclZpZXdwb3J0IChlbHMsIGZuKSB7XG4gIGNvbnN0IGRpc3Bvc2FibGVzID0gW11cbiAgXy5lYWNoKGVscywgZWwgPT4gZGlzcG9zYWJsZXMucHVzaChvbkVudGVyVmlld3BvcnQoZWwsIGZuKSkpXG4gIHJldHVybiBvbmNlKCgpID0+IHtcbiAgICB3aGlsZSAoZGlzcG9zYWJsZXMubGVuZ3RoKSBkaXNwb3NhYmxlcy5wb3AoKSgpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIG9uRW50ZXJWaWV3cG9ydCAoZWwsIGZuLCBzY3JvbGxUYXJnZXRFbCA9IHdpbmRvdykge1xuICBpZiAoXy5pc0FycmF5KGVsKSkge1xuICAgIHJldHVybiBvbkFueUVudGVyVmlld3BvcnQoZWwsIGZuKVxuICB9XG5cbiAgaWYgKGlzSW5WaWV3UG9ydChlbCkpIHtcbiAgICBmbigpXG4gICAgcmV0dXJuIG5vb3BcbiAgfVxuXG4gIGNvbnN0IGhhbmRsZVNjcm9sbCA9IF8uZGVib3VuY2UoKCkgPT4ge1xuICAgIGlmIChpc0luVmlld1BvcnQoZWwpKSB7XG4gICAgICBzY3JvbGxUYXJnZXRFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBoYW5kbGVTY3JvbGwpXG4gICAgICBmbigpXG4gICAgfVxuICB9LCA1MClcbiAgc2Nyb2xsVGFyZ2V0RWwuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgaGFuZGxlU2Nyb2xsKVxuICByZXR1cm4gb25jZSgoKSA9PiBzY3JvbGxUYXJnZXRFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBoYW5kbGVTY3JvbGwpKVxufVxuXG5mdW5jdGlvbiByZXBsYWNlICh0YXJnZXQsIGVsKSB7XG4gIGNvbnN0IHBhcmVudCA9IHRhcmdldC5wYXJlbnRFbGVtZW50XG4gIHBhcmVudC5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5uZXh0U2libGluZylcbiAgcGFyZW50LnJlbW92ZUNoaWxkKHRhcmdldClcbiAgcmV0dXJuIG9uY2UoKCkgPT4gcmVwbGFjZShlbCwgdGFyZ2V0KSlcbn1cblxuZnVuY3Rpb24gaW5zZXJ0QWZ0ZXIgKHRhcmdldCwgZWwpIHtcbiAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnRcbiAgcGFyZW50Lmluc2VydEJlZm9yZShlbCwgdGFyZ2V0Lm5leHRTaWJsaW5nKVxuICByZXR1cm4gb25jZSgoKSA9PiBwYXJlbnQucmVtb3ZlQ2hpbGQoZWwpKVxufVxuXG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUgKHRhcmdldCwgZWwpIHtcbiAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnRcbiAgcGFyZW50Lmluc2VydEJlZm9yZShlbCwgdGFyZ2V0KVxuICByZXR1cm4gb25jZSgoKSA9PiBwYXJlbnQucmVtb3ZlQ2hpbGQoZWwpKVxufVxuXG5mdW5jdGlvbiBhcHBlbmRDaGlsZCAodGFyZ2V0LCBlbCkge1xuICB0YXJnZXQuYXBwZW5kQ2hpbGQoZWwpXG4gIHJldHVybiBvbmNlKCgpID0+IHRhcmdldC5yZW1vdmVDaGlsZChlbCkpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICBjb25zdCB1dGlscyA9IHdpdGhSZXN0b3JlQWxsKHtcbiAgICBvbkV2ZW50LFxuICAgIG9uRW50ZXJWaWV3cG9ydCxcbiAgICByZXBsYWNlLFxuICAgIHN0eWxlLFxuICAgIGluc2VydEFmdGVyLFxuICAgIGluc2VydEJlZm9yZSxcbiAgICBhcHBlbmRDaGlsZCxcbiAgICBjbG9zZXN0XG4gIH0pXG5cbiAgXy5lYWNoKF8ua2V5cyh1dGlscyksIGtleSA9PiB7XG4gICAgaWYgKGtleS5pbmRleE9mKCdvbicpID09PSAwKSB1dGlsc1trZXldID0gcHJvbWlzZWQodXRpbHNba2V5XSlcbiAgfSlcblxuICByZXR1cm4gdXRpbHNcbn1cblxuZnVuY3Rpb24gY2xvc2VzdCAoZWxlbWVudCwgc2VsZWN0b3IpIHtcbiAgaWYgKHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0KSB7XG4gICAgcmV0dXJuIHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0LmNhbGwoZWxlbWVudCwgc2VsZWN0b3IpXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzIHx8XG4gICAgICB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgIHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3JcblxuICAgIGxldCBlbCA9IGVsZW1lbnRcblxuICAgIGRvIHtcbiAgICAgIGlmIChtYXRjaGVzLmNhbGwoZWwsIHNlbGVjdG9yKSkgcmV0dXJuIGVsXG4gICAgICBlbCA9IGVsLnBhcmVudEVsZW1lbnQgfHwgZWwucGFyZW50Tm9kZVxuICAgIH0gd2hpbGUgKGVsICE9PSBudWxsICYmIGVsLm5vZGVUeXBlID09PSAxKVxuICAgIHJldHVybiBudWxsXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gb25jZSAoZm4pIHtcbiAgbGV0IGNhbGxlZCA9IGZhbHNlXG4gIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgIGlmIChjYWxsZWQpIHJldHVyblxuICAgIGNhbGxlZCA9IHRydWVcbiAgICByZXR1cm4gZm4oLi4uYXJncylcbiAgfVxufVxuIiwiY29uc3QgUHJvbWlzZSA9IHJlcXVpcmUoJ3N5bmMtcCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcHJvbWlzZWQgKGZuKSB7XG4gIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgIGlmICh0eXBlb2YgYXJnc1thcmdzLmxlbmd0aCAtIDFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZm4oLi4uYXJncylcbiAgICB9XG4gICAgbGV0IGRpc3Bvc2VcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBhcmdzLnB1c2gocmVzb2x2ZSlcbiAgICAgIGRpc3Bvc2UgPSBmbiguLi5hcmdzKVxuICAgIH0pLnRoZW4odmFsdWUgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBkaXNwb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRpc3Bvc2UoKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfSlcbiAgfVxufVxuIiwiY29uc3QgXyA9IHJlcXVpcmUoJ3NsYXBkYXNoJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB3aXRoUmVzdG9yZUFsbCAodXRpbHMpIHtcbiAgY29uc3QgY2xlYW51cCA9IFtdXG5cbiAgZnVuY3Rpb24gcmVzdG9yYWJsZSAoZm4pIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgIGNvbnN0IGRpc3Bvc2UgPSBmbiguLi5hcmdzKVxuICAgICAgaWYgKHR5cGVvZiBkaXNwb3NlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNsZWFudXAucHVzaChkaXNwb3NlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGRpc3Bvc2VcbiAgICB9XG4gIH1cbiAgY29uc3QgcmVzdWx0ID0ge31cblxuICBmb3IgKGNvbnN0IGtleSBvZiBfLmtleXModXRpbHMpKSB7XG4gICAgcmVzdWx0W2tleV0gPSByZXN0b3JhYmxlKHV0aWxzW2tleV0pXG4gIH1cblxuICByZXN1bHQucmVzdG9yZUFsbCA9IGZ1bmN0aW9uIHJlc3RvcmVBbGwgKCkge1xuICAgIHdoaWxlIChjbGVhbnVwLmxlbmd0aCkgY2xlYW51cC5wb3AoKSgpXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG4iLCJ2YXIgbixsLHUsaSx0LG8scixmLGU9e30sYz1bXSxzPS9hY2l0fGV4KD86c3xnfG58cHwkKXxycGh8Z3JpZHxvd3N8bW5jfG50d3xpbmVbY2hdfHpvb3xeb3JkfGl0ZXJhL2k7ZnVuY3Rpb24gYShuLGwpe2Zvcih2YXIgdSBpbiBsKW5bdV09bFt1XTtyZXR1cm4gbn1mdW5jdGlvbiBoKG4pe3ZhciBsPW4ucGFyZW50Tm9kZTtsJiZsLnJlbW92ZUNoaWxkKG4pfWZ1bmN0aW9uIHYobCx1LGkpe3ZhciB0LG8scixmPXt9O2ZvcihyIGluIHUpXCJrZXlcIj09cj90PXVbcl06XCJyZWZcIj09cj9vPXVbcl06ZltyXT11W3JdO2lmKGFyZ3VtZW50cy5sZW5ndGg+MiYmKGYuY2hpbGRyZW49YXJndW1lbnRzLmxlbmd0aD4zP24uY2FsbChhcmd1bWVudHMsMik6aSksXCJmdW5jdGlvblwiPT10eXBlb2YgbCYmbnVsbCE9bC5kZWZhdWx0UHJvcHMpZm9yKHIgaW4gbC5kZWZhdWx0UHJvcHMpdm9pZCAwPT09ZltyXSYmKGZbcl09bC5kZWZhdWx0UHJvcHNbcl0pO3JldHVybiB5KGwsZix0LG8sbnVsbCl9ZnVuY3Rpb24geShuLGksdCxvLHIpe3ZhciBmPXt0eXBlOm4scHJvcHM6aSxrZXk6dCxyZWY6byxfX2s6bnVsbCxfXzpudWxsLF9fYjowLF9fZTpudWxsLF9fZDp2b2lkIDAsX19jOm51bGwsX19oOm51bGwsY29uc3RydWN0b3I6dm9pZCAwLF9fdjpudWxsPT1yPysrdTpyfTtyZXR1cm4gbnVsbD09ciYmbnVsbCE9bC52bm9kZSYmbC52bm9kZShmKSxmfWZ1bmN0aW9uIHAoKXtyZXR1cm57Y3VycmVudDpudWxsfX1mdW5jdGlvbiBkKG4pe3JldHVybiBuLmNoaWxkcmVufWZ1bmN0aW9uIF8obixsKXt0aGlzLnByb3BzPW4sdGhpcy5jb250ZXh0PWx9ZnVuY3Rpb24gayhuLGwpe2lmKG51bGw9PWwpcmV0dXJuIG4uX18/ayhuLl9fLG4uX18uX19rLmluZGV4T2YobikrMSk6bnVsbDtmb3IodmFyIHU7bDxuLl9fay5sZW5ndGg7bCsrKWlmKG51bGwhPSh1PW4uX19rW2xdKSYmbnVsbCE9dS5fX2UpcmV0dXJuIHUuX19lO3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIG4udHlwZT9rKG4pOm51bGx9ZnVuY3Rpb24gYihuKXt2YXIgbCx1O2lmKG51bGwhPShuPW4uX18pJiZudWxsIT1uLl9fYyl7Zm9yKG4uX19lPW4uX19jLmJhc2U9bnVsbCxsPTA7bDxuLl9fay5sZW5ndGg7bCsrKWlmKG51bGwhPSh1PW4uX19rW2xdKSYmbnVsbCE9dS5fX2Upe24uX19lPW4uX19jLmJhc2U9dS5fX2U7YnJlYWt9cmV0dXJuIGIobil9fWZ1bmN0aW9uIG0obil7KCFuLl9fZCYmKG4uX19kPSEwKSYmdC5wdXNoKG4pJiYhZy5fX3IrK3x8ciE9PWwuZGVib3VuY2VSZW5kZXJpbmcpJiYoKHI9bC5kZWJvdW5jZVJlbmRlcmluZyl8fG8pKGcpfWZ1bmN0aW9uIGcoKXtmb3IodmFyIG47Zy5fX3I9dC5sZW5ndGg7KW49dC5zb3J0KGZ1bmN0aW9uKG4sbCl7cmV0dXJuIG4uX192Ll9fYi1sLl9fdi5fX2J9KSx0PVtdLG4uc29tZShmdW5jdGlvbihuKXt2YXIgbCx1LGksdCxvLHI7bi5fX2QmJihvPSh0PShsPW4pLl9fdikuX19lLChyPWwuX19QKSYmKHU9W10sKGk9YSh7fSx0KSkuX192PXQuX192KzEsaihyLHQsaSxsLl9fbix2b2lkIDAhPT1yLm93bmVyU1ZHRWxlbWVudCxudWxsIT10Ll9faD9bb106bnVsbCx1LG51bGw9PW8/ayh0KTpvLHQuX19oKSx6KHUsdCksdC5fX2UhPW8mJmIodCkpKX0pfWZ1bmN0aW9uIHcobixsLHUsaSx0LG8scixmLHMsYSl7dmFyIGgsdixwLF8sYixtLGcsdz1pJiZpLl9fa3x8YyxBPXcubGVuZ3RoO2Zvcih1Ll9faz1bXSxoPTA7aDxsLmxlbmd0aDtoKyspaWYobnVsbCE9KF89dS5fX2tbaF09bnVsbD09KF89bFtoXSl8fFwiYm9vbGVhblwiPT10eXBlb2YgXz9udWxsOlwic3RyaW5nXCI9PXR5cGVvZiBffHxcIm51bWJlclwiPT10eXBlb2YgX3x8XCJiaWdpbnRcIj09dHlwZW9mIF8/eShudWxsLF8sbnVsbCxudWxsLF8pOkFycmF5LmlzQXJyYXkoXyk/eShkLHtjaGlsZHJlbjpffSxudWxsLG51bGwsbnVsbCk6Xy5fX2I+MD95KF8udHlwZSxfLnByb3BzLF8ua2V5LG51bGwsXy5fX3YpOl8pKXtpZihfLl9fPXUsXy5fX2I9dS5fX2IrMSxudWxsPT09KHA9d1toXSl8fHAmJl8ua2V5PT1wLmtleSYmXy50eXBlPT09cC50eXBlKXdbaF09dm9pZCAwO2Vsc2UgZm9yKHY9MDt2PEE7disrKXtpZigocD13W3ZdKSYmXy5rZXk9PXAua2V5JiZfLnR5cGU9PT1wLnR5cGUpe3dbdl09dm9pZCAwO2JyZWFrfXA9bnVsbH1qKG4sXyxwPXB8fGUsdCxvLHIsZixzLGEpLGI9Xy5fX2UsKHY9Xy5yZWYpJiZwLnJlZiE9diYmKGd8fChnPVtdKSxwLnJlZiYmZy5wdXNoKHAucmVmLG51bGwsXyksZy5wdXNoKHYsXy5fX2N8fGIsXykpLG51bGwhPWI/KG51bGw9PW0mJihtPWIpLFwiZnVuY3Rpb25cIj09dHlwZW9mIF8udHlwZSYmXy5fX2s9PT1wLl9faz9fLl9fZD1zPXgoXyxzLG4pOnM9UChuLF8scCx3LGIscyksXCJmdW5jdGlvblwiPT10eXBlb2YgdS50eXBlJiYodS5fX2Q9cykpOnMmJnAuX19lPT1zJiZzLnBhcmVudE5vZGUhPW4mJihzPWsocCkpfWZvcih1Ll9fZT1tLGg9QTtoLS07KW51bGwhPXdbaF0mJihcImZ1bmN0aW9uXCI9PXR5cGVvZiB1LnR5cGUmJm51bGwhPXdbaF0uX19lJiZ3W2hdLl9fZT09dS5fX2QmJih1Ll9fZD1rKGksaCsxKSksTih3W2hdLHdbaF0pKTtpZihnKWZvcihoPTA7aDxnLmxlbmd0aDtoKyspTShnW2hdLGdbKytoXSxnWysraF0pfWZ1bmN0aW9uIHgobixsLHUpe2Zvcih2YXIgaSx0PW4uX19rLG89MDt0JiZvPHQubGVuZ3RoO28rKykoaT10W29dKSYmKGkuX189bixsPVwiZnVuY3Rpb25cIj09dHlwZW9mIGkudHlwZT94KGksbCx1KTpQKHUsaSxpLHQsaS5fX2UsbCkpO3JldHVybiBsfWZ1bmN0aW9uIEEobixsKXtyZXR1cm4gbD1sfHxbXSxudWxsPT1ufHxcImJvb2xlYW5cIj09dHlwZW9mIG58fChBcnJheS5pc0FycmF5KG4pP24uc29tZShmdW5jdGlvbihuKXtBKG4sbCl9KTpsLnB1c2gobikpLGx9ZnVuY3Rpb24gUChuLGwsdSxpLHQsbyl7dmFyIHIsZixlO2lmKHZvaWQgMCE9PWwuX19kKXI9bC5fX2QsbC5fX2Q9dm9pZCAwO2Vsc2UgaWYobnVsbD09dXx8dCE9b3x8bnVsbD09dC5wYXJlbnROb2RlKW46aWYobnVsbD09b3x8by5wYXJlbnROb2RlIT09biluLmFwcGVuZENoaWxkKHQpLHI9bnVsbDtlbHNle2ZvcihmPW8sZT0wOyhmPWYubmV4dFNpYmxpbmcpJiZlPGkubGVuZ3RoO2UrPTIpaWYoZj09dClicmVhayBuO24uaW5zZXJ0QmVmb3JlKHQsbykscj1vfXJldHVybiB2b2lkIDAhPT1yP3I6dC5uZXh0U2libGluZ31mdW5jdGlvbiBDKG4sbCx1LGksdCl7dmFyIG87Zm9yKG8gaW4gdSlcImNoaWxkcmVuXCI9PT1vfHxcImtleVwiPT09b3x8byBpbiBsfHxIKG4sbyxudWxsLHVbb10saSk7Zm9yKG8gaW4gbCl0JiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBsW29dfHxcImNoaWxkcmVuXCI9PT1vfHxcImtleVwiPT09b3x8XCJ2YWx1ZVwiPT09b3x8XCJjaGVja2VkXCI9PT1vfHx1W29dPT09bFtvXXx8SChuLG8sbFtvXSx1W29dLGkpfWZ1bmN0aW9uICQobixsLHUpe1wiLVwiPT09bFswXT9uLnNldFByb3BlcnR5KGwsdSk6bltsXT1udWxsPT11P1wiXCI6XCJudW1iZXJcIiE9dHlwZW9mIHV8fHMudGVzdChsKT91OnUrXCJweFwifWZ1bmN0aW9uIEgobixsLHUsaSx0KXt2YXIgbztuOmlmKFwic3R5bGVcIj09PWwpaWYoXCJzdHJpbmdcIj09dHlwZW9mIHUpbi5zdHlsZS5jc3NUZXh0PXU7ZWxzZXtpZihcInN0cmluZ1wiPT10eXBlb2YgaSYmKG4uc3R5bGUuY3NzVGV4dD1pPVwiXCIpLGkpZm9yKGwgaW4gaSl1JiZsIGluIHV8fCQobi5zdHlsZSxsLFwiXCIpO2lmKHUpZm9yKGwgaW4gdSlpJiZ1W2xdPT09aVtsXXx8JChuLnN0eWxlLGwsdVtsXSl9ZWxzZSBpZihcIm9cIj09PWxbMF0mJlwiblwiPT09bFsxXSlvPWwhPT0obD1sLnJlcGxhY2UoL0NhcHR1cmUkLyxcIlwiKSksbD1sLnRvTG93ZXJDYXNlKClpbiBuP2wudG9Mb3dlckNhc2UoKS5zbGljZSgyKTpsLnNsaWNlKDIpLG4ubHx8KG4ubD17fSksbi5sW2wrb109dSx1P2l8fG4uYWRkRXZlbnRMaXN0ZW5lcihsLG8/VDpJLG8pOm4ucmVtb3ZlRXZlbnRMaXN0ZW5lcihsLG8/VDpJLG8pO2Vsc2UgaWYoXCJkYW5nZXJvdXNseVNldElubmVySFRNTFwiIT09bCl7aWYodClsPWwucmVwbGFjZSgveGxpbmsoSHw6aCkvLFwiaFwiKS5yZXBsYWNlKC9zTmFtZSQvLFwic1wiKTtlbHNlIGlmKFwiaHJlZlwiIT09bCYmXCJsaXN0XCIhPT1sJiZcImZvcm1cIiE9PWwmJlwidGFiSW5kZXhcIiE9PWwmJlwiZG93bmxvYWRcIiE9PWwmJmwgaW4gbil0cnl7bltsXT1udWxsPT11P1wiXCI6dTticmVhayBufWNhdGNoKG4pe31cImZ1bmN0aW9uXCI9PXR5cGVvZiB1fHwobnVsbCE9dSYmKCExIT09dXx8XCJhXCI9PT1sWzBdJiZcInJcIj09PWxbMV0pP24uc2V0QXR0cmlidXRlKGwsdSk6bi5yZW1vdmVBdHRyaWJ1dGUobCkpfX1mdW5jdGlvbiBJKG4pe3RoaXMubFtuLnR5cGUrITFdKGwuZXZlbnQ/bC5ldmVudChuKTpuKX1mdW5jdGlvbiBUKG4pe3RoaXMubFtuLnR5cGUrITBdKGwuZXZlbnQ/bC5ldmVudChuKTpuKX1mdW5jdGlvbiBqKG4sdSxpLHQsbyxyLGYsZSxjKXt2YXIgcyxoLHYseSxwLGssYixtLGcseCxBLFA9dS50eXBlO2lmKHZvaWQgMCE9PXUuY29uc3RydWN0b3IpcmV0dXJuIG51bGw7bnVsbCE9aS5fX2gmJihjPWkuX19oLGU9dS5fX2U9aS5fX2UsdS5fX2g9bnVsbCxyPVtlXSksKHM9bC5fX2IpJiZzKHUpO3RyeXtuOmlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIFApe2lmKG09dS5wcm9wcyxnPShzPVAuY29udGV4dFR5cGUpJiZ0W3MuX19jXSx4PXM/Zz9nLnByb3BzLnZhbHVlOnMuX186dCxpLl9fYz9iPShoPXUuX19jPWkuX19jKS5fXz1oLl9fRTooXCJwcm90b3R5cGVcImluIFAmJlAucHJvdG90eXBlLnJlbmRlcj91Ll9fYz1oPW5ldyBQKG0seCk6KHUuX19jPWg9bmV3IF8obSx4KSxoLmNvbnN0cnVjdG9yPVAsaC5yZW5kZXI9TyksZyYmZy5zdWIoaCksaC5wcm9wcz1tLGguc3RhdGV8fChoLnN0YXRlPXt9KSxoLmNvbnRleHQ9eCxoLl9fbj10LHY9aC5fX2Q9ITAsaC5fX2g9W10pLG51bGw9PWguX19zJiYoaC5fX3M9aC5zdGF0ZSksbnVsbCE9UC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJihoLl9fcz09aC5zdGF0ZSYmKGguX19zPWEoe30saC5fX3MpKSxhKGguX19zLFAuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKG0saC5fX3MpKSkseT1oLnByb3BzLHA9aC5zdGF0ZSx2KW51bGw9PVAuZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzJiZudWxsIT1oLmNvbXBvbmVudFdpbGxNb3VudCYmaC5jb21wb25lbnRXaWxsTW91bnQoKSxudWxsIT1oLmNvbXBvbmVudERpZE1vdW50JiZoLl9faC5wdXNoKGguY29tcG9uZW50RGlkTW91bnQpO2Vsc2V7aWYobnVsbD09UC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJm0hPT15JiZudWxsIT1oLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMmJmguY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhtLHgpLCFoLl9fZSYmbnVsbCE9aC5zaG91bGRDb21wb25lbnRVcGRhdGUmJiExPT09aC5zaG91bGRDb21wb25lbnRVcGRhdGUobSxoLl9fcyx4KXx8dS5fX3Y9PT1pLl9fdil7aC5wcm9wcz1tLGguc3RhdGU9aC5fX3MsdS5fX3YhPT1pLl9fdiYmKGguX19kPSExKSxoLl9fdj11LHUuX19lPWkuX19lLHUuX19rPWkuX19rLHUuX19rLmZvckVhY2goZnVuY3Rpb24obil7biYmKG4uX189dSl9KSxoLl9faC5sZW5ndGgmJmYucHVzaChoKTticmVhayBufW51bGwhPWguY29tcG9uZW50V2lsbFVwZGF0ZSYmaC5jb21wb25lbnRXaWxsVXBkYXRlKG0saC5fX3MseCksbnVsbCE9aC5jb21wb25lbnREaWRVcGRhdGUmJmguX19oLnB1c2goZnVuY3Rpb24oKXtoLmNvbXBvbmVudERpZFVwZGF0ZSh5LHAsayl9KX1oLmNvbnRleHQ9eCxoLnByb3BzPW0saC5zdGF0ZT1oLl9fcywocz1sLl9fcikmJnModSksaC5fX2Q9ITEsaC5fX3Y9dSxoLl9fUD1uLHM9aC5yZW5kZXIoaC5wcm9wcyxoLnN0YXRlLGguY29udGV4dCksaC5zdGF0ZT1oLl9fcyxudWxsIT1oLmdldENoaWxkQ29udGV4dCYmKHQ9YShhKHt9LHQpLGguZ2V0Q2hpbGRDb250ZXh0KCkpKSx2fHxudWxsPT1oLmdldFNuYXBzaG90QmVmb3JlVXBkYXRlfHwoaz1oLmdldFNuYXBzaG90QmVmb3JlVXBkYXRlKHkscCkpLEE9bnVsbCE9cyYmcy50eXBlPT09ZCYmbnVsbD09cy5rZXk/cy5wcm9wcy5jaGlsZHJlbjpzLHcobixBcnJheS5pc0FycmF5KEEpP0E6W0FdLHUsaSx0LG8scixmLGUsYyksaC5iYXNlPXUuX19lLHUuX19oPW51bGwsaC5fX2gubGVuZ3RoJiZmLnB1c2goaCksYiYmKGguX19FPWguX189bnVsbCksaC5fX2U9ITF9ZWxzZSBudWxsPT1yJiZ1Ll9fdj09PWkuX192Pyh1Ll9faz1pLl9fayx1Ll9fZT1pLl9fZSk6dS5fX2U9TChpLl9fZSx1LGksdCxvLHIsZixjKTsocz1sLmRpZmZlZCkmJnModSl9Y2F0Y2gobil7dS5fX3Y9bnVsbCwoY3x8bnVsbCE9cikmJih1Ll9fZT1lLHUuX19oPSEhYyxyW3IuaW5kZXhPZihlKV09bnVsbCksbC5fX2Uobix1LGkpfX1mdW5jdGlvbiB6KG4sdSl7bC5fX2MmJmwuX19jKHUsbiksbi5zb21lKGZ1bmN0aW9uKHUpe3RyeXtuPXUuX19oLHUuX19oPVtdLG4uc29tZShmdW5jdGlvbihuKXtuLmNhbGwodSl9KX1jYXRjaChuKXtsLl9fZShuLHUuX192KX19KX1mdW5jdGlvbiBMKGwsdSxpLHQsbyxyLGYsYyl7dmFyIHMsYSx2LHk9aS5wcm9wcyxwPXUucHJvcHMsZD11LnR5cGUsXz0wO2lmKFwic3ZnXCI9PT1kJiYobz0hMCksbnVsbCE9cilmb3IoO188ci5sZW5ndGg7XysrKWlmKChzPXJbX10pJiZcInNldEF0dHJpYnV0ZVwiaW4gcz09ISFkJiYoZD9zLmxvY2FsTmFtZT09PWQ6Mz09PXMubm9kZVR5cGUpKXtsPXMscltfXT1udWxsO2JyZWFrfWlmKG51bGw9PWwpe2lmKG51bGw9PT1kKXJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShwKTtsPW8/ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixkKTpkb2N1bWVudC5jcmVhdGVFbGVtZW50KGQscC5pcyYmcCkscj1udWxsLGM9ITF9aWYobnVsbD09PWQpeT09PXB8fGMmJmwuZGF0YT09PXB8fChsLmRhdGE9cCk7ZWxzZXtpZihyPXImJm4uY2FsbChsLmNoaWxkTm9kZXMpLGE9KHk9aS5wcm9wc3x8ZSkuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwsdj1wLmRhbmdlcm91c2x5U2V0SW5uZXJIVE1MLCFjKXtpZihudWxsIT1yKWZvcih5PXt9LF89MDtfPGwuYXR0cmlidXRlcy5sZW5ndGg7XysrKXlbbC5hdHRyaWJ1dGVzW19dLm5hbWVdPWwuYXR0cmlidXRlc1tfXS52YWx1ZTsodnx8YSkmJih2JiYoYSYmdi5fX2h0bWw9PWEuX19odG1sfHx2Ll9faHRtbD09PWwuaW5uZXJIVE1MKXx8KGwuaW5uZXJIVE1MPXYmJnYuX19odG1sfHxcIlwiKSl9aWYoQyhsLHAseSxvLGMpLHYpdS5fX2s9W107ZWxzZSBpZihfPXUucHJvcHMuY2hpbGRyZW4sdyhsLEFycmF5LmlzQXJyYXkoXyk/XzpbX10sdSxpLHQsbyYmXCJmb3JlaWduT2JqZWN0XCIhPT1kLHIsZixyP3JbMF06aS5fX2smJmsoaSwwKSxjKSxudWxsIT1yKWZvcihfPXIubGVuZ3RoO18tLTspbnVsbCE9cltfXSYmaChyW19dKTtjfHwoXCJ2YWx1ZVwiaW4gcCYmdm9pZCAwIT09KF89cC52YWx1ZSkmJihfIT09bC52YWx1ZXx8XCJwcm9ncmVzc1wiPT09ZCYmIV98fFwib3B0aW9uXCI9PT1kJiZfIT09eS52YWx1ZSkmJkgobCxcInZhbHVlXCIsXyx5LnZhbHVlLCExKSxcImNoZWNrZWRcImluIHAmJnZvaWQgMCE9PShfPXAuY2hlY2tlZCkmJl8hPT1sLmNoZWNrZWQmJkgobCxcImNoZWNrZWRcIixfLHkuY2hlY2tlZCwhMSkpfXJldHVybiBsfWZ1bmN0aW9uIE0obix1LGkpe3RyeXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBuP24odSk6bi5jdXJyZW50PXV9Y2F0Y2gobil7bC5fX2UobixpKX19ZnVuY3Rpb24gTihuLHUsaSl7dmFyIHQsbztpZihsLnVubW91bnQmJmwudW5tb3VudChuKSwodD1uLnJlZikmJih0LmN1cnJlbnQmJnQuY3VycmVudCE9PW4uX19lfHxNKHQsbnVsbCx1KSksbnVsbCE9KHQ9bi5fX2MpKXtpZih0LmNvbXBvbmVudFdpbGxVbm1vdW50KXRyeXt0LmNvbXBvbmVudFdpbGxVbm1vdW50KCl9Y2F0Y2gobil7bC5fX2Uobix1KX10LmJhc2U9dC5fX1A9bnVsbH1pZih0PW4uX19rKWZvcihvPTA7bzx0Lmxlbmd0aDtvKyspdFtvXSYmTih0W29dLHUsXCJmdW5jdGlvblwiIT10eXBlb2Ygbi50eXBlKTtpfHxudWxsPT1uLl9fZXx8aChuLl9fZSksbi5fX2U9bi5fX2Q9dm9pZCAwfWZ1bmN0aW9uIE8obixsLHUpe3JldHVybiB0aGlzLmNvbnN0cnVjdG9yKG4sdSl9ZnVuY3Rpb24gUyh1LGksdCl7dmFyIG8scixmO2wuX18mJmwuX18odSxpKSxyPShvPVwiZnVuY3Rpb25cIj09dHlwZW9mIHQpP251bGw6dCYmdC5fX2t8fGkuX19rLGY9W10saihpLHU9KCFvJiZ0fHxpKS5fX2s9dihkLG51bGwsW3VdKSxyfHxlLGUsdm9pZCAwIT09aS5vd25lclNWR0VsZW1lbnQsIW8mJnQ/W3RdOnI/bnVsbDppLmZpcnN0Q2hpbGQ/bi5jYWxsKGkuY2hpbGROb2Rlcyk6bnVsbCxmLCFvJiZ0P3Q6cj9yLl9fZTppLmZpcnN0Q2hpbGQsbykseihmLHUpfWZ1bmN0aW9uIHEobixsKXtTKG4sbCxxKX1mdW5jdGlvbiBCKGwsdSxpKXt2YXIgdCxvLHIsZj1hKHt9LGwucHJvcHMpO2ZvcihyIGluIHUpXCJrZXlcIj09cj90PXVbcl06XCJyZWZcIj09cj9vPXVbcl06ZltyXT11W3JdO3JldHVybiBhcmd1bWVudHMubGVuZ3RoPjImJihmLmNoaWxkcmVuPWFyZ3VtZW50cy5sZW5ndGg+Mz9uLmNhbGwoYXJndW1lbnRzLDIpOmkpLHkobC50eXBlLGYsdHx8bC5rZXksb3x8bC5yZWYsbnVsbCl9ZnVuY3Rpb24gRChuLGwpe3ZhciB1PXtfX2M6bD1cIl9fY0NcIitmKyssX186bixDb25zdW1lcjpmdW5jdGlvbihuLGwpe3JldHVybiBuLmNoaWxkcmVuKGwpfSxQcm92aWRlcjpmdW5jdGlvbihuKXt2YXIgdSxpO3JldHVybiB0aGlzLmdldENoaWxkQ29udGV4dHx8KHU9W10sKGk9e30pW2xdPXRoaXMsdGhpcy5nZXRDaGlsZENvbnRleHQ9ZnVuY3Rpb24oKXtyZXR1cm4gaX0sdGhpcy5zaG91bGRDb21wb25lbnRVcGRhdGU9ZnVuY3Rpb24obil7dGhpcy5wcm9wcy52YWx1ZSE9PW4udmFsdWUmJnUuc29tZShtKX0sdGhpcy5zdWI9ZnVuY3Rpb24obil7dS5wdXNoKG4pO3ZhciBsPW4uY29tcG9uZW50V2lsbFVubW91bnQ7bi5jb21wb25lbnRXaWxsVW5tb3VudD1mdW5jdGlvbigpe3Uuc3BsaWNlKHUuaW5kZXhPZihuKSwxKSxsJiZsLmNhbGwobil9fSksbi5jaGlsZHJlbn19O3JldHVybiB1LlByb3ZpZGVyLl9fPXUuQ29uc3VtZXIuY29udGV4dFR5cGU9dX1uPWMuc2xpY2UsbD17X19lOmZ1bmN0aW9uKG4sbCx1LGkpe2Zvcih2YXIgdCxvLHI7bD1sLl9fOylpZigodD1sLl9fYykmJiF0Ll9fKXRyeXtpZigobz10LmNvbnN0cnVjdG9yKSYmbnVsbCE9by5nZXREZXJpdmVkU3RhdGVGcm9tRXJyb3ImJih0LnNldFN0YXRlKG8uZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKG4pKSxyPXQuX19kKSxudWxsIT10LmNvbXBvbmVudERpZENhdGNoJiYodC5jb21wb25lbnREaWRDYXRjaChuLGl8fHt9KSxyPXQuX19kKSxyKXJldHVybiB0Ll9fRT10fWNhdGNoKGwpe249bH10aHJvdyBufX0sdT0wLGk9ZnVuY3Rpb24obil7cmV0dXJuIG51bGwhPW4mJnZvaWQgMD09PW4uY29uc3RydWN0b3J9LF8ucHJvdG90eXBlLnNldFN0YXRlPWZ1bmN0aW9uKG4sbCl7dmFyIHU7dT1udWxsIT10aGlzLl9fcyYmdGhpcy5fX3MhPT10aGlzLnN0YXRlP3RoaXMuX19zOnRoaXMuX19zPWEoe30sdGhpcy5zdGF0ZSksXCJmdW5jdGlvblwiPT10eXBlb2YgbiYmKG49bihhKHt9LHUpLHRoaXMucHJvcHMpKSxuJiZhKHUsbiksbnVsbCE9biYmdGhpcy5fX3YmJihsJiZ0aGlzLl9faC5wdXNoKGwpLG0odGhpcykpfSxfLnByb3RvdHlwZS5mb3JjZVVwZGF0ZT1mdW5jdGlvbihuKXt0aGlzLl9fdiYmKHRoaXMuX19lPSEwLG4mJnRoaXMuX19oLnB1c2gobiksbSh0aGlzKSl9LF8ucHJvdG90eXBlLnJlbmRlcj1kLHQ9W10sbz1cImZ1bmN0aW9uXCI9PXR5cGVvZiBQcm9taXNlP1Byb21pc2UucHJvdG90eXBlLnRoZW4uYmluZChQcm9taXNlLnJlc29sdmUoKSk6c2V0VGltZW91dCxnLl9fcj0wLGY9MDtleHBvcnR7UyBhcyByZW5kZXIscSBhcyBoeWRyYXRlLHYgYXMgY3JlYXRlRWxlbWVudCx2IGFzIGgsZCBhcyBGcmFnbWVudCxwIGFzIGNyZWF0ZVJlZixpIGFzIGlzVmFsaWRFbGVtZW50LF8gYXMgQ29tcG9uZW50LEIgYXMgY2xvbmVFbGVtZW50LEQgYXMgY3JlYXRlQ29udGV4dCxBIGFzIHRvQ2hpbGRBcnJheSxsIGFzIG9wdGlvbnN9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cHJlYWN0Lm1vZHVsZS5qcy5tYXBcbiIsImltcG9ydHtvcHRpb25zIGFzIG59ZnJvbVwicHJlYWN0XCI7dmFyIHQsdSxyLG89MCxpPVtdLGM9bi5fX2IsZj1uLl9fcixlPW4uZGlmZmVkLGE9bi5fX2Msdj1uLnVubW91bnQ7ZnVuY3Rpb24gbCh0LHIpe24uX19oJiZuLl9faCh1LHQsb3x8ciksbz0wO3ZhciBpPXUuX19IfHwodS5fX0g9e19fOltdLF9faDpbXX0pO3JldHVybiB0Pj1pLl9fLmxlbmd0aCYmaS5fXy5wdXNoKHt9KSxpLl9fW3RdfWZ1bmN0aW9uIG0obil7cmV0dXJuIG89MSxwKHcsbil9ZnVuY3Rpb24gcChuLHIsbyl7dmFyIGk9bCh0KyssMik7cmV0dXJuIGkudD1uLGkuX19jfHwoaS5fXz1bbz9vKHIpOncodm9pZCAwLHIpLGZ1bmN0aW9uKG4pe3ZhciB0PWkudChpLl9fWzBdLG4pO2kuX19bMF0hPT10JiYoaS5fXz1bdCxpLl9fWzFdXSxpLl9fYy5zZXRTdGF0ZSh7fSkpfV0saS5fX2M9dSksaS5fX31mdW5jdGlvbiB5KHIsbyl7dmFyIGk9bCh0KyssMyk7IW4uX19zJiZrKGkuX19ILG8pJiYoaS5fXz1yLGkuX19IPW8sdS5fX0guX19oLnB1c2goaSkpfWZ1bmN0aW9uIGQocixvKXt2YXIgaT1sKHQrKyw0KTshbi5fX3MmJmsoaS5fX0gsbykmJihpLl9fPXIsaS5fX0g9byx1Ll9faC5wdXNoKGkpKX1mdW5jdGlvbiBoKG4pe3JldHVybiBvPTUsXyhmdW5jdGlvbigpe3JldHVybntjdXJyZW50Om59fSxbXSl9ZnVuY3Rpb24gcyhuLHQsdSl7bz02LGQoZnVuY3Rpb24oKXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBuPyhuKHQoKSksZnVuY3Rpb24oKXtyZXR1cm4gbihudWxsKX0pOm4/KG4uY3VycmVudD10KCksZnVuY3Rpb24oKXtyZXR1cm4gbi5jdXJyZW50PW51bGx9KTp2b2lkIDB9LG51bGw9PXU/dTp1LmNvbmNhdChuKSl9ZnVuY3Rpb24gXyhuLHUpe3ZhciByPWwodCsrLDcpO3JldHVybiBrKHIuX19ILHUpJiYoci5fXz1uKCksci5fX0g9dSxyLl9faD1uKSxyLl9ffWZ1bmN0aW9uIEEobix0KXtyZXR1cm4gbz04LF8oZnVuY3Rpb24oKXtyZXR1cm4gbn0sdCl9ZnVuY3Rpb24gRihuKXt2YXIgcj11LmNvbnRleHRbbi5fX2NdLG89bCh0KyssOSk7cmV0dXJuIG8uYz1uLHI/KG51bGw9PW8uX18mJihvLl9fPSEwLHIuc3ViKHUpKSxyLnByb3BzLnZhbHVlKTpuLl9ffWZ1bmN0aW9uIFQodCx1KXtuLnVzZURlYnVnVmFsdWUmJm4udXNlRGVidWdWYWx1ZSh1P3UodCk6dCl9ZnVuY3Rpb24gcShuKXt2YXIgcj1sKHQrKywxMCksbz1tKCk7cmV0dXJuIHIuX189bix1LmNvbXBvbmVudERpZENhdGNofHwodS5jb21wb25lbnREaWRDYXRjaD1mdW5jdGlvbihuKXtyLl9fJiZyLl9fKG4pLG9bMV0obil9KSxbb1swXSxmdW5jdGlvbigpe29bMV0odm9pZCAwKX1dfWZ1bmN0aW9uIHgoKXtmb3IodmFyIHQ7dD1pLnNoaWZ0KCk7KWlmKHQuX19QKXRyeXt0Ll9fSC5fX2guZm9yRWFjaChnKSx0Ll9fSC5fX2guZm9yRWFjaChqKSx0Ll9fSC5fX2g9W119Y2F0Y2godSl7dC5fX0guX19oPVtdLG4uX19lKHUsdC5fX3YpfX1uLl9fYj1mdW5jdGlvbihuKXt1PW51bGwsYyYmYyhuKX0sbi5fX3I9ZnVuY3Rpb24obil7ZiYmZihuKSx0PTA7dmFyIHI9KHU9bi5fX2MpLl9fSDtyJiYoci5fX2guZm9yRWFjaChnKSxyLl9faC5mb3JFYWNoKGopLHIuX19oPVtdKX0sbi5kaWZmZWQ9ZnVuY3Rpb24odCl7ZSYmZSh0KTt2YXIgbz10Ll9fYztvJiZvLl9fSCYmby5fX0guX19oLmxlbmd0aCYmKDEhPT1pLnB1c2gobykmJnI9PT1uLnJlcXVlc3RBbmltYXRpb25GcmFtZXx8KChyPW4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lKXx8ZnVuY3Rpb24obil7dmFyIHQsdT1mdW5jdGlvbigpe2NsZWFyVGltZW91dChyKSxiJiZjYW5jZWxBbmltYXRpb25GcmFtZSh0KSxzZXRUaW1lb3V0KG4pfSxyPXNldFRpbWVvdXQodSwxMDApO2ImJih0PXJlcXVlc3RBbmltYXRpb25GcmFtZSh1KSl9KSh4KSksdT1udWxsfSxuLl9fYz1mdW5jdGlvbih0LHUpe3Uuc29tZShmdW5jdGlvbih0KXt0cnl7dC5fX2guZm9yRWFjaChnKSx0Ll9faD10Ll9faC5maWx0ZXIoZnVuY3Rpb24obil7cmV0dXJuIW4uX198fGoobil9KX1jYXRjaChyKXt1LnNvbWUoZnVuY3Rpb24obil7bi5fX2gmJihuLl9faD1bXSl9KSx1PVtdLG4uX19lKHIsdC5fX3YpfX0pLGEmJmEodCx1KX0sbi51bm1vdW50PWZ1bmN0aW9uKHQpe3YmJnYodCk7dmFyIHUscj10Ll9fYztyJiZyLl9fSCYmKHIuX19ILl9fLmZvckVhY2goZnVuY3Rpb24obil7dHJ5e2cobil9Y2F0Y2gobil7dT1ufX0pLHUmJm4uX19lKHUsci5fX3YpKX07dmFyIGI9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWVzdEFuaW1hdGlvbkZyYW1lO2Z1bmN0aW9uIGcobil7dmFyIHQ9dSxyPW4uX19jO1wiZnVuY3Rpb25cIj09dHlwZW9mIHImJihuLl9fYz12b2lkIDAscigpKSx1PXR9ZnVuY3Rpb24gaihuKXt2YXIgdD11O24uX19jPW4uX18oKSx1PXR9ZnVuY3Rpb24gayhuLHQpe3JldHVybiFufHxuLmxlbmd0aCE9PXQubGVuZ3RofHx0LnNvbWUoZnVuY3Rpb24odCx1KXtyZXR1cm4gdCE9PW5bdV19KX1mdW5jdGlvbiB3KG4sdCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdD90KG4pOnR9ZXhwb3J0e20gYXMgdXNlU3RhdGUscCBhcyB1c2VSZWR1Y2VyLHkgYXMgdXNlRWZmZWN0LGQgYXMgdXNlTGF5b3V0RWZmZWN0LGggYXMgdXNlUmVmLHMgYXMgdXNlSW1wZXJhdGl2ZUhhbmRsZSxfIGFzIHVzZU1lbW8sQSBhcyB1c2VDYWxsYmFjayxGIGFzIHVzZUNvbnRleHQsVCBhcyB1c2VEZWJ1Z1ZhbHVlLHEgYXMgdXNlRXJyb3JCb3VuZGFyeX07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1ob29rcy5tb2R1bGUuanMubWFwXG4iLCJ2YXIgdG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmdcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcbnZhciByZWdleHBDaGFyYWN0ZXJzID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nXG52YXIgcmVnZXhwSXNOYXRpdmVGbiA9IHRvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpXG4gIC5yZXBsYWNlKHJlZ2V4cENoYXJhY3RlcnMsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JylcbnZhciByZWdleHBJc05hdGl2ZSA9IFJlZ0V4cCgnXicgKyByZWdleHBJc05hdGl2ZUZuICsgJyQnKVxuZnVuY3Rpb24gdG9Tb3VyY2UgKGZ1bmMpIHtcbiAgaWYgKCFmdW5jKSByZXR1cm4gJydcbiAgdHJ5IHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChmdW5jKVxuICB9IGNhdGNoIChlKSB7fVxuICB0cnkge1xuICAgIHJldHVybiAoZnVuYyArICcnKVxuICB9IGNhdGNoIChlKSB7fVxufVxudmFyIGFzc2lnbiA9IE9iamVjdC5hc3NpZ25cbnZhciBmb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2hcbnZhciBldmVyeSA9IEFycmF5LnByb3RvdHlwZS5ldmVyeVxudmFyIGZpbHRlciA9IEFycmF5LnByb3RvdHlwZS5maWx0ZXJcbnZhciBmaW5kID0gQXJyYXkucHJvdG90eXBlLmZpbmRcbnZhciBpbmRleE9mID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2ZcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheVxudmFyIGtleXMgPSBPYmplY3Qua2V5c1xudmFyIG1hcCA9IEFycmF5LnByb3RvdHlwZS5tYXBcbnZhciByZWR1Y2UgPSBBcnJheS5wcm90b3R5cGUucmVkdWNlXG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2VcbnZhciBzb21lID0gQXJyYXkucHJvdG90eXBlLnNvbWVcbnZhciB2YWx1ZXMgPSBPYmplY3QudmFsdWVzXG5mdW5jdGlvbiBpc05hdGl2ZSAobWV0aG9kKSB7XG4gIHJldHVybiBtZXRob2QgJiYgdHlwZW9mIG1ldGhvZCA9PT0gJ2Z1bmN0aW9uJyAmJiByZWdleHBJc05hdGl2ZS50ZXN0KHRvU291cmNlKG1ldGhvZCkpXG59XG52YXIgXyA9IHtcbiAgYXNzaWduOiBpc05hdGl2ZShhc3NpZ24pXG4gICAgPyBhc3NpZ25cbiAgICA6IGZ1bmN0aW9uIGFzc2lnbiAodGFyZ2V0KSB7XG4gICAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV1cbiAgICAgICAgZm9yICh2YXIgaiBpbiBzb3VyY2UpIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoaikpIHRhcmdldFtqXSA9IHNvdXJjZVtqXVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRhcmdldFxuICAgIH0sXG4gIGJpbmQ6IGZ1bmN0aW9uIGJpbmQgKG1ldGhvZCwgY29udGV4dCkge1xuICAgIHZhciBhcmdzID0gXy5zbGljZShhcmd1bWVudHMsIDIpXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGJvdW5kRnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChfLnNsaWNlKGFyZ3VtZW50cykpKVxuICAgIH1cbiAgfSxcbiAgZGVib3VuY2U6IGZ1bmN0aW9uIGRlYm91bmNlIChmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dFxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXNcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzXG4gICAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsXG4gICAgICAgIGlmICghaW1tZWRpYXRlKSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgICB9XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dFxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpXG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdClcbiAgICAgIGlmIChjYWxsTm93KSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpXG4gICAgfVxuICB9LFxuICBlYWNoOiBpc05hdGl2ZShmb3JFYWNoKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRWFjaCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gZm9yRWFjaC5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBlYWNoIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykgY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgfSxcbiAgZXZlcnk6IGlzTmF0aXZlKGV2ZXJ5KVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRXZlcnkgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBldmVyeS5jYWxsKGNvbGwsIHByZWQsIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZXZlcnkgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIGlmICghY29sbCB8fCAhcHJlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKClcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXByZWQuY2FsbChjb250ZXh0LCBjb2xsW2ldLCBpLCBjb2xsKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0sXG4gIGZpbHRlcjogaXNOYXRpdmUoZmlsdGVyKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlRmlsdGVyIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmaWx0ZXIuY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZmlsdGVyIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICB2YXIgb3V0cHV0ID0gW11cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSkpIG91dHB1dC5wdXNoKGFycmF5W2ldKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgIH0sXG4gIGZpbmQ6IGlzTmF0aXZlKGZpbmQpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVGaW5kIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmaW5kLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGZpbmQgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSkpIHJldHVybiBhcnJheVtpXVxuICAgICAgfVxuICAgIH0sXG4gIGdldDogZnVuY3Rpb24gZ2V0IChvYmplY3QsIHBhdGgpIHtcbiAgICByZXR1cm4gXy5yZWR1Y2UocGF0aC5zcGxpdCgnLicpLCBmdW5jdGlvbiAobWVtbywgbmV4dCkge1xuICAgICAgcmV0dXJuICh0eXBlb2YgbWVtbyAhPT0gJ3VuZGVmaW5lZCcgJiYgbWVtbyAhPT0gbnVsbCkgPyBtZW1vW25leHRdIDogdW5kZWZpbmVkXG4gICAgfSwgb2JqZWN0KVxuICB9LFxuICBpZGVudGl0eTogZnVuY3Rpb24gaWRlbnRpdHkgKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG4gIGluZGV4T2Y6IGlzTmF0aXZlKGluZGV4T2YpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVJbmRleE9mIChhcnJheSwgaXRlbSkge1xuICAgICAgcmV0dXJuIGluZGV4T2YuY2FsbChhcnJheSwgaXRlbSlcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBpbmRleE9mIChhcnJheSwgaXRlbSkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGlcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMVxuICAgIH0sXG4gIGludm9rZTogZnVuY3Rpb24gaW52b2tlIChhcnJheSwgbWV0aG9kTmFtZSkge1xuICAgIHZhciBhcmdzID0gXy5zbGljZShhcmd1bWVudHMsIDIpXG4gICAgcmV0dXJuIF8ubWFwKGFycmF5LCBmdW5jdGlvbiBpbnZva2VNYXBwZXIgKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWVbbWV0aG9kTmFtZV0uYXBwbHkodmFsdWUsIGFyZ3MpXG4gICAgfSlcbiAgfSxcbiAgaXNBcnJheTogaXNOYXRpdmUoaXNBcnJheSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUFycmF5IChjb2xsKSB7XG4gICAgICByZXR1cm4gaXNBcnJheShjb2xsKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGlzQXJyYXkgKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgfSxcbiAgaXNNYXRjaDogZnVuY3Rpb24gaXNNYXRjaCAob2JqLCBzcGVjKSB7XG4gICAgZm9yICh2YXIgaSBpbiBzcGVjKSB7XG4gICAgICBpZiAoc3BlYy5oYXNPd25Qcm9wZXJ0eShpKSAmJiBvYmpbaV0gIT09IHNwZWNbaV0pIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9LFxuICBpc09iamVjdDogZnVuY3Rpb24gaXNPYmplY3QgKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9ialxuICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqXG4gIH0sXG4gIGtleXM6IGlzTmF0aXZlKGtleXMpXG4gICAgPyBrZXlzXG4gICAgOiBmdW5jdGlvbiBrZXlzIChvYmplY3QpIHtcbiAgICAgIHZhciBrZXlzID0gW11cbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSBrZXlzLnB1c2goa2V5KVxuICAgICAgfVxuICAgICAgcmV0dXJuIGtleXNcbiAgICB9LFxuICBtYXA6IGlzTmF0aXZlKG1hcClcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZU1hcCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gbWFwLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIG1hcCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgdmFyIG91dHB1dCA9IG5ldyBBcnJheShsKVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgb3V0cHV0W2ldID0gY2FsbGJhY2suY2FsbChjb250ZXh0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcbiAgbWF0Y2hlczogZnVuY3Rpb24gbWF0Y2hlcyAoc3BlYykge1xuICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gXy5pc01hdGNoKG9iaiwgc3BlYylcbiAgICB9XG4gIH0sXG4gIG5vdDogZnVuY3Rpb24gbm90ICh2YWx1ZSkge1xuICAgIHJldHVybiAhdmFsdWVcbiAgfSxcbiAgb2JqZWN0RWFjaDogZnVuY3Rpb24gKG9iamVjdCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICByZXR1cm4gXy5lYWNoKF8ua2V5cyhvYmplY3QpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2suY2FsbChjb250ZXh0LCBvYmplY3Rba2V5XSwga2V5LCBvYmplY3QpXG4gICAgfSwgY29udGV4dClcbiAgfSxcbiAgb2JqZWN0TWFwOiBmdW5jdGlvbiBvYmplY3RNYXAgKG9iamVjdCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge31cbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG9iamVjdFtrZXldLCBrZXksIG9iamVjdClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9LFxuICBvYmplY3RSZWR1Y2U6IGZ1bmN0aW9uIG9iamVjdFJlZHVjZSAob2JqZWN0LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKSB7XG4gICAgdmFyIG91dHB1dCA9IGluaXRpYWxWYWx1ZVxuICAgIGZvciAodmFyIGkgaW4gb2JqZWN0KSB7XG4gICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGkpKSBvdXRwdXQgPSBjYWxsYmFjayhvdXRwdXQsIG9iamVjdFtpXSwgaSwgb2JqZWN0KVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0XG4gIH0sXG4gIHBpY2s6IGZ1bmN0aW9uIHBpY2sgKG9iamVjdCwgdG9QaWNrKSB7XG4gICAgdmFyIG91dCA9IHt9XG4gICAgXy5lYWNoKHRvUGljaywgZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKHR5cGVvZiBvYmplY3Rba2V5XSAhPT0gJ3VuZGVmaW5lZCcpIG91dFtrZXldID0gb2JqZWN0W2tleV1cbiAgICB9KVxuICAgIHJldHVybiBvdXRcbiAgfSxcbiAgcGx1Y2s6IGZ1bmN0aW9uIHBsdWNrIChhcnJheSwga2V5KSB7XG4gICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICB2YXIgb3V0ID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykgaWYgKGFycmF5W2ldKSBvdXRbaV0gPSBhcnJheVtpXVtrZXldXG4gICAgcmV0dXJuIG91dFxuICB9LFxuICByZWR1Y2U6IGlzTmF0aXZlKHJlZHVjZSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZVJlZHVjZSAoYXJyYXksIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpIHtcbiAgICAgIHJldHVybiByZWR1Y2UuY2FsbChhcnJheSwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSlcbiAgICB9XG4gICAgOiBmdW5jdGlvbiByZWR1Y2UgKGFycmF5LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKSB7XG4gICAgICB2YXIgb3V0cHV0ID0gaW5pdGlhbFZhbHVlXG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIG91dHB1dCA9IGNhbGxiYWNrKG91dHB1dCwgYXJyYXlbaV0sIGksIGFycmF5KVxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgIH0sXG4gIHNldDogZnVuY3Rpb24gc2V0IChvYmplY3QsIHBhdGgsIHZhbCkge1xuICAgIGlmICghb2JqZWN0KSByZXR1cm4gb2JqZWN0XG4gICAgaWYgKHR5cGVvZiBvYmplY3QgIT09ICdvYmplY3QnICYmIHR5cGVvZiBvYmplY3QgIT09ICdmdW5jdGlvbicpIHJldHVybiBvYmplY3RcbiAgICB2YXIgcGFydHMgPSBwYXRoLnNwbGl0KCcuJylcbiAgICB2YXIgY29udGV4dCA9IG9iamVjdFxuICAgIHZhciBuZXh0S2V5XG4gICAgZG8ge1xuICAgICAgbmV4dEtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgIGlmICh0eXBlb2YgY29udGV4dFtuZXh0S2V5XSAhPT0gJ29iamVjdCcpIGNvbnRleHRbbmV4dEtleV0gPSB7fVxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCkge1xuICAgICAgICBjb250ZXh0ID0gY29udGV4dFtuZXh0S2V5XVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29udGV4dFtuZXh0S2V5XSA9IHZhbFxuICAgICAgfVxuICAgIH0gd2hpbGUgKHBhcnRzLmxlbmd0aClcbiAgICByZXR1cm4gb2JqZWN0XG4gIH0sXG4gIHNsaWNlOiBpc05hdGl2ZShzbGljZSlcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZVNsaWNlIChhcnJheSwgYmVnaW4sIGVuZCkge1xuICAgICAgYmVnaW4gPSBiZWdpbiB8fCAwXG4gICAgICBlbmQgPSB0eXBlb2YgZW5kID09PSAnbnVtYmVyJyA/IGVuZCA6IGFycmF5Lmxlbmd0aFxuICAgICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIGJlZ2luLCBlbmQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gc2xpY2UgKGFycmF5LCBzdGFydCwgZW5kKSB7XG4gICAgICBzdGFydCA9IHN0YXJ0IHx8IDBcbiAgICAgIGVuZCA9IHR5cGVvZiBlbmQgPT09ICdudW1iZXInID8gZW5kIDogYXJyYXkubGVuZ3RoXG4gICAgICB2YXIgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGhcbiAgICAgIGlmICghbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBbXVxuICAgICAgfVxuICAgICAgaWYgKHN0YXJ0IDwgMCkge1xuICAgICAgICBzdGFydCA9IC1zdGFydCA+IGxlbmd0aCA/IDAgOiAobGVuZ3RoICsgc3RhcnQpXG4gICAgICB9XG4gICAgICBlbmQgPSBlbmQgPiBsZW5ndGggPyBsZW5ndGggOiBlbmRcbiAgICAgIGlmIChlbmQgPCAwKSB7XG4gICAgICAgIGVuZCArPSBsZW5ndGhcbiAgICAgIH1cbiAgICAgIGxlbmd0aCA9IHN0YXJ0ID4gZW5kID8gMCA6ICgoZW5kIC0gc3RhcnQpID4+PiAwKVxuICAgICAgc3RhcnQgPj4+PSAwXG4gICAgICB2YXIgaW5kZXggPSAtMVxuICAgICAgdmFyIHJlc3VsdCA9IG5ldyBBcnJheShsZW5ndGgpXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gYXJyYXlbaW5kZXggKyBzdGFydF1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9LFxuICBzb21lOiBpc05hdGl2ZShzb21lKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlU29tZSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIHNvbWUuY2FsbChjb2xsLCBwcmVkLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIHNvbWUgKGNvbGwsIHByZWQsIGNvbnRleHQpIHtcbiAgICAgIGlmICghY29sbCB8fCAhcHJlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKClcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29sbC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocHJlZC5jYWxsKGNvbnRleHQsIGNvbGxbaV0sIGksIGNvbGwpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfSxcbiAgdW5pcXVlOiBmdW5jdGlvbiB1bmlxdWUgKGFycmF5KSB7XG4gICAgcmV0dXJuIF8ucmVkdWNlKGFycmF5LCBmdW5jdGlvbiAobWVtbywgY3Vycikge1xuICAgICAgaWYgKF8uaW5kZXhPZihtZW1vLCBjdXJyKSA9PT0gLTEpIHtcbiAgICAgICAgbWVtby5wdXNoKGN1cnIpXG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0sIFtdKVxuICB9LFxuICB2YWx1ZXM6IGlzTmF0aXZlKHZhbHVlcylcbiAgICA/IHZhbHVlc1xuICAgIDogZnVuY3Rpb24gdmFsdWVzIChvYmplY3QpIHtcbiAgICAgIHZhciBvdXQgPSBbXVxuICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIG91dC5wdXNoKG9iamVjdFtrZXldKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dFxuICAgIH0sXG4gIG5hbWU6ICdzbGFwZGFzaCcsXG4gIHZlcnNpb246ICcxLjMuMydcbn1cbl8ub2JqZWN0TWFwLmFzQXJyYXkgPSBmdW5jdGlvbiBvYmplY3RNYXBBc0FycmF5IChvYmplY3QsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIHJldHVybiBfLm1hcChfLmtleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG9iamVjdFtrZXldLCBrZXksIG9iamVjdClcbiAgfSwgY29udGV4dClcbn1cbm1vZHVsZS5leHBvcnRzID0gX1xuIiwidmFyIGVyciA9IG5ldyBFcnJvcignRXJyb3I6IHJlY3Vyc2VzISBpbmZpbml0ZSBwcm9taXNlIGNoYWluIGRldGVjdGVkJylcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcHJvbWlzZSAocmVzb2x2ZXIpIHtcbiAgdmFyIHdhaXRpbmcgPSB7IHJlczogW10sIHJlajogW10gfVxuICB2YXIgcCA9IHtcbiAgICAndGhlbic6IHRoZW4sXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24gdGhlbkNhdGNoIChvblJlamVjdCkge1xuICAgICAgcmV0dXJuIHRoZW4obnVsbCwgb25SZWplY3QpXG4gICAgfVxuICB9XG4gIHRyeSB7IHJlc29sdmVyKHJlc29sdmUsIHJlamVjdCkgfSBjYXRjaCAoZSkge1xuICAgIHAuc3RhdHVzID0gZmFsc2VcbiAgICBwLnZhbHVlID0gZVxuICB9XG4gIHJldHVybiBwXG5cbiAgZnVuY3Rpb24gdGhlbiAob25SZXNvbHZlLCBvblJlamVjdCkge1xuICAgIHJldHVybiBwcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHdhaXRpbmcucmVzLnB1c2goaGFuZGxlTmV4dChwLCB3YWl0aW5nLCBvblJlc29sdmUsIHJlc29sdmUsIHJlamVjdCwgb25SZWplY3QpKVxuICAgICAgd2FpdGluZy5yZWoucHVzaChoYW5kbGVOZXh0KHAsIHdhaXRpbmcsIG9uUmVqZWN0LCByZXNvbHZlLCByZWplY3QsIG9uUmVqZWN0KSlcbiAgICAgIGlmICh0eXBlb2YgcC5zdGF0dXMgIT09ICd1bmRlZmluZWQnKSBmbHVzaCh3YWl0aW5nLCBwKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlICh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHAuc3RhdHVzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuXG4gICAgaWYgKHZhbCA9PT0gcCkgdGhyb3cgZXJyXG4gICAgaWYgKHZhbCkgdHJ5IHsgaWYgKHR5cGVvZiB2YWwudGhlbiA9PT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHZhbC50aGVuKHJlc29sdmUsIHJlamVjdCkgfSBjYXRjaCAoZSkge31cbiAgICBwLnN0YXR1cyA9IHRydWVcbiAgICBwLnZhbHVlID0gdmFsXG4gICAgZmx1c2god2FpdGluZywgcClcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlamVjdCAodmFsKSB7XG4gICAgaWYgKHR5cGVvZiBwLnN0YXR1cyAhPT0gJ3VuZGVmaW5lZCcpIHJldHVyblxuICAgIGlmICh2YWwgPT09IHApIHRocm93IGVyclxuICAgIHAuc3RhdHVzID0gZmFsc2VcbiAgICBwLnZhbHVlID0gdmFsXG4gICAgZmx1c2god2FpdGluZywgcClcbiAgfVxufVxuXG5mdW5jdGlvbiBmbHVzaCAod2FpdGluZywgcCkge1xuICB2YXIgcXVldWUgPSBwLnN0YXR1cyA/IHdhaXRpbmcucmVzIDogd2FpdGluZy5yZWpcbiAgd2hpbGUgKHF1ZXVlLmxlbmd0aCkgcXVldWUuc2hpZnQoKShwLnZhbHVlKVxufVxuXG5mdW5jdGlvbiBoYW5kbGVOZXh0IChwLCB3YWl0aW5nLCBoYW5kbGVyLCByZXNvbHZlLCByZWplY3QsIGhhc1JlamVjdCkge1xuICByZXR1cm4gZnVuY3Rpb24gbmV4dCAodmFsdWUpIHtcbiAgICB0cnkge1xuICAgICAgdmFsdWUgPSBoYW5kbGVyID8gaGFuZGxlcih2YWx1ZSkgOiB2YWx1ZVxuICAgICAgaWYgKHAuc3RhdHVzKSByZXR1cm4gcmVzb2x2ZSh2YWx1ZSlcbiAgICAgIHJldHVybiBoYXNSZWplY3QgPyByZXNvbHZlKHZhbHVlKSA6IHJlamVjdCh2YWx1ZSlcbiAgICB9IGNhdGNoIChlcnIpIHsgcmVqZWN0KGVycikgfVxuICB9XG59XG4iLCIvKiFcbiAqIEdsaWRlLmpzIHYzLjUuMlxuICogKGMpIDIwMTMtMjAyMSBKxJlkcnplaiBDaGHFgnViZWsgKGh0dHBzOi8vZ2l0aHViLmNvbS9qZWRyemVqY2hhbHViZWsvKVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuICovXG5cbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjtcblxuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHtcbiAgICBfdHlwZW9mID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBfdHlwZW9mID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gIGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gIHJldHVybiBDb25zdHJ1Y3Rvcjtcbn1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuICBpZiAoc3VwZXJDbGFzcykgX3NldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKTtcbn1cblxuZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHtcbiAgX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHtcbiAgICByZXR1cm4gby5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pO1xuICB9O1xuICByZXR1cm4gX2dldFByb3RvdHlwZU9mKG8pO1xufVxuXG5mdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICBfc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHtcbiAgICBvLl9fcHJvdG9fXyA9IHA7XG4gICAgcmV0dXJuIG87XG4gIH07XG5cbiAgcmV0dXJuIF9zZXRQcm90b3R5cGVPZihvLCBwKTtcbn1cblxuZnVuY3Rpb24gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpIHtcbiAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcInVuZGVmaW5lZFwiIHx8ICFSZWZsZWN0LmNvbnN0cnVjdCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSkgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIFByb3h5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB0cnVlO1xuXG4gIHRyeSB7XG4gICAgQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sIFtdLCBmdW5jdGlvbiAoKSB7fSkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikge1xuICBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIHNlbGY7XG59XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHtcbiAgaWYgKGNhbGwgJiYgKHR5cGVvZiBjYWxsID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgcmV0dXJuIGNhbGw7XG4gIH0gZWxzZSBpZiAoY2FsbCAhPT0gdm9pZCAwKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkRlcml2ZWQgY29uc3RydWN0b3JzIG1heSBvbmx5IHJldHVybiBvYmplY3Qgb3IgdW5kZWZpbmVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZik7XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVTdXBlcihEZXJpdmVkKSB7XG4gIHZhciBoYXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0ID0gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpO1xuXG4gIHJldHVybiBmdW5jdGlvbiBfY3JlYXRlU3VwZXJJbnRlcm5hbCgpIHtcbiAgICB2YXIgU3VwZXIgPSBfZ2V0UHJvdG90eXBlT2YoRGVyaXZlZCksXG4gICAgICAgIHJlc3VsdDtcblxuICAgIGlmIChoYXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KSB7XG4gICAgICB2YXIgTmV3VGFyZ2V0ID0gX2dldFByb3RvdHlwZU9mKHRoaXMpLmNvbnN0cnVjdG9yO1xuXG4gICAgICByZXN1bHQgPSBSZWZsZWN0LmNvbnN0cnVjdChTdXBlciwgYXJndW1lbnRzLCBOZXdUYXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBTdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCByZXN1bHQpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBfc3VwZXJQcm9wQmFzZShvYmplY3QsIHByb3BlcnR5KSB7XG4gIHdoaWxlICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpKSB7XG4gICAgb2JqZWN0ID0gX2dldFByb3RvdHlwZU9mKG9iamVjdCk7XG4gICAgaWYgKG9iamVjdCA9PT0gbnVsbCkgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gb2JqZWN0O1xufVxuXG5mdW5jdGlvbiBfZ2V0KCkge1xuICBpZiAodHlwZW9mIFJlZmxlY3QgIT09IFwidW5kZWZpbmVkXCIgJiYgUmVmbGVjdC5nZXQpIHtcbiAgICBfZ2V0ID0gUmVmbGVjdC5nZXQ7XG4gIH0gZWxzZSB7XG4gICAgX2dldCA9IGZ1bmN0aW9uIF9nZXQodGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgICAgIHZhciBiYXNlID0gX3N1cGVyUHJvcEJhc2UodGFyZ2V0LCBwcm9wZXJ0eSk7XG5cbiAgICAgIGlmICghYmFzZSkgcmV0dXJuO1xuICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGJhc2UsIHByb3BlcnR5KTtcblxuICAgICAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgICAgIHJldHVybiBkZXNjLmdldC5jYWxsKGFyZ3VtZW50cy5sZW5ndGggPCAzID8gdGFyZ2V0IDogcmVjZWl2ZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIF9nZXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuICAvKipcbiAgICogVHlwZSBvZiB0aGUgbW92ZW1lbnQuXG4gICAqXG4gICAqIEF2YWlsYWJsZSB0eXBlczpcbiAgICogYHNsaWRlcmAgLSBSZXdpbmRzIHNsaWRlciB0byB0aGUgc3RhcnQvZW5kIHdoZW4gaXQgcmVhY2hlcyB0aGUgZmlyc3Qgb3IgbGFzdCBzbGlkZS5cbiAgICogYGNhcm91c2VsYCAtIENoYW5nZXMgc2xpZGVzIHdpdGhvdXQgc3RhcnRpbmcgb3ZlciB3aGVuIGl0IHJlYWNoZXMgdGhlIGZpcnN0IG9yIGxhc3Qgc2xpZGUuXG4gICAqXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICB0eXBlOiAnc2xpZGVyJyxcblxuICAvKipcbiAgICogU3RhcnQgYXQgc3BlY2lmaWMgc2xpZGUgbnVtYmVyIGRlZmluZWQgd2l0aCB6ZXJvLWJhc2VkIGluZGV4LlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgc3RhcnRBdDogMCxcblxuICAvKipcbiAgICogQSBudW1iZXIgb2Ygc2xpZGVzIHZpc2libGUgb24gdGhlIHNpbmdsZSB2aWV3cG9ydC5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHBlclZpZXc6IDEsXG5cbiAgLyoqXG4gICAqIEZvY3VzIGN1cnJlbnRseSBhY3RpdmUgc2xpZGUgYXQgYSBzcGVjaWZpZWQgcG9zaXRpb24gaW4gdGhlIHRyYWNrLlxuICAgKlxuICAgKiBBdmFpbGFibGUgaW5wdXRzOlxuICAgKiBgY2VudGVyYCAtIEN1cnJlbnQgc2xpZGUgd2lsbCBiZSBhbHdheXMgZm9jdXNlZCBhdCB0aGUgY2VudGVyIG9mIGEgdHJhY2suXG4gICAqIGAwLDEsMiwzLi4uYCAtIEN1cnJlbnQgc2xpZGUgd2lsbCBiZSBmb2N1c2VkIG9uIHRoZSBzcGVjaWZpZWQgemVyby1iYXNlZCBpbmRleC5cbiAgICpcbiAgICogQHR5cGUge1N0cmluZ3xOdW1iZXJ9XG4gICAqL1xuICBmb2N1c0F0OiAwLFxuXG4gIC8qKlxuICAgKiBBIHNpemUgb2YgdGhlIGdhcCBhZGRlZCBiZXR3ZWVuIHNsaWRlcy5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGdhcDogMTAsXG5cbiAgLyoqXG4gICAqIENoYW5nZSBzbGlkZXMgYWZ0ZXIgYSBzcGVjaWZpZWQgaW50ZXJ2YWwuIFVzZSBgZmFsc2VgIGZvciB0dXJuaW5nIG9mZiBhdXRvcGxheS5cbiAgICpcbiAgICogQHR5cGUge051bWJlcnxCb29sZWFufVxuICAgKi9cbiAgYXV0b3BsYXk6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBTdG9wIGF1dG9wbGF5IG9uIG1vdXNlb3ZlciBldmVudC5cbiAgICpcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuICBob3ZlcnBhdXNlOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBbGxvdyBmb3IgY2hhbmdpbmcgc2xpZGVzIHdpdGggbGVmdCBhbmQgcmlnaHQga2V5Ym9hcmQgYXJyb3dzLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG4gIGtleWJvYXJkOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBTdG9wIHJ1bm5pbmcgYHBlclZpZXdgIG51bWJlciBvZiBzbGlkZXMgZnJvbSB0aGUgZW5kLiBVc2UgdGhpc1xuICAgKiBvcHRpb24gaWYgeW91IGRvbid0IHdhbnQgdG8gaGF2ZSBhbiBlbXB0eSBzcGFjZSBhZnRlclxuICAgKiBhIHNsaWRlci4gV29ya3Mgb25seSB3aXRoIGBzbGlkZXJgIHR5cGUgYW5kIGFcbiAgICogbm9uLWNlbnRlcmVkIGBmb2N1c0F0YCBzZXR0aW5nLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG4gIGJvdW5kOiBmYWxzZSxcblxuICAvKipcbiAgICogTWluaW1hbCBzd2lwZSBkaXN0YW5jZSBuZWVkZWQgdG8gY2hhbmdlIHRoZSBzbGlkZS4gVXNlIGBmYWxzZWAgZm9yIHR1cm5pbmcgb2ZmIGEgc3dpcGluZy5cbiAgICpcbiAgICogQHR5cGUge051bWJlcnxCb29sZWFufVxuICAgKi9cbiAgc3dpcGVUaHJlc2hvbGQ6IDgwLFxuXG4gIC8qKlxuICAgKiBNaW5pbWFsIG1vdXNlIGRyYWcgZGlzdGFuY2UgbmVlZGVkIHRvIGNoYW5nZSB0aGUgc2xpZGUuIFVzZSBgZmFsc2VgIGZvciB0dXJuaW5nIG9mZiBhIGRyYWdnaW5nLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfEJvb2xlYW59XG4gICAqL1xuICBkcmFnVGhyZXNob2xkOiAxMjAsXG5cbiAgLyoqXG4gICAqIEEgbnVtYmVyIG9mIHNsaWRlcyBtb3ZlZCBvbiBzaW5nbGUgc3dpcGUuXG4gICAqXG4gICAqIEF2YWlsYWJsZSB0eXBlczpcbiAgICogYGAgLSBNb3ZlcyBzbGlkZXIgYnkgb25lIHNsaWRlIHBlciBzd2lwZVxuICAgKiBgfGAgLSBNb3ZlcyBzbGlkZXIgYmV0d2VlbiB2aWV3cyBwZXIgc3dpcGUgKG51bWJlciBvZiBzbGlkZXMgZGVmaW5lZCBpbiBgcGVyVmlld2Agb3B0aW9ucylcbiAgICpcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIHBlclN3aXBlOiAnJyxcblxuICAvKipcbiAgICogTW92aW5nIGRpc3RhbmNlIHJhdGlvIG9mIHRoZSBzbGlkZXMgb24gYSBzd2lwaW5nIGFuZCBkcmFnZ2luZy5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHRvdWNoUmF0aW86IDAuNSxcblxuICAvKipcbiAgICogQW5nbGUgcmVxdWlyZWQgdG8gYWN0aXZhdGUgc2xpZGVzIG1vdmluZyBvbiBzd2lwaW5nIG9yIGRyYWdnaW5nLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgdG91Y2hBbmdsZTogNDUsXG5cbiAgLyoqXG4gICAqIER1cmF0aW9uIG9mIHRoZSBhbmltYXRpb24gaW4gbWlsbGlzZWNvbmRzLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgYW5pbWF0aW9uRHVyYXRpb246IDQwMCxcblxuICAvKipcbiAgICogQWxsb3dzIGxvb3BpbmcgdGhlIGBzbGlkZXJgIHR5cGUuIFNsaWRlciB3aWxsIHJld2luZCB0byB0aGUgZmlyc3QvbGFzdCBzbGlkZSB3aGVuIGl0J3MgYXQgdGhlIHN0YXJ0L2VuZC5cbiAgICpcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuICByZXdpbmQ6IHRydWUsXG5cbiAgLyoqXG4gICAqIER1cmF0aW9uIG9mIHRoZSByZXdpbmRpbmcgYW5pbWF0aW9uIG9mIHRoZSBgc2xpZGVyYCB0eXBlIGluIG1pbGxpc2Vjb25kcy5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIHJld2luZER1cmF0aW9uOiA4MDAsXG5cbiAgLyoqXG4gICAqIEVhc2luZyBmdW5jdGlvbiBmb3IgdGhlIGFuaW1hdGlvbi5cbiAgICpcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIGFuaW1hdGlvblRpbWluZ0Z1bmM6ICdjdWJpYy1iZXppZXIoLjE2NSwgLjg0MCwgLjQ0MCwgMSknLFxuXG4gIC8qKlxuICAgKiBXYWl0IGZvciB0aGUgYW5pbWF0aW9uIHRvIGZpbmlzaCB1bnRpbCB0aGUgbmV4dCB1c2VyIGlucHV0IGNhbiBiZSBwcm9jZXNzZWRcbiAgICpcbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqL1xuICB3YWl0Rm9yVHJhbnNpdGlvbjogdHJ1ZSxcblxuICAvKipcbiAgICogVGhyb3R0bGUgY29zdGx5IGV2ZW50cyBhdCBtb3N0IG9uY2UgcGVyIGV2ZXJ5IHdhaXQgbWlsbGlzZWNvbmRzLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgdGhyb3R0bGU6IDEwLFxuXG4gIC8qKlxuICAgKiBNb3ZpbmcgZGlyZWN0aW9uIG1vZGUuXG4gICAqXG4gICAqIEF2YWlsYWJsZSBpbnB1dHM6XG4gICAqIC0gJ2x0cicgLSBsZWZ0IHRvIHJpZ2h0IG1vdmVtZW50LFxuICAgKiAtICdydGwnIC0gcmlnaHQgdG8gbGVmdCBtb3ZlbWVudC5cbiAgICpcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIGRpcmVjdGlvbjogJ2x0cicsXG5cbiAgLyoqXG4gICAqIFRoZSBkaXN0YW5jZSB2YWx1ZSBvZiB0aGUgbmV4dCBhbmQgcHJldmlvdXMgdmlld3BvcnRzIHdoaWNoXG4gICAqIGhhdmUgdG8gcGVlayBpbiB0aGUgY3VycmVudCB2aWV3LiBBY2NlcHRzIG51bWJlciBhbmRcbiAgICogcGl4ZWxzIGFzIGEgc3RyaW5nLiBMZWZ0IGFuZCByaWdodCBwZWVraW5nIGNhbiBiZVxuICAgKiBzZXQgdXAgc2VwYXJhdGVseSB3aXRoIGEgZGlyZWN0aW9ucyBvYmplY3QuXG4gICAqXG4gICAqIEZvciBleGFtcGxlOlxuICAgKiBgMTAwYCAtIFBlZWsgMTAwcHggb24gdGhlIGJvdGggc2lkZXMuXG4gICAqIHsgYmVmb3JlOiAxMDAsIGFmdGVyOiA1MCB9YCAtIFBlZWsgMTAwcHggb24gdGhlIGxlZnQgc2lkZSBhbmQgNTBweCBvbiB0aGUgcmlnaHQgc2lkZS5cbiAgICpcbiAgICogQHR5cGUge051bWJlcnxTdHJpbmd8T2JqZWN0fVxuICAgKi9cbiAgcGVlazogMCxcblxuICAvKipcbiAgICogRGVmaW5lcyBob3cgbWFueSBjbG9uZXMgb2YgY3VycmVudCB2aWV3cG9ydCB3aWxsIGJlIGdlbmVyYXRlZC5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGNsb25pbmdSYXRpbzogMSxcblxuICAvKipcbiAgICogQ29sbGVjdGlvbiBvZiBvcHRpb25zIGFwcGxpZWQgYXQgc3BlY2lmaWVkIG1lZGlhIGJyZWFrcG9pbnRzLlxuICAgKiBGb3IgZXhhbXBsZTogZGlzcGxheSB0d28gc2xpZGVzIHBlciB2aWV3IHVuZGVyIDgwMHB4LlxuICAgKiBge1xuICAgKiAgICc4MDBweCc6IHtcbiAgICogICAgIHBlclZpZXc6IDJcbiAgICogICB9XG4gICAqIH1gXG4gICAqL1xuICBicmVha3BvaW50czoge30sXG5cbiAgLyoqXG4gICAqIENvbGxlY3Rpb24gb2YgaW50ZXJuYWxseSB1c2VkIEhUTUwgY2xhc3Nlcy5cbiAgICpcbiAgICogQHRvZG8gUmVmYWN0b3IgYHNsaWRlcmAgYW5kIGBjYXJvdXNlbGAgcHJvcGVydGllcyB0byBzaW5nbGUgYHR5cGU6IHsgc2xpZGVyOiAnJywgY2Fyb3VzZWw6ICcnIH1gIG9iamVjdFxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cbiAgY2xhc3Nlczoge1xuICAgIHN3aXBlYWJsZTogJ2dsaWRlLS1zd2lwZWFibGUnLFxuICAgIGRyYWdnaW5nOiAnZ2xpZGUtLWRyYWdnaW5nJyxcbiAgICBkaXJlY3Rpb246IHtcbiAgICAgIGx0cjogJ2dsaWRlLS1sdHInLFxuICAgICAgcnRsOiAnZ2xpZGUtLXJ0bCdcbiAgICB9LFxuICAgIHR5cGU6IHtcbiAgICAgIHNsaWRlcjogJ2dsaWRlLS1zbGlkZXInLFxuICAgICAgY2Fyb3VzZWw6ICdnbGlkZS0tY2Fyb3VzZWwnXG4gICAgfSxcbiAgICBzbGlkZToge1xuICAgICAgY2xvbmU6ICdnbGlkZV9fc2xpZGUtLWNsb25lJyxcbiAgICAgIGFjdGl2ZTogJ2dsaWRlX19zbGlkZS0tYWN0aXZlJ1xuICAgIH0sXG4gICAgYXJyb3c6IHtcbiAgICAgIGRpc2FibGVkOiAnZ2xpZGVfX2Fycm93LS1kaXNhYmxlZCdcbiAgICB9LFxuICAgIG5hdjoge1xuICAgICAgYWN0aXZlOiAnZ2xpZGVfX2J1bGxldC0tYWN0aXZlJ1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBPdXRwdXRzIHdhcm5pbmcgbWVzc2FnZSB0byB0aGUgYm93c2VyIGNvbnNvbGUuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBtc2dcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKi9cbmZ1bmN0aW9uIHdhcm4obXNnKSB7XG4gIGNvbnNvbGUuZXJyb3IoXCJbR2xpZGUgd2Fybl06IFwiLmNvbmNhdChtc2cpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB2YWx1ZSBlbnRlcmVkIGFzIG51bWJlclxuICogb3Igc3RyaW5nIHRvIGludGVnZXIgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICovXG5mdW5jdGlvbiB0b0ludCh2YWx1ZSkge1xuICByZXR1cm4gcGFyc2VJbnQodmFsdWUpO1xufVxuLyoqXG4gKiBDb252ZXJ0cyB2YWx1ZSBlbnRlcmVkIGFzIG51bWJlclxuICogb3Igc3RyaW5nIHRvIGZsYXQgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gKiBAcmV0dXJucyB7TnVtYmVyfVxuICovXG5cbmZ1bmN0aW9uIHRvRmxvYXQodmFsdWUpIHtcbiAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpO1xufVxuLyoqXG4gKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSAgeyp9ICAgdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG59XG4vKipcbiAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSAgeyp9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2phc2hrZW5hcy91bmRlcnNjb3JlXG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSBfdHlwZW9mKHZhbHVlKTtcblxuICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIXZhbHVlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW1peGVkLW9wZXJhdG9yc1xufVxuLyoqXG4gKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIGEgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtICB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufVxuLyoqXG4gKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIGlzIHVuZGVmaW5lZC5cbiAqXG4gKiBAcGFyYW0gIHsqfSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJztcbn1cbi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyBhbiBhcnJheS5cbiAqXG4gKiBAcGFyYW0gIHsqfSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc0FycmF5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gQXJyYXk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbmQgaW5pdGlhbGl6ZXMgc3BlY2lmaWVkIGNvbGxlY3Rpb24gb2YgZXh0ZW5zaW9ucy5cbiAqIEVhY2ggZXh0ZW5zaW9uIHJlY2VpdmVzIGFjY2VzcyB0byBpbnN0YW5jZSBvZiBnbGlkZSBhbmQgcmVzdCBvZiBjb21wb25lbnRzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBnbGlkZVxuICogQHBhcmFtIHtPYmplY3R9IGV4dGVuc2lvbnNcbiAqXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIG1vdW50KGdsaWRlLCBleHRlbnNpb25zLCBldmVudHMpIHtcbiAgdmFyIGNvbXBvbmVudHMgPSB7fTtcblxuICBmb3IgKHZhciBuYW1lIGluIGV4dGVuc2lvbnMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihleHRlbnNpb25zW25hbWVdKSkge1xuICAgICAgY29tcG9uZW50c1tuYW1lXSA9IGV4dGVuc2lvbnNbbmFtZV0oZ2xpZGUsIGNvbXBvbmVudHMsIGV2ZW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdhcm4oJ0V4dGVuc2lvbiBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBfbmFtZSBpbiBjb21wb25lbnRzKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24oY29tcG9uZW50c1tfbmFtZV0ubW91bnQpKSB7XG4gICAgICBjb21wb25lbnRzW19uYW1lXS5tb3VudCgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb21wb25lbnRzO1xufVxuXG4vKipcbiAqIERlZmluZXMgZ2V0dGVyIGFuZCBzZXR0ZXIgcHJvcGVydHkgb24gdGhlIHNwZWNpZmllZCBvYmplY3QuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvYmogICAgICAgICBPYmplY3Qgd2hlcmUgcHJvcGVydHkgaGFzIHRvIGJlIGRlZmluZWQuXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHByb3AgICAgICAgIE5hbWUgb2YgdGhlIGRlZmluZWQgcHJvcGVydHkuXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRlZmluaXRpb24gIEdldCBhbmQgc2V0IGRlZmluaXRpb25zIGZvciB0aGUgcHJvcGVydHkuXG4gKiBAcmV0dXJuIHtWb2lkfVxuICovXG5mdW5jdGlvbiBkZWZpbmUob2JqLCBwcm9wLCBkZWZpbml0aW9uKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHByb3AsIGRlZmluaXRpb24pO1xufVxuLyoqXG4gKiBTb3J0cyBhcGhhYmV0aWNhbGx5IG9iamVjdCBrZXlzLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gc29ydEtleXMob2JqKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopLnNvcnQoKS5yZWR1Y2UoZnVuY3Rpb24gKHIsIGspIHtcbiAgICByW2tdID0gb2JqW2tdO1xuICAgIHJldHVybiByW2tdLCByO1xuICB9LCB7fSk7XG59XG4vKipcbiAqIE1lcmdlcyBwYXNzZWQgc2V0dGluZ3Mgb2JqZWN0IHdpdGggZGVmYXVsdCBvcHRpb25zLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gZGVmYXVsdHNcbiAqIEBwYXJhbSAge09iamVjdH0gc2V0dGluZ3NcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBtZXJnZU9wdGlvbnMoZGVmYXVsdHMsIHNldHRpbmdzKSB7XG4gIHZhciBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIHNldHRpbmdzKTsgLy8gYE9iamVjdC5hc3NpZ25gIGRvIG5vdCBkZWVwbHkgbWVyZ2Ugb2JqZWN0cywgc28gd2VcbiAgLy8gaGF2ZSB0byBkbyBpdCBtYW51YWxseSBmb3IgZXZlcnkgbmVzdGVkIG9iamVjdFxuICAvLyBpbiBvcHRpb25zLiBBbHRob3VnaCBpdCBkb2VzIG5vdCBsb29rIHNtYXJ0LFxuICAvLyBpdCdzIHNtYWxsZXIgYW5kIGZhc3RlciB0aGFuIHNvbWUgZmFuY3lcbiAgLy8gbWVyZ2luZyBkZWVwLW1lcmdlIGFsZ29yaXRobSBzY3JpcHQuXG5cbiAgaWYgKHNldHRpbmdzLmhhc093blByb3BlcnR5KCdjbGFzc2VzJykpIHtcbiAgICBvcHRpb25zLmNsYXNzZXMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cy5jbGFzc2VzLCBzZXR0aW5ncy5jbGFzc2VzKTtcblxuICAgIGlmIChzZXR0aW5ncy5jbGFzc2VzLmhhc093blByb3BlcnR5KCdkaXJlY3Rpb24nKSkge1xuICAgICAgb3B0aW9ucy5jbGFzc2VzLmRpcmVjdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLmNsYXNzZXMuZGlyZWN0aW9uLCBzZXR0aW5ncy5jbGFzc2VzLmRpcmVjdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHNldHRpbmdzLmNsYXNzZXMuaGFzT3duUHJvcGVydHkoJ3R5cGUnKSkge1xuICAgICAgb3B0aW9ucy5jbGFzc2VzLnR5cGUgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cy5jbGFzc2VzLnR5cGUsIHNldHRpbmdzLmNsYXNzZXMudHlwZSk7XG4gICAgfVxuXG4gICAgaWYgKHNldHRpbmdzLmNsYXNzZXMuaGFzT3duUHJvcGVydHkoJ3NsaWRlJykpIHtcbiAgICAgIG9wdGlvbnMuY2xhc3Nlcy5zbGlkZSA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLmNsYXNzZXMuc2xpZGUsIHNldHRpbmdzLmNsYXNzZXMuc2xpZGUpO1xuICAgIH1cblxuICAgIGlmIChzZXR0aW5ncy5jbGFzc2VzLmhhc093blByb3BlcnR5KCdhcnJvdycpKSB7XG4gICAgICBvcHRpb25zLmNsYXNzZXMuYXJyb3cgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cy5jbGFzc2VzLmFycm93LCBzZXR0aW5ncy5jbGFzc2VzLmFycm93KTtcbiAgICB9XG5cbiAgICBpZiAoc2V0dGluZ3MuY2xhc3Nlcy5oYXNPd25Qcm9wZXJ0eSgnbmF2JykpIHtcbiAgICAgIG9wdGlvbnMuY2xhc3Nlcy5uYXYgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cy5jbGFzc2VzLm5hdiwgc2V0dGluZ3MuY2xhc3Nlcy5uYXYpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eSgnYnJlYWtwb2ludHMnKSkge1xuICAgIG9wdGlvbnMuYnJlYWtwb2ludHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cy5icmVha3BvaW50cywgc2V0dGluZ3MuYnJlYWtwb2ludHMpO1xuICB9XG5cbiAgcmV0dXJuIG9wdGlvbnM7XG59XG5cbnZhciBFdmVudHNCdXMgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICogQ29uc3RydWN0IGEgRXZlbnRCdXMgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudHNcbiAgICovXG4gIGZ1bmN0aW9uIEV2ZW50c0J1cygpIHtcbiAgICB2YXIgZXZlbnRzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBFdmVudHNCdXMpO1xuXG4gICAgdGhpcy5ldmVudHMgPSBldmVudHM7XG4gICAgdGhpcy5ob3AgPSBldmVudHMuaGFzT3duUHJvcGVydHk7XG4gIH1cbiAgLyoqXG4gICAqIEFkZHMgbGlzdGVuZXIgdG8gdGhlIHNwZWNpZmVkIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gZXZlbnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhFdmVudHNCdXMsIFt7XG4gICAga2V5OiBcIm9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgICBpZiAoaXNBcnJheShldmVudCkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRoaXMub24oZXZlbnRbaV0sIGhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBDcmVhdGUgdGhlIGV2ZW50J3Mgb2JqZWN0IGlmIG5vdCB5ZXQgY3JlYXRlZFxuXG5cbiAgICAgIGlmICghdGhpcy5ob3AuY2FsbCh0aGlzLmV2ZW50cywgZXZlbnQpKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XSA9IFtdO1xuICAgICAgfSAvLyBBZGQgdGhlIGhhbmRsZXIgdG8gcXVldWVcblxuXG4gICAgICB2YXIgaW5kZXggPSB0aGlzLmV2ZW50c1tldmVudF0ucHVzaChoYW5kbGVyKSAtIDE7IC8vIFByb3ZpZGUgaGFuZGxlIGJhY2sgZm9yIHJlbW92YWwgb2YgZXZlbnRcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuZXZlbnRzW2V2ZW50XVtpbmRleF07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJ1bnMgcmVnaXN0ZXJlZCBoYW5kbGVycyBmb3Igc3BlY2lmaWVkIGV2ZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IGV2ZW50XG4gICAgICogQHBhcmFtIHtPYmplY3Q9fSBjb250ZXh0XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJlbWl0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGNvbnRleHQpIHtcbiAgICAgIGlmIChpc0FycmF5KGV2ZW50KSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KGV2ZW50W2ldLCBjb250ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gLy8gSWYgdGhlIGV2ZW50IGRvZXNuJ3QgZXhpc3QsIG9yIHRoZXJlJ3Mgbm8gaGFuZGxlcnMgaW4gcXVldWUsIGp1c3QgbGVhdmVcblxuXG4gICAgICBpZiAoIXRoaXMuaG9wLmNhbGwodGhpcy5ldmVudHMsIGV2ZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIEN5Y2xlIHRocm91Z2ggZXZlbnRzIHF1ZXVlLCBmaXJlIVxuXG5cbiAgICAgIHRoaXMuZXZlbnRzW2V2ZW50XS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIGl0ZW0oY29udGV4dCB8fCB7fSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gRXZlbnRzQnVzO1xufSgpO1xuXG52YXIgR2xpZGUkMSA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBnbGlkZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSAge1N0cmluZ30gc2VsZWN0b3JcclxuICAgKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcclxuICAgKi9cbiAgZnVuY3Rpb24gR2xpZGUoc2VsZWN0b3IpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgR2xpZGUpO1xuXG4gICAgdGhpcy5fYyA9IHt9O1xuICAgIHRoaXMuX3QgPSBbXTtcbiAgICB0aGlzLl9lID0gbmV3IEV2ZW50c0J1cygpO1xuICAgIHRoaXMuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgdGhpcy5zZXR0aW5ncyA9IG1lcmdlT3B0aW9ucyhkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgdGhpcy5pbmRleCA9IHRoaXMuc2V0dGluZ3Muc3RhcnRBdDtcbiAgfVxuICAvKipcclxuICAgKiBJbml0aWFsaXplcyBnbGlkZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBleHRlbnNpb25zIENvbGxlY3Rpb24gb2YgZXh0ZW5zaW9ucyB0byBpbml0aWFsaXplLlxyXG4gICAqIEByZXR1cm4ge0dsaWRlfVxyXG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKEdsaWRlLCBbe1xuICAgIGtleTogXCJtb3VudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3VudCQxKCkge1xuICAgICAgdmFyIGV4dGVuc2lvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuXG4gICAgICB0aGlzLl9lLmVtaXQoJ21vdW50LmJlZm9yZScpO1xuXG4gICAgICBpZiAoaXNPYmplY3QoZXh0ZW5zaW9ucykpIHtcbiAgICAgICAgdGhpcy5fYyA9IG1vdW50KHRoaXMsIGV4dGVuc2lvbnMsIHRoaXMuX2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2FybignWW91IG5lZWQgdG8gcHJvdmlkZSBhIG9iamVjdCBvbiBgbW91bnQoKWAnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZS5lbWl0KCdtb3VudC5hZnRlcicpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBDb2xsZWN0cyBhbiBpbnN0YW5jZSBgdHJhbnNsYXRlYCB0cmFuc2Zvcm1lcnMuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7QXJyYXl9IHRyYW5zZm9ybWVycyBDb2xsZWN0aW9uIG9mIHRyYW5zZm9ybWVycy5cclxuICAgICAqIEByZXR1cm4ge1ZvaWR9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIm11dGF0ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtdXRhdGUoKSB7XG4gICAgICB2YXIgdHJhbnNmb3JtZXJzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBbXTtcblxuICAgICAgaWYgKGlzQXJyYXkodHJhbnNmb3JtZXJzKSkge1xuICAgICAgICB0aGlzLl90ID0gdHJhbnNmb3JtZXJzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2FybignWW91IG5lZWQgdG8gcHJvdmlkZSBhIGFycmF5IG9uIGBtdXRhdGUoKWAnKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyBnbGlkZSB3aXRoIHNwZWNpZmllZCBzZXR0aW5ncy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2V0dGluZ3NcclxuICAgICAqIEByZXR1cm4ge0dsaWRlfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJ1cGRhdGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgdmFyIHNldHRpbmdzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICAgIHRoaXMuc2V0dGluZ3MgPSBtZXJnZU9wdGlvbnModGhpcy5zZXR0aW5ncywgc2V0dGluZ3MpO1xuXG4gICAgICBpZiAoc2V0dGluZ3MuaGFzT3duUHJvcGVydHkoJ3N0YXJ0QXQnKSkge1xuICAgICAgICB0aGlzLmluZGV4ID0gc2V0dGluZ3Muc3RhcnRBdDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZS5lbWl0KCd1cGRhdGUnKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogQ2hhbmdlIHNsaWRlIHdpdGggc3BlY2lmaWVkIHBhdHRlcm4uIEEgcGF0dGVybiBtdXN0IGJlIGluIHRoZSBzcGVjaWFsIGZvcm1hdDpcclxuICAgICAqIGA+YCAtIE1vdmUgb25lIGZvcndhcmRcclxuICAgICAqIGA8YCAtIE1vdmUgb25lIGJhY2t3YXJkXHJcbiAgICAgKiBgPXtpfWAgLSBHbyB0byB7aX0gemVyby1iYXNlZCBzbGlkZSAoZXEuICc9MScsIHdpbGwgZ28gdG8gc2Vjb25kIHNsaWRlKVxyXG4gICAgICogYD4+YCAtIFJld2luZHMgdG8gZW5kIChsYXN0IHNsaWRlKVxyXG4gICAgICogYDw8YCAtIFJld2luZHMgdG8gc3RhcnQgKGZpcnN0IHNsaWRlKVxyXG4gICAgICogYHw+YCAtIE1vdmUgb25lIHZpZXdwb3J0IGZvcndhcmRcclxuICAgICAqIGB8PGAgLSBNb3ZlIG9uZSB2aWV3cG9ydCBiYWNrd2FyZFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXR0ZXJuXHJcbiAgICAgKiBAcmV0dXJuIHtHbGlkZX1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZ29cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ28ocGF0dGVybikge1xuICAgICAgdGhpcy5fYy5SdW4ubWFrZShwYXR0ZXJuKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogTW92ZSB0cmFjayBieSBzcGVjaWZpZWQgZGlzdGFuY2UuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGRpc3RhbmNlXHJcbiAgICAgKiBAcmV0dXJuIHtHbGlkZX1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwibW92ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlKGRpc3RhbmNlKSB7XG4gICAgICB0aGlzLl9jLlRyYW5zaXRpb24uZGlzYWJsZSgpO1xuXG4gICAgICB0aGlzLl9jLk1vdmUubWFrZShkaXN0YW5jZSk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIERlc3Ryb3kgaW5zdGFuY2UgYW5kIHJldmVydCBhbGwgY2hhbmdlcyBkb25lIGJ5IHRoaXMuX2MuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7R2xpZGV9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlc3Ryb3lcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIHRoaXMuX2UuZW1pdCgnZGVzdHJveScpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBTdGFydCBpbnN0YW5jZSBhdXRvcGxheWluZy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW58TnVtYmVyfSBpbnRlcnZhbCBSdW4gYXV0b3BsYXlpbmcgd2l0aCBwYXNzZWQgaW50ZXJ2YWwgcmVnYXJkbGVzcyBvZiBgYXV0b3BsYXlgIHNldHRpbmdzXHJcbiAgICAgKiBAcmV0dXJuIHtHbGlkZX1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwicGxheVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwbGF5KCkge1xuICAgICAgdmFyIGludGVydmFsID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiBmYWxzZTtcblxuICAgICAgaWYgKGludGVydmFsKSB7XG4gICAgICAgIHRoaXMuc2V0dGluZ3MuYXV0b3BsYXkgPSBpbnRlcnZhbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZS5lbWl0KCdwbGF5Jyk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIFN0b3AgaW5zdGFuY2UgYXV0b3BsYXlpbmcuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7R2xpZGV9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInBhdXNlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHBhdXNlKCkge1xuICAgICAgdGhpcy5fZS5lbWl0KCdwYXVzZScpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGdsaWRlIGludG8gYSBpZGxlIHN0YXR1cy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtHbGlkZX1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiZGlzYWJsZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNhYmxlKCkge1xuICAgICAgdGhpcy5kaXNhYmxlZCA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGdsaWRlIGludG8gYSBhY3RpdmUgc3RhdHVzLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge0dsaWRlfVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJlbmFibGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZW5hYmxlKCkge1xuICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogQWRkcyBjdXV0b20gZXZlbnQgbGlzdGVuZXIgd2l0aCBoYW5kbGVyLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xBcnJheX0gZXZlbnRcclxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBoYW5kbGVyXHJcbiAgICAgKiBAcmV0dXJuIHtHbGlkZX1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwib25cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgIHRoaXMuX2Uub24oZXZlbnQsIGhhbmRsZXIpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgZ2xpZGUgaXMgYSBwcmVjaXNlZCB0eXBlLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gbmFtZVxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiaXNUeXBlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGlzVHlwZShuYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXR0aW5ncy50eXBlID09PSBuYW1lO1xuICAgIH1cbiAgICAvKipcclxuICAgICAqIEdldHMgdmFsdWUgb2YgdGhlIGNvcmUgb3B0aW9ucy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcInNldHRpbmdzXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbztcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHZhbHVlIG9mIHRoZSBjb3JlIG9wdGlvbnMuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvXHJcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxyXG4gICAgICovXG4gICAgLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KG8pIHtcbiAgICAgIGlmIChpc09iamVjdChvKSkge1xuICAgICAgICB0aGlzLl9vID0gbztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm4oJ09wdGlvbnMgbXVzdCBiZSBhbiBgb2JqZWN0YCBpbnN0YW5jZS4nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIGN1cnJlbnQgaW5kZXggb2YgdGhlIHNsaWRlci5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XHJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImluZGV4XCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5faTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGN1cnJlbnQgaW5kZXggYSBzbGlkZXIuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxyXG4gICAgICovXG4gICAgLFxuICAgIHNldDogZnVuY3Rpb24gc2V0KGkpIHtcbiAgICAgIHRoaXMuX2kgPSB0b0ludChpKTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHR5cGUgbmFtZSBvZiB0aGUgc2xpZGVyLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cclxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwidHlwZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0dGluZ3MudHlwZTtcbiAgICB9XG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHZhbHVlIG9mIHRoZSBpZGxlIHN0YXR1cy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJkaXNhYmxlZFwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2Q7XG4gICAgfVxuICAgIC8qKlxyXG4gICAgICogU2V0cyB2YWx1ZSBvZiB0aGUgaWRsZSBzdGF0dXMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xuICAgICxcbiAgICBzZXQ6IGZ1bmN0aW9uIHNldChzdGF0dXMpIHtcbiAgICAgIHRoaXMuX2QgPSAhIXN0YXR1cztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gR2xpZGU7XG59KCk7XG5cbmZ1bmN0aW9uIFJ1biAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICB2YXIgUnVuID0ge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIGF1dG9ydW5uaW5nIG9mIHRoZSBnbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgdGhpcy5fbyA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBnbGlkZXMgcnVubmluZyBiYXNlZCBvbiB0aGUgcGFzc2VkIG1vdmluZyBzY2hlbWEuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbW92ZVxuICAgICAqL1xuICAgIG1ha2U6IGZ1bmN0aW9uIG1ha2UobW92ZSkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgaWYgKCFHbGlkZS5kaXNhYmxlZCkge1xuICAgICAgICAhR2xpZGUuc2V0dGluZ3Mud2FpdEZvclRyYW5zaXRpb24gfHwgR2xpZGUuZGlzYWJsZSgpO1xuICAgICAgICB0aGlzLm1vdmUgPSBtb3ZlO1xuICAgICAgICBFdmVudHMuZW1pdCgncnVuLmJlZm9yZScsIHRoaXMubW92ZSk7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlKCk7XG4gICAgICAgIEV2ZW50cy5lbWl0KCdydW4nLCB0aGlzLm1vdmUpO1xuICAgICAgICBDb21wb25lbnRzLlRyYW5zaXRpb24uYWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChfdGhpcy5pc1N0YXJ0KCkpIHtcbiAgICAgICAgICAgIEV2ZW50cy5lbWl0KCdydW4uc3RhcnQnLCBfdGhpcy5tb3ZlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoX3RoaXMuaXNFbmQoKSkge1xuICAgICAgICAgICAgRXZlbnRzLmVtaXQoJ3J1bi5lbmQnLCBfdGhpcy5tb3ZlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoX3RoaXMuaXNPZmZzZXQoKSkge1xuICAgICAgICAgICAgX3RoaXMuX28gPSBmYWxzZTtcbiAgICAgICAgICAgIEV2ZW50cy5lbWl0KCdydW4ub2Zmc2V0JywgX3RoaXMubW92ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgRXZlbnRzLmVtaXQoJ3J1bi5hZnRlcicsIF90aGlzLm1vdmUpO1xuICAgICAgICAgIEdsaWRlLmVuYWJsZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyBjdXJyZW50IGluZGV4IGJhc2VkIG9uIGRlZmluZWQgbW92ZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcnxVbmRlZmluZWR9XG4gICAgICovXG4gICAgY2FsY3VsYXRlOiBmdW5jdGlvbiBjYWxjdWxhdGUoKSB7XG4gICAgICB2YXIgbW92ZSA9IHRoaXMubW92ZSxcbiAgICAgICAgICBsZW5ndGggPSB0aGlzLmxlbmd0aDtcbiAgICAgIHZhciBzdGVwcyA9IG1vdmUuc3RlcHMsXG4gICAgICAgICAgZGlyZWN0aW9uID0gbW92ZS5kaXJlY3Rpb247IC8vIEJ5IGRlZmF1bHQgYXNzdW1lIHRoYXQgc2l6ZSBvZiB2aWV3IGlzIGVxdWFsIHRvIG9uZSBzbGlkZVxuXG4gICAgICB2YXIgdmlld1NpemUgPSAxOyAvLyBXaGlsZSBkaXJlY3Rpb24gaXMgYD1gIHdlIHdhbnQganVtcCB0b1xuICAgICAgLy8gYSBzcGVjaWZpZWQgaW5kZXggZGVzY3JpYmVkIGluIHN0ZXBzLlxuXG4gICAgICBpZiAoZGlyZWN0aW9uID09PSAnPScpIHtcbiAgICAgICAgLy8gQ2hlY2sgaWYgYm91bmQgaXMgdHJ1ZSwgXG4gICAgICAgIC8vIGFzIHdlIHdhbnQgdG8gYXZvaWQgd2hpdGVzcGFjZXMuXG4gICAgICAgIGlmIChHbGlkZS5zZXR0aW5ncy5ib3VuZCAmJiB0b0ludChzdGVwcykgPiBsZW5ndGgpIHtcbiAgICAgICAgICBHbGlkZS5pbmRleCA9IGxlbmd0aDtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBHbGlkZS5pbmRleCA9IHN0ZXBzO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIFdoZW4gcGF0dGVybiBpcyBlcXVhbCB0byBgPj5gIHdlIHdhbnRcbiAgICAgIC8vIGZhc3QgZm9yd2FyZCB0byB0aGUgbGFzdCBzbGlkZS5cblxuXG4gICAgICBpZiAoZGlyZWN0aW9uID09PSAnPicgJiYgc3RlcHMgPT09ICc+Jykge1xuICAgICAgICBHbGlkZS5pbmRleCA9IGxlbmd0aDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBXaGVuIHBhdHRlcm4gaXMgZXF1YWwgdG8gYDw8YCB3ZSB3YW50XG4gICAgICAvLyBmYXN0IGZvcndhcmQgdG8gdGhlIGZpcnN0IHNsaWRlLlxuXG5cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09ICc8JyAmJiBzdGVwcyA9PT0gJzwnKSB7XG4gICAgICAgIEdsaWRlLmluZGV4ID0gMDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBwYWdpbmF0aW9uIG1vdmVtZW50XG5cblxuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3wnKSB7XG4gICAgICAgIHZpZXdTaXplID0gR2xpZGUuc2V0dGluZ3MucGVyVmlldyB8fCAxO1xuICAgICAgfSAvLyB3ZSBhcmUgbW92aW5nIGZvcndhcmRcblxuXG4gICAgICBpZiAoZGlyZWN0aW9uID09PSAnPicgfHwgZGlyZWN0aW9uID09PSAnfCcgJiYgc3RlcHMgPT09ICc+Jykge1xuICAgICAgICB2YXIgaW5kZXggPSBjYWxjdWxhdGVGb3J3YXJkSW5kZXgodmlld1NpemUpO1xuXG4gICAgICAgIGlmIChpbmRleCA+IGxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuX28gPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgR2xpZGUuaW5kZXggPSBub3JtYWxpemVGb3J3YXJkSW5kZXgoaW5kZXgsIHZpZXdTaXplKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyB3ZSBhcmUgbW92aW5nIGJhY2t3YXJkXG5cblxuICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJzwnIHx8IGRpcmVjdGlvbiA9PT0gJ3wnICYmIHN0ZXBzID09PSAnPCcpIHtcbiAgICAgICAgdmFyIF9pbmRleCA9IGNhbGN1bGF0ZUJhY2t3YXJkSW5kZXgodmlld1NpemUpO1xuXG4gICAgICAgIGlmIChfaW5kZXggPCAwKSB7XG4gICAgICAgICAgdGhpcy5fbyA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBHbGlkZS5pbmRleCA9IG5vcm1hbGl6ZUJhY2t3YXJkSW5kZXgoX2luZGV4LCB2aWV3U2l6ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgd2FybihcIkludmFsaWQgZGlyZWN0aW9uIHBhdHRlcm4gW1wiLmNvbmNhdChkaXJlY3Rpb24pLmNvbmNhdChzdGVwcywgXCJdIGhhcyBiZWVuIHVzZWRcIikpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgd2UgYXJlIG9uIHRoZSBmaXJzdCBzbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNTdGFydDogZnVuY3Rpb24gaXNTdGFydCgpIHtcbiAgICAgIHJldHVybiBHbGlkZS5pbmRleCA8PSAwO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgd2UgYXJlIG9uIHRoZSBsYXN0IHNsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0VuZDogZnVuY3Rpb24gaXNFbmQoKSB7XG4gICAgICByZXR1cm4gR2xpZGUuaW5kZXggPj0gdGhpcy5sZW5ndGg7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB3ZSBhcmUgbWFraW5nIGEgb2Zmc2V0IHJ1bi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3Rpb25cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzT2Zmc2V0OiBmdW5jdGlvbiBpc09mZnNldCgpIHtcbiAgICAgIHZhciBkaXJlY3Rpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKCFkaXJlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX287XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5fbykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IC8vIGRpZCB3ZSB2aWV3IHRvIHRoZSByaWdodD9cblxuXG4gICAgICBpZiAoZGlyZWN0aW9uID09PSAnfD4nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vdmUuZGlyZWN0aW9uID09PSAnfCcgJiYgdGhpcy5tb3ZlLnN0ZXBzID09PSAnPic7XG4gICAgICB9IC8vIGRpZCB3ZSB2aWV3IHRvIHRoZSBsZWZ0P1xuXG5cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09ICd8PCcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW92ZS5kaXJlY3Rpb24gPT09ICd8JyAmJiB0aGlzLm1vdmUuc3RlcHMgPT09ICc8JztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMubW92ZS5kaXJlY3Rpb24gPT09IGRpcmVjdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGJvdW5kIG1vZGUgaXMgYWN0aXZlXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzQm91bmQ6IGZ1bmN0aW9uIGlzQm91bmQoKSB7XG4gICAgICByZXR1cm4gR2xpZGUuaXNUeXBlKCdzbGlkZXInKSAmJiBHbGlkZS5zZXR0aW5ncy5mb2N1c0F0ICE9PSAnY2VudGVyJyAmJiBHbGlkZS5zZXR0aW5ncy5ib3VuZDtcbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIGluZGV4IHZhbHVlIHRvIG1vdmUgZm9yd2FyZC90byB0aGUgcmlnaHRcbiAgICpcbiAgICogQHBhcmFtIHZpZXdTaXplXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZUZvcndhcmRJbmRleCh2aWV3U2l6ZSkge1xuICAgIHZhciBpbmRleCA9IEdsaWRlLmluZGV4O1xuXG4gICAgaWYgKEdsaWRlLmlzVHlwZSgnY2Fyb3VzZWwnKSkge1xuICAgICAgcmV0dXJuIGluZGV4ICsgdmlld1NpemU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGluZGV4ICsgKHZpZXdTaXplIC0gaW5kZXggJSB2aWV3U2l6ZSk7XG4gIH1cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIGdpdmVuIGZvcndhcmQgaW5kZXggYmFzZWQgb24gZ2xpZGUgc2V0dGluZ3MsIHByZXZlbnRpbmcgaXQgdG8gZXhjZWVkIGNlcnRhaW4gYm91bmRhcmllc1xuICAgKlxuICAgKiBAcGFyYW0gaW5kZXhcbiAgICogQHBhcmFtIGxlbmd0aFxuICAgKiBAcGFyYW0gdmlld1NpemVcbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG5cblxuICBmdW5jdGlvbiBub3JtYWxpemVGb3J3YXJkSW5kZXgoaW5kZXgsIHZpZXdTaXplKSB7XG4gICAgdmFyIGxlbmd0aCA9IFJ1bi5sZW5ndGg7XG5cbiAgICBpZiAoaW5kZXggPD0gbGVuZ3RoKSB7XG4gICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxuXG4gICAgaWYgKEdsaWRlLmlzVHlwZSgnY2Fyb3VzZWwnKSkge1xuICAgICAgcmV0dXJuIGluZGV4IC0gKGxlbmd0aCArIDEpO1xuICAgIH1cblxuICAgIGlmIChHbGlkZS5zZXR0aW5ncy5yZXdpbmQpIHtcbiAgICAgIC8vIGJvdW5kIGRvZXMgZnVubnkgdGhpbmdzIHdpdGggdGhlIGxlbmd0aCwgdGhlcmVmb3Igd2UgaGF2ZSB0byBiZSBjZXJ0YWluXG4gICAgICAvLyB0aGF0IHdlIGFyZSBvbiB0aGUgbGFzdCBwb3NzaWJsZSBpbmRleCB2YWx1ZSBnaXZlbiBieSBib3VuZFxuICAgICAgaWYgKFJ1bi5pc0JvdW5kKCkgJiYgIVJ1bi5pc0VuZCgpKSB7XG4gICAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGlmIChSdW4uaXNCb3VuZCgpKSB7XG4gICAgICByZXR1cm4gbGVuZ3RoO1xuICAgIH1cblxuICAgIHJldHVybiBNYXRoLmZsb29yKGxlbmd0aCAvIHZpZXdTaXplKSAqIHZpZXdTaXplO1xuICB9XG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIGluZGV4IHZhbHVlIHRvIG1vdmUgYmFja3dhcmQvdG8gdGhlIGxlZnRcbiAgICpcbiAgICogQHBhcmFtIHZpZXdTaXplXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gY2FsY3VsYXRlQmFja3dhcmRJbmRleCh2aWV3U2l6ZSkge1xuICAgIHZhciBpbmRleCA9IEdsaWRlLmluZGV4O1xuXG4gICAgaWYgKEdsaWRlLmlzVHlwZSgnY2Fyb3VzZWwnKSkge1xuICAgICAgcmV0dXJuIGluZGV4IC0gdmlld1NpemU7XG4gICAgfSAvLyBlbnN1cmUgb3VyIGJhY2sgbmF2aWdhdGlvbiByZXN1bHRzIGluIHRoZSBzYW1lIGluZGV4IGFzIGEgZm9yd2FyZCBuYXZpZ2F0aW9uXG4gICAgLy8gdG8gZXhwZXJpZW5jZSBhIGhvbW9nZW5lb3VzIHBhZ2luZ1xuXG5cbiAgICB2YXIgdmlldyA9IE1hdGguY2VpbChpbmRleCAvIHZpZXdTaXplKTtcbiAgICByZXR1cm4gKHZpZXcgLSAxKSAqIHZpZXdTaXplO1xuICB9XG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIHRoZSBnaXZlbiBiYWNrd2FyZCBpbmRleCBiYXNlZCBvbiBnbGlkZSBzZXR0aW5ncywgcHJldmVudGluZyBpdCB0byBleGNlZWQgY2VydGFpbiBib3VuZGFyaWVzXG4gICAqXG4gICAqIEBwYXJhbSBpbmRleFxuICAgKiBAcGFyYW0gbGVuZ3RoXG4gICAqIEBwYXJhbSB2aWV3U2l6ZVxuICAgKiBAcmV0dXJucyB7Kn1cbiAgICovXG5cblxuICBmdW5jdGlvbiBub3JtYWxpemVCYWNrd2FyZEluZGV4KGluZGV4LCB2aWV3U2l6ZSkge1xuICAgIHZhciBsZW5ndGggPSBSdW4ubGVuZ3RoO1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG5cbiAgICBpZiAoR2xpZGUuaXNUeXBlKCdjYXJvdXNlbCcpKSB7XG4gICAgICByZXR1cm4gaW5kZXggKyAobGVuZ3RoICsgMSk7XG4gICAgfVxuXG4gICAgaWYgKEdsaWRlLnNldHRpbmdzLnJld2luZCkge1xuICAgICAgLy8gYm91bmQgZG9lcyBmdW5ueSB0aGluZ3Mgd2l0aCB0aGUgbGVuZ3RoLCB0aGVyZWZvciB3ZSBoYXZlIHRvIGJlIGNlcnRhaW5cbiAgICAgIC8vIHRoYXQgd2UgYXJlIG9uIGZpcnN0IHBvc3NpYmxlIGluZGV4IHZhbHVlIGJlZm9yZSB3ZSB0byByZXdpbmQgdG8gdGhlIGxlbmd0aCBnaXZlbiBieSBib3VuZFxuICAgICAgaWYgKFJ1bi5pc0JvdW5kKCkgJiYgUnVuLmlzU3RhcnQoKSkge1xuICAgICAgICByZXR1cm4gbGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihsZW5ndGggLyB2aWV3U2l6ZSkgKiB2aWV3U2l6ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGRlZmluZShSdW4sICdtb3ZlJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgdmFsdWUgb2YgdGhlIG1vdmUgc2NoZW1hLlxuICAgICAqXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHZhbHVlIG9mIHRoZSBtb3ZlIHNjaGVtYS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcbiAgICAgIHZhciBzdGVwID0gdmFsdWUuc3Vic3RyKDEpO1xuICAgICAgdGhpcy5fbSA9IHtcbiAgICAgICAgZGlyZWN0aW9uOiB2YWx1ZS5zdWJzdHIoMCwgMSksXG4gICAgICAgIHN0ZXBzOiBzdGVwID8gdG9JbnQoc3RlcCkgPyB0b0ludChzdGVwKSA6IHN0ZXAgOiAwXG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG4gIGRlZmluZShSdW4sICdsZW5ndGgnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyB2YWx1ZSBvZiB0aGUgcnVubmluZyBkaXN0YW5jZSBiYXNlZFxuICAgICAqIG9uIHplcm8taW5kZXhpbmcgbnVtYmVyIG9mIHNsaWRlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuICAgICAgdmFyIGxlbmd0aCA9IENvbXBvbmVudHMuSHRtbC5zbGlkZXMubGVuZ3RoOyAvLyBJZiB0aGUgYGJvdW5kYCBvcHRpb24gaXMgYWN0aXZlLCBhIG1heGltdW0gcnVubmluZyBkaXN0YW5jZSBzaG91bGQgYmVcbiAgICAgIC8vIHJlZHVjZWQgYnkgYHBlclZpZXdgIGFuZCBgZm9jdXNBdGAgc2V0dGluZ3MuIFJ1bm5pbmcgZGlzdGFuY2VcbiAgICAgIC8vIHNob3VsZCBlbmQgYmVmb3JlIGNyZWF0aW5nIGFuIGVtcHR5IHNwYWNlIGFmdGVyIGluc3RhbmNlLlxuXG4gICAgICBpZiAodGhpcy5pc0JvdW5kKCkpIHtcbiAgICAgICAgcmV0dXJuIGxlbmd0aCAtIDEgLSAodG9JbnQoc2V0dGluZ3MucGVyVmlldykgLSAxKSArIHRvSW50KHNldHRpbmdzLmZvY3VzQXQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGVuZ3RoIC0gMTtcbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoUnVuLCAnb2Zmc2V0Jywge1xuICAgIC8qKlxuICAgICAqIEdldHMgc3RhdHVzIG9mIHRoZSBvZmZzZXR0aW5nIGZsYWcuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX287XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIFJ1bjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgY3VycmVudCB0aW1lLlxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuZnVuY3Rpb24gbm93KCkge1xuICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWRcbiAqIGF0IG1vc3Qgb25jZSBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jXG4gKiBAcGFyYW0ge051bWJlcn0gd2FpdFxuICogQHBhcmFtIHtPYmplY3Q9fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqXG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZVxuICovXG5cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIHRpbWVvdXQsIGNvbnRleHQsIGFyZ3MsIHJlc3VsdDtcbiAgdmFyIHByZXZpb3VzID0gMDtcbiAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG5cbiAgdmFyIGxhdGVyID0gZnVuY3Rpb24gbGF0ZXIoKSB7XG4gICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IG5vdygpO1xuICAgIHRpbWVvdXQgPSBudWxsO1xuICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gIH07XG5cbiAgdmFyIHRocm90dGxlZCA9IGZ1bmN0aW9uIHRocm90dGxlZCgpIHtcbiAgICB2YXIgYXQgPSBub3coKTtcbiAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gYXQ7XG4gICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAoYXQgLSBwcmV2aW91cyk7XG4gICAgY29udGV4dCA9IHRoaXM7XG4gICAgYXJncyA9IGFyZ3VtZW50cztcblxuICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICBpZiAodGltZW91dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBwcmV2aW91cyA9IGF0O1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgdGhyb3R0bGVkLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgcHJldmlvdXMgPSAwO1xuICAgIHRpbWVvdXQgPSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gIH07XG5cbiAgcmV0dXJuIHRocm90dGxlZDtcbn1cblxudmFyIE1BUkdJTl9UWVBFID0ge1xuICBsdHI6IFsnbWFyZ2luTGVmdCcsICdtYXJnaW5SaWdodCddLFxuICBydGw6IFsnbWFyZ2luUmlnaHQnLCAnbWFyZ2luTGVmdCddXG59O1xuZnVuY3Rpb24gR2FwcyAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICB2YXIgR2FwcyA9IHtcbiAgICAvKipcbiAgICAgKiBBcHBsaWVzIGdhcHMgYmV0d2VlbiBzbGlkZXMuIEZpcnN0IGFuZCBsYXN0XG4gICAgICogc2xpZGVzIGRvIG5vdCByZWNlaXZlIGl0J3MgZWRnZSBtYXJnaW5zLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtIVE1MQ29sbGVjdGlvbn0gc2xpZGVzXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBhcHBseTogZnVuY3Rpb24gYXBwbHkoc2xpZGVzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc2xpZGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHZhciBzdHlsZSA9IHNsaWRlc1tpXS5zdHlsZTtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IENvbXBvbmVudHMuRGlyZWN0aW9uLnZhbHVlO1xuXG4gICAgICAgIGlmIChpICE9PSAwKSB7XG4gICAgICAgICAgc3R5bGVbTUFSR0lOX1RZUEVbZGlyZWN0aW9uXVswXV0gPSBcIlwiLmNvbmNhdCh0aGlzLnZhbHVlIC8gMiwgXCJweFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZVtNQVJHSU5fVFlQRVtkaXJlY3Rpb25dWzBdXSA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGkgIT09IHNsaWRlcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgc3R5bGVbTUFSR0lOX1RZUEVbZGlyZWN0aW9uXVsxXV0gPSBcIlwiLmNvbmNhdCh0aGlzLnZhbHVlIC8gMiwgXCJweFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZVtNQVJHSU5fVFlQRVtkaXJlY3Rpb25dWzFdXSA9ICcnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgZ2FwcyBmcm9tIHRoZSBzbGlkZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hUTUxDb2xsZWN0aW9ufSBzbGlkZXNcbiAgICAgKiBAcmV0dXJucyB7Vm9pZH1cbiAgICAqL1xuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKHNsaWRlcykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNsaWRlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YXIgc3R5bGUgPSBzbGlkZXNbaV0uc3R5bGU7XG4gICAgICAgIHN0eWxlLm1hcmdpbkxlZnQgPSAnJztcbiAgICAgICAgc3R5bGUubWFyZ2luUmlnaHQgPSAnJztcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGRlZmluZShHYXBzLCAndmFsdWUnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyB2YWx1ZSBvZiB0aGUgZ2FwLlxuICAgICAqXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0b0ludChHbGlkZS5zZXR0aW5ncy5nYXApO1xuICAgIH1cbiAgfSk7XG4gIGRlZmluZShHYXBzLCAnZ3JvdycsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIGFkZGl0aW9uYWwgZGltZW5zaW9ucyB2YWx1ZSBjYXVzZWQgYnkgZ2Fwcy5cbiAgICAgKiBVc2VkIHRvIGluY3JlYXNlIHdpZHRoIG9mIHRoZSBzbGlkZXMgd3JhcHBlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gR2Fwcy52YWx1ZSAqIENvbXBvbmVudHMuU2l6ZXMubGVuZ3RoO1xuICAgIH1cbiAgfSk7XG4gIGRlZmluZShHYXBzLCAncmVkdWN0b3InLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyByZWR1Y3Rpb24gdmFsdWUgY2F1c2VkIGJ5IGdhcHMuXG4gICAgICogVXNlZCB0byBzdWJ0cmFjdCB3aWR0aCBvZiB0aGUgc2xpZGVzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHZhciBwZXJWaWV3ID0gR2xpZGUuc2V0dGluZ3MucGVyVmlldztcbiAgICAgIHJldHVybiBHYXBzLnZhbHVlICogKHBlclZpZXcgLSAxKSAvIHBlclZpZXc7XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIEFwcGx5IGNhbGN1bGF0ZWQgZ2FwczpcbiAgICogLSBhZnRlciBidWlsZGluZywgc28gc2xpZGVzIChpbmNsdWRpbmcgY2xvbmVzKSB3aWxsIHJlY2VpdmUgcHJvcGVyIG1hcmdpbnNcbiAgICogLSBvbiB1cGRhdGluZyB2aWEgQVBJLCB0byByZWNhbGN1bGF0ZSBnYXBzIHdpdGggbmV3IG9wdGlvbnNcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsnYnVpbGQuYWZ0ZXInLCAndXBkYXRlJ10sIHRocm90dGxlKGZ1bmN0aW9uICgpIHtcbiAgICBHYXBzLmFwcGx5KENvbXBvbmVudHMuSHRtbC53cmFwcGVyLmNoaWxkcmVuKTtcbiAgfSwgMzApKTtcbiAgLyoqXG4gICAqIFJlbW92ZSBnYXBzOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcgdG8gYnJpbmcgbWFya3VwIHRvIGl0cyBpbml0YWwgc3RhdGVcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIEdhcHMucmVtb3ZlKENvbXBvbmVudHMuSHRtbC53cmFwcGVyLmNoaWxkcmVuKTtcbiAgfSk7XG4gIHJldHVybiBHYXBzO1xufVxuXG4vKipcbiAqIEZpbmRzIHNpYmxpbmdzIG5vZGVzIG9mIHRoZSBwYXNzZWQgbm9kZS5cbiAqXG4gKiBAcGFyYW0gIHtFbGVtZW50fSBub2RlXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gc2libGluZ3Mobm9kZSkge1xuICBpZiAobm9kZSAmJiBub2RlLnBhcmVudE5vZGUpIHtcbiAgICB2YXIgbiA9IG5vZGUucGFyZW50Tm9kZS5maXJzdENoaWxkO1xuICAgIHZhciBtYXRjaGVkID0gW107XG5cbiAgICBmb3IgKDsgbjsgbiA9IG4ubmV4dFNpYmxpbmcpIHtcbiAgICAgIGlmIChuLm5vZGVUeXBlID09PSAxICYmIG4gIT09IG5vZGUpIHtcbiAgICAgICAgbWF0Y2hlZC5wdXNoKG4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXRjaGVkO1xuICB9XG5cbiAgcmV0dXJuIFtdO1xufVxuLyoqXG4gKiBDaGVja3MgaWYgcGFzc2VkIG5vZGUgZXhpc3QgYW5kIGlzIGEgdmFsaWQgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0gIHtFbGVtZW50fSBub2RlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGV4aXN0KG5vZGUpIHtcbiAgaWYgKG5vZGUgJiYgbm9kZSBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MRWxlbWVudCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG52YXIgVFJBQ0tfU0VMRUNUT1IgPSAnW2RhdGEtZ2xpZGUtZWw9XCJ0cmFja1wiXSc7XG5mdW5jdGlvbiBIdG1sIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIHZhciBIdG1sID0ge1xuICAgIC8qKlxuICAgICAqIFNldHVwIHNsaWRlciBIVE1MIG5vZGVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtHbGlkZX0gZ2xpZGVcbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICB0aGlzLnJvb3QgPSBHbGlkZS5zZWxlY3RvcjtcbiAgICAgIHRoaXMudHJhY2sgPSB0aGlzLnJvb3QucXVlcnlTZWxlY3RvcihUUkFDS19TRUxFQ1RPUik7XG4gICAgICB0aGlzLmNvbGxlY3RTbGlkZXMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29sbGVjdCBzbGlkZXNcbiAgICAgKi9cbiAgICBjb2xsZWN0U2xpZGVzOiBmdW5jdGlvbiBjb2xsZWN0U2xpZGVzKCkge1xuICAgICAgdGhpcy5zbGlkZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLndyYXBwZXIuY2hpbGRyZW4pLmZpbHRlcihmdW5jdGlvbiAoc2xpZGUpIHtcbiAgICAgICAgcmV0dXJuICFzbGlkZS5jbGFzc0xpc3QuY29udGFpbnMoR2xpZGUuc2V0dGluZ3MuY2xhc3Nlcy5zbGlkZS5jbG9uZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIGRlZmluZShIdG1sLCAncm9vdCcsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIG5vZGUgb2YgdGhlIGdsaWRlIG1haW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBIdG1sLl9yO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIG5vZGUgb2YgdGhlIGdsaWRlIG1haW4gZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uIHNldChyKSB7XG4gICAgICBpZiAoaXNTdHJpbmcocikpIHtcbiAgICAgICAgciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iocik7XG4gICAgICB9XG5cbiAgICAgIGlmIChleGlzdChyKSkge1xuICAgICAgICBIdG1sLl9yID0gcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhcm4oJ1Jvb3QgZWxlbWVudCBtdXN0IGJlIGEgZXhpc3RpbmcgSHRtbCBub2RlJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKEh0bWwsICd0cmFjaycsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIG5vZGUgb2YgdGhlIGdsaWRlIHRyYWNrIHdpdGggc2xpZGVzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIEh0bWwuX3Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHMgbm9kZSBvZiB0aGUgZ2xpZGUgdHJhY2sgd2l0aCBzbGlkZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodCkge1xuICAgICAgaWYgKGV4aXN0KHQpKSB7XG4gICAgICAgIEh0bWwuX3QgPSB0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2FybihcIkNvdWxkIG5vdCBmaW5kIHRyYWNrIGVsZW1lbnQuIFBsZWFzZSB1c2UgXCIuY29uY2F0KFRSQUNLX1NFTEVDVE9SLCBcIiBhdHRyaWJ1dGUuXCIpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoSHRtbCwgJ3dyYXBwZXInLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBub2RlIG9mIHRoZSBzbGlkZXMgd3JhcHBlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBIdG1sLnRyYWNrLmNoaWxkcmVuWzBdO1xuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBBZGQvcmVtb3ZlL3Jlb3JkZXIgZHluYW1pYyBzbGlkZXNcbiAgICovXG5cbiAgRXZlbnRzLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgSHRtbC5jb2xsZWN0U2xpZGVzKCk7XG4gIH0pO1xuICByZXR1cm4gSHRtbDtcbn1cblxuZnVuY3Rpb24gUGVlayAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICB2YXIgUGVlayA9IHtcbiAgICAvKipcbiAgICAgKiBTZXR1cHMgaG93IG11Y2ggdG8gcGVlayBiYXNlZCBvbiBzZXR0aW5ncy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgdGhpcy52YWx1ZSA9IEdsaWRlLnNldHRpbmdzLnBlZWs7XG4gICAgfVxuICB9O1xuICBkZWZpbmUoUGVlaywgJ3ZhbHVlJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgdmFsdWUgb2YgdGhlIHBlZWsuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfE9iamVjdH1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBQZWVrLl92O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHZhbHVlIG9mIHRoZSBwZWVrLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ8T2JqZWN0fSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbiBzZXQodmFsdWUpIHtcbiAgICAgIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUuYmVmb3JlID0gdG9JbnQodmFsdWUuYmVmb3JlKTtcbiAgICAgICAgdmFsdWUuYWZ0ZXIgPSB0b0ludCh2YWx1ZS5hZnRlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHRvSW50KHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgUGVlay5fdiA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG4gIGRlZmluZShQZWVrLCAncmVkdWN0b3InLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyByZWR1Y3Rpb24gdmFsdWUgY2F1c2VkIGJ5IHBlZWsuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIHZhbHVlID0gUGVlay52YWx1ZTtcbiAgICAgIHZhciBwZXJWaWV3ID0gR2xpZGUuc2V0dGluZ3MucGVyVmlldztcblxuICAgICAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWUuYmVmb3JlIC8gcGVyVmlldyArIHZhbHVlLmFmdGVyIC8gcGVyVmlldztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlICogMiAvIHBlclZpZXc7XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIFJlY2FsY3VsYXRlIHBlZWtpbmcgc2l6ZXMgb246XG4gICAqIC0gd2hlbiByZXNpemluZyB3aW5kb3cgdG8gdXBkYXRlIHRvIHByb3BlciBwZXJjZW50c1xuICAgKi9cblxuICBFdmVudHMub24oWydyZXNpemUnLCAndXBkYXRlJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBQZWVrLm1vdW50KCk7XG4gIH0pO1xuICByZXR1cm4gUGVlaztcbn1cblxuZnVuY3Rpb24gTW92ZSAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICB2YXIgTW92ZSA9IHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIG1vdmUgY29tcG9uZW50LlxuICAgICAqXG4gICAgICogQHJldHVybnMge1ZvaWR9XG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgdGhpcy5fbyA9IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgYSBtb3ZlbWVudCB2YWx1ZSBiYXNlZCBvbiBwYXNzZWQgb2Zmc2V0IGFuZCBjdXJyZW50bHkgYWN0aXZlIGluZGV4LlxuICAgICAqXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBvZmZzZXRcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIG1ha2U6IGZ1bmN0aW9uIG1ha2UoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgb2Zmc2V0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAwO1xuICAgICAgdGhpcy5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgICBFdmVudHMuZW1pdCgnbW92ZScsIHtcbiAgICAgICAgbW92ZW1lbnQ6IHRoaXMudmFsdWVcbiAgICAgIH0pO1xuICAgICAgQ29tcG9uZW50cy5UcmFuc2l0aW9uLmFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgRXZlbnRzLmVtaXQoJ21vdmUuYWZ0ZXInLCB7XG4gICAgICAgICAgbW92ZW1lbnQ6IF90aGlzLnZhbHVlXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuICBkZWZpbmUoTW92ZSwgJ29mZnNldCcsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIGFuIG9mZnNldCB2YWx1ZSB1c2VkIHRvIG1vZGlmeSBjdXJyZW50IHRyYW5zbGF0ZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBNb3ZlLl9vO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGFuIG9mZnNldCB2YWx1ZSB1c2VkIHRvIG1vZGlmeSBjdXJyZW50IHRyYW5zbGF0ZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgTW92ZS5fbyA9ICFpc1VuZGVmaW5lZCh2YWx1ZSkgPyB0b0ludCh2YWx1ZSkgOiAwO1xuICAgIH1cbiAgfSk7XG4gIGRlZmluZShNb3ZlLCAndHJhbnNsYXRlJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgYSByYXcgbW92ZW1lbnQgdmFsdWUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gQ29tcG9uZW50cy5TaXplcy5zbGlkZVdpZHRoICogR2xpZGUuaW5kZXg7XG4gICAgfVxuICB9KTtcbiAgZGVmaW5lKE1vdmUsICd2YWx1ZScsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIGFuIGFjdHVhbCBtb3ZlbWVudCB2YWx1ZSBjb3JyZWN0ZWQgYnkgb2Zmc2V0LlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIG9mZnNldCA9IHRoaXMub2Zmc2V0O1xuICAgICAgdmFyIHRyYW5zbGF0ZSA9IHRoaXMudHJhbnNsYXRlO1xuXG4gICAgICBpZiAoQ29tcG9uZW50cy5EaXJlY3Rpb24uaXMoJ3J0bCcpKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2xhdGUgKyBvZmZzZXQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cmFuc2xhdGUgLSBvZmZzZXQ7XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIE1ha2UgbW92ZW1lbnQgdG8gcHJvcGVyIHNsaWRlIG9uOlxuICAgKiAtIGJlZm9yZSBidWlsZCwgc28gZ2xpZGUgd2lsbCBzdGFydCBhdCBgc3RhcnRBdGAgaW5kZXhcbiAgICogLSBvbiBlYWNoIHN0YW5kYXJkIHJ1biB0byBtb3ZlIHRvIG5ld2x5IGNhbGN1bGF0ZWQgaW5kZXhcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsnYnVpbGQuYmVmb3JlJywgJ3J1biddLCBmdW5jdGlvbiAoKSB7XG4gICAgTW92ZS5tYWtlKCk7XG4gIH0pO1xuICByZXR1cm4gTW92ZTtcbn1cblxuZnVuY3Rpb24gU2l6ZXMgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgdmFyIFNpemVzID0ge1xuICAgIC8qKlxuICAgICAqIFNldHVwcyBkaW1lbnNpb25zIG9mIHNsaWRlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgc2V0dXBTbGlkZXM6IGZ1bmN0aW9uIHNldHVwU2xpZGVzKCkge1xuICAgICAgdmFyIHdpZHRoID0gXCJcIi5jb25jYXQodGhpcy5zbGlkZVdpZHRoLCBcInB4XCIpO1xuICAgICAgdmFyIHNsaWRlcyA9IENvbXBvbmVudHMuSHRtbC5zbGlkZXM7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNsaWRlc1tpXS5zdHlsZS53aWR0aCA9IHdpZHRoO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXR1cHMgZGltZW5zaW9ucyBvZiBzbGlkZXMgd3JhcHBlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgc2V0dXBXcmFwcGVyOiBmdW5jdGlvbiBzZXR1cFdyYXBwZXIoKSB7XG4gICAgICBDb21wb25lbnRzLkh0bWwud3JhcHBlci5zdHlsZS53aWR0aCA9IFwiXCIuY29uY2F0KHRoaXMud3JhcHBlclNpemUsIFwicHhcIik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYXBwbGllZCBzdHlsZXMgZnJvbSBIVE1MIGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICB2YXIgc2xpZGVzID0gQ29tcG9uZW50cy5IdG1sLnNsaWRlcztcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2xpZGVzW2ldLnN0eWxlLndpZHRoID0gJyc7XG4gICAgICB9XG5cbiAgICAgIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLnN0eWxlLndpZHRoID0gJyc7XG4gICAgfVxuICB9O1xuICBkZWZpbmUoU2l6ZXMsICdsZW5ndGgnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBjb3VudCBudW1iZXIgb2YgdGhlIHNsaWRlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBDb21wb25lbnRzLkh0bWwuc2xpZGVzLmxlbmd0aDtcbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoU2l6ZXMsICd3aWR0aCcsIHtcbiAgICAvKipcbiAgICAgKiBHZXRzIHdpZHRoIHZhbHVlIG9mIHRoZSBzbGlkZXIgKHZpc2libGUgYXJlYSkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gQ29tcG9uZW50cy5IdG1sLnRyYWNrLm9mZnNldFdpZHRoO1xuICAgIH1cbiAgfSk7XG4gIGRlZmluZShTaXplcywgJ3dyYXBwZXJTaXplJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgc2l6ZSBvZiB0aGUgc2xpZGVzIHdyYXBwZXIuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gU2l6ZXMuc2xpZGVXaWR0aCAqIFNpemVzLmxlbmd0aCArIENvbXBvbmVudHMuR2Fwcy5ncm93ICsgQ29tcG9uZW50cy5DbG9uZXMuZ3JvdztcbiAgICB9XG4gIH0pO1xuICBkZWZpbmUoU2l6ZXMsICdzbGlkZVdpZHRoJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgd2lkdGggdmFsdWUgb2YgYSBzaW5nbGUgc2xpZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gU2l6ZXMud2lkdGggLyBHbGlkZS5zZXR0aW5ncy5wZXJWaWV3IC0gQ29tcG9uZW50cy5QZWVrLnJlZHVjdG9yIC0gQ29tcG9uZW50cy5HYXBzLnJlZHVjdG9yO1xuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBBcHBseSBjYWxjdWxhdGVkIGdsaWRlJ3MgZGltZW5zaW9uczpcbiAgICogLSBiZWZvcmUgYnVpbGRpbmcsIHNvIG90aGVyIGRpbWVuc2lvbnMgKGUuZy4gdHJhbnNsYXRlKSB3aWxsIGJlIGNhbGN1bGF0ZWQgcHJvcGVydGx5XG4gICAqIC0gd2hlbiByZXNpemluZyB3aW5kb3cgdG8gcmVjYWxjdWxhdGUgc2lsZGVzIGRpbWVuc2lvbnNcbiAgICogLSBvbiB1cGRhdGluZyB2aWEgQVBJLCB0byBjYWxjdWxhdGUgZGltZW5zaW9ucyBiYXNlZCBvbiBuZXcgb3B0aW9uc1xuICAgKi9cblxuICBFdmVudHMub24oWydidWlsZC5iZWZvcmUnLCAncmVzaXplJywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgU2l6ZXMuc2V0dXBTbGlkZXMoKTtcbiAgICBTaXplcy5zZXR1cFdyYXBwZXIoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBSZW1vdmUgY2FsY3VsYXRlZCBnbGlkZSdzIGRpbWVuc2lvbnM6XG4gICAqIC0gb24gZGVzdG90aW5nIHRvIGJyaW5nIG1hcmt1cCB0byBpdHMgaW5pdGFsIHN0YXRlXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBTaXplcy5yZW1vdmUoKTtcbiAgfSk7XG4gIHJldHVybiBTaXplcztcbn1cblxuZnVuY3Rpb24gQnVpbGQgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgdmFyIEJ1aWxkID0ge1xuICAgIC8qKlxuICAgICAqIEluaXQgZ2xpZGUgYnVpbGRpbmcuIEFkZHMgY2xhc3Nlcywgc2V0c1xuICAgICAqIGRpbWVuc2lvbnMgYW5kIHNldHVwcyBpbml0aWFsIHN0YXRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICBFdmVudHMuZW1pdCgnYnVpbGQuYmVmb3JlJyk7XG4gICAgICB0aGlzLnR5cGVDbGFzcygpO1xuICAgICAgdGhpcy5hY3RpdmVDbGFzcygpO1xuICAgICAgRXZlbnRzLmVtaXQoJ2J1aWxkLmFmdGVyJyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYHR5cGVgIGNsYXNzIHRvIHRoZSBnbGlkZSBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICB0eXBlQ2xhc3M6IGZ1bmN0aW9uIHR5cGVDbGFzcygpIHtcbiAgICAgIENvbXBvbmVudHMuSHRtbC5yb290LmNsYXNzTGlzdC5hZGQoR2xpZGUuc2V0dGluZ3MuY2xhc3Nlcy50eXBlW0dsaWRlLnNldHRpbmdzLnR5cGVdKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyBhY3RpdmUgY2xhc3MgdG8gY3VycmVudCBzbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYWN0aXZlQ2xhc3M6IGZ1bmN0aW9uIGFjdGl2ZUNsYXNzKCkge1xuICAgICAgdmFyIGNsYXNzZXMgPSBHbGlkZS5zZXR0aW5ncy5jbGFzc2VzO1xuICAgICAgdmFyIHNsaWRlID0gQ29tcG9uZW50cy5IdG1sLnNsaWRlc1tHbGlkZS5pbmRleF07XG5cbiAgICAgIGlmIChzbGlkZSkge1xuICAgICAgICBzbGlkZS5jbGFzc0xpc3QuYWRkKGNsYXNzZXMuc2xpZGUuYWN0aXZlKTtcbiAgICAgICAgc2libGluZ3Moc2xpZGUpLmZvckVhY2goZnVuY3Rpb24gKHNpYmxpbmcpIHtcbiAgICAgICAgICBzaWJsaW5nLmNsYXNzTGlzdC5yZW1vdmUoY2xhc3Nlcy5zbGlkZS5hY3RpdmUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBIVE1MIGNsYXNzZXMgYXBwbGllZCBhdCBidWlsZGluZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlQ2xhc3NlczogZnVuY3Rpb24gcmVtb3ZlQ2xhc3NlcygpIHtcbiAgICAgIHZhciBfR2xpZGUkc2V0dGluZ3MkY2xhc3MgPSBHbGlkZS5zZXR0aW5ncy5jbGFzc2VzLFxuICAgICAgICAgIHR5cGUgPSBfR2xpZGUkc2V0dGluZ3MkY2xhc3MudHlwZSxcbiAgICAgICAgICBzbGlkZSA9IF9HbGlkZSRzZXR0aW5ncyRjbGFzcy5zbGlkZTtcbiAgICAgIENvbXBvbmVudHMuSHRtbC5yb290LmNsYXNzTGlzdC5yZW1vdmUodHlwZVtHbGlkZS5zZXR0aW5ncy50eXBlXSk7XG4gICAgICBDb21wb25lbnRzLkh0bWwuc2xpZGVzLmZvckVhY2goZnVuY3Rpb24gKHNpYmxpbmcpIHtcbiAgICAgICAgc2libGluZy5jbGFzc0xpc3QucmVtb3ZlKHNsaWRlLmFjdGl2ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBDbGVhciBidWlsZGluZyBjbGFzc2VzOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcgdG8gYnJpbmcgSFRNTCB0byBpdHMgaW5pdGlhbCBzdGF0ZVxuICAgKiAtIG9uIHVwZGF0aW5nIHRvIHJlbW92ZSBjbGFzc2VzIGJlZm9yZSByZW1vdW50aW5nIGNvbXBvbmVudFxuICAgKi9cblxuICBFdmVudHMub24oWydkZXN0cm95JywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgQnVpbGQucmVtb3ZlQ2xhc3NlcygpO1xuICB9KTtcbiAgLyoqXG4gICAqIFJlbW91bnQgY29tcG9uZW50OlxuICAgKiAtIG9uIHJlc2l6aW5nIG9mIHRoZSB3aW5kb3cgdG8gY2FsY3VsYXRlIG5ldyBkaW1lbnNpb25zXG4gICAqIC0gb24gdXBkYXRpbmcgc2V0dGluZ3MgdmlhIEFQSVxuICAgKi9cblxuICBFdmVudHMub24oWydyZXNpemUnLCAndXBkYXRlJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBCdWlsZC5tb3VudCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIFN3YXAgYWN0aXZlIGNsYXNzIG9mIGN1cnJlbnQgc2xpZGU6XG4gICAqIC0gYWZ0ZXIgZWFjaCBtb3ZlIHRvIHRoZSBuZXcgaW5kZXhcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdtb3ZlLmFmdGVyJywgZnVuY3Rpb24gKCkge1xuICAgIEJ1aWxkLmFjdGl2ZUNsYXNzKCk7XG4gIH0pO1xuICByZXR1cm4gQnVpbGQ7XG59XG5cbmZ1bmN0aW9uIENsb25lcyAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICB2YXIgQ2xvbmVzID0ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBwYXR0ZXJuIG1hcCBhbmQgY29sbGVjdCBzbGlkZXMgdG8gYmUgY2xvbmVkLlxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIHRoaXMuaXRlbXMgPSBbXTtcblxuICAgICAgaWYgKEdsaWRlLmlzVHlwZSgnY2Fyb3VzZWwnKSkge1xuICAgICAgICB0aGlzLml0ZW1zID0gdGhpcy5jb2xsZWN0KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENvbGxlY3QgY2xvbmVzIHdpdGggcGF0dGVybi5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1tdfVxuICAgICAqL1xuICAgIGNvbGxlY3Q6IGZ1bmN0aW9uIGNvbGxlY3QoKSB7XG4gICAgICB2YXIgaXRlbXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IFtdO1xuICAgICAgdmFyIHNsaWRlcyA9IENvbXBvbmVudHMuSHRtbC5zbGlkZXM7XG4gICAgICB2YXIgX0dsaWRlJHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3MsXG4gICAgICAgICAgcGVyVmlldyA9IF9HbGlkZSRzZXR0aW5ncy5wZXJWaWV3LFxuICAgICAgICAgIGNsYXNzZXMgPSBfR2xpZGUkc2V0dGluZ3MuY2xhc3NlcyxcbiAgICAgICAgICBjbG9uaW5nUmF0aW8gPSBfR2xpZGUkc2V0dGluZ3MuY2xvbmluZ1JhdGlvO1xuXG4gICAgICBpZiAoc2xpZGVzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICB2YXIgcGVla0luY3JlbWVudGVyID0gKyEhR2xpZGUuc2V0dGluZ3MucGVlaztcbiAgICAgICAgdmFyIGNsb25lQ291bnQgPSBwZXJWaWV3ICsgcGVla0luY3JlbWVudGVyICsgTWF0aC5yb3VuZChwZXJWaWV3IC8gMik7XG4gICAgICAgIHZhciBhcHBlbmQgPSBzbGlkZXMuc2xpY2UoMCwgY2xvbmVDb3VudCkucmV2ZXJzZSgpO1xuICAgICAgICB2YXIgcHJlcGVuZCA9IHNsaWRlcy5zbGljZShjbG9uZUNvdW50ICogLTEpO1xuXG4gICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgTWF0aC5tYXgoY2xvbmluZ1JhdGlvLCBNYXRoLmZsb29yKHBlclZpZXcgLyBzbGlkZXMubGVuZ3RoKSk7IHIrKykge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXBwZW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2xvbmUgPSBhcHBlbmRbaV0uY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICAgICAgY2xvbmUuY2xhc3NMaXN0LmFkZChjbGFzc2VzLnNsaWRlLmNsb25lKTtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2goY2xvbmUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBwcmVwZW5kLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIF9jbG9uZSA9IHByZXBlbmRbX2ldLmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICAgICAgX2Nsb25lLmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5zbGlkZS5jbG9uZSk7XG5cbiAgICAgICAgICAgIGl0ZW1zLnVuc2hpZnQoX2Nsb25lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGl0ZW1zO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBcHBlbmQgY2xvbmVkIHNsaWRlcyB3aXRoIGdlbmVyYXRlZCBwYXR0ZXJuLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBhcHBlbmQ6IGZ1bmN0aW9uIGFwcGVuZCgpIHtcbiAgICAgIHZhciBpdGVtcyA9IHRoaXMuaXRlbXM7XG4gICAgICB2YXIgX0NvbXBvbmVudHMkSHRtbCA9IENvbXBvbmVudHMuSHRtbCxcbiAgICAgICAgICB3cmFwcGVyID0gX0NvbXBvbmVudHMkSHRtbC53cmFwcGVyLFxuICAgICAgICAgIHNsaWRlcyA9IF9Db21wb25lbnRzJEh0bWwuc2xpZGVzO1xuICAgICAgdmFyIGhhbGYgPSBNYXRoLmZsb29yKGl0ZW1zLmxlbmd0aCAvIDIpO1xuICAgICAgdmFyIHByZXBlbmQgPSBpdGVtcy5zbGljZSgwLCBoYWxmKS5yZXZlcnNlKCk7XG4gICAgICB2YXIgYXBwZW5kID0gaXRlbXMuc2xpY2UoaGFsZiAqIC0xKS5yZXZlcnNlKCk7XG4gICAgICB2YXIgd2lkdGggPSBcIlwiLmNvbmNhdChDb21wb25lbnRzLlNpemVzLnNsaWRlV2lkdGgsIFwicHhcIik7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXBwZW5kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQoYXBwZW5kW2ldKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgX2kyID0gMDsgX2kyIDwgcHJlcGVuZC5sZW5ndGg7IF9pMisrKSB7XG4gICAgICAgIHdyYXBwZXIuaW5zZXJ0QmVmb3JlKHByZXBlbmRbX2kyXSwgc2xpZGVzWzBdKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgX2kzID0gMDsgX2kzIDwgaXRlbXMubGVuZ3RoOyBfaTMrKykge1xuICAgICAgICBpdGVtc1tfaTNdLnN0eWxlLndpZHRoID0gd2lkdGg7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbGwgY2xvbmVkIHNsaWRlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICB2YXIgaXRlbXMgPSB0aGlzLml0ZW1zO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLnJlbW92ZUNoaWxkKGl0ZW1zW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGRlZmluZShDbG9uZXMsICdncm93Jywge1xuICAgIC8qKlxuICAgICAqIEdldHMgYWRkaXRpb25hbCBkaW1lbnNpb25zIHZhbHVlIGNhdXNlZCBieSBjbG9uZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gKENvbXBvbmVudHMuU2l6ZXMuc2xpZGVXaWR0aCArIENvbXBvbmVudHMuR2Fwcy52YWx1ZSkgKiBDbG9uZXMuaXRlbXMubGVuZ3RoO1xuICAgIH1cbiAgfSk7XG4gIC8qKlxuICAgKiBBcHBlbmQgYWRkaXRpb25hbCBzbGlkZSdzIGNsb25lczpcbiAgICogLSB3aGlsZSBnbGlkZSdzIHR5cGUgaXMgYGNhcm91c2VsYFxuICAgKi9cblxuICBFdmVudHMub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBDbG9uZXMucmVtb3ZlKCk7XG4gICAgQ2xvbmVzLm1vdW50KCk7XG4gICAgQ2xvbmVzLmFwcGVuZCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIEFwcGVuZCBhZGRpdGlvbmFsIHNsaWRlJ3MgY2xvbmVzOlxuICAgKiAtIHdoaWxlIGdsaWRlJ3MgdHlwZSBpcyBgY2Fyb3VzZWxgXG4gICAqL1xuXG4gIEV2ZW50cy5vbignYnVpbGQuYmVmb3JlJywgZnVuY3Rpb24gKCkge1xuICAgIGlmIChHbGlkZS5pc1R5cGUoJ2Nhcm91c2VsJykpIHtcbiAgICAgIENsb25lcy5hcHBlbmQoKTtcbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogUmVtb3ZlIGNsb25lcyBIVE1MRWxlbWVudHM6XG4gICAqIC0gb24gZGVzdHJveWluZywgdG8gYnJpbmcgSFRNTCB0byBpdHMgaW5pdGlhbCBzdGF0ZVxuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgQ2xvbmVzLnJlbW92ZSgpO1xuICB9KTtcbiAgcmV0dXJuIENsb25lcztcbn1cblxudmFyIEV2ZW50c0JpbmRlciA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBFdmVudHNCaW5kZXIgaW5zdGFuY2UuXG4gICAqL1xuICBmdW5jdGlvbiBFdmVudHNCaW5kZXIoKSB7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRXZlbnRzQmluZGVyKTtcblxuICAgIHRoaXMubGlzdGVuZXJzID0gbGlzdGVuZXJzO1xuICB9XG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50cyBsaXN0ZW5lcnMgdG8gYXJyb3dzIEhUTUwgZWxlbWVudHMuXG4gICAqXG4gICAqIEBwYXJhbSAge1N0cmluZ3xBcnJheX0gZXZlbnRzXG4gICAqIEBwYXJhbSAge0VsZW1lbnR8V2luZG93fERvY3VtZW50fSBlbFxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2xvc3VyZVxuICAgKiBAcGFyYW0gIHtCb29sZWFufE9iamVjdH0gY2FwdHVyZVxuICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgKi9cblxuXG4gIF9jcmVhdGVDbGFzcyhFdmVudHNCaW5kZXIsIFt7XG4gICAga2V5OiBcIm9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uKGV2ZW50cywgZWwsIGNsb3N1cmUpIHtcbiAgICAgIHZhciBjYXB0dXJlID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBmYWxzZTtcblxuICAgICAgaWYgKGlzU3RyaW5nKGV2ZW50cykpIHtcbiAgICAgICAgZXZlbnRzID0gW2V2ZW50c107XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50c1tpXV0gPSBjbG9zdXJlO1xuICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50c1tpXSwgdGhpcy5saXN0ZW5lcnNbZXZlbnRzW2ldXSwgY2FwdHVyZSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgZXZlbnQgbGlzdGVuZXJzIGZyb20gYXJyb3dzIEhUTUwgZWxlbWVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd8QXJyYXl9IGV2ZW50c1xuICAgICAqIEBwYXJhbSAge0VsZW1lbnR8V2luZG93fERvY3VtZW50fSBlbFxuICAgICAqIEBwYXJhbSAge0Jvb2xlYW58T2JqZWN0fSBjYXB0dXJlXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIm9mZlwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvZmYoZXZlbnRzLCBlbCkge1xuICAgICAgdmFyIGNhcHR1cmUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xuXG4gICAgICBpZiAoaXNTdHJpbmcoZXZlbnRzKSkge1xuICAgICAgICBldmVudHMgPSBbZXZlbnRzXTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudHNbaV0sIHRoaXMubGlzdGVuZXJzW2V2ZW50c1tpXV0sIGNhcHR1cmUpO1xuICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZXN0cm95IGNvbGxlY3RlZCBsaXN0ZW5lcnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Vm9pZH1cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImRlc3Ryb3lcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLmxpc3RlbmVycztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gRXZlbnRzQmluZGVyO1xufSgpO1xuXG5mdW5jdGlvbiBSZXNpemUgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgLyoqXG4gICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAqXG4gICAqIEB0eXBlIHtFdmVudHNCaW5kZXJ9XG4gICAqL1xuICB2YXIgQmluZGVyID0gbmV3IEV2ZW50c0JpbmRlcigpO1xuICB2YXIgUmVzaXplID0ge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHdpbmRvdyBiaW5kaW5ncy5cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICB0aGlzLmJpbmQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZHMgYHJlenNpemVgIGxpc3RlbmVyIHRvIHRoZSB3aW5kb3cuXG4gICAgICogSXQncyBhIGNvc3RseSBldmVudCwgc28gd2UgYXJlIGRlYm91bmNpbmcgaXQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgICBCaW5kZXIub24oJ3Jlc2l6ZScsIHdpbmRvdywgdGhyb3R0bGUoZnVuY3Rpb24gKCkge1xuICAgICAgICBFdmVudHMuZW1pdCgncmVzaXplJyk7XG4gICAgICB9LCBHbGlkZS5zZXR0aW5ncy50aHJvdHRsZSkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmRzIGxpc3RlbmVycyBmcm9tIHRoZSB3aW5kb3cuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgICAgQmluZGVyLm9mZigncmVzaXplJywgd2luZG93KTtcbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBSZW1vdmUgYmluZGluZ3MgZnJvbSB3aW5kb3c6XG4gICAqIC0gb24gZGVzdHJveWluZywgdG8gcmVtb3ZlIGFkZGVkIEV2ZW50TGlzdGVuZXJcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIFJlc2l6ZS51bmJpbmQoKTtcbiAgICBCaW5kZXIuZGVzdHJveSgpO1xuICB9KTtcbiAgcmV0dXJuIFJlc2l6ZTtcbn1cblxudmFyIFZBTElEX0RJUkVDVElPTlMgPSBbJ2x0cicsICdydGwnXTtcbnZhciBGTElQRURfTU9WRU1FTlRTID0ge1xuICAnPic6ICc8JyxcbiAgJzwnOiAnPicsXG4gICc9JzogJz0nXG59O1xuZnVuY3Rpb24gRGlyZWN0aW9uIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIHZhciBEaXJlY3Rpb24gPSB7XG4gICAgLyoqXG4gICAgICogU2V0dXBzIGdhcCB2YWx1ZSBiYXNlZCBvbiBzZXR0aW5ncy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgdGhpcy52YWx1ZSA9IEdsaWRlLnNldHRpbmdzLmRpcmVjdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzb2x2ZXMgcGF0dGVybiBiYXNlZCBvbiBkaXJlY3Rpb24gdmFsdWVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBwYXR0ZXJuXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICByZXNvbHZlOiBmdW5jdGlvbiByZXNvbHZlKHBhdHRlcm4pIHtcbiAgICAgIHZhciB0b2tlbiA9IHBhdHRlcm4uc2xpY2UoMCwgMSk7XG5cbiAgICAgIGlmICh0aGlzLmlzKCdydGwnKSkge1xuICAgICAgICByZXR1cm4gcGF0dGVybi5zcGxpdCh0b2tlbikuam9pbihGTElQRURfTU9WRU1FTlRTW3Rva2VuXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXR0ZXJuO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgdmFsdWUgb2YgZGlyZWN0aW9uIG1vZGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZGlyZWN0aW9uXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXM6IGZ1bmN0aW9uIGlzKGRpcmVjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUgPT09IGRpcmVjdGlvbjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXBwbGllcyBkaXJlY3Rpb24gY2xhc3MgdG8gdGhlIHJvb3QgSFRNTCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBhZGRDbGFzczogZnVuY3Rpb24gYWRkQ2xhc3MoKSB7XG4gICAgICBDb21wb25lbnRzLkh0bWwucm9vdC5jbGFzc0xpc3QuYWRkKEdsaWRlLnNldHRpbmdzLmNsYXNzZXMuZGlyZWN0aW9uW3RoaXMudmFsdWVdKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBkaXJlY3Rpb24gY2xhc3MgZnJvbSB0aGUgcm9vdCBIVE1MIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbiByZW1vdmVDbGFzcygpIHtcbiAgICAgIENvbXBvbmVudHMuSHRtbC5yb290LmNsYXNzTGlzdC5yZW1vdmUoR2xpZGUuc2V0dGluZ3MuY2xhc3Nlcy5kaXJlY3Rpb25bdGhpcy52YWx1ZV0pO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lKERpcmVjdGlvbiwgJ3ZhbHVlJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgdmFsdWUgb2YgdGhlIGRpcmVjdGlvbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gRGlyZWN0aW9uLl92O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHZhbHVlIG9mIHRoZSBkaXJlY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHNldDogZnVuY3Rpb24gc2V0KHZhbHVlKSB7XG4gICAgICBpZiAoVkFMSURfRElSRUNUSU9OUy5pbmRleE9mKHZhbHVlKSA+IC0xKSB7XG4gICAgICAgIERpcmVjdGlvbi5fdiA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2FybignRGlyZWN0aW9uIHZhbHVlIG11c3QgYmUgYGx0cmAgb3IgYHJ0bGAnKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogQ2xlYXIgZGlyZWN0aW9uIGNsYXNzOlxuICAgKiAtIG9uIGRlc3Ryb3kgdG8gYnJpbmcgSFRNTCB0byBpdHMgaW5pdGlhbCBzdGF0ZVxuICAgKiAtIG9uIHVwZGF0ZSB0byByZW1vdmUgY2xhc3MgYmVmb3JlIHJlYXBwbGluZyBiZWxsb3dcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsnZGVzdHJveScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgIERpcmVjdGlvbi5yZW1vdmVDbGFzcygpO1xuICB9KTtcbiAgLyoqXG4gICAqIFJlbW91bnQgY29tcG9uZW50OlxuICAgKiAtIG9uIHVwZGF0ZSB0byByZWZsZWN0IGNoYW5nZXMgaW4gZGlyZWN0aW9uIHZhbHVlXG4gICAqL1xuXG4gIEV2ZW50cy5vbigndXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgIERpcmVjdGlvbi5tb3VudCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIEFwcGx5IGRpcmVjdGlvbiBjbGFzczpcbiAgICogLSBiZWZvcmUgYnVpbGRpbmcgdG8gYXBwbHkgY2xhc3MgZm9yIHRoZSBmaXJzdCB0aW1lXG4gICAqIC0gb24gdXBkYXRpbmcgdG8gcmVhcHBseSBkaXJlY3Rpb24gY2xhc3MgdGhhdCBtYXkgY2hhbmdlZFxuICAgKi9cblxuICBFdmVudHMub24oWydidWlsZC5iZWZvcmUnLCAndXBkYXRlJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBEaXJlY3Rpb24uYWRkQ2xhc3MoKTtcbiAgfSk7XG4gIHJldHVybiBEaXJlY3Rpb247XG59XG5cbi8qKlxuICogUmVmbGVjdHMgdmFsdWUgb2YgZ2xpZGUgbW92ZW1lbnQuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBHbGlkZVxuICogQHBhcmFtICB7T2JqZWN0fSBDb21wb25lbnRzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIFJ0bCAoR2xpZGUsIENvbXBvbmVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBOZWdhdGVzIHRoZSBwYXNzZWQgdHJhbnNsYXRlIGlmIGdsaWRlIGlzIGluIFJUTCBvcHRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRyYW5zbGF0ZVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBtb2RpZnk6IGZ1bmN0aW9uIG1vZGlmeSh0cmFuc2xhdGUpIHtcbiAgICAgIGlmIChDb21wb25lbnRzLkRpcmVjdGlvbi5pcygncnRsJykpIHtcbiAgICAgICAgcmV0dXJuIC10cmFuc2xhdGU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cmFuc2xhdGU7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZXMgZ2xpZGUgbW92ZW1lbnQgd2l0aCBhIGBnYXBgIHNldHRpbmdzLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gR2xpZGVcbiAqIEBwYXJhbSAge09iamVjdH0gQ29tcG9uZW50c1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBHYXAgKEdsaWRlLCBDb21wb25lbnRzKSB7XG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogTW9kaWZpZXMgcGFzc2VkIHRyYW5zbGF0ZSB2YWx1ZSB3aXRoIG51bWJlciBpbiB0aGUgYGdhcGAgc2V0dGluZ3MuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRyYW5zbGF0ZVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBtb2RpZnk6IGZ1bmN0aW9uIG1vZGlmeSh0cmFuc2xhdGUpIHtcbiAgICAgIHZhciBtdWx0aXBsaWVyID0gTWF0aC5mbG9vcih0cmFuc2xhdGUgLyBDb21wb25lbnRzLlNpemVzLnNsaWRlV2lkdGgpO1xuICAgICAgcmV0dXJuIHRyYW5zbGF0ZSArIENvbXBvbmVudHMuR2Fwcy52YWx1ZSAqIG11bHRpcGxpZXI7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFVwZGF0ZXMgZ2xpZGUgbW92ZW1lbnQgd2l0aCB3aWR0aCBvZiBhZGRpdGlvbmFsIGNsb25lcyB3aWR0aC5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IEdsaWRlXG4gKiBAcGFyYW0gIHtPYmplY3R9IENvbXBvbmVudHNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gR3JvdyAoR2xpZGUsIENvbXBvbmVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBBZGRzIHRvIHRoZSBwYXNzZWQgdHJhbnNsYXRlIHdpZHRoIG9mIHRoZSBoYWxmIG9mIGNsb25lcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gdHJhbnNsYXRlXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIG1vZGlmeTogZnVuY3Rpb24gbW9kaWZ5KHRyYW5zbGF0ZSkge1xuICAgICAgcmV0dXJuIHRyYW5zbGF0ZSArIENvbXBvbmVudHMuQ2xvbmVzLmdyb3cgLyAyO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGdsaWRlIG1vdmVtZW50IHdpdGggYSBgcGVla2Agc2V0dGluZ3MuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBHbGlkZVxuICogQHBhcmFtICB7T2JqZWN0fSBDb21wb25lbnRzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gUGVla2luZyAoR2xpZGUsIENvbXBvbmVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBNb2RpZmllcyBwYXNzZWQgdHJhbnNsYXRlIHZhbHVlIHdpdGggYSBgcGVla2Agc2V0dGluZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gdHJhbnNsYXRlXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIG1vZGlmeTogZnVuY3Rpb24gbW9kaWZ5KHRyYW5zbGF0ZSkge1xuICAgICAgaWYgKEdsaWRlLnNldHRpbmdzLmZvY3VzQXQgPj0gMCkge1xuICAgICAgICB2YXIgcGVlayA9IENvbXBvbmVudHMuUGVlay52YWx1ZTtcblxuICAgICAgICBpZiAoaXNPYmplY3QocGVlaykpIHtcbiAgICAgICAgICByZXR1cm4gdHJhbnNsYXRlIC0gcGVlay5iZWZvcmU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJhbnNsYXRlIC0gcGVlaztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRyYW5zbGF0ZTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogVXBkYXRlcyBnbGlkZSBtb3ZlbWVudCB3aXRoIGEgYGZvY3VzQXRgIHNldHRpbmdzLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gR2xpZGVcbiAqIEBwYXJhbSAge09iamVjdH0gQ29tcG9uZW50c1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBGb2N1c2luZyAoR2xpZGUsIENvbXBvbmVudHMpIHtcbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBNb2RpZmllcyBwYXNzZWQgdHJhbnNsYXRlIHZhbHVlIHdpdGggaW5kZXggaW4gdGhlIGBmb2N1c0F0YCBzZXR0aW5nLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSB0cmFuc2xhdGVcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgbW9kaWZ5OiBmdW5jdGlvbiBtb2RpZnkodHJhbnNsYXRlKSB7XG4gICAgICB2YXIgZ2FwID0gQ29tcG9uZW50cy5HYXBzLnZhbHVlO1xuICAgICAgdmFyIHdpZHRoID0gQ29tcG9uZW50cy5TaXplcy53aWR0aDtcbiAgICAgIHZhciBmb2N1c0F0ID0gR2xpZGUuc2V0dGluZ3MuZm9jdXNBdDtcbiAgICAgIHZhciBzbGlkZVdpZHRoID0gQ29tcG9uZW50cy5TaXplcy5zbGlkZVdpZHRoO1xuXG4gICAgICBpZiAoZm9jdXNBdCA9PT0gJ2NlbnRlcicpIHtcbiAgICAgICAgcmV0dXJuIHRyYW5zbGF0ZSAtICh3aWR0aCAvIDIgLSBzbGlkZVdpZHRoIC8gMik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cmFuc2xhdGUgLSBzbGlkZVdpZHRoICogZm9jdXNBdCAtIGdhcCAqIGZvY3VzQXQ7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIEFwcGxpZXMgZGlmZnJlbnQgdHJhbnNmb3JtZXJzIG9uIHRyYW5zbGF0ZSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IEdsaWRlXG4gKiBAcGFyYW0gIHtPYmplY3R9IENvbXBvbmVudHNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBtdXRhdG9yIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIC8qKlxuICAgKiBNZXJnZSBpbnN0YW5jZSB0cmFuc2Zvcm1lcnMgd2l0aCBjb2xsZWN0aW9uIG9mIGRlZmF1bHQgdHJhbnNmb3JtZXJzLlxuICAgKiBJdCdzIGltcG9ydGFudCB0aGF0IHRoZSBSdGwgY29tcG9uZW50IGJlIGxhc3Qgb24gdGhlIGxpc3QsXG4gICAqIHNvIGl0IHJlZmxlY3RzIGFsbCBwcmV2aW91cyB0cmFuc2Zvcm1hdGlvbnMuXG4gICAqXG4gICAqIEB0eXBlIHtBcnJheX1cbiAgICovXG4gIHZhciBUUkFOU0ZPUk1FUlMgPSBbR2FwLCBHcm93LCBQZWVraW5nLCBGb2N1c2luZ10uY29uY2F0KEdsaWRlLl90LCBbUnRsXSk7XG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogUGlwbGluZXMgdHJhbnNsYXRlIHZhbHVlIHdpdGggcmVnaXN0ZXJlZCB0cmFuc2Zvcm1lcnMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRyYW5zbGF0ZVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICBtdXRhdGU6IGZ1bmN0aW9uIG11dGF0ZSh0cmFuc2xhdGUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgVFJBTlNGT1JNRVJTLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciB0cmFuc2Zvcm1lciA9IFRSQU5TRk9STUVSU1tpXTtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbih0cmFuc2Zvcm1lcikgJiYgaXNGdW5jdGlvbih0cmFuc2Zvcm1lcigpLm1vZGlmeSkpIHtcbiAgICAgICAgICB0cmFuc2xhdGUgPSB0cmFuc2Zvcm1lcihHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKS5tb2RpZnkodHJhbnNsYXRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3YXJuKCdUcmFuc2Zvcm1lciBzaG91bGQgYmUgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gb2JqZWN0IHdpdGggYG1vZGlmeSgpYCBtZXRob2QnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJhbnNsYXRlO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gVHJhbnNsYXRlIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIHZhciBUcmFuc2xhdGUgPSB7XG4gICAgLyoqXG4gICAgICogU2V0cyB2YWx1ZSBvZiB0cmFuc2xhdGUgb24gSFRNTCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSkge1xuICAgICAgdmFyIHRyYW5zZm9ybSA9IG11dGF0b3IoR2xpZGUsIENvbXBvbmVudHMpLm11dGF0ZSh2YWx1ZSk7XG4gICAgICB2YXIgdHJhbnNsYXRlM2QgPSBcInRyYW5zbGF0ZTNkKFwiLmNvbmNhdCgtMSAqIHRyYW5zZm9ybSwgXCJweCwgMHB4LCAwcHgpXCIpO1xuICAgICAgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuc3R5bGUubW96VHJhbnNmb3JtID0gdHJhbnNsYXRlM2Q7IC8vIG5lZWRlZCBmb3Igc3VwcG9ydGVkIEZpcmVmb3ggMTAtMTVcblxuICAgICAgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gdHJhbnNsYXRlM2Q7IC8vIG5lZWRlZCBmb3Igc3VwcG9ydGVkIENocm9tZSAxMC0zNSwgU2FmYXJpIDUuMS04LCBhbmQgT3BlcmEgMTUtMjJcblxuICAgICAgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuc3R5bGUudHJhbnNmb3JtID0gdHJhbnNsYXRlM2Q7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdmFsdWUgb2YgdHJhbnNsYXRlIGZyb20gSFRNTCBlbGVtZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0U3RhcnRJbmRleDogZnVuY3Rpb24gZ2V0U3RhcnRJbmRleCgpIHtcbiAgICAgIHZhciBsZW5ndGggPSBDb21wb25lbnRzLlNpemVzLmxlbmd0aDtcbiAgICAgIHZhciBpbmRleCA9IEdsaWRlLmluZGV4O1xuICAgICAgdmFyIHBlclZpZXcgPSBHbGlkZS5zZXR0aW5ncy5wZXJWaWV3O1xuXG4gICAgICBpZiAoQ29tcG9uZW50cy5SdW4uaXNPZmZzZXQoJz4nKSB8fCBDb21wb25lbnRzLlJ1bi5pc09mZnNldCgnfD4nKSkge1xuICAgICAgICByZXR1cm4gbGVuZ3RoICsgKGluZGV4IC0gcGVyVmlldyk7XG4gICAgICB9IC8vIFwibW9kdWxvIGxlbmd0aFwiIGNvbnZlcnRzIGFuIGluZGV4IHRoYXQgZXF1YWxzIGxlbmd0aCB0byB6ZXJvXG5cblxuICAgICAgcmV0dXJuIChpbmRleCArIHBlclZpZXcpICUgbGVuZ3RoO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0VHJhdmVsRGlzdGFuY2U6IGZ1bmN0aW9uIGdldFRyYXZlbERpc3RhbmNlKCkge1xuICAgICAgdmFyIHRyYXZlbERpc3RhbmNlID0gQ29tcG9uZW50cy5TaXplcy5zbGlkZVdpZHRoICogR2xpZGUuc2V0dGluZ3MucGVyVmlldztcblxuICAgICAgaWYgKENvbXBvbmVudHMuUnVuLmlzT2Zmc2V0KCc+JykgfHwgQ29tcG9uZW50cy5SdW4uaXNPZmZzZXQoJ3w+JykpIHtcbiAgICAgICAgLy8gcmV2ZXJzZSB0cmF2ZWwgZGlzdGFuY2Ugc28gdGhhdCB3ZSBkb24ndCBoYXZlIHRvIGNoYW5nZSBzdWJ0cmFjdCBvcGVyYXRpb25zXG4gICAgICAgIHJldHVybiB0cmF2ZWxEaXN0YW5jZSAqIC0xO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJhdmVsRGlzdGFuY2U7XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogU2V0IG5ldyB0cmFuc2xhdGUgdmFsdWU6XG4gICAqIC0gb24gbW92ZSB0byByZWZsZWN0IGluZGV4IGNoYW5nZVxuICAgKiAtIG9uIHVwZGF0aW5nIHZpYSBBUEkgdG8gcmVmbGVjdCBwb3NzaWJsZSBjaGFuZ2VzIGluIG9wdGlvbnNcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdtb3ZlJywgZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgICBpZiAoIUdsaWRlLmlzVHlwZSgnY2Fyb3VzZWwnKSB8fCAhQ29tcG9uZW50cy5SdW4uaXNPZmZzZXQoKSkge1xuICAgICAgcmV0dXJuIFRyYW5zbGF0ZS5zZXQoY29udGV4dC5tb3ZlbWVudCk7XG4gICAgfVxuXG4gICAgQ29tcG9uZW50cy5UcmFuc2l0aW9uLmFmdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIEV2ZW50cy5lbWl0KCd0cmFuc2xhdGUuanVtcCcpO1xuICAgICAgVHJhbnNsYXRlLnNldChDb21wb25lbnRzLlNpemVzLnNsaWRlV2lkdGggKiBHbGlkZS5pbmRleCk7XG4gICAgfSk7XG4gICAgdmFyIHN0YXJ0V2lkdGggPSBDb21wb25lbnRzLlNpemVzLnNsaWRlV2lkdGggKiBDb21wb25lbnRzLlRyYW5zbGF0ZS5nZXRTdGFydEluZGV4KCk7XG4gICAgcmV0dXJuIFRyYW5zbGF0ZS5zZXQoc3RhcnRXaWR0aCAtIENvbXBvbmVudHMuVHJhbnNsYXRlLmdldFRyYXZlbERpc3RhbmNlKCkpO1xuICB9KTtcbiAgLyoqXG4gICAqIFJlbW92ZSB0cmFuc2xhdGU6XG4gICAqIC0gb24gZGVzdHJveWluZyB0byBicmluZyBtYXJrdXAgdG8gaXRzIGluaXRhbCBzdGF0ZVxuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgVHJhbnNsYXRlLnJlbW92ZSgpO1xuICB9KTtcbiAgcmV0dXJuIFRyYW5zbGF0ZTtcbn1cblxuZnVuY3Rpb24gVHJhbnNpdGlvbiAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAvKipcbiAgICogSG9sZHMgaW5hY3Rpdml0eSBzdGF0dXMgb2YgdHJhbnNpdGlvbi5cbiAgICogV2hlbiB0cnVlIHRyYW5zaXRpb24gaXMgbm90IGFwcGxpZWQuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cbiAgdmFyIGRpc2FibGVkID0gZmFsc2U7XG4gIHZhciBUcmFuc2l0aW9uID0ge1xuICAgIC8qKlxuICAgICAqIENvbXBvc2VzIHN0cmluZyBvZiB0aGUgQ1NTIHRyYW5zaXRpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAgICovXG4gICAgY29tcG9zZTogZnVuY3Rpb24gY29tcG9zZShwcm9wZXJ0eSkge1xuICAgICAgdmFyIHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3M7XG5cbiAgICAgIGlmICghZGlzYWJsZWQpIHtcbiAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHByb3BlcnR5LCBcIiBcIikuY29uY2F0KHRoaXMuZHVyYXRpb24sIFwibXMgXCIpLmNvbmNhdChzZXR0aW5ncy5hbmltYXRpb25UaW1pbmdGdW5jKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHByb3BlcnR5LCBcIiAwbXMgXCIpLmNvbmNhdChzZXR0aW5ncy5hbmltYXRpb25UaW1pbmdGdW5jKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0cyB2YWx1ZSBvZiB0cmFuc2l0aW9uIG9uIEhUTUwgZWxlbWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nPX0gcHJvcGVydHlcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHNldDogZnVuY3Rpb24gc2V0KCkge1xuICAgICAgdmFyIHByb3BlcnR5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAndHJhbnNmb3JtJztcbiAgICAgIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLnN0eWxlLnRyYW5zaXRpb24gPSB0aGlzLmNvbXBvc2UocHJvcGVydHkpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHZhbHVlIG9mIHRyYW5zaXRpb24gZnJvbSBIVE1MIGVsZW1lbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIuc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSdW5zIGNhbGxiYWNrIGFmdGVyIGFuaW1hdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYWZ0ZXI6IGZ1bmN0aW9uIGFmdGVyKGNhbGxiYWNrKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH0sIHRoaXMuZHVyYXRpb24pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbmFibGUgdHJhbnNpdGlvbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgZW5hYmxlOiBmdW5jdGlvbiBlbmFibGUoKSB7XG4gICAgICBkaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5zZXQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGlzYWJsZSB0cmFuc2l0aW9uLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBkaXNhYmxlOiBmdW5jdGlvbiBkaXNhYmxlKCkge1xuICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgdGhpcy5zZXQoKTtcbiAgICB9XG4gIH07XG4gIGRlZmluZShUcmFuc2l0aW9uLCAnZHVyYXRpb24nLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBkdXJhdGlvbiBvZiB0aGUgdHJhbnNpdGlvbiBiYXNlZFxuICAgICAqIG9uIGN1cnJlbnRseSBydW5uaW5nIGFuaW1hdGlvbiB0eXBlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgdmFyIHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3M7XG5cbiAgICAgIGlmIChHbGlkZS5pc1R5cGUoJ3NsaWRlcicpICYmIENvbXBvbmVudHMuUnVuLm9mZnNldCkge1xuICAgICAgICByZXR1cm4gc2V0dGluZ3MucmV3aW5kRHVyYXRpb247XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZXR0aW5ncy5hbmltYXRpb25EdXJhdGlvbjtcbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogU2V0IHRyYW5zaXRpb24gYHN0eWxlYCB2YWx1ZTpcbiAgICogLSBvbiBlYWNoIG1vdmluZywgYmVjYXVzZSBpdCBtYXkgYmUgY2xlYXJlZCBieSBvZmZzZXQgbW92ZVxuICAgKi9cblxuICBFdmVudHMub24oJ21vdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgVHJhbnNpdGlvbi5zZXQoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBEaXNhYmxlIHRyYW5zaXRpb246XG4gICAqIC0gYmVmb3JlIGluaXRpYWwgYnVpbGQgdG8gYXZvaWQgdHJhbnNpdGlvbmluZyBmcm9tIGAwYCB0byBgc3RhcnRBdGAgaW5kZXhcbiAgICogLSB3aGlsZSByZXNpemluZyB3aW5kb3cgYW5kIHJlY2FsY3VsYXRpbmcgZGltZW5zaW9uc1xuICAgKiAtIG9uIGp1bXBpbmcgZnJvbSBvZmZzZXQgdHJhbnNpdGlvbiBhdCBzdGFydCBhbmQgZW5kIGVkZ2VzIGluIGBjYXJvdXNlbGAgdHlwZVxuICAgKi9cblxuICBFdmVudHMub24oWydidWlsZC5iZWZvcmUnLCAncmVzaXplJywgJ3RyYW5zbGF0ZS5qdW1wJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBUcmFuc2l0aW9uLmRpc2FibGUoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBFbmFibGUgdHJhbnNpdGlvbjpcbiAgICogLSBvbiBlYWNoIHJ1bm5pbmcsIGJlY2F1c2UgaXQgbWF5IGJlIGRpc2FibGVkIGJ5IG9mZnNldCBtb3ZlXG4gICAqL1xuXG4gIEV2ZW50cy5vbigncnVuJywgZnVuY3Rpb24gKCkge1xuICAgIFRyYW5zaXRpb24uZW5hYmxlKCk7XG4gIH0pO1xuICAvKipcbiAgICogUmVtb3ZlIHRyYW5zaXRpb246XG4gICAqIC0gb24gZGVzdHJveWluZyB0byBicmluZyBtYXJrdXAgdG8gaXRzIGluaXRhbCBzdGF0ZVxuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgVHJhbnNpdGlvbi5yZW1vdmUoKTtcbiAgfSk7XG4gIHJldHVybiBUcmFuc2l0aW9uO1xufVxuXG4vKipcbiAqIFRlc3QgdmlhIGEgZ2V0dGVyIGluIHRoZSBvcHRpb25zIG9iamVjdCB0byBzZWVcbiAqIGlmIHRoZSBwYXNzaXZlIHByb3BlcnR5IGlzIGFjY2Vzc2VkLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL1dJQ0cvRXZlbnRMaXN0ZW5lck9wdGlvbnMvYmxvYi9naC1wYWdlcy9leHBsYWluZXIubWQjZmVhdHVyZS1kZXRlY3Rpb25cbiAqL1xudmFyIHN1cHBvcnRzUGFzc2l2ZSA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgb3B0cyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3Bhc3NpdmUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICBzdXBwb3J0c1Bhc3NpdmUgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0UGFzc2l2ZScsIG51bGwsIG9wdHMpO1xuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndGVzdFBhc3NpdmUnLCBudWxsLCBvcHRzKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbnZhciBzdXBwb3J0c1Bhc3NpdmUkMSA9IHN1cHBvcnRzUGFzc2l2ZTtcblxudmFyIFNUQVJUX0VWRU5UUyA9IFsndG91Y2hzdGFydCcsICdtb3VzZWRvd24nXTtcbnZhciBNT1ZFX0VWRU5UUyA9IFsndG91Y2htb3ZlJywgJ21vdXNlbW92ZSddO1xudmFyIEVORF9FVkVOVFMgPSBbJ3RvdWNoZW5kJywgJ3RvdWNoY2FuY2VsJywgJ21vdXNldXAnLCAnbW91c2VsZWF2ZSddO1xudmFyIE1PVVNFX0VWRU5UUyA9IFsnbW91c2Vkb3duJywgJ21vdXNlbW92ZScsICdtb3VzZXVwJywgJ21vdXNlbGVhdmUnXTtcbmZ1bmN0aW9uIFN3aXBlIChHbGlkZSwgQ29tcG9uZW50cywgRXZlbnRzKSB7XG4gIC8qKlxuICAgKiBJbnN0YW5jZSBvZiB0aGUgYmluZGVyIGZvciBET00gRXZlbnRzLlxuICAgKlxuICAgKiBAdHlwZSB7RXZlbnRzQmluZGVyfVxuICAgKi9cbiAgdmFyIEJpbmRlciA9IG5ldyBFdmVudHNCaW5kZXIoKTtcbiAgdmFyIHN3aXBlU2luID0gMDtcbiAgdmFyIHN3aXBlU3RhcnRYID0gMDtcbiAgdmFyIHN3aXBlU3RhcnRZID0gMDtcbiAgdmFyIGRpc2FibGVkID0gZmFsc2U7XG4gIHZhciBjYXB0dXJlID0gc3VwcG9ydHNQYXNzaXZlJDEgPyB7XG4gICAgcGFzc2l2ZTogdHJ1ZVxuICB9IDogZmFsc2U7XG4gIHZhciBTd2lwZSA9IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyBzd2lwZSBiaW5kaW5ncy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgdGhpcy5iaW5kU3dpcGVTdGFydCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVyIGZvciBgc3dpcGVzdGFydGAgZXZlbnQuIENhbGN1bGF0ZXMgZW50cnkgcG9pbnRzIG9mIHRoZSB1c2VyJ3MgdGFwLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBzdGFydDogZnVuY3Rpb24gc3RhcnQoZXZlbnQpIHtcbiAgICAgIGlmICghZGlzYWJsZWQgJiYgIUdsaWRlLmRpc2FibGVkKSB7XG4gICAgICAgIHRoaXMuZGlzYWJsZSgpO1xuICAgICAgICB2YXIgc3dpcGUgPSB0aGlzLnRvdWNoZXMoZXZlbnQpO1xuICAgICAgICBzd2lwZVNpbiA9IG51bGw7XG4gICAgICAgIHN3aXBlU3RhcnRYID0gdG9JbnQoc3dpcGUucGFnZVgpO1xuICAgICAgICBzd2lwZVN0YXJ0WSA9IHRvSW50KHN3aXBlLnBhZ2VZKTtcbiAgICAgICAgdGhpcy5iaW5kU3dpcGVNb3ZlKCk7XG4gICAgICAgIHRoaXMuYmluZFN3aXBlRW5kKCk7XG4gICAgICAgIEV2ZW50cy5lbWl0KCdzd2lwZS5zdGFydCcpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVyIGZvciBgc3dpcGVtb3ZlYCBldmVudC4gQ2FsY3VsYXRlcyB1c2VyJ3MgdGFwIGFuZ2xlIGFuZCBkaXN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICAgICAqL1xuICAgIG1vdmU6IGZ1bmN0aW9uIG1vdmUoZXZlbnQpIHtcbiAgICAgIGlmICghR2xpZGUuZGlzYWJsZWQpIHtcbiAgICAgICAgdmFyIF9HbGlkZSRzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzLFxuICAgICAgICAgICAgdG91Y2hBbmdsZSA9IF9HbGlkZSRzZXR0aW5ncy50b3VjaEFuZ2xlLFxuICAgICAgICAgICAgdG91Y2hSYXRpbyA9IF9HbGlkZSRzZXR0aW5ncy50b3VjaFJhdGlvLFxuICAgICAgICAgICAgY2xhc3NlcyA9IF9HbGlkZSRzZXR0aW5ncy5jbGFzc2VzO1xuICAgICAgICB2YXIgc3dpcGUgPSB0aGlzLnRvdWNoZXMoZXZlbnQpO1xuICAgICAgICB2YXIgc3ViRXhTeCA9IHRvSW50KHN3aXBlLnBhZ2VYKSAtIHN3aXBlU3RhcnRYO1xuICAgICAgICB2YXIgc3ViRXlTeSA9IHRvSW50KHN3aXBlLnBhZ2VZKSAtIHN3aXBlU3RhcnRZO1xuICAgICAgICB2YXIgcG93RVggPSBNYXRoLmFicyhzdWJFeFN4IDw8IDIpO1xuICAgICAgICB2YXIgcG93RVkgPSBNYXRoLmFicyhzdWJFeVN5IDw8IDIpO1xuICAgICAgICB2YXIgc3dpcGVIeXBvdGVudXNlID0gTWF0aC5zcXJ0KHBvd0VYICsgcG93RVkpO1xuICAgICAgICB2YXIgc3dpcGVDYXRoZXR1cyA9IE1hdGguc3FydChwb3dFWSk7XG4gICAgICAgIHN3aXBlU2luID0gTWF0aC5hc2luKHN3aXBlQ2F0aGV0dXMgLyBzd2lwZUh5cG90ZW51c2UpO1xuXG4gICAgICAgIGlmIChzd2lwZVNpbiAqIDE4MCAvIE1hdGguUEkgPCB0b3VjaEFuZ2xlKSB7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgQ29tcG9uZW50cy5Nb3ZlLm1ha2Uoc3ViRXhTeCAqIHRvRmxvYXQodG91Y2hSYXRpbykpO1xuICAgICAgICAgIENvbXBvbmVudHMuSHRtbC5yb290LmNsYXNzTGlzdC5hZGQoY2xhc3Nlcy5kcmFnZ2luZyk7XG4gICAgICAgICAgRXZlbnRzLmVtaXQoJ3N3aXBlLm1vdmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlciBmb3IgYHN3aXBlZW5kYCBldmVudC4gRmluaXRpYWxpemVzIHVzZXIncyB0YXAgYW5kIGRlY2lkZXMgYWJvdXQgZ2xpZGUgbW92ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgZW5kOiBmdW5jdGlvbiBlbmQoZXZlbnQpIHtcbiAgICAgIGlmICghR2xpZGUuZGlzYWJsZWQpIHtcbiAgICAgICAgdmFyIF9HbGlkZSRzZXR0aW5nczIgPSBHbGlkZS5zZXR0aW5ncyxcbiAgICAgICAgICAgIHBlclN3aXBlID0gX0dsaWRlJHNldHRpbmdzMi5wZXJTd2lwZSxcbiAgICAgICAgICAgIHRvdWNoQW5nbGUgPSBfR2xpZGUkc2V0dGluZ3MyLnRvdWNoQW5nbGUsXG4gICAgICAgICAgICBjbGFzc2VzID0gX0dsaWRlJHNldHRpbmdzMi5jbGFzc2VzO1xuICAgICAgICB2YXIgc3dpcGUgPSB0aGlzLnRvdWNoZXMoZXZlbnQpO1xuICAgICAgICB2YXIgdGhyZXNob2xkID0gdGhpcy50aHJlc2hvbGQoZXZlbnQpO1xuICAgICAgICB2YXIgc3dpcGVEaXN0YW5jZSA9IHN3aXBlLnBhZ2VYIC0gc3dpcGVTdGFydFg7XG4gICAgICAgIHZhciBzd2lwZURlZyA9IHN3aXBlU2luICogMTgwIC8gTWF0aC5QSTtcbiAgICAgICAgdGhpcy5lbmFibGUoKTtcblxuICAgICAgICBpZiAoc3dpcGVEaXN0YW5jZSA+IHRocmVzaG9sZCAmJiBzd2lwZURlZyA8IHRvdWNoQW5nbGUpIHtcbiAgICAgICAgICBDb21wb25lbnRzLlJ1bi5tYWtlKENvbXBvbmVudHMuRGlyZWN0aW9uLnJlc29sdmUoXCJcIi5jb25jYXQocGVyU3dpcGUsIFwiPFwiKSkpO1xuICAgICAgICB9IGVsc2UgaWYgKHN3aXBlRGlzdGFuY2UgPCAtdGhyZXNob2xkICYmIHN3aXBlRGVnIDwgdG91Y2hBbmdsZSkge1xuICAgICAgICAgIENvbXBvbmVudHMuUnVuLm1ha2UoQ29tcG9uZW50cy5EaXJlY3Rpb24ucmVzb2x2ZShcIlwiLmNvbmNhdChwZXJTd2lwZSwgXCI+XCIpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gV2hpbGUgc3dpcGUgZG9uJ3QgcmVhY2ggZGlzdGFuY2UgYXBwbHkgcHJldmlvdXMgdHJhbnNmb3JtLlxuICAgICAgICAgIENvbXBvbmVudHMuTW92ZS5tYWtlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBDb21wb25lbnRzLkh0bWwucm9vdC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzZXMuZHJhZ2dpbmcpO1xuICAgICAgICB0aGlzLnVuYmluZFN3aXBlTW92ZSgpO1xuICAgICAgICB0aGlzLnVuYmluZFN3aXBlRW5kKCk7XG4gICAgICAgIEV2ZW50cy5lbWl0KCdzd2lwZS5lbmQnKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZHMgc3dpcGUncyBzdGFydGluZyBldmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYmluZFN3aXBlU3RhcnQ6IGZ1bmN0aW9uIGJpbmRTd2lwZVN0YXJ0KCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgdmFyIF9HbGlkZSRzZXR0aW5nczMgPSBHbGlkZS5zZXR0aW5ncyxcbiAgICAgICAgICBzd2lwZVRocmVzaG9sZCA9IF9HbGlkZSRzZXR0aW5nczMuc3dpcGVUaHJlc2hvbGQsXG4gICAgICAgICAgZHJhZ1RocmVzaG9sZCA9IF9HbGlkZSRzZXR0aW5nczMuZHJhZ1RocmVzaG9sZDtcblxuICAgICAgaWYgKHN3aXBlVGhyZXNob2xkKSB7XG4gICAgICAgIEJpbmRlci5vbihTVEFSVF9FVkVOVFNbMF0sIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBfdGhpcy5zdGFydChldmVudCk7XG4gICAgICAgIH0sIGNhcHR1cmUpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZHJhZ1RocmVzaG9sZCkge1xuICAgICAgICBCaW5kZXIub24oU1RBUlRfRVZFTlRTWzFdLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgX3RoaXMuc3RhcnQoZXZlbnQpO1xuICAgICAgICB9LCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kcyBzd2lwZSdzIHN0YXJ0aW5nIGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICB1bmJpbmRTd2lwZVN0YXJ0OiBmdW5jdGlvbiB1bmJpbmRTd2lwZVN0YXJ0KCkge1xuICAgICAgQmluZGVyLm9mZihTVEFSVF9FVkVOVFNbMF0sIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCBjYXB0dXJlKTtcbiAgICAgIEJpbmRlci5vZmYoU1RBUlRfRVZFTlRTWzFdLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgY2FwdHVyZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmRzIHN3aXBlJ3MgbW92aW5nIGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBiaW5kU3dpcGVNb3ZlOiBmdW5jdGlvbiBiaW5kU3dpcGVNb3ZlKCkge1xuICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgIEJpbmRlci5vbihNT1ZFX0VWRU5UUywgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIsIHRocm90dGxlKGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBfdGhpczIubW92ZShldmVudCk7XG4gICAgICB9LCBHbGlkZS5zZXR0aW5ncy50aHJvdHRsZSksIGNhcHR1cmUpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmRzIHN3aXBlJ3MgbW92aW5nIGV2ZW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICB1bmJpbmRTd2lwZU1vdmU6IGZ1bmN0aW9uIHVuYmluZFN3aXBlTW92ZSgpIHtcbiAgICAgIEJpbmRlci5vZmYoTU9WRV9FVkVOVFMsIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCBjYXB0dXJlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZHMgc3dpcGUncyBlbmRpbmcgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGJpbmRTd2lwZUVuZDogZnVuY3Rpb24gYmluZFN3aXBlRW5kKCkge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG5cbiAgICAgIEJpbmRlci5vbihFTkRfRVZFTlRTLCBDb21wb25lbnRzLkh0bWwud3JhcHBlciwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIF90aGlzMy5lbmQoZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZHMgc3dpcGUncyBlbmRpbmcgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHVuYmluZFN3aXBlRW5kOiBmdW5jdGlvbiB1bmJpbmRTd2lwZUVuZCgpIHtcbiAgICAgIEJpbmRlci5vZmYoRU5EX0VWRU5UUywgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBOb3JtYWxpemVzIGV2ZW50IHRvdWNoZXMgcG9pbnRzIGFjY29ydGluZyB0byBkaWZmZXJlbnQgdHlwZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAgICAgKi9cbiAgICB0b3VjaGVzOiBmdW5jdGlvbiB0b3VjaGVzKGV2ZW50KSB7XG4gICAgICBpZiAoTU9VU0VfRVZFTlRTLmluZGV4T2YoZXZlbnQudHlwZSkgPiAtMSkge1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBldmVudC50b3VjaGVzWzBdIHx8IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHZhbHVlIG9mIG1pbmltdW0gc3dpcGUgZGlzdGFuY2Ugc2V0dGluZ3MgYmFzZWQgb24gZXZlbnQgdHlwZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKi9cbiAgICB0aHJlc2hvbGQ6IGZ1bmN0aW9uIHRocmVzaG9sZChldmVudCkge1xuICAgICAgdmFyIHNldHRpbmdzID0gR2xpZGUuc2V0dGluZ3M7XG5cbiAgICAgIGlmIChNT1VTRV9FVkVOVFMuaW5kZXhPZihldmVudC50eXBlKSA+IC0xKSB7XG4gICAgICAgIHJldHVybiBzZXR0aW5ncy5kcmFnVGhyZXNob2xkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2V0dGluZ3Muc3dpcGVUaHJlc2hvbGQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuYWJsZXMgc3dpcGUgZXZlbnQuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAqL1xuICAgIGVuYWJsZTogZnVuY3Rpb24gZW5hYmxlKCkge1xuICAgICAgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIENvbXBvbmVudHMuVHJhbnNpdGlvbi5lbmFibGUoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEaXNhYmxlcyBzd2lwZSBldmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge3NlbGZ9XG4gICAgICovXG4gICAgZGlzYWJsZTogZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgICAgIGRpc2FibGVkID0gdHJ1ZTtcbiAgICAgIENvbXBvbmVudHMuVHJhbnNpdGlvbi5kaXNhYmxlKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBBZGQgY29tcG9uZW50IGNsYXNzOlxuICAgKiAtIGFmdGVyIGluaXRpYWwgYnVpbGRpbmdcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdidWlsZC5hZnRlcicsIGZ1bmN0aW9uICgpIHtcbiAgICBDb21wb25lbnRzLkh0bWwucm9vdC5jbGFzc0xpc3QuYWRkKEdsaWRlLnNldHRpbmdzLmNsYXNzZXMuc3dpcGVhYmxlKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBSZW1vdmUgc3dpcGluZyBiaW5kaW5nczpcbiAgICogLSBvbiBkZXN0cm95aW5nLCB0byByZW1vdmUgYWRkZWQgRXZlbnRMaXN0ZW5lcnNcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIFN3aXBlLnVuYmluZFN3aXBlU3RhcnQoKTtcbiAgICBTd2lwZS51bmJpbmRTd2lwZU1vdmUoKTtcbiAgICBTd2lwZS51bmJpbmRTd2lwZUVuZCgpO1xuICAgIEJpbmRlci5kZXN0cm95KCk7XG4gIH0pO1xuICByZXR1cm4gU3dpcGU7XG59XG5cbmZ1bmN0aW9uIEltYWdlcyAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIGJpbmRlciBmb3IgRE9NIEV2ZW50cy5cbiAgICpcbiAgICogQHR5cGUge0V2ZW50c0JpbmRlcn1cbiAgICovXG4gIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG4gIHZhciBJbWFnZXMgPSB7XG4gICAgLyoqXG4gICAgICogQmluZHMgbGlzdGVuZXIgdG8gZ2xpZGUgd3JhcHBlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgdGhpcy5iaW5kKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmRzIGBkcmFnc3RhcnRgIGV2ZW50IG9uIHdyYXBwZXIgdG8gcHJldmVudCBkcmFnZ2luZyBpbWFnZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgICBCaW5kZXIub24oJ2RyYWdzdGFydCcsIENvbXBvbmVudHMuSHRtbC53cmFwcGVyLCB0aGlzLmRyYWdzdGFydCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVuYmluZHMgYGRyYWdzdGFydGAgZXZlbnQgb24gd3JhcHBlci5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgdW5iaW5kOiBmdW5jdGlvbiB1bmJpbmQoKSB7XG4gICAgICBCaW5kZXIub2ZmKCdkcmFnc3RhcnQnLCBDb21wb25lbnRzLkh0bWwud3JhcHBlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEV2ZW50IGhhbmRsZXIuIFByZXZlbnRzIGRyYWdnaW5nLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBkcmFnc3RhcnQ6IGZ1bmN0aW9uIGRyYWdzdGFydChldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBSZW1vdmUgYmluZGluZ3MgZnJvbSBpbWFnZXM6XG4gICAqIC0gb24gZGVzdHJveWluZywgdG8gcmVtb3ZlIGFkZGVkIEV2ZW50TGlzdGVuZXJzXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBJbWFnZXMudW5iaW5kKCk7XG4gICAgQmluZGVyLmRlc3Ryb3koKTtcbiAgfSk7XG4gIHJldHVybiBJbWFnZXM7XG59XG5cbmZ1bmN0aW9uIEFuY2hvcnMgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgLyoqXG4gICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAqXG4gICAqIEB0eXBlIHtFdmVudHNCaW5kZXJ9XG4gICAqL1xuICB2YXIgQmluZGVyID0gbmV3IEV2ZW50c0JpbmRlcigpO1xuICAvKipcbiAgICogSG9sZHMgZGV0YWNoaW5nIHN0YXR1cyBvZiBhbmNob3JzLlxuICAgKiBQcmV2ZW50cyBkZXRhY2hpbmcgb2YgYWxyZWFkeSBkZXRhY2hlZCBhbmNob3JzLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG5cbiAgdmFyIGRldGFjaGVkID0gZmFsc2U7XG4gIC8qKlxuICAgKiBIb2xkcyBwcmV2ZW50aW5nIHN0YXR1cyBvZiBhbmNob3JzLlxuICAgKiBJZiBgdHJ1ZWAgcmVkaXJlY3Rpb24gYWZ0ZXIgY2xpY2sgd2lsbCBiZSBkaXNhYmxlZC5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuXG4gIHZhciBwcmV2ZW50ZWQgPSBmYWxzZTtcbiAgdmFyIEFuY2hvcnMgPSB7XG4gICAgLyoqXG4gICAgICogU2V0dXBzIGEgaW5pdGlhbCBzdGF0ZSBvZiBhbmNob3JzIGNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtWb2lkfVxuICAgICAqL1xuICAgIG1vdW50OiBmdW5jdGlvbiBtb3VudCgpIHtcbiAgICAgIC8qKlxuICAgICAgICogSG9sZHMgY29sbGVjdGlvbiBvZiBhbmNob3JzIGVsZW1lbnRzLlxuICAgICAgICpcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiBAdHlwZSB7SFRNTENvbGxlY3Rpb259XG4gICAgICAgKi9cbiAgICAgIHRoaXMuX2EgPSBDb21wb25lbnRzLkh0bWwud3JhcHBlci5xdWVyeVNlbGVjdG9yQWxsKCdhJyk7XG4gICAgICB0aGlzLmJpbmQoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQmluZHMgZXZlbnRzIHRvIGFuY2hvcnMgaW5zaWRlIGEgdHJhY2suXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGJpbmQ6IGZ1bmN0aW9uIGJpbmQoKSB7XG4gICAgICBCaW5kZXIub24oJ2NsaWNrJywgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIsIHRoaXMuY2xpY2spO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmRzIGV2ZW50cyBhdHRhY2hlZCB0byBhbmNob3JzIGluc2lkZSBhIHRyYWNrLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCgpIHtcbiAgICAgIEJpbmRlci5vZmYoJ2NsaWNrJywgQ29tcG9uZW50cy5IdG1sLndyYXBwZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVyIGZvciBjbGljayBldmVudC4gUHJldmVudHMgY2xpY2tzIHdoZW4gZ2xpZGUgaXMgaW4gYHByZXZlbnRgIHN0YXR1cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gZXZlbnRcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGNsaWNrOiBmdW5jdGlvbiBjbGljayhldmVudCkge1xuICAgICAgaWYgKHByZXZlbnRlZCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGV0YWNoZXMgYW5jaG9ycyBjbGljayBldmVudCBpbnNpZGUgZ2xpZGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtzZWxmfVxuICAgICAqL1xuICAgIGRldGFjaDogZnVuY3Rpb24gZGV0YWNoKCkge1xuICAgICAgcHJldmVudGVkID0gdHJ1ZTtcblxuICAgICAgaWYgKCFkZXRhY2hlZCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLml0ZW1zW2ldLmRyYWdnYWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZGV0YWNoZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoZXMgYW5jaG9ycyBjbGljayBldmVudHMgaW5zaWRlIGdsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7c2VsZn1cbiAgICAgKi9cbiAgICBhdHRhY2g6IGZ1bmN0aW9uIGF0dGFjaCgpIHtcbiAgICAgIHByZXZlbnRlZCA9IGZhbHNlO1xuXG4gICAgICBpZiAoZGV0YWNoZWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5pdGVtc1tpXS5kcmFnZ2FibGUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZGV0YWNoZWQgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBkZWZpbmUoQW5jaG9ycywgJ2l0ZW1zJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgY29sbGVjdGlvbiBvZiB0aGUgYXJyb3dzIEhUTUwgZWxlbWVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudFtdfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIEFuY2hvcnMuX2E7XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIERldGFjaCBhbmNob3JzIGluc2lkZSBzbGlkZXM6XG4gICAqIC0gb24gc3dpcGluZywgc28gdGhleSB3b24ndCByZWRpcmVjdCB0byBpdHMgYGhyZWZgIGF0dHJpYnV0ZXNcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdzd2lwZS5tb3ZlJywgZnVuY3Rpb24gKCkge1xuICAgIEFuY2hvcnMuZGV0YWNoKCk7XG4gIH0pO1xuICAvKipcbiAgICogQXR0YWNoIGFuY2hvcnMgaW5zaWRlIHNsaWRlczpcbiAgICogLSBhZnRlciBzd2lwaW5nIGFuZCB0cmFuc2l0aW9ucyBlbmRzLCBzbyB0aGV5IGNhbiByZWRpcmVjdCBhZnRlciBjbGljayBhZ2FpblxuICAgKi9cblxuICBFdmVudHMub24oJ3N3aXBlLmVuZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBDb21wb25lbnRzLlRyYW5zaXRpb24uYWZ0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgQW5jaG9ycy5hdHRhY2goKTtcbiAgICB9KTtcbiAgfSk7XG4gIC8qKlxuICAgKiBVbmJpbmQgYW5jaG9ycyBpbnNpZGUgc2xpZGVzOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIGJyaW5nIGFuY2hvcnMgdG8gaXRzIGluaXRpYWwgc3RhdGVcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIEFuY2hvcnMuYXR0YWNoKCk7XG4gICAgQW5jaG9ycy51bmJpbmQoKTtcbiAgICBCaW5kZXIuZGVzdHJveSgpO1xuICB9KTtcbiAgcmV0dXJuIEFuY2hvcnM7XG59XG5cbnZhciBOQVZfU0VMRUNUT1IgPSAnW2RhdGEtZ2xpZGUtZWw9XCJjb250cm9sc1tuYXZdXCJdJztcbnZhciBDT05UUk9MU19TRUxFQ1RPUiA9ICdbZGF0YS1nbGlkZS1lbF49XCJjb250cm9sc1wiXSc7XG52YXIgUFJFVklPVVNfQ09OVFJPTFNfU0VMRUNUT1IgPSBcIlwiLmNvbmNhdChDT05UUk9MU19TRUxFQ1RPUiwgXCIgW2RhdGEtZ2xpZGUtZGlyKj1cXFwiPFxcXCJdXCIpO1xudmFyIE5FWFRfQ09OVFJPTFNfU0VMRUNUT1IgPSBcIlwiLmNvbmNhdChDT05UUk9MU19TRUxFQ1RPUiwgXCIgW2RhdGEtZ2xpZGUtZGlyKj1cXFwiPlxcXCJdXCIpO1xuZnVuY3Rpb24gQ29udHJvbHMgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgLyoqXG4gICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAqXG4gICAqIEB0eXBlIHtFdmVudHNCaW5kZXJ9XG4gICAqL1xuICB2YXIgQmluZGVyID0gbmV3IEV2ZW50c0JpbmRlcigpO1xuICB2YXIgY2FwdHVyZSA9IHN1cHBvcnRzUGFzc2l2ZSQxID8ge1xuICAgIHBhc3NpdmU6IHRydWVcbiAgfSA6IGZhbHNlO1xuICB2YXIgQ29udHJvbHMgPSB7XG4gICAgLyoqXG4gICAgICogSW5pdHMgYXJyb3dzLiBCaW5kcyBldmVudHMgbGlzdGVuZXJzXG4gICAgICogdG8gdGhlIGFycm93cyBIVE1MIGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICAvKipcbiAgICAgICAqIENvbGxlY3Rpb24gb2YgbmF2aWdhdGlvbiBIVE1MIGVsZW1lbnRzLlxuICAgICAgICpcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiBAdHlwZSB7SFRNTENvbGxlY3Rpb259XG4gICAgICAgKi9cbiAgICAgIHRoaXMuX24gPSBDb21wb25lbnRzLkh0bWwucm9vdC5xdWVyeVNlbGVjdG9yQWxsKE5BVl9TRUxFQ1RPUik7XG4gICAgICAvKipcbiAgICAgICAqIENvbGxlY3Rpb24gb2YgY29udHJvbHMgSFRNTCBlbGVtZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICogQHR5cGUge0hUTUxDb2xsZWN0aW9ufVxuICAgICAgICovXG5cbiAgICAgIHRoaXMuX2MgPSBDb21wb25lbnRzLkh0bWwucm9vdC5xdWVyeVNlbGVjdG9yQWxsKENPTlRST0xTX1NFTEVDVE9SKTtcbiAgICAgIC8qKlxuICAgICAgICogQ29sbGVjdGlvbiBvZiBhcnJvdyBjb250cm9sIEhUTUwgZWxlbWVudHMuXG4gICAgICAgKlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgKi9cblxuICAgICAgdGhpcy5fYXJyb3dDb250cm9scyA9IHtcbiAgICAgICAgcHJldmlvdXM6IENvbXBvbmVudHMuSHRtbC5yb290LnF1ZXJ5U2VsZWN0b3JBbGwoUFJFVklPVVNfQ09OVFJPTFNfU0VMRUNUT1IpLFxuICAgICAgICBuZXh0OiBDb21wb25lbnRzLkh0bWwucm9vdC5xdWVyeVNlbGVjdG9yQWxsKE5FWFRfQ09OVFJPTFNfU0VMRUNUT1IpXG4gICAgICB9O1xuICAgICAgdGhpcy5hZGRCaW5kaW5ncygpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGFjdGl2ZSBjbGFzcyB0byBjdXJyZW50IHNsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBzZXRBY3RpdmU6IGZ1bmN0aW9uIHNldEFjdGl2ZSgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLmFkZENsYXNzKHRoaXMuX25baV0uY2hpbGRyZW4pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFjdGl2ZSBjbGFzcyB0byBjdXJyZW50IHNsaWRlLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmVBY3RpdmU6IGZ1bmN0aW9uIHJlbW92ZUFjdGl2ZSgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnJlbW92ZUNsYXNzKHRoaXMuX25baV0uY2hpbGRyZW4pO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBUb2dnbGVzIGFjdGl2ZSBjbGFzcyBvbiBpdGVtcyBpbnNpZGUgbmF2aWdhdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBjb250cm9sc1xuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYWRkQ2xhc3M6IGZ1bmN0aW9uIGFkZENsYXNzKGNvbnRyb2xzKSB7XG4gICAgICB2YXIgc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncztcbiAgICAgIHZhciBpdGVtID0gY29udHJvbHNbR2xpZGUuaW5kZXhdO1xuXG4gICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbSkge1xuICAgICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoc2V0dGluZ3MuY2xhc3Nlcy5uYXYuYWN0aXZlKTtcbiAgICAgICAgc2libGluZ3MoaXRlbSkuZm9yRWFjaChmdW5jdGlvbiAoc2libGluZykge1xuICAgICAgICAgIHNpYmxpbmcuY2xhc3NMaXN0LnJlbW92ZShzZXR0aW5ncy5jbGFzc2VzLm5hdi5hY3RpdmUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhY3RpdmUgY2xhc3MgZnJvbSBhY3RpdmUgY29udHJvbC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBjb250cm9sc1xuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgcmVtb3ZlQ2xhc3M6IGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGNvbnRyb2xzKSB7XG4gICAgICB2YXIgaXRlbSA9IGNvbnRyb2xzW0dsaWRlLmluZGV4XTtcblxuICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKEdsaWRlLnNldHRpbmdzLmNsYXNzZXMubmF2LmFjdGl2ZSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMsIHJlbW92ZXMgb3IgYWRkcyBgR2xpZGUuc2V0dGluZ3MuY2xhc3Nlcy5kaXNhYmxlZEFycm93YCBjbGFzcyBvbiB0aGUgY29udHJvbCBhcnJvd3NcbiAgICAgKi9cbiAgICBzZXRBcnJvd1N0YXRlOiBmdW5jdGlvbiBzZXRBcnJvd1N0YXRlKCkge1xuICAgICAgaWYgKEdsaWRlLnNldHRpbmdzLnJld2luZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBuZXh0ID0gQ29udHJvbHMuX2Fycm93Q29udHJvbHMubmV4dDtcbiAgICAgIHZhciBwcmV2aW91cyA9IENvbnRyb2xzLl9hcnJvd0NvbnRyb2xzLnByZXZpb3VzO1xuICAgICAgdGhpcy5yZXNldEFycm93U3RhdGUobmV4dCwgcHJldmlvdXMpO1xuXG4gICAgICBpZiAoR2xpZGUuaW5kZXggPT09IDApIHtcbiAgICAgICAgdGhpcy5kaXNhYmxlQXJyb3cocHJldmlvdXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoR2xpZGUuaW5kZXggPT09IENvbXBvbmVudHMuUnVuLmxlbmd0aCkge1xuICAgICAgICB0aGlzLmRpc2FibGVBcnJvdyhuZXh0KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBgR2xpZGUuc2V0dGluZ3MuY2xhc3Nlcy5kaXNhYmxlZEFycm93YCBmcm9tIGdpdmVuIE5vZGVMaXN0IGVsZW1lbnRzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge05vZGVMaXN0W119IGxpc3RzXG4gICAgICovXG4gICAgcmVzZXRBcnJvd1N0YXRlOiBmdW5jdGlvbiByZXNldEFycm93U3RhdGUoKSB7XG4gICAgICB2YXIgc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncztcblxuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGxpc3RzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgICBsaXN0c1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgbGlzdHMuZm9yRWFjaChmdW5jdGlvbiAobGlzdCkge1xuICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoc2V0dGluZ3MuY2xhc3Nlcy5hcnJvdy5kaXNhYmxlZCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYEdsaWRlLnNldHRpbmdzLmNsYXNzZXMuZGlzYWJsZWRBcnJvd2AgdG8gZ2l2ZW4gTm9kZUxpc3QgZWxlbWVudHNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Tm9kZUxpc3RbXX0gbGlzdHNcbiAgICAgKi9cbiAgICBkaXNhYmxlQXJyb3c6IGZ1bmN0aW9uIGRpc2FibGVBcnJvdygpIHtcbiAgICAgIHZhciBzZXR0aW5ncyA9IEdsaWRlLnNldHRpbmdzO1xuXG4gICAgICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGxpc3RzID0gbmV3IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG4gICAgICAgIGxpc3RzW19rZXkyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICB9XG5cbiAgICAgIGxpc3RzLmZvckVhY2goZnVuY3Rpb24gKGxpc3QpIHtcbiAgICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKHNldHRpbmdzLmNsYXNzZXMuYXJyb3cuZGlzYWJsZWQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGhhbmRsZXMgdG8gdGhlIGVhY2ggZ3JvdXAgb2YgY29udHJvbHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIGFkZEJpbmRpbmdzOiBmdW5jdGlvbiBhZGRCaW5kaW5ncygpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLmJpbmQodGhpcy5fY1tpXS5jaGlsZHJlbik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgaGFuZGxlcyBmcm9tIHRoZSBlYWNoIGdyb3VwIG9mIGNvbnRyb2xzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICByZW1vdmVCaW5kaW5nczogZnVuY3Rpb24gcmVtb3ZlQmluZGluZ3MoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy51bmJpbmQodGhpcy5fY1tpXS5jaGlsZHJlbik7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJpbmRzIGV2ZW50cyB0byBhcnJvd3MgSFRNTCBlbGVtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTENvbGxlY3Rpb259IGVsZW1lbnRzXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBiaW5kOiBmdW5jdGlvbiBiaW5kKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIEJpbmRlci5vbignY2xpY2snLCBlbGVtZW50c1tpXSwgdGhpcy5jbGljayk7XG4gICAgICAgIEJpbmRlci5vbigndG91Y2hzdGFydCcsIGVsZW1lbnRzW2ldLCB0aGlzLmNsaWNrLCBjYXB0dXJlKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5iaW5kcyBldmVudHMgYmluZGVkIHRvIHRoZSBhcnJvd3MgSFRNTCBlbGVtZW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SFRNTENvbGxlY3Rpb259IGVsZW1lbnRzXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZChlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBCaW5kZXIub2ZmKFsnY2xpY2snLCAndG91Y2hzdGFydCddLCBlbGVtZW50c1tpXSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMgYGNsaWNrYCBldmVudCBvbiB0aGUgYXJyb3dzIEhUTUwgZWxlbWVudHMuXG4gICAgICogTW92ZXMgc2xpZGVyIGluIGRpcmVjdGlvbiBnaXZlbiB2aWEgdGhlXG4gICAgICogYGRhdGEtZ2xpZGUtZGlyYCBhdHRyaWJ1dGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGNsaWNrOiBmdW5jdGlvbiBjbGljayhldmVudCkge1xuICAgICAgaWYgKCFzdXBwb3J0c1Bhc3NpdmUkMSAmJiBldmVudC50eXBlID09PSAndG91Y2hzdGFydCcpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGRpcmVjdGlvbiA9IGV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWdsaWRlLWRpcicpO1xuICAgICAgQ29tcG9uZW50cy5SdW4ubWFrZShDb21wb25lbnRzLkRpcmVjdGlvbi5yZXNvbHZlKGRpcmVjdGlvbikpO1xuICAgIH1cbiAgfTtcbiAgZGVmaW5lKENvbnRyb2xzLCAnaXRlbXMnLCB7XG4gICAgLyoqXG4gICAgICogR2V0cyBjb2xsZWN0aW9uIG9mIHRoZSBjb250cm9scyBIVE1MIGVsZW1lbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7SFRNTEVsZW1lbnRbXX1cbiAgICAgKi9cbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBDb250cm9scy5fYztcbiAgICB9XG4gIH0pO1xuICAvKipcbiAgICogU3dhcCBhY3RpdmUgY2xhc3Mgb2YgY3VycmVudCBuYXZpZ2F0aW9uIGl0ZW06XG4gICAqIC0gYWZ0ZXIgbW91bnRpbmcgdG8gc2V0IGl0IHRvIGluaXRpYWwgaW5kZXhcbiAgICogLSBhZnRlciBlYWNoIG1vdmUgdG8gdGhlIG5ldyBpbmRleFxuICAgKi9cblxuICBFdmVudHMub24oWydtb3VudC5hZnRlcicsICdtb3ZlLmFmdGVyJ10sIGZ1bmN0aW9uICgpIHtcbiAgICBDb250cm9scy5zZXRBY3RpdmUoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBBZGQgb3IgcmVtb3ZlIGRpc2FibGVkIGNsYXNzIG9mIGFycm93IGVsZW1lbnRzXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ21vdW50LmFmdGVyJywgJ3J1biddLCBmdW5jdGlvbiAoKSB7XG4gICAgQ29udHJvbHMuc2V0QXJyb3dTdGF0ZSgpO1xuICB9KTtcbiAgLyoqXG4gICAqIFJlbW92ZSBiaW5kaW5ncyBhbmQgSFRNTCBDbGFzc2VzOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcsIHRvIGJyaW5nIG1hcmt1cCB0byBpdHMgaW5pdGlhbCBzdGF0ZVxuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgQ29udHJvbHMucmVtb3ZlQmluZGluZ3MoKTtcbiAgICBDb250cm9scy5yZW1vdmVBY3RpdmUoKTtcbiAgICBCaW5kZXIuZGVzdHJveSgpO1xuICB9KTtcbiAgcmV0dXJuIENvbnRyb2xzO1xufVxuXG5mdW5jdGlvbiBLZXlib2FyZCAoR2xpZGUsIENvbXBvbmVudHMsIEV2ZW50cykge1xuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIGJpbmRlciBmb3IgRE9NIEV2ZW50cy5cbiAgICpcbiAgICogQHR5cGUge0V2ZW50c0JpbmRlcn1cbiAgICovXG4gIHZhciBCaW5kZXIgPSBuZXcgRXZlbnRzQmluZGVyKCk7XG4gIHZhciBLZXlib2FyZCA9IHtcbiAgICAvKipcbiAgICAgKiBCaW5kcyBrZXlib2FyZCBldmVudHMgb24gY29tcG9uZW50IG1vdW50LlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBtb3VudDogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICBpZiAoR2xpZGUuc2V0dGluZ3Mua2V5Ym9hcmQpIHtcbiAgICAgICAgdGhpcy5iaW5kKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEFkZHMga2V5Ym9hcmQgcHJlc3MgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBiaW5kOiBmdW5jdGlvbiBiaW5kKCkge1xuICAgICAgQmluZGVyLm9uKCdrZXl1cCcsIGRvY3VtZW50LCB0aGlzLnByZXNzKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBrZXlib2FyZCBwcmVzcyBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWb2lkfVxuICAgICAqL1xuICAgIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgICAgQmluZGVyLm9mZigna2V5dXAnLCBkb2N1bWVudCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZXMga2V5Ym9hcmQncyBhcnJvd3MgcHJlc3MgYW5kIG1vdmluZyBnbGlkZSBmb3dhcmQgYW5kIGJhY2t3YXJkLlxuICAgICAqXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBldmVudFxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgcHJlc3M6IGZ1bmN0aW9uIHByZXNzKGV2ZW50KSB7XG4gICAgICB2YXIgcGVyU3dpcGUgPSBHbGlkZS5zZXR0aW5ncy5wZXJTd2lwZTtcblxuICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM5KSB7XG4gICAgICAgIENvbXBvbmVudHMuUnVuLm1ha2UoQ29tcG9uZW50cy5EaXJlY3Rpb24ucmVzb2x2ZShcIlwiLmNvbmNhdChwZXJTd2lwZSwgXCI+XCIpKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAzNykge1xuICAgICAgICBDb21wb25lbnRzLlJ1bi5tYWtlKENvbXBvbmVudHMuRGlyZWN0aW9uLnJlc29sdmUoXCJcIi5jb25jYXQocGVyU3dpcGUsIFwiPFwiKSkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgLyoqXG4gICAqIFJlbW92ZSBiaW5kaW5ncyBmcm9tIGtleWJvYXJkOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcgdG8gcmVtb3ZlIGFkZGVkIGV2ZW50c1xuICAgKiAtIG9uIHVwZGF0aW5nIHRvIHJlbW92ZSBldmVudHMgYmVmb3JlIHJlbW91bnRpbmdcbiAgICovXG5cbiAgRXZlbnRzLm9uKFsnZGVzdHJveScsICd1cGRhdGUnXSwgZnVuY3Rpb24gKCkge1xuICAgIEtleWJvYXJkLnVuYmluZCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIFJlbW91bnQgY29tcG9uZW50XG4gICAqIC0gb24gdXBkYXRpbmcgdG8gcmVmbGVjdCBwb3RlbnRpYWwgY2hhbmdlcyBpbiBzZXR0aW5nc1xuICAgKi9cblxuICBFdmVudHMub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBLZXlib2FyZC5tb3VudCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIERlc3Ryb3kgYmluZGVyOlxuICAgKiAtIG9uIGRlc3Ryb3lpbmcgdG8gcmVtb3ZlIGxpc3RlbmVyc1xuICAgKi9cblxuICBFdmVudHMub24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgQmluZGVyLmRlc3Ryb3koKTtcbiAgfSk7XG4gIHJldHVybiBLZXlib2FyZDtcbn1cblxuZnVuY3Rpb24gQXV0b3BsYXkgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgLyoqXG4gICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAqXG4gICAqIEB0eXBlIHtFdmVudHNCaW5kZXJ9XG4gICAqL1xuICB2YXIgQmluZGVyID0gbmV3IEV2ZW50c0JpbmRlcigpO1xuICB2YXIgQXV0b3BsYXkgPSB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgYXV0b3BsYXlpbmcgYW5kIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgbW91bnQ6IGZ1bmN0aW9uIG1vdW50KCkge1xuICAgICAgdGhpcy5lbmFibGUoKTtcbiAgICAgIHRoaXMuc3RhcnQoKTtcblxuICAgICAgaWYgKEdsaWRlLnNldHRpbmdzLmhvdmVycGF1c2UpIHtcbiAgICAgICAgdGhpcy5iaW5kKCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEVuYWJsZXMgYXV0b3BsYXlpbmdcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtWb2lkfVxuICAgICAqL1xuICAgIGVuYWJsZTogZnVuY3Rpb24gZW5hYmxlKCkge1xuICAgICAgdGhpcy5fZSA9IHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERpc2FibGVzIGF1dG9wbGF5aW5nLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1ZvaWR9XG4gICAgICovXG4gICAgZGlzYWJsZTogZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgICAgIHRoaXMuX2UgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RhcnRzIGF1dG9wbGF5aW5nIGluIGNvbmZpZ3VyZWQgaW50ZXJ2YWwuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW58TnVtYmVyfSBmb3JjZSBSdW4gYXV0b3BsYXlpbmcgd2l0aCBwYXNzZWQgaW50ZXJ2YWwgcmVnYXJkbGVzcyBvZiBgYXV0b3BsYXlgIHNldHRpbmdzXG4gICAgICogQHJldHVybiB7Vm9pZH1cbiAgICAgKi9cbiAgICBzdGFydDogZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICBpZiAoIXRoaXMuX2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVuYWJsZSgpO1xuXG4gICAgICBpZiAoR2xpZGUuc2V0dGluZ3MuYXV0b3BsYXkpIHtcbiAgICAgICAgaWYgKGlzVW5kZWZpbmVkKHRoaXMuX2kpKSB7XG4gICAgICAgICAgdGhpcy5faSA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzLnN0b3AoKTtcblxuICAgICAgICAgICAgQ29tcG9uZW50cy5SdW4ubWFrZSgnPicpO1xuXG4gICAgICAgICAgICBfdGhpcy5zdGFydCgpO1xuXG4gICAgICAgICAgICBFdmVudHMuZW1pdCgnYXV0b3BsYXknKTtcbiAgICAgICAgICB9LCB0aGlzLnRpbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFN0b3BzIGF1dG9ydW5uaW5nIG9mIHRoZSBnbGlkZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgc3RvcDogZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgIHRoaXMuX2kgPSBjbGVhckludGVydmFsKHRoaXMuX2kpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wcyBhdXRvcGxheWluZyB3aGlsZSBtb3VzZSBpcyBvdmVyIGdsaWRlJ3MgYXJlYS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1ZvaWR9XG4gICAgICovXG4gICAgYmluZDogZnVuY3Rpb24gYmluZCgpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICBCaW5kZXIub24oJ21vdXNlb3ZlcicsIENvbXBvbmVudHMuSHRtbC5yb290LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChfdGhpczIuX2UpIHtcbiAgICAgICAgICBfdGhpczIuc3RvcCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIEJpbmRlci5vbignbW91c2VvdXQnLCBDb21wb25lbnRzLkh0bWwucm9vdCwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoX3RoaXMyLl9lKSB7XG4gICAgICAgICAgX3RoaXMyLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmJpbmQgbW91c2VvdmVyIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtWb2lkfVxuICAgICAqL1xuICAgIHVuYmluZDogZnVuY3Rpb24gdW5iaW5kKCkge1xuICAgICAgQmluZGVyLm9mZihbJ21vdXNlb3ZlcicsICdtb3VzZW91dCddLCBDb21wb25lbnRzLkh0bWwucm9vdCk7XG4gICAgfVxuICB9O1xuICBkZWZpbmUoQXV0b3BsYXksICd0aW1lJywge1xuICAgIC8qKlxuICAgICAqIEdldHMgdGltZSBwZXJpb2QgdmFsdWUgZm9yIHRoZSBhdXRvcGxheSBpbnRlcnZhbC4gUHJpb3JpdGl6ZXNcbiAgICAgKiB0aW1lcyBpbiBgZGF0YS1nbGlkZS1hdXRvcGxheWAgYXR0cnVidXRlcyBvdmVyIG9wdGlvbnMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgYXV0b3BsYXkgPSBDb21wb25lbnRzLkh0bWwuc2xpZGVzW0dsaWRlLmluZGV4XS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZ2xpZGUtYXV0b3BsYXknKTtcblxuICAgICAgaWYgKGF1dG9wbGF5KSB7XG4gICAgICAgIHJldHVybiB0b0ludChhdXRvcGxheSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0b0ludChHbGlkZS5zZXR0aW5ncy5hdXRvcGxheSk7XG4gICAgfVxuICB9KTtcbiAgLyoqXG4gICAqIFN0b3AgYXV0b3BsYXlpbmcgYW5kIHVuYmluZCBldmVudHM6XG4gICAqIC0gb24gZGVzdHJveWluZywgdG8gY2xlYXIgZGVmaW5lZCBpbnRlcnZhbFxuICAgKiAtIG9uIHVwZGF0aW5nIHZpYSBBUEkgdG8gcmVzZXQgaW50ZXJ2YWwgdGhhdCBtYXkgY2hhbmdlZFxuICAgKi9cblxuICBFdmVudHMub24oWydkZXN0cm95JywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgQXV0b3BsYXkudW5iaW5kKCk7XG4gIH0pO1xuICAvKipcbiAgICogU3RvcCBhdXRvcGxheWluZzpcbiAgICogLSBiZWZvcmUgZWFjaCBydW4sIHRvIHJlc3RhcnQgYXV0b3BsYXlpbmdcbiAgICogLSBvbiBwYXVzaW5nIHZpYSBBUElcbiAgICogLSBvbiBkZXN0cm95aW5nLCB0byBjbGVhciBkZWZpbmVkIGludGVydmFsXG4gICAqIC0gd2hpbGUgc3RhcnRpbmcgYSBzd2lwZVxuICAgKiAtIG9uIHVwZGF0aW5nIHZpYSBBUEkgdG8gcmVzZXQgaW50ZXJ2YWwgdGhhdCBtYXkgY2hhbmdlZFxuICAgKi9cblxuICBFdmVudHMub24oWydydW4uYmVmb3JlJywgJ3N3aXBlLnN0YXJ0JywgJ3VwZGF0ZSddLCBmdW5jdGlvbiAoKSB7XG4gICAgQXV0b3BsYXkuc3RvcCgpO1xuICB9KTtcbiAgRXZlbnRzLm9uKFsncGF1c2UnLCAnZGVzdHJveSddLCBmdW5jdGlvbiAoKSB7XG4gICAgQXV0b3BsYXkuZGlzYWJsZSgpO1xuICAgIEF1dG9wbGF5LnN0b3AoKTtcbiAgfSk7XG4gIC8qKlxuICAgKiBTdGFydCBhdXRvcGxheWluZzpcbiAgICogLSBhZnRlciBlYWNoIHJ1biwgdG8gcmVzdGFydCBhdXRvcGxheWluZ1xuICAgKiAtIG9uIHBsYXlpbmcgdmlhIEFQSVxuICAgKiAtIHdoaWxlIGVuZGluZyBhIHN3aXBlXG4gICAqL1xuXG4gIEV2ZW50cy5vbihbJ3J1bi5hZnRlcicsICdzd2lwZS5lbmQnXSwgZnVuY3Rpb24gKCkge1xuICAgIEF1dG9wbGF5LnN0YXJ0KCk7XG4gIH0pO1xuICAvKipcbiAgICogU3RhcnQgYXV0b3BsYXlpbmc6XG4gICAqIC0gYWZ0ZXIgZWFjaCBydW4sIHRvIHJlc3RhcnQgYXV0b3BsYXlpbmdcbiAgICogLSBvbiBwbGF5aW5nIHZpYSBBUElcbiAgICogLSB3aGlsZSBlbmRpbmcgYSBzd2lwZVxuICAgKi9cblxuICBFdmVudHMub24oWydwbGF5J10sIGZ1bmN0aW9uICgpIHtcbiAgICBBdXRvcGxheS5lbmFibGUoKTtcbiAgICBBdXRvcGxheS5zdGFydCgpO1xuICB9KTtcbiAgLyoqXG4gICAqIFJlbW91bnQgYXV0b3BsYXlpbmc6XG4gICAqIC0gb24gdXBkYXRpbmcgdmlhIEFQSSB0byByZXNldCBpbnRlcnZhbCB0aGF0IG1heSBjaGFuZ2VkXG4gICAqL1xuXG4gIEV2ZW50cy5vbigndXBkYXRlJywgZnVuY3Rpb24gKCkge1xuICAgIEF1dG9wbGF5Lm1vdW50KCk7XG4gIH0pO1xuICAvKipcbiAgICogRGVzdHJveSBhIGJpbmRlcjpcbiAgICogLSBvbiBkZXN0cm95aW5nIGdsaWRlIGluc3RhbmNlIHRvIGNsZWFydXAgbGlzdGVuZXJzXG4gICAqL1xuXG4gIEV2ZW50cy5vbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBCaW5kZXIuZGVzdHJveSgpO1xuICB9KTtcbiAgcmV0dXJuIEF1dG9wbGF5O1xufVxuXG4vKipcbiAqIFNvcnRzIGtleXMgb2YgYnJlYWtwb2ludCBvYmplY3Qgc28gdGhleSB3aWxsIGJlIG9yZGVyZWQgZnJvbSBsb3dlciB0byBiaWdnZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBvaW50c1xuICogQHJldHVybnMge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBzb3J0QnJlYWtwb2ludHMocG9pbnRzKSB7XG4gIGlmIChpc09iamVjdChwb2ludHMpKSB7XG4gICAgcmV0dXJuIHNvcnRLZXlzKHBvaW50cyk7XG4gIH0gZWxzZSB7XG4gICAgd2FybihcIkJyZWFrcG9pbnRzIG9wdGlvbiBtdXN0IGJlIGFuIG9iamVjdFwiKTtcbiAgfVxuXG4gIHJldHVybiB7fTtcbn1cblxuZnVuY3Rpb24gQnJlYWtwb2ludHMgKEdsaWRlLCBDb21wb25lbnRzLCBFdmVudHMpIHtcbiAgLyoqXG4gICAqIEluc3RhbmNlIG9mIHRoZSBiaW5kZXIgZm9yIERPTSBFdmVudHMuXG4gICAqXG4gICAqIEB0eXBlIHtFdmVudHNCaW5kZXJ9XG4gICAqL1xuICB2YXIgQmluZGVyID0gbmV3IEV2ZW50c0JpbmRlcigpO1xuICAvKipcbiAgICogSG9sZHMgcmVmZXJlbmNlIHRvIHNldHRpbmdzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICB2YXIgc2V0dGluZ3MgPSBHbGlkZS5zZXR0aW5ncztcbiAgLyoqXG4gICAqIEhvbGRzIHJlZmVyZW5jZSB0byBicmVha3BvaW50cyBvYmplY3QgaW4gc2V0dGluZ3MuIFNvcnRzIGJyZWFrcG9pbnRzXG4gICAqIGZyb20gc21hbGxlciB0byBsYXJnZXIuIEl0IGlzIHJlcXVpcmVkIGluIG9yZGVyIHRvIHByb3BlclxuICAgKiBtYXRjaGluZyBjdXJyZW50bHkgYWN0aXZlIGJyZWFrcG9pbnQgc2V0dGluZ3MuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHZhciBwb2ludHMgPSBzb3J0QnJlYWtwb2ludHMoc2V0dGluZ3MuYnJlYWtwb2ludHMpO1xuICAvKipcbiAgICogQ2FjaGUgaW5pdGlhbCBzZXR0aW5ncyBiZWZvcmUgb3ZlcndyaXR0aW5nLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICB2YXIgZGVmYXVsdHMgPSBPYmplY3QuYXNzaWduKHt9LCBzZXR0aW5ncyk7XG4gIHZhciBCcmVha3BvaW50cyA9IHtcbiAgICAvKipcbiAgICAgKiBNYXRjaGVzIHNldHRpbmdzIGZvciBjdXJyZWN0bHkgbWF0Y2hpbmcgbWVkaWEgYnJlYWtwb2ludC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwb2ludHNcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIG1hdGNoOiBmdW5jdGlvbiBtYXRjaChwb2ludHMpIHtcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93Lm1hdGNoTWVkaWEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGZvciAodmFyIHBvaW50IGluIHBvaW50cykge1xuICAgICAgICAgIGlmIChwb2ludHMuaGFzT3duUHJvcGVydHkocG9pbnQpKSB7XG4gICAgICAgICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoXCIobWF4LXdpZHRoOiBcIi5jb25jYXQocG9pbnQsIFwicHgpXCIpKS5tYXRjaGVzKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwb2ludHNbcG9pbnRdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmYXVsdHM7XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogT3ZlcndyaXRlIGluc3RhbmNlIHNldHRpbmdzIHdpdGggY3VycmVudGx5IG1hdGNoaW5nIGJyZWFrcG9pbnQgc2V0dGluZ3MuXG4gICAqIFRoaXMgaGFwcGVucyByaWdodCBhZnRlciBjb21wb25lbnQgaW5pdGlhbGl6YXRpb24uXG4gICAqL1xuXG4gIE9iamVjdC5hc3NpZ24oc2V0dGluZ3MsIEJyZWFrcG9pbnRzLm1hdGNoKHBvaW50cykpO1xuICAvKipcbiAgICogVXBkYXRlIGdsaWRlIHdpdGggc2V0dGluZ3Mgb2YgbWF0Y2hlZCBicmVrcG9pbnQ6XG4gICAqIC0gd2luZG93IHJlc2l6ZSB0byB1cGRhdGUgc2xpZGVyXG4gICAqL1xuXG4gIEJpbmRlci5vbigncmVzaXplJywgd2luZG93LCB0aHJvdHRsZShmdW5jdGlvbiAoKSB7XG4gICAgR2xpZGUuc2V0dGluZ3MgPSBtZXJnZU9wdGlvbnMoc2V0dGluZ3MsIEJyZWFrcG9pbnRzLm1hdGNoKHBvaW50cykpO1xuICB9LCBHbGlkZS5zZXR0aW5ncy50aHJvdHRsZSkpO1xuICAvKipcbiAgICogUmVzb3J0IGFuZCB1cGRhdGUgZGVmYXVsdCBzZXR0aW5nczpcbiAgICogLSBvbiByZWluaXQgdmlhIEFQSSwgc28gYnJlYWtwb2ludCBtYXRjaGluZyB3aWxsIGJlIHBlcmZvcm1lZCB3aXRoIG9wdGlvbnNcbiAgICovXG5cbiAgRXZlbnRzLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgcG9pbnRzID0gc29ydEJyZWFrcG9pbnRzKHBvaW50cyk7XG4gICAgZGVmYXVsdHMgPSBPYmplY3QuYXNzaWduKHt9LCBzZXR0aW5ncyk7XG4gIH0pO1xuICAvKipcbiAgICogVW5iaW5kIHJlc2l6ZSBsaXN0ZW5lcjpcbiAgICogLSBvbiBkZXN0cm95aW5nLCB0byBicmluZyBtYXJrdXAgdG8gaXRzIGluaXRpYWwgc3RhdGVcbiAgICovXG5cbiAgRXZlbnRzLm9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIEJpbmRlci5vZmYoJ3Jlc2l6ZScsIHdpbmRvdyk7XG4gIH0pO1xuICByZXR1cm4gQnJlYWtwb2ludHM7XG59XG5cbnZhciBDT01QT05FTlRTID0ge1xuICAvLyBSZXF1aXJlZFxuICBIdG1sOiBIdG1sLFxuICBUcmFuc2xhdGU6IFRyYW5zbGF0ZSxcbiAgVHJhbnNpdGlvbjogVHJhbnNpdGlvbixcbiAgRGlyZWN0aW9uOiBEaXJlY3Rpb24sXG4gIFBlZWs6IFBlZWssXG4gIFNpemVzOiBTaXplcyxcbiAgR2FwczogR2FwcyxcbiAgTW92ZTogTW92ZSxcbiAgQ2xvbmVzOiBDbG9uZXMsXG4gIFJlc2l6ZTogUmVzaXplLFxuICBCdWlsZDogQnVpbGQsXG4gIFJ1bjogUnVuLFxuICAvLyBPcHRpb25hbFxuICBTd2lwZTogU3dpcGUsXG4gIEltYWdlczogSW1hZ2VzLFxuICBBbmNob3JzOiBBbmNob3JzLFxuICBDb250cm9sczogQ29udHJvbHMsXG4gIEtleWJvYXJkOiBLZXlib2FyZCxcbiAgQXV0b3BsYXk6IEF1dG9wbGF5LFxuICBCcmVha3BvaW50czogQnJlYWtwb2ludHNcbn07XG5cbnZhciBHbGlkZSA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoX0NvcmUpIHtcbiAgX2luaGVyaXRzKEdsaWRlLCBfQ29yZSk7XG5cbiAgdmFyIF9zdXBlciA9IF9jcmVhdGVTdXBlcihHbGlkZSk7XG5cbiAgZnVuY3Rpb24gR2xpZGUoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEdsaWRlKTtcblxuICAgIHJldHVybiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhHbGlkZSwgW3tcbiAgICBrZXk6IFwibW91bnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbW91bnQoKSB7XG4gICAgICB2YXIgZXh0ZW5zaW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICByZXR1cm4gX2dldChfZ2V0UHJvdG90eXBlT2YoR2xpZGUucHJvdG90eXBlKSwgXCJtb3VudFwiLCB0aGlzKS5jYWxsKHRoaXMsIE9iamVjdC5hc3NpZ24oe30sIENPTVBPTkVOVFMsIGV4dGVuc2lvbnMpKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gR2xpZGU7XG59KEdsaWRlJDEpO1xuXG5leHBvcnQgeyBHbGlkZSBhcyBkZWZhdWx0IH07XG4iLCJjb25zdCBQcm9taXNlID0gcmVxdWlyZSgnc3luYy1wJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjaGVja0V4aXQgKGNiLCBjb25maWcgPSB7fSkge1xuICBjb25zdCBjYWxsYmFjayA9IGNiIHx8IGZ1bmN0aW9uICgpIHt9XG4gIGNvbnN0IHNlbnNpdGl2aXR5ID0gY29uZmlnLnNlbnNpdGl2aXR5IHx8IDIwXG4gIGNvbnN0IHRpbWVyID0gY29uZmlnLnRpbWVyIHx8IDEwMDBcbiAgY29uc3QgZGVsYXkgPSBjb25maWcuZGVsYXkgfHwgMFxuICBjb25zdCB2aWV3cG9ydCA9IGNvbmZpZy52aWV3cG9ydCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcbiAgY29uc3QgZGVidWcgPSBjb25maWcuZGVidWcgfHwgZmFsc2VcblxuICBsZXQgZGVsYXlUaW1lclxuICBsZXQgbGlzdGVuZXJUaW1lb3V0XG4gIGxldCBkaXNhYmxlS2V5ZG93biA9IGZhbHNlXG4gIGxldCBhdHRhY2hlZExpc3RlbmVycyA9IGZhbHNlXG5cbiAgZnVuY3Rpb24gaW5pdCAoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnY2hlY2tFeGl0IC0gSW5pdCcpXG4gICAgICBsaXN0ZW5lclRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgYXR0YWNoRXZlbnRMaXN0ZW5lcnMoKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH0sIHRpbWVyKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBjbGVhbnVwICgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKCdjaGVja0V4aXQgLSBDbGVhbnVwJylcbiAgICAgIGNsZWFyVGltZW91dChsaXN0ZW5lclRpbWVvdXQpXG4gICAgICBpZiAoYXR0YWNoZWRMaXN0ZW5lcnMpIHtcbiAgICAgICAgdmlld3BvcnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGhhbmRsZU1vdXNlbGVhdmUpXG4gICAgICAgIHZpZXdwb3J0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBoYW5kbGVNb3VzZWVudGVyKVxuICAgICAgICB2aWV3cG9ydC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5ZG93bilcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gZmlyZSAoKSB7XG4gICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZygnY2hlY2tFeGl0IC0gRmlyZScpXG4gICAgY2FsbGJhY2soKVxuICAgIGNsZWFudXAoKVxuICB9XG5cbiAgZnVuY3Rpb24gYXR0YWNoRXZlbnRMaXN0ZW5lcnMgKCkge1xuICAgIGlmIChkZWJ1ZykgY29uc29sZS5sb2coJ2NoZWNrRXhpdCAtIEF0dGFjaGVkIGxpc3RlbmVycycpXG4gICAgdmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGhhbmRsZU1vdXNlbGVhdmUpXG4gICAgdmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIGhhbmRsZU1vdXNlZW50ZXIpXG4gICAgdmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGhhbmRsZUtleWRvd24pXG4gICAgYXR0YWNoZWRMaXN0ZW5lcnMgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVNb3VzZWxlYXZlIChlKSB7XG4gICAgaWYgKGUuY2xpZW50WSA+IHNlbnNpdGl2aXR5KSByZXR1cm5cbiAgICBkZWxheVRpbWVyID0gc2V0VGltZW91dChmaXJlLCBkZWxheSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU1vdXNlZW50ZXIgKCkge1xuICAgIGlmICghZGVsYXlUaW1lcikgcmV0dXJuXG4gICAgY2xlYXJUaW1lb3V0KGRlbGF5VGltZXIpXG4gICAgZGVsYXlUaW1lciA9IG51bGxcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUtleWRvd24gKGUpIHtcbiAgICBpZiAoZGlzYWJsZUtleWRvd24gfHwgIWUubWV0YUtleSB8fCBlLmtleUNvZGUgIT09IDc2KSByZXR1cm5cbiAgICBkaXNhYmxlS2V5ZG93biA9IHRydWVcbiAgICBkZWxheVRpbWVyID0gc2V0VGltZW91dChmaXJlLCBkZWxheSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaW5pdCxcbiAgICBjbGVhbnVwXG4gIH1cbn1cbiIsImNvbnN0IF8gPSByZXF1aXJlKCdzbGFwZGFzaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2hlY2tJbmFjdGl2aXR5IChkZWxheSwgY2IpIHtcbiAgY29uc3QgeyBzZXRUaW1lb3V0LCBjbGVhclRpbWVvdXQgfSA9IHdpbmRvd1xuICBsZXQgdGltZXJcbiAgY29uc3QgZXZlbnRzID0gWyd0b3VjaHN0YXJ0JywgJ2NsaWNrJywgJ3Njcm9sbCcsICdrZXl1cCcsICdrZXlwcmVzcycsICdtb3VzZW1vdmUnXVxuXG4gIHJlc2V0VGltZXIoKVxuXG4gIGV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBfLmRlYm91bmNlKHJlc2V0VGltZXIsIDUwMCkpKVxuXG4gIGZ1bmN0aW9uIHJlc2V0VGltZXIgKCkge1xuICAgIGNsZWFyVGltZW91dCh0aW1lcilcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZmlyZSwgZGVsYXkgKiAxMDAwKVxuICB9XG5cbiAgZnVuY3Rpb24gZmlyZSAoKSB7XG4gICAgZGlzcG9zZSgpXG4gICAgY2IoKVxuICB9XG5cbiAgZnVuY3Rpb24gZGlzcG9zZSAoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKVxuICAgIGV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCByZXNldFRpbWVyKSlcbiAgfVxuXG4gIHJldHVybiBkaXNwb3NlXG59XG4iLCJjb25zdCBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxuY29uc3Qgb25jZSA9IHJlcXVpcmUoJy4uL2xpYi9vbmNlJylcbmNvbnN0IHdpdGhSZXN0b3JlQWxsID0gcmVxdWlyZSgnLi4vbGliL3dpdGhSZXN0b3JlQWxsJylcbmNvbnN0IHByb21pc2VkID0gcmVxdWlyZSgnLi4vbGliL3Byb21pc2VkJylcbmNvbnN0IG5vb3AgPSAoKSA9PiB7fVxuXG5mdW5jdGlvbiBvbkV2ZW50IChlbCwgdHlwZSwgZm4pIHtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbilcbiAgcmV0dXJuIG9uY2UoKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmbikpXG59XG5cbmZ1bmN0aW9uIHN0eWxlIChlbCwgY3NzLCBmbikge1xuICBjb25zdCBvcmlnaW5hbFN0eWxlID0gZWwuZ2V0QXR0cmlidXRlKCdzdHlsZScpXG4gIGNvbnN0IG5ld1N0eWxlID0gdHlwZW9mIGNzcyA9PT0gJ3N0cmluZycgPyBmcm9tU3R5bGUoY3NzKSA6IGNzc1xuICBjb25zdCBtZXJnZWQgPSB7XG4gICAgLi4uZnJvbVN0eWxlKG9yaWdpbmFsU3R5bGUpLFxuICAgIC4uLm5ld1N0eWxlXG4gIH1cbiAgZWwuc2V0QXR0cmlidXRlKCdzdHlsZScsIHRvU3R5bGUobWVyZ2VkKSlcbiAgcmV0dXJuIG9uY2UoKCkgPT4gZWwuc2V0QXR0cmlidXRlKCdzdHlsZScsIG9yaWdpbmFsU3R5bGUpKVxufVxuXG5mdW5jdGlvbiBmcm9tU3R5bGUgKHN0eWxlKSB7XG4gIGlmICghc3R5bGUpIHN0eWxlID0gJydcbiAgcmV0dXJuIHN0eWxlLnNwbGl0KCc7JykucmVkdWNlKChtZW1vLCB2YWwpID0+IHtcbiAgICBpZiAoIXZhbCkgcmV0dXJuIG1lbW9cbiAgICBjb25zdCBba2V5LCAuLi52YWx1ZV0gPSB2YWwuc3BsaXQoJzonKVxuICAgIG1lbW9ba2V5XSA9IHZhbHVlLmpvaW4oJzonKVxuICAgIHJldHVybiBtZW1vXG4gIH0sIHt9KVxufVxuXG5mdW5jdGlvbiB0b1N0eWxlIChjc3MpIHtcbiAgcmV0dXJuIF8ua2V5cyhjc3MpLnJlZHVjZSgobWVtbywga2V5KSA9PiB7XG4gICAgcmV0dXJuIG1lbW8gKyBgJHtrZWJhYihrZXkpfToke2Nzc1trZXldfTtgXG4gIH0sICcnKVxufVxuXG5mdW5jdGlvbiBrZWJhYiAoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFtBLVpdKS9nLCAnLSQxJykudG9Mb3dlckNhc2UoKVxufVxuXG5mdW5jdGlvbiBpc0luVmlld1BvcnQgKGVsKSB7XG4gIGlmIChlbCAmJiBlbC5wYXJlbnRFbGVtZW50KSB7XG4gICAgY29uc3QgeyB0b3AsIGJvdHRvbSB9ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCBpc0Fib3ZlV2luZG93c0JvdHRvbSA9XG4gICAgICB0b3AgPT09IGJvdHRvbVxuICAgICAgICA/IC8vIElmIGJvdGggYm90dG9tIGFuZCB0b3AgYXJlIGF0IHdpbmRvdy5pbm5lckhlaWdodFxuICAgICAgICAgIC8vIHRoZSBlbGVtZW50IGlzIGVudGlyZWx5IGluc2lkZSB0aGUgdmlld3BvcnRcbiAgICAgICAgICB0b3AgPD0gd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgIDogLy8gSWYgdGhlIGVsZW1lbnQgaGFzIGhlaWdodCwgd2hlbiB0b3AgaXMgYXQgd2luZG93LmlubmVySGVpZ2h0XG4gICAgICAgICAgLy8gdGhlIGVsZW1lbnQgaXMgYmVsb3cgdGhlIHdpbmRvd1xuICAgICAgICAgIHRvcCA8IHdpbmRvdy5pbm5lckhlaWdodFxuICAgIGNvbnN0IGlzQmVsb3dXaW5kb3dzVG9wID1cbiAgICAgIHRvcCA9PT0gYm90dG9tXG4gICAgICAgID8gLy8gSWYgYm90aCBib3R0b20gYW5kIHRvcCBhcmUgYXQgMHB4XG4gICAgICAgICAgLy8gdGhlIGVsZW1lbnQgaXMgZW50aXJlbHkgaW5zaWRlIHRoZSB2aWV3cG9ydFxuICAgICAgICAgIGJvdHRvbSA+PSAwXG4gICAgICAgIDogLy8gSWYgdGhlIGVsZW1lbnQgaGFzIGhlaWdodCwgd2hlbiBib3R0b20gaXMgYXQgMHB4XG4gICAgICAgICAgLy8gdGhlIGVsZW1lbnQgaXMgYWJvdmUgdGhlIHdpbmRvd1xuICAgICAgICAgIGJvdHRvbSA+IDBcbiAgICByZXR1cm4gaXNBYm92ZVdpbmRvd3NCb3R0b20gJiYgaXNCZWxvd1dpbmRvd3NUb3BcbiAgfVxufVxuXG5mdW5jdGlvbiBvbkFueUVudGVyVmlld3BvcnQgKGVscywgZm4pIHtcbiAgY29uc3QgZGlzcG9zYWJsZXMgPSBbXVxuICBfLmVhY2goZWxzLCBlbCA9PiBkaXNwb3NhYmxlcy5wdXNoKG9uRW50ZXJWaWV3cG9ydChlbCwgZm4pKSlcbiAgcmV0dXJuIG9uY2UoKCkgPT4ge1xuICAgIHdoaWxlIChkaXNwb3NhYmxlcy5sZW5ndGgpIGRpc3Bvc2FibGVzLnBvcCgpKClcbiAgfSlcbn1cblxuZnVuY3Rpb24gb25FbnRlclZpZXdwb3J0IChlbCwgZm4sIHNjcm9sbFRhcmdldEVsID0gd2luZG93KSB7XG4gIGlmIChfLmlzQXJyYXkoZWwpKSB7XG4gICAgcmV0dXJuIG9uQW55RW50ZXJWaWV3cG9ydChlbCwgZm4pXG4gIH1cblxuICBpZiAoaXNJblZpZXdQb3J0KGVsKSkge1xuICAgIGZuKClcbiAgICByZXR1cm4gbm9vcFxuICB9XG5cbiAgY29uc3QgaGFuZGxlU2Nyb2xsID0gXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgaWYgKGlzSW5WaWV3UG9ydChlbCkpIHtcbiAgICAgIHNjcm9sbFRhcmdldEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGhhbmRsZVNjcm9sbClcbiAgICAgIGZuKClcbiAgICB9XG4gIH0sIDUwKVxuICBzY3JvbGxUYXJnZXRFbC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBoYW5kbGVTY3JvbGwpXG4gIHJldHVybiBvbmNlKCgpID0+IHNjcm9sbFRhcmdldEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGhhbmRsZVNjcm9sbCkpXG59XG5cbmZ1bmN0aW9uIHJlcGxhY2UgKHRhcmdldCwgZWwpIHtcbiAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnRcbiAgcGFyZW50Lmluc2VydEJlZm9yZShlbCwgdGFyZ2V0Lm5leHRTaWJsaW5nKVxuICBwYXJlbnQucmVtb3ZlQ2hpbGQodGFyZ2V0KVxuICByZXR1cm4gb25jZSgoKSA9PiByZXBsYWNlKGVsLCB0YXJnZXQpKVxufVxuXG5mdW5jdGlvbiBpbnNlcnRBZnRlciAodGFyZ2V0LCBlbCkge1xuICBjb25zdCBwYXJlbnQgPSB0YXJnZXQucGFyZW50RWxlbWVudFxuICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQubmV4dFNpYmxpbmcpXG4gIHJldHVybiBvbmNlKCgpID0+IHBhcmVudC5yZW1vdmVDaGlsZChlbCkpXG59XG5cbmZ1bmN0aW9uIGluc2VydEJlZm9yZSAodGFyZ2V0LCBlbCkge1xuICBjb25zdCBwYXJlbnQgPSB0YXJnZXQucGFyZW50RWxlbWVudFxuICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQpXG4gIHJldHVybiBvbmNlKCgpID0+IHBhcmVudC5yZW1vdmVDaGlsZChlbCkpXG59XG5cbmZ1bmN0aW9uIGFwcGVuZENoaWxkICh0YXJnZXQsIGVsKSB7XG4gIHRhcmdldC5hcHBlbmRDaGlsZChlbClcbiAgcmV0dXJuIG9uY2UoKCkgPT4gdGFyZ2V0LnJlbW92ZUNoaWxkKGVsKSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIGNvbnN0IHV0aWxzID0gd2l0aFJlc3RvcmVBbGwoe1xuICAgIG9uRXZlbnQsXG4gICAgb25FbnRlclZpZXdwb3J0LFxuICAgIHJlcGxhY2UsXG4gICAgc3R5bGUsXG4gICAgaW5zZXJ0QWZ0ZXIsXG4gICAgaW5zZXJ0QmVmb3JlLFxuICAgIGFwcGVuZENoaWxkLFxuICAgIGNsb3Nlc3RcbiAgfSlcblxuICBfLmVhY2goXy5rZXlzKHV0aWxzKSwga2V5ID0+IHtcbiAgICBpZiAoa2V5LmluZGV4T2YoJ29uJykgPT09IDApIHV0aWxzW2tleV0gPSBwcm9taXNlZCh1dGlsc1trZXldKVxuICB9KVxuXG4gIHJldHVybiB1dGlsc1xufVxuXG5mdW5jdGlvbiBjbG9zZXN0IChlbGVtZW50LCBzZWxlY3Rvcikge1xuICBpZiAod2luZG93LkVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QpIHtcbiAgICByZXR1cm4gd2luZG93LkVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QuY2FsbChlbGVtZW50LCBzZWxlY3RvcilcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBtYXRjaGVzID0gd2luZG93LkVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgfHxcbiAgICAgIHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgd2luZG93LkVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvclxuXG4gICAgbGV0IGVsID0gZWxlbWVudFxuXG4gICAgZG8ge1xuICAgICAgaWYgKG1hdGNoZXMuY2FsbChlbCwgc2VsZWN0b3IpKSByZXR1cm4gZWxcbiAgICAgIGVsID0gZWwucGFyZW50RWxlbWVudCB8fCBlbC5wYXJlbnROb2RlXG4gICAgfSB3aGlsZSAoZWwgIT09IG51bGwgJiYgZWwubm9kZVR5cGUgPT09IDEpXG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvbmNlIChmbikge1xuICBsZXQgY2FsbGVkID0gZmFsc2VcbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgaWYgKGNhbGxlZCkgcmV0dXJuXG4gICAgY2FsbGVkID0gdHJ1ZVxuICAgIHJldHVybiBmbiguLi5hcmdzKVxuICB9XG59XG4iLCJjb25zdCBQcm9taXNlID0gcmVxdWlyZSgnc3luYy1wJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwcm9taXNlZCAoZm4pIHtcbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBmbiguLi5hcmdzKVxuICAgIH1cbiAgICBsZXQgZGlzcG9zZVxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGFyZ3MucHVzaChyZXNvbHZlKVxuICAgICAgZGlzcG9zZSA9IGZuKC4uLmFyZ3MpXG4gICAgfSkudGhlbih2YWx1ZSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGRpc3Bvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGlzcG9zZSgpXG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWVcbiAgICB9KVxuICB9XG59XG4iLCJjb25zdCBfID0gcmVxdWlyZSgnc2xhcGRhc2gnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHdpdGhSZXN0b3JlQWxsICh1dGlscykge1xuICBjb25zdCBjbGVhbnVwID0gW11cblxuICBmdW5jdGlvbiByZXN0b3JhYmxlIChmbikge1xuICAgIHJldHVybiAoLi4uYXJncykgPT4ge1xuICAgICAgY29uc3QgZGlzcG9zZSA9IGZuKC4uLmFyZ3MpXG4gICAgICBpZiAodHlwZW9mIGRpc3Bvc2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2xlYW51cC5wdXNoKGRpc3Bvc2UpXG4gICAgICB9XG4gICAgICByZXR1cm4gZGlzcG9zZVxuICAgIH1cbiAgfVxuICBjb25zdCByZXN1bHQgPSB7fVxuXG4gIGZvciAoY29uc3Qga2V5IG9mIF8ua2V5cyh1dGlscykpIHtcbiAgICByZXN1bHRba2V5XSA9IHJlc3RvcmFibGUodXRpbHNba2V5XSlcbiAgfVxuXG4gIHJlc3VsdC5yZXN0b3JlQWxsID0gZnVuY3Rpb24gcmVzdG9yZUFsbCAoKSB7XG4gICAgd2hpbGUgKGNsZWFudXAubGVuZ3RoKSBjbGVhbnVwLnBvcCgpKClcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cbiIsInZhciBuLGwsdSxpLHQsbyxyLGYsZT17fSxjPVtdLHM9L2FjaXR8ZXgoPzpzfGd8bnxwfCQpfHJwaHxncmlkfG93c3xtbmN8bnR3fGluZVtjaF18em9vfF5vcmR8aXRlcmEvaTtmdW5jdGlvbiBhKG4sbCl7Zm9yKHZhciB1IGluIGwpblt1XT1sW3VdO3JldHVybiBufWZ1bmN0aW9uIGgobil7dmFyIGw9bi5wYXJlbnROb2RlO2wmJmwucmVtb3ZlQ2hpbGQobil9ZnVuY3Rpb24gdihsLHUsaSl7dmFyIHQsbyxyLGY9e307Zm9yKHIgaW4gdSlcImtleVwiPT1yP3Q9dVtyXTpcInJlZlwiPT1yP289dVtyXTpmW3JdPXVbcl07aWYoYXJndW1lbnRzLmxlbmd0aD4yJiYoZi5jaGlsZHJlbj1hcmd1bWVudHMubGVuZ3RoPjM/bi5jYWxsKGFyZ3VtZW50cywyKTppKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBsJiZudWxsIT1sLmRlZmF1bHRQcm9wcylmb3IociBpbiBsLmRlZmF1bHRQcm9wcyl2b2lkIDA9PT1mW3JdJiYoZltyXT1sLmRlZmF1bHRQcm9wc1tyXSk7cmV0dXJuIHkobCxmLHQsbyxudWxsKX1mdW5jdGlvbiB5KG4saSx0LG8scil7dmFyIGY9e3R5cGU6bixwcm9wczppLGtleTp0LHJlZjpvLF9fazpudWxsLF9fOm51bGwsX19iOjAsX19lOm51bGwsX19kOnZvaWQgMCxfX2M6bnVsbCxfX2g6bnVsbCxjb25zdHJ1Y3Rvcjp2b2lkIDAsX192Om51bGw9PXI/Kyt1OnJ9O3JldHVybiBudWxsPT1yJiZudWxsIT1sLnZub2RlJiZsLnZub2RlKGYpLGZ9ZnVuY3Rpb24gcCgpe3JldHVybntjdXJyZW50Om51bGx9fWZ1bmN0aW9uIGQobil7cmV0dXJuIG4uY2hpbGRyZW59ZnVuY3Rpb24gXyhuLGwpe3RoaXMucHJvcHM9bix0aGlzLmNvbnRleHQ9bH1mdW5jdGlvbiBrKG4sbCl7aWYobnVsbD09bClyZXR1cm4gbi5fXz9rKG4uX18sbi5fXy5fX2suaW5kZXhPZihuKSsxKTpudWxsO2Zvcih2YXIgdTtsPG4uX19rLmxlbmd0aDtsKyspaWYobnVsbCE9KHU9bi5fX2tbbF0pJiZudWxsIT11Ll9fZSlyZXR1cm4gdS5fX2U7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2Ygbi50eXBlP2sobik6bnVsbH1mdW5jdGlvbiBiKG4pe3ZhciBsLHU7aWYobnVsbCE9KG49bi5fXykmJm51bGwhPW4uX19jKXtmb3Iobi5fX2U9bi5fX2MuYmFzZT1udWxsLGw9MDtsPG4uX19rLmxlbmd0aDtsKyspaWYobnVsbCE9KHU9bi5fX2tbbF0pJiZudWxsIT11Ll9fZSl7bi5fX2U9bi5fX2MuYmFzZT11Ll9fZTticmVha31yZXR1cm4gYihuKX19ZnVuY3Rpb24gbShuKXsoIW4uX19kJiYobi5fX2Q9ITApJiZ0LnB1c2gobikmJiFnLl9fcisrfHxyIT09bC5kZWJvdW5jZVJlbmRlcmluZykmJigocj1sLmRlYm91bmNlUmVuZGVyaW5nKXx8bykoZyl9ZnVuY3Rpb24gZygpe2Zvcih2YXIgbjtnLl9fcj10Lmxlbmd0aDspbj10LnNvcnQoZnVuY3Rpb24obixsKXtyZXR1cm4gbi5fX3YuX19iLWwuX192Ll9fYn0pLHQ9W10sbi5zb21lKGZ1bmN0aW9uKG4pe3ZhciBsLHUsaSx0LG8scjtuLl9fZCYmKG89KHQ9KGw9bikuX192KS5fX2UsKHI9bC5fX1ApJiYodT1bXSwoaT1hKHt9LHQpKS5fX3Y9dC5fX3YrMSxqKHIsdCxpLGwuX19uLHZvaWQgMCE9PXIub3duZXJTVkdFbGVtZW50LG51bGwhPXQuX19oP1tvXTpudWxsLHUsbnVsbD09bz9rKHQpOm8sdC5fX2gpLHoodSx0KSx0Ll9fZSE9byYmYih0KSkpfSl9ZnVuY3Rpb24gdyhuLGwsdSxpLHQsbyxyLGYscyxhKXt2YXIgaCx2LHAsXyxiLG0sZyx3PWkmJmkuX19rfHxjLEE9dy5sZW5ndGg7Zm9yKHUuX19rPVtdLGg9MDtoPGwubGVuZ3RoO2grKylpZihudWxsIT0oXz11Ll9fa1toXT1udWxsPT0oXz1sW2hdKXx8XCJib29sZWFuXCI9PXR5cGVvZiBfP251bGw6XCJzdHJpbmdcIj09dHlwZW9mIF98fFwibnVtYmVyXCI9PXR5cGVvZiBffHxcImJpZ2ludFwiPT10eXBlb2YgXz95KG51bGwsXyxudWxsLG51bGwsXyk6QXJyYXkuaXNBcnJheShfKT95KGQse2NoaWxkcmVuOl99LG51bGwsbnVsbCxudWxsKTpfLl9fYj4wP3koXy50eXBlLF8ucHJvcHMsXy5rZXksbnVsbCxfLl9fdik6Xykpe2lmKF8uX189dSxfLl9fYj11Ll9fYisxLG51bGw9PT0ocD13W2hdKXx8cCYmXy5rZXk9PXAua2V5JiZfLnR5cGU9PT1wLnR5cGUpd1toXT12b2lkIDA7ZWxzZSBmb3Iodj0wO3Y8QTt2Kyspe2lmKChwPXdbdl0pJiZfLmtleT09cC5rZXkmJl8udHlwZT09PXAudHlwZSl7d1t2XT12b2lkIDA7YnJlYWt9cD1udWxsfWoobixfLHA9cHx8ZSx0LG8scixmLHMsYSksYj1fLl9fZSwodj1fLnJlZikmJnAucmVmIT12JiYoZ3x8KGc9W10pLHAucmVmJiZnLnB1c2gocC5yZWYsbnVsbCxfKSxnLnB1c2godixfLl9fY3x8YixfKSksbnVsbCE9Yj8obnVsbD09bSYmKG09YiksXCJmdW5jdGlvblwiPT10eXBlb2YgXy50eXBlJiZfLl9faz09PXAuX19rP18uX19kPXM9eChfLHMsbik6cz1QKG4sXyxwLHcsYixzKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiB1LnR5cGUmJih1Ll9fZD1zKSk6cyYmcC5fX2U9PXMmJnMucGFyZW50Tm9kZSE9biYmKHM9ayhwKSl9Zm9yKHUuX19lPW0saD1BO2gtLTspbnVsbCE9d1toXSYmKFwiZnVuY3Rpb25cIj09dHlwZW9mIHUudHlwZSYmbnVsbCE9d1toXS5fX2UmJndbaF0uX19lPT11Ll9fZCYmKHUuX19kPWsoaSxoKzEpKSxOKHdbaF0sd1toXSkpO2lmKGcpZm9yKGg9MDtoPGcubGVuZ3RoO2grKylNKGdbaF0sZ1srK2hdLGdbKytoXSl9ZnVuY3Rpb24geChuLGwsdSl7Zm9yKHZhciBpLHQ9bi5fX2ssbz0wO3QmJm88dC5sZW5ndGg7bysrKShpPXRbb10pJiYoaS5fXz1uLGw9XCJmdW5jdGlvblwiPT10eXBlb2YgaS50eXBlP3goaSxsLHUpOlAodSxpLGksdCxpLl9fZSxsKSk7cmV0dXJuIGx9ZnVuY3Rpb24gQShuLGwpe3JldHVybiBsPWx8fFtdLG51bGw9PW58fFwiYm9vbGVhblwiPT10eXBlb2Ygbnx8KEFycmF5LmlzQXJyYXkobik/bi5zb21lKGZ1bmN0aW9uKG4pe0EobixsKX0pOmwucHVzaChuKSksbH1mdW5jdGlvbiBQKG4sbCx1LGksdCxvKXt2YXIgcixmLGU7aWYodm9pZCAwIT09bC5fX2Qpcj1sLl9fZCxsLl9fZD12b2lkIDA7ZWxzZSBpZihudWxsPT11fHx0IT1vfHxudWxsPT10LnBhcmVudE5vZGUpbjppZihudWxsPT1vfHxvLnBhcmVudE5vZGUhPT1uKW4uYXBwZW5kQ2hpbGQodCkscj1udWxsO2Vsc2V7Zm9yKGY9byxlPTA7KGY9Zi5uZXh0U2libGluZykmJmU8aS5sZW5ndGg7ZSs9MilpZihmPT10KWJyZWFrIG47bi5pbnNlcnRCZWZvcmUodCxvKSxyPW99cmV0dXJuIHZvaWQgMCE9PXI/cjp0Lm5leHRTaWJsaW5nfWZ1bmN0aW9uIEMobixsLHUsaSx0KXt2YXIgbztmb3IobyBpbiB1KVwiY2hpbGRyZW5cIj09PW98fFwia2V5XCI9PT1vfHxvIGluIGx8fEgobixvLG51bGwsdVtvXSxpKTtmb3IobyBpbiBsKXQmJlwiZnVuY3Rpb25cIiE9dHlwZW9mIGxbb118fFwiY2hpbGRyZW5cIj09PW98fFwia2V5XCI9PT1vfHxcInZhbHVlXCI9PT1vfHxcImNoZWNrZWRcIj09PW98fHVbb109PT1sW29dfHxIKG4sbyxsW29dLHVbb10saSl9ZnVuY3Rpb24gJChuLGwsdSl7XCItXCI9PT1sWzBdP24uc2V0UHJvcGVydHkobCx1KTpuW2xdPW51bGw9PXU/XCJcIjpcIm51bWJlclwiIT10eXBlb2YgdXx8cy50ZXN0KGwpP3U6dStcInB4XCJ9ZnVuY3Rpb24gSChuLGwsdSxpLHQpe3ZhciBvO246aWYoXCJzdHlsZVwiPT09bClpZihcInN0cmluZ1wiPT10eXBlb2YgdSluLnN0eWxlLmNzc1RleHQ9dTtlbHNle2lmKFwic3RyaW5nXCI9PXR5cGVvZiBpJiYobi5zdHlsZS5jc3NUZXh0PWk9XCJcIiksaSlmb3IobCBpbiBpKXUmJmwgaW4gdXx8JChuLnN0eWxlLGwsXCJcIik7aWYodSlmb3IobCBpbiB1KWkmJnVbbF09PT1pW2xdfHwkKG4uc3R5bGUsbCx1W2xdKX1lbHNlIGlmKFwib1wiPT09bFswXSYmXCJuXCI9PT1sWzFdKW89bCE9PShsPWwucmVwbGFjZSgvQ2FwdHVyZSQvLFwiXCIpKSxsPWwudG9Mb3dlckNhc2UoKWluIG4/bC50b0xvd2VyQ2FzZSgpLnNsaWNlKDIpOmwuc2xpY2UoMiksbi5sfHwobi5sPXt9KSxuLmxbbCtvXT11LHU/aXx8bi5hZGRFdmVudExpc3RlbmVyKGwsbz9UOkksbyk6bi5yZW1vdmVFdmVudExpc3RlbmVyKGwsbz9UOkksbyk7ZWxzZSBpZihcImRhbmdlcm91c2x5U2V0SW5uZXJIVE1MXCIhPT1sKXtpZih0KWw9bC5yZXBsYWNlKC94bGluayhIfDpoKS8sXCJoXCIpLnJlcGxhY2UoL3NOYW1lJC8sXCJzXCIpO2Vsc2UgaWYoXCJocmVmXCIhPT1sJiZcImxpc3RcIiE9PWwmJlwiZm9ybVwiIT09bCYmXCJ0YWJJbmRleFwiIT09bCYmXCJkb3dubG9hZFwiIT09bCYmbCBpbiBuKXRyeXtuW2xdPW51bGw9PXU/XCJcIjp1O2JyZWFrIG59Y2F0Y2gobil7fVwiZnVuY3Rpb25cIj09dHlwZW9mIHV8fChudWxsIT11JiYoITEhPT11fHxcImFcIj09PWxbMF0mJlwiclwiPT09bFsxXSk/bi5zZXRBdHRyaWJ1dGUobCx1KTpuLnJlbW92ZUF0dHJpYnV0ZShsKSl9fWZ1bmN0aW9uIEkobil7dGhpcy5sW24udHlwZSshMV0obC5ldmVudD9sLmV2ZW50KG4pOm4pfWZ1bmN0aW9uIFQobil7dGhpcy5sW24udHlwZSshMF0obC5ldmVudD9sLmV2ZW50KG4pOm4pfWZ1bmN0aW9uIGoobix1LGksdCxvLHIsZixlLGMpe3ZhciBzLGgsdix5LHAsayxiLG0sZyx4LEEsUD11LnR5cGU7aWYodm9pZCAwIT09dS5jb25zdHJ1Y3RvcilyZXR1cm4gbnVsbDtudWxsIT1pLl9faCYmKGM9aS5fX2gsZT11Ll9fZT1pLl9fZSx1Ll9faD1udWxsLHI9W2VdKSwocz1sLl9fYikmJnModSk7dHJ5e246aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUCl7aWYobT11LnByb3BzLGc9KHM9UC5jb250ZXh0VHlwZSkmJnRbcy5fX2NdLHg9cz9nP2cucHJvcHMudmFsdWU6cy5fXzp0LGkuX19jP2I9KGg9dS5fX2M9aS5fX2MpLl9fPWguX19FOihcInByb3RvdHlwZVwiaW4gUCYmUC5wcm90b3R5cGUucmVuZGVyP3UuX19jPWg9bmV3IFAobSx4KToodS5fX2M9aD1uZXcgXyhtLHgpLGguY29uc3RydWN0b3I9UCxoLnJlbmRlcj1PKSxnJiZnLnN1YihoKSxoLnByb3BzPW0saC5zdGF0ZXx8KGguc3RhdGU9e30pLGguY29udGV4dD14LGguX19uPXQsdj1oLl9fZD0hMCxoLl9faD1bXSksbnVsbD09aC5fX3MmJihoLl9fcz1oLnN0YXRlKSxudWxsIT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmKGguX19zPT1oLnN0YXRlJiYoaC5fX3M9YSh7fSxoLl9fcykpLGEoaC5fX3MsUC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMobSxoLl9fcykpKSx5PWgucHJvcHMscD1oLnN0YXRlLHYpbnVsbD09UC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJm51bGwhPWguY29tcG9uZW50V2lsbE1vdW50JiZoLmNvbXBvbmVudFdpbGxNb3VudCgpLG51bGwhPWguY29tcG9uZW50RGlkTW91bnQmJmguX19oLnB1c2goaC5jb21wb25lbnREaWRNb3VudCk7ZWxzZXtpZihudWxsPT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmbSE9PXkmJm51bGwhPWguY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyYmaC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG0seCksIWguX19lJiZudWxsIT1oLnNob3VsZENvbXBvbmVudFVwZGF0ZSYmITE9PT1oLnNob3VsZENvbXBvbmVudFVwZGF0ZShtLGguX19zLHgpfHx1Ll9fdj09PWkuX192KXtoLnByb3BzPW0saC5zdGF0ZT1oLl9fcyx1Ll9fdiE9PWkuX192JiYoaC5fX2Q9ITEpLGguX192PXUsdS5fX2U9aS5fX2UsdS5fX2s9aS5fX2ssdS5fX2suZm9yRWFjaChmdW5jdGlvbihuKXtuJiYobi5fXz11KX0pLGguX19oLmxlbmd0aCYmZi5wdXNoKGgpO2JyZWFrIG59bnVsbCE9aC5jb21wb25lbnRXaWxsVXBkYXRlJiZoLmNvbXBvbmVudFdpbGxVcGRhdGUobSxoLl9fcyx4KSxudWxsIT1oLmNvbXBvbmVudERpZFVwZGF0ZSYmaC5fX2gucHVzaChmdW5jdGlvbigpe2guY29tcG9uZW50RGlkVXBkYXRlKHkscCxrKX0pfWguY29udGV4dD14LGgucHJvcHM9bSxoLnN0YXRlPWguX19zLChzPWwuX19yKSYmcyh1KSxoLl9fZD0hMSxoLl9fdj11LGguX19QPW4scz1oLnJlbmRlcihoLnByb3BzLGguc3RhdGUsaC5jb250ZXh0KSxoLnN0YXRlPWguX19zLG51bGwhPWguZ2V0Q2hpbGRDb250ZXh0JiYodD1hKGEoe30sdCksaC5nZXRDaGlsZENvbnRleHQoKSkpLHZ8fG51bGw9PWguZ2V0U25hcHNob3RCZWZvcmVVcGRhdGV8fChrPWguZ2V0U25hcHNob3RCZWZvcmVVcGRhdGUoeSxwKSksQT1udWxsIT1zJiZzLnR5cGU9PT1kJiZudWxsPT1zLmtleT9zLnByb3BzLmNoaWxkcmVuOnMsdyhuLEFycmF5LmlzQXJyYXkoQSk/QTpbQV0sdSxpLHQsbyxyLGYsZSxjKSxoLmJhc2U9dS5fX2UsdS5fX2g9bnVsbCxoLl9faC5sZW5ndGgmJmYucHVzaChoKSxiJiYoaC5fX0U9aC5fXz1udWxsKSxoLl9fZT0hMX1lbHNlIG51bGw9PXImJnUuX192PT09aS5fX3Y/KHUuX19rPWkuX19rLHUuX19lPWkuX19lKTp1Ll9fZT1MKGkuX19lLHUsaSx0LG8scixmLGMpOyhzPWwuZGlmZmVkKSYmcyh1KX1jYXRjaChuKXt1Ll9fdj1udWxsLChjfHxudWxsIT1yKSYmKHUuX19lPWUsdS5fX2g9ISFjLHJbci5pbmRleE9mKGUpXT1udWxsKSxsLl9fZShuLHUsaSl9fWZ1bmN0aW9uIHoobix1KXtsLl9fYyYmbC5fX2ModSxuKSxuLnNvbWUoZnVuY3Rpb24odSl7dHJ5e249dS5fX2gsdS5fX2g9W10sbi5zb21lKGZ1bmN0aW9uKG4pe24uY2FsbCh1KX0pfWNhdGNoKG4pe2wuX19lKG4sdS5fX3YpfX0pfWZ1bmN0aW9uIEwobCx1LGksdCxvLHIsZixjKXt2YXIgcyxhLHYseT1pLnByb3BzLHA9dS5wcm9wcyxkPXUudHlwZSxfPTA7aWYoXCJzdmdcIj09PWQmJihvPSEwKSxudWxsIT1yKWZvcig7XzxyLmxlbmd0aDtfKyspaWYoKHM9cltfXSkmJlwic2V0QXR0cmlidXRlXCJpbiBzPT0hIWQmJihkP3MubG9jYWxOYW1lPT09ZDozPT09cy5ub2RlVHlwZSkpe2w9cyxyW19dPW51bGw7YnJlYWt9aWYobnVsbD09bCl7aWYobnVsbD09PWQpcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHApO2w9bz9kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLGQpOmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZCxwLmlzJiZwKSxyPW51bGwsYz0hMX1pZihudWxsPT09ZCl5PT09cHx8YyYmbC5kYXRhPT09cHx8KGwuZGF0YT1wKTtlbHNle2lmKHI9ciYmbi5jYWxsKGwuY2hpbGROb2RlcyksYT0oeT1pLnByb3BzfHxlKS5kYW5nZXJvdXNseVNldElubmVySFRNTCx2PXAuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwsIWMpe2lmKG51bGwhPXIpZm9yKHk9e30sXz0wO188bC5hdHRyaWJ1dGVzLmxlbmd0aDtfKyspeVtsLmF0dHJpYnV0ZXNbX10ubmFtZV09bC5hdHRyaWJ1dGVzW19dLnZhbHVlOyh2fHxhKSYmKHYmJihhJiZ2Ll9faHRtbD09YS5fX2h0bWx8fHYuX19odG1sPT09bC5pbm5lckhUTUwpfHwobC5pbm5lckhUTUw9diYmdi5fX2h0bWx8fFwiXCIpKX1pZihDKGwscCx5LG8sYyksdil1Ll9faz1bXTtlbHNlIGlmKF89dS5wcm9wcy5jaGlsZHJlbix3KGwsQXJyYXkuaXNBcnJheShfKT9fOltfXSx1LGksdCxvJiZcImZvcmVpZ25PYmplY3RcIiE9PWQscixmLHI/clswXTppLl9fayYmayhpLDApLGMpLG51bGwhPXIpZm9yKF89ci5sZW5ndGg7Xy0tOyludWxsIT1yW19dJiZoKHJbX10pO2N8fChcInZhbHVlXCJpbiBwJiZ2b2lkIDAhPT0oXz1wLnZhbHVlKSYmKF8hPT1sLnZhbHVlfHxcInByb2dyZXNzXCI9PT1kJiYhX3x8XCJvcHRpb25cIj09PWQmJl8hPT15LnZhbHVlKSYmSChsLFwidmFsdWVcIixfLHkudmFsdWUsITEpLFwiY2hlY2tlZFwiaW4gcCYmdm9pZCAwIT09KF89cC5jaGVja2VkKSYmXyE9PWwuY2hlY2tlZCYmSChsLFwiY2hlY2tlZFwiLF8seS5jaGVja2VkLCExKSl9cmV0dXJuIGx9ZnVuY3Rpb24gTShuLHUsaSl7dHJ5e1wiZnVuY3Rpb25cIj09dHlwZW9mIG4/bih1KTpuLmN1cnJlbnQ9dX1jYXRjaChuKXtsLl9fZShuLGkpfX1mdW5jdGlvbiBOKG4sdSxpKXt2YXIgdCxvO2lmKGwudW5tb3VudCYmbC51bm1vdW50KG4pLCh0PW4ucmVmKSYmKHQuY3VycmVudCYmdC5jdXJyZW50IT09bi5fX2V8fE0odCxudWxsLHUpKSxudWxsIT0odD1uLl9fYykpe2lmKHQuY29tcG9uZW50V2lsbFVubW91bnQpdHJ5e3QuY29tcG9uZW50V2lsbFVubW91bnQoKX1jYXRjaChuKXtsLl9fZShuLHUpfXQuYmFzZT10Ll9fUD1udWxsfWlmKHQ9bi5fX2spZm9yKG89MDtvPHQubGVuZ3RoO28rKyl0W29dJiZOKHRbb10sdSxcImZ1bmN0aW9uXCIhPXR5cGVvZiBuLnR5cGUpO2l8fG51bGw9PW4uX19lfHxoKG4uX19lKSxuLl9fZT1uLl9fZD12b2lkIDB9ZnVuY3Rpb24gTyhuLGwsdSl7cmV0dXJuIHRoaXMuY29uc3RydWN0b3Iobix1KX1mdW5jdGlvbiBTKHUsaSx0KXt2YXIgbyxyLGY7bC5fXyYmbC5fXyh1LGkpLHI9KG89XCJmdW5jdGlvblwiPT10eXBlb2YgdCk/bnVsbDp0JiZ0Ll9fa3x8aS5fX2ssZj1bXSxqKGksdT0oIW8mJnR8fGkpLl9faz12KGQsbnVsbCxbdV0pLHJ8fGUsZSx2b2lkIDAhPT1pLm93bmVyU1ZHRWxlbWVudCwhbyYmdD9bdF06cj9udWxsOmkuZmlyc3RDaGlsZD9uLmNhbGwoaS5jaGlsZE5vZGVzKTpudWxsLGYsIW8mJnQ/dDpyP3IuX19lOmkuZmlyc3RDaGlsZCxvKSx6KGYsdSl9ZnVuY3Rpb24gcShuLGwpe1MobixsLHEpfWZ1bmN0aW9uIEIobCx1LGkpe3ZhciB0LG8scixmPWEoe30sbC5wcm9wcyk7Zm9yKHIgaW4gdSlcImtleVwiPT1yP3Q9dVtyXTpcInJlZlwiPT1yP289dVtyXTpmW3JdPXVbcl07cmV0dXJuIGFyZ3VtZW50cy5sZW5ndGg+MiYmKGYuY2hpbGRyZW49YXJndW1lbnRzLmxlbmd0aD4zP24uY2FsbChhcmd1bWVudHMsMik6aSkseShsLnR5cGUsZix0fHxsLmtleSxvfHxsLnJlZixudWxsKX1mdW5jdGlvbiBEKG4sbCl7dmFyIHU9e19fYzpsPVwiX19jQ1wiK2YrKyxfXzpuLENvbnN1bWVyOmZ1bmN0aW9uKG4sbCl7cmV0dXJuIG4uY2hpbGRyZW4obCl9LFByb3ZpZGVyOmZ1bmN0aW9uKG4pe3ZhciB1LGk7cmV0dXJuIHRoaXMuZ2V0Q2hpbGRDb250ZXh0fHwodT1bXSwoaT17fSlbbF09dGhpcyx0aGlzLmdldENoaWxkQ29udGV4dD1mdW5jdGlvbigpe3JldHVybiBpfSx0aGlzLnNob3VsZENvbXBvbmVudFVwZGF0ZT1mdW5jdGlvbihuKXt0aGlzLnByb3BzLnZhbHVlIT09bi52YWx1ZSYmdS5zb21lKG0pfSx0aGlzLnN1Yj1mdW5jdGlvbihuKXt1LnB1c2gobik7dmFyIGw9bi5jb21wb25lbnRXaWxsVW5tb3VudDtuLmNvbXBvbmVudFdpbGxVbm1vdW50PWZ1bmN0aW9uKCl7dS5zcGxpY2UodS5pbmRleE9mKG4pLDEpLGwmJmwuY2FsbChuKX19KSxuLmNoaWxkcmVufX07cmV0dXJuIHUuUHJvdmlkZXIuX189dS5Db25zdW1lci5jb250ZXh0VHlwZT11fW49Yy5zbGljZSxsPXtfX2U6ZnVuY3Rpb24obixsLHUsaSl7Zm9yKHZhciB0LG8scjtsPWwuX187KWlmKCh0PWwuX19jKSYmIXQuX18pdHJ5e2lmKChvPXQuY29uc3RydWN0b3IpJiZudWxsIT1vLmdldERlcml2ZWRTdGF0ZUZyb21FcnJvciYmKHQuc2V0U3RhdGUoby5nZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IobikpLHI9dC5fX2QpLG51bGwhPXQuY29tcG9uZW50RGlkQ2F0Y2gmJih0LmNvbXBvbmVudERpZENhdGNoKG4saXx8e30pLHI9dC5fX2QpLHIpcmV0dXJuIHQuX19FPXR9Y2F0Y2gobCl7bj1sfXRocm93IG59fSx1PTAsaT1mdW5jdGlvbihuKXtyZXR1cm4gbnVsbCE9biYmdm9pZCAwPT09bi5jb25zdHJ1Y3Rvcn0sXy5wcm90b3R5cGUuc2V0U3RhdGU9ZnVuY3Rpb24obixsKXt2YXIgdTt1PW51bGwhPXRoaXMuX19zJiZ0aGlzLl9fcyE9PXRoaXMuc3RhdGU/dGhpcy5fX3M6dGhpcy5fX3M9YSh7fSx0aGlzLnN0YXRlKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBuJiYobj1uKGEoe30sdSksdGhpcy5wcm9wcykpLG4mJmEodSxuKSxudWxsIT1uJiZ0aGlzLl9fdiYmKGwmJnRoaXMuX19oLnB1c2gobCksbSh0aGlzKSl9LF8ucHJvdG90eXBlLmZvcmNlVXBkYXRlPWZ1bmN0aW9uKG4pe3RoaXMuX192JiYodGhpcy5fX2U9ITAsbiYmdGhpcy5fX2gucHVzaChuKSxtKHRoaXMpKX0sXy5wcm90b3R5cGUucmVuZGVyPWQsdD1bXSxvPVwiZnVuY3Rpb25cIj09dHlwZW9mIFByb21pc2U/UHJvbWlzZS5wcm90b3R5cGUudGhlbi5iaW5kKFByb21pc2UucmVzb2x2ZSgpKTpzZXRUaW1lb3V0LGcuX19yPTAsZj0wO2V4cG9ydHtTIGFzIHJlbmRlcixxIGFzIGh5ZHJhdGUsdiBhcyBjcmVhdGVFbGVtZW50LHYgYXMgaCxkIGFzIEZyYWdtZW50LHAgYXMgY3JlYXRlUmVmLGkgYXMgaXNWYWxpZEVsZW1lbnQsXyBhcyBDb21wb25lbnQsQiBhcyBjbG9uZUVsZW1lbnQsRCBhcyBjcmVhdGVDb250ZXh0LEEgYXMgdG9DaGlsZEFycmF5LGwgYXMgb3B0aW9uc307XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3QubW9kdWxlLmpzLm1hcFxuIiwiaW1wb3J0e29wdGlvbnMgYXMgbn1mcm9tXCJwcmVhY3RcIjt2YXIgdCx1LHIsbz0wLGk9W10sYz1uLl9fYixmPW4uX19yLGU9bi5kaWZmZWQsYT1uLl9fYyx2PW4udW5tb3VudDtmdW5jdGlvbiBsKHQscil7bi5fX2gmJm4uX19oKHUsdCxvfHxyKSxvPTA7dmFyIGk9dS5fX0h8fCh1Ll9fSD17X186W10sX19oOltdfSk7cmV0dXJuIHQ+PWkuX18ubGVuZ3RoJiZpLl9fLnB1c2goe30pLGkuX19bdF19ZnVuY3Rpb24gbShuKXtyZXR1cm4gbz0xLHAodyxuKX1mdW5jdGlvbiBwKG4scixvKXt2YXIgaT1sKHQrKywyKTtyZXR1cm4gaS50PW4saS5fX2N8fChpLl9fPVtvP28ocik6dyh2b2lkIDAsciksZnVuY3Rpb24obil7dmFyIHQ9aS50KGkuX19bMF0sbik7aS5fX1swXSE9PXQmJihpLl9fPVt0LGkuX19bMV1dLGkuX19jLnNldFN0YXRlKHt9KSl9XSxpLl9fYz11KSxpLl9ffWZ1bmN0aW9uIHkocixvKXt2YXIgaT1sKHQrKywzKTshbi5fX3MmJmsoaS5fX0gsbykmJihpLl9fPXIsaS5fX0g9byx1Ll9fSC5fX2gucHVzaChpKSl9ZnVuY3Rpb24gZChyLG8pe3ZhciBpPWwodCsrLDQpOyFuLl9fcyYmayhpLl9fSCxvKSYmKGkuX189cixpLl9fSD1vLHUuX19oLnB1c2goaSkpfWZ1bmN0aW9uIGgobil7cmV0dXJuIG89NSxfKGZ1bmN0aW9uKCl7cmV0dXJue2N1cnJlbnQ6bn19LFtdKX1mdW5jdGlvbiBzKG4sdCx1KXtvPTYsZChmdW5jdGlvbigpe3JldHVyblwiZnVuY3Rpb25cIj09dHlwZW9mIG4/KG4odCgpKSxmdW5jdGlvbigpe3JldHVybiBuKG51bGwpfSk6bj8obi5jdXJyZW50PXQoKSxmdW5jdGlvbigpe3JldHVybiBuLmN1cnJlbnQ9bnVsbH0pOnZvaWQgMH0sbnVsbD09dT91OnUuY29uY2F0KG4pKX1mdW5jdGlvbiBfKG4sdSl7dmFyIHI9bCh0KyssNyk7cmV0dXJuIGsoci5fX0gsdSkmJihyLl9fPW4oKSxyLl9fSD11LHIuX19oPW4pLHIuX199ZnVuY3Rpb24gQShuLHQpe3JldHVybiBvPTgsXyhmdW5jdGlvbigpe3JldHVybiBufSx0KX1mdW5jdGlvbiBGKG4pe3ZhciByPXUuY29udGV4dFtuLl9fY10sbz1sKHQrKyw5KTtyZXR1cm4gby5jPW4scj8obnVsbD09by5fXyYmKG8uX189ITAsci5zdWIodSkpLHIucHJvcHMudmFsdWUpOm4uX199ZnVuY3Rpb24gVCh0LHUpe24udXNlRGVidWdWYWx1ZSYmbi51c2VEZWJ1Z1ZhbHVlKHU/dSh0KTp0KX1mdW5jdGlvbiBxKG4pe3ZhciByPWwodCsrLDEwKSxvPW0oKTtyZXR1cm4gci5fXz1uLHUuY29tcG9uZW50RGlkQ2F0Y2h8fCh1LmNvbXBvbmVudERpZENhdGNoPWZ1bmN0aW9uKG4pe3IuX18mJnIuX18obiksb1sxXShuKX0pLFtvWzBdLGZ1bmN0aW9uKCl7b1sxXSh2b2lkIDApfV19ZnVuY3Rpb24geCgpe2Zvcih2YXIgdDt0PWkuc2hpZnQoKTspaWYodC5fX1ApdHJ5e3QuX19ILl9faC5mb3JFYWNoKGcpLHQuX19ILl9faC5mb3JFYWNoKGopLHQuX19ILl9faD1bXX1jYXRjaCh1KXt0Ll9fSC5fX2g9W10sbi5fX2UodSx0Ll9fdil9fW4uX19iPWZ1bmN0aW9uKG4pe3U9bnVsbCxjJiZjKG4pfSxuLl9fcj1mdW5jdGlvbihuKXtmJiZmKG4pLHQ9MDt2YXIgcj0odT1uLl9fYykuX19IO3ImJihyLl9faC5mb3JFYWNoKGcpLHIuX19oLmZvckVhY2goaiksci5fX2g9W10pfSxuLmRpZmZlZD1mdW5jdGlvbih0KXtlJiZlKHQpO3ZhciBvPXQuX19jO28mJm8uX19IJiZvLl9fSC5fX2gubGVuZ3RoJiYoMSE9PWkucHVzaChvKSYmcj09PW4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHwoKHI9bi5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpfHxmdW5jdGlvbihuKXt2YXIgdCx1PWZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KHIpLGImJmNhbmNlbEFuaW1hdGlvbkZyYW1lKHQpLHNldFRpbWVvdXQobil9LHI9c2V0VGltZW91dCh1LDEwMCk7YiYmKHQ9cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHUpKX0pKHgpKSx1PW51bGx9LG4uX19jPWZ1bmN0aW9uKHQsdSl7dS5zb21lKGZ1bmN0aW9uKHQpe3RyeXt0Ll9faC5mb3JFYWNoKGcpLHQuX19oPXQuX19oLmZpbHRlcihmdW5jdGlvbihuKXtyZXR1cm4hbi5fX3x8aihuKX0pfWNhdGNoKHIpe3Uuc29tZShmdW5jdGlvbihuKXtuLl9faCYmKG4uX19oPVtdKX0pLHU9W10sbi5fX2Uocix0Ll9fdil9fSksYSYmYSh0LHUpfSxuLnVubW91bnQ9ZnVuY3Rpb24odCl7diYmdih0KTt2YXIgdSxyPXQuX19jO3ImJnIuX19IJiYoci5fX0guX18uZm9yRWFjaChmdW5jdGlvbihuKXt0cnl7ZyhuKX1jYXRjaChuKXt1PW59fSksdSYmbi5fX2UodSxyLl9fdikpfTt2YXIgYj1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ZnVuY3Rpb24gZyhuKXt2YXIgdD11LHI9bi5fX2M7XCJmdW5jdGlvblwiPT10eXBlb2YgciYmKG4uX19jPXZvaWQgMCxyKCkpLHU9dH1mdW5jdGlvbiBqKG4pe3ZhciB0PXU7bi5fX2M9bi5fXygpLHU9dH1mdW5jdGlvbiBrKG4sdCl7cmV0dXJuIW58fG4ubGVuZ3RoIT09dC5sZW5ndGh8fHQuc29tZShmdW5jdGlvbih0LHUpe3JldHVybiB0IT09blt1XX0pfWZ1bmN0aW9uIHcobix0KXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0P3Qobik6dH1leHBvcnR7bSBhcyB1c2VTdGF0ZSxwIGFzIHVzZVJlZHVjZXIseSBhcyB1c2VFZmZlY3QsZCBhcyB1c2VMYXlvdXRFZmZlY3QsaCBhcyB1c2VSZWYscyBhcyB1c2VJbXBlcmF0aXZlSGFuZGxlLF8gYXMgdXNlTWVtbyxBIGFzIHVzZUNhbGxiYWNrLEYgYXMgdXNlQ29udGV4dCxUIGFzIHVzZURlYnVnVmFsdWUscSBhcyB1c2VFcnJvckJvdW5kYXJ5fTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWhvb2tzLm1vZHVsZS5qcy5tYXBcbiIsInZhciB0b1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZ1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxudmFyIHJlZ2V4cENoYXJhY3RlcnMgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2dcbnZhciByZWdleHBJc05hdGl2ZUZuID0gdG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSlcbiAgLnJlcGxhY2UocmVnZXhwQ2hhcmFjdGVycywgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKVxudmFyIHJlZ2V4cElzTmF0aXZlID0gUmVnRXhwKCdeJyArIHJlZ2V4cElzTmF0aXZlRm4gKyAnJCcpXG5mdW5jdGlvbiB0b1NvdXJjZSAoZnVuYykge1xuICBpZiAoIWZ1bmMpIHJldHVybiAnJ1xuICB0cnkge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKGZ1bmMpXG4gIH0gY2F0Y2ggKGUpIHt9XG4gIHRyeSB7XG4gICAgcmV0dXJuIChmdW5jICsgJycpXG4gIH0gY2F0Y2ggKGUpIHt9XG59XG52YXIgYXNzaWduID0gT2JqZWN0LmFzc2lnblxudmFyIGZvckVhY2ggPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaFxudmFyIGV2ZXJ5ID0gQXJyYXkucHJvdG90eXBlLmV2ZXJ5XG52YXIgZmlsdGVyID0gQXJyYXkucHJvdG90eXBlLmZpbHRlclxudmFyIGZpbmQgPSBBcnJheS5wcm90b3R5cGUuZmluZFxudmFyIGluZGV4T2YgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5XG52YXIga2V5cyA9IE9iamVjdC5rZXlzXG52YXIgbWFwID0gQXJyYXkucHJvdG90eXBlLm1hcFxudmFyIHJlZHVjZSA9IEFycmF5LnByb3RvdHlwZS5yZWR1Y2VcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZVxudmFyIHNvbWUgPSBBcnJheS5wcm90b3R5cGUuc29tZVxudmFyIHZhbHVlcyA9IE9iamVjdC52YWx1ZXNcbmZ1bmN0aW9uIGlzTmF0aXZlIChtZXRob2QpIHtcbiAgcmV0dXJuIG1ldGhvZCAmJiB0eXBlb2YgbWV0aG9kID09PSAnZnVuY3Rpb24nICYmIHJlZ2V4cElzTmF0aXZlLnRlc3QodG9Tb3VyY2UobWV0aG9kKSlcbn1cbnZhciBfID0ge1xuICBhc3NpZ246IGlzTmF0aXZlKGFzc2lnbilcbiAgICA/IGFzc2lnblxuICAgIDogZnVuY3Rpb24gYXNzaWduICh0YXJnZXQpIHtcbiAgICAgIHZhciBsID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXVxuICAgICAgICBmb3IgKHZhciBqIGluIHNvdXJjZSkgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShqKSkgdGFyZ2V0W2pdID0gc291cmNlW2pdXG4gICAgICB9XG4gICAgICByZXR1cm4gdGFyZ2V0XG4gICAgfSxcbiAgYmluZDogZnVuY3Rpb24gYmluZCAobWV0aG9kLCBjb250ZXh0KSB7XG4gICAgdmFyIGFyZ3MgPSBfLnNsaWNlKGFyZ3VtZW50cywgMilcbiAgICByZXR1cm4gZnVuY3Rpb24gYm91bmRGdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KF8uc2xpY2UoYXJndW1lbnRzKSkpXG4gICAgfVxuICB9LFxuICBkZWJvdW5jZTogZnVuY3Rpb24gZGVib3VuY2UgKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpc1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHNcbiAgICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGltZW91dCA9IG51bGxcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcbiAgICAgIH1cbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dClcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KVxuICAgICAgaWYgKGNhbGxOb3cpIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcbiAgICB9XG4gIH0sXG4gIGVhY2g6IGlzTmF0aXZlKGZvckVhY2gpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVFYWNoIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBmb3JFYWNoLmNhbGwoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGVhY2ggKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICB9LFxuICBldmVyeTogaXNOYXRpdmUoZXZlcnkpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVFdmVyeSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGV2ZXJ5LmNhbGwoY29sbCwgcHJlZCwgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBldmVyeSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgaWYgKCFjb2xsIHx8ICFwcmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghcHJlZC5jYWxsKGNvbnRleHQsIGNvbGxbaV0sIGksIGNvbGwpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSxcbiAgZmlsdGVyOiBpc05hdGl2ZShmaWx0ZXIpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVGaWx0ZXIgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZpbHRlci5jYWxsKGFycmF5LCBjYWxsYmFjaywgY29udGV4dClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBmaWx0ZXIgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgdmFyIGwgPSBhcnJheS5sZW5ndGhcbiAgICAgIHZhciBvdXRwdXQgPSBbXVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KSkgb3V0cHV0LnB1c2goYXJyYXlbaV0pXG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcbiAgZmluZDogaXNOYXRpdmUoZmluZClcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUZpbmQgKGFycmF5LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGZpbmQuY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gZmluZCAoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoY29udGV4dCwgYXJyYXlbaV0sIGksIGFycmF5KSkgcmV0dXJuIGFycmF5W2ldXG4gICAgICB9XG4gICAgfSxcbiAgZ2V0OiBmdW5jdGlvbiBnZXQgKG9iamVjdCwgcGF0aCkge1xuICAgIHJldHVybiBfLnJlZHVjZShwYXRoLnNwbGl0KCcuJyksIGZ1bmN0aW9uIChtZW1vLCBuZXh0KSB7XG4gICAgICByZXR1cm4gKHR5cGVvZiBtZW1vICE9PSAndW5kZWZpbmVkJyAmJiBtZW1vICE9PSBudWxsKSA/IG1lbW9bbmV4dF0gOiB1bmRlZmluZWRcbiAgICB9LCBvYmplY3QpXG4gIH0sXG4gIGlkZW50aXR5OiBmdW5jdGlvbiBpZGVudGl0eSAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcbiAgaW5kZXhPZjogaXNOYXRpdmUoaW5kZXhPZilcbiAgICA/IGZ1bmN0aW9uIG5hdGl2ZUluZGV4T2YgKGFycmF5LCBpdGVtKSB7XG4gICAgICByZXR1cm4gaW5kZXhPZi5jYWxsKGFycmF5LCBpdGVtKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIGluZGV4T2YgKGFycmF5LCBpdGVtKSB7XG4gICAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xXG4gICAgfSxcbiAgaW52b2tlOiBmdW5jdGlvbiBpbnZva2UgKGFycmF5LCBtZXRob2ROYW1lKSB7XG4gICAgdmFyIGFyZ3MgPSBfLnNsaWNlKGFyZ3VtZW50cywgMilcbiAgICByZXR1cm4gXy5tYXAoYXJyYXksIGZ1bmN0aW9uIGludm9rZU1hcHBlciAodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZVttZXRob2ROYW1lXS5hcHBseSh2YWx1ZSwgYXJncylcbiAgICB9KVxuICB9LFxuICBpc0FycmF5OiBpc05hdGl2ZShpc0FycmF5KVxuICAgID8gZnVuY3Rpb24gbmF0aXZlQXJyYXkgKGNvbGwpIHtcbiAgICAgIHJldHVybiBpc0FycmF5KGNvbGwpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gaXNBcnJheSAob2JqKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgICB9LFxuICBpc01hdGNoOiBmdW5jdGlvbiBpc01hdGNoIChvYmosIHNwZWMpIHtcbiAgICBmb3IgKHZhciBpIGluIHNwZWMpIHtcbiAgICAgIGlmIChzcGVjLmhhc093blByb3BlcnR5KGkpICYmIG9ialtpXSAhPT0gc3BlY1tpXSkgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH0sXG4gIGlzT2JqZWN0OiBmdW5jdGlvbiBpc09iamVjdCAob2JqKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqXG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmpcbiAgfSxcbiAga2V5czogaXNOYXRpdmUoa2V5cylcbiAgICA/IGtleXNcbiAgICA6IGZ1bmN0aW9uIGtleXMgKG9iamVjdCkge1xuICAgICAgdmFyIGtleXMgPSBbXVxuICAgICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAgICBpZiAob2JqZWN0Lmhhc093blByb3BlcnR5KGtleSkpIGtleXMucHVzaChrZXkpXG4gICAgICB9XG4gICAgICByZXR1cm4ga2V5c1xuICAgIH0sXG4gIG1hcDogaXNOYXRpdmUobWFwKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlTWFwIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHJldHVybiBtYXAuY2FsbChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gbWFwIChhcnJheSwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICB2YXIgb3V0cHV0ID0gbmV3IEFycmF5KGwpXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBvdXRwdXRbaV0gPSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpLCBhcnJheSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXRcbiAgICB9LFxuICBtYXRjaGVzOiBmdW5jdGlvbiBtYXRjaGVzIChzcGVjKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiBfLmlzTWF0Y2gob2JqLCBzcGVjKVxuICAgIH1cbiAgfSxcbiAgbm90OiBmdW5jdGlvbiBub3QgKHZhbHVlKSB7XG4gICAgcmV0dXJuICF2YWx1ZVxuICB9LFxuICBvYmplY3RFYWNoOiBmdW5jdGlvbiAob2JqZWN0LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgIHJldHVybiBfLmVhY2goXy5rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKGNvbnRleHQsIG9iamVjdFtrZXldLCBrZXksIG9iamVjdClcbiAgICB9LCBjb250ZXh0KVxuICB9LFxuICBvYmplY3RNYXA6IGZ1bmN0aW9uIG9iamVjdE1hcCAob2JqZWN0LCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSB7fVxuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICByZXN1bHRba2V5XSA9IGNhbGxiYWNrLmNhbGwoY29udGV4dCwgb2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH0sXG4gIG9iamVjdFJlZHVjZTogZnVuY3Rpb24gb2JqZWN0UmVkdWNlIChvYmplY3QsIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpIHtcbiAgICB2YXIgb3V0cHV0ID0gaW5pdGlhbFZhbHVlXG4gICAgZm9yICh2YXIgaSBpbiBvYmplY3QpIHtcbiAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoaSkpIG91dHB1dCA9IGNhbGxiYWNrKG91dHB1dCwgb2JqZWN0W2ldLCBpLCBvYmplY3QpXG4gICAgfVxuICAgIHJldHVybiBvdXRwdXRcbiAgfSxcbiAgcGljazogZnVuY3Rpb24gcGljayAob2JqZWN0LCB0b1BpY2spIHtcbiAgICB2YXIgb3V0ID0ge31cbiAgICBfLmVhY2godG9QaWNrLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAodHlwZW9mIG9iamVjdFtrZXldICE9PSAndW5kZWZpbmVkJykgb3V0W2tleV0gPSBvYmplY3Rba2V5XVxuICAgIH0pXG4gICAgcmV0dXJuIG91dFxuICB9LFxuICBwbHVjazogZnVuY3Rpb24gcGx1Y2sgKGFycmF5LCBrZXkpIHtcbiAgICB2YXIgbCA9IGFycmF5Lmxlbmd0aFxuICAgIHZhciBvdXQgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSBpZiAoYXJyYXlbaV0pIG91dFtpXSA9IGFycmF5W2ldW2tleV1cbiAgICByZXR1cm4gb3V0XG4gIH0sXG4gIHJlZHVjZTogaXNOYXRpdmUocmVkdWNlKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlUmVkdWNlIChhcnJheSwgY2FsbGJhY2ssIGluaXRpYWxWYWx1ZSkge1xuICAgICAgcmV0dXJuIHJlZHVjZS5jYWxsKGFycmF5LCBjYWxsYmFjaywgaW5pdGlhbFZhbHVlKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIHJlZHVjZSAoYXJyYXksIGNhbGxiYWNrLCBpbml0aWFsVmFsdWUpIHtcbiAgICAgIHZhciBvdXRwdXQgPSBpbml0aWFsVmFsdWVcbiAgICAgIHZhciBsID0gYXJyYXkubGVuZ3RoXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykgb3V0cHV0ID0gY2FsbGJhY2sob3V0cHV0LCBhcnJheVtpXSwgaSwgYXJyYXkpXG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfSxcbiAgc2V0OiBmdW5jdGlvbiBzZXQgKG9iamVjdCwgcGF0aCwgdmFsKSB7XG4gICAgaWYgKCFvYmplY3QpIHJldHVybiBvYmplY3RcbiAgICBpZiAodHlwZW9mIG9iamVjdCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iamVjdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG9iamVjdFxuICAgIHZhciBwYXJ0cyA9IHBhdGguc3BsaXQoJy4nKVxuICAgIHZhciBjb250ZXh0ID0gb2JqZWN0XG4gICAgdmFyIG5leHRLZXlcbiAgICBkbyB7XG4gICAgICBuZXh0S2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgaWYgKHR5cGVvZiBjb250ZXh0W25leHRLZXldICE9PSAnb2JqZWN0JykgY29udGV4dFtuZXh0S2V5XSA9IHt9XG4gICAgICBpZiAocGFydHMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnRleHQgPSBjb250ZXh0W25leHRLZXldXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZXh0W25leHRLZXldID0gdmFsXG4gICAgICB9XG4gICAgfSB3aGlsZSAocGFydHMubGVuZ3RoKVxuICAgIHJldHVybiBvYmplY3RcbiAgfSxcbiAgc2xpY2U6IGlzTmF0aXZlKHNsaWNlKVxuICAgID8gZnVuY3Rpb24gbmF0aXZlU2xpY2UgKGFycmF5LCBiZWdpbiwgZW5kKSB7XG4gICAgICBiZWdpbiA9IGJlZ2luIHx8IDBcbiAgICAgIGVuZCA9IHR5cGVvZiBlbmQgPT09ICdudW1iZXInID8gZW5kIDogYXJyYXkubGVuZ3RoXG4gICAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgYmVnaW4sIGVuZClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiBzbGljZSAoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgICAgIHN0YXJ0ID0gc3RhcnQgfHwgMFxuICAgICAgZW5kID0gdHlwZW9mIGVuZCA9PT0gJ251bWJlcicgPyBlbmQgOiBhcnJheS5sZW5ndGhcbiAgICAgIHZhciBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aFxuICAgICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFtdXG4gICAgICB9XG4gICAgICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgICAgIHN0YXJ0ID0gLXN0YXJ0ID4gbGVuZ3RoID8gMCA6IChsZW5ndGggKyBzdGFydClcbiAgICAgIH1cbiAgICAgIGVuZCA9IGVuZCA+IGxlbmd0aCA/IGxlbmd0aCA6IGVuZFxuICAgICAgaWYgKGVuZCA8IDApIHtcbiAgICAgICAgZW5kICs9IGxlbmd0aFxuICAgICAgfVxuICAgICAgbGVuZ3RoID0gc3RhcnQgPiBlbmQgPyAwIDogKChlbmQgLSBzdGFydCkgPj4+IDApXG4gICAgICBzdGFydCA+Pj49IDBcbiAgICAgIHZhciBpbmRleCA9IC0xXG4gICAgICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KGxlbmd0aClcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBhcnJheVtpbmRleCArIHN0YXJ0XVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH0sXG4gIHNvbWU6IGlzTmF0aXZlKHNvbWUpXG4gICAgPyBmdW5jdGlvbiBuYXRpdmVTb21lIChjb2xsLCBwcmVkLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gc29tZS5jYWxsKGNvbGwsIHByZWQsIGNvbnRleHQpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gc29tZSAoY29sbCwgcHJlZCwgY29udGV4dCkge1xuICAgICAgaWYgKCFjb2xsIHx8ICFwcmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChwcmVkLmNhbGwoY29udGV4dCwgY29sbFtpXSwgaSwgY29sbCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9LFxuICB1bmlxdWU6IGZ1bmN0aW9uIHVuaXF1ZSAoYXJyYXkpIHtcbiAgICByZXR1cm4gXy5yZWR1Y2UoYXJyYXksIGZ1bmN0aW9uIChtZW1vLCBjdXJyKSB7XG4gICAgICBpZiAoXy5pbmRleE9mKG1lbW8sIGN1cnIpID09PSAtMSkge1xuICAgICAgICBtZW1vLnB1c2goY3VycilcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vXG4gICAgfSwgW10pXG4gIH0sXG4gIHZhbHVlczogaXNOYXRpdmUodmFsdWVzKVxuICAgID8gdmFsdWVzXG4gICAgOiBmdW5jdGlvbiB2YWx1ZXMgKG9iamVjdCkge1xuICAgICAgdmFyIG91dCA9IFtdXG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkgb3V0LnB1c2gob2JqZWN0W2tleV0pXG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0XG4gICAgfSxcbiAgbmFtZTogJ3NsYXBkYXNoJyxcbiAgdmVyc2lvbjogJzEuMy4zJ1xufVxuXy5vYmplY3RNYXAuYXNBcnJheSA9IGZ1bmN0aW9uIG9iamVjdE1hcEFzQXJyYXkgKG9iamVjdCwgY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgcmV0dXJuIF8ubWFwKF8ua2V5cyhvYmplY3QpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmNhbGwoY29udGV4dCwgb2JqZWN0W2tleV0sIGtleSwgb2JqZWN0KVxuICB9LCBjb250ZXh0KVxufVxubW9kdWxlLmV4cG9ydHMgPSBfXG4iLCJ2YXIgZXJyID0gbmV3IEVycm9yKCdFcnJvcjogcmVjdXJzZXMhIGluZmluaXRlIHByb21pc2UgY2hhaW4gZGV0ZWN0ZWQnKVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwcm9taXNlIChyZXNvbHZlcikge1xuICB2YXIgd2FpdGluZyA9IHsgcmVzOiBbXSwgcmVqOiBbXSB9XG4gIHZhciBwID0ge1xuICAgICd0aGVuJzogdGhlbixcbiAgICAnY2F0Y2gnOiBmdW5jdGlvbiB0aGVuQ2F0Y2ggKG9uUmVqZWN0KSB7XG4gICAgICByZXR1cm4gdGhlbihudWxsLCBvblJlamVjdClcbiAgICB9XG4gIH1cbiAgdHJ5IHsgcmVzb2x2ZXIocmVzb2x2ZSwgcmVqZWN0KSB9IGNhdGNoIChlKSB7XG4gICAgcC5zdGF0dXMgPSBmYWxzZVxuICAgIHAudmFsdWUgPSBlXG4gIH1cbiAgcmV0dXJuIHBcblxuICBmdW5jdGlvbiB0aGVuIChvblJlc29sdmUsIG9uUmVqZWN0KSB7XG4gICAgcmV0dXJuIHByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgd2FpdGluZy5yZXMucHVzaChoYW5kbGVOZXh0KHAsIHdhaXRpbmcsIG9uUmVzb2x2ZSwgcmVzb2x2ZSwgcmVqZWN0LCBvblJlamVjdCkpXG4gICAgICB3YWl0aW5nLnJlai5wdXNoKGhhbmRsZU5leHQocCwgd2FpdGluZywgb25SZWplY3QsIHJlc29sdmUsIHJlamVjdCwgb25SZWplY3QpKVxuICAgICAgaWYgKHR5cGVvZiBwLnN0YXR1cyAhPT0gJ3VuZGVmaW5lZCcpIGZsdXNoKHdhaXRpbmcsIHApXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmUgKHZhbCkge1xuICAgIGlmICh0eXBlb2YgcC5zdGF0dXMgIT09ICd1bmRlZmluZWQnKSByZXR1cm5cbiAgICBpZiAodmFsID09PSBwKSB0aHJvdyBlcnJcbiAgICBpZiAodmFsKSB0cnkgeyBpZiAodHlwZW9mIHZhbC50aGVuID09PSAnZnVuY3Rpb24nKSByZXR1cm4gdmFsLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KSB9IGNhdGNoIChlKSB7fVxuICAgIHAuc3RhdHVzID0gdHJ1ZVxuICAgIHAudmFsdWUgPSB2YWxcbiAgICBmbHVzaCh3YWl0aW5nLCBwKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVqZWN0ICh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHAuc3RhdHVzICE9PSAndW5kZWZpbmVkJykgcmV0dXJuXG4gICAgaWYgKHZhbCA9PT0gcCkgdGhyb3cgZXJyXG4gICAgcC5zdGF0dXMgPSBmYWxzZVxuICAgIHAudmFsdWUgPSB2YWxcbiAgICBmbHVzaCh3YWl0aW5nLCBwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGZsdXNoICh3YWl0aW5nLCBwKSB7XG4gIHZhciBxdWV1ZSA9IHAuc3RhdHVzID8gd2FpdGluZy5yZXMgOiB3YWl0aW5nLnJlalxuICB3aGlsZSAocXVldWUubGVuZ3RoKSBxdWV1ZS5zaGlmdCgpKHAudmFsdWUpXG59XG5cbmZ1bmN0aW9uIGhhbmRsZU5leHQgKHAsIHdhaXRpbmcsIGhhbmRsZXIsIHJlc29sdmUsIHJlamVjdCwgaGFzUmVqZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbiBuZXh0ICh2YWx1ZSkge1xuICAgIHRyeSB7XG4gICAgICB2YWx1ZSA9IGhhbmRsZXIgPyBoYW5kbGVyKHZhbHVlKSA6IHZhbHVlXG4gICAgICBpZiAocC5zdGF0dXMpIHJldHVybiByZXNvbHZlKHZhbHVlKVxuICAgICAgcmV0dXJuIGhhc1JlamVjdCA/IHJlc29sdmUodmFsdWUpIDogcmVqZWN0KHZhbHVlKVxuICAgIH0gY2F0Y2ggKGVycikgeyByZWplY3QoZXJyKSB9XG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIF9hcnJheUxpa2VUb0FycmF5KGFyciwgbGVuKSB7XG4gIGlmIChsZW4gPT0gbnVsbCB8fCBsZW4gPiBhcnIubGVuZ3RoKSBsZW4gPSBhcnIubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGxlbik7IGkgPCBsZW47IGkrKykge1xuICAgIGFycjJbaV0gPSBhcnJbaV07XG4gIH1cblxuICByZXR1cm4gYXJyMjtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBhcnI7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gX2V4dGVuZHMoKSB7XG4gIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07XG5cbiAgICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcbiAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfTtcblxuICByZXR1cm4gX2V4dGVuZHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn0iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB7XG4gIHZhciBfaSA9IGFyciA9PSBudWxsID8gbnVsbCA6IHR5cGVvZiBTeW1ib2wgIT09IFwidW5kZWZpbmVkXCIgJiYgYXJyW1N5bWJvbC5pdGVyYXRvcl0gfHwgYXJyW1wiQEBpdGVyYXRvclwiXTtcblxuICBpZiAoX2kgPT0gbnVsbCkgcmV0dXJuO1xuICB2YXIgX2FyciA9IFtdO1xuICB2YXIgX24gPSB0cnVlO1xuICB2YXIgX2QgPSBmYWxzZTtcblxuICB2YXIgX3MsIF9lO1xuXG4gIHRyeSB7XG4gICAgZm9yIChfaSA9IF9pLmNhbGwoYXJyKTsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkge1xuICAgICAgX2Fyci5wdXNoKF9zLnZhbHVlKTtcblxuICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgX2QgPSB0cnVlO1xuICAgIF9lID0gZXJyO1xuICB9IGZpbmFsbHkge1xuICAgIHRyeSB7XG4gICAgICBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdICE9IG51bGwpIF9pW1wicmV0dXJuXCJdKCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChfZCkgdGhyb3cgX2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIF9hcnI7XG59IiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gX25vbkl0ZXJhYmxlUmVzdCgpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTtcbn0iLCJpbXBvcnQgYXJyYXlXaXRoSG9sZXMgZnJvbSBcIi4vYXJyYXlXaXRoSG9sZXMuanNcIjtcbmltcG9ydCBpdGVyYWJsZVRvQXJyYXlMaW1pdCBmcm9tIFwiLi9pdGVyYWJsZVRvQXJyYXlMaW1pdC5qc1wiO1xuaW1wb3J0IHVuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5IGZyb20gXCIuL3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5LmpzXCI7XG5pbXBvcnQgbm9uSXRlcmFibGVSZXN0IGZyb20gXCIuL25vbkl0ZXJhYmxlUmVzdC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gX3NsaWNlZFRvQXJyYXkoYXJyLCBpKSB7XG4gIHJldHVybiBhcnJheVdpdGhIb2xlcyhhcnIpIHx8IGl0ZXJhYmxlVG9BcnJheUxpbWl0KGFyciwgaSkgfHwgdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkoYXJyLCBpKSB8fCBub25JdGVyYWJsZVJlc3QoKTtcbn0iLCJpbXBvcnQgYXJyYXlMaWtlVG9BcnJheSBmcm9tIFwiLi9hcnJheUxpa2VUb0FycmF5LmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkobywgbWluTGVuKSB7XG4gIGlmICghbykgcmV0dXJuO1xuICBpZiAodHlwZW9mIG8gPT09IFwic3RyaW5nXCIpIHJldHVybiBhcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7XG4gIHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTtcbiAgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTtcbiAgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7XG4gIGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pO1xufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0aWQ6IG1vZHVsZUlkLFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgbWFwcGVyIGZyb20gJy4vbWFwcGVyJ1xuaW1wb3J0IGV4cGVyaWVuY2VzIGZyb20gJy4vZXhwZXJpZW5jZXMnXG5cbm1hcHBlcigpXG5leHBlcmllbmNlcy5mb3JFYWNoKGV4cGVyaWVuY2UgPT4gZXhwZXJpZW5jZSgpKSJdLCJuYW1lcyI6WyJ0cmlnZ2VycyIsInZhcmlhdGlvbiIsIm9wdGlvbnMiLCJjYiIsImxvZyIsInN0YXRlIiwicG9sbCIsImluZm8iLCJwb2xsRm9yRWxlbWVudHMiLCJ0aGVuIiwiYW5jaG9yIiwic2V0IiwicmVuZGVyIiwiaCIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXRpbHMiLCJpbnNlcnRBZnRlciIsInByZWZpeCIsImdldCIsImNvcHkiLCJyZW5kZXJQbGFjZW1lbnQiLCJlbGVtZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NOYW1lIiwiQ29udGFpbmVyIiwiY29udGFpbmVyQ2xhc3MiLCJ1c2VDb3VudGRvd25UaW1lciIsImRhdGUiLCJjYWxjdWxhdGVUaW1lTGVmdCIsImRpZmZlcmVuY2UiLCJEYXRlIiwiZGF5cyIsIk1hdGgiLCJmbG9vciIsImhvdXJzIiwibWludXRlcyIsInNlY29uZHMiLCJ0aW1lTGVmdCIsInNldFRpbWVMZWZ0IiwidGltZXIiLCJzZXRUaW1lb3V0IiwiY2xlYXJUaW1lb3V0IiwiQ291bnRkb3duIiwiY291bnRkb3duQ2xhc3MiLCJ0aW1lckNvbXBvbmVudHMiLCJPYmplY3QiLCJrZXlzIiwibWFwIiwiaW50ZXJ2YWwiLCJsZW5ndGgiLCJQcm9taXNlIiwiY2hlY2tJbmFjdGl2aXR5IiwiY2hlY2tFeGl0IiwiaW5hY3Rpdml0eVRpbWUiLCJjaGVja0RldmljZVR5cGUiLCJjaGVja0ZvckV4aXRJbnRlbnRPckluYWN0aXZpdHkiLCJyZXNvbHZlIiwiaXNNb2JpbGVPclRhYmxldCIsInRlc3QiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJleGl0SW50ZW50IiwiaW5pdCIsInVzZVJlZiIsIkdsaWRlIiwiYXBwZW5kQ2hpbGQiLCJjb250ZW50IiwiaGVhZGxpbmUiLCJzdWJ0aXRsZSIsInJlY3MiLCJ0aXRsZSIsImdsaWRlT3B0aW9ucyIsInR5cGUiLCJib3VuZCIsInBlclZpZXciLCJnYXAiLCJzY3JvbGxMb2NrIiwicmV3aW5kIiwiYnJlYWtwb2ludHMiLCJmaXJlIiwiY2xhc3NMaXN0IiwiYWRkIiwiUGxhY2VtZW50IiwiY2hpbGRyZW4iLCJoYW5kbGVDbG9zZSIsImV4cGVyaWVuY2UiLCJxdWVyeVNlbGVjdG9yIiwicGFyZW50RWxlbWVudCIsInJlbW92ZUNoaWxkIiwiQ2Fyb3VzZWwiLCJjYXJvdXNlbENsYXNzIiwiY2Fyb3VzZWxDb250YWluZXIiLCJnbGlkZSIsIm1vdW50IiwiZGVzdHJveSIsInJlYyIsImkiLCJBcnJvd3MiLCJhcnJvd0NsYXNzIiwiU2xpZGUiLCJzbGlkZUNsYXNzIiwiY3JlYXRlRXhwZXJpZW5jZSIsImNvdW50ZG93bkJhbm5lciIsImV4cGVyaWVuY2VTdGF0ZSIsImtleSIsImRhdGEiLCJjb25zb2xlIiwid2FybiIsImVycm9yIiwicnVuTWFwcGVyIiwid2luZG93IiwieHBfZXZlbnRzIiwiZW1pdEV2ZW50IiwiZXZlbnQiLCJwdXNoIiwiZGF0YUxheWVyIiwiZXZlbnROYW1lIiwibWFwcGVyIiwiZXhwZXJpZW5jZXMiLCJmb3JFYWNoIl0sInNvdXJjZVJvb3QiOiIifQ==
