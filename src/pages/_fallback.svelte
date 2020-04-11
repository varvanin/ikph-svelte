<script>
    import { url } from '@sveltech/routify'
</script>

<style>
  .huge {
    font-size: 12rem;
  }
  .e404 {
    position: absolute;
    left: 50%;
    top: 30%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
</style>

<div class="e404">
  <div class="huge">404</div>
  <div class="big">Seite nicht gefunden. 
  <!-- link to the parent folder of _fallback.svelte -->
  <a href={$url('../')}>Zurück</a>
  </div>
</div>
