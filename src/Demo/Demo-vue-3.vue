<template>
  <div class="main">
    <!-- Top bar -->
    <vue-file-toolbar-menu :content="menu" class="bar" />

    <!-- Document editor -->
    <vue-document-editor
      class="editor"
      ref="editor"
      v-model:content="content"
      :overlay="overlay"
      :zoom="zoom"
      :page_format_mm="page_format_mm"
      :page_margins="page_margins"
      :display="display"
    />
  </div>
</template>

<script setup>
import VueFileToolbarMenu from "vue-file-toolbar-menu";
import VueDocumentEditor from "../DocumentEditor/DocumentEditor.vue"; // set from 'vue-document-editor' in your application
import InvoiceTemplate from "./InvoiceTemplate.ce.vue";
import {
  ref,
  computed,
  onMounted,
  // useTemplateRef, // Vue 3.5+
  markRaw,
  onBeforeUnmount,
  nextTick,
  watch,
} from "vue";

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

// vue 3.5+ refs method:
// const editor = useTemplateRef("editor");
// vue 3-3.4 refs
const editor = ref(null);

// data export items
const content = ref([
  // Every item below produce a page break
  '<h1>Hello world!</h1><p>This is a rich-text editor built on top of <span contenteditable="false"><a href="https://vuejs.org/" target="_blank">Vue.js</a></span> using the native <span contenteditable="false"><a href="https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Editable_content" target="_blank"><i>contenteditable</i></a></span> browser implementation and some JavaScript trickery to spread content over paper-sized pages.</p><p>Built-in functionality includes:</p><ul><li>Using Vue.js components as interactive page templates (see next page)</li><li>Word-by-word page splitting (<u>still experimental - only for plain HTML content</u>)</li><li>Native Print compatible</li><li>Dynamic document format and margins in millimeters</li><li>Custom page overlays (headers, footers, page numbers)</li><li>Page breaks</li><li>Smart zoom and page display modes</li><li>Computes text style at caret position</li></ul><p>This library may be useful if you design an application that generate documents and you would let the user to modify them slightly before printing / saving, but with limited / interactive possibilities. It does not intend to replace a proper document editor with full functionality.<br>Make sure this project is suitable to your needs before using it.</p><p>This demo adds:</p><ul><li>The top bar (<span contenteditable="false"><a href="https://github.com/motla/vue-file-toolbar-menu" target="_blank">vue-file-toolbar-menu</a></span> component) and the functions associated with it</li><li>Rewritten history stack (undo/redo) compatible with native commands</li><li>Pinch and trackpad zooming</li></ul><p>Check out the <span contenteditable="false"><a href="https://github.com/motla/vue-document-editor/blob/master/src/Demo/Demo.vue" target="_blank">Demo.vue</a></span> file if you need to add these functionalities to your application.</p><p>The link below is an example of non-editable block set with <code>contenteditable="false"</code>:</p><p style="text-align:center" contenteditable="false"><a href="https://github.com/motla/vue-document-editor">View docs on Github</a>, you can\'t edit me.</p><p>But you can still edit this.</p>',
  {
    template: markRaw(InvoiceTemplate),
    props: { invoice_number: "AB38052985" },
  },
  '<br><br><h1>Headers / footers example</h1><br>Page numbers have been added on every page of this document.<br>Header and footer overlays will be added from page 3 to all subsequent ones.<br><br>Check out the <code>overlay</code> method of the <span contenteditable="false"><a href="https://github.com/motla/vue-document-editor/blob/master/src/Demo/Demo.vue" target="_blank">Demo.vue</a></span> file to customize this.',
  '<h1>«</h1><div style="width:80%; text-align:justify; margin:auto"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.</p><p>Ut velit mauris, egestas sed, gravida nec, ornare ut, mi. Aenean ut orci vel massa suscipit pulvinar. Nulla sollicitudin. Fusce varius, ligula non tempus aliquam, nunc turpis ullamcorper nibh, in tempus sapien eros vitae ligula. Pellentesque rhoncus nunc et augue. Integer id felis. Curabitur aliquet pellentesque diam. Integer quis metus vitae elit lobortis egestas. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi vel erat non mauris convallis vehicula. Nulla et sapien. Integer tortor tellus, aliquam faucibus, convallis id, congue eu, quam. Mauris ullamcorper felis vitae erat. Proin feugiat, augue non elementum posuere, metus purus iaculis lectus, et tristique ligula justo vitae magna.</p><p>Aliquam convallis sollicitudin purus. Praesent aliquam, enim at fermentum mollis, ligula massa adipiscing nisl, ac euismod nibh nisl eu lectus. Fusce vulputate sem at sapien. Vivamus leo. Aliquam euismod libero eu enim. Nulla nec felis sed leo placerat imperdiet. Aenean suscipit nulla in justo. Suspendisse cursus rutrum augue. Nulla tincidunt tincidunt mi. Curabitur iaculis, lorem vel rhoncus faucibus, felis magna fermentum augue, et ultricies lacus lorem varius purus. Curabitur eu amet.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede. Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede pellentesque fermentum. Maecenas adipiscing ante non diam sodales hendrerit.</p><p>Ut velit mauris, egestas sed, gravida nec, ornare ut, mi. Aenean ut orci vel massa suscipit pulvinar. Nulla sollicitudin. Fusce varius, ligula non tempus aliquam, nunc turpis ullamcorper nibh, in tempus sapien eros vitae ligula. Pellentesque rhoncus nunc et augue. Integer id felis. Curabitur aliquet pellentesque diam. Integer quis metus vitae elit lobortis egestas. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Morbi vel erat non mauris convallis vehicula. Nulla et sapien. Integer tortor tellus, aliquam faucibus, convallis id, congue eu, quam. Mauris ullamcorper felis vitae erat. Proin feugiat, augue non elementum posuere, metus purus iaculis lectus, et tristique ligula justo vitae magna.</p><p>Aliquam convallis sollicitudin purus. Praesent aliquam, enim at fermentum mollis, ligula massa adipiscing nisl, ac euismod nibh nisl eu lectus. Fusce vulputate sem at sapien. Vivamus leo. Aliquam euismod libero eu enim. Nulla nec felis sed leo placerat imperdiet. Aenean suscipit nulla in justo. Suspendisse cursus rutrum augue. Nulla tincidunt tincidunt mi. Curabitur iaculis, lorem vel rhoncus faucibus, felis magna fermentum augue, et ultricies lacus lorem varius purus. Curabitur eu amet.</p></div><h1 style="text-align:right">»</h1>',
  '<h3 style="text-align:center">--- This is a page break. ---</h3>',
]);
const zoom = ref(0.8);
const zoom_min = 0.1;
const zoom_max = 5;
const page_format_mm = ref([210, 297]);
const page_margins = ref("10mm 15mm");
const display = ref("grid"); // ["grid", "vertical", "horizontal"]
const undo_count = ref(-1); // contains the number of times user can undo (= current position in content_history)
const content_history = ref([]); // contains the content states for undo/redo operations
const _mute_next_content_watcher = ref(false);

