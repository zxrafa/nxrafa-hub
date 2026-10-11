export function openTheaterGame(url, title, sources = null, selectedIdx = 0) {
  const modal = document.getElementById("theaterModal");
  const modalTitle = document.getElementById("theaterTitle");
  const modalBody = document.getElementById("theaterBody");
  const coreBadge = document.getElementById("theaterBadge");
  const serverWrap = document.getElementById("theaterServerWrap");
  const serverSelect = document.getElementById("theaterServerSelect");

  if (!modal || !modalBody) return;
  if (modalTitle) modalTitle.textContent = title;
  if (coreBadge) coreBadge.textContent = "WEB PORT";

  if (serverWrap && serverSelect) {
    if (sources && sources.length > 1) {
      serverSelect.innerHTML = sources.map((s, idx) =>
        `<option value="${idx}" ${idx === selectedIdx ? "selected" : ""}>${s.name}</option>`
      ).join("");
      serverWrap.style.display = "flex";
      serverSelect.onchange = (e) => {
        const nextUrl = sources[parseInt(e.target.value, 10)]?.url;
        if (nextUrl) {
          modalBody.innerHTML = `<iframe src="${nextUrl}" style="width:100%;height:100%;border:0;" allow="autoplay; fullscreen; gamepad; pointer-lock *" allowfullscreen></iframe>`;
        }
      };
    } else {
      serverWrap.style.display = "none";
    }
  }

  modalBody.innerHTML = `
    <iframe src="${url}" style="width:100%;height:100%;border:0;" allow="autoplay; fullscreen; gamepad; pointer-lock *" allowfullscreen></iframe>
  `;
  modal.classList.add("active");
}

export function closeTheater() {
  const modal = document.getElementById("theaterModal");
  const modalBody = document.getElementById("theaterBody");
  if (modal) modal.classList.remove("active");
  if (modalBody) modalBody.innerHTML = "";
}
