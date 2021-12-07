const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function list(req, res) {
  res.json({ data: orders });
}

function create(req, res) {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function deliverToIsValid(req, res, next) {
  const {
    data: { deliverTo },
  } = req.body;
  if (deliverTo && deliverTo !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo",
  });
}

function mobileNumberIsValid(req, res, next) {
  const {
    data: { mobileNumber },
  } = req.body;
  if (mobileNumber && mobileNumber !== "") {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber",
  });
}

function hasDishesProperty(req, res, next) {
  const {
    data: { dishes },
  } = req.body;
  if (dishes) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a dish",
  });
}

function dishesPropIsValid(req, res, next) {
  const {
    data: { dishes },
  } = req.body;
  if (Array.isArray(dishes) && dishes.length !== 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include at least one dish.",
  });
}

function dishesHaveValidQuantity(req, res, next) {
  const {
    data: { dishes },
  } = req.body;

  for (let i = 0; i < dishes.length; i++) {
    const quantity = dishes[i].quantity;
    if (!quantity || !Number.isInteger(quantity)) {
      return next({
        status: 400,
        message: `Dish ${i} must have a quantity that is an integer greater than 0`,
      });
    }
  }
  return next();
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find(
    (order) => Number(order.id) === Number(orderId)
  );
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  } else {
    next({
      status: 404,
      message: `Order does not exist: ${orderId}`,
    });
  }
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function orderIdMatches(req, res, next) {
  const { orderId } = req.params;
  const {
    data: { id },
  } = req.body;

  if (
    Number(id) === Number(orderId) || !id) {
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
  });
}

function statusIsValid(req, res, next) {
  const {
    data: { status },
  } = req.body;
  const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
  if (validStatus && validStatus.includes(status)) {
    return next();
  }
  next({
    status: 400,
    message:
      "Order must have a status of pending, preparing, out-for-delivery, delivered",
  });
}

function isStatusDelivered(req, res, next) {
  if (res.locals.order.status !== "delivered") {
    return next();
  }
  next({
    status: 400,
    message: "A delivered order cannot be changed",
  });
}

function update(req, res) {
  const order = res.locals.order;

  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;
  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

function isOrderPending(req, res, next) {
  if (res.locals.order.status === "pending") {
    return next();
  }
  next({
    status: 400,
    message: "An order cannot be deleted unless it is pending",
  });
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex(
    (order) => Number(order.id) === Number(orderId)
  );
  orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [
    deliverToIsValid,
    mobileNumberIsValid,
    hasDishesProperty,
    dishesPropIsValid,
    dishesHaveValidQuantity,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    deliverToIsValid,
    mobileNumberIsValid,
    hasDishesProperty,
    dishesPropIsValid,
    dishesHaveValidQuantity,
    statusIsValid,
    orderIdMatches,
    isStatusDelivered,
    update,
  ],
  delete: [orderExists, isOrderPending, destroy],
};

// TODO: Implement the /orders handlers needed to make the tests pass
