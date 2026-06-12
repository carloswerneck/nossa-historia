# Nossa História

Site de presente digital — página única em HTML/CSS/JS puro, servida via nginx.

## Deploy (EasyPanel)

1. Crie um serviço do tipo **App** no EasyPanel.
2. Em **Source**, conecte este repositório do GitHub (branch `main`).
3. Em **Build**, selecione **Dockerfile**.
4. Em **Domains**, adicione seu domínio apontando para a porta **80**.
5. Clique em **Deploy**.

Cada `git push` na branch `main` pode disparar um novo deploy automaticamente
(ative o deploy por webhook/auto-deploy nas configurações do serviço).
