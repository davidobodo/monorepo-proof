export default function Button({ text, onClick }: { text: string; onClick: () => void }) {
	return (
		<button onClick={onClick} style={{ color: "red", backgroundColor: "white" }} disabled={false}>
			{text}
		</button>
	);
}
