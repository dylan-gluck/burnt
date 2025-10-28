/**
 * Tests for Component Props Schemas
 *
 * Tests validation of TextProps, BoxProps, and related component prop schemas.
 */

import { describe, expect, test } from "bun:test";
import {
	decodeAlignItems,
	decodeAlignSelf,
	decodeBorderStyle,
	decodeBoxProps,
	decodeColor,
	decodeFlexDirection,
	decodeHSLColor,
	decodeJustifyContent,
	decodeRGBColor,
	decodeStaticProps,
	decodeTextProps,
	decodeTransformProps,
	decodeWrapMode,
} from "../../schemas/props.js";

// ============================================================================
// Color Schemas Tests
// ============================================================================

describe("RGBColorSchema", () => {
	test("accepts valid RGB color", () => {
		const validRGB = { r: 255, g: 128, b: 0 };
		expect(() => decodeRGBColor(validRGB)).not.toThrow();
	});

	test("accepts edge values (0 and 255)", () => {
		const black = { r: 0, g: 0, b: 0 };
		const white = { r: 255, g: 255, b: 255 };
		expect(() => decodeRGBColor(black)).not.toThrow();
		expect(() => decodeRGBColor(white)).not.toThrow();
	});

	test("rejects negative values", () => {
		const invalidRGB = { r: -1, g: 128, b: 0 };
		expect(() => decodeRGBColor(invalidRGB)).toThrow();
	});

	test("rejects values above 255", () => {
		const invalidRGB = { r: 256, g: 128, b: 0 };
		expect(() => decodeRGBColor(invalidRGB)).toThrow();
	});

	test("rejects non-integer values", () => {
		const invalidRGB = { r: 255.5, g: 128, b: 0 };
		expect(() => decodeRGBColor(invalidRGB)).toThrow();
	});
});

describe("HSLColorSchema", () => {
	test("accepts valid HSL color", () => {
		const validHSL = { h: 180, s: 50, l: 50 };
		expect(() => decodeHSLColor(validHSL)).not.toThrow();
	});

	test("accepts edge values", () => {
		const edgeHSL = { h: 0, s: 0, l: 0 };
		const maxHSL = { h: 360, s: 100, l: 100 };
		expect(() => decodeHSLColor(edgeHSL)).not.toThrow();
		expect(() => decodeHSLColor(maxHSL)).not.toThrow();
	});

	test("rejects hue above 360", () => {
		const invalidHSL = { h: 361, s: 50, l: 50 };
		expect(() => decodeHSLColor(invalidHSL)).toThrow();
	});

	test("rejects saturation above 100", () => {
		const invalidHSL = { h: 180, s: 101, l: 50 };
		expect(() => decodeHSLColor(invalidHSL)).toThrow();
	});
});

describe("ColorSchema", () => {
	test("accepts string colors", () => {
		expect(() => decodeColor("red")).not.toThrow();
		expect(() => decodeColor("#FF0000")).not.toThrow();
	});

	test("accepts RGB objects", () => {
		expect(() => decodeColor({ r: 255, g: 0, b: 0 })).not.toThrow();
	});

	test("accepts HSL objects", () => {
		expect(() => decodeColor({ h: 0, s: 100, l: 50 })).not.toThrow();
	});

	test("rejects invalid types", () => {
		expect(() => decodeColor(123)).toThrow();
		expect(() => decodeColor(null)).toThrow();
	});
});

// ============================================================================
// TextProps Schema Tests
// ============================================================================

describe("WrapModeSchema", () => {
	test("accepts all valid wrap modes", () => {
		const validModes = [
			"wrap",
			"truncate",
			"truncate-start",
			"truncate-middle",
			"truncate-end",
		];
		for (const mode of validModes) {
			expect(() => decodeWrapMode(mode)).not.toThrow();
		}
	});

	test("rejects invalid wrap mode", () => {
		expect(() => decodeWrapMode("invalid")).toThrow();
	});
});

