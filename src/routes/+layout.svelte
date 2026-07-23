<script>
	import '$lib/css/style.css';
	import { version } from '$app/environment';
	import Navigation from '$lib/components/navigation.svelte';
	import { Github } from 'lucide-svelte';
</script>

<header class="my-4">
	<h3>Trackmania Formatting Tool</h3>
	<div style="text-align:right;">
		<h6>v{version}</h6>
		<a href="https://github.com/feored/tmformat/"
			><button><Github size="1rem" /> Github</button>
		</a>
	</div>
</header>
<Navigation />
<slot />
