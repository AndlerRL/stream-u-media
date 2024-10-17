"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformRecursiveSchema = void 0;
const tslib_1 = require("tslib");
const typescript_1 = tslib_1.__importStar(require("typescript"));
/**
 * Type hint zod to deal with recursive types.
 *
 * https://github.com/colinhacks/zod/tree/v3#recursive-types
 */
function transformRecursiveSchema(zodImportValue, zodStatement, typeName) {
    const declaration = zodStatement.declarationList.declarations[0];
    if (!declaration.initializer) {
        throw new Error("Invalid zod statement");
    }
    return typescript_1.factory.createVariableStatement(zodStatement.modifiers, typescript_1.factory.createVariableDeclarationList([
        typescript_1.factory.createVariableDeclaration(declaration.name, undefined, typescript_1.factory.createTypeReferenceNode(`${zodImportValue}.ZodSchema`, [
            typescript_1.factory.createTypeReferenceNode(typeName),
        ]), typescript_1.factory.createCallExpression(typescript_1.factory.createPropertyAccessExpression(typescript_1.factory.createIdentifier(zodImportValue), typescript_1.factory.createIdentifier("lazy")), undefined, [
            typescript_1.factory.createArrowFunction(undefined, undefined, [], undefined, undefined, declaration.initializer),
        ])),
    ], typescript_1.default.NodeFlags.Const));
}
exports.transformRecursiveSchema = transformRecursiveSchema;
//# sourceMappingURL=transformRecursiveSchema.js.map