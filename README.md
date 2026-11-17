# testAval – Gestión de clientes

Aplicación web para registrar y administrar clientes, desarrollada para la kata **"Ciclo de vida de una aplicación"**. El mismo código se ejecuta en dos ambientes, **dev** y **prod**, con configuraciones distintas: puerto, nombre de la aplicación, mensaje de log y nivel de seguridad.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Python, Django y Django REST Framework |
| Frontend | React (Vite + TypeScript) |
| Base de datos | PostgreSQL |
| Diseño y responsive | Tailwind CSS |
| Autenticación | JWT (SimpleJWT) sobre los usuarios y grupos de Django |
| Documentación de la API | Swagger / OpenAPI (drf-spectacular) |
| Despliegue en prod | Docker Compose: gunicorn, nginx y WhiteNoise |

## Decisiones de diseño

### Django como backend
Elegí Django porque es el framework con el que más experiencia tengo desarrollando backend, y la prueba permitía usar Python. Además, me permitió aprovechar lo que trae de fábrica:

- **Panel de administración** (`/admin/`), que uso para gestionar clientes.
- **ORM y migraciones**, para modelar y versionar la base de datos.
- **Sistema de autenticación** y las tablas por defecto (usuarios, grupos, permisos y sesiones).

### Login y registro
Gracias a esas herramientas me animé a ir más allá del CRUD y agregué **inicio de sesión y registro**. El comportamiento depende del rol de quien ingresa:

| Quién ingresa | Qué ve |
|---|---|
| **Administrador** o superusuario | El listado de clientes (grilla) con búsqueda, creación, edición y eliminación |
| **Cliente** (cualquier rol distinto de administrador) | Su propia información, con la opción de completarla o editarla |

Quien se registra desde la pantalla de acceso queda como **Cliente**. El correo electrónico se usa como nombre de usuario.

### Un solo modelo de usuario y roles con grupos
No creé una tabla de clientes independiente. Usé la tabla de usuarios de Django (`auth_user`), una única tabla de perfil asociada a ella (`users_profile`, que comparte el `id` del usuario) y la **tabla de grupos** de Django (`auth_group`) para diferenciar los roles: `Administrador` y `Cliente`. Todos los usuarios tienen los mismos campos, sin importar su rol.

Lo hice pensando en la escalabilidad: para agregar un nuevo tipo de usuario basta con crear un grupo y registrar su endpoint, sin crear tablas ni aplicaciones nuevas. Los grupos se crean automáticamente al ejecutar las migraciones.

### Endpoints de clientes sin token
Los endpoints de `/api/customers/` **no exigen token**. Lo dejé así a propósito para que quien evalúe pueda probarlos de forma sencilla desde Swagger. Los endpoints de administradores sí exigen un token de un usuario con rol `Administrador`.

### Swagger y panel de administración
- **Swagger** (`/api/docs/`) documenta toda la API y permite probarla directamente desde el navegador. Está activo en dev y apagado en prod.
- **Panel de Django** (`/admin/`): agregué la sección **Clientes** con listado, búsqueda, filtros, y creación, edición y eliminación. Los cambios hechos allí se reflejan en la API, y al revés.

---

## Estructura del proyecto

```
testAval/
├── backend/             API Django (configuración por ambiente en config/settings/)
├── frontend/            Aplicación React (incluye Dockerfile y nginx.conf para prod)
├── docker-compose.yml   Stack de producción (base de datos, backend y frontend)
├── .env.example         Variables del stack de producción
└── README.md
```

## Obtener el proyecto

```bash
git clone https://github.com/nanferbn2856e/testAval.git
cd testAval
```

Puedes ejecutarlo en **prod con Docker** (lo más rápido, no requiere instalar nada más) o en **dev** (requiere Python, Node y PostgreSQL).

---

## Ejecutar en PROD (Docker)

**Requisito:** Docker Desktop (o Docker con Compose).

### 1. Variables de entorno

