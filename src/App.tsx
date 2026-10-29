import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { HtmlStructureTrainer } from "./trainers/html-structure/HtmlStructureTrainer";
import { BoxModelTrainer } from "./trainers/box-model/BoxModelTrainer";
import { FlexboxTrainer } from "./trainers/flexbox/FlexboxTrainer";
import { SelectorsTrainer } from "./trainers/selectors/SelectorsTrainer";
import { DomAccessTrainer } from "./trainers/dom-access/DomAccessTrainer";

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
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
