export const enforceTenantIsolation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthenticatedRequest;

  // Skip tenant isolation for platform admins
  if (authReq.user?.userType === "admin") {
    return next();
  }

  // Ensure company user has companyId
  if (!authReq.user?.companyId) {
    return next(new AuthorizationError("Company context required"));
  }

  // Add tenant context to query parameters for GET requests
  if (req.method === "GET") {
    req.query.companyId = authReq.user.companyId;
  }

  // Add tenant context to request body for POST/PUT requests
  if (
    (req.method === "POST" || req.method === "PUT") &&
    req.body &&
    typeof req.body === "object"
  ) {
    req.body.companyId = authReq.user.companyId;
  }

  next();
};

/**
 * Validate that a resource belongs to the user's company
 */
export const validateTenantAccess = (
  resourceCompanyId: string,
  userCompanyId?: string
): void => {
  if (!userCompanyId) {
    throw new AuthorizationError("Company context required");
  }

  if (resourceCompanyId !== userCompanyId) {
    throw new AuthorizationError("Access denied to resource");
  }
};