describe("TextPropsSchema", () => {
	test("accepts empty props object", () => {
		const props = {};
		expect(() => decodeTextProps(props)).not.toThrow();
	});

	test("accepts valid text props with colors", () => {
		const props = {
			color: "red",
			backgroundColor: { r: 0, g: 0, b: 0 },
			bold: true,
			italic: false,
			wrap: "truncate",
		};
		expect(() => decodeTextProps(props)).not.toThrow();
	});

	test("accepts all styling options", () => {
		const props = {
			bold: true,
			italic: true,
			underline: true,
			strikethrough: true,
			dimColor: true,
			inverse: true,
		};
		expect(() => decodeTextProps(props)).not.toThrow();
	});

	test("rejects invalid color", () => {
		const props = { color: 123 };
		expect(() => decodeTextProps(props)).toThrow();
	});

	test("rejects invalid wrap mode", () => {
		const props = { wrap: "invalid" };
		expect(() => decodeTextProps(props)).toThrow();
	});

	test("rejects non-boolean bold", () => {
		const props = { bold: "yes" };
		expect(() => decodeTextProps(props)).toThrow();
	});
});

// ============================================================================
// BoxProps Schema Tests
// ============================================================================

describe("FlexDirectionSchema", () => {
	test("accepts all valid flex directions", () => {
		const validDirections = ["row", "column", "row-reverse", "column-reverse"];
		for (const direction of validDirections) {
			expect(() => decodeFlexDirection(direction)).not.toThrow();
		}
	});

	test("rejects invalid direction", () => {
		expect(() => decodeFlexDirection("invalid")).toThrow();
	});
});

describe("JustifyContentSchema", () => {
	test("accepts all valid justify-content values", () => {
		const validValues = [
			"flex-start",
			"flex-end",
			"center",
			"space-between",
			"space-around",
		];
		for (const value of validValues) {
			expect(() => decodeJustifyContent(value)).not.toThrow();
		}
	});
});

describe("AlignItemsSchema", () => {
	test("accepts all valid align-items values", () => {
		const validValues = ["flex-start", "flex-end", "center", "stretch"];
		for (const value of validValues) {
			expect(() => decodeAlignItems(value)).not.toThrow();
		}
	});
});

describe("AlignSelfSchema", () => {
	test("accepts all valid align-self values", () => {
		const validValues = ["auto", "flex-start", "flex-end", "center", "stretch"];
		for (const value of validValues) {
			expect(() => decodeAlignSelf(value)).not.toThrow();
		}
	});
});

describe("BorderStyleSchema", () => {
	test("accepts all valid border styles", () => {
		const validStyles = [
			"single",
			"double",
			"round",
			"bold",
			"singleDouble",
			"doubleSingle",
			"classic",
		];
		for (const style of validStyles) {
			expect(() => decodeBorderStyle(style)).not.toThrow();
		}
	});
});

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

// ============================================================================
// StaticProps Schema Tests
// ============================================================================

describe("StaticPropsSchema", () => {
	test("accepts valid static props", () => {
		const props = {
			items: [1, 2, 3],
			children: (_item: unknown, index: number) => `Item ${index}`,
		};
		expect(() => decodeStaticProps(props)).not.toThrow();
	});

	test("accepts empty items array", () => {
		const props = {
			items: [],
			children: () => null,
		};
		expect(() => decodeStaticProps(props)).not.toThrow();
	});

	test("rejects missing items", () => {
		const props = {
			children: () => null,
		};
		expect(() => decodeStaticProps(props)).toThrow();
	});

	test("accepts missing children (Schema.Unknown accepts undefined)", () => {
		const props = {
			items: [1, 2, 3],
		};
		expect(() => decodeStaticProps(props)).not.toThrow();
	});
});

// ============================================================================
// TransformProps Schema Tests
// ============================================================================

describe("TransformPropsSchema", () => {
	test("accepts valid transform props", () => {
		const props = {
			transform: (text: string) => text.toUpperCase(),
			children: "Hello",
		};
		expect(() => decodeTransformProps(props)).not.toThrow();
	});

	test("accepts missing transform (Schema.Unknown accepts undefined)", () => {
		const props = {
			children: "Hello",
		};
		expect(() => decodeTransformProps(props)).not.toThrow();
	});

	test("accepts missing children (Schema.Unknown accepts undefined)", () => {
		const props = {
			transform: (text: string) => text,
		};
		expect(() => decodeTransformProps(props)).not.toThrow();
	});
});