//   created()
// Initialize gesture flags
let start_zoom_gesture = false;
let start_dist_touch = false;
let start_zoom_touch = false;

// Manage ctrl+scroll zoom (or trackpad pinch)
window.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      zoom.value = Math.min(
        Math.max(zoom.value - e.deltaY * 0.01, zoom_min),
        zoom_max
      );
    }
  },
  { passive: false }
);

// Manage trackpad pinch on Safari
window.addEventListener("gesturestart", (e) => {
  e.preventDefault();
  start_zoom_gesture = zoom.value;
});
window.addEventListener("gesturechange", (e) => {
  e.preventDefault();
  if (!start_zoom_touch) {
    zoom.value = Math.min(
      Math.max(start_zoom_gesture * e.scale, zoom_min),
      zoom_max
    );
  }
});
window.addEventListener("gestureend", () => {
  start_zoom_gesture = false;
});

// Manage pinch to zoom for touch devices
window.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length == 2) {
      e.preventDefault();
      start_dist_touch = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      start_zoom_touch = zoom.value;
    }
  },
  { passive: false }
);
window.addEventListener(
  "touchmove",
  (e) => {
    if (start_dist_touch && start_zoom_touch) {
      e.preventDefault();
      let zoom_temp =
        (start_zoom_touch *
          Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
          )) /
        start_dist_touch;
      zoom.value = Math.min(Math.max(zoom_temp, zoom_min), zoom_max);
    }
  },
  { passive: false }
);
window.addEventListener(
  "touchend",
  () => {
    start_dist_touch = false;
    start_zoom_touch = false;
  },
  { passive: false }
);

