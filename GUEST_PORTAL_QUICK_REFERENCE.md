# Quick Reference Guide - Guest Portal Screens

## 🗺️ Route Map

```
/guest/register          → Registration page (US-01)
/guest/login            → Login page (US-02)
/guest/dashboard        → Welcome & reservations
/guest/rooms            → Browse & filter rooms (US-03, US-04)
/guest/rooms/:id        → Room detail & booking (US-05)
/guest/parking          → Parking spots (US-06)
/guest/sunbeds          → Sunbeds with time slots (US-22)
/guest/marketplace      → Services & cart (US-07)
/guest/notifications    → Notifications center (US-08)
```

---

## 📱 Screen Components Map

| Screen | File | Status | Key Features |
|--------|------|--------|--------------|
| Registration | `guest/Register.jsx` | ✅ | Validation, duplicate check, redirect to login |
| Login | `guest/Login.jsx` | ✅ | Auth check, loading state, demo credentials |
| Dashboard | `guest/Dashboard.jsx` | ✅ | Welcome, reservations, quick links |
| Room Browsing | `guest/RoomBrowsing.jsx` | ✅ | Grid, filters, responsive layout |
| Room Detail | `guest/RoomDetail.jsx` | ✅ | Booking flow, modal confirmation, reference # |
| Parking | `guest/ParkingMap.jsx` | ✅ | Zone grid, 5-min countdown, color status |
| Sunbeds | `guest/SunbedMap.jsx` | ✅ | Time slots, 5-min countdown, zone layout |
| Marketplace | `guest/Marketplace.jsx` | ✅ | Cart, quantity controls, checkout options |
| Notifications | `guest/Notifications.jsx` | ✅ | Filters, bulk actions, preferences |

---

## 🎯 User Flows

### Registration Flow
```
/guest/register
  ↓ (fill form)
  → Validate (required, email, password, duplicate)
  → Success message
  ↓ (2 sec delay)
  → /guest/login
```

### Login Flow
```
/guest/login (pre-filled: anna@example.com / demo123)
  ↓ (click Sign In)
  → Check credentials
  → Loading state (800ms)
  → Success message
  ↓ (1.5 sec delay)
  → /guest/dashboard
```

### Booking Flow
```
/guest/rooms (browse)
  ↓ (click room)
  → /guest/rooms/:id (details)
  ↓ (select dates + click Book Now)
  → Confirmation modal
  ↓ (click Confirm Booking)
  → Generate reference number
  → Success toast
  ↓ (2 sec delay)
  → /guest/dashboard
```

### Parking Flow
```
/guest/parking
  ↓ (click available spot)
  → Spot detail modal
  ↓ (click Reserve & Lock)
  → Countdown modal (300 seconds)
  ↓ (click Confirm Booking)
  → Success notification
  → Lock released
```

### Shopping Flow
```
/guest/marketplace
  ↓ (click Add to Cart)
  → Item added (toast)
  → Badge count updates
  ↓ (repeat or proceed)
  → Cart summary
  ↓ (click Checkout)
  → Checkout modal
  ↓ (select payment + click Confirm)
  → Success with reference
  → Cart cleared
```

---

## 🔑 Demo Credentials

```
Email:    anna@example.com
Password: demo123
```

---

## 🎨 Color Status System

### Rooms
- 🟢 **Available** - Green badge
- 🔴 **Occupied** - Blue badge
- 🟡 **Maintenance** - Orange badge

### Parking/Sunbeds
- 🟢 **Available** - Green (bg-green-100, border-green-400)
- 🔴 **Occupied** - Red (bg-red-100, border-red-400)
- 🟡 **Reserved** - Yellow (bg-yellow-100, border-yellow-400)
- ⚫ **Maintenance** - Gray (bg-gray-100, border-gray-400)

### Notifications
- ℹ️ **Info** - Blue
- 🎉 **Offer** - Green
- ⏰ **Reminder** - Amber
- 👋 **Welcome** - Purple

---

## 📊 Mock Data Used

