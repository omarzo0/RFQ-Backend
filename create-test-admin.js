const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function createTestAdmin() {
  try {
    console.log("Creating test admin user...");

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: "omarkhaled202080@gmail.com" },
    });

    if (existingAdmin) {
      console.log("Admin already exists with this email");
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash("admin123", 12);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: "omarkhaled202080@gmail.com",
        passwordHash,
        firstName: "Test",
        lastName: "Admin",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });

    console.log("✅ Test admin created successfully:", admin.email);
    console.log("Password: admin123");
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();