// Manage history undo/redo events
const manage_undo_redo = (e) => {
  switch (e && e.inputType) {
    case "historyUndo":
      e.preventDefault();
      e.stopPropagation();
      this.undo();
      break;
    case "historyRedo":
      e.preventDefault();
      e.stopPropagation();
      this.redo();
      break;
  }
};
window.addEventListener("beforeinput", manage_undo_redo);
window.addEventListener("input", manage_undo_redo); // in case of beforeinput event is not implemented (Firefox)

// If your component is susceptible to be destroyed, don't forget to
// use window.removeEventListener in the Vue.js onBeforeUnmount handler

const menu = computed(() => {
  return [
    // Main commands
    {
      text: "New",
      title: "New",
      icon: "description",
      click: () => {
        if (confirm("This will create an empty document. Are you sure?")) {
          content.value = [""];
          resetContentHistory();
        }
      },
    },
    {
      text: "Print",
      title: "Print",
      icon: "print",
      click: () => window.print(),
    },
    { is: "spacer" },
    // Undo / redo commands
    {
      title: "Undo",
      icon: "undo",
      disabled: !can_undo.value,
      hotkey: isMacLike.value ? "command+z" : "ctrl+z",
      click: () => undo(),
    },
    {
      title: "Redo",
      icon: "redo",
      disabled: !can_redo.value,
      hotkey: isMacLike.value ? "shift+command+z" : "ctrl+y",
      click: () => redo(),
    },
    { is: "spacer" },
    // Rich text menus
    {
      icon: "format_align_left",
      title: "Align left",
      active: isLeftAligned.value,
      disabled: !current_text_style.value,
      hotkey: isMacLike.value ? "shift+command+l" : "ctrl+shift+l",
      click: () => document.execCommand("justifyLeft"),
    },
    {
      icon: "format_align_center",
      title: "Align center",
      active: isCentered.value,
      disabled: !current_text_style.value,
      hotkey: isMacLike.value ? "shift+command+e" : "ctrl+shift+e",
      click: () => document.execCommand("justifyCenter"),
    },
    {
      icon: "format_align_right",
      title: "Align right",
      active: isRightAligned.value,
      disabled: !current_text_style.value,
      hotkey: isMacLike.value ? "shift+command+r" : "ctrl+shift+r",
      click: () => document.execCommand("justifyRight"),
    },
    {
      icon: "format_align_justify",
      title: "Justify content",
      active: isJustified.value,
      disabled: !current_text_style.value,
      hotkey: isMacLike.value ? "shift+command+j" : "ctrl+shift+j",
      click: () => document.execCommand("justifyFull"),
    },
    { is: "separator" },
    {
      icon: "format_bold",
      title: "Bold",
      active: isBold.value,
      disabled: !current_text_style.value,
      hotkey: isMacLike.value ? "command+b" : "ctrl+b",
      click: () => document.execCommand("bold"),
    },
    {
      icon: "format_italic",
      title: "Italic",
      active: isItalic.value,
      disabled: !current_text_style.value,
      hotkey: isMacLike.value ? "command+i" : "ctrl+i",
      click: () => document.execCommand("italic"),
    },
    {
      icon: "format_underline",
      title: "Underline",
      active: isUnderline.value,
      disabled: !current_text_style.value,
      hotkey: isMacLike.value ? "command+u" : "ctrl+u",
      click: () => document.execCommand("underline"),
    },
    {
      icon: "format_strikethrough",
      title: "Strike through",
      active: isStrikeThrough.value,
      disabled: !current_text_style.value,
      click: () => document.execCommand("strikethrough"),
    },
    {
      is: "button-color",
      type: "compact",
      menu_class: "align-center",
      disabled: !current_text_style.value,
      color: curColor.value,
      update_color: (new_color) =>
        document.execCommand("foreColor", false, new_color.hex8),
    },
    { is: "separator" },
    {
      icon: "format_list_numbered",
      title: "Numbered list",
      active: isNumberedList.value,
      disabled: !current_text_style.value,
      click: () => document.execCommand("insertOrderedList"),
    },
    {
      icon: "format_list_bulleted",
      title: "Bulleted list",
      active: isBulletedList.value,
      disabled: !current_text_style.value,
      click: () => document.execCommand("insertUnorderedList"),
    },
    {
      html: "<b>H1</b>",
      title: "Header 1",
      active: isH1.value,
      disabled: !current_text_style.value,
      click: () => document.execCommand("formatBlock", false, "<h1>"),
    },
    {
      html: "<b>H2</b>",
      title: "Header 2",
      active: isH2.value,
      disabled: !current_text_style.value,
      click: () => document.execCommand("formatBlock", false, "<h2>"),
    },
    {
      html: "<b>H3</b>",
      title: "Header 3",
      active: isH3.value,
      disabled: !current_text_style.value,
      click: () => document.execCommand("formatBlock", false, "<h3>"),
    },
    {
      icon: "format_clear",
      title: "Clear format",
      disabled: !current_text_style.value,
      click() {
        document.execCommand("removeFormat");
        document.execCommand("formatBlock", false, "<div>");
      },
    },
    {
      icon: "splitscreen",
      title: "Page break",
      disabled: !current_text_style.value,
      click: () => insertPageBreak(),
    },
    { is: "spacer" },
    {
      // Format menu
      text: current_format_name.value,
      title: "Format",
      icon: "crop_free",
      chevron: true,
      menu: formats.map(([text, w, h]) => {
        return {
          text,
          active: page_format_mm.value[0] == w && page_format_mm.value[1] == h,
          click: () => {
            page_format_mm.value = [w, h];
          },
        };
      }),
      menu_width: 80,
      menu_height: 280,
    },
    {
      // Margins menu
      text: current_margins_name.value,
      title: "Margins",
      icon: "select_all",
      chevron: true,
      menu: margins_options.map(([text, value]) => {
        return {
          text: text + " (" + value + ")",
          active: page_margins.value == value,
          click: () => {
            page_margins.value = value;
          },
        };
      }),
      menu_width: 200,
      menu_class: "align-center",
    },
    {
      // Zoom menu
      text: Math.floor(zoom.value * 100) + "%",
      title: "Zoom",
      icon: "zoom_in",
      chevron: true,
      menu: [
        ["200%", 2.0],
        ["150%", 1.5],
        ["125%", 1.25],
        ["100%", 1.0],
        ["75%", 0.75],
        ["50%", 0.5],
        ["25%", 0.25],
      ].map(([text, zoom_new]) => {
        return {
          text,
          active: zoom.value == zoom_new,
          click: () => {
            zoom.value = zoom_new;
          },
        };
      }),
      menu_width: 80,
      menu_height: 280,
      menu_class: "align-center",
    },
    {
      // Display mode menu
      title: "Display",
      icon:
        display.value == "horizontal"
          ? "view_column"
          : display.value == "vertical"
          ? "view_stream"
          : "view_module",
      chevron: true,
      menu: [
        {
          icon: "view_module",
          active: display.value == "grid",
          click: () => {
            display.value = "grid";
          },
        },
        {
          icon: "view_column",
          active: display.value == "horizontal",
          click: () => {
            display.value = "horizontal";
          },
        },
        {
          icon: "view_stream",
          active: display.value == "vertical",
          click: () => {
            display.value = "vertical";
          },
        },
      ],
      menu_width: 55,
      menu_class: "align-right",
    },
  ];
});

