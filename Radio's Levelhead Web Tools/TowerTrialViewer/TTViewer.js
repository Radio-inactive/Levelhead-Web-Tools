function createTTTable(TT){
    htmlout = ""

    //date as first entry
    htmlout += `<tr><th>Date: ${dateFormat(TT.createdAt)}</th></tr>`
    htmlout += `<tr><th>Time Tropy: ${timeFormat(TT.timeTrophyGoal)}</th><tr>`
    htmlout += `<tr><th>Levels</th></tr>`
    TT.levelIds.forEach(level => {
        if(delegationKeyValid)
            var interactions = getInteractions(level)
        htmlout += `<tr>
                        <td>
                            <img src="${getAvatarURL(level.avatarId, 20)}">
                            ${delegationKeyValid ? `<img src="../PicturesCommon/CardIcons/INTERACTION_${icon.playedStatus[interactions.played + interactions.completed]}.png" style="max-width: 20px">` : ""}
                            <a href="https://levelhead.io/+${level.levelId}" target="_blank">${level.title}</a> by 
                            <a href="https://levelhead.io/@${level.userId}" target="_blank">${level.alias.alias}</a>
                        </td>
                    </tr>`
    })

    if(TT.records){
        htmlout += `<tr><th>Shoes</th></tr>`
        TT.records.FastestTime.forEach(shoe => {
            htmlout += `
                        <tr>
                            <td>
                            ${timeFormat(shoe.value)} by <a href="https://levelhead.io/@${shoe.userId}" target="_blank">${shoe.alias.alias}</a>
                            </td>
                        </tr>`
        })
        htmlout += `<tr><th>Ribbons</th></tr>`
        TT.records.HighScore.forEach(ribbon => {
            htmlout += `
            <tr>
                <td>
                ${ribbon.value} by <a href="https://levelhead.io/@${ribbon.userId}" target="_blank">${ribbon.alias.alias}</a>
                </td>
            </tr>`
        })
    }
    return `<table>${htmlout}</table><br>`;
}

function makeTTTables(data){
    var htmlout = "";
    var levelInfo = []

    data.forEach(trial => {
        levelInfo.push(fetch(`https://www.bscotch.net/api/levelhead/levels?levelIds=${trial.levelIds}&includeAliases=true&includeStats=true&includeRecords=true&includeMyInteractions=true`, delegationKeyValid ? getExtendedRequestBody() : undefined)
                        .then(r => r.json()))
    });

    Promise.all(levelInfo)
    .then(function(TTLevels){
        TTLevels.forEach(function(batch, index){
            data[index].levelIds.forEach(function(levelId, index, levels) {
              //replaces Level IDs with full level details
              levels[index] = batch.data.find(level => level.levelId == levelId)
            })
        })
        console.log(data)
        data.forEach(TT => {
            htmlout += createTTTable(TT)
        })
        document.getElementById("TowerTrials").innerHTML = htmlout
    })

}

function loadTT(){
    var URLAppend = ""
    var startDate = document.getElementById("TTDateMin").value
    document.getElementById("TowerTrials").innerHTML = "LOADING..."
    if(startDate){
        startDate = new Date(Date.parse(startDate))
        console.log("date log", startDate)
        var today = new Date(Date.now())

        var diff = Math.floor((today - startDate) / (1000*60*60*24))
        if(diff > 0){
            URLAppend += "&minDaysAgo=" + diff
        }
        console.log(diff)
    }
    if(document.getElementById("TTCreatedAt").value == "-createdAt")
        URLAppend += "&sort=-createdAt"
    
    fetch('https://www.bscotch.net/api/levelhead/tower-trials?limit=10&includeRecords=true&includeAliases=true' + URLAppend, delegationKeyValid ? getExtendedRequestBody() : undefined)
    .then(r => r.json())
    .then(function(r){
        makeTTTables(r.data)
    })
}