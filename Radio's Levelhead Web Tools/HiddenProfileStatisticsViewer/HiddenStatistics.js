
function assembleURL()
{
    return 'https://www.bscotch.net/api/levelhead/players?userIds='
           + getProfileCode(document.getElementById('userCode').value) +'&includeAliases=true'; 
}
function assembleAliasesURL(){
    return 'https://www.bscotch.net/api/levelhead/aliases?userIds='
           + getProfileCode(document.getElementById('userCode').value) +'&onlySafe=true'
}

function fetchProfileDetails()
{
        document.getElementById('ProfileValidity')
                .innerHTML = 'LOADING...';
        var ref = assembleURL();
        console.log(ref);
        var vld = 0;

        fetch(ref)
        .then(
                r => r.json()
            )
        .then(
            function(r){
                console.log(r.data);
                if(r.data.length!=1){
                    document.getElementById('ProfileValidity')
                            .innerHTML = 'INVALID ID';
                }    
                else{
                    document.getElementById('ProfileValidity')
                            .innerHTML = 'VALID';
                    document.getElementById('Reports')
                            .innerHTML = r.data[0].alias.reports
                                       ? r.data[0].alias.reports
                                       : 0;
                    document.getElementById('Whitelisted')
                            .innerHTML = r.data[0].alias.whitelisted
                                       ? 'Yes'
                                       : 'No';
                    document.getElementById('CreationDate')
                            .innerHTML = r.data[0].createdAt.substring(0,10);
                    document.getElementById('LastUpdate')
                            .innerHTML = dateFormat(r.data[0].updatedAt);
                    document.getElementById('PerkPoints')
                            .innerHTML = r.data[0].stats.PerkPoints
                                       ? r.data[0].stats.PerkPoints
                                       : 0;
                    document.getElementById('HiddenGem')
                            .innerHTML = r.data[0].stats.HiddenGem
                                       ? r.data[0].stats.HiddenGem
                                       : 0;
                    document.getElementById('TippedPerDay')
                            .innerHTML = r.data[0].stats.TippedPerDay
                                       ? r.data[0].stats.TippedPerDay
                                       : 0;
                    document.getElementById('TippedPerLevelPlayed')
                            .innerHTML = r.data[0].stats.TippedPerLevelPlayed
                                       ? r.data[0].stats.TippedPerLevelPlayed
                                       : 0;
                    document.getElementById('TipsGottenPerDay')
                            .innerHTML = r.data[0].stats.TipsPerDay
                                       ? r.data[0].stats.TipsPerDay
                                       : 0;
                    document.getElementById('TipsGottenPerLevel')
                            .innerHTML = r.data[0].stats.TipsPerLevel
                                       ? r.data[0].stats.TipsPerLevel
                                       : 0;
                }
                return fetch(assembleAliasesURL());
            })
                .then(r => r.json())
                .then(r => document.getElementById('SafeName')
                                   .innerHTML = r.data[0].alias)

}
