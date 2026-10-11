# nxrafa hub — O Acervo Infinito de ROMs e Emuladores Web

O hub definitivo de preservação e emulação retrô na web: **17.155+ ROMs originais verificadas**, emulação WebAssembly nativa rodando direto no navegador e mais de **207+ web ports desimpedidos (unblocked)** sem anúncios e sem esperas.

---

## 🌟 Recursos Principais

### 1. 🏠 Home
- Landing page minimalista de alto padrão com estética **Preto & Roxo (Dark Obsidian / Electric Purple)**.
- Estatísticas em tempo real: mais de 17.155 jogos indexados em 13 sistemas clássicos.
- Design responsivo e ultra leve, otimizado para qualquer resolução.

### 2. 💾 Biblioteca de ROMs (17.155+ Jogos)
- **13 Consoles Completos**:
  - **Super Nintendo (SNES)**: 3.392 jogos
  - **Game Boy Advance (GBA)**: 2.923 jogos
  - **Sega Mega Drive / Genesis**: 2.774 jogos
  - **Nintendo Entertainment System (NES)**: 2.690 jogos
  - **Game Boy (GB)**: 1.604 jogos
  - **Game Boy Color (GBC)**: 1.417 jogos
  - **Nintendo 64 (N64)**: 946 jogos
  - **Nintendo GameCube**: 358 jogos
  - **Nintendo DS (NDS)**: 312 jogos
  - **Sega Dreamcast**: 311 jogos
  - **PlayStation 2 (PS2)**: 229 jogos
  - **Nintendo Wii**: 110 jogos
  - **PlayStation 1 (PS1)**: 89 jogos
- **Seleção por Região**: Filtros instantâneos para 🇺🇸 USA, 🇪🇺 Europa, 🇯🇵 Japão e 🇧🇷 Brasil.
- **Download Direto em 1 Clique**: Repositórios oficiais TOSEC & No-Intro sem protetores de link, sem contagem regressiva e sem anúncios.
- **Botão ▶ Jogar Web**: Executa o jogo diretamente no navegador sem necessidade de download.

### 3. 🕹️ Emuladores Web & Web Ports
- **Emulação WebAssembly (EmulatorJS)**:
  - Suporte a GBA, SNES, NES, N64, Mega Drive, Game Boy, GBC, PS1 e NDS.
  - Grade de clássicos instantâneos para jogar com 1 clique (Super Mario World, Pokemon Emerald, Sonic 2, Mario 64, Zelda Ocarina, Castlevania SOTN).
  - Suporte a upload de ROM própria direto do computador.
- **207+ Web Ports Unblocked**:
  - Jogos completos compilados em WebAssembly / HTML5 (Baldi's Basics, Buckshot Roulette, Brotato, A Difficult Game About Climbing, Retro Bowl, 1v1.LOL, Slope, FNAF, Subway Surfers, etc.).
  - Filtros por categoria e busca em tempo real.
- **Recursos Escola / Trabalho (Unblocked)**:
  - 🎭 **Modo Disfarce (Tab Cloaker)**: Camufla a aba como "Meu Drive - Google Drive" com o favicon oficial.
  - 🚨 **Botão do Pânico (Esc)**: Redireciona imediatamente para o Google Sala de Aula.

---

## 🚀 Como Executar Localmente

```bash
# Instalar dependências (opcional, utiliza servidore estático)
npm install

# Iniciar servidor local
npx serve public -l 3000
```

---

## ⚡ Deploy no Vercel

O projeto está 100% configurado para o Vercel (`vercel.json`):
1. Conecte o repositório `https://github.com/zxrafa/nxrafa-hub` na Vercel.
2. A Vercel detectará o `outputDirectory: public` e servirá o site globalmente na Edge CDN com 0ms de cold start.
3. Pronto!
