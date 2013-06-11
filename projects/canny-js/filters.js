
function createImageData(width, height) {
    var tmpCanvas = document.createElement('canvas');
    var tmpCtx = tmpCanvas.getContext('2d');
    return tmpCtx.createImageData(width, height);
};

/**
 * Loads an image into a Canvas 2d Context
 *
 * @param {string} src The path to the image
 * @param {Canvas 2d Context} destContext The destination context.
 * @param {int} top The top offset from the destination context for the loaded image.
 * @param {int} left The left offset from the destination context for the loaded image.
 * @param {int} width The width of the image being drawn on the destination context.
 * @param {int} height The height of the image being drawn on the destination context.
 */

function loadImage(src, destContext, top, left, width, height)
{
    var img = new Image();
    img.src = src;
    img.onload = function() {
        destContext.drawImage(img, 0, 0, width, height);
    };
}


/**
 * Convert a pair of x and y coordinates to the index of the first of the
 * four elements for that particular pixel in the image data. For example,
 * if you have a 100x100 image and you pass in x=34, y=56, the function
 * will return 22536, the position of the opacity value for the pixel at
 * position (34, 56).  The red, green, and blue values will be the
 * following three elements in the array.
 *
 * @param {int} x The horizontal position of the pixel.
 * @param {int} y The vertical position of the pixel.
 * @throws CoordinateError The x or y coordinate is out of range.
 * @return Index of the pixel's first element within the image data array.
 * @type int
 *
 * Awesome utility function from Mr. Matt Riggot - https://github.com/flother
 */

function convertCoordsToIndex(x, y, width, height) {

    if (x < 0 || x > width || y < 0 || y > height) {
        return false;
    }

    return (y * width * 4) + (x * 4);
}


//Generates a grid that we later sum with our current index to get relative neighbor positions.
//should be odd
function createMask(length, weights) {

    if(length < 2) return [{x: 0, y: 0, weight: 1}];

    var side = Math.max(Math.floor(length/2), 1);

    if( typeof weights !== 'array' && typeof weights === 'integer')
        weights = new Array(length*length);

    var mask = [];
    var counter = 0;
    for( var i = -side; i <= side; i++ )
        for( var j = -side; j <= side; j++) {
            var w = (typeof weights === 'number' ? weights : weights[counter])
            mask.push({x: j, y: i, weight: w});
            counter++;
        }

    return mask;
}

/**
 * Retrieves image data from a 2d context for a canvas element, 
 * applies a Gaussian blur filter to the data and writes the data to another 2d context.
 * The data taken from the source image is the pixels from (0, 0) to (width, height)
 *
 * @param {Canvas 2d Context} srcContext The source context, containing the source image.
 * @param {Canvas 2d Context} destContext The destination context.
 * @param {int} width The width of the area on the source image being processed.
 * @param {int} height The height of the area on the source image being processed.
 * @param {int} radius The radius of the Gaussian mask being applied.
 * @param {int} numPasses The number of times to process the data. 
 *               Multiple passes are linear and are more efficient than
 *               increasing the radius if trying to achieve a higher loss of detail.
 *
 * @return The runtime of the function in milliseconds.
 * @type int
 */
