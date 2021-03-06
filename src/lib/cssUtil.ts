const SP_VIEWPORT_SIZE = 1125;
const PC_VIEWPORT_SIZE = 2500;

const appendPostfix = (nums: number[], postfix: string) => {
  return nums.map<string>(n => `${n}${postfix}`).join(" ");
};

export const px = (...nums: number[]) => {
  return appendPostfix(nums, "px");
};

export const percent = (...nums: number[]) => {
  return appendPostfix(nums, "%");
};

export const em = (...nums: number[]) => {
  return appendPostfix(nums, "em");
};

export const vw = (...nums: number[]) => {
  return appendPostfix(nums, "vw");
};

export const vh = (...nums: number[]) => {
  return appendPostfix(nums, "vh");
};

export const pcp = (...nums: number[]) => {
  return vh(...nums.map(n => (n / PC_VIEWPORT_SIZE) * 100));
};

export const spp = (...nums: number[]) => {
  return vw(...nums.map(n => (n / SP_VIEWPORT_SIZE) * 100));
};
