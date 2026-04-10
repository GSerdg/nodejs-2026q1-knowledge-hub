export const PRISMA_ERROR_CODES = {
  UNIQUE_CONSTRAINT: 'P2002', // Конфликт (уже существует)
  FOREIGN_KEY_CONSTRAINT: 'P2003', // Связанная запись не найдена (например, нет такой статьи)
  NOT_FOUND: 'P2025', // Запись для обновления/удаления не найдена
} as const;
