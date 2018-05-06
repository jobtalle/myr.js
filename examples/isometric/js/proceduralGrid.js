const ProceduralGrid = function(width, height, depth) {
    let locations = [];

    const Point = (x, y, z) => {
      return {x, y, z};
    };

    const createEmptyGrid = (width, height, depth) => {
        return new Array(width * length * depth).fill(0);
    };

    const gridIndex = (point) => {
        return point.x + point.y * width + point.z * width * depth;
    };

    const solveCell = (rules, point) => {
        return 1;
    };

    const getNeighbours = (point) => {
        let left   = Point(Math.min(point.x + 1, width), point.y, point.z);
        let right  = Point(Math.max(point.x - 1, 0)    , point.y, point.z);
        let up     = Point(point.x, Math.min(point.y + 1, height), point.z);
        let down   = Point(point.x, Math.max(point.y - 1,      0), point.z);
        let top    = Point(point.x, point.y, Math.min(point.z + 1, depth));
        let bottom = Point(point.x, point.y, Math.max(point.z - 1, 0));

        return [left, right, up, down, top, bottom];
    };

    const setCell = (grid, point, value) => {
        grid[gridIndex(point)] = value;
    };

    const getCell = (grid, point) => {
        return grid[gridIndex(point)];
    };

    this.getCell = (x, y, z) => {
        return getCell(currentGrid, Point(x, y, z));
    };

    this.solveGridStep = (rules) => {
        let newGrid = createEmptyGrid();
        let newLocations = [];
        while (locations.length > 0) {
            let point = locations.pop();
            if (!getCell(currentGrid, point)) {
                setCell(newGrid, point, solveCell(rules, point));
                newLocations.push(getNeighbours(point));
            }
        }
        currentGrid = newGrid;
        locations = newLocations;
    };

    let currentGrid = createEmptyGrid();
    locations.push(Point(0, 0, 0));
};