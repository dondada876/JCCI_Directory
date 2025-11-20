# Relief Claims System Documentation

## Overview

The Relief Claims System is a comprehensive disaster relief management system for handling victim claims, donations, distribution events, and fund allocation tracking. This system enables:

- **Victims** to submit relief claims online
- **Staff** to verify and approve claims
- **Coordinators** to manage distribution events
- **Public** to track donations transparently

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [API Reference](#api-reference)
4. [Components](#components)
5. [Setup Instructions](#setup-instructions)
6. [Usage Examples](#usage-examples)
7. [Security & Privacy](#security--privacy)
8. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Relief Claims System                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │   Frontend    │  │   API Layer   │  │   Database    │   │
│  │  (Next.js)    │──│  (Supabase)   │──│ (PostgreSQL)  │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Components                                │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ • ClaimSubmissionForm - Public claim submission       │  │
│  │ • ClaimVerificationDashboard - Staff verification     │  │
│  │ • ClaimTrackingPage - Status tracking for claimants   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
JCCI_Directory/
├── supabase/
│   └── relief-claims-schema.sql        # Database schema
├── lib/
│   ├── api/
│   │   └── relief-claims.ts            # API functions
│   ├── types/
│   │   └── relief-claims.ts            # TypeScript types
│   └── utils/
│       └── relief-claims-validation.ts # Validation utilities
└── components/
    └── relief-claims/
        ├── ClaimSubmissionForm.tsx     # Public submission form
        ├── ClaimVerificationDashboard.tsx # Admin dashboard
        └── ClaimTrackingPage.tsx       # Claimant tracking
```

---

## Database Schema

### Tables

#### 1. `relief_claims`
Stores disaster relief claims from victims.

**Key Fields:**
- `claim_number` - Unique identifier (HM-YYYY-XXXXX format)
- `verification_status` - Current status (submitted, under_review, verified, approved, fulfilled, rejected)
- `priority_level` - Urgency (urgent, high, standard, low)
- `damage_type` - Array of damage types
- `immediate_needs` - Array of needed supplies
- `household_size` - Number of people in household

**Status Flow:**
```
submitted → under_review → verified → approved → fulfilled
                                    ↓
                                 rejected
```

#### 2. `donations`
Tracks monetary donations for disaster relief.

**Key Fields:**
- `amount` - Donation amount
- `payment_method` - stripe, paypal, check, wire, cash
- `allocation_status` - unallocated, allocated, disbursed
- `is_anonymous` - Privacy flag

#### 3. `relief_inventory`
Manages physical relief supplies.

**Key Fields:**
- `item_category` - food, water, clothing, medical, etc.
- `quantity_available` - Current stock
- `quantity_allocated` - Reserved for approved claims
- `quantity_distributed` - Already given out

#### 4. `distribution_events`
Manages relief distribution logistics.

**Key Fields:**
- `event_type` - pickup, delivery, mobile_distribution
- `parish` - Location
- `capacity` - Maximum claimants served
- `status` - scheduled, in_progress, completed, cancelled

#### 5. `campaigns`
Manages fundraising campaigns.

**Key Fields:**
- `goal_amount` - Target fundraising goal
- `raised_amount` - Current total raised
- `status` - active, paused, completed

#### 6. `fund_allocations`
Tracks donation spending (transparency).

**Key Fields:**
- `allocation_type` - relief_supplies, operational, program
- `recipient_type` - individual_claim, partner_org, vendor
- `receipt_url` - Proof of payment
- `proof_of_delivery_url` - Delivery confirmation

### Views

#### `claims_by_parish`
Aggregates claims by parish with status counts.

#### `donation_summary`
Provides donation statistics and allocation summary.

#### `campaign_progress`
Shows campaign fundraising progress.

---

## API Reference

### Claim Submission

#### `submitReliefClaim(claimData: ReliefClaimSubmission)`
Submits a new relief claim.

**Parameters:**
```typescript
{
  claimant_name: string;
  claimant_phone: string;
  address: string;
  parish: Parish;
  damage_type: DamageType[];
  damage_severity: DamageSeverity;
  household_size: number;
  immediate_needs: ImmediateNeed[];
  // ... additional fields
}
```

**Returns:**
```typescript
{
  data: ReliefClaim;
  message: string;
}
```

**Example:**
```typescript
const result = await submitReliefClaim({
  claimant_name: "John Smith",
  claimant_phone: "876-555-1234",
  parish: "Kingston",
  address: "123 Main St, Kingston",
  damage_type: ["flooding", "structural"],
  damage_severity: "severe",
  household_size: 4,
  children_count: 2,
  immediate_needs: ["shelter", "food", "water"]
});

console.log(result.message); // "Claim submitted successfully. Your claim number is HM-2025-00001"
```

### Claim Retrieval

#### `getAllClaims(filters?, page?, perPage?)`
Fetches claims with optional filtering.

**Parameters:**
```typescript
{
  parish?: Parish;
  verification_status?: VerificationStatus;
  priority_level?: PriorityLevel;
  search?: string;
  from_date?: string;
  to_date?: string;
}
```

**Example:**
```typescript
const claims = await getAllClaims(
  { parish: "Kingston", verification_status: "submitted" },
  1,
  20
);
```

#### `getClaimById(id: string)`
Fetches a single claim by ID.

#### `getClaimByNumber(claimNumber: string)`
Fetches a claim by claim number.

#### `getClaimsByPhone(phone: string)`
Fetches all claims for a phone number.

### Claim Verification

#### `updateClaimStatus(claimId, status, userId?, notes?)`
Updates claim verification status.

**Example:**
```typescript
await updateClaimStatus(
  "claim-uuid",
  "under_review",
  "user-uuid",
  "Verifying damage photos"
);
```

#### `approveClaim(claimId, approvedItems, userId, notes?)`
Approves a claim with specific items.

**Example:**
```typescript
await approveClaim(
  "claim-uuid",
  {
    supplies: [
      { item: "shelter", quantity: 1, unit: "set" },
      { item: "food", quantity: 7, unit: "days" }
    ]
  },
  "user-uuid",
  "Approved for emergency relief package"
);
```

#### `rejectClaim(claimId, reason, userId)`
Rejects a claim with reason.

#### `updateClaimPriority(claimId, priority)`
Updates claim priority level.

### Distribution

#### `scheduleClaimDistribution(claimId, eventId, date)`
Schedules claim for distribution event.

#### `confirmPickup(claimId)`
Marks claim as fulfilled when items are picked up.

### Statistics

#### `getClaimsStatistics()`
Returns aggregate statistics.

**Returns:**
```typescript
{
  total: number;
  by_status: { [status: string]: number };
  by_priority: { [priority: string]: number };
  by_parish: { [parish: string]: number };
}
```

### Real-time Subscriptions

#### `subscribeToNewClaims(callback)`
Subscribes to new claim submissions.

**Example:**
```typescript
const subscription = subscribeToNewClaims((newClaim) => {
  console.log("New claim received:", newClaim.claim_number);
  // Update UI
});

// Cleanup
subscription.unsubscribe();
```

#### `subscribeToClaimUpdates(claimId, callback)`
Subscribes to updates for a specific claim.

---

## Components

### ClaimSubmissionForm

**Purpose:** Mobile-first form for victims to submit relief claims.

**Features:**
- Multi-step wizard (Personal → Location → Damage → Household → Needs → Review)
- Photo upload from camera/gallery
- Auto-generated claim numbers
- Priority level calculation
- Form validation

**Usage:**
```tsx
import ClaimSubmissionForm from '@/components/relief-claims/ClaimSubmissionForm';

export default function SubmitClaimPage() {
  return <ClaimSubmissionForm />;
}
```

**Pages to Create:**
- `/relief/submit-claim` - Public claim submission

### ClaimVerificationDashboard

**Purpose:** Admin dashboard for staff to review and approve claims.

**Features:**
- Searchable/filterable claims table
- Real-time statistics
- Claim detail view
- Status management
- Approval/rejection workflow
- Priority adjustment

**Usage:**
```tsx
import ClaimVerificationDashboard from '@/components/relief-claims/ClaimVerificationDashboard';

export default function AdminDashboard() {
  return <ClaimVerificationDashboard />;
}
```

**Pages to Create:**
- `/admin/relief/dashboard` - Staff dashboard (requires authentication)

### ClaimTrackingPage

**Purpose:** Public page for claimants to track claim status.

**Features:**
- Search by claim number or phone
- Status timeline
- Distribution information
- Real-time updates
- Public notes view

**Usage:**
```tsx
import ClaimTrackingPage from '@/components/relief-claims/ClaimTrackingPage';

export default function TrackClaimPage() {
  return <ClaimTrackingPage />;
}
```

**Pages to Create:**
- `/relief/track-claim` - Public tracking page

---

## Setup Instructions

### 1. Database Setup

Run the schema migration:

```bash
# Navigate to supabase directory
cd supabase

# Apply the relief claims schema
psql -h your-supabase-host -d postgres -U postgres -f relief-claims-schema.sql
```

Or use Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of `supabase/relief-claims-schema.sql`
3. Run the query

### 2. Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Storage Bucket Setup

Create a storage bucket for claim photos:

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('relief-claims', 'relief-claims', true);

-- Set storage policy
CREATE POLICY "Public can upload to relief-claims"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'relief-claims');

CREATE POLICY "Public can view relief-claims"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'relief-claims');
```

### 4. Create Next.js Pages

Create the following pages in your Next.js app:

**app/relief/submit-claim/page.tsx:**
```tsx
import ClaimSubmissionForm from '@/components/relief-claims/ClaimSubmissionForm';

export default function SubmitClaimPage() {
  return (
    <main>
      <ClaimSubmissionForm />
    </main>
  );
}
```

**app/relief/track-claim/page.tsx:**
```tsx
import ClaimTrackingPage from '@/components/relief-claims/ClaimTrackingPage';

export default function TrackClaimPage() {
  return (
    <main>
      <ClaimTrackingPage />
    </main>
  );
}
```

**app/admin/relief/dashboard/page.tsx:**
```tsx
import ClaimVerificationDashboard from '@/components/relief-claims/ClaimVerificationDashboard';

export default function AdminDashboard() {
  return (
    <main>
      <ClaimVerificationDashboard />
    </main>
  );
}
```

### 5. Authentication Setup

For the admin dashboard, add authentication middleware:

**middleware.ts:**
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

---

## Usage Examples

### Example 1: Submit a Claim

```typescript
import { submitReliefClaim } from '@/lib/api/relief-claims';

const handleSubmit = async () => {
  const result = await submitReliefClaim({
    claimant_name: "Jane Doe",
    claimant_email: "jane@example.com",
    claimant_phone: "876-555-1234",
    claimant_whatsapp: "876-555-1234",
    address: "15 Hope Road, Kingston",
    parish: "Kingston",
    community: "New Kingston",
    damage_type: ["flooding", "structural"],
    damage_severity: "severe",
    damage_description: "Living room completely flooded, roof damaged",
    household_size: 4,
    children_count: 2,
    elderly_count: 0,
    disabled_count: 0,
    immediate_needs: ["shelter", "food", "water", "clothing"],
    special_requirements: "Child has asthma, needs medical supplies"
  });

  if (result.data) {
    alert(`Claim submitted! Your claim number is ${result.data.claim_number}`);
  }
};
```

### Example 2: Track a Claim

```typescript
import { getClaimByNumber } from '@/lib/api/relief-claims';

const trackClaim = async (claimNumber: string) => {
  const result = await getClaimByNumber(claimNumber);

  if (result.data) {
    console.log("Status:", result.data.verification_status);
    console.log("Priority:", result.data.priority_level);
    console.log("Notes:", result.data.public_notes);
  }
};

trackClaim("HM-2025-00001");
```

### Example 3: Approve a Claim

```typescript
import { approveClaim } from '@/lib/api/relief-claims';

const approve = async (claimId: string, userId: string) => {
  const approvedItems = {
    supplies: [
      { item: "Tarpaulin", quantity: 2, unit: "sheets" },
      { item: "Food package", quantity: 7, unit: "days" },
      { item: "Water bottles", quantity: 24, unit: "bottles" },
      { item: "Clothing set", quantity: 4, unit: "sets" }
    ]
  };

  const result = await approveClaim(
    claimId,
    approvedItems,
    userId,
    "Approved for full emergency relief package. Pick up scheduled for next Tuesday."
  );

  if (result.data) {
    console.log("Claim approved successfully!");
  }
};
```

### Example 4: Get Statistics

```typescript
import { getClaimsStatistics } from '@/lib/api/relief-claims';

const showStats = async () => {
  const stats = await getClaimsStatistics();

  if (stats.data) {
    console.log("Total claims:", stats.data.total);
    console.log("Pending:", stats.data.by_status.submitted);
    console.log("Urgent claims:", stats.data.by_priority.urgent);
  }
};
```

---

## Security & Privacy

### Row Level Security (RLS)

All tables have RLS policies enabled:

**Public Access:**
- Anyone can submit claims (INSERT)
- Anyone can view active campaigns
- Claimants can view their own claims (by phone number)

**Authenticated Staff:**
- Can view all claims
- Can update claim status
- Can manage distribution events
- Can view donations

### Data Protection

**Sensitive Fields:**
- National ID numbers are stored encrypted
- Staff internal notes are hidden from claimants
- Anonymous donations hide donor information

**Photo Storage:**
- Photos are stored in Supabase Storage
- Public URLs are generated for authorized viewing
- File size limited to 5MB per photo
- Maximum 10 photos per claim

### Privacy Considerations

1. **Claimant Privacy:**
   - Phone numbers used for tracking (not displayed publicly)
   - Personal information only visible to staff
   - Public notes separate from internal notes

2. **Donation Transparency:**
   - Public can view fund allocations
   - Anonymous donations hide donor details
   - Transaction fees clearly shown

---

## Troubleshooting

### Common Issues

#### 1. "Failed to generate claim number"

**Cause:** Database function not created

**Solution:**
```sql
-- Run this in Supabase SQL Editor
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  claim_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM relief_claims
  WHERE claim_number LIKE 'HM-' || year_part || '-%';
  claim_num := 'HM-' || year_part || '-' || LPAD(sequence_num::TEXT, 5, '0');
  RETURN claim_num;
END;
$$ LANGUAGE plpgsql;
```

#### 2. "Permission denied for table relief_claims"

**Cause:** RLS policies not set up correctly

**Solution:**
Re-run the RLS policy section from `relief-claims-schema.sql`

#### 3. Photos not uploading

**Cause:** Storage bucket not configured

**Solution:**
1. Create bucket in Supabase Dashboard → Storage
2. Name it "relief-claims"
3. Set as public
4. Add upload and select policies

#### 4. Real-time updates not working

**Cause:** Realtime not enabled for tables

**Solution:**
```sql
-- Enable realtime for relief_claims table
ALTER PUBLICATION supabase_realtime ADD TABLE relief_claims;
```

### Debug Mode

Enable debug logging in API calls:

```typescript
// In lib/api/relief-claims.ts
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('API Call:', endpoint, params);
}
```

---

## Testing

### Manual Testing Checklist

**Claim Submission:**
- [ ] Submit claim with all required fields
- [ ] Submit claim with photos
- [ ] Verify claim number generation
- [ ] Check automatic priority assignment

**Claim Tracking:**
- [ ] Track by claim number
- [ ] Track by phone number
- [ ] Verify status updates appear
- [ ] Check public notes display

**Admin Dashboard:**
- [ ] View claims list
- [ ] Filter by parish/status/priority
- [ ] Update claim status
- [ ] Approve claim with items
- [ ] Reject claim with reason
- [ ] View statistics

**Real-time Features:**
- [ ] New claim appears in dashboard
- [ ] Status updates reflect immediately
- [ ] Multiple tabs stay in sync

---

## Next Steps

### Recommended Enhancements

1. **SMS Notifications:**
   - Integrate Twilio
   - Send SMS on status changes
   - Distribution reminders

2. **Email Notifications:**
   - Claim submission confirmation
   - Status update emails
   - Distribution instructions

3. **Reporting:**
   - PDF claim reports
   - Export to CSV
   - Analytics dashboard

4. **Mobile App:**
   - Native iOS/Android apps
   - Offline claim submission
   - Push notifications

5. **WordPress Integration:**
   - Sync claims to WordPress
   - Display on website
   - Form builder integration

---

## Support

For questions or issues with the Relief Claims System:

- **Documentation:** This file
- **Code:** Check inline comments in source files
- **Database:** See `supabase/relief-claims-schema.sql` for schema details
- **Types:** See `lib/types/relief-claims.ts` for type definitions

---

## License

Part of the Jamaica Connect platform.

---

**Last Updated:** 2025-01-20
**Version:** 1.0.0
