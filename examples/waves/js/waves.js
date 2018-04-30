const Waves = function(myr) {
    const COLOR_CLEAR = new myr.Color(0.2, 0.3, 0.8);
    const COLOR_WATER = new myr.Color(0.6, 0.7, 1);
    const COLOR_DROPS = myr.Color.WHITE;
    const SLICE_WIDTH = 32;
    const SLICE_HEIGHT = 64;
    const DAMPING = 0.98;
    const SPRING = 0.8;
    const SPREAD = 0.7;
    const SPREAD_DISTANCE = 128;
    const HEIGHT = 200;
    const TIME_STEP_MAX = 0.5;
    
    const drops = [];
    const y = myr.getHeight() - HEIGHT;
    let lastDate = null;
    let displacements = new Array(Math.ceil(myr.getWidth() / SLICE_WIDTH) + 2);
    let momenta = new Array(displacements.length);
    
    for(let i = 0; i < displacements.length; ++i)
        displacements[i] = momenta[i] = 0;
    
    myr.setClearColor(COLOR_CLEAR);
    
    const Drop = function(x, y) {
        const GRAVITY = 0.35;
        const RADIUS = 10;
        const SPLASH_FORCE = 55;
        
        let ySpeed = 0;
        
        this.update = timeStep => {
            ySpeed += GRAVITY;
            y += ySpeed;
            
            if(y > getHeight(x)) {
                drops.splice(drops.indexOf(this), 1);
                
                splash(x, ySpeed * SPLASH_FORCE);
            }
        };
        
        this.render = () => {
            myr.primitives.fillCircle(COLOR_DROPS, x, y, RADIUS);
        };
    }
    
    const getHeight = x => {
        const leftIndex = Math.floor(x / SLICE_WIDTH);
        const left = displacements[leftIndex];
        const right = displacements[leftIndex + 1];
        
        return y + left + (right - left) * ((x - leftIndex * SLICE_WIDTH) / SLICE_WIDTH);
    };
    
    const splash = (x, force) => {
        for(let i = 0; i < momenta.length - 1; ++i)
            momenta[i] += force * Math.pow(20, -Math.pow(((SLICE_WIDTH * i) - x) / (force * 0.2), 2));
    };
    
    const getTimeStep = () => {
        const date = new Date();
        let timeStep = (date - lastDate) / 1000;
        
        if(timeStep < 0)
            timeStep += 1.0;
        else if(timeStep > TIME_STEP_MAX)
            timeStep = TIME_STEP_MAX;
        
        lastDate = date;
        
        return timeStep;
    };
    
    const update = timeStep => {
        for(let i = 0; i < drops.length; ++i)
            drops[i].update(timeStep);
        
        for(let i = 0; i < displacements.length; ++i) {
            momenta[i] = (momenta[i] - displacements[i] * SPRING) * DAMPING;
            
            for(let j = 0; j < SPREAD_DISTANCE / SLICE_WIDTH; ++j) {
                const intensity = ((SPREAD_DISTANCE - (j * SLICE_WIDTH)) / SPREAD_DISTANCE) * SPREAD;
                
                if(i - j >= 0 && i - j < displacements.length)
                    momenta[i - j] += (displacements[i] - displacements[i - j]) * intensity;
                
                if(i + j >= 0 && i + j < displacements.length)
                    momenta[i + j] += (displacements[i] - displacements[i + j]) * intensity;
            }
            
            displacements[i] += momenta[i] * timeStep;
        }
    };
    
    const render = () => {
        myr.bind();
        myr.clear();
        
        for(let i = 0; i < drops.length; ++i)
            drops[i].render();

        for(let i = 0; i < displacements.length - 1; ++i) {
            const x1 = i * SLICE_WIDTH;
            const x2 = x1 + SLICE_WIDTH;
            
            myr.primitives.drawTriangle(
                COLOR_WATER,
                x1, y + displacements[i],
                x1, myr.getHeight(),
                x2, myr.getHeight());
            myr.primitives.drawTriangle(
                COLOR_WATER,
                x2, myr.getHeight(),
                x2, y + displacements[i + 1],
                x1, y + displacements[i]);
            myr.primitives.drawLine(
                COLOR_DROPS,
                x1, y + displacements[i],
                x2, y + displacements[i + 1]);
        }
        
        myr.flush();
    };
    
    const animate = () => {
        requestAnimationFrame(animate.bind());
        
        update(getTimeStep());
        render();
    };
    
    this.drop = (x, y) => {
        drops.push(new Drop(x, y));
    };
    
    this.start = () => {
        lastDate = new Date();
        
        animate();
    };
}

const renderer = document.getElementById("renderer");
const waves = new Waves(new Myr(renderer));

renderer.addEventListener("click", function(event) {
    const rect = renderer.getBoundingClientRect();
    
    waves.drop(event.clientX - rect.left, event.clientY - rect.top);
});

waves.start();