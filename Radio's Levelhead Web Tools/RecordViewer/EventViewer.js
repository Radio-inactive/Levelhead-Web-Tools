var tableHeaders = `
    <tr>
        <th>Player</th>
        <th>Level</th>
        <th>Record Date</th>
        <th>Time</th>
        <th>Score</th>
    </tr>`

var bestTimes = []
var bestScores = []
var recordsAll = []

function assembleRecordsTableRow(scoreEntry){ //only time contains the alias
    return `
        <tr>
            <td><a href="https://levelhead.io/@${scoreEntry.userId}" target="_blank">${scoreEntry.alias.alias}</a><br>${scoreEntry.userId}</td>
            <td><a href="https://levelhead.io/+${scoreEntry.levelId.levelId}" target="_blank">${scoreEntry.levelId.title}</a><br>${scoreEntry.levelId.levelId}</td>
            <td>Achieved:<br>${dateFormat(scoreEntry.updatedAt)}<br>Expires:<br>${dateFormat(scoreEntry.expiresAt)}</td>
            <td>${timeFormat(scoreEntry.value)}</td>
            <td>${scoreEntry.score}</td>
        </tr>`
}
/**
 * transforms a comma-seperated string into a string array
 * @param {string} list comma-seperated list
 * @returns {string[]} Parsed list
 */
function transformStringListToArray(list){
    return JSON.parse(`["${list.replaceAll(',', '","')}"]`)
}
/**
 * Creates URL for getting personal Records (Fastest time)
 * @param {string} players Sanitized array of player codes
 * @param {string} levels Sanitized array of level codes
 * @returns URL that can be used for fetching fastest times
 */
function getFastestTimeURL(players, levels){
    return `https://www.bscotch.net/api/levelhead/recent-records/FastestTime?userIds=${players}&levelIds=${levels}&includeAliases=true&limit=128`
}
/**
 * Creates URL for getting personal Records (High Score)
 * @param {string} players Sanitized array of player codes
 * @param {string} levels Sanitized array of level codes
 * @returns URL that can be used for fetching High Scores
 */
function getHighScoreURL(players, levels){
    return `https://www.bscotch.net/api/levelhead/recent-records/HighScore?userIds=${players}&levelIds=${levels}&limit=128`
}

function sort_player(a, b){
    return a.userId.localeCompare(b.userId)
}

function sort_level(a, b){
    return a.levelId.levelId.localeCompare(b.levelId.levelId)
}

function assembleRecordsTable(){
    var htmlout = tableHeaders
    var sort = document.getElementById('sortBy').value

    if(sort == 'player'){
        recordsAll.sort(sort_player)
    }
    else if(sort == 'level'){
        recordsAll.sort(sort_level)
    }

    for(var x=0; x < recordsAll.length; x++){
        htmlout += assembleRecordsTableRow(recordsAll[x])
    }
    document.getElementById('recordTable').innerHTML = htmlout
}

function getRecords(players, levels){
    //remove duplicates
    players = [...new Set(players)]
    levels = [...new Set(levels)]
    console.log(levels, players)
    var playersSplit = splitArray(players)
    var levelsSplit = splitArray(levels)
    var recordsPromises = []
    var timePromises = []
    var scorePromises = []

    //fetch times and scores of every batch
    playersSplit.forEach(playerBatch => {
        levelsSplit.forEach(levelBatch => {
            timePromises.push(fetch(getFastestTimeURL(playerBatch, levelBatch)).then(r => r.json()))
            scorePromises.push(fetch(getHighScoreURL(playerBatch, levelBatch)).then(r => r.json()))
        })
    })
    recordsPromises.push(Promise.all(timePromises))
    recordsPromises.push(Promise.all(scorePromises))
    console.log(recordsPromises)

    Promise.all(recordsPromises)
    .then(function(timeAndScore){ //r contains all data fields from the fetch calls
        console.log(timeAndScore)

        if(timeAndScore.length == 0 || timeAndScore[0].length ==0){
            document.getElementById("recordTable").innerHTML = "NO LEVELS FOUND"
            return;
        }

        timeAndScore[0].forEach(timeFetch => {
            timeFetch.data.forEach(time => {
                var recordFull = undefined
                var score = undefined;
                timeAndScore[1].forEach(scoreFetch => {
                    if(score == undefined){
                        score = scoreFetch.data.find(entry => entry.levelId == time.levelId && entry.userId == time.userId)
                    }
                })
                
                recordFull = time;
                if(score)
                    recordFull.score = score.value
                else
                    recordFull.score = 0
                recordsAll.push(recordFull)
            })
        })
        console.log(recordsAll)
        
        var levelDetails = []
        //get all returned levels
        var recordLevels = []
        recordsAll.forEach(entry => {
            recordLevels.push(entry.levelId)
        })
        recordLevels =  [...new Set(recordLevels)]
        recordLevels = splitArray(recordLevels)

        //get Level details via fetch calls
        recordLevels.forEach( 
            levelBatch => {
                levelDetails.push(
                    fetch(levelFetchUrl(0,0,0) +'&levelIds='+ levelBatch).then(r => r.json()))
            }
            )

        Promise.all(levelDetails)
        .then(function(fetches){
            fetches.forEach(levelBatch => {
                levelBatch.data.forEach(level => {
                    //replaces level codes in bestTimes with full level data
                    recordsAll.forEach(function(entry, index){
                        if(entry.levelId == level.levelId)
                            recordsAll[index].levelId = level
                    })
                })
            })
            assembleRecordsTable()
        })
        
    })
}

function splitArray(array, chunkSize = 16){
    var fetchableArray = [];
    for (let i = 0; i < array.length; i += chunkSize)
        fetchableArray.push(array.slice(i, i + chunkSize));
    return fetchableArray
}

function checkTimes() {
    document.getElementById("recordTable").innerHTML = "LOADING"
    recordsAll = []
    var playerIds = document.getElementById("playerCodes").value;
    playerIds = transformStringListToArray(playerIds);
    var levelIds = document.getElementById("levelCodes").value;
    var levelCodesOption = document.getElementById("levelCodesOptions").value

    //make codes parsable, then clean inputs
    for(var x = 0; x < playerIds.length; x++){
        playerIds[x] = getProfileCode(playerIds[x])
    }

    //for levels or level lists
    if(levelCodesOption == "lvl"){
        levelIds = transformStringListToArray(levelIds)
        for(var x = 0; x < levelIds.length; x++){
            levelIds[x] = getLevelCode(levelIds[x])
        }
        getRecords(playerIds, levelIds)
    }
    else {
        var playlistName = ""
        var codes = []
        levelIds = `https://www.bscotch.net/api/levelhead/playlists/` + getPlaylistCode(levelIds)
        if(getPlaylistCode(levelIds) == null){
            document.getElementById("recordTable").innerHTML = "INVALID PLAYLIST CODE"
            return;
        }
        fetch(levelIds)
        .then(r => r.json())
        .then(function(r){
            codes = r.data.levelIds
            playlistName = r.data.name
            getRecords(playerIds, codes)
        })
    }
    
}