export function convertTimestamp<T>(data: T): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => convertTimestamp(item));
  }

  if (typeof data === 'object') {
    const result = { ...data } as Record<string, any>;

    // Конвертируем дату в число (миллисекунды)
    if (result.createdAt instanceof Date) {
      result.createdAt = result.createdAt.getTime();
    }
    if (result.updatedAt instanceof Date) {
      result.updatedAt = result.updatedAt.getTime();
    }

    // Рекурсивно обрабатываем вложенные связи (author, category, tags)
    for (const key in result) {
      if (
        result[key] &&
        typeof result[key] === 'object' &&
        !(result[key] instanceof Date)
      ) {
        result[key] = convertTimestamp(result[key]);
      }
    }

    return result;
  }

  return data;
}
