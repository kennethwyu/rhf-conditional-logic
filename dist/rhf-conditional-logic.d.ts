// Generated by dts-bundle-generator v8.0.1

import { BrowserNativeObject, Control, FieldPath, FieldValues, IsEqual, Primitive, UseFormGetValues, UseFormProps, UseFormReturn } from 'react-hook-form';

/**
 * OVERVIEW
 *
 * The vast majority of the types used in this project are from
 * React Hook Form verbatum. However, we make a few modifications
 * & additions:
 *
 * - Define FieldConditions, the type for the object where the library
 *   consumer defines all conditional logic (keys are field name paths,
 *   values are functions that return a boolean value: show/hide)
 *
 * - Define GetValues, a less permissive version of UseFormGetValues
 *   that forces you to pass one or more field names so that we can
 *   track exactly which fields a condition depends on and only
 *   recompute the condition when necessary
 *
 * - Tweak some types to allow subbing in a hash (#) for an index
 *   in a path. The hash acts like a wildcard index, matching the
 *   "current" index of the array item being looked up.
 *
 * - All modified React Hook Form types & their derivates are suffixed
 *   with "CL" to distinguish them from the originals
 *
 */
/**
 * Map of field names to field conditions (functions that accept a getValues()
 * function and return a boolean)
 */
export type FieldConditions<TFieldValues extends FieldValues> = Partial<Record<FieldPathPlusHash<TFieldValues>, (getValue: GetValues<TFieldValues>) => boolean>>;
/**
 * GetValues is derived from UseFormGetValues
 *
 * GetValues has an identical type signature except it does not accept the
 * no-parameters option. You must always pass it something b/c it
 * keeps track of what is passed as conditional logic dependencies, so we
 * can watch these fields to re-evaluate conditional logic
 */
export type GetValues<TFieldValues extends FieldValues> = {
	/**
	 * Get a single field value.
	 *
	 * @remarks
	 * [API](https://react-hook-form.com/docs/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
	 *
	 * @param name - the path name to the form field value.
	 *
	 * @returns the single field value
	 */
	<TFieldName extends FieldPathCL<TFieldValues>>(name: TFieldName): FieldPathValueCL<TFieldValues, TFieldName>;
	/**
	 * Get an array of field values.
	 *
	 * @remarks
	 * [API](https://react-hook-form.com/docs/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
	 *
	 * @param names - an array of field names
	 *
	 * @returns An array of field values
	 */
	<TFieldNames extends FieldPathCL<TFieldValues>[]>(names: readonly [
		...TFieldNames
	]): [
		...FieldPathValuesCL<TFieldValues, TFieldNames>
	];
};
/**
 * Export our custom version of FieldPath that allows for hashes
 */
export type FieldPathPlusHash<TFieldValues extends FieldValues> = PathCL<TFieldValues>;
/**
 * Helper type for recursively constructing paths through a type.
 * This actually constructs the strings and recurses into nested
 * object types.
 *
 * MODIFICATION: Allow "#" to stand in for "0/1/2", etc as an array index
 * The # matches the "current" array index, allowing the user to define a
 * single condition function that checks values from other siblings at the
 * same index.
 *
 * For instance, imagine a form where we ask for a list of guests and
 * only want to show the wine selection question if they're over 21:
 * const conditions = {
 *   "guests.#.wine": (getValues) => getValues("guests.#.age") >= 21
 * }
 *
 * The alternative would be to define "guests.0.wine", "guests.1.wine", etc.
 * for every possible guest! Or you could treat "guests.0.wine" as we're
 * treating "guests.#.wine", but then there wouldn't be an easy way to target
 * only the first guest.
 *
 * See {@link PathCL}
 */
export type PathImplCL<K extends string | number, V, TraversedTypes> = V extends Primitive | BrowserNativeObject ? `${K}` : true extends AnyIsEqual<TraversedTypes, V> ? `${K}` : K extends number ? `${K}` | `${K}.${PathInternalCL<V, TraversedTypes | V>}` | `#` | `#.${PathInternalCL<V, TraversedTypes | V>}` : `${K}` | `${K}.${PathInternalCL<V, TraversedTypes | V>}`;
/**
 * Type to evaluate the type which the given path points to.
 * @typeParam T - deeply nested type which is indexed by the path
 * @typeParam P - path into the deeply nested type
 * @example
 * ```
 * PathValue<{foo: {bar: string}}, 'foo.bar'> = string
 * PathValue<[number, string], '1'> = string
 * ```
 *
 * MODIFICATION: Allow "#" to stand in for an index, so that if a user
 * uses a path with a hash, this doesn't resolve to never.
 * Add conditions both for "#.child" and "parent.#"
 */
