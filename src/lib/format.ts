import { ICONS } from './icons';

enum Token {
	Character,
	Bold,
	Italic,
	Narrow,
	Wide,
	Shadow,
	Color,
	Invalid,
	Uppercase,
	Dollar,
	ColorReset,
	WidthReset,
	FullReset
}

type TokenData = {
	type: Token;
	value: string;
	skip: number;
};
// color in TokenData is hex without #

export type TMStyle = {
	color: string;
	bold: boolean;
	italic: boolean;
	shadow: boolean;
	uppercase: boolean;
	width: 'narrow' | 'wide' | 'normal';
};

// color in TMstyle is #hex
const DEFAULT_STYLE: TMStyle = {
	color: '#fff',
	bold: false,
	italic: false,
	shadow: false,
	uppercase: false,
	width: 'normal'
};

export type TMData = {
	style: TMStyle;
	text: string;
};

const MODIFIER_SYMBOL = '$';
const BASIC_MODIFIERS = ['i', 'o', 's', 'w', 'n', 'g', 'm', 'z', 't'];
const HEXADECIMAL = '0123456789ABCDEF';
const DEFAULT_COLOR = '#fff';
const GRAPHEME_SEGMENTER =
	typeof Intl.Segmenter == 'undefined'
		? null
		: new Intl.Segmenter(undefined, { granularity: 'grapheme' });

function first_grapheme(input: string): string {
	if (GRAPHEME_SEGMENTER) {
		return GRAPHEME_SEGMENTER.segment(input)[Symbol.iterator]().next().value?.segment ?? '';
	}

	return Array.from(input)[0] ?? '';
}

function is_same_style(a: TMStyle, b: TMStyle): boolean {
	return (
		a.color == b.color &&
		a.bold == b.bold &&
		a.italic == b.italic &&
		a.shadow == b.shadow &&
		a.width == b.width &&
		a.uppercase == b.uppercase
	);
}

