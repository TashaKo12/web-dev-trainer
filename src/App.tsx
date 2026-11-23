import { lazy, Suspense, useState, type ReactNode } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LoadingScreen } from "./components/LoadingScreen";
import { Home } from "./pages/Home";
import { TagsAttributesTrainer } from "./trainers/tags-attributes/TagsAttributesTrainer";
import { HtmlStructureTrainer } from "./trainers/html-structure/HtmlStructureTrainer";
import { HeadingsTrainer } from "./trainers/headings/HeadingsTrainer";
import { ParagraphsTrainer } from "./trainers/paragraphs/ParagraphsTrainer";
import { ListsTrainer } from "./trainers/lists/ListsTrainer";
import { DivClassesTrainer } from "./trainers/div-classes/DivClassesTrainer";
import { IdAttributeTrainer } from "./trainers/id-attribute/IdAttributeTrainer";
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
import { JsFunctionsTrainer } from "./trainers/js-functions/JsFunctionsTrainer";
import { PythonHome } from "./pages/PythonHome";
import { PythonPrintTrainer } from "./trainers/python-print/PythonPrintTrainer";
import { PythonInputTrainer } from "./trainers/python-input/PythonInputTrainer";
const SqlHome = lazy(() => import("./sql/SqlHome").then((m) => ({ default: m.SqlHome })));
const SqlIntroPage = lazy(() => import("./sql/SqlPages").then((m) => ({ default: m.SqlIntroPage })));
const SqlLifecyclePage = lazy(() => import("./sql/SqlPages").then((m) => ({ default: m.SqlLifecyclePage })));
const SqlAlgebraPage = lazy(() => import("./sql/SqlPages").then((m) => ({ default: m.SqlAlgebraPage })));
const SqlDesignPage = lazy(() => import("./sql/SqlPages").then((m) => ({ default: m.SqlDesignPage })));
const SqlSetupPage = lazy(() => import("./sql/SqlPages").then((m) => ({ default: m.SqlSetupPage })));
const SqlTypesPage = lazy(() => import("./sql/SqlPages").then((m) => ({ default: m.SqlTypesPage })));
const SqlTablesPage = lazy(() => import("./sql/SqlPages").then((m) => ({ default: m.SqlTablesPage })));
const SqlCrudPage = lazy(() => import("./sql/SqlPages").then((m) => ({ default: m.SqlCrudPage })));
const SqlFinalPage = lazy(() => import("./sql/SqlPages").then((m) => ({ default: m.SqlFinalPage })));
const Lazy = ({ children }: { children: ReactNode }) => <Suspense fallback={<p className="p-6 text-center text-sm text-slate-400">Загружаю…</p>}>{children}</Suspense>;
import { PythonForTrainer, PythonIfTrainer, PythonLogicTrainer, PythonStringsTrainer, PythonTypesTrainer, PythonVariablesTrainer, PythonWhileTrainer } from "./trainers/python-topics/PythonTopicPages";
import {
  CssSizesTrainer,
  CssUnitsTrainer,
  DesignPaletteTrainer,
  FontStyleTrainer,
  HoverPictureTrainer,
  PagePartsTrainer,
  ListStyleTrainer,
  MaxSizeTrainer,
  MultiPageTrainer,
  PositionFixedTrainer,
  TextDecorationTrainer,
} from "./trainers/css-topics/CssTopicPages";
import { QuestHome } from "./quest/QuestHome";
import { QuestBay } from "./quest/QuestBay";
import { QuestLevel } from "./quest/QuestLevel";
import { LogicHome, LogicIsland } from "./logic/LogicGame";
import { KeysHome, KeysLevelPage } from "./keys/KeysGame";
import { BeaconHome, BeaconLevelPage } from "./beacon/BeaconGame";
import { StudioEditorPage, StudioHome } from "./studio/StudioPages";
import { Profile } from "./pages/Profile";
import { Admin } from "./pages/Admin";

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <HashRouter>
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}
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
          <Route path="id-attribute" element={<IdAttributeTrainer />} />
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
          <Route path="js-functions" element={<JsFunctionsTrainer />} />

          {/* Python */}
          <Route path="python" element={<PythonHome />} />
          <Route path="sql" element={<Lazy><SqlHome /></Lazy>} />
          <Route path="sql/intro" element={<Lazy><SqlIntroPage /></Lazy>} />
          <Route path="sql/lifecycle" element={<Lazy><SqlLifecyclePage /></Lazy>} />
          <Route path="sql/algebra" element={<Lazy><SqlAlgebraPage /></Lazy>} />
          <Route path="sql/design" element={<Lazy><SqlDesignPage /></Lazy>} />
          <Route path="sql/setup" element={<Lazy><SqlSetupPage /></Lazy>} />
          <Route path="sql/types" element={<Lazy><SqlTypesPage /></Lazy>} />
          <Route path="sql/tables" element={<Lazy><SqlTablesPage /></Lazy>} />
          <Route path="sql/crud" element={<Lazy><SqlCrudPage /></Lazy>} />
          <Route path="sql/final" element={<Lazy><SqlFinalPage /></Lazy>} />
          <Route path="python/print" element={<PythonPrintTrainer />} />
          <Route path="python/input" element={<PythonInputTrainer />} />
          <Route path="python/variables" element={<PythonVariablesTrainer />} />
          <Route path="python/if" element={<PythonIfTrainer />} />
          <Route path="python/logic" element={<PythonLogicTrainer />} />
          <Route path="python/for" element={<PythonForTrainer />} />
          <Route path="python/while" element={<PythonWhileTrainer />} />
          <Route path="python/types" element={<PythonTypesTrainer />} />
          <Route path="python/strings" element={<PythonStringsTrainer />} />
          <Route path="css-sizes" element={<CssSizesTrainer />} />
          <Route path="text-decoration" element={<TextDecorationTrainer />} />
          <Route path="font-style" element={<FontStyleTrainer />} />
          <Route path="position-fixed" element={<PositionFixedTrainer />} />
          <Route path="css-units" element={<CssUnitsTrainer />} />
          <Route path="design-palette" element={<DesignPaletteTrainer />} />
          <Route path="max-size" element={<MaxSizeTrainer />} />
          <Route path="list-style" element={<ListStyleTrainer />} />
          <Route path="multi-page" element={<MultiPageTrainer />} />
          <Route path="hover-picture" element={<HoverPictureTrainer />} />
          <Route path="page-parts" element={<PagePartsTrainer />} />

          {/* «Тайна станции»: a block-coding quest for children 7–9 */}
          <Route path="quest" element={<QuestHome />} />
          <Route path="quest/:bay" element={<QuestBay />} />
          <Route path="quest/:bay/:level" element={<QuestLevel />} />
          <Route path="beacon" element={<BeaconHome />} />
          <Route path="beacon/:level" element={<BeaconLevelPage />} />

          {/* «Конструктор игр»: objects, behaviors and events, like a small GDevelop */}
          <Route path="studio" element={<StudioHome />} />
          <Route path="studio/:id" element={<StudioEditorPage />} />

          {/* «Остров загадок» and «Клавиатура Пикселя»: games for children 7–9 */}
          <Route path="logic" element={<LogicHome />} />
          <Route path="logic/:island" element={<LogicIsland />} />
          <Route path="keys" element={<KeysHome />} />
          <Route path="keys/:level" element={<KeysLevelPage />} />

          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
