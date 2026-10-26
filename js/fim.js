/* Tela final (fim.html): o brinde só é "liberado" quando a pessoa marca
   que seguiu o Instagram e curtiu uma publicação. */
(() => {
  const seguir = document.getElementById('passoSeguir');
  const liberado = document.getElementById('liberado');

  function atualizar() {
    liberado.hidden = !(seguir.checked );
  }

  [seguir].forEach((c) => c.addEventListener('change', atualizar));
  window.addEventListener('pageshow', atualizar);   // ao voltar do Instagram
  atualizar();
})();
