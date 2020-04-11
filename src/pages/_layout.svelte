<script>
  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
</script>

<style>
  .container {
    margin: 0 auto;
    max-width: 1280px;
  }

  .copyright {
    color: #333;
    background: #fff;
    padding: 1em;
    text-align: center;
  }
</style>

<div class="container">
  <Header />
  <slot />
</div>

<Footer />

<div class="copyright">
  <p>©IKPH Inter-Kontakt Projekt und Handel GmbH</p>
</div>