function blur(srcContext, destContext, width, height, radius, numPasses) {
    //start runtime
    var startTime = new Date();

    //Store our source data 
    var currentData = srcContext.getImageData(0, 0, width, height);

    //Create a new, blank, imageData object to store our output
    var newData  = destContext.createImageData(width, height);

    //The Gaussian mask we're using to calculate which neighbors per pixel to average.
    var mask = createMask(radius, 1);

    for( var pass = 0; pass < numPasses; pass++ ) {             //loop thru numPasses
        for( var y = 0; y < height; y++ ) {                     //loop thru rows
            for( var x = 0; x < width; x++ ) {                  //loop thru columns

                //store sums of alpha, red, green, blue values for all neighbors
                var sumRGBA = [0,0,0,0];

                //calculate number of neighbors for average calculation
                var numNeighbors = 0;

                //calculate average rgba values for surrounding neighbors per pixel
                for( var i = 0; i < mask.length; i++ ) {

                    //plug our x and y values into our mask to get the position of the neighbor pixels
                    var nX = mask[i].x + x;
                    var nY = mask[i].y + y;
                    var nW = mask[i].weight;

                    //neighbor pixel position of the alpha value; + 1 for red, + 2 for green etc.
                    var nCoords = convertCoordsToIndex(nX, nY, width, height);

                    //if the neighbor is not outside our image, add to sums.
                    if(nCoords !== false && nCoords < currentData.data.length) {

                        sumRGBA[0] += currentData.data[ nCoords + 0] * nW;
                        sumRGBA[1] += currentData.data[ nCoords + 1] * nW;
                        sumRGBA[2] += currentData.data[ nCoords + 2] * nW;
                        sumRGBA[3] += currentData.data[ nCoords + 3];

                        numNeighbors++;
                    }
                }

                //calculate the average alpha, red, green and blue values.
                var newR = sumRGBA[0] / numNeighbors;
                var newG = sumRGBA[1] / numNeighbors;
                var newB = sumRGBA[2] / numNeighbors;
                var newA = sumRGBA[3] / numNeighbors;

                //change new image pixel value- we don't want to start changing our current image before we've completely passed over it.
                var newCoords = convertCoordsToIndex(x, y, width, height);
                newData.data[ newCoords + 0] = newR;
                newData.data[ newCoords + 1] = newG;
                newData.data[ newCoords + 2] = newB;
                newData.data[ newCoords + 3] = newA;
            } //end of cols
        } //end of rows

        currentData = newData;
    } //end of passes
        
    //write currentData to destContext
    destContext.putImageData(newData, 0, 0);

    var endTime = new Date();
    return (endTime - startTime);
}

function grayscale(srcContext, destContext, width, height) {
    //start runtime
    var startTime = new Date();

    //Store our source data 
    var currentData = srcContext.getImageData(0, 0, width, height);

    //Create a new, blank, imageData object to store our output
    var newData  = destContext.createImageData(width, height);

    //Loop thru each pixel and calculate average red, green, blue values to convert to grayscale
    for( var y = 0; y < height; y++ ) {
        for( var x = 0; x < width; x++ ) {

            var coords = convertCoordsToIndex(x, y, width, height);
            var avg = parseInt(currentData.data[ coords ]) + parseInt(currentData.data[ coords + 1 ]) + parseInt(currentData.data[ coords + 2 ]);
            avg = avg / 3;
            newData.data[ coords + 0] = avg;
            newData.data[ coords + 1] = avg;
            newData.data[ coords + 2] = avg;
            newData.data[ coords + 3] = currentData.data[ coords + 3 ]
        }
    }

    //write currentData to destContext
    destContext.putImageData(newData, 0, 0);
    var endTime = new Date();
    return (endTime - startTime);
}

function convolute(srcCtx, dstCtx, width, height,  weightMatrix, useAlpha) {
    //Store our source data 
    var currentData = srcCtx.getImageData(0, 0, width, height);

    //Create a new, blank, imageData object to store our output
    var newData  = dstCtx.createImageData(width, height);

    //Loop thru each pixel and calculate average red, green, blue values to convert to grayscale
    for( var y = 0; y < height; y++ ) {
      for( var x = 0; x < width; x++ ) {

        var r = 0, g = 0, b = 0, a = 0;

        for( var i = 0; i < weightMatrix.length; i++ ) {

            //plug our x and y values into our mask to get the position of the neighbor pixels
            var nX = weightMatrix[i].x + x;
            var nY = weightMatrix[i].y + y;
            var nW = weightMatrix[i].weight;

            //neighbor pixel position of the alpha value; + 1 for red, + 2 for green etc.
            var nCoords = convertCoordsToIndex(nX, nY, width, height);

            //if the neighbor is not outside our image, add to sums.
            if(nCoords !== false && nCoords < currentData.data.length) {
                r += currentData.data[ nCoords + 0] * nW;
                g += currentData.data[ nCoords + 1] * nW;
                b += currentData.data[ nCoords + 2] * nW;
                a += currentData.data[ nCoords + 3] * nW;
            }
        }
        var coords = convertCoordsToIndex(x, y, width, height);
        newData.data[ coords + 0] = r;
        newData.data[ coords + 1] = g;
        newData.data[ coords + 2] = b;
        newData.data[ coords + 3] = (useAlpha ? a : currentData.data[ coords + 3]);
      }
    }

    dstCtx.putImageData(newData, 0, 0);

    return newData;
};

