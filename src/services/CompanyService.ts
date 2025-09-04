import { prisma } from "../app";

export class CompanyService {
  /**
   * Get company profile
   */
  async getCompanyProfile(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        domain: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        timezone: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        emailFooter: true,
        defaultFollowUpDays: true,
        autoFollowUpEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    return {
      id: company.id,
      name: company.name,
      email: company.email,
      domain: company.domain,
      phone: company.phone,
      address: company.address,
      city: company.city,
      country: company.country,
      timezone: company.timezone,
      subscription: {
        plan: company.subscriptionPlan,
        status: company.subscriptionStatus,
      },
      settings: {
        emailFooter: company.emailFooter,
        defaultFollowUpDays: company.defaultFollowUpDays,
        autoFollowUpEnabled: company.autoFollowUpEnabled,
      },
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };
  }

  /**
   * Update company profile
   */
  async updateCompanyProfile(companyId: string, profileData: any) {
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: profileData.name,
        email: profileData.email,
        domain: profileData.domain,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        country: profileData.country,
        timezone: profileData.timezone,
        emailFooter: profileData.emailFooter,
        defaultFollowUpDays: profileData.defaultFollowUpDays,
        autoFollowUpEnabled: profileData.autoFollowUpEnabled,
      },
    });

    return this.getCompanyProfile(companyId);
  }

  /**
   * Upload company logo
   */
  async uploadCompanyLogo(companyId: string, logoFile: any) {
    // In a real implementation, this would upload to AWS S3 or similar
    // For now, return a mock URL
    const logoUrl = `https://example.com/logos/${companyId}-${Date.now()}.${logoFile.originalname
      .split(".")
      .pop()}`;

    // Update company record with logo URL
    await prisma.company.update({
      where: { id: companyId },
      data: {
        /* logoUrl field would be added to schema */
      },
    });

    return logoUrl;
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(companyId: string) {
    // This would typically come from a user preferences table
    // For now, return mock data based on company settings
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        defaultFollowUpDays: true,
        autoFollowUpEnabled: true,
        emailFooter: true,
      },
    });

    return {
      rfqDefaults: {
        defaultValidityDays: 30,
        defaultCurrency: "USD",
        autoNotifications: company?.autoFollowUpEnabled || true,
        defaultQuoteDeadline: company?.defaultFollowUpDays || 7,
      },
      emailTemplates: {
        emailSignature: "",
        subjectPrefix: "",
        includeLogo: true,
        footerText: company?.emailFooter || "",
      },
      communication: {
        followUpRules: {
          autoFollowUp: company?.autoFollowUpEnabled || true,
          followUpDays: company?.defaultFollowUpDays || 3,
          maxFollowUps: 2,
        },
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
        frequency: "immediate",
        rfqUpdates: true,
        quoteUpdates: true,
        systemAlerts: true,
        marketingEmails: false,
      },
    };
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(companyId: string, preferences: any) {
    // Update company settings based on preferences
    await prisma.company.update({
      where: { id: companyId },
      data: {
        defaultFollowUpDays:
          preferences.communication?.followUpRules?.followUpDays,
        autoFollowUpEnabled:
          preferences.communication?.followUpRules?.autoFollowUp,
        emailFooter: preferences.emailTemplates?.footerText,
      },
    });

    return this.getUserPreferences(companyId);
  }

  /**
   * Get subscription details
   */
  async getSubscription(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        stripeCustomerId: true,
      },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    // Get usage metrics
    const usage = await this.getUsageMetrics(companyId);

    return {
      currentPlan: {
        name: company.subscriptionPlan,
        status: company.subscriptionStatus,
        trialEndsAt: company.trialEndsAt,
        stripeCustomerId: company.stripeCustomerId,
      },
      usage: usage,
      availablePlans: [
        {
          id: "trial",
          name: "Trial",
          price: 0,
          features: ["5 RFQs/month", "10 contacts", "Basic analytics"],
        },
        {
          id: "basic",
          name: "Basic",
          price: 99,
          features: [
            "50 RFQs/month",
            "100 contacts",
            "Advanced analytics",
            "Email templates",
          ],
        },
        {
          id: "professional",
          name: "Professional",
          price: 299,
          features: [
            "200 RFQs/month",
            "500 contacts",
            "Full analytics",
            "API access",
            "Priority support",
          ],
        },
        {
          id: "enterprise",
          name: "Enterprise",
          price: 999,
          features: [
            "Unlimited RFQs",
            "Unlimited contacts",
            "Custom integrations",
            "Dedicated support",
          ],
        },
      ],
    };
  }

  /**
   * Update subscription
   */
  async updateSubscription(companyId: string, subscriptionData: any) {
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        subscriptionPlan: subscriptionData.plan,
        subscriptionStatus: subscriptionData.status,
      },
    });

    return this.getSubscription(companyId);
  }

  /**
   * Get usage metrics
   */
  async getUsageMetrics(companyId: string) {
    const currentMonth = new Date();
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );

    // Get current month usage
    const [rfqCount, emailCount, contactCount] = await Promise.all([
      prisma.rFQ.count({
        where: {
          companyId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.emailLog.count({
        where: {
          companyId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.contact.count({
        where: { companyId },
      }),
    ]);

    // Get plan limits (mock data)
    const planLimits = {
      trial: { rfqs: 5, emails: 50, contacts: 10 },
      basic: { rfqs: 50, emails: 500, contacts: 100 },
      professional: { rfqs: 200, emails: 2000, contacts: 500 },
      enterprise: { rfqs: -1, emails: -1, contacts: -1 }, // -1 means unlimited
    };

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { subscriptionPlan: true },
    });

    const limits =
      planLimits[company?.subscriptionPlan as keyof typeof planLimits] ||
      planLimits.trial;

    return {
      rfqs: {
        used: rfqCount,
        limit: limits.rfqs,
        percentage: limits.rfqs === -1 ? 0 : (rfqCount / limits.rfqs) * 100,
      },
      emails: {
        used: emailCount,
        limit: limits.emails,
        percentage:
          limits.emails === -1 ? 0 : (emailCount / limits.emails) * 100,
      },
      contacts: {
        used: contactCount,
        limit: limits.contacts,
        percentage:
          limits.contacts === -1 ? 0 : (contactCount / limits.contacts) * 100,
      },
    };
  }

  /**
   * Get billing history
   */
  async getBillingHistory(companyId: string) {
    // This would typically come from Stripe or a billing table
    // For now, return mock data
    return [
      {
        id: "inv_001",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        amount: 99.0,
        status: "paid",
        description: "Professional Plan - Monthly",
      },
      {
        id: "inv_002",
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        amount: 99.0,
        status: "paid",
        description: "Professional Plan - Monthly",
      },
    ];
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(companyId: string) {
    // This would typically come from Stripe
    // For now, return mock data
    return [
      {
        id: "pm_001",
        type: "card",
        last4: "4242",
        brand: "visa",
        expMonth: 12,
        expYear: 2025,
        isDefault: true,
      },
    ];
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(companyId: string, paymentMethodData: any) {
    // This would integrate with Stripe
    // For now, return mock data
    return {
      id: "pm_new",
      type: "card",
      last4: "1234",
      brand: "mastercard",
      expMonth: 6,
      expYear: 2026,
      isDefault: false,
    };
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(companyId: string, paymentMethodId: string) {
    // This would delete from Stripe
    return true;
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(companyId: string, paymentMethodId: string) {
    // This would update in Stripe
    return true;
  }

  /**
   * Get billing settings
   */
  async getBillingSettings(companyId: string) {
    return {
      billingAddress: {
        street: "123 Business St",
        city: "Business City",
        state: "BC",
        zipCode: "12345",
        country: "USA",
      },
      taxSettings: {
        taxId: "TAX123456789",
        taxRate: 8.5,
      },
      invoiceSettings: {
        invoicePrefix: "INV",
        autoBilling: true,
        billingCycle: "monthly",
      },
    };
  }

  /**
   * Update billing settings
   */
  async updateBillingSettings(companyId: string, settings: any) {
    // This would update billing settings
    return settings;
  }

  /**
   * Get API keys
   */
  async getAPIKeys(companyId: string) {
    const apiKeys = await prisma.aPIKey.findMany({
      where: { companyId },
      select: {
        id: true,
        keyName: true,
        scopes: true,
        rateLimitPerHour: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return apiKeys.map((key) => ({
      id: key.id,
      name: key.keyName,
      scopes: key.scopes,
      rateLimit: key.rateLimitPerHour,
      isActive: key.isActive,
      lastUsed: key.lastUsedAt,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
    }));
  }

  /**
   * Create API key
   */
  async createAPIKey(companyId: string, userId: string, keyData: any) {
    const apiKey = await prisma.aPIKey.create({
      data: {
        companyId,
        keyName: keyData.name,
        apiKey: this.generateAPIKey(),
        scopes: keyData.scopes || ["read"],
        rateLimitPerHour: keyData.rateLimit || 1000,
        createdBy: userId,
      },
    });

    return {
      id: apiKey.id,
      name: apiKey.keyName,
      apiKey: apiKey.apiKey, // Only returned on creation
      scopes: apiKey.scopes,
      rateLimit: apiKey.rateLimitPerHour,
      createdAt: apiKey.createdAt,
    };
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(companyId: string, keyId: string) {
    await prisma.aPIKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    return true;
  }

  /**
   * Get webhooks
   */
  async getWebhooks(companyId: string) {
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        url: true,
        events: true,
        isActive: true,
        lastSuccessAt: true,
        lastFailureAt: true,
        failureCount: true,
        createdAt: true,
      },
    });

    return webhooks;
  }

  /**
   * Create webhook
   */
  async createWebhook(companyId: string, userId: string, webhookData: any) {
    const webhook = await prisma.webhookEndpoint.create({
      data: {
        companyId,
        name: webhookData.name,
        url: webhookData.url,
        secret: webhookData.secret,
        events: webhookData.events || ["rfq.created", "quote.received"],
        createdBy: userId,
      },
    });

    return webhook;
  }

  /**
   * Update webhook
   */
  async updateWebhook(companyId: string, webhookId: string, webhookData: any) {
    const webhook = await prisma.webhookEndpoint.update({
      where: { id: webhookId },
      data: {
        name: webhookData.name,
        url: webhookData.url,
        secret: webhookData.secret,
        events: webhookData.events,
        isActive: webhookData.isActive,
      },
    });

    return webhook;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(companyId: string, webhookId: string) {
    await prisma.webhookEndpoint.delete({
      where: { id: webhookId },
    });

    return true;
  }

  /**
   * Get integrations
   */
  async getIntegrations(companyId: string) {
    // This would return available integrations and their connection status
    return [
      {
        type: "stripe",
        name: "Stripe",
        description: "Payment processing",
        isConnected: true,
        connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        type: "sendgrid",
        name: "SendGrid",
        description: "Email delivery",
        isConnected: false,
        connectedAt: null,
      },
      {
        type: "slack",
        name: "Slack",
        description: "Team notifications",
        isConnected: false,
        connectedAt: null,
      },
    ];
  }

  /**
   * Connect integration
   */
  async connectIntegration(
    companyId: string,
    type: string,
    connectionData: any
  ) {
    // This would handle the OAuth flow or API key setup
    return {
      type,
      isConnected: true,
      connectedAt: new Date(),
    };
  }

  /**
   * Disconnect integration
   */
  async disconnectIntegration(companyId: string, type: string) {
    // This would revoke tokens or remove API keys
    return {
      type,
      isConnected: false,
      disconnectedAt: new Date(),
    };
  }

  /**
   * Generate API key
   */
  private generateAPIKey(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "rfq_";
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

