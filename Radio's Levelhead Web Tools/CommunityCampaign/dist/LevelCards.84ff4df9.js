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
})({"../LevelCards.js":[function(require,module,exports) {
//#region Global Variables

/**
 * used to save levels received from API calls.
 * saves each fetch call as a seperate array.
 * used by several functions
 */
var levelList = [];
/**
 * tracks how many levels match the current filter criteria
 */

var matchingLevels = 0; //#endregion
//#region Filters
//filter constants

/**
 * used if filter is not active
 */

var SHOW_ALL = 0;
/**
 * show only levels that match the criteria
 */

var SHOW_ONLY = 1;
/**
 * exclude levels that match the criteria
 */

var SHOW_EXCLUDE = 2;

function filterDaily(level) {
  var selectId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'dailyFilter';
  var filterVal = document.getElementById(selectId).value;
  if (filterVal == SHOW_ALL) return true;
  if (level.dailyBuild == true && filterVal == SHOW_ONLY) return true;
  if (level.dailyBuild == false && filterVal == SHOW_EXCLUDE) return true;
  return false;
}

function filterDifficulty(level) {
  var selectId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'difficultyFilter';
  var filterVal = document.getElementById(selectId).value;
  if (filterVal == SHOW_ALL) return true;
  if (level.stats.Diamonds == filterVal) return true;
  return false;
}

function filterGraduation(level) {
  var selectId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'graduationFilter';
  var filterVal = document.getElementById(selectId).value;
  if (filterVal == SHOW_ALL) return true;
  if (level.tower == true && filterVal == SHOW_ONLY) return true;
  if (level.tower == false && filterVal == SHOW_EXCLUDE) return true;
  return false;
}

function filterPlayerCount(level) {
  var selectIdMin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'maxPlayerFilter';
  var selectIdMax = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'minPlayerFilter';
  var maxPlayers = document.getElementById(selectIdMin).value;
  var minPlayers = document.getElementById(selectIdMax).value;
  if (level.stats.Players >= minPlayers && level.stats.Players <= maxPlayers) return true;
  return false;
}

function filterTowerTrial(level) {
  var selectId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'TTFilter';
  var filterVal = document.getElementById(selectId).value;
  if (filterVal == SHOW_ALL) return true;
  if (level.towerTrial == true && filterVal == SHOW_ONLY) return true;
  if (level.towerTrial == false && filterVal == SHOW_EXCLUDE) return true;
  return false;
}

function filterMultiplayer(level) {
  var select = +document.getElementById("mulitiplayerFilter").value;
  var playerCount = level.requiredPlayers;

  switch (select) {
    case SHOW_ALL:
      return true;

    case 1:
      return playerCount == 1;

    case 2:
      return playerCount == 2;

    case 3:
      return playerCount == 3;

    case 4:
      return playerCount == 4;
  }

  console.log("unhandled case in filterMultiplayer(level): " + select);
  return false;
}

function filterTags(level) {
  for (var x = 1; x < 4; ++x) {
    var requiredTag = document.getElementById('requiredTags' + x).value;
    var excludedTag = document.getElementById('excludedTags' + x).value; //check if Level has specified tags

    if (requiredTag != SHOW_ALL && !level.tags.includes(requiredTag)) return false;
    if (excludedTag != SHOW_ALL && level.tags.includes(excludedTag)) return false;
  }

  return true;
}

function filterPlayed(level) {
  if (!delegationKeyValid) return true;
  var interactions = getInteractions(level);
  var select = document.getElementById("playedFilter").value;

  switch (+select) {
    case 0:
      //show all
      return true;

    case 1:
      //only not played
      return !interactions.played;

    case 2:
      //only played
      return interactions.played && !interactions.completed;

    case 3:
      //only beaten levels
      return interactions.completed;

    case 4:
      //played or beaten levels
      return interactions.played;
  }

  console.log("ERROR in filterPlayed(): undefined case", select, interactions);
  return false;
}

function fliterLiked(level) {
  if (!delegationKeyValid) return true;
  var interactions = getInteractions(level);
  var select = document.getElementById("likedFilter").value;

  switch (+select) {
    case SHOW_ALL:
      return true;

    case SHOW_ONLY:
      return interactions.liked;

    case SHOW_EXCLUDE:
      return !interactions.liked;
  }

  console.log("ERROR in fliterLiked(): undefined case", select, interactions);
  return false;
}

function filterFavorited(level) {
  if (!delegationKeyValid) return true;
  var interactions = getInteractions(level);
  var select = document.getElementById("favoritedFilter").value;

  switch (+select) {
    case SHOW_ALL:
      return true;

    case SHOW_ONLY:
      return interactions.favorited;

    case SHOW_EXCLUDE:
      return !interactions.favorited;
  }

  console.log("ERROR in filterFavorited(): undefined case", select, interactions);
  return false;
}

function filterBookmarked(level) {
  if (!delegationKeyValid) return true;
  var interactions = getInteractions(level);
  var select = document.getElementById("bookmarkedFilter").value;

  switch (+select) {
    case SHOW_ALL:
      return true;

    case SHOW_ONLY:
      return interactions.bookmarked;

    case SHOW_EXCLUDE:
      return !interactions.bookmarked;
  }

  console.log("ERROR in filterBookmarked(): undefined case", select, interactions);
  return false;
}
/**
 * Collection of all filter functions that make use of the delegation key. if delegationKeyValid is false, it will always return true
 * @param {LEVEL} level level to be filtered
 * @returns true if filters apply, false if not
 */


function filterInteractions(level) {
  if (!filterPlayed(level)) return false;
  if (!fliterLiked(level)) return false;
  if (!filterFavorited(level)) return false;
  if (!filterBookmarked(level)) return false;
  return true;
}
/**
 * toggles visibility of the filters section
 */


function showFilters() {
  if (document.getElementById('filtersToggle').innerHTML == 'Filters ▲') {
    document.getElementById('filtersToggle').innerHTML = 'Filters ▼';
    document.getElementById('filters').style.display = 'block';
  } else {
    document.getElementById('filtersToggle').innerHTML = 'Filters ▲';
    document.getElementById('filters').style.display = 'none';
  }
}
/**
 * loads the selects used to filter for tags
 */


function loadTagSelect() {
  var htmloutRequired = '<option value="0" id="noneRequired">-</option>';
  var htmloutExcluded = '<option value="0" id="noneExcluded">-</option>';
  fetch('https://www.bscotch.net/api/levelhead/level-tags/counts').then(function (r) {
    return r.json();
  }).then(function (r) {
    r.data.forEach(function (tag) {
      htmloutRequired += tagSelectTemplate.replaceAll('{{tagId}}', tag.tag).replace('{{tagName}}', tag.name).replace('{{selectName}}', 'Required');
      htmloutExcluded += tagSelectTemplate.replaceAll('{{tagId}}', tag.tag).replace('{{tagName}}', tag.name).replace('{{selectName}}', 'Excluded');
    });

    for (var x = 1; x < 4; ++x) {
      document.getElementById('requiredTags' + x).innerHTML = htmloutRequired.replaceAll('{{selectNumber}}', x);
      document.getElementById('excludedTags' + x).innerHTML = htmloutExcluded.replaceAll('{{selectNumber}}', x);
    }
  });
}

var tagSelectTemplate = "\n<option value=\"{{tagId}}\" id=\"{{tagId}}{{selectName}}{{selectNumber}}\">{{tagName}}</option>\n"; //#endregion
//#region Sorting

/**
 * contains the values that levels can be sorted by
 */

var sortOptions = ["default", //level.createdAgo
"most recent", "oldest", //level.stats.TimePerWin
"longest", "shortest", //level.stats.ClearRate
"easiest", "hardest", //level.stats.Players
"most players", "least players", //level.stats.Attempts
"most plays", "least plays", //level.stats.ExposureBucks
"most EB", "least EB", //level.stats.Likes
"most liked", "least liked", //level.stats.Favorites
"most favorited", "least favorited", //level.stats.ReplayValue
"most spicy", "least spicy", //level.stats.PlayTime
"highest play time", "lowest play time"];
/**
 * contains the compare funtions used to sort levels
 */

var sortFunctions = {
  //level.createdAgo
  'most recent': function mostRecent(a, b) {
    //some properties are undefined when not set. Undefined values can break the sorting functions
    if (a.createdAgo === undefined) a.createdAgo = 0;
    if (b.createdAgo === undefined) b.createdAgo = 0;
    return a.createdAgo - b.createdAgo;
  },
  'oldest': function oldest(a, b) {
    if (a.createdAgo === undefined) a.createdAgo = 0;
    if (b.createdAgo === undefined) b.createdAgo = 0;
    return b.createdAgo - a.createdAgo;
  },
  //level.stats.TimePerWin
  'longest': function longest(b, a) {
    if (a.stats.TimePerWin === undefined) a.stats.TimePerWin = 0;
    if (b.stats.TimePerWin === undefined) b.stats.TimePerWin = 0;
    return a.stats.TimePerWin - b.stats.TimePerWin;
  },
  'shortest': function shortest(b, a) {
    if (a.stats.TimePerWin === undefined) a.stats.TimePerWin = 0;
    if (b.stats.TimePerWin === undefined) b.stats.TimePerWin = 0;
    return b.stats.TimePerWin - a.stats.TimePerWin;
  },
  //level.stats.ClearRate
  'easiest': function easiest(b, a) {
    if (a.stats.ClearRate === undefined) a.stats.ClearRate = 0;
    if (b.stats.ClearRate === undefined) b.stats.ClearRate = 0;
    return a.stats.ClearRate - b.stats.ClearRate;
  },
  'hardest': function hardest(b, a) {
    if (a.stats.ClearRate === undefined) a.stats.ClearRate = 0;
    if (b.stats.ClearRate === undefined) b.stats.ClearRate = 0;
    return b.stats.ClearRate - a.stats.ClearRate;
  },
  //level.stats.Players
  'most players': function mostPlayers(b, a) {
    if (a.stats.Players === undefined) a.stats.Players = 0;
    if (b.stats.Players === undefined) b.stats.Players = 0;
    return a.stats.Players - b.stats.Players;
  },
  'least players': function leastPlayers(b, a) {
    if (a.stats.Players === undefined) a.stats.Players = 0;
    if (b.stats.Players === undefined) b.stats.Players = 0;
    return b.stats.Players - a.stats.Players;
  },
  //level.stats.Attempts
  'most plays': function mostPlays(b, a) {
    if (a.stats.Attempts === undefined) a.stats.Attempts = 0;
    if (b.stats.Attempts === undefined) b.stats.Attempts = 0;
    return a.stats.Attempts - b.stats.Attempts;
  },
  'least plays': function leastPlays(b, a) {
    if (a.stats.Attempts === undefined) a.stats.Attempts = 0;
    if (b.stats.Attempts === undefined) b.stats.Attempts = 0;
    return b.stats.Attempts - a.stats.Attempts;
  },
  //level.stats.ExposureBucks
  'most EB': function mostEB(b, a) {
    if (a.stats.ExposureBucks === undefined) a.stats.ExposureBucks = 0;
    if (b.stats.ExposureBucks === undefined) b.stats.ExposureBucks = 0;
    return a.stats.ExposureBucks - b.stats.ExposureBucks;
  },
  'least EB': function leastEB(b, a) {
    if (a.stats.ExposureBucks === undefined) a.stats.ExposureBucks = 0;
    if (b.stats.ExposureBucks === undefined) b.stats.ExposureBucks = 0;
    return b.stats.ExposureBucks - a.stats.ExposureBucks;
  },
  //level.stats.Likes
  'most liked': function mostLiked(b, a) {
    if (a.stats.Likes === undefined) a.stats.Likes = 0;
    if (b.stats.Likes === undefined) b.stats.Likes = 0;
    return a.stats.Likes - b.stats.Likes;
  },
  'least liked': function leastLiked(b, a) {
    if (a.stats.Likes === undefined) a.stats.Likes = 0;
    if (b.stats.Likes === undefined) b.stats.Likes = 0;
    return b.stats.Likes - a.stats.Likes;
  },
  //level.stats.Favorites
  'most favorited': function mostFavorited(b, a) {
    if (a.stats.Favorites === undefined) a.stats.Favorites = 0;
    if (b.stats.Favorites === undefined) b.stats.Favorites = 0;
    return a.stats.Favorites - b.stats.Favorites;
  },
  'least favorited': function leastFavorited(b, a) {
    if (a.stats.Favorites === undefined) a.stats.Favorites = 0;
    if (b.stats.Favorites === undefined) b.stats.Favorites = 0;
    return b.stats.Favorites - a.stats.Favorites;
  },
  //level.stats.ReplayValue
  'most spicy': function mostSpicy(b, a) {
    if (a.stats.ReplayValue === undefined) a.stats.ReplayValue = 0;
    if (b.stats.ReplayValue === undefined) b.stats.ReplayValue = 0;
    return a.stats.ReplayValue - b.stats.ReplayValue;
  },
  'least spicy': function leastSpicy(b, a) {
    if (a.stats.ReplayValue === undefined) a.stats.ReplayValue = 0;
    if (b.stats.ReplayValue === undefined) b.stats.ReplayValue = 0;
    return b.stats.ReplayValue - a.stats.ReplayValue;
  },
  //level.stats.PlayTime
  'highest play time': function highestPlayTime(b, a) {
    if (a.stats.PlayTime === undefined) a.stats.PlayTime = 0;
    if (b.stats.PlayTime === undefined) b.stats.PlayTime = 0;
    return a.stats.PlayTime - b.stats.PlayTime;
  },
  'lowest play time': function lowestPlayTime(b, a) {
    if (a.stats.PlayTime === undefined) a.stats.PlayTime = 0;
    if (b.stats.PlayTime === undefined) b.stats.PlayTime = 0;
    return b.stats.PlayTime - a.stats.PlayTime;
  }
};
/**
 * loads select field used for sorting. <select id="sortSelect">
 */

function loadSortingSelect() {
  var htmlout = '';
  var sortId = 0;
  sortOptions.forEach(function (sort) {
    htmlout += "<option value=\"".concat(sortId++, "\">").concat(sort, "</option>");
  });
  document.getElementById("sortSelect").innerHTML = htmlout;
}
/**
 * Sorts a level array by the selected criteria
 * @param {Array<LEVEL>} levelArray Array containing levels to be sorted
 */


function sortLevels(levelArray) {
  var sortBy = document.getElementById("sortSelect").value;
  if (sortBy == 0) return;
  sortBy = sortOptions[sortBy]; //choosing sort by string (to make changing the order not matter)

  levelArray.sort(sortFunctions[sortBy]);
} //#endregion
//#region Level Cards
//Generic Card Templates

/**
 * Creates an html card from a level object
 * @param {LEVEL} level level to create card from
 * 
 * Following arguments: content of Level card text (will be put between <p class="cardTextLine"> automatically)
 * @returns Level card
 */


function createLevelCard(level) {
  var text = '';
  var pictures = '';
  var delegationContent = '';

  for (x = 1; x < arguments.length; ++x) {
    text += arguments[x];
    if (x != arguments.length - 1) text += '<br>';
  }

  pictures += icon.avatar(level.avatarId);
  pictures += icon.graduated(level.tower);
  pictures += icon.towerTrial(level.towerTrial);
  pictures += icon.dailyBuild(level.dailyBuild);
  pictures += icon.multiplayer(level.requiredPlayers);

  if (delegationKeyValid) {
    delegationContent += template.bookmarkButton(level);
    pictures += icon.interactionPlayed(getInteractions(level));
  }

  return "\n    <div class=\"column\">\n        <div class=\"card\">\n            <div class=\"cardPictures\">\n                ".concat(pictures, "\n            </div>\n            <p class=\"cardText\">\n                ").concat(text, "\n            </p>\n            <div class=\"cardDelegation\">").concat(delegationContent, "</div>\n        </div>\n    </div>");
}
/**
 * reloads the level cards. applies filters and sorting in the process, also updates levelTotal and matchingLevels
 */


function reloadLevels() {
  document.getElementById("levelCards").innerHTML = 'generating';
  var htmlout = '';
  var levelTotal = 0;
  matchingLevels = 0;
  var levelArray = [];
  levelList.forEach(function (call) {
    call.forEach(function (level) {
      levelArray.push(level);
    });
  });
  sortLevels(levelArray);
  levelArray.forEach(function (level) {
    if (checkFilters(level)) {
      matchingLevels++; //createSpecificLevelCard must be defined in the tool's .js file

      htmlout += createSpecificLevelCard(level);
    }
  });
  document.getElementById('levelCount').style.display = 'block'; //add size of each fetch to get total level count

  levelList.forEach(function (fetch) {
    levelTotal += fetch.length;
  }); //show count of total levels and matching levels

  document.getElementById('levelCountTotal').innerHTML = levelTotal;
  document.getElementById('levelCountMatch').innerHTML = matchingLevels;
  document.getElementById("levelCards").innerHTML = htmlout;
}
/**
 * removes/adds bookmark and toggles Bookmark button of level Card.
 * @param {String} levelCode a level's code. must be sanitized
 */


function toggleBookmark(levelCode) {
  document.getElementById('bookmarkButton' + levelCode).disabled = true;
  if (document.getElementById('bookmarkButton' + levelCode).innerHTML != 'Create Bookmark') {
    if (manageBookmark(levelCode, 'DELETE')) {
      document.getElementById('bookmarkButton' + levelCode).disabled = false;
      document.getElementById('bookmarkButton' + levelCode).innerHTML = 'Create Bookmark';
    } else {
      console.log("ACTION FAILED");
    }
  } else if (manageBookmark(levelCode, 'PUT')) {
    document.getElementById('bookmarkButton' + levelCode).disabled = false;
    document.getElementById('bookmarkButton' + levelCode).innerHTML = 'Remove Bookmark';
  } else {
    console.log('ACTION FAILED');
  }
}
/**
 * templates used inside level cards
 */


var template = {
  copyCodeButton: function copyCodeButton(level) {
    var code = level.levelId;
    return "<button onclick=\"navigator.clipboard.writeText('".concat(code, "')\" style=\"height: 20px; font-size: 10px;\" id=\"levelCodeButton\">Copy Levelcode</button><button style=\"height: 20px; font-size: 10px;\" onclick=\"window.open('../HiddenLevelStatistics/index.html?levelCode=").concat(code, "')\">Statistics</button>");
  },
  playerPlaysCount: function playerPlaysCount(level) {
    var players = level.stats.Players;
    var plays = level.stats.Attempts;
    if (players === undefined) players = 0;
    if (plays === undefined) plays = 0;
    return "<b>Players:</b> ".concat(players, ", <b>Plays:</b> ").concat(plays);
  },
  levelLink: function levelLink(level) {
    var levelname = level.title;
    var code = level.levelId;
    return "<a href=\"https://levelhead.io/+".concat(code, "\" target=\"_blank\">").concat(levelname, "</a>");
  },
  profileLink: function profileLink(level) {
    var alias = level.alias.alias;
    var code = level.userId;
    return "<a href=\"https://levelhead.io/@".concat(code, "\" target=\"_blank\">").concat(alias, "</a>");
  },
  likeFavoriteDifficulty: function likeFavoriteDifficulty(level) {
    var likes = level.stats.Likes;
    var favorites = level.stats.Favorites;
    var diffRating = level.stats.Diamonds;
    if (likes === undefined) likes = 0;
    if (favorites === undefined) favorites = 0;
    return "<a style=\"color:#7E3517\">\u2665\uFE0F</a>: ".concat(likes, ", <a style=\"color:#7F5217\">\u2605</a>: ").concat(favorites, ", ").concat(icon.difficulty[diffRating]);
  },
  creationDate: function creationDate(level) {
    //ToDo: replace with level object
    var date = level.createdAt;
    var readableDate = new Date(date).toString().substring(4, 15);
    return "<b>Created:</b> ".concat(readableDate);
  },
  exposure: function exposure(level) {
    var eb = level.stats.ExposureBucks;
    if (eb === undefined) eb = 0;
    return "EB: ".concat(eb);
  },
  tags: function tags(level) {
    return level.tagNames;
  },
  bookmarkButton: function bookmarkButton(level) {
    return "<button id=\"bookmarkButton".concat(level.levelId, "\" class=\"bookmarkButton\" onclick=\"toggleBookmark('").concat(level.levelId, "')\">").concat(getInteractions(level).bookmarked ? 'Remove Bookmark' : 'Create Bookmark', "</button>");
  }
};
/**
 * collection of templates used to display icons
 */

var icon = {
  //
  showIcon: ["none", ""],
  graduatedShow: ["MD", "TOWER"],
  iconTemplate: '<img src="../PicturesCommon/CardIcons/{{icon}}.png" id="miniIcon{{icon}}">',
  avatarTemplate: '<img src="https://img.bscotch.net/fit-in/100x100/avatars/{{avatar}}.webp" id="cardPicture">',
  playedStatus: ['NONE', 'PLAYED', 'BEATEN'],
  difficulty: ['⋄⋄⋄⋄⋄', '<a style="color:red">♦</a>⋄⋄⋄⋄', '<a style="color:red">♦♦</a>⋄⋄⋄', '<a style="color:red">♦♦♦</a>⋄⋄', '<a style="color:red">♦♦♦♦</a>⋄', '<a style="color:red">♦♦♦♦♦</a>', '⋄⋄⋄⋄⋄'],
  avatar: function avatar(avatarId) {
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
    if (!avatarId) avatarId = 'bureau-employee';
    return "<img src=\"".concat(getAvatarURL(avatarId, size), "\" id=\"cardAvatar\">");
  },
  graduated: function graduated(_graduated) {
    return "<img src=\"../PicturesCommon/CardIcons/".concat(this.graduatedShow.at(_graduated ? 1 : 0), ".png\" id=\"cardMiniIconGraduated\" style=\"margin-left:2px;\"></img>");
  },
  towerTrial: function towerTrial(tt) {
    if (tt) return "<img src=\"../PicturesCommon/CardIcons/TT.png\" id=\"cardMiniIconTT\" style=\"margin-left:80px;\">";else return '';
  },
  dailyBuild: function dailyBuild(daily) {
    if (daily) return "<img src=\"../PicturesCommon/CardIcons/DAILYBUILD.png\" id=\"cardMiniIconDaily\" style=\"margin-top:75px;margin-left:6px;\">";else return '';
  },
  multiplayer: function multiplayer(playerCount) {
    if (playerCount && playerCount != 1) {
      return "\n            <div id=\"cardMiniIconMultiplayer\" style=\"display: grid\">\n                <img style=\"max-width:40px;grid-row:1;grid-column:1;\" src=\"../PicturesCommon/CardIcons/MULTIPLAYER.png\">\n                <div style=\"color:white;margin-top:7px;margin-left:8px;font-family:monospace;grid-row:1;grid-column:1;\">".concat(playerCount, "</div>\n            </div>");
    } else return "";
  },
  interactionPlayed: function interactionPlayed(interactions) {
    return "<img src=\"../PicturesCommon/CardIcons/INTERACTION_".concat(this.playedStatus[interactions.played + interactions.completed], ".png\" id=\"cardMiniIconPlayed\">");
  }
}; //#endregion
},{}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","../LevelCards.js"], null)
//# sourceMappingURL=/LevelCards.84ff4df9.js.map