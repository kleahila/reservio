import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import StatusBadge from "../../components/StatusBadge";
import DatePicker from "../../components/DatePicker";
import Badge from "../../components/Badge";
import { rooms } from "../../data/rooms";
import {
  getTodayString,
  formatDate,
  calculateNights,
  generateReferenceNumber,
  validateDateRange,
} from "../../utils/validation";

function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room] = useState(() => rooms.find((item) => item.id === Number(id)) || rooms[0]);
  const [checkInDate, setCheckInDate] = useState(getTodayString());
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(new Date().getTime() + 86400000).toISOString().split("T")[0],
  );
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [bookingReference, setBookingReference] = useState(null);

  const nights = calculateNights(checkInDate, checkOutDate);
  const totalPrice = nights * room.pricePerNight;
  const isDateRangeValid = validateDateRange(checkInDate, checkOutDate);

  const handleBooking = () => {
    if (!isDateRangeValid) {
      setToast({
        message: "Please select valid check-in and check-out dates",
        type: "error",
      });
      return;
    }

    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = () => {
    if (room.status !== "Available") {
      setToast({
        message: "Sorry, this room is no longer available",
        type: "error",
      });
      return;
    }

    setIsConfirmingBooking(true);

    // Simulate booking confirmation
    setTimeout(() => {
      const reference = generateReferenceNumber();
      setBookingReference(reference);
      setIsConfirmingBooking(false);
      setIsBookingModalOpen(false);

      setToast({
        message: `Booking confirmed! Reference: ${reference}`,
        type: "success",
      });

      // Redirect to dashboard after delay
      setTimeout(() => {
        navigate("/guest/dashboard");
      }, 2000);
    }, 1200);
  };

  const roomAmenities = [
    { icon: "🛏️", label: "King Size Bed" },
    { icon: "🚿", label: "Ensuite Bathroom" },
    { icon: "❄️", label: "Air Conditioning" },
    { icon: "📺", label: "Smart TV" },
    { icon: "📶", label: "Free Wi-Fi" },
    { icon: "☕", label: "Mini Bar" },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Room Header */}
        <Card>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Photo */}
            <div className="flex items-center justify-center h-80 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg">
              <span className="text-9xl">🛏️</span>
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-brand-primary">
                    {room.type}
                  </h1>
                  <p className="text-lg text-slate-600 mt-1">
                    ${room.pricePerNight}/night
                  </p>
                </div>
                <StatusBadge status={room.status} />
              </div>

              <p className="text-slate-700 mb-6">{room.description}</p>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {roomAmenities.map((amenity) => (
                    <div
                      key={amenity.label}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <span className="text-xl">{amenity.icon}</span>
                      <span>{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              {room.status !== "Available" && (
                <div className="rounded-lg bg-amber-50 p-3 mb-6 text-sm text-amber-800">
                  ⚠️ This room is currently {room.status.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Booking Section */}
        <Card title="Select Your Dates">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <DatePicker
                label="Check-in Date"
                value={checkInDate}
                onChange={setCheckInDate}
                min={getTodayString()}
              />
              <DatePicker
                label="Check-out Date"
                value={checkOutDate}
                onChange={setCheckOutDate}
                min={checkInDate}
              />
            </div>

            {isDateRangeValid && (
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-600 uppercase">Nights</p>
                    <p className="text-2xl font-bold text-brand-primary">{nights}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase">Price/Night</p>
                    <p className="text-2xl font-bold text-brand-primary">
                      ${room.pricePerNight}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase">Total</p>
                    <p className="text-2xl font-bold text-brand-primary">
                      ${totalPrice}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleBooking}
              disabled={!isDateRangeValid || room.status !== "Available"}
              className="w-full"
            >
              {room.status === "Available"
                ? "Book Now"
                : "Room Not Available"}
            </Button>
          </div>
        </Card>

        {/* Additional Info */}
        <Card title="Cancellation Policy">
          <ul className="space-y-2 text-sm text-slate-600">
            <li>✓ Free cancellation up to 7 days before check-in</li>
            <li>✓ 50% refund if cancelled within 7 days</li>
            <li>✓ Non-refundable after 24 hours of booking</li>
          </ul>
        </Card>
      </div>

      {/* Booking Confirmation Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => !isConfirmingBooking && setIsBookingModalOpen(false)}
        title="Confirm Your Booking"
      >
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-lg bg-slate-50 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Room Type</span>
              <span className="font-semibold">{room.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Check-in</span>
              <span className="font-semibold">{formatDate(checkInDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Check-out</span>
              <span className="font-semibold">{formatDate(checkOutDate)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-600">Total ({nights} nights)</span>
              <span className="text-lg font-bold text-brand-primary">
                ${totalPrice}
              </span>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 w-4 h-4 rounded border-slate-300"
              defaultChecked
            />
            <label htmlFor="terms" className="text-sm text-slate-600">
              I agree to the cancellation policy and terms
            </label>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsBookingModalOpen(false)}
              disabled={isConfirmingBooking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={isConfirmingBooking}
            >
              {isConfirmingBooking ? "Confirming..." : "Confirm Booking"}
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

export default RoomDetail;
