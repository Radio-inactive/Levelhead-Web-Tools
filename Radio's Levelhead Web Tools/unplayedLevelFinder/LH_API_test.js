    var levels=[];
    var unplayedVal=false;

    function unplayedToggle()
    {
        if(unplayedVal==false){
            document.getElementById('unplayedButton').innerHTML='Unplayed only';
            unplayedVal=true;
        }
        else{
            document.getElementById('unplayedButton').innerHTML='All Levels';
            unplayedVal=false;
        }
    }

    function createURL()
    {
        //input from buttons
        //ToDo: make stuff not render if a text box is empty
        var max=document.getElementById('maxEB').value;

        //URL fragments
        var URLTemplate =
        'https://www.bscotch.net/api/levelhead/levels?marketing=true&limit=128&maxExposureBucks={{maxEB}}&includeStats=true&includeAliases=true';

        //assembling URL for fetch
        return URLTemplate.replace('{{maxEB}}', max);

    }

    function fetchLevels()
    {
        document.getElementById('levelList').innerHTML='LOADING...';
        var htmlout="";

        var ref=createURL();
        console.log(ref);

        fetch(ref)
        .then(
                r => r.json()
            )
        .then(
            function(r){
                r.data.forEach(level => {
                    if(unplayedVal==true && level.stats.Players>0);
                    else{
                    htmlout+=levelCardTemplate
                    .replace('{{avatar}}', level.avatarId)
                    .replaceAll('{{levelId}}', level.levelId)
                    .replace('{{levelName}}', level.title)
                    .replace('{{creatorCode}}', level.userId)
                    .replace('{{alias}}', level.alias.alias)
                    .replace('{{players}}', level.stats.Players)
                    .replace('{{EB}}', level.stats.ExposureBucks)
                    .replace('{{createdAt}}', new Date(level.createdAt).toString().substring(4,15));  
                    }

                });
                console.log(r.data);
                document.getElementById('levelList').innerHTML=htmlout;
            })
        
    }

var levelCardTemplate=`
<div class="column">
    <div class="card">
        <img src="https://img.bscotch.net/fit-in/100x100/avatars/{{avatar}}.webp" id="UnplayedPicture">
        <p id="UnplayedCardText">
            <a href="https://levelhead.io/+{{levelId}}" target="_blank">{{levelName}}</a><br>
            <a href="https://levelhead.io/@{{creatorCode}}" target="_blank" style="text-decoration: none;">by {{alias}}</a><br>
            Players: {{players}}<br>
            EB: {{EB}}<br>
            Created: {{createdAt}}<br>
            <button id="CodeButton" onclick="navigator.clipboard.writeText('{{levelId}}')">Copy Levelcode</button>
        </p>
    </div>
</div>
`;