export function hex_to_rgb(hex: string) {
	if (hex[0] == '#') {
		hex = hex.slice(1);
	}
	const bigint = parseInt(hex, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return [r, g, b];
}

export function is_icon(input: string): boolean {
	return ICONS.includes(input);
}

function rgb_to_hex(r: number, g: number, b: number) {
	return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

export function rgb_to_hex_3(r: number, g: number, b: number) {
	return '#' + [r, g, b].map((x) => Math.round(x / 17).toString(16)).join('');
}

export function hex_6_to_3(hex: string): string {
	const rgb = hex_to_rgb(hex);
	return rgb_to_hex_3(rgb[0], rgb[1], rgb[2]);
}

export function closest_color(hex: string): string {
	const rgb = hex_to_rgb(hex);
	for (let i = 0; i < 3; i++) {
		rgb[i] = Math.round(rgb[i] / 17) * 17;
	}
	return rgb_to_hex(rgb[0], rgb[1], rgb[2]);
}

function modifier_to_token(modifier: string): Token {
	switch (modifier) {
		case 'i':
			return Token.Italic;
		case 'o':
			return Token.Bold;
		case 's':
			return Token.Shadow;
		case 'w':
			return Token.Wide;
		case 'n':
			return Token.Narrow;
		case 'g':
			return Token.ColorReset;
		case 'm':
			return Token.WidthReset;
		case 'z':
			return Token.FullReset;
		case 't':
			return Token.Uppercase;
		default:
			return Token.Invalid;
	}
}

function is_color_token(input: string): { is_color: boolean; color_value: string; skip: number } {
	// is a color: $ followed by 1-3 hexadecimal characters
	// e.g $f = #f00, $ff = #ff0, $fff = #fff
	if (input[0] != MODIFIER_SYMBOL || input.length < 2) {
		return { is_color: false, color_value: '', skip: 0 };
	}
	const modifierless_input = input.slice(1);
	let color_length = 0;

	for (let i = 0; i < 3; i++) {
		if (
			modifierless_input.length < i + 1 ||
			!HEXADECIMAL.includes(modifierless_input[i].toUpperCase())
		) {
			break;
		}
		color_length++;
	}
	if (color_length == 0) {
		return { is_color: false, color_value: '', skip: 0 };
	}

	let final_color = '';
	for (let i = 0; i < color_length; i++) {
		final_color += modifierless_input[i];
	}
	final_color = final_color.padEnd(3, '0');
	return { is_color: true, color_value: final_color, skip: color_length };
}

function tokenize_next(input: string): TokenData {
	if (input[0] != MODIFIER_SYMBOL) {
		const grapheme = first_grapheme(input);
		return { type: Token.Character, value: grapheme, skip: grapheme.length - 1 };
	} else {
		if (input.length == 1) {
			return { type: Token.Invalid, value: input[0], skip: 0 };
		}
		if (input[1] == MODIFIER_SYMBOL) {
			return { type: Token.Dollar, value: MODIFIER_SYMBOL, skip: 1 };
		}
	}
	const { is_color, color_value, skip } = is_color_token(input);
	if (is_color) {
		return { type: Token.Color, value: color_value, skip: skip };
	}

	if (BASIC_MODIFIERS.includes(input[1])) {
		return { type: modifier_to_token(input[1]), value: '', skip: 1 };
	}

	const invalid_value = first_grapheme(input.slice(1));
	return { type: Token.Invalid, value: invalid_value, skip: invalid_value.length };
}

function tokenize(input: string): TokenData[] {
	const output: TokenData[] = [];
	for (let i = 0; i < input.length; i++) {
		const token = tokenize_next(input.slice(i));
		output.push(token);
		i += token.skip;
	}
	return output;
}

function gradient(start_color: number[], end_color: number[], ratio: number): number[] {
	const differences = end_color.map((c, i) => c - start_color[i]);
	return start_color.map((c, i) => c + differences[i] * ratio);
}

export function text_gradient(input: string, colors: string[], spaces_count = false): TMData[] {
	const base: TMData[] = text_to_tm(input, false);

	let input_tm: TMData[] = base;

	if (!spaces_count) {
		input_tm = input_tm.filter((element) => !is_whitespace(element.text));
	}

	if (input_tm.length == 0 || colors.length == 0) {
		return compress_tmdata(base);
	}

	for (let i = 0; i < input_tm.length; i++) {
		const position = input_tm.length == 1 ? 0 : i / (input_tm.length - 1);
		const scaled_position = position * (colors.length - 1);
		const start_index = Math.floor(scaled_position);
		const end_index = Math.min(start_index + 1, colors.length - 1);
		const ratio = scaled_position - start_index;
		const start_color = colors[start_index];
		const end_color = colors[end_index];
		const rgb = gradient(hex_to_rgb(start_color), hex_to_rgb(end_color), ratio);
		const hex = rgb_to_hex_3(rgb[0], rgb[1], rgb[2]).slice(1);
		input_tm[i].style.color = '#' + hex;
	}

	if (!spaces_count) {
		let last_color = DEFAULT_COLOR;
		for (let i = 0; i < base.length; i++) {
			if (is_whitespace(base[i].text)) {
				base[i].style.color = last_color;
			} else {
				last_color = base[i].style.color;
			}
		}
	}

	return compress_tmdata(base);
}

function is_whitespace(input: string): boolean {
	return input != '' && input.trim() == '';
}

export function tmdata_to_text(input: TMData[]): string {
	// try to always pass compressed tmdata or the resulting
	// string will be enormous
	const output_tokens: TokenData[] = [];
	let current_text_details = { ...DEFAULT_STYLE };
	for (const item of input) {
		if (item.text.length == 0) {
			continue;
		}

		output_tokens.push(...style_transition_tokens(current_text_details, item.style, item.text));
		current_text_details = { ...item.style };

		// add text
		for (const character of item.text) {
			if (character == MODIFIER_SYMBOL) {
				output_tokens.push({
					type: Token.Dollar,
					value: MODIFIER_SYMBOL,
					skip: 0
				});
			} else {
				output_tokens.push({
					type: Token.Character,
					value: character,
					skip: 0
				});
			}
		}
	}
	const output = tokens_to_text(output_tokens);
	return output;
}

function tokens_to_text(tokens: TokenData[]): string {
	let output = '';
	for (const token of tokens) {
		switch (token.type) {
			case Token.Character:
				output += token.value;
				break;
			case Token.Dollar:
				output += '$$';
				break;
			case Token.Color:
				output += '$' + token.value;
				break;
			case Token.Bold:
				output += '$o';
				break;
			case Token.Italic:
				output += '$i';
				break;
			case Token.ColorReset:
				output += '$g';
				break;
			case Token.FullReset:
				output += '$z';
				break;
			case Token.Narrow:
				output += '$n';
				break;
			case Token.Shadow:
				output += '$s';
				break;
			case Token.Uppercase:
				output += '$t';
				break;
			case Token.Wide:
				output += '$w';
				break;
			case Token.WidthReset:
				output += '$m';
				break;
			case Token.Invalid:
				break;
		}
	}
	return output;
}

function create_token(type: Token, value = ''): TokenData {
	return { type, value, skip: 0 };
}

function shortest_color_value(
	color: string,
	has_following_token: boolean,
	following_text: string
): string {
	const full_value = color.slice(1, 4);
	const next_character = following_text[0] ?? '';
	if (!has_following_token && HEXADECIMAL.includes(next_character.toUpperCase())) {
		return full_value;
	}

	return full_value.replace(/0+$/, '') || '0';
}

function style_difference_tokens(from: TMStyle, to: TMStyle, following_text: string): TokenData[] {
	const tokens: TokenData[] = [];

	if (to.width != from.width) {
		switch (to.width) {
			case 'narrow':
				tokens.push(create_token(Token.Narrow));
				break;
			case 'wide':
				tokens.push(create_token(Token.Wide));
				break;
			case 'normal':
				tokens.push(create_token(Token.WidthReset));
				break;
		}
	}

	if (to.uppercase != from.uppercase) {
		tokens.push(create_token(Token.Uppercase));
	}
	if (to.bold != from.bold) {
		tokens.push(create_token(Token.Bold));
	}
	if (to.italic != from.italic) {
		tokens.push(create_token(Token.Italic));
	}
	if (to.shadow != from.shadow) {
		tokens.push(create_token(Token.Shadow));
	}
	if (to.color != from.color) {
		tokens.unshift(
			to.color == DEFAULT_COLOR
				? create_token(Token.ColorReset)
				: create_token(
						Token.Color,
						shortest_color_value(to.color, tokens.length > 0, following_text)
					)
		);
	}

	return tokens;
}

function style_transition_tokens(from: TMStyle, to: TMStyle, following_text: string): TokenData[] {
	const direct = style_difference_tokens(from, to, following_text);
	if (is_same_style(from, DEFAULT_STYLE)) {
		return direct;
	}

	const through_reset = [
		create_token(Token.FullReset),
		...style_difference_tokens(DEFAULT_STYLE, to, following_text)
	];

	return tokens_to_text(direct).length <= tokens_to_text(through_reset).length
		? direct
		: through_reset;
}

export function compress_tmdata(input: readonly TMData[]): TMData[] {
	const output: TMData[] = [];

	for (const item of input) {
		if (item.text.length == 0) {
			continue;
		}

		const previous = output.at(-1);
		// Keep icons isolated so the viewer can use a separate font-family.
		if (
			previous &&
			is_same_style(previous.style, item.style) &&
			!is_icon(previous.text) &&
			!is_icon(item.text)
		) {
			previous.text += item.text;
		} else {
			output.push({ style: { ...item.style }, text: item.text });
		}
	}

	return output;
}

function tokens_to_tm(tokens: TokenData[], compress = true): TMData[] {
	const output: TMData[] = [];
	let current_text_details = { ...DEFAULT_STYLE };

	for (const token of tokens) {
		if (token.type == Token.Character || token.type == Token.Dollar) {
			output.push({ style: { ...current_text_details }, text: token.value });

			continue;
		}

		switch (token.type) {
			case Token.Bold:
				current_text_details.bold = !current_text_details.bold;
				break;
			case Token.Italic:
				current_text_details.italic = !current_text_details.italic;
				break;
			case Token.Uppercase:
				current_text_details.uppercase = !current_text_details.uppercase;
				break;
			case Token.Shadow:
				current_text_details.shadow = !current_text_details.shadow;
				break;
			case Token.Wide:
				current_text_details.width = 'wide';
				break;
			case Token.Narrow:
				current_text_details.width = 'narrow';
				break;
			case Token.Color:
				current_text_details.color = '#' + token.value;
				break;
			case Token.ColorReset:
				current_text_details.color = DEFAULT_STYLE.color;
				break;
			case Token.WidthReset:
				current_text_details.width = DEFAULT_STYLE.width;
				break;
			case Token.FullReset:
				current_text_details = { ...DEFAULT_STYLE };
				break;
		}
	}
	if (compress) {
		return compress_tmdata(output);
	}
	return output;
}
export function text_to_tm(input: string, compress = true): TMData[] {
	const tokens = tokenize(input);
	return tokens_to_tm(tokens, compress);
}
