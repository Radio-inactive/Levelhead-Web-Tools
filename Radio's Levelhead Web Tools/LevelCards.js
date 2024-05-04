
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
var matchingLevels = 0;

//#endregion

//#region Filters

//filter constants
/**
 * used if filter is not active
 */
const SHOW_ALL = 0;
/**
 * show only levels that match the criteria
 */
const SHOW_ONLY = 1;
/**
 * exclude levels that match the criteria
 */
const SHOW_EXCLUDE = 2;

function filterDaily(level, selectId = 'dailyFilter')
{
    var filterVal = document.getElementById(selectId).value;

    if(filterVal == SHOW_ALL) return true;

    if(level.dailyBuild == true && filterVal == SHOW_ONLY) return true;
    if(level.dailyBuild == false && filterVal == SHOW_EXCLUDE) return true;

    return false;
}

function filterDifficulty(level, selectId = 'difficultyFilter')
{
    var filterVal = document.getElementById(selectId).value; 

    if(filterVal == SHOW_ALL) return true;

    if(level.stats.Diamonds == filterVal) return true;

    return false;
}

function filterGraduation(level, selectId = 'graduationFilter')
{
    var filterVal = document.getElementById(selectId).value; 

    if(filterVal == SHOW_ALL) return true;

    if(level.tower == true && filterVal == SHOW_ONLY) return true;
    if(level.tower == false && filterVal == SHOW_EXCLUDE) return true;

    return false;
}

function filterPlayerCount(level, selectIdMin = 'maxPlayerFilter', selectIdMax = 'minPlayerFilter')
{
    var maxPlayers = document.getElementById(selectIdMin).value;
    var minPlayers = document.getElementById(selectIdMax).value;

    if(level.stats.Players >= minPlayers && level.stats.Players <= maxPlayers) return true;

    return false;
}

function filterTowerTrial(level, selectId = 'TTFilter')
{
    var filterVal = document.getElementById(selectId).value; 

    if(filterVal == SHOW_ALL) return true;

    if(level.towerTrial == true && filterVal == SHOW_ONLY) return true;
    if(level.towerTrial == false && filterVal == SHOW_EXCLUDE) return true;

    return false;
}

function filterMultiplayer(level){
    var select = +document.getElementById("mulitiplayerFilter").value
    var playerCount = level.requiredPlayers

    switch(select){
        case SHOW_ALL:
            return true
        case 1:
            return playerCount == 1
        case 2:
            return playerCount == 2
        case 3:
            return playerCount == 3
        case 4:
            return playerCount == 4
    }

    console.log("unhandled case in filterMultiplayer(level): " + select)
    return false;
}

function filterTags(level)
{
    
    for(var x = 1; x < 4; ++x){
        var requiredTag = document.getElementById('requiredTags'+ x).value;
        var excludedTag = document.getElementById('excludedTags'+ x).value;

        //check if Level has specified tags
        if(requiredTag != SHOW_ALL && !level.tags.includes(requiredTag)) return false;
        if(excludedTag != SHOW_ALL && level.tags.includes(excludedTag)) return false;
    }

    return true;
}

function filterPlayed(level){
    if(!delegationKeyValid)
    return true

    var interactions = getInteractions(level)
    var select = document.getElementById("playedFilter").value

    switch(+select){
        case 0: //show all
            return true;
        case 1: //only not played
            return !interactions.played
        case 2: //only played
            return interactions.played && !interactions.completed
        case 3: //only beaten levels
            return interactions.completed
        case 4: //played or beaten levels
            return interactions.played
    }
    console.log("ERROR in filterPlayed(): undefined case", select, interactions)
    return false
}

function fliterLiked(level){
    if(!delegationKeyValid)
    return true

    var interactions = getInteractions(level)
    var select = document.getElementById("likedFilter").value

    switch(+select){
        case SHOW_ALL:
            return true
        case SHOW_ONLY:
            return interactions.liked
        case SHOW_EXCLUDE:
            return !interactions.liked
    }
    console.log("ERROR in fliterLiked(): undefined case", select, interactions)
    return false
}

function filterFavorited(level){
    if(!delegationKeyValid)
    return true

    var interactions = getInteractions(level)
    var select = document.getElementById("favoritedFilter").value

    switch(+select){
        case SHOW_ALL:
            return true
        case SHOW_ONLY:
            return interactions.favorited
        case SHOW_EXCLUDE:
            return !interactions.favorited
    }
    console.log("ERROR in filterFavorited(): undefined case", select, interactions)
    return false
}

