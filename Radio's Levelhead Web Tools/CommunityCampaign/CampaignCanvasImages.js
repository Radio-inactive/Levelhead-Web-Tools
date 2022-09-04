var imagesLoaded = false;

var WIDTH_DEFAULT = 50

/**
 * Manages the images used for the canvas.
 */
var MapImages = {
    /**@type {Array<ImageContainer>} array with ImageContainers.*/
    images:[],
    /**
     * Returns an image container based on its name
     * @param {String} name Name of the image (filename without extension)
     * @returns {ImageContainer | undefined} The desired ImageContainer. if name could not be found, returns undefined
     */
    getImageContainer:function(name){
        return this.images.find(entry => entry.name == name)
    },
    /**
     * Returns an image based on its name
     * @param {String} name Name of the image (filename without extension)
     * @returns {HTMLImageElement | undefined} returns desired image. returns null if name could not be found
     */
    getImage:function(name){
        var container = this.getImageContainer(name)
        if(container)
            return container.image
        else
            return undefined
    }
}

/**
 * contains an image and other necessary data
 */
class ImageContainer {
    /**
     * constructor for ImgeInfo
     * @param {String} name name of the image. will automatically get the image "Pictures/<name>.<extension>"
     * @param {Number} width preferred width of the image. height will be scaled automatically. default is WIDTH_DEFAULT
     * @param {String} extension specifies file extension. png by default
     */
    constructor(name, width = 50, extension = "png"){
        /**@type {String} file name without extension */
        this.name = name;
        /**@type {Number} desired width */
        this.width = width;
        /**@type {String} the picture's file extension */
        this.extension = extension
        /**@type {HTMLImageElement} Contains the image. must be loaded first, see loadImages() */
        this.image = null

    }
    
}

/**
 * Wrapper for imageInfo constructor
 * @param {String} name name of image
 * @param {Number} width width of image, height will be scaled automatically
 * @param {String} extension file extension
 * @returns A new Image Container.
 */
function mkimg(name, width, extension){
    return new ImageContainer(name,width, extension)
}

var mapImageInfo = [
    mkimg("ship", 50),
    mkimg("GR-18_Package_BG", 100)
]

/**
 * Loads images based on the content of the mapImageInfo array
 */
function loadImages(){
    /**@type {Array<Promise>} stores the promises that will contain the image data*/
    var imagePromises = []

    mapImageInfo.forEach(imageContainer => {
        imagePromises.push(
            new Promise((resolve,reject) => {
                var image = new Image()
                //resolves promise if image is loaded
                image.onload = () => resolve({
                    /**Destination Container for the image */
                    dest:imageContainer,
                    /**the loaded image */
                    img:image
                })
                image.onerror = reject
                image.src = `Pictures/${imageContainer.name}.${imageContainer.extension}`
            })
        )
    })
    Promise.all(imagePromises).then(function(loadedImages){
        loadedImages.forEach(entry => {
            entry.dest.image = entry.img
            MapImages.images.push(entry.dest)
        })
        console.log(MapImages, MapImages.getImage("ship"))
        loadWorldMap();
    })
}