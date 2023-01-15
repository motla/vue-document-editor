<div align="center">
  <img width="304" height="24" src="https://github.com/motla/vue-document-editor/raw/master/img/logo.png" alt="vue-document-editor">
</div>

# API

###### :speech_balloon: This is the API for Vue3. [For Vue2, check the vue2 branch](https://github.com/motla/vue-document-editor/blob/vue2/API.md).

## Props
- **v-model:content**: `Array` (required)

*Contains the initial document content. Each array item is a new set of pages containing the item. An item can either be an HTML string or this object `{ template: markRaw(YourComponent), props: {} }` for interactive templates (see [Demo.vue](src/Demo/Demo.vue) and [InvoiceTemplate.ce.vue](src/Demo/InvoiceTemplate.ce.vue) for an example). If your template contains custom CSS, you must name it with the `.ce.vue` extension ([more info here](https://vuejs.org/guide/extras/web-components.html#sfc-as-custom-element)). If an HTML content is too large, it will be split over multiple pages. On the contrary, interactive templates take one full page and any overflow is hidden. You can always restrict the edition of some content inside a page by setting `contenteditable="false"` to some HTML tags.*

- **display**: `"grid"(default), "horizontal", "vertical"` - *Display mode for the pages.*
- **editable**: `Boolean (default:true)` - *Used to disable the entire document modification*
- **overlay**: `Function(page: Number, total: Number) => String` (optional) - *Function that outputs HTML overlay (header, footer, page numbers, ...) for each page depending of the arguments (`page` starts at 1). Placement inside the page should be set in CSS by setting `position: absolute` and `left, top, right, bottom` for each element.*
- **page_format_mm**: `[width, height] (default:[210, 297])` - *Page format in mm*
- **page_margins**: `String (default:"10mm 15mm") or Function(page: Number, total: Number) => String` - *Page margins in CSS format*
- **zoom**: `Number (default:1.0)`- *Display zoom. Only acts on the screen display*

## Data
You can query data variables that contain the current state information about:
- **current_text_style**: [`CSSStyleDeclaration`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration)`| false` - *List of every CSS property at caret position, overloaded with these 3 properties:*
  - **textDecorationStack**: `Array` - *List of all `text-decoration` applied at caret position*
  - **headerLevel**: `Number` - *Maximum header level (`<h1>`, `<h2>`, ...) at caret position*
  - **isList**: `Boolean` - *If one parent has its `display` set to `list-item` at caret position*

In order to get this reactive data from the parent component, you can set [`ref`](https://vuejs.org/api/built-in-special-attributes.html#ref)`= "editor"` to the `vue-document-editor` instance and query `this.$refs.editor.current_text_style` after the component is mounted. See [Demo.vue](src/Demo/Demo.vue) for an example.

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

###### :speech_balloon: If you need some variables that are missing, edit [the stylesheet](src/DocumentEditor/DocumentEditor.vue#L574) then submit a PR, or overwrite styles using `!important`