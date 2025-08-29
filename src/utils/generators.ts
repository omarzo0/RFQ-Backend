export const generateRFQNumber = async (companyId: string): Promise<string> => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");

  // Get company's RFQ count for this month
  const startOfMonth = new Date(year, today.getMonth(), 1);
  const endOfMonth = new Date(year, today.getMonth() + 1, 0);

  const count = await prisma.rfq.count({
    where: {
      companyId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  const sequence = String(count + 1).padStart(4, "0");
  return `RFQ-${year}${month}-${sequence}`;
};
