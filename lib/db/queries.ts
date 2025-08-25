import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  type Message,
  message,
  vote,
  astrologicalData,
  district,
  payment,
  subscription
} from './schema';
import { ArtifactKind } from '@/components/artifact';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser(email: string, password: string, name: string, gender: "male" | "female" | "other", dob: string, time: string, latitude: string, longitude: string, timezone: string, place: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    const [newUser] = await db
      .insert(user)
      .values({ email, password: hash, name, gender, dob, time, latitude, longitude, timezone, place })
      .returning({ id: user.id }); // Returns an array, so destructure the first element

    return newUser; // Ensure we return the user object containing `id`
  } catch (error) {
    console.error('Failed to create user in database', error);
    throw error;
  }
}
export async function getUserByResetToken(token: string) {
  try {
    const [selectedUser] = await db
      .select()
      .from(user)
      .where(eq(user.resetToken, token));

    return selectedUser;
  } catch (error) {
    console.error('Failed to get user by reset token from database', error);
    throw error;
  }
}
export async function getUserById(userId: string) {
  try {
    const [selectedUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    return selectedUser;
  } catch (error) {
    console.error('Failed to get user by id from database', error);
    throw error;
  }
}

export async function updateUserPassword(
  userId: string,
  newPassword: string
) {
  try {
    // Hash the new password
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(newPassword, salt);

    // Update password in the database
    const [updatedUser] = await db
      .update(user)
      .set({
        password: hashedPassword
      })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        email: user.email,
        password: user.password,
      });

    return updatedUser;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw new Error("Failed to reset password");
  }
}

export async function resetTokenUpdate(
  userId: string,
  resetToken: string | null,
  resetTokenExpiry: Date | null,
) {
  try {

    // Update resetToken and resetTokenExpiry in the database
    const [updatedUser] = await db
      .update(user)
      .set({
        resetToken,
        resetTokenExpiry: resetTokenExpiry,  // This will be a valid timestamp now
      })
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        resetToken: user.resetToken,
        resetTokenExpiry: user.resetTokenExpiry,
      });
    return updatedUser;
  } catch (error) {
    console.error("Error updating reset token:", error);
    throw new Error("Failed to update reset token");
  }
}


export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

export async function getAstroDataByUserIdAndType({ userId, type }: { userId: string; type: string }) {
  try {
    const [selectedData] = await db
      .select()
      .from(astrologicalData)
      .where(and(eq(astrologicalData.userId, userId), eq(astrologicalData.type, type)))
      .orderBy(desc(astrologicalData.createdAt));
    return selectedData;
  } catch (error) {
    console.error('Failed to get Astrological Data by user id and type from database', error);
    throw error;
  }
}

export const storeAstrologicalData = async (userId: string, type: string, content: any) => {
  try {
    await db.insert(astrologicalData).values({
      userId,
      type,
      content: content, // Ensure full JSON is stored
      createdAt: new Date(),
    });

    console.log('Astrological data stored successfully:', content);
  } catch (error) {
    console.error('Failed to store astrological data:', error);
    throw error;
  }
};
export async function getAllDistricts() {
  try {
    return await db.select().from(district).orderBy(asc(district.districtName));
  } catch (error) {
    console.error('Failed to get all districts from database', error);
    throw error;
  }
}

export async function getDistrictById({ id }: { id: string }) {
  try {
    const [selectedDistrict] = await db
      .select()
      .from(district)
      .where(eq(district.id, id));

    return selectedDistrict;
  } catch (error) {
    console.error('Failed to get district by id from database', error);
    throw error;
  }
}

export async function isUserOverDailyLimit(userId: string): Promise<boolean> {
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId));

  if (!existingUser) throw new Error('User not found');

  const now = new Date();
  const last = existingUser.lastMessageAt ?? new Date(0);

  const hoursSinceLastMessage = (now.getTime() - new Date(last).getTime()) / (1000 * 60 * 60);
  const isResetTime = hoursSinceLastMessage >= 24;
  const dailyCount = existingUser.dailyMessageCount ?? 0;

  return !existingUser.isPremium && dailyCount >= 5 && !isResetTime;
}

export async function updateUserMessageStats(userId: string): Promise<void> {
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId));

  if (!existingUser) throw new Error('User not found');

  const now = new Date();
  const last = existingUser.lastMessageAt ?? new Date(0);
  const hoursSinceLastMessage = (now.getTime() - new Date(last).getTime()) / (1000 * 60 * 60);
  const isResetTime = hoursSinceLastMessage >= 24;
  const dailyCount = existingUser.dailyMessageCount ?? 0;

  await db
    .update(user)
    .set({
      dailyMessageCount: isResetTime ? 1 : dailyCount + 1,
      lastMessageAt: now,
    })
    .where(eq(user.id, userId));
}

export async function storeSubscriptionInfo(
  userId: string,
  subscriptionDetails: { plan: "weekly" | "monthly" | "yearly"; status?: "active" | "canceled" }
): Promise<void> {
  try {
    const expiresAt = new Date();
    if (subscriptionDetails.plan === "weekly") {
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else if (subscriptionDetails.plan === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (subscriptionDetails.plan === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      throw new Error("Invalid plan type");
    }

    await db.insert(subscription).values({
      userId,
      plan: subscriptionDetails.plan,
      status: subscriptionDetails.status || "active",
      createdAt: new Date(),
      expiresAt,
    });
  } catch (error) {
    console.error("Failed to store subscription information:", error);
    throw error;
  }
}

export async function storePaymentInfo(userId: string, paymentDetails: any): Promise<void> {
  try {
    await db.insert(payment).values({
      userId,
      ...paymentDetails,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to store payment information:", error);
    throw error;
  }
}

export async function upgradeToPremium(userId: string): Promise<{ isPremium: boolean }> {
  try {
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    if (!existingUser) throw new Error("User not found");

    await db
      .update(user)
      .set({ isPremium: true })
      .where(eq(user.id, userId));

    return { isPremium: true };
  } catch (error) {
    console.error("Error upgrading user to premium:", error);
    throw error;
  }
}
export async function getPaymentHistoryByUserId(userId: string) {
  try {
    return await db
      .select()
      .from(payment)
      .where(eq(payment.userId, userId))
      .orderBy(desc(payment.createdAt));
  } catch (error) {
    console.error('Failed to get payment history by user id from database', error);
    throw error;
  }
}
