<script>
  let intro = "Wir grüßen Sie - und laden Sie herzlich ein, unsere Dienstleistungen in Anspruch zu nehmen!";
</script>

<style>
  .hero {
    display: flex;
    background-image: url(../../body_bg.png);
    background-repeat: no-repeat;
    background-position: right;
    background-size: auto;
  }
  .intro {
    margin: 3em;
    width: 60%;
  }
  .intro h1 {
    font-size: 3.5em;
    color: #333;
    line-height: 1.6em;
  }

  @media (max-width: 600px) {
    .hero {
      background: none;
    }
    .intro {
      width: 100%;
      margin: 1.5em;
    }
    .intro h1 {
      font-size: 1.7em;
      line-height: 1.3em;
      font-weight: 400;
    }
  }
</style>

<div class="hero">
  <div class="intro">
    <h1>{intro}</h1>
  </div>
</div>