function filterBookmarked(level){
    if(!delegationKeyValid)
    return true

    var interactions = getInteractions(level)
    var select = document.getElementById("bookmarkedFilter").value

    switch(+select){
        case SHOW_ALL:
            return true
        case SHOW_ONLY:
            return interactions.bookmarked
        case SHOW_EXCLUDE:
            return !interactions.bookmarked 
    }
    console.log("ERROR in filterBookmarked(): undefined case", select, interactions)
    return false
}
/**
 * Collection of all filter functions that make use of the delegation key. if delegationKeyValid is false, it will always return true
 * @param {LEVEL} level level to be filtered
 * @returns true if filters apply, false if not
 */
function filterInteractions(level){
    if(!filterPlayed(level))
        return false
    if(!fliterLiked(level))
        return false
    if(!filterFavorited(level))
        return false
    if(!filterBookmarked(level))
        return false

    return true
}

/**
 * toggles visibility of the filters section
 */
function showFilters(){
    if(document.getElementById('filtersToggle').innerHTML == 'Filters ▲'){
        document.getElementById('filtersToggle')
                .innerHTML = 'Filters ▼';
        document.getElementById('filters').style
                .display = 'block';
    }
    else{
        document.getElementById('filtersToggle')
                .innerHTML = 'Filters ▲';
        document.getElementById('filters').style
                .display = 'none';
    }
}

/**
 * loads the selects used to filter for tags
 */
function loadTagSelect(){
    var htmloutRequired = '<option value="0" id="noneRequired">-</option>';
    var htmloutExcluded = '<option value="0" id="noneExcluded">-</option>';

    fetch('https://www.bscotch.net/api/levelhead/level-tags/counts')
    .then(r => r.json())
    .then(
        function(r){
            r.data.forEach( tag => {
                htmloutRequired += tagSelectTemplate.replaceAll('{{tagId}}', tag.tag)
                                                    .replace('{{tagName}}', tag.name)
                                                    .replace('{{selectName}}', 'Required');
                htmloutExcluded += tagSelectTemplate.replaceAll('{{tagId}}', tag.tag)
                                                    .replace('{{tagName}}', tag.name)
                                                    .replace('{{selectName}}', 'Excluded');
            })
            for(var x =1; x<4; ++x){
                document.getElementById('requiredTags'+ x)
                        .innerHTML = htmloutRequired.replaceAll('{{selectNumber}}', x);
                document.getElementById('excludedTags'+ x)
                        .innerHTML = htmloutExcluded.replaceAll('{{selectNumber}}', x);
            }
        }
    )
}

var tagSelectTemplate=`
<option value="{{tagId}}" id="{{tagId}}{{selectName}}{{selectNumber}}">{{tagName}}</option>
`;

//#endregion

//#region Sorting

/**
 * contains the values that levels can be sorted by
 */
var sortOptions = [
    "default",
    //level.createdAgo
    "most recent",
    "oldest",
    //level.stats.TimePerWin
    "longest",
    "shortest",
    //level.stats.ClearRate
    "easiest",
    "hardest",
    //level.stats.Players
    "most players",
    "least players",
    //level.stats.Attempts
    "most plays",
    "least plays",
    //level.stats.ExposureBucks
    "most EB",
    "least EB",
    //level.stats.Likes
    "most liked",
    "least liked",
    //level.stats.Favorites
    "most favorited",
    "least favorited",
    //level.stats.ReplayValue
    "most spicy",
    "least spicy",
    //level.stats.PlayTime
    "highest play time",
    "lowest play time"
];

/**
 * contains the compare funtions used to sort levels
 */
