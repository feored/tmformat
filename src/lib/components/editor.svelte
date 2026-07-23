<script lang="ts">
	import Viewer from '$lib/components/viewer.svelte';
	import { ICONS } from '$lib/icons';
	import { closest_color, hex_6_to_3 } from '$lib/format';
	import { RotateCcw, RotateCw } from 'lucide-svelte';
	import '@fortawesome/fontawesome-free/css/all.min.css';

	const STARTING_TEXT =
		'$t Example: $t$i Italic $o Bold $f00 Red $w Wide $z Reset $0d0 [tmformat] ';

	let tm_text = $state(STARTING_TEXT);
	let tm_editor: HTMLTextAreaElement | null = $state(null);
	let tm_text_color = $state('#ffffff');

	let history: string[] = $state([STARTING_TEXT]);
	let history_index: number = $state(0);

	let diacritics = [];
	for (let i = 768; i <= 879; i++) {
		diacritics.push(String.fromCodePoint(i));
	}
	let open_dialogs = $state({
		icons: false,
		diacritics: false
	});

	function add_modifier(modifier: string) {
		if (!tm_editor) return;
		tm_text =
			tm_text.substring(0, tm_editor.selectionStart) +
			modifier +
			tm_text.substring(tm_editor.selectionStart);
		history_add();
	}

	function clear() {
		tm_text = '';
		history_add();
	}
	function undoable(): boolean {
		return history_index != 0;
	}
	function redoable(): boolean {
		return history_index != history.length - 1;
	}

	function history_add() {
		if (history_index != history.length - 1) {
			history = history.slice(0, history_index + 1);
		}
		history.push(tm_text);
		history_index = history.length - 1;
	}

	function undo() {
		if (!undoable()) {
			return;
		}
		history_index--;
		tm_text = history[history_index];
	}

	function redo() {
		if (!redoable()) {
			return;
		}
		history_index++;
		tm_text = history[history_index];
	}
</script>

<section>
	<dialog open={open_dialogs.icons}>
		<header>Add Icon</header>
		<main class="overflow-y" style="height:20rem;">
			<div class="flex wrap" style="gap:1rem;">
				{#each ICONS as icon}
					<button class="tm-icon" style="width:4rem;" onclick={() => add_modifier(icon)}
						>{icon}</button
					>
				{/each}
			</div>
		</main>
		<footer><button onclick={() => (open_dialogs.icons = false)}>Close</button></footer>
	</dialog>
	<dialog open={open_dialogs.diacritics}>
		<header>Add Diacritics</header>
		<main class="overflow-y" style="height:20rem;">
			<div class="flex wrap" style="gap:1rem;">
				{#each diacritics as diacritic}
					<button style="width:4rem;" onclick={() => add_modifier(diacritic)}>{diacritic}</button>
				{/each}
			</div>
		</main>
		<footer><button onclick={() => (open_dialogs.diacritics = false)}>Close</button></footer>
	</dialog>
	<details open>
		<summary>Width Modifiers</summary>
		<button onclick={() => add_modifier('$w')}><span class="roboto wide">Wide</span></button>
		<button onclick={() => add_modifier('$n')}><span class="robot narrow">Narrow</span></button>
		<button onclick={() => add_modifier('$m')} class="default">Reset</button>
	</details>
	<details open>
		<summary>Color Modifiers</summary>
		<input
			type="color"
			bind:value={tm_text_color}
			class="inline block"
			oninput={() => {
				tm_text_color = closest_color(tm_text_color);
			}}
		/>
		<button onclick={() => add_modifier('$' + hex_6_to_3(tm_text_color).slice(1))}
			>Insert Color</button
		>
		<button onclick={() => add_modifier('$g')} class="default">Reset Color</button>
	</details>
	<details open>
		<summary>Style Modifiers</summary>
		<button onclick={() => add_modifier('$i')}><i>Italic</i></button>
		<button onclick={() => add_modifier('$o')}><b>Bold</b></button>
		<button onclick={() => add_modifier('$s')} style="text-shadow: 1px 1px 2px black;"
			>Drop Shadow</button
		>
		<button onclick={() => add_modifier('$t')}>UPPERCASE</button>
		<button onclick={() => add_modifier('$z')} class="default">Reset All Styles</button>
	</details>
	<details>
		<summary> Characters</summary>
		<div>
			<button onclick={() => add_modifier('$$')}>Insert $</button>
			<button onclick={() => (open_dialogs.diacritics = true)}>Insert Diacritic</button>
			<button onclick={() => (open_dialogs.icons = true)}>Insert Icon</button>
		</div>
	</details>
	<article style="margin:0px;">
		<span class="flex align-center">
			<button disabled={!undoable()} onclick={() => undo()}><RotateCcw /></button>
			<button disabled={!redoable()} onclick={() => redo()}><RotateCw /></button>
			<button onclick={() => clear()}>Clear</button>
			<button onclick={() => navigator.clipboard.writeText(tm_text)}>Copy to clipboard</button>
		</span>
		<textarea oninput={() => history_add()} bind:this={tm_editor} bind:value={tm_text}></textarea>
		<br />
		<Viewer {tm_text} />
	</article>
</section>

<style>
	textarea {
		font-family: monospace;
	}
</style>
