import { PrivateLobby, LobbyPlayer, Category } from '../types';

const LOBBIES_DB_KEY = 'ludus_private_lobbies';
const LOBBY_CODE_LENGTH = 6;
const LOBBY_EXPIRATION_MS = 3600 * 1000; // 1 hour

// Helper to get all lobbies
const getAllLobbies = (): Record<string, PrivateLobby> => {
    const lobbies = JSON.parse(localStorage.getItem(LOBBIES_DB_KEY) || '{}');
    // Clean up expired lobbies
    const now = Date.now();
    Object.keys(lobbies).forEach(code => {
        if (now - lobbies[code].createdAt > LOBBY_EXPIRATION_MS) {
            delete lobbies[code];
        }
    });
    return lobbies;
};

// Helper to save all lobbies
const saveAllLobbies = (lobbies: Record<string, PrivateLobby>) => {
    localStorage.setItem(LOBBIES_DB_KEY, JSON.stringify(lobbies));
};

const generateLobbyCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < LOBBY_CODE_LENGTH; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const createLobby = (host: LobbyPlayer, allowedCategories: Category[]): PrivateLobby => {
    const lobbies = getAllLobbies();
    let newCode;
    do {
        newCode = generateLobbyCode();
    } while (lobbies[newCode]); // Ensure code is unique

    const newLobby: PrivateLobby = {
        code: newCode,
        hostId: host.id,
        players: [host],
        allowedCategories,
        createdAt: Date.now(),
    };

    lobbies[newCode] = newLobby;
    saveAllLobbies(lobbies);
    return newLobby;
};

export const joinLobby = (lobbyCode: string, player: LobbyPlayer): { success: boolean, lobby?: PrivateLobby, message?: string } => {
    const lobbies = getAllLobbies();
    const lobby = lobbies[lobbyCode];

    if (!lobby) {
        return { success: false, message: 'errorLobbyNotFound' };
    }
    if (lobby.players.length >= 4) {
        return { success: false, message: 'errorLobbyFull' };
    }
    if (lobby.players.some(p => p.id === player.id)) {
        // Player is already in, just return success
        return { success: true, lobby };
    }

    lobby.players.push(player);
    saveAllLobbies(lobbies);
    return { success: true, lobby };
};

export const leaveLobby = (lobbyCode: string, playerId: string): PrivateLobby | null => {
    const lobbies = getAllLobbies();
    const lobby = lobbies[lobbyCode];

    if (!lobby) return null;

    lobby.players = lobby.players.filter(p => p.id !== playerId);

    // If host leaves, disband lobby
    if (lobby.hostId === playerId || lobby.players.length === 0) {
        delete lobbies[lobbyCode];
    }

    saveAllLobbies(lobbies);
    return lobbies[lobbyCode] || null;
};


export const getLobby = (lobbyCode: string): PrivateLobby | null => {
    return getAllLobbies()[lobbyCode] || null;
};

export const removeLobby = (lobbyCode: string) => {
    const lobbies = getAllLobbies();
    delete lobbies[lobbyCode];
    saveAllLobbies(lobbies);
};