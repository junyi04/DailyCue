import { Post } from "@/types";
import { COLORS } from "./theme";

export const getTagColor = (tag: Post['tag']): string => {
  switch (tag) {
    case '전체': return COLORS.black;
    case '공유해요': return COLORS.secondary;
    case '공감원해요': return COLORS.orange;
    case '함께해요': return COLORS.green;
    case '고수찾아요': return COLORS.darkBlue;
    default: return COLORS.gray;
  }
};