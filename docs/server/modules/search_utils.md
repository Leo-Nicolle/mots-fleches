[server](../README.md) / [Modules](../modules.md) / search/utils

# Module: search/utils

## Functions

### cantor

▸ **cantor**(`x`, `y`): `any`

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `any` |
| `y` | `any` |

#### Returns

`any`

#### Defined in

[search/utils.ts:44](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/utils.ts#L44)

___

### distance

▸ **distance**(`v1`, `v2`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v1` | `any` |
| `v2` | `any` |

#### Returns

`number`

#### Defined in

[search/utils.ts:4](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/utils.ts#L4)

___

### getAlphabet

▸ **getAlphabet**(): `string`[]

#### Returns

`string`[]

#### Defined in

[search/utils.ts:38](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/utils.ts#L38)

___

### getCoords

▸ **getCoords**(`«destructured»`): [`Point`](../interfaces/search_types.Point.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |

#### Returns

[`Point`](../interfaces/search_types.Point.md)[]

#### Defined in

[search/utils.ts:27](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/utils.ts#L27)

___

### scale

▸ **scale**(`v`, `factor?`): `Object`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `v` | `any` | `undefined` |
| `factor` | `number` | `1` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Defined in

[search/utils.ts:20](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/utils.ts#L20)

___

### strToReg

▸ **strToReg**(`str`, `n?`): `RegExp`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `str` | `any` | `undefined` |
| `n` | `string` | `"?"` |

#### Returns

`RegExp`

#### Defined in

[search/utils.ts:8](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/utils.ts#L8)
