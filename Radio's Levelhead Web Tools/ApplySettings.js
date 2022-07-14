//Global Variables

var delegationKeyValid = false;


//#region general purpose functions

function getAvatarURL(avatarId, size = 100){
    return `https://img.bscotch.net/fit-in/${size}x${size}/avatars/${avatarId}.webp`;
}

//creates a request body for fetch calls making use of delegation keys
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

//Delegation Key stuff. very chaotic, probably nonsensical
function checkDelegationKey(){
    try{
    if(window.localStorage.getItem('DelegationKey'))
    fetch('https://www.bscotch.net/api/levelhead/aliases?userIds=@me', getExtendedRequestBody('GET'))
    .then(function(r){ delegationKeyValid = (r.status == '200')}) //see if status is OK
    }
    catch(exception){
        delegationKeyValid = false;
    }
}

function addInteractionDetails()
{
    return delegationKeyValid ? "&includeMyInteractions=true" : "";
}

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

//cursor constants
var cursorOptions = [
    "normal",
    "blue",
    "green",
    "fuchsia",
    "orange"
];
//cursor picture path
var setCursorTemplate = "url('../PicturesCommon/Cursors/{{color}}.png'), auto";

function loadOptions(){
    loadCursor();
    checkDelegationKey();
}

function loadCursor(){
    var cursor = window.localStorage.getItem('CursorOption');
    if(cursor && cursor != cursorOptions[0] && cursorOptions.includes(cursor)){
        document.body.style.cursor = setCursorTemplate.replaceAll('{{color}}', cursor);
        //ToDo: set other cursors
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