const express = require("express");
const {
  obtenerInsumos,
  obtenerCategorias,
  crearInsumo,
  descontarStock,
  eliminarInsumo,
} = require("../controllers/insumoController");

const router = express.Router();

router.get("/categorias", obtenerCategorias);
router.get("/insumos", obtenerInsumos);
router.post("/insumos", crearInsumo);
router.put("/insumos/:id/descontar", descontarStock);
router.delete("/insumos/:id", eliminarInsumo);

module.exports = router;
