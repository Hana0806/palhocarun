/* Corrida: usada por jogo.html, jogodois.html e jogotres.html.
   A meta de pontos e o tempo do pulo vêm dos atributos data-meta / data-pulo do <body>. */
(() => {
  const meta = Number(document.body.dataset.meta) || 20;
  const puloMs = Number(document.body.dataset.pulo) || 700;

  const personagem = document.getElementById('personagem');
  const obstaculo = document.querySelector('.obstaculo');
  const jogo = document.querySelector('.jogo');
  const derrota = document.querySelector('.mensagem');
  const contador = document.getElementById('contador');
  const final = document.querySelector('.final');
  const tutorial = document.getElementById('tutorial');
  const overlay = document.getElementById('overlay');
  const contadorInicial = document.getElementById('contadorinicial');

  const nome = localStorage.getItem('personagemEscolhido') || 'nicolly';

  let pontos = 0;
  let comecou = false;
  let acabou = false;
  let pulando = false;
  let contado = false;
  let podeReiniciar = false;

  tutorial.textContent = '➡️ Pressione ESPAÇO ou toque na tela para pular os obstáculos!';
  derrota.querySelector('h1').textContent =
    'Você perdeu! Pressione qualquer tecla ou toque na tela para jogar de novo.';

  personagem.src = `imagens/${nome}.gif`;
  personagem.classList.add(nome);

  /* ---------- Pulo ---------- */
  function pular() {
    if (!comecou || acabou || pulando) return;
    tutorial.style.display = 'none';
    pulando = true;
    personagem.classList.add('pulo');
    setTimeout(() => {
      personagem.classList.remove('pulo');
      pulando = false;
    }, puloMs);
  }

  /* ---------- Entradas (teclado, toque e mouse) ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (acabou) {
      if (podeReiniciar) location.reload();
      return;
    }
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      pular();
    }
  });

  document.addEventListener('pointerdown', (e) => {
    if ((e.target.closest && e.target.closest('a, button'))) return;   // não atrapalha voltar/continuar
    if (acabou) {
      if (podeReiniciar) location.reload();
      return;
    }
    pular();
  });

  /* ---------- Loop do jogo ---------- */
  function ciclo() {
    if (acabou) return;

    const p = personagem.getBoundingClientRect();
    const o = obstaculo.getBoundingClientRect();
    const j = jogo.getBoundingClientRect();

    // Bateu no obstáculo
    if (p.left < o.right && p.right > o.left && p.bottom > o.top) {
      perder();
      return;
    }

    // Obstáculo passou pelo personagem: ponto
    if (o.left < j.left && !contado) {
      pontos++;
      contador.textContent = pontos;
      contado = true;
      if (pontos >= meta) {
        vencer();
        return;
      }
    }
    if (o.left > j.left + j.width * 0.1) contado = false;

    requestAnimationFrame(ciclo);
  }

  function congelar() {
    acabou = true;
    obstaculo.style.animationPlayState = 'paused';
    personagem.style.animationPlayState = 'paused';
  }

  function perder() {
    congelar();
    personagem.src = `imagens/${nome}.png`;
    derrota.style.display = 'flex';
    // evita reiniciar sem querer com o mesmo toque/tecla que causou a batida
    setTimeout(() => { podeReiniciar = true; }, 500);
  }

  function vencer() {
    congelar();
    final.classList.add('visivel');
  }

  /* ---------- Contagem inicial 3-2-1 ---------- */
  window.addEventListener('load', () => {
    let t = 3;
    const cron = setInterval(() => {
      t--;
      if (t > 0) {
        contadorInicial.textContent = t;
      } else {
        clearInterval(cron);
        overlay.style.display = 'none';
        comecou = true;
        obstaculo.classList.add('animar');
        requestAnimationFrame(ciclo);
      }
    }, 1000);
  });
})();
