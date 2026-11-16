const supabase = require("../config/db");

function parseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function parseNonNegativeInteger(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function reportDatabaseError(res, message, error) {
  console.error(`${message}:`, error);
  return res.status(500).json({ error: message });
}

async function obtenerCategorias(_req, res) {
  const { data, error } = await supabase
    .from("categorias")
    .select("id_categoria, nombre")
    .order("id_categoria", { ascending: true });

  if (error) return reportDatabaseError(res, "Error al obtener las categorías.", error);
  return res.json(data);
}

async function obtenerInsumos(_req, res) {
  const { data, error } = await supabase
    .from("insumos")
    .select("id_insumo, nombre, marca, stock_actual, stock_minimo, id_categoria, categorias(nombre)")
    .order("id_insumo", { ascending: true });

  if (error) return reportDatabaseError(res, "Error al obtener el inventario.", error);
  return res.json(data);
}

async function crearInsumo(req, res) {
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return res.status(400).json({ error: "El cuerpo de la solicitud debe ser un objeto JSON." });
  }

  const { nombre, marca } = body;
  const stockActual = parseNonNegativeInteger(body.stock_actual);
  const stockMinimo = parseNonNegativeInteger(body.stock_minimo);
  const idCategoria = body.id_categoria === "" || body.id_categoria == null
    ? null
    : parseNonNegativeInteger(body.id_categoria);

  if (typeof nombre !== "string" || !nombre.trim()) {
    return res.status(400).json({ error: "El nombre del insumo es obligatorio." });
  }
  if (typeof marca !== "string" || !marca.trim()) {
    return res.status(400).json({ error: "La marca del insumo es obligatoria." });
  }
  if (stockActual === null || stockMinimo === null) {
    return res.status(400).json({ error: "El stock y el mínimo deben ser enteros mayores o iguales a cero." });
  }
  if (body.id_categoria != null && body.id_categoria !== ""
    && (idCategoria === null || idCategoria < 1)) {
    return res.status(400).json({ error: "La categoría seleccionada no es válida." });
  }

  const { data, error } = await supabase
    .from("insumos")
    .insert({
      nombre: nombre.trim(),
      marca: marca.trim(),
      stock_actual: stockActual,
      stock_minimo: stockMinimo,
      id_categoria: idCategoria,
    })
    .select("id_insumo, nombre, marca, stock_actual, stock_minimo, id_categoria")
    .single();

  if (error) return reportDatabaseError(res, "Error al registrar el insumo.", error);
  return res.status(201).json(data);
}

async function descontarStock(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "El identificador del insumo no es válido." });
  }

  const { error } = await supabase.rpc("descontar_stock", { p_id_insumo: id });
  if (error?.code === "P0002") {
    return res.status(404).json({ error: "Insumo no encontrado." });
  }
  if (error?.code === "23514") {
    return res.status(409).json({ error: "Stock insuficiente para realizar el descuento." });
  }
  if (error) return reportDatabaseError(res, "No se pudo descontar el stock.", error);

  return res.json({ mensaje: "Stock descontado correctamente." });
}

async function eliminarInsumo(req, res) {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "El identificador del insumo no es válido." });
  }

  const { data, error } = await supabase
    .from("insumos")
    .delete()
    .eq("id_insumo", id)
    .select("id_insumo")
    .maybeSingle();

  if (error) return reportDatabaseError(res, "Error al eliminar el insumo.", error);
  if (!data) return res.status(404).json({ error: "Insumo no encontrado." });
  return res.status(204).end();
}

module.exports = {
  obtenerCategorias,
  obtenerInsumos,
  crearInsumo,
  descontarStock,
  eliminarInsumo,
};
