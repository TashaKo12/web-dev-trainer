import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";

// Extra theory cards for topics whose practice asks about something the main theory did not explain.
// Every idea used in practice must be explained first.

type Note = { title: string; text: ReactNode; code?: string; table?: [string, string, string][] };

const C = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-indigo-700">{children}</code>
);

const NOTES: Record<string, Note[]> = {
  "tags-attributes": [
    {
      title: "Тег-ссылка a и атрибут href",
      text: (
        <>
          Тег <C>a</C> делает ссылку. В атрибуте <C>href</C> пишут адрес — куда перейти, а текст между <C>&lt;a&gt;</C> и{" "}
          <C>&lt;/a&gt;</C> — то, на что нажимают. Атрибут <C>target="_blank"</C> откроет ссылку в новой вкладке. У ссылки
          обязательно есть закрывающий тег.
        </>
      ),
      code: '<a href="about.html">Обо мне</a>\n<a href="contact.html" target="_blank">Контакты</a>',
    },
  ],
  "html-structure": [
    {
      title: "Служебные теги живут в head",
      text: (
        <>
          В <C>head</C> лежит то, что посетитель не видит на странице: название вкладки <C>title</C> и настройки. Например,{" "}
          <C>&lt;meta charset="utf-8"&gt;</C> говорит браузеру, в какой кодировке написан текст, — без неё русские буквы могут
          превратиться в непонятные значки. Тег <C>meta</C> самозакрывающийся.
        </>
      ),
      code: '<head>\n  <meta charset="utf-8">\n  <title>Сайт Пикселя</title>\n</head>',
    },
    {
      title: "Всё, что видно, — в body",
      text: (
        <>
          Заголовки <C>h1</C>, абзацы, картинки, кнопки и блоки — всё, что читает и видит посетитель, кладут в <C>body</C>.
          Если поставить <C>h1</C> в <C>head</C>, это ошибка: заголовок должен быть на странице.
        </>
      ),
      code: "<body>\n  <h1>Сайт Пикселя</h1>\n  <p>Привет!</p>\n</body>",
    },
    {
      title: "Язык страницы и экран телефона",
      text: (
        <>
          У тега <C>html</C> пишут язык: <C>&lt;html lang="ru"&gt;</C> — так браузер и программы чтения вслух понимают, что текст
          русский. А строка <C>&lt;meta name="viewport" content="width=device-width"&gt;</C> в head говорит телефону: показывай
          страницу по ширине экрана, а не уменьшенной копией компьютерной версии.
        </>
      ),
      code: '<html lang="ru">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width">\n</head>',
    },
  ],
  paragraphs: [
    {
      title: "Чем p отличается от div",
      text: (
        <>
          И <C>p</C>, и <C>div</C> занимают всю ширину строки. Но у абзаца <C>p</C> браузер сам добавляет отступы сверху и снизу
          (это свойство <C>margin</C>), поэтому абзацы не слипаются. У <C>div</C> отступов нет — это просто «коробка» для других
          тегов.
        </>
      ),
      code: "<p>Абзац — с отступами сверху и снизу</p>\n<div>Блок div — без отступов</div>",
    },
  ],
  tables: [
    {
      title: "Что можно положить в ячейку",
      text: (
        <>
          В ячейку <C>td</C> можно положить почти любой HTML: текст, картинку <C>img</C>, ссылку или кнопку. Так делают таблицы
          с фотографиями товаров или иконками оружия.
        </>
      ),
      code: '<tr>\n  <td><img src="ak47.png" alt="AK-47" width="60"></td>\n  <td>AK-47</td>\n</tr>',
    },
    {
      title: "Рамки таблицы: border-collapse и border-spacing",
      text: (
        <>
          У каждой ячейки своя рамка, и между ними получаются двойные линии. <C>border-collapse: collapse</C> склеивает их в одну.
          А если рамки оставить раздельными, расстояние между ячейками задаёт <C>border-spacing</C>.
        </>
      ),
      code: "table { border-collapse: collapse; }\ntd, th { border: 1px solid #555; }\n\n/* или раздельные клетки с промежутком */\ntable { border-spacing: 6px; }",
    },
  ],
  "form-basics": [
    {
      title: "Куда и как отправляется форма: action и method",
      text: (
        <>
          Атрибут <C>action</C> — адрес, куда уйдут данные формы. Атрибут <C>method</C> — способ отправки. <C>get</C> кладёт
          данные прямо в адресную строку (так работает поиск). <C>post</C> прячет их внутри запроса — так отправляют пароли и
          личные данные, чтобы они не остались в адресной строке и истории браузера.
        </>
      ),
      code: '<form action="/login" method="post">\n  <input name="password" type="password">\n  <button>Войти</button>\n</form>',
    },
    {
      title: "Кнопка внутри формы",
      text: (
        <>
          Кнопка <C>button</C> внутри <C>form</C> без атрибута <C>type</C> ведёт себя как <C>type="submit"</C> — нажатие
          отправляет форму. Если кнопка не должна ничего отправлять, ей пишут <C>type="button"</C>.
        </>
      ),
      code: '<button type="submit">Отправить</button>\n<button type="button">Просто кнопка</button>',
    },
  ],
  buttons: [
    {
      title: "Курсор-рука: cursor: pointer",
      text: (
        <>
          Когда наводишь мышку на ссылку, курсор становится рукой — так видно, что на это можно нажать. Кнопкам и карточкам такую
          руку включают сами: <C>cursor: pointer</C>.
        </>
      ),
      code: "button {\n  cursor: pointer;\n}",
    },
  ],
  "input-types": [
    {
      title: "Не больше N символов: maxlength",
      text: (
        <>
          Атрибут <C>maxlength</C> не даёт ввести больше символов, чем указано. Например, телефон — не длиннее 12 знаков, имя — не
          длиннее 30.
        </>
      ),
      code: '<input type="tel" placeholder="+7 900 000-00-00" maxlength="12">',
    },
  ],
  opacity: [
    {
      title: "opacity: 0 и display: none — не одно и то же",
      text: (
        <>
          Оба способа прячут элемент, но по-разному. <C>opacity: 0</C> делает его прозрачным: место на странице остаётся, а
          клики по нему всё ещё проходят. <C>display: none</C> убирает элемент совсем: места он не занимает и на клики не
          реагирует.
        </>
      ),
      table: [
        ["", "opacity: 0", "display: none"],
        ["Виден?", "нет", "нет"],
        ["Занимает место?", "да", "нет"],
        ["Реагирует на клики?", "да", "нет"],
      ],
    },
  ],
  "page-layout": [
    {
      title: "Подвал всегда внизу экрана",
      text: (
        <>
          Чтобы <C>footer</C> стоял внизу, даже если текста мало: делаем <C>body</C> flex-колонкой высотой во весь экран, а{" "}
          <C>main</C> просим занять всё свободное место. <C>100vh</C> — это 100% высоты окна браузера. Без{" "}
          <C>min-height: 100vh</C> body будет высотой ровно по тексту, и растягиваться будет некуда. Если забыть{" "}
          <C>flex-direction: column</C>, header, main и footer встанут в ряд по горизонтали.
        </>
      ),
      code: "body {\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n}\nmain {\n  flex: 1;\n}",
    },
    {
      title: "Блок по центру страницы",
      text: (
        <>
          Если у блока задана ширина, его ставят по центру так: <C>margin: 0 auto</C>. 0 — отступы сверху и снизу, auto — браузер
          сам поровну делит свободное место слева и справа.
        </>
      ),
      code: ".page {\n  width: 800px;\n  margin: 0 auto;\n}",
    },
  ],
};

export function TheoryNotes({ trainerId }: { trainerId: string }) {
  const notes = NOTES[trainerId];
  if (!notes) return null;
  return (
    <div className="mt-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-8 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-500">
        <BookOpen className="h-4 w-4" strokeWidth={2} />
        Важно перед практикой
      </p>
      <div className="space-y-6">
        {notes.map((n) => (
          <div key={n.title}>
            <h3 className="mb-2 text-lg font-extrabold text-slate-800">{n.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">{n.text}</p>
            {n.code && (
              <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-900 p-4 font-mono text-[13px] leading-relaxed text-slate-100">{n.code}</pre>
            )}
            {n.table && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full max-w-lg text-sm">
                  <tbody>
                    {n.table.map((row, i) => (
                      <tr key={i} className={i === 0 ? "font-bold text-slate-700" : "text-slate-600"}>
                        {row.map((cell, j) => (
                          <td key={j} className="border-b border-slate-200 px-3 py-2 font-mono first:font-sans">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
