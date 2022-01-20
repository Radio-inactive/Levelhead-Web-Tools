var levelList=[]; //all fetches are saved in here
var maxFetch=128; //maximum amount of levels a fetch call returns
var fetches=0; //keep track of how many fetch calls have been made
var maxFetchAmount=10; //cap for fetch calls cuz infinite loops are scary

function assemblePlayerURL(){
    return 'https://www.bscotch.net/api/levelhead/levels?limit='+ maxFetch +'&userIds='+document.getElementById('userCode').value.trim().toLowerCase()+'&maxCreatedAt='; //ToDo get user code
}

function assembleProfileURL()//used to check if the profile is valid
{
    return 'https://www.bscotch.net/api/levelhead/players?userIds='+ document.getElementById('userCode').value.toLowerCase().trim()+'&includeAliases=true';
}

function cleanResult(){
    document.getElementById('profileLevels').innerHTML='Generating...';
    var htmlout="";
    var levelCodeList=[]; //used to eliminate duplicate levels
    
    levelList.forEach(fetchCall => {
        fetchCall.forEach(level => {
            if(levelCodeList.includes(level.levelId)); //ToDo: probably too inefficient. I should optimize that
            else{
                levelCodeList.push(level.levelId);
                //assembles the card
                htmlout+=levelCardTemplate.replace('{{avatar}}', level.avatarId).replace('{{levelname}}', level.title).replace('{{levelcode}}', level.levelId);
            }
        })
    })
    document.getElementById('profileLevels').innerHTML=htmlout;
}


function recursivelyLoadLevels(lastDate){
    fetch(assemblePlayerURL()+lastDate)
    .then(r=>r.json())
    .then(function(r){
        fetches++;
        //console.log(lastDate);
        levelList.push(r.data);
        if(r.data.length<maxFetch || fetches > maxFetch){ //if r.data.length<maxFetch, that means the end of the profile has been reached, because otherwise the API wouldn't return <maxFetch Levels 
            console.log(levelList);
            cleanResult();
            return;
        }
        else
        recursivelyLoadLevels(r.data[r.data.length-1].createdAt);
    })
}

function loadProfileLevels(){
    document.getElementById('profileLevels').innerHTML='Loading...';
    //reset Variables
    fetches=0;
    levelList=[];
    console.log(assemblePlayerURL());
    var checkCode=true;
    //most of this is to check if the profile is valid
    fetch(assembleProfileURL())
    .then(
            r => r.json()
        )
    .then(
        function(r){
            console.log(r.data);
            if(r.data.length!=1){
                document.getElementById('profileLevels').innerHTML='INVALID ID';
                checkCode=false;
            }
            else
            document.getElementById('creatorName').innerHTML=r.data[0].alias.alias;
        })
        .then(function(){
            if(checkCode) recursivelyLoadLevels(''); //only happens when profile is valid
        }); 
    
}

var levelCardTemplate=`
<div class="column"><div class="card">
<img src="https://img.bscotch.net/fit-in/100x100/avatars/{{avatar}}.webp" id="cardPicture">
    <p id="cardText">
    <a href="https://levelhead.io/+{{levelcode}}" target="ProfileLevel">{{levelname}}</a>
    </p>
</div></div>
`;

/* 
ToDo: - optimize fetch calls by making use of tiebreakerItemId in the call.
      - consider duplicate dates... possibly?
      - more testing in general
*/