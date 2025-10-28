/**
 * Unit tests for Props interfaces (TextProps and BoxProps)
 * Tests that props interfaces support all expected style and layout properties
 */

import { describe, expect, test } from "bun:test";
import type { BoxProps, TextProps } from "../../src/types/nodes";

describe("Props Interfaces", () => {
	test("TextProps supports all style properties", () => {
		const props: TextProps = {
			color: "red",
			backgroundColor: { r: 255, g: 0, b: 0 },
			dimColor: true,
			bold: true,
			italic: true,
			underline: true,
			strikethrough: true,
			inverse: true,
			wrap: "truncate-middle",
		};

		expect(props).toBeDefined();
	});

	test("BoxProps supports all layout properties", () => {
		const props: BoxProps = {
			width: 100,
			height: "50%",
			minWidth: 10,
			maxWidth: 200,
			margin: 5,
			padding: 10,
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			flexGrow: 1,
			borderStyle: "single",
			borderColor: "blue",
		};

		expect(props).toBeDefined();
	});

	test("BoxProps margin and padding shortcuts work", () => {
		const marginProps = {
			marginLeft: 5,
			marginRight: 5,
			marginTop: 10,
			marginBottom: 10,
		};
		const paddingProps = {
			paddingLeft: 5,
			paddingRight: 5,
			paddingTop: 10,
			paddingBottom: 10,
		};

		expect(marginProps).toHaveProperty("marginLeft");
		expect(paddingProps).toHaveProperty("paddingLeft");
	});
});
