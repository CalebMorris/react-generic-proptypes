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

  var validatorCount = valueValidator.length;
  for (var i = 0; i < validatorCount; i++) {
    var validatorInfo = valueValidator[i];
    var validatorPredicate = validatorInfo.validationPredicate;
    var validatorFailureMessage = validatorInfo.failureMessage;
    if (! validatorPredicate(propValue)) {
      var message = 'Invalid ' + location + invalidValueBaseMessage + '`, ';

      if (validatorFailureMessage) {
        message += validatorFailureMessage;
      } else {
        message += 'expected to be successfully validated';
        var validationName = validatorPredicate.name;
        if (validationName) {
          message += ' with validator [' + i + '] `' + validationName + '`.';
        } else {
          message += ' with supplied validator [' + i + '].';
        }
      }

      return new Error(message);
    }
  }

  return null;
}

function unpackValidator(valueValidator) {
  var valueValidatorType = typeof valueValidator;
  if (Array.isArray(valueValidator)) {
    var multiValidators = [];
    for (var i = 0; i < valueValidator.length; i++) {
      var wrappedSingleValitor = unpackValidator(valueValidator[i]);
      multiValidators.push(wrappedSingleValitor[0]);
    }
    return multiValidators;
  } else if (valueValidatorType === 'object') {
    if (valueValidator.failureMessage && typeof valueValidator.failureMessage !== 'string') {
      throw new Error('`failureMessage` must type `string`.');
    }
    if (valueValidator.validationPredicate && typeof valueValidator.validationPredicate !== 'function') {
      throw new Error('`validationPredicate` must type `function`.');
    }
    return [ valueValidator ];
  } else if (valueValidatorType !== 'function') {
    throw new Error('`valueValidator` must type `function`.');
  } else {
    return [ { validationPredicate : valueValidator } ];
  }
}

function validateAndBuildConstructionArguments(
  expectedPrimitiveType,
  primitiveTypeValidator,
  valueValidator
) {
  var constructionObject = {};

  if (typeof expectedPrimitiveType === 'object' && arguments.length === 1) {
    // Unwrap if packed into single option
    var constructionArgument = expectedPrimitiveType;
    constructionObject.expectedPrimitiveType = constructionArgument.expectedPrimitiveType;
    constructionObject.primitiveTypeValidator = constructionArgument.primitiveTypeValidator;
    constructionObject.valueValidator = unpackValidator(constructionArgument.valueValidator);
  } else {
    constructionObject.expectedPrimitiveType = expectedPrimitiveType;
    constructionObject.primitiveTypeValidator = primitiveTypeValidator;
    constructionObject.valueValidator = unpackValidator(valueValidator);
  }

  if (typeof constructionObject.expectedPrimitiveType !== 'string') {
    throw new Error('`expectedPrimitiveType` must type `string`.');
  }
  if (typeof constructionObject.primitiveTypeValidator !== 'function') {
    throw new Error('`primitiveTypeValidator` must type `function`.');
  }

  return constructionObject;
}

function createGenericProptypeChecker(
  expectedPrimitiveType,
  primitiveTypeValidator,
  valueValidator
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
      'supplied to `' + componentName + '`';

    return validateProp(
      expectedPrimitiveType,
      primitiveTypeValidator,
      valueValidator,
      propValue,
      location,
      invalidValueBaseMessage
    );

  }

  function wrappedPropValidator() {
    try {
      return propValidator.apply(null, arguments);
    } catch (err) {
      return new Error('Internal failure: ' + err.stack);
    }
  }

  var requiredPropValidator = wrappedPropValidator.bind(null, false);
  requiredPropValidator.isRequired = wrappedPropValidator.bind(null, true);

  return requiredPropValidator;

}

module.exports = {
  genericProptype: createGenericProptypeChecker,
};
