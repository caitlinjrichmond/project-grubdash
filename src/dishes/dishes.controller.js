const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}

function create(req, res) {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function nameIsValid(req, res, next) {
  const {
    data: { name },
  } = req.body;
  if (name && name !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a name",
  });
}

function descIsValid(req, res, next) {
  const {
    data: { description },
  } = req.body;
  if (description && description !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a description",
  });
}

function hasPrice(req, res, next) {
  const {
    data: { price },
  } = req.body;
  if (price) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a price",
  });
}

function priceIsValid(req, res, next) {
  const {
    data: { price },
  } = req.body;
  if (price > 0 && Number.isInteger(price)) {
    return next();
  }
  next({
    status: 400,
    message: "Dish must have a price that is an integer greater than 0",
  });
}

function imageIsValid(req, res, next) {
  const {
    data: { image_url },
  } = req.body;
  if (image_url && image_url !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a image_url",
  });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => Number(dish.id) === Number(dishId));
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  } else {
    next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  }
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function dishIdMatches(req, res, next) {
  const { dishId } = req.params;

  const {
    data: { id },
  } = req.body;

  if (
    Number(id) === Number(dishId) || !id ) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

function update(req, res) {
  const dish = res.locals.dish;

  const {
    data: { name, description, price, image_url },
  } = req.body;
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

module.exports = {
  list,
  create: [
    nameIsValid,
    descIsValid,
    hasPrice,
    priceIsValid,
    imageIsValid,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    nameIsValid,
    descIsValid,
    hasPrice,
    priceIsValid,
    imageIsValid,
    dishIdMatches,
    update,
  ],
};
