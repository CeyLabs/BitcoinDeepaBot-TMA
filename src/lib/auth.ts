export interface TelegramAuthResponse {
    token?: string;
    user?: any;
    isRegistered?: boolean;
    message?: string;
}

export interface UserRegistrationData {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
}

export interface PlanSelectionData {
    selectedPlan: string;
    planName: string;
}

/**
 * Authenticate user with Telegram initData
 */
export async function authenticateWithTelegram(initData: string): Promise<TelegramAuthResponse> {
    try {
        const response = await fetch("/api/auth/telegram", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                initData,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            // If it's a 404 or 401, it might mean user is not registered
            if (response.status === 404 || response.status === 401) {
                return {
                    token: result.token || null,
                    isRegistered: false,
                    message: result.message || "User not found",
                };
            }
            throw new Error(`Authentication failed: ${response.statusText}`);
        }

        return {
            token: result.token,
            user: result.user,
            isRegistered: false,
        };
    } catch (error) {
        console.error("Error during Telegram authentication:", error);
        throw error;
    }
}

/**
 * Register a new user with the backend
 */
export async function registerUser(token: string, userData: UserRegistrationData): Promise<any> {
    try {
        const response = await fetch("/api/user/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token,
                userData,
            }),
        });

        if (!response.ok) {
            throw new Error(`User registration failed: ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error during user registration:", error);
        throw error;
    }
}

/**
 * Register user with plan information
 */
export async function registerUserWithPlan(
    token: string,
    userData: UserRegistrationData,
    planData: PlanSelectionData
): Promise<any> {
    try {
        // First, register the user with basic information
        const userResult = await registerUser(token, userData);

        return {
            ...userResult,
            plan: planData,
        };
    } catch (error) {
        console.error("Error during user registration with plan:", error);
        throw error;
    }
}

/**
 * Complete authentication flow: check if user exists, register if needed
 */
export async function completeAuthFlow(
    initData: string,
    userRegistrationData?: UserRegistrationData
): Promise<{ isRegistered: boolean; token?: string; user?: any }> {
    try {
        const authResult = await authenticateWithTelegram(initData);

        if (authResult.isRegistered) {
            return {
                isRegistered: true,
                token: authResult.token,
                user: authResult.user,
            };
        }

        if (!authResult.isRegistered && userRegistrationData && authResult.token) {
            const registrationResult = await registerUser(authResult.token, userRegistrationData);

            return {
                isRegistered: true,
                token: authResult.token,
                user: registrationResult.user || registrationResult,
            };
        }

        // Step 4: User is not registered and no registration data provided
        return {
            isRegistered: false,
            token: authResult.token,
        };
    } catch (error) {
        console.error("Error in complete auth flow:", error);
        throw error;
    }
}

/**
 * Utility functions for authentication using localStorage
 */

export const getAuthTokenFromStorage = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("bitcoin-deepa-auth-token");
};

export const getIsExistingUserFromStorage = (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("bitcoin-deepa-is-existing-user") === "true";
};

export const saveAuthToStorage = (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("bitcoin-deepa-auth-token", token);
    localStorage.setItem("bitcoin-deepa-is-existing-user", "true");
};

export const clearAuthFromStorage = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("bitcoin-deepa-auth-token");
    localStorage.removeItem("bitcoin-deepa-is-existing-user");
};

export const isAuthenticated = (): boolean => {
    return !!getAuthTokenFromStorage();
};
