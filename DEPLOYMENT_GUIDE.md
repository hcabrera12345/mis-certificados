# Guía Paso a Paso de Despliegue en Producción (GitHub + Supabase + Vercel)

Esta guía detalla el procedimiento exacto para desplegar el subsistema **Mis Certificados** en producción e integrarlo con la infraestructura existente de **Quinto**.

---

## 🚀 PASO 1: Subir el Código Fuente a GitHub

1. Inicializa y confirma el repositorio en Git local:
   ```bash
   git init
   git add .
   git commit -m "feat: Despliegue oficial Mis Certificados v2.0 - Ecosistema Quinto"
   ```

2. Crea un repositorio nuevo en tu cuenta de GitHub (ej. `mis-certificados`).

3. Vincula el remoto y sube la rama principal:
   ```bash
   git remote add origin https://github.com/tu-usuario/mis-certificados.git
   git branch -M main
   git push -u origin main
   ```

---

## 🗄️ PASO 2: Despliegue de Base de Datos & Supabase

1. Inicia sesión en [Supabase Dashboard](https://supabase.com/dashboard).
2. Crea un nuevo proyecto llamado `mis-certificados` (o reutiliza la instancia del proyecto Quinto).
3. Dirígete a la pestaña **SQL Editor** en la barra lateral izquierda.
4. Abre el archivo [supabase/schema.sql](file:///c:/Users/herna/.gemini/antigravity/playground/Mycertificado/supabase/schema.sql), copia todo su contenido y pégalo en el editor SQL de Supabase.
5. Haz clic en **"Run"** para crear automáticamente:
   - Extensión criptográfica `pgcrypto`.
   - Las 6 tablas (`profiles`, `courses`, `payment_receipts`, `certificates`, `deliveries_future`, `certificate_templates`).
   - Las políticas estricta **Row Level Security (RLS)**.
   - La carga inicial (*seed data*) de los **2 cursos vigentes de Quinto** (*Curso Adulto Mayor* y *Servicios de Quinto Eje*).
6. Copia tu `SUPABASE_URL` y tu `SUPABASE_ANON_KEY` desde **Project Settings -> API**.

---

## ⚡ PASO 3: Despliegue Automático en Vercel

1. Inicia sesión en [Vercel](https://vercel.com) con tu cuenta vinculada a GitHub.
2. Haz clic en **"Add New..." -> "Project"**.
3. Selecciona el repositorio `mis-certificados` importado desde GitHub.
4. En el panel **Environment Variables**, agrega las credenciales obtenidas en el Paso 2:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_QUINTO_SUPABASE_URL`
   - `NEXT_PUBLIC_QUINTO_SUPABASE_ANON_KEY`
   - `WHATSAPP_ADMIN_PHONE`
5. Haz clic en **"Deploy"**. En menos de 2 minutos, Vercel compilará la aplicación y te entregará el dominio oficial en producción (ej: `https://miscertificados.vercel.app` o `https://miscertificados.quinto.app`).

---

## 🔄 PASO 4: Conexión & Resguardo con Quinto CRM

- Al aprobar un pago en la consola de administración de Mis Certificados, la transacción y el comprobante validado por IA se resguardan de forma inmutable en Supabase y notifican automáticamente el evento al pipeline de ventas de **Quinto**.
