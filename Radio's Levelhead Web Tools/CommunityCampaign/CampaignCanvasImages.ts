var imagesLoaded = false;

var WIDTH_DEFAULT = 50

interface IImageContainer {
    name: String
    width: number
    extension: String
    image: HTMLImageElement | undefined
    getHeight: () => number
}

interface ImageMap {
    images: Array<IImageContainer>
    getImageContainer: (x: String) => IImageContainer | undefined
    getImage: (x: String) => HTMLElement | undefined
    drawImage: (ctx: CanvasRenderingContext2D, imageName: String, xPos: number, yPos: number, rotation: number) => void
}

/**
 * contains an image and other necessary data
 */
 class ImageContainer implements IImageContainer {
    name: string = '';
    width: number = 0;
    extension: string = 'png';
    image: HTMLImageElement | undefined = undefined;
    /**
     * constructor for ImgeInfo
     * @param {String} name name of the image. will automatically get the image "Pictures/<name>.<extension>"
     * @param {number} width preferred width of the image. height will be scaled automatically. default is WIDTH_DEFAULT
     * @param {String} extension specifies file extension. png by default
     */
    constructor(name: string, width = 50, extension = "png"){
        /**@type {String} file name without extension */
        this.name = name;
        /**@type {number} desired width */
        this.width = width;
        /**@type {String} the picture's file extension */
        this.extension = extension
        /**@type {HTMLImageElement} Contains the image. must be loaded first, see loadImages() */
        this.image = undefined
    }
    
    /**
     * Returns the image's height based on the desired width
     * @returns {number} Scaled Height
     */
    getHeight() {
        if(this.image) {
            return this.image.height * (this.width/this.image.width)
        }
        return 0;
    }
    
}

export default class CampaignCanvasImages {
    /**
     * Manages the images used for the canvas.
     */
    MapImages: ImageMap = {
        /**@type {Array<IImageContainer>} array with ImageContainers.*/
        images: [],
        /**
         * Returns an image container based on its name
         * @param {String} name Name of the image (filename without extension)
         * @returns {IImageContainer | undefined} The desired ImageContainer. if name could not be found, returns undefined
         */
        getImageContainer:function(name: String){
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
        },
        /**
         * Draws and image on a canvas
         * @param {CanvasRenderingContext2D} ctx Context of the canvas
         * @param {String} imageName Name of the image
         * @param {number} xPos x-position of the image
         * @param {number} yPos y-position of the image
         * @param {number} rotation rotation of the  (in radiant)
         */
        drawImage:function(ctx, imageName, xPos=0, yPos=0, rotation=0){
            
            var imageContainer = this.getImageContainer(imageName)
            if(imageContainer) {
                //ctx.translate(-imageContainer.width/2,-imageContainer.getHeight()/2)
                ctx.translate(xPos + imageContainer.width/2, yPos + imageContainer.getHeight()/2)
                ctx.rotate(rotation)
                ctx.translate(-xPos + -imageContainer.width/2, -yPos + -imageContainer.getHeight()/2)
                //ctx.translate(imageContainer.width/2, imageContainer.getHeight()/2)
                ctx.drawImage(imageContainer.image as CanvasImageSource, xPos, yPos, imageContainer.width, imageContainer.getHeight())
                ctx.restore()
            }
        }
    }



    /**
     * Wrapper for imageInfo constructor
     * @param {String} name name of image
     * @param {number} width width of image, height will be scaled automatically
     * @param {String | undefined} extension file extension
     * @returns A new Image Container.
     */
    mkimg = (name: string, width: number, extension: string | undefined = undefined): IImageContainer => {
        return new ImageContainer(name,width, extension)
    }

    mapImageInfo: Array<IImageContainer> = [
        this.mkimg("ship", 50),
        this.mkimg("GR-18_Package_BG", 100)
    ]

    /**
     * Loads images based on the content of the mapImageInfo array
     */
     loadImages = async () => {
        /**@type {Array<Promise>} stores the promises that will contain the image data*/
        var imagePromises: Array<Promise<any>> = []

        this.mapImageInfo.forEach(imageContainer => {
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
        //Wait for images to be loaded
        try {
            var loadedImages = await Promise.all(imagePromises)
                
            loadedImages.forEach(entry => {
                entry.dest.image = entry.img
                this.MapImages.images.push(entry.dest)
            })
        } catch(err) {
            console.error(err);
        }
    }
}