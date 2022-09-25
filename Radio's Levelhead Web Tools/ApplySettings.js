//Global Variables
/**
 * specifies if there's a valid delegation key. set by checkDelegationKey()
 */
var delegationKeyValid = false;

//#region html generation

/**
 * Contains names and folders for the generation of the footer
 * 
 * position 0: folder name, position 1: display name
 */
var toolNames = [
    ["Setting", "Site Settings"],
    ["ProfileLevelViewer", "Profile Level Viewer"],
    ["AdvancedMDSearch", "Advanced Marketing Department Search"],
    ["DailyBuildViewer", "Daily Build Viewer"],
    ["HiddenLevelStatistics", "Hidden Level Statistics viewer"],
    ["HiddenProfileStatisticsViewer", "Hidden Profile Statistics Viewer"],
    ["RecordViewer", "Record Viewer"],
    ["CombobulatorSimulator", "Combobulator Simulator"],
    ["PictureGallery", "Avatar Gallery"],
    ["AdvancedTowerSearch", "Advanced Tower Search"],
    ["TowerTrialViewer", "Tower Trial Viewer"],
    ["SubmitFeedback", "Feedback Submission"]
]
/**
 * Folder of the current tool. loaded by currentToolName()
 */
var currentToolName = "";

/**
 * Retrieves the name of the current folder and saves it in currentToolName
 * @returns Name of the current folder
 */
function getCurrentToolName(){
    var name = window.location.href;

    name = name.substring(0, name.lastIndexOf('/'));
    name = name.substring(name.lastIndexOf('/')+1, name.length);
    currentToolName = name;
    return name;
}

/**
 * Generates a footer linking to other tools
 * @note The site has to be in a folder inside the main folder, otherwise this won't work
 */
function generateToolFooter(){
    getCurrentToolName();

    var htmlout = "";

    toolNames.forEach(name => {
        if(name[0] != currentToolName)
            htmlout += `<p><a href="../${name[0]}/index.html">${name[1]}</a></p>`
    })
    document.body.innerHTML += `<footer id="navigationFooter"><p><b>Other Tools:</b></p><p><b><a href="../index.html">Main Page</a></b></p>${htmlout}</footer>`;
}

//#endregion

//#region general purpose functions

/**
 * Returns a URL to be used for Level fetch calls
 * @param {Boolean} stats if true, includes stats (Plays, playtime, etc.)
 * @param {Boolean} aliases if true, includes alias (player name, etc.)
 * @param {Boolean} records if true, includes leaderboards (shoe, ribbon)
 * @param {Boolean} interactions if true includes interactions (boommarked, played, etc.). WARNING: Must be used with a delegation key.
 * @param {Number} limit Maximun number of levels to be returned.
 * @returns URL for a level fetch call
 */
function levelFetchUrl(stats = true, aliases = true, records = true, interactions = false, limit = 128){
    var basicURL = 'https://www.bscotch.net/api/levelhead/levels?limit=' + limit
    if(stats)
        basicURL += '&includeStats=true'
    if(aliases)
        basicURL += '&includeAliases=true'
    if(records)
        basicURL += '&includeRecords=true'
    if(interactions)
        basicURL += '&includeMyInteractions=true'

    return basicURL
}

/**
 * Input sanitization for Creator codes
 * @param {String} input creator code or profile link. the levelhead.io and bschotch.net links both work
 * @returns null if code could not be extracted
 * @returns the cleaned code
 */
function getProfileCode(input = ""){
    var clean = input.trim().toLowerCase();
    if(input.length == 6)
        return clean;
    var result = /levelhead\.io\/@(.{6})/.exec(clean);

    if(result == null)
        result = /bscotch\.net\/games\/levelhead\/players\/(.{6})/.exec(clean);
    
    if(result == null)
        return null;
    
    return result[1];
}

/**
 * Input sanitization for Level codes
 * @param {String} input level code or level link. the levelhead.io and bschotch.net links both work
 * @returns null if code could not be extracted
 * @returns the cleaned code
 */
function getLevelCode(input = ""){
    var clean = input.trim().toLowerCase();
    if(input.length == 7)
        return clean;

    var result = /levelhead\.io\/\+(.{7})/.exec(clean);

    if(result == null)
        result = /bscotch\.net\/games\/levelhead\/levels\/(.{7})/.exec(clean);

    if(result == null)
        return null;
        
    return result[1];
}

