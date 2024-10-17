import ts from "typescript";
export type TypeNode = ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration;
export declare function isTypeNode(node: ts.Node): node is TypeNode;
export declare function getExtractedTypeNames(node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | ts.EnumDeclaration, sourceFile: ts.SourceFile): string[];