function doCanny(gaussianWidth, min, max) {
    //start runtime
    var startTime = new Date();

    //using a mask and convulute is sooo much faster.
    if(typeof gaussianWidth === "undefined" || typeof gaussianWidth !== "number" || isNaN(gaussianWidth)) {
        var blurMask = createMask(5, [0.012578616352201259, 0.025157232704402517, 0.031446540880503145, 0.025157232704402517, 0.012578616352201259, 0.025157232704402517, 0.05660377358490566, 0.07547169811320754, 0.05660377358490566, 0.025157232704402517, 0.031446540880503145, 0.07547169811320754, 0.09433962264150944, 0.07547169811320754, 0.031446540880503145, 0.025157232704402517, 0.05660377358490566, 0.07547169811320754, 0.05660377358490566, 0.025157232704402517, 0.012578616352201259, 0.025157232704402517, 0.031446540880503145, 0.025157232704402517, 0.012578616352201259])
        convolute(inCtx, outCtx, W, H, blurMask, false);
    }else{
        blur(inCtx, outCtx, W, H, gaussianWidth, 1);
    }

    grayscale(outCtx, outCtx, W, H);

    var finalImg = doSorbel({w: W, h: H, ctx: outCtx}, min, max)

    outCtx.putImageData(finalImg, 0, 0);

    var endTime = new Date();
    return (endTime - startTime);
}

function doSorbel(imgObj, min, max) {

    var w = imgObj.w;
    var h = imgObj.h;

    var vertical = createMask(3, 
        [-1, 0, 1,
         -2, 0, 2,
         -1, 0, 1 ]
    );

    var horizontal = createMask(3, 
        [ -1, -2, -1,
          0,  0,  0,
          1,  2,  1 ]
    );
    
    var finalImg = createImageData(w, h);
    var tmpCanvas = document.createElement('canvas');
    var tmpCtx = tmpCanvas.getContext('2d');

    var vData = convolute(imgObj.ctx, tmpCtx, w, h, vertical, false);
    var hData = convolute(imgObj.ctx, tmpCtx, w, h, horizontal, false);

    for (var i = 0; i < finalImg.data.length; i+=4) {

        var v = vData.data[i];
        var h = hData.data[i];

        h = (h !== 0 ? h : 1);
        var theta = Math.atan(v/h) * (180/Math.PI);
        var magnitude = Math.sqrt(Math.pow(v, 2) + Math.pow(h, 2));

        magnitude = magnitude < min ? min : magnitude
        magnitude = magnitude > max ? max : magnitude

        finalImg.data[i + 0] = magnitude;
        finalImg.data[i + 1] = magnitude;
        finalImg.data[i + 2] = magnitude;
        finalImg.data[i + 3] = 255; // opaque alpha
    }

    return finalImg;
}

function toASCII(srcContext, destContext, width, height, ftSize, radius) {
    //start runtime
    var startTime = new Date();

    //Store our source data 
    var currentData = srcContext.getImageData(0, 0, width, height);

    //Create a new, blank, imageData object to store our output
    var tmpCanvas = document.createElement('canvas');
    var tmpCtx = tmpCanvas.getContext('2d');
    var kernel = createMask(radius, (1/(radius * radius)))
    var avgData  = convolute(srcContext, tmpCtx, width, height, kernel, false)
    console.log(avgData)
    destContext.fillColor = "black";
    destContext.fillRect( 0, 0 , width , height );
    destContext.font = ftSize + "pt Terminal";

    //Loop thru each pixel and calculate average red, green, blue values to convert to grayscale
    for( var y = 0; y < height; y += radius ) {
        for( var x = 0; x < width; x+= radius ) {

            var coords = convertCoordsToIndex(x, y, width, height);
            var color = "rgb(" + avgData.data[coords + 0] + ", " + avgData.data[coords + 1] + ", " + avgData.data[coords + 2] + ")";

            var c = (avgData.data[coords + 0] + avgData.data[coords + 1] + avgData.data[coords + 2]) / 3
            c = Math.ceil(c + 33);
            c = Math.max(c, 33);
            c = Math.min(c, 255)

            if(c > 126 && c < 161)
                c = c + 35;

            var oldc = c;
            c = String.fromCharCode(c)
            //console.log(oldc + ' ' +c)
            destContext.fillStyle = color;
            destContext.fillText(c, x, y);

        }
    }

    var endTime = new Date();
    return (endTime - startTime);
}