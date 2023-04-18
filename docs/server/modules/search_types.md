[server](../README.md) / [Modules](../modules.md) / search/types

# Module: search/types

## Type Aliases

### BoolGrid

Ƭ **BoolGrid**: `Boolean`[][]

#### Defined in

[search/types.d.ts:17](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/types.d.ts#L17)

___

### Char

Ƭ **Char**: `string` & { `length`: ``1``  }

#### Defined in

[search/types.d.ts:16](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/types.d.ts#L16)

___

### DicoIndex

Ƭ **DicoIndex**: `number`

#### Defined in

[search/types.d.ts:18](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/types.d.ts#L18)

___

### Lemme

Ƭ **Lemme**: `Object`

Part of a word withing a grid

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `indexLemme` | `number` | index of the letter in the perpandicular word |
| `indexWord` | `number` | index of the letter in the word |
| `lemme` | `string` | the lemme (. or a letter) |
| `length` | `number` | length of the lemme (2 or 3) |
| `totalLength` | `number` | length of the perpandicular word |

#### Defined in

[search/types.d.ts:57](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/types.d.ts#L57)

___

### OccurenceByIndex

Ƭ **OccurenceByIndex**: `Record`<`number`, `Set`<[`DicoIndex`](search_types.md#dicoindex)\>\>

Data structure for fast access.
Key is the index of the letter within the word
Value is a set of indexes within the words array

#### Defined in

[search/types.d.ts:24](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/types.d.ts#L24)

___

### OccurenceMap

Ƭ **OccurenceMap**: `Record`<`string`, [`OccurenceByIndex`](search_types.md#occurencebyindex)\>

Data structure for fast access.
key is a sequence of 2 or 3 letters
value is an OccurenceByIndex.

#### Defined in

[search/types.d.ts:30](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/types.d.ts#L30)

___

### SearchResult

Ƭ **SearchResult**: `Object`

Result of a search

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `cells` | `Cell`[] | Cells to fit the word into |
| `impossible?` | `string`[] | Letters that make it impossible to find words |
| `query` | `string` | The query that was used to find the words |
| `words` | `string`[] | The list of words found |

#### Defined in

[search/types.d.ts:35](https://github.com/Leo-Nicolle/mots-fleches/blob/9fcaad3/server/lib/search/types.d.ts#L35)
