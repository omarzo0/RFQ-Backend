import { prisma } from "../../app";
import { AppError, ValidationError } from "../../utils/errors";
import logger from "../../utils/logger";
import {
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from "@prisma/client";

export interface TransactionCreateData {
  companyId: string;
  subscriptionPlanId?: string;
  transactionType: TransactionType;
  amount: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  paymentProvider?: string;
  externalId?: string;
  description?: string;
  metadata?: any;
  invoiceNumber?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
}

export interface TransactionUpdateData {
  transactionType?: TransactionType;
  amount?: number;
  currency?: string;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  paymentProvider?: string;
  externalId?: string;
  description?: string;
  metadata?: any;
  failureReason?: string;
  refundAmount?: number;
  refundReason?: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  receiptUrl?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  companyId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface TransactionAnalytics {
  totalTransactions: number;
  totalRevenue: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  averageTransactionValue: number;
  revenueByStatus: {
    status: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
  revenueByType: {
    type: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
  revenueByMonth: {
    month: string;
    count: number;
    amount: number;
  }[];
  topCompanies: {
    companyId: string;
    companyName: string;
    transactionCount: number;
    totalAmount: number;
  }[];
}

export class AdminTransactionService {
  /**
   * Get all transactions with filtering and pagination
   */
  async getTransactions(filters: TransactionFilters = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      companyId,
      dateFrom,
      dateTo,
      search,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.transactionType = type;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { externalId: { contains: search, mode: "insensitive" } },
        { invoiceNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
              priceMonthly: true,
              priceYearly: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionPlan: true,
            subscriptionStatus: true,
          },
        },
        subscriptionPlan: {
          select: {
            id: true,
            name: true,
            priceMonthly: true,
            priceYearly: true,
            features: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    return transaction;
  }

  /**
   * Create new transaction
   */
  async createTransaction(data: TransactionCreateData) {
    try {
      // Validate required fields
      if (!data.companyId) {
        throw new ValidationError("Company ID is required");
      }

      if (!data.amount || data.amount <= 0) {
        throw new ValidationError("Amount must be greater than 0");
      }

      // Check if company exists
      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
      });

      if (!company) {
        throw new ValidationError("Company not found");
      }

      // Check if subscription plan exists (if provided)
      if (data.subscriptionPlanId) {
        const plan = await prisma.subscriptionPlan.findUnique({
          where: { id: data.subscriptionPlanId },
        });

        if (!plan) {
          throw new ValidationError("Subscription plan not found");
        }
      }

      const transaction = await prisma.transaction.create({
        data: {
          companyId: data.companyId,
          subscriptionPlanId: data.subscriptionPlanId,
          transactionType: data.transactionType,
          amount: data.amount,
          currency: data.currency || "USD",
          paymentMethod: data.paymentMethod,
          paymentProvider: data.paymentProvider,
          externalId: data.externalId,
          description: data.description,
          metadata: data.metadata || {},
          invoiceNumber: data.invoiceNumber,
          invoiceUrl: data.invoiceUrl,
          receiptUrl: data.receiptUrl,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update financial details for the company
      await this.updateCompanyFinancialDetails(data.companyId);

      logger.info(`Transaction created: ${transaction.id}`);
      return transaction;
    } catch (error) {
      if (error instanceof AppError || error instanceof ValidationError) {
        throw error;
      }
      logger.error("Error creating transaction:", error);
      throw new AppError("Failed to create transaction", 500);
    }
  }

  /**
   * Update transaction
   */
  async updateTransaction(id: string, data: TransactionUpdateData) {
    try {
      // Check if transaction exists
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id },
      });

      if (!existingTransaction) {
        throw new AppError("Transaction not found", 404);
      }

      // Validate amount if provided
      if (data.amount !== undefined && data.amount <= 0) {
        throw new ValidationError("Amount must be greater than 0");
      }

      const updateData: any = {};

      if (data.transactionType !== undefined)
        updateData.transactionType = data.transactionType;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.paymentMethod !== undefined)
        updateData.paymentMethod = data.paymentMethod;
      if (data.paymentProvider !== undefined)
        updateData.paymentProvider = data.paymentProvider;
      if (data.externalId !== undefined)
        updateData.externalId = data.externalId;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      if (data.failureReason !== undefined)
        updateData.failureReason = data.failureReason;
      if (data.refundAmount !== undefined)
        updateData.refundAmount = data.refundAmount;
      if (data.refundReason !== undefined)
        updateData.refundReason = data.refundReason;
      if (data.invoiceNumber !== undefined)
        updateData.invoiceNumber = data.invoiceNumber;
      if (data.invoiceUrl !== undefined)
        updateData.invoiceUrl = data.invoiceUrl;
      if (data.receiptUrl !== undefined)
        updateData.receiptUrl = data.receiptUrl;

      // Set processedAt if status is being changed to COMPLETED
      if (
        data.status === TransactionStatus.COMPLETED &&
        !existingTransaction.processedAt
      ) {
        updateData.processedAt = new Date();
      }

      // Set failedAt if status is being changed to FAILED
      if (
        data.status === TransactionStatus.FAILED &&
        !existingTransaction.failedAt
      ) {
        updateData.failedAt = new Date();
      }

      const transaction = await prisma.transaction.update({
        where: { id },
        data: updateData,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update financial details for the company
      await this.updateCompanyFinancialDetails(transaction.companyId);

      logger.info(`Transaction updated: ${transaction.id}`);
      return transaction;
    } catch (error) {
      if (error instanceof AppError || error instanceof ValidationError) {
        throw error;
      }
      logger.error("Error updating transaction:", error);
      throw new AppError("Failed to update transaction", 500);
    }
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(id: string) {
    try {
      // Check if transaction exists
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id },
      });

      if (!existingTransaction) {
        throw new AppError("Transaction not found", 404);
      }

      // Don't allow deletion of completed transactions
      if (existingTransaction.status === TransactionStatus.COMPLETED) {
        throw new ValidationError(
          "Cannot delete completed transactions. Consider processing a refund instead."
        );
      }

      await prisma.transaction.delete({
        where: { id },
      });

      // Update financial details for the company
      await this.updateCompanyFinancialDetails(existingTransaction.companyId);

      logger.info(`Transaction deleted: ${id}`);
    } catch (error) {
      if (error instanceof AppError || error instanceof ValidationError) {
        throw error;
      }
      logger.error("Error deleting transaction:", error);
      throw new AppError("Failed to delete transaction", 500);
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    id: string,
    status: TransactionStatus,
    failureReason?: string,
    refundReason?: string
  ) {
    try {
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id },
      });

      if (!existingTransaction) {
        throw new AppError("Transaction not found", 404);
      }

      const updateData: any = { status };

      // Set appropriate timestamps based on status
      if (
        status === TransactionStatus.COMPLETED &&
        !existingTransaction.processedAt
      ) {
        updateData.processedAt = new Date();
      }

      if (
        status === TransactionStatus.FAILED &&
        !existingTransaction.failedAt
      ) {
        updateData.failedAt = new Date();
        if (failureReason) updateData.failureReason = failureReason;
      }

      if (
        status === TransactionStatus.REFUNDED &&
        !existingTransaction.refundedAt
      ) {
        updateData.refundedAt = new Date();
        if (refundReason) updateData.refundReason = refundReason;
      }

      const transaction = await prisma.transaction.update({
        where: { id },
        data: updateData,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update financial details for the company
      await this.updateCompanyFinancialDetails(transaction.companyId);

      logger.info(`Transaction status updated: ${id} -> ${status}`);
      return transaction;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error("Error updating transaction status:", error);
      throw new AppError("Failed to update transaction status", 500);
    }
  }

  /**
   * Process refund for transaction
   */
  async processRefund(id: string, refundAmount: number, refundReason?: string) {
    try {
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id },
      });

      if (!existingTransaction) {
        throw new AppError("Transaction not found", 404);
      }

      if (existingTransaction.status !== TransactionStatus.COMPLETED) {
        throw new ValidationError(
          "Only completed transactions can be refunded"
        );
      }

      if (refundAmount > Number(existingTransaction.amount)) {
        throw new ValidationError(
          "Refund amount cannot exceed transaction amount"
        );
      }

      const updateData: any = {
        status:
          refundAmount === Number(existingTransaction.amount)
            ? TransactionStatus.REFUNDED
            : TransactionStatus.PARTIALLY_REFUNDED,
        refundedAt: new Date(),
        refundAmount,
      };

      if (refundReason) updateData.refundReason = refundReason;

      const transaction = await prisma.transaction.update({
        where: { id },
        data: updateData,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update financial details for the company
      await this.updateCompanyFinancialDetails(transaction.companyId);

      logger.info(
        `Refund processed for transaction: ${id}, amount: ${refundAmount}`
      );
      return transaction;
    } catch (error) {
      if (error instanceof AppError || error instanceof ValidationError) {
        throw error;
      }
      logger.error("Error processing refund:", error);
      throw new AppError("Failed to process refund", 500);
    }
  }

  /**
   * Get transaction analytics
   */
  async getTransactionAnalytics(filters: {
    dateFrom?: Date;
    dateTo?: Date;
    companyId?: string;
  }): Promise<TransactionAnalytics> {
    try {
      const where: any = {};

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }

      if (filters.companyId) {
        where.companyId = filters.companyId;
      }

      // Get all transactions for analytics
      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const totalTransactions = transactions.length;
      const totalRevenue = transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      const successfulTransactions = transactions.filter(
        (t) => t.status === TransactionStatus.COMPLETED
      ).length;

      const failedTransactions = transactions.filter(
        (t) => t.status === TransactionStatus.FAILED
      ).length;

      const refundedTransactions = transactions.filter(
        (t) =>
          t.status === TransactionStatus.REFUNDED ||
          t.status === TransactionStatus.PARTIALLY_REFUNDED
      ).length;

      const averageTransactionValue =
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Revenue by status
      const revenueByStatus = Object.values(TransactionStatus).map((status) => {
        const statusTransactions = transactions.filter(
          (t) => t.status === status
        );
        const count = statusTransactions.length;
        const amount = statusTransactions.reduce(
          (sum, t) => sum + Number(t.amount),
          0
        );
        const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;

        return {
          status,
          count,
          amount,
          percentage: Math.round(percentage * 100) / 100,
        };
      });

      // Revenue by type
      const revenueByType = Object.values(TransactionType).map((type) => {
        const typeTransactions = transactions.filter(
          (t) => t.transactionType === type
        );
        const count = typeTransactions.length;
        const amount = typeTransactions.reduce(
          (sum, t) => sum + Number(t.amount),
          0
        );
        const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;

        return {
          type,
          count,
          amount,
          percentage: Math.round(percentage * 100) / 100,
        };
      });

      // Revenue by month (last 12 months)
      const revenueByMonth = this.calculateMonthlyRevenue(transactions);

      // Top companies
      const companyStats = new Map();
      transactions.forEach((transaction) => {
        const companyId = transaction.companyId;
        const companyName = transaction.company.name;
        const amount = Number(transaction.amount);

        if (!companyStats.has(companyId)) {
          companyStats.set(companyId, {
            companyId,
            companyName,
            transactionCount: 0,
            totalAmount: 0,
          });
        }

        const stats = companyStats.get(companyId);
        stats.transactionCount++;
        stats.totalAmount += amount;
      });

      const topCompanies = Array.from(companyStats.values())
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

      return {
        totalTransactions,
        totalRevenue,
        successfulTransactions,
        failedTransactions,
        refundedTransactions,
        averageTransactionValue,
        revenueByStatus,
        revenueByType,
        revenueByMonth,
        topCompanies,
      };
    } catch (error) {
      logger.error("Error getting transaction analytics:", error);
      throw new AppError("Failed to get transaction analytics", 500);
    }
  }

  /**
   * Get transactions by company
   */
  async getTransactionsByCompany(
    companyId: string,
    filters: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
    }
  ) {
    const { page = 1, limit = 20, status, type } = filters;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.transactionType = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          subscriptionPlan: {
            select: {
              id: true,
              name: true,
              priceMonthly: true,
              priceYearly: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update company financial details
   */
  private async updateCompanyFinancialDetails(companyId: string) {
    try {
      // Get all transactions for the company
      const transactions = await prisma.transaction.findMany({
        where: { companyId },
      });

      const totalRevenue = transactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );
      const totalTransactions = transactions.length;
      const successfulTransactions = transactions.filter(
        (t) => t.status === TransactionStatus.COMPLETED
      ).length;
      const failedTransactions = transactions.filter(
        (t) => t.status === TransactionStatus.FAILED
      ).length;
      const refundedTransactions = transactions.filter(
        (t) =>
          t.status === TransactionStatus.REFUNDED ||
          t.status === TransactionStatus.PARTIALLY_REFUNDED
      ).length;

      const averageTransactionValue =
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Calculate MRR and ARR (simplified)
      const monthlyTransactions = transactions.filter(
        (t) =>
          t.status === TransactionStatus.COMPLETED &&
          t.transactionType === TransactionType.SUBSCRIPTION &&
          t.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      const monthlyRecurringRevenue = monthlyTransactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      const annualRecurringRevenue = monthlyRecurringRevenue * 12;

      // Upsert financial details
      await prisma.financialDetails.upsert({
        where: { companyId },
        update: {
          totalRevenue,
          totalTransactions,
          successfulTransactions,
          failedTransactions,
          refundedTransactions,
          averageTransactionValue,
          monthlyRecurringRevenue,
          annualRecurringRevenue,
          lastUpdatedAt: new Date(),
        },
        create: {
          companyId,
          totalRevenue,
          totalTransactions,
          successfulTransactions,
          failedTransactions,
          refundedTransactions,
          averageTransactionValue,
          monthlyRecurringRevenue,
          annualRecurringRevenue,
        },
      });
    } catch (error) {
      logger.error("Error updating company financial details:", error);
      // Don't throw error as this is a background operation
    }
  }

  /**
   * Calculate monthly revenue for the last 12 months
   */
  private calculateMonthlyRevenue(transactions: any[]) {
    const monthlyData = new Map();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthlyData.set(monthKey, {
        month: monthKey,
        count: 0,
        amount: 0,
      });
    }

    // Process transactions
    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (monthlyData.has(monthKey)) {
        const data = monthlyData.get(monthKey);
        data.count++;
        data.amount += Number(transaction.amount);
      }
    });

    return Array.from(monthlyData.values());
  }
}
