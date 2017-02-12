# react-generic-proptypes

[![Build Status](https://travis-ci.org/CalebMorris/react-generic-proptypes.svg?branch=master)](https://travis-ci.org/CalebMorris/react-generic-proptypes)

A React Proptype Validator to check if passed prop is following generic predicates

Allows multiple validation steps with different messages

# Example

``` jsx
var genericProptype = require('react-generic-proptypes').genericProptype;

const TestClass = React.createClass({
  propTypes : {
    testSimpleProp : genericProptype(
      'object',
      function(obj) {
        return typeof obj === 'object';
      },
      'ComplexType',
      function (obj) {
        return obj && obj.foo === 456;
      }
    ),
    testComplexProp : genericProptype(
      'object',
      function(obj) {
        return typeof obj === 'object';
      },
      [
        function firstFunction(obj) {
          return true;
        },
        {
          validationPredicate: function(obj) {
            return true;
          },
        },
        {
          failureMessage: 'Custom error message appended to warning',
          validationPredicate: function shouldNeverReach(obj) {
            return true;
          },
        },
      ],
    ),
  },
  render() {
    return null;
  },
});

// Class Use
<TestClass testSimpleProp={{ 'test': 1 }}
           testComplexProp={{ foo: 456 }} />

```

# Tests

- `npm test` for running unit tests
- `npm run coverage` for current test coverage

