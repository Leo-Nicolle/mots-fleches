[grid](../README.md) / [Exports](../modules.md) / Grid

# Class: Grid

Grid class
Represents a grid
has many helper functions to manipulate the grid

## Constructors

### constructor

• **new Grid**(`rows`, `cols`, `id?`)

Grid constructor

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rows` | `number` | Number of rows |
| `cols` | `number` | Number of columns |
| `id?` | `string` | id of the grid |

#### Defined in

[Grid.ts:76](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L76)

## Properties

### cells

• **cells**: [`Cell`](../modules.md#cell)[][]

Cells of the grid

#### Defined in

[Grid.ts:54](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L54)

___

### cols

• **cols**: `number`

number of columns within the grid

#### Defined in

[Grid.ts:42](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L42)

___

### comment

• **comment**: `string`

Comment of the grid

#### Defined in

[Grid.ts:46](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L46)

___

### created

• **created**: `number`

Date of creation(db)

#### Defined in

[Grid.ts:62](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L62)

___

### id

• **id**: `string`

Id of the grid(db)

#### Defined in

[Grid.ts:58](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L58)

___

### optionsId

• **optionsId**: `string`

Id of the options(db)

**`See`**

GridOptions
Might be removed soon with books

#### Defined in

[Grid.ts:68](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L68)

___

### rows

• **rows**: `number`

nuber of rows within the grid

#### Defined in

[Grid.ts:38](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L38)

___

### title

• **title**: `string`

Title of the grid

#### Defined in

[Grid.ts:50](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L50)

## Methods

### decrement

▸ **decrement**(`v`, `direction`): [`Cell`](../modules.md#cell)

Decrement a position by a direction, and return the cell at the new position

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `v` | [`Vec`](../modules.md#vec) | starting position |
| `direction` | [`Direction`](../modules.md#direction) | direction to decrement |

#### Returns

[`Cell`](../modules.md#cell)

the cell at the new position, or nullCell if the new position is out of bounds

#### Defined in

[Grid.ts:236](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L236)

___

### getBounds

▸ **getBounds**(`coordinates`, `direction`): [`Bounds`](../modules.md#bounds)

Given a cell and a direction, returns the bounds of the word

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `coordinates` | [`Vec`](../modules.md#vec) | coordinates of the cell |
| `direction` | [`Direction`](../modules.md#direction) | The direction of the word |

#### Returns

[`Bounds`](../modules.md#bounds)

All the cells of the word, and the start and end positions

#### Defined in

[Grid.ts:319](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L319)

___

### getCell

▸ **getCell**(`coordinates`): [`Cell`](../modules.md#cell)

Get the cell at the given coordinates

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `coordinates` | [`Vec`](../modules.md#vec) | coordinates of the cell |

#### Returns

[`Cell`](../modules.md#cell)

the cell at the given coordinates

#### Defined in

[Grid.ts:247](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L247)

___

### highlight

▸ **highlight**(`cells`): `void`

Highlight the given cells (unhighlight all other cells)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cells` | [`Cell`](../modules.md#cell)[] | cells to highlight |

#### Returns

`void`

#### Defined in

[Grid.ts:254](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L254)

___

### increment

▸ **increment**(`v`, `direction`): [`Cell`](../modules.md#cell)

Increment a position by a direction, and return the cell at the new position

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `v` | [`Vec`](../modules.md#vec) | starting position |
| `direction` | [`Direction`](../modules.md#direction) | direction to increment |

#### Returns

[`Cell`](../modules.md#cell)

the cell at the new position, or nullCell if the new position is out of bounds

#### Defined in

[Grid.ts:224](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L224)

___

### isDefinition

▸ **isDefinition**(`point`): `boolean`

Checks if the cell at the given coordinates is a definition cell

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `point` | [`Vec`](../modules.md#vec) | coordinates |

#### Returns

`boolean`

true if the cell is a definition cell

#### Defined in

[Grid.ts:105](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L105)

___

### isValid

▸ **isValid**(`point`): `boolean`

Checks wether coordinates are within the bounds of the grid

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `point` | [`Vec`](../modules.md#vec) | coordinates |

#### Returns

`boolean`

false if x or y is out of bounds

#### Defined in

[Grid.ts:97](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L97)

___

### resize

▸ **resize**(`rows`, `cols`): `void`

Resizes the grid to the given dimensions

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rows` | `number` | height of the grid |
| `cols` | `number` | width of the grid |

#### Returns

`void`

#### Defined in

[Grid.ts:114](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L114)

___

### serialize

▸ **serialize**(): `string`

Converts the grid to a sreialized string

#### Returns

`string`

GridState JSON string

#### Defined in

[Grid.ts:356](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L356)

___

### setArrow

▸ **setArrow**(`v`, `index`, `direction`): `void`

Set the arrow of a definition cell

**`See`**

Grid.setArrow

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `v` | [`Vec`](../modules.md#vec) | - |
| `index` | `number` | The index of the arrow to set |
| `direction` | [`ArrowDir`](../modules.md#arrowdir) | arrow direction |

#### Returns

`void`

#### Defined in

[Grid.ts:197](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L197)

___

### setDefinition

▸ **setDefinition**(`coordinates`, `value`): `void`

Set the cell at the given coordinates as a definition cell (or not)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `coordinates` | [`Vec`](../modules.md#vec) |  |
| `value` | `boolean` | true to make it a definition cell, false to make it a normal cell |

#### Returns

`void`

#### Defined in

[Grid.ts:134](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L134)

___

### setSpaceH

▸ **setSpaceH**(`coordinates`, `value`): `void`

Set horizontal space of a cell

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `coordinates` | [`Vec`](../modules.md#vec) | coordinates of the cell |
| `value` | `boolean` | true to set the space, false to remove it |

#### Returns

`void`

#### Defined in

[Grid.ts:206](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L206)

___

### setSpaceV

▸ **setSpaceV**(`coordinates`, `value`): `void`

Set vertical space of a cell

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `coordinates` | [`Vec`](../modules.md#vec) | coordinates of the cell |
| `value` | `boolean` | true to set the space, false to remove it |

#### Returns

`void`

#### Defined in

[Grid.ts:214](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L214)

___

### setText

▸ **setText**(`coordinates`, `value`): `void`

Set the text to the cell at the given coordinates

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `coordinates` | [`Vec`](../modules.md#vec) |  |
| `value` | `string` | text to set |

#### Returns

`void`

#### Defined in

[Grid.ts:150](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L150)

___

### setWord

▸ **setWord**(`word`, `point`, `direction`): `void`

Write a word within the grid, one letter per cell

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `word` | `string` | word to write |
| `point` | [`Vec`](../modules.md#vec) | start coordinates of the word |
| `direction` | [`Direction`](../modules.md#direction) | writing direction |

#### Returns

`void`

#### Defined in

[Grid.ts:164](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L164)

___

### suggest

▸ **suggest**(`words`, `start`, `directions`): `void`

Set the suggestion of the given cells

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `words` | `string`[] | Words to suggest |
| `start` | [`Vec`](../modules.md#vec)[] | start position of each word |
| `directions` | [`Direction`](../modules.md#direction)[] | direction of each word |

#### Returns

`void`

#### Defined in

[Grid.ts:270](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L270)

___

### equal

▸ `Static` **equal**(`a`, `b`): `boolean`

Checks if two cells have the same coordinates

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `a` | [`Vec`](../modules.md#vec) | First cell |
| `b` | [`Vec`](../modules.md#vec) | Second cell |

#### Returns

`boolean`

Weather the two cells have the same coordinates

#### Defined in

[Grid.ts:291](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L291)

___

### getDirVec

▸ `Static` **getDirVec**(`direction`): `Vector`

Converts a direction to a vector

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `direction` | [`Direction`](../modules.md#direction) | Direction to convert |

#### Returns

`Vector`

Vector corresponding to the direction

#### Defined in

[Grid.ts:300](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L300)

___

### newCell

▸ `Static` **newCell**(`x`, `y`): [`Cell`](../modules.md#cell)

Creates a new cell

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `x` | `number` | x coordinate |
| `y` | `number` | y coordinate |

#### Returns

[`Cell`](../modules.md#cell)

new cell

#### Defined in

[Grid.ts:396](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L396)

___

### perpendicular

▸ `Static` **perpendicular**(`direction`): [`Direction`](../modules.md#direction)

Converts a direction to its perpendicular vector

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `direction` | [`Direction`](../modules.md#direction) | Direction to convert |

#### Returns

[`Direction`](../modules.md#direction)

Vector perpendicular to the direction

#### Defined in

[Grid.ts:310](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L310)

___

### setArrow

▸ `Static` **setArrow**(`cell`, `index`, `direction`): `void`

Set one of the arrows of a definition cell

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cell` | [`Cell`](../modules.md#cell) | cell to set the arrow |
| `index` | `number` | The index of the arrow to set |
| `direction` | [`ArrowDir`](../modules.md#arrowdir) | arrow direction |

#### Returns

`void`

#### Defined in

[Grid.ts:180](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L180)

___

### unserialize

▸ `Static` **unserialize**(`s`): [`Grid`](Grid.md)

Creates a grid from a serialized string

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `s` | `string` | GridState JSON string |

#### Returns

[`Grid`](Grid.md)

A new grid

#### Defined in

[Grid.ts:374](https://github.com/Leo-Nicolle/mots-fleches/blob/cc7533b/grid/src/Grid.ts#L374)
