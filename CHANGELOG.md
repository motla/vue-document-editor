###### :speech_balloon: For v2.x (Vue3) releases, see the master branch

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
- Dependencies upgrade

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