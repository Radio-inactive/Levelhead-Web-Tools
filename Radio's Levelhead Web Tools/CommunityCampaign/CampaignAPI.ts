export module CampaignApi {
    var delegationKeyValid = false;
    /**
     * Splits an array into arrays with a defined max size
     * @param {Array<String>} array Array to be split
     * @param {Number} chunkSize size of each array. 16 by default
     * @returns {Array<Array<String>>} split up array
     */
    export function splitArray (array: Array<String>, chunkSize = 16): Array<Array<String>> {
        var fetchableArray = [];
        for (let i = 0; i < array.length; i += chunkSize)
            fetchableArray.push(array.slice(i, i + chunkSize));
        return fetchableArray
    }

    export function getExtendedRequestBody(method: string = 'GET'): any{
        var requestBody = {
            'method': method,
            'headers': {
                'Rumpus-Delegation-Key' : JSON.parse(window.localStorage.getItem('DelegationKey') || '').Key
            },
            'mode': 'cors',
            'cache': 'default'
        }
        return requestBody;
    }

    /**
     * Get the interactions (played, completed, etc.) from a level
     * @param {LEVEL} level level object, returned by level-related api calls
     * @returns interactions object. contains 'bookmarked', 'liked', 'favorited', 'played' and 'completed'.
     *  all but 'bookmarked' are set to true if the level was made by the player whose delegation key is used
     */
    export function getInteractions(level: Level){
        //checks if level was created by user
        var ownLevel = level.userId == JSON.parse(window.localStorage.getItem('DelegationKey') || '').UserCode;
        var possibleInteractions = {
            'bookmarked':false,
            'liked':ownLevel,
            'favorited':ownLevel,
            'played':ownLevel,
            'completed':ownLevel
        }
        //check if any interactions, then add interactions
        if(level.interactions){
            //double negation for conversion in bool (can otherwise be undefined)
            possibleInteractions.bookmarked = level.interactions.bookmarked ?true:false;
            if(!ownLevel){
                possibleInteractions.liked = level.interactions.liked ?true:false;
                possibleInteractions.favorited = level.interactions.favorited ?true:false;
                possibleInteractions.played = level.interactions.played ?true:false;
                possibleInteractions.completed = level.interactions.completed ?true:false;
            }
        }
        return possibleInteractions;
        
    }

    //#region Delegation Key stuff
    /**
     * Checks the current Delegation key. sets delegationKeyValid to true if successful
     * @returns Status of the current delegation key
     */
    export async function APIgetDelegationKey() {

        var key = JSON.parse(window.localStorage.getItem('DelegationKey') || '')

        // if(!key) {
        //     key = { Key: 'xGdMbWa26ap2tTJY' };
        //     window.localStorage.setItem('DelegationKey', JSON.stringify(key));

        // }

        if(!key || !key.Key)
            return {error: "No Delegtion Key has been saved!"}
        try{
        var delegationKeyAPI = await fetch("https://www.bscotch.net/api/levelhead/aliases?userIds=@me", getExtendedRequestBody())

        }
        catch(error){
            return {error: "Delegation key invalid or a connection error has occured (Exception): " + error}
        }
        //check for errors
        switch(Number(delegationKeyAPI.status)){
            case 200:
                break;
            case 401:
                return {error: "Delegation Key invalid!"}
            case 404:
                return {error: "Connection error!"}
            default:
                return {error: "An unknown error has occured: " + delegationKeyAPI}
        }

        delegationKeyValid = true;

        return {valid: true}

    }

    export interface ILevel {
        content: any;
        records: any;
        stats: any;
        tagNames: any;
        tags: any;
        alias: any;
        interactions: any;
        levelId: String;
        userId: String;
        title: String;
        creatorTime: Number;
        requiredPlayers: Number;
    }

    //#region Level API call
    /**
     * contains the most important data from a level returned by an API call
     */
    export class Level implements ILevel {
        levelId: String;
        userId: String;
        title: String;
        creatorTime: Number;
        requiredPlayers: Number;
        alias: any;
        content: any;
        records: any;
        stats: any;
        tagNames: any;
        tags: any;
        interactions: Interactions | undefined = undefined;
        personalRecord: any;

        constructor(level: ILevel){
            /**@type {String} Level code of the level*/
            this.levelId = level.levelId
            /**@type {String} Creator code of the builder*/
            this.userId = level.userId
            /**@type {String} The level's name*/
            this.title = level.title

            /**@type {Number} The benchmark time of the level in seconds*/
            this.creatorTime = level.creatorTime
            /**@type {Number} Amount of players required to play this level (Multiplayer)*/
            this.requiredPlayers = level.requiredPlayers

            //Objects inside the level object
            /**@type {Object | undefined} Alias object of a level. Contains the user name of the builder (alias), their avatar (avatarId), etc.*/
            this.alias = level.alias
            /**@type {Object | undefined} Content of the Level (Enemies, Puzzle, World, Hazards, Movement)*/
            this.content = level.content
            /**@type {Object | undefined} The 3 best times and scores on a level.*/
            this.records = level.records
            /**@type {Object | undefined} Stats of a level. contains clear rate (ClearRate), diamonds (Diamonds), likes (Likes) etc.*/
            this.stats = level.stats
            /**@type {Array<String>} Tag names of the level's tag. Adjusts to the browser language.*/
            this.tagNames = level.tagNames
            /**@type {Array<String>} Tag IDs. Are the same regardless of browser language.*/
            this.tags = level.tags
            if(level.interactions)
                /**@type {Interactions} contains user's interactions with the level.*/
                this.interactions = new Interactions(level.interactions)

            //Potentially to be connected
            /**@type {PersonalRecord} The current user's record on a level. To be used to store a user's time and score on a level, not part of the level returned by the api.*/
            this.personalRecord = null
        }
        
    }

    /**
     * Makes API calls to retrieve level info
     * @param {Array<String>} levelIds Array with level codes
     * @param {Boolean} includeAlias If true, retrieves the Alias object (containing the builder's name and avatar)
     * @param {Boolean} includeStats If true, retrieves the Stats object (containing the level's clear rate, likes, etc.)
     * @param {Boolean} includeRecords If true, retrieves the Records object (containing the 3 best times and scores of the level)
     * @param {Boolean} includePersonalRecord If true, retrieves the currently logged in user's personal best time and score of the level
     * @param {Boolean} includeInteractions If true, retrieves the Interactions object (containing the logged in user's Interactions (see Interactions class))
     * @returns Promise for Array with Level objects.
     */
    export async function APIgetLevels(levelIds: Array<string>, includeAlias = false, includeStats = true, includeRecords = false, includePersonalRecord = false, includeInteractions = false): Promise<Level[]>{
        var levelIdsSplit = splitArray(levelIds)
        var fetchBody: any = undefined;
        var fetchURL = 'https://www.bscotch.net/api/levelhead/levels?limit=128'
        if(includeAlias) fetchURL += '&includeAliases=true'
        if(includeStats) fetchURL += '&includeStats=true'
        if(includeRecords) fetchURL += '&includeRecords=true'
        if(includeInteractions && delegationKeyValid){
            fetchURL += '&includeMyInteractions=true'
            fetchBody = getExtendedRequestBody()
        }

        fetchURL += '&levelIds='

        /**@type {Array<Promise>} */
        var levelPromises: Array<Promise<any>> = []

        levelIdsSplit.forEach(batch => {
            levelPromises.push(
                fetch(fetchURL + batch, fetchBody).then(r => r.json())
            )
        })
        /**@type {Array<Level>} */
        var levels: Array<Level> = []
        var levelInfo = await Promise.all(levelPromises)
        
        levelInfo.forEach(batch => {
            batch.data.forEach((level: Level) => {
                levels.push(new Level(level))
            })
        })

        if(includePersonalRecord){
            var personalrecords = await APIgetLevelRecords(levelIds)
            personalrecords.forEach(record => {
                var recordLevel = levels.find(level => level.levelId == record.levelId)
                if(recordLevel)
                    recordLevel.personalRecord = record
            })
        }

        return levels
    }

