import { prisma } from "../../app";
import { PasswordUtils } from "../../utils/password";
import { ValidationError } from "../../utils/errors";

export class UserService {
  /**
   * Get users with pagination and filtering
   */
  async getUsers(
    companyId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      role?: string;
      status?: string;
    }
  ) {
    const { page, limit, search, role, status } = options;
    const skip = (page - 1) * limit;

    const where: any = { companyId };

    if (role) {
      where.role = role;
    }

    if (status) {
      where.isActive = status === "active";
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.companyUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      prisma.companyUser.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string, companyId: string) {
    const user = await prisma.companyUser.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: { name: true, subscriptionPlan: true },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Create new user
   */
  async createUser(companyId: string, userData: any) {
    // Validate password strength
    const passwordValidation = PasswordUtils.validate(userData.password);
    if (!passwordValidation.isValid) {
      throw new ValidationError("Invalid password", passwordValidation.errors);
    }

    // Check if email already exists
    const existingUser = await prisma.companyUser.findFirst({
      where: { email: userData.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ValidationError("Email already exists");
    }

    // Validate role
    const validRoles = ["ADMIN", "MANAGER", "EMPLOYEE"];
    if (!validRoles.includes(userData.role)) {
      throw new ValidationError("Invalid role");
    }

    // Hash password
    const passwordHash = await PasswordUtils.hash(userData.password);

    const user = await prisma.companyUser.create({
      data: {
        companyId,
        email: userData.email.toLowerCase(),
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: userData.isActive !== false, // Default to true
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async updateUser(id: string, companyId: string, userData: any) {
    // Check if email is being changed and if it already exists
    if (userData.email) {
      const existingUser = await prisma.companyUser.findFirst({
        where: {
          email: userData.email.toLowerCase(),
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new ValidationError("Email already exists");
      }
    }

    // Validate role if being changed
    if (userData.role) {
      const validRoles = ["ADMIN", "MANAGER", "EMPLOYEE"];
      if (!validRoles.includes(userData.role)) {
        throw new ValidationError("Invalid role");
      }
    }

    const user = await prisma.companyUser.update({
      where: { id, companyId },
      data: {
        email: userData.email?.toLowerCase(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(id: string, companyId: string) {
    // Check if user is the last admin
    const user = await prisma.companyUser.findFirst({
      where: { id, companyId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "ADMIN") {
      const adminCount = await prisma.companyUser.count({
        where: { companyId, role: "ADMIN", isActive: true },
      });

      if (adminCount <= 1) {
        throw new ValidationError("Cannot delete the last admin user");
      }
    }

    await prisma.companyUser.delete({
      where: { id, companyId },
    });

    return true;
  }

  /**
   * Update user status
   */
  async updateUserStatus(id: string, companyId: string, status: boolean) {
    // Check if user is the last admin
    if (!status) {
      const user = await prisma.companyUser.findFirst({
        where: { id, companyId },
      });

      if (user?.role === "ADMIN") {
        const adminCount = await prisma.companyUser.count({
          where: { companyId, role: "ADMIN", isActive: true },
        });

        if (adminCount <= 1) {
          throw new ValidationError("Cannot deactivate the last admin user");
        }
      }
    }

    const user = await prisma.companyUser.update({
      where: { id, companyId },
      data: { isActive: status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    return user;
  }

  /**
   * Update user role
   */
  async updateUserRole(id: string, companyId: string, role: string) {
    const validRoles = ["ADMIN", "MANAGER", "EMPLOYEE"];
    if (!validRoles.includes(role)) {
      throw new ValidationError("Invalid role");
    }

    // Check if user is the last admin and trying to change role
    const user = await prisma.companyUser.findFirst({
      where: { id, companyId },
    });

    if (user?.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.companyUser.count({
        where: { companyId, role: "ADMIN", isActive: true },
      });

      if (adminCount <= 1) {
        throw new ValidationError("Cannot change role of the last admin user");
      }
    }

    const updatedUser = await prisma.companyUser.update({
      where: { id, companyId },
      data: { role: role as any },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    return updatedUser;
  }

  /**
   * Reset user password
   */
  async resetUserPassword(id: string, companyId: string, newPassword: string) {
    // Validate password strength
    const passwordValidation = PasswordUtils.validate(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError("Invalid password", passwordValidation.errors);
    }

    // Hash new password
    const passwordHash = await PasswordUtils.hash(newPassword);

    await prisma.companyUser.update({
      where: { id, companyId },
      data: { passwordHash },
    });

    return true;
  }

  /**
   * Get available user roles
   */
  async getUserRoles() {
    return [
      {
        value: "ADMIN",
        label: "Admin",
        description: "Full company access, user management, billing",
      },
      {
        value: "MANAGER",
        label: "Manager",
        description: "RFQ management, analytics, team oversight",
      },
      {
        value: "EMPLOYEE",
        label: "Employee",
        description: "RFQ operations, contact management (limited access)",
      },
    ];
  }

  /**
   * Get user permissions based on role
   */
  async getUserPermissions(userId: string) {
    const user = await prisma.companyUser.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const permissions = {
      ADMIN: {
        users: ["create", "read", "update", "delete"],
        rfqs: ["create", "read", "update", "delete"],
        contacts: ["create", "read", "update", "delete"],
        analytics: ["read"],
        company: ["read", "update"],
        billing: ["read", "update"],
        settings: ["read", "update"],
      },
      MANAGER: {
        users: ["read"],
        rfqs: ["create", "read", "update", "delete"],
        contacts: ["create", "read", "update", "delete"],
        analytics: ["read"],
        company: ["read"],
        billing: ["read"],
        settings: ["read"],
      },
      EMPLOYEE: {
        users: [],
        rfqs: ["create", "read", "update"],
        contacts: ["create", "read", "update"],
        analytics: ["read"],
        company: ["read"],
        billing: [],
        settings: ["read"],
      },
    };

    return (
      permissions[user.role as keyof typeof permissions] || permissions.EMPLOYEE
    );
  }
}
