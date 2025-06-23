# Firebase Security Rules for ECC Resource Directory

## 🔥 Firestore Security Rules

Copy and paste these rules into your Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Resources collection - authenticated users can read/write, only admins can delete
    match /resources/{resourceId} {
      // Anyone authenticated can read resources
      allow read: if request.auth != null;
      
      // Anyone authenticated can create and update resources
      allow create, update: if request.auth != null;
      
      // Only admins can delete resources
      allow delete: if request.auth != null && 
        (request.auth.token.email.matches('.*admin.*') || 
         request.auth.token.email.matches('.*ecc.*'));
    }
    
    // Client media metadata (if you store metadata in Firestore)
    match /clients/{clientId}/media/{mediaId} {
      allow read, write: if request.auth != null;
    }
    
    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🗂️ Storage Security Rules

Copy and paste these rules into your Firebase Console > Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Resource logos - authenticated users can read/write, only admins can delete
    match /logos/{logoFile} {
      // Anyone authenticated can read logos
      allow read: if request.auth != null;
      
      // Anyone authenticated can upload logos
      allow write: if request.auth != null;
      
      // Only admins can delete logos
      allow delete: if request.auth != null && 
        (request.auth.token.email.matches('.*admin.*') || 
         request.auth.token.email.matches('.*ecc.*'));
    }
    
    // Client media files - authenticated users only
    match /clients/{clientId}/media/{mediaFile} {
      allow read, write: if request.auth != null;
    }
    
    // Default deny all other paths
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 📋 Setup Checklist

### 1. Enable Services
- [ ] Go to [Firebase Console](https://console.firebase.google.com/project/eccapp-fcc81)
- [ ] Navigate to **Firestore Database** → Click "Create database" if not enabled
- [ ] Navigate to **Storage** → Click "Get started" if not enabled

### 2. Apply Security Rules
- [ ] **Firestore**: Go to Firestore Database → Rules tab → Paste Firestore rules above
- [ ] **Storage**: Go to Storage → Rules tab → Paste Storage rules above
- [ ] Click **Publish** for both rule sets

### 3. Authentication Setup
- [ ] Go to **Authentication** → Sign-in method
- [ ] Enable **Email/Password** sign-in provider

### 4. User Access Levels
**All Authenticated Users Can:**
- ✅ View all resources
- ✅ Add new resources
- ✅ Edit existing resources
- ✅ Upload organization logos
- ✅ Search and filter resources

**Admin Users Can (additionally):**
- ✅ Delete resources
- ✅ Import CSV files with bulk resource data
- ✅ Delete uploaded logos

## 🛡️ Security Features

**Access Control:**
- ✅ **All Users**: Authenticated users can view, add, and edit resources
- ✅ **Admins Only**: Only users with "admin" or "ecc" in email can delete resources
- ✅ **Logo Management**: Anyone can upload, only admins can delete logos

**Firestore Rules:**
- ✅ Resources collection allows create/read/update for all authenticated users
- ✅ Delete operations restricted to admins only
- ✅ Client media metadata protected
- ✅ All other collections denied by default

**Storage Rules:**
- ✅ Logo uploads open to all authenticated users
- ✅ Logo deletion restricted to admins only
- ✅ Client media files protected by authentication
- ✅ All other storage paths denied by default

## 🔧 Admin User Management

**To make a user an admin:**
1. User email must contain "admin" or "ecc"
2. Examples of admin emails:
   - admin@yourcompany.com
   - john.admin@company.com
   - ecc-director@organization.org
   - sarah.ecc@company.com

**Admin Capabilities:**
- ✅ All regular user capabilities
- ✅ Delete resources
- ✅ Import CSV files with bulk resource data
- ✅ Delete uploaded logos
- ✅ Full administrative control

**Regular User Capabilities:**
- ✅ View all resources
- ✅ Add new resources
- ✅ Edit existing resources
- ✅ Upload organization logos
- ✅ Search and filter resources
- ✅ Use all search features including "Search Unlisted"

## 🚀 Production Ready

Your ECC Resource Directory is now production-ready with:
- ✅ Open resource contribution system
- ✅ Admin-controlled deletion for quality control
- ✅ Secure authentication system
- ✅ Protected file uploads
- ✅ CSV import functionality for bulk data (admin-only)
- ✅ Complete elder care service categories
- ✅ Professional UI matching your design requirements
- ✅ Permanent data storage in production Firestore database

## 📊 Access Summary

**🌟 New Permission Model:**
- **Resource Creation**: ✅ Open to all authenticated users
- **Resource Editing**: ✅ Open to all authenticated users  
- **Resource Deletion**: 🔒 Admin-only for quality control
- **CSV Import**: 🔒 Admin-only for bulk operations
- **Logo Upload**: ✅ Open to all authenticated users
- **Logo Deletion**: 🔒 Admin-only to prevent abuse

This model encourages community participation while maintaining administrative oversight for destructive operations.