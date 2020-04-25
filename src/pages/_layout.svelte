<script>
  import { url } from "@sveltech/routify";
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
    font-size: 14px;
  }

  .copyright img {
    width: 18px;
    margin-bottom: -2px;
  }

  .copyright a {
    text-decoration: none;
    color: #333;
  }
</style>

<div class="container">
  <Header />
  <slot decorator={PageTransitions} />
</div>

<Footer />

<div class="copyright">
  <p>
    IKPH Inter-Kontakt Projekt und Handel GmbH ©{date} | Crafted in
    <a href={$url('https://varvanin.eu')}>
      <img src="ev.png" alt="Tworzenie i projektowanie stron internetowych" />
      - design studio
    </a>
  </p>
</div>

