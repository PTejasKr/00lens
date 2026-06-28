// simple utility fns — replace w/ actual service logic

function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

// factorial, iterative to avoid stack overflow
function factorial(n) {
  if (n < 0) throw new Error('negative input');
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

module.exports = { add, multiply, factorial };
