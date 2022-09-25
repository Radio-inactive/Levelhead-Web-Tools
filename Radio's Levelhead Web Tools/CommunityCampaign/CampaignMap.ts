import 'phaser';
import { CampaignApi }  from './CampaignAPI';

export default class CampaignMap extends Phaser.Scene {

    GAME_WIDTH = 1920;
    GAME_HEIGHT = 1080;
    
    SHIP_VELOCITY = 5;

    keys: any = null;
    ship: any = null;
    shipLevelindex = 0;

    campaignLevelData: CampaignApi.Level[] = []

    layers = [];

    campaignLevelCodes = [
        "lk2mpp4", 
        "nc4wgd6",
        "v2f60m6", 
        "hq0q0jn", 
        "13r3fzn", 
        "00zspnb",
        "7rbr169", 
        "33sxdsf", 
        "3f877l3", 
        "0hhkm4r", 
        "1dbp3rm", 
        "70wqj00", 
        "g0qzt1p", 
        "x1cdkgh", 
        "xrsppzr", 
        "f6vgg15", 
        "6fk7kkq", 
        "9cs208n"
    ]
    
    constructor () {
        super('CampaignMap');
    }

    goNext = (event: any) => {
        if(this.shipLevelindex >= this.campaignLevelCodes.length - 1) {
            return;
        }

        this.shipLevelindex++;
        this.sendShipToPlanet(this.shipLevelindex);
    }

    goPrevious = (event: any) => {
        if(this.shipLevelindex <= 0) {
            return;
        }

        this.shipLevelindex--;
        this.sendShipToPlanet(this.shipLevelindex);
    }

    sendShipToPlanet = (index: number) => {
        var pos = this.getLocForPlanet(index);
        this.tweens.add({
            targets: this.ship,
            x: pos.x-25,
            y: pos.y,
            useFrames: false,
            duration: 500,
            ease: 'Sine',
            yoyo: false,
            repeat: 0
        });
    }


    getLocForPlanet = (index: number) => {
        var row = index % 5;
        var col = Math.floor(index / 5);
        var xOffset = 300;
        var yOffset = 200;

        var xPadding = 350;
        var yPadding = 300;

        return {
            x: (xOffset * row) + xPadding,
            y: (col * yOffset) + yPadding,
        }
    }

    preload () {
        this.load.image('background', 'backgrounds/campaign_BG.png');
        this.load.image('logo', 'logos/CC_logo.png');
        this.load.image('ship', 'ship.png')
        this.load.image('level', 'levelorbs/levelorb_unbeaten.png')

        
    }

    create () {
        const bg = this.add.image(0, 0, 'background').setOrigin(0,0);
        const logo = this.add.image(100, 140, 'logo');
        this.ship = this.add.sprite(200, 500,'ship').setScale(0.25, 0.25).setFlipX(true).setDepth(1);
        logo.setScale(0.1, 0.1)
            .setPosition((this.GAME_WIDTH / 2), (logo.height * logo.scaleY) / 2);
       
        

        //this.keys = this.input.keyboard.addKeys('W,A,S,D');

        this.tweens.add({
            targets: logo,
            y: logo.y + 15,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });

       this.input.keyboard.addKey('D').on('down', this.goNext);
       this.input.keyboard.addKey('A').on('down', this.goPrevious);

       CampaignApi.APIgetLevels(this.campaignLevelCodes,true,true,true,true).then(levels => {
        this.campaignLevelData = levels;
        this.campaignLevelData.forEach((level, index) => {

            var orbPos = this.getLocForPlanet(index);

            this.add.sprite(orbPos.x, orbPos.y, 'level').setScale(0.5, 0.5);

            var text = this.add.text(orbPos.x- 50, orbPos.y+50, level.title as string).setScale(1, 1);
            text.setPosition(orbPos.x - (text.width/2), orbPos.y+50, 0);
        });
        
        this.sendShipToPlanet(0);
    })
    }

    update() {


    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 1920,
    height: 1080,
    scene: CampaignMap,
    parent: 'campaign-box',
    fps: {
        target: 60
    }
};

export const game = new Phaser.Game(config);