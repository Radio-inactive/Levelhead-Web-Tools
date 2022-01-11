//Code by Radio Inactive

//#region HTML helper functions

    function htmlParagraph(content)
    {
        return '<p>' + content + '<p>';
    }

    function htmlLinkTo(link, content)
    {
        return '<a href="'+link+'" target="unplayedLevelTab">'+content+'</a>';
    }

    function htmlParagraphLink(link, content)
    {
        return htmlParagraph(htmlLinkTo(link, content));
    }

//#endregion

//#region Level URL helper functions

    //returns a link to a level
    function urlLevel(levelCode)
    {
        return 'https://levelhead.io/+' + levelCode;
    }

    //returns a link to a level
    function urlCreator(creatorCode)
    {
        return 'https://levelhead.io/@' + creatorCode;
    }

    function urlIcon(iconName, size){
        return 'https://img.bscotch.net/fit-in/' + size + 'x' + size + '/avatars/' + iconName + '.webp';
    }

    function htmlGridCard(pictureID, levelName, levelCode, creatorCode, players, expBucks){
        var output="";
        output+='<div class="column"><div class="card">';
        output+='<img src='+ urlIcon(pictureID,100) +' id="UnplayedPicture">';
        output+='<p id="UnplayedCardText">'+ htmlLinkTo(urlLevel(levelCode),levelName) +'<br>';
        output+=htmlLinkTo(urlCreator(creatorCode),'Creator');
        output+='<br>Players: '+ players +'<br>EB: '+ expBucks;
        output+='</p></div></div>';

        return output;
    }

//#endregion

//#region Assembling HTML
    

//#endregion

//#region Unplayed levels loader

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

    /**
     * creates URL for fetching unplayed levels
     * @returns URL to be used for fetch calls
     */
    function createURL()
    {
        //input from buttons
        //ToDo: make stuff not render if a text box is empty
        var min=document.getElementById('minEB').value;
        var max=document.getElementById('maxEB').value;
        var amnt=document.getElementById('levelAmount').value;

        //URL fragments
        var href1 = 'https://www.bscotch.net/api/levelhead/levels?marketing=true&maxExposureBucks=';
        var href2 = '&minExposureBucks=';
        var href3 = '&limit=';
        var href4 = '&includeStats=true'

        //assembling URL for fetch
        return ref=href1+max+href2+min+href3+amnt+href4;

    }

    /**
     * sets the content of levelList(ID) in html
     * @param {String} content content to replace current content of levelList with
     */
    function brr(content="empty"){
        document.getElementById('levelList').innerHTML='<p>'+content+'</p>';
    }

    /**
     * assembles content of levelList(ID) in html
     * @param arg1 result of fetching levels. e.g. fetch(url).then(r=>r.json())
     */
    function assembleUnplayedList(r){
        var htmlout='';
        console.log(r.data);
        r.data.forEach(x => {
            if(unplayedVal==true && x.stats.Attempts>0);
            else{
                htmlout+=htmlGridCard(x.avatarId, x.title, x.levelId, x.userId, x.stats.Players, x.stats.ExposureBucks);
            }
        });

        document.getElementById('levelList').innerHTML=htmlout;
    }

    function fetchLevels()
    {
        document.getElementById('levelList').innerHTML='LOADING...';
        var ref=createURL();
        console.log(ref);

        fetch(ref)
        .then(
                r => r.json()
            )
        .then(
            function(r){
                assembleUnplayedList(r);
            })
        
    }

//#endregion
