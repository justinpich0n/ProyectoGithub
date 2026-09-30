# Backend de BizzStock: conexión local a MySQL

Servidor de BizzStock para la papelería y variedades Arte y Belleza. Esta etapa prepara Express y su conexión a MySQL; todavía no incorpora tablas del negocio, autenticación ni frontend React.

Se sigue la [guía técnica del profesor](https://github.com/borissalleg/practica-node) con Express, `mysql2`, `dotenv`, `cors` y `nodemon`. Las consultas usan un pool: un conjunto limitado de conexiones que se reutilizan.

## Estado de esta revisión

La configuración de Wamp identifica los siguientes servicios:

| Motor | Versión configurada | Servicio de Windows | Puerto configurado |
| --- | --- | --- | --- |
| MySQL | 9.1.0 | `wampmysqld64` | 3306 |
| MariaDB | 11.5.2 | `wampmariadb64` | 3307 |

MySQL está en ejecución (`Running`) después de iniciarlo desde una terminal con permisos de administrador. MariaDB permanece detenido (`Stopped`). Se utiliza MySQL para seguir la guía; no es necesario iniciar MariaDB para esta práctica.

El acceso inicial documentado por Wamp se comprobó mediante `mysql2`, sin imprimir contraseñas ni modificar cuentas. La consulta `SELECT 1 AS ok` devolvió `1`; el servidor confirmó MySQL 9.1.0 y puerto 3306.

Antes de crear la base, `SHOW DATABASES` mostró únicamente `information_schema`, `mysql`, `performance_schema` y `sys`. Se creó `bizzstock` con una instrucción condicional, sin modificar las bases existentes. Se verificaron la codificación `utf8mb4`, la colación `utf8mb4_unicode_ci` y **cero tablas**.

El archivo local `.env` tiene `DB_ENABLED=true` y los datos de acceso comprobados. Se verificó que Git lo ignora y que no está entre los archivos bajo seguimiento. Tras detener la sesión anterior de esta práctica y ejecutar `npm start`, el pool confirmó `SELECT 1 = 1` dentro de `bizzstock`, con `utf8mb4`. `/api/health` respondió HTTP 200 y `baseDeDatos: "conectada"`. Los comandos siguientes permiten repetir las verificaciones.

## 1. Iniciar MySQL y comprobar su puerto

Primero se revisan los servicios y el puerto para evitar iniciar un servidor sobre un puerto ocupado:

```powershell
Get-Service -Name wampmysqld64,wampmariadb64
Get-NetTCPConnection -State Listen -LocalPort 3306 -ErrorAction SilentlyContinue
```

Si otro proceso ocupa 3306, hay que identificarlo antes de continuar. No detener otros servicios por suposición.

Para iniciar MySQL, abrir **PowerShell como administrador** y ejecutar:

```powershell
Start-Service -Name wampmysqld64
Get-Service -Name wampmysqld64
Get-NetTCPConnection -State Listen -LocalPort 3306
```

El servicio debe aparecer como `Running` y el puerto como `Listen`. Esto comprueba que el proceso está activo; todavía no comprueba usuario, contraseña ni acceso a una base.

## 2. Comprobar el acceso y revisar las bases

Utilizar el usuario y la contraseña locales que realmente correspondan. No escribir contraseñas en comandos, capturas ni mensajes. Desde el cliente de MySQL, `--password` sin un valor solicita la contraseña sin incluirla en el comando:

```powershell
& 'C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe' --host=127.0.0.1 --port=3306 --user=TU_USUARIO --password
```

`TU_USUARIO` es un ejemplo que debe sustituirse. Si se desconoce el acceso, debe comprobarse la configuración documentada de esa instalación o consultarse con quien configuró MySQL; esta etapa no restablece cuentas ni cambia contraseñas.

Después de iniciar sesión, ejecutar consultas de lectura:

```sql
SELECT VERSION() AS version, @@port AS puerto;
SHOW DATABASES;
SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM INFORMATION_SCHEMA.SCHEMATA
WHERE SCHEMA_NAME = 'bizzstock';
```

Estas consultas verifican el servidor efectivo y si la base de la práctica ya existe. La versión y el puerto efectivos deben compararse con la configuración de Wamp.

Si `bizzstock` ya existe, revisar sus tablas sin modificarlas:

```sql
SHOW TABLES FROM bizzstock;
```

Si la base no existe, crear únicamente la base vacía:

```sql
CREATE DATABASE IF NOT EXISTS bizzstock
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

`utf8mb4` permite almacenar español y otros caracteres Unicode. `IF NOT EXISTS` evita reemplazar una base existente. Si una base previa usa otra codificación, registrar ese resultado y revisar la decisión antes de modificarla; no ejecutar `ALTER`, `DROP` ni recrear tablas.

Repetir la consulta a `INFORMATION_SCHEMA.SCHEMATA` para comprobar la codificación. Si la base acaba de crearse, `SHOW TABLES FROM bizzstock` debe devolver una lista vacía. Esta etapa no crea tablas del negocio ni cambia permisos de usuarios.

## 3. Configurar el backend sin compartir secretos

Desde la raíz del proyecto:

```powershell
cd backend
npm install
if (-not (Test-Path -LiteralPath .env)) {
    Copy-Item -LiteralPath .env.example -Destination .env
}
```

La condición conserva un `.env` existente. Editar ese archivo localmente y completar los valores reales:

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto de Express; para esta práctica, 3000. |
| `DB_ENABLED` | `true` después de confirmar el acceso y preparar la base; `false` permite ejecutar solo HTTP. |
| `DB_HOST` | Dirección local de MySQL: `127.0.0.1`. |
| `DB_PORT` | Puerto verificado de MySQL: 3306. |
| `DB_USER` | Usuario local autorizado. |
| `DB_PASSWORD` | Contraseña real, guardada únicamente en `.env`. |
| `DB_NAME` | Nombre de la base: `bizzstock`. |

Los valores de usuario y contraseña en `.env.example` son marcadores de ejemplo, no credenciales utilizables. Si la contraseña contiene `#`, debe ir entre comillas para que dotenv no lo interprete como un comentario. Una contraseña vacía solo es válida si se ha confirmado expresamente que esa cuenta la usa.

Comprobar las exclusiones de Git desde `backend/`:

```powershell
git check-ignore -v .env
git ls-files -- .env
```

El primer comando debe mostrar la regla que ignora `.env`; el segundo no debe devolver archivos. No utilizar `git add -f` con `.env`. Git conserva `.env.example` como plantilla sin secretos.

## 4. Iniciar y comprobar Express

Si el servidor de esta práctica ya está abierto, detenerlo con **Ctrl+C en su propia terminal** antes de volver a iniciarlo. El cierre deja de aceptar peticiones y cierra el pool. No finalizar todos los procesos de Node del equipo.

Desde `backend/`:

```powershell
npm start
```

Para desarrollo también puede usarse `npm run dev`: nodemon reinicia el servidor al guardar código. Después de cambiar `.env`, reiniciar explícitamente el servidor para cargar la configuración nueva.

Cuando MySQL está habilitado, el backend ejecuta `SELECT 1 AS ok` mediante el pool antes de abrir HTTP. La consulta no modifica datos. Si faltan variables obligatorias o un puerto es inválido, el servidor no inicia. Si la configuración es válida pero MySQL no responde, HTTP sigue disponible para informar del fallo con un mensaje sin credenciales y comprobar si se recupera la conexión.

En otra terminal:

```powershell
curl.exe -i http://127.0.0.1:3000/api/health
```

La ruta vuelve a ejecutar `SELECT 1` en cada petición:

| Resultado | Estado HTTP | Campo `baseDeDatos` |
| --- | --- | --- |
| La consulta funciona | 200 | `conectada` |
| MySQL no responde a la consulta | 503 | `no disponible` |
| Se ejecutó con `DB_ENABLED=false` | 503 | `deshabilitada` |

El cuerpo identifica BizzStock y no incluye contraseñas ni errores internos de MySQL. Un 503 con MySQL deshabilitado es esperado: el servidor HTTP responde, pero la aplicación aún no dispone de base de datos. Un error de conexión al puerto 3000 indica que Express no está escuchando; revisar primero su terminal.

No detener un MySQL compartido solo para probar un fallo. La prueba aislada usa un pool simulado y cubre consulta exitosa, fallo, recuperación y modo deshabilitado. Desde la raíz del proyecto se ejecuta con:

```powershell
node --test backend/test/health.test.js
```

Esta prueba pasó durante la preparación. Comprueba las respuestas de la ruta; no sustituye la validación contra MySQL. También se completó la validación real: la consulta desde el pool devolvió `1` y `/api/health` respondió HTTP 200 después de reiniciar Express. No se detuvo el servicio MySQL para simular fallos.

## Archivos y responsabilidades

- `src/app.js`: Express, CORS, lectura de JSON y `/api/health`.
- `src/db.js`: configuración del pool y consulta de comprobación.
- `server.js`: carga `.env`, comprueba la conexión, inicia HTTP y gestiona el cierre.
- `test/health.test.js`: prueba aislada del estado de la base en `/api/health`.
- `package.json`: dependencias y comandos; `package-lock.json`: versiones resueltas.
- `.env`: configuración local privada, ignorada por Git.
- `.env.example`: plantilla de configuración sin secretos.
- `node_modules/`: dependencias instaladas, ignoradas por Git.

Express escucha únicamente en `127.0.0.1` durante esta etapa local.

## Conceptos para la sustentación

**Instalar MySQL** coloca el programa y sus herramientas en el equipo. **Iniciar el servicio** ejecuta ese programa para que atienda conexiones. **Crear una base** prepara un espacio lógico donde luego se guardarán las tablas. **Conectar Express** permite que el código del servidor acceda a esa base usando `mysql2` y las credenciales configuradas.

Son pasos distintos: tener MySQL instalado no significa que esté ejecutándose; tener el servicio activo no significa que exista `bizzstock`; tener la base creada no significa que Express pueda acceder a ella. `SELECT 1` verifica la conexión en ese momento, sin comprobar todavía funcionalidades del negocio.
