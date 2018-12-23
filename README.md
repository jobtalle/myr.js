# myr.js
**myr.js** is a WebGL 2 based 2D graphics renderer. The engine is optimized for rendering large amounts of sprites, and also supports render targets, primitives and advanced transformations. There are no external dependencies. **myr.js** has been licensed under the [MIT license](LICENSE). All source code is contained in the [myr.js](myr.js) file.

# Installation
The [myr.js](myr.js) file can be included in any ES6 compatible javascript project. No external dependencies are required.

Alternatively, **myr.js** can be installed as an NPM package using `npm install myr.js`.

# Initialization
**myr.js** can be initialized by calling the `Myr` function, which requires a canvas element as an argument. All global functions and objects are members of the returned object. I call this object a **myr.js** context. The provided canvas must support *WebGL 2*.

Initialization would typically look like this:
```javascript
// Create a myr.js context
let myr = new Myr(document.getElementById("some-canvas-id"));

// Access myr.js functions and classes from here on
myr.setClearColor(new Myr.Color(0.2, 0.5, 0.7));
```

# Objects
Two types of **myr.js** objects exist. There are objects that are exposed through a **myr.js** context. These objects can only be used for that context. They can be initialized as follows:

```javascript
// Create a Myriad context
let myr = new Myr(document.getElementById("some-canvas-id"));

// Create a surface to be used in the previously created context
let surface = new myr.Surface(800, 600);
```

