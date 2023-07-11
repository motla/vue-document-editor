import {
	ref,
	onMounted,
	onBeforeUpdate,
	onBeforeUnmount,
	computed,
	ComponentOptions,
	CSSProperties, watch
} from 'vue';
import createStyleElement from '@/utils/createStyleElement';
import useUpdatePageELTs from '@/composables/useUpdatePageELTs';

// Get props from ../DocumentEditor/DocumentEditor.vue
type DocumentEditorProps = Readonly<{
	content: Array<string | ComponentOptions>;
	display: string;
	editable: boolean;
	overflow: Function;
	page_format_mm: [ number, number ];
	page_margins: string | Function;
	zoom: number;
	do_not_break: Function;
}>;

interface DocumentEditorEmit {
	(event: ('update:content'), content: (string | ComponentOptions)[]): void;

	'update:content': (content: string[]) => void;
}

interface UseDocumentEditorParams {
	props: DocumentEditorProps;
	emit: DocumentEditorEmit;
}

export default (props: DocumentEditorProps, emit: DocumentEditorEmit) => {
	// contains {uuid, content_idx, prev_html, template, props, elt} for each page of the document
	const pages = ref<Record<string, any>[]>([]);

	// contains page overlays refs indexed by page uuid
	const pages_overlay_refs = ref({});

	// real measured page height in px (corresponding to page_format_mm[1])
	const pages_height = ref(0);

	// real measured page width of an empty editor <div> in px
	const editor_width = ref(0);

	// workaround to avoid infinite update loop
	const prevent_next_content_update_from_parent = ref(false);

	// contains the style at caret position
	const current_text_style = ref(false);

	// flag set when page is rendering in printing mode
	const printing_mode = ref(false);

	const reset_in_progress = ref(false);

	const contentRef = ref<HTMLElement>();

	const editorRef = ref<HTMLElement>();

	const css_media_style = computed(() => createStyleElement());

	// Process the specific style (position and size) of each page <div> and content <div>
	function page_style(page_idx: number, allow_overflow: boolean = false) {
		const px_in_mm = 0.2645833333333;
		const page_width = props.page_format_mm[0] / px_in_mm;
		const page_spacing_mm = 10;
		const page_with_plus_spacing = (page_spacing_mm + props.page_format_mm[0]) * props.zoom / px_in_mm;
		const view_padding = 20;
		const inner_width = editor_width.value - 2 * view_padding;
		let nb_pages_x = 1, page_column, x_pos, x_ofx, left_px, top_mm, bkg_width_mm, bkg_height_mm;
		if (props.display == 'horizontal') {
			if (inner_width > (pages.value.length * page_with_plus_spacing)) {
				nb_pages_x = Math.floor(inner_width / page_with_plus_spacing);
				left_px = inner_width / (nb_pages_x * 2) * (1 + page_idx * 2) - page_width / 2;
			} else {
				nb_pages_x = pages.value.length;
				left_px = page_with_plus_spacing * page_idx + page_width / 2 * (props.zoom - 1);
			}
			top_mm = 0;
			bkg_width_mm = props.zoom * (props.page_format_mm[0] * nb_pages_x + (nb_pages_x - 1) * page_spacing_mm);
			bkg_height_mm = props.page_format_mm[1] * props.zoom;
		} else { // "grid", vertical
			nb_pages_x = Math.floor(inner_width / page_with_plus_spacing);
			if (nb_pages_x < 1 || props.display == 'vertical') nb_pages_x = 1;
			page_column = (page_idx % nb_pages_x);
			x_pos = inner_width / (nb_pages_x * 2) * (1 + page_column * 2) - page_width / 2;
			x_ofx = Math.max(0, (page_width * props.zoom - inner_width) / 2);
			left_px = x_pos + x_ofx;
			top_mm = ((props.page_format_mm[1] + page_spacing_mm) * props.zoom) * Math.floor(page_idx / nb_pages_x);
			const nb_pages_y = Math.ceil(pages.value.length / nb_pages_x);
			bkg_width_mm = props.zoom * (props.page_format_mm[0] * nb_pages_x + (nb_pages_x - 1) * page_spacing_mm);
			bkg_height_mm = props.zoom * (props.page_format_mm[1] * nb_pages_y + (nb_pages_y - 1) * page_spacing_mm);
		}
		if (page_idx >= 0) {
			const style: CSSProperties = {
				position: 'absolute',
				left: 'calc(' + left_px + 'px + ' + view_padding + 'px)',
				top: 'calc(' + top_mm + 'mm + ' + view_padding + 'px)',
				width: props.page_format_mm[0] + 'mm',
				// "height" is set below
				padding: (typeof props.page_margins == 'function')
					? props.page_margins(page_idx + 1, pages.value.length)
					: props.page_margins,
				transform: 'scale(' + props.zoom + ')'
			};

			style[allow_overflow ? 'minHeight' : 'height'] = props.page_format_mm[1] + 'mm';

			return style;
		} else {
			// Content/background <div> is sized, so it lets a margin around pages when scrolling at the end
			return {
				width: 'calc(' + bkg_width_mm + 'mm + ' + (2 * view_padding) + 'px)',
				height: 'calc(' + bkg_height_mm + 'mm + ' + (2 * view_padding) + 'px)'
			};
		}
	}

	const {
		updatePagesELTs
	} = useUpdatePageELTs({
		contentRef,
		pages,
		pageStyle: page_style,
		printingMode: printing_mode,
		props
	});

	// Resets all content from the content property
	// function reset_content() {
	// 	// Prevent launching this function multiple times
	// 	if (reset_in_progress.value) return;
	// 	reset_in_progress.value = true;
	//
	// 	// If provided content is empty, initialize it first and exit
	// 	if (!props.content.length) {
	// 		reset_in_progress.value = false;
	// 		emit('update:content', [ '' ]);
	// 		return;
	// 	}
	//
	// 	// Delete all pages and set one new page per content item
	// 	pages.value = props.content.map((c, content_idx) => {
	// 		const content: Record<string, any> = {
	// 			uuid: new_uuid(),
	// 			content_idx,
	// 		};
	//
	// 		if (typeof c !== 'string') {
	// 			content.template = c.template;
	// 			content.props = c.props;
	// 		}
	//
	// 		return content;
	// 	});
	//
	// 	update_pages_elts();
	//
	// 	// Get page height from first empty page
	// 	const first_page_elt = pages.value[0].elt;
	// 	if (!contentRef.value?.contains(first_page_elt)) contentRef.value?.appendChild(first_page_elt); // restore page in DOM in case it was removed
	// 	pages_height.value = first_page_elt.clientHeight + 1; // allow one pixel precision
	//
	// 	// Initialize text pages
	// 	for (const page of pages.value) {
	// 		// set raw HTML content
	// 		if (!props.content[page.content_idx]) page.elt.innerHTML = '<div><br></div>';
	// 		else if (typeof props.content[page.content_idx] === 'string') page.elt.innerHTML = '<div>' + props.content[page.content_idx] + '</div>';
	// 		else if (page.template) {
	// 			const componentElement = defineCustomElement(page.template);
	// 			customElements.define('component-' + page.uuid, componentElement);
	// 			page.elt.appendChild(new componentElement({ modelValue: page.props }));
	// 		}
	//
	// 		// restore page in DOM in case it was removed
	// 		if (!contentRef.value?.contains(page.elt)) contentRef.value?.appendChild(page.elt);
	// 	}
	//
	// 	// Spread content over several pages if it overflows
	// 	fit_content_over_pages();
	//
	// 	// Remove the text cursor from the content if any (its position is lost anyway)
	// 	contentRef.value?.blur();
	//
	// 	// Clear "reset in progress" flag
	// 	reset_in_progress.value = false;
	// }

	// Updates the editor width
	function update_editor_width() {
		editorRef.value?.classList.add('hide_children');
		editor_width.value = editorRef.value?.clientWidth || 0;
		updatePagesELTs();
		editorRef.value?.classList.remove('hide_children');
	}

	// Updates the CSS media style
	function update_css_media_style() {
		css_media_style.value.innerHTML = `
			@media print {
				@page {
					size: ${ props.page_format_mm[0] } mm ${ props.page_format_mm[1] } mm;
					margin: 0 !important;
				}
			
				.hidden-print {
					display: none !important;
				}
			}`;
	}

	onMounted(() => {
		update_editor_width();
		update_css_media_style();
		// reset_content();
		window.addEventListener('resize', update_editor_width);
		// window.addEventListener('click', process_current_text_style);
		// window.addEventListener('beforeprint', before_print);
		// window.addEventListener('afterprint', after_print);
	});


	onBeforeUpdate(() => {
		pages_overlay_refs.value = {};
	});

	onBeforeUnmount(() => {
		window.removeEventListener('resize', update_editor_width);
		// window.removeEventListener('click', process_current_text_style);
		// window.removeEventListener('beforeprint', before_print);
		// window.removeEventListener('afterprint', after_print);
	});

	watch([
		() => props.display,
		() => props.zoom,
	], () => {
		updatePagesELTs();
	});

	return {
		pages,
		pages_overlay_refs,
		pages_height,
		editor_width,
		prevent_next_content_update_from_parent,
		current_text_style,
		printing_mode,
		reset_in_progress,
		contentRef,
		editorRef,
		css_media_style,

		page_style,
		updatePagesELTs,
		update_editor_width,
		update_css_media_style,
	}
}
