<script>
  import { fade } from 'svelte/transition';
</script>

<div transition:fade="{{delay: 50, duration: 150}}">
  <slot />
</div>