<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Flix | Movies</title>

    <?php include('head.html') ?>
  </head>
  <body>
    <!-- Header -->
    <header id="main-header" class="main-header"></header>
    <script>
      fetch('./header.html')
        .then((response) => response.text())
        .then((html) => {
          document.getElementById('main-header').innerHTML = html;
        });
    </script>

    <!-- Search Section -->
    <div id="search-container"></div>
    <script>
      fetch('./search-container.html')
        .then((response) => response.text())
        .then((html) => {
          document.getElementById('search-container').innerHTML = html;
        });
    </script>

    <!-- Now Playing Section --> 
    <section class="now-playing">
      <h2>Now Playing</h2>
      <div class="swiper">
        <div class="swiper-wrapper"></div>
      </div>
    </section>

    <!-- Popular Movies -->
    <section class="container">
      <h2>Popular Movies</h2>
      <div id="popular-movies" class="grid"></div>
    </section>

    <!-- Footer -->
    <footer id="main-footer" class="main-footer"></footer>
    <script>
      fetch('./footer.html')
        .then((response) => response.text())
        .then((html) => {
          document.getElementById('main-footer').innerHTML = html;
        });
    </script>

    <div class="spinner"></div>
  </body>
</html>