| Data Source | Used In | Notes |
|-------------|---------|-------|
| `data/users.js` | Login, Register | Email duplicate check |
| `data/reservations.js` | Dashboard | Filter by "Confirmed" status |
| `data/rooms.js` | Room Browsing, Room Detail | Filter by status |
| `data/parkingSpots.js` | Parking Map | Organized by zone |
| `data/sunbeds.js` | Sunbed Map | Organized by zone |
| `data/services.js` | Marketplace | Organized by category |

---

## 🧪 Testing Checklist

### Registration
- [ ] Required field validation works
- [ ] Email format validation works
- [ ] Duplicate email detection works
- [ ] Password length validation works
- [ ] Success redirects to login

### Login
- [ ] Demo credentials work (anna@example.com / demo123)
- [ ] Invalid credentials show error
- [ ] Loading state displays
- [ ] Success redirects to dashboard
- [ ] Enter key submits form

### Dashboard
- [ ] Welcome message shows guest name
- [ ] Upcoming reservations display
- [ ] Quick links navigate correctly
- [ ] Empty state shows when no reservations

### Room Browsing
- [ ] Rooms display in grid
- [ ] Filters work (All, Available, Occupied, Maintenance)
- [ ] Click room navigates to detail
- [ ] Responsive layout works

### Room Detail
- [ ] Date pickers work
- [ ] Night calculation updates
- [ ] Price breakdown displays
- [ ] Book Now button works
- [ ] Modal shows details
- [ ] Confirm generates reference
- [ ] Success redirects to dashboard

### Parking
- [ ] Spots display by zone
- [ ] Color coding works
- [ ] Click available spot opens modal
- [ ] Reserve & Lock starts countdown
- [ ] Countdown updates every second
- [ ] Timer cancels or confirms
- [ ] Toast notifications work

### Sunbeds
- [ ] Time slot selection works
- [ ] Sunbeds display by zone
- [ ] Same countdown logic as parking
- [ ] Time slot shows in confirmation
- [ ] Toast notifications work

### Marketplace
- [ ] Services display in cards
- [ ] Category tabs filter correctly
- [ ] Add to Cart updates badge
- [ ] Cart summary updates
- [ ] Quantity controls work
- [ ] Remove item works
- [ ] Total calculates correctly
- [ ] Checkout modal shows details
- [ ] Payment options selectable
- [ ] Success clears cart

### Notifications
- [ ] All notifications display
- [ ] Unread badge shows count
- [ ] Filter tabs work (All, Unread, Offers)
- [ ] Mark as read works
- [ ] Delete works
- [ ] Mark All as Read works
- [ ] Clear All works
- [ ] Preferences checkboxes work

---

## 🚀 Performance Considerations

- ✅ Timers cleaned up in useEffect
- ✅ Components properly memoized
- ✅ Event listeners removed on unmount
- ✅ No memory leaks
- ✅ Efficient re-renders
- ✅ Loading states reduce perceived latency

---

## 🔧 Utilities Available

### Validation Functions (`src/utils/validation.js`)
```javascript
validateEmail(email)           // Email format check
validateRequired(value)        // Non-empty check
validatePassword(password)     // Min 6 chars
emailExists(email, users)      // Duplicate check
validateDateRange(in, out)     // Check-in < check-out
getTodayString()              // YYYY-MM-DD today
formatDate(dateString)         // Formatted display
calculateNights(in, out)       // Night count
generateReferenceNumber()      // Unique reference
```

---

## 📋 Next Steps (Backend Integration)

1. Replace `useAuth` mock with actual JWT
2. Replace `users` data with API calls
3. Replace `reservations` with API calls
4. Replace `rooms` with API calls
5. Replace `parkingSpots` with API calls
6. Replace `sunbeds` with API calls
7. Replace `services` with API calls
8. Add WebSocket for real-time updates
9. Integrate payment processing
10. Add email notifications

---

## ✅ Status

**All Screens:** ✅ Complete
**Mock Functionality:** ✅ Complete
**Validation:** ✅ Complete
**Error Handling:** ✅ Complete
**Responsive Design:** ✅ Complete
**Testing:** ✅ Ready for QA

---

*Last Updated: April 8, 2026*
*Branch: code/frontend-ina*
