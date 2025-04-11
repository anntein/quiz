const NICKNAME_KEY = 'quiz_last_nickname';

export const getLastNickname = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(NICKNAME_KEY);
};

export const saveLastNickname = (nickname: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NICKNAME_KEY, nickname);
}; 