const Raytracer = function(myr) {
    const NUM_REFLECTIONS = 4;
    const COLOR_WORLD = myr.Color.BLACK;
    const TIME_STEP_MAX = 0.5;

    let lastDate = null;

    const eye   = new Vector3(0.5, 0.5, 1.5);
    const light = new Vector3(0.5, 0.5, -100);

    const spheres= [new Sphere(new Vector3(0.5, 0.5, -100), 1, 10, myr.Color.BLUE),
                    new Sphere(new Vector3(0.5, 0.5, -100), 2, 5, myr.Color.RED),
                    new Sphere(new Vector3(0.5, 0.5, -100), 3, 10, myr.Color.GREEN),
                    new Sphere(new Vector3(0.5, 0.5, -100), 4, 5, myr.Color.YELLOW)];

    let upScaling = 64;

    const createScaleSurface = () => {
        let width = myr.getWidth() / upScaling;
        let height = myr.getHeight() / upScaling;
        return new myr.Surface(width, height);
    };

    let renderSurface = createScaleSurface();

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
        for(let i = 0; i < spheres.length; ++i)
            spheres[i].update(timeStep);
    };

    const scaleColor = scalar => {
        return new myr.Color(scalar, scalar, scalar);
    };

    const shade = (sphere, ray, hit, recursionDepth) => {
        const MATERIAL_AMBIENT    = 0.2,
              MATERIAL_DIFFUSE    = 0.3,
              MATERIAL_SPECULAR   = 0.5,
              MATERIAL_SPECULAR_N = 8;

        let color = scaleColor(MATERIAL_AMBIENT).multiply(sphere.getColor());

        let position = ray.at(hit.getDistance());
        let normal = hit.getNormal();
        let lightDir = light.subtract(position).normalize();
        let diffuseIntensity = MATERIAL_DIFFUSE * Math.max(normal.dot(lightDir), 0);
        color.add(scaleColor(diffuseIntensity));

        let reflectedLightDir = reflect(lightDir.multiply(-1), normal);
        let viewDir = ray.getDirection().multiply(-1);
        let specAngle = Math.max(reflectedLightDir.dot(viewDir), 0);
        let specularIntensity = MATERIAL_SPECULAR * Math.pow(specAngle, MATERIAL_SPECULAR_N);
        color.add(scaleColor(specularIntensity));

        if (recursionDepth > 0) {
            let reflectedRayDir = reflect(ray.getDirection(), normal).normalize();
            let reflectedRay = new Ray(position.add(normal), reflectedRayDir);
            let reflectionColor = scaleColor(MATERIAL_SPECULAR).multiply(trace(reflectedRay, recursionDepth - 1));
            color.add(reflectionColor);
        }

        return color;
    };

    const trace = (ray, recursionDepth) => {
        let closestHit = new Hit(Infinity);
        let sphere;

        for(let i = 0; i < spheres.length; ++i) {
            let hit = spheres[i].intersect(ray);
            if (hit.getDistance() < closestHit.getDistance()) {
                closestHit = hit;
                sphere = spheres[i];
            }
        }

        if (!sphere)
            return COLOR_WORLD;

        return shade(sphere, ray, closestHit, recursionDepth);
    };

    const render = () => {
        renderSurface.bind();
        renderSurface.clear();

        const height = renderSurface.getHeight();
        const width = renderSurface.getWidth();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let spacePixel = new Vector3((x + 0.5) / width, (height - 1 - y + 0.5) / height, 0);
                let ray = new Ray(eye, spacePixel.subtract(eye).normalize());
                myr.primitives.drawPoint(trace(ray, NUM_REFLECTIONS), x, y);
            }
        }

        myr.bind();
        myr.clear();
        renderSurface.drawScaled(0, 0, myr.getWidth()/(width-1), (myr.getHeight()-1)/(height-1));
        myr.flush();
    };
    
    const animate = () => {
        requestAnimationFrame(animate.bind());
        
        update(getTimeStep());
        render();
    };

    this.start = () => {
        lastDate = new Date();

        myr.setClearColor(COLOR_WORLD);
        renderSurface.setClearColor(COLOR_WORLD);
        animate();
    };

    this.increaseResolution = () => {
        upScaling /= 2;
        renderSurface.free();
        renderSurface = createScaleSurface();
    }
};

const renderer = document.getElementById("renderer");
const tracer = new Raytracer(new Myr(renderer));

renderer.addEventListener("click", function() {
    tracer.increaseResolution();
});

tracer.start();