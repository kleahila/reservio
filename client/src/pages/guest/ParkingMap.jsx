import { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import Badge from "../../components/Badge";
import { parkingSpots } from "../../data/parkingSpots";

function ParkingMap() {
  const [spots, setSpots] = useState(parkingSpots);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [lockedSpot, setLockedSpot] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [toast, setToast] = useState({ message: "", type: "info" });

  // Countdown timer effect
  useEffect(() => {
    if (!lockedSpot) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setLockedSpot(null);
          setToast({
            message: `Parking spot ${lockedSpot?.label} reservation expired`,
            type: "info",
          });
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedSpot]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSpotColor = (spot) => {
    if (lockedSpot?.id === spot.id) {
      return "bg-yellow-100 border-yellow-400 text-yellow-900";
    }
    if (spot.status === "available") {
      return "bg-green-100 border-green-400 text-green-900";
    }
    if (spot.status === "occupied") {
      return "bg-red-100 border-red-400 text-red-900";
    }
    return "bg-gray-100 border-gray-400 text-gray-900";
  };

  const handleSpotClick = (spot) => {
    if (lockedSpot?.id === spot.id) {
      // Already locked by user
      setSelectedSpot(spot);
      return;
    }

    if (spot.status !== "available") {
      setToast({
        message: `Spot ${spot.label} is ${spot.status}`,
        type: "error",
      });
      return;
    }

    setSelectedSpot(spot);
  };

  const handleReserveSpot = () => {
    if (!selectedSpot) return;

    setLockedSpot(selectedSpot);
    setCountdown(300);
    setToast({
      message: `Spot ${selectedSpot.label} reserved for 5 minutes! Confirm quickly.`,
      type: "success",
    });
    setSelectedSpot(null);
  };

  const handleCancelLock = () => {
    setToast({
      message: `Reservation for spot ${lockedSpot?.label} cancelled`,
      type: "info",
    });
    setLockedSpot(null);
    setCountdown(300);
  };

  const handleConfirmBooking = () => {
    if (!lockedSpot) return;

    setToast({
      message: `Spot ${lockedSpot.label} booked successfully! Reference: PARK-${Date.now()}`,
      type: "success",
    });
    setLockedSpot(null);
    setCountdown(300);
  };

  const groupedSpots = spots.reduce((acc, spot) => {
    const zone = spot.zone || "General";
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(spot);
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <h1 className="text-3xl font-bold text-brand-primary">Parking Map 🚗</h1>
          <p className="mt-2 text-slate-600">
            Reserve a parking spot. Spots are held for 5 minutes.
          </p>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-100 border border-green-400"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-100 border border-red-400"></div>
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-yellow-100 border border-yellow-400"></div>
              <span>Reserved</span>
            </div>
          </div>
        </Card>

        {/* Parking Zones */}
        {Object.entries(groupedSpots).map(([zone, zoneSpots]) => (
          <Card key={zone} title={`${zone} Zone`}>
            <div className="grid gap-2 sm:grid-cols-4 md:grid-cols-6">
              {zoneSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleSpotClick(spot)}
                  disabled={lockedSpot?.id !== spot.id && spot.status !== "available"}
                  className={`relative p-3 rounded border-2 text-center font-semibold transition ${getSpotColor(spot)} ${
                    selectedSpot?.id === spot.id
                      ? "ring-2 ring-blue-500 shadow-md"
                      : ""
                  } ${
                    lockedSpot?.id !== spot.id && spot.status !== "available"
                      ? "cursor-not-allowed opacity-60"
                      : "hover:shadow-md cursor-pointer"
                  }`}
                >
                  <span className="text-lg">{spot.label}</span>
                  {lockedSpot?.id === spot.id && (
                    <Badge className="absolute top-1 right-1 bg-yellow-500 text-white text-xs">
                      {formatCountdown(countdown)}
                    </Badge>
                  )}
                  <p className="text-xs mt-1 opacity-75">${spot.pricePerNight}</p>
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Spot Detail Modal */}
      <Modal
        isOpen={selectedSpot !== null}
        onClose={() => setSelectedSpot(null)}
        title={`Reserve Spot ${selectedSpot?.label}`}
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Spot Label</span>
              <span className="font-semibold">{selectedSpot?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Zone</span>
              <span className="font-semibold">{selectedSpot?.zone}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-600">Price Per Night</span>
              <span className="text-lg font-bold text-brand-primary">
                ${selectedSpot?.pricePerNight}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
            ⏱️ Spot will be held for 5 minutes. Confirm your booking to proceed.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => setSelectedSpot(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleReserveSpot}>
              Reserve & Lock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Locked Spot Confirmation Modal */}
      <Modal
        isOpen={lockedSpot !== null}
        onClose={() => {}}
        title={`Confirm Parking - ${lockedSpot?.label}`}
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-2">⏰</div>
            <p className="text-3xl font-bold text-brand-primary">
              {formatCountdown(countdown)}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Time remaining to confirm
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Spot</span>
              <span className="font-semibold">{lockedSpot?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Zone</span>
              <span className="font-semibold">{lockedSpot?.zone}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-600">Total Cost</span>
              <span className="text-lg font-bold text-brand-primary">
                ${lockedSpot?.pricePerNight}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={handleCancelLock}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking}>
              Confirm Booking
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

export default ParkingMap;