// Formats management
const current_format_name = computed(() => {
  const format = formats.find(
    ([, width_mm, height_mm]) =>
      page_format_mm.value[0] == width_mm &&
      page_format_mm.value[1] == height_mm
  );
  return format
    ? format[0]
    : page_format_mm.value[0] + "mm x " + page_format_mm.value[1] + "mm";
});
const formats = [
  ["A0", 841, 1189],
  ["A0L", 1189, 841],
  ["A1", 594, 841],
  ["A1L", 841, 594],
  ["A2", 420, 594],
  ["A2L", 594, 420],
  ["A3", 297, 420],
  ["A3L", 420, 297],
  ["A4", 210, 297],
  ["A4L", 297, 210],
  ["A5", 148, 210],
  ["A5L", 210, 148],
  ["A6", 105, 148],
  ["A6L", 148, 105],
];

// Margins management
const current_margins_name = computed(() => {
  const margin = margins_options.find(
    ([, margs]) => page_margins.value == margs
  );
  return margin ? margin[0] : page_margins.value;
});
const margins_options = [
  ["Medium", "20mm"],
  ["Small", "15mm"],
  ["Slim", "10mm 15mm"],
  ["Tiny", "5mm"],
];

// Current text style management
const current_text_style = computed(() => {
  return mounted.value ? editor.value.current_text_style : false;
});
const isLeftAligned = computed(() => {
  return ["start", "left", "-moz-left"].includes(
    current_text_style.value.textAlign
  );
});

