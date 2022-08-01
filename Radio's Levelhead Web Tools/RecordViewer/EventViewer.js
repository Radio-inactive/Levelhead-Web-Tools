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

function assembleRecordsTableRow(time, score){ //only time contains the alias
    return `
        <tr>
            <td>${time.alias.alias}<br>${time.userId}</td>
            <td>${time.levelId}</td>
            <td>Achieved:<br>${dateFormat(time.updatedAt)}<br>Expires:<br>${dateFormat(time.expiresAt)}</td>
            <td>${timeFormat(time.value)}</td>
            <td>${score.value}</td>
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
    return a.levelId.localeCompare(b.levelId)
}

function assembleRecordsTable(){
    var htmlout = tableHeaders
    var sort = document.getElementById('sortBy').value

    if(sort == 'player'){
        bestTimes.sort(sort_player)
        bestScores.sort(sort_player)
    }
    else if(sort == 'level'){
        bestTimes.sort(sort_level)
        bestScores.sort(sort_level)
    }

    for(var x=0; x < bestTimes.length; x++){
        htmlout += assembleRecordsTableRow(bestTimes[x], bestScores[x])
    }
    document.getElementById('recordTable').innerHTML = htmlout
}

function getRecords(players, levels){
    //remove duplicates
    players = [...new Set(players)]
    levels = [...new Set(levels)]

    var playersSplit = splitArray(players)
    var levelsSplit = splitArray(levels)
    var recordsPromises = []

    //fetch times and scores of every batch
    playersSplit.forEach(playerBatch => {
        levelsSplit.forEach(levelBatch => {
            recordsPromises.push(fetch(getFastestTimeURL(playerBatch, levelBatch)).then(r => r.json()))
            recordsPromises.push(fetch(getHighScoreURL(playerBatch, levelBatch)).then(r => r.json()))
        })
    })

    Promise.all(recordsPromises)
    .then(function(r){ //r contains all data fields from the fetch calls
        console.log(r)
        for(var x = 0; x < r.length; x += 2){ //r[x] is a time fetch, r[x+1] is a score fetch (as they're done alternatingly)
            for(var y = 0; y < r[x].data.length; y++){
                bestTimes.push(r[x].data[y])
                bestScores.push(r[x + 1].data[y])
            }
        }
        assembleRecordsTable()
    })
}

function splitArray(array, chunkSize = 16){
    var fetchableArray = [];
    for (let i = 0; i < array.length; i += chunkSize)
        fetchableArray.push(array.slice(i, i + chunkSize));
    return fetchableArray
}

function checkTimes() {
    bestTimes = []
    bestScores = []
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
        console.log(levelIds)
        fetch(levelIds)
        .then(r => r.json())
        .then(function(r){
            codes = r.data.levelIds
            playlistName = r.data.name
            getRecords(playerIds, codes)
        })
    }
    
}