    var levels = []; //saves each fetch call as an array.
    var unplayedVal = false; //ToDo: remove.
    var fetchLimit = 128; //max level count for fetch calls

    function createURL()
    {
        //input from max EB input field
        var max = document.getElementById('maxEB').value;

        //assembling URL for fetch
        return URLTemplate
               .replace('{{maxEB}}', max)
               .replace('{{limit}}', fetchLimit);

    }
    
    function makeLevelCard(level){
        //card not created if filters don't apply
        if(!checkFilters(level)) 
            return '';

        return createLevelCard(level,
            template.levelLink(level),
            template.profileLink(level),
            template.likeFavoriteDifficulty(level),
            template.playerPlaysCount(level),
            template.exposure(level),
            template.copyCodeButton(level)
            )

    }

    function fetchLevels()
    {
        //Hides get more button. 
        document.getElementById('getMoreButton').style
                .display = 'none';
        document.getElementById('levelList')
                .innerHTML = 'LOADING...';
        
        var htmlout = "";
        var ref = createURL();
        console.log(ref);

        fetch(ref)
        .then(
                r => r.json()
            )
        .then(
            function(r){
                r.data
                 .forEach(level => {
                    htmlout += makeLevelCard(level);
                });
                //pushes fetch result into levels array.
                levels.push(r.data)
                console.log(levels);
                //loads finished cards into the html
                document.getElementById('levelList')
                        .innerHTML = htmlout;
                //makes 'get more button' visible again
                document.getElementById('getMoreButton').style
                        .display = 'block';
            })
        
    }

    function removeRedundantCodes(newLevels){
        //saves level codes from API calls
        //in Array for easy code search
        var levelCodeList = [];

        if(levels != []){
            //most recent fetch call
            levels[levels.length - 1]
             .forEach( level => {
                levelCodeList += level.levelId;
            })
            
            for(x = 0; x < newLevels.length -1 ; x++){
                if(levelCodeList.includes(newLevels[x].levelId)){
                    //removes duplicate levels
                    newLevels.splice(x, 1);
                    --x;
                }    
            }
            return newLevels;
        }
    }

    function getMoreLevels(){

        var url = '';
        var htmlout = '';
        //hides button after press for better feedback
        document.getElementById('getMoreButton').style
                .display = 'none';
        
        if(levels != []){

            var newMax = levels[levels.length - 1][levels[levels.length - 1].length -1].stats.ExposureBucks;
            console.log(newMax)
            //checks if first level of last fetch equals last level
            //if that's the case, a different approach for getting more levels is needed
            if(newMax > 0 && newMax != levels[levels.length - 1][0].stats.ExposureBucks){
                //this case: EB of last level is used as max EB of next call
                url = URLTemplate
                      .replace('{{maxEB}}', newMax)
                      .replace('{{limit}}', fetchLimit);
                console.log('fetch url getmore case 1: '+ url);
                fetch(url)
                 .then(r => r.json())
                 .then(function(r){
                    removeRedundantCodes(r.data);
                    //assemble cards
                    r.data
                     .forEach( level => {
                        htmlout += makeLevelCard(level);
                    })
                    //cleaned fetch call is added to levels array
                    levels.push(r.data);
                    console.log('filtering:')
                    console.log(r.data);
                    console.log(levels)
                    document.getElementById('levelList')
                            .innerHTML += htmlout;
                    document.getElementById('getMoreButton').style
                            .display = 'block';
                })
            }
            else{
                //in this case: age of last level used as 'minSecondsAgo' in next call
                url = URLTemplate.replace('{{maxEB}}', newMax)
                      .replace('{{limit}}', fetchLimit)
                      +"&minSecondsAgo="+ levels[levels.length - 1][levels[levels.length - 1].length - 1] //last level of last fetch call
                                          .createdAgo;
                console.log('fetch url getmore case 2: '+ url);
                fetch(url)
                .then(r => r.json())
                .then(function(r) {
                    removeRedundantCodes(r.data);
                    //assemble cards
                    r.data.forEach(level => {
                        htmlout += makeLevelCard(level);
                    })
                    //cleaned fetch call is added to levels array
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

    //used every time a filter is changed
    function reloadLevels(){
        var htmlout = '';
        document.getElementById("levelList")
                .innerHTML = "Generating...";
        //re-generates all level cards. Filters are applied in the createLevelCard() function
        levels
        .forEach( x => {
            x
            .forEach(level =>{
                htmlout += makeLevelCard(level);
            })
        })
        document.getElementById('levelList')
                .innerHTML = htmlout;
}

    function loadTagSelect(){
        //define empty starting option
        var htmloutRequired = '<option value="0" id="noneRequired">-</option>';
        var htmloutExcluded = '<option value="0" id="noneExcluded">-</option>';
    
        //fetches all tags
        fetch('https://www.bscotch.net/api/levelhead/level-tags/counts')
        .then(r => r.json())
        .then(
            function(r){
                r.data
                .forEach( tag => {//Templates partially filled out
                    htmloutRequired += tagSelectTemplate
                                       .replaceAll('{{tagId}}', tag.tag)
                                       .replace('{{tagName}}', tag.name)
                                       .replace('{{selectName}}', 'Required');
                    htmloutExcluded += tagSelectTemplate
                                       .replaceAll('{{tagId}}', tag.tag)
                                       .replace('{{tagName}}', tag.name)
                                       .replace('{{selectName}}', 'Excluded');
                })
                //creates 3 Tag selections each for required and excluded tags. x used for ids
                for(var x =1; x<4; ++x){
                    document.getElementById('requiredTags'+ x)
                            .innerHTML = htmloutRequired
                                         .replaceAll('{{selectNumber}}', x); //each option has an id. currently unused
                    document.getElementById('excludedTags'+ x)
                            .innerHTML = htmloutExcluded
                                         .replaceAll('{{selectNumber}}', x);
                }
            }
        )
    }
    
    function showFilters(){
        //toggles filter based on the content of the button
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

    function checkFilters(level){
        if(!filterDaily(level)) return false;
    
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
/*
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
*/
//URL fragments
var URLTemplate =
'https://www.bscotch.net/api/levelhead/levels?marketing=true&limit={{limit}}&maxExposureBucks={{maxEB}}&includeStats=true&includeAliases=true';

var tagSelectTemplate=`
<option value="{{tagId}}" id="{{tagId}}{{selectName}}{{selectNumber}}">{{tagName}}</option>
`;

//#endregion