var sortFunctions = {
        //level.createdAgo
        'most recent' : function(a, b){
            //some properties are undefined when not set. Undefined values can break the sorting functions
            if(a.createdAgo === undefined) a.createdAgo = 0;
            if(b.createdAgo === undefined) b.createdAgo = 0;
            return a.createdAgo - b.createdAgo;
        },
        'oldest' : function(a, b){
            if(a.createdAgo === undefined) a.createdAgo = 0;
            if(b.createdAgo === undefined) b.createdAgo = 0;
            return b.createdAgo - a.createdAgo;
        },
        //level.stats.TimePerWin
        'longest' : function(b, a){
            if(a.stats.TimePerWin === undefined) a.stats.TimePerWin = 0;
            if(b.stats.TimePerWin === undefined) b.stats.TimePerWin = 0;
            return a.stats.TimePerWin - b.stats.TimePerWin;
        },
        'shortest' : function(b, a){
            if(a.stats.TimePerWin === undefined) a.stats.TimePerWin = 0;
            if(b.stats.TimePerWin === undefined) b.stats.TimePerWin = 0;
            return b.stats.TimePerWin - a.stats.TimePerWin;
        },
        //level.stats.ClearRate
        'easiest' : function(b, a){
            if(a.stats.ClearRate === undefined) a.stats.ClearRate = 0;
            if(b.stats.ClearRate === undefined) b.stats.ClearRate = 0;
            return a.stats.ClearRate - b.stats.ClearRate;
        },
        'hardest' : function(b, a){
            if(a.stats.ClearRate === undefined) a.stats.ClearRate = 0;
            if(b.stats.ClearRate === undefined) b.stats.ClearRate = 0;
            return b.stats.ClearRate - a.stats.ClearRate;
        },
        //level.stats.Players
        'most players' : function(b, a){
            if(a.stats.Players === undefined) a.stats.Players = 0;
            if(b.stats.Players === undefined) b.stats.Players = 0;
            return a.stats.Players - b.stats.Players;
        },
        'least players' : function(b, a){
            if(a.stats.Players === undefined) a.stats.Players = 0;
            if(b.stats.Players === undefined) b.stats.Players = 0;
            return b.stats.Players - a.stats.Players;
        },
        //level.stats.Attempts
        'most plays' : function(b, a){
            if(a.stats.Attempts === undefined) a.stats.Attempts = 0;
            if(b.stats.Attempts === undefined) b.stats.Attempts = 0;
            return a.stats.Attempts - b.stats.Attempts;
        },
        'least plays' : function(b, a){
            if(a.stats.Attempts === undefined) a.stats.Attempts = 0;
            if(b.stats.Attempts === undefined) b.stats.Attempts = 0;
            return b.stats.Attempts - a.stats.Attempts;
        },
        //level.stats.ExposureBucks
        'most EB' : function(b, a){
            if(a.stats.ExposureBucks === undefined) a.stats.ExposureBucks = 0;
            if(b.stats.ExposureBucks === undefined) b.stats.ExposureBucks = 0;
            return a.stats.ExposureBucks - b.stats.ExposureBucks;
        },
        'least EB' : function(b, a){
            if(a.stats.ExposureBucks === undefined) a.stats.ExposureBucks = 0;
            if(b.stats.ExposureBucks === undefined) b.stats.ExposureBucks = 0;
            return b.stats.ExposureBucks - a.stats.ExposureBucks;
        },
        //level.stats.Likes
        'most liked' : function(b, a){
            if(a.stats.Likes === undefined) a.stats.Likes = 0;
            if(b.stats.Likes === undefined) b.stats.Likes = 0;
            return a.stats.Likes - b.stats.Likes;
        },
        'least liked' : function(b, a){
            if(a.stats.Likes === undefined) a.stats.Likes = 0;
            if(b.stats.Likes === undefined) b.stats.Likes = 0;
            return b.stats.Likes - a.stats.Likes;
        },
        //level.stats.Favorites
        'most favorited' : function(b, a){
            if(a.stats.Favorites === undefined) a.stats.Favorites = 0;
            if(b.stats.Favorites === undefined) b.stats.Favorites = 0;
            return a.stats.Favorites - b.stats.Favorites;
        },
        'least favorited' : function(b, a){
            if(a.stats.Favorites === undefined) a.stats.Favorites = 0;
            if(b.stats.Favorites === undefined) b.stats.Favorites = 0;
            return b.stats.Favorites - a.stats.Favorites;
        },
        //level.stats.ReplayValue
        'most spicy' : function(b, a){
            if(a.stats.ReplayValue === undefined) a.stats.ReplayValue = 0;
            if(b.stats.ReplayValue === undefined) b.stats.ReplayValue = 0;
            return a.stats.ReplayValue - b.stats.ReplayValue;
        },
        'least spicy' : function(b, a){
            if(a.stats.ReplayValue === undefined) a.stats.ReplayValue = 0;
            if(b.stats.ReplayValue === undefined) b.stats.ReplayValue = 0;
            return b.stats.ReplayValue - a.stats.ReplayValue;
        },
        //level.stats.PlayTime
        'highest play time' : function(b, a){
            if(a.stats.PlayTime === undefined) a.stats.PlayTime = 0;
            if(b.stats.PlayTime === undefined) b.stats.PlayTime = 0;
            return a.stats.PlayTime - b.stats.PlayTime;
        },
        'lowest play time' : function(b, a){
            if(a.stats.PlayTime === undefined) a.stats.PlayTime = 0;
            if(b.stats.PlayTime === undefined) b.stats.PlayTime = 0;
            return b.stats.PlayTime - a.stats.PlayTime;
        }
}

