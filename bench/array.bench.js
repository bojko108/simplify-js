const Benchmark = require('benchmark');
const simplify = require('../simplify');

const points = require('../test/fixtures/1k.array.json');

console.log('\nAs Array: Benchmarking simplify on ' + points.length + ' points...');

new Benchmark.Suite()
  .add('simplify (HQ)', function() {
    simplify(points, 1, true);
  })
  .add('simplify', function() {
    simplify(points, 1, false);
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .run();
