# Vue 3

## v2.3.2

- Fix [Issue 36](https://github.com/motla/vue-document-editor/issues/36): Better handling of deleting on an empty page (no more user action is prevented on the keydown event, instead we deal with the result in the input event and ensure at least a `<div><br></div>` is always present in the content).
- Fix a Safari bug with the cursor, which appeared only on recent versions of Safari (`normalize()` must now be called before selection `<null>` tags removal)

## v2.3.1

- Fix [Issue 26](https://github.com/motla/vue-document-editor/issues/26)

## v2.3.0

- Improvement on [Issue 28](https://github.com/motla/vue-document-editor/issues/28): Table Page Break. Now table rows don't split over pages but are simply moved if they overflow
- Implementation of [Issue 27](https://github.com/motla/vue-document-editor/issues/27): Unwanted page break with `:do_not_break` parameter
- Fix a part of [Issue 26](https://github.com/motla/vue-document-editor/issues/26):
  - A blank page could appear at the end when printing with page overlays

## v2.2.2

- Fix [Issue 24](https://github.com/motla/vue-document-editor/issues/24): Backspace key is broken with one page content
- Bugfix: All pages were not removed after a content reset

## v2.2.1

- Bugfix: Display update was not triggered after exiting printing mode

## v2.2.0

- User can now provide a function for `page_margins`, to set margins specific to the page number (for more info read the [API](API.md))

## v2.1.2

- Bugfix: Cursor is blurred when editing `contenteditable` fields inside components

## v2.1.1

- Bugfix: Display update was not triggered when changing `display` or `zoom` props

## v2.1.0

- This library core has been rewritten for Vue3 using an hoisted static `<div>` for pages content to manage page manually and avoid conflicts between DOM contenteditable elements and Vue.js. [More info here](https://vuejs.org/guide/extras/rendering-mechanism.html#static-hoisting)
- SCSS has been converted to basic CSS, so you don't have to install a SCSS compiler anymore
- Updating dependencies
- Removing ESLint for a lighter project
- Fix [Issue 16](https://github.com/motla/vue-document-editor/issues/16): The component breaks if you remove all the content
- :warning: Warning: starting from this version, the new core implies that for using templates with custom CSS you must rename your single file components with `.ce.vue` extension. [More info here](https://vuejs.org/guide/extras/web-components.html#sfc-as-custom-element)

## v2.0.7

- Fix: 2.0.6 static libraries and docs (demo) were faulty because compiled with vue2. Recompiled with vue3.

## v2.0.6

- Fix [Issue 19](https://github.com/motla/vue-document-editor/issues/19): Any custom CSS formatting other than the one on `<body>` was not taken into account in print mode

## v2.0.5

- Fix [Issue 17](https://github.com/motla/vue-document-editor/issues/17): In some cases, multiple instances of reset_content were launched simultaneously which could cause errors.

## v2.0.4

- Fix [Issue 16](https://github.com/motla/vue-document-editor/issues/16): The component breaks if you remove the last character
- Fix warnings about deprecated ::v-deep and print-color-adjust
- Dev dependencies upgrade

## v2.0.3

- Bug fixing: prevent applying normalize() to template pages HTML as it can break Vue behavior (only Vue3)
- Dependencies upgrade

## v2.0.2

- Fixing the contenteditable field highlight to the Invoice Template of the Demo
- Adding back Vue2 syntax to the basic example

## v2.0.1

- Workaround for the Chrome "return from print" bug. Now displays a return arrow to let the user go back to the editor when this bug happens.

## v2.0.0

- Switching `master` branch to Vue3 (we provide vue2 compatibility on the vue2 branch / @1.x version of this library)
- Dependencies upgrade

# Vue 2

## v1.5.2

- Fix [Issue 36](https://github.com/motla/vue-document-editor/issues/36): Better handling of deleting on an empty page (no more user action is prevented on the keydown event, instead we deal with the result in the input event and ensure at least a `<div><br></div>` is always present in the content).
- Fix a Safari bug with the cursor, which appeared only on recent versions of Safari (`normalize()` must now be called before selection `<null>` tags removal)

## v1.5.1

- Fix [Issue 26](https://github.com/motla/vue-document-editor/issues/26)

## v1.5.0

- Improvement on [Issue 28](https://github.com/motla/vue-document-editor/issues/28): Table Page Break. Now table rows don't split over pages but are simply moved if they overflow
- Implementation of [Issue 27](https://github.com/motla/vue-document-editor/issues/27): Unwanted page break with `:do_not_break` parameter
- Fix a part of [Issue 26](https://github.com/motla/vue-document-editor/issues/26):
  - A blank page could appear at the end when printing with page overlays

## v1.4.1

- Fix [Issue 24](https://github.com/motla/vue-document-editor/issues/24): Backspace key is broken with one page content

## v1.4.0

- User can now provide a function for `page_margins`, to set margins specific to the page number (for more info read the [API](API.md))

## v1.3.0

- SCSS has been converted to basic CSS, so you don't have to install a SCSS compiler anymore
- Updating dependencies
- Removing ESLint for a lighter project
- Fix [Issue 16](https://github.com/motla/vue-document-editor/issues/16): The component breaks if you remove all the content

## v1.2.8

- Fix [Issue 19](https://github.com/motla/vue-document-editor/issues/19): Any custom CSS formatting other than the one on `<body>` was not taken into account in print mode

## v1.2.7

- Fix [Issue 16](https://github.com/motla/vue-document-editor/issues/16): The component breaks if you remove the last character
- Fix warnings about deprecated ::v-deep and print-color-adjust
- Dev dependencies upgrade

## v1.2.6

- Workaround for the Chrome "return from print" bug. Now displays a return arrow to let the user go back to the editor when this bug happens.

## v1.2.5

- Fix [Issue 11](https://github.com/motla/vue-document-editor/issues/9): Using editable prop to provide read only view

## v1.2.4

- Removing pages manually from the DOM now remove corresponding items from the `content` you provide
- Adding `data-page-idx` to pages `<div>`s for custom user scripts convenience
- \[Demo\] Add dynamic page break functionality example (still experimental)
- \[Demo\] Restrict nb of table lines in the invoice template page, fix CSS for printing

## v1.2.3

- Removing useless surrounding `<div>`s from the synchronized document content
- Fix content synchronizing from an empty content array
- Fix content update was not triggered after some of the `executeCommand` functions
- \[Demo\] Reset the history stack after new document creation
- Dependencies upgrade

## v1.2.2

- Fix [Issue 4](https://github.com/motla/vue-document-editor/issues/4): problem with ?. operator

## v1.2.1

- Force white page background when printing

## v1.2.0

- Adding `overlay` functionality and documentation
- Enable printing of CSS background colors/image
- Dependencies upgrade

## v1.1.2

- Fix [Issue 3](https://github.com/motla/vue-document-editor/issues/3)
  - Renaming the static library "VueDocumentEditor"
  - Adding UMD example to README.md

## v1.1.1

- Bugfix [Issue 2](https://github.com/motla/vue-document-editor/issues/2): Enter key to create new line doesn't seem to work on the demo site
- Bugfix: restoring a new document when user wipes out the entire document

## v1.1.0

- Undo/Redo mechanism moved to Demo.vue in order to let custom implementation in application
- Bugfix: preserving text selection when calling `execCommand`
- Minor display improvements in the Demo about scrollbars
- Better overall compatibility for Firefox

## v1.0.0

Initial release