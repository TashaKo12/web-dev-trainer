import { SqlTopicPage } from "./SqlTopic";
import { SQL_INTRO } from "./topics/intro";
import { SQL_LIFECYCLE } from "./topics/lifecycle";
import { SQL_ALGEBRA } from "./topics/algebra";
import { SQL_DESIGN } from "./topics/design";
import { SQL_SETUP } from "./topics/setup";
import { SQL_TYPES } from "./topics/types";
import { SQL_TABLES } from "./topics/tables";
import { SQL_CRUD } from "./topics/crud";
import { SQL_FINAL } from "./topics/final";

// One page per topic of module 1. They are loaded only when a SQL page is opened (the database engine is big).

export const SqlIntroPage = () => <SqlTopicPage data={SQL_INTRO} />;
export const SqlLifecyclePage = () => <SqlTopicPage data={SQL_LIFECYCLE} />;
export const SqlAlgebraPage = () => <SqlTopicPage data={SQL_ALGEBRA} />;
export const SqlDesignPage = () => <SqlTopicPage data={SQL_DESIGN} />;
export const SqlSetupPage = () => <SqlTopicPage data={SQL_SETUP} />;
export const SqlTypesPage = () => <SqlTopicPage data={SQL_TYPES} />;
export const SqlTablesPage = () => <SqlTopicPage data={SQL_TABLES} />;
export const SqlCrudPage = () => <SqlTopicPage data={SQL_CRUD} />;
export const SqlFinalPage = () => <SqlTopicPage data={SQL_FINAL} />;
