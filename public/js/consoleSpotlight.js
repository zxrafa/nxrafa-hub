import { openTheaterGame } from "./theaterModal.js";
import { launchWebEmulator } from "./emulatorView.js";
import { isFavorite, toggleFavorite, addRecentGame } from "./favoritesService.js";
import { playSelectSound } from "./audioService.js";

export function updateSpotlight(game) {
  if (!game) return;

  const titleEl = document.getElementById("spotlightTitle");
  const descEl = document.getElementById("spotlightDesc");
  const tagEl = document.getElementById("spotlightTag");
  const ratingEl = document.getElementById("spotlightRating");
  const ambientBg = document.getElementById("consoleAmbientBg");
  const playBtn = document.getElementById("spotlightPlayBtn");
  const favBtn = document.getElementById("spotlightFavBtn");

  if (titleEl) titleEl.textContent = game.title;
  if (descEl) descEl.textContent = game.desc || "Pronto para jogar no console.";
  if (tagEl) tagEl.textContent = game.type === "emulator" ? `RETRO ARCH • ${game.console}` : "CONSOLE PORT • 60 FPS";
  if (ratingEl) ratingEl.textContent = `★ ${game.rating || 4.8}`;

  if (ambientBg && game.cover) {
    ambientBg.style.backgroundImage = `url('${game.cover}')`;
  }

  if (favBtn) {
    const fav = isFavorite(game.id);
    favBtn.classList.toggle("active", fav);
    favBtn.innerHTML = `★ ${fav ? 'Favoritado' : 'Favoritar'}`;
    favBtn.onclick = () => {
      toggleFavorite({ id: game.id, title: game.title, type: game.type || "port", cover: game.cover, url: game.url });
      favBtn.classList.toggle("active", isFavorite(game.id));
      favBtn.innerHTML = `★ ${isFavorite(game.id) ? 'Favoritado' : 'Favoritar'}`;
    };
  }

  if (playBtn) {
    playBtn.onclick = () => launchGame(game);
  }
}

export function launchGame(game) {
  if (!game) return;
  playSelectSound();
  if (game.type === "emulator") {
    launchWebEmulator(game.url, game.console, game.title);
  } else {
    addRecentGame({ id: game.id, title: game.title, type: "port", cover: game.cover, url: game.url });
    const url = (game.sources && game.sources[0]?.url) || game.url;
    openTheaterGame(url, game.title, game.sources, 0, game.cover);
  }
}
