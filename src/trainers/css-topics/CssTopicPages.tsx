import { CssTopicPage } from "../../css/CssTopic";
import { CSS_SIZES, FONT_STYLE, TEXT_DECORATION } from "../../css/topics/lesson1to5";
import { CSS_UNITS, DESIGN_PALETTE, POSITION_FIXED } from "../../css/topics/lesson5to7";
import { LIST_STYLE, MAX_SIZE, MULTI_PAGE } from "../../css/topics/lesson9to13";

export const CssSizesTrainer = () => <CssTopicPage data={CSS_SIZES} />;
export const TextDecorationTrainer = () => <CssTopicPage data={TEXT_DECORATION} />;
export const FontStyleTrainer = () => <CssTopicPage data={FONT_STYLE} />;
export const PositionFixedTrainer = () => <CssTopicPage data={POSITION_FIXED} />;
export const CssUnitsTrainer = () => <CssTopicPage data={CSS_UNITS} />;
export const DesignPaletteTrainer = () => <CssTopicPage data={DESIGN_PALETTE} />;
export const MaxSizeTrainer = () => <CssTopicPage data={MAX_SIZE} />;
export const ListStyleTrainer = () => <CssTopicPage data={LIST_STYLE} />;
export const MultiPageTrainer = () => <CssTopicPage data={MULTI_PAGE} />;
