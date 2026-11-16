require("dotenv").config();

const express = require("express");
const path = require("node:path");
const insumoRoutes = require("./src/routes/insumoRoutes");

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", insumoRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Ruta de API no encontrada." });
});

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "El cuerpo de la solicitud debe ser JSON válido." });
  }

  console.error("Error no controlado en el servidor:", error);
  return res.status(500).json({ error: "Ocurrió un error interno del servidor." });
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