export type PathValueCL<T, P extends PathCL<T> | ArrayPath<T>> = T extends any ? P extends `${infer K}.${infer R}` ? K extends keyof T ? R extends PathCL<T[K]> ? PathValueCL<T[K], R> : never : K extends `${ArrayKey}` | "#" ? T extends ReadonlyArray<infer V> ? PathValueCL<V, R & PathCL<V>> : never : never : P extends keyof T ? T[P] : P extends `${ArrayKey}` | "#" ? T extends ReadonlyArray<infer V> ? V : never : never : never;
/**
 * Checks whether the type is any
 * See {@link https://stackoverflow.com/a/49928360/3406963}
 * @typeParam T - type which may be any
 * ```
 * IsAny<any> = true
 * IsAny<string> = false
 * ```
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;
/**
 * Type to query whether an array type T is a tuple type.
 * @typeParam T - type which may be an array or tuple
 * @example
 * ```
 * IsTuple<[number]> = true
 * IsTuple<number[]> = false
 * ```
 */
export type IsTuple<T extends ReadonlyArray<any>> = number extends T["length"] ? false : true;
/**
 * Type which can be used to index an array or tuple type.
 */
export type ArrayKey = number;
/**
  
  /**
   * Type which given a tuple type returns its own keys, i.e. only its indices.
   * @typeParam T - tuple type
   * @example
   * ```
   * TupleKeys<[number, string]> = '0' | '1'
   * ```
   */
export type TupleKeys<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;
/**
 * Helper function to break apart T1 and check if any are equal to T2
 *
 * See {@link IsEqual}
 */
export type AnyIsEqual<T1, T2> = T1 extends T2 ? IsEqual<T1, T2> extends true ? true : never : never;
/**
 * Helper type for recursively constructing paths through a type.
 * This obscures the internal type param TraversedTypes from exported contract.
 *
 * See {@link PathCL}
 */
export type PathInternalCL<T, TraversedTypes = T> = T extends ReadonlyArray<infer V> ? IsTuple<T> extends true ? {
	[K in TupleKeys<T>]-?: PathImplCL<K & string, T[K], TraversedTypes>;
}[TupleKeys<T>] : PathImplCL<ArrayKey, V, TraversedTypes> : {
	[K in keyof T]-?: PathImplCL<K & string, T[K], TraversedTypes>;
}[keyof T];
/**
 * Type which eagerly collects all paths through a type
 * @typeParam T - type which should be introspected
 * @example
 * ```
 * Path<{foo: {bar: string}}> = 'foo' | 'foo.bar'
 * ```
 */
export type PathCL<T> = T extends any ? PathInternalCL<T> : never;
/**
 * See {@link PathCL}
 */
export type FieldPathCL<TFieldValues extends FieldValues> = PathCL<TFieldValues>;
/**
 * Helper type for recursively constructing paths through a type.
 * This actually constructs the strings and recurses into nested
 * object types.
 *
 * See {@link ArrayPath}
 */
export type ArrayPathImpl<K extends string | number, V, TraversedTypes> = V extends Primitive | BrowserNativeObject ? IsAny<V> extends true ? string : never : V extends ReadonlyArray<infer U> ? U extends Primitive | BrowserNativeObject ? IsAny<V> extends true ? string : never : true extends AnyIsEqual<TraversedTypes, V> ? never : `${K}` | `${K}.${ArrayPathInternal<V, TraversedTypes | V>}` : true extends AnyIsEqual<TraversedTypes, V> ? never : `${K}.${ArrayPathInternal<V, TraversedTypes | V>}`;
/**
 * Helper type for recursively constructing paths through a type.
 * This obscures the internal type param TraversedTypes from exported contract.
 *
 * See {@link ArrayPath}
 */
