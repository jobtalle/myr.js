const Isometric = function(myr) {
    const Texture = function(roof, sides) {
        this.getRoof = () => roof;
        this.getSide = side => sides[side % sides.length];
    };

    const Block = function() {
        const texture = textures[Math.floor(Math.random() * textures.length)];

        this.render = () => {
            //texture.getRoof().drawTransformedAt(0, 0, tRoof);
            /*
            for(let i = 0; i < backWalls.length; ++i)
                texture.getSide(backWalls[i]).drawTransformedAt(0, 0, tWalls[backWalls[i]]);
            */
            for(let i = 0; i < frontWalls.length; ++i)
                texture.getSide(frontWalls[i]).drawTransformedAt(0, 16 * scale, tWalls[frontWalls[i]]);

            texture.getRoof().drawTransformedAt(0, -16 * scale, tRoof);
        };
    };
    
    const setTransforms = (angle, pitch) => {
        const radius = Math.sqrt(2) * 16;
        
        tRoof.identity();
        tRoof.scale(1, scale);
        tRoof.rotate(angle);

        for(let i = 0; i < 4; ++i) {
            const a = Math.PI * 0.5 * (i + 0.5) + angle;

            tWalls[i].identity();
            tWalls[i].scale(1, scale);
            tWalls[i].translate(Math.cos(-a) * radius, Math.sin(-a) * radius);
            tWalls[i].scale(-Math.cos(a - Math.PI * 0.25), 1);
            tWalls[i].shear(0, -Math.cos(a + Math.PI * 0.25));
        }

        backWalls[0] = 3 - Math.floor(angle / (Math.PI * 0.5));
        backWalls[1] = (backWalls[0] + 1) % 4;
        frontWalls[0] = (backWalls[1] + 1) % 4;
        frontWalls[1] = (frontWalls[0] + 1) % 4;

        scale = Math.cos(pitch);
    };

    const update = timeStep => {
        angle += timeStep;

        while(angle > Math.PI * 2)
            angle -= Math.PI * 2;

        setTransforms(angle, pitch);
    };

    const render = () => {
        myr.bind();
        myr.clear();
        myr.push();

        myr.translate(myr.getWidth() / 2, myr.getHeight() / 2);
        myr.scale(6, 6);

        for(let i = 0; i < blocks.length; ++i)
            blocks[i].render();

        myr.pop();
        sprites.draw(10, 10);

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
    myr.register("wall1", myr.makeSpriteFrame(sprites, 32, 0, 32, 32, 0, 32, 0));
    myr.register("wall2", myr.makeSpriteFrame(sprites, 64, 0, 32, 32, 0, 32, 0));
    myr.register("wall3", myr.makeSpriteFrame(sprites, 96, 0, 32, 32, 0, 32, 0));

    const CLEAR_COLOR = new myr.Color(0.2, 0.8, 0.5);
    const tRoof = new myr.Transform();
    const tWalls = [new myr.Transform(), new myr.Transform(), new myr.Transform(), new myr.Transform()];
    const blocks = [];
    const backWalls = [0, 1];
    const frontWalls = [2, 3];
    const textures = [
        new Texture(
            new myr.Sprite("roof"),
            [
                new myr.Sprite("wall1"),
                new myr.Sprite("wall2"),
                new myr.Sprite("wall3")
            ]
        )
    ];

    let angle = Math.PI / 4;
    let pitch = Math.PI / 4;
    let scale;

    myr.setClearColor(CLEAR_COLOR);
};

const renderer = document.getElementById("renderer");
const isometric = new Isometric(new Myr(renderer));

isometric.start();