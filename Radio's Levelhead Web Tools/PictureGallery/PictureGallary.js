function loadGallary(){
    var htmlout = "";

    avatarTitles
     .forEach(avatarId => {
        //avatar used for unique ids and loading pictures
        htmlout += gallaryCardTemplate.replaceAll('{{avatar}}', avatarId);
    })
    document.getElementById('gallaryContent').innerHTML = htmlout;
}

function loadLevelLink(avatar){
    var size = document.getElementById(avatar +'Input').value;
    if(size >= 16 && size <= 2000);
    else if(size == '') size = 100;
    //maximum/minimum size
    else if(size < 16) size = 16;
    else if(size > 2000) size = 2000;
    //never happens as far as I know
    else size = 100;
    var filetype = document.getElementById(avatar +'Filetype').innerHTML;
    //assembles link, opens in new tab
    window.open(`https://img.bscotch.net/fit-in/${size}x${size}/avatars/${avatar}.${filetype}`, '_blank');
}

function toggleFileType(avatar){
    var curType = document.getElementById(avatar+'Filetype').innerHTML;

    //Switches a card
    if(curType == 'png')
        document.getElementById(avatar+'Filetype')
                .innerHTML = 'webp';
    else
        document.getElementById(avatar+'Filetype')
                .innerHTML = 'png';
}


var gallaryCardTemplate=`
<div class="column" id="galleryColumn"><div class="card" id="galleryCard">
<img src="https://img.bscotch.net/fit-in/100x100/avatars/{{avatar}}.webp" id="galleryPicture">
<p id="gallaryText"><b onclick="navigator.clipboard.writeText('{{avatar}}')">{{avatar}}</b><br>
Size: <input type="number" min="16" max="2000" value="100" id="{{avatar}}Input"><br>
File type: <button disabled onclick="toggleFileType('{{avatar}}')" id="{{avatar}}Filetype">webp</button><br>
<button onclick="loadLevelLink('{{avatar}}')">Load Avatar</button>
</p></div></div>
`;

//#region All Avatar IDs

var avatarTitles=[
    "bureau-employee",
    "gr18-whistle",
    "gr18-serious",
    "gr18-woo",
    "lets-move",
    "grappler", 
    "soaring-leap",
    "sproing-slam",
    "gr18-confused",
    "gr18-dead",
    "death-vortex",
    "gr-bored",
    "gr-bonding",
    "gr-pumped",
    "gr18-sprint",
    "two-players",
    "three-players",
    "four-players",
    "jet-propulsion",
    "ripcord-n-chill",
    "copter-concentrate",
    "rebound-abyss",
    "rebound-thoughts",
    "rebound-orbs",
    "rebound-surprise",
    "rebound-awe",
    "waylay-hangtime",
    "waylay-megapunch",
    "waylay-whoa",
    "gr18-waylay",
    "zipper-party",
    "gr18-zip",
    "gr18-zipper_flip",
    "wallslide",
    "gr18-shrub",
    "shade-sense",
    "shade-rune",
    "shade-flip",
    "goal-love",
    "package", 
    "nervous-package",
    "budde-happy",
    "budde-angry",
    "cloods",
    "spookstone-screamer",
    "goo-curtain",
    "prize-time",
    "jem-gate",
    "key-door",
    "battle-gate",
    "regret",
    "powered-gate",
    "sky-wiggler",
    "trigblaster",
    "flingo-swarm",
    "toe-slider",
    "flyblock",
    "long-flyblocks",
    "bumpers",
    "puncher-gold",
    "puncher-green",
    "puncher-blue",
    "puncher-fuchsia",
    "puncher-punching",
    "puncher-diagonal",
    "rift-blue",
    "rift-gold",
    "rift-green",
    "rift-fuchsia",
    "jem-force-five",
    "peeking-jems",
    "jem-shower",
    "ripcord",
    "tiptow",
    "waylay",
    "rebound",
    "zipper",
    "shade",
    "the-armory",
    "armor-plate",
    "stackable-plate",
    "lectroshield-power",
    "dbot-surprise",
    "guardian-dbot", 
    "slurb-juice",
    "tbot-wave",
    "tbot-closeup",
    "tbot-squint",
    "stackables",
    "golden-key",
    "bomb-flash", 
    "smoky-blast",
    "vacsteak",
    "lizumi-thorns", 
    "battery",
    "whizblade-whiz",
    "whizblade-sandwich",
    "spikeblock-reveal",
    "look-up",
    "incoming-steel",
    "homing", 
    "rocket", 
    "twin-steel",
    "lookannon",
    "hot-fire",
    "wild-fire",
    "spiketrap",
    "spiketron-focus",
    "spiketron-surprise",
    "crombler",
    "crombler-rage",
    "crombler-taunt",
    "spikechain",
    "incoming-enemy",
    "security",
    "flippy-squad",
    "lever-love",
    "switch-stare",
    "huge-mistake",
    "charge-switch",
    "battle-switch",
    "battle-switch-lurker",
    "battle-switches",
    "battle-switch-smear",
    "ticking-clock",
    "countdown",
    "jem-switch",
    "keyswitch-dunk",
    "suspicious-chest",
    "chest-happiness",
    "the-watchers",
    "baddie-gaze",
    "packagecam",
    "input-switch",
    "camera-stare",
    "jingle-power",
    "weatherbox-radiance",
    "fair-weather-friend",
    "zoom-time", 
    "wacky-arrows",
    "boombox-jams",
    "jukebox",
    "gr17-sadness",
    "ejection-surprise", 
    "stranded-longing",
    "design-flaw", 
    "peace-out",
    "warp-speed", 
    "bug-hunt", 
    "employee-baby",
    "maya-smile",
    "maya-angry",
    "maya-hate-bugs",
    "debugger",
    "book-throw", 
    "noisy-robot", 
    "graduation",
    "ocula-love",
    "vacrat",
    "sleepy-vacrat",
    "scrubb-love",
    "chump-snooze",
    "ocula-friendo",
    "flipwip-hibernation",
    "flipwip-attack",
    "tripwip",
    "swoopadoop-fury",
    "drill-goose",
    "popjaw-mouth",
    "popjaw-prep",
    "flapjack",
    "lizumi",
    "lizumi-eye",
    "blopfush-album",
    "blopfush-love",
    "canoodle-charge",
    "canoodle-walk",
    "canoodle-core",
    "peanut-corner",
    "peanut-glare",
    "jabber-smear",
    "jabber-dive",
    "jibber-jaw",
    "jibber-chomp",
    "jabber-aggro",
    "jabber-swarm",
    "workshop",
    "tower",
    "bscotch",
    "bscotchseth",
    "bscotchsam",
    "bscotchadam",
    "bscotchshi",
    "bscotchsampy"
]

//#endregion