function MyrTest() {
    
}

MyrTest.prototype = {
    start() {
        myr.initialize(document.getElementById("renderer"));
        myr.setClearColor(new myr.Color(0.2, 0.5, 0.2));
        
        this.surface = new myr.Surface(200, 200);
        this.surface.setClearColor(new myr.Color(0.5, 0, 0));
        
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
        this.surface.bind();
        this.surface.clear();
        
        myr.bind();
        myr.clear();
    }
}

var test = new MyrTest();
test.start();