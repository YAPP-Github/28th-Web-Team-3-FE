import { Button, Dialog } from "@repo/ui";

interface MissionDeleteDialogProps {
  open: boolean;
  pending?: boolean;
  /** 삭제에 실패했을 때 보여줄 문구. 다이얼로그는 열린 채로 남아 재시도할 수 있다. */
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function MissionDeleteDialog({
  open,
  pending = false,
  error,
  onCancel,
  onConfirm,
}: MissionDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      title="미션을 삭제할까요?"
      // 요청 중에는 삭제 여부가 확정되기 전까지 다이얼로그를 닫지 않는다.
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
          pending={pending}
          onClick={onConfirm}
        >
          삭제
        </Button>
      </div>
    </Dialog>
  );
}
