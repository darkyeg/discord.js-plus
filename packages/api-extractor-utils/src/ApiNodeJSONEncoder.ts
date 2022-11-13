import type { ApiReturnTypeMixin } from '@microsoft/api-extractor-model';
import {
	type ApiModel,
	ApiDeclaredItem,
	type ApiPropertyItem,
	type ApiMethod,
	type ApiParameterListMixin,
	type ApiTypeParameterListMixin,
	type ApiClass,
	type ApiFunction,
	ApiItemKind,
	type ApiTypeAlias,
	type ApiEnum,
	type ApiInterface,
	type ApiMethodSignature,
	type ApiPropertySignature,
	type ApiVariable,
	type ApiItem,
	type ApiConstructor,
	type ApiItemContainerMixin,
} from '@microsoft/api-extractor-model';
import { generateTypeParamData } from './TypeParameterJSONEncoder.js';
import { type TokenDocumentation, resolveName, genReference, genToken, genParameter, generatePath } from './parse.js';
import type { DocBlockJSON } from './tsdoc/CommentBlock.js';
import type { AnyDocNodeJSON } from './tsdoc/CommentNode.js';
import { type DocNodeContainerJSON, nodeContainer } from './tsdoc/CommentNodeContainer.js';
import { createCommentNode } from './tsdoc/index.js';

export interface ReferenceData {
	name: string;
	path: string;
}

export interface InheritanceData {
	parentKey: string;
	parentName: string;
	path: string;
}

export interface ApiInheritableJSON {
	inheritanceData: InheritanceData | null;
}

export interface ApiItemJSON {
	comment: AnyDocNodeJSON | null;
	containerKey: string;
	deprecated: DocNodeContainerJSON | null;
	excerpt: string;
	excerptTokens: TokenDocumentation[];
	kind: string;
	name: string;
	path: string[];
	referenceData: ReferenceData;
	remarks: DocNodeContainerJSON | null;
	summary: DocNodeContainerJSON | null;
}

export interface ApiPropertyItemJSON extends ApiItemJSON, ApiInheritableJSON {
	optional: boolean;
	propertyTypeTokens: TokenDocumentation[];
	readonly: boolean;
}

export interface ApiTypeParameterListJSON {
	typeParameters: ApiTypeParameterJSON[];
}

export interface ApiTypeParameterJSON {
	commentBlock: DocBlockJSON | null;
	constraintTokens: TokenDocumentation[];
	defaultTokens: TokenDocumentation[];
	name: string;
	optional: boolean;
}

export interface ApiParameterListJSON {
	parameters: ApiParameterJSON[];
}

export interface ApiMethodSignatureJSON
	extends ApiItemJSON,
		ApiTypeParameterListJSON,
		ApiParameterListJSON,
		ApiInheritableJSON {
	mergedSiblings: ApiMethodSignatureJSON[];
	optional: boolean;
	overloadIndex: number;
	returnTypeTokens: TokenDocumentation[];
}

export interface ApiMethodJSON extends ApiMethodSignatureJSON {
	mergedSiblings: ApiMethodJSON[];
	protected: boolean;
	static: boolean;
}

export interface ApiParameterJSON {
	isOptional: boolean;
	name: string;
	paramCommentBlock: DocBlockJSON | null;
	tokens: TokenDocumentation[];
}

export interface ApiClassJSON extends ApiItemJSON, ApiTypeParameterListJSON {
	constructor: ApiConstructorJSON | null;
	extendsTokens: TokenDocumentation[];
	implementsTokens: TokenDocumentation[][];
	methods: ApiMethodJSON[];
	properties: ApiPropertyItemJSON[];
}

export interface ApiTypeAliasJSON extends ApiItemJSON, ApiTypeParameterListJSON {
	typeTokens: TokenDocumentation[];
}

export interface EnumMemberData {
	initializerTokens: TokenDocumentation[];
	name: string;
	summary: DocNodeContainerJSON | null;
}

export interface ApiEnumJSON extends ApiItemJSON {
	members: EnumMemberData[];
}

export interface ApiInterfaceJSON extends ApiItemJSON, ApiTypeParameterListJSON {
	extendsTokens: TokenDocumentation[][] | null;
	methods: ApiMethodSignatureJSON[];
	properties: ApiPropertyItemJSON[];
}

export interface ApiVariableJSON extends ApiItemJSON {
	readonly: boolean;
	typeTokens: TokenDocumentation[];
}

export interface ApiFunctionJSON extends ApiItemJSON, ApiTypeParameterListJSON, ApiParameterListJSON {
	mergedSiblings: ApiFunctionJSON[];
	overloadIndex: number;
	returnTypeTokens: TokenDocumentation[];
}

export interface ApiConstructorJSON extends ApiItemJSON, ApiParameterListJSON {
	protected: boolean;
}

