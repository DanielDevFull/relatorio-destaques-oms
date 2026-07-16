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

Os dados são salvos automaticamente somente no navegador deste computador. A apresentação completa usa IndexedDB para comportar várias OMs com fotos. As imagens importadas preservam até 3200 px e qualidade JPEG alta; cada slide exportado é renderizado como PNG lossless em 3840×2160.

## Comandos

- `npm run dev`: inicia o ambiente local.
- `npm run build`: gera a versão otimizada na pasta `dist`.
- `npm run preview`: abre a versão otimizada localmente.

## Personalização

As cores, tipografia, espaçamentos e regras de impressão ficam em `src/styles.css`. Os dados de exemplo ficam em `src/data.js`.

### Sistema visual

- Fonte: **Nunito Variable**, empacotada no projeto.
- Paleta primária: Verde Vale `#007E7A`, Amarelo Vale `#ECB11F`, branco e Cinza Vale `#747678`.
- Paleta semântica: laranja `#E37222`, vermelho `#BB133E`, azul `#3D7EDB`, ciano `#00B0CA` e verde-claro `#69BE28`.
- Liquid Glass claro aplicado à navegação e aos controles sobre um canvas neutro; o slide 16:9 permanece sólido e branco.
- Sem retículas, conforme a diretriz visual fornecida.