export type ArrayPathInternal<T, TraversedTypes = T> = T extends ReadonlyArray<infer V> ? IsTuple<T> extends true ? {
	[K in TupleKeys<T>]-?: ArrayPathImpl<K & string, T[K], TraversedTypes>;
}[TupleKeys<T>] : ArrayPathImpl<ArrayKey, V, TraversedTypes> : {
	[K in keyof T]-?: ArrayPathImpl<K & string, T[K], TraversedTypes>;
}[keyof T];
/**
 * Type which eagerly collects all paths through a type which point to an array
 * type.
 * @typeParam T - type which should be introspected.
 * @example
 * ```
 * Path<{foo: {bar: string[], baz: number[]}}> = 'foo.bar' | 'foo.baz'
 * ```
 */
export type ArrayPath<T> = T extends any ? ArrayPathInternal<T> : never;
/**
 * See {@link PathValueCL}
 */
export type FieldPathValueCL<TFieldValues extends FieldValues, TFieldPath extends FieldPathCL<TFieldValues>> = PathValueCL<TFieldValues, TFieldPath>;
/**
 * Type to evaluate the type which the given paths point to.
 * @typeParam TFieldValues - field values which are indexed by the paths
 * @typeParam TPath        - paths into the deeply nested field values
 * @example
 * ```
 * FieldPathValues<{foo: {bar: string}}, ['foo', 'foo.bar']>
 *   = [{bar: string}, string]
 * ```
 */
export type FieldPathValuesCL<TFieldValues extends FieldValues, TPath extends FieldPathCL<TFieldValues>[] | readonly FieldPathCL<TFieldValues>[]> = {} & {
	[K in keyof TPath]: FieldPathValueCL<TFieldValues, TPath[K] & FieldPathCL<TFieldValues>>;
};
export declare function getConditionalLogicWithDependencies<TFieldValues extends FieldValues, TFieldNames extends FieldPath<TFieldValues>[]>(formFieldPaths: readonly [
	...TFieldNames
], conditions: FieldConditions<TFieldValues>, getValues: UseFormGetValues<TFieldValues>): {
	formFieldVisibility: readonly [
		...{
			[Index in keyof TFieldNames]: boolean;
		}
	];
	dependencies: Set<FieldPath<TFieldValues>>;
};
export declare function getConditionalLogic<TFieldValues extends FieldValues, TFieldNames extends FieldPath<TFieldValues>[], TFieldNamesParam extends readonly [
	...TFieldNames
]>(formFieldPaths: TFieldNamesParam, conditions: FieldConditions<TFieldValues>, getValues: GetValues<TFieldValues>): {
	[Index in keyof TFieldNamesParam]: boolean;
};
/**
 * Hook to expose conditional logic to RHF form components
 * @param fieldNamePaths One or more field name paths (e.g. "guests.1.winePairing")
 * @param conditions The field conditions object with all conditional logic for this form
 * @param getValues React Hook Form's getValues() utility function
 * @param control React Hook Form's control object
 * @returns A map of each field name path to a boolean (show or hide)
 */
export declare function useCondition<TFieldValues extends FieldValues, TFieldNames extends FieldPath<TFieldValues>[]>(fieldNamePaths: readonly [
	...TFieldNames
], conditions: FieldConditions<TFieldValues>, getValues: UseFormGetValues<TFieldValues>, control: Control<TFieldValues>): readonly [
	...{
		[Index in keyof TFieldNames]: boolean;
	}
];
/**
 * Prune hidden fields from form values
 * This way invalid values in hidden fields don't cause validation errors
 * and hidden fields are not included in final form submission
 * @param getValues React Hook Form's getValues() utility function
 * @param conditions The field conditions object with all conditional logic for this form
 * @returns All field values except those hidden by conditional logic
 */
export declare function pruneHiddenFields<TFieldValues extends FieldValues, TFieldNames extends FieldPath<TFieldValues>[]>(getValues: UseFormGetValues<TFieldValues>, conditions: FieldConditions<TFieldValues>): TFieldValues;
export type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
	[Property in Key]-?: Type[Property];
};
/**
 * Drop-in replacement for useForm() that prunes hidden field values before validation
 * Only new parameter is conditions: your conditional logic definition object
 * @param props — form configuration and validation parameters.
 * @param props.conditions - Required conditional logic definitions
 * @param props.resolver - Required resolver parameter, e.g. zodResolver(schema)
 * @param props.defaultValues - Required default values parameter
 * @returns
 */
export declare function useConditionalForm<TFieldValues extends FieldValues>(props: WithRequiredProperty<UseFormProps<TFieldValues>, "resolver" | "defaultValues"> & {
	conditions: FieldConditions<TFieldValues>;
}): UseFormReturn<TFieldValues>;

export {};
