const list = document.querySelector("#lista-insumos");
const listMessage = document.querySelector("#lista-mensaje");
const formMessage = document.querySelector("#form-mensaje");
const form = document.querySelector("#form-insumo");
const categorySelect = document.querySelector("#categoria");
const refreshButton = document.querySelector("#refresh-button");

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo completar la solicitud.");
  }
  return data;
}

function makeButton(label, className, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function renderInventory(items) {
  list.replaceChildren();

  if (items.length === 0) {
    listMessage.textContent = "No hay insumos registrados.";
    return;
  }

  listMessage.textContent = "";
  for (const item of items) {
    const isCritical = item.stock_actual <= item.stock_minimo;
    const card = document.createElement("article");
    card.className = `item-card${isCritical ? " is-critical" : ""}`;

    const details = document.createElement("div");
    details.className = "item-details";
    const name = document.createElement("strong");
    name.textContent = `${item.nombre} (${item.marca})`;
    const stock = document.createElement("p");
    stock.textContent = `Stock: ${item.stock_actual} · Mínimo: ${item.stock_minimo}`;
    details.append(name, stock);

    if (item.categorias?.nombre) {
      const category = document.createElement("p");
      category.textContent = `Categoría: ${item.categorias.nombre}`;
      details.append(category);
    }

    if (isCritical) {
      const alert = document.createElement("p");
      alert.className = "critical-label";
      alert.textContent = "Stock crítico";
      details.append(alert);
    }

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(
      makeButton("-1 Usar", "btn-discount", () => discountStock(item.id_insumo)),
      makeButton("Eliminar", "btn-delete", () => deleteItem(item.id_insumo)),
    );
    card.append(details, actions);
    list.append(card);
  }
}

async function loadInventory() {
  refreshButton.disabled = true;
  try {
    const items = await requestJson("/api/insumos");
    renderInventory(items);
  } catch (error) {
    list.replaceChildren();
    listMessage.textContent = error.message;
  } finally {
    refreshButton.disabled = false;
  }
}

async function loadCategories() {
  try {
    const categories = await requestJson("/api/categorias");
    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category.id_categoria;
      option.textContent = category.nombre;
      categorySelect.append(option);
    }
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.setAttribute("aria-live", "assertive");
  }
}

async function discountStock(id) {
  try {
    await requestJson(`/api/insumos/${id}/descontar`, { method: "PUT" });
    await loadInventory();
  } catch (error) {
    listMessage.textContent = error.message;
    listMessage.setAttribute("aria-live", "assertive");
  }
}

async function deleteItem(id) {
  if (!window.confirm("¿Estás seguro de eliminar este insumo del inventario?")) return;
  try {
    await requestJson(`/api/insumos/${id}`, { method: "DELETE" });
    await loadInventory();
  } catch (error) {
    listMessage.textContent = error.message;
    listMessage.setAttribute("aria-live", "assertive");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  formMessage.textContent = "";

  const formData = new FormData(form);
  const payload = {
    nombre: formData.get("nombre"),
    marca: formData.get("marca"),
    stock_actual: Number(formData.get("stock_actual")),
    stock_minimo: Number(formData.get("stock_minimo")),
    id_categoria: formData.get("id_categoria") || null,
  };

  try {
    await requestJson("/api/insumos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    form.reset();
    document.querySelector("#stock").value = "0";
    document.querySelector("#minimo").value = "3";
    formMessage.textContent = "Insumo registrado correctamente.";
    formMessage.setAttribute("aria-live", "polite");
    await loadInventory();
  } catch (error) {
    formMessage.textContent = error.message;
    formMessage.setAttribute("aria-live", "assertive");
  } finally {
    submitButton.disabled = false;
  }
});

refreshButton.addEventListener("click", loadInventory);
loadCategories();
loadInventory();
