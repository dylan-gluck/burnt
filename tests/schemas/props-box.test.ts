/**
 * Tests for Box Props Schema
 *
 * Tests validation of BoxPropsSchema including dimensions, margins,
 * padding, flexbox, position, and border properties.
 */

import { describe, expect, test } from "bun:test";
import { decodeBoxProps } from "../../src/schemas/props.js";

describe("BoxPropsSchema", () => {
	test("accepts empty props object", () => {
		const props = {};
		expect(() => decodeBoxProps(props)).not.toThrow();
	});

	test("accepts valid dimension props", () => {
		const props = {
			width: 100,
			height: "50%",
			minWidth: 10,
			maxHeight: 200,
		};
		expect(() => decodeBoxProps(props)).not.toThrow();
	});

	test("accepts valid margin props", () => {
		const props = {
			margin: 10,
			marginLeft: 5,
			marginRight: 5,
			marginTop: 2,
			marginBottom: 2,
		};
		expect(() => decodeBoxProps(props)).not.toThrow();
	});

	test("accepts valid padding props", () => {
		const props = {
			padding: 10,
			paddingLeft: 5,
			paddingRight: 5,
			paddingTop: 2,
			paddingBottom: 2,
		};
		expect(() => decodeBoxProps(props)).not.toThrow();
	});

	test("accepts valid flexbox props", () => {
		const props = {
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "stretch",
			flexGrow: 1,
			flexShrink: 0,
			flexBasis: "auto",
		};
		expect(() => decodeBoxProps(props)).not.toThrow();
	});

	test("accepts valid position props", () => {
		const props = {
			position: "absolute",
			top: 10,
			left: 20,
			right: 30,
			bottom: 40,
		};
		expect(() => decodeBoxProps(props)).not.toThrow();
	});

	test("accepts valid border props", () => {
		const props = {
			borderStyle: "double",
			borderColor: "blue",
			borderDimColor: false,
			borderTop: true,
			borderBottom: true,
		};
		expect(() => decodeBoxProps(props)).not.toThrow();
	});

	test("rejects negative margin", () => {
		const props = { margin: -5 };
		expect(() => decodeBoxProps(props)).toThrow();
	});

	test("rejects negative padding", () => {
		const props = { padding: -5 };
		expect(() => decodeBoxProps(props)).toThrow();
	});

	test("rejects negative flexGrow", () => {
		const props = { flexGrow: -1 };
		expect(() => decodeBoxProps(props)).toThrow();
	});

	test("rejects invalid flexDirection", () => {
		const props = { flexDirection: "invalid" };
		expect(() => decodeBoxProps(props)).toThrow();
	});

	test("rejects invalid borderStyle", () => {
		const props = { borderStyle: "invalid" };
		expect(() => decodeBoxProps(props)).toThrow();
	});
});
