
var likes=[];
var favorites=[];

function getLevelCode(){
    return levelCode.value.trim().toLowerCase();
}
//loads users who liked. the favorite equivalent is nearly identical
function recursivelyLoadLikes(lastId){

    fetch('https://www.bscotch.net/api/levelhead/levels/'+ getLevelCode() +'/likes?limit=32&includeAliases=true&beforeId='+ lastId)
    .then(r => r.json())
    .then(
        function(r){
            console.log(r.data.length);
            console.log(r);
            likes.push(r.data);
            if(r.data.length==32){
                recursivelyLoadLikes(r.data[r.data.length-1]._id)
            }
            else{
                console.log(likes);
                var htmlout="";
                likes.forEach( x => {
                    x.forEach(user => {
                        //apparently users who haven't set profile pics have an undefined avatarId...
                        if(user.alias.avatarId)
                        htmlout+=userTemplate.replace('{{userName}}', user.alias.alias).replaceAll('{{userCode}}', user.userId).replaceAll('{{avatar}}', user.alias.avatarId);
                        else
                        htmlout+=userTemplate.replace('{{userName}}', user.alias.alias).replaceAll('{{userCode}}', user.userId).replaceAll('{{avatar}}', 'bureau-employee');
                    })
                })
                document.getElementById('LevelLikes').innerHTML=htmlout;
            }

        }
    )

}

function recursivelyLoadFavorites(lastId){
    fetch('https://www.bscotch.net/api/levelhead/levels/'+ getLevelCode() +'/favorites?limit=32&includeAliases=true&beforeId='+ lastId)
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
                favorites.forEach( x => {
                    x.forEach(user => {
                        if(user.alias.avatarId)
                        htmlout+=userTemplate.replace('{{userName}}', user.alias.alias).replaceAll('{{userCode}}', user.userId).replaceAll('{{avatar}}', user.alias.avatarId);
                        else
                        htmlout+=userTemplate.replace('{{userName}}', user.alias.alias).replaceAll('{{userCode}}', user.userId).replaceAll('{{avatar}}', 'bureau-employee');
                    })
                })
                document.getElementById('LevelFavorites').innerHTML=htmlout;
            }

        }
    )
}

function timeFormat(time){
    var millis="";
    millis=Math.floor(time*100).toFixed();
    if(time>=86400)
        return Math.floor(time/86400)+'day(s)'+(new Date(time * 1000).toISOString().substr(11, 8)+','+millis.substr(millis.length-2, millis.length-1)+'s').replace(':', 'h').replace(':', 'm');
    if(time>=3600)
        return (new Date(time * 1000).toISOString().substr(11, 8)+','+millis.substr(millis.length-2, millis.length-1)+'s').replace(':', 'h').replace(':', 'm');
    if(time>=60)
        return (new Date(time * 1000).toISOString().substr(14, 5)+','+millis.substr(millis.length-2, millis.length-1)+'s').replace(':', 'm');
    return (new Date(time * 1000).toISOString().substr(17, 2)+','+millis.substr(millis.length-2, millis.length-1)+'s');
}

function loadHiddenStatistics(){

    likes=[];
    favorites=[];

    fetch('https://www.bscotch.net/api/levelhead/levels?levelIds='+ getLevelCode() +'&includeAliases=true&includeStats=true&includeRecords=true')
    .then(r => r.json())
    .then(
        function(r){
            if(r.data.length==1){
                document.getElementById('validity').innerHTML='Valid!';
                console.log(r.data)
                recursivelyLoadLikes('');
                recursivelyLoadFavorites('');
                //ToDo: convert dates to local time https://stackoverflow.com/questions/6525538/convert-utc-date-time-to-local-date-time
                //loading all statistics
                document.getElementById('LevelName').innerHTML=r.data[0].title
                document.getElementById('CreatorName').innerHTML=r.data[0].alias.alias
                document.getElementById('CreatorTime').innerHTML=timeFormat(r.data[0].creatorTime)
                document.getElementById('CV').innerHTML=r.data[0].cv
                document.getElementById('DailyBuild').innerHTML=r.data[0].dailyBuild
                document.getElementById('GameVersion').innerHTML=r.data[0].gameVersion
                document.getElementById('Language').innerHTML=r.data[0].locale
                document.getElementById('EB').innerHTML=r.data[0].stats.ExposureBucks
                document.getElementById('ClearRate').innerHTML=r.data[0].stats.ClearRate
                document.getElementById('FailureRate').innerHTML=r.data[0].stats.FailureRate
                document.getElementById('HiddenGem').innerHTML=r.data[0].stats.HiddenGem
                document.getElementById('ReplayValue').innerHTML=r.data[0].stats.ReplayValue
                document.getElementById('Successes').innerHTML=r.data[0].stats.Successes
                document.getElementById('TimePerWin').innerHTML=timeFormat(r.data[0].stats.TimePerWin)
                document.getElementById('UpdatedAt').innerHTML=new Date(r.data[0].updatedAt).toString().substring(4,31)
                //record statistics
                var recordHolders="";

                for(var i=0; i<r.data[0].records.FastestTime.length; i++)
                recordHolders+=recordHolderTemplate
                .replace('{{userName}}', r.data[0].records.FastestTime[i].alias.alias)
                .replace('{{userTime}}', timeFormat(r.data[0].records.FastestTime[i].value))
                .replace('{{recordDate}}', new Date(r.data[0].records.FastestTime[i].createdAt).toString().substring(4,31));
                document.getElementById('Records').innerHTML=recordHolders;
                recordHolders="";
                for(var i=0; i<r.data[0].records.HighScore.length; i++)
                recordHolders+=highScoreHolderTemplate
                .replace('{{userName}}', r.data[0].records.HighScore[i].alias.alias)
                .replace('{{userTime}}', r.data[0].records.HighScore[i].value)
                .replace('{{recordDate}}', new Date(r.data[0].records.HighScore[i].createdAt).toString().substring(4,31));
                document.getElementById('HighScore').innerHTML=recordHolders;
            }
            else
                document.getElementById('validity').innerHTML='INVALID CODE!';
        }

    )
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