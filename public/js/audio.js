window.gameAudio = (() => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  let musicVolume = 0.15;
  let sfxVolume = 0.5;

  const bgMusic = new Audio('/music/background.mp3');
  bgMusic.loop = true;
  bgMusic.volume = musicVolume;

  function playTone(freq, duration, type = 'sine', baseVolume = 0.1) {
    if (ctx.state === 'suspended') ctx.resume();
    if (sfxVolume <= 0) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    const finalVolume = baseVolume * sfxVolume;
    gain.gain.setValueAtTime(finalVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  return {
    setMusicVolume: (val) => {
      musicVolume = parseFloat(val);
      bgMusic.volume = musicVolume;
      if (musicVolume > 0 && bgMusic.paused) {
        if (ctx.state === 'suspended') ctx.resume();
        bgMusic.play().catch(() => {});
      } else if (musicVolume === 0) {
        bgMusic.pause();
      }
    },

    setSfxVolume: (val) => {
      sfxVolume = parseFloat(val);
    },

    getMusicVolume: () => musicVolume,
    getSfxVolume: () => sfxVolume,

    // Effets sonores
    playCardClick: () => playTone(600, 0.08, 'triangle', 0.15),
    playRevealCorrect: () => {
      playTone(523.25, 0.1, 'sine', 0.2);
      setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 100);
    },
    playRevealWrong: () => playTone(200, 0.2, 'sawtooth', 0.15),
    playAssassin: () => {
      playTone(150, 0.4, 'sawtooth', 0.3);
      setTimeout(() => playTone(100, 0.6, 'sawtooth', 0.3), 150);
    },
    playClue: () => playTone(880, 0.12, 'sine', 0.1),
    playWin: () => {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.2, 'triangle', 0.2), i * 120);
      });
    },
    // NOUVEAUX SONS
    playPingToggle: () => playTone(440, 0.05, 'sine', 0.12),
    playChatMessage: () => playTone(750, 0.06, 'triangle', 0.1),
    playPassTurn: () => playTone(330, 0.12, 'sine', 0.15)
  };
})();