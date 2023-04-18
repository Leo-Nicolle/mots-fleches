[server](../README.md) / [Modules](../modules.md) / [search](../modules/search.md) / Search

# Class: Search

[search](../modules/search.md).Search

Search is a singleton containing the search algorithm
It is used to find the suggestions

## Constructors

### constructor

• **new Search**()

## Methods

### findWords

▸ **findWords**(`«destructured»`): `Promise`<[`SearchResult`](../modules/search_types.md#searchresult)\>

Entry point of the search algo

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `coord` | `Vec` |
| › `dir` | `Direction` |
| › `grid` | `Grid` |
| › `method` | ``"simple"`` \| ``"fastest"`` |

#### Returns

`Promise`<[`SearchResult`](../modules/search_types.md#searchresult)\>

#### Defined in

[search/index.ts:254](https://github.com/Leo-Nicolle/mots-fleches/blob/4846021/server/lib/search/index.ts#L254)

___

### getBestWords

▸ **getBestWords**(`«destructured»`): `Object`

Returns all the words that would not block the grid on next step

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `dir` | `Direction` |
| › `grid` | `Grid` |
| › `lemmes` | [`Lemme`](../modules/search_types.md#lemme)[] |
| › `length` | `number` |
| › `start` | [`Point`](../interfaces/search_types.Point.md) |
| › `words` | `string`[] |

#### Returns

`Object`

a list of words that match the perpandicular lemmes

| Name | Type |
| :------ | :------ |
| `impossible` | [`Point`](../interfaces/search_types.Point.md)[] |
| `words` | `string`[] |

#### Defined in

[search/index.ts:27](https://github.com/Leo-Nicolle/mots-fleches/blob/4846021/server/lib/search/index.ts#L27)

___

### getLemmes

▸ `Static` **getLemmes**(`«destructured»`): `any`[]

Given a position and a direction, get all the lemmes
Usefull for search algo

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `coord` | [`Point`](../interfaces/search_types.Point.md) |
| › `dir` | `Direction` |
| › `grid` | `Grid` |
| › `wordLength` | `number` |

#### Returns

`any`[]

A list of lemmes of length 2 and 3

#### Defined in

[search/index.ts:171](https://github.com/Leo-Nicolle/mots-fleches/blob/4846021/server/lib/search/index.ts#L171)
