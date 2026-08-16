import styles from "./typing-indicator.module.css";

export function TypingIndicator() {
  return (
    <div
      aria-label="다음 질문을 준비하고 있어요"
      className="flex w-fit items-center gap-1 rounded-[20px] bg-gray-50 p-4"
      role="status"
    >
      {[0, 1, 2].map((index) => (
        <span
          aria-hidden="true"
          className={`${styles.dot} size-2 rounded-full bg-gray-400`}
          key={index}
          style={{ animationDelay: `${index * 120}ms` }}
        />
      ))}
    </div>
  );
}
