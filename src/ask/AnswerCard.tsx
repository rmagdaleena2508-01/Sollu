import type { Lang } from '../content';
import { Icon } from '../components/Icon';
import { copy, shortDate, verdictLabel } from './copy';
import type { AskResponse } from './types';

interface Props {
  res: AskResponse;
  uiLang: Lang;
  playing: boolean;
  loadingAudio: boolean;
  onPlay: () => void;
}

export function AnswerCard({ res, uiLang, playing, loadingAudio, onPlay }: Props) {
  const t = copy[uiLang];
  const textLang = res.fallback ? 'en' : res.lang;

  return (
    <article className="answer" aria-live="polite">
      <div className="answer-body" lang={textLang}>
        {res.lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>

      {res.followUp && (
        <p className="answer-follow" lang={res.lang}>
          <span className="answer-follow-label">{t.followUp}</span>
          {res.followUp}
        </p>
      )}

      {res.cautionNote && (
        <p className="answer-caution" lang={res.lang}>
          <Icon name="info" size={16} />
          <span>{res.cautionNote}</span>
        </p>
      )}

      {res.fallback && <p className="answer-meta">{t.plainFacts}</p>}

      {res.items.length > 0 && (
        <ul className="answer-items">
          {res.items.map((it) => (
            <li key={it.id}>
              <div className="answer-item-head">
                <span className="answer-type">{t.types[it.type]}</span>
                {it.verdict && <span className={`verdict v-${it.verdict}`}>{verdictLabel[uiLang][it.verdict]}</span>}
              </div>
              <p className="answer-item-title" lang="en">{it.title}</p>
              {it.sources.filter((s, i, all) => all.findIndex((x) => x.host === s.host) === i).slice(0, 2).map((s) => (
                <a key={s.url} className="answer-source" href={s.url} target="_blank" rel="noreferrer">
                  <span>{t.source}: {s.host}</span>
                  <span className="tnum">· {t.checked} {shortDate(s.checked)}</span>
                  <Icon name="external" size={13} />
                </a>
              ))}
            </li>
          ))}
        </ul>
      )}

      <div className="answer-foot">
        <button type="button" className={`btn btn-ghost answer-play${playing ? ' on' : ''}`} onClick={onPlay} aria-pressed={playing}>
          <span className="answer-play-ico" aria-hidden="true">
            <Icon name={playing ? 'stop' : 'volume'} size={16} />
          </span>
          {loadingAudio ? '…' : playing ? t.stop : t.hear}
        </button>
        <p className="answer-ai">{t.aiNote}</p>
      </div>
    </article>
  );
}
