/** Sort options the Rumpus API Provides. to be used in URLs */
var sortOptionsAPI = [
    "createdAt",
    "-createdAt",
    "PlayTime",
    "-PlayTime",
    "ReplayValue",
    "-ReplayValue",
    "HiddenGem",
    "-HiddenGem"
]
/** Sort options the Rumpus API Provides. readable versions */
var sortOptionsAPIReadable = [
    "Newest",
    "Oldest",
    "Most Play Time",
    "Least Play Time",
    "High Spice",
    "Low Spice",
    "Featured",
    "Never Featured"
]


/**A collection of functions and constants used to assemble the final URL for fetch calls*/
var parameter = {
    /**Constants used to include or filter for aspects of a Level*/
    includes : {
        /**only levels that were made for a dailyBuild are returned. false not supported*/
        dailyBuild : "dailyBuild=true",
        /**only levels that have been in the tower trial */
        towerTrial : "towerTrial=true",
        /**levels that can only be played on beta clients will also be included */
        beta : "includeBeta=true",
        /**includes level stats in results */
        stats : "includeStats=true",
        /**includes top times/scores in results */
        records : "includeRecords=true",
        /**includes aliases (e.g. user names) in results */
        aliases : "includeAliases=true",
        /**
         * information about your interactions with returned levels 
         * (any of bookmarked, favorited, liked, played, completed) 
         * will be included in the response. 
         * 
         * @note delegation key required*/
        interactions : "includeMyInteractions=true"
    },
    /**defines functions to handle number ranges in URL parameters */
    ranges : {
        templates : {
            isInvalid : function(val){
                return Number.isNaN(val) || val == "" || val == null || val == undefined
            },
            /**index of minimum values*/
            min : 0,
            /**index of maximum values */
            max : 1,
            /**
             * Creates URL parameters
             * @param {Array} values values[0] is the minimum, values[1] the maximum
             * @param {Array} urls urls[0] is the URL parameter for minimum, urls[1] for the maximum
             * @returns the required URL parameters
             */
            rangeFunction(values = [], urls = []){
                //console.log(values, urls)
                if(values.length == 0)
                    return ""
                if(values.length == 1)
                    return (!this.isInvalid([this.min])) ? urls[this.min] + values[this.min] : ""
                if(values.length == 2){
                    if(!this.isInvalid(values[this.min]) && !this.isInvalid(values[this.max])){
                        if(values[this.min] <= values[this.max])
                            return urls[this.min] + values[this.min] + "&" + urls[this.max] + values[this.max]
                        else
                            return urls[this.min] + values[this.min]
                    }
                    else if(!this.isInvalid(values[this.min]))
                        return urls[this.min] + values[this.min]
                    else if(!this.isInvalid(values[this.max]))
                        return urls[this.max] + values[this.max]
                }
                return ""
            }

        },
        playTime : function(min, max){
            return this.templates.rangeFunction([parseInt(min), parseInt(max)], ["minPlayTime=", "maxPlayTime="])
        },
        spice : function(min, max){
            return this.templates.rangeFunction([parseInt(min), parseInt(max)], ["minReplayValue=", "maxReplayValue="])
        },
        featured : function(min, max){
            return this.templates.rangeFunction([parseInt(min), parseInt(max)], ["minHiddenGem=", "maxHiddenGem="])
        },
        diamonds : function(min, max){
            return this.templates.rangeFunction([parseInt(min), parseInt(max)], ["minDiamonds=", "maxDiamonds="])
        },
        created : function(min, max){
            return this.templates.rangeFunction([parseInt(min), parseInt(max)], ["minCreatedAt=", "maxCreatedAt="])
            //ToDo: handle date input
        }
    }
}

function loadAPISort(){
    var htmlout = '';
    var sortId = 0;

    sortOptionsAPIReadable.forEach(sort => {
        //Featured is the default way of sorting
        if(sort != "Featured")
            htmlout += `<option value="${sortId++}">${sort}</option>`;
        else
            htmlout += `<option selected value="${sortId++}">${sort}</option>`;
    })
    document.getElementById("APISortSelect").innerHTML = htmlout;
}

