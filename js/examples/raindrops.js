function RaindropExample() {
    this.dropSpeed = 300;
    this.raindrops = [];
    this.fps = 0;
}

RaindropExample.prototype = {
    /* Initialize Myr and load the required surface. */
     start: function() {
        var canvas = document.getElementById("renderer");
        this.myr = new Myr(canvas);
        this.myr.setClearColor(new this.myr.Color(0, 0, 0));

        // Store the canvas size for positioning the rain correctly.
        this.screenWidth = canvas.width;
        this.screenHeight = canvas.height;

        // Get the image of the raindrop and make it a surface.
        this.raindrop = new this.myr.Surface("https://raw.githubusercontent.com/Lukeslux/myr.js/develop/sprites/raindrop.png");

        // Kick-start the rendering loop.
        this.lastDate = new Date();
        this.animate();
    },

    /* Adds another coordinate to the raindrop array. */
    addRaindrop: function() {
        var x = Math.random() * this.screenWidth;
        var y = Math.random() * this.screenHeight;
        this.raindrops.push([x,y]);
    },

    /* Return the total amount of raindrops on the screen. */
    numRaindrops: function () {
        return this.raindrops.length;
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
        for (var i = 0; i < this.raindrops.length; i++) {
            // Move the raindrops, we use modulo to move at different speeds.
            var speedMod = (i % 4 + 1);
            this.raindrops[i][1] += timeStep * this.dropSpeed / speedMod;

            // If the raindrop is outside the screen, we reset the position to the top.
            if (this.raindrops[i][1] - this.raindrop.getHeight() > this.screenHeight)
            {
                this.raindrops[i][1] = -this.raindrop.getHeight();
            }
        }
    },

    /* Render to the canvas. */
    render: function() {
        this.myr.bind();
        this.myr.clear();

        for (var i = 0; i < this.raindrops.length; i++)
            this.raindrop.draw(this.raindrops[i][0], this.raindrops[i][1]);
        
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
var example = new RaindropExample();
example.start();

// Start the fps and raindrop count plot.
var fpsPlot = new SmoothieChart({tooltip:true});
fpsPlot.streamTo(document.getElementById("fpsPlot"), 1000);
var countPlot = new SmoothieChart({tooltip:true, interpolation:'linear'});
countPlot.streamTo(document.getElementById("countPlot"), 1000);
var fpsLine = new TimeSeries();
var countLine = new TimeSeries();

// Add the fps value to the line every second
setInterval(function() {
    fpsLine.append(new Date().getTime(), example.getFPS());
}, 1000);

// Add a raindrop every 0.1 second, unless the fps dips below 21.
setInterval(function() {
    if (example.getFPS() > 20)
        example.addRaindrop();
    countLine.append(new Date().getTime(), example.numRaindrops());
}, 100);

// Add to SmoothieChart
fpsPlot.addTimeSeries(fpsLine);
countPlot.addTimeSeries(countLine);