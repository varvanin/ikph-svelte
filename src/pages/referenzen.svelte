<script>
  import LightBox from "./components/LightBox.svelte";
  let go;

  const openLightBox = i => {
    go = null;
    setTimeout(() => (go = i));
  };

  let images = Array(26)
    .fill(1)
    .map((e, i) => ({
      small: `./gallery/${i}.jpg`,
      full: `./gallery/${i}.jpg`
    }));
</script>

<style>
  .photo-gallery {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    align-content: space-between;
    margin: 1em;
  }

  .photo {
      padding: 0.5em;
  }

  .photo img {
      max-width: 350px;
  }
</style>

<svelte:head>
  <title>Referenzen - IKPH Inter-Kontakt Projekt und Handel GmbH</title>
  <meta name="description" content="Über uns" />
  <meta name="keywords" content="" />
</svelte:head>

<div class="page-title">

  <h3>Referenzen</h3>
</div>
<div class="content">
  <div class="photo-gallery">
    {#each images as image, i ('imagen_' + i)}
      <div class="photo">
        <img
          src={image.small}
          alt={image.title}
          on:click={() => openLightBox(i)} />
      </div>
    {/each}

  </div>
</div>

<LightBox content={images} {go} />