const isRightAligned = computed(() => {
  return ["end", "right", "-moz-right"].includes(
    current_text_style.value.textAlign
  );
});

const isCentered = computed(() => {
  return ["center", "-moz-center"].includes(current_text_style.value.textAlign);
});

const isJustified = computed(() => {
  return ["justify", "justify-all"].includes(
    current_text_style.value.textAlign
  );
});
const isBold = computed(() => {
  const fontWeight = current_text_style.value.fontWeight;
  return (
    fontWeight &&
    (parseInt(fontWeight) > 400 || fontWeight.indexOf("bold") == 0)
  );
});

const isItalic = computed(() => {
  return current_text_style.value.fontStyle == "italic";
});
const isUnderline = computed(() => {
  // text-decoration is not overridden by children, so we query the parent stack
  const stack = current_text_style.value.textDecorationStack;
  return stack && stack.some((d) => d.indexOf("underline") == 0);
});
const isStrikeThrough = computed(() => {
  // text-decoration is not overridden by children, so we query the parent stack
  const stack = current_text_style.value.textDecorationStack;
  return stack && stack.some((d) => d.indexOf("line-through") == 0);
});
const isNumberedList = computed(() => {
  return (
    current_text_style.value.isList &&
    current_text_style.value.listStyleType == "decimal"
  );
});

const isBulletedList = computed(() => {
  return (
    current_text_style.value.isList &&
    ["disc", "circle"].includes(current_text_style.value.listStyleType)
  );
});
const isH1 = computed(() => {
  return current_text_style.value.headerLevel == 1;
});
const isH2 = computed(() => {
  return current_text_style.value.headerLevel == 2;
});
const isH3 = computed(() => {
  return current_text_style.value.headerLevel == 3;
});
const curColor = computed(() => {
  return current_text_style.value.color || "transparent";
});

// Platform management
const isMacLike = computed(() =>
  /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)
);
const can_undo = computed(() => {
  return undo_count.value > 0;
});

const can_redo = computed(() => {
  return content_history.value.length - undo_count.value - 1 > 0;
});

// method replacements

