"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateIntegrationTests = void 0;
const typescript_1 = require("typescript");
/**
 * Generate integration tests to validate if the generated zod schemas
 * are equals to the originals types.
 *
 * ```ts
 * expectType<${tsType}>({} as ${zodType})
 * expectType<${zodType}>({} as ${tsType})
 * ```
 */
function generateIntegrationTests(testCases) {
    return testCases
        .map((testCase) => [
        typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("expectType"), [typescript_1.factory.createTypeReferenceNode(testCase.tsType)], [
            typescript_1.factory.createAsExpression(typescript_1.factory.createObjectLiteralExpression(), typescript_1.factory.createTypeReferenceNode(testCase.zodType)),
        ]),
        typescript_1.factory.createCallExpression(typescript_1.factory.createIdentifier("expectType"), [typescript_1.factory.createTypeReferenceNode(testCase.zodType)], [
            typescript_1.factory.createAsExpression(typescript_1.factory.createObjectLiteralExpression(), typescript_1.factory.createTypeReferenceNode(testCase.tsType)),
        ]),
    ])
        .reduce((mem, i) => [...mem, ...i], []);
}
exports.generateIntegrationTests = generateIntegrationTests;
//# sourceMappingURL=generateIntegrationTests.js.map