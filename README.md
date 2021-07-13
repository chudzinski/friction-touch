# FrictionTouch

[https://frictiontouch.chudzinski.ca](https://frictiontouch.chudzinski.ca)

## About

FrictionTouch enables web elements to respond to touch movement as though they were being dragged on top of a surface with static friction.

When an element is dragged from an off-center position, it will progressively rotate to balance its weight along the axis of travel. So for example, if a photo is dragged horizontally from its bottom edge, it will rotate instead of staying level. 

At the end of the touch gesture the direction of travel and rotation will continue given enough momentum. This enables the popular flick to dismiss gesture. On the other hand, if the touch gesture ends without much movement, the element will return to its starting position.

FrictionTouch will work in any modern browser that supports touch events and CSS animations. Browsers that do not support touch events (such as desktop browsers) will be unaffected.

## Usage

### Initialization

```
var element = document.querySelector('#element-id');
var options = {
  flicked: (f) => console.log(`flicked: ${f}`),
  complete: () => console.log('complete')
};
var frictionTouch = FrictionTouch(element, options);
```

### Cleanup

```
frictionTouch.unbind();
```

## Options

### complete

Callback called when the entire gesture has finished, including all post gesture animations.

All the animations will finish either `flickDuration` or `returnDuration` milliseconds after the `touchend` event triggers, depending on whether the `flickThreshold` was reached.

### flickDuration

Length of time in milliseconds that the animation will continue if the `flickThreshold` was reached. In this case the element will continue in its direction of travel and rotation.

Default: 500

### flicked

Callback called when the `touchend` event triggers.

At this point user interaction has stopped, but the post gesture animations will continue for either `flickDuration` or `returnDuration` milliseconds, depending on whether the `flickThreshold` was reached.

Parameters: flicked

flicked: true if the `flickThreshold` was reached, and false otherwise.

### flickThreshold

Threshold for whether at the end of the touch gesture, the element will continue in its direction of travel and rotation, or return to its starting position.

A flick is achieved when, at the moment `touchend` triggers, the element has sufficient momentum. A threshold of `x` means, the ratio of the distance traveled in the x or y axis during the `flickDuration` period, over the width or height of the element respectively, exceeds `x`. Higher threshold values require more momentum to trigger a flick.

Default: 1

### friction

Scale at which the element is rotated relative to distance moved. 

Higher values will result in much greater element rotation over an equal distance traveled.

Default: 2

### maxRotation

The maximum the element will rotate relative to the balance of its weight along the axis of travel.

This limit exists to prevent unusual rotation when the element travels a longer distance.

Default: 1.5

### resetPosition

Boolean for whether the element will return to its original position after it has been flicked.

If true and the `flickThreshold` has been reached, then the element transform position will be set to `0, 0` after the post gesture animations. If false and the `flickThreshold` has been reached, the element transform will not be reset after the post gesture animations.

The element will always return to its original position if the `flickThreshold` has not been reached, regardless of this value.

Default: false

### returnDuration

Length of time in milliseconds that the animation will continue if the `flickThreshold` was not reached. In this case the element will return to its original position.

Default: 200