//#endregion

    //#region Records API call
    /**
     * Contains a user's personal best time and score on a level
     */
    export class PersonalRecord{
        levelId: any;
        userId: any;
        time: any;
        score: any;
        /**
         * @param {String} userId Creator code of the record holder
         * @param {String} levelId Level code of the level the record was set on
         * @param {Number} time The personal best time in Seconds
         * @param {Number} score The personal best score
         */
        constructor(userId: String, levelId: String, time: Number, score: Number){
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
     * @returns {Promise<Array<PersonalRecord>>} promise for an array that contains a user's records
     */
    export async function APIgetLevelRecords(levelIds: Array<string>, userId: string | undefined = undefined): Promise<Array<PersonalRecord>>{
        if(userId == undefined) {
            var delegationKey = window.localStorage.getItem('DelegationKey');
            if(delegationKey)
                userId = JSON.parse(delegationKey).UserCode
        }
        /**@type {Array<Array<String>>} */
        var levelIdsSplit = splitArray(levelIds)
        /**@type {Array<Promise>} */
        var timeRecordPromises: Array<Promise<any>> = []
        /**@type {Array<Promise>} */
        var scoreRecordPromises:  Array<Promise<any>> = []
        /**@type {Array<PersonalRecord>} Combines a user's score and time*/
        var records: Array<PersonalRecord>  = []

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
            entry.data.forEach((recordTime: any) => {
                /**@type {Number} stores score that belongs to the current fastest time*/
                var score = 0;
                highestScores.forEach(entry => {
                    var scoreBuf = entry.data.find((highScore: any) => highScore.levelId == recordTime.levelId)
                    if(scoreBuf)
                        score = scoreBuf.value
                })
                records.push(new PersonalRecord(userId || '', recordTime.levelId,recordTime.value, score))
            })
        })
        return records;
    }

