const Sphere = function(position, phase, radius) {
    const MOVE_RANGE_X = 2, MOVE_RANGE_Y = 2, MOVE_RANGE_Z = 10,
          MOVE_SPEED = 1;

    let timePassed = phase;
    let _originalPosition = position;

    this.update = timeStep => {
        timePassed += MOVE_SPEED * timeStep;
        let dX = MOVE_RANGE_X * Math.cos(timePassed) * radius;
        let dY = MOVE_RANGE_Y * Math.sin(timePassed) * radius;
        let dZ = MOVE_RANGE_Z * Math.cos(timePassed) * radius;
        position = _originalPosition.add(new Vector3(dX, dY, dZ));
    };

    this.intersect = ray => {
        let distanceToOrigin = ray.getOrigin().subtract(position);
        let a = ray.getDirection().dot(ray.getDirection());
        let b = 2 * ray.getDirection().dot(distanceToOrigin);
        let c = distanceToOrigin.dot(distanceToOrigin) - radius * radius;

        let solutions = solveQuadratic(a, b, c);
        let distance = solutions.firstSolution;
        if (distance < 0)
            distance = solutions.secondSolution;

        if (distance > 0) {
            let normal = ray.at(distance).subtract(position).normalize();
            return new Hit(distance, normal);
        }

        return new Hit(Infinity);
    };
};