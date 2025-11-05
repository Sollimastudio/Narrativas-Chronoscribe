# 🧪 Guia de Teste Rápido - Narrativas Chronoscribe

## ✅ O QUE FOI CORRIGIDO

### 1. Upload de Múltiplos PDFs ✅
**Antes:** Arquivos eram substituídos a cada upload  
**Agora:** Arquivos são acumulados - pode adicionar quantos quiser!

### 2. Campo de Prompts ✅  
**Antes:** Não tinha onde escrever instruções  
**Agora:** Campo grande para descrever tudo que você quer!

### 3. Campo de Links ✅
**Antes:** Não tinha opção para links  
**Agora:** Campo específico para adicionar URLs!

### 4. Divisão em Temporadas ✅
**Antes:** Pedia 3 temporadas mas não aparecia dividido  
**Agora:** Detecta automaticamente e mostra estrutura visual completa!

---

## 🚀 TESTE COMPLETO EM 5 MINUTOS

### Preparação
```bash
cd ~/Documents/narrativas-chronoscribe
git pull origin copilot/fix-content-generation-issues
npm install  # ignorar erro do puppeteer
npm run dev
```

Acesse: http://localhost:3100

---

### 🎯 PASSO 1: Upload e Prompts

**Teste o upload acumulado:**

1. Clique em "Choose Files" → Selecione 1 PDF
2. Clique "📤 Enviar 1 arquivo(s)"
3. ✅ Veja aparecer na seção "📁 Arquivos enviados (1)"
4. Clique em "Choose Files" NOVAMENTE → Selecione mais 2 PDFs
5. Clique "📤 Enviar 2 arquivo(s)"
6. ✅ Veja aparecer todos os 3 PDFs na lista!

**Teste o campo de links:**

No campo "🔗 Links (URLs)", cole:
```
https://exemplo.com/artigo1
https://exemplo.com/artigo2
```

**Teste o campo de prompts:**

No campo grande "✍️ Descrição Adicional / Prompts", escreva:
```
Quero dividir em 3 temporadas.
Foco em vendas e engajamento.
Tom sarcástico e visceral.
Público: mulheres 30-45 anos.
```

Clique "Próximo →"

---

### 📖 PASSO 2: Tipo de Conteúdo

Clique em **"Livro (300+ páginas)"**

Clique "Próximo"

---

### 📝 PASSO 3: Revisão de Conteúdo

(Apenas revise o texto acumulado)

Clique "Próximo"

---

### 🎯 PASSO 4: Objetivos

Marque os checkboxes:
- ✅ Vendas
- ✅ Engajamento  
- ✅ Crescimento/Seguidores

Clique "Próximo"

---

### 🎨 PASSO 5: Estilo Narrativo

Escolha: **"Tensão/Respiro"** (primeiro da lista)

Clique "Próximo"

---

### 🔍 PASSO 6: Análise Crítica

(Apenas visualize o resumo)

Clique "Próximo"

---

### 🎬 PASSO 8: GERAÇÃO - AQUI É A MÁGICA! ✨

**Você verá:**

```
📋 Resumo das Suas Escolhas:
- Tipo de Conteúdo: Livro
- Objetivos: Vendas, Engajamento, Crescimento/Seguidores
- 🎬 Estrutura em 3 Temporadas detectada!  ← AQUI!
- Seu Pedido: "Quero dividir em 3 temporadas..."
```

Clique no botão gigante: **"✨ Gerar Estrutura da Narrativa"**

**Aguarde 1-2 segundos...**

### ✅ RESULTADO ESPERADO:

Você verá uma estrutura visual completa:

```
📖 Estrutura Gerada:

╔═══════════════════════════════════════════╗
║ Temporada 1: [Título Visceral]           ║
║ Tema: Tema central da temporada 1        ║
║                                          ║
║ 📖 Capítulo 1 - O Gancho Inicial         ║
║    🪝 Frase provocativa que prende       ║
║                                          ║
║ 📖 Capítulo 2 - Desenvolvimento Visceral ║
║    🪝 Aprofundamento emocional           ║
║                                          ║
║ 📖 Capítulo 3 - Clímax da Temporada      ║
║    🪝 Momento de virada impactante       ║
║                                          ║
║ 🎬 Clímax: [momento emocional]           ║
║ 🔚 Resolução: [gancho para próxima]      ║
╚═══════════════════════════════════════════╝

[REPETE PARA TEMPORADA 2]

[REPETE PARA TEMPORADA 3]
```

---

## 🎉 SUCESSO!

Se você viu a estrutura dividida em 3 temporadas, **TUDO ESTÁ FUNCIONANDO!**

---

## 🧪 TESTES ADICIONAIS

### Teste 1: Mais PDFs
- Volte ao Passo 1
- Adicione mais 1 PDF
- Veja que agora tem 4 PDFs na lista!

### Teste 2: Diferentes números de temporadas
No campo de prompts, teste:
- "dividir em 2 temporadas"
- "quatro temporadas"
- "5 temporadas"

### Teste 3: Sem temporadas
Não mencione temporadas no prompt.
No Passo 8, verá estrutura de livro tradicional (3 partes, 30 capítulos).

---

## ❓ TROUBLESHOOTING

### Não vê a estrutura em temporadas?
- Certifique-se de escrever no campo de prompts algo como:
  - "3 temporadas"
  - "dividir em três temporadas"
  - "quatro temporadas"

### PDFs não estão acumulando?
- Certifique-se de clicar "Processar" após cada adição
- Veja se aparece a mensagem "✅ Pronto! Você pode adicionar mais"

### Erro ao rodar npm install?
- Erro do puppeteer é normal, pode ignorar
- Apenas execute: `npm run dev`

---

## 📞 FEEDBACK

Algo não funcionou como esperado?
- Descreva exatamente o que você fez
- Tire screenshot do que apareceu
- Cole no GitHub issue

---

**DIVIRTA-SE CRIANDO NARRATIVAS ÉPICAS! 🚀✨**
