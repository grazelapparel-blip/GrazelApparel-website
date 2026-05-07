# Return Management System - Quick Start

## What Was Built

A complete return management system where:
- **Users** can see their orders and request returns if the product is within the return window
- **Admins** can set the return policy (number of days) and manage return requests

## User Journey

### 1. View Dashboard
```
Header Menu → "My Dashboard" → Opens User Dashboard
```

### 2. View Orders
- **Orders Tab** shows all purchases
- Each order displays:
  - Order ID and date
  - Status (Pending, Processing, Shipped, Delivered)
  - Items with images, quantities, prices
  - Total amount
  - Return eligibility status

### 3. Request Return
```
If order is "Returnable" (within return window):
    ↓
Click "Request Return" button
    ↓
Modal appears:
  - Shows order details
  - Has text field for return reason
  - Shows policy info (e.g., "30 days to return")
    ↓
Enter reason (e.g., "Size didn't fit", "Quality issue")
    ↓
Click "Submit Return Request"
    ↓
Request is created and appears in "Returns" tab
```

### 4. Track Return Status
**Returns Tab** shows:
- All submitted returns
- Current status (Requested, Approved, Rejected, Shipped, Completed)
- Admin notes (if any)
- Request date

## Admin Journey

### 1. Set Return Policy
```
Admin Dashboard → "Return Policy" tab
    ↓
Enter number of days (e.g., 30, 14, 90)
    ↓
Click "Save Policy"
    ↓
All future returns will use this window
```

### 2. Manage Returns
```
Admin Dashboard → "Returns" tab
    ↓
See list of all return requests:
  - Return ID
  - Order ID
  - Reason
  - Status
  - Requested date
    ↓
Click "Manage" on any return
    ↓
Modal shows:
  - Return details
  - Status dropdown to update
  - Text field for admin notes
    ↓
Update status & add notes
    ↓
Click "Update Return Status"
    ↓
Changes saved, user sees updated status
```

## Key Features

### For Customers ✓
- See all past orders in one place
- Know if you can return an item
- See return deadline clearly
- Submit return requests with reason
- Track return status
- Receive admin notes about their returns

### For Admins ✓
- Configure return window (1-365 days)
- View all return requests
- Approve, reject, or track returns
- Add notes to explain decisions
- See return reasons for analytics

## Database Tables Created

### admin_settings
Stores configuration like return policy days
```
- setting_key: "return_policy_days"
- setting_value: "30"
- description: "Number of days customers have to return items"
```

### returns
Tracks all return requests
```
- id: Unique return ID
- order_id: Which order is being returned
- user_id: Who requested the return
- reason: Why they want to return
- status: Current status (requested/approved/rejected/shipped/completed)
- admin_notes: Admin's comments
- requested_at: When user submitted
- approved_at: When admin approved
- completed_at: When fully processed
```

## Status Flow

```
User submits return request
    ↓
Status = "Requested" (Yellow badge)
    ↓
Admin reviews and approves
    ↓
Status = "Approved" (Green badge)
    ↓
User ships item back
    ↓
Status = "Shipped" (Purple badge)
    ↓
Admin receives and processes
    ↓
Status = "Completed" (Blue badge)

OR

Admin rejects return
    ↓
Status = "Rejected" (Red badge)
```

## Return Eligibility Rules

An order is returnable if:
1. ✓ Order status is "Delivered"
2. ✓ Current date is within the return window
   - Example: If policy is 30 days and order delivered on Jan 1, deadline is Jan 31
   - Return must be requested by Jan 31, 11:59 PM
3. ✗ No active return already exists for this order

## Visual Indicators

### On Orders
- **Blue badge "Returnable"**: Can request return now
- **No badge**: Return window has expired or order not delivered
- **Purple badge "Return: Status"**: Return request exists

### On Returns List
- **Yellow**: Requested - awaiting admin review
- **Green**: Approved - user should ship back
- **Red**: Rejected - return was denied
- **Blue**: Completed - fully processed
- **Purple**: Shipped - customer sent it back

## Example Workflow

### Step 1: Admin Sets Policy
```
Admin logs in
→ Admin Dashboard
→ "Return Policy" tab
→ Sets "30" days
→ Clicks "Save Policy"
✓ All future returns allow 30-day window
```

### Step 2: Customer Orders
```
Customer purchases shirt for $50
Order delivered on January 1st
Return window: Jan 1 - Jan 31 (30 days)
```

### Step 3: Customer Requests Return
```
Customer sees order on dashboard
→ Clicks "Request Return"
→ Enters reason: "Color not as pictured"
→ Submits request
✓ Return request created with status "Requested"
```

### Step 4: Admin Approves
```
Admin sees return request
→ Clicks "Manage"
→ Changes status to "Approved"
→ Adds note: "Return approved. Please ship to..."
→ Clicks "Update Return Status"
✓ Customer sees status changed to "Approved"
✓ Admin notes appear for admin reference
```

### Step 5: Customer Ships Back
```
Customer receives shipping address from admin note
→ Ships item back
→ Provides tracking number
```

### Step 6: Admin Completes
```
Admin receives returned item
→ Verifies condition
→ Updates status to "Completed"
→ Adds note: "Refund of $50 processed"
✓ Return marked as complete
✓ Customer sees order is fully processed
```

## Files Modified

1. **supabase/schema.sql**
   - Added: admin_settings table
   - Added: returns table  
   - Added: Indexes and RLS policies

2. **src/app/store/app-store.tsx**
   - Added: Return and AdminSettings types
   - Added: Return management functions
   - Added: returns and adminSettings state

3. **src/app/components/admin-dashboard-enhanced.tsx**
   - Added: ReturnPolicySettings component
   - Updated: ReturnsManagement component
   - Added: Return policy tab
   - Integrated: App store return functions

4. **src/app/components/user-dashboard.tsx** (NEW)
   - Complete user dashboard component
   - Orders tab with return request functionality
   - Returns tab to track submissions
   - Return eligibility checking

5. **src/app/App.tsx**
   - Added: UserDashboard import
   - Added: /dashboard route
   - Added: dashboard page type
   - Integrated: dashboard page rendering

6. **src/app/components/header.tsx**
   - Added: "My Dashboard" link in user menu

## How to Access

### User View
1. Log in to website
2. Click profile icon (top right)
3. Click "My Dashboard"
4. Go to "Orders" or "Returns" tab

### Admin View
1. Go to `/admin-login`
2. Log in as admin
3. Click "Admin Dashboard"
4. Click "Return Policy" to set days
5. Click "Returns" to manage requests

## Notes

- Return policy applies to all future returns (not retroactive)
- Users see deadline as: "MM/DD/YYYY (30 days from delivery)"
- Return reason is required when submitting
- Admin notes are visible to admin only
- Status updates are instant (no refresh needed)
- Order status must be "Delivered" to be returnable
