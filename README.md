# Destaques Semanais de OMs

Aplicação local para transformar as principais OMs executadas na semana em uma apresentação executiva 16:9. O usuário preenche os dados, adiciona as fotos de antes e depois, organiza vários slides e exporta tudo em um único arquivo PowerPoint.

## Como abrir

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente `http://127.0.0.1:5173`).

## Fluxo de uso

1. Preencha semana, número, classificação e demais informações na aba **OM**.
2. Substitua as fotos de exemplo na aba **Fotos**.
3. Use a aba **Equipe** para informar responsáveis, segurança, unidade e linha de serviço. A assinatura oficial Grupo GPS + GRSA já está configurada como a única logo do slide.
4. Clique em **Nova OM** para adicionar outro slide. A semana, unidade e equipe permanecem preenchidas; os dados específicos da atividade começam vazios.
5. Os slides ficam empilhados na prévia. Clique em um deles para editar, ou use os controles para duplicar e excluir.
6. Clique em **Exportar PPTX 4K** para baixar todos os slides de uma vez em um arquivo PowerPoint. O botão **PNG 4K** continua disponível para baixar somente o slide selecionado.

Os dados são salvos automaticamente somente no navegador deste computador. A apresentação
completa vive no **IndexedDB**, que comporta várias OMs com fotos. O `localStorage` guarda
só um snapshot de texto como fallback — as fotos importadas são removidas dele de
propósito, porque cada data URL tem alguns MB e estouraria a cota de ~5 MB já no segundo
slide. Por isso uma falha no snapshot não derruba o estado "salvo": o IndexedDB é a fonte
da verdade.

As imagens importadas preservam até 3200 px e qualidade JPEG alta; cada slide exportado é
renderizado como PNG lossless em 3840×2160.

## Comandos

- `npm run dev`: inicia o ambiente local.
- `npm run build`: gera a versão otimizada na pasta `dist`.
- `npm run preview`: abre a versão otimizada localmente.

## Personalização

As cores, tipografia, espaçamentos e regras de impressão ficam em `src/styles.css`. Os dados de exemplo ficam em `src/data.js`.

### Sistema visual

A interface segue o Apple HIG (iOS 26 / macOS Tahoe) com a marca Vale/GRSA no lugar
da paleta do sistema. Tudo é dirigido por tokens no topo de `src/styles.css`.

- Fonte: **Nunito Variable**, empacotada no projeto. Mantemos a família de marca e
  adotamos a *escala* Apple (tamanhos, pesos, tracking), não a fonte do sistema — o
  `pptxgenjs` declara `Nunito` e a exportação rasteriza no navegador do usuário.
- Escala no registro **macOS** (corpo 13px), não iOS (17px): um painel de edição denso
  não comporta corpo 17px. O que vem da HIG é a disciplina — piso de 11px, hierarquia
  por peso antes de tamanho, grid de 8pt e raios concêntricos.
- Tint interativo: Verde Vale `#007E7A`. Para texto sobre superfície tingida use
  `--color-accent-text` (verde profundo): o verde puro passa AA sobre branco (4.94:1)
  mas cai para 4.17:1 sobre o próprio tint.
- Paleta de marca: Amarelo Vale `#ECB11F` (ação primária), Cinza Vale `#747678`.
  Semânticas: laranja `#E37222`, vermelho `#BB133E`, azul `#3D7EDB`, ciano `#00B0CA`,
  verde-claro `#69BE28`.
- **Liquid Glass só na camada de navegação** (header, toolbar, tab bar, diálogos,
  painel), sobre orbes de ambiente que dão ao vidro o que refratar.
- Modo escuro veste apenas o chrome. O slide 16:9 é entregável impresso: continua
  branco e com tinta escura em qualquer tema.

#### Regra dura do slide

Nada dentro de `.report-page` pode usar `backdrop-filter`, `filter` composto ou cor
dependente de tema. O `html-to-image` rasteriza esse nó fora da tela e efeitos que
dependem do que está *atrás* do elemento não existem nesse contexto — sairiam vazios
no PPTX. O "vidro" do slide é gradiente opaco, refração pintada à mão. As medidas são
em `cqw` de propósito: é o que faz o mesmo markup servir a 440px no mobile e a 3840px
na exportação.
