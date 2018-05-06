const ProceduralGrid = function(width, height, depth, rules) {
    const EMPTY_CELL = -1;

    let locations = [];

    const Point = (x, y, z) => {
      return {x, y, z};
    };

    const createEmptyGrid = () => {
        return new Array(width * height * depth).fill(EMPTY_CELL);
    };

    const gridIndex = (point) => {
        return point.x + point.y * width + point.z * width * depth;
    };

    const setCell = (grid, point, value) => {
        grid[gridIndex(point)] = value;
    };

    const getCell = (grid, point) => {
        return grid[gridIndex(point)];
    };

    const getOptions = (point) => {
        let options = [];
        let value = getCell(currentGrid, point);
        if (value !== EMPTY_CELL)
            options = rules[value];
        return options;
    };

    const solveCell = (neighbours) => {
        let options = getOptions(neighbours[0]);

        for (let index = 1; index < neighbours.length; index++) {
            options = options.concat(getOptions(neighbours[index]));
        }

        for(let left = 0; left < options.length; left++) {
            for(let right = left+1; right < options.length; right++) {
                if(options[left] === options[right])
                    options.splice(right--, 1);
            }
        }

        return options[Math.floor(Math.random() * options.length)];;
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

    this.getCell = (x, y, z) => {
        return getCell(currentGrid, Point(x, y, z));
    };

    this.solveGridStep = () => {
        let newGrid = currentGrid.slice();
        let newLocations = [];
        while (locations.length > 0) {
            let point = locations.pop();
            if (getCell(currentGrid, point) === EMPTY_CELL) {
                let neighbours = getNeighbours(point);
                setCell(newGrid, point, solveCell(neighbours));
                newLocations = newLocations.concat(neighbours);
            }
        }
        currentGrid = newGrid;
        locations = newLocations;
    };

    let currentGrid = createEmptyGrid();
    locations.push(Point(0, 0, 0));
};