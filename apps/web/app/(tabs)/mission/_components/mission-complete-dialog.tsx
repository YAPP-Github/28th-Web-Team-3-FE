import { Button, Dialog } from "@repo/ui";

interface MissionCompleteDialogProps {
  open: boolean;
  pending?: boolean;
  /** 완료 처리에 실패했을 때 보여줄 문구. 다이얼로그는 열린 채로 남아 재시도할 수 있다. */
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function MissionCompleteDialog({
  open,
  pending = false,
  error,
  onCancel,
  onConfirm,
}: MissionCompleteDialogProps) {
  return (
    <Dialog
      open={open}
      title="미션을 완료할까요?"
      // 요청 중에는 Escape나 바깥 클릭으로도 닫지 않는다 — 버튼을 비활성화한 것과 같은
      // 이유로, 완료됐는지 모르는 채 화면이 사라지면 안 된다.
      onOpenChange={(next) => {
        if (next || pending) return;
        onCancel();
      }}
    >
      {error ? (
        <p aria-live="polite" className="text-center text-body-b2-500 text-error">
          {error}
        </p>
      ) : null}
      {/* 다이얼로그 버튼은 퍼널 CTA(14px/500·48px)보다 크다 — 디자인 확인 전까지
          기존 모양(52px·16px/700)을 유지한다. */}
      <div className="grid w-full grid-cols-2 gap-2.5">
        <Button
          className="h-[52px] text-body-b1-700 text-gray-800"
          variant="secondary"
          size="cta"
          disabled={pending}
          onClick={onCancel}
        >
          취소
        </Button>
        <Button
          className="h-[52px] text-body-b1-700"
          size="cta"
          disabled={pending}
          onClick={onConfirm}
        >
          완료
        </Button>
      </div>
    </Dialog>
  );
}
