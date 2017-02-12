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

    it('should throw on invalid arugment 3', () => {
      
      expect(() => {
        genericProptype(
          'string',
          function(obj) {
            return typeof obj === 'string';
          },
          'ComplexType',
          null
        );
      }).to.throw(Error);

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
            'ComplexType',
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
        expectedValueType: 'ComplexType',
        valueValidator: function isValid(value) {
          return true;
        }
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
        expectedValueType: 'ComplexType',
        valueValidator: function isValid(value) {
          return true;
        }
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
            'ComplexType',
            function isValid(value) {
              return true;
            }
          ),
          testObject : genericProptype(
            'object',
            function(obj) {
              return typeof obj === 'object';
            },
            'ComplexType',
            function isValid(value) {
              return true;
            }
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
            'ComplexType',
            function isValid(obj) {
              return obj && obj.foo === 456;
            }
          )
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

});
