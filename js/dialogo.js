/* Diálogo: usada por fase-um, fase-dois, fase-tres e fase-final.
   O alvo da dica e a imagem trocada na colisão vêm de data-alvo / data-imagem-colisao no <body>. */
(() => {
  const personagem = document.getElementById('personagem');
  const npc = document.getElementById('npc');
  const caixa = document.getElementById('mensagem-npc');
  const texto = document.getElementById('texto');
  const botaoContinuar = document.getElementById('botaoContinuar');
  const tutorial = document.getElementById('tutorial');

  const nome = localStorage.getItem('personagemEscolhido') || 'nicolly';
  const alvo = document.body.dataset.alvo || 'o personagem';
  const imagemColisao = document.body.dataset.imagemColisao;

  let x = 0;                 // posição do personagem em px
  let podeMover = true;
  let mensagemMostrada = false;
  let andando = false;
  let pulando = false;
  const teclas = { esquerda: false, direita: false };
  let tocando = false;       // dedo/mouse pressionado na tela

  tutorial.textContent =
    `➡️ Use as setas do teclado ou segure o dedo na tela para andar até ${alvo}`;

  /* ---------- Sprite (png parado / gif andando) ---------- */
  function sprite(estado) {
    const arquivo = `imagens/${nome}.${estado === 'gif' ? 'gif' : 'png'}`;
    if (!personagem.src.endsWith(arquivo)) personagem.src = arquivo;
  }
  sprite('png');

  function direcao() {
    return (teclas.direita || tocando ? 1 : 0) - (teclas.esquerda ? 1 : 0);
  }
  function atualizarEstado() {
    const andaAgora = podeMover && direcao() !== 0;
    if (andaAgora !== andando) {
      andando = andaAgora;
      sprite(andando || pulando ? 'gif' : 'png');
    }
  }
  function esconderDica() {
    tutorial.style.display = 'none';
  }

  /* ---------- Pulo ---------- */
  function pular() {
    if (!podeMover || pulando) return;
    pulando = true;
    sprite('gif');
    personagem.classList.add('pulo');
    setTimeout(() => {
      personagem.classList.remove('pulo');
      pulando = false;
      sprite(andando ? 'gif' : 'png');
    }, 700);
  }

  /* ---------- Entradas ---------- */
  document.addEventListener('keydown', (e) => {
    if (!podeMover) return;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') teclas.direita = true;
    else if (e.code === 'ArrowLeft' || e.code === 'KeyA') teclas.esquerda = true;
    else if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); pular(); }
    else return;
    esconderDica();
    atualizarEstado();
  });
  document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') teclas.direita = false;
    else if (e.code === 'ArrowLeft' || e.code === 'KeyA') teclas.esquerda = false;
    atualizarEstado();
  });

  document.addEventListener('pointerdown', (e) => {
    if (!podeMover || (e.target.closest && e.target.closest('a, button'))) return;
    tocando = true;
    esconderDica();
    atualizarEstado();
  });
  ['pointerup', 'pointercancel'].forEach((ev) =>
    document.addEventListener(ev, () => { tocando = false; atualizarEstado(); })
  );
  window.addEventListener('blur', () => {
    teclas.esquerda = teclas.direita = tocando = false;
    atualizarEstado();
  });

  /* ---------- Movimento (proporcional à largura da tela e ao tempo) ---------- */
  function limitar() {
    x = Math.max(0, Math.min(window.innerWidth - personagem.offsetWidth, x));
  }
  let ultimo = performance.now();
  function quadro(agora) {
    const dt = Math.min((agora - ultimo) / 1000, 0.05);
    ultimo = agora;
    const d = direcao();
    if (podeMover && d !== 0) {
      const velocidade = Math.max(180, window.innerWidth * 0.22);   // px por segundo
      x += d * velocidade * dt;
      limitar();
      personagem.style.left = x + 'px';
      verificarColisao();
    }
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);
  window.addEventListener('resize', () => { limitar(); personagem.style.left = x + 'px'; });

  /* ---------- Colisão com o NPC ---------- */
  function verificarColisao() {
    if (mensagemMostrada) return;
    const a = personagem.getBoundingClientRect();
    const b = npc.getBoundingClientRect();
    const colidiu = !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
    if (!colidiu) return;

    mensagemMostrada = true;
    podeMover = false;
    teclas.esquerda = teclas.direita = tocando = false;
    atualizarEstado();
    sprite('png');
    if (imagemColisao) npc.src = imagemColisao;
    mostrarMensagemDigitando(textoLimpo());
  }

  /* ---------- Balão de fala com efeito de digitação ---------- */
  function textoLimpo() {
    const tmp = document.createElement('div');
    tmp.innerHTML = texto.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    return tmp.textContent
      .split('\n')
      .map((linha) => linha.replace(/\s+/g, ' ').trim())
      .join('\n')
      .trim();
  }

  function mostrarMensagemDigitando(completo) {
    texto.textContent = '';
    caixa.style.display = 'block';
    botaoContinuar.style.display = 'none';

    let i = 0;
    const escrever = setInterval(() => {
      texto.textContent += completo.charAt(i);
      i++;
      if (i >= completo.length) terminar();
    }, 30);

    function terminar() {
      clearInterval(escrever);
      texto.textContent = completo;
      botaoContinuar.style.display = 'block';
    }
    // tocar no balão mostra o texto todo de uma vez
    caixa.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      if (i < completo.length) { i = completo.length; terminar(); }
    });
  }

  botaoContinuar.addEventListener('click', () => {
    caixa.style.display = 'none';
    botaoContinuar.style.display = 'none';
  });
})();
