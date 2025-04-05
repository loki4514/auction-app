import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Fetch all user subscriptions
    const users = await prisma.user_subscription.findMany();
    console.log("All Users:", users);

    // Fetch a specific user subscription with its related plan
    const subscriptions = await prisma.user_subscription.findMany({
        where: {
            user_id: "3c9a09d8-3215-418a-a8ca-66c291c12d87", // Correct placement
        },
        include: {
            plan: true, // Include related plan details
        },
    });
    
    console.log("Filtered Subscriptions:", subscriptions);
}

main()
    .catch((e) => console.error("Error:", e))
    .finally(async () => {
        await prisma.$disconnect();
    });