```bash
copy .env.example .env        # Linux/Mac: cp .env.example .env
```

Abre el `.env` de la raíz y cambia `POSTGRES_PASSWORD` y `SECRET_KEY` por valores propios. El resto de valores ya sirven para la prueba local. El `.env` no se sube al repositorio.

### 2. Dominio local

Agrega esta línea al archivo `hosts`, editándolo como administrador:

- Windows: `C:\Windows\System32\drivers\etc\hosts`
- Linux/Mac: `/etc/hosts`

```
127.0.0.1 testaval.local
```

### 3. Construir y levantar

```bash
docker compose up --build
```

Este comando construye las imágenes, aplica las migraciones (y crea los grupos), recolecta los archivos estáticos e inicia gunicorn. Cuando el log muestre `Listening at: http://0.0.0.0:9090`, el servicio está listo. Deja esa terminal abierta.

### 4. Crear el superusuario

En otra terminal, desde la misma carpeta:

```bash
docker compose exec backend python manage.py createsuperuser
```

Si la terminal no es interactiva, usa `docker compose exec -it backend python manage.py createsuperuser`.

### 5. Abrir la aplicación

Ingresa a **http://testaval.local**. Para detener el servicio: `docker compose down`. Para detenerlo y borrar también la base de datos: `docker compose down -v`.

---

## Ejecutar en DEV

**Requisitos:** Python 3.10 o superior, Node 20 o superior y PostgreSQL.

### 1. Base de datos

En `psql`, con un usuario administrador y una contraseña propia:

```sql
CREATE DATABASE testaval_dev;
CREATE USER customers_user WITH PASSWORD 'tu_clave_segura';
GRANT ALL PRIVILEGES ON DATABASE testaval_dev TO customers_user;
\c testaval_dev
GRANT ALL ON SCHEMA public TO customers_user;
ALTER DATABASE testaval_dev OWNER TO customers_user;
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate         # Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env        # Linux/Mac: cp .env.example .env
```

Edita `backend/.env` con tus valores:

```
SECRET_KEY=una-clave-larga-y-propia
DATABASE_URL=postgres://customers_user:tu_clave_segura@localhost:5432/testaval_dev
```

Luego aplica las migraciones, crea el superusuario y levanta el servidor:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

El servidor queda en **http://localhost:8080**. El puerto no se escribe en el comando: sale de `PORT = 8080` en `config/settings/dev.py`.

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173**. La URL del API se toma de `frontend/.env.development`.

---

## Cómo probar la aplicación

1. **Crea el superusuario** (paso 4 en prod, o el comando de la sección dev).
2. **Ingresa con el superusuario:** en la pantalla de acceso escribe su usuario (o correo) y su contraseña. Verás el listado de clientes con el CRUD completo.
3. **Registra un cliente:** cierra sesión, entra a **Registrarme** y crea una cuenta nueva. Verás tu perfil con el aviso para completarlo; completa los datos y guarda.
4. **Vuelve a ingresar con el superusuario:** el cliente nuevo aparece en el listado y puedes editarlo o eliminarlo.
5. **Panel de Django:** entra a `/admin/` con el superusuario y abre la sección **Clientes**.
6. **Swagger (solo en dev):** abre `http://localhost:8080/api/docs/`.
   - Los endpoints de **Clientes** se prueban directamente, sin token.
   - Para **Administradores**: ejecuta `POST /api/auth/login/` con el usuario del superusuario, copia el valor de `access`, pulsa **Authorize** y pega solo el token (sin la palabra `Bearer`). El token dura 5 minutos; después repite el login.

