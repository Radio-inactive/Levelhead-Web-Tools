
function loadDailyBuildLevels(){
    var htmlOut="";
    fetch("https://www.bscotch.net/api/levelhead/daily-builds/@today")
    .then(r=>r.json())
    .then(function(r){
        console.log(r);
        r.data.forEach(x => {
            output+='<div class="column"><div class="card">';
            output+='</div></div>';
        });
    });
}

var itemInfo=[
    {//vacrat
        "itemId":"3",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/vacrat.webp"
    },
    {//dense fog
        "itemId":"6",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/cloods.webp"
    },
    {//Hardlight
        "itemId":"7",
        "picture":"hardlight"//ToDo
    },
    {//Flipwip
        "itemId":"8",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/flipwip-hibernation.webp"
    },
    {//blopfush
        "itemId":"9",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/blopfush-love.webp"
    },
    {//Flapjack
        "itemId":"10",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/flapjack.webp"
    },
    {//sproing
        "itemId":"13",
        "picture":"sproing" //ToDo
    },
    {//ripcord
        "itemId":"14",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/ripcord.webp"
    },
    {//slippy goo
        "itemId":"17",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/goo-curtain.webp"
    },
    {//sky wiggler
        "itemId":"18",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/sky-wiggler.webp"
    },
    {//throw block
        "itemId":"19",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/stackables.webp"
    },
    {//tiptow
        "itemId":"20",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/tiptow.webp"
    },
    {//battle gate
        "itemId":"21",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/battle-gate.webp"
    },
    {//waylay
        "itemId":"22",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/waylay.webp"
    },
    {//jem gate
        "itemId":"23",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/jem-gate.webp"
    },
    {//whizzblade
        "itemId":"24",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/whizblade-whiz.webp" //ToDo
    },
    {//powered Gate
        "itemId":"25",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/powered-gate.webp"
    },
    {//lock switch
        "itemId":"26",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/security.webp"
    },
    {//jackdrop
        "itemId":"27",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/look-up.webp"
    },
    {//keycard
        "itemId":"29",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/golden-key.webp"
    },
    {//key gate
        "itemId":"30",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/key-door.webp"
    },
    {//Blaster
        "itemId":"31",
        "picture":"" //ToDo
    },
    {//Zipper
        "itemId":"32",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/zipper.webp"
    },
    {//Vacsteak
        "itemId":"33",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/vacsteak.webp"
    },
    {//lizumi
        "itemId":"34",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/lizumi.webp"
    },
    {//pressure switch
        "itemId":"35",
        "picture":"" //ToDo
    },
    {//hard clay
        "itemId":"36",
        "picture":""//ToDo
    },
    {//clock switch
        "itemId":"37",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/ticking-clock.webp"
    },
    {//rift
        "itemId":"38",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/rift-blue.webp"
    },
    {//trigblaster
        "itemId":"39",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/trigblaster.webp"
    },
    {//prize block
        "itemId":"40",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/prize-time.webp"
    },
    {//brittle rock
        "itemId":"41",
        "picture":""//ToDo
    },
    {//cannon
        "itemId":"42",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/twin-steel.webp"
    },
    {//package cam
        "itemId":"43",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/packagecam.webp"
    },
    {//lookannon
        "itemId":"44",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/lookannon.webp"
    },
    {//crombler
        "itemId":"45",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/crombler.webp"
    },
    {//toe slider
        "itemId":"47",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/toe-slider.webp"
    },
    {//burny whirler
        "itemId":"49",
        "picture":""//ToDo
    },
    {//flippy longswitch
        "itemId":"52",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/switch-stare.webp" //ToDo - or lever-love?
    },
    {//spike chainer
        "itemId":"58",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/spikechain.webp" //ToDo
    },
    {//TBot
        "itemId":"59",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/tbot-wave.webp"
    },
    {//jem switch
        "itemId":"61",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/jem-switch.webp"
    },
    {//battle switch
        "itemId":"62",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/battle-switch.webp"
    },
    {//Rebound
        "itemId":"66",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/rebound.webp"
    },
    {//swoopadoop
        "itemId":"71",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/swoopadoop-fury.webp" 
    },
    {//canoodle
        "itemId":"72",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/canoodle-walk.webp"
    },
    {//popjaw
        "itemId":"81",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/popjaw-mouth.webp" 
    },
    {//eye switch
        "itemId":"86",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/the-watchers.webp"
    },
    {//lectroshield
        "itemId":"89",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/lectroshield-power.webp"
    },
    {//armor plate
        "itemId":"90",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/armor-plate.webp"
    },
    {//DBot
        "itemId":"91",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/guardian-dbot.webp"
    },
    {//purge gate
        "itemId":"94",
        "picture":""//ToDo
    },
    {//spike trap
        "itemId":"95",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/spiketrap.webp"
    },
    {//tempswitch
        "itemId":"98",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/countdown.webp"
    },
    {//flapsack
        "itemId":"99",
        "picture":""//flapsack
    },
    {//spike block
        "itemId":"102",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/spikeblock-reveal.webp"
    },
    {//baddie eyeswitch
        "itemId":"115",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/baddie-gaze.webp"
    },
    {//bomb
        "itemId":"116",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/bomb-flash.webp"
    },
    {//battery
        "itemId":"120",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/battery.webp"
    },
    {//charge switch
        "itemId":"121",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/charge-switch.webp"
    },
    {//bumper
        "itemId":"125",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/bumpers.webp"
    },
    {//canoodle core
        "itemId":"126",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/canoodle-core.webp"
    },
    {//wingarang
        "itemId":"127",
        "picture":""//ToDo
    },
    {//slurb juice
        "itemId":"128",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/slurb-juice.webp"
    },
    {//spinny platform
        "itemId":"129",
        "picture":""//ToDo
    },
    {//flingo
        "itemId":"130",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/flingo-swarm.webp"
    },
    {//regret gate
        "itemId":"133",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/regret.webp" //ToDo
    },
    {//Recycler
        "itemId":"140",
        "picture":""//ToDo
    },
    {//blopsack
        "itemId":"141",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/blopfush-album.webp" //ToDo: meh.
    },
    {//lizumi thorn
        "itemId":"142",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/lizumi-thorns.webp" //ToDo
    },
    {//flipegg
        "itemId":"143",
        "picture":""//ToDo
    },
    {//pop medallion
        "itemId":"144",
        "picture":""//ToDo
    },
    {//waitswitch
        "itemId":"158",
        "picture":""//ToDo
    },
    {//scrubb
        "itemId":"182",
        "picture":"scrubb-love"
    },
    {//ocula
        "itemId":"183",
        "picture":""
    },
    {//squished ocula
        "itemId":"184",
        "picture":"ocula-love"
    },
    {//squished scrubb
        "itemId":"185",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/scrubb-love.webp"
    },
    {//key chest
        "itemId":"186",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/suspicious-chest.webp"
    },
    {//key switch
        "itemId":"187",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/keyswitch-dunk.webp"
    },
    {//fireball
        "itemId":"195",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/hot-fire.webp"
    },
    {//input switch
        "itemId":"202",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/input-switch.webp"
    },
    {//shade
        "itemId":"203",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/shade.webp"
    },
    {//puncher
        "itemId":"204",
        "picture":"puncher-punching" //ToDo
    },
    {//jabber
        "itemId":"205",
        "picture":"jabber-smear" //ToDo
    },
    {//mad jabber
        "itemId":"206",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/jabber-aggro.webp"
    },
    {//jibber
        "itemId":"207",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/jibber-chomp.webp"
    },
    {//peanut
        "itemId":"208",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/peanut-corner.webp" //ToDo: meh. thorny
    },
    {//thorny peanut
        "itemId":"209",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/peanut-corner.webp"
    },
    {//explosive peanut
        "itemId":"210",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/peanut-glare.webp" //ToDo meh. not clear
    },
    {//stackable Armor
        "itemId":"211",
        "picture":"https://img.bscotch.net/fit-in/100x100/avatars/stackable-plate.webp"
    }

];