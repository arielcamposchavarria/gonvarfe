import type { AuthService } from "@/domain/ports/auth-service";
import type { UserRepository } from "@/domain/ports/user-repository";
import { MOCK_CREDENTIALS } from "../data/credentials";

export function createMockAuthService(userRepository: UserRepository): AuthService {
  return {
    async authenticate(username, password) {
      const user = await userRepository.findByUsername(username);
      if (!user) return null;
      if (MOCK_CREDENTIALS[user.id] !== password) return null;
      return user;
    },
    async registerCredentials(userId, password) {
      MOCK_CREDENTIALS[userId] = password;
    },
  };
}
