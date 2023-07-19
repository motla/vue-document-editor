export function insertHtmlAtCursor(html: string) {
    let sel: Selection | null, range: Range;

    // Check if browser supports window.getSelection()
    if (window.getSelection) {
        sel = window.getSelection();

        if (!sel) {
            return
        }

        // If some text is already selected or cursor is somewhere in the document
        if (sel.getRangeAt && sel.rangeCount) {
            // Get the first range of the selection
            range = sel.getRangeAt(0);

            // Delete any selected text
            range.deleteContents();

            // Create a new div element and set its inner HTML to the passed HTML string
            let el: HTMLDivElement = document.createElement("div");
            el.innerHTML = html;

            // Create an empty DocumentFragment that will hold the nodes for insertion
            let frag: DocumentFragment = document.createDocumentFragment(), node: ChildNode | null, lastNode: ChildNode | null = null;

            // Move all child nodes of the div element to the DocumentFragment
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }

            // Insert the DocumentFragment at the current cursor position (i.e., where the range starts)
            range.insertNode(frag);

            // If there is a last node after inserting the fragment, move the cursor after the last inserted node
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);

                // Clear all ranges from the selection and add the new range
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }
}