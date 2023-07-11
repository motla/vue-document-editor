import { CSSProperties } from 'vue';

// Utility to convert page_style to CSS string
export default (css: CSSProperties) => Object
	.entries(css)
	.map(([ k, v ]) => k.replace(/[A-Z]/g, match => ('-' + match.toLowerCase())) + ':' + v)
	.join(';')
