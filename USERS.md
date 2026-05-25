# Reservio — Demo Accounts

All accounts use the password: `password123`

Login at: `http://localhost:5173/login`
SuperAdmin login at: `http://localhost:5173/superadmin/login`

---

## Super Admin

| Role        | Email                   | Password    | Portal              |
| ----------- | ----------------------- | ----------- | ------------------- |
| Super Admin | superadmin@reservio.com | password123 | `/superadmin/login` |

---

## Grand Tirana (Premium)

Select **Grand Tirana** on the login page.

| Role         | Name          | Email                       | Password    |
| ------------ | ------------- | --------------------------- | ----------- |
| Hotel Admin  | Arben Koci    | admin@grandtirana.com       | password123 |
| Receptionist | Mjeda Leka    | staff@grandtirana.com       | password123 |
| Housekeeper  | Besa Hoxha    | housekeeper@grandtirana.com | password123 |
| Technician   | Drin Kelmendi | technician@grandtirana.com  | password123 |
| Guest        | Marco Rossi   | marco@email.com             | password123 |
| Guest        | Sofia Müller  | sofia@email.com             | password123 |
| Guest        | Anna Petrov   | anna@email.com              | password123 |
| Guest        | Leon Dubois   | leon@email.com              | password123 |

---

## Hotel Riviera (Basic)

Select **Hotel Riviera** on the login page.

| Role         | Name          | Email                        | Password    |
| ------------ | ------------- | ---------------------------- | ----------- |
| Hotel Admin  | Elsa Domi     | admin@hotelriviera.com       | password123 |
| Receptionist | Gent Marku    | staff@hotelriviera.com       | password123 |
| Housekeeper  | Lira Zeqo     | housekeeper@hotelriviera.com | password123 |
| Guest        | James Smith   | james@email.com              | password123 |
| Guest        | Claire Bonnet | claire@email.com             | password123 |

---

## How to Run

```bash
# Terminal 1 — Backend (port 4000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

To reset all passwords to `password123`:

```bash
cd server && node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
bcrypt.hash('password123', 10).then(hash =>
  prisma.user.updateMany({ data: { passwordHash: hash } })
).then(r => { console.log('Reset', r.count, 'users'); process.exit(0); });
"
```
