import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import Badge from "../../components/Badge";
import { services } from "../../data/services";

function Marketplace() {
  const [serviceList] = useState(services);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [billToRoom, setBillToRoom] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "info" });

  const categories = ["All", ...new Set(serviceList.map((s) => s.category))];

  const filteredServices =
    selectedCategory === "All"
      ? serviceList
      : serviceList.filter((s) => s.category === selectedCategory);

  const handleAddToCart = (service) => {
    const existingItem = cart.find((item) => item.id === service.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...service, quantity: 1 }]);
    }

    setToast({
      message: `${service.name} added to cart!`,
      type: "success",
    });
  };

  const handleRemoveFromCart = (serviceId) => {
    const removedItem = cart.find((item) => item.id === serviceId);
    setCart(cart.filter((item) => item.id !== serviceId));
    setToast({
      message: `${removedItem.name} removed from cart`,
      type: "info",
    });
  };

  const handleUpdateQuantity = (serviceId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(serviceId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === serviceId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      setToast({
        message: "Your cart is empty",
        type: "error",
      });
      return;
    }

    setIsCheckoutOpen(true);
  };

  const handleConfirmCheckout = () => {
    setToast({
      message: `Order placed! Amount: $${cartTotal.toFixed(2)} ${
        billToRoom ? "billed to room" : "will be charged to your card"
      }. Reference: ORD-${Date.now()}`,
      type: "success",
    });
    setCart([]);
    setIsCheckoutOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-primary">
                Marketplace 🛍️
              </h1>
              <p className="mt-2 text-slate-600">
                Browse services and amenities available at your hotel.
              </p>
            </div>
            {cartCount > 0 && (
              <Badge className="bg-brand-primary text-white text-lg px-3 py-2">
                {cartCount} items
              </Badge>
            )}
          </div>
        </Card>

        {/* Category Filters */}
        <Card title="Categories">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategory === category
                    ? "bg-brand-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </Card>

        {/* Services Grid */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {selectedCategory === "All"
              ? "All Services"
              : selectedCategory} ({filteredServices.length})
          </h2>

          {filteredServices.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow transition hover:shadow-lg"
                >
                  {/* Icon & Category */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="text-3xl">
                      {service.category === "Spa"
                        ? "🧖"
                        : service.category === "Room Service"
                          ? "🍽️"
                          : "🚗"}
                    </div>
                    <Badge>{service.category}</Badge>
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-slate-900">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 flex-1">
                    {service.description}
                  </p>

                  {/* Price & Button */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xl font-bold text-brand-primary">
                      ${service.price}
                    </span>
                    <Button
                      onClick={() => handleAddToCart(service)}
                      variant="primary"
                      className="text-sm"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-lg text-slate-600">No services found</p>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card title="Shopping Cart Summary">
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{item.name}</h4>
                    <p className="text-sm text-slate-600">${item.price} each</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="rounded bg-slate-200 px-2 py-1 text-sm font-medium hover:bg-slate-300"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="rounded bg-slate-200 px-2 py-1 text-sm font-medium hover:bg-slate-300"
                    >
                      +
                    </button>
                  </div>

                  <div className="ml-4 w-20 text-right">
                    <p className="font-semibold text-brand-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="ml-2 rounded px-2 py-1 text-red-600 hover:bg-red-50"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Total */}
              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-brand-primary">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button onClick={handleCheckout} className="w-full mt-4">
                Proceed to Checkout
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Checkout"
      >
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-lg text-brand-primary">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Option */}
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                checked={billToRoom}
                onChange={() => setBillToRoom(true)}
              />
              <span className="font-medium">Bill to Room</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                checked={!billToRoom}
                onChange={() => setBillToRoom(false)}
              />
              <span className="font-medium">Pay Now (Card)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsCheckoutOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmCheckout}>
              Confirm Order
            </Button>
          </div>
        </div>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
    </>
  );
}

export default Marketplace;
