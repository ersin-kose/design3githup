// Kimlik doğrulama servisi
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Gerçek bir API olmadığı için localStorage'da saklanacak kullanıcı verileri
const USERS_KEY = 'tattooai_users';
const AUTH_KEY = 'tattooai_auth';

// Başlangıç state'i
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

// Benzersiz ID oluşturma fonksiyonu
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Simüle edilmiş JWT token
const generateToken = (userId: string): string => {
  return `simulated_jwt_token_${userId}_${Date.now()}`;
};

class AuthService {
  // Kullanıcıları getir
  async getUsers(): Promise<User[]> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Kullanıcılar getirilirken hata oluştu:', error);
      return [];
    }
  }

  // Kullanıcıları güncelle
  private async updateUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Kullanıcılar güncellenirken hata oluştu:', error);
    }
  }

  // Auth state'ini güncelle
  private async updateAuthState(state: AuthState): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Auth state güncellenirken hata oluştu:', error);
    }
  }

  // Auth state'ini getir
  async getAuthState(): Promise<AuthState> {
    try {
      const authJson = await AsyncStorage.getItem(AUTH_KEY);
      return authJson ? JSON.parse(authJson) : initialState;
    } catch (error) {
      console.error('Auth state getirilirken hata oluştu:', error);
      return initialState;
    }
  }

  // Kayıt ol
  async register(email: string, username: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = await this.getUsers();
      
      // E-posta veya kullanıcı adı kontrol et
      const existingUser = users.find(
        (user) => user.email === email || user.username === username
      );

      if (existingUser) {
        if (existingUser.email === email) {
          return { success: false, message: 'Bu e-posta adresi zaten kullanılıyor.' };
        } else {
          return { success: false, message: 'Bu kullanıcı adı zaten kullanılıyor.' };
        }
      }

      // Yeni kullanıcı oluştur
      const newUser: User = {
        id: generateId(),
        email,
        username,
        createdAt: new Date().toISOString(),
      };

      // Kullanıcılar arasına ekle (gerçek bir uygulamada parola hash'lenecek)
      const updatedUsers = [...users, { ...newUser, password }];
      await this.updateUsers(updatedUsers);

      // Token oluştur ve auth state'i güncelle
      const token = generateToken(newUser.id);
      const authState = {
        isAuthenticated: true,
        user: newUser,
        token,
      };
      
      await this.updateAuthState(authState);

      return { success: true, message: 'Kayıt başarılı!', user: newUser };
    } catch (error) {
      console.error('Kayıt olurken hata oluştu:', error);
      return { success: false, message: 'Kayıt işlemi sırasında bir hata oluştu.' };
    }
  }

  // Giriş yap
  async login(emailOrUsername: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = await this.getUsers();
      
      // E-posta veya kullanıcı adına göre kullanıcı bul
      const user = users.find(
        (u: any) => (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
      );

      if (!user) {
        return { success: false, message: 'Geçersiz kullanıcı bilgileri.' };
      }

      // Parolayı kullanıcı objesinden çıkar
      const { password: _, ...safeUser } = user;

      // Token oluştur ve auth state'i güncelle
      const token = generateToken(user.id);
      const authState = {
        isAuthenticated: true,
        user: safeUser,
        token,
      };
      
      await this.updateAuthState(authState);

      return { success: true, message: 'Giriş başarılı!', user: safeUser };
    } catch (error) {
      console.error('Giriş yaparken hata oluştu:', error);
      return { success: false, message: 'Giriş işlemi sırasında bir hata oluştu.' };
    }
  }

  // Kullanıcı bilgilerini güncelle
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const users = await this.getUsers();
      const authState = await this.getAuthState();
      
      // Kullanıcıyı bul
      const userIndex = users.findIndex((u) => u.id === userId);
      
      if (userIndex === -1) {
        return { success: false, message: 'Kullanıcı bulunamadı.' };
      }

      // Güncellemeleri kontrol et (e-posta veya kullanıcı adı zaten kullanılıyor mu)
      if (updates.email || updates.username) {
        const conflictUser = users.find(
          (u) => u.id !== userId && (
            (updates.email && u.email === updates.email) || 
            (updates.username && u.username === updates.username)
          )
        );

        if (conflictUser) {
          if (updates.email && conflictUser.email === updates.email) {
            return { success: false, message: 'Bu e-posta adresi zaten kullanılıyor.' };
          } else {
            return { success: false, message: 'Bu kullanıcı adı zaten kullanılıyor.' };
          }
        }
      }

      // Kullanıcıyı güncelle
      const updatedUser = { ...users[userIndex], ...updates };
      const updatedUsers = [...users];
      updatedUsers[userIndex] = updatedUser;
      
      await this.updateUsers(updatedUsers);

      // Oturum açmış kullanıcı güncelleniyorsa auth state'i de güncelle
      if (authState.isAuthenticated && authState.user && authState.user.id === userId) {
        const { password: _, ...safeUser } = updatedUser;
        
        const updatedAuthState = {
          ...authState,
          user: safeUser,
        };
        
        await this.updateAuthState(updatedAuthState);
      }

      const { password: _, ...safeUser } = updatedUser;
      return { success: true, message: 'Profil güncellendi!', user: safeUser };
    } catch (error) {
      console.error('Kullanıcı bilgileri güncellenirken hata oluştu:', error);
      return { success: false, message: 'Kullanıcı bilgileri güncellenirken bir hata oluştu.' };
    }
  }

  // Çıkış yap
  async logout(): Promise<void> {
    try {
      await this.updateAuthState(initialState);
    } catch (error) {
      console.error('Çıkış yaparken hata oluştu:', error);
    }
  }
}

export default new AuthService();