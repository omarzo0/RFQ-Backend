# EmailController Method Conversion Guide

## ✅ Already Fixed Methods:

- `sendEmail` ✅ (Main email sending)
- `createBulkEmail` ✅
- `sendBulkEmail` ✅
- `getEmailAnalytics` ✅
- `retryFailedEmails` ✅
- `trackEmailEngagement` ✅
- `handleEmailBounce` ✅
- `handleUnsubscribe` ✅

## 🔧 Pattern to Fix Remaining Methods:

### Before (Regular Method):

```typescript
async methodName(
  req: CompanyRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // method body
}
```

### After (Arrow Function):

```typescript
methodName = async (
  req: CompanyRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // method body
}; // Note the semicolon instead of closing brace
```

## 📋 Methods That May Need Fixing:

Based on the routes, these methods are likely to be called:

### Email Templates:

- `getEmailTemplates`
- `getEmailTemplate`
- `createEmailTemplate`
- `updateEmailTemplate`
- `deleteEmailTemplate`
- `duplicateEmailTemplate`
- `setDefaultTemplate`
- `previewTemplate`
- `getTemplateStats`
- `getTemplateTypes`
- `getSupportedTokens`
- `getTemplateAnalytics`

### Follow-up Rules:

- `getFollowUpRules`
- `createFollowUpRule`
- `updateFollowUpRule`
- `deleteFollowUpRule`
- `processScheduledFollowUps`
- `getFollowUpAnalytics`

### Email Campaigns:

- `getEmailCampaigns`
- `getEmailCampaign`
- `createEmailCampaign`
- `updateEmailCampaign`
- `deleteEmailCampaign`
- `startEmailCampaign`
- `pauseEmailCampaign`
- `resumeEmailCampaign`
- `completeEmailCampaign`
- `getCampaignStats`
- `getCampaignAnalytics`
- `getCampaignTypes`
- `getCampaignStatuses`

## 🎯 Priority Fix Order:

1. **High Priority** (Core email functionality):

   - ✅ Already fixed the main email sending methods

2. **Medium Priority** (Templates - commonly used):

   - `getEmailTemplates`
   - `createEmailTemplate`
   - `getEmailTemplate`

3. **Low Priority** (Advanced features):
   - Campaign methods
   - Analytics methods
   - Follow-up methods

## 🚀 Quick Fix Strategy:

Since you're mainly using the email sending functionality, the core methods are already fixed. If you encounter errors with other methods, apply the arrow function pattern above to those specific methods.

## 📧 Current Email Sending Status:

✅ **WORKING**: Your main email sending endpoint `/api/v1/company/emails/send` is fully functional!

The pattern you've seen is: when you get a `Cannot read properties of undefined (reading 'emailService')` error, convert that specific method to an arrow function using the pattern above.