export type FunctionLike = ApiDeclaredItem & ApiParameterListMixin & ApiReturnTypeMixin & ApiTypeParameterListMixin;

export class ApiNodeJSONEncoder {
	public static encode(model: ApiModel, node: ApiItem, version: string) {
		if (!(node instanceof ApiDeclaredItem)) {
			console.log(`Cannot serialize node of type ${node.kind}`);
			return undefined;
		}

		switch (node.kind) {
			case ApiItemKind.Class:
				return this.encodeClass(model, node as ApiClass, version);
			case ApiItemKind.Function:
				return this.encodeFunction(model, node as ApiFunction, version);
			case ApiItemKind.Interface:
				return this.encodeInterface(model, node as ApiInterface, version);
			case ApiItemKind.TypeAlias:
				return this.encodeTypeAlias(model, node as ApiTypeAlias, version);
			case ApiItemKind.Enum:
				return this.encodeEnum(model, node as ApiEnum, version);
			case ApiItemKind.Variable:
				return this.encodeVariable(model, node as ApiVariable, version);
			default:
				// console.log(`Unknown API item kind: ${node.kind}`);
				return undefined;
		}
	}

	public static encodeItem(model: ApiModel, item: ApiDeclaredItem, version: string): ApiItemJSON {
		const path = [];
		for (const _item of item.getHierarchy()) {
			switch (_item.kind) {
				case 'None':
				case 'EntryPoint':
				case 'Model':
					break;
				default:
					path.push(resolveName(_item));
			}
		}

		return {
			kind: item.kind,
			name: resolveName(item),
			referenceData: genReference(item, version),
			excerpt: item.excerpt.text,
			excerptTokens: item.excerpt.spannedTokens.map((token) => genToken(model, token, version)),
			remarks: item.tsdocComment?.remarksBlock
				? (createCommentNode(item.tsdocComment.remarksBlock, model, version, item.parent) as DocNodeContainerJSON)
				: null,
			summary: item.tsdocComment?.summarySection
				? (createCommentNode(item.tsdocComment.summarySection, model, version, item.parent) as DocNodeContainerJSON)
				: null,
			deprecated: item.tsdocComment?.deprecatedBlock
				? (createCommentNode(item.tsdocComment.deprecatedBlock, model, version, item.parent) as DocNodeContainerJSON)
				: null,
			path,
			containerKey: item.containerKey,
			comment: item.tsdocComment ? createCommentNode(item.tsdocComment, model, version, item.parent) : null,
		};
	}

	public static encodeParameterList(
		model: ApiModel,
		item: ApiDeclaredItem & ApiParameterListMixin,
		version: string,
	): { parameters: ApiParameterJSON[] } {
		return {
			parameters: item.parameters.map((param) => genParameter(model, param, version)),
		};
	}

	public static encodeTypeParameterList(
		model: ApiModel,
		item: ApiDeclaredItem & ApiTypeParameterListMixin,
		version: string,
	): ApiTypeParameterListJSON {
		return {
			typeParameters: item.typeParameters.map((param) => generateTypeParamData(model, param, version, item.parent)),
		};
	}

	public static encodeProperty(
		model: ApiModel,
		item: ApiPropertyItem,
		parent: ApiItemContainerMixin,
		version: string,
	): ApiPropertyItemJSON {
		return {
			...this.encodeItem(model, item, version),
			...this.encodeInheritanceData(item, parent, version),
			propertyTypeTokens: item.propertyTypeExcerpt.spannedTokens.map((token) => genToken(model, token, version)),
			readonly: item.isReadonly,
			optional: item.isOptional,
		};
	}

	public static encodeInheritanceData(
		item: ApiDeclaredItem,
		parent: ApiItemContainerMixin,
		version: string,
	): ApiInheritableJSON {
		return {
			inheritanceData:
				item.parent && item.parent.containerKey !== parent.containerKey
					? {
							parentKey: item.parent.containerKey,
							parentName: item.parent.displayName,
							path: generatePath(item.parent.getHierarchy(), version),
					  }
					: null,
		};
	}

	public static encodeFunctionLike(model: ApiModel, item: FunctionLike, version: string) {
		return {
			...this.encodeItem(model, item, version),
			...this.encodeParameterList(model, item, version),
			...this.encodeTypeParameterList(model, item, version),
			returnTypeTokens: item.returnTypeExcerpt.spannedTokens.map((token) => genToken(model, token, version)),
			overloadIndex: item.overloadIndex,
		};
	}

	public static encodeFunction(model: ApiModel, item: FunctionLike, version: string, nested = false): ApiFunctionJSON {
		return {
			...this.encodeFunctionLike(model, item, version),
			mergedSiblings: nested
				? []
				: item.getMergedSiblings().map((item) => this.encodeFunction(model, item as ApiFunction, version, true)),
		};
	}

