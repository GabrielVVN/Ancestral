# Deploy no Render — Projeto `Ancestral`

Instruções rápidas para conectar este repositório ao Render (https://render.com).

1. Commit dos arquivos (local)
```bash
git add Procfile runtime.txt .gitignore README_RENDER.md
git commit -m "Add Procfile, runtime and deploy instructions for Render"
git push origin main
```

2. Configurações no Render (UI)
- **New** → **Web Service**
- Conecte sua conta GitHub/GitLab e selecione o repositório deste projeto.
- **Branch**: `main`
- **Environment**: `Python`
- **Build Command**: deixar em branco (ou `pip install -r requirements.txt`)
- **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
- **Auto Deploy**: ativar (opcional)

3. Observações
- O Render fornece a variável de ambiente `PORT`; o `Procfile` e o `Start Command` usam `$PORT`.
- Dependências estão listadas em `requirements.txt` (contém `Flask` e `gunicorn`).
- Se precisar definir variáveis de ambiente (ex.: `SECRET_KEY`), adicione-as no painel do serviço → **Environment** → **Add Environment Variable**.

4. Teste local rápido
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
gunicorn app:app --bind 0.0.0.0:5000
# Em outro terminal:
curl http://127.0.0.1:5000/
curl http://127.0.0.1:5000/jogo
```

Se precisar, eu posso gerar e commitar outros ajustes (por exemplo um `Procfile` alternativo, `runtime` com outra versão, ou instruções para bancos/variáveis).  
