import { useState } from "react";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import { formatDate } from "../../utils/validation";

const seedNotifications = [
  {
    id: 1,
    message: "Your room is ready for check-in.",
    room: "Room 205",
    status: "info",
    time: "10 min ago",
    read: false,
  },
  {
    id: 2,
    message: "Spa discount: 20% this afternoon.",
    room: "Spa & Wellness",
    status: "offer",
    time: "1 hr ago",
    read: false,
  },
  {
    id: 3,
    message: "Shuttle to city center departs at 18:00.",
    room: "Concierge",
    status: "reminder",
    time: "3 hr ago",
    read: true,
  },
  {
    id: 4,
    message: "Your checkout is tomorrow at 11:00 AM.",
    room: "Room 205",
    status: "info",
    time: "1 day ago",
    read: true,
  },
  {
    id: 5,
    message: "Welcome to our hotel! Enjoy your stay.",
    room: "Front Desk",
    status: "welcome",
    time: "2 days ago",
    read: true,
  },
];

function Notifications() {
  const [notifications, setNotifications] = useState(seedNotifications);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all, unread, offers

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "offers") return n.status === "offer";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "offer":
        return "bg-green-100 text-green-800";
      case "reminder":
        return "bg-amber-100 text-amber-800";
      case "welcome":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "info":
        return "ℹ️";
      case "offer":
        return "🎉";
      case "reminder":
        return "⏰";
      case "welcome":
        return "👋";
      default:
        return "📬";
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-brand-primary">
                Notifications 🔔
              </h1>
              <p className="mt-1 text-slate-600">
                Stay updated with your hotel activities
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-800 text-lg px-3 py-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </Card>

        {/* Notification Center */}
        <Card title="Notification Center">
          {notifications.length === 0 ? (
            <div className="rounded-lg bg-slate-50 p-8 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-lg text-slate-600">No notifications</p>
              <p className="text-sm text-slate-500 mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Filters */}
              <div className="flex gap-2 mb-4 border-b border-slate-200 pb-3">
                {["all", "unread", "offers"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-sm font-medium rounded transition ${
                      filter === f
                        ? "bg-brand-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {f === "all"
                      ? "All"
                      : f === "unread"
                        ? `Unread (${unreadCount})`
                        : "Offers"}
                  </button>
                ))}
              </div>

              {/* Notifications List */}
              <div className="space-y-2">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex gap-3 rounded-lg p-4 transition ${
                        notification.read
                          ? "bg-slate-50"
                          : "bg-blue-50 border-l-4 border-blue-500"
                      }`}
                    >
                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {getStatusIcon(notification.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {notification.message}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge
                                className={`${getStatusColor(notification.status)}`}
                              >
                                {notification.room}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {notification.time}
                              </span>
                            </div>
                          </div>

                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 text-sm"
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="rounded p-1 text-slate-500 hover:bg-red-100 hover:text-red-700"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg bg-slate-50 p-6 text-center">
                    <p className="text-slate-600">No notifications matching filter</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {notifications.length > 0 && (
                <div className="border-t border-slate-200 pt-3 mt-3 flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="secondary"
                      onClick={handleMarkAllAsRead}
                      className="text-sm"
                    >
                      Mark All as Read
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={handleClearAll}
                    className="text-sm"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Notification Preferences */}
        <Card title="Notification Preferences">
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded"
              />
              <span className="font-medium">Room Updates</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded"
              />
              <span className="font-medium">Special Offers</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded"
              />
              <span className="font-medium">Reminders</span>
            </label>
          </div>
        </Card>
      </div>
    </>
  );
}

export default Notifications;
