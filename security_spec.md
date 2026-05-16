# Security Specification - Youth City Hub

## Data Invariants
- A **Booking** must belong to the user who created it (if authenticated).
- A **User Profile** can only be created or modified by the owner of the UID.
- **Inquiries** are public-write but only readable by admins.
- No user can elevate their own `role` field.

## The Dirty Dozen Payloads (Rejection Targets)
1. Creating a booking with someone else's `userId`.
2. Updating a user's `role` to 'admin' using client SDK.
3. Reading all `bookings` without being the owner or admin.
4. Deleting a `booking` belonging to another user.
5. Creating a `user` document with a different document ID than the auth UID.
6. Updating the `createdAt` timestamp of a user profile.
7. Injecting 1MB of garbage data into a booking's `message` field.
8. Listing all `inquiries` as a standard member.
9. Writing a field `isVerified: true` into a user profile unexpectedly.
10. Creating a booking with an invalid, oversized `service` name.
11. Reading another user's PII (email) from the `users` collection.
12. Updating a booking's `status` directly from the client.

## Test Runner (firestore.rules.test.ts)
```typescript
// Skeleton for tests
describe('Firestore Security Rules', () => {
  it('should deny unauthorized user profile creation', async () => { /* ... */ });
  it('should deny role escalation', async () => { /* ... */ });
  it('should restrict bookings to owners', async () => { /* ... */ });
});
```
