import { Ref, CSSProperties } from 'vue';

export interface UseUpdatePageELTsParams {
	contentRef: Ref<HTMLElement | undefined>;
	pages: Ref<Record<string, any>[]>;
	pageStyle: (pageIndex: number, isTemplate: boolean) => CSSProperties;
	printingMode: Ref<boolean>;
	props: { editable: boolean };
}

export default function useUpdatePageELTs(
	{ contentRef, pages, pageStyle, printingMode, props }: UseUpdatePageELTsParams,
) {
	// Update pages <div> from this.pages data
	const updatePagesELTs = () => {
		// Removing deleted pages
		const deletedPages = [
			...contentRef.value?.children ?? []
		].filter((elt) => {
			!pages.value.find((page) => (page.elt === elt));
		});

		for (const deletedPage of deletedPages) {
			deletedPage.remove();
		}

		// Adding / updating pages
		for (const [ pageIndex, page ] of pages.value.entries()) {
			// Get either existing page_elt or create it
			if (!page.elt) {
				page.elt = document.createElement('div');
				page.elt.className = 'page';
				page.elt.dataset.isVDEPage = '';
				const nextPage = pages.value[pageIndex + 1];
				contentRef.value?.insertBefore(page.elt, nextPage ? nextPage.elt : null);
			}

			// Update page properties
			page.elt.dataset.contentIdx = page.content_idx;
			if (!printingMode.value) {
				page.elt.style = Object
					.entries(pageStyle(pageIndex, !page.template))
					.map(([ k, v ]) => {
						return k.replace(/[A-Z]/g, match => ('-' + match.toLowerCase())) + ':' + v;
					})
					.join(';');
			}

			// (convert page_style to CSS string)
			page.elt.contentEditable = (props.editable && !page.template);
		}
	};

	return {
		updatePagesELTs,
	};
}
