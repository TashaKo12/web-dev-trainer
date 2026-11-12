import { SectionHeading } from "../components/SectionHeading";
import { MissionBoard } from "../python/MissionBoard";
import { HtmlMissionPlay } from "./HtmlMission";
import { HTML_MISSIONS } from "./html";

export const missionStorageKey = (trainerId: string) => `wdt:missions:${trainerId}`;

/** The game block of a web topic: Pixel's missions between the theory and the practice. */
export function WebMissions({ trainerId }: { trainerId: string }) {
  const set = HTML_MISSIONS[trainerId];
  if (!set) return null;
  return (
    <>
      <SectionHeading
        kicker="Игра"
        title="Помоги Пикселю собрать сайт"
        description={`${set.intro} ${set.missions.length} миссии: пиши код слева — справа сразу видно, что получилось.`}
      />
      <div className="mb-10">
        <MissionBoard
          missions={set.missions.map((m) => ({
            title: m.title,
            render: ({ isDone, onComplete, onMistake }) => <HtmlMissionPlay mission={m} isDone={isDone} onComplete={onComplete} onMistake={onMistake} />,
          }))}
          storageKey={missionStorageKey(trainerId)}
          pointsSource={`missions:${trainerId}`}
          finishText="Все миссии пройдены — сайт Пикселя стал ещё лучше! Теперь закрепим всё на практике ниже."
        />
      </div>
    </>
  );
}
