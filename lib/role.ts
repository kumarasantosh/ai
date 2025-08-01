import { clerkClient } from "@clerk/nextjs/server";

export async function assignDefaultRole(userId: string) {
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: {
      role: "student",
    },
  });
}
