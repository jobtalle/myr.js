const Waves = function(myr) {
    const CLEAR_COLOR = new myr.Color(0.2, 0.3, 0.8);
    const SLICE_WIDTH = 32;
    const SLICE_HEIGHT = 64;
    const CURRENT = 48;
    const DAMPING = 0.98;
    const SPRING = 0.8;
    const SPREAD = 0.7;
    const SPREAD_DISTANCE = 128;
    const HEIGHT = 200;
    const TIME_STEP_MAX = 0.5;
    
    const slice = new myr.Surface("img/slice.png", SLICE_WIDTH, SLICE_HEIGHT);
    const sliceAnimated = new myr.Surface(SLICE_WIDTH, SLICE_HEIGHT);
    const drops = [];
    const y = myr.getHeight() - HEIGHT;
    let sliceX = 0;
    let lastDate = null;
    let displacements = new Array(Math.ceil(myr.getWidth() / SLICE_WIDTH) + 2);
    let momenta = new Array(displacements.length);
    
    for(let i = 0; i < displacements.length; ++i)
        displacements[i] = momenta[i] = 0;
    
    myr.setClearColor(CLEAR_COLOR);
    
    const Drop = function(x, y) {
        const GRAVITY = 0.35;
        const COLOR = myr.Color.WHITE;
        const RADIUS = 10;
        const SPLASH_FORCE = 45;
        
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
            myr.primitives.drawCircle(COLOR, x, y, RADIUS);
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
        sliceX += timeStep * CURRENT;
        
        if(sliceX > SLICE_WIDTH)
            sliceX -= SLICE_WIDTH;
        
        for(let i = 0; i < drops.length; ++i)
            drops[i].update(timeStep);
        
        for(let i = 0; i < displacements.length; ++i) {
            momenta[i] = (momenta[i] - displacements[i] * SPRING) * DAMPING;
            
            for(let j = 0; j < SPREAD_DISTANCE / SLICE_WIDTH; ++j) {
                const intensity = ((SPREAD_DISTANCE - (j * SLICE_WIDTH)) / SPREAD_DISTANCE) * SPREAD;
                
                momenta[i - j] += (displacements[i] - displacements[i - j]) * intensity;
                momenta[i + j] += (displacements[i] - displacements[i + j]) * intensity;
            }
            
            displacements[i] += momenta[i] * timeStep;
        }
    };
    
    const render = () => {
        sliceAnimated.bind();
        sliceAnimated.clear();
        
        slice.draw(sliceX - SLICE_WIDTH, 0);
        slice.draw(sliceX, 0);
        
        myr.bind();
        myr.clear();
        
        for(let i = 0; i < drops.length; ++i)
            drops[i].render();
        
        for(let i = 0; i < displacements.length - 1; ++i)
            sliceAnimated.drawSheared(
                i * SLICE_WIDTH,
                y + displacements[i],
                0,
                (displacements[i + 1] - displacements[i]) / SLICE_HEIGHT);
        
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