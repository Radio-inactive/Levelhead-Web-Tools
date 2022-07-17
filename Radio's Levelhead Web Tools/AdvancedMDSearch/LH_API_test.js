
    var unplayedVal = false; //ToDo: remove.
    var fetchLimit = 128; //max level count for fetch calls

    function createSpecificLevelCard(level){
        return createLevelCard(level,
            template.levelLink(level),
            template.profileLink(level),
            template.likeFavoriteDifficulty(level),
            template.playerPlaysCount(level),
            template.exposure(level),
            template.copyCodeButton(level)
            )
    }

    function createURL()
    {
        //input from max EB input field
        var max = document.getElementById('maxEB').value;

        //assembling URL for fetch
        return URLTemplate
               .replace('{{maxEB}}', max)
               .replace('{{limit}}', fetchLimit);

    }

    function fetchLevels()
    {
        //Hides get more button. 
        document.getElementById('getMoreButton').style
                .display = 'none';
        document.getElementById('levelCards')
                .innerHTML = 'Loading...';
        
        var ref = createURL();
        levelList = [];
        console.log(ref);

        fetch(ref)
        .then(
                r => r.json()
            )
        .then(
            function(r){
                //pushes fetch result into levels array.
                levelList.push(r.data);
                console.log(levelList);
                reloadLevels();

                //makes 'get more button' visible again
                document.getElementById('getMoreButton').style
                        .display = 'block';
            })
        
    }

    function removeRedundantCodes(newLevels){
        //saves level codes from API calls
        //in Array for easy code search
        var levelCodeList = [];

        if(levelList != []){
            //most recent fetch call
            levelList[levelList.length - 1]
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
        
        if(levelList != []){

            var newMax = levelList[levelList.length - 1][levelList[levelList.length - 1].length -1].stats.ExposureBucks;
            console.log(newMax)
            //checks if first level of last fetch equals last level
            //if that's the case, a different approach for getting more levels is needed
            if(newMax > 0 && newMax != levelList[levelList.length - 1][0].stats.ExposureBucks){
                //this case: EB of last level is used as max EB of next call
                url = URLTemplate
                      .replace('{{maxEB}}', newMax)
                      .replace('{{limit}}', fetchLimit);
                console.log('fetch url getmore case 1: '+ url);
                fetch(url)
                 .then(r => r.json())
                 .then(function(r){
                    removeRedundantCodes(r.data);
                    //cleaned fetch call is added to levels array
                    levelList.push(r.data);
                    reloadLevels();
                    console.log('filtering:')
                    console.log(r.data);
                    console.log(levelList)
                    document.getElementById('levelCards')
                            .innerHTML += htmlout;
                    document.getElementById('getMoreButton').style
                            .display = 'block';
                })
            }
            else{
                //in this case: age of last level used as 'minSecondsAgo' in next call
                url = URLTemplate.replace('{{maxEB}}', newMax)
                      .replace('{{limit}}', fetchLimit)
                      +"&minSecondsAgo="+ levelList[levelList.length - 1][levelList[levelList.length - 1].length - 1] //last level of last fetch call
                                          .createdAgo;
                console.log('fetch url getmore case 2: '+ url);
                fetch(url)
                .then(r => r.json())
                .then(function(r) {
                    removeRedundantCodes(r.data);
                    //cleaned fetch call is added to levels array
                    levelList.push(r.data);
                    reloadLevels();
                    console.log('filtering:')
                    console.log(r.data);
                    console.log(levelList)
                    document.getElementById('levelCards').innerHTML += htmlout;
                    document.getElementById('getMoreButton').style.display = 'block';
                })
            }
        }
        else
        document.getElementById('getMoreButton').style.display = 'block';
    }

    //#region Filters

    function checkFilters(level){
        if(!filterDaily(level)) return false;
    
        if(!filterDifficulty(level)) return false;
    
        if(!filterPlayerCount(level)) return false;
    
        if(!filterTags(level)) return false;

        return true;
    
    }

    //#endregion


//#region templates

//URL fragments
var URLTemplate =
'https://www.bscotch.net/api/levelhead/levels?marketing=true&limit={{limit}}&maxExposureBucks={{maxEB}}&includeStats=true&includeAliases=true';

//#endregion