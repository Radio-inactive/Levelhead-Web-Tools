    var levels = [];
    var unplayedVal = false;
    var fetchLimit = 128;

    function unplayedToggle()
    {
        if(unplayedVal == false){
            document.getElementById('unplayedButton').innerHTML = 'Unplayed only';
            unplayedVal = true;
        }
        else{
            document.getElementById('unplayedButton').innerHTML = 'All Levels';
            unplayedVal = false;
        }
    }

    function createURL()
    {
        //input from buttons
        //ToDo: make stuff not render if a text box is empty
        var max = document.getElementById('maxEB').value;


        //assembling URL for fetch
        return URLTemplate.replace('{{maxEB}}', max).replace('{{limit}}', fetchLimit);

    }

    function createLevelCard(level){
        var htmlout = '';
        htmlout += levelCardTemplate
        .replace('{{avatar}}', level.avatarId)
        .replaceAll('{{levelId}}', level.levelId)
        .replace('{{levelName}}', level.title)
        .replace('{{creatorCode}}', level.userId)
        .replace('{{alias}}', level.alias.alias)
        .replace('{{players}}', level.stats.Players)
        .replace('{{EB}}', level.stats.ExposureBucks)
        .replace('{{createdAt}}', new Date(level.createdAt).toString().substring(4,15)); 
        
        return htmlout;
    }

    function fetchLevels()
    {
        document.getElementById('getMoreButton').style.display = 'none';
        document.getElementById('levelList').innerHTML = 'LOADING...';
        var htmlout = "";

        var ref=createURL();
        console.log(ref);

        fetch(ref)
        .then(
                r => r.json()
            )
        .then(
            function(r){
                r.data.forEach(level => {
                    if(unplayedVal == true && level.stats.Players > 0);
                    else{
                        htmlout += createLevelCard(level);
                    }

                });
                levels.push(r.data)
                console.log(levels);
                document.getElementById('levelList').innerHTML = htmlout;
                document.getElementById('getMoreButton').style.display = 'block';
            })
        
    }

    function removeRedundantCodes(newLevels){
        var levelCodeList = []

        if(levels != []){

            levels[levels.length - 1].forEach( level => {
                levelCodeList += level.levelId;
            })
            
            for(x = 0; x < newLevels.length -1 ; x++){
                if(levelCodeList.includes(newLevels[x].levelId))
                    newLevels.shift()
                else{
                    console.log('stuff removed')
                    break;
                }
                    
            }
            return newLevels;
        }

        
        
    }

    function getMoreLevels(){

        var url;
        var htmlout = '';
        
        if(levels != []){

            var newMax = levels[levels.length - 1][levels[levels.length - 1].length -1].stats.ExposureBucks;
            console.log(newMax)
            if(newMax != 0){
                url = URLTemplate.replace('{{maxEB}}', newMax).replace('{{limit}}', fetchLimit);
                console.log('fetch url getmore case 1: '+ url);
                fetch(url)
                .then(r => r.json())
                .then(function(r){
                    removeRedundantCodes(r.data);
                    r.data.forEach( level => {
                        htmlout += createLevelCard(level);
                    })
                    levels.push(r.data);
                    console.log('filtering:')
                    console.log(r.data);
                    console.log(levels)
                    document.getElementById('levelList').innerHTML += htmlout;
                })
            }
            else{
                url = URLTemplate.replace('{{maxEB}}', 0).replace('{{limit}}', fetchLimit)
                      + "&minSecondsAgo="+ levels[levels.length - 1][levels[levels.length - 1].length -1].createdAgo;
                console.log('fetch url getmore case 2: '+ url);
                fetch(url)
                .then(r => r.json())
                .then(function(r) {
                    removeRedundantCodes(r.data);
                    r.data.forEach(level => {
                        htmlout += createLevelCard(level);
                    })
                    levels.push(r.data);
                    console.log('filtering:')
                    console.log(r.data);
                    console.log(levels)
                    document.getElementById('levelList').innerHTML += htmlout;
                })
            }
        }
    }

var levelCardTemplate=`
<div class="column">
    <div class="card">
        <img src="https://img.bscotch.net/fit-in/100x100/avatars/{{avatar}}.webp" id="UnplayedPicture">
        <p id="UnplayedCardText">
            <a href="https://levelhead.io/+{{levelId}}" target="_blank">{{levelName}}</a><br>
            <a href="https://levelhead.io/@{{creatorCode}}" target="_blank" style="text-decoration: none;">by {{alias}}</a><br>
            Players: {{players}}<br>
            EB: {{EB}}<br>
            Created: {{createdAt}}<br>
            <button id="CodeButton" onclick="navigator.clipboard.writeText('{{levelId}}')">Copy Levelcode</button>
        </p>
    </div>
</div>
`;

//URL fragments
var URLTemplate =
'https://www.bscotch.net/api/levelhead/levels?marketing=true&limit={{limit}}&maxExposureBucks={{maxEB}}&includeStats=true&includeAliases=true';
