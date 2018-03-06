function MyrTest() {
    this.a = 0;
}

MyrTest.prototype = {
    start() {
        myr = new Myr(document.getElementById("renderer"));
        myr.setClearColor(new myr.Color(0.2, 0.5, 0.7));
        
        this.surface = new myr.Surface(32, 32);
        
        this.raindrop = new myr.Surface("https://raw.githubusercontent.com/Lukeslux/myr.js/develop/sprites/raindrop.png");
        
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
        this.a += 0.01;
    },
    
    render() {
        myr.bind();
        myr.push();
        myr.rotate(0.1);
        myr.clear();
        
        this.surface.draw(Math.cos(this.a) * 200 + 200, 200);
        
        myr.push();
        myr.translate(200, 200);
        myr.scale(0.2, 0.2);
        
        this.surface.draw(100, 100);
        
        myr.pop();
        
        this.surface.draw(200, Math.sin(this.a) * 200 + 200);
        
        myr.pop();
        
        this.raindrop.draw(10, 10);
        
        this.surface.bind();
        this.surface.clear();
        this.raindrop.draw((this.surface.getWidth() -this.raindrop.getWidth()) / 2, (this.surface.getHeight() -this.raindrop.getHeight()) / 2);
        
        myr.bind();
        this.raindrop.draw(15, 15);
        
        myr.flush();
    }
}

var test = new MyrTest();
test.start();
