//#region Variables for Level loading
var maxFetch=128; //maximum amount of levels a fetch call returns
var maxFetchAmount=100; //cap for fetch calls cuz infinite loops are scary

//Buffer (to prevent redundant calls)
var lastCode='';
//#endregion



//#region URL helpers
function assemblePlayerURL(){
    return 'https://www.bscotch.net/api/levelhead/levels?limit='+ maxFetch +'&userIds='+ getProfileCode(document.getElementById('userCode').value) +'&includeStats=true&maxCreatedAt=';
}

function assembleProfileURL()//used to check if the profile is valid
{
    return 'https://www.bscotch.net/api/levelhead/players?userIds='+ getProfileCode(document.getElementById('userCode').value) +'&includeAliases=true';
}
//#endregion

//#region Filters
/* 
FILTERS:
//  Daily build: <select id="dailyFilter">
//  Difficulty: <select id="difficultyFilter">
//  Graduated?: <select id="graduationFilter">
//  Min Players: <input type="number" min="0" max="99999" value="0"><br>
//  Max Players: <input type="number" min="0" max="99999" value="999"><br>
//  Tower Trial: <select id="TTFilter">
*/
function checkFilters(level){
    if(!filterDaily(level)) return false;

    if(!filterDifficulty(level)) return false;

    if(!filterGraduation(level)) return false;
    
    if(!filterPlayerCount(level)) return false;

    if(!filterTowerTrial(level)) return false;

    if(!filterMultiplayer(level)) return false;

    if(!filterTags(level)) return false;

    if(!filterInteractions(level)) return false;

    return true;
}
//#endregion

//#region Level Loading
function createSpecificLevelCard(level){
    return createLevelCard(level,
        template.levelLink(level),
        template.likeFavoriteDifficulty(level),
        template.tags(level),
        template.playerPlaysCount(level),
        template.creationDate(level),
        template.copyCodeButton(level)
        );
}

//lastDate: date of most recently fetched level.
//lastId: id of last level, so it doesn't get fetched again
//fetches: increasing number, to prevent potential infinie loops.
function recursivelyLoadLevels(lastDate, lastId, fetches){            //add interactions if delegation key is present
    fetch(assemblePlayerURL()+ lastDate +'&tiebreakerItemId='+ lastId +addInteractionDetails(), delegationKeyValid ? getExtendedRequestBody() : undefined)
    .then(r=>r.json())
    .then(function(r){
        fetches++;
        levelList.push(r.data);
        //if r.data.length<maxFetch, that means the end of the profile has been reached, because otherwise the API wouldn't return <maxFetch Levels 
        if(r.data.length<maxFetch || fetches > maxFetchAmount){ 
            console.log(levelList);
            reloadLevels();
            return;
        }
        else//                creation date of last level.         id of last level
        recursivelyLoadLevels(r.data[r.data.length-1].createdAt, r.data[r.data.length-1]._id, fetches);
    })
}

function loadProfileLevels(){
    document.getElementById('levelCards')
            .innerHTML='Loading...';
    fetches=0;

    //avoid unnecessary fetch calls
    if(document.getElementById('userCode')
               .value.trim().toLowerCase() == lastCode){
                reloadLevels();
        return;
    }

    levelList=[];
    lastCode = document.getElementById('userCode')
                       .value.trim().toLowerCase();

    console.log(assemblePlayerURL());
    var checkCode = true;
    console.log(assembleProfileURL(), !!window.localStorage.getItem('DelegationKey'));
    //most of this is to check if the profile is valid
    fetch(assembleProfileURL())
    .then(r => r.json())
    .then(
        function(r){
            console.log(r.data);
            //if more than 1 profile is returned, the creator code was incorrect.
            //it will simply return a bunch of random profiles
            if(r.data.length != 1){
                document.getElementById('levelCards')
                        .innerHTML = 'INVALID ID';
                checkCode = false;
            }
            else
                document.getElementById('creatorName')
                        .innerHTML=r.data[0].alias.alias;
        })
        .then(function(){
            //only happens when profile is valid
            if(checkCode) recursivelyLoadLevels('', '', 0); 
        }); 
    
}

//#endregion

//#region Templates

var tagSelectTemplate = `
<option value="{{tagId}}" id="{{tagId}}{{selectName}}{{selectNumber}}">{{tagName}}</option>
`;
//#endregion