//#region Variables for Level loading
var levelList = []; //all fetches are saved in here
var maxFetch=128; //maximum amount of levels a fetch call returns
var maxFetchAmount=100; //cap for fetch calls cuz infinite loops are scary

//Buffer (to prevent redundant calls)
var lastCode='';
//#endregion

//#region constants
var difficulty = [
    '⋄⋄⋄⋄⋄',
    '<a style="color:red">♦</a>⋄⋄⋄⋄',
    '<a style="color:red">♦♦</a>⋄⋄⋄',
    '<a style="color:red">♦♦♦</a>⋄⋄',
    '<a style="color:red">♦♦♦♦</a>⋄',
    '<a style="color:red">♦♦♦♦♦</a>',
    '⋄⋄⋄⋄⋄'
];

var SHOW_ALL=0;
var SHOW_ONLY=1;
var SHOW_EXCLUDE=2;
//#endregion

//#region URL helpers
function assemblePlayerURL(){
    return 'https://www.bscotch.net/api/levelhead/levels?limit='+ maxFetch +'&userIds='+ document.getElementById('userCode').value.trim().toLowerCase() +'&includeStats=true&maxCreatedAt=';
}

function assembleProfileURL()//used to check if the profile is valid
{
    return 'https://www.bscotch.net/api/levelhead/players?userIds='+ document.getElementById('userCode').value.toLowerCase().trim()+'&includeAliases=true';
}
//#endregion

//#region Filters
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
    var filterVal = document.getElementById('dailyFilter').value;
    if(!((filterVal !=0 ) ? (level.dailyBuild != (filterVal-1)) : true)) return false;

    filterVal = document.getElementById('difficultyFilter').value; 
    if(!((filterVal != 0) ? (level.stats.Diamonds == filterVal) : true)) return false;

    filterVal = document.getElementById('graduationFilter').value; 
    if(!((filterVal != 0) ? (level.tower != (filterVal-1)) : true)) return false;
    
    //min players <= players >= max players 
    if(!(level.stats.Players >= document.getElementById('minPlayerFilter').value
    && level.stats.Players <= document.getElementById('maxPlayerFilter').value)) return false;

    filterVal = document.getElementById('TTFilter').value; 
    if(!((filterVal != 0) ? (level.towerTrial != (filterVal-1)) : true)) return false;

    //Tag Filtering

    for(var x = 1; x < 4; ++x){
        //check if Level has specified tags
        if(document.getElementById('requiredTags'+ x).value != 0 ? !level.tags.includes(document.getElementById('requiredTags'+ x).value) : false) return false;
        if(document.getElementById('excludedTags'+ x).value != 0 ? level.tags.includes(document.getElementById('excludedTags'+ x).value) : false) return false;
    }

    return true;
}
//#endregion

//#region Level Loading

function loadCards(){
    document.getElementById('profileLevels')
            .innerHTML='Generating...';
    var htmlout="";
    levelList.forEach(fetchCall => {
        fetchCall.forEach(level => {
            if(checkFilters(level)){ //only creates card if filters apply
                htmlout+=levelCardTemplate
                .replace('{{avatar}}', level.avatarId)
                .replace('{{levelname}}', level.title)
                .replaceAll('{{levelcode}}', level.levelId)
                .replace('{{likes}}', level.stats.Likes ? level.stats.Likes : 0)
                .replace('{{favorites}}', level.stats.Favorites ? level.stats.Favorites : 0)
                .replace('{{createdAt}}', new Date(level.createdAt).toString().substring(4,15))//handles time format
                .replace('{{difficulty}}', difficulty[level.stats.Diamonds])
                .replace('{{graduated}}', level.tower ? 'TOWER' : 'MD')
                .replace('{{players}}', level.stats.Players)
                .replace('{{plays}}', level.stats.Attempts)
                .replace('{{daily}}', level.dailyBuild ? 'visible' : 'none')
                .replace('{{tt}}', level.towerTrial ? 'visible' : 'none')
                .replace('{{tags}}', level.tagNames)
            }
        })
    })
    document.getElementById('profileLevels')
            .innerHTML=htmlout;
}

//lastDate: date of most recently fetched level.
//lastId: id of last level, so it doesn't get fetched again
//fetches: increasing number, to prevent potential infinie loops.
function recursivelyLoadLevels(lastDate, lastId, fetches){
    fetch(assemblePlayerURL()+lastDate+ '&tiebreakerItemId=' +lastId)
    .then(r=>r.json())
    .then(function(r){
        fetches++;
        levelList.push(r.data);
        //if r.data.length<maxFetch, that means the end of the profile has been reached, because otherwise the API wouldn't return <maxFetch Levels 
        if(r.data.length<maxFetch || fetches > maxFetchAmount){ 
            console.log(levelList);
            loadCards();
            return;
        }
        else//                creation date of last level.         id of last level
        recursivelyLoadLevels(r.data[r.data.length-1].createdAt, r.data[r.data.length-1]._id, fetches);
    })
}

function reloadLevels(){
        document.getElementById("profileLevels")
                .innerHTML = "Generating...";
        loadCards();
}

function loadProfileLevels(){
    document.getElementById('profileLevels')
            .innerHTML='Loading...';
    fetches=0;

    //avoid unnecessary fetch calls
    if(document.getElementById('userCode')
               .value.trim().toLowerCase() == lastCode){
        loadCards();
        return;
    }

    levelList=[];
    lastCode = document.getElementById('userCode')
                       .value.trim().toLowerCase();

    console.log(assemblePlayerURL());
    var checkCode = true;
    //most of this is to check if the profile is valid
    fetch(assembleProfileURL())
    .then(r => r.json())
    .then(
        function(r){
            console.log(r.data);
            //if more than 1 profile is returned, the creator code was incorrect.
            //it will simply return a bunch of random profiles
            if(r.data.length != 1){
                document.getElementById('profileLevels')
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
var levelCardTemplate=`
<div class="column"><div class="card">
<img src="https://img.bscotch.net/fit-in/100x100/avatars/{{avatar}}.webp" id="cardPicture">
<img src="pictures/{{graduated}}.png" id="miniIcon" style="margin-left:2px;">
<img src="pictures/TT.png" id="miniIcon" style="margin-left:80px;display:{{tt}};">
<img src="pictures/DAILYBUILD.png" id="miniIcon" style="margin-top:75px;margin-left:6px;display:{{daily}};">
    <p id="cardText">
        <a href="https://levelhead.io/+{{levelcode}}" target="ProfileLevel">{{levelname}}</a><br>
        <a style="color:#7E3517">♥</a>: {{likes}}, <a style="color:#7F5217">★</a>: {{favorites}}, {{difficulty}}<br>
        {{tags}}<br>
        <b>Players:</b> {{players}}, <b>Plays:</b> {{plays}}<br>
        <b>Created:</b> {{createdAt}}<br>
        <button onclick="navigator.clipboard.writeText('{{levelcode}}')" style="height: 20px; font-size: 10px;" id="levelCodeButton">Copy Levelcode</button>
    </p>
</div></div>
`;

var tagSelectTemplate=`
<option value="{{tagId}}" id="{{tagId}}{{selectName}}{{selectNumber}}">{{tagName}}</option>
`;
//#endregion