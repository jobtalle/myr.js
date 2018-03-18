/* Myriad - Cube example.
 *
 * This example serves to demonstrate the use of transformation in Myriad.
 */

function CubeExample() {
    this.rotation = 0;
    this.fps = 0;
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

        // Define a yellow transparent square surface half the size of the screen.
        var squareSize = this.screenHeight * 0.2;
        this.square = new this.myr.Surface(squareSize, squareSize);
        this.square.setClearColor(new this.myr.Color(1, .8, 0, 0.5));
        this.square.clear();

        // Kick-start the rendering loop.
        this.lastDate = new Date();
        this.animate();
    },
    
    /* Request an update for the next frame, update the logic, and call render. */
    animate: function() {
        requestAnimationFrame(this.animate.bind(this));

        var timeStep = this.getTimeStep();
        this.updateFPS(timeStep);
        this.update(timeStep);
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

    /* Update internal state. 
     * @param {float} timeStep - The time passed relative to the previous update.
     */
    update: function(timeStep) {
        this.rotation += timeStep;
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
        // Define w/h ratio for camera pitch at 35.2643, and the middle of the square.
        var scale = 0.5773;
        var mid = this.square.getWidth() / 2;

        // Draw top.
        this.myr.push();
        this.myr.translate(x, y);
        this.myr.scale(1, scale);
        this.myr.rotate(this.degToRad(45));
        this.myr.translate(-mid, -mid);
        this.square.draw(0, 0);
        this.myr.pop();

        // Determine properties of the top.
        var topWidth = mid * Math.sqrt(2);
        var topHeight = topWidth * 0.866;

        // Draw left.
        this.myr.push();
        this.myr.translate(x - topWidth / 2, y + topHeight);
        this.myr.rotate(this.degToRad(30));
        this.myr.scale(scale, 1);
        this.myr.rotate(this.degToRad(45));
        this.myr.translate(-mid, -mid);
        this.square.draw(0, 0);
        this.myr.pop();

        // Draw right.
        this.myr.push();
        this.myr.translate(x + topWidth / 2, y + topHeight);
        this.myr.rotate(this.degToRad(-30));
        this.myr.scale(scale, 1);
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
        this.renderCube(100 , 100);
        this.renderCube(170, 140);
        this.renderCube(240, 180);

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