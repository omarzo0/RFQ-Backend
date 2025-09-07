import { AdminManagementService } from "../services/AdminManagementService";
import { AdminRole } from "../types/auth";

/**
 * Test script for admin management functionality
 * Run with: npx ts-node src/admin/scripts/testAdminManagement.ts
 */
async function testAdminManagement() {
  const adminManagementService = new AdminManagementService();

  try {
    console.log("🧪 Testing Admin Management System...\n");

    // Test 1: Create a new admin
    console.log("1. Creating a new admin...");
    const newAdmin = await adminManagementService.createAdmin({
      email: "test-admin@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "Admin",
      role: "ADMIN" as AdminRole,
      isActive: true,
    });
    console.log("✅ Admin created:", newAdmin.email);

    // Test 2: Get all admins
    console.log("\n2. Getting all admins...");
    const admins = await adminManagementService.getAdmins({
      page: 1,
      limit: 10,
    });
    console.log("✅ Found", admins.total, "admins");

    // Test 3: Get admin by ID
    console.log("\n3. Getting admin by ID...");
    const adminById = await adminManagementService.getAdminById(newAdmin.id);
    console.log("✅ Admin retrieved:", adminById.email);

    // Test 4: Update admin
    console.log("\n4. Updating admin...");
    const updatedAdmin = await adminManagementService.updateAdmin(newAdmin.id, {
      firstName: "Updated",
      lastName: "Admin",
    });
    console.log(
      "✅ Admin updated:",
      updatedAdmin.firstName,
      updatedAdmin.lastName
    );

    // Test 5: Get admin statistics
    console.log("\n5. Getting admin statistics...");
    const stats = await adminManagementService.getAdminStatistics();
    console.log("✅ Admin statistics:", stats);

    // Test 6: Change admin password
    console.log("\n6. Changing admin password...");
    await adminManagementService.changeAdminPassword(
      newAdmin.id,
      "newpassword123"
    );
    console.log("✅ Password changed successfully");

    // Test 7: Deactivate admin (soft delete)
    console.log("\n7. Deactivating admin...");
    const deactivatedAdmin = await adminManagementService.deleteAdmin(
      newAdmin.id
    );
    console.log("✅ Admin deactivated:", deactivatedAdmin.isActive);

    // Test 8: Restore admin
    console.log("\n8. Restoring admin...");
    const restoredAdmin = await adminManagementService.restoreAdmin(
      newAdmin.id
    );
    console.log("✅ Admin restored:", restoredAdmin.isActive);

    console.log("\n🎉 All admin management tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testAdminManagement();
