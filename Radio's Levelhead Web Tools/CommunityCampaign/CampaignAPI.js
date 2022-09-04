//#region utility functions

/**
 * Splits an array into arrays with a defined max size
 * @param {Array<String>} array Array to be split
 * @param {Number} chunkSize size of each array. 16 by default
 * @returns split up array
 */
function splitArray(array, chunkSize = 16){
    var fetchableArray = [];
    for (let i = 0; i < array.length; i += chunkSize)
        fetchableArray.push(array.slice(i, i + chunkSize));
    return fetchableArray
}

//#endregion

/**
 * 
 * @param {Array<String>} levelIds array of level ids
 * @param {String} [userId] creator code of user. will default to the creator code of the currently saved delegation key
 */
function getLevelTimes(levelIds, userId){
    if(userId == undefined)
        userId = JSON.parse(window.localStorage.getItem('DelegationKey')).UserCode
    //ToDo: Write the rest of the function
    
}