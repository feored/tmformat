export type FormattingDescriptionPart = string | { code: string };

export type FormattingInfo = {
	code: string;
	name: string;
	description: FormattingDescriptionPart[][];
	example?: string;
};

export const formatting_data: FormattingInfo[] = [
	{
		code: '$w',
		name: 'Wide',
		description: [
			['All following text will be wide.'],
			['Reset by using Reset Width or Reset All Styles.']
		],
		example: '$w Example'
	},
	{
		code: '$n',
		name: 'Narrow',
		description: [
			['All following text will be narrow.'],
			['Reset by using Reset Width or Reset All Styles.']
		],
		example: '$n Example'
	},
	{
		code: '$m',
		name: 'Reset Width',
		description: [['Resets following text to default width.']],
		example: '$w Example1 $m Example2'
	},
	{
		code: '$i',
		name: 'Italic',
		description: [
			['All following text will be italic.'],
			['Reset by using another Italic tag, or Reset All Styles.']
		],
		example: '$i Example1 $i Example2'
	},
	{
		code: '$t',
		name: 'Uppercase',
		description: [
			['All following text will be in uppercase letters.'],
			['Reset by using another Uppercase tag, or Reset All Styles.']
		],
		example: '$t Example1 $t Example2'
	},
	{
		code: '$o',
		name: 'Bold',
		description: [
			['All following text will be bolded.'],
			['Reset by using another Bold tag, or Reset All Styles.']
		],
		example: '$o Example1 $o Example2'
	},
	{
		code: '$s',
		name: 'Shadow',
		description: [
			['All following text will have a shadow.'],
			['Reset by using another Shadow tag or Reset All Styles.']
		],
		example: '$s Example1 $s Example2'
	},
	{
		code: '$hex',
		name: 'Color',
		description: [
			['All following text will have the specified color.'],
			[
				'Colors use 3-digit hexadecimal code (0123456789ABCDEF), e.g. ',
				{ code: '$fff' },
				' for white.'
			],
			['Reset by using Reset Color or Reset All Styles.'],
			[
				'Note: The game will also recognize 1 and 2 digit hex codes, i.e. ',
				{ code: '$f' },
				' for red or ',
				{ code: '$0f' },
				' for green.'
			]
		],
		example: '$0d0 Example1 $9 Example2'
	},
	{
		code: '$g',
		name: 'Reset Color',
		description: [['Resets following text to default color.']],
		example: '$0d0 Example1 $g Example2'
	},
	{
		code: '$z',
		name: 'Reset All Styles',
		description: [['Resets everything to default.']],
		example: '$o$w$i$ff0 Example1 $z Example2'
	},
	{
		code: '$$',
		name: 'Insert $ symbol',
		description: [
			['Allows you to type a ', { code: '$' }, ' without it being interpreted as a formatting tag.']
		],
		example: '$$'
	}
];

export const formatting_unsupported: FormattingInfo[] = [
	{
		code: '$l[URL]text',
		name: 'External Link',
		description: [
			['Link to an external site.'],
			[
				'The [URL] part is optional, so e.g. ',
				{ code: '$lhttps://example.com' },
				' will also work.'
			]
		]
	},
	{
		code: '$h',
		name: 'Internal Link',
		description: [['Link to a manialink address.']]
	},
	{
		code: '$p',
		name: 'Playerscript Link',
		description: [['Link to a player script returning a manialink.']]
	}
];
