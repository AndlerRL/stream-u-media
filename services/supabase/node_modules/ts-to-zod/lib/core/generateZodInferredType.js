"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateZodInferredType = void 0;
const tslib_1 = require("tslib");
const typescript_1 = tslib_1.__importStar(require("typescript"));
/**
 * Generate zod inferred type.
 *
 * ```ts
 *  export type ${aliasName} = ${zodImportValue}.infer<typeof ${zodConstName}>
 * ```
 */
function generateZodInferredType({ aliasName, zodImportValue, zodConstName, }) {
    return typescript_1.factory.createTypeAliasDeclaration([typescript_1.factory.createModifier(typescript_1.default.SyntaxKind.ExportKeyword)], typescript_1.factory.createIdentifier(aliasName), undefined, typescript_1.factory.createTypeReferenceNode(typescript_1.factory.createQualifiedName(typescript_1.factory.createIdentifier(zodImportValue), typescript_1.factory.createIdentifier("infer")), [typescript_1.factory.createTypeQueryNode(typescript_1.factory.createIdentifier(zodConstName))]));
}
exports.generateZodInferredType = generateZodInferredType;
//# sourceMappingURL=generateZodInferredType.js.map