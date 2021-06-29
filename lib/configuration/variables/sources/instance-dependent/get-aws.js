'use strict';

const ensureString = require('type/string/ensure');
const ServerlessError = require('../../../../serverless-error');

module.exports = (serverlessInstance) => {
  return {
    resolve: async ({ address }) => {
      if (!address) {
        throw new ServerlessError(
          'Missing address argument in variable "aws" source',
          'MISSING_AWS_SOURCE_ADDRESS'
        );
      }

      address = ensureString(address, {
        Error: ServerlessError,
        errorMessage: 'Non-string address argument in variable "sls" source: %v',
        errorCode: 'INVALID_AWS_SOURCE_ADDRESS',
      });

      if (address === 'accountId') {
        const { Account } = await serverlessInstance
          .getProvider('aws')
          .request('STS', 'getCallerIdentity', {}, { useCache: true });
        return { value: Account };
      }
      throw new ServerlessError(
        `Unsupported "${address}" address argument in variable "aws" source`,
        'UNSUPPORTED_AWS_SOURCE_ADDRESS'
      );
    },
  };
};
