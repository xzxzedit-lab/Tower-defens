// Враги. speed в логических px/с (прототип 42/30 x0.8).
PD.data.enemies = {
  slime: { name: 'Слизень', hp: 35, hpPerWave: 8, speed: 34, speedPerWave: 1.2, reward: 12, size: 9, color: '#65a30d', boss: false },
  boss:  { name: 'Босс',    hp: 150, hpPerWave: 8, speed: 24, speedPerWave: 1.2, reward: 35, size: 14, color: '#dc2626', boss: true }
};
PD.data.economy = { waveBonus: 25, sellRate: 0.7 };
PD.data.shotSpeed = 240;
