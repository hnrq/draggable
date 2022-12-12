<script lang="ts">
	import '@src/styles/reset.scss';
	import '@src/styles/components/button.scss';

	import Brand from '@src/components/Brand/Brand.svelte';
	import Starfield from '@src/components/Starfield/Starfield.svelte';
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ params }) => ({
		status: 404,
		error: new Error(`Not found: /${params.path}`)
	});
</script>

<section class="error-404">
	<Starfield />
	<div class="content">
		<Brand variant="large" href="/" />
		<h2 class="subheading subheading--mono">
			Error 404. Simulation disengaged. Critical cube disruption. Course correcting...
		</h2>
		<div class="button__container">
			<a
				href="/"
				class="button button--cosmic"
				title="Go back to the home page"
				data-gtag-category="Tertiary CTA"
				><div class="button__interior">
					<span class="button__text">reboot</span>
				</div></a
			><a
				href="https://github.com/hnrq/draggable"
				class="button button--cosmic"
				title="Contribute to this open-source project"
				data-gtag-category="Secondary CTA"
				><div class="button__interior">
					<span class="button__text">contribute</span>
				</div></a
			>
		</div>
	</div>
</section>

<style lang="scss" global>
	@use '@src/styles/theme';
	@use '@src/styles/components/heading';
	@use '@src/styles/utils/shared/layout';

	.error-404 {
		height: 100vh;
		background-color: darken(map-get(theme.$colors, 'coal-dark'), 13%);
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;

		:global(.starfield) {
			position: absolute;
		}

		.content {
			z-index: 1;
			text-align: center;
			display: flex;
			flex-direction: column;
			align-items: center;
			max-width: 80rem;
		}

		.button {
			color: map-get(theme.$colors, 'brand-yellow');
			color: map-get(theme.$colors, 'brand-yellow');
		}

		.subheading {
			color: #fff;
			font-weight: 400;
			margin-bottom: map-get(theme.$spacings, 'loose');
		}

		///
		/// Button container
		.button__container {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			align-items: center;
			margin-top: -(map-get(theme.$spacings, 'tightest'));
			margin-left: -(map-get(theme.$spacings, 'tightest'));

			.button {
				@include layout.flex-item-fix;
				display: block;
				flex: 0 0 auto;
				margin-top: map-get(theme.$spacings, 'tightest');
				margin-left: map-get(theme.$spacings, 'tightest');
			}

			@media screen and (min-width: map-get(theme.$breakpoints, 'md')) {
				margin-top: -(map-get(theme.$spacings, 'tight'));
				margin-left: -(map-get(theme.$spacings, 'tight'));

				.button {
					margin-top: (map-get(theme.$spacings, 'tight'));
					margin-left: (map-get(theme.$spacings, 'tight'));
				}
			}
		}
	}
</style>
