'use strict';

const { expect } = require('chai');

const resolveMeta = require('../../../../../../../lib/configuration/variables/resolve-meta');
const resolve = require('../../../../../../../lib/configuration/variables/resolve');
const selfSource = require('../../../../../../../lib/configuration/variables/sources/self');
const getAwsSource = require('../../../../../../../lib/configuration/variables/sources/instance-dependent/get-aws');

describe('test/unit/lib/configuration/variables/sources/instance-dependent/get-aws.test.js', () => {
  let configuration;
  let variablesMeta;
  let serverlessInstance;

  before(async () => {
    configuration = {
      service: 'foo',
      provider: { name: 'aws' },
      custom: {
        validAddress: '${aws:accountId}',
        missingAddress: '${aws:}',
        invalidAddress: '${aws:invalid}',
        nonStringAddress: '${aws:${self:custom.someObject}}',
        someObject: {},
      },
    };
    variablesMeta = resolveMeta(configuration);

    serverlessInstance = {
      getProvider: () => ({
        request: async () => {
          return {
            Account: '1234567890',
          };
        },
      }),
    };

    await resolve({
      serviceDir: process.cwd(),
      configuration,
      variablesMeta,
      sources: { self: selfSource, aws: getAwsSource(serverlessInstance) },
      options: {},
      fulfilledSources: new Set(['s3', 'self']),
    });
  });

  it('should resolve `accountId`', () => {
    expect(configuration.custom.validAddress).to.equal('1234567890');
  });

  it('should report with an error missing address', () =>
    expect(variablesMeta.get('custom\0missingAddress').error.code).to.equal(
      'VARIABLE_RESOLUTION_ERROR'
    ));

  it('should report with an error invalid address', () =>
    expect(variablesMeta.get('custom\0invalidAddress').error.code).to.equal(
      'VARIABLE_RESOLUTION_ERROR'
    ));

  it('should report with an error a non-string address', () =>
    expect(variablesMeta.get('custom\0nonStringAddress').error.code).to.equal(
      'VARIABLE_RESOLUTION_ERROR'
    ));
});
