// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"ApplySettings.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ApplySettings = void 0;
var ApplySettings;

(function (ApplySettings) {
  //Global Variables

  /**
   * specifies if there's a valid delegation key. set by checkDelegationKey()
   */
  var delegationKeyValid = false; //#region html generation

  /**
   * Contains names and folders for the generation of the footer
   *
   * position 0: folder name, position 1: display name
   */

  var toolNames = [["Setting", "Site Settings"], ["ProfileLevelViewer", "Profile Level Viewer"], ["AdvancedMDSearch", "Advanced Marketing Department Search"], ["DailyBuildViewer", "Daily Build Viewer"], ["HiddenLevelStatistics", "Hidden Level Statistics viewer"], ["HiddenProfileStatisticsViewer", "Hidden Profile Statistics Viewer"], ["RecordViewer", "Record Viewer"], ["CombobulatorSimulator", "Combobulator Simulator"], ["PictureGallery", "Avatar Gallery"], ["AdvancedTowerSearch", "Advanced Tower Search"], ["TowerTrialViewer", "Tower Trial Viewer"], ["SubmitFeedback", "Feedback Submission"]];
  /**
   * Folder of the current tool. loaded by currentToolName()
   */

  var currentToolName = "";
  /**
   * Retrieves the name of the current folder and saves it in currentToolName
   * @returns Name of the current folder
   */

  function getCurrentToolName() {
    var name = window.location.href;
    name = name.substring(0, name.lastIndexOf('/'));
    name = name.substring(name.lastIndexOf('/') + 1, name.length);
    currentToolName = name;
    return name;
  }

  ApplySettings.getCurrentToolName = getCurrentToolName;
  /**
   * Generates a footer linking to other tools
   * @note The site has to be in a folder inside the main folder, otherwise this won't work
   */

  function generateToolFooter() {
    getCurrentToolName();
    var htmlout = "";
    toolNames.forEach(function (name) {
      if (name[0] != currentToolName) htmlout += "<p><a href=\"../".concat(name[0], "/index.html\">").concat(name[1], "</a></p>");
    });
    document.body.innerHTML += "<footer id=\"navigationFooter\"><p><b>Other Tools:</b></p><p><b><a href=\"../index.html\">Main Page</a></b></p>".concat(htmlout, "</footer>");
  }

  ApplySettings.generateToolFooter = generateToolFooter; //#endregion
  //#region general purpose export functions

  /**
   * Returns a URL to be used for Level fetch calls
   * @param {Boolean} stats if true, includes stats (Plays, playtime, etc.)
   * @param {Boolean} aliases if true, includes alias (player name, etc.)
   * @param {Boolean} records if true, includes leaderboards (shoe, ribbon)
   * @param {Boolean} interactions if true includes interactions (boommarked, played, etc.). WARNING: Must be used with a delegation key.
   * @param {Number} limit Maximun number of levels to be returned.
   * @returns URL for a level fetch call
   */

  function levelFetchUrl() {
    var stats = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var aliases = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var records = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var interactions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var limit = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 128;
    var basicURL = 'https://www.bscotch.net/api/levelhead/levels?limit=' + limit;
    if (stats) basicURL += '&includeStats=true';
    if (aliases) basicURL += '&includeAliases=true';
    if (records) basicURL += '&includeRecords=true';
    if (interactions) basicURL += '&includeMyInteractions=true';
    return basicURL;
  }

  ApplySettings.levelFetchUrl = levelFetchUrl;
  /**
   * Input sanitization for Creator codes
   * @param {String} input creator code or profile link. the levelhead.io and bschotch.net links both work
   * @returns null if code could not be extracted
   * @returns the cleaned code
   */

  function getProfileCode() {
    var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var clean = input.trim().toLowerCase();
    if (input.length == 6) return clean;
    var result = /levelhead\.io\/@(.{6})/.exec(clean);
    if (result == null) result = /bscotch\.net\/games\/levelhead\/players\/(.{6})/.exec(clean);
    if (result == null) return null;
    return result[1];
  }

  ApplySettings.getProfileCode = getProfileCode;
  /**
   * Input sanitization for Level codes
   * @param {String} input level code or level link. the levelhead.io and bschotch.net links both work
   * @returns null if code could not be extracted
   * @returns the cleaned code
   */

  function getLevelCode() {
    var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var clean = input.trim().toLowerCase();
    if (input.length == 7) return clean;
    var result = /levelhead\.io\/\+(.{7})/.exec(clean);
    if (result == null) result = /bscotch\.net\/games\/levelhead\/levels\/(.{7})/.exec(clean);
    if (result == null) return null;
    return result[1];
  }

  ApplySettings.getLevelCode = getLevelCode;
  /**
   * Input sanitization for Creator codes and profile codes. Can distinguish the 2, but cannot handle playlists
   * @param {String} input creator/level code or profile/level link. the levelhead.io and bschotch.net links both work
   * @returns null if code could not be extracted
   * @returns the cleaned code. result[0] is either 'Profile' or 'Level' depemding on what the code is for. result[1] is the code
   */

  function getAnyCode() {
    var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var result = getProfileCode(input);
    if (result != null) return ['Profile', result];
    result = getLevelCode(input);
    if (result != null) return ['Level', result];
    return null;
  }

  ApplySettings.getAnyCode = getAnyCode;
  /**
   * Input sanitization for Playlist codes
   * @param {String} input playlist code or playlist link. the levelhead.io and bschotch.net links both work
   * @returns null if code could not be extracted
   * @returns the cleaned code
   */

  function getPlaylistCode() {
    var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var clean = input.trim().toLowerCase();
    if (input.length == 7) return clean;
    var result = /levelhead\.io\/\-(.{7})/.exec(clean);
    if (result == null) result = /bscotch\.net\/games\/levelhead\/playlists\/(.{7})/.exec(clean);
    if (result == null) return null;
    return result[1];
  }

  ApplySettings.getPlaylistCode = getPlaylistCode;
  /**
   * Creates a URL to load an avatar with
   * @param {String} avatarId id of the avatar. see https://beta.bscotch.net/api/docs/community-edition/#avatars
   * @param {Number} size specifies size of the returned avatar. it will be size x size big
   * @returns URL to load an avatar with
   */

  function getAvatarURL(avatarId) {
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
    return "https://img.bscotch.net/fit-in/".concat(size, "x").concat(size, "/avatars/").concat(avatarId, ".webp");
  }

  ApplySettings.getAvatarURL = getAvatarURL;
  /**
   * creates a request body for fetch calls making use of delegation keys
   * @param {String} method either 'GET', 'POST', 'PUT' or 'DELETE'
   * @returns A request body to be used with the fetch export function. fetch(URL, RequestBody)
   */

  function getExtendedRequestBody() {
    var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'GET';
    var requestBody = {
      'method': method,
      'headers': {
        'Rumpus-Delegation-Key': JSON.parse(window.localStorage.getItem('DelegationKey') || '').Key
      },
      'mode': 'cors',
      'cache': 'default'
    };
    return requestBody;
  }

  ApplySettings.getExtendedRequestBody = getExtendedRequestBody;
  var delegationKeyChecked = false;
  /**
   * Checks if the Delegation Key is valid. sets delegationKeyValid to true if valid, false if invalid
   */

  function checkDelegationKey() {
    try {
      if (window.localStorage.getItem('DelegationKey')) fetch('https://www.bscotch.net/api/levelhead/aliases?userIds=@me', getExtendedRequestBody('GET')).then(function (r) {
        delegationKeyValid = r.status == 200;
        delegationKeyChecked = true;
      }); //see if status is OK
    } catch (exception) {
      //fetch failed means no internet connection or key is invalid
      delegationKeyValid = false;
      delegationKeyChecked = true;
    }
  }

  ApplySettings.checkDelegationKey = checkDelegationKey;
  /**
   * used for API calls that support includeMyInteractions
   * @returns "" if there's no valid delegation key, else "&includeMyInteractions=true"
   */

  function addInteractionDetails() {
    return delegationKeyValid ? "&includeMyInteractions=true" : "";
  }

  ApplySettings.addInteractionDetails = addInteractionDetails;
  /**
   * Get the interactions (played, completed, etc.) from a level
   * @param {LEVEL} level level object, returned by level-related api calls
   * @returns interactions object. contains 'bookmarked', 'liked', 'favorited', 'played' and 'completed'.
   *  all but 'bookmarked' are set to true if the level was made by the player whose delegation key is used
   */

  function getInteractions(level) {
    //checks if level was created by user
    var ownLevel = level.userId == JSON.parse(window.localStorage.getItem('DelegationKey') || '').UserCode;
    var possibleInteractions = {
      'bookmarked': false,
      'liked': ownLevel,
      'favorited': ownLevel,
      'played': ownLevel,
      'completed': ownLevel
    }; //check if any interactions, then add interactions

    if (level.interactions) {
      //double negation for conversion in bool (can otherwise be undefined)
      possibleInteractions.bookmarked = level.interactions.bookmarked ? true : false;

      if (!ownLevel) {
        possibleInteractions.liked = level.interactions.liked ? true : false;
        possibleInteractions.favorited = level.interactions.favorited ? true : false;
        possibleInteractions.played = level.interactions.played ? true : false;
        possibleInteractions.completed = level.interactions.completed ? true : false;
      }
    }

    return possibleInteractions;
  }

  ApplySettings.getInteractions = getInteractions; //Bookmarks

  /**
   * Can add/remove Bookmarks
   * @param {String} levelCode a level's level code. must be sanitized
   * @param {String} mode 'PUT' to create bookmark (default), 'DELETE' to remove Bookmark
   * @returns true if successful, false if unsuccessful. posts error messages using console.log
   */

  function manageBookmark(levelCode) {
    var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'PUT';
    console.log(JSON.parse(window.localStorage.getItem('DelegationKey') || '').Key);

    try {
      fetch("https://www.bscotch.net/api/levelhead/bookmarks/".concat(levelCode), getExtendedRequestBody(mode));
      return true;
    } catch (exception) {
      console.log('BOOKMARK FAILED; ACTION: ' + mode);
      return false;
    }
  }

  ApplySettings.manageBookmark = manageBookmark; //#endregion
  //#region Customization

  /**
   * contains cursor colors. file name must be <color>.png
   */

  var cursorOptions = ["normal", "blue", "green", "fuchsia", "orange"];
  /**
   * path to cursors. used in the CSS
   */

  var setCursorTemplate = "url('../PicturesCommon/Cursors/{{color}}.png'), auto";
  /**
   * loads cursor options and loads delegation key.
   */

  function loadOptions() {
    loadCursor();
    checkDelegationKey();
  }

  ApplySettings.loadOptions = loadOptions;
  /**
   * loads custom cursors
   */

  function loadCursor() {
    var cursor = window.localStorage.getItem('CursorOption');

    if (cursor && cursor != cursorOptions[0] && cursorOptions.includes(cursor)) {
      document.body.style.cursor = setCursorTemplate.replaceAll('{{color}}', cursor); //ToDo: set other cursors
    }
  }

  ApplySettings.loadCursor = loadCursor; //#endregion
  //#region other

  /**
   * transforms a time in seconds into a formatted string
   * @param {Number} time time in seconds
   * @returns formatted time string
   */

  function timeFormat(time) {
    var millis = "";
    millis = Math.floor(time * 100).toFixed();
    if (time >= 86400) return Math.floor(time / 86400) + 'day(s) ' + (new Date(time * 1000).toISOString().substr(11, 8) + '.' + millis.substr(millis.length - 2, millis.length - 1) + 's').replace(':', 'h ').replace(':', 'm ');
    if (time >= 3600) return (new Date(time * 1000).toISOString().substr(11, 8) + '.' + millis.substr(millis.length - 2, millis.length - 1) + 's').replace(':', 'h ').replace(':', 'm ');
    if (time >= 60) return (new Date(time * 1000).toISOString().substr(14, 5) + '.' + millis.substr(millis.length - 2, millis.length - 1) + 's').replace(':', 'm ');
    return new Date(time * 1000).toISOString().substr(17, 2) + '.' + millis.substr(millis.length - 2, millis.length - 1) + 's';
  }

  ApplySettings.timeFormat = timeFormat;
  /**
   * Formats a date object
   * @param {Date} date Date object to format
   * @returns Formatted Date as a string
   */

  function dateFormat(date) {
    return new Date(date).toString().substring(4, 31);
  }

  ApplySettings.dateFormat = dateFormat; //#endregion
  //#region Old stuff. not needed, but I'll keep it here just in case
  //old card template

  /*
  var levelCardTemplate = `
  <div class="column"><div class="card">
  <img src="https://img.bscotch.net/fit-in/100x100/avatars/{{avatar}}.webp" id="cardPicture">
  <img src="../PicturesCommon/CardIcons/{{graduated}}.png" id="miniIcon" style="margin-left:2px;">
  <img src="../PicturesCommon/CardIcons/TT.png" id="miniIcon" style="margin-left:80px;display:{{tt}};">
  <img src="../PicturesCommon/CardIcons/DAILYBUILD.png" id="miniIcon" style="margin-top:75px;margin-left:6px;display:{{daily}};">
      <p id="cardText">
          <a href="https://levelhead.io/+{{levelcode}}" target="ProfileLevel">{{levelname}}</a><br>
          <a style="color:#7E3517">♥️</a>: {{likes}}, <a style="color:#7F5217">★</a>: {{favorites}}, {{difficulty}}<br>
          {{tags}}<br>
          <b>Players:</b> {{players}}, <b>Plays:</b> {{plays}}<br>
          <b>Created:</b> {{createdAt}}<br>
          <button onclick="navigator.clipboard.writeText('{{levelcode}}')" style="height: 20px; font-size: 10px;" id="levelCodeButton">Copy Levelcode</button>
      </p>
  </div></div>
  `;
  */
  //#endregion
})(ApplySettings = exports.ApplySettings || (exports.ApplySettings = {}));
},{}],"index.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var ApplySettings_1 = require("./ApplySettings");

ApplySettings_1.ApplySettings.generateToolFooter();
},{"./ApplySettings":"ApplySettings.ts"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "57712" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/CommunityCampaign.77de5100.js.map