/**
 * Input sanitization for Creator codes and profile codes. Can distinguish the 2, but cannot handle playlists
 * @param {String} input creator/level code or profile/level link. the levelhead.io and bschotch.net links both work
 * @returns null if code could not be extracted
 * @returns the cleaned code. result[0] is either 'Profile' or 'Level' depemding on what the code is for. result[1] is the code
 */
function getAnyCode(input = ""){
    var result = getProfileCode(input);
    
    if(result != null)
        return ['Profile', result];
    result = getLevelCode(input);

    if(result != null)
        return ['Level', result];
    
    return null;
}
/**
 * Input sanitization for Playlist codes
 * @param {String} input playlist code or playlist link. the levelhead.io and bschotch.net links both work
 * @returns null if code could not be extracted
 * @returns the cleaned code
 */
function getPlaylistCode(input = ""){
    var clean = input.trim().toLowerCase();
    if(input.length == 7)
        return clean;

    var result = /levelhead\.io\/\-(.{7})/.exec(clean);

    if(result == null)
        result = /bscotch\.net\/games\/levelhead\/playlists\/(.{7})/.exec(clean);

    if(result == null)
        return null;
        
    return result[1];
}

/**
 * Creates a URL to load an avatar with
 * @param {String} avatarId id of the avatar. see https://beta.bscotch.net/api/docs/community-edition/#avatars
 * @param {Number} size specifies size of the returned avatar. it will be size x size big
 * @returns URL to load an avatar with
 */
function getAvatarURL(avatarId, size = 100){
    return `https://img.bscotch.net/fit-in/${size}x${size}/avatars/${avatarId}.webp`;
}

/**
 * creates a request body for fetch calls making use of delegation keys
 * @param {String} method either 'GET', 'POST', 'PUT' or 'DELETE'
 * @returns A request body to be used with the fetch function. fetch(URL, RequestBody)
 */
function getExtendedRequestBody(method = 'GET'){
    var requestBody = {
        'method': method,
        'headers': {
            'Rumpus-Delegation-Key' : JSON.parse(window.localStorage.getItem('DelegationKey')).Key
        },
        'mode': 'cors',
        'cache': 'default'
    }
    return requestBody;
}

var delegationKeyChecked = false
/**
 * Checks if the Delegation Key is valid. sets delegationKeyValid to true if valid, false if invalid
 */
function checkDelegationKey(){
    try{
    if(window.localStorage.getItem('DelegationKey'))
    fetch('https://www.bscotch.net/api/levelhead/aliases?userIds=@me', getExtendedRequestBody('GET'))
    .then(function(r){ 
        delegationKeyValid = (r.status == '200')
        delegationKeyChecked = true
    }) //see if status is OK
    }
    catch(exception){//fetch failed means no internet connection or key is invalid
        delegationKeyValid = false
        delegationKeyChecked = true
    }
}

/**
 * used for API calls that support includeMyInteractions
 * @returns "" if there's no valid delegation key, else "&includeMyInteractions=true"
 */
function addInteractionDetails()
{
    return delegationKeyValid ? "&includeMyInteractions=true" : "";
}

/**
 * Get the interactions (played, completed, etc.) from a level
 * @param {LEVEL} level level object, returned by level-related api calls
 * @returns interactions object. contains 'bookmarked', 'liked', 'favorited', 'played' and 'completed'.
 *  all but 'bookmarked' are set to true if the level was made by the player whose delegation key is used
 */
function getInteractions(level){
    //checks if level was created by user
    var ownLevel = level.userId == JSON.parse(window.localStorage.getItem('DelegationKey')).UserCode;
    var possibleInteractions = {
        'bookmarked':false,
        'liked':ownLevel,
        'favorited':ownLevel,
        'played':ownLevel,
        'completed':ownLevel
    }
    //check if any interactions, then add interactions
    if(level.interactions){
        //double negation for conversion in bool (can otherwise be undefined)
        possibleInteractions.bookmarked = level.interactions.bookmarked ?true:false;
        if(!ownLevel){
            possibleInteractions.liked = level.interactions.liked ?true:false;
            possibleInteractions.favorited = level.interactions.favorited ?true:false;
            possibleInteractions.played = level.interactions.played ?true:false;
            possibleInteractions.completed = level.interactions.completed ?true:false;
        }
    }
    return possibleInteractions;
    
}

//Bookmarks

/**
 * Can add/remove Bookmarks
 * @param {String} levelCode a level's level code. must be sanitized
 * @param {String} mode 'PUT' to create bookmark (default), 'DELETE' to remove Bookmark
 * @returns true if successful, false if unsuccessful. posts error messages using console.log
 */
