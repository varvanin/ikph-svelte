<script>
  import { onMount } from "svelte";
  import { isActive, url } from "@sveltech/routify";

  let showMobileMenu = false;

  const links = [
    ["./index", "Startseite"],
    ["./uberuns", "Über uns"],
    ["./referenzen", "Referenzen"],
    ["./leistungen", "Leistungen"],
    ["./impressum", "Impressum"]
  ];

  const handleMobileIconClick = () => (showMobileMenu = !showMobileMenu);

  const mediaQueryHandler = e => {
    if (!e.matches) {
      showMobileMenu = false;
    }
  };

  onMount(() => {
    const mediaListener = window.matchMedia("(max-width: 767px)");

    mediaListener.addListener(mediaQueryHandler);
  });
</script>

<style>
  .header {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    display: block;
    width: 170px;
    padding-top: 8px;
  }

  nav {
    display: flex;
  }

  .inner {
    max-width: 980px;
    padding-left: 20px;
    padding-right: 20px;
    margin: auto;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .mobile-icon {
    width: 25px;
    height: 14px;
    position: relative;
    cursor: pointer;
  }

  a:hover {
    text-decoration: none;
    color: #009ee0;
  }

  .mobile-icon:after,
  .mobile-icon:before,
  .middle-line {
    content: "";
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: #333;
    transition: all 0.4s;
    transform-origin: center;
  }

  .mobile-icon:before,
  .middle-line {
    top: 0;
  }

  .mobile-icon:after,
  .middle-line {
    bottom: 0;
  }

  .mobile-icon:before {
    width: 66%;
  }

  .mobile-icon:after {
    width: 33%;
  }

  .middle-line {
    margin: auto;
  }

  .mobile-icon:hover:before,
  .mobile-icon:hover:after,
  .mobile-icon.active:before,
  .mobile-icon.active:after,
  .mobile-icon.active .middle-line {
    width: 100%;
  }

  .mobile-icon.active:before,
  .mobile-icon.active:after {
    top: 50%;
    transform: rotate(-45deg);
  }

  .mobile-icon.active .middle-line {
    transform: rotate(45deg);
  }

  .navbar-list {
    display: none;
    width: 100%;
    justify-content: space-between;
    margin: 0;
    padding: 0 40px;
  }

  .navbar-list.mobile {
    background-color: #eef1f4;
    position: fixed;
    display: block;
    height: calc(100% - 90px);
    bottom: 0;
    left: 0;
  }

  .navbar-list li {
    list-style-type: none;
    position: relative;
  }

  .navbar-list li:before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
  }

  .navbar-list a {
    color: #333;
    text-decoration: none;
    text-transform: uppercase;
    display: flex;
    height: 22px;
    align-items: center;
    padding: 0 10px;
    font-size: 16px;
  }

  .navbar-list a:hover {
    color: #009ee0;
  }

  .navbar-list .active {
    text-decoration: none;
    color: #009ee0;
    border-bottom: 1px solid #009ee0;
    display: inline-block;
  }

  @media only screen and (min-width: 767px) {
    .mobile-icon {
      display: none;
    }

    .navbar-list {
      display: flex;
      padding: 0;
    }

    .navbar-list a {
      display: inline-flex;
    }
  }

  @media (max-width: 767px) {
    .logo {
      margin: 0.5em;
    }
  }
</style>

<header class="header">
  <div class="logo">
    <a href="/">
      <img src="./logo.svg" alt="" />
    </a>
  </div>
  <nav>
    <div class="inner">
      <div
        on:click={handleMobileIconClick}
        class={`mobile-icon${showMobileMenu ? ' active' : ''}`}>
        <div class="middle-line" />
      </div>
      <ul class={`navbar-list${showMobileMenu ? ' mobile' : ''}`}>
        {#each links as [path, name]}
          <li>
            <a href={$url(path)} class:active={$isActive(path)}>{name}</a>
          </li>
        {/each}
      </ul>
    </div>
  </nav>
</header>
