    var levels = [];
    var unplayedVal = false;
    var fetchLimit = 128;

    function createURL()
    {
        //input from buttons
        //ToDo: make stuff not render if a text box is empty
        var max = document.getElementById('maxEB').value;


        //assembling URL for fetch
        return URLTemplate.replace('{{maxEB}}', max).replace('{{limit}}', fetchLimit);

    }

    function createLevelCard(level){
        if(!checkFilters(level)) 
            return '';
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
                        htmlout += createLevelCard(level);
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
                if(levelCodeList.includes(newLevels[x].levelId)){
                    newLevels.splice(x, 1);
                    --x;
                }
                    
            }
            return newLevels;
        }

        
        
    }

    function getMoreLevels(){

        var url;
        var htmlout = '';
        document.getElementById('getMoreButton').style.display = 'none';
        
        if(levels != []){

            var newMax = levels[levels.length - 1][levels[levels.length - 1].length -1].stats.ExposureBucks;
            console.log(newMax)
            if(newMax > 0 && !(newMax == levels[levels.length - 1][0].stats.ExposureBucks)){
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
                    document.getElementById('getMoreButton').style.display = 'block';
                })
            }
            else{
                url = URLTemplate.replace('{{maxEB}}', newMax).replace('{{limit}}', fetchLimit)
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
                    document.getElementById('getMoreButton').style.display = 'block';
                })
            }
        }
        else
        document.getElementById('getMoreButton').style.display = 'block';
    }

    //#region Filters

    function reloadLevels(){
        var htmlout = '';
        document.getElementById("levelList").innerHTML = "Generating...";
        levels.forEach( x => {
            x.forEach(level =>{
                htmlout += createLevelCard(level);
            })
        })
        document.getElementById('levelList').innerHTML = htmlout;
        console.log('boop')
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
                    document.getElementById('requiredTags'+ x).innerHTML = htmloutRequired.replaceAll('{{selectNumber}}', x);
                    document.getElementById('excludedTags'+ x).innerHTML = htmloutExcluded.replaceAll('{{selectNumber}}', x);
                }
            }
        )
    }
    
    function showFilters(){
        if(document.getElementById('filtersToggle').innerHTML == 'Filters ▲'){
            document.getElementById('filtersToggle').innerHTML = 'Filters ▼';
            document.getElementById('filters').style.display = 'block';
        }
        else{
            document.getElementById('filtersToggle').innerHTML = 'Filters ▲';
            document.getElementById('filters').style.display = 'none';
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
        var check = false;
    
        var filterVal = document.getElementById('dailyFilter').value;
        if(!((filterVal !=0 ) ? (level.dailyBuild != (filterVal-1)) : true)) return false;
    
        filterVal = document.getElementById('difficultyFilter').value; 
        if(!((filterVal != 0) ? (level.stats.Diamonds == filterVal) : true)) return false;
    
        //min players <= players >= max players 
        if(!(level.stats.Players >= document.getElementById('minPlayerFilter').value
        && level.stats.Players <= document.getElementById('maxPlayerFilter').value)) return false;

        //Tag Filtering
    
        for(var x = 1; x < 4; ++x){
            //check if Level has specified tags
            if(document.getElementById('requiredTags'+ x).value != 0 ? !level.tags.includes(document.getElementById('requiredTags'+ x).value) : false) return false;
            if(document.getElementById('excludedTags'+ x).value != 0 ? level.tags.includes(document.getElementById('excludedTags'+ x).value) : false) return false;
        }
    
        return true;
    
    }

    //#endregion


    //#region templates
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

var tagSelectTemplate=`
<option value="{{tagId}}" id="{{tagId}}{{selectName}}{{selectNumber}}">{{tagName}}</option>
`;
//#endregion