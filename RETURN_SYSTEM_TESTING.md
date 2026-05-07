# Return Management System - Testing Guide

## How to Test the Return Management System

### Prerequisites
- Website running and accessible
- At least one test user account created and logged in
- Admin access to admin dashboard
- Orders in the system

## Test Scenario 1: Admin Sets Return Policy

**Steps:**
1. Access Admin Dashboard (`/admin-login`)
2. Login with admin credentials
3. Click "Return Policy" tab
4. See current policy (default: 30 days)
5. Change value to 14 days
6. Click "Save Policy"
7. You should see: "✓ Return policy updated successfully"

**Expected Result:**
- Policy saved to 14 days
- All new returns use 14-day window
- UI confirms save with green message

---

## Test Scenario 2: View Orders on User Dashboard

**Steps:**
1. Login as regular user
2. Click profile icon (top right)
3. Select "My Dashboard"
4. Click "Orders" tab
5. See list of orders

**Expected Result:**
- All user's orders displayed
- Shows: Order ID, Date, Status, Items, Total
- Orders show status badge (Delivered, Shipped, etc.)
- If within return window: Shows "Returnable" badge

---

## Test Scenario 3: Check Return Eligibility

**Steps:**
1. On Orders tab, find a delivered order
2. Look for badges:
   - "Returnable" badge = Can request return
   - No badge = Outside return window
3. Hover over deadline text to see exact date

**Expected Result:**
- Only "Delivered" orders can be returned
- Deadline shown as: "MM/DD/YYYY (14 days from delivery)" 
- Badge color: Blue
- "Request Return" button is enabled

---

## Test Scenario 4: Request a Return

**Steps:**
1. Find a returnable order
2. Click "Request Return" button
3. Modal opens showing:
   - Order details
   - Return reason field (empty)
   - Current policy message
4. Enter a reason: "Size didn't fit"
5. Click "Submit Return Request"
6. Should see success: "Return request submitted successfully!"

**Expected Result:**
- Modal closes
- Success message appears
- Return now appears in "Returns" tab
- Status is "Requested" (yellow badge)

---

## Test Scenario 5: Admin Reviews Return Request

**Steps:**
1. In Admin Dashboard, click "Returns" tab
2. See list of all returns:
   - Return ID
   - Order ID
   - Reason (from user)
   - Status (yellow = "Requested")
   - Requested date
3. Click "Manage" on the return you created

**Expected Result:**
- Modal opens with:
  - Return ID displayed
  - Reason shown: "Size didn't fit"
  - Status dropdown (currently "Requested")
  - Admin notes textarea (empty)
- Can modify status and add notes

---

## Test Scenario 6: Admin Updates Return Status

**Steps:**
1. In the return modal:
2. Change status from "Requested" to "Approved"
3. In "Admin Notes" field, enter: "Approval granted. Please ship to 123 Main St, City, State 12345"
4. Click "Update Return Status"
5. Modal closes

**Expected Result:**
- Return status changed to "Approved" (green badge)
- Admin notes saved
- Return no longer shows in "Requested" filter

---

## Test Scenario 7: User Sees Updated Return Status

**Steps:**
1. Login as the user who requested return
2. Go to My Dashboard → "Returns" tab
3. Find the return you submitted
4. Look at status badge

**Expected Result:**
- Status shows "Approved" in green
- (Note: Admin notes are admin-only, not visible to user)

---

## Test Scenario 8: Check Return Deadline Enforcement

**Steps:**
1. Create a new test order with delivery date 45 days ago (outside 14-day window)
2. Go to user dashboard
3. Look for return eligibility badge

**Expected Result:**
- No "Returnable" badge
- "Request Return" button is disabled
- Message: "Return period has expired. Contact support..."
- Cannot request return

---

## Test Scenario 9: Multiple Return Statuses

**Steps:**
1. Create multiple test return requests
2. Set different statuses for each:
   - First: Keep as "Requested" (yellow)
   - Second: Change to "Approved" (green)
   - Third: Change to "Rejected" (red)
   - Fourth: Change to "Shipped" (purple)
   - Fifth: Change to "Completed" (blue)
3. View in Returns tab

**Expected Result:**
- Each status shows correct color
- Status colors match documentation:
  - Yellow = Requested
  - Green = Approved
  - Red = Rejected
  - Purple = Shipped
  - Blue = Completed

