import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import {
  constructWarningsMessage,
  createComponentSnapshot,
} from './util';

const warningRegex = /^Warning/;

import { genericProptype } from '../src/index';

describe('ProptypeTests', () => {

  let warnings = [];
  let consoleErrorStub;

  beforeEach(() => {

    consoleErrorStub = sinon.stub(console, 'error', function recordWarnings() {
      for (let i = 0; i < arguments.length; i++) {
        const arg = arguments[ i ];
        if (warningRegex.test(arg)) {
          warnings.push(arg);
        }
      }
    });

  });

  afterEach(() => {

    warnings = [];

    if (consoleErrorStub) {
      consoleErrorStub.restore();
    }

  });

  describe('Invalid Arguments', () => {

    it('should throw on invalid arugment 0', () => {

      expect(() => {
        genericProptype(null);
      }).to.throw(Error);

      expect(() => {
        genericProptype({});
      }).to.throw(Error);

    });

    it('should throw on invalid arugment 1', () => {

      expect(() => {
        genericProptype('string', null);
      }).to.throw(Error);

    });

    it('should throw on invalid arugment 2', () => {

      expect(() => {
        genericProptype(
          'string',
          function(obj) {
            return typeof obj === 'string';
          },
          null
        );
      }).to.throw(Error);

    });

    it('should throw on invalid validation predicate', () => {

      expect(() => {
        genericProptype(
          'string',
          function(obj) {
            return typeof obj === 'string';
          },
          {
            validationPredicate: 'invalid-predicate',
          }
        );
      }).to.throw(Error);

    });

    it('should throw on invalid validation message', () => {

      expect(() => {
        genericProptype(
          'string',
          function(obj) {
            return typeof obj === 'string';
          },
          {
            validationPredicate: () => true,
            failureMessage: () => true,
          }
        );
      }).to.throw(Error);

    });

    it('should warn with stack-trace if an error occured when validating', () => {
      const errorKey = 'lkj-12lk3j-sdfkj';
      const TestClass = React.createClass({
        propTypes : {
          testComplexProp : genericProptype(
            'object',
            function(obj) {
              return typeof obj === 'object';
            },
            function validatorThrows(obj) {
              throw new Error(errorKey);
            },
          ),
        },
        render() {
          return null;
        },
      });
      const testProps = { testComplexProp: {} };
      const snapshot = createComponentSnapshot(TestClass, testProps);

      expect(snapshot).to.be.null;
      expect(warnings).to.be.an('array', constructWarningsMessage(warnings));
      expect(warnings.length).to.equal(1, constructWarningsMessage(warnings));
      expect(warnings[0]).to.not.contain('Invalid prop', constructWarningsMessage(warnings));
      expect(warnings[0]).to.not.contain('`testComplexProp`', constructWarningsMessage(warnings));
      expect(warnings[0]).to.not.contain('`validatorThrows`', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain(errorKey, constructWarningsMessage(warnings));
    });

  });

  describe('Success', () => {

    it('should have no warnings valid individual arguments', () => {
      const TestClass = React.createClass({
        propTypes : {
          testProp : genericProptype(
            'object',
            function(obj) {
              return typeof obj === 'object';
            },
            function isValid(value) {
              return true;
            }
          ),
        },
        render() {
          return null;
        },
      });
      const testProps = { testProp: {} };
      const snapshot = createComponentSnapshot(TestClass, testProps);

      expect(snapshot).to.be.null;
      expect(warnings).to.be.an('array', constructWarningsMessage(warnings));
      expect(warnings.length).to.equal(0, constructWarningsMessage(warnings));

    });

    it('should have no warnings valid construction object', () => {
      const fullConstruction = {
        expectedPrimitiveType: 'object',
        primitiveTypeValidator: function(obj) {
          return typeof obj === 'object';
        },
        valueValidator: function isValid(value) {
          return true;
        },
      };
      const TestClass = React.createClass({
        propTypes : {
          testProp : genericProptype(fullConstruction),
        },
        render() {
          return null;
        },
      });
      const testProps = { testProp: {} };
      const snapshot = createComponentSnapshot(TestClass, testProps);

      expect(snapshot).to.be.null;
      expect(warnings).to.be.an('array', constructWarningsMessage(warnings));
      expect(warnings.length).to.equal(0, constructWarningsMessage(warnings));

    });

    it('should have no warnings for required correctly passed', () => {
      const fullConstruction = {
        expectedPrimitiveType: 'object',
        primitiveTypeValidator: function(obj) {
          return typeof obj === 'object';
        },
        valueValidator: function isValid(value) {
          return true;
        },
      };
      const TestClass = React.createClass({
        propTypes : {
          testProp : genericProptype(fullConstruction).isRequired,
        },
        render() {
          return null;
        },
      });
      const testProps = { testProp: {} };
      const snapshot = createComponentSnapshot(TestClass, testProps);

      expect(snapshot).to.be.null;
      expect(warnings).to.be.an('array', constructWarningsMessage(warnings));
      expect(warnings.length).to.equal(0, constructWarningsMessage(warnings));

    });

  });

  describe('PrimitiveTypeWarning', () => {

    it('should have warning for wrong type', () => {
      const TestClass = React.createClass({
        propTypes : {
          testString : genericProptype(
            'string',
            function(obj) {
              return typeof obj === 'string';
            },
            function isValid(value) {
              return true;
            },
          ),
          testObject : genericProptype(
            'object',
            function(obj) {
              return typeof obj === 'object';
            },
            function isValid(value) {
              return true;
            },
          ),
        },
        render() {
          return null;
        },
      });
      const testProps = {
        testString: {},
        testObject: 'test',
      };
      const snapshot = createComponentSnapshot(TestClass, testProps);

      expect(snapshot).to.be.null;
      expect(warnings).to.be.an('array', constructWarningsMessage(warnings));
      expect(warnings.length).to.equal(2, constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('Invalid input type', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('`string`', constructWarningsMessage(warnings));
      expect(warnings[1]).to.contain('Invalid input type', constructWarningsMessage(warnings));
      expect(warnings[1]).to.contain('`object`', constructWarningsMessage(warnings));

    });

  });

  describe('ComplexTypeWarning', () => {

    it('should have warning for wrong type with validator name', () => {
      const TestClass = React.createClass({
        propTypes : {
          testComplexProp : genericProptype(
            'object',
            function(obj) {
              return typeof obj === 'object';
            },
            function isValid(obj) {
              return obj && obj.foo === 456;
            }
          ),
        },
        render() {
          return null;
        },
      });
      const testProps = {
        testComplexProp: {
          foo: 123,
        },
      };
      const snapshot = createComponentSnapshot(TestClass, testProps);

      expect(snapshot).to.be.null;
      expect(warnings).to.be.an('array', constructWarningsMessage(warnings));
      expect(warnings.length).to.equal(1, constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('Invalid prop', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('`testComplexProp`', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('`isValid`', constructWarningsMessage(warnings));

    });

    it('should have warning for wrong type with message for anonymous validator', () => {
      const TestClass = React.createClass({
        propTypes : {
          testComplexProp : genericProptype(
            'object',
            function(obj) {
              return typeof obj === 'object';
            },
            function(obj) {
              return obj && obj.foo === 456;
            },
          ),
        },
        render() {
          return null;
        },
      });
      const testProps = {
        testComplexProp: {
          foo: 123,
        },
      };
      const snapshot = createComponentSnapshot(TestClass, testProps);

      expect(snapshot).to.be.null;
      expect(warnings).to.be.an('array', constructWarningsMessage(warnings));
      expect(warnings.length).to.equal(1, constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('Invalid prop', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('`testComplexProp`', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('supplied', constructWarningsMessage(warnings));
      expect(warnings[0]).to.not.contain('`isValid`', constructWarningsMessage(warnings));

    });

  });

  describe('Custom Warning', () => {

    it('should have warning with custom message', () => {
      const failureMessage = 'test-failure-message';
      const TestClass = React.createClass({
        propTypes : {
          testComplexProp : genericProptype(
            'object',
            function(obj) {
              return typeof obj === 'object';
            },
            {
              validationPredicate: function isValid(obj) {
                return obj && obj.foo === 456;
              },
              failureMessage : failureMessage,
            }
          ),
        },
        render() {
          return null;
        },
      });
      const testProps = {
        testComplexProp: {
          foo: 123,
        },
      };
      const snapshot = createComponentSnapshot(TestClass, testProps);

      expect(snapshot).to.be.null;
      expect(warnings).to.be.an('array', constructWarningsMessage(warnings));
      expect(warnings.length).to.equal(1, constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('Invalid prop', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('`testComplexProp`', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain(failureMessage, constructWarningsMessage(warnings));
      expect(warnings[0]).to.not.contain('`isValid`', constructWarningsMessage(warnings));

    });

  });

  describe('Multiple validators', () => {

    it('should have warning on first without trying second', () => {
      const TestClass = React.createClass({
        propTypes : {
          testComplexProp : genericProptype(
            'object',
            function(obj) {
              return typeof obj === 'object';
            },
            [
              function shouldFail(obj) {
                return false;
              },
              {
                validationPredicate: function shouldNeverReach(obj) {
                  throw new Error('Should not throw ever');
                },
              },
            ],
          ),
        },
        render() {
          return null;
        },
      });
      const testProps = {
        testComplexProp: {
          foo: 123,
        },
      };
      const snapshot = createComponentSnapshot(TestClass, testProps);

      expect(snapshot).to.be.null;
      expect(warnings).to.be.an('array', constructWarningsMessage(warnings));
      expect(warnings.length).to.equal(1, constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('Invalid prop', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('`testComplexProp`', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('`shouldFail`', constructWarningsMessage(warnings));
      expect(warnings[0]).to.not.contain('`shouldNeverReach`', constructWarningsMessage(warnings));
    });

    it('should have warning on second', () => {
      const TestClass = React.createClass({
        propTypes : {
          testComplexProp : genericProptype(
            'object',
            function(obj) {
              return typeof obj === 'object';
            },
            [
              function isValid(obj) {
                return true;
              },
              {
                validationPredicate: function isValid(obj) {
                  return false;
                },
              },
            ],
          ),
        },
        render() {
          return null;
        },
      });
      const testProps = {
        testComplexProp: {
          foo: 123,
        },
      };
      const snapshot = createComponentSnapshot(TestClass, testProps);

      expect(snapshot).to.be.null;
      expect(warnings).to.be.an('array', constructWarningsMessage(warnings));
      expect(warnings.length).to.equal(1, constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('Invalid prop', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('`testComplexProp`', constructWarningsMessage(warnings));
      expect(warnings[0]).to.contain('`isValid`', constructWarningsMessage(warnings));
    });

  });

});