/**
 * loads select field used for sorting. <select id="sortSelect">
 */
function loadSortingSelect(){
    var htmlout = '';
    var sortId = 0;

    sortOptions.forEach(sort => {
        htmlout += `<option value="${sortId++}">${sort}</option>`;
    })
    document.getElementById("sortSelect").innerHTML = htmlout;
}

/**
 * Sorts a level array by the selected criteria
 * @param {Array<LEVEL>} levelArray Array containing levels to be sorted
 */
function sortLevels(levelArray){
    var sortBy = document.getElementById("sortSelect").value;
    if(sortBy == 0) return;
    sortBy = sortOptions[sortBy];

    //choosing sort by string (to make changing the order not matter)
    levelArray.sort(sortFunctions[sortBy]);
}

//#endregion

//#region Level Cards

//Generic Card Templates

/**
 * Creates an html card from a level object
 * @param {LEVEL} level level to create card from
 * 
 * Following arguments: content of Level card text (will be put between <p class="cardTextLine"> automatically)
 * @returns Level card
 */
function createLevelCard(level){
    var text = '';
    var pictures = '';
    var delegationContent = '';

    for(x = 1; x < arguments.length; ++x){
        text += arguments[x];
        if(x !=  arguments.length - 1)
            text += '<br>';
    }

    pictures += icon.avatar(level.avatarId);
    pictures += icon.graduated(level.tower);
    pictures += icon.towerTrial(level.towerTrial);
    pictures += icon.dailyBuild(level.dailyBuild);
    pictures += icon.multiplayer(level.requiredPlayers);

    if(delegationKeyValid){
        delegationContent += template.bookmarkButton(level);
        pictures += icon.interactionPlayed(getInteractions(level));
    }

    return `
    <div class="column">
        <div class="card">
            <div class="cardPictures">
                ${pictures}
            </div>
            <p class="cardText">
                ${text}
            </p>
            <div class="cardDelegation">${delegationContent}</div>
        </div>
    </div>`
}

/**
 * reloads the level cards. applies filters and sorting in the process, also updates levelTotal and matchingLevels
 */
function reloadLevels(){
    document.getElementById("levelCards")
            .innerHTML = 'generating';
    var htmlout = '';
    var levelTotal = 0;
    matchingLevels = 0;
    var levelArray = [];

    levelList.forEach(call => {
        call.forEach(level => {
            levelArray.push(level);
        })
    })

    sortLevels(levelArray);


        levelArray.forEach(level => {
            if(checkFilters(level)){
                matchingLevels++;
                //createSpecificLevelCard must be defined in the tool's .js file
                htmlout += createSpecificLevelCard(level);
            }
        })

    document.getElementById('levelCount').style.display = 'block';
    //add size of each fetch to get total level count
    levelList.forEach(fetch => {
        levelTotal += fetch.length;
    })
    //show count of total levels and matching levels
    document.getElementById('levelCountTotal').innerHTML = levelTotal;
    document.getElementById('levelCountMatch').innerHTML = matchingLevels;
    document.getElementById("levelCards").innerHTML = htmlout;
}

/**
 * removes/adds bookmark and toggles Bookmark button of level Card.
 * @param {String} levelCode a level's code. must be sanitized
 */
function toggleBookmark(levelCode){
    document.getElementById('bookmarkButton'+ levelCode).disabled = true;

    if(document.getElementById('bookmarkButton'+ levelCode).innerHTML != 'Create Bookmark')
        if(manageBookmark(levelCode, 'DELETE')){
            document.getElementById('bookmarkButton'+ levelCode).disabled = false;
            document.getElementById('bookmarkButton'+ levelCode).innerHTML = 'Create Bookmark';
        }
        else{
            console.log("ACTION FAILED")
        }
    else
        if(manageBookmark(levelCode, 'PUT')){
            document.getElementById('bookmarkButton'+ levelCode).disabled = false;
            document.getElementById('bookmarkButton'+ levelCode).innerHTML = 'Remove Bookmark';
        }
        else{
            console.log('ACTION FAILED')
        }
}

/**
 * templates used inside level cards
 */
