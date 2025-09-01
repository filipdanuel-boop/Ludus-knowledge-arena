import { User, Category, Language } from '../types';
import { INITIAL_COINS } from '../constants';

const USERS_DB_KEY = 'ludus_users';
const LOGGED_IN_USER_KEY = 'ludus_logged_in_email';

// Helper to get all users
const getAllUsers = (): Record<string, any> => {
    return JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
};

// Helper to save all users
const saveAllUsers = (users: Record<string, any>) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

const getInitialStats = () => {
    const categoryStats = Object.values(Category).reduce((acc, cat) => {
        acc[cat] = { totalCorrect: 0, totalAnswered: 0 };
        return acc;
    }, {} as Record<Category, { totalCorrect: 0, totalAnswered: 0 }>);

    return {
        totalCorrect: 0,
        totalAnswered: 0,
        answeredQuestions: [],
        categoryStats,
    };
};

export const registerUser = (email: string, password: string, language: Language): { success: boolean, message: string, user?: User } => {
    const users = getAllUsers();
    const lowerEmail = email.toLowerCase();
    
    if (users[lowerEmail]) {
        return { success: false, message: "errorUserExists" };
    }

    const today = new Date().toISOString().split('T')[0];
    
    const newUser: User = {
        email: lowerEmail,
        luduCoins: INITIAL_COINS,
        language: language,
        xp: 0,
        stats: getInitialStats(),
        lastLoginDate: today,
        loginStreak: 1,
    };

    users[lowerEmail] = { password, ...newUser };
    saveAllUsers(users);
    
    return { success: true, message: "Registrace úspěšná!", user: newUser };
};

export const loginUser = (email: string, password: string): { success: boolean, message: string, user?: User } => {
    const users = getAllUsers();
    const lowerEmail = email.toLowerCase();
    const userData = users[lowerEmail];

    if (!userData) {
        return { success: false, message: "errorUserNotFound" };
    }
    if (userData.password !== password) { // In a real app, compare hashed passwords
        return { success: false, message: "errorIncorrectPassword" };
    }

    // Omit password from the user object returned to the app
    const { password: _, ...userToReturn } = userData;

    return { success: true, message: "Přihlášení úspěšné.", user: userToReturn };
};

export const saveUserData = (user: User) => {
    const users = getAllUsers();
    const lowerEmail = user.email.toLowerCase();
    const currentUserData = users[lowerEmail] || {};
    
    users[lowerEmail] = { ...currentUserData, ...user };
    saveAllUsers(users);
};

export const loadUserData = (email: string): User | null => {
    const users = getAllUsers();
    const lowerEmail = email.toLowerCase();
    const userData = users[lowerEmail];
    
    if (!userData) return null;

    const { password, ...userToReturn } = userData;
    return userToReturn;
};

export const saveLoggedInUser = (email: string) => {
    localStorage.setItem(LOGGED_IN_USER_KEY, email.toLowerCase());
};

export const getLoggedInUser = (): User | null => {
    const email = localStorage.getItem(LOGGED_IN_USER_KEY);
    if (!email) return null;
    return loadUserData(email);
};

export const logoutUser = () => {
    localStorage.removeItem(LOGGED_IN_USER_KEY);
};

export const addCoins = (email: string, amount: number): User | null => {
    const user = loadUserData(email);
    if (user) {
        user.luduCoins += amount;
        saveUserData(user);
        return user;
    }
    return null;
}