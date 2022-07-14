
//#region Global Variables
var levelList = []; //saves each fetch call as an array.
var matchingLevels = 0;

//#endregion

//#region Filters

//filter constants
const SHOW_ALL = 0;
const SHOW_ONLY = 1;
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

//#region Level Cards

//Generic Card Templates

//First argument: Level from fetch call. Following arguments: content of Level card text (will be put between <p class="cardTextLine"> automatically)
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

function reloadLevels(){
    document.getElementById("levelCards")
            .innerHTML = 'generating';
    var htmlout = '';
    var levelTotal = 0;
    matchingLevels = 0;

    levelList.forEach( fetchCall =>{
        fetchCall.forEach(level => {
            if(checkFilters(level)){
                matchingLevels++;
                htmlout += createSpecificLevelCard(level);
            }
        })
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

//toggles Bookmark button of level Card
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
        return `<a style="color:#7E3517">♥️</a>: ${likes}, <a style="color:#7F5217">★</a>: ${favorites}, ${icon.difficulty[diffRating]}`;
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
    interactionPlayed : function (interactions){
        return `<img src="../PicturesCommon/CardIcons/INTERACTION_${this.playedStatus[interactions.played + interactions.completed]}.png" id="cardMiniIconPlayed">`
    }
}

//#endregion
