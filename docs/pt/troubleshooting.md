# Guia de Solução de Problemas

## Erros de Autenticação

::: info Entrar com Bluesky (OAuth) — a partir da v3.0.0
A partir da **v3.0.0**, você pode entrar via OAuth escolhendo a aba "Bluesky", digitando seu handle e clicando em "Sign in with Bluesky". Uma janela do navegador será aberta para login; não é necessária senha de app. Se tiver problemas com OAuth, tente a aba "App Password" (veja [Problemas de Login](#problemas-de-login-método-app-password) abaixo).
:::

### Problemas de Login (método App Password)

O seguinte aplica-se quando você entra usando a aba **App Password**. Se usar **Bluesky (OAuth)** (v3.0.0+), consulte a nota no topo desta seção.

**Mensagem de Erro:**  
<span class="error-message">Error: Invalid identifier or password</span>

**Lista de Verificação:**
1. Entrada de Nome de Usuário e Senha
   - Verifique se há espaços acidentais
   - Se copiar e colar, certifique-se de que não há caracteres extras incluídos

2. Formato do Nome de Usuário
   - Formato correto: `your-username.bsky.social`
   - Erro comum: `your-username` (falta .bsky.social)

3. Informações de Senha
   - Recomendamos fortemente o uso de um [App Password](https://bsky.app/settings/app-passwords) em vez de sua senha regular
   - Formato do App Password: `xxxx-xxxx-xxxx-xxxx` (19 caracteres)

::: tip Dicas Úteis
Não confunda o App Password com o "password name" mostrado nas configurações.
Como criar um novo App Password:
2. [Navegue para a seção App Passwords](https://bsky.app/settings/app-passwords)
3. Clique em "Add App Password"
4. Clique em "Create App Password"
4. Copie a senha gerada de 19 caracteres
:::

---

### Autenticação de Dois Fatores Necessária

**Mensagem de Erro:**  
<span class="error-message">Error: Two-factor authentication required</span>

**Solução:**
1. Verifique seu e-mail para o código de autenticação
2. Insira o código no campo de entrada 2FA
3. Tente fazer login novamente

## Erros de Limite de Taxa

**Mensagem de Erro:**  
<span class="error-message">Error: Rate limit error</span>

**Solução:**
1. A API do Bluesky tem os seguintes limites ([documentação oficial](https://docs.bsky.app/docs/advanced-guides/rate-limits)):
   - Até 5.000 pontos por hora (aproximadamente 1.666 novas ações)
   - Até 35.000 pontos por dia
   - Pontos por ação:
     - Criar: 3 pontos
     - Atualizar: 2 pontos
     - Excluir: 1 ponto
2. Se você atingir o limite, aguarde até que o limite seja redefinido
3. Clique no botão "Restart" para tentar novamente

::: warning
A versão publicada no Firefox frequentemente encontra erros de limite de taxa. Se você encontrar um erro, tente no Chrome.
:::

::: tip
A maioria dos usuários não atingirá esses limites durante o uso normal. No entanto, tenha cuidado ao realizar ações em massa, como seguir muitos usuários ou curtir muitas postagens em um curto período.
:::

## Erros de Página

### Página Inválida

**Mensagem de Erro:**  
<span class="error-message">Error: Invalid page. please open the 𝕏 following or blocking or list page.</span>

**Solução:**
Use a extensão apenas nestas páginas do 𝕏 (Twitter):
- Página de Seguindo ([x.com/following](https://x.com/following))
- Página de Bloqueio ([x.com/settings/blocked/all](https://x.com/settings/blocked/all))
- Página de Membros da Lista (`x.com/i/lists/<list_id>/members`)

ou verifique as permissões da extensão na página de extensões.
As permissões do site devem ser como abaixo:

<img src="/images/site_permissions.png" alt="site permissions" width="500"/>

## Problemas de Varredura

### O botão View Detected Users não funciona

Por algum motivo, o botão View Detected Users pode não funcionar.

**Solução:**
1. Clique com o botão direito no ícone da extensão e selecione "Opções"
2. A página de resultados será exibida

<img src="/images/click-option.png" alt="clicar em opção" width="500"/>

### Varredura Para Cedo

A varredura para antes de chegar ao final da página

**Solução:**
1. Clique em "Resume Scanning" para continuar
2. A varredura parará automaticamente quando chegar ao final da página
3. Você pode clicar em "Stop Scanning and View Results" a qualquer momento

### Nenhum Usuário Encontrado

Nenhum usuário do Bluesky detectado após a varredura

**Solução:**
1. Certifique-se de que você está logado corretamente
2. Tente varrer novamente - alguns usuários podem não ser detectados na primeira passagem
3. Verifique se os usuários do 𝕏 vincularam suas contas do Bluesky em seus perfis

## Outros Problemas

Se você encontrar erros inesperados:

1. Recarregue a página
2. Tente a operação novamente
3. Se o problema persistir, você pode:
   - [Criar um problema](https://github.com/kawamataryo/sky-follower-bridge/issues) com:
     - A mensagem de erro exata
     - O que você estava tentando fazer
     - O tipo e a versão do seu navegador
     - Quaisquer capturas de tela relevantes
   - Ou mencionar [@kawamataryo.bsky.social](https://bsky.app/profile/kawamataryo.bsky.social) no Bluesky 
