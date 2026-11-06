<script>
	import GameCover from './GameCover.svelte';
	import ScoreBadge from './ScoreBadge.svelte';
	let { game } = $props();
</script>

<a
	href="/juegos/{game.slug}"
	class="card group flex flex-col overflow-hidden p-2 text-fg no-underline transition hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_10px_30px_-12px_rgba(108,71,255,.6)]"
>
	<GameCover title={game.title} hue={game.cover_hue} />
	<div class="flex flex-1 flex-col gap-2 px-1 pt-3 pb-1">
		<div>
			<h3 class="line-clamp-1 text-base font-semibold group-hover:text-primary-soft">{game.title}</h3>
			<p class="line-clamp-1 text-xs text-muted">{game.platforms.join(' · ')} — {game.year}</p>
		</div>
		<div class="mt-auto grid grid-cols-3 gap-1">
			<ScoreBadge compact kind="tgr" value={game.scores.tgr} />
			<ScoreBadge compact kind="press" value={game.scores.press} count={game.scores.pressCount} />
			<ScoreBadge
				compact
				kind="community"
				value={game.scores.community}
				count={game.scores.communityCount}
				sufficient={game.scores.communitySufficient}
			/>
		</div>
	</div>
</a>
