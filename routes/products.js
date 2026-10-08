const products = [
  { id: 1, name: "Wireless Mouse", price: 29.99 },
  { id: 2, name: "Mechanical Keyboard", price: 89.5 },
  { id: 3, name: '27" LED Monitor', price: 199.99 },
  { id: 4, name: "USB-C Hub Adapter", price: 45 },
  { id: 5, name: "Noise-Cancelling Headphones", price: 149.99 },
  { id: 6, name: "Laptop Stand", price: 34.95 },
];

function list() {
  return products.map((product) => ({ ...product }));
}

function getById(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return null;
  }
  const found = products.find((product) => product.id === numericId);
  return found ? { ...found } : null;
}

function validate(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, message: "Request body must be a JSON object" };
  }
  if (typeof input.name !== "string" || input.name.trim() === "") {
    return { ok: false, message: 'Field "name" must be a non-empty string' };
  }
  if (typeof input.price !== "number" || !Number.isFinite(input.price)) {
    return { ok: false, message: 'Field "price" must be a number' };
  }
  if (input.price < 0) {
    return { ok: false, message: 'Field "price" must be greater than or equal to 0' };
  }
  return { ok: true };
}

function create(input) {
  const nextId = products.length > 0 ? Math.max(...products.map((product) => product.id)) + 1 : 1;
  const product = { id: nextId, name: input.name.trim(), price: input.price };
  products.push(product);
  return { ...product };
}

module.exports = { list, getById, validate, create };
