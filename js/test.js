function MyrTest() {
    this.a = 0;
}

MyrTest.prototype = {
    start() {
        myr = new Myr(document.getElementById("renderer"));
        myr.setClearColor(new myr.Color(0.2, 0.2, 0.5));
        
        this.sheet = new myr.Surface("sprites/spritesheet.png", 154, 17);
        
        for(let i = 0; i < sheet.length; ++i) {
            const sprite = sheet[i];
            
            myr.register(
                sprite.name,
                myr.makeSpriteFrame(this.sheet, sprite.x, sprite.y, sprite.width, sprite.height, 7, 5, 0.3)
            );
        }
        
        let frames = [];
        
        for(let i = 0; i < 12; ++i)
            frames.push(myr.makeSpriteFrame(this.sheet, i * 14, 0, 14, 7, 0, 0, 0.1));
        
        myr.register(
            "sparky",
            ...frames);
        
        this.sprite = new myr.Sprite("biemer_green");
        this.sparky = new myr.Sprite("sparky");
        this.surface = new myr.Surface(200, 200);
        
        this.fish = new myr.Surface("https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png");
        
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
        
        this.sparky.animate(timeStep);
    },
    
    render() {
        myr.bind();
        
        myr.push();
        myr.rotate(0.1);
        myr.clear();
        
        this.surface.draw(Math.cos(this.a) * 200 + 200, 200);
        
        myr.push();
        myr.translate(200, 200);
        myr.scale(2, 2);
        
        this.surface.draw(100, 100);
        
        myr.pop();
        
        this.surface.drawSheared(200, Math.sin(this.a) * 200 + 200, 0, 1);
        
        myr.pop();
		
        let t = new myr.Transform();
        t.translate(40, 40);
        t.shear(0.2, 0);
        
        this.fish.drawPartTransformed(t,
                           this.fish.getWidth() / 4,
                           this.fish.getHeight() / 4,
                           this.fish.getWidth() / 2,
                           this.fish.getHeight() / 2);
        
        this.sprite.draw(20, 50);
        this.sprite.draw(20, 70);
        myr.primitives.drawLine(myr.Color.WHITE, 0, 0, myr.getWidth(), myr.getHeight());
        
        for(let i = 50; i < myr.getHeight(); i += 100)
            myr.primitives.drawCircle(myr.Color.RED, myr.getWidth() / 2, myr.getHeight() / 2, i);
        
        myr.push();
        myr.translate(300, 300);
        myr.rotate(this.a);
        myr.translate(-150, -100);
        myr.primitives.drawRectangle(myr.Color.CYAN, 0, 0, 300, 200);
        myr.pop();
        
        this.sprite.drawScaledRotated(100, 100, 5, 5, Math.cos(this.a) * 4);
        
        t.identity();
        t.translate(10, 150);
        t.scale(5, 5);
        this.sparky.drawPartTransformed(t, 0, 0, 7, 7);
        
        t.translate(7, 0);
        this.sparky.drawPartTransformed(t, 7, 0, 7, 7);
        
        myr.flush();
        
        this.surface.bind();
        this.surface.clear();
        this.fish.draw((this.surface.getWidth() -this.fish.getWidth()) / 2, (this.surface.getHeight() -this.fish.getHeight()) / 2);
    }
}

var test = new MyrTest();
test.start();