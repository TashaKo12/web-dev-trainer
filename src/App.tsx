import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { HtmlStructureTrainer } from "./trainers/html-structure/HtmlStructureTrainer";
import { BoxModelTrainer } from "./trainers/box-model/BoxModelTrainer";
import { FlexboxTrainer } from "./trainers/flexbox/FlexboxTrainer";
import { SelectorsTrainer } from "./trainers/selectors/SelectorsTrainer";
import { DomAccessTrainer } from "./trainers/dom-access/DomAccessTrainer";
import { BasicTagsTrainer } from "./trainers/basic-tags/BasicTagsTrainer";
import { TypographyTrainer } from "./trainers/typography/TypographyTrainer";
import { PseudoClassesTrainer } from "./trainers/pseudo-classes/PseudoClassesTrainer";
import { FormsTrainer } from "./trainers/forms/FormsTrainer";
import { TablesTrainer } from "./trainers/tables/TablesTrainer";
import { PageLayoutTrainer } from "./trainers/page-layout/PageLayoutTrainer";
import { ImagePathsTrainer } from "./trainers/image-paths/ImagePathsTrainer";
import { TagsAttributesTrainer } from "./trainers/tags-attributes/TagsAttributesTrainer";
import { LinksTrainer } from "./trainers/links/LinksTrainer";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="html-structure" element={<HtmlStructureTrainer />} />
          <Route path="box-model" element={<BoxModelTrainer />} />
          <Route path="flexbox" element={<FlexboxTrainer />} />
          <Route path="selectors" element={<SelectorsTrainer />} />
          <Route path="dom-access" element={<DomAccessTrainer />} />
          <Route path="basic-tags" element={<BasicTagsTrainer />} />
          <Route path="typography" element={<TypographyTrainer />} />
          <Route path="pseudo-classes" element={<PseudoClassesTrainer />} />
          <Route path="forms" element={<FormsTrainer />} />
          <Route path="tables" element={<TablesTrainer />} />
          <Route path="page-layout" element={<PageLayoutTrainer />} />
          <Route path="image-paths" element={<ImagePathsTrainer />} />
          <Route path="tags-attributes" element={<TagsAttributesTrainer />} />
          <Route path="links" element={<LinksTrainer />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
