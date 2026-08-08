// mixpanel-browser는 window에 붙는다 — 서버 번들에 들어가면 빌드 타임에 깨뜨린다.
// "use client"는 경계 선언일 뿐 서버 사용을 막지 못하므로 client-only를 쓴다.
import "client-only";

type Mixpanel = typeof import("mixpanel-browser").default;

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const MIXPANEL_REPLAY_SAMPLE_PERCENT = process.env.NEXT_PUBLIC_MIXPANEL_REPLAY_SAMPLE_PERCENT;

/** 로드와 초기화를 한 번만 하기 위한 핸들. 실패한 결과도 담아 둔다. */
let pending: Promise<Mixpanel | null> | null = null;

function replaySamplePercent() {
  const parsed = Number(MIXPANEL_REPLAY_SAMPLE_PERCENT ?? 100);
  if (!Number.isFinite(parsed)) return 100;
  return Math.min(100, Math.max(0, parsed));
}

/**
 * 첫 추적 시점에 mixpanel-browser를 가져온다. 정적으로 import하면 첫 화면에 필요도 없는
 * 수백 KB가 초기 번들에 실려 렌더를 늦춘다.
 *
 * 겹쳐 호출돼도 같은 promise를 돌려주므로 로드와 초기화는 한 번만 일어나고, 로드를
 * 기다리던 호출들은 등록한 순서대로 이어져 이벤트 순서와 개수가 그대로 유지된다.
 */
function loadMixpanel(): Promise<Mixpanel | null> | null {
  if (!MIXPANEL_TOKEN) return null;
  if (pending) return pending;

  pending = import("mixpanel-browser")
    .then(({ default: mixpanel }) => {
      mixpanel.init(MIXPANEL_TOKEN, {
        autocapture: false,
        debug: process.env.NODE_ENV === "development",
        ignore_dnt: false,
        record_mask_all_inputs: true,
        record_mask_all_text: true,
        record_sessions_percent: replaySamplePercent(),
      });
      return mixpanel;
    })
    // 분석이 안 붙는다고 화면이 깨지면 안 된다. 실패도 담아 둬 재시도가 몰리지 않게 한다.
    .catch(() => null);

  return pending;
}

/** 호출부가 기다리지 않고 흘려보내므로(`void`) 이 함수는 reject하지 않는다. */
export async function trackPageView(path: string) {
  const mixpanel = await loadMixpanel();
  if (!mixpanel) return;
  try {
    mixpanel.track("Page Viewed", { path });
  } catch {
    // 분석이 실패해도 화면은 계속 돌아야 한다.
  }
}
