<script lang="ts">
	import '@src/styles/reset.scss';

	import Sidebar from '@src/components/Sidebar/Sidebar.svelte';
	import pages from '@src/common/data/pages';
	import Hamburger from '@src/components/Hamburger/Hamburger.svelte';
	import classNames from 'classnames';
	import { page } from '$app/stores';

	let open = false;

	$: $page.url.pathname, (open = false);
</script>

<div class="examples">
	<Sidebar {pages} classes={classNames({ open })} />

	<main class="main">
		<Hamburger
			expanded={open}
			onClick={() => {
				open = !open;
			}}
		/>
		<slot />
	</main>
</div>

<style lang="scss" global>
	@use '@src/styles/components/heading';
	@use '@src/styles/theme';
	@use '@src/styles';
	@use '@src/styles/utils/shared/layout';

	.examples {
		display: flex;
		height: 100vh;

		@media screen and (max-width: calc(map-get(theme.$breakpoints, 'md') - 1px)) {
			.sidebar {
				position: fixed;
				bottom: 0;
				left: 0;
				right: 0;
				top: 0;
				@include layout.visible(false);

				&.open {
					@include layout.visible;
				}
			}
		}

		.main {
			flex: 1;
			overflow-y: auto;
			overflow-x: hidden;
			padding: map-get(theme.$spacings, 'tighter') map-get(theme.$spacings, 'tight')
				map-get(theme.$spacings, 'looser');
			background-color: white;

			@media screen and (max-width: calc(map-get(theme.$breakpoints, 'md') - 1px)) {
				display: flex;
				flex-direction: column;
				align-items: center;
			}

			@media screen and (min-width: map-get(theme.$breakpoints, 'lg')) {
				padding: map-get(theme.$spacings, 'fattest') map-get(theme.$spacings, 'fattest')
					map-get(theme.$spacings, 'fattest');
			}

			& > .hamburger {
				flex-shrink: 0;
				margin-top: map-get(theme.$spacings, 'tight');
				margin-bottom: map-get(theme.$spacings, 'base');

				@media only screen and (min-width: map-get(theme.$breakpoints, 'md')) {
					display: none !important;
				}
			}
		}

		section {
			width: 100%;
		}
	}
</style>