function assembleURL(){
    var urlout = `https://www.bscotch.net/api/levelhead/levels?`;
    var buf;
    urlout += `&limit=128&includeAliases=true&includeRecords=true&includeStats=true`; //fetch max amount of levels

    //adding all URL Parameters
    urlout += `&sort=${sortOptionsAPI[document.getElementById("APISortSelect").value]}`

    //adding tower trial flag
    buf = document.getElementById("towerTrial").checked
    console.log(buf)
    if(buf)
        urlout += '&' + parameter.includes.towerTrial

    //Adding the ranges
    buf = parameter.ranges.playTime(document.getElementById("playtimeMin").value, document.getElementById("playtimeMax").value)
    if(buf != "")
        urlout += '&' + buf
    
    buf = parameter.ranges.spice(document.getElementById("spiceMin").value, document.getElementById("spiceMax").value)
    if(buf != "")
        urlout += '&' + buf

    buf = parameter.ranges.featured(document.getElementById("featuredMin").value, document.getElementById("featuredMax").value)
    if(buf != "")
        urlout += '&' + buf

    buf = parameter.ranges.diamonds(document.getElementById("diamondsMin").value, document.getElementById("diamondsMax").value)
    if(buf != "")
        urlout += '&' + buf

    buf = document.getElementById("tagsAPI").value
    if(buf != "0")
        urlout += "&tags=" + buf
    
    console.log(urlout)
    return urlout
}

function loadTagSelectAdvancedTowerSearch(){
    var htmloutRequired = '<option value="0" id="noneRequired">-</option>';
    var htmloutExcluded = '<option value="0" id="noneExcluded">-</option>';
    var htmloutAPI = '<option value="0" id="noTag">-</option>';

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
                htmloutAPI += `<option value="${tag.tag}" id="${tag.tag}">${tag.name}</option>`
            })
            for(var x =1; x<4; ++x){
                document.getElementById('requiredTags'+ x)
                        .innerHTML = htmloutRequired.replaceAll('{{selectNumber}}', x);
                document.getElementById('excludedTags'+ x)
                        .innerHTML = htmloutExcluded.replaceAll('{{selectNumber}}', x);
            }
            document.getElementById('tagsAPI').innerHTML = htmloutAPI
        }
    )
}
var diamonds = [
    "♦⋄⋄⋄⋄",
    "♦♦⋄⋄⋄",
    "♦♦♦⋄⋄",
    "♦♦♦♦⋄",
    "♦♦♦♦♦",
    "⋄⋄⋄⋄⋄"
]


function loadDiamondsSelect(){
    var htmloutMin = ""
    var htmloutMax = ""

    for(var x = 0; x < diamonds.length; x++){
        if(x == 0){
            htmloutMin += `<option selected value="${x + 1}">${diamonds[x]}</option>`
            htmloutMax += `<option value="${x + 1}">${diamonds[x]}</option>`
        }
        else if(x == 5){
            htmloutMin += `<option value="${x + 1}">${diamonds[x]}</option>`
            htmloutMax += `<option selected value="${x + 1}">${diamonds[x]}</option>`
        }
        else{
            htmloutMin += `<option value="${x + 1}">${diamonds[x]}</option>`
            htmloutMax += `<option value="${x + 1}">${diamonds[x]}</option>`
        }
    }

    document.getElementById("diamondsMin").innerHTML = htmloutMin
    document.getElementById("diamondsMax").innerHTML = htmloutMax
}

function createSpecificLevelCard(level){
    return createLevelCard(level,
        template.levelLink(level),
        template.profileLink(level),
        template.likeFavoriteDifficulty(level),
        template.tags(level),
        template.playerPlaysCount(level),
        template.copyCodeButton(level)
        )
}

function checkFilters(level){
    if(!filterTags(level)) return false

    if(!filterInteractions(level)) return false

    return true
}

function searchTowerLevels(){
    document.getElementById("levelCards").innerHTML = "GENERATING..."
    levelList = []
    fetch(assembleURL(), delegationKeyValid ? getExtendedRequestBody() : undefined)
    .then(r => r.json())
    .then(function(r){
        levelList.push(r.data)
        reloadLevels()
    })
}