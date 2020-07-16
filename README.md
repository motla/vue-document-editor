<div align="center">
  <img width="304" height="24" src="https://github.com/motla/vue-document-editor/raw/master/img/logo.png" alt="vue-document-editor">
</div>
<div align="center">
  <img width="500" height="210" src="https://github.com/motla/vue-document-editor/raw/master/img/preview.png">
</div>

**vue-document-editor** is a rich-text editor built on top of [Vue.js](https://vuejs.org/), using the native [*contenteditable*](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content) browser implementation and some JavaScript trickery to spread content over paper-sized pages. It is mainly designed to allow **targeted modifications** to pre-formatted documents using HTML or **interactive templates**.

###### :speech_balloon: This package does not intend to replace a proper document editor with full functionality. If you're looking for a powerful word processor, check out [CKEditor for Vue.js](https://github.com/ckeditor/ckeditor5-vue).

## Features
### :rocket: [See live demo](https://motla.github.io/vue-document-editor/)
- Use your Vue.js components as interactive page templates
- Word-by-word page splitting with forward and backward propagation (*still experimental*)
- Predefined page breaks
- Native Print compatible
- Dynamic document format and margins in millimeters
- Smart zoom and page display modes
- Computes text style at caret position
- Rewritten history stack (undo/redo) compatible with native commands

###### :speech_balloon: This package doesn't include any toolbar. The demo features [vue-file-toolbar-menu](https://github.com/motla/vue-file-toolbar-menu) for the toolbar.

## Installation
In your Vue.js project:

```
npm install vue-document-editor
```

###### :speech_balloon: You also need to install [`sass`](https://www.npmjs.com/package/sass) and [`sass-loader`](https://www.npmjs.com/package/sass-loader) if not already present in your project

###### :speech_balloon: If you prefer static files, import assets from the `dist` folder

## Basic example
###### MyComponent.vue
```Vue
<template>
  <div>
    <vue-document-editor :content.sync="content" />
  </div>
</template>

<script>
import VueDocumentEditor from 'vue-document-editor'

export default {
  components: { VueDocumentEditor },
  data () {
    return { 
      content: ["<h1>Hello!</h1>Fill this page with text and new pages will be created as it overflows."]
    }
  }
}
</script>

<style>
  body { font-family: Avenir, Helvetica, Arial, sans-serif; }
</style>
```

## Complete example
See the [Demo.vue](src/Demo/Demo.vue) file and the [InvoiceTemplate.vue](src/Demo/InvoiceTemplate.vue) file corresponding to the [live demo](https://motla.github.io/vue-document-editor/).

## API
For the list of props, data and styling variables: **read the [API](API.md)**.

## Known issues / limitations
- **Performance**: Large texts must be divided into multiple paragraphs and large page numbers can slow down the entire document.
- **Safari print**: Safari adds print margins unless you choose a borderless paper format in the print box. This has to be done manually. I guess there is no workaround for this issue yet.
- **Tables, images**: User cannot resize tables nor images yet. However, table rows split fine over multiple pages.

## Project development
- `npm run serve` compiles and hot-reloads demo for development
- `npm run lint` lints and fixes files
- `npm run build` compiles and minifies production files and demo

## Licensing
Copyright (c) 2020 Romain Lamothe, [MIT License](LICENSE)