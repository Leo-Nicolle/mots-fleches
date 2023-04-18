[grid](README.md) / Exports

# grid

## Type Aliases

### Arrow

Ƭ **Arrow**: `Object`

Arrow

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `direction` | [`ArrowDir`](modules.md#arrowdir) | Direction of the arrow |
| `position` | [`Vec`](modules.md#vec) | Position of the arrow relative to the cell |

#### Defined in

[types.ts:16](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L16)

___

### ArrowDir

Ƭ **ArrowDir**: ``"right"`` \| ``"down"`` \| ``"rightdown"`` \| ``"downright"`` \| ``"none"``

Arrow directions

#### Defined in

[types.ts:11](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L11)

___

### Bounds

Ƭ **Bounds**: `Object`

Bounds of a word within a cell

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `cells` | [`Cell`](modules.md#cell)[] | All the cells of the word |
| `end` | [`Vec`](modules.md#vec) | End position of the word |
| `length` | `number` | Length of the word |
| `start` | [`Vec`](modules.md#vec) | Start position of the word |

#### Defined in

[types.ts:175](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L175)

___

### Cell

Ƭ **Cell**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrows` | [`ArrowDir`](modules.md#arrowdir)[] | Arrows of the cell |
| `definition` | `boolean` | wether the cell is a definition cell |
| `highlighted` | `boolean` | wether the cell is highlighted or not (editor) |
| `spaceH` | `boolean` | Wether there is a space on Horizontal direction |
| `spaceV` | `boolean` | Wether there is a space on Vertical direction |
| `suggestion` | `string` | Suggestion for the cell (editor) |
| `text` | `string` | Text of the cell (definition and not definition) |
| `x` | `number` | X position of the cell |
| `y` | `number` | Y position of the cell |

#### Defined in

[types.ts:43](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L43)

___

### DeepPartial

Ƭ **DeepPartial**<`T`\>: `T` extends `object` ? { [P in keyof T]?: DeepPartial<T[P]\> } : `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[types.ts:5](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L5)

___

### DefGrid

Ƭ **DefGrid**: `boolean`[][]

#### Defined in

[types.ts:4](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L4)

___

### Direction

Ƭ **Direction**: ``"horizontal"`` \| ``"vertical"``

#### Defined in

[types.ts:193](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L193)

___

### Format

Ƭ **Format**: `Object`

Format for printing

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `dpi` | `number` | dots per pixels (unused) |
| `height` | `number` | Height of the paper(cm) |
| `margin` | { `bottom`: `number` ; `left`: `number` ; `right`: `number` ; `top`: `number`  } | Margin of the paper (cm) |
| `margin.bottom` | `number` | - |
| `margin.left` | `number` | - |
| `margin.right` | `number` | - |
| `margin.top` | `number` | - |
| `orientation` | `string` | Orientation of the paper (portrait or landscape) |
| `width` | `number` | Width of the paper(cm) |

#### Defined in

[types.ts:84](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L84)

___

### GridOptions

Ƭ **GridOptions**: `Object`

Grid options
defines the style of the grid

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrow` | { `color`: `string` ; `size`: `number`  } | Arrow style |
| `arrow.color` | `string` | - |
| `arrow.size` | `number` | - |
| `definition` | [`TextSyle`](interfaces/TextSyle.md)<`number`\> & { `backgroundColor`: `string`  } | Definition style |
| `grid` | { `borderColor`: `string` ; `borderSize`: `number` ; `cellSize`: `number` ; `outerBorderColor`: `string` ; `outerBorderSize`: `number` ; `spaceSize`: `number`  } | Grid style |
| `grid.borderColor` | `string` | Color of the lines |
| `grid.borderSize` | `number` | Size of the lines |
| `grid.cellSize` | `number` | Size of the cell |
| `grid.outerBorderColor` | `string` | Color of the outer border |
| `grid.outerBorderSize` | `number` | Size of the outer border |
| `grid.spaceSize` | `number` | width of the line showind spaceV and spaceH |
| `id` | `string` | Id of the Options(db) |
| `name` | `string` | Name of the Options |
| `paper` | [`Format`](modules.md#format) | Format for printing |

#### Defined in

[types.ts:116](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L116)

___

### GridState

Ƭ **GridState**: `Object`

JSON format of the grid
Used to serialize and deserialize the grid

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cells` | [`Cell`](modules.md#cell)[][] |
| `cols` | `number` |
| `comment` | `string` |
| `created` | `number` |
| `id` | `string` |
| `optionsId` | `string` |
| `rows` | `number` |
| `title` | `string` |

#### Defined in

[types.ts:298](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L298)

___

### Lookup

Ƭ **Lookup**<`T`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Index signature

▪ [key: `number` \| `string`]: `T`

#### Defined in

[types.ts:3](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L3)

___

### SolutionOptions

Ƭ **SolutionOptions**: [`GridOptions`](modules.md#gridoptions) & { `grids`: { `cols`: `number` ; `gridN`: [`TextSyle`](interfaces/TextSyle.md) ; `rows`: `number`  } ; `isSolution`: ``true`` ; `size`: [`TextSyle`](interfaces/TextSyle.md) ; `words`: [`TextSyle`](interfaces/TextSyle.md) & { `tolerance`: `number`  }  }

Options for the solution

#### Defined in

[types.ts:234](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L234)

___

### Vec

Ƭ **Vec**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Defined in

[types.ts:2](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L2)

___

### WordAndPosition

Ƭ **WordAndPosition**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `direction` | [`Direction`](modules.md#direction) |
| `start` | [`Vec`](modules.md#vec) |
| `word` | `string` |

#### Defined in

[types.ts:309](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L309)

## Variables

### DPI\_TO\_PIXEL

• `Const` **DPI\_TO\_PIXEL**: ``25.4``

#### Defined in

[types.ts:314](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L314)

___

### arrowDirs

• `Const` **arrowDirs**: `string`[][]

#### Defined in

[utils.ts:132](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L132)

___

### defaultOptions

• `Const` **defaultOptions**: [`GridOptions`](modules.md#gridoptions)

#### Defined in

[types.ts:196](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L196)

___

### defaultSolutionOptions

• `Const` **defaultSolutionOptions**: [`SolutionOptions`](modules.md#solutionoptions)

#### Defined in

[types.ts:290](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/types.ts#L290)

___

### nullCell

• `Const` **nullCell**: [`Cell`](modules.md#cell)

Null cell
Used to represent a cell that is not in the grid

#### Defined in

[Grid.ts:9](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/Grid.ts#L9)

## Functions

### arrowPositions

▸ **arrowPositions**(`cell`): { `x`: `number` = 1; `y`: `number`  }[]

From a definition cell, returns the position of the arrows

#### Parameters

| Name | Type |
| :------ | :------ |
| `cell` | [`Cell`](modules.md#cell) |

#### Returns

{ `x`: `number` = 1; `y`: `number`  }[]

#### Defined in

[utils.ts:109](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L109)

___

### borderWidth

▸ **borderWidth**(`options`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`GridOptions`](modules.md#gridoptions) |

#### Returns

`number`

#### Defined in

[utils.ts:30](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L30)

___

### cellAndBorderWidth

▸ **cellAndBorderWidth**(`options`): `number`

Returns the width of a cell and its border

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`GridOptions`](modules.md#gridoptions) |

#### Returns

`number`

#### Defined in

[utils.ts:41](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L41)

___

### cellWidth

▸ **cellWidth**(`options`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`GridOptions`](modules.md#gridoptions) |

#### Returns

`number`

#### Defined in

[utils.ts:26](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L26)

___

### duplicate

▸ **duplicate**(`options`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`GridOptions`](modules.md#gridoptions) |

#### Returns

`Object`

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrow` | { `color`: `string` ; `size`: `number`  } | Arrow style |
| `arrow.color` | `string` | - |
| `arrow.size` | `number` | - |
| `definition` | [`TextSyle`](interfaces/TextSyle.md)<`number`\> & { `backgroundColor`: `string`  } | Definition style |
| `grid` | { `borderColor`: `string` ; `borderSize`: `number` ; `cellSize`: `number` ; `outerBorderColor`: `string` ; `outerBorderSize`: `number` ; `spaceSize`: `number`  } | Grid style |
| `grid.borderColor` | `string` | Color of the lines |
| `grid.borderSize` | `number` | Size of the lines |
| `grid.cellSize` | `number` | Size of the cell |
| `grid.outerBorderColor` | `string` | Color of the outer border |
| `grid.outerBorderSize` | `number` | Size of the outer border |
| `grid.spaceSize` | `number` | width of the line showind spaceV and spaceH |
| `id` | `string` | - |
| `name` | `string` | Name of the Options |
| `paper` | [`Format`](modules.md#format) | Format for printing |

#### Defined in

[utils.ts:134](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L134)

___

### format

▸ **format**(`num`, `unit`): `string`

From an array of [value, unit] returns a string like 10cm

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `num` | `number` | value |
| `unit` | `string` | unit |

#### Returns

`string`

the formatted string

#### Defined in

[utils.ts:22](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L22)

___

### getAllWords

▸ **getAllWords**(`grids`): `Set`<`string`\>

From a list of grids, returns all the words

#### Parameters

| Name | Type |
| :------ | :------ |
| `grids` | [`Grid`](classes/Grid.md)[] |

#### Returns

`Set`<`string`\>

#### Defined in

[utils.ts:180](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L180)

___

### getLines

▸ **getLines**(`cell`): `string`[]

From a definition cell, returns the lines of text

#### Parameters

| Name | Type |
| :------ | :------ |
| `cell` | [`Cell`](modules.md#cell) |

#### Returns

`string`[]

#### Defined in

[utils.ts:90](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L90)

___

### getWords

▸ **getWords**(`grid`): `Object`

From a grid, returns all the words and their positions

#### Parameters

| Name | Type |
| :------ | :------ |
| `grid` | [`Grid`](classes/Grid.md) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `words` | `Set`<`string`\> |
| `wordsAndBounds` | [`WordAndPosition`](modules.md#wordandposition)[] |

#### Defined in

[utils.ts:150](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L150)

___

### gridHeight

▸ **gridHeight**(`grid`, `options`): `number`

Returns the height of the grid (without outer border)

#### Parameters

| Name | Type |
| :------ | :------ |
| `grid` | [`Grid`](classes/Grid.md) |
| `options` | [`GridOptions`](modules.md#gridoptions) |

#### Returns

`number`

#### Defined in

[utils.ts:61](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L61)

___

### gridTotalHeight

▸ **gridTotalHeight**(`grid`, `options`): `number`

Returns the total height of the grid (with outer border)

#### Parameters

| Name | Type |
| :------ | :------ |
| `grid` | [`Grid`](classes/Grid.md) |
| `options` | [`GridOptions`](modules.md#gridoptions) |

#### Returns

`number`

#### Defined in

[utils.ts:82](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L82)

___

### gridTotalWidth

▸ **gridTotalWidth**(`grid`, `options`): `number`

Returns the total width of the grid (with outer border)

#### Parameters

| Name | Type |
| :------ | :------ |
| `grid` | [`Grid`](classes/Grid.md) |
| `options` | [`GridOptions`](modules.md#gridoptions) |

#### Returns

`number`

#### Defined in

[utils.ts:72](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L72)

___

### gridWidth

▸ **gridWidth**(`grid`, `options`): `number`

Returns the width of the grid (without outer border)

#### Parameters

| Name | Type |
| :------ | :------ |
| `grid` | [`Grid`](classes/Grid.md) |
| `options` | [`GridOptions`](modules.md#gridoptions) |

#### Returns

`number`

#### Defined in

[utils.ts:50](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L50)

___

### isSplited

▸ **isSplited**(`cell`): `boolean`

Checks that a definition cell is splited or not

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cell` | [`Cell`](modules.md#cell) | cell to check |

#### Returns

`boolean`

wether the cell is splited or not

#### Defined in

[Grid.ts:25](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/Grid.ts#L25)

___

### newOptions

▸ **newOptions**(): `Object`

#### Returns

`Object`

| Name | Type | Description |
| :------ | :------ | :------ |
| `arrow` | { `color`: `string` ; `size`: `number`  } | Arrow style |
| `arrow.color` | `string` | - |
| `arrow.size` | `number` | - |
| `definition` | [`TextSyle`](interfaces/TextSyle.md)<`number`\> & { `backgroundColor`: `string`  } | Definition style |
| `grid` | { `borderColor`: `string` ; `borderSize`: `number` ; `cellSize`: `number` ; `outerBorderColor`: `string` ; `outerBorderSize`: `number` ; `spaceSize`: `number`  } | Grid style |
| `grid.borderColor` | `string` | Color of the lines |
| `grid.borderSize` | `number` | Size of the lines |
| `grid.cellSize` | `number` | Size of the cell |
| `grid.outerBorderColor` | `string` | Color of the outer border |
| `grid.outerBorderSize` | `number` | Size of the outer border |
| `grid.spaceSize` | `number` | width of the line showind spaceV and spaceH |
| `id` | `string` | - |
| `name` | `string` | Name of the Options |
| `paper` | [`Format`](modules.md#format) | Format for printing |

#### Defined in

[utils.ts:141](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L141)

___

### outerBorderWidth

▸ **outerBorderWidth**(`options`): `number`

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | [`GridOptions`](modules.md#gridoptions) |

#### Returns

`number`

#### Defined in

[utils.ts:33](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L33)

___

### parse

▸ **parse**(`str`): [`number`, `string`]

From a string like 10cm returns [10.cm]

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `str` | `string` | input string |

#### Returns

[`number`, `string`]

[value, unit]

#### Defined in

[utils.ts:10](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L10)

___

### splitIndex

▸ **splitIndex**(`cell`): `number`

From a definition cell, returns where is the split

#### Parameters

| Name | Type |
| :------ | :------ |
| `cell` | [`Cell`](modules.md#cell) |

#### Returns

`number`

#### Defined in

[utils.ts:98](https://github.com/Leo-Nicolle/mots-fleches/blob/35dd9ba/grid/src/utils.ts#L98)
