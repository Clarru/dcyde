export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
    .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
};

export const findMatrixBySlug = (matrices: any[], slug: string) => {
  return matrices.find(matrix => generateSlug(matrix.name) === slug);
}; 