var template = {

    copyCodeButton : function (level){
        var code = level.levelId;
        return `<button onclick="navigator.clipboard.writeText('${code}')" style="height: 20px; font-size: 10px;" id="levelCodeButton">Copy Levelcode</button><button style="height: 20px; font-size: 10px;" onclick="window.open('../HiddenLevelStatistics/index.html?levelCode=${code}')">Statistics</button>`;
    },

    playerPlaysCount : function (level){
        var players = level.stats.Players;
        var plays = level.stats.Attempts;
        if(players === undefined) players = 0;
        if(plays === undefined) plays = 0;
        return `<b>Players:</b> ${players}, <b>Plays:</b> ${plays}`;
    },

    levelLink : function (level){
        var levelname = level.title;
        var code = level.levelId;
        return `<a href="https://levelhead.io/+${code}" target="_blank">${levelname}</a>`;
    },

    profileLink : function (level){
        var alias = level.alias.alias;
        var code = level.userId;
        return `<a href="https://levelhead.io/@${code}" target="_blank">${alias}</a>`;
    },

    likeFavoriteDifficulty : function (level){
        var likes = level.stats.Likes;
        var favorites = level.stats.Favorites;
        var diffRating = level.stats.Diamonds;
        if(likes === undefined) likes = 0;
        if(favorites === undefined) favorites = 0;
        return `<a style="color:red">♥️</a>: ${likes}, <a style="color:goldenrod">★</a>: ${favorites}, ${icon.difficulty[diffRating]}`;
    },

    creationDate : function (level){ //ToDo: replace with level object
        var date = level.createdAt;
        var readableDate = new Date(date).toString().substring(4,15);
        return `<b>Created:</b> ${readableDate}`;
    },

    exposure : function (level){
        var eb = level.stats.ExposureBucks;
        if(eb === undefined) eb = 0;
        return `EB: ${eb}`;
    },

    tags : function(level){
        return level.tagNames;
    },

    bookmarkButton(level){
        return `<button id="bookmarkButton${level.levelId}" class="bookmarkButton" onclick="toggleBookmark('${level.levelId}')">${getInteractions(level).bookmarked ? 'Remove Bookmark' : 'Create Bookmark'}</button>`;
    }
}

/**
 * collection of templates used to display icons
 */
var icon = {
    //
    showIcon : ["none", ""],

    graduatedShow : ["MD", "TOWER"],

    iconTemplate : '<img src="../PicturesCommon/CardIcons/{{icon}}.png" id="miniIcon{{icon}}">',

    avatarTemplate : '<img src="https://img.bscotch.net/fit-in/100x100/avatars/{{avatar}}.webp" id="cardPicture">',

    playedStatus : ['NONE', 'PLAYED', 'BEATEN'],

    difficulty : [
        '⋄⋄⋄⋄⋄',
        '<a style="color:red">♦</a>⋄⋄⋄⋄',
        '<a style="color:red">♦♦</a>⋄⋄⋄',
        '<a style="color:red">♦♦♦</a>⋄⋄',
        '<a style="color:red">♦♦♦♦</a>⋄',
        '<a style="color:red">♦♦♦♦♦</a>',
        '⋄⋄⋄⋄⋄'
    ],

    avatar : function (avatarId, size = 100){
        if(!avatarId) avatarId = 'bureau-employee';
        return `<img src="${getAvatarURL(avatarId, size)}" id="cardAvatar">`;
    },

    graduated : function (graduated){
        return `<img src="../PicturesCommon/CardIcons/${this.graduatedShow.at(graduated ? 1 : 0)}.png" id="cardMiniIconGraduated" style="margin-left:2px;"></img>`;
    },

    towerTrial : function (tt){
        if(tt)
            return `<img src="../PicturesCommon/CardIcons/TT.png" id="cardMiniIconTT" style="margin-left:80px;">`;
        else
            return '';
    },

    dailyBuild : function (daily){
        if(daily)
            return `<img src="../PicturesCommon/CardIcons/DAILYBUILD.png" id="cardMiniIconDaily" style="margin-top:75px;margin-left:6px;">`;
        else
            return '';
    },
    multiplayer : function(playerCount){
        if(playerCount && playerCount != 1){
            return `
            <div id="cardMiniIconMultiplayer" style="display: grid">
                <img style="max-width:40px;grid-row:1;grid-column:1;" src="../PicturesCommon/CardIcons/MULTIPLAYER.png">
                <div style="color:white;margin-top:7px;margin-left:8px;font-family:monospace;grid-row:1;grid-column:1;">${playerCount}</div>
            </div>`
        }
        else
            return ""
    },
    interactionPlayed : function (interactions){
        return `<img src="../PicturesCommon/CardIcons/INTERACTION_${this.playedStatus[interactions.played + interactions.completed]}.png" id="cardMiniIconPlayed">`
    }
}

//#endregion
