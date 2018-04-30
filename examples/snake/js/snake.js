const Snake = function(myr) {
    const update = timeStep => {
        
    };
    
    const render = () => {
        
    };
    
    this.start = () => {
        myr.utils.loop(function(timeStep) {
            update(timeStep);
            render();
            
            return true;
        });
    };
}

const renderer = document.getElementById("renderer");
const snake = new Snake(new Myr(renderer));

snake.start();