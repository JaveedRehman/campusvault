# Security Specification for CampusVault

## 1. Data Invariants
- **Public Read Access**: Any user (authenticated or unauthenticated) can read resource metadata and download documents.
- **Public Rating Creation**: Anyone (including unauthenticated visitors with an anonymous identifier) can submit a rating score between 1 and 5 stars for a valid resource.
- **Authenticated Uploads**: Only authenticated Firebase users can create new `resources` documents.
- **Resource Immutability & Ownership**: Resource metadata can only be updated by the document creator (or ratings aggregator functions), preventing unauthorized modification or deletion by non-owners.
- **File Type & Size Restrictions**: Uploaded academic files must be valid PDF documents.

## 2. The Dirty Dozen Payloads (Targeting Firestore Rules Security)

1. **Unauthenticated Resource Upload**: Anonymous user attempts to create a document in `/resources`. Expected: PERMISSION_DENIED.
2. **Resource Ownership Spoofing**: User A attempts to create a resource with `uploadedBy: "user_B"`. Expected: PERMISSION_DENIED.
3. **Invalid Rating Range (< 1)**: User attempts to submit a rating with `rating: 0`. Expected: PERMISSION_DENIED.
4. **Invalid Rating Range (> 5)**: User attempts to submit a rating with `rating: 6`. Expected: PERMISSION_DENIED.
5. **Excessive String Length in Title**: User attempts to inject a 2,000 character string into resource `title`. Expected: PERMISSION_DENIED.
6. **Malicious Document Deletion by Non-Owner**: Authenticated User B attempts to delete User A's uploaded PDF document. Expected: PERMISSION_DENIED.
7. **Modifying Immortal Fields**: User attempts to alter `uploadedBy` or `createdAt` on an existing resource document. Expected: PERMISSION_DENIED.
8. **Invalid Anonymous Identifier Format**: Rating submitted with non-alphanumeric special character identifier. Expected: PERMISSION_DENIED.
9. **Junk Field Injection**: Payload sent with unauthorized field `isAdmin: true`. Expected: PERMISSION_DENIED.
10. **Non-Numeric Rating Score**: Payload submitted with `rating: "five stars"`. Expected: PERMISSION_DENIED.
11. **Resource Update by Unauthorized User**: User B attempts to change the `fileUrl` of User A's resource. Expected: PERMISSION_DENIED.
12. **Blanket Query Exploitation**: Query without proper collection constraints trying to list private auth metadata. Expected: PERMISSION_DENIED.

## 3. Verification Guidelines
Firestore security rules enforce attribute checks (`isValidResource`, `isValidRating`, `isSignedIn`, `isOwner`, `isValidId`) to ensure all operations conform strictly to these 12 security requirements.
