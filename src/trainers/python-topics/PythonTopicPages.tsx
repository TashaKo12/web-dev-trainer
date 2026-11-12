import { PythonTopicPage } from "../../python/PythonTopic";
import { VARIABLES } from "../../python/topics/variables";
import { CONDITIONS } from "../../python/topics/conditions";
import { FOR_LOOP } from "../../python/topics/forLoop";
import { WHILE_LOOP } from "../../python/topics/whileLoop";

export function PythonVariablesTrainer() {
  return <PythonTopicPage data={VARIABLES} />;
}

export function PythonIfTrainer() {
  return <PythonTopicPage data={CONDITIONS} />;
}

export function PythonForTrainer() {
  return <PythonTopicPage data={FOR_LOOP} />;
}

export function PythonWhileTrainer() {
  return <PythonTopicPage data={WHILE_LOOP} />;
}
