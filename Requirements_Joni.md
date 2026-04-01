# Software Engineering Requirements – Reservio

**Joni Begaj**  
31.03.2026  
CEN 3A  

---

# US-24: Manage Subscription Plans

## User Scenarios List

| Nr | Name | Description |
|----|------|------------|
| US_01 | Super Admin logs in | Super Admin logs into the system using username and password |
| US_02 | View tenant plans | Super Admin views current tenants and their subscription plans |
| US_03 | Upgrade subscription | Super Admin upgrades a tenant from Basic to Premium/Custom |
| US_04 | Downgrade subscription | Super Admin downgrades a tenant from Premium/Custom to Basic |
| US_05 | System updates features | System updates tenant feature access immediately after plan change |
| US_06 | Restrict access | System removes access to restricted features after downgrade |

---

## User Scenarios Extended

### US_01: Super Admin logs in
1. User navigates to login page  
2. User enters username and password  
3. System validates credentials  
4. System grants access as Super Admin  
5. If invalid → error message displayed  

### US_03: Upgrade subscription
1. Super Admin selects a tenant  
2. Super Admin clicks “Change Plan”  
3. Super Admin selects Premium/Custom  
4. System validates request  
5. System updates subscription  
6. System enables new features  

### US_04: Downgrade subscription
1. Super Admin selects a tenant  
2. Super Admin clicks “Change Plan”  
3. Super Admin selects Basic plan  
4. System updates subscription  
5. System removes restricted features  
6. System confirms update  

---

## Use Case: Manage Subscription Plans

### Summary
Allows the Super Admin to upgrade or downgrade a tenant’s subscription plan.

### Dependency
Depends on authentication (login use case)

### Actors
- Primary: Super Admin  
- Secondary: System  

### Preconditions
- Super Admin is logged in  
- Tenant exists  

### Main Sequence
1. Select tenant  
2. Click Change Plan  
3. Select new plan  
4. System updates plan  
5. System updates features  
6. Confirmation  

### Alternative Sequence
1. Error occurs  
2. System shows message  

### Postconditions
- Plan updated  
- Features updated  

---

## Functional Requirements

- FR_01: System shall allow Super Admin to change subscription plan  
- FR_02: System shall update feature access immediately  
- FR_03: System shall restrict features after downgrade  

---

## Non-Functional Requirements

- NFR_01: System shall update changes within 2 seconds  
- NFR_02: Only Super Admin can modify plans  
- NFR_03: System shall ensure data consistency  

---

# US-25: View Platform-Wide Analytics

## User Scenarios List

| Nr | Name | Description |
|----|------|------------|
| US_01 | Super Admin logs in | Super Admin logs into the system |
| US_02 | Access dashboard | Super Admin navigates to analytics dashboard |
| US_03 | View metrics | Super Admin views tenants, bookings, revenue |
| US_04 | Apply filters | Super Admin filters by date and plan |
| US_05 | Aggregate data | System calculates metrics |
| US_06 | Protect data | System hides sensitive tenant data |

---

## User Scenarios Extended

### US_02: Access dashboard
1. Super Admin logs in  
2. Navigates to dashboard  
3. System loads dashboard  
4. Displays metrics  

### US_04: Apply filters
1. Super Admin selects date range  
2. Selects plan tier  
3. System filters data  
4. Updates metrics  

---

## Use Case: View Platform Analytics

### Summary
Allows the Super Admin to view platform-level metrics.

### Dependency
Depends on authentication

### Actors
- Super Admin  

### Preconditions
- Super Admin is logged in  
- Data exists  

### Main Sequence
1. Open dashboard  
2. View metrics  
3. Apply filters  

### Alternative Sequence
1. No data available  
2. System shows message  

### Postconditions
- Metrics displayed  
- Data remains secure  

---

## Functional Requirements

- FR_01: System shall display platform metrics (tenants, bookings, revenue)  
- FR_02: System shall allow filtering by date and plan tier  
- FR_03: System shall ensure no sensitive tenant data is exposed  

---

## Non-Functional Requirements

- NFR_01: Dashboard shall load within 3 seconds  
- NFR_02: Only Super Admin can access analytics  
- NFR_03: System shall ensure data privacy  

---

# US-26: Onboard New Hotel

## User Scenarios List

| Nr | Name | Description |
|----|------|------------|
| US_01 | Super Admin logs in | Super Admin logs into the system |
| US_02 | Create tenant | Super Admin creates hotel account |
| US_03 | Provision subdomain | System activates subdomain |
| US_04 | Send email | System sends invitation |
| US_05 | Setup account | Hotel Admin registers |
| US_06 | Activate tenant | Tenant becomes active |

---

## User Scenarios Extended

### US_02: Create tenant
1. Super Admin navigates to Add Tenant  
2. Enters name, subdomain, plan  
3. Submits form  
4. System validates input  

### US_03: Provision subdomain
1. System checks availability  
2. Creates subdomain  
3. Links to tenant  
4. Confirms success  

---

## Use Case: Onboard Hotel

### Summary
Allows creation of tenant and account setup.

### Dependency
Depends on authentication and email service

### Actors
- Super Admin  
- Hotel Admin  

### Preconditions
- Super Admin is logged in  
- Subdomain is unique  

### Main Sequence
1. Enter details  
2. Create tenant  
3. Send email  
4. Admin sets up account  

### Alternative Sequence
1. Subdomain exists  
2. Error shown  

### Postconditions
- Tenant created  
- Subdomain active  
- Admin can access system  

---

## Functional Requirements

- FR_01: System shall allow Super Admin to create tenant  
- FR_02: System shall provision subdomain immediately  
- FR_03: System shall send invitation email  

---

## Non-Functional Requirements

- NFR_01: Subdomain provisioning within 2 seconds  
- NFR_02: Only authorized users can onboard hotels  
- NFR_03: Email delivery must be reliable  
