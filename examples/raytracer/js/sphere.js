const solveQuadratic = (a, b, c) => {
  let discriminant = b * b - 4 * a * c;

  let firstSolution = NaN, secondSolution = NaN;
  if (discriminant === 0)
      firstSolution = secondSolution = b / (2 * a);
  else if (discriminant > 0) {
      firstSolution  = (-b + Math.sqrt(discriminant)) / (2 * a);
      secondSolution = (-b - Math.sqrt(discriminant)) / (2 * a);
  }

  if (firstSolution > secondSolution) {
      let temp = firstSolution;
      firstSolution = secondSolution;
      secondSolution = temp;
  }

  return {firstSolution, secondSolution};
};

const Sphere = function(position, radius) {
    const MOVE_SPEED = 200;

    let timePassed = 0;
    let _originalPosition = position;

    this.update = timeStep => {
        timePassed += timeStep;
        position = _originalPosition.add(new Vector3(0, 0, MOVE_SPEED * Math.sin(timePassed)));
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