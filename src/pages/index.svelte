<script>
  import Hero from "./components/Hero.svelte";
</script>

<style>
  :global(.content) {
    color: #333;
    display: flex;
    flex-direction: row;
    background-color: #fff;
    border-radius: 10px;
    justify-content: space-between;
    -webkit-box-shadow: 0px 0px 5px 0px rgba(189, 165, 189, 0.5);
    -moz-box-shadow: 0px 0px 5px 0px rgba(189, 165, 189, 0.5);
    box-shadow: 0px 0px 5px 0px rgba(189, 165, 189, 0.5);
    z-index: 2;
  }
  :global(.page-title) {
    margin: 5em;
  }

  :global(.page-title h3) {
    text-align: center;
    font-size: 34px;
    font-weight: 400;
    position: relative;
    text-transform: uppercase;
  }

  :global(.item) {
    display: block;
    margin: 1em;
    padding: 0.5em;
  }

  :global(.item h3) {
    font-size: 24px;
    font-weight: 700;
    border-left: 4px solid #009ee0;
    padding-left: 10px;
  }

  :global(.item h4) {
    font-size: 20px;
    line-height: 30px;
  }

  :global(.item p) {
    color: #666;
    font-size: 16px;
    line-height: 30px;
  }

  :global(.item li) {
    color: #666;
    font-size: 16px;
    line-height: 30px;
  }

  :global(.content img) {
    border: 1px solid #bfbfbf;
    padding: 20px;
    max-width: 500px;
  }

  @media (max-width: 767px) {
    :global(.content) {
      flex-direction: column;
      align-items: center;
      border-radius: 0;
      padding: 1.5em;
    }

    :global(.item) {
      width: 100%;
      padding: 0;
    }

    :global(.item img) {
      width: 90%;
    }
  }
</style>

<svelte:head>
  <title>Startseite - IKPH Inter-Kontakt Projekt und Handel GmbH</title>
  <meta
    name="description"
    content="Herzlich willkommen auf der Internetseite Ihres IKPH Teams" />
  <meta name="keywords" content="" />
</svelte:head>

<Hero />

<div class="content">
  <div class="item">
    <img src="images/house.jpg" alt="Inter-Kontakt Projekt und Handel GmbH" />
  </div>

  <div class="item">
      <h3>
        Herzlich willkommen auf der
        <br />
        Internetseite Ihres IKPH Teams
      </h3>
    <h4>Alles aus einer Hand!</h4>
    <p>
      Obwohl unsere Unternehmen erst seit wenigen Jahren auf dem Markt ist,
      haben wir hohe Qualitätsstandards erreicht.
    </p>
    <p>
      Unsere Firma beschäftigt sich mit Renovierungen und Innenausbau. Des
      Weiteren mit der Realisierung von Aufträgen großer Hausverwaltungen und
      Investoren.
    </p>
    <p>
      Wir haben hohe Qualitätsstandards etabliert, um auch die kompliziertesten
      Aufträge fach- und termingerecht zu realisieren.
    </p>
    <p>
      Ob Altbau oder Neubau, ob Gewerbe, Wohnung oder komplette Wohnanlage
      übernehmen wir alle Sanierungsarbeiten. Beratung und Planung bis zur
      Ausführung, bei uns, bekommen Sie alle Leistungen aus einer Hand.
    </p>
    <p>
      Dabei können Sie sich der professionellen Umsetzung und der reibungslosen
      Kommunikation sicher sein. Unser Team wird Sie vor Ort beraten und Ihre
      Fragen beantworten.
    </p>
    <p>Wir sind schnell, sauber und zuverlässig!</p>
    <p>Ihr IKPH Team.</p>
  </div>

</div>
