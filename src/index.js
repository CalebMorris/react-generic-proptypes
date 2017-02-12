var ANONYMOUS = '<<anonymous>>';

var ReactPropTypeLocationNames = {
  prop : 'prop',
  context : 'context',
  childContext : 'child context',
};

function validateProp(
  expectedPrimitiveType,
  primitiveTypeValidator,
  valueValidator,
  propValue,
  location,
  invalidValueBaseMessage
) {
  if (primitiveTypeValidator && !primitiveTypeValidator(propValue)) {
    return new Error(
      'Invalid input type' + invalidValueBaseMessage +
        '`, expected `' + expectedPrimitiveType + '`.'
    );
  }

  if (! valueValidator(propValue)) {
    var validationName = valueValidator.name;
    var message = 'Invalid ' + location + invalidValueBaseMessage +
        '`, expected to be successfully validated';
    if (validationName) {
      message += 'with `' + validationName + '`.';
    } else {
      message += 'with supplied validator.';
    }

    return new Error(message);
  }

  return null;
}

function validateAndBuildConstructionArguments(
  expectedPrimitiveType,
  primitiveTypeValidator,
  valueValidator,
) {
  var constructionObject = {};

  if (typeof expectedPrimitiveType === 'object' && arguments.length === 1) {
    // Unwrap if packed into single option
    var constructionArgument = expectedPrimitiveType;
    constructionObject.expectedPrimitiveType = constructionArgument.expectedPrimitiveType;
    constructionObject.primitiveTypeValidator = constructionArgument.primitiveTypeValidator;
    constructionObject.valueValidator = constructionArgument.valueValidator;
  } else {
    constructionObject.expectedPrimitiveType = expectedPrimitiveType;
    constructionObject.primitiveTypeValidator = primitiveTypeValidator;
    constructionObject.valueValidator = valueValidator;
  }

  if (typeof constructionObject.expectedPrimitiveType !== 'string') {
    throw new Error('`expectedPrimitiveType` must type `string`.');
  }
  if (typeof constructionObject.primitiveTypeValidator !== 'function') {
    throw new Error('`primitiveTypeValidator` must type `function`.');
  }
  if (typeof constructionObject.valueValidator !== 'function') {
    throw new Error('`valueValidator` must type `function`.');
  }

  return constructionObject;
}

function createGenericProptypeChecker(
  expectedPrimitiveType,
  primitiveTypeValidator,
  valueValidator,
) {
  var constructionObject = validateAndBuildConstructionArguments.apply(null, arguments);

  expectedPrimitiveType = constructionObject.expectedPrimitiveType;
  primitiveTypeValidator = constructionObject.primitiveTypeValidator;
  valueValidator = constructionObject.valueValidator;

  function propValidator(
    isRequired, // Bound parameter to indicate with the propType is required
    props,
    propName,
    componentName,
    location,
    propFullName
  ) {
    if (isRequired) {
      var locationName = ReactPropTypeLocationNames[ location ];
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;
      if (!props.hasOwnProperty(propName)) {
        return new Error(
          'Required ' + locationName + ' `' + propFullName +
          '` was not specified in `' + componentName + '`.'
        );
      }
    }

    var propValue = props[ propName ];
    var propType = typeof propValue;

    if (typeof propValue === 'undefined' || propValue === null) {
      return null;
    }

    var invalidValueBaseMessage = ': `' + propName + '` of type `' + propType + '` ' +
      'supplied to `' + componentName;

    return validateProp(
      expectedPrimitiveType,
      primitiveTypeValidator,
      valueValidator,
      propValue,
      location,
      invalidValueBaseMessage
    );

  }

  var requiredPropValidator = propValidator.bind(null, false);
  requiredPropValidator.isRequired = propValidator.bind(null, true);

  return requiredPropValidator;

}

module.exports = {
  genericProptype: createGenericProptypeChecker
};