	public static encodeMethodSignature(
		model: ApiModel,
		item: ApiMethodSignature,
		parent: ApiItemContainerMixin,
		version: string,
		nested = false,
	): ApiMethodSignatureJSON {
		return {
			...this.encodeFunctionLike(model, item, version),
			...this.encodeInheritanceData(item, parent, version),
			optional: item.isOptional,
			mergedSiblings: nested
				? []
				: item
						.getMergedSiblings()
						.map((item) => this.encodeMethodSignature(model, item as ApiMethodSignature, parent, version, true)),
		};
	}

	public static encodeMethod(
		model: ApiModel,
		item: ApiMethod,
		parent: ApiItemContainerMixin,
		version: string,
		nested = false,
	): ApiMethodJSON {
		return {
			...this.encodeMethodSignature(model, item, parent, version),
			static: item.isStatic,
			protected: item.isProtected,
			mergedSiblings: nested
				? []
				: item.getMergedSiblings().map((item) => this.encodeMethod(model, item as ApiMethod, parent, version, true)),
		};
	}

	public static encodeClass(model: ApiModel, item: ApiClass, version: string): ApiClassJSON {
		const extendsExcerpt = item.extendsType?.excerpt;

		const methods: ApiMethodJSON[] = [];
		const properties: ApiPropertyItemJSON[] = [];

		let constructor: ApiConstructor | undefined;

		for (const member of item.findMembersWithInheritance().items) {
			switch (member.kind) {
				case ApiItemKind.Method:
					methods.push(this.encodeMethod(model, member as ApiMethod, item, version));
					break;
				case ApiItemKind.Property:
					properties.push(this.encodeProperty(model, member as ApiPropertyItem, item, version));
					break;
				case ApiItemKind.Constructor:
					constructor = member as ApiConstructor;
					break;
				default:
					break;
			}
		}

		return {
			...this.encodeItem(model, item, version),
			...this.encodeTypeParameterList(model, item, version),
			constructor: constructor ? this.encodeConstructor(model, constructor, version) : null,
			extendsTokens: extendsExcerpt ? extendsExcerpt.spannedTokens.map((token) => genToken(model, token, version)) : [],
			implementsTokens: item.implementsTypes.map((excerpt) =>
				excerpt.excerpt.spannedTokens.map((token) => genToken(model, token, version)),
			),
			methods,
			properties,
		};
	}

	public static encodeTypeAlias(model: ApiModel, item: ApiTypeAlias, version: string): ApiTypeAliasJSON {
		return {
			...this.encodeItem(model, item, version),
			...this.encodeTypeParameterList(model, item, version),
			typeTokens: item.typeExcerpt.spannedTokens.map((token) => genToken(model, token, version)),
		};
	}

	public static encodeEnum(model: ApiModel, item: ApiEnum, version: string): ApiEnumJSON {
		return {
			...this.encodeItem(model, item, version),
			members: item.members.map((member) => ({
				name: member.name,
				initializerTokens:
					member.initializerExcerpt?.spannedTokens.map((token) => genToken(model, token, version)) ?? [],
				summary: member.tsdocComment ? nodeContainer(member.tsdocComment.summarySection, model, version, member) : null,
			})),
		};
	}

	public static encodeInterface(model: ApiModel, item: ApiInterface, version: string): ApiInterfaceJSON {
		const methods: ApiMethodSignatureJSON[] = [];
		const properties: ApiPropertyItemJSON[] = [];

		for (const member of item.findMembersWithInheritance().items) {
			switch (member.kind) {
				case ApiItemKind.MethodSignature:
					methods.push(this.encodeMethodSignature(model, member as ApiMethodSignature, item, version));
					break;
				case ApiItemKind.PropertySignature:
					properties.push(this.encodeProperty(model, member as ApiPropertySignature, item, version));
					break;
				default:
					break;
			}
		}

		return {
			...this.encodeItem(model, item, version),
			...this.encodeTypeParameterList(model, item, version),
			extendsTokens: item.extendsTypes.map((excerpt) =>
				excerpt.excerpt.spannedTokens.map((token) => genToken(model, token, version)),
			),
			methods,
			properties,
		};
	}

	public static encodeVariable(model: ApiModel, item: ApiVariable, version: string): ApiVariableJSON {
		return {
			...this.encodeItem(model, item, version),
			typeTokens: item.variableTypeExcerpt.spannedTokens.map((token) => genToken(model, token, version)),
			readonly: item.isReadonly,
		};
	}

	public static encodeConstructor(model: ApiModel, item: ApiConstructor, version: string): ApiConstructorJSON {
		return {
			...this.encodeItem(model, item, version),
			...this.encodeParameterList(model, item, version),
			protected: item.isProtected,
		};
	}
}
