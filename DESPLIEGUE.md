# Despliegue del frontend (Angular) en BanaHosting

Al subir cambios a la rama **master** en GitHub, el flujo
`.github/workflows/desplegar-frontend.yml` compila el proyecto y publica el
resultado por FTP. No hace falta entrar al servidor.

```
git push  →  GitHub Actions: npm ci + ng build  →  FTP  →  /pvn/
```

## 1. Preparar el repositorio en GitHub

En la máquina local, dentro de `D:\Proyectos\pvn`:

```bash
git add -A
git commit -m "Estado actual del proyecto"
git remote add origin https://github.com/Cralitros/pvn.git
git push -u origin master
```

> Recomendado: repositorio **privado** (el código contiene nombres de tablas y
> rutas internas). Las credenciales del backend están en su `.env`, que está en
> el `.gitignore` y **no** se sube.

## 2. Crear la cuenta FTP en cPanel

cPanel → **FTP Accounts** → *Create FTP Account* (puedes usar la principal de la
cuenta). Anota: servidor, usuario y contraseña.

## 3. Averiguar la carpeta de destino

cPanel → **File Manager**. La carpeta donde está el `index.html` publicado es el
destino, normalmente:

```
/public_html/pvn/
```

## 4. Guardar los datos en GitHub como Secrets

GitHub → tu repositorio → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Ejemplo |
|---|---|
| `FTP_SERVER` | `ftp.derechopucp.com` |
| `FTP_USUARIO` | `usuario@derechopucp.com` |
| `FTP_PASSWORD` | (la contraseña del FTP) |
| `FTP_CARPETA_FRONT` | `/public_html/pvn/` |

Las contraseñas **nunca** van en el código, sólo en los Secrets.

## 5. Desplegar

- Automático: cualquier `git push` a `master`.
- Manual: GitHub → **Actions** → *Desplegar frontend* → **Run workflow**.

Luego, en el navegador, **Ctrl + Shift + R**.

## ⚠️ 6. Limpieza de seguridad (hazlo una vez, al desplegar este build)

Este proyecto tenía `"prerender": true`, que generaba páginas estáticas de las
rutas **protegidas** con los datos de las tablas dentro del HTML. Esas páginas
se podían abrir **sin iniciar sesión**:

```
https://derechopucp.com/pvn/dashboard/personal/   ← datos reales en el HTML
```

Ya está desactivado (`"prerender": false` en `angular.json`) y el flujo falla a
propósito si se vuelve a activar. Pero **el build nuevo no borra lo antiguo**,
así que hay que eliminar esas carpetas del servidor una vez:

cPanel → **File Manager** → `/public_html/pvn/` → borra **las carpetas de rutas**
(`dashboard`, `login`, etc.). Deja sólo:

```
assets/   media/   index.html   main-*.js   polyfills-*.js   chunk-*.js   styles-*.css   favicon.ico
```

## Notas

- **La base de datos no se toca** desde aquí: los cambios de esquema (por ejemplo
  `ALTER TABLE`) se ejecutan a mano en phpMyAdmin.
- Los `main-*.js` antiguos se quedan en la carpeta (no se borra nada del
  servidor, para no perder el `.htaccess`). Son inofensivos; si quieres, bórralos
  de vez en cuando.
- El flujo comprueba antes de subir que el bundle apunta a
  `derechopucp.com/backendPucp2` (lo que está en `src/environments/environment.ts`).
