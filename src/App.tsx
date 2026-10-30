import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { TagsAttributesTrainer } from "./trainers/tags-attributes/TagsAttributesTrainer";
import { HtmlStructureTrainer } from "./trainers/html-structure/HtmlStructureTrainer";
import { HeadingsTrainer } from "./trainers/headings/HeadingsTrainer";
import { ParagraphsTrainer } from "./trainers/paragraphs/ParagraphsTrainer";
import { ListsTrainer } from "./trainers/lists/ListsTrainer";
import { DivClassesTrainer } from "./trainers/div-classes/DivClassesTrainer";
import { ButtonsTrainer } from "./trainers/buttons/ButtonsTrainer";
import { ImagesTrainer } from "./trainers/images/ImagesTrainer";
import { ImagePathsTrainer } from "./trainers/image-paths/ImagePathsTrainer";
import { LinksTrainer } from "./trainers/links/LinksTrainer";
import { SemanticTagsTrainer } from "./trainers/semantic-tags/SemanticTagsTrainer";
import { TablesTrainer } from "./trainers/tables/TablesTrainer";
import { FormBasicsTrainer } from "./trainers/form-basics/FormBasicsTrainer";
import { FormFieldsTrainer } from "./trainers/form-fields/FormFieldsTrainer";
import { InputTypesTrainer } from "./trainers/input-types/InputTypesTrainer";
import { CssIntroTrainer } from "./trainers/css-intro/CssIntroTrainer";
import { SelectorsTrainer } from "./trainers/selectors/SelectorsTrainer";
import { TextColorTrainer } from "./trainers/text-color/TextColorTrainer";
import { BackgroundColorTrainer } from "./trainers/background-color/BackgroundColorTrainer";
import { TextAlignTrainer } from "./trainers/text-align/TextAlignTrainer";
import { FontSizeTrainer } from "./trainers/font-size/FontSizeTrainer";
import { FontWeightTrainer } from "./trainers/font-weight/FontWeightTrainer";
import { TypographyTrainer } from "./trainers/typography/TypographyTrainer";
import { BoxModelTrainer } from "./trainers/box-model/BoxModelTrainer";
import { BorderTrainer } from "./trainers/border/BorderTrainer";
import { ShadowsTrainer } from "./trainers/shadows/ShadowsTrainer";
import { BackgroundsTrainer } from "./trainers/backgrounds/BackgroundsTrainer";
import { GradientTrainer } from "./trainers/gradient/GradientTrainer";
import { ResetBoxSizingTrainer } from "./trainers/reset-box-sizing/ResetBoxSizingTrainer";
import { FlexboxTrainer } from "./trainers/flexbox/FlexboxTrainer";
import { GridTrainer } from "./trainers/grid/GridTrainer";
import { PageLayoutTrainer } from "./trainers/page-layout/PageLayoutTrainer";
import { PseudoClassesTrainer } from "./trainers/pseudo-classes/PseudoClassesTrainer";
import { OpacityTrainer } from "./trainers/opacity/OpacityTrainer";
import { TransitionsTrainer } from "./trainers/transitions/TransitionsTrainer";
import { DomAccessTrainer } from "./trainers/dom-access/DomAccessTrainer";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />

          {/* HTML */}
          <Route path="tags-attributes" element={<TagsAttributesTrainer />} />
          <Route path="html-structure" element={<HtmlStructureTrainer />} />
          <Route path="headings" element={<HeadingsTrainer />} />
          <Route path="paragraphs" element={<ParagraphsTrainer />} />
          <Route path="lists" element={<ListsTrainer />} />
          <Route path="div-classes" element={<DivClassesTrainer />} />
          <Route path="buttons" element={<ButtonsTrainer />} />
          <Route path="images" element={<ImagesTrainer />} />
          <Route path="image-paths" element={<ImagePathsTrainer />} />
          <Route path="links" element={<LinksTrainer />} />
          <Route path="semantic-tags" element={<SemanticTagsTrainer />} />
          <Route path="tables" element={<TablesTrainer />} />
          <Route path="form-basics" element={<FormBasicsTrainer />} />
          <Route path="form-fields" element={<FormFieldsTrainer />} />
          <Route path="input-types" element={<InputTypesTrainer />} />

          {/* CSS */}
          <Route path="css-intro" element={<CssIntroTrainer />} />
          <Route path="selectors" element={<SelectorsTrainer />} />
          <Route path="text-color" element={<TextColorTrainer />} />
          <Route path="background-color" element={<BackgroundColorTrainer />} />
          <Route path="text-align" element={<TextAlignTrainer />} />
          <Route path="font-size" element={<FontSizeTrainer />} />
          <Route path="font-weight" element={<FontWeightTrainer />} />
          <Route path="typography" element={<TypographyTrainer />} />
          <Route path="box-model" element={<BoxModelTrainer />} />
          <Route path="border" element={<BorderTrainer />} />
          <Route path="shadows" element={<ShadowsTrainer />} />
          <Route path="backgrounds" element={<BackgroundsTrainer />} />
          <Route path="gradient" element={<GradientTrainer />} />
          <Route path="reset-box-sizing" element={<ResetBoxSizingTrainer />} />
          <Route path="flexbox" element={<FlexboxTrainer />} />
          <Route path="grid" element={<GridTrainer />} />
          <Route path="page-layout" element={<PageLayoutTrainer />} />
          <Route path="pseudo-classes" element={<PseudoClassesTrainer />} />
          <Route path="opacity" element={<OpacityTrainer />} />
          <Route path="transitions" element={<TransitionsTrainer />} />

          {/* JS */}
          <Route path="dom-access" element={<DomAccessTrainer />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
