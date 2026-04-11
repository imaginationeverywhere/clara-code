import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const LOGO_BLUE = '#3B82F6';

type ClaraLogoProps = {
  size?: number;
};

/** Clara Code mark: blue circle with “C” (matches companion branding). */
export function ClaraLogo({ size = 120 }: ClaraLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="Clara Code logo">
      <Circle cx={50} cy={50} r={48} fill={LOGO_BLUE} />
      <SvgText
        x={50}
        y={58}
        fontSize={52}
        fontWeight="700"
        fill="#FFFFFF"
        textAnchor="middle"
        fontFamily="System"
      >
        C
      </SvgText>
    </Svg>
  );
}
