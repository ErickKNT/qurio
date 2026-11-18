import { describe, it, expect } from 'vitest';
import {
  maskSqlLiteralsAndComments,
  getActiveStatementAtOffset,
  extractExecutableStatementAtOffset,
  extractTableAliases,
  extractCtesFromStatement,
  detectClauseContext,
} from '@/components/organisms/MonacoEditorPanel/sqlCompleter';

describe('sqlCompleter — Aislamiento por sentencia (;), alias sin cruce y CTEs', () => {
  it('aísla alias por punto y coma sin cruzar tablas entre sentencias', () => {
    const sql = [
      'SELECT t.nombre FROM clientes t;',
      'SELECT t.nombre_producto FROM productos t;',
    ].join('\n');

    const firstOffset = sql.indexOf('t.nombre') + 2;
    const secondOffset = sql.indexOf('t.nombre_producto') + 2;

    const firstAliases = extractTableAliases(sql, firstOffset);
    const secondAliases = extractTableAliases(sql, secondOffset);

    expect(firstAliases.get('t')).toBe('clientes');
    expect(firstAliases.has('productos')).toBe(false);

    expect(secondAliases.get('t')).toBe('productos');
    expect(secondAliases.has('clientes')).toBe(false);
  });

  it('ignora punto y coma, comentarios y literales al segmentar y extraer alias', () => {
    const sql = [
      "-- SELECT * FROM pedidos p; comentario con FROM",
      "SELECT c.nombre, 'texto; FROM facturas f' AS nota",
      'FROM clientes c;',
      '/* bloque con FROM inventario inv */',
      'SELECT pr.precio FROM productos pr',
    ].join('\n');

    const firstOffset = sql.indexOf('c.nombre');
    const firstAliases = extractTableAliases(sql, firstOffset);
    expect(firstAliases.get('c')).toBe('clientes');
    expect(firstAliases.has('p')).toBe(false);
    expect(firstAliases.has('f')).toBe(false);

    const secondOffset = sql.indexOf('pr.precio');
    const secondAliases = extractTableAliases(sql, secondOffset);
    expect(secondAliases.get('pr')).toBe('productos');
    expect(secondAliases.has('c')).toBe(false);
    expect(secondAliases.has('inv')).toBe(false);

    const masked = maskSqlLiteralsAndComments(sql);
    expect(masked).not.toContain('facturas');
    expect(masked).not.toContain('inventario');
  });

  it('no confunde UNION, EXCEPT, INTERSECT ni USING con alias de tabla', () => {
    const sql = 'SELECT nombre FROM clientes UNION SELECT nombre_proveedor FROM proveedores';
    const aliases = extractTableAliases(sql, sql.length);

    expect(aliases.has('union')).toBe(false);
    expect(aliases.get('clientes')).toBe('clientes');
    expect(aliases.get('proveedores')).toBe('proveedores');
  });

  it('aísla alias de subconsultas para que no contaminen otras ramas', () => {
    const sql =
      'SELECT sub.total FROM (SELECT p.pedido_id, p.total FROM pedidos p) sub WHERE sub.total > 100';

    const insideSubqueryOffset = sql.indexOf('p.pedido_id');
    const insideAliases = extractTableAliases(sql, insideSubqueryOffset);
    expect(insideAliases.get('p')).toBe('pedidos');

    const outerOffset = sql.indexOf('sub.total > 100');
    const outerAliases = extractTableAliases(sql, outerOffset);
    expect(outerAliases.has('p')).toBe(false);
  });

  it('extrae CTEs y sus columnas proyectadas en la sentencia activa', () => {
    const sql = [
      'WITH resumen_ventas AS (',
      '  SELECT c.cliente_id, SUM(p.total) AS monto_total',
      '  FROM clientes c',
      '  JOIN pedidos p ON c.cliente_id = p.cliente_id',
      '  GROUP BY c.cliente_id',
      ')',
      'SELECT r.cliente_id, r.monto_total FROM resumen_ventas r;',
    ].join('\n');

    const stmt = getActiveStatementAtOffset(sql, sql.length - 2);
    const ctes = extractCtesFromStatement(stmt.masked);
    expect(ctes).toHaveLength(1);
    expect(ctes[0].name).toBe('resumen_ventas');
    expect(ctes[0].columns).toEqual(['cliente_id', 'monto_total']);
  });

  it('detecta correctamente la cláusula SQL y extrae la sentencia bajo el cursor', () => {
    expect(detectClauseContext('SELECT * FROM ')).toBe('FROM_JOIN');
    expect(detectClauseContext('SELECT * FROM clientes c LEFT JOIN ')).toBe('FROM_JOIN');
    expect(detectClauseContext('SELECT c.nombre FROM clientes c WHERE ')).toBe('EXPRESSION');

    const script = 'SELECT * FROM clientes;\nSELECT * FROM productos;';
    expect(extractExecutableStatementAtOffset(script, 5)).toBe('SELECT * FROM clientes');
    expect(extractExecutableStatementAtOffset(script, script.length - 2)).toBe(
      'SELECT * FROM productos'
    );
  });
});
