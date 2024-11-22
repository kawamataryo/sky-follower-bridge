# Guía de solución de problemas

## Errores de autenticación

### Problemas de inicio de sesión

**Mensaje de error:**  
<span class="error-message">Error: Invalid identifier or password</span>

**Lista de verificación:**
1. Entrada de nombre de usuario y contraseña
   - Verifica si hay espacios accidentales
   - Si copias y pegas, asegúrate de que no se incluyan caracteres adicionales

2. Formato del nombre de usuario
   - Formato correcto: `tu-usuario.bsky.social`
   - Error común: `tu-usuario` (falta .bsky.social)

3. Información de la contraseña
   - Recomendamos encarecidamente usar una [Contraseña de la aplicación](https://bsky.app/settings/app-passwords) en lugar de tu contraseña regular
   - Formato de la contraseña de la aplicación: `xxxx-xxxx-xxxx-xxxx` (19 caracteres)

::: tip Consejos útiles
No confundas la Contraseña de la aplicación con el "nombre de la contraseña" que se muestra en la configuración.
Cómo crear una nueva Contraseña de la aplicación:
2. [Navega a la sección de Contraseñas de la aplicación](https://bsky.app/settings/app-passwords)
3. Haz clic en "Agregar Contraseña de la aplicación"
4. Haz clic en "Crear Contraseña de la aplicación"
4. Copia la contraseña generada de 19 caracteres
:::

---

### Se requiere autenticación de dos factores

**Mensaje de error:**  
<span class="error-message">Error: Two-factor authentication required</span>

**Solución:**
1. Revisa tu correo electrónico para obtener el código de autenticación
2. Ingresa el código en el campo de entrada de 2FA
3. Intenta iniciar sesión nuevamente

## Errores de límite de tasa

**Mensaje de error:**  
<span class="error-message">Error: Rate limit error</span>

**Solución:**
1. La API de Bluesky tiene los siguientes límites ([documentación oficial](https://docs.bsky.app/docs/advanced-guides/rate-limits)):
   - Hasta 5,000 puntos por hora (aproximadamente 1,666 acciones nuevas)
   - Hasta 35,000 puntos por día
   - Puntos por acción:
     - Crear: 3 puntos
     - Actualizar: 2 puntos
     - Eliminar: 1 punto
2. Si alcanzas el límite, espera hasta que se restablezca
3. Haz clic en el botón "Reiniciar" para intentarlo de nuevo

::: warning
La versión publicada en Firefox frecuentemente encuentra errores de límite de tasa. Si encuentras un error, intenta en Chrome.
:::

::: tip
La mayoría de los usuarios no alcanzarán estos límites durante el uso normal. Sin embargo, ten cuidado al realizar acciones masivas como seguir a muchos usuarios o dar me gusta a muchas publicaciones en un corto período.
:::

## Errores de página

### Página inválida

**Mensaje de error:**  
<span class="error-message">Error: Invalid page. please open the 𝕏 following or blocking or list page.</span>

**Solución:**
Usa la extensión solo en estas páginas de 𝕏 (Twitter):
- Página de seguidos ([x.com/following](https://x.com/following))
- Página de bloqueados ([x.com/settings/blocked/all](https://x.com/settings/blocked/all))
- Página de miembros de lista (`x.com/i/lists/<list_id>/members`)

o verifica los permisos de tu extensión en la página de extensiones.
Los permisos del sitio deben ser como se muestra a continuación:

<img src="/images/site_permissions.png" alt="permisos del sitio" width="500"/>

## Problemas de escaneo

### El escaneo se detiene temprano

El escaneo se detiene antes de llegar al final de la página

**Solución:**
1. Haz clic en "Reanudar escaneo" para continuar
2. El escaneo se detendrá automáticamente cuando llegue al final de la página
3. Puedes hacer clic en "Detener escaneo y ver resultados" en cualquier momento

### No se encontraron usuarios

No se detectaron usuarios de Bluesky después del escaneo

**Solución:**
1. Asegúrate de haber iniciado sesión correctamente
2. Intenta escanear de nuevo - algunos usuarios pueden no ser detectados en el primer intento
3. Verifica si los usuarios de 𝕏 han vinculado sus cuentas de Bluesky en sus perfiles

## Otros problemas

Si encuentras errores inesperados:

1. Recarga la página
2. Intenta la operación nuevamente
3. Si el problema persiste, puedes:
   - [Crear un problema](https://github.com/kawamataryo/sky-follower-bridge/issues) con:
     - El mensaje de error exacto
     - Lo que estabas intentando hacer
     - Tu tipo y versión de navegador
     - Cualquier captura de pantalla relevante
   - O mencionar a [@kawamataryo.bsky.social](https://bsky.app/profile/kawamataryo.bsky.social) en Bluesky 
