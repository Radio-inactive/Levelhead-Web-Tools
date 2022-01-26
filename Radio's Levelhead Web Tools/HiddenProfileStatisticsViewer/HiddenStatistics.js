
function assembleURL()
{
    return 'https://www.bscotch.net/api/levelhead/players?userIds='+ document.getElementById('userCode').value.toLowerCase().trim() +'&includeAliases=true';
}
function assembleAliasesURL(){
    return 'https://www.bscotch.net/api/levelhead/aliases?userIds='+ document.getElementById('userCode').value.toLowerCase().trim() +'&onlySafe=true'
}

function fetchProfileDetails()
{
        document.getElementById('ProfileValidity').innerHTML='LOADING...';
        var ref=assembleURL();
        console.log(ref);
        var vld=0;

        fetch(ref)
        .then(
                r => r.json()
            )
        .then(
            function(r){
                console.log(r.data);
                if(r.data.length!=1){
                    document.getElementById('ProfileValidity').innerHTML='INVALID ID';
                }    
                else{
                    document.getElementById('ProfileValidity').innerHTML='VALID';
                    document.getElementById('Reports').innerHTML=r.data[0].alias.reports;
                    document.getElementById('Whitelisted').innerHTML=r.data[0].alias.whitelisted;
                    document.getElementById('CreationDate').innerHTML=r.data[0].createdAt.substring(0,10);
                    document.getElementById('LastUpdate').innerHTML=new Date(r.data[0].updatedAt).toString().substring(4,31);
                    document.getElementById('PerkPoints').innerHTML=r.data[0].stats.PerkPoints;
                    document.getElementById('HiddenGem').innerHTML=r.data[0].stats.HiddenGem;
                    document.getElementById('TippedPerDay').innerHTML=r.data[0].stats.TippedPerDay;
                    document.getElementById('TippedPerLevelPlayed').innerHTML=r.data[0].stats.TippedPerLevelPlayed;
                    document.getElementById('TipsGottenPerDay').innerHTML=r.data[0].stats.TipsPerDay;
                    document.getElementById('TipsGottenPerLevel').innerHTML=r.data[0].stats.TipsPerLevel;
                }
                return fetch(assembleAliasesURL());
            })
                .then(r=>r.json())
                .then(r=>document.getElementById('SafeName').innerHTML=r.data[0].alias)

}