---

## Test Scenario 10: Admin Notes Visibility

**Steps:**
1. Admin: Add notes to a return and save
2. Admin: Refresh page - notes still visible
3. User: Check Returns tab for same order
4. User: Notes should NOT be visible

**Expected Result:**
- Admin notes stored and persistent
- Only visible to admin
- User sees return status but not notes

---

## Test Scenario 11: Return Policy Change Impact

**Steps:**
1. Set return policy to 5 days
2. Create new test order (delivered today)
3. Check order: Should be returnable
4. In calendar, add 10 days manually
5. Check same order: Should NOT be returnable

**Expected Result:**
- 5-day policy enforced strictly
- After 5 days, order no longer returnable
- Policy change doesn't affect existing returns

---

## Test Scenario 12: Return Reason Validation

**Steps:**
1. Click "Request Return" on an order
2. Leave reason field empty
3. Try to submit

**Expected Result:**
- Form validation triggers
- Alert: "Please select a reason for return"
- Modal stays open
- Can't submit without reason

---

## Test Scenario 13: Multiple Orders

**Steps:**
1. Create user with 5 orders:
   - 3 within return window
   - 2 outside return window
2. View Orders tab
3. Count returnable vs non-returnable

**Expected Result:**
- 3 orders show "Returnable" badge
- 2 orders show no badge
- Can request returns on 3 orders only

---

## Test Scenario 14: Return on Multi-Item Order

**Steps:**
1. Create order with 3 items
2. Request return for the whole order
3. In Returns tab, check return details

**Expected Result:**
- Return links to whole order
- Reason applies to full order
- All items listed in order details
- Note: Current system returns full order, not individual items

---

## Test Scenario 15: User Menu Navigation

**Steps:**
1. Login as user
2. Click profile icon (top right)
3. Check dropdown menu
4. Should see "My Dashboard" link

**Expected Result:**
- Menu shows when logged in
- "My Dashboard" link visible
- Clicking goes to `/dashboard`
- Clicking "Sign Out" logs out

---

## Quick Test Checklist

- [ ] Admin can set return policy (1-365 days)
- [ ] Policy change saves with green message
- [ ] User sees all orders on dashboard
- [ ] Delivered orders show return eligibility
- [ ] Return deadline calculated correctly
- [ ] User can request return with reason
- [ ] Return appears in Returns tab immediately
- [ ] Admin sees return in Returns Management
- [ ] Admin can update return status
- [ ] Status colors show correctly
- [ ] Admin can add notes to return
- [ ] Return deadline enforced (can't return after window)
- [ ] Return reason is required
- [ ] Multiple returns track independently
- [ ] Policy change doesn't break existing returns

---

## Troubleshooting

### Return not appearing in user's Returns tab
- Check: Is return status saved? (should see success message)
- Try: Refresh page (F5)
- Check: User ID matches (ensure correct user logged in)

### Can't request return
- Check: Order status is "Delivered"
- Check: Current date is within return window
- Check: No existing return for this order
- Try: Refresh and try again

### Admin notes not showing
- Check: Notes were saved (should see update message)
- Check: You're in admin view (user can't see notes)
- Try: Refresh admin dashboard

### Return policy not changing
- Check: Entered numeric value (1-365)
- Check: Clicked "Save Policy" button
- Check: Saw success message
- Try: Hard refresh (Ctrl+Shift+R)

---

## Performance Notes

- Admin dashboard loads all returns (currently okay for <1000)
- User dashboard shows only their orders
- Return calculations happen in real-time
- No database queries needed (uses state)

## Data Notes

- Returns stored in app state (session-based)
- Policy stored in app state (session-based)
- For production: Implement database persistence
- For production: Add real-time sync with Supabase

---

## Success Criteria

System is working if:
1. ✓ Admin can set and save return policy
2. ✓ Users see accurate return eligibility
3. ✓ Users can request returns with reasons
4. ✓ Admin sees all return requests
5. ✓ Admin can update status and add notes
6. ✓ Return statuses show with correct colors
7. ✓ Deadline enforcement works correctly
8. ✓ UI is responsive and intuitive
9. ✓ No console errors
10. ✓ All interactions work as expected
