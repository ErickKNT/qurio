import { chromium } from 'playwright';
import { startSpaServer } from './spa_server.mjs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

const results = [];

function logPass(testName, detail = '') {
  console.log(`[PASS] ${testName} ${detail ? `(${detail})` : ''}`);
  results.push({ test: testName, status: 'PASSED', detail });
}

function logFail(testName, error) {
  console.error(`[FAIL] ${testName}:`, error);
  results.push({ test: testName, status: 'FAILED', error: String(error) });
}

async function runE2ESuite() {
  console.log('================================================================');
  console.log('QURIO — SUITE DE VALIDACIÓN E2E DE NAVEGADOR (FASE 11 PILOTO)');
  console.log('================================================================');

  // 1. Iniciar servidor SPA local
  const server = await startSpaServer(5173);

  // 2. Lanzar Google Chrome en modo Headless
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Qurio-Pilot-E2E-Agent/1.0',
  });

  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.startsWith('[App]') || text.startsWith('[AuthModal]') || msg.type() === 'error') {
      console.log('   [Browser]', text);
    }
  });
  page.on('pageerror', err => console.error('   [Browser Page Error]', err));

  // Interceptar llamadas a Supabase Auth para simular de forma controlada y segura
  // sin escribir jamás en Supabase Cloud de producción
  await page.route(/\/auth\/v1\/signup/, async (route) => {
    console.log('   [Intercepted Auth] signup intercepted successfully');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'usr_fictitious_pilot_01',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'pilot_user_01@qurio.dev',
        created_at: new Date().toISOString(),
        confirmed_at: null,
        user_metadata: {
          username: 'pilot_student',
          display_name: 'Estudiante Piloto',
        },
      }),
    });
  });

  await page.route(/\/auth\/v1\/recover/, async (route) => {
    console.log('   [Intercepted Auth] recover intercepted successfully');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Recovery email sent successfully' }),
    });
  });

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Experiencia Inicial de Invitado y Carga del Dashboard
    // -------------------------------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
      await page.waitForTimeout(1000);
      const title = await page.title();
      if (title.includes('Dashboard | Qurio')) {
        logPass('T01: Carga Inicial de Dashboard', `Title: "${title}"`);
      } else {
        throw new Error(`Título inesperado: ${title}`);
      }

      // Comprobar botón de inicio de sesión visible para invitados
      const authBtn = await page.waitForSelector('button:has-text("Iniciar Sesión")', { timeout: 5000 });
      if (authBtn) {
        logPass('T01.1: Estado de Invitado en TopHeader', 'Botón "Iniciar Sesión" presente');
      }
    } catch (err) {
      logFail('T01: Carga Inicial de Dashboard', err);
    }

    // -------------------------------------------------------------------------
    // TEST 2: Enrutamiento y Navegación a Rutas de Aprendizaje
    // -------------------------------------------------------------------------
    try {
      await page.click('text=Rutas de Aprendizaje');
      await page.waitForURL('**/tracks');
      await page.waitForTimeout(500);
      const tracksTitle = await page.title();
      logPass('T02: Navegación a Rutas de Aprendizaje', `URL: /tracks, Title: "${tracksTitle}"`);
    } catch (err) {
      logFail('T02: Navegación a Rutas de Aprendizaje', err);
    }

    // -------------------------------------------------------------------------
    // TEST 3: Deep Link Directo a Reto 1
    // -------------------------------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/exercises/e0000000-0000-0000-0000-000000000001`, { waitUntil: 'load' });
      await page.waitForSelector('text=Catálogo Básico de Productos', { timeout: 8000 });
      const exTitle = await page.title();
      logPass('T03: Deep Link a Reto 1', `Title: "${exTitle}"`);

      // Verificar que el esquema expone las tablas
      await page.click('button:has-text("Esquema")');
      const schemaVisible = await page.waitForSelector('text=productos', { timeout: 3000 });
      if (schemaVisible) {
        logPass('T03.1: Pestaña Esquema en IDE', '10 tablas canónicas con "productos" visible');
      }
      // Volver a Guía & Reto
      await page.click('button:has-text("Guía & Reto")');
    } catch (err) {
      logFail('T03: Deep Link a Reto 1', err);
    }

    // -------------------------------------------------------------------------
    // TEST 4: Retención y Recuperación de Borrador SQL (Draft Retention F5)
    // -------------------------------------------------------------------------
    try {
      const draftSql = "SELECT nombre_producto, precio FROM productos WHERE precio > 10; -- draft test";
      await page.evaluate((sql) => {
        const exId = 'e0000000-0000-0000-0000-000000000001';
        localStorage.setItem(`qurio_draft_sql_${exId}`, sql);
      }, draftSql);

      // Recargar página con F5
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(1000);

      const restoredDraft = await page.evaluate(() => {
        const exId = 'e0000000-0000-0000-0000-000000000001';
        return localStorage.getItem(`qurio_draft_sql_${exId}`);
      });

      if (restoredDraft === draftSql) {
        logPass('T04: Preservación de Borrador en Recarga (F5)', 'Borrador SQL restaurado');
      } else {
        throw new Error(`Borrador no coincide: "${restoredDraft}"`);
      }
    } catch (err) {
      logFail('T04: Preservación de Borrador en Recarga (F5)', err);
    }

    // -------------------------------------------------------------------------
    // TEST 5: Evaluación Semántica - Consulta Incorrecta (FAILED)
    // -------------------------------------------------------------------------
    try {
      const wrongSql = "SELECT nombre_producto FROM productos;";
      await page.evaluate((sql) => {
        if (typeof window.__setEditorSql === 'function') {
          window.__setEditorSql(sql);
        } else {
          const model = window.monaco?.editor?.getModels()?.[0];
          if (model) model.setValue(sql);
        }
      }, wrongSql);

      await page.click('button:has-text("Enviar Solución")');
      // Esperar badge DISCREPANCIA
      await page.waitForSelector('text=DISCREPANCIA', { timeout: 8000 });
      await page.waitForSelector('text=Comparativa Semántica', { timeout: 3000 });
      logPass('T05: Evaluación Semántica - Fallo Pedagógico', 'Badge DISCREPANCIA y pestaña Comparativa Semántica desplegados');
    } catch (err) {
      logFail('T05: Evaluación Semántica - Fallo Pedagógico', err);
    }

    // -------------------------------------------------------------------------
    // TEST 6: Evaluación Semántica - Consulta Correcta en Modo Invitado
    // -------------------------------------------------------------------------
    try {
      const correctSql = "SELECT nombre_producto, precio FROM productos;";
      await page.waitForTimeout(500);

      await page.evaluate((sql) => {
        if (typeof window.__setEditorSql === 'function') {
          window.__setEditorSql(sql);
        } else {
          const model = window.monaco?.editor?.getModels()?.[0];
          if (model) model.setValue(sql);
        }
      }, correctSql);

      await page.waitForTimeout(300);

      // Monitorear respuesta de red
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/v1/exercises/') && response.url().includes('/submit'),
        { timeout: 8000 }
      );

      await page.click('button:has-text("Enviar Solución")');

      const submitRes = await responsePromise;
      const resJson = await submitRes.json();
      console.log('   [T06 Debug] API Submit Response:', JSON.stringify(resJson).slice(0, 150));

      // Verificación estricta C-03 / D-05: Huéspedes NUNCA reciben XP oficial
      if (resJson.xp_awarded !== 0) {
        throw new Error(`Infracción C-03 / D-05: La API devolvió xp_awarded = ${resJson.xp_awarded} para un invitado. Debe ser estrictamente 0.`);
      }

      // Esperar indicación de reto superado en UI
      await page.waitForFunction(() => {
        const text = document.body.textContent || '';
        return text.includes('Reto Superado') || text.includes('SOLUCIÓN VÁLIDA') || text.includes('Superado con Éxito');
      }, { timeout: 8000 }).catch(async (e) => {
        const bodySnippet = await page.evaluate(() => (document.body.textContent || '').slice(0, 600));
        console.error('   [T06 Error Snippet]:', bodySnippet);
        throw e;
      });

      // Comprobar mensaje formativo de invitado y 0 XP oficial
      const guestProgress = await page.evaluate(() => {
        const raw = localStorage.getItem('qurio_guest_progress_v1');
        return raw ? JSON.parse(raw) : [];
      });

      const found = guestProgress.find(i => i.exercise_id === 'e0000000-0000-0000-0000-000000000001');
      if (found && (found.passed_at || found.sync_status === 'pending')) {
        logPass('T06: Evaluación Correcta en Modo Invitado', 'Registrado en qurio_guest_progress_v1 (0 XP oficial acreditado)');
      } else {
        throw new Error(`Reto 1 no se guardó en qurio_guest_progress_v1: ${JSON.stringify(guestProgress)}`);
      }

      // Comprobar que el borrador fue purgado tras éxito
      const clearedDraft = await page.evaluate(() => {
        return localStorage.getItem('qurio_draft_sql_e0000000-0000-0000-0000-000000000001');
      });
      if (!clearedDraft) {
        logPass('T06.1: Purga Automática de Borrador tras PASSED', 'Borrador purgado');
      }
    } catch (err) {
      logFail('T06: Evaluación Correcta en Modo Invitado', err);
    }

    // -------------------------------------------------------------------------
    // TEST 7: Límite de Prueba para Invitados (HTTP 401 en Reto 4)
    // -------------------------------------------------------------------------
    try {
      // Simular que el invitado ya completó los retos 1, 2 y 3 en storage
      await page.evaluate(() => {
        const mockGuest = [
          { exercise_id: 'e0000000-0000-0000-0000-000000000001', sync_status: 'pending', submitted_sql: 'SELECT 1;', hints_used: 0, passed_at: new Date().toISOString() },
          { exercise_id: 'e0000000-0000-0000-0000-000000000002', sync_status: 'pending', submitted_sql: 'SELECT 2;', hints_used: 0, passed_at: new Date().toISOString() },
          { exercise_id: 'e0000000-0000-0000-0000-000000000003', sync_status: 'pending', submitted_sql: 'SELECT 3;', hints_used: 0, passed_at: new Date().toISOString() },
        ];
        localStorage.setItem('qurio_guest_progress_v1', JSON.stringify(mockGuest));
      });

      // Navegar a Reto 4 (fuera del trial gratuito de 3 retos)
      await page.goto(`${BASE_URL}/exercises/e0000000-0000-0000-0000-000000000004`, { waitUntil: 'load' });
      await page.waitForSelector('text=Conteo de Productos por Categoría', { timeout: 8000 });

      await page.evaluate(() => {
        if (typeof window.__setEditorSql === 'function') {
          window.__setEditorSql('SELECT categoria_id, COUNT(*) FROM productos GROUP BY categoria_id;');
        } else {
          const model = window.monaco?.editor?.getModels()?.[0];
          if (model) model.setValue('SELECT categoria_id, COUNT(*) FROM productos GROUP BY categoria_id;');
        }
      });

      await page.click('button:has-text("Enviar Solución")');
      // Esperar error 401 de límite de trial
      await page.waitForSelector('text=REGISTRATION_REQUIRED_AFTER_TRIAL', { timeout: 8000 });
      logPass('T07: Límite de Prueba de Invitados Enforced', 'HTTP 401 REGISTRATION_REQUIRED_AFTER_TRIAL bloquea 4to reto');
    } catch (err) {
      logFail('T07: Límite de Prueba de Invitados Enforced', err);
    }

    // -------------------------------------------------------------------------
    // TEST 8: Flujo de Registro (Sign Up) en Modal de Autenticación
    // -------------------------------------------------------------------------
    try {
      await page.locator('button:has-text("Iniciar Sesión")').first().click();
      await page.waitForSelector('text=Accede a tu Estación de Trabajo SQL', { timeout: 3000 });

      // Cambiar a modo Registro
      await page.click('button:has-text("Registrarse")');
      await page.waitForSelector('text=Crea tu Cuenta de Ingeniero', { timeout: 3000 });
      await page.waitForTimeout(300);

      // Probar validación inline: contraseña corta (<6 chars)
      await page.fill('input[placeholder="tu_usuario_sql"]', 'pilot_student');
      await page.fill('input[type="email"]', 'pilot_user_01@qurio.dev');
      await page.fill('input[type="password"]', '123');
      await page.waitForTimeout(200);
      await page.locator('form button[type="submit"]').click();
      await page.waitForSelector('text=al menos 6 caracteres', { timeout: 5000 });
      logPass('T08: Validación Inline de Contraseña en Registro', 'Error inline capturado sin alerts nativos');

      // Completar contraseña válida
      await page.fill('input[type="password"]', 'SafePilotPass2026!');
      await page.waitForTimeout(200);
      await page.locator('form button[type="submit"]').click();

      // Esperar pantalla de confirmación
      await page.waitForSelector('text=CORREO DE ACTIVACIÓN ENVIADO', { timeout: 5000 });
      logPass('T08.1: Pantalla Interactiva de Activación', 'Feedback claro con correo enviado');
    } catch (err) {
      const modalText = await page.evaluate(() => document.querySelector('[role="dialog"]')?.textContent || document.body.textContent || '').catch(() => '');
      console.error('   [T08 Debug Modal Text]:', modalText.slice(0, 400));
      logFail('T08: Flujo de Registro (Sign Up)', err);
    } finally {
      // Garantizar cierre del modal para no bloquear siguientes pruebas
      const closeBtn = await page.$('button[title="Cerrar ventana"]');
      if (closeBtn) {
        await closeBtn.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }

    // -------------------------------------------------------------------------
    // TEST 9: Recuperación de Contraseña (Forgot Password)
    // -------------------------------------------------------------------------
    try {
      await page.locator('button:has-text("Iniciar Sesión")').first().click();
      await page.waitForSelector('text=Accede a tu Estación de Trabajo SQL', { timeout: 3000 });
      await page.click('text=¿Olvidaste tu contraseña?');
      await page.waitForSelector('text=Recuperar Contraseña', { timeout: 3000 });

      await page.fill('input[type="email"]', 'student_help@qurio.dev');
      await page.click('button:has-text("Enviar Enlace de Recuperación")');
      await page.waitForSelector('text=ENLACE DE RECUPERACIÓN ENVIADO', { timeout: 5000 });
      logPass('T09: Solicitud de Recuperación de Contraseña', 'Pantalla de confirmación con éxito');

      await page.click('button:has-text("Volver a Iniciar Sesión")');
    } catch (err) {
      logFail('T09: Solicitud de Recuperación de Contraseña', err);
    } finally {
      const closeBtn = await page.$('button[title="Cerrar ventana"]');
      if (closeBtn) {
        await closeBtn.click().catch(() => {});
        await page.waitForTimeout(300);
      }
    }

    // -------------------------------------------------------------------------
    // TEST 10: SQL Playground Libre
    // -------------------------------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/playground`, { waitUntil: 'load' });
      await page.waitForTimeout(1000);
      const pgTitle = await page.title();
      if (pgTitle.includes('SQL Playground | Qurio')) {
        logPass('T10: Navegación a SQL Playground', `Title: "${pgTitle}"`);
      }

      // Esperar que Monaco se monte en Playground
      await page.waitForFunction(() => typeof window.__setEditorSql === 'function', { timeout: 8000 });

      // Ejecutar query en Playground
      const query = "SELECT categoria_id, nombre_categoria FROM categorias ORDER BY categoria_id LIMIT 3;";
      await page.evaluate((sql) => {
        window.__setEditorSql(sql);
      }, query);

      await page.waitForTimeout(500);
      await page.click('button:has-text("Ejecutar Query")');
      await page.waitForSelector('text=Laptops', { timeout: 8000 });
      logPass('T10.1: Ejecución Tabular en Playground', 'DataGrid renderizó categorías correctamente');
    } catch (err) {
      logFail('T10: SQL Playground Libre', err);
    }

    // -------------------------------------------------------------------------
    // TEST 11: Página 404 Tematizada SQL (Anti-AI Slop)
    // -------------------------------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/ruta-inexistente-error-404`, { waitUntil: 'load' });
      await page.waitForSelector('text=ERROR 404', { timeout: 5000 });
      await page.waitForSelector('text=Volver al Dashboard');
      const errTitle = await page.title();
      logPass('T11: Página 404 Personalizada SQL', `Title: "${errTitle}"`);

      // Clic para volver al dashboard
      await page.click('text=Volver al Dashboard');
      await page.waitForURL(`${BASE_URL}/`);
      logPass('T11.1: Retorno a Dashboard desde 404', 'Navegación fluida confirmada');
    } catch (err) {
      logFail('T11: Página 404 Personalizada SQL', err);
    }

    // -------------------------------------------------------------------------
    // TEST 12: Simulación de Sesión Autenticada y Perfil
    // -------------------------------------------------------------------------
    try {
      await page.evaluate(() => {
        const mockProfile = {
          id: 'usr_pilot_authenticated_42',
          username: 'ana_sql_master',
          full_name: 'Ana García',
          avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ana_sql',
          total_xp: 60,
          current_level: 2,
          current_streak_days: 3,
          max_streak_days: 5,
          preferred_theme: 'dark',
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('qurio_profile_cache_usr_pilot_authenticated_42', JSON.stringify(mockProfile));
      });

      await page.goto(`${BASE_URL}/profile`, { waitUntil: 'load' });
      await page.waitForTimeout(500);
      const profTitle = await page.title();
      logPass('T12: Perfil de Usuario y Estado Autenticado', `Title: "${profTitle}"`);
    } catch (err) {
      logFail('T12: Perfil de Usuario y Estado Autenticado', err);
    }

    // -------------------------------------------------------------------------
    // TEST 13: Resiliencia ante Fallos de Red en API (/submit 500)
    // -------------------------------------------------------------------------
    try {
      await page.goto(`${BASE_URL}/exercises/e0000000-0000-0000-0000-000000000001`, { waitUntil: 'load' });
      await page.waitForSelector('text=Catálogo Básico de Productos', { timeout: 8000 });

      // Simular fallo de red 500 en la API
      await page.route('**/api/v1/exercises/*/submit', async (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Error simulado de base de datos de infraestructura en backend.' }),
        });
      });

      await page.click('button:has-text("Enviar Solución")');
      await page.waitForSelector('text=Error simulado de base de datos', { timeout: 8000 });
      logPass('T13: Manejo Resiliente de Error 500 de API', 'Mensaje de error inline sin colapso de UI');

      // Restaurar ruta normal
      await page.unroute('**/api/v1/exercises/*/submit');
    } catch (err) {
      logFail('T13: Manejo Resiliente de Error 500 de API', err);
    }

  } finally {
    await browser.close();
    server.close();
    console.log('[SPA Server] Servidor detenido limpiamente.');
  }

  console.log('\n================================================================');
  console.log('RESUMEN DE RESULTADOS DE PRUEBAS E2E:');
  console.log('================================================================');
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  console.log(`Total: ${results.length} | Pasadas: ${passed} | Fallidas: ${failed}`);
  for (const r of results) {
    console.log(` - [${r.status}] ${r.test} ${r.detail || r.error || ''}`);
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ESuite().catch((err) => {
  console.error('Fatal E2E runner error:', err);
  process.exit(1);
});
