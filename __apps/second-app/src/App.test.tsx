import { expect, it, describe } from "vitest";
import { render } from "@testing-library/react";
import App from "./App";

describe("First", () => {
	it("Should render application text", () => {
		const comp = render(<App />);

		const text = "THE SECOND APPLICATION";

		expect(comp.getByText(text)).toBeInTheDocument();
	});
});
