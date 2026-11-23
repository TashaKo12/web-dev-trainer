import { PythonTopicPage } from "../../python/PythonTopic";
import { VARIABLES } from "../../python/topics/variables";
import { CONDITIONS } from "../../python/topics/conditions";
import { LOGIC } from "../../python/topics/logic";
import { FOR_LOOP } from "../../python/topics/forLoop";
import { WHILE_LOOP } from "../../python/topics/whileLoop";
import { TYPES } from "../../python/topics/types";
import { STRINGS } from "../../python/topics/strings";

export function PythonVariablesTrainer() {
  return <PythonTopicPage data={VARIABLES} />;
}

export function PythonIfTrainer() {
  return <PythonTopicPage data={CONDITIONS} />;
}

export function PythonLogicTrainer() {
  return <PythonTopicPage data={LOGIC} />;
}

export function PythonForTrainer() {
  return <PythonTopicPage data={FOR_LOOP} />;
}

export function PythonWhileTrainer() {
  return <PythonTopicPage data={WHILE_LOOP} />;
}

export function PythonTypesTrainer() {
  return <PythonTopicPage data={TYPES} />;
}

export function PythonStringsTrainer() {
  return <PythonTopicPage data={STRINGS} />;
}
