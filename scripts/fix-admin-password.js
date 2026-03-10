const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'omarkhaled202080@gmail.com';
  const password = '564712Omar@@!!##';
  const hash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.update({
    where: { email },
    data: { passwordHash: hash },
  });

  // Verify
  const isValid = await bcrypt.compare(password, admin.passwordHash);
  console.log('Password updated for:', admin.email);
  console.log('Password verify test:', isValid ? 'PASS ✅' : 'FAIL ❌');

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
