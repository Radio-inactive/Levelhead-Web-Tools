//#region utility functions

/**
 * Splits an array into arrays with a defined max size
 * @param {Array<String>} array Array to be split
 * @param {Number} chunkSize size of each array. 16 by default
 * @returns {Array<Array<String>>} split up array
 */
function splitArray(array, chunkSize = 16){
    var fetchableArray = [];
    for (let i = 0; i < array.length; i += chunkSize)
        fetchableArray.push(array.slice(i, i + chunkSize));
    return fetchableArray
}

//#endregion

//#region Records API call
/**
 * Contains a user's personal best time and score on a level
 */
class Record{
    /**
     * @param {String} userId Creator code of the record holder
     * @param {String} levelId Level code of the level the record was set on
     * @param {Number} time The personal best time in Seconds
     * @param {Number} score The personal best score
     */
    constructor(userId, levelId, time, score){
        /**@type {String} Creator code of the player the record has been set by*/
        this.userId = userId
        /**@type {String} Level code the record has been set on*/
        this.levelId = levelId
        /**@type {Number} The player's personal best time in seconds*/
        this.time = time
        /**@type {Number} The player's personal best score*/
        this.score = score
    }
}

/**
 * Retrieves a user's records on any amount of levels
 * @param {Array<String>} levelIds array of level ids
 * @param {String} [userId] creator code of user. will default to the creator code of the currently saved delegation key
 * @returns {Promise<Array<Record>>} promise for an array that contains a user's records
 */
async function APIgetLevelRecords(levelIds, userId){
    if(userId == undefined)
        userId = JSON.parse(window.localStorage.getItem('DelegationKey')).UserCode
    /**@type {Array<Array<String>>} */
    var levelIdsSplit = splitArray(levelIds)
    /**@type {Array<Promise>} */
    var timeRecordPromises = []
    /**@type {Array<Promise>} */
    var scoreRecordPromises = []
    /**@type {Array<Record>} Combines a user's score and time*/
    var records = []

    levelIdsSplit.forEach(batch => {
        timeRecordPromises.push(
            fetch(`https://www.bscotch.net/api/levelhead/recent-records/FastestTime?userIds=${userId}&levelIds=${batch}`)
            .then(r => r.json())
        )
        scoreRecordPromises.push(
            fetch(`https://www.bscotch.net/api/levelhead/recent-records/HighScore?userIds=${userId}&levelIds=${batch}`)
            .then(r => r.json())
        )
    })

    var fastestTimes = await Promise.all(timeRecordPromises)
    var highestScores = await Promise.all(scoreRecordPromises)

    fastestTimes.forEach(entry => {
        entry.data.forEach(recordTime => {
            /**@type {Number} stores score that belongs to the current fastest time*/
            var score = 0;
            highestScores.forEach(entry => {
                var scoreBuf = entry.data.find(highScore => highScore.levelId == recordTime.levelId)
                if(scoreBuf)
                    score = scoreBuf.value
            })
            records.push(new Record(userId, recordTime.levelId,recordTime.value, score))
        })
    })
    return records;
}

//#endregion

//#region Interactions API call

class Interactions{
    /**
     * @param {LEVEL} level A level to extract interactions from
     */
    constructor(level){
        var interactions = getInteractions(level)

        /**@type {String} Id of the level*/
        this.levelId = level.levelId

        /**@type {Boolean} true if level is bookmarked*/
        this.bookmarked = interactions.bookmarked
        /**@type {Boolean} true if level is liked*/
        this.liked = interactions.liked
        /**@type {Boolean} true if level is favorited*/
        this.favorited = interactions.favorited
        /**@type {Boolean} true if level has been played*/
        this.played = interactions.played
        /**@type {Boolean} true if level has been completed*/
        this.completed = interactions.completed
    }
    /**
     * 
     * @returns {String} "Not Played" if the user has not played the level, 
     * "Played" if the user has played but not beaten the level 
     * and "Completed" if a user has beaten the level
     */
    getPlayStatus(){
        return ["Not Played", "Played", "Completed"][this.played + this.completed]
    }
}

/**
 * Gets a user's level interactions with levels
 * @param {Array<String>} levelIds 
 * @returns {Promise<Array<Interactions>>} Promise for the interaction Array
 */
async function APIgetLevelInteractions(levelIds){
    userId = JSON.parse(window.localStorage.getItem('DelegationKey')).UserCode

    /**@type {Array<Interactions>} */
    var interactions = []

    /**@type {Array<Array<String>>} */
    var levelIdsSplit = splitArray(levelIds)

    var interactionsPromises = []

    levelIdsSplit.forEach(batch => {
        interactionsPromises.push(
            fetch(`https://www.bscotch.net/api/levelhead/levels?limit=128&includeMyInteractions=true&levelIds=`+ batch, getExtendedRequestBody())
            .then(r => r.json())
        )
    })
    
    var interactionLevels = await Promise.all(interactionsPromises)
    interactionLevels.forEach(entry => {
        entry.data.forEach(level => {
            interactions.push(new Interactions(level))
        })
    })
    return interactions
}

//#endregion