function manageBookmark(levelCode, mode = 'PUT') {
    console.log(JSON.parse(window.localStorage.getItem('DelegationKey')).Key);
    try{
        fetch(`https://www.bscotch.net/api/levelhead/bookmarks/${levelCode}`,
            getExtendedRequestBody(mode));
        return true;
    }
    catch(exception){
        console.log('BOOKMARK FAILED; ACTION: '+ mode);
        return false;
    }
}

//#endregion

//#region Customization

/**
 * contains cursor colors. file name must be <color>.png
 */
var cursorOptions = [
    "normal",
    "blue",
    "green",
    "fuchsia",
    "orange"
];
/**
 * path to cursors. used in the CSS
 */
var setCursorTemplate = "url('../PicturesCommon/Cursors/{{color}}.png'), auto";

/**
 * loads cursor options and loads delegation key.
 */
function loadOptions(){
    loadCursor();
    checkDelegationKey();
}

/**
 * loads custom cursors
 */
function loadCursor(){
    var cursor = window.localStorage.getItem('CursorOption');
    if(cursor && cursor != cursorOptions[0] && cursorOptions.includes(cursor)){
        document.body.style.cursor = setCursorTemplate.replaceAll('{{color}}', cursor);
        //ToDo: set other cursors
    }
}

//#endregion

//#region other

/**
 * transforms a time in seconds into a formatted string
 * @param {Number} time time in seconds
 * @returns formatted time string
 */
function timeFormat(time){ //ToDo: document this monstrosity
    var format = window.localStorage.getItem("timeFormat")
    if(!format)
        return timeFormatOptions["standard"](time)
    else
        return timeFormatOptions[format](time)
}

/**
 * Contains all formating kinds for times
 */
var timeFormatOptions = {
    standard : function(time){
        var millis = "";
        millis = Math.floor(time*100).toFixed();
        if(time >= 86400)
            return Math.floor(time/86400) +'day(s) '+ (new Date(time * 1000).toISOString().substr(11, 8)+'.'+millis.substr(millis.length-2, millis.length-1)+'s').replace(':', 'h ').replace(':', 'm ');
        if(time >= 3600)
            return (new Date(time * 1000).toISOString().substr(11, 8)+'.'+millis.substr(millis.length-2, millis.length-1)+'s').replace(':', 'h ').replace(':', 'm ');
        if(time >= 60)
            return (new Date(time * 1000).toISOString().substr(14, 5)+'.'+millis.substr(millis.length-2, millis.length-1)+'s').replace(':', 'm ');
        return (new Date(time * 1000).toISOString().substr(17, 2)+'.'+millis.substr(millis.length-2, millis.length-1)+'s');
    },
    compact : function(time){
        var millis = "";
        millis = Math.floor(time*100).toFixed();
        if(time >= 86400)
            return Math.floor(time/86400) +'day(s) '+ (new Date(time * 1000).toISOString().substr(11, 8)+'.'+millis.substr(millis.length-2, millis.length-1));
        if(time >= 3600)
            return (new Date(time * 1000).toISOString().substr(11, 8)+'.'+millis.substr(millis.length-2, millis.length-1));
        if(time >= 60)
            return (new Date(time * 1000).toISOString().substr(14, 5)+'.'+millis.substr(millis.length-2, millis.length-1));
        return (new Date(time * 1000).toISOString().substr(17, 2)+'.'+millis.substr(millis.length-2, millis.length-1));
    }
}

/**
 * Formats a date object
 * @param {Date} date Date object to format
 * @returns Formatted Date as a string
 */
function dateFormat(date){
    var format = window.localStorage.getItem("dateFormat")
    if(!format)
        return dateFormatOptions["standard"](date)
    else
        return dateFormatOptions[format](date)
}

/**
 * Contains all formating kinds for dates
 */
var dateFormatOptions = {
    standard : function(date){
        return new Date(date).toString().substring(4,31)
    },
    locale : function(date){
        return new Date(date).toLocaleString()
    }
    
}

function scoreFormat(score){
    var format = window.localStorage.getItem("scoreFormat")
    if(!format)
        return scoreFormatOptions["standard"](score)
    else
        return scoreFormatOptions[format](score)
}

var scoreFormatOptions = {
    standard : function(score = 0){
        return score.toLocaleString()
    },
    compact : function(score = 0){
        return score
    }
}

//#endregion

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