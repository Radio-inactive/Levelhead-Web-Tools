
function delegationKeySave() {
    var key = document.getElementById('delegationInput').value;
    
    if(key == '')
        return;
    
    fetch('https://www.bscotch.net/api/levelhead/bookmarks',
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
            r => r.json();
            window.localStorage.setItem('DelegationKey', `{
                "Key" : "`+ key +`",
                "Validated" : true
            }`);
            console.log(window.localStorage.getItem('DelegationKey'))
            document.getElementById('delegationConfirm')
                    .innerHTML = 'Delegation key successfully stored!';
        }
        else
            document.getElementById('delegationConfirm')
                    .innerHTML = 'A weird error has occured. Try again later...';


        console.log(r);
    })
}

function loadPage(){

    showDelegationKeyValidity();

    loadCursorOptions();
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

function chooseCursor(){//ToDo: radio buttons

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
                .innerHTML = 'Delegation key saved!';
}

var cursorOptionTemplate = `
<input type="radio" id="cursor{{color}}" name="cursorSelection" value="{{color}}"><img src="../PicturesCommon/Cursors/{{color}}.png"><br>
`;