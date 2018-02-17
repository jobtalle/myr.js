function MyrTest() {
    this.a = 0;
}

MyrTest.prototype = {
    start() {
        myr = new Myr(document.getElementById("renderer"));
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
        this.a += 0.03;
    },
    
    render() {
        this.surface.bind();
        this.surface.clear();
        
        myr.bind();
        myr.clear();
        
        this.surface.draw(Math.cos(this.a), 0);
        this.surface.draw(0, Math.sin(this.a));
        
        myr.flush();
    }
}

var test = new MyrTest();
test.start();