export default function LoadingSpinner({ fullPage }: { fullPage?: boolean }) {
  const spinner = (
    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  );
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        {spinner}
      </div>
    );
  }
  return spinner;
}
