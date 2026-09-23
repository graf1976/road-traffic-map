"use client";

interface LocateButtonProps {
  onLocate: () => void;
  isLocating: boolean;
  /** 現在地を取得済みかどうか。取得済みは色を変えて分かるようにする。 */
  hasPosition: boolean;
}

/**
 * 地図の上に重ねて表示する現在地ボタン。
 * ヘッダーのボタンはスマートフォンだと埋もれやすいため、地図上にも置く。
 */
export function LocateButton({
  onLocate,
  isLocating,
  hasPosition,
}: LocateButtonProps) {
  return (
    <button
      type="button"
      onClick={onLocate}
      disabled={isLocating}
      aria-label="現在地を表示"
      title="現在地を表示"
      className={`absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70 ${
        hasPosition ? "text-blue-600" : "text-slate-700"
      }`}
    >
      {isLocating ? (
        <svg
          className="h-5 w-5 animate-spin text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2.5"
            className="opacity-25"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        /* 十字＋中心の丸（地図アプリでおなじみの現在地アイコン） */
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <circle
            cx="12"
            cy="12"
            r="7.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 1.5v3M12 19.5v3M22.5 12h-3M4.5 12h-3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
