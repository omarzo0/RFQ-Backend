import { Request, Response } from "express";
import { AdminTransactionService } from "../services/AdminTransactionService";
import { successResponse, errorResponse } from "../../utils/response";
import { AppError } from "../../utils/errors";
import logger from "../../utils/logger";

export class AdminTransactionController {
  private adminTransactionService: AdminTransactionService;

  constructor() {
    this.adminTransactionService = new AdminTransactionService();
  }

  /**
   * Get all transactions with filtering and pagination
   * GET /api/v1/admin/transactions
   */
  getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        companyId,
        dateFrom,
        dateTo,
        search,
      } = req.query;

      const filters = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        type: type as string,
        companyId: companyId as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        search: search as string,
      };

      const transactionsData =
        await this.adminTransactionService.getTransactions(filters);

      successResponse(
        res,
        transactionsData,
        "Transactions retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get transactions error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get transaction by ID
   * GET /api/v1/admin/transactions/:id
   */
  getTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        errorResponse(res, "Transaction ID is required", 400);
        return;
      }

      const transaction = await this.adminTransactionService.getTransactionById(
        id
      );

      successResponse(
        res,
        transaction,
        "Transaction retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get transaction error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Create new transaction
   * POST /api/v1/admin/transactions
   */
  createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const transactionData = req.body;

      // Validate required fields
      if (!transactionData.companyId || !transactionData.amount) {
        errorResponse(res, "Company ID and amount are required", 400);
        return;
      }

      const transaction = await this.adminTransactionService.createTransaction(
        transactionData
      );

      successResponse(
        res,
        transaction,
        "Transaction created successfully",
        201
      );
    } catch (error) {
      logger.error("Create transaction error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Update transaction
   * PUT /api/v1/admin/transactions/:id
   */
  updateTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        errorResponse(res, "Transaction ID is required", 400);
        return;
      }

      const transaction = await this.adminTransactionService.updateTransaction(
        id,
        updateData
      );

      successResponse(
        res,
        transaction,
        "Transaction updated successfully",
        200
      );
    } catch (error) {
      logger.error("Update transaction error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Delete transaction
   * DELETE /api/v1/admin/transactions/:id
   */
  deleteTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        errorResponse(res, "Transaction ID is required", 400);
        return;
      }

      await this.adminTransactionService.deleteTransaction(id);

      successResponse(res, null, "Transaction deleted successfully", 200);
    } catch (error) {
      logger.error("Delete transaction error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Update transaction status
   * PATCH /api/v1/admin/transactions/:id/status
   */
  updateTransactionStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, failureReason, refundReason } = req.body;

      if (!id) {
        errorResponse(res, "Transaction ID is required", 400);
        return;
      }

      if (!status) {
        errorResponse(res, "Status is required", 400);
        return;
      }

      const transaction =
        await this.adminTransactionService.updateTransactionStatus(
          id,
          status,
          failureReason,
          refundReason
        );

      successResponse(
        res,
        transaction,
        "Transaction status updated successfully",
        200
      );
    } catch (error) {
      logger.error("Update transaction status error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Process refund for transaction
   * POST /api/v1/admin/transactions/:id/refund
   */
  processRefund = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { refundAmount, refundReason } = req.body;

      if (!id) {
        errorResponse(res, "Transaction ID is required", 400);
        return;
      }

      if (!refundAmount) {
        errorResponse(res, "Refund amount is required", 400);
        return;
      }

      const transaction = await this.adminTransactionService.processRefund(
        id,
        refundAmount,
        refundReason
      );

      successResponse(res, transaction, "Refund processed successfully", 200);
    } catch (error) {
      logger.error("Process refund error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get transaction analytics
   * GET /api/v1/admin/transactions/analytics
   */
  getTransactionAnalytics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { dateFrom, dateTo, companyId } = req.query;

      const analytics =
        await this.adminTransactionService.getTransactionAnalytics({
          dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
          dateTo: dateTo ? new Date(dateTo as string) : undefined,
          companyId: companyId as string,
        });

      successResponse(
        res,
        analytics,
        "Transaction analytics retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get transaction analytics error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };

  /**
   * Get transactions by company
   * GET /api/v1/admin/transactions/company/:companyId
   */
  getTransactionsByCompany = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { companyId } = req.params;
      const { page = 1, limit = 20, status, type } = req.query;

      if (!companyId) {
        errorResponse(res, "Company ID is required", 400);
        return;
      }

      const transactionsData =
        await this.adminTransactionService.getTransactionsByCompany(companyId, {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          status: status as string,
          type: type as string,
        });

      successResponse(
        res,
        transactionsData,
        "Company transactions retrieved successfully",
        200
      );
    } catch (error) {
      logger.error("Get company transactions error:", error);

      if (error instanceof AppError) {
        errorResponse(res, error.message, error.statusCode);
      } else {
        errorResponse(res, "Internal server error", 500);
      }
    }
  };
}
