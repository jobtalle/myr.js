# myr.js

**myr.js** is a WebGL 2 based 2D graphics renderer. The engine is optimized for rendering large amounts of sprites, and also supports render targets, custom shaders, primitives and advanced transformations. There are no external dependencies. **myr.js** has been licensed under the [MIT license](LICENSE). All source code is contained in the [myr.js](js/myr.js) file.

# Documentation

## Initialization
**myr.js** can be initialized by calling the `Myr` function, which requires a canvas element as an argument. All global functions and objects are members of the returned object. The provided canvas must be able to provide a *WebGL 2* context.

Initialization would typically look like this:
```javascript
// Create a myr.js object
let myr = new Myr(document.getElementById("some-canvas-id"));

// Access myr.js functions and classes from here on
myr.setClearColor(new myr.Color(0.2, 0.5, 0.7));
```

## Objects
The **myr.js** object exposes several objects:

Object | Description
-|-
[`Surface`](#surface)|A render target which can be rendered to, which may be initialized to an existing image
[`Shader`](#shader)|A (custom) shader
[`Transform`](#transform)|A 2D transformation
[`Color`](#color)|A color containing a red, green, blue and alpha channel
[`Vector`](#vector)|A 2D vector


## Global functions
Global functions are members of the object returned by the `Myr` function. One of the most important tasks of the global functions is maintaining the transform stack. Everything that is rendered is transformed by the [`Transform`](#transform) on top of this stack. Before applying transformations, it is useful to first save the current transform state using the `push()` function. The `pop()` function can be called after the transformations are done to get back to the original state.

### `setClearColor(color)`
Set the clear color of the **myr.js** object. When `clear()` is called, the screen will be cleared using this color.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|A color which the canvas will be cleared to when `clear()` is called

### `clear()`
Clears the canvas to the currently set clear color.

### `bind()`
Binds the canvas as the current render target.

### `flush()`
This function finishes all previously given draw calls. This function should be called at the very end of the render loop.

### `free()`
Frees the **myr.js** object and the OpenGL objects it maintains. Note that this function does not free objects like [surfaces](#surface) and [shaders](#shader), these must be freed individually.

### `getTransform()`
Return the [transformation](#transform) which is currently on top of the stack.

### `push()`
Push the current [transformation](#transform) onto the stack, saving the current transformation state.

### `pop()`
Pop the current [transformation](#transform) from the stack, restoring the last pushed transformation.

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
x|`Number`|Horizontal shear
y|`Number`|Vertical shear

### `scale(x, y)`
Scale the current transformation

Parameter | Type | Description
-|-|-
x|`Number`|Horizontal scale
y|`Number`|Vertical scale

## Surface
A surface in **myr.js** can be a render target. After binding it using its member function `bind()`, all render calls render to this surface. The surface itself can also be rendered. Additionally, the surface may be constructed from images, making surfaces useful for large image or background rendering since large images don't fit well on sprite sheets.

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

### `bind()`
Binds the surface, making it the current render target until another one is bound.

### `setClearColor(color)`
Set the clear color of this surface. When `clear()` is called, the surface will be cleared using this color.

Parameter | Type | Description
-|-|-
color|[`Color`](#color)|A color which the canvas will be cleared to when `clear()` is called

### `clear()`
Clears the surface to the currently set clear color.

### `ready()`
Returns a `Boolean` indicating whether the surface is ready for use. Surfaces constructed from an image will be ready once the image is loaded. Surfaces that don't require an image are always immediately ready.

### `draw(x, y)`
Draws this surface on the currently bound target. Note that surfaces can only render to other targets, never to themselves.

Parameter | Type | Description
-|-|-
x|`Number`|The X position to render to
y|`Number`|The Y position to render to

### `getWidth()`
Returns the width of the surface.

### `getHeight()`
Returns the height of the surface.

### `free()`
Frees the surface and all memory allocated by it.

## Shader

## Transform

## Color

## Vector