// Page overlays (headers, footers, page numbers)
function overlay(page, total) {
  // Add page numbers on each page
  let html =
    '<div style="position: absolute; bottom: 8mm; ' +
    (page % 2 ? "right" : "left") +
    ': 10mm">Page ' +
    page +
    " of " +
    total +
    "</div>";

  // Add custom headers and footers from page 3
  if (page >= 3) {
    html +=
      '<div style="position: absolute; left: 0; top: 0; right: 0; padding: 3mm 5mm; background: rgba(200, 220, 240, 0.5)"><strong>MYCOMPANY</strong> example.com /// This is a custom header overlay</div>';
    html +=
      '<div style="position: absolute; left: 10mm; right: 10mm; bottom: 5mm; text-align:center; font-size:10pt">MY COMPANY - example.com /// This is a custom footer overlay</div>';
  }
  return html;
}

//     // Undo / redo functions examples
function undo() {
  if (can_undo.value) {
    _mute_next_content_watcher.value = true;
    content.value = content_history.value[--undo_count.value];
  }
}
function redo() {
  if (can_redo.value) {
    _mute_next_content_watcher.value = true;
    content.value = content_history.value[++undo_count.value];
  }
}
function resetContentHistory() {
  content_history.value = [];
  undo_count.value = -1;
}

// Insert page break function example
async function insertPageBreak() {
  // insert paragraph at caret position
  document.execCommand("insertParagraph");

  // insert a marker at caret position (start of the new paragraph)
  const marker = "###PB###"; // must be regex compatible
  document.execCommand("insertText", false, marker);

  // wait for v-model content update (two ticks are needed to reactivate watch on content)
  await nextTick();
  await nextTick();

  // find the marker inside content items and split this content item in two items between the two paragraphs
  // only match root tags (p, div, h1, h2...) to avoid non-root tags like <li>
  const regexp = new RegExp("<(p|div|h\\d)( [^/>]+)*>(<[^/>]+>)*" + marker);
  for (let i = 0; i < content.value.length; i++) {
    const item = content.value[i];
    if (typeof item != "string") continue;
    const match = regexp.exec(item);
    if (match) {
      const tags_open = match[0].slice(0, -marker.length);
      let content_plus_tags_close = item.substring(
        match.index + match[0].length
      );
      // insert <br> to empty pages that would not be handled correctly by contenteditable
      if (content_plus_tags_close.indexOf("</") == 0)
        content_plus_tags_close = "<br>" + content_plus_tags_close;
      content.value.splice(
        i,
        1,
        item.substring(0, match.index),
        tags_open + content_plus_tags_close
      );
      return;
    }
  }

  // if the code didn't return before, the split didn't work (e.g. inside a <li>). just remove the marker from the content
  for (let i = 0; i < content.value.length; i++) {
    const item = content.value[i];
    if (typeof item != "string" || item.indexOf(marker) < 0) continue;
    content.value.splice(i, 1, item.replace(marker, ""));
    break;
  }
}

watch(
  content,
  (new_content) => {
    // Fill undo / redo history stack on user input
    if (!_mute_next_content_watcher.value) {
      // only update the stack when content is changed by user input, not undo/redo commands
      content_history.value[++undo_count.value] = new_content;
      content_history.value.length = undo_count.value + 1; // remove all redo items
    }
    _mute_next_content_watcher.value = false;
  },
  { immediate: true }
);
</script>

<style>
html {
  height: 100%;
}
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: black;
  background: rgb(248, 249, 250);
}
::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}
::-webkit-scrollbar-track,
::-webkit-scrollbar-corner {
  display: none;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.5);
  border: 5px solid transparent;
  border-radius: 16px;
  background-clip: content-box;
}
::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.8);
}
</style>

<style scoped>
.main {
  width: fit-content;
  min-width: 100%;
}
.bar {
  position: sticky;
  left: 0;
  top: 0;
  width: calc(100vw - 16px);
  z-index: 1000;
  background: rgba(248, 249, 250, 0.8);
  border-bottom: solid 1px rgb(248, 249, 250);
  backdrop-filter: blur(10px);
  --bar-button-active-color: #188038;
  --bar-button-open-color: #188038;
  --bar-button-active-bkg: #e6f4ea;
  --bar-button-open-bkg: #e6f4ea;
}
</style>
