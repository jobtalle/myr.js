function RaindropExample() {
    this.NUM_RAINDROPS = 1000;

    this.dropSpeed = 300;
    this.fps = 0;
}

RaindropExample.prototype = {
    /* Initialize Myr and load the required surface. */
    start() {
        canvas = document.getElementById("renderer");
        myr = new Myr(canvas);
        myr.setClearColor(new myr.Color(0, 0, 0));

        // Store the canvas size for positioning the rain correctly.
        this.screenWidth = canvas.width;
        this.screenHeight = canvas.height;

        // Get the image of the raindrop and make it a surface.
        this.raindrop = new myr.Surface("https://raw.githubusercontent.com/Lukeslux/myr.js/develop/sprites/raindrop.png");

        // Initialize an array of y coordinates.
        var spawnRange = this.screenHeight;
        this.raindropXLocations = Array.apply(null,
                                  Array(this.NUM_RAINDROPS)).map(function (y, index) {
                                      return 2 * Math.random() * spawnRange - spawnRange;
                                  });


        // Kickstart the rendering loop.
        this.lastDate = new Date();
        this.animate();
    },
    
    /* Request an update for the next frame, update the logic, and call render. */
    animate() {
        requestAnimationFrame(this.animate.bind(this));

        var timeStep = this.getTimeStep();
        this.updateFPS(timeStep);
        this.update(timeStep);
        this.render();
    },
    
    /* Return the passed time relative to the previous time this method has been called. */
    getTimeStep() {
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
    update(timeStep) {
        for (var i = 0; i < this.raindropXLocations.length; i++) {
            // Move the waterdrops, we use modulo to move at different speeds.
            var speedMod = (i % 4 + 1);
            this.raindropXLocations[i] += timeStep * this.dropSpeed / speedMod;

            // If the raindrop is outside the screen, we reset the position to the top.
            if (this.raindropXLocations[i] - this.raindrop.getHeight() > this.screenHeight)
            {
                this.raindropXLocations[i] = -this.raindrop.getHeight();
            }
        }
    },
    

    /* Render to the canvas. */
    render() {
        myr.bind();
        myr.clear();

        var xStep = this.screenWidth / this.raindropXLocations.length;
        for (var i = 0; i < this.raindropXLocations.length; i++) {
            this.raindrop.draw(i * xStep, this.raindropXLocations[i]);
        }
        
        myr.flush();
    },

    /* Update the current fps.*/
    updateFPS(timeStep) {
        this.fps = 1 / timeStep;
    },

    /* Return the fps. */
    getFPS() {
        return this.fps;
    }
}

// Start the game.
var example = new RaindropExample();
example.start();

// Start the fps plot.
var smoothie = new SmoothieChart({tooltip:true});
smoothie.streamTo(document.getElementById("fpsPlot"), 1000);
var fpsLine = new TimeSeries();

// Add the fps value to the line every second
setInterval(function() {
    fpsLine.append(new Date().getTime(), example.getFPS());
}, 1000);

// Add to SmoothieChart
smoothie.addTimeSeries(fpsLine);