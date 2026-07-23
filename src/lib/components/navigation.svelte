<script lang="ts">
	import { page } from '$app/state';

	const links = [
		{ href: './', label: 'Editor', route: '/' },
		{ href: './gradient', label: 'Gradient', route: '/gradient' },
		{ href: './randomize', label: 'Randomize', route: '/randomize' },
		{ href: './guide', label: 'Guide', route: '/guide' }
	];
</script>

<nav aria-label="Tools">
	<menu>
		{#each links as link}
			<li class:selected={page.route.id === link.route}>
				<a href={link.href} aria-current={page.route.id === link.route ? 'page' : undefined}>
					{link.label}
				</a>
			</li>
		{/each}
	</menu>
</nav>
