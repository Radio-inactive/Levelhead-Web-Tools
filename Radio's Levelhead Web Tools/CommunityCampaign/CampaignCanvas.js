
function loadCanvas(){}

/**
 * loads the world map. is executed when all images are loaded
 */
function loadWorldMap(){
    var canvas = document.getElementById("campaignCanvas");
    var ctx = canvas.getContext("2d");
    var spaceshipImg = MapImages.getImage("ship")
    console.log(spaceshipImg.height, spaceshipImg.width)
    ctx.drawImage(spaceshipImg,0,0,spaceshipImg.width*0.5,spaceshipImg.height*0.5)
}