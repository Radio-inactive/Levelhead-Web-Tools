import 'phaser';
import { CampaignApi }  from './CampaignAPI';

export default class CampaignMap extends Phaser.Scene {

    GAME_WIDTH = 1920;
    GAME_HEIGHT = 1080;
    
    SHIP_VELOCITY = 5;

    keys: any = null;
    ship: Phaser.GameObjects.Sprite | null = null;
    shipLevelindex = 0;

    campaignLevelData: CampaignApi.Level[] = []

    bgLayer: Phaser.GameObjects.Layer | null = null;
    fgLayer: Phaser.GameObjects.Layer | null = null;


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

        this.ship?.setFlipX(pos.x > this.ship.x)

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


    getLocForPlanet = (index: number): Phaser.Math.Vector2 => {
        const rowCount = 1;
        var col = index;
        var row = 1;
        var xMargin = 300;
        var yMargin = 250;

        var xPadding = 350;
        var yPadding = 250;

        return new Phaser.Math.Vector2((xMargin * col) + xPadding, (row * yMargin) + yPadding);
    }

    drawLinesBetweenOrbs(orbA: Phaser.Math.Vector2, orbB: Phaser.Math.Vector2) {
        var currPos = new Phaser.Math.Vector2(orbA.x, orbA.y)
        var dashDist = 50;
        var direction = new Phaser.Math.Vector2(orbB.x, orbB.y).subtract(orbA).normalize().scale(dashDist);
        
        currPos.add(direction)
        var cnt = 0;
        //don't let this go forever
        while(currPos.distance(orbB) >= dashDist && cnt < 100) {
            cnt++;
            this.add.sprite(currPos.x, currPos.y, `path1`);
            currPos.add(direction)
        }

    }

    preload () {
        this.load.image('background', 'backgrounds/campaign_BG.png');
        this.load.image('logo', 'logos/CC_logo.png');
        this.load.image('ship', 'ship.png')
        this.load.image('level', 'levelorbs/levelorb_unbeaten.png')
        this.load.image('path1', 'starpath1.png');
        this.load.image('path2', 'starpath2.png');
    }

    create () {
        const bg = this.add.image(0, 0, 'background').setOrigin(0,0).setScrollFactor(0);
        const logo = this.add.image(100, 140, 'logo').setScrollFactor(0);
        this.ship = this.add.sprite(200, 500,'ship').setScale(0.25, 0.25).setFlipX(true).setDepth(1);
        logo.setScale(0.1, 0.1)
            .setPosition((this.GAME_WIDTH / 2), (logo.height * logo.scaleY) / 2);

        this.fgLayer = this.add.layer();
        this.fgLayer.add([ this.ship ])
        this.fgLayer.setDepth(1);

        this.bgLayer = this.add.layer();
        this.bgLayer.add([ bg, logo])

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

            var orb = this.add.sprite(orbPos.x, orbPos.y, 'level').setScale(0.5, 0.5);

            var text = this.add.text(orbPos.x- 50, orbPos.y+50, level.title as string).setScale(1, 1);

            //this.fgLayer.add([ orb, text])

            text.setPosition(orbPos.x - (text.width/2), orbPos.y+50, 0);
            if(index >= 1) {
                this.drawLinesBetweenOrbs(this.getLocForPlanet(index-1), this.getLocForPlanet(index))
            }

        });
        
        this.sendShipToPlanet(0);
        this.cameras.main.startFollow(this.ship);
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