//#endregion

//#region Interactions API call

    export class Interactions  {
        levelId: any;
        bookmarked: boolean;
        liked: boolean;
        favorited: boolean;
        played: boolean;
        completed: boolean;
        /**
         * @param {Level} level A level to extract interactions from
         */
        constructor(level: Level){
            var interactions = getInteractions(level)

            /**@type {String} Id of the level*/
            this.levelId = level.levelId

            /**@type {Boolean} true if level is bookmarked*/
            this.bookmarked = !!interactions.bookmarked
            /**@type {Boolean} true if level is liked*/
            this.liked = !!interactions.liked
            /**@type {Boolean} true if level is favorited*/
            this.favorited = !!interactions.favorited
            /**@type {Boolean} true if level has been played*/
            this.played = !!interactions.played
            /**@type {Boolean} true if level has been completed*/
            this.completed = !!interactions.completed
        }

        /**
         * @returns {String} "Not Played" if the user has not played the level, 
         * "Played" if the user has played but not beaten the level 
         * and "Completed" if a user has beaten the level
         */
        getPlayStatus(){
            return ["Not Played", "Played", "Completed"][(+this.played) + (+this.completed)]
        }
    }

    /**
     * Gets a user's level interactions with levels
     * @param {Array<String>} levelIds 
     * @returns {Promise<Array<Interactions>>} Promise for the interaction Array
     */
    export async function APIgetLevelInteractions(levelIds: Array<String>){
        const userId = JSON.parse(window.localStorage.getItem('DelegationKey') || '').UserCode

        var interactions: Array<Interactions> = []
        var levelIdsSplit: Array<Array<String>> = splitArray(levelIds)

        var interactionsPromises: Array<any> = []

        levelIdsSplit.forEach(batch => {
            interactionsPromises.push(
                fetch(`https://www.bscotch.net/api/levelhead/levels?limit=128&includeMyInteractions=true&levelIds=`+ batch, getExtendedRequestBody())
                .then(r => r.json())
            )
        })
        
        var interactionLevels = await Promise.all(interactionsPromises)
        interactionLevels.forEach(entry => {
            entry.data.forEach((level: Level) => {
                interactions.push(new Interactions(level))
            })
        })
        return interactions
    }
}
//#endregion
