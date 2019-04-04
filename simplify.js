/*
 2019, bojko108 <bojko108@gmail.com>
 Written as ES6 module. The method also accepts arrays of coordinates not 
 only objects with x and y properties.

 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

// square distance between 2 points
const getSqDist = (p1, p2) => {
  const dx = (p1.x || p1[0]) - (p2.x || p2[0]),
    dy = (p1.y || p1[1]) - (p2.y || p2[1]);
  return dx * dx + dy * dy;
};

// square distance from a point to a segment
const getSqSegDist = (p, p1, p2) => {
  let x = p1.x || p1[0],
    y = p1.y || p1[1],
    dx = (p2.x || p2[0]) - x,
    dy = (p2.y || p2[1]) - y;

  if (dx !== 0 || dy !== 0) {
    let t = (((p.x || p[0]) - x) * dx + ((p.y || p[1]) - y) * dy) / (dx * dx + dy * dy);

    if (t > 1) {
      x = p2.x || p2[0];
      y = p2.y || p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = (p.x || p[0]) - x;
  dy = (p.y || p[1]) - y;

  return dx * dx + dy * dy;
};
// rest of the code doesn't care about point format

// basic distance-based simplification
const simplifyRadialDist = (points, sqTolerance) => {
  let prevPoint = points[0],
    newPoints = [prevPoint],
    point;

  for (let i = 1, len = points.length; i < len; i++) {
    point = points[i];

    if (getSqDist(point, prevPoint) > sqTolerance) {
      newPoints.push(point);
      prevPoint = point;
    }
  }

  if (prevPoint !== point) newPoints.push(point);

  return newPoints;
};

const simplifyDPStep = (points, first, last, sqTolerance, simplified) => {
  let maxSqDist = sqTolerance,
    index;

  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);

    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (maxSqDist > sqTolerance) {
    if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index]);
    if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
};

// simplification using Ramer-Douglas-Peucker algorithm
const simplifyDouglasPeucker = (points, sqTolerance) => {
  const last = points.length - 1;

  let simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);

  return simplified;
};

// both algorithms combined for awesome performance
const simplify = (points, tolerance, highestQuality) => {
  if (points.length <= 2) return points;

  const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

  points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
  points = simplifyDouglasPeucker(points, sqTolerance);

  return points;
};

(function() {
  'use strict';

  // export as AMD module / Node module / browser or worker variable
  if (typeof define === 'function' && define.amd)
    define(function() {
      return simplify;
    });
  else if (typeof module !== 'undefined') {
    module.exports = simplify;
    module.exports.default = simplify;
  } else if (typeof self !== 'undefined') self.simplify = simplify;
  else window.simplify = simplify;
})();
