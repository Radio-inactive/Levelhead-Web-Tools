
var likes=[];
var favorites=[];


//loads users who liked. the favorite equivalent is nearly identical
function recursivelyLoadLikes(lastId){

    fetch('https://www.bscotch.net/api/levelhead/levels/'+ getLevelCode(levelCode.value) +'/likes?limit=32&includeAliases=true&beforeId='+ lastId)
    .then(r => r.json())
    .then(
        function(r){
            console.log(r.data.length);
            console.log(r);
            likes.push(r.data);
            if(r.data.length == 32){
                recursivelyLoadLikes(r.data[r.data.length-1]._id)
            }
            else{
                console.log(likes);
                var htmlout = "";
                likes
                 .forEach( x => {//for each fetch call
                    x
                     .forEach(user => {
                        //apparently users who haven't set profile pics have an undefined avatarId...
                        if(user.alias.avatarId) //ToDo: possibly short if notation?
                        htmlout += userTemplate.replace('{{userName}}', user.alias.alias)
                                               .replaceAll('{{userCode}}', user.userId)
                                               .replaceAll('{{avatar}}', user.alias.avatarId);
                        else
                        htmlout += userTemplate.replace('{{userName}}', user.alias.alias)
                                               .replaceAll('{{userCode}}', user.userId)
                                               .replaceAll('{{avatar}}', 'bureau-employee');
                     })
                 })
                document.getElementById('LevelLikes')
                        .innerHTML = htmlout;
            }
        }
    )
}

function recursivelyLoadFavorites(lastId){
    fetch('https://www.bscotch.net/api/levelhead/levels/'+ getLevelCode(levelCode.value) +'/favorites?limit=32&includeAliases=true&beforeId='+ lastId)
    .then(r => r.json())
    .then(
        function(r){
            console.log(r.data.length);
            console.log(r);
            favorites.push(r.data);
            if(r.data.length==32){
                recursivelyLoadFavorites(r.data[r.data.length-1]._id)
            }
            else{
                console.log(favorites);
                var htmlout="";
                favorites
                 .forEach( x => {
                    x
                     .forEach(user => {
                        if(user.alias.avatarId)
                        htmlout += userTemplate.replace('{{userName}}', user.alias.alias)
                                               .replaceAll('{{userCode}}', user.userId)
                                               .replaceAll('{{avatar}}', user.alias.avatarId);
                        else
                        htmlout += userTemplate.replace('{{userName}}', user.alias.alias)
                                               .replaceAll('{{userCode}}', user.userId)
                                               .replaceAll('{{avatar}}', 'bureau-employee');
                     })
                 })
                document.getElementById('LevelFavorites').innerHTML=htmlout;
            }

        }
    )
}

function loadHiddenStatistics(){

    likes = [];
    favorites = [];

    fetch('https://www.bscotch.net/api/levelhead/levels?levelIds='+ getLevelCode(levelCode.value) +'&includeAliases=true&includeStats=true&includeRecords=true')
    .then(r => r.json())
    .then(
        function(r){
            if(r.data.length == 1){
                document.getElementById('validity')
                        .innerHTML = 'Valid!';
                console.log(r.data);
                recursivelyLoadLikes('');
                recursivelyLoadFavorites('');
                //loading all statistics
                document.getElementById('LevelName')
                        .innerHTML = r.data[0].title;
                document.getElementById('CreatorName')
                        .innerHTML = r.data[0].alias.alias;
                document.getElementById('CreatorTime')
                        .innerHTML = r.data[0].creatorTime
                                   ? timeFormat(r.data[0].creatorTime)
                                   : 'UNKNOWN';
                document.getElementById('CV')
                        .innerHTML = r.data[0].cv
                                   ? r.data[0].cv
                                   : 0;
                document.getElementById('DailyBuild')
                        .innerHTML = r.data[0].dailyBuild
                                   ? 'Yes'
                                   : 'No';
                document.getElementById('GameVersion')
                        .innerHTML = r.data[0].gameVersion
                                   ? r.data[0].gameVersion
                                   : 'UNKNOWN';
                document.getElementById('Language')
                        .innerHTML = r.data[0].locale;
                document.getElementById('EB')
                        .innerHTML = r.data[0].stats.ExposureBucks
                                   ? r.data[0].stats.ExposureBucks
                                   : 0;
                document.getElementById('ClearRate')
                        .innerHTML = r.data[0].stats.ClearRate
                                   ? r.data[0].stats.ClearRate
                                   : 0;
                document.getElementById('FailureRate')
                        .innerHTML = r.data[0].stats.FailureRate
                                   ? r.data[0].stats.FailureRate
                                   : 0;
                document.getElementById('HiddenGem')
                        .innerHTML = r.data[0].stats.HiddenGem
                                   ? r.data[0].stats.HiddenGem
                                   : 0;
                document.getElementById('ReplayValue')
                        .innerHTML = r.data[0].stats.ReplayValue
                                   ? r.data[0].stats.ReplayValue
                                   : 0;
                document.getElementById('Successes')
                        .innerHTML = r.data[0].stats.Successes
                                   ? r.data[0].stats.Successes
                                   : 0;
                document.getElementById('TimePerWin')
                        .innerHTML = r.data[0].stats.TimePerWin
                                   ? timeFormat(r.data[0].stats.TimePerWin)
                                   : 'No Times';
                document.getElementById('UpdatedAt')
                        .innerHTML = new Date(r.data[0].updatedAt).toString().substring(4,31)
                //record statistics
                var recordHolders="";
                //Shoe Times
                for(var i=0; i < r.data[0].records.FastestTime.length; i++)
                    recordHolders += recordHolderTemplate
                    .replace('{{userName}}', r.data[0].records.FastestTime[i].alias.alias)
                    .replace('{{userTime}}', timeFormat(r.data[0].records.FastestTime[i].value))
                    .replace('{{recordDate}}', new Date(r.data[0].records.FastestTime[i].createdAt).toString().substring(4,31));
                document.getElementById('Records')
                        .innerHTML = recordHolders;

                recordHolders="";
                //High Scores
                for(var i=0; i < r.data[0].records.HighScore.length; i++)
                    recordHolders += highScoreHolderTemplate
                    .replace('{{userName}}', r.data[0].records.HighScore[i].alias.alias)
                    .replace('{{userTime}}', scoreFormat(r.data[0].records.HighScore[i].value))
                    .replace('{{recordDate}}', new Date(r.data[0].records.HighScore[i].createdAt).toString().substring(4,31));
                document.getElementById('HighScore')
                        .innerHTML=recordHolders;
            }
            else //ToDo: replace this if else with an if + return at the start
                document.getElementById('validity')
                        .innerHTML='INVALID CODE!';
        }

    )
}

function loadLevelCodeFromURL(){
    var url_string = window.location;
    var url = new URL(url_string);
    var code = url.searchParams.get("levelCode");
    console.log(`level code from url: ${code}`);
    if(code){
        document.getElementById('levelCode').value = code;
        loadHiddenStatistics();
    }
}

var userTemplate=`
<p><img src="https://img.bscotch.net/fit-in/20x20/avatars/{{avatar}}.webp">{{userName}} <a href="https://levelhead.io/@{{userCode}}" target="userLike">@{{userCode}}</a></p>
`;

var recordHolderTemplate=`
<p>{{userName}}: {{userTime}}<br>
    --> date: {{recordDate}}
</p>
`;

var highScoreHolderTemplate=`
<p>{{userName}}: {{userTime}} points<br>
    --> date: {{recordDate}}
</p>
`;