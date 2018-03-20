/* Myriad - Cube example.
 *
 * This example serves to demonstrate the use of transformation in Myriad.
 * It draws an isometric tower using cubes, which are constructed from transformed squares.
 */

function CubeExample() {
    this.fps = 0;

    // Define a simple 3D house in a grid.
    this.map = [[[1, 1, 1, 1, 1],
                 [1, 0, 0, 0, 1],
                 [1, 0, 0, 0, 1],
                 [1, 0, 0, 0, 1],
                 [1, 1, 1, 1, 1]],
                [[1, 1, 0, 1, 1],
                 [1, 0, 0, 0, 1],
                 [0, 0, 0, 0, 0],
                 [1, 0, 0, 0, 1],
                 [1, 1, 0, 1, 1]],
                [[1, 1, 1, 1, 1],
                 [1, 0, 0, 0, 1],
                 [1, 0, 0, 0, 1],
                 [1, 0, 0, 0, 1],
                 [1, 1, 1, 1, 1]],
                [[1, 0, 1, 0, 1],
                 [0, 0, 0, 0, 0],
                 [1, 0, 0, 0, 1],
                 [0, 0, 0, 0, 0],
                 [1, 0, 1, 0, 1]]];
}

CubeExample.prototype = {
    /* Initialize Myr and load the required surface. */
     start: function() {
        var canvas = document.getElementById("renderer");
        this.myr = new Myr(canvas);
        this.myr.setClearColor(new this.myr.Color(0, 0, 0));

        // Store the canvas size for positioning the rain correctly.
        this.screenWidth = canvas.width;
        this.screenHeight = canvas.height;

        // Define a square brick surface and its shadow.
        var squareSize = 32;
        this.square = new this.myr.Surface("./brick.png");
        this.shadeSquare = new this.myr.Surface(squareSize, squareSize);
        this.shadeSquare.setClearColor(new this.myr.Color(0, 0, 0, 0.8));
        this.shadeSquare.clear();

        // Define the isometric scale and the dimensions of the cube's upper square.
        this.isoScale = 0.5773;
        this.cubeTopWidth = squareSize * Math.sqrt(2);
        this.cubeTopHeight = this.cubeTopWidth * this.isoScale;

        // Kick-start the rendering loop.
        this.lastDate = new Date();
        this.animate();
    },
    
    /* Request an update for the next frame, update the logic, and call render. */
    animate: function() {
        requestAnimationFrame(this.animate.bind(this));

        var timeStep = this.getTimeStep();
        this.updateFPS(timeStep);
        this.render();
    },
    
    /* Return the passed time relative to the previous time this method has been called. */
    getTimeStep: function() {
        var date = new Date();
        var timeStep = (date - this.lastDate) / 1000;
        
        if(timeStep < 0)
            timeStep += 1.0;
        
        this.lastDate = date;
        
        return timeStep;
    },

    /* Convert a degree to radians.
     * @param {float} degree - The degrees.
     */
    degToRad: function(degree) {
      return degree / 180 * Math.PI;
    },

    /* Constructs an isometric cube. Does not flush!
     * @param {float} x - The X position.
     * @param {float} y - The Y position.
     */
    renderCube: function (x, y) {
        var mid = this.square.getWidth() / 2;

        // Draw top.
        this.myr.push();
        this.myr.translate(x, y);
        this.myr.scale(1, this.isoScale);
        this.myr.rotate(this.degToRad(45));
        this.myr.translate(-mid, -mid);
        this.square.draw(0, 0);
        this.myr.pop();

        // Draw left.
        this.myr.push();
        this.myr.translate(x - this.cubeTopWidth / 4, y + this.cubeTopHeight * 3/4);
        this.myr.rotate(this.degToRad(30));
        this.myr.scale(this.isoScale, 1);
        this.myr.rotate(this.degToRad(45));
        this.myr.translate(-mid, -mid);
        this.square.draw(0, 0);
        this.shadeSquare.draw(0, 0);
        this.myr.pop();

        // Draw right.
        this.myr.push();
        this.myr.translate(x + this.cubeTopWidth / 4, y + this.cubeTopHeight * 3/4);
        this.myr.rotate(this.degToRad(-30));
        this.myr.scale(this.isoScale, 1);
        this.myr.rotate(this.degToRad(45));
        this.myr.translate(-mid, -mid);
        this.square.draw(0, 0);
        this.myr.pop();
    },

    /* Render to the canvas. */
    render: function() {
        // We declare that we want to draw to the canvas, and clear it with the clear color.
        this.myr.bind();
        this.myr.clear();

        // Render a grid of cubes.
        var shiftX = this.cubeTopWidth / 2;
        var shiftY = (this.map.length + this.map[0].length) * this.cubeTopHeight / 2;

        for (var slice = 0; slice < this.map.length; slice++)
            for (var row = 0; row < this.map[slice].length; row++)
                for (var col = this.map[slice][row].length; col >= 0; col--)
                    if (this.map[slice][row][col]) {
                        var x = (row + col) * this.cubeTopWidth  / 2;
                        var y = (row - col) * this.cubeTopHeight / 2 -
                                slice * this.cubeTopHeight;
                        this.renderCube(shiftX + x , shiftY + y);
                    }

        // Flush all render requests such that we actually see our cube.
        this.myr.flush();
    },

    /* Update the current fps.*/
    updateFPS: function(timeStep) {
        this.fps = 1 / timeStep;
    },

    /* Return the fps. */
    getFPS: function() {
        return this.fps;
    }
};

// Start the game.
var example = new CubeExample();
example.start();

// Start the fps plot.
var fpsPlot = new SmoothieChart({tooltip:true});
fpsPlot.streamTo(document.getElementById("fpsPlot"), 1000);
var fpsLine = new TimeSeries();

// Add the fps value to the line every second
setInterval(function() {
    fpsLine.append(new Date().getTime(), example.getFPS());
}, 1000);

// Add to SmoothieChart
fpsPlot.addTimeSeries(fpsLine);