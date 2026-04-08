import { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import Badge from "../../components/Badge";
import { sunbeds } from "../../data/sunbeds";

function SunbedMap() {
  const [sunbedList, setSunbedList] = useState(sunbeds);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("09:00-12:00");
  const [selectedSunbed, setSelectedSunbed] = useState(null);
  const [lockedSunbed, setLockedSunbed] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [toast, setToast] = useState({ message: "", type: "info" });

  const timeSlots = [
    "09:00-12:00",
    "12:00-15:00",
    "15:00-18:00",
    "18:00-21:00",
  ];

  // Countdown timer effect
  useEffect(() => {
    if (!lockedSunbed) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setLockedSunbed(null);
          setToast({
            message: `Sunbed ${lockedSunbed?.label} reservation expired`,
            type: "info",
          });
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedSunbed]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSunbedsBySlot = (slot) => {
    return sunbedList.filter(
      (bed) => bed.timeSlot === slot || bed.status === "available",
    );
  };

  const getSunbedColor = (sunbed) => {
    if (lockedSunbed?.id === sunbed.id) {
      return "bg-yellow-100 border-yellow-400 text-yellow-900";
    }
    if (sunbed.status === "available") {
      return "bg-green-100 border-green-400 text-green-900";
    }
    return "bg-red-100 border-red-400 text-red-900";
  };

  const handleSunbedClick = (sunbed) => {
    if (lockedSunbed?.id === sunbed.id) {
      setSelectedSunbed(sunbed);
      return;
    }

    if (sunbed.status !== "available") {
      setToast({
        message: `Sunbed ${sunbed.label} is already booked for this time`,
        type: "error",
      });
      return;
    }

    setSelectedSunbed(sunbed);
  };

  const handleReserveSunbed = () => {
    if (!selectedSunbed) return;

    setLockedSunbed({ ...selectedSunbed, timeSlot: selectedTimeSlot });
    setCountdown(300);
    setToast({
      message: `Sunbed ${selectedSunbed.label} reserved for 5 minutes! Confirm quickly.`,
      type: "success",
    });
    setSelectedSunbed(null);
  };

  const handleCancelLock = () => {
    setToast({
      message: `Reservation for sunbed ${lockedSunbed?.label} cancelled`,
      type: "info",
    });
    setLockedSunbed(null);
    setCountdown(300);
  };

  const handleConfirmBooking = () => {
    if (!lockedSunbed) return;

    setToast({
      message: `Sunbed ${lockedSunbed.label} booked for ${lockedSunbed.timeSlot}! Reference: SUN-${Date.now()}`,
      type: "success",
    });
    setLockedSunbed(null);
    setCountdown(300);
  };

  const groupedSunbeds = sunbedList.reduce((acc, bed) => {
    const zone = bed.zone || "General";
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(bed);
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <h1 className="text-3xl font-bold text-brand-primary">Sunbed Map ☀️</h1>
          <p className="mt-2 text-slate-600">
            Reserve a sunbed at your preferred time slot. Sunbeds are held for 5 minutes.
          </p>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-green-100 border border-green-400"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-red-100 border border-red-400"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-yellow-100 border border-yellow-400"></div>
              <span>Reserved</span>
            </div>
          </div>
        </Card>

        {/* Time Slot Selection */}
        <Card title="Select Time Slot">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedTimeSlot(slot)}
                className={`rounded-lg border-2 p-3 font-medium transition ${
                  selectedTimeSlot === slot
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </Card>

        {/* Sunbed Zones */}
        {Object.entries(groupedSunbeds).map(([zone, zoneSunbeds]) => (
          <Card key={zone} title={`${zone} Zone - ${selectedTimeSlot}`}>
            <div className="grid gap-2 sm:grid-cols-4 md:grid-cols-6">
              {zoneSunbeds.map((sunbed) => (
                <button
                  key={sunbed.id}
                  onClick={() => handleSunbedClick(sunbed)}
                  disabled={
                    lockedSunbed?.id !== sunbed.id && sunbed.status !== "available"
                  }
                  className={`relative p-3 rounded border-2 text-center font-semibold transition ${getSunbedColor(sunbed)} ${
                    selectedSunbed?.id === sunbed.id
                      ? "ring-2 ring-blue-500 shadow-md"
                      : ""
                  } ${
                    lockedSunbed?.id !== sunbed.id && sunbed.status !== "available"
                      ? "cursor-not-allowed opacity-60"
                      : "hover:shadow-md cursor-pointer"
                  }`}
                >
                  <span className="text-lg">{sunbed.label}</span>
                  {lockedSunbed?.id === sunbed.id && (
                    <Badge className="absolute top-1 right-1 bg-yellow-500 text-white text-xs">
                      {formatCountdown(countdown)}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Sunbed Detail Modal */}
      <Modal
        isOpen={selectedSunbed !== null}
        onClose={() => setSelectedSunbed(null)}
        title={`Reserve Sunbed ${selectedSunbed?.label}`}
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Sunbed Label</span>
              <span className="font-semibold">{selectedSunbed?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Zone</span>
              <span className="font-semibold">{selectedSunbed?.zone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Time Slot</span>
              <span className="font-semibold">{selectedTimeSlot}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-600">Price</span>
              <span className="text-lg font-bold text-brand-primary">
                $15
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
            ⏱️ Sunbed will be held for 5 minutes. Confirm your booking to proceed.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => setSelectedSunbed(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleReserveSunbed}>
              Reserve & Lock
            </Button>
          </div>
        </div>
      </Modal>

      {/* Locked Sunbed Confirmation Modal */}
      <Modal
        isOpen={lockedSunbed !== null}
        onClose={() => {}}
        title={`Confirm Sunbed - ${lockedSunbed?.label}`}
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
              <span className="text-slate-600">Sunbed</span>
              <span className="font-semibold">{lockedSunbed?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Zone</span>
              <span className="font-semibold">{lockedSunbed?.zone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Time Slot</span>
              <span className="font-semibold">{lockedSunbed?.timeSlot}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-600">Total Cost</span>
              <span className="text-lg font-bold text-brand-primary">
                $15
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

export default SunbedMap;
