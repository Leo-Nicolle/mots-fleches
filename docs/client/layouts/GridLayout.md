# GridLayout

## Props

| Prop name | Description                          | Type           | Values | Default |
| --------- | ------------------------------------ | -------------- | ------ | ------- |
| eltList   | List of elements to display          | Array          | -      |         |
| onCreate  | Callback to create a new element     | TSFunctionType | -      |         |
| onDelete  | Callback to delete selected elements | TSFunctionType | -      |         |
| onClick   | Callback when an element is clicked  | TSFunctionType | -      |         |

## Events

| Event name | Properties | Description |
| ---------- | ---------- | ----------- |
| select     |            |

## Slots

| Name       | Description                            | Bindings |
| ---------- | -------------------------------------- | -------- |
| left-panel | Slot to add elements within left panel |          |
| card-title | Slot for element title                 | <br/>    |
| card-body  | Slot for element body                  | <br/>    |

---
