<script lang="ts">
	import { formatting_data, formatting_unsupported, type FormattingInfo } from '$lib/format_help';
	import Viewer from '$lib/components/viewer.svelte';
</script>

{#snippet format_guide(format_list: FormattingInfo[])}
	{#each format_list as format_info}
		<details open>
			<summary>{format_info.name} <code class="large">[{format_info.code}]</code></summary>
			<p>
				{#each format_info.description as line, line_index}
					{#if line_index > 0}<br />{/if}
					{#each line as part}
						{#if typeof part === 'string'}
							{part}
						{:else}
							<code class="description-code">{part.code}</code>
						{/if}
					{/each}
				{/each}
			</p>
			{#if format_info.example}
				<div class="flex" style="gap:1rem;">
					<code class="shrink">{format_info.example}</code>
					<div class="grow">
						<Viewer tm_text={format_info.example} />
					</div>
				</div>
			{/if}
		</details>
	{/each}
{/snippet}

<header>
	<h2>Formatting Guide</h2>
	<p class="muted">Tested in TM², details may vary in other versions of Trackmania.</p>
</header>
<section>
	<p>To format your text, you can use the following modifiers:</p>
	{@render format_guide(formatting_data)}
	<p>
		The game also recognizes the following modifiers for links, but they are not supported by this
		tool for the sake of simplicity.
	</p>
	{@render format_guide(formatting_unsupported)}
	<p>
		Credit to <a href="https://wiki.trackmania.io/en/content-creation/text-styling"
			>Trackmania Wiki</a
		> for the FA icons list.
	</p>
</section>

<style>
	code {
		padding: 1rem;
		height: 100%;
		font-size: x-large;
		display: inline-block;
	}

	code.description-code {
		display: inline;
		height: auto;
		padding: 0.125rem 0.25rem;
		font-size: inherit;
	}
</style>
