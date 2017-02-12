# react-generic-proptypes

A React Proptype Validator to check if passed prop is following generic predicates

# Example

``` jsx
var genericProptype = require('react-generic-proptypes').genericProptype;

const TestClass = React.createClass({
  propTypes : {
    testComplexProp : genericProptype(
      'object',
      function(obj) {
        return typeof obj === 'object';
      },
      'ComplexType',
      function (obj) {
        return obj && obj.foo === 456;
      }
    )
  },
  render() {
    return null;
  },
});

// Class Use
<TestClass testComplexProp={{ foo: 456 }} />

```

# Tests

- `npm test` for running unit tests
- `npm run coverage` for current test coverage

