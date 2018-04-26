# myr.js

**myr.js** is a WebGL 2 based 2D graphics renderer. The engine is optimized for rendering large amounts of sprites, and also supports render targets, custom shaders, primitives and advanced transformations. There are no external dependencies. **myr.js** has been licensed under the [MIT license](LICENSE). All source code is contained in the [myr.js](js/myr.js) file.

# Initialization
**myr.js** can be initialized by calling the `Myr` function, which requires a canvas element as an argument. All global functions and objects are members of the returned object. The provided canvas must be able to provide a *WebGL 2* context.

Initialization would typically look like this:
```javascript
// Create a myr.js object
let myr = new Myr(document.getElementById("some-canvas-id"));

// Access myr.js functions and classes from here on
myr.setClearColor(new myr.Color(0.2, 0.5, 0.7));
```

# Objects
The **myr.js** object exposes several objects:

Object | Description
-|-
[`Surface`](#surface)|A render target which can be rendered to, which may be initialized to an existing image
[`Sprite`](#sprite)|A renderable sprite consisting of one or more frames
[`Transform`](#transform)|A 2D transformation
[`Color`](#color)|A color containing a red, green, blue and alpha channel
[`Vector`](#vector)|A 2D vector

# Namespaces
The **myr.js** object exposes several namespaces which provide access to specific functions:

Namespace | Description
-|-
[`primitives`](#primitives)|Exposes primitive rendering functions

# Global functions
Global functions are members of the object returned by the `Myr` function. One of the most important tasks of the global functions is maintaining the transform stack. Everything that is rendered is transformed by the [`Transform`](#transform) on top of this stack. Before applying transformations, it is useful to first save the current transform state using the `push()` function. The `pop()` function can be called after the transformations are done to get back to the original state.

Function | Description
-|-
[`setClearColor(color)`](#setclearcolor)|Sets the clear color
[`clear()`](#clear)|Clears the current target
[`bind()`](#bind)|Binds the default render target
[`flush()`](#flush)|Flush the draw calls
[`free()`](#free)|Frees *myr.js* object
[`getTransform()`](#gettransform)|Get the current transformation
[`push()`](#push)|Push the transform stack
[`pop()`](#pop)|Pop the transform stack
[`getWidth()`](#getwidth)|Returns the width of the default render target
[`getHeight()`](#getheight)|Returns the height of the default render target
[`makeSpriteFrame(surface, x, y, width, height, xOrigin, yOrigin, time)`](#makespriteframesurface-x-y-width-height-xorigin-yorigin-time)|Returns a sprite frame
[`register(name, ...)`](#registername-)|Register a sprite
[`unregister(name)`](#unregistername)|Unregister a sprite
[`transform(transform)`](#transformtransform)|Transform
[`translate(x, y)`](#translatex-y)|Translate
[`rotate(angle)`](#rotateangle)|Rotate
[`shear(x, y)`](#shearx-y)|Shear
[`scale(x, y)`](#scalex-y)|Scale

### `setClearColor(color)`
Set the clear color of the **myr.js** object. When `clear()` is called, the screen will be cleared using this color.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|A color which the canvas will be cleared to when `clear()` is called.

### `clear()`
Clears the canvas to the currently set clear color.

### `bind()`
Binds the canvas as the current render target.

### `flush()`
This function finishes all previously given draw calls. This function should be called at the very end of the render loop.

### `free()`
Frees the **myr.js** object and the OpenGL objects it maintains. Note that this function does not free objects like [surfaces](#surface), these must be freed individually.

### `getTransform()`
Return the [transformation](#transform) which is currently on top of the stack.

### `push()`
Push the current [transformation](#transform) onto the stack, saving the current transformation state.

### `pop()`
Pop the current [transformation](#transform) from the stack, restoring the last pushed transformation.

### `getWidth()`
Returns the width of the default render target

### `getHeight()`
Returns the height of the default render target

### `makeSpriteFrame(surface, x, y, width, height, xOrigin, yOrigin, time)`
Returns a sprite frame. The result of this function should _only_ be passed to the [`register`](#registername-) function.

Parameter | Type | Description
-|-|-
surface|[`Surface`](#surface)|A surface containing the frame
x|`Number`|The x position of the frame on the surface in pixels
y|`Number`|The y position of the frame on the surface in pixels
width|`Number`|The width of the frame in pixels
height|`Number`|The height of the frame in pixels
xOrigin|`Number`|The frame x origin in pixels
yOrigin|`Number`|The frame y origin in pixels
time|`Number`|The duration of this frame in seconds

### `register(name, ...)`
Registers a new sprite under a name. Once a sprite has been registered, its name can be used to instatiate [sprites](#sprite).

While the first argument must be the sprite name, the number of following parameters depends on the number of frames. All frames must be passed as arguments after the sprite name. A frame is created using the [`makeSpriteFrame`](#makespriteframesurface-x-y-width-height-xorigin-yorigin-time) function.

Parameter | Type | Description
-|-|-
name|`String`|The name of the sprite to register

Registering sprites usually happens when loading a sprite sheet. This sheet is first loaded onto a surface, after which all sprites on the sheet are registered to make them available for use. This will usually look like this:

```javascript
// Load a sprite sheet of 512x512 pixels
sheet = new myr.Surface("source.png", 512, 512);

// Load information about the sprites in this sheet
// This could be loaded from JSon exported by a sprite sheet tool
sprites = loadSprites();

// Register every sprite
for(let i = 0; i < sprites.length; ++i)
    myr.register(
        sprites[i].name,
        myr.makeSpriteFrame(
            sprites[i].x,
            sprites[i].y,
            sprites[i].width,
            sprites[i].height,
            sprites[i].xOrigin,
            sprites[i].yOrigin,
            sprites[i].frameTime));
```

Note that `sprites` can be any kind of data, the member names may differ for other formats; it is only necessary that all required information about a sprite is passed. If animated sprites exist, any number of sprite frames can be passed to the [`register`](#registername-) function.

### `unregister(name)`
Unregisters a previously registered sprite.

Parameter | Type | Description
-|-|-
name|`String`|The name of the sprite to unregister

### `transform(transform)`
Transform the current [transformation](#transform) by multiplying it with another transformation.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transform to multiply the current transformation with

### `translate(x, y)`
Translate the current transformation.

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal movement
y|`Number`|Vertical movement

### `rotate(angle)`
Rotate the current transformation.

Parameter | Type | Description
-|-|-
angle|`Number`|Angle in radians

### `shear(x, y)`
Shear the current transformation.

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal shearing
y|`Number`|Vertical shearing

### `scale(x, y)`
Scale the current transformation.

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal scaling
y|`Number`|Vertical scaling

# Surface
A surface in **myr.js** can be a render target. After binding it using its member function `bind()`, all render calls render to this surface. The surface itself can also be rendered. Additionally, the surface may be constructed from images, making surfaces useful for large image or background rendering since large images don't fit well on sprite sheets. Note that surfaces can only render to other targets, never to themselves.

## Functions
Function | Description
-|-
[`Surface(width, height)`](#surfacewidth-height)|Construct from size
[`Surface(image)`](#surfaceimage)|Construct from image
[`bind()`](#bind-1)|Bind the surface
[`setClearColor(color)`](#setclearcolorcolor-1)|Set clear color
[`clear()`](#clear-1)|Clear the surface
[`ready()`](#ready)|Verify whether the surface is renderable
[`getWidth()`](#getwidth-1)|Returns the surface width
[`getHeight()`](#getheight-1)|Returns the surface height
[`free()`](#free-1)|Frees all resources used by this surface
[`draw(x, y)`](#drawx-y)|Draws the surface
[`drawScaled(x, y, xScale, yScale)`](#drawscaledx-y-xscale-yscale)|Draws the surface
[`drawSheared(x, y, xShear, yShear)`](#drawshearedx-y-xshear-yshear)|Draws the surface
[`drawTransformed(transform)`](#drawtransformedtransform)|Draws the surface
[`drawPart(x, y, left, top, width, height)`](#drawpartx-y-left-top-width-height)|Draws the surface
[`drawPartTransformed(transform, left, top, width, height)`](#drawparttransformedtransform-left-top-width-height)|Draws the surface

### `Surface(width, height)`
Constructs a surface of a specific size.

Parameter | Type | Description
-|-|-
width|`Number`|Width in pixels
height|`Number`|Height in pixels

### `Surface(image)`
Constructs a surface from an existing image. The function `ready()` will return `false` until the image is loaded.

Parameter | Type | Description
-|-|-
image|`String`|A URL to a valid image file

### `Surface(image, width, height)`
Construct a surface from an existing image. The width and height will be set from the beginning instead of after the image has been loaded.

Parameter | Type | Description
-|-|-
image|`String`|A URL to a valid image file
width|`Number`|Width in pixels
height|`Number`|Height in pixels

### `bind()`
Binds the surface, making it the current render target until another one is bound. After binding, an empty [transform](#transform) is pushed onto the transformation stack.

### `setClearColor(color)`
Set the clear color of this surface. When `clear()` is called, the surface will be cleared using this color.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|A color which the surface will be cleared to when `clear()` is called

### `clear()`
Clears the surface to the currently set clear color.

### `ready()`
Returns a `Boolean` indicating whether the surface is ready for use. Surfaces constructed from an image will be ready once the image is loaded. Surfaces that don't require an image are always immediately ready.

### `getWidth()`
Returns the width of the surface.

### `getHeight()`
Returns the height of the surface.

### `free()`
Frees the surface and all memory allocated by it.

### `draw(x, y)`
Draws this surface on the currently bound target.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to

### `drawScaled(x, y, xScale, yScale)`
Draws this surface on the currently bound target after applying scaling.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
xScale|`Number`|The horizontal scale factor
yScale|`Number`|The vertical scale factor

### `drawSheared(x, y, xShear, yShear)`
Draws this surface on the currently bound target after applying shearing.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
xShear|`Number`|Horizontal shearing
yShear|`Number`|Vertical shearing

### `drawTransformed(transform)`
Draws this surface on the currently bound target after applying a transformation to it.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transformation to apply to this surface

### `drawPart(x, y, left, top, width, height)`
Draws a part of this surface on the currently bound render target. Make sure the specified region is part of the surface; rendering parts that fall outside this surface results in undefined behavior.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
left|`Number`|The X position on the surface to draw from
top|`Number`|The Y position on the surface to draw from
width|`Number`|The width of the region to draw
height|`Number`|The height of the region to draw

### `drawPartTransformed(transform, left, top, width, height)`
Draws a part of this surface on the currently bound render target.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transformation to apply to this surface
left|`Number`|The X position on the surface to draw from
top|`Number`|The Y position on the surface to draw from
width|`Number`|The width of the region to draw
height|`Number`|The height of the region to draw

# Sprite
A sprite in **myr.js** is a renderable image consisting of one or more frames. Sprite sources must be registered using [`register`](#registername-) before they can be instantiated. Sprites are constructed by referencing these sources.

Typically, one big surface should contain all sprites (it will be a sprite atlas). In this way, sprite rendering is much more efficient than surface rendering.

## Functions
Function | Description
-|-
[`Sprite(name)`](#spritename)|Constructs a sprite
[`animate(timeStep)`](#animatetimestep)|Animates the sprite
[`setFrame(frame)`](#setframeframe)|Set the current frame
[`getFrame()`](#getframe)|Returns the current frame
[`draw(x, y)`](#drawx-y-1)|Draws the sprite
[`drawScaled(x, y, xScale, yScale)`](#drawscaledx-y-xscale-yscale-1)|Draws the sprite
[`drawSheared(x, y, xShear, yShear)`](#drawshearedx-y-xshear-yshear-1)|Draws the sprite
[`drawRotated(x, y, angle)`](#drawrotatedx-y-angle)|Draws the sprite
[`drawScaledRotated(x, y, xScale, yScale, angle)`](#drawscaledrotatedx-y-xscale-yscale-angle)|Draws the sprite
[`drawTransformed(transform)`](#drawtransformedtransform-1)|Draws the sprite
[`drawPart(x, y, left, top, width, height)`](#drawpartx-y-left-top-width-height-1)|Draws the sprite
[`drawPartTransformed(transform, left, top, width, height)`](#drawparttransformedtransform-left-top-width-height-1)|Draws the sprite

### `Sprite(name)`
Constructs a sprite from a registered source.

Parameter | Type | Description
-|-|-
name|`String`|The sprite source

### `animate(timeStep)`
Advances the animation frame of this sprite according to its own frame rate. When the maximum frame has been reached, the animation rewinds. If a sprite only has one frame, this method does nothing.

Parameter | Type | Description
-|-|-
timeStep|`Number`|The current time step, which is the time the current animation frame takes

### `setFrame(frame)`
Sets the current frame index of this sprite.

Parameter | Type | Description
-|-|-
frame|`Number`|The frame index this sprite should be at, starting at zero

### `getFrame()`
Returns the current frame index.

### `draw(x, y)`
Draws this sprite on the currently bound target.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to

### `drawScaled(x, y, xScale, yScale)`
Draws this sprite on the currently bound target after applying scaling.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
xScale|`Number`|The horizontal scale factor
yScale|`Number`|The vertical scale factor

### `drawSheared(x, y, xShear, yShear)`
Draws this sprite on the currently bound target after applying shearing.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
xShear|`Number`|Horizontal shearing
yShear|`Number`|Vertical shearing

### `drawRotated(x, y, angle)`
Draws this sprite on the currently bound target after applying rotation.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
angle|`Number`|The rotation in radians

### `drawScaledRotated(x, y, xScale, yScale, angle)`
Draws this sprite on the currently bound target after applying both scaling and rotation.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
xScale|`Number`|The horizontal scale factor
yScale|`Number`|The vertical scale factor
angle|`Number`|The rotation in radians

### `drawTransformed(transform)`
Draws this sprite on the currently bound target after applying a transformation to it.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transformation to apply to this sprite

### `drawPart(x, y, left, top, width, height)`
Draws a part of this sprite on the currently bound render target. Make sure the specified region is part of the sprite; rendering parts that fall outside this sprite results in undefined behavior.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
left|`Number`|The X position on the sprite to draw from
top|`Number`|The Y position on the sprite to draw from
width|`Number`|The width of the region to draw
height|`Number`|The height of the region to draw

### `drawPartTransformed(transform, left, top, width, height)`
Draws a part of this sprite on the currently bound render target.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transformation to apply to this surface
left|`Number`|The X position on the sprite to draw from
top|`Number`|The Y position on the sprite to draw from
width|`Number`|The width of the region to draw
height|`Number`|The height of the region to draw

# Transform
The transform object wraps a homogeneous 2D transformation matrix. Several different transform functions are provided, but the matrix can also be filled by hand. Transform objects are used in the global transformation stack to transform everything that is being rendered.

## Functions
Function | Description
-|-
[`Transform()`](#transform-1)|Constructs as idenity transform
[`Transform(_00, _10, _20, _01, _11, _21)`](#transform_00-_10-_20-_01-_11-_21)|Constructs from matrix values
[`apply(vector)`](#applyvector)|Apply to a vector
[`copy()`](#copy)|Returns a copy
[`identity()`](#identity)|Set to identity
[`set(transform)`](#settransform)|Make equal to another transform
[`multiply(transform)`](#multiplytransform)|Multiply with another transform
[`rotate(angle)`](#rotateangle-1)|Rotate
[`shear(x, y)`](#shearx-y-1)|Shear
[`translate(x, y)`](#translatex-y-1)|Translate
[`scale(x, y)`](#scalex-y-1)|Scale

### `Transform()`
Constructs a `Transform` object, which is initialized as the identity matrix (no transform).

### `Transform(_00, _10, _20, _01, _11, _21)`
Constructs a `Transform` object with custom values. Note that only the top two rows of the matrix can be entered, since the bottom row for 2D transformations will always be `[0, 0, 1]`.

Parameter | Type | Description
-|-|-
_00|`Number`|Value [0, 0] of the matrix
_10|`Number`|Value [1, 0] of the matrix
_20|`Number`|Value [2, 0] of the matrix
_01|`Number`|Value [0, 1] of the matrix
_11|`Number`|Value [1, 1] of the matrix
_21|`Number`|Value [2, 1] of the matrix

### `apply(vector)`
Multiplies the given vector by this transformation matrix. This function may prove useful when a coordinate instead of a rendering call must be transformed.

Parameter | Type | Description
-|-|-
vector|[`Vector`](#vector)|A vector object to transform

### `copy()`
Returns a copy of this transform object.

### `identity()`
Sets the transformation to the identity matrix.

### `set(transform)`
Sets the transformation to another transformation.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transform object

### `multiply(transform)`
Multiplies this transformation with another transformation by matrix multiplication. This is useful for combining different transforms together.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transform object

### `rotate(angle)`
Rotate by a number of radians.

Parameter | Type | Description
-|-|-
angle|`Number`|The number of radians to rotate by

### `shear(x, y)`
Shear this transformation.

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal shear
y|`Number`|Vertical shear

### `translate(x, y)`
Translate this transformation.

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal translation
y|`Number`|Vertical translation

### `scale(x, y)`
Scale this transformation.

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal scale
y|`Number`|Vertical scale

# Color
This object represents a color with a red, green, blue and alpha component.

## Functions
Function | Description
-|-
[`Color(r, g, b)`](#colorr-g-b)|Construct from RGB
[`Color(r, g, b, a)`](#colorr-g-b-a)|Construct from RGBA

## Constants
Constant | Description
-|-
`BLACK`|Black
`BLUE`|Blue
`GREEN`|Green
`CYAN`|Cyan
`RED`|Red
`MAGENTA`|Magenta
`YELLOW`|Yellow
`WHITE`|White

### `Color(r, g, b)`
Constructs a color object from red, green and blue. The values must lie in the range [0, 1]. The color will have an alpha value of `1.0`.

### `Color(r, g, b, a)`
Constructs a color object from red, green, blue and alpha. The values must lie in the range [0, 1].

# Vector
This object represents a vector in 2D space. Several useful vector operation functions are provided.

## Functions
Function | Description
-|-
[`Vector(x, y)`](#vectorx-y)|Construct from x and y
[`copy()`](#copy-1)|Returns a copy
[`add(vector)`](#addvector)|Add
[`subtract(vector)`](#subtractvector)|Subtract
[`negate()`](#negate)|Negate
[`dot(vector)`](#dotvector)|Dot product
[`length()`](#length)|Length
[`multiply(scalar)`](#multiplyscalar)|Multiply
[`divide(scalar)`](#dividescalar)|Divide
[`normalize()`](#normalize)|Normalize
[`angle()`](#angle)|Returns the angle

### `Vector(x, y)`
Constructs a vector object.

Parameter | Type | Description
-|-|-
x|`Number`|X value
y|`Number`|Y value

### `copy()`
Returns a copy of this vector object.

### `add(vector)`
Add another vector to this one.

Parameter | Type | Description
-|-|-
vector|[`Vector`](#vector)|A vector object

### `subtract(vector)`
Subtract another vector from this one.

Parameter | Type | Description
-|-|-
vector|[`Vector`](#vector)|A vector object

### `negate()`
Negate the vector values.

### `dot(vector)`
Returns the dot product of this vector and another one.

Parameter | Type | Description
-|-|-
vector|[`Vector`](#vector)|A vector object

### `length()`
Returns the length of the vector.

### `multiply(scalar)`
Multiplies the vector by a scalar.

Parameter | Type | Description
-|-|-
scalar|`Number`|A number

### `divide(scalar)`
Divides the vector by a scalar.

Parameter | Type | Description
-|-|-
scalar|`Number`|A number

### `normalize()`
Normalizes the vector.

### `angle()`
Returns the angle this vector is pointing towards.

# Primitives
The _primitives_ namespace exposes several functions which can be used for primitive rendering.

## Functions

Function | Description
-|-
[`drawPoint(color, x, y)`](#drawpointcolor-x-y)|Draws a colored point
[`drawLine(color, x1, y1, x2, y2)`](#drawlinecolor-x1-y1-x2-y2)|Draws a line segment
[`drawLineGradient(color1, x1, y1, color2, x2, y2)`](#drawlinegradientcolor1-x1-y1-color2-x2-y2)|Draws a gradient line segment
[`drawRectangle(color, x, y, width, height)`](#drawrectanglecolor-x-y-width-height)|Draws a rectangle
[`drawCircle(color, x, y, radius)`](#drawcirclecolor-x-y-radius)|Draws a circle

### `drawPoint(color, x, y)`
Draws a colored pixel at the specified coordinates.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|The point color
x|`Number`|The x coordinate
y|`Number`|The y coordinate

### `drawLine(color, x1, y1, x2, y2)`
Draws a single line segment with a color.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|The line color
x1|`Number`|The start point x coordinate
y1|`Number`|The start point y coordinate
x2|`Number`|The end point x coordinate
y2|`Number`|The end point y coordinate

### `drawLineGradient(color1, x1, y1, color2, x2, y2)`
Draws a single line segment with a color gradient.

Parameter | Type | Description
-|-|-
color1|[`Color`](#color)|The line color at the start point
x1|`Number`|The start point x coordinate
y1|`Number`|The start point y coordinate
color2|[`Color`](#color)|The line color at the end point
x2|`Number`|The end point x coordinate
y2|`Number`|The end point y coordinate

### `drawRectangle(color, x, y, width, height)`
Draws a rectangle.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|The line color
x|`Number`|The left top x coordinate
y|`Number`|The left top y coordinate
width|`Number`|The rectangle width
height|`Number`|The rectangle height

### `drawCircle(color, x, y, radius)`
Draws a circle with a radius around an origin.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|The line color
x|`Number`|The center's x coordinate
y|`Number`|The center's y coordinate
radius|`Number`|The circle radius