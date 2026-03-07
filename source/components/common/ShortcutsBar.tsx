// Shortcuts bar component
import {useState} from 'react';
import {Box, Text} from 'ink';
import {usePlayer} from '../../hooks/usePlayer.ts';
import {useTheme} from '../../hooks/useTheme.ts';
import {useKeyBinding} from '../../hooks/useKeyboard.ts';
import {KEYBINDINGS} from '../../utils/constants.ts';
import {ICONS} from '../../utils/icons.ts';

const FLASH_DURATION_MS = 300;

export default function ShortcutsBar() {
	const {theme} = useTheme();
	const {
		state: playerState,
		pause,
		resume,
		next,
		previous,
		volumeUp,
		volumeDown,
		volumeFineUp,
		volumeFineDown,
		toggleShuffle,
		toggleRepeat,
		toggleAutoplay,
	} = usePlayer();

	const [flashState, setFlashState] = useState<Record<string, boolean>>({});

	const flash = (key: string) => {
		setFlashState(prev => ({...prev, [key]: true}));
		setTimeout(() => {
			setFlashState(prev => ({...prev, [key]: false}));
		}, FLASH_DURATION_MS);
	};

	const shortcutColor = (key: string) =>
		flashState[key] ? theme.colors.success : theme.colors.text;

	// Register key bindings globally
	const handlePlayPause = () => {
		flash('playPause');
		if (playerState.isPlaying) {
			pause();
		} else {
			resume();
		}
	};

	useKeyBinding(KEYBINDINGS.PLAY_PAUSE, handlePlayPause);
	useKeyBinding(KEYBINDINGS.NEXT, () => {
		flash('next');
		next();
	});
	useKeyBinding(KEYBINDINGS.PREVIOUS, () => {
		flash('prev');
		previous();
	});
	useKeyBinding(KEYBINDINGS.VOLUME_UP, () => {
		flash('volume');
		volumeUp();
	});
	useKeyBinding(KEYBINDINGS.VOLUME_DOWN, () => {
		flash('volume');
		volumeDown();
	});
	useKeyBinding(KEYBINDINGS.VOLUME_FINE_UP, () => {
		flash('volume');
		volumeFineUp();
	});
	useKeyBinding(KEYBINDINGS.VOLUME_FINE_DOWN, () => {
		flash('volume');
		volumeFineDown();
	});
	useKeyBinding(KEYBINDINGS.SHUFFLE, () => {
		flash('shuffle');
		toggleShuffle();
	});
	useKeyBinding(KEYBINDINGS.REPEAT, () => {
		flash('repeat');
		toggleRepeat();
	});
	useKeyBinding(KEYBINDINGS.AUTOPLAY_TOGGLE, () => {
		flash('autoplay');
		toggleAutoplay();
	});
	// Note: SETTINGS keybinding handled by MainLayout to avoid double-dispatch

	const shuffleColor = flashState['shuffle']
		? theme.colors.success
		: playerState.shuffle
			? theme.colors.primary
			: theme.colors.dim;

	const repeatColor = flashState['repeat']
		? theme.colors.success
		: playerState.repeat !== 'off'
			? theme.colors.secondary
			: theme.colors.dim;

	const volumeColor = flashState['volume']
		? theme.colors.success
		: theme.colors.primary;

	const autoplayColor = flashState['autoplay']
		? theme.colors.success
		: playerState.autoplay
			? theme.colors.primary
			: theme.colors.dim;

	return (
		<Box
			borderStyle="single"
			borderColor={theme.colors.dim}
			paddingX={1}
			justifyContent="space-between"
		>
			{/* Left: Navigation shortcuts */}
			<Text color={theme.colors.dim}>
				<Text color={shortcutColor('playPause')}>
					{playerState.isPlaying ? ICONS.PAUSE : ICONS.PLAY_PAUSE_ON} [Space]
				</Text>{' '}
				| <Text color={shortcutColor('prev')}>{ICONS.PREV} [B/←]</Text> |{' '}
				<Text color={shortcutColor('next')}>{ICONS.NEXT} [N/→]</Text> |{' '}
				<Text color={shuffleColor}>{ICONS.SHUFFLE} [Shift+S]</Text> |{' '}
				<Text color={repeatColor}>
					{playerState.repeat === 'one' ? ICONS.REPEAT_ONE : ICONS.REPEAT_ALL}{' '}
					[R]
				</Text>{' '}
				| <Text color={autoplayColor}>{ICONS.AUTOPLAY} [Shift+A]</Text> |{' '}
				<Text color={theme.colors.text}>{ICONS.PLAYLIST} [Shift+P]</Text> |{' '}
				<Text color={theme.colors.text}>{ICONS.DOWNLOAD} [Shift+D]</Text> |{' '}
				<Text color={theme.colors.text}>{ICONS.SEARCH} [/]</Text> |{' '}
				<Text color={theme.colors.text}>{ICONS.HELP} [?]</Text> |{' '}
				<Text color={theme.colors.text}>{ICONS.BG_PLAY} [Shift+Q]</Text> |{' '}
				<Text color={theme.colors.text}>{ICONS.RESUME} [Shift+R]</Text> |{' '}
				<Text color={theme.colors.text}>{ICONS.QUIT} [Q]</Text>
			</Text>

			{/* Right: Playback mode + volume indicator */}
			<Text color={theme.colors.text}>
				<Text color={shuffleColor}>{ICONS.SHUFFLE}</Text>{' '}
				<Text color={repeatColor}>
					{playerState.repeat === 'one' ? ICONS.REPEAT_ONE : ICONS.REPEAT_ALL}
				</Text>{' '}
				<Text color={autoplayColor}>{ICONS.AUTOPLAY}</Text>{' '}
				<Text color={theme.colors.dim}>{ICONS.VOLUME} [+/-]</Text>{' '}
				<Text color={volumeColor}>{playerState.volume}%</Text>
			</Text>
		</Box>
	);
}
