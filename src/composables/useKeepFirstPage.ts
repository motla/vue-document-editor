import { computed, Ref } from 'vue';
import { useMemoize } from '@vueuse/core'

export default (content: Ref<Array<unknown>>) => {
	const firstContent = computed(() => content.value[0]);

	const isFirstContentString = useMemoize((maybeString: unknown): maybeString is string => {
		return typeof maybeString === 'string';
	}) as unknown as (maybeString: unknown) => maybeString is string;

	const firstContentTrimmed = computed(() => {
		if (!isFirstContentString(firstContent.value)) {
			return undefined;
		}

		return firstContent.value?.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
	})

	// if the document is empty, prevent removing the first page container with a backspace input (keycode 8)
	// which is now the default behavior for web browsers
	const onKeydown = (e: KeyboardEvent) => {
		if (e.key && e.key !== 'Backspace') {
			return
		}

		if (content.value.length > 1) {
			return;
		}

		if (!firstContentTrimmed.value) {
			e.preventDefault();
		}
	}

	return {
		onKeydown,
	}
}
