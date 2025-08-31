export const normalizeAnswer = (answer: string): string => {
    if (typeof answer !== 'string') return '';
    return answer.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};