### Endpoints principales (`/api`)

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/auth/register/` | Registro (crea un Cliente) | Público |
| POST | `/auth/login/` | Login: devuelve tokens JWT y roles | Público |
| POST | `/auth/refresh/` | Renueva el token de acceso | Público |
| GET, POST | `/customers/` | Listar y crear clientes | Sin token |
| GET, PUT, PATCH, DELETE | `/customers/{id}/` | Consultar, editar y eliminar (`id` = `user.id`) | Sin token |
| GET, POST | `/administrators/` | Listar y crear administradores | Rol Administrador |
| GET, PUT, PATCH, DELETE | `/administrators/{id}/` | Consultar, editar y eliminar | Rol Administrador |

Ejemplo de cuerpo para crear un cliente (`POST /api/customers/`):

```json
{
  "first_name": "Juan",
  "last_name": "Perez",
  "email": "juan@email.com"
}
```

---

## Diferencias entre DEV y PROD

| | **DEV** | **PROD** |
|---|---|---|
| Settings | `config.settings.dev` | `config.settings.prod` |
| Nombre de la aplicación | `customers-dev` | `customers-prod` |
| Mensaje de log | `Ejecutando en DEV` | `Ejecutando en PROD` |
| Puerto | 8080 (`runserver`) | 9090 (gunicorn, dentro de Docker) |
| Servidor | `runserver` | gunicorn detrás de nginx |
| `DEBUG` | `True` | `False` |
| Acceso | URL con IP o localhost, sin dominio | Dominio (`testaval.local` en la prueba) |
| Hosts y CORS | Abiertos | Solo los definidos en variables de entorno |
| Archivos estáticos | `runserver` | WhiteNoise |
| Swagger (`/api/docs/`) | Activo | Apagado (responde 404) |
| Cookies | Estándar | Seguras (`COOKIES_SECURE`) |

Para ver la diferencia al ejecutar:

- **DEV:** al iniciar `runserver` se imprime `INFO [customers-dev] Ejecutando en DEV` y `http://127.0.0.1:8080/`.
- **PROD:** `docker compose logs backend` muestra `INFO [customers-prod] Ejecutando en PROD` y gunicorn escuchando en `0.0.0.0:9090`. Desde fuera solo se accede por nginx, en el puerto 80.

El código es el mismo en ambos ambientes. Lo que cambia es el módulo de settings (`DJANGO_SETTINGS_MODULE`) y las variables de entorno.

## Variables de entorno

**Dev** (`backend/.env`):

| Variable | Uso |
|---|---|
| `SECRET_KEY` | Clave secreta de Django |
| `DATABASE_URL` | Conexión a PostgreSQL |

**Prod** (`.env` en la raíz):

| Variable | Uso |
|---|---|
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Base de datos del contenedor `db` |
| `SECRET_KEY` | Clave secreta de Django |
| `ALLOWED_HOSTS` | Dominios desde los que se sirve la aplicación |
| `CORS_ALLOWED_ORIGINS` | Orígenes del frontend autorizados |
| `CSRF_TRUSTED_ORIGINS` | Orígenes de confianza para el panel de administración |
| `SECURE_SSL_REDIRECT` | Redirige a HTTPS. Va en `False` solo en la prueba local por http |
| `COOKIES_SECURE` | Cookies solo por HTTPS. Va en `False` solo en la prueba local por http |
| `VITE_API_URL` | URL del API con la que se construye el frontend |

En un servidor con HTTPS real: `SECURE_SSL_REDIRECT=True`, `COOKIES_SECURE=True` y el dominio propio (con `https://`) en `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` y `CSRF_TRUSTED_ORIGINS`.

## Seguridad

- Los archivos `.env` no se versionan; solo se incluyen los `.env.example`, con valores ficticios.
- Cada ambiente usa su propia `SECRET_KEY` y su propia contraseña de base de datos.

## Limitaciones y mejoras identificadas

- La prueba local de prod usa **http**, no HTTPS. Por eso `SECURE_SSL_REDIRECT` y `COOKIES_SECURE` van en `False` en `.env.example`.
- Los endpoints de clientes sin token son una decisión para facilitar la evaluación. En un uso real exigirían autenticación y cada cliente solo accedería a su propio registro.
- Quedan pendientes las pruebas automatizadas y el despliegue con un dominio y HTTPS reales.
