<script>
  import PageTransitions from "./components/PageTransitions.svelte";
  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";

  let year = new Date();
  let date = year.getFullYear();
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
    font-size: 13px;
  }
</style>

<div class="container">
  <Header />
  <slot decorator={PageTransitions} />
</div>

<Footer />

<div class="copyright">
  <p>IKPH Inter-Kontakt Projekt und Handel GmbH ©{date}</p>
</div>
