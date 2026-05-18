type SampleButtonProps = {
  onClick: () => void;
};

export default function SampleButton({ onClick, ...rest }: SampleButtonProps) {
  return (
    <button
      {...rest}
      onClick={onClick}
      className="text-xs text-accent hover:text-accent-hover"
    >
      Sample
    </button>
  );
}
