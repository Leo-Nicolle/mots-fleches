# Suggestion

## Props

| Prop name | Description                     | Type      | Values | Default |
| --------- | ------------------------------- | --------- | ------ | ------- |
| query     | The letters in the current line | string    | -      |         |
| gridId    | The grid id                     | string    | -      |         |
| point     | The coords of the current cell  | Vec       | -      |         |
| dir       | input direction                 | Direction | -      |         |
| method    | search method                   | string    | -      |         |
| ordering  | ordering asc/desc(-1\|1)        | number    | -      |         |

## Events

| Event name   | Properties | Description           |
| ------------ | ---------- | --------------------- |
| hover        |            | Hover of a suggestion |
| click        |            | Click on a suggestion |
| dir          |            | Change direction      |
| methodswitch |            | Change method         |
| orderswitch  |            | Change ordering       |

---
