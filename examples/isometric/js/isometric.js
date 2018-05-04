const Isometric = function(myr) {
    const Texture = function(roof, sides) {
        this.getRoof = () => roof;
        this.getSide = side => sides[side % sides.length];
    };

    const Block = function() {
        const texture = textures[Math.floor(Math.random() * textures.length)];

        this.render = () => {
            texture.getRoof().drawTransformedAt(0, 0, tRoof);
            texture.getRoof().drawTransformedAt(0, -16, tRoof);
        };
    };
    
    const setTransforms = (angle, pitch) => {
        tRoof.identity();
        tRoof.scale(1, 0.5);
        tRoof.rotate(angle);
    };

    const update = timeStep => {
        angle += timeStep;

        if(angle > Math.PI * 2)
            angle -= Math.PI * 2;

        setTransforms(angle, 0.5);
    };

    const render = () => {
        myr.bind();
        myr.clear();
        myr.push();

        myr.translate(myr.getWidth() / 2, myr.getHeight() / 2);
        myr.scale(2, 2);

        for(let i = 0; i < blocks.length; ++i)
            blocks[i].render();

        myr.pop();
        myr.flush();
    };

    const generate = () => {
        blocks.push(new Block());
    };

    this.start = () => {
        generate();

        myr.utils.loop(function(timeStep) {
            update(timeStep);
            render();

            return true;
        });
    };

    const sprites = new myr.Surface("img/blocks.png", 128, 32);
    myr.register("roof", myr.makeSpriteFrame(sprites, 0, 0, 32, 32, 16, 16, 0));
    myr.register("wall1", myr.makeSpriteFrame(sprites, 32, 0, 32, 32, 0, 0, 0));
    myr.register("wall2", myr.makeSpriteFrame(sprites, 64, 0, 32, 32, 0, 0, 0));
    myr.register("wall3", myr.makeSpriteFrame(sprites, 96, 0, 32, 32, 0, 0, 0));

    const CLEAR_COLOR = new myr.Color(0.2, 0.8, 0.5);
    const tRoof = new myr.Transform();
    const tWalls = [new myr.Transform(), new myr.Transform(), new myr.Transform(), new myr.Transform()];
    const blocks = [];
    const textures = [
        new Texture(
            new myr.Sprite("roof"),
            [
                new Texture(new myr.Sprite("wall1")),
                new Texture(new myr.Sprite("wall2")),
                new Texture(new myr.Sprite("wall3"))
            ]
        )
    ];

    let angle = Math.PI / 4;

    myr.setClearColor(CLEAR_COLOR);
};

const renderer = document.getElementById("renderer");
const isometric = new Isometric(new Myr(renderer));

isometric.start();