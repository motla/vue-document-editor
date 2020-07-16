<div align="center">
  <img width="304" height="24" src="https://github.com/motla/vue-document-editor/raw/master/img/logo.png" alt="vue-document-editor">
</div>

# API

## Props
- **content**: `Array` (required)

*Contains the initial document content. Each array item is a new set of pages containing the item. An item can either be an HTML string or this object `{ template: YourComponent, props: {} }` for interactive templates (see [Demo.vue](src/Demo/Demo.vue) and [InvoiceTemplate.vue](src/Demo/InvoiceTemplate.vue) for an example). If an HTML content is too large, it will be split over multiple pages. On the contrary, interactive templates take one full page and any overflow is hidden. The `content` you provide should be synced to user modifications using the [.sync modifier](https://vuejs.org/v2/guide/components-custom-events.html#sync-Modifier) (you have to enable .sync for undo/redo support).*

- **display**: `["auto"(default), "horizontal", "vertical"]` - *Display mode for the pages*
- **page_format_mm**: `[width, height] (default:[210, 297])` - *Page format in mm*
- **page_margins**: `String (default:"10mm 15mm")` - *Page margins in CSS format*
- **zoom**: `Number (default:1.0)`- *Display zoom. Only acts on the screen display*
- **editable**: `Boolean (default:true)` - *Used to disable document modification*

## Data
You can query data variables that contain the current state information about:
- **current_text_style**: [`CSSStyleDeclaration`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration)`| false` - *List of every CSS property at caret position, overloaded with these 3 properties:*
  - **textDecorationStack**: `Array` - *List of all text-decoration applied at caret position*
  - **headerLevel**: `Number` - *Maximum header level (`<h1>`, `<h2>`, ...) at caret position*
  - **isList**: `Boolean` - *If one parent has its `display` set to `list-item` at caret position*
- **can_undo**: `Boolean` - *If undo history is available*
- **can_redo**: `Boolean` - *If redo history is available*

In order to query this reactive data from a parent component, you can use a [`ref`](https://vuejs.org/v2/api/#ref) to the `vue-document-editor` instance and call `this.$refs.editor.xxx` after the component is mounted. See [Demo.vue](src/Demo/Demo.vue) for an example.

## Styling
You can override these CSS variables somewhere in your project (it will not affect the print):
```css
:root {
  --page-background: unset; /* Pages background */
  --page-box-shadow: unset; /* Pages box-shadow */
  --page-border: unset; /* Pages border */
  --page-border-radius: unset; /* Pages border-radius */
}
```
The default font style of the document is set by the parent element.

###### :speech_balloon: If you need some variables that are missing, edit [the stylesheet](src/DocumentEditor/imports/doc-editor-default-styles.scss) then submit a PR, or overwrite styles using `!important`