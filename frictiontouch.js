FrictionTouch = function(element, options) {
  if (!element) {
    throw Error('FrictionTouch: element must be provided.');
  }

  var nonNegOpts = ['flickDuration', 'flickThreshold', 'friction', 'maxRotation', 'returnDuration'];
  options = options || {};
  for (var opt in nonNegOpts) {
    if (options[nonNegOpts[opt]] < 0) {
      throw Error('FrictionTouch: ' + nonNegOpts[opt] + ' must be non-negative.');
    }
  }

  var width, height, elemPos, start, angle, rotationScale, cachedOld, cachedNew;
  var refershRate = 30, // update travel cache (cachedOld, cachedNew) every 30ms
      flickDuration = options.flickDuration || 500,
      flickThreshold = options.flickThreshold || 1,
      friction = options.friction || 2,
      maxRotation = options.maxRotation || 1.5,
      returnDuration = options.flickDuration || 200;

  setLayout();
  register();

  return {
    unbind: unregister
  };

  function setLayout() {
    width = element.offsetWidth;
    height = element.offsetHeight;
    elemPos = findPos();
  }

  function register() {
    element.addEventListener('touchstart', touchStart);
    element.addEventListener('touchmove', touchMove);
    element.addEventListener('touchend', touchEnd);
    window.addEventListener('resize', setLayout);
  }

  function unregister() {
    element.removeEventListener('touchstart', touchStart);
    element.removeEventListener('touchmove', touchMove);
    element.removeEventListener('touchend', touchEnd);
    window.removeEventListener('resize', setLayout);
  }

  function touchStart(event) {
    event.preventDefault();
    element.style.transition = '';

    start = {
      x: event.targetTouches[0].pageX,
      y: event.targetTouches[0].pageY
    };

    var centerOffset = {
      x: start.x - elemPos.x - width/2,
      y: start.y - elemPos.y - height/2
    };

    var ratioArctan = Math.atan(centerOffset.x/centerOffset.y);
    angle = {
      x: Math.sign(centerOffset.x)*ratioArctan - Math.sign(centerOffset.y)*Math.PI/2,
      y: Math.sign(centerOffset.y)*ratioArctan
    };

    rotationScale = {
      x: friction*Math.abs(centerOffset.y)/(width*height),
      y: friction*Math.abs(centerOffset.x)/(width*height)
    };
  }

  function touchMove(event) {
    event.preventDefault();

    var delta = {
      x: event.targetTouches[0].pageX - start.x,
      y: event.targetTouches[0].pageY - start.y
    };
    var rotate = angle.x*absMax(delta.x*rotationScale.x, maxRotation) + angle.y*absMax(delta.y*rotationScale.y, maxRotation);

    applyTransformOrigin(event.targetTouches[0].pageX - elemPos.x, event.targetTouches[0].pageY - elemPos.y);
    applyTransform(delta.x, delta.y, rotate);

    var time = (new Date).getTime();
    if (!cachedNew || time - cachedNew.time > refershRate) {
      cachedOld = cachedNew;

      cachedNew = {
        time: time,
        x: delta.x,
        y: delta.y,
        rotate: rotate
      };
    }
  }

  function touchEnd(event) {
    event.preventDefault();

    if (!cachedOld) {
      finishTranisition({ x: 0, y: 0, rotate: 0 }, returnDuration);
      return;
    }

    var diff = (cachedNew.time - cachedOld.time) || Infinity;
    var destination = {
      x: flickDuration*((cachedNew.x - cachedOld.x) || 0)/diff,
      y: flickDuration*((cachedNew.y - cachedOld.y) || 0)/diff,
      rotate: flickDuration*((cachedNew.rotate - cachedOld.rotate) || 0)/diff
    };

    var flicked = Math.abs(destination.x/width) > flickThreshold || Math.abs(destination.y/height) > flickThreshold;
    options.flicked && options.flicked(flicked);

    if (flicked) {
      finishTranisition(destination, flickDuration);
    } else {
      finishTranisition({ x: 0, y: 0, rotate: 0 }, returnDuration);
    }
  }

  function finishTranisition(destination, time) {
    element.style.transition = time + 'ms linear';

    applyTransformOrigin(destination.x, destination.y);
    applyTransform(destination.x, destination.y, destination.rotate);

    setTimeout(function() {
      element.style.transition = '';

      if (options.resetPosition) {
        applyTransform(0, 0, 0);
      }

      options.complete && options.complete();
    }, time);
  }

  function applyTransform(x, y, rotate) {
    var transform = 'rotate(' + rotate + 'rad) translate(' + x + 'px, ' + y + 'px) translateZ(0)';
    element.style.webkitTransform = transform;
    element.style.msTransform = transform;
    element.style.transform = transform;
  }

  function applyTransformOrigin(x, y) {
    var origin = x + 'px ' + y + 'px';
    element.style.webkitTransformOrigin = origin;
    element.style.msTransformOrigin = origin;
    element.style.transformOrigin = origin;
  }

  function findPos() {
    var elem = element,
        left = 0,
        top  = 0;

    do {
      left += elem.offsetLeft;
      top += elem.offsetTop;
    } while (elem = elem.offsetParent);

    return {
      x: left,
      y: top
    };
  }

  function absMax(value, max) {
    return Math.max(Math.min(value, max), -1*max);
  }
};
