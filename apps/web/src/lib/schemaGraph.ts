export interface ErColumnNode {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  isUnique?: boolean;
}

export interface ErTableNode {
  name: string;
  group: 'ventas' | 'catalogo' | 'logistica';
  x: number;
  y: number;
  columns: ErColumnNode[];
}

export interface ErRelationEdge {
  id: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  cardinality: '1:1' | 'N:1';
}

export const ER_CANVAS_WIDTH = 1160;
export const ER_CANVAS_HEIGHT = 720;
export const ER_CARD_WIDTH = 240;

export const ER_TABLES: ErTableNode[] = [
  {
    name: 'clientes',
    group: 'ventas',
    x: 40,
    y: 40,
    columns: [
      { name: 'cliente_id', type: 'SERIAL', isPrimary: true },
      { name: 'nombre', type: 'VARCHAR(50)' },
      { name: 'apellido', type: 'VARCHAR(50)' },
      { name: 'email', type: 'VARCHAR(100)', isUnique: true },
      { name: 'ciudad', type: 'VARCHAR(50)' },
      { name: 'pais', type: 'VARCHAR(50)' },
      { name: 'fecha_registro', type: 'DATE' },
    ],
  },
  {
    name: 'pedidos',
    group: 'ventas',
    x: 330,
    y: 40,
    columns: [
      { name: 'pedido_id', type: 'SERIAL', isPrimary: true },
      { name: 'cliente_id', type: 'INT', isForeign: true },
      { name: 'fecha_pedido', type: 'DATE' },
      { name: 'estado_pedido', type: 'VARCHAR(20)' },
      { name: 'total', type: 'NUMERIC(10,2)' },
    ],
  },
  {
    name: 'facturas',
    group: 'ventas',
    x: 40,
    y: 310,
    columns: [
      { name: 'factura_id', type: 'SERIAL', isPrimary: true },
      { name: 'pedido_id', type: 'INT', isForeign: true, isUnique: true },
      { name: 'fecha_emision', type: 'DATE' },
      { name: 'monto_total', type: 'NUMERIC(10,2)' },
      { name: 'estado_factura', type: 'VARCHAR(20)' },
    ],
  },
  {
    name: 'pagos',
    group: 'ventas',
    x: 40,
    y: 515,
    columns: [
      { name: 'pago_id', type: 'SERIAL', isPrimary: true },
      { name: 'factura_id', type: 'INT', isForeign: true },
      { name: 'metodo_pago', type: 'VARCHAR(30)' },
      { name: 'monto', type: 'NUMERIC(10,2)' },
      { name: 'fecha_pago', type: 'DATE' },
      { name: 'estado_pago', type: 'VARCHAR(20)' },
    ],
  },
  {
    name: 'detalle_pedidos',
    group: 'ventas',
    x: 330,
    y: 280,
    columns: [
      { name: 'detalle_id', type: 'SERIAL', isPrimary: true },
      { name: 'pedido_id', type: 'INT', isForeign: true },
      { name: 'producto_id', type: 'INT', isForeign: true },
      { name: 'cantidad', type: 'INT' },
      { name: 'precio_unitario', type: 'NUMERIC(10,2)' },
    ],
  },
  {
    name: 'productos',
    group: 'catalogo',
    x: 620,
    y: 240,
    columns: [
      { name: 'producto_id', type: 'SERIAL', isPrimary: true },
      { name: 'categoria_id', type: 'INT', isForeign: true },
      { name: 'proveedor_id', type: 'INT', isForeign: true },
      { name: 'nombre_producto', type: 'VARCHAR(100)' },
      { name: 'precio', type: 'NUMERIC(10,2)' },
      { name: 'stock', type: 'INT' },
    ],
  },
  {
    name: 'categorias',
    group: 'catalogo',
    x: 890,
    y: 40,
    columns: [
      { name: 'categoria_id', type: 'SERIAL', isPrimary: true },
      { name: 'nombre_categoria', type: 'VARCHAR(50)' },
      { name: 'descripcion', type: 'TEXT' },
    ],
  },
  {
    name: 'proveedores',
    group: 'catalogo',
    x: 890,
    y: 220,
    columns: [
      { name: 'proveedor_id', type: 'SERIAL', isPrimary: true },
      { name: 'nombre_proveedor', type: 'VARCHAR(80)' },
      { name: 'pais', type: 'VARCHAR(50)' },
      { name: 'telefono', type: 'VARCHAR(25)' },
    ],
  },
  {
    name: 'inventario',
    group: 'logistica',
    x: 620,
    y: 500,
    columns: [
      { name: 'almacen_id', type: 'INT', isPrimary: true, isForeign: true },
      { name: 'producto_id', type: 'INT', isPrimary: true, isForeign: true },
      { name: 'cantidad_disponible', type: 'INT' },
      { name: 'ultima_actualizacion', type: 'TIMESTAMP' },
    ],
  },
  {
    name: 'almacenes',
    group: 'logistica',
    x: 890,
    y: 480,
    columns: [
      { name: 'almacen_id', type: 'SERIAL', isPrimary: true },
      { name: 'nombre_almacen', type: 'VARCHAR(80)' },
      { name: 'ciudad', type: 'VARCHAR(50)' },
      { name: 'capacidad_m2', type: 'INT' },
    ],
  },
];

export const ER_RELATIONS: ErRelationEdge[] = [
  { id: 'rel-pedidos-clientes', fromTable: 'pedidos', fromColumn: 'cliente_id', toTable: 'clientes', toColumn: 'cliente_id', cardinality: 'N:1' },
  { id: 'rel-facturas-pedidos', fromTable: 'facturas', fromColumn: 'pedido_id', toTable: 'pedidos', toColumn: 'pedido_id', cardinality: '1:1' },
  { id: 'rel-pagos-facturas', fromTable: 'pagos', fromColumn: 'factura_id', toTable: 'facturas', toColumn: 'factura_id', cardinality: 'N:1' },
  { id: 'rel-detalle-pedidos', fromTable: 'detalle_pedidos', fromColumn: 'pedido_id', toTable: 'pedidos', toColumn: 'pedido_id', cardinality: 'N:1' },
  { id: 'rel-detalle-productos', fromTable: 'detalle_pedidos', fromColumn: 'producto_id', toTable: 'productos', toColumn: 'producto_id', cardinality: 'N:1' },
  { id: 'rel-productos-categorias', fromTable: 'productos', fromColumn: 'categoria_id', toTable: 'categorias', toColumn: 'categoria_id', cardinality: 'N:1' },
  { id: 'rel-productos-proveedores', fromTable: 'productos', fromColumn: 'proveedor_id', toTable: 'proveedores', toColumn: 'proveedor_id', cardinality: 'N:1' },
  { id: 'rel-inventario-almacenes', fromTable: 'inventario', fromColumn: 'almacen_id', toTable: 'almacenes', toColumn: 'almacen_id', cardinality: 'N:1' },
  { id: 'rel-inventario-productos', fromTable: 'inventario', fromColumn: 'producto_id', toTable: 'productos', toColumn: 'producto_id', cardinality: 'N:1' },
];

export function getRelatedTableNames(tableName: string | null): Set<string> {
  if (!tableName) return new Set();
  const related = new Set<string>([tableName]);
  for (const rel of ER_RELATIONS) {
    if (rel.fromTable === tableName) related.add(rel.toTable);
    if (rel.toTable === tableName) related.add(rel.fromTable);
  }
  return related;
}
