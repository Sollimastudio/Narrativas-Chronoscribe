# 🎯 Guia Rápido - Narrativas Chronoscribe

## O Que É Este App?

O **Narrativas Chronoscribe** é seu estúdio completo de criação de narrativas persuasivas. Ele transforma PDFs, textos e ideias em conteúdo profissional de alta conversão usando:

- **PNL** (Programação Neurolinguística)
- **UCG** (Venda Inconsciente)  
- **Storytelling Estratégico**

## ✨ O Que Você Pode Criar?

1. **Livros** (250-300 páginas) - Narrativas completas com capítulos
2. **E-books** - Material de autoridade para gerar leads
3. **Carrosséis** - Funis visuais para Instagram/LinkedIn
4. **Mentorias** - Programas com módulos e exercícios
5. **VSL** (Video Sales Letter) - Roteiros persuasivos
6. **Vídeos Longos** - Conteúdo educacional para YouTube
7. **Posts** - Conteúdo otimizado para redes sociais
8. **Artigos** - Textos de autoridade com SEO

## 🚀 Como Usar (Passo a Passo Simples)

### 1. Configure a Chave OpenAI (Só Uma Vez)

Abra o arquivo `.env.local` (está na raiz do projeto) e adicione sua chave:

```
OPENAI_API_KEY=sk-sua-chave-aqui
```

**Onde conseguir a chave?**  
- Entre em https://platform.openai.com/api-keys
- Crie uma conta (se não tiver)
- Clique em "Create new secret key"
- Copie e cole no `.env.local`

> **IMPORTANTE:** Se você NÃO colocar a chave, o app ainda funciona! Mas vai gerar conteúdo de exemplo (modo simulado) em vez de conteúdo real.

### 2. Inicie o App

Abra o terminal na pasta do projeto e digite:

```bash
npm run dev
```

Depois abra no navegador: **http://localhost:3100/arquiteto**

### 3. Siga as 9 Etapas na Tela

#### **Etapa 1: Upload**
- Anexe seus PDFs, DOCX, ou cole links
- Pode ser múltiplos arquivos (diários, rascunhos, fragmentos)
- Clique em "Processar"

#### **Etapa 2: Tipo de Conteúdo**
- Escolha o que quer criar (Livro, Ebook, Carrossel, etc)
- Revise o texto extraído
- Edite se quiser

#### **Etapa 3: Objetivos**
- Marque um ou mais objetivos:
  - Vendas
  - Engajamento
  - Crescimento (viralização)
  - Reconhecimento
  - Lançamento
  - Autoridade
  - Leads

#### **Etapa 4: Estilo**
- Escolha o estilo de escrita:
  - **Montanha-Russa da Viralidade** ⭐ (Recomendado para viralizar)
  - Executivo Estratégico
  - Poético Metafórico
  - Acadêmico
  - Storytelling
  - Visceral Provocativo

#### **Etapa 5: Análise Crítica**
- Clique em "Iniciar Análise"
- O sistema analisa seu conteúdo e sugere melhorias

#### **Etapa 6: Direção de Arte**
- Gera prompts profissionais de imagem
- Para carrosséis: escolha quantas imagens quer (8-10 recomendado)

#### **Etapa 7: Geração** ✨
- **AQUI A MÁGICA ACONTECE!**
- Clique em "✨ Gerar Conteúdo Persuasivo"
- Aguarde enquanto a IA cria seu conteúdo
- Veja o resultado na tela

#### **Etapa 8: Exportação**
- (Em breve: exportar PDF, DOCX, etc)

#### **Etapa 9: Reutilização**
- (Em breve: criar variações e adaptar para outros formatos)

## 🎨 Diferenciais do Sistema

### A Constituição Chronoscribe

Todo conteúdo gerado segue princípios de persuasão profunda:

1. **Meta-Modelo (PNL)** - Quebra crenças limitantes
2. **Milton-Modelo** - Linguagem hipnótica e comandos embutidos
3. **UCG** - Atinge cérebro reptiliano (dor e desejo)
4. **Storytelling** - Jornada do Herói e arcos emocionais
5. **Quebras de Padrão** - Conteúdo impossível de ignorar

### Estilos Únicos

**Montanha-Russa da Viralidade:**
- Tensão extrema + alívio catártico
- Quebras de padrão constantes
- Ganchos emocionais a cada 2-3 parágrafos
- Maximiza engajamento e shares

## 🛠️ Comandos Úteis

```bash
# Instalar dependências (primeira vez)
npm install

# Configurar banco e variáveis
npm run setup

# Iniciar app em desenvolvimento
npm run dev

# Criar versão de produção
npm run build

# Iniciar versão de produção
npm start
```

## ❓ Problemas Comuns

### "Conteúdo gerado em modo simulado"

**Causa:** Falta a chave OpenAI  
**Solução:** Adicione `OPENAI_API_KEY` no `.env.local`

### "Erro ao gerar conteúdo"

**Causa:** Chave inválida ou sem créditos  
**Solução:** 
1. Verifique se a chave está correta
2. Acesse https://platform.openai.com/account/billing
3. Adicione créditos se necessário

### Aplicação não inicia

**Causa:** Porta 3100 já em uso  
**Solução:** 
```bash
# Matar processos na porta 3100
pkill -f "next dev"

# Ou usar outra porta
npm run dev -- -p 3200
```

## 📚 Próximos Passos

Depois de gerar seu primeiro conteúdo:

1. ✅ Experimente diferentes estilos
2. ✅ Teste vários tipos de conteúdo
3. ✅ Compare o modo simulado vs. real (com API key)
4. ✅ Use a Análise Crítica para refinar
5. ✅ Gere prompts de arte para suas imagens

## 💡 Dicas de Ouro

- **Para livros:** Envie capítulos separados como PDFs individuais
- **Para carrosséis:** Seja específico no objetivo (vendas? engajamento?)
- **Para VSL:** Use estilo "Montanha-Russa" + objetivo "Vendas"
- **Material de entrada:** Quanto mais contexto você der, melhor o resultado
- **Edição:** Sempre revise o material base na Etapa 2 antes de gerar

## 🎯 Objetivo Final

Este app não é só um "gerador de texto". É uma **máquina de persuasão** que usa ciência comportamental e narrativa estratégica para criar conteúdo que:

- **Comanda atenção**
- **Move desejo**  
- **Direciona ação**
- **Converte**

Transforme palavras em poder. Transforme tensão em vendas. Transforme narrativas em impérios.

---

**Dúvidas?** Abra uma issue no GitHub ou consulte a documentação completa em `/docs`
