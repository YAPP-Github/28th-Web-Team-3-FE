import { Input } from "@repo/ui";

interface ReviewFieldProps {
  id: string;
  label: string;
  value: string;
}

export function ReviewField({ id, label, value }: ReviewFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-body-b2-500 text-gray-700" htmlFor={id}>
        {label}
      </label>
      <Input
        autoComplete="off"
        className="h-12 border-0 bg-gray-50 px-3.5 text-body-b2-500 text-gray-700"
        id={id}
        name={id}
        readOnly
        value={value}
      />
    </div>
  );
}
