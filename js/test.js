function MyrTest() {
    
}

MyrTest.prototype = {
    start() {
        myr.initialize(document.getElementById("renderer"));
        myr.clearColor(new myr.Color(1, 0.5, 0.2));
        
        this.lastDate = new Date();
        this.animate();
    },
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        this.update(this.getTimeStep());
        this.render();
    },
    
    getTimeStep() {
        var date = new Date();
        var timeStep = (date - this.lastDate) / 1000;
        
        if(timeStep < 0)
            timeStep += 1.0;
        
        this.lastDate = date;
        
        return timeStep;
    },
    
    update(timeStep) {
        
    },
    
    render() {
        myr.clear();
    }
}

var test = new MyrTest();
test.start();