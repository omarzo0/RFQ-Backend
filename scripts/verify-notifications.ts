import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing notification audience targeting...');

    try {
        // Check if we can create a notification with audience
        const notification = await prisma.notification.create({
            data: {
                title: 'Test Admin Notification',
                message: 'This is a test notification for admins only.',
                audience: 'ADMIN_ONLY',
                createdBy: 'some-admin-id', // This might fail if the ID doesn't exist, but we just want to see if the field is accepted
            },
        }).catch(e => {
            if (e.code === 'P2003') {
                console.log('Successfully validated that "audience" field exists in Prisma client (ForeignKey constraint failed as expected).');
            } else {
                console.error('Error creating notification:', e);
            }
        });

        console.log('Verification finished.');
    } finally {
        await prisma.$disconnect();
    }
}

main();