The other type of objects can be accessed directly through the `Myr` object, and can be shared by multiple contexts. The example below shows using the [`Color`](#color) object which is not linked to a specific context:

```javascript
// Create a Myriad context
let myr = new Myr(document.getElementById("some-canvas-id"));

// Create a color object
let color = new Myr.Color(0.3, 0.5, 0.7);

// Set the created color object as the clear color for the context
myr.setClearColor(color);
```

The following objects are exposed by a **myr.js** context.

Object | Description
-|-
[`Surface`](#surface)|A render target which can be rendered to, which may be initialized to an existing image
[`Sprite`](#sprite)|A renderable sprite consisting of one or more frames
[`Shader`](#shader)|A shader

The next objects accessible through the `Myr` object itself:

Object | Description
-|-
[`Transform`](#transform)|A 2D transformation
[`Color`](#color)|A color containing a red, green, blue and alpha channel
[`Vector`](#vector)|A 2D vector

# Namespaces
A **myr.js** context exposes several namespaces which provide access to specific functions:

Namespace | Description
-|-
[`primitives`](#primitives)|Exposes primitive rendering functions
[`mesh`](#mesh)|Exposes mesh rendering functions
[`utils`](#utils)|Exposes utility functions

# Global functions
Global functions are members of the object returned by the `Myr` function. One of the most important tasks of the global functions is maintaining the transform stack. Everything that is rendered is transformed by the [`Transform`](#transform) on top of this stack. Before applying transformations, it is useful to first save the current transform state using the `push()` function. The `pop()` function can be called after the transformations are done to get back to the original state.

Function | Description
-|-
[`setClearColor(color)`](#setclearcolor)|Sets the clear color
[`setColor(color)`](#setcolorcolor)|Sets the global color filter
[`setAlpha(alpha)`](#setalphaalpha)|Sets the global transparency
[`resize(width, height)`](#resizewidth-height)|Resize this renderer
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
[`isRegistered(name)`](#isregisteredname)|Check if a sprite is registered
[`unregister(name)`](#unregistername)|Unregister a sprite
[`transform(transform)`](#transformtransform)|Transform
[`translate(x, y)`](#translatex-y)|Translate
[`rotate(angle)`](#rotateangle)|Rotate
[`shear(x, y)`](#shearx-y)|Shear
[`scale(x, y)`](#scalex-y)|Scale

### `setClearColor(color)`
Sets the clear color of the **myr.js** object. When `clear()` is called, the screen will be cleared using this color.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|A color which the canvas will be cleared to when `clear()` is called

### `setColor(color)`
Sets the global color filter. Every drawn color will be multiplied by this color before rendering.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|A color

### `setAlpha(alpha)`
Sets the global alpha (transparency). Every drawn color will be multiplied by this transparency before rendering. Note that this function sets the alpha component of the current clear color set by [`setColor`](#setcolorcolor).

Parameter | Type | Description
-|-|-
alpha|`Number`|A transparency in the range [0, 1]

### `resize(width, height)`
Resize the renderer and the canvas used by this Myriad instance.

Parameter | Type | Description
-|-|-
width|`Number`|The width in pixels
height|`Number`|The height in pixels

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
Returns a sprite frame. The result of this function should _only_ be passed to the [`register`](#registername-) function. If the time parameter is less than zero, [sprite animation](#animatetimestep) will stop at this frame.

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
Registers a new sprite under a name. Once a sprite has been registered, its name can be used to instatiate [sprites](#sprite). When the sprite has been registered previously, the new frames overwrite the old ones.

While the first argument must be the sprite name, the number of following parameters depends on the number of frames. All frames must be passed as arguments after the sprite name. A frame is created using the [`makeSpriteFrame`](#makespriteframesurface-x-y-width-height-xorigin-yorigin-time) function.

Parameter | Type | Description
-|-|-
name|`String`|The name of the sprite to register

Registering sprites usually happens when loading a sprite sheet. This sheet is first loaded onto a surface, after which all sprites on the sheet are registered to make them available for use. This will usually look like this:

```javascript
// Load a sprite sheet
sheet = new myr.Surface("source.png");

// Load information about the sprites in this sheet
// This could be loaded from JSon exported by a sprite sheet tool
sprites = loadSprites();

// Register every sprite
for(let i = 0; i < sprites.length; ++i)
    myr.register(
        sprites[i].name,
        myr.makeSpriteFrame(
            sheet,
            sprites[i].x,
            sprites[i].y,
            sprites[i].width,
            sprites[i].height,
            sprites[i].xOrigin,
            sprites[i].yOrigin,
            sprites[i].frameTime));
```

Note that `sprites` can be any kind of data, the member names may differ for other formats; it is only necessary that all required information about a sprite is passed. If animated sprites exist, any number of sprite frames can be passed to the [`register`](#registername-) function.

### `isRegistered(name)`
Returns a boolean indicating whether a sprite with the given name has been registered.

Parameter | Type | Description
-|-|-
name|`String`|The name of the sprite

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
[`Surface(image, width, height)`](#surfaceimage-width-height)|Construct from image and size
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
[`drawRotated(x, y, angle)`](#drawrotatedx-y-angle)|Draws the surface
[`drawScaledRotated(x, y, xScale, yScale, angle)`](#drawscaledrotatedx-y-xscale-yscale-angle)|Draws the surface
[`drawTransformed(transform)`](#drawtransformedtransform)|Draws the surface
[`drawTransformedAt(x, y, transform)`](#drawtransformedatx-y-transform)|Draws the surface
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
image|`String` or `Image`|A URL or Image object referring to a valid image file

### `Surface(image, width, height)`
Construct a surface from an existing image. The width and height will be set from the beginning instead of after the image has been loaded.

Parameter | Type | Description
-|-|-
image|`String`|A URL or Image object referring to a valid image file
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
Returns the width of the surface in pixels.

### `getHeight()`
Returns the height of the surface in pixels.

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

### `drawRotated(x, y, angle)`
Draws this surface on the currently bound target after applying rotation.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
angle|`Number`|The rotation in radians

### `drawScaledRotated(x, y, xScale, yScale, angle)`
Draws this surface on the currently bound target after applying both scaling and rotation.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
xScale|`Number`|The horizontal scale factor
yScale|`Number`|The vertical scale factor
angle|`Number`|The rotation in radians

### `drawTransformed(transform)`
Draws this surface on the currently bound target after applying a transformation to it.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transformation to apply to this surface

### `drawTransformedAt(x, y, transform)`
Draws this surface on the currently bound target at a certain position after applying a transformation to it.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
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
[`isFinished()`](#isfinished)|Returns whether the animation is finished
[`getFrameCount()`](#getframecount)|Returns the number of frames
[`getWidth()`](#getwidth-2)|Returns the sprite width
[`getHeight()`](#getheight-2)|Returns the sprite height
[`getOriginX()`](#getoriginx)|Returns the X origin
[`getOriginY()`](#getoriginy)|Returns the Y origin
[`getUvLeft()`](#getuvleft)| Returns the left UV coordinate.
[`getUvTop()`](#getuvleft)| Returns the top UV coordinate.
[`getUvWidth()`](#getuvwidth)| Returns the width of the sprite in UV space.
[`getUvHeight()`](#getuvheight)| Returns the height of the sprite in UV space
[`draw(x, y)`](#drawx-y-1)|Draws the sprite
[`drawScaled(x, y, xScale, yScale)`](#drawscaledx-y-xscale-yscale-1)|Draws the sprite
[`drawSheared(x, y, xShear, yShear)`](#drawshearedx-y-xshear-yshear-1)|Draws the sprite
[`drawRotated(x, y, angle)`](#drawrotatedx-y-angle-1)|Draws the sprite
[`drawScaledRotated(x, y, xScale, yScale, angle)`](#drawscaledrotatedx-y-xscale-yscale-angle-1)|Draws the sprite
[`drawTransformed(transform)`](#drawtransformedtransform-1)|Draws the sprite
[`drawTransformedAt(x, y, transform)`](#drawtransformedatx-y-transform-1)|Draws the sprite
[`drawPart(x, y, left, top, width, height)`](#drawpartx-y-left-top-width-height-1)|Draws the sprite
[`drawPartTransformed(transform, left, top, width, height)`](#drawparttransformedtransform-left-top-width-height-1)|Draws the sprite

### `Sprite(name)`
Constructs a sprite from a registered source.

Parameter | Type | Description
-|-|-
name|`String`|The sprite source

### `animate(timeStep)`
Advances the animation frame of this sprite according to its frame times. When the maximum frame has been reached, the animation rewinds. If a sprite only has one frame, this method does nothing. Note that the animation stops at any frame with a time value below zero.

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

### `isFinished()`
Returns a boolean indicating whether the animation is finished. A sprite animation is finished when _any_ frame with a time value below zero is reached. If the frame is set to another frame using [`setFrame`](#setframeframe) after this, the animation will continue again.

### `getFrameCount()`
Returns the total number of frames for this sprite.

### `getWidth()`
Returns the width of the sprite in pixels.

### `getHeight()`
Returns the height of the sprite in pixels.

### `getOriginX()`
Returns the X origin of this sprite's current frame.

### `getOriginY()`
Returns the Y origin of this sprite's current frame.

### `getUvLeft()`
Returns the left UV coordinate.

### `getUvRight()`
Returns the top UV coordinate.

### `getUvWidth()`
Returns the width of the sprite in UV space.

### `getUvHeight()`
Returns the height of the sprite in UV space

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

### `drawTransformedAt(x, y, transform)`
Draws this sprite on the currently bound target at a certain position after applying a transformation to it.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
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

# Shader
A shader in **myr.js** is a renderable image that is rendered using a custom pixel shader written by the user. Shaders can be provided with one or more [surfaces](#surface) to read from, and one or more variables can be provided to the shader. Pixel shaders must be written in WebGL 2 compliant GLSL.

The size of the rendered result is equal to the size of the first surface provided to it, or alternatively (or when no surfaces are provided) to a size set by the user.

## Functions
Function | Description
-|-
[`Shader(shader, surfaces, variables)`](#shadershader-surfaces-variables)|Constructs a shader
[`getWidth()`](#getwidth-3)|Returns the shader width
[`getHeight()`](#getheight-3)|Returns the shader height
[`setVariable(name, value)`](#setvariablename-value)|Set one of the variables' values
[`setSurface(name, surface)`](#setsurfacename-surface)|Set one of the input surfaces' surface
[`setSize(width, height)`](#setsizewidth-height)|Set the size of this shader
[`free()`](#free-2)|Free this shader
[`draw(x, y)`](#drawx-y-2)|Draws the shader
[`drawScaled(x, y, xScale, yScale)`](#drawscaledx-y-xscale-yscale-2)|Draws the shader
[`drawSheared(x, y, xShear, yShear)`](#drawshearedx-y-xshear-yshear-2)|Draws the shader
[`drawRotated(x, y, angle)`](#drawrotatedx-y-angle-2)|Draws the shader
[`drawScaledRotated(x, y, xScale, yScale, angle)`](#drawscaledrotatedx-y-xscale-yscale-angle-2)|Draws the shader
[`drawTransformed(transform)`](#drawtransformedtransform-2)|Draws the shader
[`drawTransformedAt(x, y, transform)`](#drawtransformedatx-y-transform-2)|Draws the shader
[`drawPart(x, y, left, top, width, height)`](#drawpartx-y-left-top-width-height-2)|Draws the shader
[`drawPartTransformed(transform, left, top, width, height)`](#drawparttransformedtransform-left-top-width-height-2)|Draws the shader

### `Shader(shader, surfaces, variables)`
Constructs a shader using WebGL 2 compliant GLSL code, and optionally, [surface](#surface) and variable inputs. The `surfaces` and `variables` arrays are arrays of strings. Inside the shader code, their values are accessible by these strings as names. To assign surfaces and values to these, the functions [`setSurface()`](#setsurfacename-surface) and [`setVariable()`](#setvariablename-value) are used.

Parameter | Type | Description
-|-|-
shader|`String`|The GLSL code to execute when this shader runs
surfaces|`Array`|An array of names for surface inputs
variables|`Array`|An array of variables to create in this shader

The GLSL code to provide is *not* the entire shader. A simple complete GLSL pixel shader that renders red pixels could look like this:

```GLSL
layout(location = 0) out lowp vec4 color;

void main() {
    color = vec4(1, 0, 0, 1);
}
```

The GLSL code that should be provided to the custom shader is the `main` function of the shader, preceeded by any custom functions. However, uniforms and uniform blocks are already predefined, they should not be included.

```GLSL
void main() {
    color = vec4(1, 0, 0, 1);
}
```

Inside the GLSL code, several variables are accessible for the user besides the `surfaces` and `variables`. These are:

* `uv`, the UV coordinates of the current pixel inside the drawing area of this shader.
* `pixelSize`, a `mediump vec2` containing the UV size of one pixel. Sampling a pixel to the right for example can be done using `texture(source, vec2(uv.x + pixelSize.x, uv.y))`.
* `colorFilter`, a `lowp vec4` containing the current color filter (set by [`setColor`](#setcolorcolor)).
* `color`, a `lowp vec4` where the output pixel color should be written to.

Before drawing a shader, ensure that all variables and surfaces have been set using the [`setSurface()`](#setsurfacename-surface) and [`setVariable()`](#setvariablename-value) functions. Not doing this may and probably will result in undefined behavior.

### `getWidth()`
Returns the width of the shader in pixels. If [`setSurface()`](#setsurfacename-surface) was called on the first surface in this shader's `surfaces` array, the width will be equal to that surface's width. Otherwise, the width will be equal to the width given to this shader by the [`setSize()`](#setSizewidth-height) function.

### `getHeight()`
Returns the height of the shader in pixels. If [`setSurface()`](#setsurfacename-surface) was called on the first surface in this shader's `surfaces` array, the height will be equal to that surface's height. Otherwise, the height will be equal to the height given to this shader by the [`setSize()`](#setSizewidth-height) function.

### `setVariable(name, value)`
Set the value of one of this shader's variables. The variable name should have been declared by passing it to the `variables` array [when the shader was created](#shadershader-surfaces-variables). The value must be a number, and will be accessible inside the GLSL code under its name with the `mediump float` type.

Parameter | Type | Description
-|-|-
name|`String`|The variable name
value|`Number`|The value

### `setSurface(name, surface)`
Set the surface of one of this shader's surfaces. The surface name should have been declared by passing it to the `surfaces` array [when the shader was created](#shadershader-surfaces-variables). The value must be a [`Surface`](#surface), and will be accessible inside the GLSL code under its name with the `sampler2D` type.

Parameter | Type | Description
-|-|-
name|`String`|The surface name
surface|[`Surface`](#surface)|The surface

### `setSize(width, height)`
Sets the size of this shader. This should not be used when the the `surfaces` list was not empty when constructing this shader; in that case, the shader size will be equal to the size of its first surface. If no surfaces are provided, the shader size should be set using this function.

### `free()`
Free all resources occupied by this shader. When the shader is no longer used, this function should be called to ensure the occupied memory is freed.

### `draw(x, y)`
Draws this shader on the currently bound target.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to

### `drawScaled(x, y, xScale, yScale)`
Draws this shader on the currently bound target after applying scaling.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
xScale|`Number`|The horizontal scale factor
yScale|`Number`|The vertical scale factor

### `drawSheared(x, y, xShear, yShear)`
Draws this shader on the currently bound target after applying shearing.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
xShear|`Number`|Horizontal shearing
yShear|`Number`|Vertical shearing

### `drawRotated(x, y, angle)`
Draws this shader on the currently bound target after applying rotation.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
angle|`Number`|The rotation in radians

### `drawScaledRotated(x, y, xScale, yScale, angle)`
Draws this shader on the currently bound target after applying both scaling and rotation.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
xScale|`Number`|The horizontal scale factor
yScale|`Number`|The vertical scale factor
angle|`Number`|The rotation in radians

### `drawTransformed(transform)`
Draws this shader on the currently bound target after applying a transformation to it.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transformation to apply to this shader

### `drawTransformedAt(x, y, transform)`
Draws this shader on the currently bound target at a certain position after applying a transformation to it.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
transform|[`Transform`](#transform)|A transformation to apply to this shader

### `drawPart(x, y, left, top, width, height)`
Draws a part of this shader on the currently bound render target. Make sure the specified region is part of the shader; rendering parts that fall outside this shader results in undefined behavior.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to draw to
y|`Number`|The Y position to draw to
left|`Number`|The X position on the shader to draw from
top|`Number`|The Y position on the shader to draw from
width|`Number`|The width of the region to draw
height|`Number`|The height of the region to draw

### `drawPartTransformed(transform, left, top, width, height)`
Draws a part of this shader on the currently bound render target.

Parameter | Type | Description
-|-|-
transform|[`Transform`](#transform)|A transformation to apply to this shader
left|`Number`|The X position on the shader to draw from
top|`Number`|The Y position on the shader to draw from
width|`Number`|The width of the region to draw
height|`Number`|The height of the region to draw

# Transform
The transform object wraps a homogeneous 2D transformation matrix. Several different transform functions are provided, but the matrix can also be filled by hand. Transform objects are used in the global transformation stack to transform everything that is being rendered.

## Functions
Function | Description
-|-
[`Transform()`](#transform-1)|Constructs as identity transform
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
[`invert()`](#invert)|Invert

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

### `invert()`
Invert this transformation.

# Color
This object represents a color with a red, green, blue and alpha component.

## Functions
Function | Description
-|-
[`Color(r, g, b)`](#colorr-g-b)|Construct from RGB
[`Color(r, g, b, a)`](#colorr-g-b-a)|Construct from RGBA
[`toHSV()`](#tohsv)|Convert to HSV values
[`toHex()`](#tohex)|Convert to hexadecimal string
[`copy()`](#copy-1)|Copy this color
[`add(color)`](#addcolor)|Adds another color to itself
[`multiply(color)`](#multiplycolor)|Multiplies with another color

## Global functions
Function | Description
-|-
[`fromHSV(h, s, v)`](#fromhsvh-s-v)|Constructs a color from hue, saturation and value
[`fromHex(hex)`](#fromhexhex)|Constructs a color from a hexadecimal string

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

Parameter | Type | Description
-|-|-
r|`Number`|Red value in the range [0, 1]
g|`Number`|Green value in the range [0, 1]
b|`Number`|Blue value in the range [0, 1]

### `Color(r, g, b, a)`
Constructs a color object from red, green, blue and alpha. The values must lie in the range [0, 1].

Parameter | Type | Description
-|-|-
r|`Number`|Red value in the range [0, 1]
g|`Number`|Green value in the range [0, 1]
b|`Number`|Blue value in the range [0, 1]
a|`Number`|Alpha value in the range [0, 1]

### `toHSV()`
Returns an object with the members `h`, `s` and `v`, representing this color's hue, saturation and value.

### `toHex()`
Returns a hexadecimal string representing this color. Note that hexadecimal color representations don't include an alpha channel, so this information is lost after converting the color.

### `copy()`
Returns a copy of this color.

### `add(color)`
Adds another color to itself.

Parameter | Type | Description
-|-|-
color|[`Color`](#Color)|A color object

### `multiply(color)`
Multiplies this color with another color.

Parameter | Type | Description
-|-|-
color|[`Color`](#Color)|A color object

### `fromHSV(h, s, v)`
Constructs a color from hue, saturation and value.

Parameter | Type | Description
-|-|-
h|`Number`|Hue value in the range [0, 1]
s|`Number`|Saturation value in the range [0, 1]
v|`Number`|Value value in the range [0, 1]

### `fromHex(hex)`
Constructs a color from a hexadecimal string. The string must not contain a prefix like `0x` or `#`. If the string has six characters, the red, green and blue components will be read from it. If the string has eight characters, the alpha channel will also be read.

# Vector
This object represents a vector in 2D space. Several useful vector operation functions are provided.

## Functions
Function | Description
-|-
[`Vector(x, y)`](#vectorx-y)|Construct from x and y
[`copy()`](#copy-2)|Returns a copy
[`add(vector)`](#addvector)|Add
[`subtract(vector)`](#subtractvector)|Subtract
[`negate()`](#negate)|Negate
[`dot(vector)`](#dotvector)|Dot product
[`length()`](#length)|Length
[`multiply(scalar)`](#multiplyscalar)|Multiply
[`divide(scalar)`](#dividescalar)|Divide
[`normalize()`](#normalize)|Normalize
[`rotate(angle)`](#rotateangle-2)|Rotate
[`angle()`](#angle)|Returns the angle
[`equals(vector)`](#equalsvector)|Checks for equality

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

### `rotate(angle)`
Rotates this vector by a given angle.

Parameter | Type | Description
-|-|-
angle|`Number`|An angle in radians.

### `angle()`
Returns the angle this vector is pointing towards.

### `equals(vector)`
Returns a boolean indicating whether the vector is equal to another vector.

Parameter | Type | Description
-|-|-
vector|[`Vector`](#vector)|A vector object

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
[`drawTriangle(color, x1, y1, x2, y2, x3, y3)`](#drawtrianglecolor-x1-y1-x2-y2-x3-y3)|Draws a colored triangle
[`drawTriangleGradient(color1, x1, y1, color2, x2, y2, color3, x3, y3)`](#drawtrianglegradientcolor1-x1-y1-color2-x2-y2-color3-x3-y3)|Draws a gradient triangle
[`fillRectangle(color, x, y, width, height)`](#fillrectanglecolor-x-y-width-height)|Draws a colored rectangle
[`fillRectangleGradient(color1, color2, color3, color4, x, y, width, height)`](#fillrectanglegradientcolor1-color2-color3-color4-x-y-width-height)|Draws a gradient rectangle
[`fillCircle(color, x, y, radius)`](#fillcirclecolor-x-y-radius)|Draws a colored circle
[`fillCircleGradient(colorStart, colorEnd, x, y, radius)`](#fillcirclegradientcolorstart-colorend-x-y-radius)|Draws a gradient circle

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

### `drawTriangle(color, x1, y1, x2, y2, x3, y3)`
Draws a colored triangle.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|The fill color
x1|`Number`|The first point's x coordinate
y1|`Number`|The first point's y coordinate
x2|`Number`|The second point's x coordinate
y2|`Number`|The second point's y coordinate
x3|`Number`|The third point's x coordinate
y3|`Number`|The third point's y coordinate

### `drawTriangleGradient(color1, x1, y1, color2, x2, y2, color3, x3, y3)`
Draws a triangle with a gradient fill. Each point has a color, and the colors are interpolated along the triangle.

Parameter | Type | Description
-|-|-
color1|[`Color`](#color)|The first point's color
x1|`Number`|The first point's x coordinate
y1|`Number`|The first point's y coordinate
color2|[`Color`](#color)|The second point's color
x2|`Number`|The second point's x coordinate
y2|`Number`|The second point's y coordinate
color3|[`Color`](#color)|The third point's color
x3|`Number`|The third point's x coordinate
y3|`Number`|The third point's y coordinate

### `fillRectangle(color, x, y, width, height)`
Draws a colored rectangle.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|The fill color
x|`Number`|The left top x coordinate
y|`Number`|The left top y coordinate
width|`Number`|The rectangle width
height|`Number`|The rectangle height

### `fillRectangleGradient(color1, color2, color3, color4, x, y, width, height)`
Draws a rectangle with a gradient fill. Each point has a color, and the colors are interpolated along the rectangle.

Parameter | Type | Description
-|-|-
color1|[`Color`](#color)|The left top color
color2|[`Color`](#color)|The right top color
color3|[`Color`](#color)|The left bottom color
color4|[`Color`](#color)|The right bottom color
x|`Number`|The left top x coordinate
y|`Number`|The left top y coordinate
width|`Number`|The rectangle width
height|`Number`|The rectangle height

### `fillCircle(color, x, y, radius)`
Draws a colored circle with a radius around an origin.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|The fill color
x|`Number`|The center's x coordinate
y|`Number`|The center's y coordinate
radius|`Number`|The circle radius

### `fillCircleGradient(colorStart, colorEnd, x, y, radius)`
Draws a gradient circle with a radius around an origin.

Parameter | Type | Description
-|-|-
colorStart|[`Color`](#color)|The color at the center
colorEnd|[`Color`](#color)|The color at the edge
x|`Number`|The center's x coordinate
y|`Number`|The center's y coordinate
radius|`Number`|The circle radius

# Mesh
The _mesh_ namespace exposes several functions which can be used for mesh rendering. Meshes consist of textured triangles; both [surfaces](#surface) and [sprites](#sprite) can be used as a source texture.

## Functions

Function | Description
-|-
[`drawTriangle(source, x1, y1, u1, v1, x2, y2, u2, v2, x3, y3, u3, v3)`](#drawtrianglesource-x1-y1-u1-v1-x2-y2-u2-v2-x3-y3-u3-v3)|Draws a textured triangle

### `drawTriangle(source, x1, y1, u1, v1, x2, y2, u2, v2, x3, y3, u3, v3)`
Draws a textured triangle. The source can be either a [surface](#surface) or a [sprite](#sprite). If a sprite is used as the source, the current frame of the sprite is used. Note that texture coordinates range from 0 to 1.

Parameter | Type | Description
-|-|-
source|[`Surface`](#surface) or [`Sprite`](#sprite)|The image to draw a part of
x1|`Number`|The first point's x coordinate
y1|`Number`|The first point's y coordinate
u1|`Number`|The first point's texture x coordinate
v1|`Number`|The first point's texture y coordinate
x2|`Number`|The second point's x coordinate
y2|`Number`|The second point's y coordinate
u2|`Number`|The second point's texture x coordinate
v2|`Number`|The second point's texture y coordinate
x3|`Number`|The third point's x coordinate
y3|`Number`|The third point's y coordinate
u3|`Number`|The third point's texture x coordinate
v3|`Number`|The third point's texture y coordinate

# Utils

## Functions

Function | Description
-|-
[`loop(update)`](#loopupdate)|Calls the function _update_ on every vertical sync

### `loop(update)`
After calling this function, the provided _update_ function is called for every vertical synchronization. This usually means the function is called sixty frames per second. The argument _timeStep_ is passed to the function, which is the portion of a second the current frame takes; this will be 1/60 when the browser updates at 60 frames per second. When rendering at this frequency, screen tearing is usually prevented.

The _update_ function should return a boolean. As long as `true` is returned, the function keeps being called; when `false` is returned, the loop stops.

Parameter | Type | Description
-|-|-
update|`Function`|A function that is called for every update
