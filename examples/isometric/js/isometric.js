const Isometric = function(myr) {
    const CLEAR_COLOR = myr.Color.BLUE;
    const blocks = new myr.Surface("img/blocks.png", 128, 32);

    let axis = Math.PI / 4;

    myr.setClearColor(CLEAR_COLOR);

    const Block = function() {
        this.render = () => {
            
        };
    };
    
    const update = timeStep => {

    };

    const render = () => {
        myr.bind();
        myr.clear();
        
        myr.flush();
    };

    this.start = () => {
        myr.utils.loop(function(timeStep) {
            update(timeStep);
            render();

            return true;
        });
    };
};

const renderer = document.getElementById("renderer");
const isometric = new Isometric(new Myr(renderer));

isometric.start();