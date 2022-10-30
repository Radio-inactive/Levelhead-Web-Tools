
function delegationKeySave() {
    var key = document.getElementById('delegationInput').value;
    var delegationKeyData = {
        "Key":"",
        "Validated":"",
        "UserName":"",
        "UserCode":""
    };
    if(key == '')
        return;
    
    fetch('https://www.bscotch.net/api/levelhead/aliases?userIds=@me',
        {
            'method': 'GET',
            'headers': {
                'Rumpus-Delegation-Key' : key,
            },
            'mode': 'cors',
            'cache': 'default',
          }
    )
    .then(function(r){
        //access denied
        if(r.status == '401'){
            document.getElementById('delegationConfirm')
                    .innerHTML = 'Delegation key incorrect...';
        }//connection error
        else if(r.status == '404'){
            document.getElementById('delegationConfirm')
                    .innerHTML = 'Connection error, delegation key could not be saved...';
        }//OK
        else if(r.status == '200')
        {
                    return  r.json();
        }
        else
            document.getElementById('delegationConfirm')
                    .innerHTML = 'A weird error has occured. Try again later...';


        
        return null;
    })
    .then(function(r){
        console.log(r);
        if(r){
            window.localStorage.setItem('DelegationKey', `{
                "Key" : "${key}",
                "Validated" : true,
                "UserName":"${r.data[0].alias}",
                "UserCode":"${r.data[0].userId}"
            }`);
            console.log(window.localStorage.getItem('DelegationKey'))
            document.getElementById('delegationConfirm')
                    .innerHTML = 'Delegation key successfully stored! Welcome, ' + r.data[0].alias + '!';
        }
        else return null;
    })
}

function loadPage(){

    showDelegationKeyValidity();

    loadCursorOptions();
    loadDateOptions();
    loadTimeOptions();
    loadScoreOptions();
}

function loadDateOptions(){
    var htmlout = ""
    var radioFormat = function(date, formatName){return `<input type="radio" name="dateFormat" value="${formatName}">${date}<br>`} 
    var currentDate = new Date(Date.now())

    htmlout += radioFormat(dateFormatOptions.standard(currentDate), "standard")
    htmlout += radioFormat(dateFormatOptions.notz(currentDate), "notz")
    htmlout += radioFormat(dateFormatOptions.locale(currentDate), "locale")
    document.getElementById("dateFormatSelection").innerHTML = htmlout
}

function loadTimeOptions(){
    var htmlout = ""
    var radioFormat = function(time, formatName){return `<input type="radio" name="timeFormat" value="${formatName}">${time}<br>`}
    var testTime = 64323.33 
    
    htmlout += radioFormat(timeFormatOptions.standard(testTime), "standard")
    htmlout += radioFormat(timeFormatOptions.compact(testTime), "compact")

    document.getElementById("timeFormatSelection").innerHTML = htmlout
}

function loadScoreOptions(){
    var htmlout = ""
    var radioFormat = function(score, formatName){return `<input type="radio" name="scoreFormat" value="${formatName}">${score}<br>`}
    var testScore = 6432300
    
    htmlout += radioFormat(scoreFormatOptions.standard(testScore), "standard")
    htmlout += radioFormat(scoreFormatOptions.compact(testScore), "compact")

    document.getElementById("scoreFormatSelection").innerHTML = htmlout
}

function loadCursorOptions(){

    htmlout = '';

    cursorOptions
    .forEach(option => {
        if(option != 'normal')
            htmlout += cursorOptionTemplate.replaceAll('{{color}}', option);
        else
            htmlout += cursorOptionTemplate.replaceAll('{{color}}', 'copy');

    });

    document.getElementById('cursorOptions')
            .innerHTML = htmlout;
}

function saveFormatingOptions(options){
    options.forEach(option => {
        chooseFormatOption(option)
    })
    document.getElementById("formatSaveConfirm").innerHTML = "Format changes saved!"
}

function chooseFormatOption(optionName = ""){
    var selection = document.getElementsByName(optionName + "Format")

    selection.forEach(option => {
        if(option.checked == true){
            window.localStorage.setItem(optionName + "Format", option.value)
        }
    })

}

function chooseCursor(){//ToDo: implement

    var chosenOption = 'nothing';
    var options = document.getElementsByName('cursorSelection')

    options.forEach(option => {
        if(option.checked)
            chosenOption = option.value;
    })

    if(cursorOptions.includes(chosenOption)){
        window.localStorage.setItem('CursorOption', chosenOption);
        document.body.style.cursor = setCursorTemplate.replaceAll('{{color}}', chosenOption);
    }
    window.localStorage.getItem('CursorOption');

    console.log(chosenOption);
}

function showDelegationKeyValidity(){
    //Check if storage object is not null
    if(!window.localStorage.getItem('DelegationKey')){
        document.getElementById('delegationConfirm')
                .innerHTML = 'No Delegation key yet!';
        return;
    }
        
    //parse json of locally stored stuff
    var key = JSON.parse(window.localStorage.getItem('DelegationKey'));

    //Validated is set if key was saved. might add a delete key option in the future
    if(!key.Validated){
        document.getElementById('delegationConfirm')
                .innerHTML = 'No Delegation key yet!';
        return;
    }
    console.log(key);
    
        document.getElementById('delegationConfirm')
                .innerHTML = 'Delegation key saved! Welcome, ' + key.UserName + "!";
}

var cursorOptionTemplate = `
<input type="radio" id="cursor{{color}}" name="cursorSelection" value="{{color}}"><img src="../PicturesCommon/Cursors/{{color}}.png"><br>
`;