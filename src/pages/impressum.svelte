<script></script>

<style>
  .impressum {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .item strong,
  h3,
  h2 {
    font-weight: 400;
  }

  .konto {
    margin-top: 4em;
  }

  @media (max-width: 767px) {
    .impressum {
        flex-direction: column;
  }

}
</style>

<svelte:head>
  <title>Impressum - IKPH Inter-Kontakt Projekt und Handel GmbH</title>
  <meta name="description" content="Impressum" />
  <meta name="keywords" content="" />
</svelte:head>

<div class="page-title">
  <h3>Impressum</h3>
</div>
<div class="content">
  <div class="impressum">
    <div class="item">
      <h2><strong>Firmen Name:</strong></h2>
      <p>
        IKPH Inter-Kontakt Projekt &amp; Handel GmbH Altonaer Str 59-61, 13581,
        Berlin
      </p>
      <h2><strong>Finanzamt Daten:</strong></h2>
      <p>
        Steuernummer 30/357/50510 Ust-id Nr DE287752857
      </p>

      <h2><strong>Amtgericht:</strong></h2>
      <p>
        HRB Nr. 132353 B
      </p>

      <h2><strong>Geschaftsfuhrung:</strong></h2>
      <p>
        Stanislaw Korshowski
      </p>
    </div>

    <div class="item">
      <h3>Kontaktdaten:</h3>
      <h2>+49 30 984 34 329</h2>
      <h2>+49 30 984 34 327</h2>
      <p>Email:</p>
      <h2>info@ikph.de</h2>
      <div class="konto">
        <h3>Kontoverbindung:</h3>
        <strong>Postbank</strong>
        <strong>IBAN: DE 06 1001 0010 0561 24</strong>
        <strong>BIC: PBNKDEFF</strong>
      </div>
    </div>
  </div>
</div>
